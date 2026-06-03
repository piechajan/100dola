// Order business logic — helpers shared between API a UI.
//
// Doprava cena se počítá podle metody + bulky flag:
// - personal-* → 0 Kč
// - subtotal ≥ FREE_SHIPPING_THRESHOLD → 0 Kč (i pro bulky — konzistentní s promo "doprava zdarma nad 2 500 Kč")
// - zasilkovna / gls + hasBulky + pod threshold → 400 Kč
// - zasilkovna / gls + !hasBulky + pod threshold → 100 Kč
//
// Order ID formát: YYMMDDNNNN (10 znaků, vejde se do VS).

import type { OrderItemPayload, ShippingMethod, PaymentMethod } from "./schemas";

export const SMALL_PACKAGE_FEE = 100; // Kč s DPH
export const BULKY_PACKAGE_FEE = 400; // Kč s DPH
/** Doprava zdarma nad X Kč (platí i pro bulky). */
export const FREE_SHIPPING_THRESHOLD = 2500;

export function calcShippingFee(
  method: ShippingMethod,
  hasBulky: boolean,
  subtotal: number = 0,
): number {
  if (method.startsWith("personal-")) return 0;
  if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
  if (hasBulky) return BULKY_PACKAGE_FEE;
  return SMALL_PACKAGE_FEE;
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
  discountAmount: number = 0,
): { subtotal: number; shippingFee: number; discount: number; total: number; hasBulky: boolean } {
  const subtotal = calcSubtotal(items);
  // Bulky flag dorazí z frontend (cart store). Pokud chybí, fallback na heuristiku
  // přes cenu (kola, lyže obvykle nad 5 000 Kč) — bezpečnější dražší doprava.
  const hasBulky = items.some((i) => i.bulky === true || (i.bulky === undefined && i.priceWithVat >= 5000));
  const shippingFee = calcShippingFee(shippingMethod, hasBulky, subtotal);
  const discount = Math.min(discountAmount, subtotal);
  return {
    subtotal,
    shippingFee,
    discount,
    total: Math.max(0, subtotal - discount + shippingFee),
    hasBulky,
  };
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

/**
 * Která doprava je k dispozici pro stav košíku?
 * - Zásilkovna NEPODPORUJE velké balíky (kola, lyže) — pobočky mají size limit
 * - Vše ostatní (personal-*, gls) podporuje vše
 */
export function isShippingAvailable(method: ShippingMethod, hasBulky: boolean): boolean {
  if (method === "zasilkovna" && hasBulky) return false;
  return true;
}
