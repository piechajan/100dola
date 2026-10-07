import "server-only";
import type { Product } from "@/data/products";

import { SYNERGY_MAP } from "./synergy-map";

interface ScoredProduct {
  product: Product;
  score: number;
  reason: string;
}

/**
 * Rule-based + synergy recommendations pro daný produkt.
 *
 * Skóre:
 *   +100 stejný brand, stejná synergy category
 *   +60  stejná synergy category, jiný brand
 *   +40  stejný brand, jiná category (fallback)
 *   +20  stejný categoryId (totéž)
 *   −∞   sám sebe
 *
 * Vrací top N produktů z catalog.
 */
export function recommendForProduct(
  source: Product,
  catalog: Product[],
  limit = 4,
): Product[] {
  // Ruční výběr má vždy přednost — u některých produktů dávají smysl jen
  // konkrétní kusy a žádné kategoriální pravidlo to netrefí.
  if (source.relatedSlugs?.length) {
    const bySlug = new Map(catalog.map((p) => [p.slug, p]));
    const picked = source.relatedSlugs
      .map((slug) => bySlug.get(slug))
      .filter((p): p is Product => !!p && p.id !== source.id);
    if (picked.length >= limit) return picked.slice(0, limit);
    // doplníme zbytek pravidly, ať karta není poloprázdná
    const rest = recommendByRules(source, catalog, limit - picked.length, new Set(picked.map((p) => p.id)));
    return [...picked, ...rest];
  }
  return recommendByRules(source, catalog, limit);
}

/**
 * Doporučení pro CELOU sadu výsledků vyhledávání, ne pro jeden produkt.
 *
 * Když někdo hledá „trenažer", nechceme pod výsledky další trenažéry — chceme
 * to, co si k němu stejně bude muset dokoupit (osa, kazeta, voskovaný řetěz,
 * ventilátor) a co k zimnímu tréninku patří (ionťák, kompresor, blikačky).
 *
 * Kategorie se berou ze SYNERGY_MAP nalezených produktů; cokoliv, co už je
 * mezi výsledky, se vyhodí — jinak by se pruh duplikoval s tím nad ním.
 */
export function recommendForResultSet(
  found: Product[],
  catalog: Product[],
  limit = 8,
): Product[] {
  if (found.length === 0) return [];

  const foundIds = new Set(found.map((p) => p.id));
  const foundCats = new Set(found.map((p) => p.categoryId));

  // Cílové kategorie v pořadí priority, bez duplicit a bez těch, co už máme.
  const targets: string[] = [];
  for (const p of found) {
    for (const t of SYNERGY_MAP[p.categoryId] ?? []) {
      if (!foundCats.has(t) && !targets.includes(t)) targets.push(t);
    }
  }
  if (targets.length === 0) return [];

  // Dřívější cílová kategorie = vyšší priorita. V rámci kategorie bereme
  // levnější první — doplněk k nákupu, ne další velká investice.
  const rank = new Map(targets.map((t, i) => [t, i]));
  return catalog
    .filter((p) => !foundIds.has(p.id) && rank.has(p.categoryId) && !p.hasConfigurator)
    .sort((a, b) => {
      const d = (rank.get(a.categoryId) ?? 99) - (rank.get(b.categoryId) ?? 99);
      return d !== 0 ? d : a.priceWithVat - b.priceWithVat;
    })
    .slice(0, limit);
}

function recommendByRules(
  source: Product,
  catalog: Product[],
  limit: number,
  exclude: Set<number> = new Set(),
): Product[] {
  const targets = SYNERGY_MAP[source.categoryId] ?? [];
  const targetSet = new Set(targets);

  const scored: ScoredProduct[] = catalog
    .filter((p) => p.id !== source.id && !exclude.has(p.id))
    .map((p) => {
      const sameBrand = p.brand === source.brand;
      const inSynergy = targetSet.has(p.categoryId);
      const sameCategory = p.categoryId === source.categoryId;

      let score = 0;
      let reason = "";

      if (inSynergy && sameBrand) {
        score = 100;
        reason = "synergy + brand";
      } else if (inSynergy) {
        score = 60;
        reason = "synergy";
      } else if (sameBrand) {
        // Slabý signál: „stejná značka, jiná kategorie" tahalo k drahým kolům
        // náhradní díly (kryt baterie, podložky, antipadač). Pod úroveň
        // „stejná kategorie", ať to nepředbíhá smysluplnější návrhy.
        score = 15;
        reason = "stejná značka";
      } else if (sameCategory) {
        score = 20;
        reason = "stejná kategorie";
      }

      // Tie-break: cena podobně velká → bumpneme +5
      const priceRatio = source.priceWithVat > 0
        ? Math.abs(p.priceWithVat - source.priceWithVat) / source.priceWithVat
        : 1;
      if (priceRatio < 0.3) score += 5;

      return { product: p, score, reason };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  // Diversity: nemít víc než 2 ze stejné kategorie v top N
  const result: Product[] = [];
  const categoryCounts = new Map<string, number>();
  for (const s of scored) {
    if (result.length >= limit) break;
    const count = categoryCounts.get(s.product.categoryId) ?? 0;
    if (count >= 2) continue;
    result.push(s.product);
    categoryCounts.set(s.product.categoryId, count + 1);
  }
  return result;
}
