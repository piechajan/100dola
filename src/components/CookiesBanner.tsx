"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/**
 * Minimální cookies banner — GDPR / ePrivacy.
 * - Nezbytné cookies (login, košík, CSRF) jsou OK bez souhlasu (vyňaty z ePrivacy)
 * - Analytika / marketing — vyžaduje souhlas
 *
 * Persist via localStorage. První render server-side prázdný (žádný blink).
 * Banner se zobrazí jen pokud uživatel nezvolil "Přijmout" / "Odmítnout".
 */

const STORAGE_KEY = "100dola-cookies-consent";

interface ConsentState {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  decidedAt: string;
}

export default function CookiesBanner() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  const save = (a: boolean, m: boolean) => {
    const state: ConsentState = {
      necessary: true,
      analytics: a,
      marketing: m,
      decidedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
    setVisible(false);
    // Future: dispatch event for analytics scripts to react
    window.dispatchEvent(new CustomEvent("cookies-consent", { detail: state }));
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-[90]">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#E2E6F3] p-5 md:p-6">
        <div className="text-xs tracking-[0.18em] uppercase font-bold text-[#3B7CF4] mb-2">
          Cookies
        </div>
        <h2 className="text-base font-black text-[#1a1a2e] mb-2 leading-tight">
          Tahle stránka používá cookies.
        </h2>
        <p className="text-xs text-[#5A6480] leading-relaxed mb-4">
          Nezbytné cookies (košík, login) běží vždy. Analytika a marketing jen pokud souhlasíš. Podrobnosti v{" "}
          <Link href="/zasady-cookies" className="font-bold text-[#3B7CF4] hover:underline">
            zásadách cookies
          </Link>.
        </p>

        {showDetails && (
          <div className="mb-4 space-y-2">
            <label className="flex items-start gap-2 text-xs text-[#5A6480]">
              <input type="checkbox" checked disabled className="mt-0.5" />
              <span><strong className="text-[#1a1a2e]">Nezbytné</strong> — košík, přihlášení (vždy zapnuto)</span>
            </label>
            <label className="flex items-start gap-2 text-xs text-[#5A6480] cursor-pointer">
              <input
                type="checkbox"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
                className="mt-0.5 accent-[#3B7CF4]"
              />
              <span><strong className="text-[#1a1a2e]">Analytika</strong> — anonymní statistiky návštěvnosti</span>
            </label>
            <label className="flex items-start gap-2 text-xs text-[#5A6480] cursor-pointer">
              <input
                type="checkbox"
                checked={marketing}
                onChange={(e) => setMarketing(e.target.checked)}
                className="mt-0.5 accent-[#3B7CF4]"
              />
              <span><strong className="text-[#1a1a2e]">Marketing</strong> — remarketing, sociální sítě</span>
            </label>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {showDetails ? (
            <>
              <button
                type="button"
                onClick={() => save(analytics, marketing)}
                className="px-4 py-2.5 text-xs font-bold text-white rounded-full bg-[#3B7CF4] hover:opacity-90"
              >
                Uložit volbu
              </button>
              <button
                type="button"
                onClick={() => save(true, true)}
                className="px-4 py-2.5 text-xs font-bold rounded-full border border-[#E2E6F3] text-[#1a1a2e] hover:border-[#3B7CF4]"
              >
                Přijmout vše
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => save(true, true)}
                className="px-4 py-2.5 text-xs font-bold text-white rounded-full bg-[#3B7CF4] hover:opacity-90"
              >
                Přijmout vše
              </button>
              <button
                type="button"
                onClick={() => save(false, false)}
                className="px-4 py-2.5 text-xs font-bold rounded-full border border-[#E2E6F3] text-[#1a1a2e] hover:border-[#3B7CF4]"
              >
                Odmítnout
              </button>
              <button
                type="button"
                onClick={() => setShowDetails(true)}
                className="px-4 py-2.5 text-xs font-bold text-[#5A6480] hover:text-[#3B7CF4]"
              >
                Detail
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
