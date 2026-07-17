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
  /** Featured carousel na homepage „Aktuálně doporučujeme". Pořadí = featuredOrder asc. */
  isFeatured?: boolean;
  featuredOrder?: number;
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
    photo: "/media/scott-addict-rc10.webp",
    specs: ["Shimano Ultegra Di2", "Syncros Carbon 40mm", "~7 kg"],
    isFeatured: true,
    featuredOrder: 1,
  },
  {
    id: 12,
    name: "Scott Addict 30",
    slug: "scott-addict-30-2026",
    year: "2026",
    brand: "scott",
    categoryId: "silnicni-endurance",
    priceWithVat: 95990,
    vatRate: 21,
    bulky: true,
    badges: ["Skladem L+XL"],
    note: "Endurance road s race DNA — uvolněnější geometrie pro celodenní pohodlí, ale stále svižné kolo. Podpora plášťů až 38 mm.",
    photo: "/media/scott-addict-30-frozen-green.webp",
    gallery: [
      "/media/scott-addict-30-frozen-green.webp",
      "/media/scott-addict-30-variant2.webp",
      "/media/scott-addict-30-variant3.webp",
    ],
    specs: ["Shimano 105 Di2", "Syncros Capital 1.0 40 Disc", "8,4 kg"],
    color: "Frozen Green",
    colorFamily: "green",
    variants: [
      { sku: "scott-addict-30-2026-frozen-green-L", size: "L", color: "Frozen Green", isInStock: true, availability: "Skladem" },
      { sku: "scott-addict-30-2026-frozen-green-XL", size: "XL", color: "Frozen Green", isInStock: true, availability: "Skladem" },
      { sku: "scott-addict-30-2026-black-L", size: "L", color: "Black", isInStock: false, availability: "Na objednávku" },
      { sku: "scott-addict-30-2026-black-XL", size: "XL", color: "Black", isInStock: false, availability: "Na objednávku" },
      { sku: "scott-addict-30-2026-white-L", size: "L", color: "White", isInStock: false, availability: "Na objednávku" },
      { sku: "scott-addict-30-2026-white-XL", size: "XL", color: "White", isInStock: false, availability: "Na objednávku" },
    ],
  },
  {
    id: 13,
    name: "Scott Foil RC 20",
    slug: "scott-foil-rc-20-2026",
    year: "2026",
    brand: "scott",
    categoryId: "silnicni-aero",
    priceWithVat: 105000,
    originalPriceWithVat: 129990,
    vatRate: 21,
    bulky: true,
    badges: ["Skladem L+XL", "Aero", "Sleva"],
    note: "Aero race road — Scott označuje Foil za nejrychlejší silniční kolo, jaké kdy vyrobili. Pro spurtery, time trial, triatlon.",
    photo: "/media/scott-foil-rc-20-carbon-grey.webp",
    gallery: [
      "/media/scott-foil-rc-20-carbon-grey.webp",
      "/media/scott-foil-rc-20-gelato-blue.webp",
    ],
    specs: ["Shimano 105 Di2", "Syncros Capital 1.0 60 Disc", "8,1 kg"],
    color: "Carbon Grey",
    colorFamily: "grey",
    variants: [
      { sku: "scott-foil-rc-20-2026-carbon-grey-L", size: "L", color: "Carbon Grey", isInStock: true, availability: "Skladem" },
      { sku: "scott-foil-rc-20-2026-carbon-grey-XL", size: "XL", color: "Carbon Grey", isInStock: true, availability: "Skladem" },
      { sku: "scott-foil-rc-20-2026-gelato-blue-L", size: "L", color: "Gelato Blue", isInStock: false, availability: "Na objednávku" },
      { sku: "scott-foil-rc-20-2026-gelato-blue-XL", size: "XL", color: "Gelato Blue", isInStock: false, availability: "Na objednávku" },
    ],
  },
  {
    id: 14,
    name: "Scott Spark RC Team Issue",
    slug: "scott-spark-rc-team-issue-2026",
    year: "2026",
    brand: "scott",
    categoryId: "mtb-celoodpruzena",
    priceWithVat: 116990,
    originalPriceWithVat: 145590,
    vatRate: 21,
    bulky: true,
    badges: ["XC race", "Novinka", "Sleva"],
    note: "Závodní celoodpružené XC kolo s World Cup DNA. Karbonový rám HMF, ovládání odpružení jedním pákem TwinLock (lockout / traction / sjezd) a plně bezdrátový SRAM GX Eagle AXS Transmission.",
    photo: "/media/scott-spark-rc-team-issue-green.webp",
    gallery: [
      "/media/scott-spark-rc-team-issue-green.webp",
      "/media/scott-spark-rc-team-issue-green-2.webp",
    ],
    specs: ["SRAM GX Eagle AXS · 12s wireless", "FOX NUDE 6 + RockShox SID · 120 mm zdvih", "Syncros Silverton carbon 29\" · 11,7 kg"],
    gender: "U",
    useCase: "race",
    color: "Beryl Green",
    colorFamily: "green",
    variants: [
      { size: "S", sku: "scott-spark-rc-ti-2026-green-S", color: "Beryl Green", isInStock: false, availability: "Na objednávku" },
      { size: "M", sku: "scott-spark-rc-ti-2026-green-M", color: "Beryl Green", isInStock: false, availability: "Na objednávku" },
      { size: "L", sku: "scott-spark-rc-ti-2026-green-L", color: "Beryl Green", isInStock: false, availability: "Na objednávku" },
      { size: "XL", sku: "scott-spark-rc-ti-2026-green-XL", color: "Beryl Green", isInStock: false, availability: "Na objednávku" },
    ],
    stockStatus: "on_request",
    deliveryNote: "Skladem u dodavatele — dovoz a předání dohodneme. Osobní předání po Moravě (Olomouc, Ostrava, Vsetín, Valašské Meziříčí, Šternberk) zdarma. Termín potvrdíme po objednávce.",
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
    photo: "/media/q365-gregarius-pro-jersey.webp",
    specs: ["112 g (vel. M)", "4 speciální materiály", "Made in Italy"],
    isFeatured: true,
    featuredOrder: 3,
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
    isFeatured: true,
    featuredOrder: 4,
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
    photo: "/media/dynastar-m-vertical-88.webp",
    specs: ["88mm waist", "1.18 kg / lyži", "Paulownia core"],
    isFeatured: true,
    featuredOrder: 5,
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
    photo: "/media/sponser-iso-drink-red-orange.webp",
    specs: ["1 000 g · ~19 porcí", "Isotonický · multi-carb · elektrolyty", "Vegan · bez laktózy · bez lepku"],
    isFeatured: true,
    featuredOrder: 6,
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
    gallery: [
      "/media/pinarello-dogma-gr.webp",
      "/media/pinarello-dogma-gr-2.webp",
      "/media/pinarello-dogma-gr-3.webp",
      "/media/pinarello-dogma-gr-4.webp",
    ],
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
    isFeatured: true,
    featuredOrder: 2,
  },
  {
    id: 15,
    name: "Scott MTB Comp BOA",
    slug: "scott-mtb-comp-boa",
    year: "2026",
    brand: "scott",
    categoryId: "tretry-mtb",
    priceWithVat: 3190,
    vatRate: 21,
    bulky: false,
    badges: ["MTB", "BOA"],
    note: "Dostupné MTB tretry se skvělým poměrem cena/výkon. Utažení dílkem BOA L6 + suchý zip, Sticki gumová podrážka pro jistý grip v terénu i při vedení kola.",
    photo: "/media/scott-mtb-comp-boa-black.webp",
    gallery: [
      "/media/scott-mtb-comp-boa-black.webp",
      "/media/scott-mtb-comp-boa-black-2.webp",
    ],
    specs: ["BOA L6 + suchý zip", "Sticki podrážka · tuhost 6", "SPD (2-bolt) · ~370 g"],
    gender: "U",
    color: "Black",
    colorFamily: "black",
    variants: [
      { size: "40", isInStock: false, availability: "Na objednávku" },
      { size: "41", isInStock: false, availability: "Na objednávku" },
      { size: "42", isInStock: false, availability: "Na objednávku" },
      { size: "43", isInStock: false, availability: "Na objednávku" },
      { size: "44", isInStock: false, availability: "Na objednávku" },
      { size: "45", isInStock: false, availability: "Na objednávku" },
      { size: "46", isInStock: false, availability: "Na objednávku" },
      { size: "47", isInStock: false, availability: "Na objednávku" },
      { size: "48", isInStock: false, availability: "Na objednávku" },
    ],
    stockStatus: "on_request",
    deliveryNote: "Skladem u dodavatele — dovoz do pár dní. Osobní vyzvednutí ve Šternberku / Olomouci / Valašském Meziříčí.",
  },
  {
    id: 16,
    name: "Scott MTB Team BOA",
    slug: "scott-mtb-team-boa",
    year: "2026",
    brand: "scott",
    categoryId: "tretry-mtb",
    priceWithVat: 3890,
    vatRate: 21,
    bulky: false,
    badges: ["MTB", "BOA", "Race"],
    note: "Výkonnostní MTB tretry s tužší podrážkou (index 8) pro efektivní přenos síly. Mikrometrické doladění lícování dílkem BOA Li-2, lehká adaptivní PU konstrukce. Pro rychlé XC a trail ježdění.",
    photo: "/media/scott-mtb-team-boa-black.webp",
    gallery: [
      "/media/scott-mtb-team-boa-black.webp",
      "/media/scott-mtb-team-boa-black-2.webp",
    ],
    specs: ["BOA Li-2", "Podrážka tuhost 8 · nylon + sklo", "2-bolt MTB · ~350 g"],
    gender: "U",
    color: "Black",
    colorFamily: "black",
    variants: [
      { size: "38", isInStock: false, availability: "Na objednávku" },
      { size: "39", isInStock: false, availability: "Na objednávku" },
      { size: "40", isInStock: false, availability: "Na objednávku" },
      { size: "41", isInStock: false, availability: "Na objednávku" },
      { size: "42", isInStock: false, availability: "Na objednávku" },
      { size: "43", isInStock: false, availability: "Na objednávku" },
      { size: "43.5", isInStock: false, availability: "Na objednávku" },
      { size: "44", isInStock: false, availability: "Na objednávku" },
      { size: "45", isInStock: false, availability: "Na objednávku" },
      { size: "46", isInStock: false, availability: "Na objednávku" },
      { size: "47", isInStock: false, availability: "Na objednávku" },
      { size: "48", isInStock: false, availability: "Na objednávku" },
    ],
    stockStatus: "on_request",
    deliveryNote: "Skladem u dodavatele — dovoz do pár dní. Osobní vyzvednutí ve Šternberku / Olomouci / Valašském Meziříčí.",
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
