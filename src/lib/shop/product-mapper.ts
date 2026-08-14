import type { Product, ConfiguratorSchema } from "@/data/products";
import type { Gender, UseCase } from "@/data/categories";
import { colorFamilyId } from "@/lib/shop/colors";

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
  configurator_schema?: unknown;
  local_image_url?: string | null;
  local_image_urls?: string[] | null;
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
  // Prefer Supabase Storage URL (instant CDN), fallback na proxy /api/img/
  const photo =
    row.local_image_url
    || wrapSupplierImage(row.main_image_url || row.image_urls?.[0] || "/media/sport-hero.jpg");

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

  // Gallery: prefer Supabase Storage local_image_urls (jen hero migrovaný v Phase A;
  // pokud chybí zbytek, fallback na proxy pro každé další image_urls).
  let gallery: string[] = [];
  if (row.local_image_urls && row.local_image_urls.length > 0) {
    gallery = [...row.local_image_urls];
    // Doplň zbylé Sportimport image_urls které se ještě nemigrovaly (přes proxy)
    const localCount = row.local_image_urls.length;
    const remoteRest = (row.image_urls ?? []).slice(localCount);
    for (const u of remoteRest) gallery.push(wrapSupplierImage(u));
  } else {
    const galleryRaw = row.image_urls ?? [];
    const gallerySet = new Set<string>();
    if (row.main_image_url) gallerySet.add(row.main_image_url);
    for (const u of galleryRaw) gallerySet.add(u);
    gallery = Array.from(gallerySet).map((u) => wrapSupplierImage(u));
  }

  const colorRaw = props["Barva"];
  const color = typeof colorRaw === "string" && colorRaw.trim() ? colorRaw.trim() : undefined;
  const colorFamily = colorFamilyId(color) ?? undefined;

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
    // CEP máme skladem u nás → „own" (ne „objednáváme od dodavatele").
    fulfillment: brandSlug === "cep" ? "own" : "supplier",
    supplierProductId: row.id,
    gender,
    useCase,
    gallery: gallery.length > 1 ? gallery : undefined,
    variants: Array.isArray(row.variants) && row.variants.length > 0
      ? (row.variants as Product["variants"])
      : undefined,
    hasConfigurator: row.has_configurator,
    configuratorSchema: parseConfiguratorSchema(row.configurator_schema),
    color,
    colorFamily,
  };
}

function parseConfiguratorSchema(raw: unknown): ConfiguratorSchema | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const r = raw as Record<string, unknown>;
  const opts = Array.isArray(r.options) ? r.options : [];
  const tgs = Array.isArray(r.tags) ? r.tags : [];
  if (opts.length === 0) return undefined;
  return {
    configuratorName: typeof r.configuratorName === "string" ? r.configuratorName : undefined,
    configuratorExternalId: typeof r.configuratorExternalId === "string" ? r.configuratorExternalId : undefined,
    options: opts.map((o) => {
      const opt = o as Record<string, unknown>;
      return {
        name: String(opt.name ?? ""),
        externalId: String(opt.externalId ?? ""),
        defaultTagExternalId:
          opt.defaultTagExternalId != null ? String(opt.defaultTagExternalId) : undefined,
      };
    }),
    tags: tgs.map((t) => {
      const tag = t as Record<string, unknown>;
      return {
        name: String(tag.name ?? ""),
        externalId: String(tag.externalId ?? ""),
        isAvailable: Boolean(tag.isAvailable),
        optionExternalId: String(tag.optionExternalId ?? ""),
        priceModifierCzk: Number(tag.priceModifierCzk ?? 0),
      };
    }),
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
  if (brand === "cep") return inferCepCategory(lowerName, lowerPath);

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
 *
 * Doplňky a náhradní díly (patky, kryty, zámky, šrouby) → doplňky
 * — i když mají v názvu „pro model TORUS / Boson / Meson".
 */
function inferIsaacCategory(lowerName: string): string {
  // JavaScript \b je byte-based pro ASCII, ne Unicode-aware — pro česká slova
  // (ř, í, ě, š atd.) word boundary selhává. Místo \b používáme positive
  // pre-context "^|[\\s/-]" pro start of word match na ASCII boundary.
  // 1) Detekce doplňků / náhradních dílů (priorita PŘED model match)
  if (/(?:^|[\s/-])(omot[áa]vk|bar.?tape|grip)/i.test(lowerName)) return "doplnky-omotavky";
  if (/(?:^|[\s/-])(ko[šs][íi]k|bottle.?cage)/i.test(lowerName)) return "doplnky-kosiky";
  if (/(?:^|[\s/-])((zadn[íi]|p[řr]edn[íi])?\s*(pevn[áa]\s+)?osa|thru.?axle)\b/i.test(lowerName)) return "doplnky-osy";
  if (/(?:^|[\s/-])(p[řr]edstavec|stem)\b/i.test(lowerName)) return "doplnky-predstavce";
  if (/(?:^|[\s/-])(sedlo|sedlovk|saddle|seatpost)/i.test(lowerName)) return "sedla-silnicni";
  if (/(?:^|[\s/-])([řr][íi]d[íi]tk|handlebar)/i.test(lowerName)) return "doplnky-ridilka";
  if (/(?:^|[\s/-])(pedál|pedal)/i.test(lowerName)) return "pedaly-silnicni";
  if (/(?:^|[\s/-])(patka|kryt|silikon|n[áa]hradn|z[áa]mek|š?roub|adapter|sada\b|příslušenstv|adapt[ée]r|hlavov[éeé] slo[žz]en|láhev)/i.test(lowerName)) {
    return "doplnky"; // generic fallback
  }
  // 2) Skutečná kola podle modelu (ASCII word boundary funguje)
  if (/\bboson\b/.test(lowerName)) return "triatlon";
  if (/\bvitron\b/.test(lowerName)) return "silnicni-aero";
  if (/\bmeson\b/.test(lowerName)) return "silnicni-race";
  if (/\b(element|kaon|torus)\b/.test(lowerName)) return "gravel-1x";
  return "silnicni-endurance";
}

/**
 * CEP (Medi-Expert) kompresní/běžecké vybavení → kategorie „Běh" (beh-*).
 * Mapuje primárně z NÁZVU (Výprodej/ORTHO nemají typ v CATEGORYTEXT), fallback path.
 */
function inferCepCategory(lowerName: string, lowerPath: string): string {
  const s = `${lowerName} ${lowerPath}`;
  if (/boty|obuv|shoes|optaspeed/.test(s)) return "beh-obuv";
  if (/podkolenk/.test(s)) return "beh-podkolenky";
  if (/návlek|navlek|sleeve/.test(s)) return "beh-navleky";
  if (/ponožk|ponozk|sock/.test(s)) return "beh-ponozky";
  if (/kšilt|ksilt|čepic|cepic|cap\b|čelenk|celenk|rukavic|batoh|láhev|lahev|doplňk|doplnk/.test(s))
    return "beh-doplnky";
  if (/tričk|tri[čc]k|dres|top\b|bunda|vesta|jacket|šortk|sortk|short|kalhot|legín|legin|3\/4|tight|oblečen|obleceni|spodní|base\s?layer/.test(s))
    return "beh-obleceni";
  return "beh-obleceni";
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

/**
 * Public helper pro re-categorization skripty.
 * Reuses inferIsaacCategory / inferFfwdCategory / inferAleCategory podle brandu.
 */
export function inferCategoryForBrand(
  brand: string,
  name: string,
  props: Record<string, unknown>,
  categoryPath: string,
): string {
  const lowerName = name.toLowerCase();
  const lowerPath = categoryPath.toLowerCase();
  if (brand === "isaac") return inferIsaacCategory(lowerName);
  if (brand === "ffwd") return inferFfwdCategory(lowerName, lowerPath);
  if (brand === "ale") return inferAleCategory(props, lowerName, lowerPath);
  return "doplnky";
}

function isBulkyBySlugOrCategory(brand: string, categoryId: string): boolean {
  if (categoryId.startsWith("silnicni") || categoryId.startsWith("mtb") || categoryId.startsWith("gravel")) return true;
  if (categoryId === "triatlon" || categoryId === "elektro") return true;
  if (categoryId.startsWith("vyplety")) return true; // wheelsets = big box
  if (brand === "isaac") return true;
  return false;
}

/**
 * Supplier image URLs běží přes /api/img proxy — proxy:
 *  - vyřeší chybějící Content-Type ze Sportimport
 *  - přidá 1y immutable cache → Vercel edge cache
 *  - Next/Image pak může bezpečně optimalizovat (AVIF/WebP/resize)
 *
 * Vlastní static fotky (/media/...) zůstávají nedotčené.
 */
const SUPPLIER_HOSTS_FOR_PROXY = ["www.sportimport.cz", "www.alecko.cz"];

export function wrapSupplierImage(url: string): string {
  if (!url || !url.startsWith("http")) return url;
  try {
    const u = new URL(url);
    if (SUPPLIER_HOSTS_FOR_PROXY.includes(u.hostname)) {
      // base64url path → žádný query string → Next/Image local optimizer OK
      const encoded = Buffer.from(url, "utf-8").toString("base64url");
      return `/api/img/${encoded}`;
    }
  } catch {
    // ignore
  }
  return url;
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
