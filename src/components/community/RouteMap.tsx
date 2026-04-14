"use client";

import { useEffect, useRef, useState } from "react";

interface RouteData {
  name: string;
  distanceKm: number;
  elevationGain: number;
  coords: [number, number][];
  elevation: number[];
}

interface RoutesData {
  cappuccino: RouteData;
  espresso: RouteData;
}

const COLORS = {
  cappuccino: "#3B7CF4",
  espresso:   "#E8431A",
};

export default function RouteMap({ accentColor }: { accentColor?: string }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const [active, setActive] = useState<"cappuccino" | "espresso">("espresso");
  const [routes, setRoutes] = useState<RoutesData | null>(null);

  // Load route data
  useEffect(() => {
    import("@/data/season-opening-routes.json").then((m) => {
      setRoutes(m.default as unknown as RoutesData);
    });
  }, []);

  // Init map
  useEffect(() => {
    if (!routes || !mapRef.current || mapInstanceRef.current) return;

    import("leaflet").then((L) => {
      // Fix default marker icons
      // @ts-expect-error leaflet icon fix
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current!, { zoomControl: true, scrollWheelZoom: false });
      mapInstanceRef.current = map;

      // Tiles — OpenStreetMap Cycle Map
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 17,
      }).addTo(map);

      const all = [
        ...routes.cappuccino.coords,
        ...routes.espresso.coords,
      ] as [number, number][];
      map.fitBounds(L.latLngBounds(all).pad(0.08));

      // Draw both routes, dimmed by default
      const layers: Record<string, L.Polyline> = {};
      (["cappuccino", "espresso"] as const).forEach((key) => {
        const poly = L.polyline(routes[key].coords, {
          color: COLORS[key],
          weight: key === "espresso" ? 4 : 4,
          opacity: key === "espresso" ? 1 : 0.35,
        }).addTo(map);
        layers[key] = poly;
      });

      // Start marker
      const start = routes.espresso.coords[0];
      L.circleMarker(start, {
        radius: 7,
        fillColor: "#fff",
        color: COLORS.espresso,
        weight: 2.5,
        fillOpacity: 1,
      }).bindTooltip("Start — Kavárna Chochino", { permanent: false }).addTo(map);

      // Store layers on map instance for toggle
      (map as unknown as Record<string, unknown>)._routeLayers = layers;
    });
  }, [routes]);

  // Toggle active route
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const layers = (mapInstanceRef.current as unknown as Record<string, unknown>)._routeLayers as Record<string, { setStyle: (s: object) => void }>;
    if (!layers) return;
    (["cappuccino", "espresso"] as const).forEach((key) => {
      layers[key]?.setStyle({ opacity: key === active ? 1 : 0.2 });
    });
  }, [active]);

  const route = routes?.[active];

  return (
    <div className="space-y-3">
      {/* Toggle tabs */}
      <div className="flex gap-2">
        {(["cappuccino", "espresso"] as const).map((key) => {
          const r = routes?.[key];
          const isActive = active === key;
          return (
            <button
              key={key}
              onClick={() => setActive(key)}
              className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all border"
              style={{
                backgroundColor: isActive ? COLORS[key] : "transparent",
                borderColor: COLORS[key],
                color: isActive ? "white" : COLORS[key],
              }}
            >
              ☕ {key === "cappuccino" ? "Cappuccino" : "Espresso"}
              {r && (
                <span className={`ml-1.5 font-normal ${isActive ? "text-white/80" : "opacity-60"}`}>
                  {r.distanceKm} km · +{r.elevationGain} m
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Map */}
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <div
        ref={mapRef}
        className="rounded-xl overflow-hidden border border-[#E2E6F3]"
        style={{ height: 320 }}
      />

      {/* Elevation mini-profile */}
      {route && (
        <ElevationProfile data={route} color={COLORS[active]} />
      )}

      {/* GPX download */}
      <a
        href={`/routes/season-opening-${active}.gpx`}
        download
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-[#E2E6F3] text-xs font-semibold text-[#5A6480] hover:border-current transition-colors"
        style={{ color: COLORS[active] }}
      >
        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Stáhnout GPX — {active === "cappuccino" ? "Cappuccino" : "Espresso"} (pro Garmin / Wahoo)
      </a>
    </div>
  );
}

function ElevationProfile({ data, color }: { data: RouteData; color: string }) {
  const { elevation, distanceKm } = data;
  if (!elevation?.length) return null;

  const min = Math.min(...elevation);
  const max = Math.max(...elevation);
  const range = max - min || 1;
  const W = 600, H = 60;

  const points = elevation.map((e, i) => {
    const x = (i / (elevation.length - 1)) * W;
    const y = H - ((e - min) / range) * H;
    return `${x},${y}`;
  }).join(" ");

  const area = `0,${H} ${points} ${W},${H}`;

  return (
    <div className="bg-[#F8F9FF] rounded-xl p-3 border border-[#E2E6F3]">
      <div className="flex justify-between text-[10px] text-[#9AA3C2] mb-1.5 font-semibold">
        <span>↑ {data.elevationGain} m převýšení</span>
        <span>{min} – {max} m n.m.</span>
        <span>{distanceKm} km</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 56 }} preserveAspectRatio="none">
        <defs>
          <linearGradient id="elev-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0.03" />
          </linearGradient>
        </defs>
        <polygon points={area} fill="url(#elev-grad)" />
        <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
