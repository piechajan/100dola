import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return new Response("Missing id", { status: 400 });

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return new Response("Config error", { status: 500 });

  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  await sb.from("stock_notifications").update({ unsubscribed_at: new Date().toISOString() }).eq("id", id);

  const html = `<!doctype html><html lang="cs"><head><meta charset="utf-8"><title>Odhlášeno</title></head>
<body style="font-family:-apple-system,Segoe UI,sans-serif;color:#1a1a2e;max-width:480px;margin:80px auto;padding:0 16px;text-align:center;">
  <h2 style="font-size:18px;">Odhlášeno</h2>
  <p style="color:#5A6480;">Z této notifikace tě už neobtěžujeme.</p>
  <p><a href="/shop" style="color:#3B7CF4;">Zpět do e-shopu</a></p>
</body></html>`;
  return new Response(html, { status: 200, headers: { "content-type": "text/html; charset=utf-8" } });
}
