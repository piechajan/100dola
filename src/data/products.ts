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
  /** Volitelné další kategorie, kde se produkt taky zobrazí (multi-category).
   *  Např. CEP oblečení má primárně beh-* ale i obleceni-* (pod „Oblečení"). */
  secondaryCategoryIds?: string[];
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
  /** Volitelná kompletní výbava/specifikace (label → hodnota) pro rozklikávací
   *  tabulku na PDP. specs[] zůstávají jako 3 rychlé highlighty nad tabulkou. */
  specTable?: Array<{ label: string; value: string }>;
  /** Volitelná geometrie (rozklikávací tabulka na PDP): velikosti jako sloupce,
   *  řádky = geometrické hodnoty (reach, stack, úhly…). */
  geometry?: {
    sizes: string[];
    rows: Array<{ label: string; values: string[] }>;
    note?: string;
  };
  /** Kapacita baterie ve Wh (jen elektrokola) — předvyplní kalkulačku dojezdu na PDP. */
  ebikeBatteryWh?: number;
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
  /** Sezóna (oblečení): "leto" | "zima". Filtr se zobrazí jen když je relevantní. */
  season?: "leto" | "zima";
  /** Délka oblečení (kalhoty/dresy): "kratke" | "dlouhe". */
  garmentLength?: "kratke" | "dlouhe";
  /** Volitelné další fotky pro PDP galerii (carousel + thumbs). */
  gallery?: string[];
  /** Barevné varianty k výběru na PDP (název + hex swatch + foto). */
  colorOptions?: Array<{ name: string; hex?: string; photo: string }>;
  /** Příchutě k výběru na PDP (výživa) — zvolená se propíše do košíku i objednávky. */
  flavorOptions?: string[];
  /** Variants per size/color z DB (Sportimport feed). Default undef. */
  variants?: Array<{
    externalId?: string;
    sku?: string;
    size?: string;
    color?: string;
    isInStock?: boolean;
    availability?: string;
  }>;
  /**
   * Limitovaný „1 kus" produkt (např. jeden fyzický kus jedné velikosti).
   * Skladová velikost (`variants[].isInStock: true`) jde koupit; ostatní jsou
   * „na dotaz". Po objednání skladové velikosti server (orders route) další
   * objednávku odmítne a PDP produkt přepne na „na dotaz" (viz limited-stock).
   */
  limitedOneOff?: boolean;
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
    /** Supplier default tag = komponenta zahrnutá v base ceně (priceModifier 0).
     *  Předvybíráme ji, aby iniciální build i cena odpovídaly base produktu. */
    defaultTagExternalId?: string;
  }>;
  tags: Array<{
    name: string;
    externalId: string;
    isAvailable: boolean;
    optionExternalId: string;
    priceModifierCzk: number;
  }>;
}

/** Geometrie rámu Scott Scale RC (sdílená pro Team i World Cup). Zdroj: scott-sports.com. */
const SCALE_RC_GEOMETRY = {
  sizes: ["S", "M", "L", "XL"],
  rows: [
    { label: "Reach (mm)", values: ["418,5", "442,3", "463,6", "491,2"] },
    { label: "Stack (mm)", values: ["600,3", "604,9", "618,9", "628,1"] },
    { label: "Úhel hlavy (°)", values: ["67,9", "67,9", "67,9", "67,9"] },
    { label: "Úhel sedové trubky (°)", values: ["75,4", "75,4", "75,3", "75,3"] },
    { label: "Horní trubka horiz. (mm)", values: ["575", "600,2", "626", "656,5"] },
    { label: "Délka sedové trubky (mm)", values: ["390", "440", "480", "530"] },
    { label: "Zadní stavba (mm)", values: ["425", "425", "425", "425"] },
    { label: "Rozvor (mm)", values: ["1105,4", "1131,1", "1158", "1189,4"] },
    { label: "Výška nášlapu (mm)", values: ["752", "781", "800", "835,1"] },
    { label: "Výška středu / BB (mm)", values: ["313", "313", "313", "313"] },
  ],
  note: "Rám Scale RC s nastavitelným úhlem hlavy (±0,6°) — uvedeny nominální hodnoty. Geometrie je sdílená pro Scale RC Team i World Cup.",
};

export const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Scott Addict RC 10",
    slug: "scott-addict-rc-10-2026",
    year: "2026",
    brand: "scott",
    categoryId: "silnicni-aero",
    secondaryCategoryIds: ["silnicni-race"],
    priceWithVat: 144590,
    originalPriceWithVat: 174190,
    vatRate: 21,
    bulky: true,
    badges: ["Doporučuje tým", "Sleva"],
    note: "Kolo, na kterém jezdíme v Malaze",
    photo: "/media/scott-addict-rc10-prism.webp",
    gallery: [
      "/media/scott-addict-rc10-prism.webp",
      "/media/scott-addict-rc10-gelato.webp",
    ],
    colorOptions: [
      { name: "Prism Black", hex: "#1e1e22", photo: "/media/scott-addict-rc10-prism.webp" },
      { name: "Gelato Blue / Gelato Pink", hex: "#a8d8d0", photo: "/media/scott-addict-rc10-gelato.webp" },
    ],
    specs: ["Shimano Ultegra Di2 · 24s", "Syncros Capital 1.0S 40 mm · Schwalbe ONE 30c", "Karbon HMX · ~7 kg"],
    specTable: [
      { label: "Rám", value: "Karbon Addict HMX (race-grade)" },
      { label: "Řazení", value: "Shimano Ultegra Di2, elektronické 2×12 (24 rychlostí)" },
      { label: "Kliky", value: "Shimano Ultegra FC-R8100, 52/36" },
      { label: "Brzdy", value: "Shimano BR-R8170 hydraulické kotoučové" },
      { label: "Kola", value: "Syncros Capital 1.0S 40 mm (700C)" },
      { label: "Pláště", value: "Schwalbe ONE TLE 700×30C" },
      { label: "Hmotnost", value: "cca 7 kg" },
    ],
    variants: [
      { size: "XXS", isInStock: false, availability: "Na objednávku" },
      { size: "XS", isInStock: false, availability: "Na objednávku" },
      { size: "S", isInStock: false, availability: "Na objednávku" },
      { size: "M", isInStock: false, availability: "Na objednávku" },
      { size: "L", isInStock: false, availability: "Na objednávku" },
      { size: "XL", isInStock: false, availability: "Na objednávku" },
      { size: "XXL", isInStock: false, availability: "Na objednávku" },
    ],
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
    secondaryCategoryIds: ["silnicni-race"],
    priceWithVat: 110000,
    originalPriceWithVat: 129990,
    vatRate: 21,
    bulky: true,
    badges: ["Skladem", "Aero", "Sleva"],
    note: "Aero race road — Scott označuje Foil za nejrychlejší silniční kolo, jaké kdy vyrobili. Pro spurtery, time trial, triatlon.",
    photo: "/media/scott-foil-rc-20-carbon-grey.webp",
    gallery: [
      "/media/scott-foil-rc-20-carbon-grey.webp",
      "/media/scott-foil-rc-20-gelato-blue.webp",
    ],
    colorOptions: [
      { name: "Carbon Grey", hex: "#5a6570", photo: "/media/scott-foil-rc-20-carbon-grey.webp" },
      { name: "Gelato Blue", hex: "#c9e3e0", photo: "/media/scott-foil-rc-20-gelato-blue.webp" },
    ],
    specs: ["Shimano 105 Di2", "Syncros Capital 1.0 60 Disc", "8,1 kg"],
    color: "Carbon Grey",
    colorFamily: "grey",
    variants: [
      { sku: "scott-foil-rc-20-2026-carbon-grey-M", size: "M", color: "Carbon Grey", isInStock: true, availability: "Skladem" },
      { sku: "scott-foil-rc-20-2026-carbon-grey-L", size: "L", color: "Carbon Grey", isInStock: true, availability: "Skladem" },
      { sku: "scott-foil-rc-20-2026-carbon-grey-XL", size: "XL", color: "Carbon Grey", isInStock: false, availability: "Na objednávku" },
      { sku: "scott-foil-rc-20-2026-gelato-blue-M", size: "M", color: "Gelato Blue", isInStock: false, availability: "Na objednávku" },
      { sku: "scott-foil-rc-20-2026-gelato-blue-L", size: "L", color: "Gelato Blue", isInStock: false, availability: "Na objednávku" },
      { sku: "scott-foil-rc-20-2026-gelato-blue-XL", size: "XL", color: "Gelato Blue", isInStock: true, availability: "Skladem" },
    ],
  },
  {
    id: 30,
    name: "Scott Foil RC 10",
    slug: "scott-foil-rc-10-2026",
    year: "2026",
    brand: "scott",
    categoryId: "silnicni-aero",
    secondaryCategoryIds: ["silnicni-race"],
    priceWithVat: 130000,
    originalPriceWithVat: 153390,
    vatRate: 21,
    bulky: true,
    badges: ["Skladem", "Aero", "Sleva"],
    note: "Aero race road na špičkové úrovni — Scott Foil RC 10 s elektronickým Shimano Ultegra Di2 a karbonovým rámem HMX. Pro rychlá tempa, spurty a závody. Skladem ve velikosti M.",
    photo: "/media/scott-foil-rc-10-black.webp",
    specs: ["Shimano Ultegra Di2 2×12", "Syncros Capital 1.0 60 Disc", "7,9 kg"],
    color: "Carbon Black",
    colorFamily: "black",
    variants: [
      { sku: "scott-foil-rc-10-2026-black-M", size: "M", color: "Carbon Black", isInStock: true, availability: "Skladem" },
    ],
  },
  {
    id: 31,
    name: "Scott Foil RC Pro",
    slug: "scott-foil-rc-pro-2026",
    year: "2026",
    brand: "scott",
    categoryId: "silnicni-aero",
    secondaryCategoryIds: ["silnicni-race"],
    priceWithVat: 178000,
    originalPriceWithVat: 220990,
    vatRate: 21,
    bulky: true,
    badges: ["Skladem", "Aero", "Sleva"],
    note: "Vlajková aero raketa — Scott Foil RC Pro s Shimano Dura-Ace Di2, karbonem HMX a Syncros aero kokpitem. ~7,1 kg. Nejrychlejší silniční kolo, jaké Scott vyrobil. Skladem ve velikosti M.",
    photo: "/media/scott-foil-rc-pro-white-black.webp",
    specs: ["Shimano Dura-Ace Di2 2×12", "Syncros Capital 1.0S Aero 60", "7,1 kg"],
    color: "Cumulus White/Carbon Black",
    colorFamily: "white",
    variants: [
      { sku: "scott-foil-rc-pro-2026-white-M", size: "M", color: "Cumulus White/Carbon Black", isInStock: true, availability: "Skladem" },
    ],
  },
  {
    id: 34,
    name: "Scott Lumen 905",
    slug: "scott-lumen-905",
    year: null,
    brand: "scott",
    categoryId: "elektro",
    priceWithVat: 139125,
    originalPriceWithVat: 198750,
    vatRate: 21,
    bulky: true,
    badges: ["Skladem", "Elektro", "Sleva"],
    note: "Lehké karbonové horské elektrokolo Scott Lumen 905 — motor TQ HPR50 (50 Nm), integrovaná baterie 360 Wh a bezdrátové SRAM S1000 Eagle AXS. Přirozený pocit z jízdy, jen 17,9 kg. Skladem M / L / XL.",
    photo: "/media/scott-lumen-905.webp",
    specs: ["Motor TQ HPR50 · 50 Nm · baterie 360 Wh", "SRAM S1000 Eagle AXS 12s · Shimano Deore 4-pístky", "Karbon · 17,9 kg · 29\""],
    ebikeBatteryWh: 360,
    color: "Cumulus White / Carbon Black",
    colorFamily: "white",
    variants: [
      { sku: "scott-lumen-905-M", size: "M", color: "Cumulus White / Carbon Black", isInStock: true, availability: "Skladem" },
      { sku: "scott-lumen-905-L", size: "L", color: "Cumulus White / Carbon Black", isInStock: true, availability: "Skladem" },
      { sku: "scott-lumen-905-XL", size: "XL", color: "Cumulus White / Carbon Black", isInStock: true, availability: "Skladem" },
    ],
  },
  {
    id: 35,
    name: "Scott Lumen 920",
    slug: "scott-lumen-920",
    year: null,
    brand: "scott",
    categoryId: "elektro",
    priceWithVat: 168990,
    vatRate: 21,
    bulky: true,
    badges: ["Skladem", "Elektro"],
    note: "Scott Lumen 920 — silnější motor TQ HPR60 (60 Nm) a přídavná baterie 160 Wh k integrované 360 Wh (dohromady 520 Wh v ceně), takže energie nedojde. Karbonový přední trojúhelník + hliník, tlumení TwinLoc. Skladem všechny velikosti.",
    photo: "/media/scott-lumen-920.webp",
    specs: ["Motor TQ HPR60 · 60 Nm · baterie 360 + 160 Wh (520)", "SRAM Eagle 12s · 4-pístkové brzdy", "Karbon/hliník · 18,5 kg · 29\" · TwinLoc"],
    ebikeBatteryWh: 520,
    color: "White",
    colorFamily: "white",
    variants: [
      { sku: "scott-lumen-920-S", size: "S", color: "White", isInStock: true, availability: "Skladem" },
      { sku: "scott-lumen-920-M", size: "M", color: "White", isInStock: true, availability: "Skladem" },
      { sku: "scott-lumen-920-L", size: "L", color: "White", isInStock: true, availability: "Skladem" },
      { sku: "scott-lumen-920-XL", size: "XL", color: "White", isInStock: true, availability: "Skladem" },
    ],
  },
  {
    id: 36,
    name: "Scott Lumen eRIDE 900",
    slug: "scott-lumen-eride-900",
    year: null,
    brand: "scott",
    categoryId: "elektro",
    priceWithVat: 178493,
    originalPriceWithVat: 254990,
    vatRate: 21,
    bulky: true,
    badges: ["Skladem", "Elektro", "Sleva"],
    note: "Vlajkové lehké e-MTB Scott Lumen eRIDE 900 — karbon HMX, jen 16,6 kg. Motor TQ HPR50 (50 Nm), baterie 360 Wh a bezdrátové SRAM GX Eagle AXS. Spark s elektrickou asistencí pro XC i trail. Skladem M / L / XL.",
    photo: "/media/scott-lumen-eride-900.webp",
    specs: ["Motor TQ HPR50 · 50 Nm · baterie 360 Wh", "SRAM GX Eagle AXS wireless · SRAM Level 4-pístky", "Karbon HMX · 16,6 kg · 29\""],
    ebikeBatteryWh: 360,
    color: "Petrol Blue",
    colorFamily: "blue",
    variants: [
      { sku: "scott-lumen-eride-900-M", size: "M", color: "Petrol Blue", isInStock: true, availability: "Skladem" },
      { sku: "scott-lumen-eride-900-L", size: "L", color: "Petrol Blue", isInStock: true, availability: "Skladem" },
      { sku: "scott-lumen-eride-900-XL", size: "XL", color: "Petrol Blue", isInStock: true, availability: "Skladem" },
    ],
  },
  {
    id: 37,
    name: "Scott Lumen 910",
    slug: "scott-lumen-910",
    year: null,
    brand: "scott",
    categoryId: "elektro",
    priceWithVat: 207990,
    vatRate: 21,
    bulky: true,
    badges: ["Skladem", "Elektro"],
    note: "Scott Lumen 910 — lehké karbonové horské elektrokolo s tichým a silným motorem TQ HPR60 (60 Nm) a přídavnou baterií 160 Wh k integrované 360 Wh (520 Wh v ceně). Bezdrátové SRAM Eagle Transmission, zdvih 140/130 mm. Hravost trailového kola se silou e-biku.",
    photo: "/media/scott-lumen-910.webp",
    specs: ["Motor TQ HPR60 · 60 Nm · baterie 360 + 160 Wh (520)", "SRAM Eagle Transmission 12s · 4-pístkové brzdy", "Karbon · 29\" · zdvih 140/130 mm"],
    ebikeBatteryWh: 520,
    color: "Cumulus White / Carbon Black",
    colorFamily: "white",
    variants: [
      { sku: "scott-lumen-910-S", size: "S", color: "Cumulus White / Carbon Black", isInStock: true, availability: "Skladem" },
      { sku: "scott-lumen-910-M", size: "M", color: "Cumulus White / Carbon Black", isInStock: true, availability: "Skladem" },
      { sku: "scott-lumen-910-L", size: "L", color: "Cumulus White / Carbon Black", isInStock: true, availability: "Skladem" },
      { sku: "scott-lumen-910-XL", size: "XL", color: "Cumulus White / Carbon Black", isInStock: true, availability: "Skladem" },
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
    deliveryNote: "Skladem u dodavatele — dovoz a předání dohodneme. Osobní odběr na prodejně ve Šternberku zdarma; osobní dovoz po Moravě (Olomouc, Ostrava, Vsetín, Valašské Meziříčí) je jedna z možností. Termín i cenu potvrdíme po objednávce.",
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
    // Sportovní výživa / doplněk stravy = 12% DPH (potravinová sazba), ne 21 %.
    // Ověřeno vs halbich.cz (690 Kč / 616,07 bez DPH = 1,12).
    vatRate: 12,
    bulky: false,
    badges: ["Doporučuje tým"],
    note: "Isotonický nápoj pro dlouhé výjezdy. Osvědčený ve Španělsku.",
    photo: "/media/sponser-iso-drink-red-orange.webp",
    specs: ["1 000 g · ~19 porcí", "Isotonický · multi-carb · elektrolyty", "Vegan · bez laktózy · bez lepku"],
    isFeatured: true,
    featuredOrder: 6,
  },
  {
    id: 32,
    name: "Sponser Electrolytes",
    slug: "sponser-electrolytes",
    year: null,
    brand: "sponser",
    categoryId: "vyziva-iontaky",
    priceWithVat: 140,
    // Doplněk stravy / potravina = 12% DPH (viz [[Sponser ISO Drink]]).
    vatRate: 12,
    bulky: false,
    badges: ["Skladem"],
    note: "Šumivé tablety pro rychlé doplnění elektrolytů bez cukru — sodík, hořčík, draslík a zinek. Jedna tableta na 500 ml vody. Ideální na horké dny a dlouhé výjezdy.",
    photo: "/media/sponser-electrolytes.webp",
    specs: ["10 šumivých tablet · 1 tableta / 500 ml", "Elektrolyty + zinek · 400 mg sodíku", "Zero carb · bez cukru · vegan"],
    flavorOptions: ["Fruit Mix", "Red Orange", "Lemon", "Berry", "Cherry"],
  },
  {
    id: 33,
    name: "Sufan Flapjack Třešeň s čokoládou",
    slug: "sufan-flapjack-tresen-cokolada",
    year: null,
    brand: "sufan",
    categoryId: "vyziva-tycinky",
    priceWithVat: 28,
    originalPriceWithVat: 56,
    // Potravina = 12% DPH.
    vatRate: 12,
    bulky: false,
    badges: ["Sleva", "Bez lepku"],
    note: "Bezlepková ovesná tyčinka ŠUFAN s třešní a čokoládou — vláčná, sytá, poctivé řemeslné složení. Vysoký obsah vlákniny, ideální energie na kolo i po tréninku. 60 g.",
    photo: "/media/sufan-flapjack-tresen.webp",
    gallery: [
      "/media/sufan-flapjack-tresen.webp",
      "/media/sufan-flapjack-tresen-detail.webp",
    ],
    specs: ["60 g tyčinka · ~257 kcal", "Bez lepku · vláknina 20,6 g / 100 g", "Třešeň + čokoláda · řemeslná výroba"],
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
    deliveryNote: "Osobní odběr na prodejně ve Šternberku zdarma; osobní dovoz po Moravě (Olomouc, Ostrava, Vsetín, Valašské Meziříčí) je jedna z možností. Termín, místo i cenu předání dohodneme.",
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
    priceWithVat: 2723,
    originalPriceWithVat: 3890,
    vatRate: 21,
    bulky: false,
    badges: ["Poslední kus · 46", "Sleva", "BOA"],
    limitedOneOff: true,
    note: "Výkonnostní MTB tretry s tužší podrážkou (index 8) pro efektivní přenos síly. Mikrometrické doladění lícování dílkem BOA Li-2, lehká adaptivní PU konstrukce. Máme fyzicky poslední kus ve velikosti 46 — ostatní velikosti na dotaz.",
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
      { size: "45", isInStock: false, availability: "Na dotaz" },
      { size: "46", isInStock: true, availability: "Skladem — poslední kus" },
      { size: "47", isInStock: false, availability: "Na dotaz" },
      { size: "48", isInStock: false, availability: "Na dotaz" },
    ],
  },
  {
    id: 17,
    name: "Scott Addict 40",
    slug: "scott-addict-40-2026",
    year: "2026",
    brand: "scott",
    categoryId: "silnicni-endurance",
    priceWithVat: 83190,
    vatRate: 21,
    bulky: true,
    badges: ["Endurance", "105 Di2"],
    note: "Endurance silniční kolo s karbonovým rámem HMF (o 25 % poddajnější než race modely) pro pohodlí na dlouhých kilometrech. Elektronické řazení Shimano 105 Di2, hydraulické kotouče, prostor pro pláště až 38 mm.",
    photo: "/media/scott-addict-40-black.webp",
    gallery: [
      "/media/scott-addict-40-black.webp",
      "/media/scott-addict-40-black-2.webp",
    ],
    specs: ["Shimano 105 Di2 · 24 rychlostí", "Syncros RP 2.0 Disc · Schwalbe ONE 34c", "HMF karbon · ~8,9 kg"],
    gender: "U",
    useCase: "performance",
    color: "Carbon Black",
    colorFamily: "black",
    variants: [
      { size: "XXS", isInStock: false, availability: "Na objednávku" },
      { size: "XS", isInStock: false, availability: "Na objednávku" },
      { size: "S", isInStock: false, availability: "Na objednávku" },
      { size: "M", isInStock: false, availability: "Na objednávku" },
      { size: "L", isInStock: false, availability: "Na objednávku" },
      { size: "XL", isInStock: false, availability: "Na objednávku" },
      { size: "XXL", isInStock: false, availability: "Na objednávku" },
    ],
    stockStatus: "on_request",
    deliveryNote: "Skladem u dodavatele — dovoz a předání dohodneme. Osobní odběr na prodejně ve Šternberku zdarma; osobní dovoz po Moravě (Olomouc, Ostrava, Vsetín, Valašské Meziříčí) je jedna z možností. Termín i cenu potvrdíme po objednávce.",
  },
  {
    id: 18,
    name: "Scott Addict 50",
    slug: "scott-addict-50-2026",
    year: "2026",
    brand: "scott",
    categoryId: "silnicni-endurance",
    priceWithVat: 67590,
    vatRate: 21,
    bulky: true,
    badges: ["Endurance", "Karbon"],
    note: "Dostupné karbonové endurance silniční kolo. Lehký rám HMF s vertikální poddajností pro tlumení vibrací, spolehlivé mechanické Shimano 105, hydraulické kotouče a prostor pro širší pláště i mimo perfektní asfalt.",
    photo: "/media/scott-addict-50-grey.webp",
    gallery: [
      "/media/scott-addict-50-grey.webp",
      "/media/scott-addict-50-grey-2.webp",
    ],
    specs: ["Shimano 105 · mechanické 2×11", "Syncros RP 2.0 Disc · Schwalbe ONE 34c", "HMF karbon · ~9 kg"],
    gender: "U",
    useCase: "performance",
    color: "Carbon Grey",
    colorFamily: "grey",
    variants: [
      { size: "XXS", isInStock: false, availability: "Na objednávku" },
      { size: "XS", isInStock: false, availability: "Na objednávku" },
      { size: "S", isInStock: false, availability: "Na objednávku" },
      { size: "M", isInStock: false, availability: "Na objednávku" },
      { size: "L", isInStock: false, availability: "Na objednávku" },
      { size: "XL", isInStock: false, availability: "Na objednávku" },
      { size: "XXL", isInStock: false, availability: "Na objednávku" },
    ],
    stockStatus: "on_request",
    deliveryNote: "Skladem u dodavatele — dovoz a předání dohodneme. Osobní odběr na prodejně ve Šternberku zdarma; osobní dovoz po Moravě (Olomouc, Ostrava, Vsetín, Valašské Meziříčí) je jedna z možností. Termín i cenu potvrdíme po objednávce.",
  },
  {
    id: 19,
    name: "Scott Addict Gravel 30",
    slug: "scott-addict-gravel-30-2026",
    year: "2026",
    brand: "scott",
    categoryId: "gravel",
    priceWithVat: 66690,
    originalPriceWithVat: 70190,
    vatRate: 21,
    bulky: true,
    badges: ["Gravel", "GRX 1×12", "Sleva"],
    note: "Univerzální gravel stroj s karbonovým rámem HMF — pohltí nerovnosti a drží komfort na celý den bez ztráty tuhosti do šlapek. Jednoduché a bezúdržbové 1× řazení Shimano GRX, hydraulické kotouče, pláště až 45 mm.",
    photo: "/media/scott-addict-gravel-30-grey.webp",
    gallery: [
      "/media/scott-addict-gravel-30-grey.webp",
      "/media/scott-addict-gravel-30-grey-2.webp",
    ],
    specs: ["Shimano GRX 1×12 · 40T · 10-45T", "Syncros RP2.0 · Schwalbe G-One RX 45c", "HMF karbon"],
    gender: "U",
    useCase: "performance",
    color: "Carbon Grey",
    colorFamily: "grey",
    variants: [
      { size: "XS", isInStock: false, availability: "Na objednávku" },
      { size: "S", isInStock: false, availability: "Na objednávku" },
      { size: "M", isInStock: false, availability: "Na objednávku" },
      { size: "L", isInStock: false, availability: "Na objednávku" },
      { size: "XL", isInStock: false, availability: "Na objednávku" },
    ],
    stockStatus: "on_request",
    deliveryNote: "Skladem u dodavatele — dovoz a předání dohodneme. Osobní odběr na prodejně ve Šternberku zdarma; osobní dovoz po Moravě (Olomouc, Ostrava, Vsetín, Valašské Meziříčí) je jedna z možností. Termín i cenu potvrdíme po objednávce.",
  },
  {
    id: 20,
    name: "Scott Centric Plus",
    slug: "scott-centric-plus",
    year: "2026",
    brand: "scott",
    categoryId: "helmy-kolo",
    priceWithVat: 5190,
    vatRate: 21,
    bulky: false,
    badges: ["MIPS", "Silniční"],
    note: "Prémiová silniční helma s ochranou mozku MIPS Air proti rotačním silám při šikmém nárazu. Výborné odvětrání, lehká in-mold konstrukce (~220 g) a přesné dotažení systémem HALO. Dostupná ve 4 barvách — bílá, černá, zelená a šedá/fialová.",
    photo: "/media/scott-centric-plus-white.webp",
    gallery: [
      "/media/scott-centric-plus-white.webp",
      "/media/scott-centric-plus-black.webp",
      "/media/scott-centric-plus-green.webp",
      "/media/scott-centric-plus-grey.webp",
    ],
    colorOptions: [
      { name: "Bílá", hex: "#eef1f5", photo: "/media/scott-centric-plus-white.webp" },
      { name: "Černá", hex: "#1b1b1e", photo: "/media/scott-centric-plus-black.webp" },
      { name: "Zelená", hex: "#a7c4b5", photo: "/media/scott-centric-plus-green.webp" },
      { name: "Šedá/fialová", hex: "#8b8390", photo: "/media/scott-centric-plus-grey.webp" },
    ],
    specs: ["MIPS Air · rotační ochrana", "HALO systém · ~220 g", "In-mold polykarbonát"],
    gender: "U",
    color: "White",
    colorFamily: "white",
    variants: [
      { size: "S", isInStock: false, availability: "Na objednávku" },
      { size: "M", isInStock: false, availability: "Na objednávku" },
      { size: "L", isInStock: false, availability: "Na objednávku" },
    ],
    stockStatus: "on_request",
    deliveryNote: "Skladem u dodavatele — dovoz do pár dní. Osobní vyzvednutí ve Šternberku / Olomouci / Valašském Meziříčí.",
  },
  {
    id: 21,
    name: "Lapierre Pulsium 4.0",
    slug: "lapierre-pulsium-4-0-2027",
    year: "2027",
    brand: "lapierre",
    categoryId: "silnicni-endurance",
    priceWithVat: 57990,
    vatRate: 21,
    bulky: true,
    badges: ["Endurance", "Karbon"],
    note: "Čtvrtá generace endurance silnice Pulsium — lepší aerodynamika, sportovnější posed a víc vertikálního komfortu. Karbonový rám, spolehlivé mechanické Shimano GRX, hydraulické kotouče a prostor pro pláště až 38 mm.",
    photo: "/media/lapierre-pulsium-40-grey.webp",
    gallery: [
      "/media/lapierre-pulsium-40-grey.webp",
      "/media/lapierre-pulsium-40-grey-2.webp",
    ],
    specs: ["Shimano GRX · mechanické 2×10", "Shimano WH-RS171 · 700C", "Karbon · hydraulické kotouče"],
    gender: "U",
    useCase: "performance",
    color: "Circular Grey",
    colorFamily: "grey",
    variants: [
      { size: "XS", isInStock: false, availability: "Na objednávku" },
      { size: "S", isInStock: false, availability: "Na objednávku" },
      { size: "M", isInStock: false, availability: "Na objednávku" },
      { size: "L", isInStock: false, availability: "Na objednávku" },
      { size: "XL", isInStock: false, availability: "Na objednávku" },
      { size: "XXL", isInStock: false, availability: "Na objednávku" },
    ],
    stockStatus: "on_request",
    deliveryNote: "Skladem u dodavatele — dovoz a předání dohodneme. Osobní odběr na prodejně ve Šternberku zdarma; osobní dovoz po Moravě (Olomouc, Ostrava, Vsetín, Valašské Meziříčí) je jedna z možností. Termín i cenu potvrdíme po objednávce.",
  },
  {
    id: 22,
    name: "Lapierre Pulsium 5.0",
    slug: "lapierre-pulsium-5-0-2027",
    year: "2027",
    brand: "lapierre",
    categoryId: "silnicni-endurance",
    priceWithVat: 79990,
    vatRate: 21,
    bulky: true,
    badges: ["Endurance", "Shimano 105"],
    note: "Endurance silnice Pulsium s kompletní skupinou Shimano 105 (2×12). Karbonový rám s vertikální poddajností pro celodenní komfort, hydraulické kotouče a prostor pro pláště až 38 mm. Barva Crepuscule Blue.",
    photo: "/media/lapierre-pulsium-50-blue.webp",
    gallery: [
      "/media/lapierre-pulsium-50-blue.webp",
      "/media/lapierre-pulsium-50-blue-2.webp",
    ],
    specs: ["Shimano 105 R7100 · 2×12", "Continental Ultra Sport III 32c · 700C", "Karbon · hydraulické kotouče"],
    gender: "U",
    useCase: "performance",
    color: "Crepuscule Blue",
    colorFamily: "blue",
    variants: [
      { size: "XS", isInStock: false, availability: "Na objednávku" },
      { size: "S", isInStock: false, availability: "Na objednávku" },
      { size: "M", isInStock: false, availability: "Na objednávku" },
      { size: "L", isInStock: false, availability: "Na objednávku" },
      { size: "XL", isInStock: false, availability: "Na objednávku" },
      { size: "XXL", isInStock: false, availability: "Na objednávku" },
    ],
    stockStatus: "on_request",
    deliveryNote: "Skladem u dodavatele — dovoz a předání dohodneme. Osobní odběr na prodejně ve Šternberku zdarma; osobní dovoz po Moravě (Olomouc, Ostrava, Vsetín, Valašské Meziříčí) je jedna z možností. Termín i cenu potvrdíme po objednávce.",
  },
  {
    id: 23,
    name: "Scott Patron ST 910",
    slug: "scott-patron-st-910-2025",
    year: "2025",
    brand: "scott",
    categoryId: "elektro",
    priceWithVat: 137800,
    originalPriceWithVat: 177250,
    vatRate: 21,
    bulky: true,
    badges: ["E-MTB", "Bosch CX", "800 Wh"],
    note: "Výkonné enduro e-MTB s motorem Bosch Performance CX (85 Nm) a velkou baterií PowerTube 800 Wh — dojezd 64–200 km podle terénu. Hliníkový rám s kinematikou Virtual 4 Link a nastavitelným úhlem hlavy, zdvih 170/150 mm (RockShox Domain / Super Deluxe), Shimano Deore 1×12 a 4pístové kotouče. Připraveno na dlouhé náročné výjezdy i technické sjezdy.",
    photo: "/media/scott-patron-st-910.webp",
    specs: [
      "Bosch Performance CX 85 Nm · PowerTube 800 Wh",
      "RockShox Domain 170 mm / Super Deluxe 150 mm",
      "Shimano Deore 1×12 · 4pístové kotouče",
    ],
    gender: "U",
    useCase: "performance",
    color: "Olive Green",
    colorFamily: "green",
    variants: [
      { size: "S", isInStock: false, availability: "Na objednávku" },
      { size: "M", isInStock: true, availability: "Skladem" },
      { size: "L", isInStock: false, availability: "Na objednávku" },
      { size: "XL", isInStock: false, availability: "Na objednávku" },
    ],
    stockStatus: "on_request",
    deliveryNote: "Skladem u dodavatele — dovoz a předání dohodneme. Osobní odběr na prodejně ve Šternberku zdarma; osobní dovoz po Moravě (Olomouc, Ostrava, Vsetín, Valašské Meziříčí) je jedna z možností. Termín i cenu potvrdíme po objednávce.",
  },
  {
    id: 24,
    name: "Scott Scale 925",
    slug: "scott-scale-925-2026",
    year: "2026",
    brand: "scott",
    categoryId: "mtb-hardtail",
    priceWithVat: 44190,
    vatRate: 21,
    bulky: true,
    badges: ["XC", "Hardtail", "Shimano XT"],
    note: "Špičkový hliníkový XC hardtail Scott Scale s odlehčenou vzduchovou vidlicí RockShox SID SL (110 mm) a řazením Shimano XT / Deore 1×12. Rychlé, přímé kolo do terénu i na dlouhé maratony. Nižší číslo v řadě Scale = vyšší výbava.",
    photo: "/media/scott-scale-925.webp",
    specs: [
      "Shimano XT / Deore 1×12 · 10–51T",
      "RockShox SID SL 110 mm · Maxxis Rekon Race 29×2.4",
      "Alloy 6061 Custom Butted · cca 12,5 kg",
    ],
    gender: "U",
    useCase: "performance",
    color: "Black",
    colorFamily: "black",
    variants: [
      { size: "S", isInStock: false, availability: "Na objednávku" },
      { size: "M", isInStock: false, availability: "Na objednávku" },
      { size: "L", isInStock: false, availability: "Na objednávku" },
      { size: "XL", isInStock: false, availability: "Na objednávku" },
    ],
    stockStatus: "on_request",
    deliveryNote: "Skladem u dodavatele — dovoz a předání dohodneme. Osobní odběr na prodejně ve Šternberku zdarma; osobní dovoz po Moravě (Olomouc, Ostrava, Vsetín, Valašské Meziříčí) je jedna z možností. Termín i cenu potvrdíme po objednávce.",
  },
  {
    id: 25,
    name: "Scott Scale 935",
    slug: "scott-scale-935-2026",
    year: "2026",
    brand: "scott",
    categoryId: "mtb-hardtail",
    priceWithVat: 31190,
    vatRate: 21,
    bulky: true,
    badges: ["XC", "Hardtail", "Shimano Deore"],
    note: "Dostupný hliníkový XC hardtail Scott Scale s kompletním řazením Shimano Deore 1×12 a vidlicí RockShox Judy Silver (110 mm). Poctivý vstup do světa rychlých terénních kol za rozumnou cenu. Rám Alloy 6061 s Custom Butted trubkami.",
    photo: "/media/scott-scale-935.webp",
    specs: [
      "Shimano Deore 1×12 · 10–51T",
      "RockShox Judy Silver 110 mm · Maxxis Rekon Race 29×2.4",
      "Alloy 6061 Custom Butted · kotouče Shimano MT200",
    ],
    gender: "U",
    useCase: "performance",
    color: "Twinkle Green",
    colorFamily: "green",
    variants: [
      { size: "S", isInStock: false, availability: "Na objednávku" },
      { size: "M", isInStock: false, availability: "Na objednávku" },
      { size: "L", isInStock: false, availability: "Na objednávku" },
      { size: "XL", isInStock: false, availability: "Na objednávku" },
    ],
    stockStatus: "on_request",
    deliveryNote: "Skladem u dodavatele — dovoz a předání dohodneme. Osobní odběr na prodejně ve Šternberku zdarma; osobní dovoz po Moravě (Olomouc, Ostrava, Vsetín, Valašské Meziříčí) je jedna z možností. Termín i cenu potvrdíme po objednávce.",
  },
  {
    id: 26,
    name: "Scott Scale 930",
    slug: "scott-scale-930-2026",
    year: "2026",
    brand: "scott",
    categoryId: "mtb-hardtail",
    priceWithVat: 33790,
    vatRate: 21,
    bulky: true,
    badges: ["XC", "Hardtail", "SRAM Eagle"],
    note: "Hliníkový XC hardtail Scott Scale s pohonem SRAM NX Eagle 1×12 a vidlicí RockShox Judy Silver (110 mm). Robustní univerzál do terénu s prověřenou kinematikou rámu Scale. Plášti Maxxis Rekon Race připravené na tubeless.",
    photo: "/media/scott-scale-930.webp",
    specs: [
      "SRAM NX Eagle 1×12 · 11–50T",
      "RockShox Judy Silver 110 mm · Maxxis Rekon Race 29×2.4",
      "Alloy 6061 Custom Butted · kotouče Shimano MT200",
    ],
    gender: "U",
    useCase: "performance",
    color: "Black",
    colorFamily: "black",
    variants: [
      { size: "S", isInStock: false, availability: "Na objednávku" },
      { size: "M", isInStock: false, availability: "Na objednávku" },
      { size: "L", isInStock: false, availability: "Na objednávku" },
      { size: "XL", isInStock: false, availability: "Na objednávku" },
    ],
    stockStatus: "on_request",
    deliveryNote: "Skladem u dodavatele — dovoz a předání dohodneme. Osobní odběr na prodejně ve Šternberku zdarma; osobní dovoz po Moravě (Olomouc, Ostrava, Vsetín, Valašské Meziříčí) je jedna z možností. Termín i cenu potvrdíme po objednávce.",
  },
  {
    id: 27,
    name: "Scott W's Pro WB — dámská cyklistická vesta",
    slug: "scott-vest-w-pro-wb",
    year: "2026",
    brand: "scott",
    categoryId: "obleceni-bundy",
    priceWithVat: 2072,
    originalPriceWithVat: 2590,
    vatRate: 21,
    bulky: false,
    badges: ["Poslední kus · M", "Sleva"],
    note: "Ultralehká a skladná větruodolná vesta. Větruvzdorné panely vpředu chrání před větrem, síťovina na zádech odvětrává. Silikonový lem drží vestu na místě, elastický materiál nesvazuje pohyb. Máme fyzicky poslední kus ve velikosti M — ostatní velikosti na dotaz.",
    photo: "/media/scott-vest-w-pro-wb.webp",
    specs: [
      "Větruodolné panely vpředu + zádová síťovina",
      "DRYOxcell · DUROxpand, silikonový lem",
      "100% polyester, podšívka 87% recyklovaný polyester / 13% elastan, slim střih",
    ],
    gender: "F",
    useCase: "performance",
    color: "Cotton White",
    colorFamily: "white",
    limitedOneOff: true,
    variants: [
      { sku: "scott-vest-w-pro-wb-xs", size: "XS", isInStock: false, availability: "Na dotaz" },
      { sku: "scott-vest-w-pro-wb-s", size: "S", isInStock: false, availability: "Na dotaz" },
      { sku: "scott-vest-w-pro-wb-m", size: "M", isInStock: true, availability: "Skladem — poslední kus" },
      { sku: "scott-vest-w-pro-wb-l", size: "L", isInStock: false, availability: "Na dotaz" },
      { sku: "scott-vest-w-pro-wb-xl", size: "XL", isInStock: false, availability: "Na dotaz" },
    ],
  },
  {
    id: 28,
    name: "Scott Scale RC Team",
    slug: "scott-scale-rc-team-2026",
    year: "2026",
    brand: "scott",
    categoryId: "mtb-hardtail",
    priceWithVat: 83190,
    vatRate: 21,
    bulky: true,
    badges: ["XC race", "Hardtail", "SRAM AXS"],
    note: "Závodní XC hardtail s ultralehkým karbonovým rámem Scale HMX a nastavitelnou geometrií hlavového složení. Vzduchová vidlice RockShox SID SL (110 mm) a plně bezdrátové elektronické řazení SRAM Eagle AXS 1×12. Fenomenální tuhost a nízká hmotnost pro explozivní akceleraci — na rychlé XC, maratony i závody.",
    photo: "/media/scott-scale-rc-team.webp",
    specs: [
      "SRAM Eagle AXS 1×12 · bezdrátové elektronické",
      "RockShox SID SL 110 mm · Maxxis Rekon Race 29×2.4",
      "Karbon Scale HMX · cca 11,2 kg",
    ],
    specTable: [
      { label: "Rám", value: "Karbon Scale HMX, nastavitelná geometrie hlavy (±0,6°)" },
      { label: "Vidlice", value: "RockShox SID SL, 110 mm zdvih" },
      { label: "Řazení", value: "SRAM Eagle AXS 1×12, bezdrátové (ovladač SRAM S1000)" },
      { label: "Kliky", value: "SRAM Eagle, převodník 34T" },
      { label: "Brzdy", value: "SRAM DB6, 4pístkové hydraulické kotoučové" },
      { label: "Kola", value: "29\"" },
      { label: "Pláště", value: "Maxxis Rekon Race 29×2.4\" (přední i zadní)" },
      { label: "Sedlovka", value: "Syncros Duncan dropper, 100 mm" },
      { label: "Hlavové složení", value: "Syncros s nastavením ±0,6°" },
      { label: "Hmotnost", value: "cca 11,2 kg" },
    ],
    geometry: SCALE_RC_GEOMETRY,
    gender: "U",
    useCase: "race",
    color: "Carbon Black",
    colorFamily: "black",
    variants: [
      { size: "S", isInStock: false, availability: "Na objednávku" },
      { size: "M", isInStock: false, availability: "Na objednávku" },
      { size: "L", isInStock: false, availability: "Na objednávku" },
      { size: "XL", isInStock: false, availability: "Na objednávku" },
    ],
    stockStatus: "on_request",
    deliveryNote: "Skladem u dodavatele — dovoz a předání dohodneme. Osobní odběr na prodejně ve Šternberku zdarma; osobní dovoz po Moravě (Olomouc, Ostrava, Vsetín, Valašské Meziříčí) je jedna z možností. Termín i cenu potvrdíme po objednávce.",
  },
  {
    id: 29,
    name: "Scott Scale RC World Cup",
    slug: "scott-scale-rc-world-cup-2026",
    year: "2026",
    brand: "scott",
    categoryId: "mtb-hardtail",
    priceWithVat: 207990,
    vatRate: 21,
    bulky: true,
    badges: ["XC race", "World Cup", "SRAM XX SL AXS"],
    note: "Vrcholný závodní XC hardtail — ultralehký karbonový rám HMX s pokročilým tlumením vibrací promění každý watt v pohyb vpřed. Vidlice RockShox SID SL Ultimate (Charger Race Day 2, 110 mm), špičkové bezdrátové SRAM XX SL Eagle AXS 1×12 a brzdy SRAM Motive Ultimate. Pro ty, kdo jezdí na výsledek.",
    photo: "/media/scott-scale-rc-world-cup.webp",
    specs: [
      "SRAM XX SL Eagle AXS 1×12 · bezdrátové · 10–52T",
      "RockShox SID SL Ultimate 110 mm · SRAM Motive Ultimate brzdy",
      "Karbon HMX · Maxxis Rekon Race 29×2.4 · cca 9,6 kg",
    ],
    specTable: [
      { label: "Rám", value: "Karbon HMX s pokročilým tlumením vibrací" },
      { label: "Vidlice", value: "RockShox SID SL Ultimate, Charger Race Day 2, 110 mm" },
      { label: "Řazení", value: "SRAM XX SL Eagle AXS 1×12, bezdrátové" },
      { label: "Kazeta", value: "SRAM XX Eagle XS-1297, 10–52T" },
      { label: "Brzdy", value: "SRAM Motive Ultimate, 4pístkové hydraulické" },
      { label: "Středové složení", value: "SRAM DUB PF92 MTB" },
      { label: "Kola", value: "29\"" },
      { label: "Pláště", value: "Maxxis Rekon Race 29×2.4\" (přední i zadní)" },
      { label: "Hmotnost", value: "cca 9,6 kg" },
    ],
    geometry: SCALE_RC_GEOMETRY,
    gender: "U",
    useCase: "race",
    color: "Hush Purple",
    colorFamily: "purple",
    variants: [
      { size: "S", isInStock: false, availability: "Na objednávku" },
      { size: "M", isInStock: false, availability: "Na objednávku" },
      { size: "L", isInStock: false, availability: "Na objednávku" },
      { size: "XL", isInStock: false, availability: "Na objednávku" },
    ],
    stockStatus: "on_request",
    deliveryNote: "Skladem u dodavatele — dovoz a předání dohodneme. Osobní odběr na prodejně ve Šternberku zdarma; osobní dovoz po Moravě (Olomouc, Ostrava, Vsetín, Valašské Meziříčí) je jedna z možností. Termín i cenu potvrdíme po objednávce.",
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
