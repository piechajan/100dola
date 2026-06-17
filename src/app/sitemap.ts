import type { MetadataRoute } from "next";
import { PRODUCTS } from "@/data/products";
import { ARTICLES } from "@/data/articles";
import { getAllCategoryPaths } from "@/lib/shop/category-resolver";
import { getPublishedEvents } from "@/lib/events-db";
import { createClient } from "@supabase/supabase-js";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.100dola.com";

// Sitemap revaliduje 1x denně — supplier produkty se mění s feed importem
export const revalidate = 86400;

/**
 * Supplier produkty do sitemapy jen vybrané — Google jinak crawlne 800+ thin
 * pages bez vlastního popisu, vidí duplicitní feed content a nezaindexuje
 * (Discovered/Crawled – not indexed). Pravidlo: featured nebo in-stock+vlastní
 * popis. Ostatní zůstávají dostupné a crawlable přes internal links, ale ne
 * v sitemap signal pro crawl prioritu.
 */
async function fetchSupplierSlugs(): Promise<string[]> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return [];
  try {
    const sb = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: brands } = await sb
      .from("supplier_brands")
      .select("id")
      .eq("is_public", true);
    if (!brands || brands.length === 0) return [];
    const brandIds = brands.map((b) => b.id);
    // Filter: in_stock=true (skladem teď) NEBO has custom_note (vlastní popis
    // od Jana = výjimečný produkt s SEO hodnotou). Ostatní mají feed content
    // = thin pro Google → ven ze sitemap.
    const { data: products } = await sb
      .from("supplier_products")
      .select("public_slug, sku, id, is_in_stock, custom_note")
      .in("brand_id", brandIds)
      .eq("is_active", true)
      .not("main_image_url", "is", null)
      .or("is_in_stock.eq.true,custom_note.not.is.null");
    const slugs: string[] = [];
    for (const p of products ?? []) {
      const row = p as { public_slug: string | null; sku: string | null; id: string };
      if (row.public_slug) {
        slugs.push(row.public_slug);
      } else if (row.sku) {
        slugs.push(
          row.sku.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
        );
      } else {
        slugs.push(`produkt-${row.id.slice(0, 8)}`);
      }
    }
    return slugs;
  } catch (e) {
    console.warn("[sitemap] supplier fetch failed:", e);
    return [];
  }
}

/**
 * Sitemap pro Google / Bing.
 * Priority + changefreq optimalizované per typ stránky:
 *  • homepage, isaac-test (event): 1.0
 *  • hlavní pilíře (malaga, lab, community, shop): 0.9
 *  • shop kategoriální routes: 0.8 (cílíme aby Google indexoval)
 *  • produktové PDP: 0.7
 *  • blog články, sub-routes: 0.6
 *  • právní (T&C, GDPR): 0.3
 */

interface Entry {
  path: string;
  priority: number;
  changefreq: MetadataRoute.Sitemap[number]["changeFrequency"];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const entries: Entry[] = [];

  // ─── Top level ─────────────────────────────────────────────────────────────
  entries.push({ path: "", priority: 1.0, changefreq: "weekly" });

  // ─── Hlavní pilíře ─────────────────────────────────────────────────────────
  for (const p of ["/malaga", "/lab", "/community", "/shop"]) {
    entries.push({ path: p, priority: 0.9, changefreq: "weekly" });
  }
  for (const p of [
    "/malaga/preprava",
    "/malaga/uskladneni",
    "/malaga/balicky",
    "/community/o-klinice",
    "/o-nas",
    "/sport",
    "/clanky",
    "/kontakt",
  ]) {
    entries.push({ path: p, priority: 0.7, changefreq: "monthly" });
  }

  // ─── ISAAC event (časově citlivé) ──────────────────────────────────────────
  entries.push({ path: "/isaac-test", priority: 1.0, changefreq: "daily" });
  entries.push({ path: "/isaac-test/podminky", priority: 0.5, changefreq: "monthly" });

  // ─── Sport info routes (kamenná prodejna) ──────────────────────────────────
  for (const p of [
    "/sport/cyklistika",
    "/sport/beh",
    "/sport/turistika",
    "/sport/zima",
    "/sport/obleceni",
    "/sport/obuv",
    "/sport/helmy",
    "/sport/vyziva",
    "/sport/vybaveni",
    "/sport/elektronika",
    "/sport/kolekce",
  ]) {
    entries.push({ path: p, priority: 0.5, changefreq: "monthly" });
  }

  // ─── Shop kategoriální routes (P0.8 — Google má indexovat) ─────────────────
  for (const slugs of getAllCategoryPaths()) {
    entries.push({
      path: `/shop/${slugs.join("/")}`,
      priority: slugs.length === 1 ? 0.8 : slugs.length === 2 ? 0.75 : 0.7,
      changefreq: "weekly",
    });
  }

  // ─── Produktové PDP (statické) ─────────────────────────────────────────────
  for (const p of PRODUCTS) {
    entries.push({ path: `/shop/${p.slug}`, priority: 0.7, changefreq: "weekly" });
  }

  // ─── Supplier produkty (z DB, prefer is_public brands + active) ───────────
  const supplierSlugs = await fetchSupplierSlugs();
  for (const slug of supplierSlugs) {
    entries.push({ path: `/shop/${slug}`, priority: 0.6, changefreq: "weekly" });
  }

  // ─── Eventy (DB primary) ────────────────────────────────────────────────────
  const eventsList = await getPublishedEvents();
  for (const e of eventsList) {
    if (e.externalUrl) continue;
    entries.push({
      path: `/community/event/${e.slug}`,
      priority: 0.6,
      changefreq: "weekly",
    });
  }

  // ─── Články ────────────────────────────────────────────────────────────────
  for (const a of ARTICLES) {
    if (a.status !== "published") continue;
    entries.push({ path: `/clanky/${a.slug}`, priority: 0.6, changefreq: "monthly" });
  }

  // ─── Předobjednávky (transactional, high SEO intent) ──────────────────────
  entries.push({
    path: "/predobjednavka/spark-rc-2027",
    priority: 0.9,
    changefreq: "weekly",
  });

  // ─── Scott 2027 lineup (hub + per-platform + per-variant) ─────────────────
  entries.push({ path: "/clanky/scott-2027", priority: 0.85, changefreq: "weekly" });
  const { SCOTT_2027 } = await import("@/data/scott-2027");
  for (const p of SCOTT_2027) {
    entries.push({
      path: `/clanky/scott-2027/${p.slug}`,
      priority: p.status === "launched" ? 0.8 : 0.7,
      changefreq: "weekly",
    });
    for (const v of p.variants) {
      entries.push({
        path: `/clanky/scott-2027/${p.slug}/${v.slug}`,
        priority: p.status === "launched" ? 0.7 : 0.6,
        changefreq: "weekly",
      });
    }
  }

  // ─── Wishlist (mělká priorita, ne pro SEO) ─────────────────────────────────
  entries.push({ path: "/wishlist", priority: 0.3, changefreq: "yearly" });

  // ─── Legal (low priority) ──────────────────────────────────────────────────
  for (const p of ["/obchodni-podminky", "/ochrana-osobnich-udaju", "/zasady-cookies"]) {
    entries.push({ path: p, priority: 0.3, changefreq: "yearly" });
  }

  return entries.map((e) => ({
    url: `${BASE_URL}${e.path}`,
    lastModified,
    changeFrequency: e.changefreq,
    priority: e.priority,
  }));
}
