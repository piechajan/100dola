"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import type { EventPhotoDay } from "@/lib/event-photos";

const ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
const roman = (n: number) => ROMAN[n] ?? String(n);

function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[999999] flex items-center justify-center p-4 cursor-zoom-out"
    >
      <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="relative rounded-2xl max-w-[92vw] max-h-[88vh] object-contain" />
    </div>,
    document.body,
  );
}

export default function EventDayGallery({ slug, color }: { slug: string; color: string }) {
  const [days, setDays] = useState<EventPhotoDay[]>([]);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(`/api/events/${slug}/photos`)
      .then((r) => r.json())
      .then((d) => {
        if (alive) setDays((d.days ?? []) as EventPhotoDay[]);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [slug]);

  if (days.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#E2E6F3]">
      <h3 className="font-black text-[#1a1a2e] mb-4 text-lg">Fotky po dnech</h3>
      <div className="space-y-6">
        {days.map((d) => (
          <div key={d.day}>
            <div className="flex items-center gap-2 mb-3">
              <span
                className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full text-white"
                style={{ backgroundColor: color }}
              >
                Den {roman(d.day)}
              </span>
              <span className="text-xs text-[#9AA3C2]">{d.photos.length} fotek</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {d.photos.map((p) => (
                <button
                  key={p.url}
                  type="button"
                  onClick={() => setOpen(p.url)}
                  className="relative aspect-square rounded-xl overflow-hidden bg-[#F0F2FA] cursor-zoom-in group"
                >
                  <Image
                    src={p.url}
                    alt={`${slug} — Den ${roman(d.day)}`}
                    fill
                    sizes="(max-width: 640px) 33vw, 200px"
                    className="object-cover group-hover:opacity-90 transition"
                    unoptimized
                  />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      {open && <Lightbox src={open} onClose={() => setOpen(null)} />}
    </div>
  );
}
