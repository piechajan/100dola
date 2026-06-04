/**
 * Helpers pro sledování zásilek — generuje tracking URL podle carrieru.
 */

export type Carrier = "zasilkovna" | "gls" | "dpd" | "ceska_posta" | "osobne" | "other";

export const CARRIER_LABELS: Record<Carrier, string> = {
  zasilkovna: "Zásilkovna",
  gls: "GLS",
  dpd: "DPD",
  ceska_posta: "Česká pošta",
  osobne: "Osobní vyzvednutí",
  other: "Jiný dopravce",
};

export function trackingUrl(carrier: string, trackingNumber: string): string | null {
  const num = encodeURIComponent(trackingNumber.trim());
  switch (carrier) {
    case "zasilkovna":
      return `https://tracking.packeta.com/Z/${num}`;
    case "gls":
      return `https://gls-group.com/CZ/cs/sledovani-zasilek?match=${num}`;
    case "dpd":
      return `https://www.dpd.com/cz/cs/sledovani/?parcelNumber=${num}`;
    case "ceska_posta":
      return `https://www.postaonline.cz/trackandtrace/-/zasilka/cislo?parcelNumbers=${num}`;
    default:
      return null;
  }
}

export function carrierLabel(carrier: string | null | undefined): string {
  if (!carrier) return "—";
  return CARRIER_LABELS[carrier as Carrier] ?? carrier;
}
