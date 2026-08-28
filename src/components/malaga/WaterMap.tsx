"use client";

import { useEffect, useRef } from "react";
import type { WaterMarker } from "@/lib/malaga/water-points";

const TYPE_META: Record<WaterMarker["type"], { color: string; label: string; emoji: string }> = {
  fuente: { color: "#3B7CF4", label: "Fuente (pramen)", emoji: "⛲" },
  shop: { color: "#2EAA6E", label: "Obchod / supermarket", emoji: "🛒" },
  bar: { color: "#E8A21A", label: "Bar", emoji: "🍺" },
  cafe: { color: "#E8431A", label: "Kavárna", emoji: "☕" },
};

export default function WaterMap({ markers }: { markers: WaterMarker[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const instRef = useRef<unknown>(null);

  useEffect(() => {
    if (!mapRef.current || instRef.current || markers.length === 0) return;
    import("leaflet").then((L) => {
      if (!mapRef.current || instRef.current) return;
      const map = L.map(mapRef.current, { zoomControl: true, scrollWheelZoom: false });
      instRef.current = map;
      const key = process.env.NEXT_PUBLIC_MAPY_API_KEY;
      if (key) {
        L.tileLayer(`https://api.mapy.cz/v1/maptiles/outdoor/256/{z}/{x}/{y}?apikey=${key}`, {
          minZoom: 0,
          maxZoom: 19,
          attribution: '<a href="https://api.mapy.cz/copyright" target="_blank" rel="noopener">&copy; Seznam.cz a.s. a další</a>',
        }).addTo(map);
        const Logo = L.Control.extend({
          options: { position: "bottomleft" as const },
          onAdd() {
            const a = L.DomUtil.create("a", "");
            a.setAttribute("href", "https://mapy.cz/");
            a.setAttribute("target", "_blank");
            a.setAttribute("rel", "noopener");
            a.style.cssText = "display:block;width:62px;height:16px;margin:4px;background:url(https://api.mapy.cz/img/api/logo.svg) no-repeat;background-size:contain";
            return a;
          },
        });
        new Logo().addTo(map);
      } else {
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap", maxZoom: 17 }).addTo(map);
      }
      const latlngs: [number, number][] = [];
      for (const m of markers) {
        const meta = TYPE_META[m.type];
        L.circleMarker([m.lat, m.lon], {
          radius: 6,
          fillColor: meta.color,
          color: "#fff",
          weight: 2,
          fillOpacity: 1,
        })
          .bindPopup(
            `<strong>${meta.emoji} ${m.name}</strong><br>${meta.label}${m.reliable ? `<br><em>${m.reliable}</em>` : ""}<br><span style="color:#9AA3C2">${m.routeName}</span>`,
          )
          .addTo(map);
        latlngs.push([m.lat, m.lon]);
      }
      if (latlngs.length > 0) map.fitBounds(L.latLngBounds(latlngs).pad(0.1));
    });
    return () => {
      if (instRef.current) {
        (instRef.current as { remove: () => void }).remove();
        instRef.current = null;
      }
    };
  }, [markers]);

  return (
    <div className="space-y-3">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <div ref={mapRef} className="rounded-2xl overflow-hidden border border-[#E2E6F3] bg-[#F0F2FA]" style={{ height: 480 }} />
      <div className="flex flex-wrap gap-3">
        {Object.entries(TYPE_META).map(([k, v]) => (
          <span key={k} className="inline-flex items-center gap-1.5 text-xs text-[#5A6480]">
            <span className="w-3 h-3 rounded-full" style={{ background: v.color }} />
            {v.emoji} {v.label}
          </span>
        ))}
      </div>
    </div>
  );
}
