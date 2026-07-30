import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { z } from "zod";
import { Resend } from "resend";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { invoiceOrder, type OrderForInvoice } from "@/lib/invoicing";
import { markInvoicePaid } from "@/lib/fakturoid";
import { trackingUrl, carrierLabel } from "@/lib/tracking";
import { getAdminContext } from "@/lib/admin-auth";
import { sendReviewRequest } from "@/lib/email";

const DATA_DIR = process.env.NODE_ENV === "production" ? "/tmp" : path.join(process.cwd(), "data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

const StatusUpdateSchema = z.object({
  status: z.enum(["pending", "paid", "shipped", "cancelled"]),
  trackingNumber: z.string().max(80).trim().optional(),
  trackingCarrier: z.enum(["zasilkovna", "gls", "dpd", "ceska_posta", "osobne", "other"]).optional(),
});

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const admin = await getAdminContext();
  if (!admin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = StatusUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const patch: Record<string, unknown> = { status: parsed.data.status };
  if (parsed.data.status === "paid") patch.paid_at = now;
  if (parsed.data.status === "shipped") {
    patch.shipped_at = now;
    if (parsed.data.trackingNumber) patch.tracking_number = parsed.data.trackingNumber;
    if (parsed.data.trackingCarrier) patch.tracking_carrier = parsed.data.trackingCarrier;
  }

  if (isSupabaseConfigured()) {
    try {
      const sb = getSupabase();
      const { error } = await sb.from("orders").update(patch).eq("id", id);
      if (error) throw error;

      if (parsed.data.status === "paid") {
        await handlePaidTransition(id);
      }
      if (parsed.data.status === "shipped") {
        if (parsed.data.trackingNumber) await sendShipmentNotification(id);
        // Review follow-up mail (naplánovaný +4 dny přes Resend). Bez DB guardu —
        // opětovné označení „shipped" je vzácné; případný dvojí ask je neškodný.
        await sendReviewFollowup(id);
      }

      return NextResponse.json({ ok: true, id, ...patch });
    } catch (e) {
      console.warn("[admin/orders/status] DB failed, fallback to file:", e);
    }
  }

  // File fallback
  try {
    const raw = await fs.readFile(ORDERS_FILE, "utf-8");
    const all = JSON.parse(raw) as Record<string, unknown>[];
    const idx = all.findIndex((o) => o.id === id);
    if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
    all[idx] = { ...all[idx], ...patch };
    await fs.writeFile(ORDERS_FILE, JSON.stringify(all, null, 2), "utf-8");
    return NextResponse.json({ ok: true, id, ...patch });
  } catch {
    return NextResponse.json({ error: "Storage error" }, { status: 500 });
  }
}

/**
 * Při přechodu order do `paid`:
 *  1. Pokud invoice ještě neexistuje → vytvořit ve Fakturoidu (idempotent)
 *  2. Pokud existuje → označit ji jako zaplacenou ve Fakturoidu
 */
/**
 * Customer email po označení order "shipped" + zadání tracking number.
 * Idempotent: nepošle pokud tracking_notified_at je už nastavený.
 */
/**
 * Review follow-up — naplánuje prosbu o recenzi (+7 dní). Primárně vede na
 * recenzi produktů na našem webu (každá položka objednávky vlastní tlačítko),
 * volitelně přidá i Google CTA (když je GOOGLE_REVIEW_URL). Pokrývá i osobní
 * vyzvednutí (na rozdíl od shipment notifikace, co chce tracking).
 * Graceful no-op když Resend / Supabase nejsou nastavené.
 */
async function sendReviewFollowup(orderId: string): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    const sb = getSupabase();
    const { data: order } = await sb
      .from("orders")
      .select("id, name, email")
      .eq("id", orderId)
      .maybeSingle();
    if (!order || !order.email) return;
    const { data: items } = await sb
      .from("order_items")
      .select("slug, name")
      .eq("order_id", orderId);
    await sendReviewRequest({
      id: order.id,
      name: order.name ?? "",
      email: order.email,
      items: (items ?? []).map((i) => ({ slug: i.slug as string, name: i.name as string })),
    });
  } catch (e) {
    console.error("[admin/orders/status] sendReviewFollowup failed:", e);
  }
}

async function sendShipmentNotification(orderId: string): Promise<void> {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return;
  if (!isSupabaseConfigured()) return;
  try {
    const sb = getSupabase();
    const { data: order } = await sb
      .from("orders")
      .select("id, name, email, tracking_number, tracking_carrier, tracking_notified_at")
      .eq("id", orderId)
      .maybeSingle();
    if (!order || !order.email || !order.tracking_number) return;
    if (order.tracking_notified_at) return; // už posláno

    const trackUrl = trackingUrl(order.tracking_carrier ?? "", order.tracking_number);
    const carrierName = carrierLabel(order.tracking_carrier);

    const resend = new Resend(resendKey);
    const from = process.env.RESEND_FROM_EMAIL || "100dola <onboarding@resend.dev>";
    await resend.emails.send({
      from,
      to: order.email,
      subject: `Objednávka ${order.id} je na cestě 🚚`,
      html: shipmentEmailHtml({
        name: order.name,
        orderId: order.id,
        carrierName,
        trackingNumber: order.tracking_number,
        trackUrl,
      }),
    });
    await sb
      .from("orders")
      .update({ tracking_notified_at: new Date().toISOString() })
      .eq("id", orderId);
  } catch (e) {
    console.error("[admin/orders/status] sendShipmentNotification failed:", e);
  }
}

function escape(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function shipmentEmailHtml(args: {
  name: string;
  orderId: string;
  carrierName: string;
  trackingNumber: string;
  trackUrl: string | null;
}): string {
  const trackBlock = args.trackUrl
    ? `<p style="margin:24px 0;">
         <a href="${escape(args.trackUrl)}" style="display:inline-block;padding:12px 22px;background:#1a1a2e;color:#fff;border-radius:9999px;text-decoration:none;font-weight:700;font-size:14px;">
           Sledovat zásilku →
         </a>
       </p>`
    : `<p style="font-size:12px;color:#5A6480;">
         Sledování číslem ${escape(args.trackingNumber)} u dopravce ${escape(args.carrierName)}.
       </p>`;

  return `<!doctype html>
<html><body style="font-family:-apple-system,Segoe UI,sans-serif;color:#1a1a2e;max-width:560px;margin:24px auto;padding:0 16px;line-height:1.55;">
  <h2 style="margin:0 0 8px;font-size:18px;">Tvoje objednávka je na cestě, ${escape(args.name)} 🚚</h2>
  <p style="font-size:14px;color:#5A6480;">
    Předali jsme balík dopravci <strong>${escape(args.carrierName)}</strong>.
  </p>
  <p style="font-size:14px;">
    Číslo zásilky: <strong style="font-family:ui-monospace,monospace;">${escape(args.trackingNumber)}</strong>
  </p>
  ${trackBlock}
  <p style="font-size:13px;color:#5A6480;">
    Pokud něco nesedí, ozvi se na <a href="mailto:piecha.jan@gmail.com" style="color:#3B7CF4;">piecha.jan@gmail.com</a>
    nebo zavolej <a href="tel:+420739045057" style="color:#3B7CF4;">+420 739 045 057</a>.
  </p>
  <p style="margin:28px 0 4px;font-size:14px;">Měj se,</p>
  <p style="margin:0;font-size:14px;font-weight:700;">Jan / 100dola</p>
  <hr style="margin:32px 0 12px;border:none;border-top:1px solid #E2E6F3;">
  <p style="font-size:11px;color:#9AA3C2;">
    Objednávka <strong>${escape(args.orderId)}</strong> · 100dola sport · FUTUNATU s.r.o. · Šternberk<br>
    <a href="https://www.100dola.com" style="color:#9AA3C2;">www.100dola.com</a>
  </p>
</body></html>`;
}

async function handlePaidTransition(orderId: string): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    const sb = getSupabase();

    // Fetch order + items
    const { data: order } = await sb.from("orders").select("*").eq("id", orderId).maybeSingle();
    if (!order) return;
    const { data: items } = await sb.from("order_items").select("*").eq("order_id", orderId);
    if (!items || items.length === 0) return;

    const orderForInvoice: OrderForInvoice = {
      id: order.id,
      contact: {
        name: order.name,
        email: order.email,
        phone: order.phone,
        companyName: order.company_name,
        companyIco: order.company_ico,
        companyDic: order.company_dic,
      },
      shipping: {
        street: order.street,
        city: order.city,
        zip: order.zip,
        methodLabel: order.shipping_method_label,
      },
      items: items.map((i: Record<string, unknown>) => ({
        name: i.name as string,
        qty: i.qty as number,
        priceWithVat: i.price_with_vat as number,
        vatRate: i.vat_rate as number,
      })),
      shippingFee: order.shipping_fee,
      discountCode: order.discount_code,
      discountAmount: order.discount_amount,
    };

    // Idempotent — invoiceOrder vrátí existující fakturu pokud už byla vytvořena
    const invoice = await invoiceOrder(orderForInvoice);
    if (!invoice) return;

    // Označit fakturu jako zaplacenou ve Fakturoidu
    try {
      await markInvoicePaid(invoice.id, new Date().toISOString().slice(0, 10));
      await sb
        .from("invoices")
        .update({ status: "paid", paid_on: new Date().toISOString().slice(0, 10) })
        .eq("fakturoid_id", invoice.id);
    } catch (e) {
      console.warn(`[admin/orders/status] mark paid for invoice ${invoice.id} failed:`, e);
    }
  } catch (e) {
    console.error("[admin/orders/status] handlePaidTransition failed:", e);
    // Nehodit — order status update už proběhl, faktura je vedlejší efekt
  }
}
