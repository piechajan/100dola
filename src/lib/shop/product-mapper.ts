import type { Product } from "@/data/products";

/**
 * Supplier product row (subset z DB), zploštěný do shopu jako Product.
 */
export type SupplierProductRow = {
  id: string;
  brand_id: string;
  name: string;
  sku: string | null;
  ean: string | null;
  description_html: string | null;
  price_czk_retail: number | null;
  main_image_url: string | null;
  image_urls: string[] | null;
  properties: Record<string, unknown> | null;
  raw_category_path: string | null;
  has_configurator: boolean;
  is_public_override: boolean | null;
  public_slug: string | null;
  public_category_id: string | null;
  public_badges: string[] | null;
  variants: unknown;
  is_active: boolean;
};

/**
 * Mapuje row na ID v Product.id (number).
 * UUID → 13 hex chars (52 bit) → number. Bezpečné v JS (< 2^53).
 * Statické produkty mají id 1–1000, supplier > 10^12 — bez collision.
 */
export function supplierIdToNumeric(uuid: string): number {
  const hex = uuid.replace(/-/g, "").slice(0, 13);
  const n = parseInt(hex, 16);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/**
 * Default fallback slug — supplier-<8-hex>. Stable napříč importy
 * (UUID se nemění). Jan může později nastavit public_slug v adminu.
 */
export function defaultPublicSlug(row: { id: string; sku: string | null }): string {
  if (row.sku) {
    return row.sku
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  return `produkt-${row.id.slice(0, 8)}`;
}

export type SupplierToProductInput = {
  row: SupplierProductRow;
  brandSlug: string;
};

/**
 * Hlavní mapper. Vrací Product s navíc fields fulfillment + supplierProductId.
 * Default categoryId: "silnicni-aero" (lze přepsat row.public_category_id).
 * Default badges: ["Doporučuje tým"] když brand má nějaký marketing flag — zatím prázdné.
 */
export function supplierToProduct({ row, brandSlug }: SupplierToProductInput): Product {
  const price = Math.round(Number(row.price_czk_retail ?? 0));
  const slug = row.public_slug || defaultPublicSlug(row);
  const categoryId = row.public_category_id || "silnicni-aero";
  const badges = row.public_badges ?? [];

  const photo = row.main_image_url || row.image_urls?.[0] || "/media/sport-hero.jpg";

  const specs: string[] = [];
  const props = (row.properties ?? {}) as Record<string, unknown>;
  for (const key of ["Materiál rámu", "Sada převodů", "Hmotnost", "Velikost"]) {
    const v = props[key];
    if (typeof v === "string" && v.trim()) specs.push(`${key}: ${v.trim()}`);
  }
  if (row.has_configurator && specs.length === 0) {
    specs.push("Konfigurátor: výbava na míru");
  }

  return {
    id: supplierIdToNumeric(row.id),
    slug,
    name: row.name,
    year: null,
    brand: brandSlug,
    categoryId,
    priceWithVat: price,
    vatRate: 21,
    bulky: true, // kola = velký balík default; jednotlivé doplňky lze přepsat
    badges,
    note: stripHtml(row.description_html ?? "").slice(0, 200),
    photo,
    specs,
    fulfillment: "supplier",
    supplierProductId: row.id,
  };
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
