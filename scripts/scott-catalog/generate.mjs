#!/usr/bin/env node
// Scott catalog generator — přepíše GENERATED blok v src/data/scott-catalog.ts
// z manifestu MODELS (scripts/scott-catalog/models.mjs).
//
// Použití:  node scripts/scott-catalog/generate.mjs
// Human-in-the-loop: pak si diff zkontroluj a commitni.

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { emitProduct } from "./lib.mjs";
import { MODELS } from "./models.mjs";

const __dir = dirname(fileURLToPath(import.meta.url));
const CATALOG = join(__dir, "../../src/data/scott-catalog.ts");
const BASE_ID = 1000;

// Validace: unikátní slugy
const seen = new Set();
for (const m of MODELS) {
  if (!m.slug || !m.name || !m.categoryId || m.price == null) {
    throw new Error(`Model bez povinných polí (slug/name/categoryId/price): ${JSON.stringify(m).slice(0, 120)}`);
  }
  if (seen.has(m.slug)) throw new Error(`Duplicitní slug v MODELS: ${m.slug}`);
  seen.add(m.slug);
}

const body =
  MODELS.length === 0
    ? "export const SCOTT_CATALOG: Product[] = [];"
    : "export const SCOTT_CATALOG: Product[] = [\n" +
      MODELS.map((m, i) => emitProduct(m, BASE_ID + i)).join("\n") +
      "\n];";

const src = readFileSync(CATALOG, "utf8");
const START = "// <<<GENERATED:START>>> (builder přepisuje jen tento blok)";
const END = "// <<<GENERATED:END>>>";
const s = src.indexOf(START);
const e = src.indexOf(END);
if (s < 0 || e < 0) throw new Error("Markery GENERATED:START/END nenalezeny v scott-catalog.ts");

const next = src.slice(0, s + START.length) + "\n" + body + "\n" + src.slice(e);
writeFileSync(CATALOG, next);
console.log(`✓ Vygenerováno ${MODELS.length} Scott produktů → src/data/scott-catalog.ts (id ${BASE_ID}–${BASE_ID + MODELS.length - 1})`);
