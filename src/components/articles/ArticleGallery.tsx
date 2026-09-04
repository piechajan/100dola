"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}

// Galerie fotek s klikacím zvětšením (lightbox).
export default function ArticleGallery({ images, alt }: { images: string[]; alt: string }) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-10">
        {images.map((src, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setOpen(src)}
            className="relative aspect-[3/4] rounded-xl overflow-hidden bg-[#F0F2FA] cursor-zoom-in group"
          >
            <Image
              src={src}
              alt={alt}
              fill
              sizes="(max-width: 768px) 50vw, 260px"
              className="object-cover group-hover:opacity-90 transition"
            />
          </button>
        ))}
      </div>

      {open && (
        <Portal>
          <div
            onClick={() => setOpen(null)}
            className="fixed inset-0 z-[999999] flex items-center justify-center p-4 cursor-zoom-out"
          >
            <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={open}
              alt={alt}
              className="relative rounded-2xl max-w-[92vw] max-h-[88vh] object-contain"
              style={{ boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}
            />
          </div>
        </Portal>
      )}
    </>
  );
}
