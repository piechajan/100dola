import { NextRequest, NextResponse } from "next/server";
import { getSupabase, isSupabaseConfigured, type EventSignupRow } from "@/lib/supabase";
import { events } from "@/data/events";
import { stayLabel, formatNights } from "@/data/events-signup";
import {
  sendEventReminder,
  sendMalagaSignupReminder,
  type EventSignupEmailPayload,
  type MalagaSignupEmailPayload,
} from "@/lib/email";
import { logCronRun } from "@/lib/cron-monitor";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

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

  return logCronRun("event-reminders", "0 15 * * *", async () => {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "DB nedostupná" }, { status: 503 });
    }

    const today = pragueToday();
    // Okno „~2 dny předem" se slackem (dnes+1 … dnes+3), ať i vynechaný běh doběhne.
    const window = new Set([1, 2, 3].map((n) => addDaysISO(today, n)));

    const dueEvents = events.filter(
      (e) => (e.groupSignup || e.malagaSignup) && window.has(e.dateISO) && !e.isPast,
    );
    if (dueEvents.length === 0) {
      return NextResponse.json({ ok: true, reminded: 0, note: "žádná akce v okně" });
    }

    const sb = getSupabase();
    let reminded = 0;

    for (const ev of dueEvents) {
      const { data: rows, error } = await sb
        .from("event_signups")
        .select(
          "id, signup_kind, lead_name, lead_email, party_size, stay_type, nights_from, nights_to",
        )
        .eq("event_slug", ev.slug)
        .is("reminder_sent_at", null)
        .neq("status", "cancelled");

      if (error) {
        console.error("[event-reminders] query failed:", error);
        continue;
      }

      for (const r of (rows ?? []) as Partial<EventSignupRow>[]) {
        if (!r.id || !r.lead_email || !r.lead_name) continue;

        if (r.signup_kind === "malaga") {
          const payload: MalagaSignupEmailPayload = {
            eventTitle: ev.title,
            eventDate: ev.date,
            eventLocation: ev.location,
            leadName: r.lead_name,
            leadEmail: r.lead_email,
            leadPhone: "",
            partySize: r.party_size ?? 1,
            members: [],
            summary: [],
            subjectTag: "",
          };
          await sendMalagaSignupReminder(payload);
        } else {
          if (!r.stay_type) continue;
          const isPension = r.stay_type === "pension";
          const payload: EventSignupEmailPayload = {
            eventTitle: ev.title,
            eventDate: ev.date,
            eventLocation: ev.location,
            venue: ev.signupVenue || "naše základna",
            leadName: r.lead_name,
            leadEmail: r.lead_email,
            leadPhone: "",
            partySize: r.party_size ?? 1,
            members: [],
            stayLabel: stayLabel(r.stay_type),
            nights: isPension ? formatNights(r.nights_from, r.nights_to) : undefined,
          };
          await sendEventReminder(payload);
        }

        await sb
          .from("event_signups")
          .update({ reminder_sent_at: new Date().toISOString() })
          .eq("id", r.id);
        reminded += 1;
      }
    }

    return NextResponse.json({ ok: true, reminded, events: dueEvents.map((e) => e.slug) });
  });
}
