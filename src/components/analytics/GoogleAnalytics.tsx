"use client";

// Google Analytics 4 + Google Ads — načte se POUZE pokud user souhlasil s
// "analytics" cookies. Bez env IDs je no-op.

import Script from "next/script";
import { useEffect, useState } from "react";
import { readConsent, subscribeConsent } from "@/lib/cookies-consent";

const GA4_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;
const GADS_ID = process.env.NEXT_PUBLIC_GADS_ID;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export default function GoogleAnalytics() {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const c = readConsent();
    setAllowed(!!c?.analytics);
    return subscribeConsent((next) => setAllowed(!!next?.analytics));
  }, []);

  if ((!GA4_ID && !GADS_ID) || !allowed) return null;

  const configCalls: string[] = [];
  if (GA4_ID) configCalls.push(`gtag('config', '${GA4_ID}', { anonymize_ip: true });`);
  if (GADS_ID) configCalls.push(`gtag('config', '${GADS_ID}');`);

  const primary = GA4_ID || GADS_ID!;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${primary}`}
        strategy="lazyOnload"
      />
      <Script
        id="ga4-init"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('js', new Date());
            ${configCalls.join("\n            ")}
          `,
        }}
      />
    </>
  );
}

export function trackGoogleEvent(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", event, params || {});
}
