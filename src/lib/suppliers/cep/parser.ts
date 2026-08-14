// CEP (Medi-Expert.cz) XML feed parser — formát Zbozi.cz `<SHOP><SHOPITEM>`.
// Per SHOPITEM: ITEM_ID, ITEMGROUP_ID, PRODUCTNAME(CDATA), DESCRIPTION(CDATA HTML),
//   URL, PRICE_VAT, IMGURL, IMGURL_ALTERNATIVE, MANUFACTURER(CDATA="CEP"),
//   CATEGORYTEXT (pipe), EAN, PRODUCTNO, DELIVERY_DATE (0=skladem, jinak dny),
//   PARAM (PARAM_NAME/VAL — Barva, Velikost, Určení, Délka).
//
// Produkt = jeden ITEMGROUP_ID (typicky jedna barva), varianty = velikosti.

import { XMLParser } from "fast-xml-parser";
import type { RawSupplierProduct, RawPriceSet, RawVariant } from "../types";

const parser = new XMLParser({
  ignoreAttributes: true,
  parseTagValue: false,
  cdataPropName: "__cdata",
  trimValues: true,
});

/** Přečte text z elementu, který může být plain string nebo CDATA node. */
function txt(v: unknown): string | undefined {
  if (v === undefined || v === null) return undefined;
  if (typeof v === "string") return v.trim() || undefined;
  if (typeof v === "object" && "__cdata" in (v as Record<string, unknown>)) {
    const c = (v as { __cdata?: unknown }).__cdata;
    return c != null ? String(c).trim() || undefined : undefined;
  }
  return String(v).trim() || undefined;
}

function asArray<T>(v: T | T[] | undefined | null): T[] {
  if (v === undefined || v === null) return [];
  return Array.isArray(v) ? v : [v];
}

type RawParam = { PARAM_NAME?: unknown; VAL?: unknown };
type ShopItem = {
  ITEM_ID?: unknown;
  ITEMGROUP_ID?: unknown;
  PRODUCTNAME?: unknown;
  DESCRIPTION?: unknown;
  URL?: unknown;
  PRICE_VAT?: unknown;
  IMGURL?: unknown;
  IMGURL_ALTERNATIVE?: unknown;
  MANUFACTURER?: unknown;
  CATEGORYTEXT?: unknown;
  EAN?: unknown;
  PRODUCTNO?: unknown;
  DELIVERY_DATE?: unknown;
  PARAM?: RawParam | RawParam[];
};

function paramsOf(item: ShopItem): Record<string, string> {
  const out: Record<string, string> = {};
  for (const p of asArray(item.PARAM)) {
    const name = txt(p.PARAM_NAME);
    const val = txt(p.VAL);
    if (name && val) out[name] = val;
  }
  return out;
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Očistí název produktu: odstraní koncovou velikost + zdvojená slova („pánské pánské"). */
function cleanName(raw: string, size: string | undefined): string {
  let n = raw;
  if (size) n = n.replace(new RegExp("\\s+" + escapeRe(size) + "\\s*$"), "");
  n = n.replace(/\b(\p{L}+)\s+\1\b/giu, "$1"); // zdvojené slovo
  return n.replace(/\s{2,}/g, " ").trim();
}

export function parseCepFeed(xml: string): RawSupplierProduct[] {
  const root = parser.parse(xml) as { SHOP?: { SHOPITEM?: ShopItem | ShopItem[] } };
  const items = asArray(root.SHOP?.SHOPITEM);

  // Seskup podle ITEMGROUP_ID (fallback ITEM_ID).
  const groups = new Map<string, ShopItem[]>();
  for (const it of items) {
    const g = txt(it.ITEMGROUP_ID) ?? txt(it.ITEM_ID);
    if (!g) continue;
    (groups.get(g) ?? groups.set(g, []).get(g)!).push(it);
  }

  const products: RawSupplierProduct[] = [];
  for (const [groupId, group] of groups) {
    const first = group[0];
    const p0 = paramsOf(first);
    const rawName = txt(first.PRODUCTNAME) ?? "";
    const baseName = cleanName(rawName, p0["Velikost"]);
    if (!baseName) continue;

    const priceNum = Number(txt(first.PRICE_VAT) ?? "");
    const prices: RawPriceSet = {
      retailCzk: Number.isFinite(priceNum) && priceNum > 0 ? Math.round(priceNum) : undefined,
    };

    const altImgs = asArray(first.IMGURL_ALTERNATIVE)
      .map((x) => txt(x))
      .filter((x): x is string => !!x);

    const variants: RawVariant[] = group.map((it) => {
      const p = paramsOf(it);
      const inStock = txt(it.DELIVERY_DATE) === "0";
      return {
        externalId: txt(it.ITEM_ID),
        sku: txt(it.PRODUCTNO),
        ean: txt(it.EAN),
        size: p["Velikost"],
        color: p["Barva"],
        isInStock: inStock,
        availability: inStock ? "Skladem" : "Na objednávku",
      };
    });

    const properties: Record<string, string> = {};
    if (p0["Barva"]) properties["Barva"] = p0["Barva"];
    if (p0["Určení"]) properties["Určení"] = p0["Určení"];

    products.push({
      externalId: groupId,
      sku: txt(first.PRODUCTNO),
      ean: txt(first.EAN),
      name: baseName,
      descriptionHtml: txt(first.DESCRIPTION),
      prices,
      properties: Object.keys(properties).length ? properties : undefined,
      rawCategoryPath: txt(first.CATEGORYTEXT)
        ?.split("|")
        .map((s) => s.trim())
        .filter(Boolean)
        .join("|"),
      mainImageUrl: txt(first.IMGURL),
      imageUrls: altImgs.length ? altImgs : undefined,
      variants,
      hasConfigurator: false,
    });
  }

  return products;
}
