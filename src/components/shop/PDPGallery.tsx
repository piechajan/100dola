"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import { isProxiedImage } from "@/lib/shop/image-utils";
import { usePdpImage } from "@/lib/pdp-image-store";

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
  const allImages = useMemo(
    () => (gallery && gallery.length > 0 ? gallery : [mainPhoto]),
    [gallery, mainPhoto],
  );
  const [active, setActive] = useState(0);
  const currentImage = allImages[active] ?? mainPhoto;

  // Fullscreen lightbox (klik na hlavní náhled → detailní prohlížeč).
  const [lightbox, setLightbox] = useState(false);

  const next = useCallback(
    () => setActive((a) => (a + 1) % allImages.length),
    [allImages.length],
  );
  const prev = useCallback(
    () => setActive((a) => (a - 1 + allImages.length) % allImages.length),
    [allImages.length],
  );

  // Sync s výběrem barvy v PdpBuyBox — přepni hlavní obrázek na foto zvolené barvy.
  const selectedPhoto = usePdpImage((s) => s.photo);
  useEffect(() => {
    if (!selectedPhoto) return;
    const idx = allImages.indexOf(selectedPhoto);
    if (idx >= 0) setActive(idx);
  }, [selectedPhoto, allImages]);

  // Klávesy + zamknout scroll když je lightbox otevřený.
  useEffect(() => {
    if (!lightbox) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLightbox(false);
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    }
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [lightbox, next, prev]);

  return (
    <div className="flex flex-col gap-4">
      {/* Main image */}
      <div className="bg-white rounded-3xl border border-[#E2E6F3] aspect-square relative overflow-hidden group">
        <button
          type="button"
          onClick={() => setLightbox(true)}
          aria-label="Zvětšit fotku"
          className="absolute inset-0 z-[5] cursor-zoom-in"
        />
        <Image
          key={currentImage}
          src={currentImage}
          alt={alt}
          fill
          sizes="(max-width: 1024px) 100vw, 60vw"
          className="object-contain p-8 pointer-events-none"
          priority
          unoptimized={isProxiedImage(currentImage)}
        />
        {/* Hint na zvětšení */}
        <span className="absolute top-5 right-5 z-10 w-9 h-9 rounded-full bg-white/90 border border-[#E2E6F3] flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1a1a2e" strokeWidth={2.5}>
            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
          </svg>
        </span>
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
              onClick={prev}
              aria-label="Předchozí fotka"
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 border border-[#E2E6F3] flex items-center justify-center hover:bg-white shadow-sm z-10"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={next}
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
                unoptimized={isProxiedImage(url)}
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
          onClick={() => setLightbox(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Detail fotky"
        >
          <button
            type="button"
            onClick={() => setLightbox(false)}
            aria-label="Zavřít"
            className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center z-10"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>

          <div
            className="relative w-[92vw] h-[86vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              key={currentImage}
              src={currentImage}
              alt={alt}
              fill
              sizes="92vw"
              className="object-contain select-none"
              unoptimized={isProxiedImage(currentImage)}
            />
          </div>

          {allImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); prev(); }}
                aria-label="Předchozí fotka"
                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center z-10"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); next(); }}
                aria-label="Další fotka"
                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center z-10"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </button>
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-white/10 text-white text-xs font-bold">
                {active + 1} / {allImages.length}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
