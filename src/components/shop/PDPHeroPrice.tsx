"use client";

import { useConfiguratorTotal } from "@/lib/configurator-store";
import { splitVat, formatPrice, type VatRate } from "@/data/products";
import { ACTIVE_PROMO, promoApplies, promoPrice, promoDeadlineLabel } from "@/lib/promo";

interface Props {
  productId: number;
  basePriceWithVat: number;
  originalPriceWithVat?: number;
  vatRate: VatRate;
  hasConfigurator: boolean;
  /** Kategorie produktu — rozhoduje, jestli se na něj vztahuje akce. */
  categoryId?: string;
}

/**
 * Hero price box na PDP — když má produkt konfigurátor, čte effective total
 * z global store (ConfiguratorUI ho publikuje). Jinak base price.
 */
export default function PDPHeroPrice({
  productId,
  basePriceWithVat,
  originalPriceWithVat,
  vatRate,
  hasConfigurator,
  categoryId,
}: Props) {
  const configTotal = useConfiguratorTotal(productId);
  const effective = hasConfigurator && configTotal !== undefined ? configTotal : basePriceWithVat;
  const { withoutVat, vatAmount } = splitVat(effective, vatRate);

  // Cena v katalogu zůstává doporučená; sleva se ukáže jako druhý řádek.
  // Bez něj by člověk z reklamy viděl plnou cenu a odešel — slib z reklamy
  // musí být vidět tam, kde se rozhoduje, ne až v košíku.
  const showPromo = categoryId ? promoApplies(categoryId) && !hasConfigurator : false;

  return (
    <>
      {originalPriceWithVat && (
        <div className="text-base text-[#9AA3C2] line-through">
          {formatPrice(originalPriceWithVat)}
        </div>
      )}
      <div className="flex items-baseline gap-3">
        <span
          className={`text-3xl md:text-4xl font-black ${originalPriceWithVat ? "text-[#E8431A]" : "text-[#1a1a2e]"}`}
        >
          {formatPrice(effective)}
        </span>
        <span className="text-xs text-[#9AA3C2]">vč. DPH</span>
      </div>
      {showPromo && ACTIVE_PROMO && (
        <div className="mt-2.5 rounded-xl bg-[#F0FDF4] border border-[#A7F3D0] px-3 py-2.5">
          <div className="text-sm text-[#065F46]">
            S kódem{" "}
            <span className="font-mono font-black tracking-wide">{ACTIVE_PROMO.code}</span>{" "}
            zaplatíš{" "}
            <strong className="text-base">{formatPrice(promoPrice(effective))}</strong>
          </div>
          <div className="text-[11px] text-[#0B7A5A] mt-0.5">
            Kód zadáš v košíku · platí {promoDeadlineLabel()}
          </div>
        </div>
      )}
      <div className="text-[11px] text-[#9AA3C2] mt-1.5">
        DPH {vatRate} %: {formatPrice(vatAmount)} · Cena bez DPH: {formatPrice(withoutVat)}
      </div>
    </>
  );
}
