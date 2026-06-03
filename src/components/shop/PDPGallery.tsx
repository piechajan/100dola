"use client";

import { useState } from "react";
import Image from "next/image";

interface BadgeColor {
  [key: string]: string;
}

const BADGE_COLORS: BadgeColor = {
  "Doporučuje tým": "#E8431A",
  "Novinka": "#2EAA6E",
  "Buď vidět": "#3B7CF4",
};

interface PDPGalleryProps {
  mainPhoto: string;
  gallery?: string[];
  alt: string;
  badges?: string[];
}

/**
 * PDP galerie — main image + thumbnail strip dole.
 * Klik na thumb → swap main. Fallback na single image když gallery undef.
 */
export default function PDPGallery({ mainPhoto, gallery, alt, badges = [] }: PDPGalleryProps) {
  const allImages = gallery && gallery.length > 0 ? gallery : [mainPhoto];
  const [active, setActive] = useState(0);
  const currentImage = allImages[active] ?? mainPhoto;

  return (
    <div className="flex flex-col gap-4">
      {/* Main image */}
      <div className="bg-white rounded-3xl border border-[#E2E6F3] aspect-square relative overflow-hidden">
        <Image
          key={currentImage}
          src={currentImage}
          alt={alt}
          fill
          sizes="(max-width: 1024px) 100vw, 60vw"
          className="object-contain p-8"
          priority
          unoptimized={currentImage.startsWith("/api/img/")}
        />
        {badges.length > 0 && (
          <div className="absolute top-5 left-5 flex flex-col gap-2 z-10">
            {badges.map((b) => (
              <span
                key={b}
                className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full text-white"
                style={{ backgroundColor: BADGE_COLORS[b] ?? "#1a1a1a" }}
              >
                {b}
              </span>
            ))}
          </div>
        )}
        {allImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => setActive((a) => (a - 1 + allImages.length) % allImages.length)}
              aria-label="Předchozí fotka"
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 border border-[#E2E6F3] flex items-center justify-center hover:bg-white shadow-sm z-10"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setActive((a) => (a + 1) % allImages.length)}
              aria-label="Další fotka"
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 border border-[#E2E6F3] flex items-center justify-center hover:bg-white shadow-sm z-10"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full bg-black/60 text-white text-[10px] font-bold">
              {active + 1} / {allImages.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {allImages.length > 1 && (
        <div className="grid grid-cols-6 gap-2">
          {allImages.slice(0, 12).map((url, i) => (
            <button
              key={url + i}
              type="button"
              onClick={() => setActive(i)}
              className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                i === active
                  ? "border-[#3B7CF4]"
                  : "border-[#E2E6F3] hover:border-[#9AA3C2]"
              }`}
              aria-label={`Zobrazit fotku ${i + 1}`}
            >
              <Image
                src={url}
                alt=""
                fill
                sizes="100px"
                className="object-contain p-1"
                unoptimized={url.startsWith("/api/img/")}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
