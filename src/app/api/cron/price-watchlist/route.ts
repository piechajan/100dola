import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { runPricingWatchlist } from "@/lib/pricing/runner";
import { logCronRun } from "@/lib/cron-monitor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GATED cron: ENABLE_PRICE_WATCHLIST=true MUSÍ být v env, jinak skipne.
 * Vercel cron volá tento endpoint s Authorization: Bearer <CRON_SECRET>.
 */
export async function GET(request: Request) {
  // Auth
  const auth = request.headers.get("authorization");
  const expectedAuth = `Bearer ${process.env.CRON_SECRET ?? ""}`;
  if (!process.env.CRON_SECRET || auth !== expectedAuth) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  return logCronRun("price-watchlist", "0 6 * * *", async () => {
    // Feature flag — default false
    if (process.env.ENABLE_PRICE_WATCHLIST !== "true") {
      return NextResponse.json(
        { ok: true, skipped: true, reason: "ENABLE_PRICE_WATCHLIST flag off" },
        { headers: { "x-cron-status": "gated" } },
      );
    }

    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      return NextResponse.json(
        { ok: false, error: "supabase env missing" },
        { status: 500 },
      );
    }

    const sb = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      db: { schema: "public" },
    });

    try {
      const result = await runPricingWatchlist(sb);
      return NextResponse.json({ ok: true, ...result });
    } catch (e) {
      return NextResponse.json(
        { ok: false, error: e instanceof Error ? e.message : String(e) },
        { status: 500 },
      );
    }
  });
}
