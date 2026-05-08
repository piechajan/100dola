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
    id: 0,
    slug: "season-opening",
    title: "Season Opening",
    sport: "Silnice",
    date: "So 19. dubna",
    time: "09:45",
    location: "Kavárna Chochino, Valašské Meziříčí",
    distance: "~40 km",
    elevation: "~400 m",
    difficulty: "Lehká",
    capacity: 20,
    filled: 6,
    description: "Otevíráme sezónu. Sraz u Chochina, 2–3 hodiny v pohodovém tempu. Vhodné pro všechny, kdo se těší zpátky na kolo.",
    photo: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80&fit=crop",
  },
  {
    id: 2,
    slug: "omc-wednesday-social",
    title: "Open Miles Clinic — Wednesday Social",
    sport: "Silnice",
    date: "St 30. dubna",
    time: "18:00",
    location: "Praha — start Prokopák",
    distance: "45 km",
    elevation: "420 m",
    difficulty: "Lehká",
    capacity: 20,
    filled: 11,
    description: "Pravidelná středeční večerní vyjížďka. Tempo klidné, nálada dobrá. Vhodné pro každého.",
    photo: "/media/road-event.jpg",
  },
  {
    id: 3,
    slug: "malaga-spring-ride",
    title: "Malaga Spring Ride",
    sport: "Malaga",
    date: "Po 12. května",
    time: "08:00",
    location: "Málaga, Španělsko",
    distance: "85 km",
    elevation: "1 200 m",
    difficulty: "Střední",
    capacity: 16,
    filled: 9,
    description: "Skupinová vyjížďka v Andalusii. Slunce, výhledy na moře a silnice bez aut.",
    photo: "/media/malaga-event.jpg",
  },
  {
    id: 4,
    slug: "krkonose-skialpy",
    title: "Krkonoše — skialpový den",
    sport: "Skialpy",
    date: "So 17. května",
    time: "06:00",
    location: "Špindlerův Mlýn",
    distance: "18 km",
    elevation: "1 100 m",
    difficulty: "Náročná",
    capacity: 12,
    filled: 7,
    description: "Pozdní jarní skialpinismus. Ideální podmínky, firn a prázdné hřebeny.",
    photo: "/media/krkonose-skialpy.jpg",
  },
  {
    id: 5,
    slug: "mtb-krivoklatsko",
    title: "MTB Křivoklátsko",
    sport: "MTB",
    date: "Ne 25. května",
    time: "09:00",
    location: "Křivoklát",
    distance: "55 km",
    elevation: "900 m",
    difficulty: "Střední",
    capacity: 18,
    filled: 4,
    description: "Technický MTB výjezd přes Křivoklátsko. Lesy, singletracky a dobré kafé na konci.",
    photo: "/media/mtb-krivoklatsko.jpg",
    photoPosition: "50% 30%",
  },
  {
    id: 6,
    slug: "omc-saturday-long",
    title: "Open Miles Clinic — Saturday Long Ride",
    sport: "Silnice",
    date: "So 7. června",
    time: "07:00",
    location: "Praha — Sázava — Praha",
    distance: "140 km",
    elevation: "1 600 m",
    difficulty: "Náročná",
    capacity: 20,
    filled: 12,
    description: "Dlouhá sobotní jízda přes Posázaví. Pro ty, co chtějí pořádné kilometry.",
    photo: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80&fit=crop",
  },
];

const FILTERS = ["Vše", "Silnice", "Gravel", "MTB", "Skialpy", "Běžky", "Turistika", "Malaga"];

export default function EventListing() {
  const [active, setActive] = useState("Vše");
  const [stravaEvents, setStravaEvents] = useState<UIEvent[]>([]);

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

  const filtered = active === "Vše" ? merged : merged.filter((e) => e.sport === active);

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

        {/* Event grid */}
        {filtered.length === 0 ? (
          <div className="py-20 text-center text-[#9AA3C2]">
            <div className="text-4xl mb-3">🤷</div>
            <div className="font-semibold">Zatím žádné akce v této kategorii.</div>
            <div className="text-sm mt-1">Zkus jinou nebo se přihlás k odběru novinek.</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}

        {/* Load more */}
        <div className="mt-12 text-center">
          <button className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-full border-2 border-[#E2E6F3] text-[#5A6480] hover:border-[#2EAA6E] hover:text-[#2EAA6E] transition-colors">
            Zobrazit více akcí
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}

function EventCard({ event }: { event: UIEvent }) {
  const color = SPORT_COLORS[event.sport] || "#2EAA6E";
  const icon = SPORT_ICONS[event.sport] || "🏃";
  const isStrava = event.source === "strava";
  const hasCapacity = event.capacity > 0;
  const fillPct = hasCapacity ? (event.filled / event.capacity) * 100 : 0;
  const spotsLeft = event.capacity - event.filled;
  const almostFull = hasCapacity && fillPct >= 75;

  // Wrapper props — Strava event jde externě, manuální interně
  const cardClass =
    "group flex flex-col bg-white rounded-2xl border border-[#E2E6F3] overflow-hidden hover:border-transparent hover:shadow-xl transition-all duration-300";

  const cardInner = (
    <>
      {/* Photo */}
      <div className="relative h-44 overflow-hidden bg-[#F0F2FA]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={event.photo}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          style={{ objectPosition: event.photoPosition ?? "center" }}
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
        {/* Right top: difficulty + Strava badge */}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-2">
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
            {hasCapacity && (
              <div className="ml-auto text-right">
                <div className="font-black" style={{ color: almostFull ? "#E8431A" : color }}>
                  {spotsLeft} míst
                </div>
                <div className="text-[#C0C7D8]">zbývá</div>
              </div>
            )}
          </div>
        )}

        {/* Capacity bar — jen manuální */}
        {!isStrava && hasCapacity && (
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
        {isStrava ? (
          <div
            className="w-full py-2.5 text-sm font-bold rounded-xl text-white transition-all group-hover:shadow-lg flex items-center justify-center gap-2"
            style={{ backgroundColor: "#FC4C02", boxShadow: "0 2px 8px #FC4C0240" }}
          >
            Detail na Stravě
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path d="M14 3h7v7M21 3 10 14M5 7v12a2 2 0 0 0 2 2h12" />
            </svg>
          </div>
        ) : (
          <button
            type="button"
            className="w-full py-2.5 text-sm font-bold rounded-xl text-white transition-all group-hover:shadow-lg"
            style={{ backgroundColor: color, boxShadow: `0 2px 8px ${color}25` }}
          >
            {hasCapacity && spotsLeft <= 0 ? "Čekací listina" : "Přihlásit se"}
          </button>
        )}
      </div>
    </>
  );

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

  return (
    <Link href={`/community/event/${event.slug}`} className={cardClass}>
      {cardInner}
    </Link>
  );
}
