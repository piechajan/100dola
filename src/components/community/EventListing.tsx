"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { events as codeEvents } from "@/data/events";
import type { ListingEvent } from "@/lib/community-events";

// Sluggy eventů s reálným DB přihlašováním → na kartách používáme reálný počet
// z event_signups (ne naseedovaný `filled`).
const SIGNUP_SLUGS = new Set(
  codeEvents.filter((e) => e.groupSignup || e.malagaSignup).map((e) => e.slug),
);

// Karty berou data z jednoho zdroje (getCommunityListingEvents → getPublishedEvents).
type UIEvent = ListingEvent;

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

const FILTERS = ["Vše", "Silnice", "Gravel", "MTB", "Skialpy", "Běžky", "Turistika", "Malaga"];

export default function EventListing({ events }: { events: UIEvent[] }) {
  const [active, setActive] = useState("Vše");
  const [pastYear, setPastYear] = useState<string>("Vše");
  const [stravaEvents, setStravaEvents] = useState<UIEvent[]>([]);
  // Dnešní datum se dosadí až po mountu — SSR/první render použije jen ručně
  // nastavené isPast flagy (žádný hydration mismatch, žádné build-time zamrznutí).
  const [today, setToday] = useState<string | null>(null);
  const [realCounts, setRealCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    setToday(new Date().toISOString().slice(0, 10));
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/event-signups/counts")
      .then((r) => r.json())
      .then((d: { counts?: Record<string, number> }) => {
        if (!cancelled && d.counts) setRealCounts(d.counts);
      })
      .catch(() => { /* fallback: naseedované filled */ });
    return () => { cancelled = true; };
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
  // Normalizace názvu pro dedup: strip emoji/interpunkce, lowercase, jednotné mezery
  // → replacesStravaTitle „Púchov PAIN" spáruje i „Púchov PAIN 💪" ze Stravy.
  const normTitle = (t: string) =>
    t.replace(/[^\p{L}\p{N}\s]/gu, "").toLowerCase().trim().replace(/\s+/g, " ");
  const manualTitles = new Set(
    events.flatMap((e) =>
      [e.title, e.replacesStravaTitle].filter((t): t is string => Boolean(t)).map(normTitle),
    ),
  );
  const merged: UIEvent[] = [
    ...events,
    ...stravaEvents.filter(
      (e) => !manualSlugs.has(e.slug) && !manualTitles.has(normTitle(e.title)),
    ),
  ];

  // Odvození "proběhlo": ruční flag NEBO koncové datum už minulo.
  const isEventPast = (e: UIEvent): boolean =>
    e.isPast === true || (today != null && e.dateISO != null && e.dateISO < today);

  const normalized: UIEvent[] = merged.map((e) => ({
    ...e,
    isPast: isEventPast(e),
    // Reálný počet z DB pro signup-eventy (0 = 0, ne naseedovaný fake).
    filled: SIGNUP_SLUGS.has(e.slug) ? (realCounts[e.slug] ?? 0) : e.filled,
  }));

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

  // Year-filter historie — roky se odvozují automaticky z dat proběhlých akcí.
  // Jakmile se přehoupne rok, minulý ročník se objeví jako samostatný filtr.
  const pastYears = Array.from(
    new Set(past.map((e) => (e.dateISO ?? "").slice(0, 4)).filter(Boolean)),
  ).sort((a, b) => b.localeCompare(a));
  const activePastYear = pastYears.includes(pastYear) ? pastYear : "Vše";
  const pastFiltered =
    activePastYear === "Vše" ? past : past.filter((e) => (e.dateISO ?? "").startsWith(activePastYear));
  // Filtr ukážeme, jakmile katalog zasahuje víc roků (tj. po přelomu roku),
  // ne když je celá historie z jednoho roku.
  const allYears = new Set(
    [...upcoming, ...past].map((e) => (e.dateISO ?? "").slice(0, 4)).filter(Boolean),
  );
  const showYearFilter = pastYears.length >= 1 && allYears.size > 1;

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
            <p className="text-sm text-[#9AA3C2] mb-6 max-w-xl">
              Akce, které už máme za sebou. Kde jsme byli, co jsme jeli.
            </p>

            {/* Year-filter — objeví se automaticky, jakmile katalog zasahuje víc roků */}
            {showYearFilter && (
              <div className="flex flex-wrap gap-2 mb-10">
                {["Vše", ...pastYears].map((y) => {
                  const isActive = activePastYear === y;
                  return (
                    <button
                      key={y}
                      onClick={() => setPastYear(y)}
                      className="px-4 py-2 rounded-full text-sm font-semibold transition-all duration-150"
                      style={{
                        backgroundColor: isActive ? "#1a1a2e" : "#F0F2FA",
                        color: isActive ? "white" : "#5A6480",
                      }}
                    >
                      {y}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {pastFiltered.map((event) => (
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
          <div
            className="w-full py-2.5 text-sm font-bold rounded-xl text-white transition-all group-hover:shadow-lg flex items-center justify-center gap-2"
            style={{ backgroundColor: color, boxShadow: `0 2px 8px ${color}25` }}
          >
            Zobrazit detail
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
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

  // Route eventy (proběhlé OMC jízdy) — karta vede na detail; trasa + GPX žijí tam.
  if (hasRoute) {
    return (
      <Link href={`/community/event/${event.slug}`} className={cardClass}>
        {cardInner}
      </Link>
    );
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
