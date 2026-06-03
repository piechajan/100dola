import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Schema = z.object({
  supplier_product_id: z.string().uuid(),
  variant_external_id: z.string().min(1).max(100).optional().nullable(),
  customer_email: z.string().email().max(200),
  customer_name: z.string().max(80).optional().nullable(),
  website: z.string().max(0).optional(), // honeypot
});

/**
 * POST /api/stock-notify
 * Email signup pro out-of-stock variant. Idempotent (UNIQUE constraint).
 * Když se variant naskladní, /api/cron/stock-notify pošle email.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ ok: false, error: "invalid_input" }, { status: 400 });
  }
  const data = parsed.data;

  if (data.website && data.website.length > 0) {
    return Response.json({ ok: true }, { status: 200 });
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return Response.json({ ok: false, error: "config" }, { status: 500 });
  }

  const sb = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Rate limit: 5 signups/email/24h
  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const { count } = await sb
    .from("stock_notifications")
    .select("id", { count: "exact", head: true })
    .eq("customer_email", data.customer_email)
    .gte("created_at", since);
  if ((count ?? 0) >= 5) {
    return Response.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    null;
  const ua = request.headers.get("user-agent");

  const { error } = await sb.from("stock_notifications").upsert(
    {
      supplier_product_id: data.supplier_product_id,
      variant_external_id: data.variant_external_id ?? null,
      customer_email: data.customer_email,
      customer_name: data.customer_name ?? null,
      ip_address: ip,
      user_agent: ua,
    },
    { onConflict: "supplier_product_id,variant_external_id,customer_email" },
  );

  if (error) {
    console.error("[stock-notify] insert:", error);
    return Response.json({ ok: false, error: "db" }, { status: 500 });
  }

  return Response.json({ ok: true });
}
