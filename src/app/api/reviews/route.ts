import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ReviewSchema = z.object({
  product_slug: z.string().min(1).max(200),
  product_name_snapshot: z.string().min(1).max(300),
  customer_name: z.string().min(2).max(80),
  customer_email: z.string().email().max(200),
  customer_city: z.string().max(80).optional().nullable(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(120).optional().nullable(),
  body: z.string().min(20).max(3000),
  photos: z.array(z.string().url()).max(3).optional().nullable(),
  order_id: z.string().max(40).optional().nullable(),
  // honeypot
  website: z.string().max(0).optional(),
});

/**
 * POST /api/reviews — submit nové recenze.
 * Vždy status='pending' → admin schvaluje v /admin/reviews.
 * Anti-spam: honeypot 'website' field musí být prázdný + rate-limit.
 */
export async function POST(request: Request) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return Response.json({ ok: false, error: "server_config" }, { status: 500 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = ReviewSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ ok: false, error: "invalid_input", issues: parsed.error.issues }, { status: 400 });
  }
  const data = parsed.data;

  // Honeypot — bot vyplní, lidi ne
  if (data.website && data.website.length > 0) {
    return Response.json({ ok: true, status: "received" }, { status: 200 });
  }

  const sb = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    db: { schema: "public" },
  });

  // Rate limit: max 3 reviews z stejného emailu za 24 h
  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const { count: recentCount } = await sb
    .from("product_reviews")
    .select("id", { count: "exact", head: true })
    .eq("customer_email", data.customer_email)
    .gte("created_at", since);
  if ((recentCount ?? 0) >= 3) {
    return Response.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  const ipFromHeaders =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    null;
  const ua = request.headers.get("user-agent") ?? null;

  const { error } = await sb.from("product_reviews").insert({
    product_slug: data.product_slug,
    product_name_snapshot: data.product_name_snapshot,
    customer_name: data.customer_name,
    customer_email: data.customer_email,
    customer_city: data.customer_city ?? null,
    rating: data.rating,
    title: data.title ?? null,
    body: data.body,
    photos: data.photos ?? null,
    order_id: data.order_id ?? null,
    status: "pending",
    ip_address: ipFromHeaders,
    user_agent: ua,
  });

  if (error) {
    console.error("[reviews] insert failed:", error);
    return Response.json({ ok: false, error: "insert_failed" }, { status: 500 });
  }

  return Response.json({ ok: true, status: "pending_moderation" });
}
