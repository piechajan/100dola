import "server-only";
import type { Product } from "@/data/products";

/**
 * Cross-category synergy mapping — když user kupuje X, doporučíme Y.
 * Source category → target category preferences (ordered by priority).
 *
 * Tohle je rule-based fallback. Behavioral data z product_pair_counts
 * (jakmile budou) přepíše tyto pravidla podle skutečných objednávek.
 */
export const SYNERGY_MAP: Record<string, string[]> = {
  // Kola → pláště, kazety, sedla, helmy, tretry, řídítka
  "silnicni-aero": ["plastre-silnicni", "helmy-kolo", "tretry-silnicni", "sedla-silnicni", "vyplety-silnicni"],
  "silnicni-endurance": ["plastre-silnicni", "helmy-kolo", "tretry-silnicni", "sedla-silnicni"],
  "silnicni-race": ["plastre-silnicni", "vyplety-silnicni", "wattmetry", "helmy-kolo"],
  "gravel": ["plastre-gravel", "helmy-kolo", "tretry-gravel", "sedla-gravel", "vyplety-gravel"],
  "gravel-1x": ["plastre-gravel", "helmy-kolo", "tretry-gravel", "sedla-gravel"],
  "gravel-2x": ["plastre-gravel", "helmy-kolo", "tretry-gravel"],
  "triatlon": ["plastre-silnicni", "vyplety-triatlon", "wattmetry"],
  "mtb-pevna": ["plastre-mtb", "helmy-kolo", "tretry-mtb"],
  "mtb-celoodpruzena": ["plastre-mtb", "helmy-kolo", "tretry-mtb"],

  // Oblečení → komplementární kusy
  "obleceni-dresy": ["obleceni-kalhoty", "obleceni-rukavice-ponozky", "vyziva-iontaky"],
  "obleceni-kalhoty": ["obleceni-dresy", "obleceni-spodni", "obleceni-rukavice-ponozky"],
  "obleceni-bundy": ["obleceni-dresy", "obleceni-zima", "obleceni-rukavice-ponozky"],
  "obleceni-zima": ["obleceni-bundy", "obleceni-rukavice-ponozky", "obleceni-spodni"],

  // Komponenty
  "vyplety-silnicni": ["plastre-silnicni", "pedaly-silnicni"],
  "vyplety-gravel": ["plastre-gravel"],
  "wattmetry": ["vyziva-iontaky", "obleceni-dresy"],

  // Výživa - cross-cycling
  "vyziva-iontaky": ["vyziva-gely", "vyziva-tycinky"],
  "vyziva-gely": ["vyziva-iontaky", "vyziva-tycinky"],

  // Péče - po koupi kola = údržba
  "pece-myti": ["pece-retez", "pece-ram"],
  "pece-retez": ["pece-myti", "vyziva-iontaky"],
};

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
  const targets = SYNERGY_MAP[source.categoryId] ?? [];
  const targetSet = new Set(targets);

  const scored: ScoredProduct[] = catalog
    .filter((p) => p.id !== source.id)
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
        score = 40;
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
