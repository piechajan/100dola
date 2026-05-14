// Fakturoid webhook receiver — HMAC-validated.
//
// Fakturoid pošle event při změně faktury (např. `invoice_paid` po sync s FIO bank).
// My matchneme podle variable_symbol = náš order.id a updatneme orders.status na "paid".
//
// Setup:
//   1. Admin vytvoří webhook přes /api/admin/fakturoid/setup-webhook (POST)
//   2. Endpoint vrátí `secret_key` — zkopírovat do Vercel env: FAKTUROID_WEBHOOK_SECRET
//   3. Redeploy
//
// Header signing: Fakturoid posílá `X-Fakturoid-Hmac-Sha256` (base64) — viz docs v3.

import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
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

function verifySignature(rawBody: string, signature: string | null): boolean {
  if (!WEBHOOK_SECRET || !signature) return false;
  try {
    const expected = createHmac("sha256", WEBHOOK_SECRET)
      .update(rawBody, "utf8")
      .digest("base64");
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
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

  // Fakturoid posílá HMAC-SHA256 podpis v hlavičce
  const sigHeader =
    req.headers.get("X-Fakturoid-Hmac-Sha256") ||
    req.headers.get("x-fakturoid-hmac-sha256") ||
    req.headers.get("X-Fakturoid-Signature");

  if (!verifySignature(rawBody, sigHeader)) {
    console.warn("[fakturoid/webhook] invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
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
