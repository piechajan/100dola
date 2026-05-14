// High-level invoicing logic — překládá náš order → Fakturoid invoice.
// Cache pak ukládá referenci do Supabase `invoices` tabulky pro per-project analytics.

import "server-only";

import {
  isFakturoidConfigured,
  findOrCreateSubject,
  createInvoice,
  type FakturoidInvoice,
  type InvoiceLine,
} from "./fakturoid";
import { getSupabase, isSupabaseConfigured } from "./supabase";

export interface OrderForInvoice {
  id: string;
  contact: {
    name: string;
    email: string;
    phone: string;
    companyName?: string | null;
    companyIco?: string | null;
    companyDic?: string | null;
  };
  shipping: {
    street?: string | null;
    city?: string | null;
    zip?: string | null;
    methodLabel: string;
  };
  items: Array<{
    name: string;
    qty: number;
    priceWithVat: number;
    vatRate: number;
  }>;
  shippingFee: number;
  discountCode?: string | null;
  discountAmount?: number;
}

/**
 * Vytvoří fakturu ve Fakturoidu z order data + cache do Supabase.
 * Idempotentní: pokud invoice už existuje (cached), vrátí existující.
 */
export async function invoiceOrder(order: OrderForInvoice): Promise<FakturoidInvoice | null> {
  if (!isFakturoidConfigured()) {
    console.warn("[invoicing] Fakturoid not configured, skipping invoice creation");
    return null;
  }

  // Idempotence — pokud invoice už existuje pro tento order, vrátit existující ID.
  if (isSupabaseConfigured()) {
    try {
      const sb = getSupabase();
      const { data } = await sb
        .from("invoices")
        .select("fakturoid_id, raw_payload")
        .eq("order_id", order.id)
        .maybeSingle();
      if (data?.fakturoid_id) {
        console.log(`[invoicing] Order ${order.id} already invoiced as ${data.fakturoid_id}`);
        return data.raw_payload as FakturoidInvoice;
      }
    } catch (e) {
      console.warn("[invoicing] supabase check failed:", e);
    }
  }

  // 1. Najít nebo vytvořit subject (zákazník) ve Fakturoidu
  // custom_id = náš stabilní identifikátor (email-based)
  const customId = order.contact.companyIco || `email:${order.contact.email}`;
  const subject = await findOrCreateSubject({
    customId,
    name: order.contact.companyName || order.contact.name,
    email: order.contact.email,
    phone: order.contact.phone,
    street: order.shipping.street || undefined,
    city: order.shipping.city || undefined,
    zip: order.shipping.zip || undefined,
    country: "CZ",
    registrationNo: order.contact.companyIco || undefined,
    vatNo: order.contact.companyDic || undefined,
  });

  // 2. Sestavit line items
  const lines: InvoiceLine[] = order.items.map((i) => ({
    name: i.name,
    quantity: i.qty,
    unit_name: "ks",
    unit_price: (i.priceWithVat / (1 + i.vatRate / 100)).toFixed(2),
    vat_rate: i.vatRate,
  }));

  // Sleva jako záporná položka (přes celý košík)
  if (order.discountAmount && order.discountAmount > 0) {
    lines.push({
      name: `Sleva (${order.discountCode || "kupón"})`,
      quantity: 1,
      unit_price: (-order.discountAmount / 1.21).toFixed(2), // assumes 21% — drobná nepřesnost, OK pro start
      vat_rate: 21,
    });
  }

  // Doprava
  if (order.shippingFee > 0) {
    lines.push({
      name: `Doprava (${order.shipping.methodLabel})`,
      quantity: 1,
      unit_price: (order.shippingFee / 1.21).toFixed(2),
      vat_rate: 21,
    });
  }

  // 3. Vytvořit invoice
  const invoice = await createInvoice({
    subjectId: subject.id,
    variableSymbol: order.id,
    lines,
    project: "sport", // orders zatím jen ze Sport pilíře
    note: `Objednávka 100dola.com/objednavka/${order.id}`,
    sendEmail: true,
  });

  // 4. Cache do Supabase
  if (isSupabaseConfigured()) {
    try {
      const sb = getSupabase();
      await sb.from("invoices").insert({
        fakturoid_id: invoice.id,
        number: invoice.number,
        project: "sport",
        order_id: order.id,
        subject_id: subject.id,
        status: invoice.status,
        total_with_vat_kc: parseFloat(invoice.total),
        issued_on: invoice.issued_on,
        due_on: invoice.due_on,
        paid_on: invoice.paid_on,
        pdf_url: invoice.pdf_url,
        html_url: invoice.html_url,
        raw_payload: invoice,
      });
    } catch (e) {
      console.warn("[invoicing] supabase cache failed:", e);
    }
  }

  return invoice;
}
