"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/**
 * Mobile-first sticky CTA bar — zobrazí se po scrollu pod 30 % stránky.
 * Slabě překryje obsah, nepřekáží na desktopu (max-width container).
 */
export default function SparkStickyCTA() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let raf = 0;
    function onScroll() {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const doc = document.documentElement;
        const scrolled = (window.scrollY + window.innerHeight) / doc.scrollHeight;
        setVisible(scrolled > 0.3 && scrolled < 0.92);
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  if (dismissed) return null;

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 pointer-events-none transition-all duration-300 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
      }`}
      aria-hidden={!visible}
    >
      <div className="max-w-[820px] mx-auto px-3 pb-3 md:pb-4 pointer-events-auto">
        <div className="bg-[#1a1a2e] text-white rounded-2xl shadow-2xl border border-white/10 px-4 py-3 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#7AA3FF]">
              Předobjednávka otevřená
            </div>
            <div className="text-sm font-black truncate">Scott Spark RC 2027</div>
          </div>
          <Link
            href="/predobjednavka/spark-rc-2027"
            className="bg-[#3B7CF4] hover:bg-[#5C92F6] text-white font-bold text-sm px-4 py-2.5 rounded-xl whitespace-nowrap transition"
          >
            Předobjednat →
          </Link>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label="Zavřít"
            className="text-white/40 hover:text-white/80 text-lg leading-none px-1"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
