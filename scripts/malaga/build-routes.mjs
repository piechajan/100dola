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
  {
    slug: "bacalao-benamocarra",
    profile: "trekking",
    wpts: [BASE, { lon: -4.3, lat: 36.72 }, { lon: -4.15, lat: 36.79 }, { lon: -4.16, lat: 36.8 }, { lon: -4.19, lat: 36.72 }, BASE],
  },
  {
    slug: "puerto-del-sol-alfarnate",
    profile: "trekking",
    wpts: [BASE, { lon: -4.1, lat: 36.78 }, { lon: -4.05, lat: 36.85 }, { lon: -4.16, lat: 36.99 }, { lon: -4.3466, lat: 36.8006 }, BASE],
  },
  {
    slug: "vertikalni-vinice-cutar",
    profile: "trekking",
    wpts: [BASE, { lon: -4.3576, lat: 36.7205 }, { lon: -4.24, lat: 36.85 }, { lon: -4.28, lat: 36.83 }, { lon: -4.21, lat: 36.81 }, BASE],
  },
  {
    slug: "el-torcal-antequera",
    profile: "trekking",
    wpts: [BASE, { lon: -4.517, lat: 36.918 }, { lon: -4.545, lat: 36.955 }, { lon: -4.56, lat: 37.019 }, BASE],
  },
  {
    slug: "bile-vesnice-frigiliana",
    profile: "trekking",
    wpts: [BASE, { lon: -4.1, lat: 36.78 }, { lon: -3.876, lat: 36.745 }, { lon: -3.895, lat: 36.792 }, { lon: -3.972, lat: 36.833 }, { lon: -3.955, lat: 36.76 }, BASE],
  },
  {
    slug: "ronda-vuelta-2014",
    profile: "trekking",
    wpts: [BASE, { lon: -4.633, lat: 36.713 }, { lon: -5.165, lat: 36.742 }, { lon: -5.18, lat: 36.86 }, { lon: -4.945, lat: 36.79 }, BASE],
  },
  {
    slug: "marbella-ronda-ojen",
    profile: "trekking",
    wpts: [BASE, { lon: -4.633, lat: 36.713 }, { lon: -4.885, lat: 36.51 }, { lon: -4.858, lat: 36.567 }, { lon: -4.826, lat: 36.632 }, BASE],
  },
  {
    slug: "torre-del-mar-canillas",
    profile: "trekking",
    wpts: [BASE, { lon: -4.1, lat: 36.78 }, { lon: -4.08, lat: 36.8 }, { lon: -4.06, lat: 36.9 }, { lon: -4.1, lat: 36.78 }, BASE],
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
  // Vyhlazení výšek (moving average, okno 9 bodů) — bez něj se drobné vlnky
  // sčítají a nafouknou stoupání. Ascent + sklon počítáme z vyhlazené řady.
  const W = 4;
  const ele = pts.map((_, i) => {
    let sum = 0, n = 0;
    for (let k = Math.max(0, i - W); k <= Math.min(pts.length - 1, i + W); k++) {
      sum += pts[k].ele; n++;
    }
    return sum / n;
  });
  let distM = 0, ascent = 0, maxAlt = -Infinity;
  const WIN = 250; // rolling okno pro max sklon
  let maxGrad = 0;
  let wd = 0, wr = 0;
  for (let i = 1; i < pts.length; i++) {
    const d = haversineM(pts[i - 1], pts[i]);
    distM += d;
    const de = ele[i] - ele[i - 1];
    if (de > 0.5) ascent += de; // práh proti mikro-šumu
    maxAlt = Math.max(maxAlt, ele[i]);
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

// Re-elevace: BRouter dává geometrii (silnice), ale výšky ze SRTM jsou šumné.
// Přepíšeme je přesnějšími z mapy.com elevation API (batch po 90 bodech).
const MAPY_KEY = process.env.NEXT_PUBLIC_MAPY_API_KEY;
async function reElevate(pts) {
  if (!MAPY_KEY) return pts;
  const CHUNK = 90;
  for (let i = 0; i < pts.length; i += CHUNK) {
    const slice = pts.slice(i, i + CHUNK);
    const params = slice.map((p) => `positions=${p.lon},${p.lat}`).join("&");
    const res = await fetch(`https://api.mapy.cz/v1/elevation?apikey=${MAPY_KEY}&${params}`, {
      headers: { "User-Agent": UA },
    });
    if (!res.ok) throw new Error(`mapy elevation ${res.status}`);
    const data = await res.json();
    (data.items ?? []).forEach((it, j) => {
      if (typeof it.elevation === "number") slice[j].ele = it.elevation;
    });
  }
  return pts;
}

// Přepíše <ele> v GPX čistými výškami (podle pořadí trkpt).
function rewriteGpxEle(xml, pts) {
  let idx = 0;
  return xml.replace(/(<trkpt[^>]*>\s*<ele>)[-\d.]+(<\/ele>)/g, (m, a, b) => {
    const e = pts[idx] ? pts[idx].ele : 0;
    idx++;
    return `${a}${e.toFixed(1)}${b}`;
  });
}

mkdirSync(GPX_DIR, { recursive: true });
mkdirSync("reports", { recursive: true });
const out = {};
for (const r of ROUTES) {
  try {
    const gpxRaw = await brouter(r.wpts, r.profile);
    let pts = parseTrkpts(gpxRaw);
    pts = await reElevate(pts); // čistší výšky z mapy.com
    const gpx = rewriteGpxEle(gpxRaw, pts);
    const path = `${GPX_DIR}/${r.slug}.gpx`;
    writeFileSync(path, gpx);
    const s = stats(pts);
    out[r.slug] = s;
    console.log(`✓ ${r.slug}: ${s.distance_km} km / +${s.ascent_m} m / DS ${s.difficulty_score} (T${s.tier})`);
  } catch (e) {
    console.error(`✗ ${r.slug}:`, e.message);
    out[r.slug] = { error: e.message };
  }
}
writeFileSync("reports/malaga-gpx-stats.json", JSON.stringify(out, null, 2));
console.log("\n→ reports/malaga-gpx-stats.json");
