"use client";

// Heureka.cz "Měření konverzí / Ověřeno zákazníky" — OCM SDK (client-side).
//
// Dva režimy:
//  - product_detail: jen načte SDK (nastaví "přišel z Heureky" cookie).
//  - thank_you: načte SDK + pošle reálná data objednávky (Order konverze).
//
// Klíč z env: NEXT_PUBLIC_HEUREKA_API_KEY. Bez klíče je thank_you no-op
// (product_detail SDK klíč nepotřebuje, ale kvůli konzistenci držíme guard
// jen na thank_you větvi — samotné načtení SDK je bez klíče bezpečné).
//
// Poznámka ke consentu: OCM je měření konverze objednávky, kterou uživatel
// sám inicioval proklikem z Heureky — Heureka to řadí pod oprávněný zájem
// (nezávislé na marketingových cookies). Proto NEgatujeme na marketing consent.

import { useEffect, useRef } from "react";

type HeurekaFn = ((...args: unknown[]) => void) & {
  q?: unknown[];
  c?: string;
};

declare global {
  interface Window {
    heureka?: HeurekaFn;
    ROIDataObject?: string;
  }
}

const KEY = process.env.NEXT_PUBLIC_HEUREKA_API_KEY;

export interface HeurekaOrderItem {
  itemId: string;
  name: string;
  unitPriceWithVat: number;
  qty: number;
}

type HeurekaOcmProps =
  | { page: "product_detail" }
  | {
      page: "thank_you";
      orderId: string;
      items: HeurekaOrderItem[];
      totalWithVat: number;
    };

/**
 * Načte OCM SDK přesně podle Heureka loaderu (IIFE). Idempotentní přes
 * window.heureka guard — SDK se ale i tak injektuje jen jednou díky ref v efektu.
 */
function loadHeurekaSdk(page: "product_detail" | "thank_you"): void {
  const t = window;
  const r = document;
  const k = "heureka";
  t.ROIDataObject = k;
  t.heureka =
    t.heureka ||
    (Object.assign(
      function (...args: unknown[]) {
        (t.heureka!.q = t.heureka!.q || []).push(args);
      },
      { c: "cz" },
    ) as HeurekaFn);
  const n = r.createElement("script");
  const g = r.getElementsByTagName("script")[0];
  n.async = true;
  n.src = `https://www.heureka.cz/ocm/sdk.js?version=2&page=${page}`;
  g.parentNode?.insertBefore(n, g);
}

export default function HeurekaOcm(props: HeurekaOcmProps): null {
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    if (typeof window === "undefined") return;

    if (props.page === "product_detail") {
      firedRef.current = true;
      loadHeurekaSdk("product_detail");
      return;
    }

    // thank_you — vyžaduje klíč a reálná data objednávky.
    if (!KEY) return;
    firedRef.current = true;

    loadHeurekaSdk("thank_you");
    const heureka = window.heureka;
    if (!heureka) return;

    heureka("authenticate", KEY);
    heureka("set_order_id", props.orderId);
    for (const item of props.items) {
      heureka(
        "add_product",
        item.itemId,
        item.name,
        String(item.unitPriceWithVat),
        String(item.qty),
      );
    }
    heureka("set_total_vat", String(props.totalWithVat));
    heureka("set_currency", "CZK");
    heureka("send", "Order");
    // Props objednávky se během života stránky nemění (server-rendered).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
