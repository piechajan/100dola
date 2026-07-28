// Mapping mezi Strava GroupEvent a naším normalizovaným EventCard typem.
// Drží přehled, jak konkrétní activity_type Stravy mapujeme na naše Sport hodnoty.

import type { StravaGroupEvent, StravaActivityType } from "./strava";

export interface NormalizedEvent {
  id: number;
  slug: string;
  title: string;
  sport: string;
  date: string;       // formátované česky, např. "So 19. dubna"
  dateISO: string;    // ISO pro řazení
  time: string;       // "HH:MM"
  location: string;
  distance: string;   // "" pokud Strava neposkytuje
  elevation: string;  // ""
  difficulty: string;
  capacity: number;
  filled: number;
  description: string;
  photo: string;
  photoPosition?: string;
  source: "manual" | "strava";
  stravaUrl?: string;
}

const ACTIVITY_TO_SPORT: Record<string, string> = {
  Ride: "Silnice",
  GravelRide: "Gravel",
  MountainBikeRide: "MTB",
  EBikeRide: "Silnice",
  Run: "Běh",
  TrailRun: "Běh",
  Hike: "Turistika",
  BackcountrySki: "Skialpy",
  NordicSki: "Běžky",
  AlpineSki: "Skialpy",
};

const ACTIVITY_TO_PHOTO: Record<string, string> = {
  Ride: "/media/road-event.jpg",
  GravelRide: "/media/mtb-krivoklatsko.jpg",
  MountainBikeRide: "/media/mtb-krivoklatsko.jpg",
  EBikeRide: "/media/road-event.jpg",
  Run: "/media/road-event.jpg",
  TrailRun: "/media/road-event.jpg",
  Hike: "/media/krkonose-skialpy.jpg",
  BackcountrySki: "/media/krkonose-skialpy.jpg",
  NordicSki: "/media/krkonose-skialpy.jpg",
  AlpineSki: "/media/krkonose-skialpy.jpg",
};

function mapActivityToSport(t: StravaActivityType): string {
  return ACTIVITY_TO_SPORT[t] || "Silnice";
}

function mapActivityToPhoto(t: StravaActivityType): string {
  return ACTIVITY_TO_PHOTO[t] || "/media/road-event.jpg";
}

// Strava terrain: 1 = mostly flat, 2 = rolling hills, 3 = killer climbs
function mapTerrainToDifficulty(terrain: number): string {
  if (terrain >= 3) return "Náročná";
  if (terrain === 2) return "Střední";
  return "Lehká";
}

// ── Distance-based difficulty (sjednocené pravidlo) ──────────────────────────
// Pravidlo Jana (2026-05-08): Lehká ≤ 60 km, Střední ≤ 90 km, Náročná > 90 km.

export function difficultyFromDistanceKm(km: number | null | undefined): string {
  if (km === null || km === undefined) return "Lehká";
  if (km <= 60) return "Lehká";
  if (km <= 90) return "Střední";
  return "Náročná";
}

// Parse "60-70km", "60–70 km", "68,5 km", "72.5km" etc. Vrací upper bound.
export function parseDistanceKm(text: string | null | undefined): number | null {
  if (!text) return null;
  // Range: 60-70, 60–70, 60—70 + km
  const range = text.match(/(\d+(?:[.,]\d+)?)\s*[-–—]\s*(\d+(?:[.,]\d+)?)\s*km/i);
  if (range) return parseFloat(range[2].replace(",", "."));
  // Single: 72,5 km / 72.5km / 72 km
  const single = text.match(/(\d+(?:[.,]\d+)?)\s*km/i);
  if (single) return parseFloat(single[1].replace(",", "."));
  return null;
}

// Hezký label "~72 km" nebo "~70 km" pro UI.
export function formatDistanceLabel(km: number | null): string {
  if (km === null) return "";
  // pokud má desetinné místo, ukážeme
  return Number.isInteger(km) ? `~${km} km` : `~${km.toFixed(1).replace(".", ",")} km`;
}

// Stabilní 32-bit hash pro převod string ID na číselné ID v UIEvent.
// 100_000+ = namespace nad ručními eventy (které začínají od 0).
function hashStringToInt(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h) + 100_000;
}

// Strava times jsou v ISO UTC. Formátujeme do Europe/Prague,
// ať na Vercel produkci (UTC server) ukazujeme CET/CEST stejně jako na dev.
const CZ_TZ = "Europe/Prague";

function formatCzechDate(iso: string): string {
  const d = new Date(iso);
  // Použijeme Intl s europe/prague pro získání správného dne a měsíce
  const parts = new Intl.DateTimeFormat("cs-CZ", {
    timeZone: CZ_TZ,
    weekday: "short",
    day: "numeric",
    month: "long",
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value || "";
  // weekday např. "so", "ne" — kapitalizujeme
  const wd = get("weekday").replace(/^./, (c) => c.toUpperCase()).replace(/\.$/, "");
  return `${wd} ${get("day")}. ${get("month")}`;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("cs-CZ", {
    timeZone: CZ_TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}

// Ruční override pro konkrétní Strava eventy, kde jejich data nestačí
// (Strava nedává difficulty; km se nedají vždy vyparsovat). Klíč = přesný název.
const EVENT_OVERRIDES: Record<string, { difficulty?: string; photo?: string; photoPosition?: string }> = {
  "Pustevny, Czech Cycling Tour": { difficulty: "Střední", photo: "/media/pustevny-climb-ride.webp", photoPosition: "center 95%" },
};

export function mapStravaEventToNormalized(ev: StravaGroupEvent): NormalizedEvent {
  const firstOccurrence = ev.upcoming_occurrences[0];
  const sport = mapActivityToSport(ev.activity_type);
  const override = EVENT_OVERRIDES[ev.title];
  const photo = override?.photo ?? mapActivityToPhoto(ev.activity_type);

  // Distance: pokusíme parsovat z description (Strava nedává programaticky).
  // Difficulty: distance-driven podle Jan-pravidla, fallback terrain.
  const km = parseDistanceKm(ev.description);
  const distanceLabel = formatDistanceLabel(km);
  const difficulty =
    km !== null
      ? difficultyFromDistanceKm(km)
      : mapTerrainToDifficulty(ev.terrain ?? 0);

  return {
    // String IDs ze Stravy přesahují Number.MAX_SAFE_INTEGER → hashujeme
    // do 32-bit číselného prostoru s namespace 100_000+ pro odlišení od ručních.
    id: hashStringToInt(ev.id),
    slug: `strava-${ev.id}`,
    title: ev.title,
    sport,
    date: formatCzechDate(firstOccurrence),
    dateISO: firstOccurrence,
    time: formatTime(firstOccurrence),
    location: ev.address || "Místo na Stravě",
    distance: distanceLabel,
    elevation: "",
    difficulty: override?.difficulty ?? difficulty,
    photoPosition: override?.photoPosition,
    capacity: 0,
    filled: 0,
    description: ev.description || "Detail a registrace na Stravě.",
    photo,
    source: "strava",
    stravaUrl: `https://www.strava.com/clubs/${ev.club_id}/group_events/${ev.id}`,
  };
}
