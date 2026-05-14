import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { z } from "zod";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { invoiceOrder, type OrderForInvoice } from "@/lib/invoicing";
import { markInvoicePaid } from "@/lib/fakturoid";

const DATA_DIR = process.env.NODE_ENV === "production" ? "/tmp" : path.join(process.cwd(), "data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

const StatusUpdateSchema = z.object({
  status: z.enum(["pending", "paid", "shipped", "cancelled"]),
  trackingNumber: z.string().max(80).trim().optional(),
});

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = req.cookies.get("preview_auth");
  if (auth?.value !== "100dola2025") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
  }

  if (isSupabaseConfigured()) {
    try {
      const sb = getSupabase();
      const { error } = await sb.from("orders").update(patch).eq("id", id);
      if (error) throw error;

      // Při přechodu na paid: auto-fakturace + označit fakturu jako zaplacenou
      if (parsed.data.status === "paid") {
        await handlePaidTransition(id);
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
