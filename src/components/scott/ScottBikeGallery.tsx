"use client";

import { useState } from "react";
import Image from "next/image";

interface Props {
  photos: string[];
  alt: string;
}

export default function ScottBikeGallery({ photos, alt }: Props) {
  const [active, setActive] = useState(0);
  const current = photos[active] ?? photos[0];

  return (
    <div>
      {/* Hlavní fotka */}
      <div className="relative aspect-[3/2] rounded-2xl overflow-hidden bg-[#E9EEF9] border border-[#E2E6F3]">
        <Image
          src={current}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 900px"
          className="object-cover"
          priority
        />
      </div>

      {/* Náhledy */}
      {photos.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {photos.map((p, i) => (
            <button
              key={p}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`${alt} — fotka ${i + 1}`}
              aria-current={i === active}
              className={`relative aspect-[4/3] w-24 flex-shrink-0 rounded-xl overflow-hidden border-2 transition ${
                i === active ? "border-[#3B7CF4]" : "border-[#E2E6F3] hover:border-[#3B7CF4]/40"
              }`}
            >
              <Image
                src={p}
                alt=""
                fill
                sizes="96px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
