// Order business logic — helpers shared between API a UI.
//
// Doprava cena se počítá podle metody + bulky flag:
// - personal-* → 0 Kč
// - zasilkovna / gls + hasBulky → 400 Kč
// - zasilkovna / gls + !hasBulky → 100 Kč
//
// Order ID formát: YYMMDDNNNN (10 znaků, vejde se do VS).

import type { OrderItemPayload, ShippingMethod, PaymentMethod } from "./schemas";

export const SMALL_PACKAGE_FEE = 100; // Kč s DPH
export const BULKY_PACKAGE_FEE = 400; // Kč s DPH

export function calcShippingFee(method: ShippingMethod, hasBulky: boolean): number {
  if (method.startsWith("personal-")) return 0;
  return hasBulky ? BULKY_PACKAGE_FEE : SMALL_PACKAGE_FEE;
}

export function calcSubtotal(items: OrderItemPayload[]): number {
  return items.reduce((sum, i) => sum + i.priceWithVat * i.qty, 0);
}

/** DPH se počítá zpětně z ceny vč. DPH, sečte se i přes různé sazby v košíku. */
export function calcVatTotals(items: OrderItemPayload[]): {
  withVat: number;
  withoutVat: number;
  vatAmount: number;
} {
  const withVat = calcSubtotal(items);
  const withoutVat = items.reduce(
    (sum, i) => sum + Math.round(i.priceWithVat / (1 + i.vatRate / 100)) * i.qty,
    0,
  );
  return { withVat, withoutVat, vatAmount: withVat - withoutVat };
}

export function calcOrderTotal(
  items: OrderItemPayload[],
  shippingMethod: ShippingMethod,
): { subtotal: number; shippingFee: number; total: number; hasBulky: boolean } {
  const subtotal = calcSubtotal(items);
  // Bulky flag dorazí z frontend (cart store). Pokud chybí, fallback na heuristiku
  // přes cenu (kola, lyže obvykle nad 5 000 Kč) — bezpečnější dražší doprava.
  const hasBulky = items.some((i) => i.bulky === true || (i.bulky === undefined && i.priceWithVat >= 5000));
  const shippingFee = calcShippingFee(shippingMethod, hasBulky);
  return { subtotal, shippingFee, total: subtotal + shippingFee, hasBulky };
}

export const SHIPPING_LABELS: Record<ShippingMethod, string> = {
  "personal-sternberk": "Osobní vyzvednutí — Šternberk",
  "personal-olomouc": "Osobní vyzvednutí — Olomouc",
  "personal-valasske-mezirici": "Osobní vyzvednutí — Valašské Meziříčí",
  zasilkovna: "Zásilkovna",
  gls: "GLS",
};

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  qr: "QR platba",
  "bank-transfer": "Bankovní převod",
  "cash-pickup": "Hotovost při převzetí",
  card: "Platební karta",
  "apple-pay": "Apple Pay",
  "google-pay": "Google Pay",
};

/**
 * Která platba je k dispozici pro danou shipping metodu?
 * - personal-* → všechny + hotovost
 * - zasilkovna/gls → vše kromě hotovosti
 */
export function isPaymentAvailable(payment: PaymentMethod, shipping: ShippingMethod): boolean {
  if (payment === "cash-pickup") {
    return shipping.startsWith("personal-");
  }
  return true;
}
