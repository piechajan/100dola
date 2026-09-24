// Jeden zdroj pravdy pro seznam akcí na /community.
// Bere data z getPublishedEvents() (DB + static, cachované) a doplní kurátorské
// fotky/pozice + replacesStravaTitle (dedup se Stravou) přes override mapu podle slugu.
// Díky tomu /community i homepage čtou stejnou cachovanou funkci → žádný drift.

import { getPublishedEvents } from "@/lib/events-db";

export interface ListingEvent {
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
  routeUrl?: string;
  gpx?: string;
  dateISO?: string;
  isPast?: boolean;
  externalUrl?: string;
  externalCtaLabel?: string;
  replacesStravaTitle?: string;
}

// Kurátorské overrides pro karty na /community (foto, ořez, dedup se Stravou).
// Jen prezentace — data (datum, popis…) jdou z getPublishedEvents.
const OVERRIDES: Record<
  string,
  { photo?: string; photoPosition?: string; replacesStravaTitle?: string }
> = {
  "puchov-pain": { photo: "/media/puchov-pain.webp", photoPosition: "center 55%", replacesStravaTitle: "Púchov PAIN" },
  "thursday-easy-ride": { photo: "/media/thursday-easy-ride-2026.webp", photoPosition: "center 50%", replacesStravaTitle: "thursday EASY ride" },
  "rychlebske-stezky-2026": { photo: "/media/rychlebske-stezky-2026.webp", photoPosition: "center 65%" },
  "pustevny-climb-valmez": { photo: "/media/pustevny-climb-ride.webp", photoPosition: "center" },
  "lago-di-sance-valmez": { photo: "/media/lago-di-sance-ride.webp" },
  "kohutka-valmez": { photo: "/media/kohutka-ride.webp", photoPosition: "center 45%" },
  "saint-hostyn-valmez": { photo: "/media/road-event.jpg" },
  "season-opening": { photo: "/media/season-opening.jpg" },
  "trojak-tesak": { photo: "/media/road-event.jpg" },
  "malaga-fall-ride-1": { photo: "/media/malaga-event.jpg" },
  "malaga-fall-ride-2": { photo: "/media/malaga-event.jpg" },
  "pustevny-czech-cycling-tour": { photo: "/media/pustevny-climb-ride.webp", photoPosition: "center", replacesStravaTitle: "Pustevny, Czech Cycling Tour" },
  "dlouhe-strane-czech-cycling-tour": { photo: "/media/road-event.jpg", replacesStravaTitle: "Dlouhé stráně, Czech Cycling Tour" },
  "odry-2026": { photo: "/media/road-event.jpg" },
  "isaac-test-sternberk": { photo: "/media/sport-hero.jpg" },
  "mtb-semetin-trails": { photoPosition: "50% 30%" },
};

export async function getCommunityListingEvents(): Promise<ListingEvent[]> {
  const events = await getPublishedEvents();
  return events.map((e): ListingEvent => {
    const o = OVERRIDES[e.slug] ?? {};
    return {
      id: e.id,
      slug: e.slug,
      title: e.title,
      sport: e.sport,
      date: e.date,
      time: e.time,
      location: e.location,
      distance: e.distance,
      elevation: e.elevation,
      difficulty: e.difficulty,
      capacity: e.capacity,
      filled: e.filled,
      description: e.description,
      photo: o.photo ?? e.photo,
      photoPosition: o.photoPosition ?? e.photoPosition,
      routeUrl: e.routeUrl,
      gpx: e.gpxPath,
      stravaActivityUrl: e.stravaActivityUrl,
      dateISO: e.dateISO,
      isPast: e.isPast,
      externalUrl: e.externalUrl,
      externalCtaLabel: e.externalCtaLabel,
      replacesStravaTitle: o.replacesStravaTitle,
      source: "manual",
    };
  });
}
