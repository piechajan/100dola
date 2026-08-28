#!/usr/bin/env node
// Batch generátor GPX tras pro Malagu přes BRouter (§7 zadání malaga-trasy).
// Waypointy jsou odvozené z ověřených dat (§9) a kotvené od naší základny.
// Pro každou trasu: stáhne GPX z BRouteru → uloží → spočítá vyhlazené metriky.
// Výstup: reports/malaga-gpx-stats.json (fold do route dat).
//
// POZOR: stopy jsou routing-engine (confidence "medium") — Jan je projede v terénu
// (9.–16. 9. 2026) a nahradíme reálným GPX z jeho Stravy.
import { writeFileSync, mkdirSync } from "node:fs";

const BASE = { lon: -4.4747, lat: 36.7026 }; // C. Espacio, 29006 Málaga
const GPX_DIR = "public/gpx/malaga";
const UA = "100dola-web/1.0 (piecha.jan@gmail.com)";

// Waypointy [lon,lat] — z ověřených sekvencí §9. Loop = návrat k BASE.
const ROUTES = [
  {
    slug: "pobrezi-rincon-de-la-victoria",
    profile: "trekking",
    wpts: [BASE, { lon: -4.3576, lat: 36.7205 }, { lon: -4.2769, lat: 36.7178 }, { lon: -4.2450, lat: 36.7250 }, { lon: -4.3576, lat: 36.7205 }, BASE],
  },
  {
    slug: "montes-de-malaga-puerto-del-leon",
    profile: "trekking",
    wpts: [BASE, { lon: -4.4180, lat: 36.7400 }, { lon: -4.3466, lat: 36.8006 }, { lon: -4.3430, lat: 36.8980 }, { lon: -4.4270, lat: 36.9010 }, BASE],
  },
  {
    slug: "puerto-del-leon-olias",
    profile: "trekking",
    wpts: [BASE, { lon: -4.3576, lat: 36.7205 }, { lon: -4.354, lat: 36.774 }, { lon: -4.3466, lat: 36.8006 }, { lon: -4.4180, lat: 36.74 }, BASE],
  },
  {
    slug: "axarquia-comares-balkony",
    profile: "trekking",
    wpts: [BASE, { lon: -4.3576, lat: 36.7205 }, { lon: -4.21, lat: 36.81 }, { lon: -4.25, lat: 36.836 }, { lon: -4.3576, lat: 36.7205 }, BASE],
  },
  {
    slug: "el-chorro-guadalhorce",
    profile: "trekking",
    wpts: [BASE, { lon: -4.633, lat: 36.713 }, { lon: -4.703, lat: 36.821 }, { lon: -4.766, lat: 36.908 }, { lon: -4.703, lat: 36.821 }, BASE],
  },
  {
    slug: "zafarraya-boquete",
    profile: "trekking",
    wpts: [BASE, { lon: -4.1, lat: 36.78 }, { lon: -4.14, lat: 36.97 }, { lon: -4.1, lat: 36.78 }, { lon: -4.2769, lat: 36.7178 }, BASE],
  },
];

function haversineM(a, b) {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function parseTrkpts(xml) {
  const pts = [];
  const re = /<trkpt[^>]*lon="([-\d.]+)"[^>]*lat="([-\d.]+)"[^>]*>\s*<ele>([-\d.]+)<\/ele>/g;
  let m;
  while ((m = re.exec(xml)) !== null) {
    pts.push({ lon: parseFloat(m[1]), lat: parseFloat(m[2]), ele: parseFloat(m[3]) });
  }
  return pts;
}

function stats(pts) {
  let distM = 0, ascent = 0, maxAlt = -Infinity;
  // vyhlazený sklon: rolling okno ~250 m (SRTM šum jinak nafoukne max grad)
  const WIN = 250;
  let maxGrad = 0;
  let wd = 0, wr = 0;
  for (let i = 1; i < pts.length; i++) {
    const d = haversineM(pts[i - 1], pts[i]);
    distM += d;
    const de = pts[i].ele - pts[i - 1].ele;
    if (de > 0) ascent += de;
    maxAlt = Math.max(maxAlt, pts[i].ele);
    wd += d; wr += de;
    if (wd >= WIN) {
      const g = (wr / wd) * 100;
      if (g > maxGrad) maxGrad = g;
      wd = 0; wr = 0;
    }
  }
  const km = distM / 1000;
  const asc = Math.round(ascent);
  const mg = Math.round(maxGrad * 10) / 10;
  const ds = Math.round((km / 10 + asc / 100 + mg * 0.5) * 10) / 10;
  const tier = ds <= 26 ? 1 : ds <= 36 ? 2 : ds <= 46 ? 3 : 4;
  return {
    distance_km: Math.round(km * 10) / 10,
    ascent_m: asc,
    max_altitude_m: Math.round(maxAlt),
    max_gradient_pct: mg,
    climb_density: Math.round((asc / km) * 10) / 10,
    difficulty_score: ds,
    tier,
    points: pts.length,
  };
}

async function brouter(wpts, profile) {
  const lonlats = wpts.map((w) => `${w.lon},${w.lat}`).join("|");
  const url = `https://brouter.de/brouter?lonlats=${lonlats}&profile=${profile}&alternativeidx=0&format=gpx`;
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`BRouter ${res.status}`);
  return res.text();
}

mkdirSync(GPX_DIR, { recursive: true });
mkdirSync("reports", { recursive: true });
const out = {};
for (const r of ROUTES) {
  try {
    const gpx = await brouter(r.wpts, r.profile);
    const path = `${GPX_DIR}/${r.slug}.gpx`;
    writeFileSync(path, gpx);
    const s = stats(parseTrkpts(gpx));
    out[r.slug] = s;
    console.log(`✓ ${r.slug}: ${s.distance_km} km / +${s.ascent_m} m / DS ${s.difficulty_score} (T${s.tier})`);
  } catch (e) {
    console.error(`✗ ${r.slug}:`, e.message);
    out[r.slug] = { error: e.message };
  }
}
writeFileSync("reports/malaga-gpx-stats.json", JSON.stringify(out, null, 2));
console.log("\n→ reports/malaga-gpx-stats.json");
