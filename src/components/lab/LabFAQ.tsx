"use client";

import { useState } from "react";
import { LAB_BRAND, LAB_FAQ } from "@/data/lab";

const brassDark = LAB_BRAND.brassDark;

export default function LabFAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="bg-white py-20 md:py-28">
      <div className="max-w-[900px] mx-auto px-6 md:px-12">
        <div className="mb-12">
          <div className="text-xs tracking-[0.22em] uppercase font-bold mb-3" style={{ color: brassDark }}>
            Otázky
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-[#1a1a2e] tracking-tight leading-[1.1]">
            Co se ptají nejčastěji.
          </h2>
        </div>

        <div className="space-y-2">
          {LAB_FAQ.map((item, idx) => {
            const isOpen = open === idx;
            return (
              <div
                key={item.q}
                className={`rounded-2xl border transition-colors ${
                  isOpen ? "border-[#1F4937]/30 bg-[#F5F7FF]" : "border-[#E2E6F3] bg-white"
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
                    stroke="currentColor"
                    strokeWidth={2.5}
                    className={`text-[#1F4937] shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
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
      </div>
    </section>
  );
}
