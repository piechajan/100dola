// Sportimport XML feed parser.
// Doc: https://www.sportimport.cz/export/xml/catalogue/<BRAND_ID>
//
// Per <item> má: id, code (SKU), ean, name, description (CDATA HTML),
//   price/rrp/dealerPrices (per currency), properties, image, allImages,
//   variants (per size/color + availability), eshopCategories,
//   useConfigurator (0/1), configurator (PHP-serialized).

import { XMLParser } from "fast-xml-parser";
import { phpUnserialize, type PhpValue } from "../php-unserialize";
import type {
  RawSupplierProduct,
  RawConfiguratorSchema,
  RawConfiguratorOption,
  RawConfiguratorTag,
  RawPriceSet,
  RawVariant,
} from "../types";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  // Schválně vypnuté — chceme atributy jako stringy ("1" ne number 1)
  parseAttributeValue: false,
  parseTagValue: false, // necháme stringy beze změny — PHP-serialized parsing potřebuje raw
  cdataPropName: "__cdata",
  trimValues: true,
});

function asString(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  return String(value);
}

type RawXml = {
  export?: {
    brand?: RawBrand | RawBrand[];
  };
};

type RawBrand = {
  "@_id"?: string;
  name?: string;
  items?: {
    "@_count"?: string;
    item?: RawItem | RawItem[];
  };
};

type RawItem = {
  "@_id"?: string;
  "@_active"?: string;
  code?: string;
  ean?: string;
  name?: string;
  description?: string | { __cdata?: string };
  price?: RawCurrencyValue | RawCurrencyValue[];
  rrp?: RawCurrencyValue | RawCurrencyValue[];
  dealerPrices?: {
    price?: RawCurrencyValue | RawCurrencyValue[];
    rdp?: RawCurrencyValue | RawCurrencyValue[];
  };
  useConfigurator?: string;
  configurator?: string | { __cdata?: string };
  properties?: { property?: RawProperty | RawProperty[] };
  image?: string;
  allImages?: { image?: string | string[] };
  variants?: { variant?: RawVariant_Sportimport | RawVariant_Sportimport[] };
  eshopCategories?: string;
  inStock?: string;
  availability?: string;
};

type RawCurrencyValue = {
  "@_currency"?: string;
  "#text"?: string;
};

type RawProperty = {
  name?: string;
  // value může být buď string, nebo objekt { "#text": ..., "@_id": ... } pokud má atributy
  value?: string | { "#text"?: string; "@_id"?: string };
};

type RawVariant_Sportimport = {
  "@_id"?: string;
  code?: string;
  ean?: string;
  size?: string;
  color?: string;
  inStock?: string;
  availability?: string;
};

function asArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

function cdata(node: string | { __cdata?: string } | undefined): string | undefined {
  if (node === undefined || node === null) return undefined;
  if (typeof node === "string") return node;
  return node.__cdata;
}

function extractCurrencyValue(
  node: RawCurrencyValue | RawCurrencyValue[] | undefined,
  currency: string,
): number | undefined {
  for (const entry of asArray(node)) {
    if (entry["@_currency"] === currency) {
      const num = Number.parseFloat(entry["#text"] ?? "");
      if (Number.isFinite(num)) return num;
    }
  }
  return undefined;
}

function buildPrices(item: RawItem): RawPriceSet {
  const retailCzk = extractCurrencyValue(item.price, "CZK") ?? extractCurrencyValue(item.rrp, "CZK");
  const retailEur = extractCurrencyValue(item.price, "EUR") ?? extractCurrencyValue(item.rrp, "EUR");
  const dealer = item.dealerPrices;
  const dealerCzk = dealer ? extractCurrencyValue(dealer.rdp, "CZK") ?? extractCurrencyValue(dealer.price, "CZK") : undefined;
  const dealerEur = dealer ? extractCurrencyValue(dealer.rdp, "EUR") ?? extractCurrencyValue(dealer.price, "EUR") : undefined;
  return { retailCzk, retailEur, dealerCzk, dealerEur };
}

function buildProperties(item: RawItem): Record<string, string> | undefined {
  const props = asArray(item.properties?.property);
  if (props.length === 0) return undefined;
  const out: Record<string, string> = {};
  for (const p of props) {
    if (!p.name) continue;
    const key = String(p.name).trim();
    let value: string | undefined;
    if (typeof p.value === "string") {
      value = p.value.trim();
    } else if (p.value && typeof p.value === "object" && "#text" in p.value) {
      value = String(p.value["#text"]).trim();
    }
    if (value) out[key] = value;
  }
  return Object.keys(out).length ? out : undefined;
}

function buildVariants(item: RawItem): RawVariant[] | undefined {
  const variants = asArray(item.variants?.variant);
  if (variants.length === 0) return undefined;
  return variants.map((v) => ({
    externalId: v["@_id"],
    sku: v.code,
    ean: v.ean,
    size: v.size,
    color: v.color,
    isInStock: v.inStock === "1" || v.inStock === "true",
    availability: v.availability,
  }));
}

function buildImages(item: RawItem): { main?: string; all?: string[] } {
  const main = item.image;
  const all = asArray(item.allImages?.image)
    .map((x) => (typeof x === "string" ? x : (x as RawCurrencyValue)?.["#text"]))
    .filter((x): x is string => typeof x === "string" && x.length > 0);
  return { main, all: all.length > 0 ? all : undefined };
}

/**
 * Konvertuje PHP-serialized `configurator` payload na strukturovaný schema.
 * Sportimport payload struktura (per ISAAC inspection):
 *   configurator        — [ { id, name } ]                                  identita modelu
 *   config_options      — [ { id, name, default_tag, required, order, … } ] kroky wizardu
 *   config_option_tags  — [ { id, option, tag } ]                           option ↔ tag mapping (id = mapping id)
 *   config_option_diff  — [ { id, option_tag, diff_price, currency } ]      ± k základu per option-tag mapping
 *   tags                — [ { id, name, img, desc, … } ]                    tag definice s obrázkem
 *   tag_groups          — [ { id, name, … } ]                               metadata, neimportujeme
 */
function parseConfigurator(configBlob: string): RawConfiguratorSchema | undefined {
  if (!configBlob || configBlob.length === 0) return undefined;
  let payload: PhpValue;
  try {
    payload = phpUnserialize(configBlob);
  } catch (e) {
    console.warn(`[sportimport] PHP unserialize failed: ${(e as Error).message}`);
    return undefined;
  }

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return undefined;
  const root = payload as Record<string, PhpValue>;

  // 1. konfigurator identity
  const configEntries = (root.configurator as PhpValue[] | undefined) ?? [];
  const first = configEntries[0] as Record<string, PhpValue> | undefined;
  const configuratorExternalId = String(first?.id ?? "");
  const configuratorName = first?.name ? String(first.name) : undefined;
  if (!configuratorExternalId) return undefined;

  // 2. options
  const rawOptions = (root.config_options as PhpValue[] | undefined) ?? [];
  const options: RawConfiguratorOption[] = rawOptions
    .map((o): RawConfiguratorOption | undefined => {
      if (!o || typeof o !== "object" || Array.isArray(o)) return undefined;
      const rec = o as Record<string, PhpValue>;
      if (!rec.id || !rec.name) return undefined;
      return {
        externalId: String(rec.id),
        name: String(rec.name),
        displayOrder: Number.parseInt(String(rec.order ?? "0"), 10),
        isRequired: String(rec.required ?? "0") === "1",
        displayStyle: rec.display_style ? String(rec.display_style) : undefined,
        defaultTagExternalId: rec.default_tag ? String(rec.default_tag) : undefined,
        note: rec.note ? String(rec.note) : undefined,
      };
    })
    .filter((x): x is RawConfiguratorOption => x !== undefined);

  // 3. option ↔ tag mapping (mapping id = key pro config_option_diff)
  const rawMappings = (root.config_option_tags as PhpValue[] | undefined) ?? [];
  const tagToOption = new Map<string, string>();        // tag_id → option_id
  const mappingByTagOption = new Map<string, string>(); // "option_id:tag_id" → mapping_id
  for (const m of rawMappings) {
    if (!m || typeof m !== "object" || Array.isArray(m)) continue;
    const rec = m as Record<string, PhpValue>;
    const mappingId = String(rec.id ?? "");
    const optionId = String(rec.option ?? "");
    const tagId = String(rec.tag ?? "");
    if (optionId && tagId) {
      tagToOption.set(tagId, optionId);
      if (mappingId) mappingByTagOption.set(`${optionId}:${tagId}`, mappingId);
    }
  }

  // 4. tag definitions (jméno, image, popis)
  const rawTagDefs = (root.tags as PhpValue[] | undefined) ?? [];
  const tagDefById = new Map<string, Record<string, PhpValue>>();
  for (const t of rawTagDefs) {
    if (!t || typeof t !== "object" || Array.isArray(t)) continue;
    const rec = t as Record<string, PhpValue>;
    if (rec.id) tagDefById.set(String(rec.id), rec);
  }

  // 5. price diffs (± k základu per option-tag mapping)
  // Sportimport číselné currency kódy: 1=CZK, 2=EUR, 3=HUF, 4=PLN
  // price_type: 1=retail (RRP, kupující platí), 2=dealer (naše nákupka), 3=další tier
  // diff_price je v "halíři" — dělit 100 pro koruny.
  const CURRENCY_CZK = "1";
  const PRICE_TYPE_RETAIL = "1";
  const rawDiffs = (root.config_option_diff as PhpValue[] | undefined) ?? [];
  const diffByMappingId = new Map<string, number>();
  for (const d of rawDiffs) {
    if (!d || typeof d !== "object" || Array.isArray(d)) continue;
    const rec = d as Record<string, PhpValue>;
    const mappingId = String(rec.option_tag ?? "");
    const currency = String(rec.currency ?? "");
    const priceType = String(rec.price_type ?? "");
    const diffCents = Number.parseFloat(String(rec.diff_price ?? "0"));
    if (
      mappingId &&
      currency === CURRENCY_CZK &&
      priceType === PRICE_TYPE_RETAIL &&
      Number.isFinite(diffCents)
    ) {
      diffByMappingId.set(mappingId, diffCents / 100); // halíře → koruny
    }
  }

  // 6. zkomponuj tags
  const tags: RawConfiguratorTag[] = [];
  for (const [tagId, optionId] of tagToOption.entries()) {
    const def = tagDefById.get(tagId);
    const mappingId = mappingByTagOption.get(`${optionId}:${tagId}`);
    const img = def?.img ? String(def.img) : undefined;
    tags.push({
      externalId: tagId,
      optionExternalId: optionId,
      name: def?.name ? String(def.name) : `tag ${tagId}`,
      priceModifierCzk: mappingId ? (diffByMappingId.get(mappingId) ?? 0) : 0,
      imageUrl: img,
      isAvailable: def?.public !== "0",
    });
  }

  return {
    configuratorExternalId,
    configuratorName,
    options: options.sort((a, b) => a.displayOrder - b.displayOrder),
    tags,
    raw: process.env.NODE_ENV === "development" ? payload : undefined,
  };
}

export function parseSportimportFeed(xml: string): RawSupplierProduct[] {
  const parsed = parser.parse(xml) as RawXml;
  const brandsRaw = asArray(parsed.export?.brand);
  const products: RawSupplierProduct[] = [];

  for (const brand of brandsRaw) {
    const items = asArray(brand.items?.item);
    for (const item of items) {
      // skip neaktivní by default (atribut může být string "1" nebo number 1 — defensivní check)
      const active = asString(item["@_active"]);
      if (active !== "1") continue;

      const externalId = asString(item["@_id"]);
      const name = item.name;
      if (!externalId || !name) continue;

      const desc = cdata(item.description);
      const configBlob = cdata(item.configurator);
      const hasConfigurator = asString(item.useConfigurator) === "1" && Boolean(configBlob);
      const configuratorSchema = hasConfigurator && configBlob ? parseConfigurator(configBlob) : undefined;

      const { main, all } = buildImages(item);

      products.push({
        externalId: String(externalId),
        sku: item.code,
        ean: item.ean,
        name: String(name).trim(),
        descriptionHtml: desc,
        prices: buildPrices(item),
        properties: buildProperties(item),
        rawCategoryPath: item.eshopCategories,
        mainImageUrl: main,
        imageUrls: all,
        variants: buildVariants(item),
        hasConfigurator,
        configuratorSchema,
      });
    }
  }

  return products;
}
