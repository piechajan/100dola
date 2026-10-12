"use client";

// SEM událost Purchase na děkovné stránce objednávky (/objednavka/[id]).
// Odešle se právě jednou na objednávku a jen pro čerstvou objednávku — otevření
// starého odkazu z e-mailu nesmí započítat konverzi znovu.

import { useEffect } from "react";
import { trackSemEvent } from "@/components/analytics/SeznamSem";
import { semPurchaseData, type SemItemInput } from "@/lib/seznam-sem";

const FRESH_MS = 30 * 60 * 1000;

interface Props {
  orderId: string;
  /** ISO čas vytvoření objednávky. */
  registeredAt: string;
  items: SemItemInput[];
  shippingFee: number;
  deliveryLabel: string;
}

export default function SeznamSemPurchase({
  orderId,
  registeredAt,
  items,
  shippingFee,
  deliveryLabel,
}: Props) {
  useEffect(() => {
    const age = Date.now() - new Date(registeredAt).getTime();
    if (!Number.isFinite(age) || age > FRESH_MS) return;
    const key = `sem-purchase-${orderId}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // sessionStorage nedostupné — raději odeslat jednou (Sklik má vlastní 3min ochranu).
    }
    trackSemEvent("Purchase", semPurchaseData({ orderId, items, shippingFee, deliveryLabel }));
    // Objednávka se na stránce nemění (server-rendered).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
