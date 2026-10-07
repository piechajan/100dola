import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Veřejný health-check pro uptime monitor. Bez tajemství a bez dat:
 * jen status + DB ping (HEAD count nad malou tabulkou, žádný payload).
 */
export async function GET() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  let db: "up" | "down" | "unconfigured" = "unconfigured";
  if (url && key) {
    try {
      const sb = createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false },
        db: { schema: "public" },
      });
      const { error } = await sb
        .from("supplier_brands")
        .select("id", { count: "exact", head: true })
        .limit(1);
      db = error ? "down" : "up";
    } catch {
      db = "down";
    }
  }
  const ok = db !== "down";
  return NextResponse.json(
    { status: ok ? "ok" : "degraded", db, ts: new Date().toISOString() },
    { status: ok ? 200 : 503, headers: { "Cache-Control": "no-store" } },
  );
}
