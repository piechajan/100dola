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
  /** Základní sleva na trenažér samotný. */
  percent: number;
  /**
   * Vyšší sazba na celou objednávku, když si zákazník vezme i doplněk.
   * Sada jede v jedné krabici, takže dopravu platíme jednou — vyšší sleva
   * tak vydělá v absolutní částce víc než trenažér samotný.
   */
  percentWithBundle: number;
  /** Konec platnosti (lokální čas Praha). */
  endsAt: Date;
  /** Kategorie, na které sleva platí vždy. */
  categoryIds: string[];
  /** Slugy zlevněné jen v sadě s produktem z `categoryIds` — výhodná sada. */
  bundleSlugs: string[];
  /**
   * Které z `bundleSlugs` zvedají sazbu na `percentWithBundle` (ventilátor).
   * Ostatní doplňky (osy — levná položka) se zlevní základní sazbou `percent`.
   */
  boostSlugs: string[];
  /** Krátký text do promo lišty. */
  barText: string;
}

export const ACTIVE_PROMO: Promo | null = {
  code: "100dola",
  percent: 12,
  percentWithBundle: 15,
  endsAt: new Date("2026-10-11T23:59:59+02:00"),
  categoryIds: ["trenazery-chytre", "trenazery-smart-bike"],
  bundleSlugs: [
    "cycplus-f1-ventilator",
    "osa-trenazer-12mm-m12x10",
    "osa-trenazer-12mm-m12x15",
    "osa-trenazer-focus-rat-boost",
    "sram-rival-xg-1250-d1-10-30",
    "sram-red-xg-1290-e1-10-33",
  ],
  boostSlugs: ["cycplus-f1-ventilator"],
  barText: "až −15 % na trenažéry s kódem",
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

/**
 * Je produkt zlevněný jen v sadě s trenažérem?
 * Na jeho stránce se pak místo ceny ukáže podmínka, ať nikdo nečeká slevu,
 * kterou mu košík samostatně nedá.
 */
export function promoBundleOnly(slug: string, now: Date = new Date()): boolean {
  if (!ACTIVE_PROMO || !isPromoLive(now)) return false;
  return ACTIVE_PROMO.bundleSlugs.includes(slug);
}

/** Cena po uplatnění kódu na samotný produkt. */
export function promoPrice(priceWithVat: number): number {
  if (!ACTIVE_PROMO) return priceWithVat;
  return Math.round(priceWithVat * (1 - ACTIVE_PROMO.percent / 100));
}

/**
 * Cena doplňku v sadě s trenažérem. Ventilátor (boost) dostane vyšší sazbu,
 * osa jen základní — musí odpovídat `boostSlugs` v `lib/discounts.ts`.
 */
export function promoBundleItemPrice(priceWithVat: number, slug?: string): number {
  if (!ACTIVE_PROMO) return priceWithVat;
  const pct =
    slug && ACTIVE_PROMO.boostSlugs.includes(slug)
      ? ACTIVE_PROMO.percentWithBundle
      : ACTIVE_PROMO.percent;
  return Math.round(priceWithVat * (1 - pct / 100));
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
