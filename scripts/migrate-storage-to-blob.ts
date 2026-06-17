/**
 * Migrate ze Supabase Storage `supplier-images` → Vercel Blob.
 *
 * Důvod: Supabase free plán = 1 GB storage; máme 2.5 GB obrázků a překročili
 * jsme limit (grace do 7. 7. 2026). Vercel Pro = 100 GB Blob zdarma.
 *
 * Idempotentní: drží mapping v scripts/storage-migrate-mapping.jsonl, takže
 * re-run pokračuje tam, kde předchozí skončil.
 *
 * Spuštění:
 *   npx tsx web/scripts/migrate-storage-to-blob.ts
 *
 * Env (z .env.local — `vercel env pull .env.local --environment=production`):
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   BLOB_READ_WRITE_TOKEN
 */
import { config as loadEnv } from "dotenv";
import { resolve as resolvePath } from "node:path";
loadEnv({ path: resolvePath(process.cwd(), ".env.local") });
import { createClient } from "@supabase/supabase-js";
import { put } from "@vercel/blob";
import { writeFileSync, appendFileSync, existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const SB_URL = process.env.SUPABASE_URL!;
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN!;

if (!SB_URL || !SB_KEY) throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY chybí");
if (!BLOB_TOKEN) throw new Error("BLOB_READ_WRITE_TOKEN chybí — vercel env pull .env.local --environment=production");

const BUCKET = "supplier-images";
const MAPPING_FILE = resolve(process.cwd(), "scripts/storage-migrate-mapping.jsonl");
const LOG_FILE = resolve(process.cwd(), "scripts/storage-migrate.log");

const sb = createClient(SB_URL, SB_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function log(msg: string): void {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  appendFileSync(LOG_FILE, line + "\n");
}

interface ListedFile { name: string; size: number; }

async function listFolderFiles(folder: string): Promise<ListedFile[]> {
  const all: ListedFile[] = [];
  let offset = 0;
  while (true) {
    const { data, error } = await sb.storage.from(BUCKET).list(folder, {
      limit: 1000,
      offset,
      sortBy: { column: "name", order: "asc" },
    });
    if (error) throw error;
    if (!data || data.length === 0) break;
    for (const d of data) {
      if (d.id === null) continue; // subfolder
      const size = (d.metadata as { size?: number } | null)?.size ?? 0;
      all.push({ name: d.name, size });
    }
    if (data.length < 1000) break;
    offset += 1000;
  }
  return all;
}

async function listTopLevelFolders(): Promise<string[]> {
  const folders: string[] = [];
  let offset = 0;
  while (true) {
    const { data, error } = await sb.storage.from(BUCKET).list("", {
      limit: 1000,
      offset,
      sortBy: { column: "name", order: "asc" },
    });
    if (error) throw error;
    if (!data || data.length === 0) break;
    for (const d of data) folders.push(d.name);
    if (data.length < 1000) break;
    offset += 1000;
  }
  return folders;
}

interface MappingRow {
  oldPath: string;
  oldUrl: string;
  newUrl: string;
  size: number;
  ts: string;
}

async function main(): Promise<void> {
  if (!existsSync(MAPPING_FILE)) writeFileSync(MAPPING_FILE, "");
  if (!existsSync(LOG_FILE)) writeFileSync(LOG_FILE, "");

  log(`migrate START — bucket=${BUCKET}`);

  const folders = await listTopLevelFolders();
  log(`product folders: ${folders.length}`);

  const done = new Set<string>();
  const mappingLines = readFileSync(MAPPING_FILE, "utf8").split("\n").filter(Boolean);
  for (const line of mappingLines) {
    try {
      const row = JSON.parse(line) as MappingRow;
      done.add(row.oldPath);
    } catch { /* ignore */ }
  }
  if (done.size > 0) log(`resume — ${done.size} already migrated`);

  let total = 0;
  let migrated = 0;
  let skipped = 0;
  let errors = 0;
  let totalBytes = 0;

  const LIMIT = process.env.MIGRATE_LIMIT ? Number(process.env.MIGRATE_LIMIT) : Infinity;
  if (LIMIT !== Infinity) log(`TEST MODE — MIGRATE_LIMIT=${LIMIT}`);

  for (const folder of folders) {
    if (migrated >= LIMIT) break;
    const files = await listFolderFiles(folder);
    for (const f of files) {
      if (migrated >= LIMIT) break;
      const oldPath = `${folder}/${f.name}`;
      total++;

      if (done.has(oldPath)) { skipped++; continue; }

      try {
        const { data: blob, error: dlErr } = await sb.storage.from(BUCKET).download(oldPath);
        if (dlErr || !blob) throw dlErr || new Error("download null");
        const buf = Buffer.from(await blob.arrayBuffer());

        const blobResult = await put(`${BUCKET}/${oldPath}`, buf, {
          access: "public",
          contentType: blob.type || "image/webp",
          token: BLOB_TOKEN,
          allowOverwrite: true,
          addRandomSuffix: false,
        });

        const { data: pub } = sb.storage.from(BUCKET).getPublicUrl(oldPath);

        const row: MappingRow = {
          oldPath,
          oldUrl: pub.publicUrl,
          newUrl: blobResult.url,
          size: f.size,
          ts: new Date().toISOString(),
        };
        appendFileSync(MAPPING_FILE, JSON.stringify(row) + "\n");

        migrated++;
        totalBytes += f.size;
        if (migrated % 50 === 0) {
          log(`progress: migrated=${migrated} skipped=${skipped} errors=${errors} bytes=${(totalBytes / 1024 / 1024).toFixed(1)}MB`);
        }
      } catch (e) {
        errors++;
        log(`ERROR ${oldPath}: ${(e as Error).message}`);
      }
    }
  }

  log(`DONE — total=${total} migrated=${migrated} skipped=${skipped} errors=${errors} totalMB=${(totalBytes / 1024 / 1024).toFixed(1)}`);
  log(`Mapping: ${MAPPING_FILE}`);
}

main().catch((e) => {
  log(`FATAL: ${(e as Error).stack || (e as Error).message}`);
  process.exit(1);
});
