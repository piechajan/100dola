import { createClient } from "@supabase/supabase-js";
import { PRODUCTS } from "@/data/products";
import {
  defaultPublicSlug,
  wrapSupplierImage,
} from "@/lib/shop/product-mapper";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface SearchHit {
  id: string;
  slug: string;
  name: string;
  brand: string;
  priceWithVat: number;
  photo: string;
  kind: "own" | "supplier";
}

/**
 * GET /api/shop/search?q=<query>
 * Vrací top 8 hitů (vlastní + supplier merged, ranked podle exact match v name).
 * Bez auth — public endpoint.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();
  if (q.length < 2) return Response.json({ hits: [] });

  const qLower = q.toLowerCase();
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const ownHits: SearchHit[] = PRODUCTS.filter((p) =>
    p.name.toLowerCase().includes(qLower) ||
    p.brand.toLowerCase().includes(qLower),
  )
    .slice(0, 8)
    .map((p) => ({
      id: `own:${p.id}`,
      slug: p.slug,
      name: p.name,
      brand: p.brand,
      priceWithVat: p.priceWithVat,
      photo: p.photo,
      kind: "own" as const,
    }));

  let supHits: SearchHit[] = [];
  if (url && key) {
    try {
      const sb = createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false },
        db: { schema: "public" },
      });

      // Public brandy mapování
      const { data: publicBrands } = await sb
        .from("supplier_brands")
        .select("id, brand_slug")
        .eq("is_public", true);
      const brandMap = new Map<string, string>();
      for (const b of publicBrands ?? []) brandMap.set(b.id, b.brand_slug);

      if (brandMap.size > 0) {
        // Query: match na name OR properties (Barva, Druh) — Postgres ilike
        const { data: rows } = await sb
          .from("supplier_products")
          .select(
            "id, brand_id, name, sku, price_czk_retail, main_image_url, image_urls, is_public_override, public_slug, has_configurator, properties, local_image_url",
          )
          .in("brand_id", Array.from(brandMap.keys()))
          .eq("is_active", true)
          .or(`name.ilike.%${q}%,properties->>Barva.ilike.%${q}%,properties->>Druh.ilike.%${q}%`)
          .limit(18);

        supHits = (rows ?? [])
          .filter((r) => {
            const row = r as { is_public_override: boolean | null; main_image_url: string | null; image_urls: string[] | null };
            if (row.is_public_override === false) return false;
            const hasPhoto = !!row.main_image_url || (row.image_urls && row.image_urls.length > 0);
            return hasPhoto;
          })
          .slice(0, 10)
          .map((r) => {
            const row = r as {
              id: string;
              brand_id: string;
              name: string;
              sku: string | null;
              price_czk_retail: number | null;
              main_image_url: string | null;
              image_urls: string[] | null;
              public_slug: string | null;
              local_image_url: string | null;
            };
            const slug = row.public_slug || defaultPublicSlug({ id: row.id, sku: row.sku });
            // Prefer Supabase Storage CDN
            const photo =
              row.local_image_url
              || wrapSupplierImage(row.main_image_url || row.image_urls?.[0] || "/media/sport-hero.jpg");
            return {
              id: `sup:${row.id.slice(0, 8)}`,
              slug,
              name: row.name,
              brand: brandMap.get(row.brand_id) ?? "?",
              priceWithVat: Math.round(Number(row.price_czk_retail ?? 0)),
              photo,
              kind: "supplier" as const,
            };
          });
      }
    } catch (e) {
      console.warn("[search] supabase error:", e);
    }
  }

  // Rank: exact-name match nahoře, brand match dál
  function score(hit: SearchHit): number {
    const n = hit.name.toLowerCase();
    if (n === qLower) return 100;
    if (n.startsWith(qLower)) return 80;
    if (n.includes(qLower)) return 60;
    if (hit.brand.toLowerCase().includes(qLower)) return 40;
    return 0;
  }

  const merged = [...ownHits, ...supHits]
    .map((h) => ({ ...h, _score: score(h) }))
    .sort((a, b) => b._score - a._score)
    .slice(0, 8)
    .map(({ _score, ...rest }) => {
      void _score;
      return rest;
    });

  return Response.json({ hits: merged });
}
