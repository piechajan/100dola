"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { EventPhotoDay } from "@/lib/event-photos";

const MAX_DAY = 12;

export default function EventPhotoManager({ slug }: { slug: string }) {
  const [days, setDays] = useState<EventPhotoDay[]>([]);
  const [day, setDay] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    const r = await fetch(`/api/events/${slug}/photos`, { cache: "no-store" }).catch(() => null);
    if (r?.ok) setDays(((await r.json()).days ?? []) as EventPhotoDay[]);
  };
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const upload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("slug", slug);
        fd.append("day", String(day));
        fd.append("file", file);
        const r = await fetch("/api/admin/events/photos", { method: "POST", body: fd });
        if (!r.ok) {
          const b = await r.json().catch(() => null);
          throw new Error(b?.error || "Nahrání selhalo.");
        }
      }
      if (inputRef.current) inputRef.current.value = "";
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Nahrání selhalo.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (url: string) => {
    if (!confirm("Smazat tuto fotku?")) return;
    setBusy(true);
    const r = await fetch("/api/admin/events/photos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, slug }),
    });
    setBusy(false);
    if (r.ok) await load();
    else setError("Smazání selhalo.");
  };

  const total = days.reduce((n, d) => n + d.photos.length, 0);

  return (
    <div className="mt-6 bg-white rounded-2xl border border-[#E2E6F3] p-6">
      <h2 className="text-lg font-black text-[#1a1a2e] mb-1">Fotky po dnech</h2>
      <p className="text-xs text-[#9AA3C2] mb-4">
        Nahraj fotky ke konkrétnímu dni (Den I, II…). Zobrazí se ve veřejné galerii na stránce
        eventu. Celkem nahráno: <strong>{total}</strong>.
      </p>

      <div className="flex flex-wrap items-end gap-3 mb-4">
        <label className="block">
          <span className="text-[11px] uppercase tracking-wider font-bold text-[#9AA3C2]">Den</span>
          <select
            value={day}
            onChange={(e) => setDay(Number(e.target.value))}
            className="mt-1 block px-3 py-2 rounded-lg border border-[#E2E6F3] text-sm text-[#1a1a2e]"
          >
            {Array.from({ length: MAX_DAY }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d}>
                Den {d}
              </option>
            ))}
          </select>
        </label>
        <label
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold text-white cursor-pointer ${
            busy ? "opacity-60 pointer-events-none" : ""
          }`}
          style={{ backgroundColor: "#C4622D" }}
        >
          {busy ? "Nahrávám…" : `+ Nahrát fotky do Den ${day}`}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(e) => upload(e.target.files)}
          />
        </label>
      </div>
      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      {days.length === 0 ? (
        <p className="text-sm text-[#9AA3C2]">Zatím žádné fotky.</p>
      ) : (
        <div className="space-y-5">
          {days.map((d) => (
            <div key={d.day}>
              <div className="text-xs font-black uppercase tracking-wider text-[#5A6480] mb-2">
                Den {d.day} <span className="text-[#9AA3C2] font-normal">({d.photos.length})</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {d.photos.map((p) => (
                  <div key={p.url} className="relative aspect-square rounded-lg overflow-hidden bg-[#F0F2FA] group">
                    <Image src={p.url} alt="" fill sizes="120px" className="object-cover" unoptimized />
                    <button
                      type="button"
                      onClick={() => remove(p.url)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white text-xs opacity-0 group-hover:opacity-100 transition"
                      aria-label="Smazat"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
