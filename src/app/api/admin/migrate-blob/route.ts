/**
 * One-shot migrace Supabase Storage `supplier-images` → Vercel Blob.
 *
 * Důvod: Free Supabase Storage limit 1 GB překročen (2.5 GB). Vercel Pro
 * = 100 GB Blob zdarma. Po migraci klesne Supabase Storage na 0 a egress
 * spadne pod limit.
 *
 * Auth: `Authorization: Bearer ${ADMIN_MIGRATE_SECRET}` (nastav ve Vercel env).
 *
 * Workflow:
 *  1. Lokálně z terminálu pošli POST loop:
 *     ```bash
 *     while true; do
 *       OUT=$(curl -sS -X POST https://www.100dola.com/api/admin/migrate-blob \
 *         -H "Authorization: Bearer $ADMIN_MIGRATE_SECRET" \
 *         -H "Content-Type: application/json" \
 *         -d '{"batch":50}')
 *       echo "$OUT"
 *       echo "$OUT" | grep -q '"done":true' && break
 *     done
 *     ```
 *  2. Po dokončení: DB URL update přes druhou route (apply-mapping).
 *
 * Idempotence: progress se ukládá do tabulky `blob_migration_progress`.
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { put } from "@vercel/blob";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300; // Vercel Pro max

const BUCKET = "supplier-images";

interface BatchResult {
  done: boolean;
  totalProcessed: number;
  remainingFolders: number;
  errors: number;
  bytesThisBatch: number;
  message: string;
}

interface MigrationProgressRow {
  id: number;
  last_folder: string | null;
  last_file: string | null;
  total_migrated: number;
  total_errors: number;
  total_bytes: number;
  finished_at: string | null;
}

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars chybí");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function getProgress(sb: ReturnType<typeof getSupabase>): Promise<MigrationProgressRow> {
  const { data } = await sb
    .from("blob_migration_progress")
    .select("*")
    .eq("id", 1)
    .maybeSingle();
  if (data) return data as MigrationProgressRow;
  const init: Omit<MigrationProgressRow, "id"> = {
    last_folder: null,
    last_file: null,
    total_migrated: 0,
    total_errors: 0,
    total_bytes: 0,
    finished_at: null,
  };
  await sb.from("blob_migration_progress").insert({ id: 1, ...init });
  return { id: 1, ...init };
}

async function listFolders(
  sb: ReturnType<typeof getSupabase>,
  startAfter: string | null,
  limit: number,
): Promise<string[]> {
  const out: string[] = [];
  let offset = 0;
  let lookingForStart = startAfter !== null;
  while (out.length < limit) {
    const { data, error } = await sb.storage.from(BUCKET).list("", {
      limit: 1000,
      offset,
      sortBy: { column: "name", order: "asc" },
    });
    if (error) throw error;
    if (!data || data.length === 0) break;
    for (const d of data) {
      if (lookingForStart) {
        if (d.name === startAfter) lookingForStart = false;
        continue;
      }
      out.push(d.name);
      if (out.length >= limit) break;
    }
    if (data.length < 1000) break;
    offset += 1000;
  }
  return out;
}

async function listFiles(
  sb: ReturnType<typeof getSupabase>,
  folder: string,
): Promise<{ name: string; size: number }[]> {
  const all: { name: string; size: number }[] = [];
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
      if (d.id === null) continue;
      const size = (d.metadata as { size?: number } | null)?.size ?? 0;
      all.push({ name: d.name, size });
    }
    if (data.length < 1000) break;
    offset += 1000;
  }
  return all;
}

async function migrateFile(
  sb: ReturnType<typeof getSupabase>,
  folder: string,
  fileName: string,
): Promise<{ oldUrl: string; newUrl: string; size: number }> {
  const oldPath = `${folder}/${fileName}`;
  const { data: blob, error } = await sb.storage.from(BUCKET).download(oldPath);
  if (error || !blob) throw error || new Error("download null");
  const buf = Buffer.from(await blob.arrayBuffer());
  const blobResult = await put(`${BUCKET}/${oldPath}`, buf, {
    access: "public",
    contentType: blob.type || "image/webp",
    allowOverwrite: true,
    addRandomSuffix: false,
  });
  const { data: pub } = sb.storage.from(BUCKET).getPublicUrl(oldPath);
  return {
    oldUrl: pub.publicUrl,
    newUrl: blobResult.url,
    size: buf.byteLength,
  };
}

export async function POST(req: NextRequest): Promise<NextResponse<BatchResult | { error: string }>> {
  // Auth
  const secret = process.env.ADMIN_MIGRATE_SECRET;
  if (!secret) return NextResponse.json({ error: "ADMIN_MIGRATE_SECRET not configured" }, { status: 500 });
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const batch = Math.min(Math.max(Number(body.batch) || 25, 1), 100);

  const sb = getSupabase();
  const progress = await getProgress(sb);
  if (progress.finished_at) {
    return NextResponse.json({
      done: true,
      totalProcessed: progress.total_migrated,
      remainingFolders: 0,
      errors: progress.total_errors,
      bytesThisBatch: 0,
      message: `Migration finished at ${progress.finished_at}`,
    });
  }

  // Take a few folders starting after last_folder
  const folders = await listFolders(sb, progress.last_folder, 50);
  if (folders.length === 0) {
    await sb
      .from("blob_migration_progress")
      .update({ finished_at: new Date().toISOString() })
      .eq("id", 1);
    return NextResponse.json({
      done: true,
      totalProcessed: progress.total_migrated,
      remainingFolders: 0,
      errors: progress.total_errors,
      bytesThisBatch: 0,
      message: "All folders processed",
    });
  }

  const mapping: { old_url: string; new_url: string; size: number; folder: string; file_name: string }[] = [];
  let processed = 0;
  let errors = 0;
  let bytes = 0;
  let lastFolder = progress.last_folder;
  let lastFile = progress.last_file;

  outer: for (const folder of folders) {
    const files = await listFiles(sb, folder);
    let startAfter = folder === progress.last_folder && progress.last_file !== null;
    for (const f of files) {
      if (startAfter) {
        if (f.name === progress.last_file) startAfter = false;
        continue;
      }
      try {
        const r = await migrateFile(sb, folder, f.name);
        mapping.push({
          old_url: r.oldUrl,
          new_url: r.newUrl,
          size: r.size,
          folder,
          file_name: f.name,
        });
        bytes += r.size;
        processed++;
        lastFolder = folder;
        lastFile = f.name;
        if (processed >= batch) break outer;
      } catch (e) {
        errors++;
        console.warn(`[migrate] ${folder}/${f.name}: ${(e as Error).message}`);
      }
    }
    // Folder finished — clear last_file for next folder's first file
    lastFolder = folder;
    lastFile = null;
  }

  // Persist mapping
  if (mapping.length > 0) {
    await sb.from("blob_migration_mapping").insert(mapping);
  }

  await sb
    .from("blob_migration_progress")
    .update({
      last_folder: lastFolder,
      last_file: lastFile,
      total_migrated: progress.total_migrated + processed,
      total_errors: progress.total_errors + errors,
      total_bytes: progress.total_bytes + bytes,
    })
    .eq("id", 1);

  // Check if more folders remain
  const moreFolders = await listFolders(sb, lastFolder, 1);
  const remaining = moreFolders.length;

  return NextResponse.json({
    done: false,
    totalProcessed: progress.total_migrated + processed,
    remainingFolders: remaining,
    errors,
    bytesThisBatch: bytes,
    message: `Batch ${processed} migrated, lastFolder=${lastFolder}`,
  });
}
