"use client";

// Microsoft Clarity — heatmaps + session recordings.
// Loaduje se POUZE pokud user souhlasil s "analytics" cookies.
// Bez NEXT_PUBLIC_CLARITY_PROJECT_ID je no-op.

import Script from "next/script";
import { useEffect, useState } from "react";
import { readConsent, subscribeConsent } from "@/lib/cookies-consent";

const PROJECT_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;

export default function MicrosoftClarity() {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const c = readConsent();
    setAllowed(!!c?.analytics);
    return subscribeConsent((next) => setAllowed(!!next?.analytics));
  }, []);

  if (!PROJECT_ID || !allowed) return null;

  return (
    <Script
      id="ms-clarity"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "${PROJECT_ID}");
        `,
      }}
    />
  );
}
