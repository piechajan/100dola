import type { Product } from "@/data/products";
import type { Gender, UseCase } from "@/data/categories";

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
 * categoryId, gender, useCase: per-brand heuristika podle name/properties.
 * Admin override přes row.public_category_id / row.public_badges.
 */
export function supplierToProduct({ row, brandSlug }: SupplierToProductInput): Product {
  const price = Math.round(Number(row.price_czk_retail ?? 0));
  const slug = row.public_slug || defaultPublicSlug(row);
  const badges = row.public_badges ?? [];
  const photo = row.main_image_url || row.image_urls?.[0] || "/media/sport-hero.jpg";

  const props = (row.properties ?? {}) as Record<string, unknown>;

  // Per-brand category resolver
  const categoryId =
    row.public_category_id ||
    inferCategoryByBrand(brandSlug, row.name, props, row.raw_category_path) ||
    "silnicni-aero";

  const gender = inferGender(props, row.name);
  const useCase = inferUseCase(brandSlug, row.name, props);
  const bulky = isBulkyBySlugOrCategory(brandSlug, categoryId);

  const specs: string[] = [];
  for (const key of ["Materiál rámu", "Sada převodů", "Hmotnost", "Velikost", "Sezóna"]) {
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
    bulky,
    badges,
    note: stripHtml(row.description_html ?? "").slice(0, 200),
    photo,
    specs,
    fulfillment: "supplier",
    supplierProductId: row.id,
    gender,
    useCase,
  };
}

// ─── Category inference ──────────────────────────────────────────────────────

function inferCategoryByBrand(
  brand: string,
  name: string,
  props: Record<string, unknown>,
  rawPath: string | null,
): string | null {
  const lowerName = name.toLowerCase();
  const lowerPath = (rawPath ?? "").toLowerCase();

  if (brand === "isaac") return inferIsaacCategory(lowerName);
  if (brand === "ffwd") return inferFfwdCategory(lowerName, lowerPath);
  if (brand === "4iiii") return "wattmetry";
  if (brand === "ale") return inferAleCategory(props, lowerName, lowerPath);

  // Generic fallback z raw_category_path
  if (lowerPath.includes("gravel")) return "gravel-1x";
  if (lowerPath.includes("silnič") || lowerPath.includes("road")) return "silnicni-endurance";
  if (lowerPath.includes("mtb") || lowerPath.includes("horsk")) return "mtb-pevna";
  return null;
}

/**
 * ISAAC model name → kategorie. Postaveno na známých modelech Sportimportu:
 *  Boson  → silniční aero / triatlon (TT geometrie)
 *  Vitron → silniční aero
 *  Meson  → silniční race
 *  Element, Kaon, Torus → gravel
 */
function inferIsaacCategory(lowerName: string): string {
  if (/\bboson\b/.test(lowerName)) return "triatlon";
  if (/\bvitron\b/.test(lowerName)) return "silnicni-aero";
  if (/\bmeson\b/.test(lowerName)) return "silnicni-race";
  if (/\b(element|kaon|torus)\b/.test(lowerName)) return "gravel-1x";
  return "silnicni-endurance";
}

function inferFfwdCategory(lowerName: string, lowerPath: string): string {
  if (/\b(triatlon|tt|tri\s|disc)\b/.test(lowerName + " " + lowerPath)) return "vyplety-triatlon";
  if (/\bgravel\b/.test(lowerName + " " + lowerPath)) return "vyplety-gravel";
  if (/\bmtb\b/.test(lowerName + " " + lowerPath)) return "vyplety-mtb";
  return "vyplety-silnicni";
}

function inferAleCategory(
  props: Record<string, unknown>,
  lowerName: string,
  lowerPath: string,
): string {
  const druh = String(props["Druh"] ?? "").toLowerCase();
  const combined = `${druh} ${lowerName} ${lowerPath}`;
  if (/dres|jersey/.test(combined)) return "obleceni-dresy";
  if (/kalhot|short|bib|laclov/.test(combined)) return "obleceni-kalhoty";
  if (/bund|vest|jacket/.test(combined)) return "obleceni-bundy";
  if (/spodn|underw/.test(combined)) return "obleceni-spodni";
  if (/rukav|pono|sock|glove/.test(combined)) return "obleceni-rukavice-ponozky";
  if (/zim|wint|therm/.test(combined)) return "obleceni-zima";
  return "obleceni-dresy";
}

// ─── Gender / Use case ───────────────────────────────────────────────────────

function inferGender(props: Record<string, unknown>, name: string): Gender {
  const p = String(props["Pohlaví"] ?? props["Gender"] ?? "").toLowerCase();
  if (/^m\b|men|p[áa]n/.test(p)) return "M";
  if (/^f\b|^w\b|women|d[áa]m/.test(p)) return "F";
  if (/junior|child|kid|d[ěe]t/.test(p)) return "K";

  // Heuristika z názvu — některé brandy uvedou v názvu
  const n = name.toLowerCase();
  if (/\bwomen|\bdam[ks]/.test(n)) return "F";
  if (/\bmen\b/.test(n)) return "M";
  if (/\bkid|\bjunior|\bd[ěe]ti/.test(n)) return "K";
  return "U";
}

function inferUseCase(
  brand: string,
  name: string,
  props: Record<string, unknown>,
): UseCase | null {
  const n = name.toLowerCase();
  const propsCombined = Object.values(props).join(" ").toLowerCase();
  const haystack = `${n} ${propsCombined}`;
  if (/race|závod|závodn|pro\b|elite|aero\b/.test(haystack)) return "race";
  if (/performance|výkon|trénink|training|endur/.test(haystack)) return "performance";
  if (/leisure|rekrea|pohodl|comfort|fitness/.test(haystack)) return "leisure";

  // Defaulty per brand
  if (brand === "isaac") return "race"; // ISAAC carbon kola jsou race-oriented
  if (brand === "ffwd") return "race"; // performance wheelsets
  if (brand === "ale") return "performance"; // ALE cycling oblečení
  return null;
}

function isBulkyBySlugOrCategory(brand: string, categoryId: string): boolean {
  if (categoryId.startsWith("silnicni") || categoryId.startsWith("mtb") || categoryId.startsWith("gravel")) return true;
  if (categoryId === "triatlon" || categoryId === "elektro") return true;
  if (categoryId.startsWith("vyplety")) return true; // wheelsets = big box
  if (brand === "isaac") return true;
  return false;
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
