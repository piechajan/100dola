#!/usr/bin/env node
// Bulk upload fotek eventu po dnech do Vercel Blob (event-photos/<slug>/den-<N>/).
// Optimalizuje na WebP (~2000px, q80, strip metadat) přes ImageMagick.
//
// Vstupní složka: podadresáře den-1/, den-2/, … s originály (JPG/PNG/HEIC/WebP).
// Použití:
//   node scripts/malaga/upload-event-photos.mjs <slug> <složka>
// Např.:
//   node scripts/malaga/upload-event-photos.mjs malaga-fall-ride-1 ~/Desktop/malaga-fotky
//
// Vyžaduje: BLOB_READ_WRITE_TOKEN v web/.env.local, `magick` v PATH.

import { readFileSync, readdirSync, statSync, mkdtempSync } from "fs";
import { join, extname } from "path";
import { tmpdir } from "os";
import { execFileSync } from "child_process";
import { put } from "@vercel/blob";

const [slug, dir] = process.argv.slice(2);
if (!slug || !dir) {
  console.error("Použití: node upload-event-photos.mjs <slug> <složka>");
  process.exit(1);
}

const env = readFileSync(new URL("../../.env.local", import.meta.url), "utf8");
const token = (env.match(/^BLOB_READ_WRITE_TOKEN=(.*)$/m) || [])[1]
  ?.trim()
  .replace(/^["']|["']$/g, "");
if (!token) {
  console.error("Chybí BLOB_READ_WRITE_TOKEN v web/.env.local");
  process.exit(1);
}

const IMG = /\.(jpe?g|png|heic|heif|webp|tiff?)$/i;
const tmp = mkdtempSync(join(tmpdir(), "malaga-photos-"));

let uploaded = 0;
for (const entry of readdirSync(dir)) {
  const dayMatch = entry.match(/^den-?(\d+)$/i);
  const full = join(dir, entry);
  if (!dayMatch || !statSync(full).isDirectory()) continue;
  const day = Number(dayMatch[1]);

  const files = readdirSync(full).filter((f) => IMG.test(f)).sort();
  console.log(`\nDen ${day}: ${files.length} fotek`);

  for (const f of files) {
    const src = join(full, f);
    const outName = f.replace(extname(f), "") + ".webp";
    const out = join(tmp, `d${day}-${outName}`);
    // Zmenšit na max 2000px delší strana, q80, strip metadat.
    execFileSync("magick", [
      src,
      "-auto-orient",
      "-resize", "2000x2000>",
      "-strip",
      "-quality", "80",
      out,
    ]);
    const buf = readFileSync(out);
    const blob = await put(
      `event-photos/${slug}/den-${day}/${crypto.randomUUID()}.webp`,
      buf,
      { access: "public", contentType: "image/webp", addRandomSuffix: false, token },
    );
    uploaded += 1;
    console.log(`  ✓ ${f} → ${(buf.length / 1024).toFixed(0)} kB  ${blob.url}`);
  }
}

console.log(`\nHotovo: nahráno ${uploaded} fotek pro ${slug}.`);
console.log("Zkontroluj na /community/event/" + slug + " (galerie po dnech).");
