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

const CZECH_DAYS = ["Ne", "Po", "Út", "St", "Čt", "Pá", "So"];
const CZECH_MONTHS = [
  "ledna", "února", "března", "dubna", "května", "června",
  "července", "srpna", "září", "října", "listopadu", "prosince",
];

function formatCzechDate(iso: string): string {
  const d = new Date(iso);
  return `${CZECH_DAYS[d.getDay()]} ${d.getDate()}. ${CZECH_MONTHS[d.getMonth()]}`;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function mapStravaEventToNormalized(ev: StravaGroupEvent): NormalizedEvent {
  const firstOccurrence = ev.upcoming_occurrences[0];
  const sport = mapActivityToSport(ev.activity_type);
  const photo = mapActivityToPhoto(ev.activity_type);

  return {
    id: 100_000 + ev.id, // namespace nad ručními (které začínají od 0)
    slug: `strava-${ev.id}`,
    title: ev.title,
    sport,
    date: formatCzechDate(firstOccurrence),
    dateISO: firstOccurrence,
    time: formatTime(firstOccurrence),
    location: ev.address || "Místo na Stravě",
    distance: "",
    elevation: "",
    difficulty: mapTerrainToDifficulty(ev.terrain),
    capacity: 0,
    filled: 0,
    description: ev.description || "Detail a registrace na Stravě.",
    photo,
    source: "strava",
    stravaUrl: `https://www.strava.com/clubs/${ev.club_id}/group_events/${ev.id}`,
  };
}
