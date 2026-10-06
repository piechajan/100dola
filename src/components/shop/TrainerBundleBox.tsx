"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cart-store";
import { PRODUCTS, formatPrice, type Product } from "@/data/products";
import { ACTIVE_PROMO, isPromoLive, promoPrice, promoDeadlineLabel } from "@/lib/promo";
import { trackMetaEvent } from "@/components/analytics/MetaPixel";

/** Co nabízíme k trenažéru. Osy tu schválně nejsou — viz komentář níž. */
const BUNDLE_SLUGS = ["cycplus-f1-ventilator"];

/**
 * Nabídka výhodné sady na stránce trenažéru.
 *
 * Proč tady a ne jen na stránce ventilátoru: na ventilátor se skoro nikdo
 * sám neproklikne. Rozhodnutí padá na trenažéru, takže tam musí nabídka být —
 * a hlavně musí jít přidat jedním kliknutím. Samotný banner „kupte si k tomu
 * ventilátor" bez tlačítka je jen šum.
 *
 * **Osy tu vědomě nenabízíme zaškrtávátkem.** Máme tři varianty závitu
 * a většina lidí netuší, kterou má. Špatně zvolená osa znamená vrácení, které
 * stojí víc, než kolik upsell vydělá — proto raději odkaz a nabídka pomoci.
 */
export default function TrainerBundleBox() {
  const addToCart = useCart((s) => s.add);
  const openDrawer = useCart((s) => s.openDrawer);
  const [added, setAdded] = useState<string | null>(null);

  if (!ACTIVE_PROMO || !isPromoLive()) return null;

  const items = BUNDLE_SLUGS.map((s) => PRODUCTS.find((p) => p.slug === s)).filter(
    (p): p is Product => !!p,
  );
  if (items.length === 0) return null;

  const handleAdd = (p: Product) => {
    addToCart(p, 1);
    setAdded(p.slug);
    openDrawer();
    trackMetaEvent("AddToCart", {
      content_ids: [p.slug],
      content_name: p.name,
      content_type: "product",
      value: p.priceWithVat,
      currency: "CZK",
    });
    setTimeout(() => setAdded(null), 2000);
  };

  return (
    <div className="mt-5 rounded-2xl border-2 border-[#FBD38D] bg-[#FFFBF5] overflow-hidden">
      <div className="bg-[#FFF2DC] px-4 py-2.5 flex items-baseline justify-between gap-3">
        <span className="text-[11px] font-black tracking-[0.14em] uppercase text-[#7A5615]">
          Výhodná sada
        </span>
        <span className="text-[11px] text-[#8A6520]">platí {promoDeadlineLabel()}</span>
      </div>

      <div className="p-4">
        <p className="text-sm text-[#5A4520] mb-3.5">
          S trenažérem máš na tohle{" "}
          <strong>−{ACTIVE_PROMO.percent} % s kódem {ACTIVE_PROMO.code}</strong>. Samostatně
          jedou za běžnou cenu.
        </p>

        {items.map((p) => (
          <div key={p.slug} className="flex items-center gap-3">
            <div className="relative w-14 h-14 shrink-0 rounded-lg bg-white border border-[#F0E2CC] overflow-hidden">
              <Image src={p.photo} alt={p.name} fill className="object-contain p-1" />
            </div>
            <div className="min-w-0 flex-1">
              <Link
                href={`/shop/${p.slug}`}
                className="text-sm font-bold text-[#1a1a2e] hover:text-[#3B7CF4] line-clamp-1"
              >
                {p.name}
              </Link>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-[11px] text-[#9AA3C2] line-through">
                  {formatPrice(p.priceWithVat)}
                </span>
                <span className="text-sm font-black text-[#7A5615]">
                  {formatPrice(promoPrice(p.priceWithVat))}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleAdd(p)}
              className="shrink-0 px-3.5 py-2 text-xs font-bold rounded-full bg-[#1a1a2e] text-white hover:opacity-90 transition"
            >
              {added === p.slug ? "Přidáno ✓" : "Přidat"}
            </button>
          </div>
        ))}

        {/* Osy: odkaz místo zaškrtávátka — viz komentář u BUNDLE_SLUGS. */}
        <div className="mt-3.5 pt-3.5 border-t border-[#F0E2CC] text-xs text-[#5A4520]">
          Sleva platí i na{" "}
          <Link href="/shop/doplnky/trenazery/trenazery-prislusenstvi" className="font-bold underline">
            osy do trenažéru
          </Link>
          . Nevíš, kterou máš?{" "}
          <Link href="/kontakt" className="font-bold underline">
            Napiš nám
          </Link>{" "}
          a ověříme to za tebe — špatná osa znamená vracení.
        </div>
      </div>
    </div>
  );
}
