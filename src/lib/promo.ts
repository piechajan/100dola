import { PRODUCTS } from "@/data/products";

/**
 * Jedno místo, kde žije běžící kampaňová akce.
 *
 * Promo lišta, řádek u ceny na PDP, pobídka v košíku i reklama si berou
 * údaje odsud — jinak by se po prvním prodloužení rozešly a na webu by
 * svítil jiný termín než ve slajdech.
 *
 * Rozsah musí odpovídat `CODE_SCOPES` v `lib/discounts.ts`, kde se sleva
 * reálně počítá na serveru. Tohle je jen prezentační vrstva; kdyby se obojí
 * rozešlo, zákazník uvidí cenu, kterou mu košík nedá.
 */
export interface Promo {
  code: string;
  /** Sleva v procentech. */
  percent: number;
  /** Konec platnosti (lokální čas Praha). */
  endsAt: Date;
  /** Kategorie, na které sleva platí. */
  categoryIds: string[];
  /** Krátký text do promo lišty. */
  barText: string;
}

export const ACTIVE_PROMO: Promo | null = {
  code: "100dola",
  percent: 10,
  endsAt: new Date("2026-10-11T23:59:59+02:00"),
  categoryIds: ["trenazery-chytre", "trenazery-smart-bike"],
  barText: "−10 % na trenažéry s kódem",
};

/** Běží akce právě teď? Po expiraci se všechno samo schová. */
export function isPromoLive(now: Date = new Date()): boolean {
  return ACTIVE_PROMO !== null && now <= ACTIVE_PROMO.endsAt;
}

/** Vztahuje se akce na tenhle produkt? */
export function promoApplies(categoryId: string, now: Date = new Date()): boolean {
  if (!ACTIVE_PROMO || !isPromoLive(now)) return false;
  return ACTIVE_PROMO.categoryIds.includes(categoryId);
}

/** Cena po uplatnění kódu, zaokrouhlená na koruny. */
export function promoPrice(priceWithVat: number): number {
  if (!ACTIVE_PROMO) return priceWithVat;
  return Math.round(priceWithVat * (1 - ACTIVE_PROMO.percent / 100));
}

/** „do neděle 11. 10." — pro lidský text v liště a u ceny. */
export function promoDeadlineLabel(): string {
  if (!ACTIVE_PROMO) return "";
  const d = ACTIVE_PROMO.endsAt;
  const dny = ["neděle", "pondělí", "úterý", "středy", "čtvrtka", "pátku", "soboty"];
  return `do ${dny[d.getDay()]} ${d.getDate()}. ${d.getMonth() + 1}.`;
}

/** Kolik produktů akce zahrnuje — do textu lišty („na 6 trenažérů"). */
export function promoProductCount(): number {
  if (!ACTIVE_PROMO) return 0;
  return PRODUCTS.filter((p) => ACTIVE_PROMO.categoryIds.includes(p.categoryId)).length;
}

/** Klíč, pod kterým si držíme kód z URL (?kod=100dola) do košíku. */
export const PROMO_STORAGE_KEY = "100dola-promo-code";
