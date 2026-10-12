"use client";

// Seznam SEM (Sklik + Seznam Nákupy) — načte se POUZE po marketingovém souhlasu
// (stejný postoj jako Meta Pixel). Bez NEXT_PUBLIC_SEZNAM_SEM_ID je no-op.
//
// Pořadí podle dokumentace: sul.js → updateConsent → PageView. Události, které
// komponenty pošlou dřív, než je skript připravený, se řadí do fronty a po
// načtení se odešlou; bez souhlasu se zahazují (nikdy se neodesílají).

import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { readConsent, subscribeConsent } from "@/lib/cookies-consent";
import { semConsentMode } from "@/lib/seznam-sem";

const SEM_ID = process.env.NEXT_PUBLIC_SEZNAM_SEM_ID;
const QUEUE_MAX = 50;

type SemFn = (...args: unknown[]) => void;

declare global {
  interface Window {
    SEM?: SemFn;
  }
}

interface QueuedEvent {
  name: string;
  data?: Record<string, unknown>;
}

// Modulová fronta (sdílená komponentami v rámci stránky).
const queue: QueuedEvent[] = [];
let ready = false;

function send(name: string, data?: Record<string, unknown>) {
  if (typeof window === "undefined" || typeof window.SEM !== "function") return;
  if (data) window.SEM("track", name, data);
  else window.SEM("track", name);
}

/**
 * Pošle SEM událost (ViewContent, AddToCart, InitiateCheckout, Purchase …).
 * Je-li skript připravený, odešle ji hned; jinak ji drží ve frontě do načtení.
 * Bez NEXT_PUBLIC_SEZNAM_SEM_ID se nic neděje.
 */
export function trackSemEvent(name: string, data?: Record<string, unknown>) {
  if (!SEM_ID || typeof window === "undefined") return;
  if (ready) {
    send(name, data);
    return;
  }
  if (queue.length < QUEUE_MAX) queue.push({ name, data });
}

export default function SeznamSem() {
  const pathname = usePathname();
  const [allowed, setAllowed] = useState(false);
  const loadedRef = useRef(false);
  const lastPathRef = useRef<string | null>(null);

  useEffect(() => {
    const c = readConsent();
    setAllowed(!!c?.marketing);
    return subscribeConsent((next) => {
      setAllowed(!!next?.marketing);
      // Odvolání souhlasu za běhu: skript nejde odstranit, ale řekneme Seznamu „denied".
      if (ready && typeof window.SEM === "function") {
        window.SEM("updateConsent", semConsentMode(next));
      }
      // Bez marketingového souhlasu se nic neodesílá a fronta se zahodí.
      if (!next?.marketing) {
        ready = false;
        queue.length = 0;
      }
    });
  }, []);

  const flush = useCallback(() => {
    if (typeof window.SEM !== "function") return;
    window.SEM("updateConsent", semConsentMode(readConsent()));
    ready = true;
    lastPathRef.current = window.location.pathname;
    window.SEM("track", "PageView");
    for (const e of queue.splice(0)) send(e.name, e.data);
  }, []);

  // Souhlas udělen znovu, skript už je načtený → znovu inicializovat (consent + PageView).
  useEffect(() => {
    if (allowed && loadedRef.current && !ready) flush();
  }, [allowed, flush]);

  // SPA: PageView při každé změně route (první načtení řeší flush).
  useEffect(() => {
    if (!ready) return;
    if (lastPathRef.current === pathname) return;
    lastPathRef.current = pathname;
    send("PageView");
  }, [pathname]);

  if (!SEM_ID || !allowed) return null;

  return (
    <Script
      id="seznam-sem"
      src={`https://l.seznam.cz/sul.js?id=${encodeURIComponent(SEM_ID)}`}
      strategy="afterInteractive"
      onLoad={() => {
        if (loadedRef.current) return;
        loadedRef.current = true;
        flush();
      }}
      onReady={() => {
        // Při návratu na stránku (skript už je v DOM) onLoad nepřijde — dohoď inicializaci.
        if (!loadedRef.current && typeof window.SEM === "function") {
          loadedRef.current = true;
          flush();
        }
      }}
    />
  );
}
