"use client";

// Google Analytics 4 (gtag).
// Aktivuje se jen pokud je NEXT_PUBLIC_GA4_MEASUREMENT_ID nastaven (G-XXXXXXX).
// Plus support pro Google Ads conversion tracking přes NEXT_PUBLIC_GADS_ID (AW-XXXX).

import Script from "next/script";

const GA4_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;
const GADS_ID = process.env.NEXT_PUBLIC_GADS_ID;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export default function GoogleAnalytics() {
  if (!GA4_ID && !GADS_ID) return null;

  const configCalls: string[] = [];
  if (GA4_ID) configCalls.push(`gtag('config', '${GA4_ID}');`);
  if (GADS_ID) configCalls.push(`gtag('config', '${GADS_ID}');`);

  const primary = GA4_ID || GADS_ID!;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${primary}`}
        strategy="afterInteractive"
      />
      <Script
        id="ga4-init"
        strategy="afterInteractive"
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

/** Tracker pro custom events — volat z client komponent po conversion. */
export function trackGoogleEvent(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", event, params || {});
}
