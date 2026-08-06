"use client";

import { useEffect, useRef, useState } from "react";

// Oficiální Packeta (Zásilkovna) widget — viz https://docs.packeta.com/docs/widget-v6.
// Klíč čistě z env (NEXT_PUBLIC_PACKETA_API_KEY). Bez env se widget neotevře —
// viz guard níže. Žádný hardcoded fallback klíč v kódu.
const PACKETA_API_KEY = process.env.NEXT_PUBLIC_PACKETA_API_KEY;
const SCRIPT_URL = "https://widget.packeta.com/v6/www/js/library.js";

interface PacketaPoint {
  id: number;
  name: string;
  city: string;
  street: string;
  zip: string;
  country: string;
  // ... další pole, viz docs
}

declare global {
  interface Window {
    Packeta?: {
      Widget: {
        pick: (
          apiKey: string,
          callback: (point: PacketaPoint | null) => void,
          options?: Record<string, unknown>,
        ) => void;
      };
    };
  }
}

interface Props {
  value?: string; // text výběru (zobrazený v inputu)
  onChange: (display: string, point: PacketaPoint | null) => void;
  required?: boolean;
}

export default function ZasilkovnaPicker({ value, onChange, required }: Props) {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.Packeta) {
      setScriptLoaded(true);
      return;
    }

    // Load script once
    const existing = document.querySelector(`script[src="${SCRIPT_URL}"]`);
    if (existing) {
      existing.addEventListener("load", () => setScriptLoaded(true));
      return;
    }

    const script = document.createElement("script");
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);
    scriptRef.current = script;

    return () => {
      // Nech script v DOM — pickne ho i druhá instance widgetu, ne re-load
    };
  }, []);

  const handleOpen = () => {
    if (!PACKETA_API_KEY) {
      console.warn("[Zasilkovna] NEXT_PUBLIC_PACKETA_API_KEY není nastaven — widget nelze otevřít");
      return;
    }
    if (!scriptLoaded || !window.Packeta) {
      console.warn("[Zasilkovna] widget script not loaded yet");
      return;
    }
    window.Packeta.Widget.pick(
      PACKETA_API_KEY,
      (point) => {
        if (!point) return;
        const display = `${point.name} — ${point.street}, ${point.zip} ${point.city}`;
        onChange(display, point);
      },
      {
        country: "cz",
        language: "cs",
        weight: 5, // kg, ovlivňuje filtrované pobočky
      },
    );
  };

  return (
    <div>
      <div className="flex gap-2">
        <input
          type="text"
          value={value || ""}
          readOnly
          required={required}
          placeholder="Klikni 'Vybrat pobočku'"
          className="flex-1 px-4 py-3 rounded-xl text-sm bg-white border border-[#E2E6F3] text-[#1a1a2e] placeholder-[#C0C7D8] focus:outline-none focus:border-[#3B7CF4] transition-colors"
        />
        <button
          type="button"
          onClick={handleOpen}
          disabled={!scriptLoaded || !PACKETA_API_KEY}
          className="shrink-0 px-5 py-3 text-sm font-bold text-white rounded-xl bg-[#3B7CF4] hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {scriptLoaded ? "Vybrat pobočku" : "Načítám…"}
        </button>
      </div>
      <p className="text-[11px] text-[#9AA3C2] mt-1.5">
        Otevře se mapka, vyber si nejbližší výdejní místo Zásilkovny.
      </p>
    </div>
  );
}
