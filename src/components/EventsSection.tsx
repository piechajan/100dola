import Link from "next/link";
import { events as ALL_EVENTS, SPORT_COLORS } from "@/data/events";
import { fetchUpcomingClubEvents, isStravaConfigured } from "@/lib/strava";
import { mapStravaEventToNormalized } from "@/lib/strava-mapping";

interface HomeEvent {
  id: number | string;
  title: string;
  type: string;
  date: string;
  dateISO: string;
  time: string;
  location: string;
  distance: string;
  elevation: string;
  capacity: number;
  filled: number;
  color: string;
  href: string;
  isStrava?: boolean;
  stravaUrl?: string;
  externalUrl?: string;
  externalCtaLabel?: string;
}

const COMMUNITY = "#2EAA6E";
const MALAGA = "#E8431A";

function malagaColored(sport: string): string {
  if (sport === "Malaga") return MALAGA;
  return SPORT_COLORS[sport as keyof typeof SPORT_COLORS] || COMMUNITY;
}

/**
 * Sloučí manuální events z events.ts s živými Strava OMC group events,
 * filtruje jen nadcházející, seřadí podle data a vrátí prvních 3.
 */
async function getUpcoming(): Promise<HomeEvent[]> {
  const today = new Date().toISOString().slice(0, 10);

  // 1) Manuální events
  const manual: HomeEvent[] = ALL_EVENTS
    .filter((e) => !e.isPast && e.dateISO >= today)
    .map((e) => ({
      id: e.id,
      title: e.title,
      type: e.sport === "Malaga" ? "Cyklistika · Malaga" : e.sport,
      date: e.date,
      dateISO: e.dateISO,
      time: e.time,
      location: e.location,
      distance: e.distance,
      elevation: e.elevation,
      capacity: e.capacity,
      filled: e.filled,
      color: malagaColored(e.sport),
      href: e.externalUrl || `/community/event/${e.slug}`,
      externalUrl: e.externalUrl,
    }));

  // 2) Strava OMC events (live)
  let strava: HomeEvent[] = [];
  if (isStravaConfigured()) {
    try {
      const stravaEvents = await fetchUpcomingClubEvents();
      strava = stravaEvents
        .map(mapStravaEventToNormalized)
        .filter((e) => e.dateISO.slice(0, 10) >= today)
        .map((e) => ({
          id: `strava-${e.id}`,
          title: e.title,
          type: e.sport,
          date: e.date,
          dateISO: e.dateISO,
          time: e.time,
          location: e.location,
          distance: e.distance || "—",
          elevation: e.elevation || "—",
          capacity: 0,
          filled: 0,
          color: COMMUNITY,
          href: e.stravaUrl || "/community",
          isStrava: true,
          stravaUrl: e.stravaUrl,
        }));
    } catch (err) {
      console.warn("[EventsSection] Strava fetch failed:", err);
    }
  }

  // Sloučit, dedupe (manuální má přednost při shodě slugu / title), seřadit
  const seen = new Set(manual.map((m) => m.title.toLowerCase().trim()));
  const merged = [
    ...manual,
    ...strava.filter((s) => !seen.has(s.title.toLowerCase().trim())),
  ].sort((a, b) => a.dateISO.localeCompare(b.dateISO));

  // Vždy pin Malaga eventy (Podzimní Malaga I / II) — chceme je v nejviditelnější
  // sekci homepage, i když jsou v budoucnu daleko.
  const malagaEvents = merged.filter((e) => e.type.includes("Malaga"));
  const nonMalaga = merged.filter((e) => !e.type.includes("Malaga"));

  // Top 2 nejbližší non-Malaga + první Malaga = 3 karty
  const out: HomeEvent[] = [...nonMalaga.slice(0, 2)];
  if (malagaEvents[0]) out.push(malagaEvents[0]);

  // Pokud Malaga není (např. všechny už proběhly), doplň 3. non-Malaga
  while (out.length < 3 && nonMalaga[out.length - (malagaEvents[0] ? 1 : 0)]) {
    out.push(nonMalaga[out.length - (malagaEvents[0] ? 1 : 0)]);
  }

  return out.slice(0, 3);
}

export default async function EventsSection() {
  const events = await getUpcoming();
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-5 h-px" style={{ backgroundColor: "var(--community-color)" }} />
              <span className="text-xs tracking-[0.18em] uppercase font-semibold" style={{ color: "var(--community-color)" }}>
                Open Miles Clinic
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-[#111111]">
              Nadcházející eventy
            </h2>
            <p className="mt-2 text-sm text-[#666666]">
              Jedeme spolu. Přidej se.
            </p>
          </div>
          <Link
            href="/community"
            className="inline-flex items-center gap-2 text-sm font-semibold transition-colors shrink-0"
            style={{ color: "var(--community-color)" }}
          >
            Všechny eventy
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Event cards */}
        {events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="bg-[#F7F9FF] rounded-2xl p-8 text-center text-sm text-[#5A6480]">
            Žádné nadcházející akce. Sleduj nás na Instagramu nebo se přihlas k odběru novinek.
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-12 flex flex-col sm:flex-row items-center gap-4 p-6 rounded-2xl bg-[#F4F4F4]">
          <div className="flex-1">
            <div className="font-bold text-[#111111]">Nechceš přijít o nový event?</div>
            <div className="text-sm text-[#666666] mt-0.5">Přihlásíme tě k odběru a budeš první vědět.</div>
          </div>
          <Link
            href="/community#newsletter"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-full shrink-0 transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--community-color)" }}
          >
            Přihlásit se k odběru
          </Link>
        </div>
      </div>
    </section>
  );
}

function EventCard({ event }: { event: HomeEvent }) {
  const { title, type, date, time, location, distance, elevation, capacity, filled, color, href, isStrava } = event;
  const hasCapacity = capacity > 0;
  const fillPct = hasCapacity ? (filled / capacity) * 100 : 0;
  const spotsLeft = capacity - filled;

  const body = (
    <>
      <div className="h-1 w-full" style={{ backgroundColor: color }} />
      <div className="p-5 flex flex-col flex-1">
        <div
          className="inline-flex self-start text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full mb-3 items-center gap-1.5"
          style={{ backgroundColor: `${color}15`, color }}
        >
          {isStrava && (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" /></svg>
          )}
          {type}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#9A9A9A] mb-2">
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          {date}{time && time !== "—" ? ` · ${time}` : ""}
        </div>
        <h3 className="text-lg font-black text-[#111111] leading-tight mb-2">{title}</h3>
        <div className="flex items-center gap-1.5 text-xs text-[#666666] mb-4">
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {location}
        </div>
        <div className="flex gap-4 text-xs mb-auto">
          <div>
            <div className="font-black text-[#111111]">{distance}</div>
            <div className="text-[#9A9A9A]">vzdálenost</div>
          </div>
          {elevation && elevation !== "—" && (
            <div>
              <div className="font-black text-[#111111]">{elevation}</div>
              <div className="text-[#9A9A9A]">převýšení</div>
            </div>
          )}
        </div>
        {hasCapacity && (
          <div className="mt-5 pt-4 border-t border-[#F4F4F4]">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-[#666666]">{filled} / {capacity} míst obsazeno</span>
              <span className="font-semibold" style={{ color }}>{spotsLeft} zbývá</span>
            </div>
            <div className="h-1 bg-[#F4F4F4] rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-300" style={{ width: `${fillPct}%`, backgroundColor: color }} />
            </div>
          </div>
        )}
        <div
          className="mt-4 w-full py-2.5 text-sm font-bold rounded-xl text-white text-center transition-opacity hover:opacity-90"
          style={{ backgroundColor: isStrava ? "#FC4C02" : color }}
        >
          {isStrava ? "Detail na Stravě" : event.externalCtaLabel || "Přihlásit se"}
        </div>
      </div>
    </>
  );

  if (isStrava) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex flex-col bg-white rounded-2xl border border-[#E8E8E8] overflow-hidden hover:border-[#111111]/20 hover:shadow-lg transition-all duration-200"
      >
        {body}
      </a>
    );
  }

  return (
    <Link
      href={href}
      className="group flex flex-col bg-white rounded-2xl border border-[#E8E8E8] overflow-hidden hover:border-[#111111]/20 hover:shadow-lg transition-all duration-200"
    >
      {body}
    </Link>
  );
}
