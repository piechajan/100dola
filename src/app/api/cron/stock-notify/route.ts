import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { withCronLog } from "@/lib/cron-monitor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CRON_NAME = "stock-notify";
const SCHEDULE = "0 9 * * *";

/**
 * Daily cron — pro každý pending stock_notification:
 *   1. Najít supplier_product
 *   2. Pokud variant_external_id null → check has_any_in_stock (alespoň 1 variant skladem)
 *   3. Pokud variant_external_id set → check ten konkrétní variant
 *   4. Pokud TRUE → poslat Resend mail + označit notified_at
 */
export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET ?? ""}`;
  if (!process.env.CRON_SECRET || auth !== expected) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  return withCronLog(CRON_NAME, SCHEDULE, runStockNotify)();
}

async function runStockNotify() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return { ok: false, status: "failed" as const, error: "no_env" };
  }

  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

  // Pending notifications (not yet notified, not unsubscribed)
  const { data: notifications } = await sb
    .from("stock_notifications")
    .select("id, supplier_product_id, variant_external_id, customer_email, customer_name")
    .is("notified_at", null)
    .is("unsubscribed_at", null);

  const rows = notifications ?? [];
  if (rows.length === 0) {
    return { ok: true, status: "no_op" as const, checked: 0, sent: 0 };
  }

  const productIds = Array.from(new Set(rows.map((r) => r.supplier_product_id)));
  const { data: products } = await sb
    .from("supplier_products")
    .select("id, name, public_slug, variants, local_image_url")
    .in("id", productIds);

  const productMap = new Map<string, { name: string; slug: string; variants: unknown; photo: string | null }>();
  for (const p of products ?? []) {
    const row = p as { id: string; name: string; public_slug: string | null; variants: unknown; local_image_url: string | null };
    productMap.set(row.id, {
      name: row.name,
      slug: row.public_slug || `produkt-${row.id.slice(0, 8)}`,
      variants: row.variants,
      photo: row.local_image_url,
    });
  }

  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || "100dola <onboarding@resend.dev>";
  const resend = resendKey ? new Resend(resendKey) : null;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.100dola.com";

  let sent = 0;
  let checked = 0;

  for (const n of rows) {
    checked++;
    const product = productMap.get(n.supplier_product_id);
    if (!product) continue;
    const variants = Array.isArray(product.variants) ? (product.variants as Array<{ externalId?: string; isInStock?: boolean; size?: string }>) : [];

    let inStock = false;
    let matchedSize: string | undefined;
    if (n.variant_external_id) {
      const v = variants.find((x) => x.externalId === n.variant_external_id);
      inStock = v?.isInStock === true;
      matchedSize = v?.size;
    } else {
      inStock = variants.some((v) => v.isInStock);
    }

    if (!inStock) continue;

    if (resend) {
      const productUrl = `${siteUrl}/shop/${product.slug}`;
      const unsubUrl = `${siteUrl}/api/stock-notify/unsubscribe?id=${n.id}`;
      const html = `<!doctype html>
<html><body style="font-family:-apple-system,Segoe UI,sans-serif;color:#1a1a2e;max-width:520px;margin:24px auto;padding:0 16px;">
  <h2 style="font-size:18px;">🎉 Naskladněno!</h2>
  <p style="font-size:14px;color:#5A6480;">
    <strong>${escapeHtml(product.name)}</strong>${matchedSize ? ` (velikost ${escapeHtml(matchedSize)})` : ""} je opět skladem.
  </p>
  ${product.photo ? `<img src="${escapeHtml(product.photo)}" alt="" style="max-width:200px;border-radius:8px;margin:16px 0;">` : ""}
  <p style="margin:24px 0;">
    <a href="${productUrl}" style="display:inline-block;padding:12px 22px;background:#1a1a2e;color:#fff;border-radius:9999px;text-decoration:none;font-weight:700;font-size:14px;">
      Otevřít produkt →
    </a>
  </p>
  <p style="font-size:11px;color:#9AA3C2;margin-top:32px;">
    Tip: kus se může rychle prodat. <a href="${unsubUrl}" style="color:#9AA3C2;">Odhlásit z notifikací</a>
  </p>
</body></html>`;

      try {
        await resend.emails.send({
          from,
          to: n.customer_email,
          subject: `🎉 Naskladněno: ${product.name}`,
          html,
        });
        await sb.from("stock_notifications").update({ notified_at: new Date().toISOString() }).eq("id", n.id);
        sent++;
      } catch (e) {
        console.error("[stock-notify] send fail:", e);
      }
    } else {
      // Bez Resend env — jen označit
      await sb.from("stock_notifications").update({ notified_at: new Date().toISOString() }).eq("id", n.id);
      sent++;
    }
  }

  return { ok: true, checked, sent };
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
