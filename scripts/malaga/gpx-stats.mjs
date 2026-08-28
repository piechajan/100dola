#!/usr/bin/env node
// Výpočet metrik trasy ZE STOPY (§8 zadání malaga-trasy) — ne z popisu.
// Usage: node scripts/malaga/gpx-stats.mjs <soubor.gpx>
// Vytiskne JSON: distance_km, ascent_m, max_altitude_m, max_gradient_pct,
// climb_density, difficulty_score, tier.
import { readFileSync } from "node:fs";

function parseTrkpts(xml) {
  const pts = [];
  const re = /<trkpt[^>]*lat="([-\d.]+)"[^>]*lon="([-\d.]+)"[^>]*>(?:\s*<ele>([-\d.]+)<\/ele>)?/g;
  // pořadí atributů lat/lon se může lišit → druhý pokus když první nechytí
  let m;
  while ((m = re.exec(xml)) !== null) {
    pts.push({ lat: parseFloat(m[1]), lon: parseFloat(m[2]), ele: m[3] ? parseFloat(m[3]) : 0 });
  }
  if (pts.length === 0) {
    const re2 = /<trkpt[^>]*lon="([-\d.]+)"[^>]*lat="([-\d.]+)"[^>]*>(?:\s*<ele>([-\d.]+)<\/ele>)?/g;
    while ((m = re2.exec(xml)) !== null) {
      pts.push({ lat: parseFloat(m[2]), lon: parseFloat(m[1]), ele: m[3] ? parseFloat(m[3]) : 0 });
    }
  }
  return pts;
}

function haversineM(a, b) {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function tierFromDS(ds) {
  if (ds <= 26) return 1;
  if (ds <= 36) return 2;
  if (ds <= 46) return 3;
  return 4;
}

const file = process.argv[2];
if (!file) {
  console.error("Usage: node gpx-stats.mjs <soubor.gpx>");
  process.exit(1);
}
const pts = parseTrkpts(readFileSync(file, "utf8"));
if (pts.length < 2) {
  console.error("Málo bodů ve stopě:", pts.length);
  process.exit(1);
}

let distM = 0;
let ascent = 0;
let maxAlt = -Infinity;
// max gradient přes ~100m okno (bod-po-bodu je šum)
let maxGrad = 0;
let windowDist = 0;
let windowRise = 0;
for (let i = 1; i < pts.length; i++) {
  const d = haversineM(pts[i - 1], pts[i]);
  distM += d;
  const de = pts[i].ele - pts[i - 1].ele;
  if (de > 0) ascent += de;
  maxAlt = Math.max(maxAlt, pts[i].ele, pts[i - 1].ele);
  windowDist += d;
  windowRise += de;
  if (windowDist >= 100) {
    const g = (windowRise / windowDist) * 100;
    if (g > maxGrad) maxGrad = g;
    windowDist = 0;
    windowRise = 0;
  }
}

const distance_km = distM / 1000;
const ascent_m = Math.round(ascent);
const max_altitude_m = Math.round(maxAlt);
const max_gradient_pct = Math.round(maxGrad * 10) / 10;
const climb_density = Math.round((ascent_m / distance_km) * 10) / 10;
// §4: DS = km/10 + ascent/100 + maxgrad*0.5
const difficulty_score =
  Math.round((distance_km / 10 + ascent_m / 100 + max_gradient_pct * 0.5) * 10) / 10;

console.log(
  JSON.stringify(
    {
      points: pts.length,
      distance_km: Math.round(distance_km * 10) / 10,
      ascent_m,
      max_altitude_m,
      max_gradient_pct,
      climb_density,
      difficulty_score,
      tier: tierFromDS(difficulty_score),
    },
    null,
    2,
  ),
);
