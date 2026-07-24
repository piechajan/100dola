"use client";

// Meta Pixel — načte se POUZE pokud user souhlasil s "marketing" cookies.
// Bez NEXT_PUBLIC_META_PIXEL_ID je no-op.

import Script from "next/script";
import { useEffect, useState } from "react";
import { readConsent, subscribeConsent } from "@/lib/cookies-consent";

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

export default function MetaPixel() {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const c = readConsent();
    setAllowed(!!c?.marketing);
    return subscribeConsent((next) => setAllowed(!!next?.marketing));
  }, []);

  if (!PIXEL_ID || !allowed) return null;

  return (
    <>
      <Script
        id="meta-pixel"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${PIXEL_ID}');
            fbq('track', 'PageView');
          `,
        }}
      />
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          alt=""
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  );
}

/**
 * Tracker pro custom events — spustí jen pokud je pixel načtený.
 * `eventID` musí být shodné s CAPI event_id (server) → Meta deduplikace.
 */
export function trackMetaEvent(
  event: string,
  params?: Record<string, unknown>,
  eventID?: string,
) {
  if (typeof window === "undefined" || !window.fbq) return;
  window.fbq("track", event, params || {}, eventID ? { eventID } : undefined);
}
