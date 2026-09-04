// Adapter: Scott 2027 variant → e-shop Product (aby šla objednat do košíku).
// Používá se jen pro varianty, které mají `shopId` (orderable). Produkt nežije
// v katalogu products.ts — je to syntetická položka pro cart/checkout (ten
// zvládá i položky mimo DB).

import type { Product } from "@/data/products";
import type { Scott2027Platform, Scott2027Variant } from "@/data/scott-2027";

export function scott2027ToProduct(
  platform: Scott2027Platform,
  variant: Scott2027Variant,
): Product | null {
  if (variant.shopId == null) return null;

  const colorways = variant.colorways ?? [];
  const specs = [
    variant.groupset,
    variant.wheels,
    variant.weightKg != null ? `${variant.weightKg.toFixed(1)} kg` : "",
  ].filter(Boolean);

  return {
    id: variant.shopId,
    slug: `scott-${variant.slug}`,
    name: `Scott ${variant.name}`,
    year: "2027",
    brand: "Scott",
    categoryId: platform.platform === "mtb" ? "mtb" : platform.platform === "road" ? "silnicni" : "gravel",
    priceWithVat: variant.priceCzk ?? 0,
    vatRate: 21,
    bulky: true,
    badges: ["2027", "Na objednávku"],
    note: "",
    photo: colorways[0]?.photo ?? variant.photo,
    specs,
    fulfillment: "supplier",
    stockStatus: "on_request",
    deliveryNote: "Na objednávku — termín dodání potvrdíme po objednávce",
    colorOptions: colorways.map((c) => ({ name: c.name, hex: c.hex, photo: c.photo })),
    variants: colorways.flatMap((c) =>
      variant.sizes.map((s) => ({
        size: s,
        color: c.name,
        isInStock: false,
        availability: "on_request",
      })),
    ),
  };
}
