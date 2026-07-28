"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface UIEvent {
  id: number;
  slug: string;
  title: string;
  sport: string;
  date: string;
  time: string;
  location: string;
  distance: string;
  elevation: string;
  difficulty: string;
  capacity: number;
  filled: number;
  description: string;
  photo: string;
  photoPosition?: string;
  source?: "manual" | "strava";
  stravaUrl?: string;
  stravaActivityUrl?: string;
  /** Trasa vyjížďky — veřejný odkaz (Mapy.com / Strava) + GPX ke stažení. */
  routeUrl?: string;
  gpx?: string;
  /** Koncové datum akce (YYYY-MM-DD) — z něj se odvozuje isPast po uplynutí. */
  dateISO?: string;
  isPast?: boolean;
  externalUrl?: string;
  externalCtaLabel?: string;
}

const SPORT_COLORS: Record<string, string> = {
  Silnice: "#3B7CF4",
  Gravel: "#E8431A",
  MTB: "#2EAA6E",
  Skialpy: "#7C5CBF",
  Běžky: "#00A8CC",
  Turistika: "#8B6E52",
  Malaga: "#C4622D",
};

const SPORT_ICONS: Record<string, string> = {
  Silnice: "🚴",
  Gravel: "🚵",
  MTB: "⛰️",
  Skialpy: "🎿",
  Běžky: "⛷️",
  Turistika: "🥾",
  Malaga: "☀️",
};

const events: UIEvent[] = [
  {
    id: 40,
    slug: "pustevny-climb-valmez",
    dateISO: "2026-06-06",
    title: "Pustevny CLIMB",
    sport: "Silnice",
    date: "So 6. června",
    time: "10:00",
    location: "Valašské Meziříčí → Pustevny",
    distance: "72,5 km",
    elevation: "~610 m",
    difficulty: "Náročná",
    capacity: 20,
    filled: 13,
    description: "Od Chochina přes Pustevny (posezení Libušín) zpět do Valmezu. Beskydská klasika k Radhošti. Klubová jízda Open Miles Clinic.",
    photo: "/media/road-event.jpg",
    isPast: true,
    routeUrl: "https://mapy.com/s/magujozafe",
    gpx: "/routes/pustevny-climb-valmez.gpx",
  },
  {
    id: 41,
    slug: "lago-di-sance-valmez",
    dateISO: "2026-06-27",
    title: "Lago di Šance",
    sport: "Silnice",
    date: "So 27. června",
    time: "09:00",
    location: "Valašské Meziříčí → Beskydy (Šance)",
    distance: "100,6 km",
    elevation: "~645 m",
    difficulty: "Střední",
    capacity: 20,
    filled: 10,
    description: "Přes Bílou, okolo přehrady Šance na Čeladnou (kafe Maralák) a zpět. Dlouhý pohodový den po Beskydech.",
    photo: "/media/sport-hero.jpg",
    isPast: true,
    routeUrl: "https://mapy.com/s/penecaluju",
    gpx: "/routes/lago-di-sance-valmez.gpx",
  },
  {
    id: 42,
    slug: "kohutka-valmez",
    dateISO: "2026-07-18",
    title: "Kohútka",
    sport: "Silnice",
    date: "So 18. července",
    time: "10:00",
    location: "Valašské Meziříčí → Kohútka",
    distance: "104,8 km",
    elevation: "~1 017 m",
    difficulty: "Náročná",
    capacity: 0,
    filled: 0,
    description: "Výšlap na hraniční sedlo Kohútka v Javorníkách a zpět přes valašské kopce. Dlouhý den se vším všudy.",
    photo: "/media/season-opening.jpg",
    isPast: true,
    routeUrl: "https://www.strava.com/activities/19365390503",
    gpx: "/routes/kohutka-valmez.gpx",
  },
  {
    id: 0,
    slug: "season-opening",
    dateISO: "2026-04-19",
    title: "Season Opening",
    sport: "Silnice",
    date: "Ne 19. dubna",
    time: "09:45",
    location: "Kavárna Chochino, Valašské Meziříčí",
    distance: "63–68 km",
    elevation: "565–670 m",
    difficulty: "Střední",
    capacity: 20,
    filled: 13,
    description: "Otevírali jsme sezónu. Sraz u Chochina, dvě trasy na výběr (Cappuccino / Espresso), pohodové tempo a kafe nakonec.",
    photo: "/media/season-opening.jpg",
    isPast: true,
  },
  {
    id: 8,
    slug: "trojak-tesak",
    dateISO: "2026-05-02",
    title: "Troják — Tesák",
    sport: "Silnice",
    date: "So 2. května",
    time: "09:45",
    location: "Valašské Meziříčí — Hostýnské vrchy",
    distance: "~95 km",
    elevation: "~1 400 m",
    difficulty: "Náročná",
    capacity: 20,
    filled: 9,
    description: "Klasický okruh přes Troják a Tesák. Krásné stoupání hřebenovkou, sjezdy přes valašské kopečky. Klubová sobota Open Miles Clinic.",
    photo: "/media/road-event.jpg",
    isPast: true,
  },
  {
    id: 3,
    slug: "malaga-fall-ride-1",
    dateISO: "2026-10-29",
    title: "Malaga fall ride I",
    sport: "Malaga",
    date: "23.–29. října",
    time: "—",
    location: "Málaga, Španělsko",
    distance: "~80 km / den",
    elevation: "~1 000 m / den",
    difficulty: "Střední",
    capacity: 12,
    filled: 4,
    description: "Týdenní cyklistický pobyt v Malaze. Vlastní kolo, vlastní tempo. Říjen je v Andalusii nejlepší — teplo, prázdné silnice, barvy.",
    photo: "/media/malaga-event.jpg",
  },
  {
    id: 7,
    slug: "malaga-fall-ride-2",
    dateISO: "2026-11-06",
    title: "Malaga fall ride II",
    sport: "Malaga",
    date: "30. října – 6. listopadu",
    time: "—",
    location: "Málaga, Španělsko",
    distance: "~80 km / den",
    elevation: "~1 000 m / den",
    difficulty: "Střední",
    capacity: 12,
    filled: 2,
    description: "Druhý termín podzimního pobytu v Malaze. Stejný formát, jiná parta. Kolo čeká, ty jen přileť.",
    photo: "/media/malaga-event.jpg",
  },
  {
    id: 4,
    slug: "mala-fatra-skitour",
    dateISO: "2026-12-12",
    title: "Malá Fatra — skitour",
    sport: "Skialpy",
    date: "So 12. prosince",
    time: "06:00",
    location: "Malá Fatra, SK",
    distance: "18 km",
    elevation: "1 100 m",
    difficulty: "Náročná",
    capacity: 12,
    filled: 7,
    description: "Otevření skialpové sezóny v hřebenu Malé Fatry. První sníh, prázdné hřebeny, dlouhý den.",
    photo: "/media/krkonose-skialpy.jpg",
  },
  {
    id: 6,
    slug: "isaac-test-sternberk",
    dateISO: "2026-06-01",
    title: "Vyzkoušej ISAAC · Šternberk",
    sport: "Silnice",
    date: "Pá–Po 29. 5. – 1. 6.",
    time: "9:00",
    location: "Obchod 100dola sport, Šternberk",
    distance: "Showroom",
    elevation: "—",
    difficulty: "Lehká",
    capacity: 232,
    filled: 0,
    description: "Čtyři dny testovacích jízd ISAAC — 8 road a gravel modelů, hodinová zápůjčka zdarma. V neděli 31. 5. dojezd Závodu Míru přímo na náměstí.",
    photo: "/media/sport-hero.jpg",
    externalUrl: "/isaac-test",
    externalCtaLabel: "Rezervovat termín",
  },
  {
    id: 5,
    slug: "mtb-semetin-trails",
    dateISO: "2026-09-05",
    title: "MTB Semetín trails",
    sport: "MTB",
    date: "So 5. září",
    time: "16:00",
    location: "Semetín, Vsetín",
    distance: "40 km",
    elevation: "1 100 m",
    difficulty: "Střední",
    capacity: 18,
    filled: 4,
    description: "Singletracky v Semetínském údolí — jeden z nejlepších trail center na Valašsku. Po jízdě kafe v lese.",
    photo: "/media/mtb-krivoklatsko.jpg",
    photoPosition: "50% 30%",
  },
];

const FILTERS = ["Vše", "Silnice", "Gravel", "MTB", "Skialpy", "Běžky", "Turistika", "Malaga"];

export default function EventListing() {
  const [active, setActive] = useState("Vše");
  const [stravaEvents, setStravaEvents] = useState<UIEvent[]>([]);
  // Dnešní datum se dosadí až po mountu — SSR/první render použije jen ručně
  // nastavené isPast flagy (žádný hydration mismatch, žádné build-time zamrznutí).
  const [today, setToday] = useState<string | null>(null);

  useEffect(() => {
    setToday(new Date().toISOString().slice(0, 10));
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/strava/events")
      .then((r) => r.json())
      .then((data: { configured: boolean; events?: UIEvent[] }) => {
        if (cancelled) return;
        if (data.configured && Array.isArray(data.events)) {
          setStravaEvents(data.events);
        }
      })
      .catch(() => { /* fallback: jen ruční eventy */ });
    return () => { cancelled = true; };
  }, []);

  // Merge: ruční eventy první, Strava eventy za nimi.
  // Stejný slug se nesmí opakovat — manual má prioritu.
  const manualSlugs = new Set(events.map((e) => e.slug));
  const merged: UIEvent[] = [
    ...events,
    ...stravaEvents.filter((e) => !manualSlugs.has(e.slug)),
  ];

  // Odvození "proběhlo": ruční flag NEBO koncové datum už minulo.
  const isEventPast = (e: UIEvent): boolean =>
    e.isPast === true || (today != null && e.dateISO != null && e.dateISO < today);

  const normalized: UIEvent[] = merged.map((e) => ({ ...e, isPast: isEventPast(e) }));

  const byCategory =
    active === "Vše" ? normalized : normalized.filter((e) => e.sport === active);

  // Nadcházející první (od nejbližšího), proběhlé dolů (od naposledy proběhlého).
  // Proběhlé se pořád zobrazují, jen s fade (viz EventCard) — nezáří jako budoucí.
  const filtered = [...byCategory].sort((a, b) => {
    if (a.isPast !== b.isPast) return a.isPast ? 1 : -1;
    const ak = a.dateISO ?? "9999-12-31";
    const bk = b.dateISO ?? "9999-12-31";
    return a.isPast ? bk.localeCompare(ak) : ak.localeCompare(bk);
  });

  // Rozdělení do dvou sekcí: nadcházející nahoře, proběhlé (historie) dole.
  const upcoming = filtered.filter((e) => !e.isPast);
  const past = filtered.filter((e) => e.isPast);

  return (
    <section id="eventy" className="py-20 md:py-24 bg-white">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-5 h-px bg-[#2EAA6E]" />
              <span className="text-xs tracking-[0.18em] uppercase font-bold text-[#2EAA6E]">Nadcházející akce</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-[#1a1a2e]">Co se jede</h2>
          </div>

          {/* View toggle (placeholder) */}
          <div className="flex items-center gap-1 bg-[#F0F2FA] rounded-xl p-1">
            <button className="px-4 py-2 rounded-lg text-sm font-semibold bg-white text-[#1a1a2e] shadow-sm">
              Grid
            </button>
            <button className="px-4 py-2 rounded-lg text-sm font-semibold text-[#9AA3C2]">
              List
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap gap-2 mb-10">
          {FILTERS.map((f) => {
            const color = f === "Vše" ? "#2EAA6E" : SPORT_COLORS[f];
            const isActive = active === f;
            return (
              <button
                key={f}
                onClick={() => setActive(f)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-150"
                style={{
                  backgroundColor: isActive ? color : "#F0F2FA",
                  color: isActive ? "white" : "#5A6480",
                  boxShadow: isActive ? `0 4px 12px ${color}35` : undefined,
                }}
              >
                {f !== "Vše" && <span className="text-base leading-none">{SPORT_ICONS[f]}</span>}
                {f}
              </button>
            );
          })}
        </div>

        {/* Nadcházející akce */}
        {upcoming.length === 0 ? (
          <div className="py-16 text-center text-[#9AA3C2]">
            <div className="text-4xl mb-3">🤷</div>
            <div className="font-semibold">Žádné nadcházející akce v této kategorii.</div>
            <div className="text-sm mt-1">
              {past.length > 0
                ? "Mrkni na historii níže nebo se přihlas k odběru novinek."
                : "Zkus jinou kategorii nebo se přihlas k odběru novinek."}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {upcoming.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}

        {/* Proběhlo — historie akcí */}
        {past.length > 0 && (
          <div className="mt-16 pt-16 border-t border-[#E2E6F3]">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-5 h-px bg-[#9AA3C2]" />
              <span className="text-xs tracking-[0.18em] uppercase font-bold text-[#9AA3C2]">Historie</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-[#1a1a2e] mb-2">Proběhlo</h2>
            <p className="text-sm text-[#9AA3C2] mb-10 max-w-xl">
              Akce, které už máme za sebou. Kde jsme byli, co jsme jeli.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {past.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function EventCard({ event }: { event: UIEvent }) {
  const color = SPORT_COLORS[event.sport] || "#2EAA6E";
  const icon = SPORT_ICONS[event.sport] || "🏃";
  const isStrava = event.source === "strava";
  const isPast = event.isPast === true;
  const hasRoute = !!(event.routeUrl || event.gpx);
  const hasCapacity = event.capacity > 0;
  const fillPct = hasCapacity ? (event.filled / event.capacity) * 100 : 0;
  const spotsLeft = event.capacity - event.filled;
  const almostFull = hasCapacity && fillPct >= 75;

  // Wrapper props — Strava event jde externě, manuální interně
  const cardClass =
    `group flex flex-col bg-white rounded-2xl border border-[#E2E6F3] overflow-hidden transition-all duration-300 ${
      isPast
        ? "opacity-60 hover:opacity-100 hover:shadow-md"
        : "hover:border-transparent hover:shadow-xl"
    }`;

  const cardInner = (
    <>
      {/* Photo */}
      <div className="relative h-44 overflow-hidden bg-[#F0F2FA]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={event.photo}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          style={{
            objectPosition: event.photoPosition ?? "center",
            filter: isPast ? "grayscale(0.4)" : undefined,
          }}
        />
        {/* Sport badge */}
        <div className="absolute top-3 left-3">
          <span
            className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1.5 rounded-full backdrop-blur-sm"
            style={{ backgroundColor: `${color}dd`, color: "white" }}
          >
            <span>{icon}</span>
            {event.sport}
          </span>
        </div>
        {/* Right top: difficulty + Strava badge + Proběhlo */}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-2">
          {isPast && (
            <span className="text-[10px] font-black px-2.5 py-1.5 rounded-full bg-[#1a1a2e] text-white backdrop-blur-sm uppercase tracking-wider">
              Proběhlo
            </span>
          )}
          <span className="text-[10px] font-bold px-2.5 py-1.5 rounded-full bg-black/50 text-white backdrop-blur-sm">
            {event.difficulty}
          </span>
          {isStrava && (
            <span className="text-[10px] font-bold px-2.5 py-1.5 rounded-full bg-[#FC4C02] text-white backdrop-blur-sm">
              Strava
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        {/* Date + location */}
        <div className="flex items-center justify-between text-xs text-[#9AA3C2] mb-2">
          <span className="flex items-center gap-1">
            <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="3" y1="10" x2="21" y2="10" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
            </svg>
            {event.date} · {event.time}
          </span>
        </div>

        <h3 className="text-lg font-black text-[#1a1a2e] leading-tight mb-1">{event.title}</h3>

        <div className="flex items-center gap-1 text-xs text-[#9AA3C2] mb-3">
          <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {event.location}
        </div>

        <p className="text-xs text-[#9AA3C2] leading-relaxed mb-4 flex-1">{event.description}</p>

        {/* Stats row — pouze pro manuální eventy s daty */}
        {!isStrava && (event.distance || event.elevation || hasCapacity) && (
          <div className="flex gap-4 text-xs mb-4 pb-4 border-b border-[#F0F2FA]">
            {event.distance && (
              <div>
                <div className="font-black text-[#1a1a2e]">{event.distance}</div>
                <div className="text-[#C0C7D8]">vzdálenost</div>
              </div>
            )}
            {event.elevation && (
              <div>
                <div className="font-black text-[#1a1a2e]">{event.elevation}</div>
                <div className="text-[#C0C7D8]">převýšení</div>
              </div>
            )}
            {hasCapacity && !isPast && (
              <div className="ml-auto text-right">
                <div className="font-black" style={{ color: almostFull ? "#E8431A" : color }}>
                  {spotsLeft} míst
                </div>
                <div className="text-[#C0C7D8]">zbývá</div>
              </div>
            )}
            {hasCapacity && isPast && (
              <div className="ml-auto text-right">
                <div className="font-black text-[#1a1a2e]">{event.filled}</div>
                <div className="text-[#C0C7D8]">jezdců</div>
              </div>
            )}
          </div>
        )}

        {/* Capacity bar — jen manuální, jen future */}
        {!isStrava && !isPast && hasCapacity && (
          <div className="mb-4">
            <div className="h-1.5 bg-[#F0F2FA] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${fillPct}%`, backgroundColor: almostFull ? "#E8431A" : color }}
              />
            </div>
            <div className="text-[10px] text-[#C0C7D8] mt-1">{event.filled} / {event.capacity} registrací</div>
          </div>
        )}

        {/* CTA */}
        {hasRoute ? (
          <div className="flex gap-2">
            {event.routeUrl && (
              <a
                href={event.routeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 text-sm font-bold rounded-xl text-white text-center transition-all hover:shadow-md"
                style={{ backgroundColor: color }}
              >
                Zobrazit trasu
              </a>
            )}
            {event.gpx && (
              <a
                href={event.gpx}
                download
                className="flex-1 py-2.5 text-sm font-bold rounded-xl text-center border-2 transition-colors"
                style={{ borderColor: `${color}55`, color }}
              >
                GPX
              </a>
            )}
          </div>
        ) : isStrava ? (
          <div
            className="w-full py-2.5 text-sm font-bold rounded-xl text-white transition-all group-hover:shadow-lg flex items-center justify-center gap-2"
            style={{ backgroundColor: "#FC4C02", boxShadow: "0 2px 8px #FC4C0240" }}
          >
            Detail na Stravě
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path d="M14 3h7v7M21 3 10 14M5 7v12a2 2 0 0 0 2 2h12" />
            </svg>
          </div>
        ) : isPast ? (
          <div
            className="w-full py-2.5 text-sm font-bold rounded-xl transition-all group-hover:shadow-md flex items-center justify-center gap-2"
            style={{ backgroundColor: "#F0F2FA", color: "#5A6480" }}
          >
            Zobrazit shrnutí
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
        ) : (
          <button
            type="button"
            className="w-full py-2.5 text-sm font-bold rounded-xl text-white transition-all group-hover:shadow-lg"
            style={{ backgroundColor: color, boxShadow: `0 2px 8px ${color}25` }}
          >
            {event.externalCtaLabel
              ? event.externalCtaLabel
              : hasCapacity && spotsLeft <= 0
              ? "Čekací listina"
              : "Přihlásit se"}
          </button>
        )}
      </div>
    </>
  );

  // Route eventy (proběhlé OMC jízdy) — karta není odkaz, uvnitř jsou tlačítka trasa + GPX.
  if (hasRoute) {
    return <div className={cardClass}>{cardInner}</div>;
  }

  if (isStrava && event.stravaUrl) {
    return (
      <a
        href={event.stravaUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cardClass}
      >
        {cardInner}
      </a>
    );
  }

  if (event.externalUrl) {
    return (
      <Link href={event.externalUrl} className={cardClass}>
        {cardInner}
      </Link>
    );
  }

  return (
    <Link href={`/community/event/${event.slug}`} className={cardClass}>
      {cardInner}
    </Link>
  );
}
