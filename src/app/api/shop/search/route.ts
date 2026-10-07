import { unstable_cache } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { PRODUCTS } from "@/data/products";
import { recommendForResultSet } from "@/lib/shop/recommendations";
import { categories } from "@/data/categories";
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
  /** Původní (přeškrtnutá) cena — jen u vlastních produktů se slevou. */
  originalPriceWithVat?: number;
  photo: string;
  kind: "own" | "supplier";
  /** Předpočítaná relevance z kategorie a typu produktu (jen vlastní katalog). */
  bonus?: number;
}

/**
 * Shodí diakritiku, ať „trenazer" najde „trenažér".
 *
 * Lidi do vyhledávání diakritiku většinou nepíšou — bez tohohle vracel dotaz
 * „trenazer" nula výsledků, zatímco „trenažér" deset. Normalizuje se dotaz
 * i prohledávaný text, takže to funguje v obou směrech (i když někdo napíše
 * diakritiku u produktu, který ji v názvu nemá).
 */
function deburr(s: string): string {
  return s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

/**
 * Shoda dotazu proti textu produktu.
 *
 * Nestačí prosté `includes` celého dotazu — „chytry trenazer" by neprošlo,
 * protože ta dvě slova nejsou v názvu vedle sebe. Dotaz se proto rozpadne na
 * slova a každé musí sedět samostatně.
 *
 * Česká koncovka se řeší zkrácením, ne stemmerem: „trenazery" se zkusí i jako
 * „trenazer". Na dvě písmena to stačí („trenazeru", „trenazerum") a nehrozí,
 * že by se krátká slova rozpadla na nesmysl — zkracujeme až od pěti znaků.
 */
function matchesQuery(hay: string, tokens: string[]): boolean {
  return tokens.every((t) => {
    if (hay.includes(t)) return true;
    for (let cut = 1; cut <= 2; cut++) {
      if (t.length - cut >= 4 && hay.includes(t.slice(0, -cut))) return true;
    }
    return false;
  });
}

/** categoryId → celá cesta bez diakritiky („doplnky trenazery chytre trenazery"). */
function buildCategoryPaths(): Map<string, string> {
  const m = new Map<string, string>();
  for (const top of categories) {
    for (const sub of top.subcategories) {
      m.set(sub.id, deburr(`${top.name} ${sub.name}`));
      for (const ch of sub.children ?? []) {
        m.set(ch.id, deburr(`${top.name} ${sub.name} ${ch.name}`));
      }
    }
  }
  return m;
}
const CATEGORY_PATHS = buildCategoryPaths();

/**
 * Je produkt příslušenstvím k hledané věci?
 *
 * Na dotaz „trenažér" vracela osa „Zadní osa pro trenažér" stejné skóre jako
 * trenažér samotný — obojí má to slovo v názvu. Čeština to ale rozlišuje
 * předložkou: „osa PRO trenažér", „kazeta K trenažéru". Když za předložkou
 * následuje hledané slovo, je to doplněk a patří až za samotné trenažéry.
 */
function isAccessoryTo(hay: string, tokens: string[]): boolean {
  return tokens.some((t) => {
    const stem = t.length >= 6 ? t.slice(0, -2) : t;
    return new RegExp(`\\b(pro|k|ke|do|na)\\s+\\S*${stem}`).test(hay);
  });
}

/**
 * Supplier část hledání — sdílená cache (DB egress hygiena): stejný dotaz
 * (po normalizaci) se do Supabase nevolá víckrát než 1× za 10 min globálně,
 * ať crawler / našeptávač nezatěžují DB. Chyby MUSÍ throwovat, aby se do
 * cache neuložil falešně prázdný výsledek.
 */
async function fetchSupplierHits(qNorm: string): Promise<SearchHit[]> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return [];
  const q = qNorm;
  const sb = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    db: { schema: "public" },
  });

  const { data: publicBrands, error: brandErr } = await sb
    .from("supplier_brands")
    .select("id, brand_slug")
    .eq("is_public", true);
  if (brandErr) throw new Error(`supplier_brands: ${brandErr.message}`);
  const brandMap = new Map<string, string>();
  for (const b of publicBrands ?? []) brandMap.set(b.id, b.brand_slug);
  if (brandMap.size === 0) return [];

  // Fuzzy match přes pg_trgm RPC (migrace 030); fallback ilike.
  const sanitized = q.replace(/[%_'\\,()]/g, "");
  let rows: unknown[] | null = null;
  const rpcResult = await sb.rpc("supplier_products_fuzzy_search", {
    search_query: sanitized,
    brand_ids: Array.from(brandMap.keys()),
    row_limit: 18,
  });
  if (!rpcResult.error && rpcResult.data) {
    rows = rpcResult.data as unknown[];
  } else {
    if (rpcResult.error) console.warn("[search] RPC fallback:", rpcResult.error.message);
    // Slim SELECT — jen sloupce, které se skutečně mapují do SearchHit
    // (bez properties / has_configurator / is_public_override těžkých polí).
    const fallback = await sb
      .from("supplier_products")
      .select(
        "id, brand_id, name, sku, price_czk_retail, main_image_url, image_urls, is_public_override, public_slug, local_image_url",
      )
      .in("brand_id", Array.from(brandMap.keys()))
      .eq("is_active", true)
      .ilike("name", `%${sanitized}%`)
      .limit(18);
    if (fallback.error) throw new Error(`supplier_products: ${fallback.error.message}`);
    rows = fallback.data;
  }

  return (rows ?? [])
    .filter((r) => {
      const row = r as { is_public_override: boolean | null; main_image_url: string | null; image_urls: string[] | null };
      if (row.is_public_override === false) return false;
      return !!row.main_image_url || (row.image_urls && row.image_urls.length > 0);
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

const getSupplierHitsCached = unstable_cache(fetchSupplierHits, ["shop-search-supplier"], {
  revalidate: 600,
  tags: ["shop-products"],
});

/**
 * GET /api/shop/search?q=<query>
 * Vrací top 8 hitů (vlastní + supplier merged, ranked podle exact match v name).
 * Bez auth — public endpoint.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();
  if (q.length < 2) return Response.json({ hits: [] });

  // Dropdown volá bez limitu (default 8); stránka výsledků /hledat s vyšším limitem.
  const limit = Math.min(48, Math.max(1, Number(searchParams.get("limit")) || 8));

  const qLower = deburr(q);
  const qTokens = qLower.split(/\s+/).filter(Boolean);
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Match i v popisu/specs — aby šlo najít i produkty s cizojazyčným názvem
  // (např. „Sponser Electrolytes" přes české „elektrolyt" v popisu).
  const ownHits: SearchHit[] = PRODUCTS.filter((p) => {
    const hay = deburr(`${p.name} ${p.brand} ${p.note} ${p.specs.join(" ")}`);
    return matchesQuery(hay, qTokens);
  })
    .slice(0, limit)
    .map((p) => {
      // Bonus za kategorii a postih za příslušenství se počítají tady, dokud
      // máme po ruce celý produkt — score() už vidí jen SearchHit.
      const catPath = CATEGORY_PATHS.get(p.categoryId) ?? "";
      const nameHay = deburr(p.name);
      let bonus = 0;
      if (qTokens.every((t) => matchesQuery(catPath, [t]))) bonus += 50;
      if (isAccessoryTo(nameHay, qTokens)) bonus -= 70;
      return {
        id: `own:${p.id}`,
        slug: p.slug,
        name: p.name,
        brand: p.brand,
        priceWithVat: p.priceWithVat,
        originalPriceWithVat: p.originalPriceWithVat,
        photo: p.photo,
        kind: "own" as const,
        bonus,
      };
    });

  let supHits: SearchHit[] = [];
  if (url && key) {
    try {
      supHits = await getSupplierHitsCached(q.toLowerCase());
    } catch (e) {
      console.warn("[search] supabase error:", e);
    }
  }

  // Rank: exact-name match nahoře, brand match dál.
  // Porovnává se bez diakritiky, aby „trenazer" skórovalo stejně jako „trenažér".
  function score(hit: SearchHit): number {
    const n = deburr(hit.name);
    if (n === qLower) return 100;
    if (n.startsWith(qLower)) return 80;
    if (n.includes(qLower)) return 60;
    if (deburr(hit.brand).includes(qLower)) return 40;
    return 0;
  }

  const merged = [...ownHits, ...supHits]
    .map((h) => ({ ...h, _score: score(h) + (h.bonus ?? 0) }))
    .sort((a, b) => b._score - a._score)
    .slice(0, limit)
    .map(({ _score, bonus, ...rest }) => {
      void _score;
      void bonus;
      return rest;
    });

  // „K tomu se hodí" — doplňky k tomu, co člověk právě našel. Počítá se jen
  // z vlastního katalogu (u supplier produktů kategorie neznáme spolehlivě).
  const foundOwn = PRODUCTS.filter((p) =>
    ownHits.some((h) => h.slug === p.slug),
  );
  const related: SearchHit[] = recommendForResultSet(foundOwn, PRODUCTS, 8).map((p) => ({
    id: `rel:${p.id}`,
    slug: p.slug,
    name: p.name,
    brand: p.brand,
    priceWithVat: p.priceWithVat,
    originalPriceWithVat: p.originalPriceWithVat,
    photo: p.photo,
    kind: "own" as const,
  }));

  return Response.json({ hits: merged, related });
}
