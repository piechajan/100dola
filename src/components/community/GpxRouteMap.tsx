"use client";

import { useEffect, useMemo, useRef, useState } from "react";

interface TrackPoint {
  lat: number;
  lon: number;
  ele: number;
}

/** Haversine vzdálenost dvou bodů v km. */
function haversineKm(a: TrackPoint, b: TrackPoint): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function parseGpx(xml: string): TrackPoint[] {
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  if (doc.querySelector("parsererror")) return [];
  const pts = Array.from(doc.getElementsByTagName("trkpt"));
  const source = pts.length > 0 ? pts : Array.from(doc.getElementsByTagName("rtept"));
  const out: TrackPoint[] = [];
  for (const pt of source) {
    const lat = parseFloat(pt.getAttribute("lat") ?? "");
    const lon = parseFloat(pt.getAttribute("lon") ?? "");
    if (Number.isNaN(lat) || Number.isNaN(lon)) continue;
    const eleEl = pt.getElementsByTagName("ele")[0];
    const ele = eleEl ? parseFloat(eleEl.textContent ?? "0") : 0;
    out.push({ lat, lon, ele: Number.isNaN(ele) ? 0 : ele });
  }
  return out;
}

/**
 * Univerzální route mapa z GPX — vlastní UI (Leaflet + OSM), žádný cizí iframe.
 * Vykreslí trasu na mapě + výškový profil + odkaz na stažení GPX. Funguje pro
 * KAŽDOU akci, která má gpxPath (proběhlou i nadcházející). Nahrazuje nespolehlivý
 * mapy.cz embed (blank kvůli CSP/redirectům, cache…).
 */
export default function GpxRouteMap({
  gpxPath,
  accentColor = "#3B7CF4",
  startLabel,
}: {
  gpxPath: string;
  accentColor?: string;
  startLabel?: string;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const [points, setPoints] = useState<TrackPoint[] | null>(null);
  const [error, setError] = useState(false);

  // Načti + parsuj GPX
  useEffect(() => {
    let cancelled = false;
    fetch(gpxPath)
      .then((r) => {
        if (!r.ok) throw new Error(`gpx ${r.status}`);
        return r.text();
      })
      .then((xml) => {
        if (cancelled) return;
        const pts = parseGpx(xml);
        if (pts.length < 2) setError(true);
        else setPoints(pts);
      })
      .catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
    };
  }, [gpxPath]);

  // Statistiky trasy
  const stats = useMemo(() => {
    if (!points) return null;
    let dist = 0;
    let gain = 0;
    const eles: number[] = [];
    for (let i = 0; i < points.length; i++) {
      eles.push(points[i].ele);
      if (i > 0) {
        dist += haversineKm(points[i - 1], points[i]);
        const d = points[i].ele - points[i - 1].ele;
        if (d > 0) gain += d;
      }
    }
    const min = Math.min(...eles);
    const max = Math.max(...eles);
    return { distanceKm: dist, gain: Math.round(gain), min: Math.round(min), max: Math.round(max), eles };
  }, [points]);

  // Init Leaflet mapy
  useEffect(() => {
    if (!points || !mapRef.current || mapInstanceRef.current) return;
    import("leaflet").then((L) => {
      if (!mapRef.current || mapInstanceRef.current) return;
      const map = L.map(mapRef.current, { zoomControl: true, scrollWheelZoom: false });
      mapInstanceRef.current = map;
      // Podklad: mapy.cz „outdoor" (turistická — vrstevnice, cesty; nejlepší pro
      // cyklo) když je klíč; jinak fallback na OpenStreetMap.
      const mapyKey = process.env.NEXT_PUBLIC_MAPY_API_KEY;
      if (mapyKey) {
        L.tileLayer(`https://api.mapy.cz/v1/maptiles/outdoor/256/{z}/{x}/{y}?apikey=${mapyKey}`, {
          minZoom: 0,
          maxZoom: 19,
          attribution:
            '<a href="https://api.mapy.cz/copyright" target="_blank" rel="noopener">&copy; Seznam.cz a.s. a další</a>',
        }).addTo(map);
        // Povinné logo mapy.cz (ToS).
        const LogoControl = L.Control.extend({
          options: { position: "bottomleft" as const },
          onAdd() {
            const a = L.DomUtil.create("a", "");
            a.setAttribute("href", "https://mapy.cz/");
            a.setAttribute("target", "_blank");
            a.setAttribute("rel", "noopener");
            a.style.display = "block";
            a.style.width = "62px";
            a.style.height = "16px";
            a.style.margin = "4px";
            a.style.backgroundImage = "url(https://api.mapy.cz/img/api/logo.svg)";
            a.style.backgroundSize = "contain";
            a.style.backgroundRepeat = "no-repeat";
            return a;
          },
        });
        new LogoControl().addTo(map);
      } else {
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap",
          maxZoom: 17,
        }).addTo(map);
      }
      const latlngs = points.map((p) => [p.lat, p.lon]) as [number, number][];
      const poly = L.polyline(latlngs, { color: accentColor, weight: 4, opacity: 1 }).addTo(map);
      map.fitBounds(poly.getBounds().pad(0.08));
      // Start + cíl
      L.circleMarker(latlngs[0], {
        radius: 7,
        fillColor: "#fff",
        color: accentColor,
        weight: 2.5,
        fillOpacity: 1,
      })
        .bindTooltip(startLabel ?? "Start", { permanent: false })
        .addTo(map);
      L.circleMarker(latlngs[latlngs.length - 1], {
        radius: 6,
        fillColor: accentColor,
        color: "#fff",
        weight: 2,
        fillOpacity: 1,
      })
        .bindTooltip("Cíl", { permanent: false })
        .addTo(map);
    });
    return () => {
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as { remove: () => void }).remove();
        mapInstanceRef.current = null;
      }
    };
  }, [points, accentColor, startLabel]);

  if (error) {
    return (
      <div className="rounded-xl h-52 flex items-center justify-center bg-[#F0F2FA]">
        <div className="text-center text-[#9AA3C2]">
          <div className="text-3xl mb-2">🗺️</div>
          <div className="text-sm font-medium">Trasu se nepodařilo načíst</div>
        </div>
      </div>
    );
  }

  const W = 600;
  const H = 64;
  const profilePoints =
    stats && stats.eles.length > 1
      ? stats.eles
          .map((e, i) => {
            const x = (i / (stats.eles.length - 1)) * W;
            const range = stats.max - stats.min || 1;
            const y = H - ((e - stats.min) / range) * H;
            return `${x},${y}`;
          })
          .join(" ")
      : "";

  return (
    <div className="space-y-3">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <div
        ref={mapRef}
        className="rounded-xl overflow-hidden border border-[#E2E6F3] bg-[#F0F2FA]"
        style={{ height: 320 }}
      >
        {!points && (
          <div className="h-full flex items-center justify-center text-sm text-[#9AA3C2]">
            Načítám trasu…
          </div>
        )}
      </div>

      {/* Výškový profil */}
      {stats && profilePoints && (
        <div className="bg-[#F8F9FF] rounded-xl p-3 border border-[#E2E6F3]">
          <div className="flex justify-between text-[10px] text-[#9AA3C2] mb-1.5 font-semibold">
            <span>↑ {stats.gain} m převýšení</span>
            <span>
              {stats.min} – {stats.max} m n.m.
            </span>
            <span>{stats.distanceKm.toFixed(1)} km</span>
          </div>
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full"
            style={{ height: 60 }}
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id={`elev-${gpxPath}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={accentColor} stopOpacity="0.35" />
                <stop offset="100%" stopColor={accentColor} stopOpacity="0.03" />
              </linearGradient>
            </defs>
            <polygon points={`0,${H} ${profilePoints} ${W},${H}`} fill={`url(#elev-${gpxPath})`} />
            <polyline
              points={profilePoints}
              fill="none"
              stroke={accentColor}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}

      {/* GPX download */}
      <a
        href={gpxPath}
        download
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-[#E2E6F3] text-xs font-semibold hover:border-current transition-colors"
        style={{ color: accentColor }}
      >
        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Stáhnout GPX (Garmin / Wahoo)
      </a>
    </div>
  );
}
