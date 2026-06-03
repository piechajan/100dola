// Polling fallback pro auto-detekci platby.
//
// Spouští se každých 15 minut z Vercel Cron (viz vercel.json).
// Tahá z Fakturoidu paid faktury za posledních 7 dní, matchuje VS → order,
// updatuje status orderu na "paid" pokud je pending. Idempotentní.
//
// Účel: pojistka pro případ, kdy webhook `invoice_paid` z Fakturoidu
// nedoletí (např. neemit pro určité typy mark-paid akcí).

import { NextRequest, NextResponse } from "next/server";
import { logCronRun } from "@/lib/cron-monitor";
import { listInvoices, isFakturoidConfigured } from "@/lib/fakturoid";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { sendOrderPaidNotification } from "@/lib/email";

const CRON_SECRET = process.env.CRON_SECRET;

interface SyncStats {
  invoicesScanned: number;
  ordersMatched: number;
  ordersUpdated: number;
  ordersAlreadyPaid: number;
  ordersNotFound: number;
  errors: string[];
}

async function syncPaidInvoices(): Promise<SyncStats> {
  const stats: SyncStats = {
    invoicesScanned: 0,
    ordersMatched: 0,
    ordersUpdated: 0,
    ordersAlreadyPaid: 0,
    ordersNotFound: 0,
    errors: [],
  };

  if (!isFakturoidConfigured() || !isSupabaseConfigured()) {
    stats.errors.push("Fakturoid nebo Supabase není nakonfigurovaný");
    return stats;
  }

  // Tahat paid faktury z posledních 7 dní (s rezervou — webhook + cron = double safety)
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  let invoices;
  try {
    invoices = await listInvoices({ status: "paid", since, maxPages: 10 });
  } catch (e) {
    stats.errors.push(`listInvoices failed: ${e instanceof Error ? e.message : "unknown"}`);
    return stats;
  }

  stats.invoicesScanned = invoices.length;
  const sb = getSupabase();

  for (const inv of invoices) {
    const orderId = inv.variable_symbol;
    if (!orderId) continue;

    try {
      // Najít order s tímto ID
      const { data: order } = await sb
        .from("orders")
        .select("id, status, name, email, total")
        .eq("id", orderId)
        .maybeSingle();

      if (!order) {
        stats.ordersNotFound++;
        continue;
      }

      stats.ordersMatched++;

      if (order.status === "paid") {
        stats.ordersAlreadyPaid++;
        continue;
      }

      // Update order → paid
      await sb
        .from("orders")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      // Update invoices cache
      await sb
        .from("invoices")
        .update({
          status: "paid",
          paid_on: inv.paid_on || new Date().toISOString().slice(0, 10),
          raw_payload: inv,
        })
        .eq("fakturoid_id", inv.id);

      // Notify
      sendOrderPaidNotification({
        orderId,
        customerName: order.name,
        customerEmail: order.email,
        total: order.total,
        invoiceNumber: inv.number,
      }).catch((e) =>
        console.warn(`[cron/sync-paid] notify failed for ${orderId}:`, e),
      );

      stats.ordersUpdated++;
      console.log(`[cron/sync-paid] order ${orderId} → paid (via polling)`);
    } catch (e) {
      stats.errors.push(`${orderId}: ${e instanceof Error ? e.message : "unknown"}`);
    }
  }

  return stats;
}

export async function GET(req: NextRequest) {
  // Vercel Cron posílá hlavičku Authorization: Bearer <CRON_SECRET>
  // Plus podpora ručního spuštění z admina (cookie preview_auth)
  const authHeader = req.headers.get("authorization");
  const isCron = CRON_SECRET && authHeader === `Bearer ${CRON_SECRET}`;
  const adminCookie = req.cookies.get("preview_auth");
  const isAdmin = adminCookie?.value === "100dola2025";

  if (!isCron && !isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Pouze logujeme reálné cron runs, ne ad-hoc admin spuštění (nepleť stats)
  if (!isCron) {
    const startedAt = new Date().toISOString();
    const stats = await syncPaidInvoices();
    const finishedAt = new Date().toISOString();
    return NextResponse.json({ ok: true, startedAt, finishedAt, triggeredBy: "admin", stats });
  }

  return logCronRun("sync-paid-invoices", "0 6 * * *", async () => {
    const startedAt = new Date().toISOString();
    const stats = await syncPaidInvoices();
    const finishedAt = new Date().toISOString();
    console.log(
      `[cron/sync-paid] ${stats.invoicesScanned} invoices scanned, ${stats.ordersUpdated} orders updated`,
    );
    return NextResponse.json({
      ok: true,
      startedAt,
      finishedAt,
      triggeredBy: "cron",
      stats,
    });
  });
}
