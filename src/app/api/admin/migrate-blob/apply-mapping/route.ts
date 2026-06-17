/**
 * Po dokončení migrace ze Supabase Storage do Vercel Blob:
 * přepiš všechny supplier_products URL (main_image_url, local_image_url,
 * local_image_urls) z `ngglervufcwkjnmtxgud.supabase.co/...` na
 * `x8igiusyfrnhkluf.public.blob.vercel-storage.com/...`.
 *
 * Auth: Bearer ADMIN_MIGRATE_SECRET.
 *
 * Idempotentní — jen URL, které mají match v blob_migration_mapping.
 * Bez match = ponechat (neměnit).
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

interface ApplyResult {
  scanned: number;
  updated: number;
  unmatched: number;
  durationMs: number;
}

export async function POST(req: NextRequest): Promise<NextResponse<ApplyResult | { error: string }>> {
  const secret = process.env.ADMIN_MIGRATE_SECRET;
  if (!secret) return NextResponse.json({ error: "no secret" }, { status: 500 });
  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return NextResponse.json({ error: "supabase env missing" }, { status: 500 });
  const sb = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const t0 = Date.now();

  // Load full mapping into memory (expected ~3000 rows = small)
  const map = new Map<string, string>();
  let offset = 0;
  while (true) {
    const { data, error } = await sb
      .from("blob_migration_mapping")
      .select("old_url, new_url")
      .range(offset, offset + 999);
    if (error) throw error;
    if (!data || data.length === 0) break;
    for (const r of data) {
      const row = r as { old_url: string; new_url: string };
      map.set(row.old_url, row.new_url);
    }
    if (data.length < 1000) break;
    offset += 1000;
  }

  // Stream products
  let scanned = 0;
  let updated = 0;
  let unmatched = 0;
  let prodOffset = 0;
  while (true) {
    const { data, error } = await sb
      .from("supplier_products")
      .select("id, main_image_url, local_image_url, local_image_urls")
      .range(prodOffset, prodOffset + 199);
    if (error) throw error;
    if (!data || data.length === 0) break;

    for (const p of data) {
      scanned++;
      const row = p as {
        id: string;
        main_image_url: string | null;
        local_image_url: string | null;
        local_image_urls: string[] | null;
      };
      const updates: {
        main_image_url?: string;
        local_image_url?: string;
        local_image_urls?: string[];
      } = {};
      let didMatch = false;

      if (row.main_image_url && map.has(row.main_image_url)) {
        updates.main_image_url = map.get(row.main_image_url);
        didMatch = true;
      }
      if (row.local_image_url && map.has(row.local_image_url)) {
        updates.local_image_url = map.get(row.local_image_url);
        didMatch = true;
      }
      if (row.local_image_urls && row.local_image_urls.length > 0) {
        const newArr = row.local_image_urls.map((u) => map.get(u) || u);
        if (newArr.some((u, i) => u !== row.local_image_urls![i])) {
          updates.local_image_urls = newArr;
          didMatch = true;
        }
      }

      if (Object.keys(updates).length > 0) {
        const { error: upErr } = await sb
          .from("supplier_products")
          .update(updates)
          .eq("id", row.id);
        if (!upErr) updated++;
      } else if (
        (row.main_image_url || row.local_image_url || (row.local_image_urls && row.local_image_urls.length > 0)) &&
        !didMatch
      ) {
        unmatched++;
      }
    }

    if (data.length < 200) break;
    prodOffset += 200;
  }

  return NextResponse.json({
    scanned,
    updated,
    unmatched,
    durationMs: Date.now() - t0,
  });
}
