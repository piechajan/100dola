// Seznam SEM (Seznam Event Measurement) — čisté pomocné funkce bez DOM/Reactu.
// Pravidla Seznamu: měna jen CZK; `value` je BEZ DPH (cena produktů celkem),
// `unit_price`, `delivery_price` a `other_costs` jsou S DPH.

export interface SemItemInput {
  slug: string;
  name: string;
  priceWithVat: number;
  vatRate: number;
  qty: number;
}

export interface SemContent {
  id: string;
  content_name: string;
  quantity: number;
  /** Cena za kus s DPH. */
  unit_price: number;
}

/** Cena bez DPH, zaokrouhlená na celé Kč (Sklik doporučuje celočíselnou hodnotu). */
export function netPrice(priceWithVat: number, vatRate: number): number {
  return Math.round(priceWithVat / (1 + vatRate / 100));
}

export function semContents(items: SemItemInput[]): SemContent[] {
  return items.map((i) => ({
    id: i.slug,
    content_name: i.name,
    quantity: i.qty,
    unit_price: i.priceWithVat,
  }));
}

/** Hodnota řádků bez DPH (součet přes množství). */
export function semValue(items: SemItemInput[]): number {
  return items.reduce((sum, i) => sum + netPrice(i.priceWithVat, i.vatRate) * i.qty, 0);
}

/** DPH z produktů (rozdíl cena s DPH − bez DPH). */
export function semValueTax(items: SemItemInput[]): number {
  const gross = items.reduce((sum, i) => sum + i.priceWithVat * i.qty, 0);
  return gross - semValue(items);
}

export interface SemPurchaseInput {
  orderId: string;
  items: SemItemInput[];
  shippingFee: number;
  deliveryLabel: string;
}

export function semPurchaseData(o: SemPurchaseInput): Record<string, unknown> {
  return {
    order_id: o.orderId,
    currency: "CZK",
    value: semValue(o.items),
    value_tax: semValueTax(o.items),
    content_type: "product",
    contents: semContents(o.items),
    delivery_type: o.deliveryLabel,
    delivery_price: o.shippingFee,
    // review_email se NEposílá, dokud neexistuje opt-out v pokladně (fáze 2).
  };
}

export type SemConsent = { analytics: boolean; marketing: boolean };

/** Consent z našeho cookies banneru → Google Consent Mode objekt pro SEM('updateConsent'). */
export function semConsentMode(c: SemConsent | null) {
  const ad = c?.marketing ? "granted" : "denied";
  return {
    consent_mode: {
      ad_storage: ad,
      ad_user_data: ad,
      ad_personalization: ad,
      analytics_storage: c?.analytics ? "granted" : "denied",
      functionality_storage: "denied",
    },
  };
}
