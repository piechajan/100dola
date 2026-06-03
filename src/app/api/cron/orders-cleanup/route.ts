import { NextRequest, NextResponse } from "next/server";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { logCronRun } from "@/lib/cron-monitor";
import {
  sendOrderPaymentReminder,
  sendOrderPaymentReminderAdmin,
  sendOrderAutoCancelCustomer,
  sendOrderAutoCancelAdmin,
} from "@/lib/email";

// Splatnost a milestones (dní od registered_at)
const PAYMENT_DEADLINE_DAYS = 7;
const REMINDER_DAY = 2; // den, kdy posíláme připomínku

interface OrderRow {
  id: string;
  status: string;
  total: number;
  registered_at: string;
  reminder_sent_at: string | null;
  payment_method: string;
  iban: string | null;
  variable_symbol: string | null;
  qr_data_url: string | null;
  name: string;
  email: string;
}

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  // Vercel Cron job auth: header `Authorization: Bearer <CRON_SECRET>` pokud je nastavený
  const expected = process.env.CRON_SECRET;
  if (expected) {
    const got = req.headers.get("authorization");
    if (got !== `Bearer ${expected}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return logCronRun("orders-cleanup", "0 8 * * *", async () => {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "DB nedostupná" }, { status: 503 });
    }
    const sb = getSupabase();

  const now = Date.now();
  const reminderThreshold = new Date(now - REMINDER_DAY * 24 * 60 * 60 * 1000).toISOString();
  const cancelThreshold = new Date(now - PAYMENT_DEADLINE_DAYS * 24 * 60 * 60 * 1000).toISOString();

  // 1) Najdi orders k auto-cancel: status=pending, starší než 7 dní
  const { data: toCancel, error: cancelErr } = await sb
    .from("orders")
    .select("id, total, name, email, registered_at")
    .eq("status", "pending")
    .lte("registered_at", cancelThreshold);

  if (cancelErr) {
    console.error("[cron/orders-cleanup] cancel query failed:", cancelErr);
  }

  let cancelledCount = 0;
  for (const o of (toCancel || []) as Pick<OrderRow, "id" | "total" | "name" | "email" | "registered_at">[]) {
    const { error: updErr } = await sb
      .from("orders")
      .update({ status: "cancelled" })
      .eq("id", o.id)
      .eq("status", "pending"); // race-safe
    if (updErr) {
      console.error(`[cron/orders-cleanup] cancel ${o.id} failed:`, updErr);
      continue;
    }
    cancelledCount++;
    try {
      await Promise.allSettled([
        sendOrderAutoCancelCustomer({
          id: o.id,
          total: Number(o.total),
          contact: { name: o.name, email: o.email },
        }),
        sendOrderAutoCancelAdmin({
          id: o.id,
          total: Number(o.total),
          contact: { name: o.name, email: o.email },
        }),
      ]);
    } catch (e) {
      console.error(`[cron/orders-cleanup] cancel email ${o.id} failed:`, e);
    }
  }

  // 2) Najdi orders k reminder: status=pending, starší než 2 dny, mladší než 7 dní, ještě bez reminderu
  const { data: toRemind, error: remErr } = await sb
    .from("orders")
    .select(
      "id, total, name, email, registered_at, reminder_sent_at, iban, variable_symbol, qr_data_url",
    )
    .eq("status", "pending")
    .lte("registered_at", reminderThreshold)
    .gt("registered_at", cancelThreshold)
    .is("reminder_sent_at", null);

  if (remErr) {
    console.error("[cron/orders-cleanup] reminder query failed:", remErr);
  }

  let remindedCount = 0;
  for (const o of (toRemind || []) as OrderRow[]) {
    const registeredAtMs = new Date(o.registered_at).getTime();
    const daysOld = Math.floor((now - registeredAtMs) / (24 * 60 * 60 * 1000));
    const expiresInDays = Math.max(0, PAYMENT_DEADLINE_DAYS - daysOld);

    try {
      await Promise.allSettled([
        sendOrderPaymentReminder({
          id: o.id,
          total: Number(o.total),
          iban: o.iban || "",
          variableSymbol: o.variable_symbol || undefined,
          qrDataUrl: o.qr_data_url || undefined,
          contact: { name: o.name, email: o.email },
          daysOld,
          expiresInDays,
        }),
        sendOrderPaymentReminderAdmin({
          id: o.id,
          total: Number(o.total),
          iban: o.iban || "",
          contact: { name: o.name, email: o.email },
          daysOld,
          expiresInDays,
        }),
      ]);
      await sb
        .from("orders")
        .update({ reminder_sent_at: new Date().toISOString() })
        .eq("id", o.id);
      remindedCount++;
    } catch (e) {
      console.error(`[cron/orders-cleanup] reminder ${o.id} failed:`, e);
    }
  }

    return NextResponse.json({
      ok: true,
      cancelled: cancelledCount,
      reminded: remindedCount,
      ranAt: new Date().toISOString(),
    });
  });
}
