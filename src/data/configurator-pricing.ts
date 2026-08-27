// Per-model ceník ISAAC konfigurátoru (ceny = Sportimport, varianta A).
//
// PROČ V KÓDU: modifikátory jsou per-model (stejná komponenta má jinou deltu
// podle toho, co má model v defaultu — ověřeno Element/Meson/Boson). Globální
// DB tabulka `configurator_tag_overrides` to neumí. Tady je to per-SKU,
// verzované, přežije import feedu (ten přepisuje jen supplier_products).
//
// MODEL JE „VERIFIED" (konfigurátor jde živě) jen když je v této mapě. Ostatní
// modely ukazují ConfiguratorInquiryNotice, dokud sem nedoplníme jejich ceny.
//
// base = Sportimport cena defaultní konfigurace (vč. DPH). modifiers = delta v Kč
// vůči defaultu, klíč = přesný název tagu ve schématu. Neuvedený tag = 0 (default
// nebo stejná cena). Velikosti cenu nemění. FFWD výplety mají plochou cenu per
// řada (RAW/RYOT jedno jaká hloubka). Náboj u FFWD kol je v ceně kola (delta 0);
// upgrade náboje (DT Swiss 240) = +7500. Sekundární náboj-kombinace jsou
// aproximované → finální cenu potvrzujeme u objednávky (jako u všech kol).

import type { ConfiguratorSchema } from "./products";

export interface ModelConfiguratorPricing {
  /** Sportimport cena defaultní konfigurace (vč. DPH). */
  base: number;
  /** Delta v Kč vůči defaultu, klíč = název tagu. */
  modifiers: Record<string, number>;
}

// ── ELEMENT (endurance, default 105 Di2 + FORE FOUR 36 + DT Swiss 350) ────────
const ELEMENT: ModelConfiguratorPricing = {
  base: 148790,
  modifiers: {
    "Shimano 105": -17500, // mechanické (pokud nabízeno) pod 105 Di2
    "Shimano Ultegra Di2": 20000,
    "Shimano Dura Ace Di2": 55000,
    "FORE FIVE 50 mm Carbon": 0,
    "FFWD TYRO (45 mm)": 3700,
    "FFWD RYOT33 Carbon": 15000,
    "FFWD RYOT44 Carbon": 15000,
    "FFWD RYOT55 Carbon": 15000,
    "FFWD RAW33 CS Carbon": 41750,
    "FFWD RAW44 CS Carbon": 41750,
    "FFWD RAW55 CS Carbon": 41750,
    "bez kol": -23800,
    "DT Swiss 240 SP 2:1": 7500,
    "Rámová sada": -71300,
  },
};

// ── MESON (aero, default 105 Di2 + DT Swiss ARC 1600 55 + DT Swiss 350) ───────
const MESON: ModelConfiguratorPricing = {
  base: 132490,
  modifiers: {
    "Shimano Ultegra Di2": 20000,
    "Shimano Dura Ace Di2": 55000,
    "FFWD RYOT33 Carbon": 6925,
    "FFWD RYOT44 Carbon": 6925,
    "FFWD RYOT55 Carbon": 6925,
    "FFWD RAW33 CS Carbon": 33675,
    "FFWD RAW44 CS Carbon": 33675,
    "FFWD RAW55 CS Carbon": 33675,
    "DT Swiss 240 SP 2:1": 7500,
    "Rámová sada": -67500,
  },
};

// ── BOSON (gravel, default 105 mech + DT Swiss E1800 30 + DT Swiss 370 OEM) ────
const BOSON: ModelConfiguratorPricing = {
  base: 86240,
  modifiers: {
    "Shimano 105 Di2": 17500,
    "Shimano Ultegra Di2": 37500,
    "Shimano Dura Ace Di2": 72500,
    "FORE FOUR 36 mm Carbon": 17550,
    "FORE FIVE 50 mm Carbon": 17550,
    "FFWD TYRO (45 mm)": 21250,
    "FFWD RYOT33 Carbon": 32550,
    "FFWD RYOT44 Carbon": 32550,
    "FFWD RYOT55 Carbon": 32550,
    "FFWD RAW33 CS Carbon": 59300,
    "FFWD RAW44 CS Carbon": 59300,
    "FFWD RAW55 CS Carbon": 59300,
    "DT Swiss 240 SP 2:1": 7500,
    "bez kol": -12000, // ODHAD (Boson bez-kol screen nedodán) — potvrdit
    "Rámová sada": -36250,
  },
};

/** SKU → per-model ceník. Barevné varianty stejného modelu sdílejí pricing. */
export const CONFIGURATOR_PRICING: Record<string, ModelConfiguratorPricing> = {
  ISCELE24GGCUST: ELEMENT,
  ISCMES25JGCUST: MESON,
  ISCMES26MWCUST: MESON,
  ISCMES26RRCUST: MESON,
  ISCBOS24MWCUST: BOSON,
  ISCBOS25SSCUST: BOSON,
  // TODO doplnit z screenů: Torus (gravel), Kaon, Vitron (road)
};

/** Vrátí per-model ceník pro dané SKU, nebo null (→ model není verified). */
export function getConfiguratorPricing(sku: string | undefined): ModelConfiguratorPricing | null {
  if (!sku) return null;
  return CONFIGURATOR_PRICING[sku] ?? null;
}

/**
 * Nastaví do schématu priceModifierCzk podle per-model ceníku (match dle názvu
 * tagu; neuvedený tag = 0). Base cenu (Sportimport default) aplikuje volající
 * přes product.priceWithVat = pricing.base.
 */
export function applyModelPricingToSchema(
  schema: ConfiguratorSchema,
  pricing: ModelConfiguratorPricing,
): ConfiguratorSchema {
  return {
    ...schema,
    tags: schema.tags.map((t) => ({ ...t, priceModifierCzk: pricing.modifiers[t.name] ?? 0 })),
  };
}
