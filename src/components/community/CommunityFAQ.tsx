"use client";

import { useState } from "react";
import { COMMUNITY_FAQ } from "@/data/community-faq";

export default function CommunityFAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="bg-white py-20 md:py-24">
      <div className="max-w-[900px] mx-auto px-6 md:px-12">
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-5 h-px bg-[#2EAA6E]" />
            <span className="text-xs tracking-[0.18em] uppercase font-bold text-[#2EAA6E]">Otázky před první akcí</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-[#1a1a2e] tracking-tight leading-[1.1]">
            Co se ptají nejčastěji.
          </h2>
          <div className="mt-6 w-12 h-px bg-[#2EAA6E]" />
        </div>

        <div className="space-y-2">
          {COMMUNITY_FAQ.map((item, idx) => {
            const isOpen = open === idx;
            return (
              <div
                key={item.q}
                className={`rounded-2xl border transition-colors ${
                  isOpen ? "border-[#2EAA6E]/30 bg-[#EDFAF3]" : "border-[#E2E6F3] bg-white"
                }`}
              >
                <button
                  type="button"
                  className="w-full text-left px-6 py-5 flex items-center justify-between gap-4"
                  onClick={() => setOpen(isOpen ? null : idx)}
                >
                  <span className="text-base font-bold text-[#1a1a2e] leading-snug">
                    {item.q}
                  </span>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#2EAA6E"
                    strokeWidth={2.5}
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

        <p className="mt-10 text-sm text-[#9AA3C2] text-center">
          Pořád si nejistá / nejistý?{" "}
          <a href="mailto:info@100dola.com" className="text-[#2EAA6E] font-bold hover:underline">
            Napiš nám
          </a>
          {" "}— odpovíme do 24 hodin.
        </p>
      </div>
    </section>
  );
}
