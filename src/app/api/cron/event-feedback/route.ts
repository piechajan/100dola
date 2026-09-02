import { NextRequest, NextResponse } from "next/server";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { events } from "@/data/events";
import { sendEventFeedbackRequest } from "@/lib/email";
import { logCronRun } from "@/lib/cron-monitor";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SITE = "https://www.100dola.com";

function pragueToday(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Prague",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function addDaysISO(iso: string, n: number): string {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export async function GET(req: NextRequest) {
  const expected = process.env.CRON_SECRET;
  if (expected) {
    const got = req.headers.get("authorization");
    if (got !== `Bearer ${expected}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return logCronRun("event-feedback", "0 16 * * *", async () => {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "DB nedostupná" }, { status: 503 });
    }

    const today = pragueToday();
    // ~7 dní po akci — okno (dnes-7 .. dnes-10) se slackem pro vícedenní akce a
    // vynechaný běh. dateISO = začátek; pro týdenní akce vyjde pár dní po konci.
    const window = new Set([7, 8, 9, 10].map((n) => addDaysISO(today, -n)));
    const dueEvents = events.filter((e) => window.has(e.dateISO));
    if (dueEvents.length === 0) {
      return NextResponse.json({ ok: true, sent: 0, note: "žádná akce v okně" });
    }

    const sb = getSupabase();
    let sent = 0;

    for (const ev of dueEvents) {
      const { data: rows, error } = await sb
        .from("event_signups")
        .select("id, lead_name, lead_email")
        .eq("event_slug", ev.slug)
        .is("feedback_sent_at", null)
        .neq("status", "cancelled");
      if (error) {
        console.error("[event-feedback] query failed:", error);
        continue;
      }

      for (const r of (rows ?? []) as { id: string; lead_name: string; lead_email: string }[]) {
        if (!r.id || !r.lead_email || !r.lead_name) continue;
        await sendEventFeedbackRequest({
          eventTitle: ev.title,
          eventDate: ev.date,
          eventLocation: ev.location,
          leadName: r.lead_name,
          leadEmail: r.lead_email,
          feedbackUrl: `${SITE}/community/event/${ev.slug}/zpetna-vazba?s=${r.id}`,
        });
        await sb
          .from("event_signups")
          .update({ feedback_sent_at: new Date().toISOString() })
          .eq("id", r.id);
        sent += 1;
      }
    }

    return NextResponse.json({ ok: true, sent, events: dueEvents.map((e) => e.slug) });
  });
}
