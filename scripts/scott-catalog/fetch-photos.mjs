#!/usr/bin/env node
// Stáhne a zoptimalizuje fotky pro Scott catalog do public/media/scott/.
// Čte MODELS[].photoSources: { "/media/scott/<slug>-1.webp": "https://…", … }
// WebP q82, flatten na bílou, max 1600px delší strana (dle CLAUDE.md pravidel).
//
// Použití:  node scripts/scott-catalog/fetch-photos.mjs [slug]   (slug = jen jeden model)

import sharp from "sharp";
import { existsSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { MODELS } from "./models.mjs";

const __dir = dirname(fileURLToPath(import.meta.url));
const PUB = join(__dir, "../../public");
const only = process.argv[2];

async function optimize(url, outRel) {
  const out = join(PUB, outRel);
  if (existsSync(out)) return { outRel, skipped: true };
  const res = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 Chrome/126 Safari/537.36" } });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  mkdirSync(dirname(out), { recursive: true });
  await sharp(buf)
    .flatten({ background: "#ffffff" })
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(out);
  return { outRel, skipped: false };
}

let ok = 0;
let fail = 0;
for (const m of MODELS) {
  if (only && m.slug !== only) continue;
  const sources = m.photoSources ?? {};
  for (const [rel, url] of Object.entries(sources)) {
    try {
      const r = await optimize(url, rel);
      console.log(`${r.skipped ? "=" : "✓"} ${rel}`);
      ok++;
    } catch (e) {
      console.error(`✗ ${rel} — ${e.message}`);
      fail++;
    }
  }
}
console.log(`\nHotovo: ${ok} ok, ${fail} chyb`);
if (fail) process.exit(1);
