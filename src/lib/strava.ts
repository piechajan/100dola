// Server-only Strava API client.
// Vyžaduje env vars: STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_REFRESH_TOKEN.
// Volitelně: STRAVA_CLUB_ID (default: 2070600 = Open Miles Clinic).
//
// OAuth setup: spusť `node scripts/strava-oauth.mjs` v adresáři web/.
// Refresh token rotation: Strava může vrátit nový refresh_token při refresh callu —
// pokud se to stane v produkci, musíš ručně updatnout STRAVA_REFRESH_TOKEN env.

import "server-only";

const CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.STRAVA_REFRESH_TOKEN;
const CLUB_ID = process.env.STRAVA_CLUB_ID || "2070600";

const TOKEN_URL = "https://www.strava.com/oauth/token";
const API_BASE = "https://www.strava.com/api/v3";

export type StravaActivityType =
  | "Ride"
  | "GravelRide"
  | "MountainBikeRide"
  | "EBikeRide"
  | "Run"
  | "TrailRun"
  | "Hike"
  | "BackcountrySki"
  | "NordicSki"
  | "AlpineSki"
  | string;

export interface StravaGroupEvent {
  // ID je 19místný integer ze Stravy, přesahuje Number.MAX_SAFE_INTEGER.
  // Drží se jako string (pre-processed při JSON parse, viz fetchClubGroupEvents).
  id: string;
  resource_state: number;
  title: string;
  description: string | null;
  club_id: number;
  organizing_athlete: {
    id: number;
    firstname: string;
    lastname: string;
  } | null;
  activity_type: StravaActivityType;
  created_at: string;
  route_id: number | null;
  woman_only: boolean;
  private: boolean;
  skill_levels: number;
  terrain: number;
  upcoming_occurrences: string[];
  address: string | null;
  start_latlng: [number, number] | null;
  joined: boolean;
}

interface CachedToken {
  token: string;
  expiresAtMs: number;
}

let cachedAccessToken: CachedToken | null = null;

export function isStravaConfigured(): boolean {
  return Boolean(CLIENT_ID && CLIENT_SECRET && REFRESH_TOKEN);
}

async function refreshAccessToken(): Promise<string> {
  if (!isStravaConfigured()) {
    throw new Error("Strava env vars missing — viz STRAVA_SETUP.md");
  }

  // Cache: vracíme uložený token, pokud má ještě 60+ s do expirace
  if (cachedAccessToken && cachedAccessToken.expiresAtMs > Date.now() + 60_000) {
    return cachedAccessToken.token;
  }

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: REFRESH_TOKEN,
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Strava token refresh failed: ${res.status} ${text}`);
  }

  const data = (await res.json()) as {
    access_token: string;
    refresh_token: string;
    expires_at: number;
  };

  cachedAccessToken = {
    token: data.access_token,
    expiresAtMs: data.expires_at * 1000,
  };

  // Strava občas vrací nový refresh token. Logujeme to do server console,
  // ať si Jan může ručně updatnout env var.
  if (data.refresh_token && data.refresh_token !== REFRESH_TOKEN) {
    console.warn(
      "[strava] Refresh token rotated. Update STRAVA_REFRESH_TOKEN env var to:",
      data.refresh_token,
    );
  }

  return data.access_token;
}

/**
 * Fetch group events for the configured club. Strava vrací VŠECHNY eventy
 * klubu (i minulé), filtrování na upcoming je až v `fetchUpcomingClubEvents`.
 *
 * Cache: 30 min (revalidate). Mimo cache se posílá dotaz na Strava.
 *
 * ⚠️ Strava IDs jsou 19místné a překračují Number.MAX_SAFE_INTEGER.
 * Před JSON.parse je obalíme do uvozovek, aby se zachovala přesnost.
 */
export async function fetchClubGroupEvents(): Promise<StravaGroupEvent[]> {
  const token = await refreshAccessToken();
  const res = await fetch(`${API_BASE}/clubs/${CLUB_ID}/group_events`, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 1800, tags: ["strava-events"] },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Strava group_events fetch failed: ${res.status} ${text}`);
  }

  const text = await res.text();
  // Najdi všechny "id": <12+ digit number> a obal je do uvozovek (string).
  // Pattern není greedy — drží se jen na "id" klíči, malé IDs (club, athlete)
  // se nedotkne (mají méně než 12 digits).
  const safe = text.replace(/"id"\s*:\s*(\d{12,})/g, '"id":"$1"');
  return JSON.parse(safe) as StravaGroupEvent[];
}

/**
 * Pouze nadcházející eventy (alespoň jeden upcoming_occurrence v budoucnosti),
 * setříděné podle nejbližšího data.
 */
export async function fetchUpcomingClubEvents(): Promise<StravaGroupEvent[]> {
  const all = await fetchClubGroupEvents();
  const now = Date.now();

  return all
    .map((ev) => ({
      ...ev,
      upcoming_occurrences: ev.upcoming_occurrences.filter(
        (date) => new Date(date).getTime() > now,
      ),
    }))
    .filter((ev) => ev.upcoming_occurrences.length > 0)
    .filter((ev) => !ev.private) // skryté/private eventy nezobrazujeme
    .sort(
      (a, b) =>
        new Date(a.upcoming_occurrences[0]).getTime() -
        new Date(b.upcoming_occurrences[0]).getTime(),
    );
}
