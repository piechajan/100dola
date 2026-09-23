"use client";

import { useState } from "react";

export default function ShareButton({ url, title }: { url: string; title: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const enc = encodeURIComponent;
  const xUrl = `https://twitter.com/intent/tweet?url=${enc(url)}&text=${enc(title)}`;
  const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const nativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
        return true;
      } catch {
        /* zrušeno / nepodporováno */
      }
    }
    return false;
  };

  // Instagram nemá web share intent → nativní share (mobil) nebo kopírování odkazu.
  const instagram = async () => {
    const shared = await nativeShare();
    if (!shared) await copy();
  };

  const itemClass =
    "flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-semibold text-[#1a1a2e] hover:bg-[#F0F2FA] transition-colors text-left";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full py-3 rounded-xl border-2 border-[#E2E6F3] text-sm font-semibold text-[#9AA3C2] hover:border-[#1a1a2e] hover:text-[#1a1a2e] transition-colors flex items-center justify-center gap-2"
      >
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
        Sdílet akci
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} aria-hidden />
          <div className="absolute z-20 left-0 right-0 mt-2 bg-white rounded-xl border border-[#E2E6F3] shadow-lg p-1.5">
            <a href={xUrl} target="_blank" rel="noopener noreferrer" className={itemClass} onClick={() => setOpen(false)}>
              <span aria-hidden className="w-5 text-center font-black">𝕏</span> Sdílet na X
            </a>
            <a href={fbUrl} target="_blank" rel="noopener noreferrer" className={itemClass} onClick={() => setOpen(false)}>
              <span aria-hidden className="w-5 text-center font-black text-[#1877F2]">f</span> Sdílet na Facebook
            </a>
            <button type="button" className={itemClass} onClick={() => { instagram(); setOpen(false); }}>
              <span aria-hidden className="w-5 text-center">📸</span> Sdílet na Instagram
            </button>
            <button type="button" className={itemClass} onClick={copy}>
              <span aria-hidden className="w-5 text-center">🔗</span> {copied ? "Odkaz zkopírován ✓" : "Kopírovat odkaz"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
