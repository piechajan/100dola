import "server-only";
import { unstable_cache } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { PRODUCTS, type Product } from "@/data/products";
import { SCOTT_CATALOG } from "@/data/scott-catalog";
import { supplierToProduct, type SupplierProductRow } from "./product-mapper";

function getSb() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    db: { schema: "public" },
  });
}

type BrandJoin = { brand_slug: string; is_public: boolean };

/**
 * ISAAC CUSTOM: každý model má ve feedu barevné varianty (Meson Ruby Red /
 * Jade Green / Mineral White…) jako samostatné konfigurovatelné SKU. Na webu
 * chceme model JEDNOU — barvu si zákazník zvolí v konfigurátoru. Sloučíme
 * varianty podle modelu (slovo za „Isaac"), necháme jednu, přejmenujeme na
 * „… Isaac <Model> CUSTOM" (bez barvy v názvu) a barvy dáme do customColors.
 * Nekonfigurovatelné produkty (příslušenství, fixní kola) necháváme být.
 */
function collapseCustomModels(products: Product[]): Product[] {
  const rest = products.filter((p) => !p.hasConfigurator);
  const configurable = products.filter((p) => p.hasConfigurator);
  const groups = new Map<string, Product[]>();
  for (const p of configurable) {
    const model = p.name.match(/Isaac\s+(\w+)/i)?.[1] ?? p.name;
    const list = groups.get(model) ?? [];
    list.push(p);
    groups.set(model, list);
  }
  const kept: Product[] = [];
  for (const [model, list] of groups) {
    const base = list[0];
    const colors = [
      ...new Set(
        list
          .map((x) => x.name.match(new RegExp(`Isaac\\s+${model}\\s+(.+?)\\s+Custom`, "i"))?.[1]?.trim())
          .filter((c): c is string => !!c),
      ),
    ];
    const name = base.name.replace(new RegExp(`(Isaac\\s+${model}).*`, "i"), "$1 CUSTOM");
    const slug = `isaac-${model.toLowerCase()}-custom`;
    kept.push({ ...base, name, slug, customColors: colors.length > 0 ? colors : undefined });
  }
  return [...rest, ...kept];
}

/**
 * Vrátí merged katalog: vlastní static PRODUCTS + supplier_products
 * z brandů kde supplier_brands.is_public = true.
 *
 * Per-produkt override `is_public_override`:
 *  - null  → honor brand (default)
 *  - true  → vždy ukázat
 *  - false → vždy skrýt
 *
 * Tichý fallback: pokud Supabase nedostupný / env miss, vrátí jen static
 * PRODUCTS (web nikdy nespadne kvůli supplier feedu).
 */
/**
 * Stáhne JEN supplier_products z public brandů. Tato část je egress-citlivá →
 * je za sdílenou cache. Statické PRODUCTS se sem NEmíchají (viz getShopProducts).
 */
async function fetchSupplierProducts(): Promise<Product[]> {
  try {
    const sb = getSb();

    const { data: publicBrands, error: bErr } = await sb
      .from("supplier_brands")
      .select("id, brand_slug, is_public")
      .eq("is_public", true);

    // POZOR: chyby MUSÍ throwovat, ne vracet [] — jinak unstable_cache
    // zacacheuje prázdný výsledek na 6 h a supplier produkty (ISAAC…) zmizí
    // z celého webu, i když v DB jsou. Throw = cache neuloží odmítnutí →
    // příští request zkusí fetch znovu. Legitimní prázdno (0 public brandů)
    // se cachovat SMÍ.
    if (bErr) {
      throw new Error(`supplier_brands fetch failed: ${bErr.message}`);
    }
    if (!publicBrands || publicBrands.length === 0) return [];

    const brandMap = new Map<string, BrandJoin>();
    for (const b of publicBrands) {
      brandMap.set(b.id, { brand_slug: b.brand_slug, is_public: b.is_public });
    }

    const brandIds = Array.from(brandMap.keys());

    const { data: rows, error: pErr } = await sb
      .from("supplier_products")
      .select(
        "id, brand_id, name, sku, ean, description_html, price_czk_retail, main_image_url, image_urls, properties, raw_category_path, has_configurator, is_public_override, public_slug, public_category_id, public_badges, variants, is_active, configurator_schema, local_image_url, local_image_urls",
      )
      .in("brand_id", brandIds)
      .eq("is_active", true);

    if (pErr) {
      throw new Error(`supplier_products fetch failed: ${pErr.message}`);
    }

    const mapped = (rows ?? [])
      .filter((r) => {
        const override = (r as { is_public_override: boolean | null }).is_public_override;
        if (override === false) return false;
        if (override === true) return true;
        // Default honor brand visibility, ale skryjeme produkty bez fotky
        // (jinak by se použilo zavádějící hero foto).
        const row = r as { main_image_url: string | null; image_urls: string[] | null };
        const hasPhoto = !!row.main_image_url || (row.image_urls && row.image_urls.length > 0);
        return hasPhoto;
      })
      .map((r) => {
        const brand = brandMap.get((r as { brand_id: string }).brand_id);
        if (!brand) return null;
        return supplierToProduct({ row: r as SupplierProductRow, brandSlug: brand.brand_slug });
      })
      .filter((p): p is Product => p !== null);

    return collapseCustomModels(mapped);
  } catch (e) {
    // Re-throw — ať unstable_cache neuloží prázdný výsledek (viz výše).
    // Graceful fallback na static-only řeší až getShopProducts.
    throw e instanceof Error ? e : new Error(String(e));
  }
}

/**
 * Sdílená cache POUZE nad supplier částí: supplier_products se ze Supabase tahá
 * **1× za 6 h globálně**, ne per stránka/URL. Chrání Supabase egress (viz
 * „DB egress hygiena" v globálním CLAUDE.md — incident 2026-08-01). Invalidace:
 * import-supplier-feeds cron volá `revalidateTag("shop-products")` po importu.
 */
const getSupplierProductsCached = unstable_cache(fetchSupplierProducts, ["shop-products-supplier"], {
  revalidate: 21600,
  tags: ["shop-products"],
});

/**
 * Merged katalog: vlastní static PRODUCTS (in-memory, zdarma → mergují se VŽDY
 * čerstvě, takže nově přidaný vlastní produkt je naživo hned po deployi) +
 * cachovaná supplier část.
 */
export async function getShopProducts(): Promise<Product[]> {
  // Ruční PRODUCTS + poloautomatický SCOTT_CATALOG (builder). Ruční má přednost:
  // pokud slug koliduje, vyhraje PRODUCTS (hand-curated) a generovaný se zahodí.
  const ownSlugs = new Set(PRODUCTS.map((p) => p.slug));
  const merged = [...PRODUCTS, ...SCOTT_CATALOG.filter((p) => !ownSlugs.has(p.slug))];
  const own = merged.map((p) => ({ ...p, fulfillment: p.fulfillment ?? ("own" as const) }));
  let supplier: Product[] = [];
  try {
    supplier = await getSupplierProductsCached();
  } catch (e) {
    // Supplier fetch selhal (transientní Supabase chyba). Cache se NEpoisonuje
    // (unstable_cache necachuje odmítnutí) → tento request ukáže jen static
    // katalog, příští request supplier zkusí znovu. Web nikdy nespadne.
    console.error("[getShopProducts] supplier fetch failed, serving static-only:", e);
  }
  return [...own, ...supplier];
}

export async function getProductBySlugMerged(slug: string): Promise<Product | undefined> {
  const all = await getShopProducts();
  return all.find((p) => p.slug === slug);
}
