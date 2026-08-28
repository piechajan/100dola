import "server-only";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { MALAGA_ROUTES_V2 } from "@/data/malaga/routes";
import type { WaterType } from "@/data/malaga/routes/types";

export interface WaterMarker {
  lat: number;
  lon: number;
  name: string;
  type: WaterType;
  reliable: string | null;
  routeName: string;
  routeSlug: string;
}

function haversineKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Body trasy z GPX (lon/lat) + kumulativní km. */
function readTrack(gpx: string): { lat: number; lon: number }[] {
  try {
    const xml = readFileSync(join(process.cwd(), "public", gpx.replace(/^\//, "")), "utf8");
    const out: { lat: number; lon: number }[] = [];
    const re = /<trkpt[^>]*lon="([-\d.]+)"[^>]*lat="([-\d.]+)"/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(xml)) !== null) {
      out.push({ lon: parseFloat(m[1]), lat: parseFloat(m[2]) });
    }
    return out;
  } catch {
    return [];
  }
}

/**
 * Agreguje všechny vodní body napříč katalogem s reálnými souřadnicemi —
 * ty odvodí z GPX trasy podle km daného bodu. „Mapa vody" (§9): jedna mapa,
 * všechny fuentes/obchody/bary v provincii.
 */
export function getWaterMarkers(): WaterMarker[] {
  const markers: WaterMarker[] = [];
  for (const r of MALAGA_ROUTES_V2) {
    if (!r.gpx) continue;
    const pts = readTrack(r.gpx);
    if (pts.length < 2) continue;
    // kumulativní km po trase
    const cum: number[] = [0];
    for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + haversineKm(pts[i - 1], pts[i]));
    for (const w of r.water) {
      if (w.km == null) continue;
      // najdi bod nejblíž danému km
      let bestI = 0;
      let bestD = Infinity;
      for (let i = 0; i < cum.length; i++) {
        const d = Math.abs(cum[i] - w.km);
        if (d < bestD) {
          bestD = d;
          bestI = i;
        }
      }
      markers.push({
        lat: pts[bestI].lat,
        lon: pts[bestI].lon,
        name: w.name,
        type: w.type,
        reliable: w.reliable ?? null,
        routeName: r.name_cs,
        routeSlug: r.slug,
      });
    }
  }
  return markers;
}
