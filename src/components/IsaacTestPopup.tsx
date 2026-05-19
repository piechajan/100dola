"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "100dola-isaac-popup-dismissed";
const EVENT_END_ISO = "2026-06-01"; // den po skončení akce — popup mizí automaticky

export default function IsaacTestPopup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Po dni akce už nezobrazovat
    const today = new Date().toISOString().slice(0, 10);
    if (today >= EVENT_END_ISO) return;

    try {
      // sessionStorage = 1× per browser session.
      // Když user zavře tab a vrátí se, popup se zobrazí znova.
      // V jedné session ho ale ukáže jen jednou (po dismissu už ne).
      if (sessionStorage.getItem(STORAGE_KEY)) return;
    } catch {
      // ignore — show popup
    }

    // Krátký delay ať se stránka stihne načíst (ne hned při paintu)
    const t = setTimeout(() => setVisible(true), 1200);
    return () => clearTimeout(t);
  }, []);

  function dismiss() {
    try {
      sessionStorage.setItem(STORAGE_KEY, new Date().toISOString());
    } catch {
      // ignore
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Testovací jízdy ISAAC"
      className="fixed inset-0 z-[95] flex items-end md:items-center justify-center bg-black/70 p-4 animate-in fade-in duration-300"
      onClick={dismiss}
    >
      <div
        className="relative bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Color stripe */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#3B7CF4] via-[#E8431A] to-[#3B7CF4]" />

        {/* Close button */}
        <button
          type="button"
          onClick={dismiss}
          aria-label="Zavřít"
          className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center text-[#5A6480] hover:bg-[#F7F9FF] z-10"
        >
          ✕
        </button>

        <div className="p-6 md:p-8">
          <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#E8431A] mb-2">
            29.–31. května · Šternberk
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] leading-tight mb-2">
            Vyzkoušej ISAAC zdarma.
          </h2>
          <p className="text-sm text-[#5A6480] leading-relaxed mb-5">
            Tři dny testovacích jízd v obchodě 100dola sport ve Šternberku —{" "}
            <strong>10 road a gravel modelů</strong> (Meson, Element, Boson, Vitron, Kaon,
            Torus Xplore). Hodinová zápůjčka zdarma. V neděli dojezd Závodu Míru přímo na náměstí.
          </p>

          <div className="bg-[#F7F9FF] rounded-xl p-3 mb-5 text-xs text-[#5A6480]">
            <div className="font-bold text-[#1a1a2e] mb-1">Termíny</div>
            <div>Pá 29. 5. · 9:00–16:00</div>
            <div>So 30. 5. · 14:00–17:00</div>
            <div>Ne 31. 5. · 9:00–17:00</div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/isaac-test"
              onClick={dismiss}
              className="flex-1 min-w-[160px] inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#3B7CF4] text-white text-sm font-black hover:opacity-90"
            >
              Rezervovat termín →
            </Link>
            <button
              type="button"
              onClick={dismiss}
              className="px-4 py-3 rounded-full border border-[#E2E6F3] text-[#5A6480] text-xs font-bold hover:border-[#3B7CF4] hover:text-[#1a1a2e]"
            >
              Později
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
