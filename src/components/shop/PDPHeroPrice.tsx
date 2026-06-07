"use client";

import { useConfiguratorTotal } from "@/lib/configurator-store";
import { splitVat, formatPrice, type VatRate } from "@/data/products";

interface Props {
  productId: number;
  basePriceWithVat: number;
  originalPriceWithVat?: number;
  vatRate: VatRate;
  hasConfigurator: boolean;
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
}: Props) {
  const configTotal = useConfiguratorTotal(productId);
  const effective = hasConfigurator && configTotal !== undefined ? configTotal : basePriceWithVat;
  const { withoutVat, vatAmount } = splitVat(effective, vatRate);

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
      <div className="text-[11px] text-[#9AA3C2] mt-1.5">
        DPH {vatRate} %: {formatPrice(vatAmount)} · Cena bez DPH: {formatPrice(withoutVat)}
      </div>
    </>
  );
}
