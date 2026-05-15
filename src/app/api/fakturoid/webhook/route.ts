// Fakturoid webhook receiver — Authorization-header validated.
//
// Fakturoid pošle event při změně faktury (např. `invoice_paid` po sync s FIO bank).
// My matchneme podle variable_symbol = náš order.id a updatneme orders.status na "paid".
//
// Auth model (Fakturoid v3):
//   - V Fakturoid UI při tvorbě webhooku se do pole "Autorizace" vloží sdílený token.
//   - Fakturoid ho při každém POST pošle jako hlavičku `Authorization: <token>`.
//   - My ho porovnáme se FAKTUROID_WEBHOOK_SECRET (Vercel env). Žádný HMAC.
//
// Setup:
//   1. Vygeneruj random token: `openssl rand -hex 32`
//   2. Fakturoid → Webhooky → klikni na náš webhook → Upravit → vlož do pole "Autorizace"
//   3. Vercel env FAKTUROID_WEBHOOK_SECRET = <stejný token>
//   4. Redeploy

import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { sendOrderPaidNotification } from "@/lib/email";

const WEBHOOK_SECRET = process.env.FAKTUROID_WEBHOOK_SECRET;

interface FakturoidWebhookPayload {
  event: string;
  data?: {
    invoice?: {
      id: number;
      number: string;
      variable_symbol: string;
      status: string;
      paid_on: string | null;
      total: string;
      tags?: string[];
    };
  };
  // Některé verze posílají top-level invoice
  invoice?: {
    id: number;
    number: string;
    variable_symbol: string;
    status: string;
    paid_on: string | null;
    total: string;
    tags?: string[];
  };
}

function verifyAuthHeader(headerValue: string | null): boolean {
  if (!WEBHOOK_SECRET || !headerValue) return false;
  try {
    const a = Buffer.from(headerValue);
    const b = Buffer.from(WEBHOOK_SECRET);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  if (!WEBHOOK_SECRET) {
    console.error("[fakturoid/webhook] FAKTUROID_WEBHOOK_SECRET není nastaven");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const rawBody = await req.text();

  // Fakturoid v3: token z pole "Autorizace" letí jako hlavička Authorization
  const authHeader = req.headers.get("authorization");
  if (!verifyAuthHeader(authHeader)) {
    console.warn("[fakturoid/webhook] invalid authorization header");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: FakturoidWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as FakturoidWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const event = payload.event;
  const invoice = payload.data?.invoice || payload.invoice;

  console.log(`[fakturoid/webhook] event=${event} invoice=${invoice?.number || "?"}`);

  if (event !== "invoice_paid" || !invoice) {
    return NextResponse.json({ ok: true, ignored: `event=${event}` });
  }

  const orderId = invoice.variable_symbol;
  if (!orderId) {
    console.warn(`[fakturoid/webhook] invoice ${invoice.number} bez variable_symbol`);
    return NextResponse.json({ ok: true, ignored: "no VS" });
  }

  if (!isSupabaseConfigured()) {
    console.warn("[fakturoid/webhook] Supabase not configured — cannot update order");
    return NextResponse.json({ ok: true, ignored: "no db" });
  }

  try {
    const sb = getSupabase();

    // Update order → paid (idempotentní: pokud už paid, žádný side-effect)
    const { data: existing } = await sb
      .from("orders")
      .select("id, status, name, email, total")
      .eq("id", orderId)
      .maybeSingle();

    if (!existing) {
      console.warn(`[fakturoid/webhook] order ${orderId} not found`);
      return NextResponse.json({ ok: true, ignored: "order not found" });
    }

    if (existing.status === "paid") {
      console.log(`[fakturoid/webhook] order ${orderId} already paid — no-op`);
      // Pořád update cache (pro paid_on z Fakturoidu)
    } else {
      await sb
        .from("orders")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      console.log(`[fakturoid/webhook] order ${orderId} → paid (auto)`);

      // Fire-and-forget notif pro adminstrátora + klienta
      sendOrderPaidNotification({
        orderId,
        customerName: existing.name,
        customerEmail: existing.email,
        total: existing.total,
        invoiceNumber: invoice.number,
      }).catch((e) =>
        console.warn(`[fakturoid/webhook] notification failed:`, e),
      );
    }

    // Update invoices cache
    await sb
      .from("invoices")
      .update({
        status: "paid",
        paid_on: invoice.paid_on || new Date().toISOString().slice(0, 10),
        raw_payload: invoice,
      })
      .eq("fakturoid_id", invoice.id);

    return NextResponse.json({ ok: true, orderId, status: "paid" });
  } catch (e) {
    console.error(`[fakturoid/webhook] DB update failed:`, e);
    // Vracíme 200 i při chybě, ať Fakturoid nepoušila retry-storm.
    // Logujeme — admin si problém vyřeší ručně.
    return NextResponse.json({ ok: true, error: "internal" });
  }
}

// Fakturoid může poslat HEAD/GET pro health check
export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: "Fakturoid webhook receiver",
    configured: Boolean(WEBHOOK_SECRET),
  });
}
