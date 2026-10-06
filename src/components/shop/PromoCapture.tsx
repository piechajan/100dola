"use client";

import { useEffect } from "react";
import { PROMO_STORAGE_KEY, ACTIVE_PROMO, isPromoLive } from "@/lib/promo";

/**
 * Zachytí `?kod=100dola` z URL a schová ho do localStorage.
 *
 * Reklama vede na odkaz s kódem v URL, takže zákazník ho nemusí opisovat —
 * checkout si ho pak sám předvyplní. Nejčastější místo, kde se slevové kódy
 * ztrácejí, je právě to přepisování z reklamy do formuláře.
 *
 * Kód z URL se nevaliduje tady; jen se uloží. Platnost řeší server při
 * uplatnění, takže podvržené `?kod=` nic nezíská.
 */
export default function PromoCapture() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const fromUrl = new URLSearchParams(window.location.search).get("kod");
    if (!fromUrl) return;
    if (!ACTIVE_PROMO || !isPromoLive()) return;
    if (fromUrl.trim().toLowerCase() !== ACTIVE_PROMO.code.toLowerCase()) return;
    try {
      window.localStorage.setItem(PROMO_STORAGE_KEY, ACTIVE_PROMO.code);
    } catch {
      // Soukromý režim prohlížeče — kód se jen nepředvyplní, nic se nerozbije.
    }
  }, []);

  return null;
}
