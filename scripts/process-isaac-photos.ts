/**
 * ISAAC fotky pipeline:
 *  1. Pro každý base model (Meson, Element, Boson, Vitron, Torus) najdi
 *     odpovídající složky v ~/Claude-code/100dola/media/100dola/foto kola/
 *  2. Optimalize JPEGy → WebP (max 2400px long side, q82) přes Python PIL
 *  3. Upload do Supabase Storage bucket `supplier-images/{productId}/...`
 *  4. Update supplier_products.local_image_url + local_image_urls
 *     pro VŠECHNY produkty matchující base model name
 *
 * Run: npx tsx --env-file=.env.local scripts/process-isaac-photos.ts
 */

import { createClient } from "@supabase/supabase-js";
import { promises as fs } from "fs";
import { spawn } from "child_process";
import path from "path";
import os from "os";

const SOURCE_ROOT = path.join(os.homedir(), "Claude-code/100dola/media/100dola/foto kola");
const BUCKET = "supplier-images";

const MODELS: Array<{ base: string; folders: string[]; matchRegex: RegExp }> = [
  { base: "Meson", folders: ["01 Meson Mineral White L", "02 Meson Ruby Red M"], matchRegex: /\bmeson\b/i },
  { base: "Element", folders: ["03 Element Graphite Grey L"], matchRegex: /\belement\b/i },
  { base: "Boson", folders: ["04 Boson Mineral White M", "05 Boson Silver Sonic L"], matchRegex: /\bboson\b/i },
  { base: "Vitron", folders: ["06 Vitron Navy Blue L"], matchRegex: /\bvitron\b/i },
  { base: "Torus", folders: ["07 Torus Xplore Blast Bronze M", "08 Torus Xplore Slade Blue L"], matchRegex: /\btorus\b/i },
];

const PYTHON_OPTIMIZE = `
import sys, os
from PIL import Image, ExifTags
src, dst = sys.argv[1], sys.argv[2]
img = Image.open(src)
# Auto-rotate dle EXIF
try:
  for tag, val in (img._getexif() or {}).items():
    if ExifTags.TAGS.get(tag) == "Orientation":
      if val == 3: img = img.rotate(180, expand=True)
      elif val == 6: img = img.rotate(270, expand=True)
      elif val == 8: img = img.rotate(90, expand=True)
      break
except Exception: pass
if img.mode in ("RGBA", "P"):
  bg = Image.new("RGB", img.size, (255,255,255))
  bg.paste(img.convert("RGBA"), mask=img.convert("RGBA").split()[3] if "A" in img.convert("RGBA").getbands() else None)
  img = bg
else:
  img = img.convert("RGB")
w, h = img.size
if max(w, h) > 2400:
  if w >= h:
    img = img.resize((2400, int(h * 2400 / w)), Image.LANCZOS)
  else:
    img = img.resize((int(w * 2400 / h), 2400), Image.LANCZOS)
img.save(dst, "WEBP", quality=82, method=6)
print(os.path.getsize(dst))
`;

async function optimize(srcPath: string, dstPath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const proc = spawn("python3", ["-c", PYTHON_OPTIMIZE, srcPath, dstPath]);
    let out = "";
    let err = "";
    proc.stdout.on("data", (d) => (out += d));
    proc.stderr.on("data", (d) => (err += d));
    proc.on("close", (code) => {
      if (code === 0) resolve(parseInt(out.trim(), 10));
      else reject(new Error(`PIL failed (${code}): ${err}`));
    });
  });
}

async function main() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Chybí SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }
  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

  // ISAAC brand id
  const { data: brand } = await sb
    .from("supplier_brands")
    .select("id")
    .eq("brand_slug", "isaac")
    .maybeSingle();
  if (!brand) {
    console.error("ISAAC brand nenalezen");
    process.exit(1);
  }
  const isaacBrandId = (brand as { id: string }).id;

  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "isaac-photos-"));
  console.log(`Tmp dir: ${tmpDir}`);

  for (const model of MODELS) {
    console.log(`\n━━ ${model.base} ━━`);

    // Sesbírej zdrojové fotky
    const sources: string[] = [];
    for (const folder of model.folders) {
      const dirPath = path.join(SOURCE_ROOT, folder);
      try {
        const files = await fs.readdir(dirPath);
        for (const f of files) {
          if (/\.(jpe?g|png)$/i.test(f) && !f.startsWith(".")) {
            sources.push(path.join(dirPath, f));
          }
        }
      } catch {
        console.log(`  ⚠ Folder neexistuje: ${folder}`);
      }
    }
    if (sources.length === 0) {
      console.log("  ⚠ Žádné fotky");
      continue;
    }
    console.log(`  Zdrojů: ${sources.length}`);

    // Najdi matching ISAAC produkty
    const { data: products } = await sb
      .from("supplier_products")
      .select("id, name")
      .eq("brand_id", isaacBrandId)
      .ilike("name", `%${model.base}%`);
    const matching = (products ?? []).filter((p) =>
      model.matchRegex.test((p as { name: string }).name),
    );
    if (matching.length === 0) {
      console.log(`  ⚠ Žádné matching produkty`);
      continue;
    }
    console.log(`  Produktů: ${matching.length}`);

    // Optimize všechny zdroje JEDNOU (sdílíme mezi všemi matching produkty)
    const optimizedPaths: { localPath: string; index: number; size: number }[] = [];
    for (let i = 0; i < sources.length; i++) {
      const localOut = path.join(tmpDir, `${model.base.toLowerCase()}-${i}.webp`);
      const sz = await optimize(sources[i], localOut);
      optimizedPaths.push({ localPath: localOut, index: i, size: sz });
      console.log(`  ✓ optim ${i + 1}/${sources.length}: ${Math.round(sz / 1024)} kB`);
    }

    // Upload pro každý produkt + update DB
    for (const product of matching) {
      const prod = product as { id: string; name: string };
      console.log(`  ↑ Upload pro ${prod.name.slice(0, 50)}`);
      const uploadedUrls: string[] = [];
      const alts: string[] = [];
      for (const opt of optimizedPaths) {
        const buffer = await fs.readFile(opt.localPath);
        const storagePath = `${prod.id}/${String(opt.index).padStart(2, "0")}.webp`;
        const { error: upErr } = await sb.storage.from(BUCKET).upload(storagePath, buffer, {
          contentType: "image/webp",
          cacheControl: "31536000",
          upsert: true,
        });
        if (upErr) {
          console.error(`     ✗ upload fail: ${upErr.message}`);
          continue;
        }
        const { data: pub } = sb.storage.from(BUCKET).getPublicUrl(storagePath);
        uploadedUrls.push(pub.publicUrl);
        alts.push(`Isaac ${model.base} — autentická fotka ${opt.index + 1}/${optimizedPaths.length}`);
      }
      if (uploadedUrls.length > 0) {
        const { error: updErr } = await sb
          .from("supplier_products")
          .update({
            local_image_url: uploadedUrls[0],
            local_image_urls: uploadedUrls,
            local_image_alts: alts,
            image_migration_at: new Date().toISOString(),
            image_migration_error: null,
          })
          .eq("id", prod.id);
        if (updErr) console.error(`     ✗ DB update fail: ${updErr.message}`);
        else console.log(`     ✓ DB updated, ${uploadedUrls.length} URLs`);
      }
    }
  }

  // Cleanup tmp
  await fs.rm(tmpDir, { recursive: true, force: true });
  console.log(`\nHotovo.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
