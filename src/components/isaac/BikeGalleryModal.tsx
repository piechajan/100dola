"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { IsaacBike } from "@/data/isaac-bikes";

interface Props {
  bike: IsaacBike | null;
  onClose: () => void;
}

export default function BikeGalleryModal({ bike, onClose }: Props) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (bike) setIndex(0);
  }, [bike]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!bike) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setIndex((i) => Math.min(i + 1, bike.photos.length - 1));
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(i - 1, 0));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [bike, onClose]);

  if (!bike) return null;

  const hasPhotos = bike.photos.length > 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Galerie ${bike.model} ${bike.color}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 p-4 md:p-5 border-b border-[#E2E6F3]">
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-wider font-bold text-[#3B7CF4]">
              {bike.category === "road" ? "Road" : "Gravel"}
            </div>
            <h3 className="text-lg md:text-xl font-black text-[#1a1a2e] truncate">
              {bike.model} <span className="font-normal text-[#5A6480]">·</span> {bike.color}
            </h3>
            <p className="text-xs text-[#5A6480]">
              {bike.groupset} · vel. {bike.size}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#5A6480] hover:bg-[#F7F9FF] flex-shrink-0"
            aria-label="Zavřít galerii"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="relative bg-[#F7F9FF] aspect-[4/3] flex items-center justify-center">
          {hasPhotos ? (
            <>
              <Image
                src={bike.photos[index]}
                alt={`${bike.model} ${bike.color} — fotka ${index + 1}`}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 768px"
                quality={75}
                priority
              />
              {bike.photos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setIndex((i) => Math.max(i - 1, 0))}
                    disabled={index === 0}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white disabled:opacity-30 flex items-center justify-center font-black text-[#1a1a2e] shadow-lg"
                    aria-label="Předchozí"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setIndex((i) => Math.min(i + 1, bike.photos.length - 1))
                    }
                    disabled={index === bike.photos.length - 1}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white disabled:opacity-30 flex items-center justify-center font-black text-[#1a1a2e] shadow-lg"
                    aria-label="Další"
                  >
                    ›
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs font-bold rounded-full px-3 py-1">
                    {index + 1} / {bike.photos.length}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center text-center px-6">
              <div
                className="w-32 h-32 rounded-2xl mb-4 border border-[#E2E6F3]"
                style={{ backgroundColor: bike.colorHex }}
                aria-hidden
              />
              <p className="text-sm text-[#5A6480] max-w-xs">
                Fotky tohoto modelu doplníme — zatím barevný náhled.
              </p>
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {hasPhotos && bike.photos.length > 1 && (
          <div className="flex gap-2 p-3 overflow-x-auto border-t border-[#E2E6F3]">
            {bike.photos.map((p, i) => (
              <button
                key={p}
                type="button"
                onClick={() => setIndex(i)}
                className={`relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition ${
                  i === index ? "border-[#3B7CF4]" : "border-transparent"
                }`}
              >
                <Image
                  src={p}
                  alt={`${bike.model} ${bike.color} — náhled ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                  quality={70}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
