// Pojistka proti zbytečně velké slevě: cena s kódem nesmí být o víc než MAX_UNDERCUT_PCT
// pod nejnižší tržní cenou. Spouští se z .husky/pre-commit.
// Použití: cd web && npx tsx scripts/check-promo-prices.ts
import { PRODUCTS } from "../src/data/products";
import {
  ACTIVE_PROMO,
  MARKET_MIN_PRICE,
  MAX_UNDERCUT_PCT,
  promoPrice,
  promoPriceWithBoost,
  promoBundleItemPrice,
} from "../src/lib/promo";

if (!ACTIVE_PROMO) {
  console.log("✓ promo kontrola: žádná akce neběží");
  process.exit(0);
}

let err = 0;
const check = (slug: string, label: string, price: number, required: boolean) => {
  const min = MARKET_MIN_PRICE[slug];
  if (min === undefined) {
    if (required) {
      console.error(`❌ promo: ${slug} nemá v MARKET_MIN_PRICE nejnižší tržní cenu (lib/promo.ts)`);
      err++;
    }
    return;
  }
  const undercut = ((min - price) / min) * 100;
  if (undercut > MAX_UNDERCUT_PCT) {
    console.error(
      `❌ promo: ${slug} ${label} = ${price} Kč je o ${undercut.toFixed(1)} % pod nejnižší tržní cenou ${min} Kč (max ${MAX_UNDERCUT_PCT} %) — zbytečně velká sleva`,
    );
    err++;
  }
};

for (const p of PRODUCTS) {
  if (ACTIVE_PROMO.categoryIds.includes(p.categoryId)) {
    check(p.slug, "s kódem", promoPrice(p.priceWithVat, p.slug), true);
    check(p.slug, "s ventilátorem", promoPriceWithBoost(p.priceWithVat, p.slug), true);
  } else if (ACTIVE_PROMO.bundleSlugs.includes(p.slug)) {
    check(p.slug, "v sadě", promoBundleItemPrice(p.priceWithVat, p.slug), false);
  }
}

if (err) process.exit(1);
console.log("✓ promo kontrola: slevy jsou v mezích tržních cen");
