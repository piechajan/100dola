import { unstable_cache } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { PRODUCTS } from "@/data/products";

/**
 * „1 kus" limitované produkty (limitedOneOff): skladová velikost jde koupit,
 * ostatní jsou na dotaz. Po objednání skladové velikosti musí produkt spadnout
 * do „na dotaz". Zdroj pravdy = existence řádku v order_items se stejným slugem
 * (na produkt máme fyzicky 1 kus, takže první objednávka = vyprodáno).
 *
 * Dotaz je globálně cachovaný (unstable_cache, tag "limited-stock") → žádný
 * per-request egress. Orders route po vložení objednávky cache invaliduje
 * přes revalidateTag("limited-stock"), takže přepnutí na „na dotaz" je rychlé.
 */
const LIMITED_SLUGS = PRODUCTS.filter((p) => p.limitedOneOff).map((p) => p.slug);

async function fetchSoldOutLimitedSlugs(): Promise<string[]> {
  if (LIMITED_SLUGS.length === 0) return [];
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return [];
  try {
    const sb = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data } = await sb
      .from("order_items")
      .select("slug")
      .in("slug", LIMITED_SLUGS);
    const sold = new Set((data ?? []).map((r) => (r as { slug: string }).slug));
    return [...sold];
  } catch {
    // Při chybě raději nic neblokuj (guard v orders route je autoritativní).
    return [];
  }
}

export const getSoldOutLimitedSlugs = unstable_cache(
  fetchSoldOutLimitedSlugs,
  ["limited-stock-sold"],
  { revalidate: 300, tags: ["limited-stock"] },
);

/** Byl daný limitovaný produkt už prodán? (přes cachovaný list) */
export async function isLimitedProductSoldOut(slug: string): Promise<boolean> {
  if (!LIMITED_SLUGS.includes(slug)) return false;
  const sold = await getSoldOutLimitedSlugs();
  return sold.includes(slug);
}
