"use client";

import { useEffect, useState } from "react";

interface Props {
  gpxPath: string;
  accentColor?: string;
}

interface ProfilePoint {
  /** Kumulativní vzdálenost v km. */
  dist: number;
  /** Nadmořská výška v m. */
  ele: number;
}

interface ProfileData {
  points: ProfilePoint[];
  totalKm: number;
  minEle: number;
  maxEle: number;
  gain: number;
}

/** Haversine — vzdálenost mezi dvěma body v metrech. */
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function parseGpx(xml: string): ProfileData | null {
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  if (doc.querySelector("parsererror")) return null;
  const pts = Array.from(doc.getElementsByTagName("trkpt"));
  if (pts.length < 2) return null;

  const raw: { lat: number; lon: number; ele: number }[] = [];
  for (const pt of pts) {
    const lat = parseFloat(pt.getAttribute("lat") ?? "");
    const lon = parseFloat(pt.getAttribute("lon") ?? "");
    const eleEl = pt.getElementsByTagName("ele")[0];
    const ele = eleEl ? parseFloat(eleEl.textContent ?? "") : NaN;
    if (Number.isFinite(lat) && Number.isFinite(lon) && Number.isFinite(ele)) {
      raw.push({ lat, lon, ele });
    }
  }
  if (raw.length < 2) return null;

  // Kumulativní vzdálenost + převýšení
  const points: ProfilePoint[] = [];
  let distM = 0;
  let gain = 0;
  let minEle = raw[0].ele;
  let maxEle = raw[0].ele;
  points.push({ dist: 0, ele: raw[0].ele });
  for (let i = 1; i < raw.length; i++) {
    const prev = raw[i - 1];
    const cur = raw[i];
    distM += haversine(prev.lat, prev.lon, cur.lat, cur.lon);
    const diff = cur.ele - prev.ele;
    if (diff > 0) gain += diff;
    if (cur.ele < minEle) minEle = cur.ele;
    if (cur.ele > maxEle) maxEle = cur.ele;
    points.push({ dist: distM / 1000, ele: cur.ele });
  }

  // Downsample na ~200 bodů pro plynulý SVG path
  const target = 200;
  const step = Math.max(1, Math.ceil(points.length / target));
  const sampled: ProfilePoint[] = [];
  for (let i = 0; i < points.length; i += step) sampled.push(points[i]);
  const last = points[points.length - 1];
  if (sampled[sampled.length - 1] !== last) sampled.push(last);

  return {
    points: sampled,
    totalKm: distM / 1000,
    minEle,
    maxEle,
    gain,
  };
}

export default function ElevationProfile({ gpxPath, accentColor = "#3B7CF4" }: Props) {
  const [data, setData] = useState<ProfileData | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(gpxPath)
      .then((r) => {
        if (!r.ok) throw new Error("fetch failed");
        return r.text();
      })
      .then((xml) => {
        if (cancelled) return;
        const parsed = parseGpx(xml);
        if (parsed) setData(parsed);
        else setFailed(true);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [gpxPath]);

  if (failed || !data) return null;

  // SVG viewBox — pevné souřadnice, responsivní přes width 100 %
  const W = 800;
  const H = 220;
  const padL = 8;
  const padR = 8;
  const padT = 12;
  const padB = 8;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const { points, totalKm, minEle, maxEle, gain } = data;
  const eleRange = maxEle - minEle || 1;

  const x = (d: number) => padL + (d / totalKm) * plotW;
  const y = (e: number) => padT + (1 - (e - minEle) / eleRange) * plotH;

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${x(p.dist).toFixed(1)},${y(p.ele).toFixed(1)}`)
    .join(" ");
  const areaPath =
    `M${x(points[0].dist).toFixed(1)},${(H - padB).toFixed(1)} ` +
    points.map((p) => `L${x(p.dist).toFixed(1)},${y(p.ele).toFixed(1)}`).join(" ") +
    ` L${x(points[points.length - 1].dist).toFixed(1)},${(H - padB).toFixed(1)} Z`;

  const gradId = `elev-grad-${gpxPath.replace(/[^a-z0-9]/gi, "")}`;

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#E2E6F3]">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">📈</span>
        <h3 className="font-black text-[#1a1a2e]">Výškový profil</h3>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        className="block"
        preserveAspectRatio="none"
        role="img"
        aria-label={`Výškový profil trasy — ${totalKm.toFixed(1)} km, převýšení ${Math.round(gain)} m`}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accentColor} stopOpacity="0.35" />
            <stop offset="100%" stopColor={accentColor} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#${gradId})`} />
        <path
          d={linePath}
          fill="none"
          stroke={accentColor}
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <div className="grid grid-cols-4 gap-3 mt-4">
        <div>
          <div className="text-xs text-[#9AA3C2]">Délka</div>
          <div className="font-black text-[#1a1a2e] text-sm">{totalKm.toFixed(1)} km</div>
        </div>
        <div>
          <div className="text-xs text-[#9AA3C2]">Převýšení</div>
          <div className="font-black text-[#1a1a2e] text-sm">↑ {Math.round(gain)} m</div>
        </div>
        <div>
          <div className="text-xs text-[#9AA3C2]">Nejníže</div>
          <div className="font-black text-[#1a1a2e] text-sm">{Math.round(minEle)} m</div>
        </div>
        <div>
          <div className="text-xs text-[#9AA3C2]">Nejvýše</div>
          <div className="font-black text-[#1a1a2e] text-sm">{Math.round(maxEle)} m</div>
        </div>
      </div>
    </div>
  );
}
