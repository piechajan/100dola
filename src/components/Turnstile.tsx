"use client";

import { useEffect, useRef } from "react";

// Cloudflare Turnstile — neviditelná ochrana proti botům.
//
// GRACEFUL NO-OP: když NEXT_PUBLIC_TURNSTILE_SITE_KEY není nastaven, komponenta
// vyrenderuje `null` (nic). Formulář se pak chová přesně jako dřív. Widget se
// aktivuje teprve až je site key nastaven (a server má i secret).

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js";

interface TurnstileRenderOptions {
  sitekey: string;
  callback: (token: string) => void;
  "expired-callback"?: () => void;
  "error-callback"?: () => void;
  theme?: "light" | "dark" | "auto";
  size?: "normal" | "compact" | "flexible";
}

interface TurnstileApi {
  render: (el: HTMLElement, opts: TurnstileRenderOptions) => string;
  remove: (widgetId: string) => void;
  reset: (widgetId?: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
    onloadTurnstileCallback?: () => void;
  }
}

/** Načte Turnstile api.js jednou (idempotentně) a resolve až je window.turnstile ready. */
function loadTurnstileScript(): Promise<TurnstileApi> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("no window"));
      return;
    }
    if (window.turnstile) {
      resolve(window.turnstile);
      return;
    }

    const finish = () => {
      if (window.turnstile) resolve(window.turnstile);
      else reject(new Error("turnstile not available after load"));
    };

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src^="${SCRIPT_SRC}"]`,
    );
    if (existing) {
      if (existing.dataset.loaded === "true" && window.turnstile) {
        resolve(window.turnstile);
      } else {
        existing.addEventListener("load", finish, { once: true });
        existing.addEventListener("error", () => reject(new Error("script load error")), {
          once: true,
        });
      }
      return;
    }

    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.addEventListener(
      "load",
      () => {
        script.dataset.loaded = "true";
        finish();
      },
      { once: true },
    );
    script.addEventListener("error", () => reject(new Error("script load error")), {
      once: true,
    });
    document.head.appendChild(script);
  });
}

interface Props {
  /** Volá se s tokenem při úspěchu, s "" při expiraci/chybě. */
  onToken: (token: string) => void;
  className?: string;
}

/**
 * Reusable Turnstile widget. Když site key chybí, renderuje null (no-op).
 */
export default function Turnstile({ onToken, className }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  // Držíme onToken v ref, ať se widget nererenderuje při každé změně callbacku.
  const onTokenRef = useRef(onToken);
  useEffect(() => {
    onTokenRef.current = onToken;
  }, [onToken]);

  useEffect(() => {
    if (!SITE_KEY) return;
    let cancelled = false;

    loadTurnstileScript()
      .then((api) => {
        if (cancelled || !containerRef.current || widgetIdRef.current) return;
        widgetIdRef.current = api.render(containerRef.current, {
          sitekey: SITE_KEY,
          theme: "auto",
          size: "flexible",
          callback: (token: string) => onTokenRef.current(token),
          "expired-callback": () => onTokenRef.current(""),
          "error-callback": () => onTokenRef.current(""),
        });
      })
      .catch((e) => {
        console.warn("[Turnstile] load/render failed:", e);
      });

    return () => {
      cancelled = true;
      const api = typeof window !== "undefined" ? window.turnstile : undefined;
      if (api && widgetIdRef.current) {
        try {
          api.remove(widgetIdRef.current);
        } catch {
          /* widget už mohl být odstraněn */
        }
      }
      widgetIdRef.current = null;
    };
  }, []);

  if (!SITE_KEY) return null;

  return <div ref={containerRef} className={className} />;
}

/** True když je Turnstile na klientu nakonfigurován (site key nastaven). */
export const isTurnstileConfigured = Boolean(SITE_KEY);
