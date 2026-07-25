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
 * Souhrn jedné aktivity přihlášeného sportovce. Prioritní výkonová metrika je
 * `weighted_average_watts` (normalized power) — `average_watts` je bez autostopu
 * zkreslený dolů pauzami.
 */
export interface StravaAthleteActivity {
  id: number;
  name: string;
  sport_type: StravaActivityType;
  type: StravaActivityType;
  start_date_local: string;
  distance: number; // metry
  moving_time: number; // s
  elapsed_time: number; // s
  total_elevation_gain: number; // m
  weighted_average_watts: number | null;
  average_watts: number | null;
  max_watts: number | null;
  average_heartrate: number | null;
  max_heartrate: number | null;
  average_cadence: number | null;
  device_watts: boolean; // true = reálný wattmetr, ne odhad
  suffer_score: number | null;
}

/**
 * Stáhne souhrnné aktivity přihlášeného sportovce (ne klubu). Stránkuje po 200.
 * `after` = epoch (s) — vrací aktivity novější než tento čas.
 *
 * Interní použití (sync do samostatného kondičního projektu). Endpoint, který to
 * volá, je chráněný CRON_SECRET — data nejsou veřejná.
 */
export async function fetchAthleteActivities(opts?: {
  after?: number;
  perPage?: number;
  maxPages?: number;
}): Promise<StravaAthleteActivity[]> {
  const token = await refreshAccessToken();
  const perPage = opts?.perPage ?? 200;
  const maxPages = opts?.maxPages ?? 12;
  const out: StravaAthleteActivity[] = [];

  for (let page = 1; page <= maxPages; page++) {
    const params = new URLSearchParams({
      per_page: String(perPage),
      page: String(page),
    });
    if (opts?.after) params.set("after", String(opts.after));

    const res = await fetch(`${API_BASE}/athlete/activities?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Strava athlete/activities fetch failed: ${res.status} ${text}`);
    }

    const batch = (await res.json()) as Array<Record<string, unknown>>;
    for (const a of batch) {
      out.push({
        id: a.id as number,
        name: (a.name as string) ?? "",
        sport_type: (a.sport_type as StravaActivityType) ?? (a.type as StravaActivityType),
        type: (a.type as StravaActivityType) ?? "",
        start_date_local: (a.start_date_local as string) ?? "",
        distance: (a.distance as number) ?? 0,
        moving_time: (a.moving_time as number) ?? 0,
        elapsed_time: (a.elapsed_time as number) ?? 0,
        total_elevation_gain: (a.total_elevation_gain as number) ?? 0,
        weighted_average_watts: (a.weighted_average_watts as number) ?? null,
        average_watts: (a.average_watts as number) ?? null,
        max_watts: (a.max_watts as number) ?? null,
        average_heartrate: (a.average_heartrate as number) ?? null,
        max_heartrate: (a.max_heartrate as number) ?? null,
        average_cadence: (a.average_cadence as number) ?? null,
        device_watts: Boolean(a.device_watts),
        suffer_score: (a.suffer_score as number) ?? null,
      });
    }

    if (batch.length < perPage) break;
  }

  return out;
}

/**
 * Jeden lap (úsek) aktivity — pro strukturované intervalové jednotky (FTP test).
 * `average_watts` je za lap dostačující: na ustáleném 8min intervalu ≈ NP.
 */
export interface StravaLap {
  lap_index: number;
  name: string;
  elapsed_time: number; // s
  moving_time: number; // s
  distance: number; // m
  start_index: number | null; // index do streams (pro HR recovery apod.)
  end_index: number | null;
  average_watts: number | null;
  max_watts: number | null;
  average_heartrate: number | null;
  max_heartrate: number | null;
  average_cadence: number | null;
  average_speed: number | null; // m/s
  total_elevation_gain: number | null;
}

/**
 * Stáhne lapy konkrétní aktivity (detail endpoint). Pro vyhodnocení
 * intervalových jednotek přihlášeného sportovce.
 */
export async function fetchActivityLaps(activityId: number | string): Promise<StravaLap[]> {
  const token = await refreshAccessToken();
  const res = await fetch(`${API_BASE}/activities/${activityId}/laps`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Strava activity laps fetch failed: ${res.status} ${text}`);
  }
  const laps = (await res.json()) as Array<Record<string, unknown>>;
  return laps.map((l) => ({
    lap_index: (l.lap_index as number) ?? 0,
    name: (l.name as string) ?? "",
    elapsed_time: (l.elapsed_time as number) ?? 0,
    moving_time: (l.moving_time as number) ?? 0,
    distance: (l.distance as number) ?? 0,
    start_index: (l.start_index as number) ?? null,
    end_index: (l.end_index as number) ?? null,
    average_watts: (l.average_watts as number) ?? null,
    max_watts: (l.max_watts as number) ?? null,
    average_heartrate: (l.average_heartrate as number) ?? null,
    max_heartrate: (l.max_heartrate as number) ?? null,
    average_cadence: (l.average_cadence as number) ?? null,
    average_speed: (l.average_speed as number) ?? null,
    total_elevation_gain: (l.total_elevation_gain as number) ?? null,
  }));
}

/**
 * Vteřinové streams aktivity (time, heartrate, watts, cadence). Pro analýzu
 * HR recovery mezi intervaly a přesný průběh výkonu při FTP testu.
 * Vrací mapu klíč→pole hodnot (zarovnané indexy).
 */
export async function fetchActivityStreams(
  activityId: number | string,
  keys: string[] = ["time", "heartrate", "watts", "cadence"],
): Promise<Record<string, number[]>> {
  const token = await refreshAccessToken();
  const params = new URLSearchParams({ keys: keys.join(","), key_by_type: "true" });
  const res = await fetch(
    `${API_BASE}/activities/${activityId}/streams?${params.toString()}`,
    { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" },
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Strava activity streams fetch failed: ${res.status} ${text}`);
  }
  const data = (await res.json()) as Record<string, { data?: number[] }>;
  const out: Record<string, number[]> = {};
  for (const [k, v] of Object.entries(data)) {
    if (v && Array.isArray(v.data)) out[k] = v.data;
  }
  return out;
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
