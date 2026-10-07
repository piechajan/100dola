import { PRODUCTS, type Product } from "@/data/products";
import { SYNERGY_MAP } from "./synergy-map";

/**
 * Co nabídnout v modalu před dokončením objednávky.
 *
 * PRAVIDLO (Jan, 2026-10-07): nabízí se jen to, co s nákupem souvisí a co
 * zákazník s největší pravděpodobností koupí — nikdy kola, náhodné drahé kusy
 * ani „nejlevnější z katalogu". Pořadí:
 *   1. ručně zadané `relatedSlugs` produktů v košíku (nejsilnější signál),
 *   2. kategorie ze SYNERGY_MAP (dřívější = důležitější),
 *   3. drobný bonus za „Doporučuje tým".
 * Vybírá se po jednom z každé skupiny (osa, kazeta, ionťák, vosk…), ať nabídka
 * nejsou čtyři věci od stejného druhu; zbytek se doplní podle skóre.
 */

/** Položky, které nejdou koupit samostatně nebo jen s konkrétním zbožím. */
const NOT_STANDALONE = new Set([
  "navoskovani-retezu-k-novemu-kolu",
  "navoskovani-retezu-zdarma",
  "navoskovani-noveho-retezu",
  "navoskovani-noveho-retezu-zdarma",
]);

/** Pohon, osa a kazeta mají smysl jen u trenažéru, který se upíná na vlastní kolo. */
const NEEDS_OWN_BIKE_SLUGS = (slug: string) => slug.startsWith("osa-");

function groupKey(p: Product): string {
  // Osy jsou ve stejné kategorii jako ventilátor, ale jde o jiný nákup.
  return p.slug.startsWith("osa-") ? "osa" : p.categoryId;
}

export function recommendForCart(
  cart: Array<{ productId: number; priceWithVat: number; qty: number }>,
  limit = 5,
): Product[] {
  const inCartIds = new Set(cart.map((i) => i.productId));
  const cartProducts = cart
    .map((i) => PRODUCTS.find((p) => p.id === i.productId))
    .filter((p): p is Product => !!p);
  if (cartProducts.length === 0) return [];

  // Kompletní smart bike (T7) nic z toho nepotřebuje — osu ani kazetu mu nenabízíme.
  const hasTrainerNeedingBike = cartProducts.some((p) => p.categoryId === "trenazery-chytre");
  const hasSmartBikeOnly =
    !hasTrainerNeedingBike && cartProducts.some((p) => p.categoryId === "trenazery-smart-bike");

  // Trenažér už v košíku je → další trenažér nenabízíme (jen doplňky k němu).
  const hasAnyTrainer = hasTrainerNeedingBike || hasSmartBikeOnly;
  const isTrainer = (p: Product) =>
    p.categoryId === "trenazery-chytre" || p.categoryId === "trenazery-smart-bike";

  const cartTotal = cart.reduce((s, i) => s + i.priceWithVat * i.qty, 0);
  // Doplněk, ne další velká investice: strop podle hodnoty košíku.
  const maxPrice = Math.max(1500, cartTotal * 0.4);

  // Cílové kategorie v pořadí priority (první výskyt vyhrává).
  const targets: string[] = [];
  for (const p of cartProducts) {
    for (const t of SYNERGY_MAP[p.categoryId] ?? []) {
      if (!targets.includes(t)) targets.push(t);
    }
  }
  const related = new Map<string, number>();
  for (const p of cartProducts) {
    (p.relatedSlugs ?? []).forEach((slug, idx) => {
      if (hasSmartBikeOnly && (NEEDS_OWN_BIKE_SLUGS(slug) || slug.startsWith("navoskovani-"))) return;
      related.set(slug, Math.min(related.get(slug) ?? 99, idx));
    });
  }

  const scored = PRODUCTS.filter(
    (p) =>
      !inCartIds.has(p.id) &&
      !p.hasConfigurator &&
      p.priceWithVat > 0 &&
      p.priceWithVat <= maxPrice &&
      !NOT_STANDALONE.has(p.slug) &&
      !(hasAnyTrainer && isTrainer(p)) &&
      !(hasSmartBikeOnly && NEEDS_OWN_BIKE_SLUGS(p.slug)),
  )
    .map((p) => {
      const rel = related.get(p.slug);
      const rank = targets.indexOf(p.categoryId);
      let score = 0;
      if (rel !== undefined) score += 100 - rel;
      if (rank >= 0) score += 60 - rank * 5;
      if (score > 0 && p.badges.includes("Doporučuje tým")) score += 5;
      return { p, score };
    })
    .filter((x) => x.score > 0)
    // Při shodě skóre levnější první — nenásilný doplněk.
    .sort((a, b) => b.score - a.score || a.p.priceWithVat - b.p.priceWithVat);

  const picked: Product[] = [];
  const usedGroups = new Set<string>();
  for (const { p } of scored) {
    if (picked.length >= limit) break;
    const g = groupKey(p);
    if (usedGroups.has(g)) continue;
    usedGroups.add(g);
    picked.push(p);
  }
  for (const { p } of scored) {
    if (picked.length >= limit) break;
    if (!picked.includes(p)) picked.push(p);
  }
  return picked;
}
