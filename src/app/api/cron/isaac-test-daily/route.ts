import { NextRequest, NextResponse } from "next/server";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { ISAAC_DAYS } from "@/data/isaac-bikes";
import {
  sendIsaacDailySummary,
  sendIsaacEventReport,
} from "@/lib/email";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Časový rámec ISAAC eventu (29. 5. – 1. 6. 2026)
const EVENT_START_DATE = "2026-05-29"; // Pá
const EVENT_END_DATE = "2026-06-01"; // Po
const POST_EVENT_REPORT_DATE = "2026-06-02"; // Út

interface ReservationRow {
  id: number;
  bike_label: string;
  slot_start: string;
  slot_end: string;
  slot_day_label: string;
  full_name: string;
  email: string;
  phone: string;
  notes: string | null;
  status: string;
  subscribe_newsletter: boolean | null;
}

function dateInPragueTimezone(): string {
  // Vrátí YYYY-MM-DD v Europe/Prague timezone
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Prague",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export async function GET(req: NextRequest) {
  const expected = process.env.CRON_SECRET;
  if (expected) {
    const got = req.headers.get("authorization");
    if (got !== `Bearer ${expected}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "DB nedostupná" }, { status: 503 });
  }
  const sb = getSupabase();

  const today = dateInPragueTimezone();
  const ran: string[] = [];

  // ─── 1) Auto-complete: reservations po slot_end (s buffer 4h) co jsou stále "reserved" ───
  const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString();
  const { data: stale, error: staleErr } = await sb
    .from("isaac_test_reservations")
    .select("id, bike_label, full_name, slot_end")
    .eq("status", "reserved")
    .lt("slot_end", fourHoursAgo);

  if (staleErr) {
    console.error("[isaac-cron] auto-complete query failed:", staleErr);
  }
  let autoCompletedCount = 0;
  for (const r of (stale || []) as Pick<ReservationRow, "id">[]) {
    const { error } = await sb
      .from("isaac_test_reservations")
      .update({ status: "completed" })
      .eq("id", r.id)
      .eq("status", "reserved");
    if (!error) autoCompletedCount++;
  }
  if (autoCompletedCount > 0) ran.push(`auto-completed=${autoCompletedCount}`);

  // ─── 2) Daily summary — pokud je dnes den uvnitř event window ───
  if (today >= EVENT_START_DATE && today <= EVENT_END_DATE) {
    const dayStart = `${today}T00:00:00Z`;
    const dayEnd = `${today}T23:59:59Z`;
    const { data: todayRows } = await sb
      .from("isaac_test_reservations")
      .select(
        "id, bike_label, slot_start, slot_end, slot_day_label, full_name, email, phone, notes, status",
      )
      .gte("slot_start", dayStart)
      .lte("slot_start", dayEnd)
      .order("slot_start", { ascending: true });

    const todayLabel =
      ISAAC_DAYS.find((d) => d.date === today)?.label ?? today;
    const totalSlots = ISAAC_DAYS.find((d) => d.date === today)?.slots.length ?? 0;

    await sendIsaacDailySummary({
      dateLabel: todayLabel,
      rows: ((todayRows || []) as ReservationRow[]).map((r) => ({
        slotLabel: r.slot_day_label,
        slotStart: r.slot_start,
        bike: r.bike_label,
        fullName: r.full_name,
        email: r.email,
        phone: r.phone,
        notes: r.notes,
        status: r.status,
      })),
      totalSlots,
    });
    ran.push(`daily-summary=${todayLabel} (${(todayRows || []).length} rows)`);
  }

  // ─── 3) End-of-event report (jednou, den po skončení) ───
  if (today === POST_EVENT_REPORT_DATE) {
    const evtStart = `${EVENT_START_DATE}T00:00:00Z`;
    const evtEnd = `${EVENT_END_DATE}T23:59:59Z`;
    const { data: allRows } = await sb
      .from("isaac_test_reservations")
      .select(
        "id, bike_label, slot_start, status, email, subscribe_newsletter",
      )
      .gte("slot_start", evtStart)
      .lte("slot_start", evtEnd);

    const rows = (allRows || []) as Array<{
      bike_label: string;
      slot_start: string;
      status: string;
      email: string;
      subscribe_newsletter: boolean | null;
    }>;

    const totalReservations = rows.length;
    const totalCompleted = rows.filter((r) => r.status === "completed").length;
    const totalNoShow = rows.filter((r) => r.status === "no_show").length;
    const totalCancelled = rows.filter((r) => r.status === "cancelled").length;
    const uniqueEmails = new Set(rows.map((r) => r.email.toLowerCase())).size;
    const newsletterOptIns = rows.filter((r) => r.subscribe_newsletter).length;

    // Top 5 bikes
    const bikeCount: Record<string, number> = {};
    for (const r of rows) {
      if (r.status === "cancelled") continue;
      bikeCount[r.bike_label] = (bikeCount[r.bike_label] || 0) + 1;
    }
    const topBikes = Object.entries(bikeCount)
      .map(([bike, count]) => ({ bike, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // By day
    const byDay: Record<
      string,
      { reserved: number; completed: number; no_show: number; cancelled: number }
    > = {};
    for (const r of rows) {
      const date = r.slot_start.slice(0, 10);
      const dayLabel = ISAAC_DAYS.find((d) => d.date === date)?.label ?? date;
      if (!byDay[dayLabel]) byDay[dayLabel] = { reserved: 0, completed: 0, no_show: 0, cancelled: 0 };
      const status = r.status as "reserved" | "completed" | "no_show" | "cancelled";
      if (status in byDay[dayLabel]) byDay[dayLabel][status]++;
    }

    await sendIsaacEventReport({
      totalReservations,
      totalCompleted,
      totalNoShow,
      totalCancelled,
      uniqueEmails,
      newsletterOptIns,
      topBikes,
      byDay: Object.entries(byDay).map(([date, stats]) => ({
        date,
        ...stats,
      })),
    });
    ran.push(`event-report=${totalReservations} rezervací`);
  }

  return NextResponse.json({
    ok: true,
    today,
    ran,
    ranAt: new Date().toISOString(),
  });
}
