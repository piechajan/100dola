import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { isAuthorizedCron } from "@/lib/cron-auth";
import { logCronRun } from "@/lib/cron-monitor";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { events as staticEvents } from "@/data/events";
import {
  fetchAthleteActivities,
  fetchClubGroupEvents,
  isStravaConfigured,
  type StravaAthleteActivity,
  type StravaGroupEvent,
} from "@/lib/strava";

// Denně doplní na web proběhlé akce z klubu Open Miles Clinic na Stravě, které na webu
// chybí (veřejný feed Strava jede jen nadcházející, takže akce, která proběhne mezi dvěma
// kontrolami, jinak zmizí). Km bere z popisu události (Mapy.com), převýšení z naší jízdy
// ve stejný den. Deduplikace: stejné datum v kódu nebo v DB = už na webu je.

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const LOOKBACK_DAYS = 45;
const WEEKDAYS = ["Ne", "Po", "Út", "St", "Čt", "Pá", "So"];
const MONTHS_GEN = [
  "ledna", "února", "března", "dubna", "května", "června",
  "července", "srpna", "září", "října", "listopadu", "prosince",
];

function pragueParts(d: Date) {
  const f = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Prague",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: false,
  });
  const p = Object.fromEntries(f.formatToParts(d).map((x) => [x.type, x.value]));
  const iso = `${p.year}-${p.month}-${p.day}`;
  const wd = new Date(`${iso}T12:00:00Z`).getUTCDay();
  return {
    iso,
    day: Number(p.day),
    month: Number(p.month),
    time: `${p.hour === "24" ? "00" : p.hour}:${p.minute}`,
    weekday: WEEKDAYS[wd],
  };
}

function stripEmoji(s: string): string {
  return s
    .replace(/[\p{Extended_Pictographic}\p{Regional_Indicator}\u{1F3FB}-\u{1F3FF}‍️]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function sportFor(type: string): "Silnice" | "MTB" | "Gravel" | null {
  if (type === "Ride" || type === "VirtualRide") return "Silnice";
  if (type === "MountainBikeRide") return "MTB";
  if (type === "GravelRide") return "Gravel";
  return null;
}

function difficultyFor(km: number | null): "Lehká" | "Střední" | "Náročná" {
  if (km == null || km < 70) return "Lehká";
  if (km <= 100) return "Střední";
  return "Náročná";
}

function cityFromAddress(address: string | null): string {
  if (!address) return "Valašské Meziříčí";
  const m = address.match(/\d{3}\s?\d{2}\s+(.+?)\s+(?:Česko|Czechia|Czech Republic)$/i);
  return (m?.[1] ?? address).trim();
}

function matchActivity(
  acts: StravaAthleteActivity[],
  iso: string,
  startMinutes: number,
  km: number | null,
): StravaAthleteActivity | null {
  const sameDay = acts.filter((a) => {
    if (a.start_date_local.slice(0, 10) !== iso) return false;
    if (!/Ride/.test(a.sport_type)) return false;
    const [h, m] = a.start_date_local.slice(11, 16).split(":").map(Number);
    if (Math.abs(h * 60 + m - startMinutes) > 120) return false;
    if (km != null) {
      const actKm = a.distance / 1000;
      if (Math.abs(actKm - km) / km > 0.2) return false;
    }
    return true;
  });
  return sameDay.sort((a, b) => b.distance - a.distance)[0] ?? null;
}

export async function GET(req: NextRequest) {
  if (!isAuthorizedCron(req.headers.get("authorization"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return logCronRun("strava-past-events", "0 7 * * *", async () => {
    if (!isStravaConfigured() || !isSupabaseConfigured()) {
      return NextResponse.json({ ok: false, reason: "Strava nebo DB není nakonfigurované" }, { status: 503 });
    }

    const now = Date.now();
    const since = now - LOOKBACK_DAYS * 86_400_000;
    const group: StravaGroupEvent[] = await fetchClubGroupEvents();

    const candidates = group
      .filter((e) => !e.private && sportFor(String(e.activity_type)))
      .map((e) => {
        const occ = (e.upcoming_occurrences ?? [])
          .map((o) => new Date(o))
          .filter((d) => !Number.isNaN(d.getTime()) && d.getTime() < now - 6 * 3_600_000 && d.getTime() >= since)
          .sort((a, b) => a.getTime() - b.getTime())[0];
        return occ ? { e, occ } : null;
      })
      .filter((x): x is { e: StravaGroupEvent; occ: Date } => x !== null);

    if (candidates.length === 0) {
      return NextResponse.json({ ok: true, created: [], skipped: [], note: "Žádná nová proběhlá akce." });
    }

    const sb = getSupabase();
    const { data: rows } = await sb.from("events").select("slug,date_iso");
    const existing = [
      ...(rows ?? []).map((r: { slug: string; date_iso: string }) => ({ slug: r.slug, iso: r.date_iso })),
      ...staticEvents.map((e) => ({ slug: e.slug, iso: e.dateISO })),
    ];
    const usedSlugs = new Set(existing.map((x) => x.slug));

    const oldest = Math.min(...candidates.map((c) => c.occ.getTime())) - 2 * 86_400_000;
    const acts = await fetchAthleteActivities({ after: Math.floor(oldest / 1000) });

    const created: string[] = [];
    const skipped: string[] = [];

    for (const { e, occ } of candidates) {
      const p = pragueParts(occ);
      if (existing.some((x) => x.iso === p.iso)) {
        skipped.push(`${p.iso} ${stripEmoji(e.title)} (datum už na webu je)`);
        continue;
      }

      const title = stripEmoji(e.title) || "Vyjížďka Open Miles Clinic";
      let slug = `${slugify(title)}-${p.iso.slice(0, 4)}`;
      if (usedSlugs.has(slug)) slug = `${slug}-${p.iso.slice(5)}`;
      usedSlugs.add(slug);

      const desc = e.description ?? "";
      const kmMatch = desc.match(/Trasa\s+([\d]+(?:[,.]\d+)?)\s*km/i);
      const routeKm = kmMatch ? Number.parseFloat(kmMatch[1].replace(",", ".")) : null;
      const routeUrl = desc.match(/https:\/\/mapy\.(?:com|cz)\/s\/[A-Za-z0-9]+/)?.[0] ?? null;
      const [hh, mm] = p.time.split(":").map(Number);
      const act = matchActivity(acts, p.iso, hh * 60 + mm, routeKm);

      const km = act ? Math.round(act.distance / 1000) : routeKm != null ? Math.round(routeKm) : null;
      const elevation = act ? `~${Math.round(act.total_elevation_gain)} m` : "—";

      const cleaned = desc
        .replace(/https?:\/\/\S+/g, "")
        .split("\n")
        .map((l) => stripEmoji(l))
        .filter(Boolean);
      const firstLine = cleaned.find((l) => !/^Trasa\b/i.test(l) && !/^Start\b/i.test(l)) ?? "";
      const description = (firstLine || `Vyjížďka Open Miles Clinic — ${title}.`).slice(0, 220);

      const { error } = await sb.from("events").insert({
        slug,
        title,
        sport: sportFor(String(e.activity_type)),
        date_label: `${p.weekday} ${p.day}. ${MONTHS_GEN[p.month - 1]}`,
        date_iso: p.iso,
        time_label: p.time,
        location: cityFromAddress(e.address),
        location_detail: cleaned.find((l) => /^Start\b/i.test(l)) ?? null,
        distance: km != null ? `${km} km` : "—",
        elevation,
        difficulty: difficultyFor(routeKm ?? km),
        capacity: 20,
        filled: 0,
        description,
        long_description: cleaned.join("\n\n") || null,
        what_to_bring: ["Silniční nebo gravel kolo", "Helma — povinná", "Voda a drobnou svačinu"],
        who_is_it_for: "Pro jezdce se základní kondicí. Tempo skupinové.",
        organizer_name: "Jan Piecha",
        organizer_role: "Zakladatel Open Miles Clinic",
        photo: "/media/road-event.jpg",
        photo_gallery: [],
        route_url: routeUrl,
        is_past: true,
        is_published: true,
      });
      if (error) {
        console.error("[strava-past-events] insert failed:", slug, error.message);
        skipped.push(`${p.iso} ${title} (chyba uložení)`);
        continue;
      }
      created.push(`${p.iso} ${title}`);
    }

    if (created.length > 0) revalidateTag("events", "max");
    return NextResponse.json({ ok: true, created, skipped });
  });
}
