import "server-only";
import { createClient } from "@supabase/supabase-js";
import { PRODUCTS, type Product } from "@/data/products";
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
export async function getShopProducts(): Promise<Product[]> {
  const own = PRODUCTS.map((p) => ({ ...p, fulfillment: p.fulfillment ?? ("own" as const) }));

  try {
    const sb = getSb();

    const { data: publicBrands, error: bErr } = await sb
      .from("supplier_brands")
      .select("id, brand_slug, is_public")
      .eq("is_public", true);

    if (bErr) {
      console.warn("[getShopProducts] supplier_brands fetch failed:", bErr.message);
      return own;
    }
    if (!publicBrands || publicBrands.length === 0) return own;

    const brandMap = new Map<string, BrandJoin>();
    for (const b of publicBrands) {
      brandMap.set(b.id, { brand_slug: b.brand_slug, is_public: b.is_public });
    }

    const brandIds = Array.from(brandMap.keys());

    const { data: rows, error: pErr } = await sb
      .from("supplier_products")
      .select(
        "id, brand_id, name, sku, ean, description_html, price_czk_retail, main_image_url, image_urls, properties, raw_category_path, has_configurator, is_public_override, public_slug, public_category_id, public_badges, variants, is_active, configurator_schema",
      )
      .in("brand_id", brandIds)
      .eq("is_active", true);

    if (pErr) {
      console.warn("[getShopProducts] supplier_products fetch failed:", pErr.message);
      return own;
    }

    const supplier = (rows ?? [])
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

    return [...own, ...supplier];
  } catch (e) {
    console.warn("[getShopProducts] unexpected error, falling back to static:", e);
    return own;
  }
}

export async function getProductBySlugMerged(slug: string): Promise<Product | undefined> {
  const all = await getShopProducts();
  return all.find((p) => p.slug === slug);
}
