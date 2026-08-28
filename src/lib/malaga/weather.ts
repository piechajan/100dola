import "server-only";
import { unstable_cache } from "next/cache";
import { MALAGA_BASE } from "@/data/malaga/routes/types";

export interface DailyForecast {
  dateISO: string; // YYYY-MM-DD (místní, Málaga = UTC+2)
  dayLabel: string; // „po", „út"…
  tempMin: number; // °C
  tempMax: number; // °C
  windMaxKmh: number;
  rainMm: number;
  icon: "sun" | "cloud" | "rain";
}

const DAY_CS = ["ne", "po", "út", "st", "čt", "pá", "so"];
const MADRID_OFFSET_MS = 2 * 3600 * 1000; // CEST (léto); pro forecast dostačující

interface WindyResponse {
  ts: number[];
  "temp-surface"?: number[];
  "wind_u-surface"?: number[];
  "wind_v-surface"?: number[];
  "past3hprecip-surface"?: number[];
}

async function fetchWindy(): Promise<WindyResponse | null> {
  const key = process.env.WINDY_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch("https://api.windy.com/api/point-forecast/v2", {
      method: "POST",
      // Referer musí sedět na doménové omezení klíče (www.100dola.com).
      headers: { "Content-Type": "application/json", Referer: "https://www.100dola.com" },
      body: JSON.stringify({
        lat: MALAGA_BASE.lat,
        lon: MALAGA_BASE.lon,
        model: "gfs",
        parameters: ["temp", "wind", "precip"],
        levels: ["surface"],
        key,
      }),
    });
    if (!res.ok) return null;
    return (await res.json()) as WindyResponse;
  } catch {
    return null;
  }
}

function aggregate(data: WindyResponse): DailyForecast[] {
  const temp = data["temp-surface"] ?? [];
  const wu = data["wind_u-surface"] ?? [];
  const wv = data["wind_v-surface"] ?? [];
  const precip = data["past3hprecip-surface"] ?? [];
  const days = new Map<string, { min: number; max: number; wind: number; rain: number; wd: number }>();
  for (let i = 0; i < data.ts.length; i++) {
    const local = new Date(data.ts[i] + MADRID_OFFSET_MS);
    const iso = local.toISOString().slice(0, 10);
    const c = temp[i] != null ? temp[i] - 273.15 : NaN;
    const windKmh = wu[i] != null && wv[i] != null ? Math.sqrt(wu[i] ** 2 + wv[i] ** 2) * 3.6 : 0;
    const rain = precip[i] != null ? precip[i] * 1000 : 0;
    const cur = days.get(iso) ?? { min: Infinity, max: -Infinity, wind: 0, rain: 0, wd: local.getUTCDay() };
    if (!Number.isNaN(c)) {
      cur.min = Math.min(cur.min, c);
      cur.max = Math.max(cur.max, c);
    }
    cur.wind = Math.max(cur.wind, windKmh);
    cur.rain += rain;
    days.set(iso, cur);
  }
  return Array.from(days.entries())
    .map(([iso, d]) => ({
      dateISO: iso,
      dayLabel: DAY_CS[d.wd],
      tempMin: Math.round(d.min),
      tempMax: Math.round(d.max),
      windMaxKmh: Math.round(d.wind),
      rainMm: Math.round(d.rain * 10) / 10,
      icon: (d.rain >= 1 ? "rain" : d.wind >= 35 ? "cloud" : "sun") as DailyForecast["icon"],
    }))
    .filter((d) => d.tempMax > -50)
    .slice(0, 5);
}

/** Cachovaná 5denní předpověď pro Málagu (revalidace 3 h → pár requestů/den). */
export const getMalagaForecast = unstable_cache(
  async (): Promise<DailyForecast[]> => {
    const data = await fetchWindy();
    if (!data || !data.ts) return [];
    return aggregate(data);
  },
  ["malaga-forecast"],
  { revalidate: 3 * 3600, tags: ["malaga-forecast"] },
);
