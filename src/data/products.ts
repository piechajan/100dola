// Centralizovaný product katalog pro e-shop.
// Extrahováno ze ShopLayout.tsx — single source of truth pro produkty + cart.
//
// Cena je vždy uváděna v Kč včetně DPH (`priceWithVat`). DPH se počítá zpětně
// z `priceWithVat` a `vatRate`. Bulky flag rozhoduje cenu dopravy.

export type VatRate = 21 | 12 | 0;

/**
 * Fulfillment kind:
 *  - "own" — máme skladem na Šternberku, posíláme sami
 *  - "supplier" — Sportimport (nebo jiný dodavatel) → po objednávce zákazníka
 *    pošleme objednávku dodavateli mailem nebo přes jejich API
 */
export type Fulfillment = "own" | "supplier";

import type { Gender, UseCase } from "./categories";

export interface Product {
  id: number;
  slug: string;
  name: string;
  year: string | null;
  brand: string;
  categoryId: string;
  /** Cena včetně DPH v Kč (celá čísla). */
  priceWithVat: number;
  /** Volitelná originální cena, pro slevy. */
  originalPriceWithVat?: number;
  /** Sazba DPH v procentech. Default 21 (standardní). */
  vatRate: VatRate;
  /** Velký balík (kola, lyže, snowboardy) — dražší doprava 400 Kč místo 100 Kč. */
  bulky: boolean;
  badges: string[];
  note: string;
  photo: string;
  specs: string[];
  /** Default "own". Supplier produkty mají "supplier". */
  fulfillment?: Fulfillment;
  /**
   * Stav skladu pro PDP callout. Default "in_stock" = "Skladem na Šternberku".
   * "on_request" = žádný stock callout (kolo není fyzicky ve Šternberku, dostupnost se ověřuje).
   */
  stockStatus?: "in_stock" | "on_request";
  /** Volitelný callout o dovozu — např. pro stroje s individuálním předáním. */
  deliveryNote?: string;
  /** Pokud supplier — UUID v supplier_products. */
  supplierProductId?: string;
  /** Orthogonal filtr (napříč kategoriemi). Default "U" unisex. */
  gender?: Gender;
  /** Orthogonal filtr (napříč kategoriemi). Default null = neuvedeno. */
  useCase?: UseCase | null;
  /** Volitelné další fotky pro PDP galerii (carousel + thumbs). */
  gallery?: string[];
  /** Variants per size/color z DB (Sportimport feed). Default undef. */
  variants?: Array<{
    externalId?: string;
    sku?: string;
    size?: string;
    color?: string;
    isInStock?: boolean;
    availability?: string;
  }>;
  /** Supplier konfigurátor — ISAAC kola → 'Sestavit' CTA místo 'Do košíku'. */
  hasConfigurator?: boolean;
  /** Konfigurátor data ze supplier_products.configurator_schema (jen pro PDP). */
  configuratorSchema?: ConfiguratorSchema;
  /** Barva v human-readable formě (např. „Mineral White") — z supplier properties. */
  color?: string;
  /** Normalizovaná barvená rodina pro filter chip (black/white/red/...). */
  colorFamily?: string;
}

/**
 * Sportimport configurator schema (rozparsovaný PHP-serialized payload).
 *  - options: jednotlivé volby (Kompletace, Velikost, Sada, Kola, Náboje…)
 *  - tags:   konkrétní hodnoty per option s price modifier v Kč
 */
export interface ConfiguratorSchema {
  configuratorName?: string;
  configuratorExternalId?: string;
  options: Array<{
    name: string;
    externalId: string;
  }>;
  tags: Array<{
    name: string;
    externalId: string;
    isAvailable: boolean;
    optionExternalId: string;
    priceModifierCzk: number;
  }>;
}

export const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Scott Addict RC 10",
    slug: "scott-addict-rc-10-2026",
    year: "2026",
    brand: "scott",
    categoryId: "silnicni-aero",
    priceWithVat: 177550,
    vatRate: 21,
    bulky: true,
    badges: ["Novinka", "Doporučuje tým"],
    note: "Kolo, na kterém jezdíme v Malaze",
    photo: "/media/scott-addict-rc10.png",
    specs: ["Shimano Ultegra Di2", "Syncros Carbon 40mm", "~7 kg"],
  },
  {
    id: 2,
    name: "Gregarius Q36.5 Pro Jersey",
    slug: "q365-gregarius-pro-jersey",
    year: null,
    brand: "scott",
    categoryId: "doplnky",
    priceWithVat: 3290,
    vatRate: 21,
    bulky: false,
    badges: [],
    note: "Dres, který jedeme my",
    photo: "https://www.q36-5.com/media/44/51/b4/1734343420/038PRO25-GregariusQ36.5ProCyclingTeamShortsSleeveJersey-1.png",
    specs: ["112 g (vel. M)", "4 speciální materiály", "Made in Italy"],
  },
  {
    id: 3,
    name: "Magicshine Seemee R300",
    slug: "magicshine-seemee-r300",
    year: "2026",
    brand: "magicshine",
    categoryId: "osvetleni",
    priceWithVat: 2750,
    originalPriceWithVat: 3190,
    vatRate: 21,
    bulky: false,
    badges: ["Buď vidět", "Novinka"],
    note: "Funkce jako Garmin Varia + USB-C. Za zlomek ceny.",
    photo: "/media/seemee-r300.jpg",
    specs: ["Radar 140 m dozadu", "ANT+ / Bluetooth", "100 h výdrž, USB-C"],
  },
  {
    id: 4,
    name: "Dynastar M-Vertical 88 Open",
    slug: "dynastar-m-vertical-88-open-2026",
    year: "2026",
    brand: "scott",
    categoryId: "skialpy-lyze",
    priceWithVat: 20990,
    vatRate: 21,
    bulky: true,
    badges: ["Novinka"],
    note: "Skialpová sezóna s Open Miles Clinic",
    photo: "https://www.dynastar-lange.com/dw/image/v2/BJJZ_PRD/on/demandware.static/-/Sites-rossignol-catalog/default/dw966b7994/images/large/DANM301_000_72DPI_01.jpg",
    specs: ["88mm waist", "1.18 kg / lyži", "Paulownia core"],
  },
  {
    id: 5,
    name: "Sponser ISO Drink Red Orange",
    slug: "sponser-iso-drink-red-orange",
    year: null,
    brand: "sponser",
    categoryId: "vyziva-iontaky",
    priceWithVat: 650,
    vatRate: 21,
    bulky: false,
    badges: ["Doporučuje tým"],
    note: "Isotonický nápoj pro dlouhé výjezdy. Osvědčený ve Španělsku.",
    photo: "https://sponser.com/cdn/shop/files/Isotonic_1000g_Red-Orange_2048x.png?v=1768564139",
    specs: ["1 000 g · ~19 porcí", "Isotonický · multi-carb · elektrolyty", "Vegan · bez laktózy · bez lepku"],
  },
  {
    id: 6,
    name: "Pinarello Dogma GR",
    slug: "pinarello-dogma-gr-sram-red-xplr-axs-2026",
    year: "2026",
    brand: "pinarello",
    categoryId: "gravel",
    priceWithVat: 339900,
    vatRate: 21,
    bulky: true,
    badges: ["Novinka", "Doporučuje tým"],
    note: "Top-tier gravel závodní stroj. Velikost L. Cena srovnatelná s nejnižší v ČR.",
    photo: "/media/pinarello-dogma-gr.webp",
    specs: ["SRAM Red XPLR AXS 1×13", "Princeton GRIT 4540 DB · Vittoria Terreno T30 40", "TorayCa M40X carbon · TiCR cable routing"],
    gender: "M",
    useCase: "race",
    color: "Interstellar Grey · matná",
    colorFamily: "grey",
    variants: [
      { size: "L", sku: "PIN-DGR-L", isInStock: true },
    ],
    stockStatus: "on_request",
    deliveryNote: "Osobní dovoz po Moravě (Olomouc, Ostrava, Vsetín, Valašské Meziříčí, Šternberk) zdarma. Termín a místo předání dohodneme.",
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getProductById(id: number): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

/**
 * Rozpočítá cenu vč. DPH na (bez DPH, DPH). Vstup je číslo s 2 desetinnými místy přesnosti,
 * výstup zaokrouhleno na celé Kč podle pravidel účetnictví (cena s DPH zůstává exaktní).
 */
export function splitVat(priceWithVat: number, vatRate: VatRate): { withVat: number; withoutVat: number; vatAmount: number } {
  const withoutVat = Math.round(priceWithVat / (1 + vatRate / 100));
  const vatAmount = priceWithVat - withoutVat;
  return { withVat: priceWithVat, withoutVat, vatAmount };
}

/** Naformátuje cenu jako "1 799 Kč" (s úzkou mezerou v tisících). */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("cs-CZ", { maximumFractionDigits: 0 }).format(amount) + " Kč";
}
