"use client";

import { useState } from "react";
import Link from "next/link";
import { MALAGA_BRAND, FAQ_PREVIEW } from "@/data/malaga";

const accent = MALAGA_BRAND.color;

export default function MalagaFAQPreview() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="py-20 md:py-28" style={{ backgroundColor: MALAGA_BRAND.colorTint }}>
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-12 lg:gap-20 items-start">
          {/* Left — header */}
          <div className="lg:sticky lg:top-28">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-5 h-px" style={{ backgroundColor: accent }} />
              <span className="text-xs tracking-[0.18em] uppercase font-bold" style={{ color: accent }}>
                Časté otázky
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-[#1a1a2e] leading-[0.95]">
              Co lidi<br />zajímá nejvíc.
            </h2>
            <p className="mt-5 text-[#5A6480] leading-relaxed">
              Krátké odpovědi na to, co se nás ptáte před první cestou.
            </p>
          </div>

          {/* Right — accordion */}
          <div>
            <div className="space-y-3">
              {FAQ_PREVIEW.map((item, i) => {
                const isOpen = open === i;
                return (
                  <div
                    key={item.q}
                    className="rounded-2xl bg-white border border-[#E2E6F3] overflow-hidden"
                  >
                    <button
                      onClick={() => setOpen(isOpen ? null : i)}
                      className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-[#FAFAFC] transition-colors"
                    >
                      <span className="font-bold text-[#1a1a2e] text-base">{item.q}</span>
                      <svg
                        width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={accent} strokeWidth={2.5}
                        className={`shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-5 text-sm text-[#5A6480] leading-relaxed">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex items-center gap-3 text-sm">
              <span className="text-[#9AA3C2]">Máš jinou otázku?</span>
              <Link
                href="#poptavka"
                className="font-bold underline underline-offset-4"
                style={{ color: accent }}
              >
                Napiš nám
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
