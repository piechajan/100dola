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

/**
 * Vloží do schématu volbu „Barva" (za Velikost) s barvami modelu jako tagy
 * (bez příplatku). ISAAC CUSTOM modely jsou na webu jednou a barvu si zákazník
 * zvolí tady. Barva se propíše do buildu/objednávky.
 */
export function injectColorOption(schema: ConfiguratorSchema, colors: string[] | undefined): ConfiguratorSchema {
  if (!colors || colors.length === 0) return schema;
  const OPT = "barva";
  const tags = colors.map((c, i) => ({
    name: c,
    externalId: `${OPT}-${i}`,
    isAvailable: true,
    optionExternalId: OPT,
    priceModifierCzk: 0,
  }));
  const option = { name: "Barva", externalId: OPT, defaultTagExternalId: `${OPT}-0` };
  const options = [...schema.options];
  const velIdx = options.findIndex((o) => /velikost/i.test(o.name));
  options.splice(velIdx >= 0 ? velIdx + 1 : options.length, 0, option);
  return { ...schema, options, tags: [...schema.tags, ...tags] };
}

/**
 * Kompatibilita KOLO → NÁBOJ (ISAAC). V reálném ISAAC konfigurátoru jde ke
 * každému kolu přiřadit jen 1–2 náboje — náboj se váže na kolo, ne na model.
 * Potvrzeno ze screenshotů:
 *   - DT Swiss ARC 1600 55  → jen DT Swiss 350
 *   - FFWD RAW…CS Carbon    → jen FFWD/CeramicSpeed 2:1
 *   - FFWD RYOT33 Carbon    → FFWD N/GAGE SP 2:1 + DT Swiss 240 SP 2:1
 * Odvozeno (brand/tier logika, potvrdit): FORE, DT gravel wheels.
 * Vrací seznam regexů matchujících povolené názvy nábojů; null = neomezovat
 * (neznámé kolo / „bez kol" → bezpečný fallback, žádná restrikce).
 */
export function allowedHubPatternsForWheel(wheelName: string): RegExp[] | null {
  const w = wheelName.toLowerCase();
  if (/bez\s*kol/.test(w)) return null; // rámová sada / bez kol → náboj neřešíme
  // CeramicSpeed kola (RAW…CS) → jen CeramicSpeed náboj
  if (/ceramicspeed|raw\s*\d+\s*cs|\bcs\b/.test(w)) return [/ceramicspeed/i];
  // DT Swiss silniční (ARC) → DT Swiss 350
  if (/arc\s*1600|dt\s*swiss\s*arc/.test(w)) return [/dt\s*swiss\s*350/i];
  // DT Swiss gravel (G1800 / E1800) → DT Swiss 370 OEM
  if (/[ge]1800/.test(w)) return [/dt\s*swiss\s*370/i, /dt\s*swiss\s*240/i];
  // FORE kola → DT Swiss náboje (default 350, upgrade 240)
  if (/\bfore\b/.test(w)) return [/dt\s*swiss\s*350/i, /dt\s*swiss\s*240/i];
  // FFWD standardní carbon (RYOT / TYRO / DRIFT) → FFWD N/GAGE + DT Swiss 240
  if (/ryot|tyro|drift/.test(w)) return [/n\s*\/?\s*gage/i, /dt\s*swiss\s*240/i];
  return null;
}

/** True, když daný náboj sedí k danému kolu (nebo kolo nemá omezení). */
export function isHubAllowedForWheel(wheelName: string, hubName: string): boolean {
  const pats = allowedHubPatternsForWheel(wheelName);
  if (!pats) return true;
  return pats.some((re) => re.test(hubName));
}
