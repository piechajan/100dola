// Datový model self-guided tras kolem Malagy (§3 zadání malaga-trasy).
// Pole, které neumíme ověřit, je `null` a jde do `todo[]` — NIKDY se nevymýšlí.
// Trasy zůstávají confidence:"medium" (štítek „neověřeno v terénu"), dokud je
// Jan neprojede naživo (9.–16. 9. 2026), pak flip na "high" s reálným GPX ze Stravy.

export type Tier = 1 | 2 | 3 | 4;
export type Confidence = "high" | "medium" | "low";
export type TrafficLevel = "green" | "amber" | "red";
export type WaterType = "fuente" | "shop" | "bar" | "cafe";
export type BailoutType = "train" | "bus" | "taxi";

/** Modifikátory (binární vlaječky nad kartou, NEpočítají se do DS — §4). */
export interface RouteFlags {
  heat?: boolean; // 🔥 >25 km bez stínu
  dry?: boolean; // 💧 nejdelší úsek bez vody >25 km
  traffic?: boolean; // 🚗 >10 km v amber/red
  surface?: boolean; // 🕳 významný úsek špatného asfaltu
  wind?: boolean; // 🌬 exponovaný hřeben / plošina
}

export interface TrafficSegment {
  from_km: number;
  to_km: number;
  level: TrafficLevel;
  note_cs: string;
}

export interface WaterPoint {
  km: number | null;
  type: WaterType;
  name: string;
  /** např. „v létě nespolehlivá" / „poslední doplnění na 35 km" */
  reliable?: string | null;
  note_cs?: string | null;
}

export interface Cafe {
  km: number | null;
  name: string;
  town: string;
  /** zavírací den, např. "po" */
  closed?: string | null;
  note_cs?: string | null;
}

export interface Climb {
  name: string;
  from: string;
  length_km: number | null;
  avg_pct: number | null;
  max_pct: number | null;
  gain_m: number | null;
  top_m: number | null;
  climbfinder_url?: string | null;
  strava_segment?: string | null;
}

export interface Bailout {
  km: number | null;
  type: BailoutType;
  line?: string | null;
  station?: string | null;
  note_cs: string;
}

export interface MalagaRouteV2 {
  slug: string;
  name_cs: string;
  name_es: string | null;
  tier: Tier;
  /** DS = distance_km/10 + ascent_m/100 + max_gradient_pct × 0.5 (§4) */
  difficulty_score: number;
  distance_km: number; // JEDNO číslo (ze stopy), ne rozpětí
  ascent_m: number;
  climb_density: number; // ascent_m / distance_km
  max_altitude_m: number;
  max_gradient_pct: number;
  flags: RouteFlags;

  start: { name: string; lat: number | null; lon: number | null };
  loop: boolean;
  surface: { asphalt_pct: number; gravel_pct: number; notes_cs: string | null };
  roads: string[];

  traffic: TrafficSegment[]; // pokrývá 100 % délky (§8)
  water: WaterPoint[];
  longest_dry_stretch_km: number | null;
  cafes: Cafe[];
  climbs: Climb[];
  bailout: Bailout[];

  wind: { prevailing: string | null; best_direction_cs: string | null };
  best_time_of_day_cs: string | null;
  season: { ideal: string[]; avoid: string[]; note_cs: string | null };

  gearing_cs: string | null;
  tyres_cs: string | null;
  who_it_suits_cs: string; // ZACHOVAT z původní stránky
  story_cs: string; // 150–250 slov
  warnings_cs: string[];

  gpx: string | null;
  strava_route?: string | null;
  komoot_route?: string | null;
  photos: string[];

  sources: string[];
  verified_at: string | null; // YYYY-MM-DD
  confidence: Confidence;
  todo: string[];
}

export const TIER_LABEL: Record<Tier, string> = {
  1: "Rozjezd",
  2: "Zkušený",
  3: "Silný jezdec",
  4: "Královská etapa",
};

export const TIER_COLOR: Record<Tier, string> = {
  1: "#2EAA6E",
  2: "#3B7CF4",
  3: "#E8431A",
  4: "#1a1a2e",
};

export const TRAFFIC_LABEL: Record<TrafficLevel, string> = {
  green: "klid",
  amber: "opatrně",
  red: "rušno",
};

export const TRAFFIC_COLOR: Record<TrafficLevel, string> = {
  green: "#2EAA6E",
  amber: "#E8A21A",
  red: "#E8431A",
};

export const FLAG_META: { key: keyof RouteFlags; emoji: string; label: string }[] = [
  { key: "heat", emoji: "🔥", label: "vedro" },
  { key: "dry", emoji: "💧", label: "málo vody" },
  { key: "traffic", emoji: "🚗", label: "provoz" },
  { key: "surface", emoji: "🕳", label: "povrch" },
  { key: "wind", emoji: "🌬", label: "vítr" },
];

/** Naše základna v Malaze — kotví trasy „od dveří" (fly to ride). */
export const MALAGA_BASE = {
  name: "Zázemí 100dola Malaga",
  addressShort: "Málaga (10 min od letiště AGP)",
  lat: 36.7026,
  lon: -4.4747,
} as const;

export function tierFromDS(ds: number): Tier {
  if (ds <= 26) return 1;
  if (ds <= 36) return 2;
  if (ds <= 46) return 3;
  return 4;
}
