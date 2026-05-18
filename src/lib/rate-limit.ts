// Rate-limiting helper přes Supabase counter table.
// Volání: const r = await checkRateLimit(req, { bucket: "contact", max: 5, windowSec: 600 });
// if (!r.ok) return 429.

import "server-only";
import type { NextRequest } from "next/server";
import { getSupabase, isSupabaseConfigured } from "./supabase";

interface RateLimitOpts {
  bucket: string;
  max: number;
  windowSec: number;
}

interface RateLimitResult {
  ok: boolean;
  count: number;
  remaining: number;
}

function getClientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}

export async function checkRateLimit(
  req: NextRequest,
  opts: RateLimitOpts,
): Promise<RateLimitResult> {
  if (!isSupabaseConfigured()) {
    // Fail-open pokud DB není dostupná — neblokovat legitimní traffic
    return { ok: true, count: 0, remaining: opts.max };
  }

  const ip = getClientIp(req);
  const sb = getSupabase();
  const since = new Date(Date.now() - opts.windowSec * 1000).toISOString();

  // 1) Insert log řádku
  try {
    await sb.from("rate_limits").insert({ bucket: opts.bucket, ip });
  } catch (e) {
    console.warn("[rate-limit] insert failed:", e);
    // Fail-open
    return { ok: true, count: 0, remaining: opts.max };
  }

  // 2) Count v okně
  try {
    const { count } = await sb
      .from("rate_limits")
      .select("id", { count: "exact", head: true })
      .eq("bucket", opts.bucket)
      .eq("ip", ip)
      .gte("ts", since);

    const n = count ?? 0;
    return {
      ok: n <= opts.max,
      count: n,
      remaining: Math.max(0, opts.max - n),
    };
  } catch (e) {
    console.warn("[rate-limit] count failed:", e);
    return { ok: true, count: 0, remaining: opts.max };
  }
}
