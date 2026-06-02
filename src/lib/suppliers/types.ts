// Multi-supplier adapter pattern.
// Každý dodavatel implementuje `SupplierAdapter` — Claude/admin pak importuje skrz unified flow.
//
// Architektura:
//   1. `fetchFeed(brandId, opts)` → vrátí pole `RawSupplierProduct` z XML/JSON/CSV feedu
//   2. Importer (centrální) převede `RawSupplierProduct` → `supplier_products` v DB
//   3. Pokud má produkt `configuratorSchema`, importer rozparsuje a uloží do `configurator_options/_tags`
//
// Reference adapter: `src/lib/suppliers/sportimport/`

export type Currency = "CZK" | "EUR" | "HUF" | "PLN" | "USD" | "GBP";

export type RawPriceSet = {
  retailCzk?: number;
  retailEur?: number;
  dealerCzk?: number;
  dealerEur?: number;
  // další měny jako optional pole pro budoucnost
  raw?: Record<string, number>;
};

export type RawVariant = {
  sku?: string;
  ean?: string;
  size?: string;
  color?: string;
  isInStock?: boolean;
  availability?: string; // např. „skladem", „na objednávku", „2 týdny"
  externalId?: string;
};

export type RawConfiguratorOption = {
  externalId: string; // jejich option id (např. „673")
  name: string; // „Kompletace" | „Velikost"
  displayOrder: number;
  isRequired: boolean;
  displayStyle?: string; // „1" → radio, „2" → dropdown, atd. (supplier-specific)
  defaultTagExternalId?: string;
  note?: string;
};

export type RawConfiguratorTag = {
  externalId: string; // jejich tag id (např. „198")
  optionExternalId: string; // do kterého option patří
  name: string; // „Shimano Ultegra Di2" | „vel. L"
  priceModifierCzk?: number; // 0 pro default
  imageUrl?: string;
  isAvailable?: boolean;
  displayOrder?: number;
};

export type RawConfiguratorSchema = {
  configuratorExternalId: string; // jejich configurator id
  configuratorName?: string;
  options: RawConfiguratorOption[];
  tags: RawConfiguratorTag[];
  // raw payload pro debug
  raw?: unknown;
};

export type RawSupplierProduct = {
  externalId: string; // jejich item id
  sku?: string;
  ean?: string;
  name: string;
  descriptionHtml?: string;
  prices: RawPriceSet;
  properties?: Record<string, string>; // např. { „Druh": „Dres", „Sezóna": „SS26" }
  rawCategoryPath?: string; // pipe-separated „Kola|Silniční|Závodní"
  mainImageUrl?: string;
  imageUrls?: string[];
  variants?: RawVariant[];
  hasConfigurator?: boolean;
  configuratorSchema?: RawConfiguratorSchema;
  raw?: unknown; // celý parsed XML node pro audit
};

export type FetchFeedOptions = {
  /** Pokud true, includes inactive items také (default: false — jen `active="1"`) */
  includeInactive?: boolean;
  /** Volitelný filter, který adaptér aplikuje na vrácená data (např. ALE sezóna) */
  filter?: Record<string, unknown>;
  /** Preferovaná měna v pricing fields. Adaptér extrahuje další měny do `raw` */
  preferredCurrency?: Currency;
  /** Jazyk (např. „cs", „en", „hu") */
  language?: string;
  /** Hard timeout pro fetch (ms). Default 60000. */
  timeoutMs?: number;
};

export type SupplierAdapter = {
  /** Stable identifikátor — odpovídá `suppliers.adapter_id` v DB */
  id: string;
  /** Lidský název */
  name: string;
  /** Stabilní URL base, kde feed žije */
  feedBaseUrl: string;
  /**
   * Stáhne a parsne feed pro daný brand externí ID (např. „9" pro ISAAC v Sportimport).
   * Vrátí pole produktů. Idempotentní — multiple call vrací stejná data (modulo aktuální stock).
   */
  fetchFeed(brandExternalId: string, opts?: FetchFeedOptions): Promise<RawSupplierProduct[]>;
  /**
   * Volitelná validace — adaptér může zkontrolovat, jestli feed dává smysl
   * (např. „má víc než 0 itemů", „obsahuje očekávané pole"). Default = always OK.
   */
  validateFeed?(products: RawSupplierProduct[]): Promise<{
    ok: boolean;
    warnings?: string[];
    errors?: string[];
  }>;
};

/**
 * Filter helper — adaptér nebo importer ho použije proti `import_filter` z DB.
 * Sportimport pattern pro ALE: { seasons: ['SS26','AW26'], genders: ['M','F'] }
 * Filter aplikuje proti `product.properties` (key-value match).
 */
export function matchesFilter(
  product: RawSupplierProduct,
  filter: Record<string, unknown> | null | undefined,
): boolean {
  if (!filter || Object.keys(filter).length === 0) return true;
  const props = product.properties ?? {};

  for (const [key, allowedRaw] of Object.entries(filter)) {
    if (!Array.isArray(allowedRaw)) continue;
    const allowed = allowedRaw as string[];
    if (allowed.length === 0) continue;

    // Pokus se najít odpovídající property (case-insensitive match na klíč)
    // Filter klíče jsou v naší kanonické formě (např. „seasons", „genders");
    // mapujeme na supplier-specific (např. „Sezóna", „Pohlaví") via SUPPLIER_PROPERTY_ALIASES.
    const aliases = SUPPLIER_PROPERTY_ALIASES[key] ?? [key];
    let matched = false;
    for (const alias of aliases) {
      const value = props[alias];
      if (value && allowed.some((a) => normalize(a) === normalize(value))) {
        matched = true;
        break;
      }
    }
    if (!matched) return false;
  }

  return true;
}

const SUPPLIER_PROPERTY_ALIASES: Record<string, string[]> = {
  seasons: ["Sezóna", "Sezona", "Season"],
  genders: ["Pohlaví", "Pohlavi", "Gender"],
  models: ["Modelový rok", "Modelovy rok", "Model year"],
  colors: ["Barva", "Color"],
  cuts: ["Střih", "Strih", "Cut"],
};

function normalize(s: string): string {
  return s.trim().toLowerCase();
}
