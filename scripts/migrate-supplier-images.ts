import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

const BUCKET = "supplier-images";
const BATCH_SIZE = 8;          // paralelní downloads
const RETRY_LIMIT = 2;
const DOWNLOAD_TIMEOUT_MS = 20_000;

interface Product {
  id: string;
  main_image_url: string | null;
  image_urls: string[] | null;
  local_image_url: string | null;
  local_image_urls: string[] | null;
  image_migration_at: string | null;
}

const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const STORAGE_PUBLIC_BASE = `${process.env.SUPABASE_URL}/storage/v1/object/public/${BUCKET}`;

async function fetchImage(url: string): Promise<{ buf: Uint8Array; contentType: string } | null> {
  for (let attempt = 0; attempt <= RETRY_LIMIT; attempt++) {
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(DOWNLOAD_TIMEOUT_MS),
        headers: { "user-agent": "Mozilla/5.0 (100dolaMigration/1.0)" },
      });
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error(`HTTP ${res.status}`);
      }
      const buf = new Uint8Array(await res.arrayBuffer());
      // Sportimport nesendí Content-Type — detekujeme z magic bytes
      let ct = res.headers.get("content-type") ?? "";
      if (!ct.startsWith("image/")) {
        if (buf[0] === 0xff && buf[1] === 0xd8) ct = "image/jpeg";
        else if (buf[0] === 0x89 && buf[1] === 0x50) ct = "image/png";
        else if (buf[8] === 0x57 && buf[9] === 0x45) ct = "image/webp";
        else ct = "image/jpeg"; // best guess
      }
      return { buf, contentType: ct };
    } catch (e) {
      if (attempt === RETRY_LIMIT) {
        console.warn(`  fetch fail (${url}):`, e instanceof Error ? e.message : e);
        return null;
      }
      await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
    }
  }
  return null;
}

async function uploadImage(productId: string, index: number, ct: string, buf: Uint8Array): Promise<string | null> {
  const ext = ct === "image/png" ? "png" : ct === "image/webp" ? "webp" : "jpg";
  const path = `${productId}/${String(index).padStart(2, "0")}.${ext}`;
  const { error } = await sb.storage.from(BUCKET).upload(path, buf, {
    contentType: ct,
    upsert: true,
    cacheControl: "31536000",
  });
  if (error) {
    console.warn(`  upload fail (${path}):`, error.message);
    return null;
  }
  return `${STORAGE_PUBLIC_BASE}/${path}`;
}

async function migrateProduct(p: Product): Promise<{ status: "ok" | "skip" | "error"; err?: string }> {
  // Skip pokud už migrované (idempotentní)
  if (p.local_image_url && p.image_migration_at) {
    return { status: "skip" };
  }

  const urls: string[] = [];
  if (p.main_image_url) urls.push(p.main_image_url);
  for (const u of p.image_urls ?? []) {
    if (!urls.includes(u)) urls.push(u);
  }

  if (urls.length === 0) return { status: "skip" };

  const uploaded: string[] = [];
  for (let i = 0; i < urls.length; i++) {
    const fetched = await fetchImage(urls[i]);
    if (!fetched) continue;
    const publicUrl = await uploadImage(p.id, i, fetched.contentType, fetched.buf);
    if (publicUrl) uploaded.push(publicUrl);
  }

  if (uploaded.length === 0) {
    await sb
      .from("supplier_products")
      .update({ image_migration_error: "all_downloads_failed", image_migration_at: new Date().toISOString() })
      .eq("id", p.id);
    return { status: "error", err: "no images uploaded" };
  }

  await sb
    .from("supplier_products")
    .update({
      local_image_url: uploaded[0],
      local_image_urls: uploaded,
      image_migration_at: new Date().toISOString(),
      image_migration_error: null,
    })
    .eq("id", p.id);

  return { status: "ok" };
}

async function main() {
  const heroOnly = process.argv.includes("--hero-only");
  console.log(`Mode: ${heroOnly ? "hero only (main_image_url)" : "full gallery"}`);

  // Načti všechny active produkty bez migrace
  const { data, error } = await sb
    .from("supplier_products")
    .select("id, main_image_url, image_urls, local_image_url, local_image_urls, image_migration_at")
    .eq("is_active", true)
    .is("image_migration_at", null);
  if (error) throw new Error(`select: ${error.message}`);

  const todo = (data ?? []) as Product[];
  console.log(`Found ${todo.length} produkty k migraci.\n`);

  let ok = 0;
  let skip = 0;
  let err = 0;
  const t0 = Date.now();

  // Batchované zpracování
  for (let i = 0; i < todo.length; i += BATCH_SIZE) {
    const batch = todo.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(
      batch.map((p) =>
        migrateProduct({
          ...p,
          image_urls: heroOnly ? null : p.image_urls,
        }),
      ),
    );
    for (const r of results) {
      if (r.status === "ok") ok++;
      else if (r.status === "skip") skip++;
      else err++;
    }
    const done = i + batch.length;
    const pct = Math.round((done / todo.length) * 100);
    const eta = Math.round(((Date.now() - t0) / done) * (todo.length - done) / 1000);
    console.log(`  [${done}/${todo.length}] ${pct}% · ok=${ok} skip=${skip} err=${err} · eta ${eta}s`);
  }

  console.log(`\nDone in ${Math.round((Date.now() - t0) / 1000)}s · ok=${ok} skip=${skip} err=${err}`);
}

main().catch((e) => {
  console.error("FATAL:", e);
  process.exit(1);
});
