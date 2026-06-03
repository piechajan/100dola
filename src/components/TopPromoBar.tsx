"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "100dola-promo-dismissed-2026-06";

/**
 * Top sticky promo bar — viditelný hned nad Navbar.
 * Dismissable s persistencí v localStorage (per měsíc — když se bumpne
 * STORAGE_KEY, všichni uvidí nový promo).
 *
 * Skip render dokud nehydratováno (vyhneme se layout shiftu při hydration).
 */
export default function TopPromoBar() {
  const [dismissed, setDismissed] = useState<boolean | null>(null);

  useEffect(() => {
    setDismissed(localStorage.getItem(STORAGE_KEY) === "1");
  }, []);

  if (dismissed !== false) return null;

  return (
    <div className="bg-[#1a1a2e] text-white text-xs">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-4 text-[11px] md:text-xs">
          <span className="flex items-center gap-1.5">
            <span aria-hidden="true">🚚</span>
            <span>
              <strong>Doprava zdarma</strong> nad 2 500 Kč
            </span>
          </span>
          <span className="hidden sm:inline text-white/40">·</span>
          <span className="hidden sm:flex items-center gap-1.5">
            <span aria-hidden="true">⏱</span>
            <span>Odesíláme do 2 dnů</span>
          </span>
          <span className="hidden md:inline text-white/40">·</span>
          <span className="hidden md:flex items-center gap-1.5">
            <span aria-hidden="true">🛡</span>
            <span>14 dní vrácení zdarma</span>
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            localStorage.setItem(STORAGE_KEY, "1");
            setDismissed(true);
          }}
          aria-label="Skrýt"
          className="text-white/60 hover:text-white shrink-0 p-0.5"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
