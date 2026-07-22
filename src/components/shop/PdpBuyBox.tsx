"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/data/products";
import { usePdpImage } from "@/lib/pdp-image-store";
import AddToCartButton from "./AddToCartButton";
import RestockNotifyButton from "./RestockNotifyButton";

interface SizeVariant {
  externalId?: string;
  sku?: string;
  size?: string;
  color?: string;
  isInStock?: boolean;
  availability?: string;
}

/**
 * Nákupní box na PDP: výběr barvy (colorOptions) + velikosti (variants) +
 * množství a „Do košíku". Zvolená varianta se propíše do košíku i objednávky
 * a výběr barvy přepne hlavní foto v galerii (přes usePdpImage store).
 */
export default function PdpBuyBox({ product }: { product: Product }) {
  const colors = product.colorOptions ?? [];
  const setPhoto = usePdpImage((s) => s.setPhoto);

  const sizes = useMemo<SizeVariant[]>(
    () => (product.variants ?? []).filter((v) => v.size && v.size.trim().length > 0),
    [product.variants],
  );

  const isOneSize =
    sizes.length === 1 && /^one\s*size$|^uni$|^universal$/i.test(sizes[0].size ?? "");

  const [colorName, setColorName] = useState<string | undefined>(colors[0]?.name);
  const defaultSize = sizes.find((v) => v.isInStock) ?? sizes[0];
  const [sizeLabel, setSizeLabel] = useState<string | undefined>(
    isOneSize ? defaultSize?.size : defaultSize?.size,
  );

  const activeColor = colors.find((c) => c.name === colorName);
  const activeSize = sizes.find((v) => v.size === sizeLabel);

  const needColor = colors.length > 0;
  const needSize = sizes.length > 0 && !isOneSize;
  const missing = (needColor && !colorName) || (needSize && !sizeLabel);

  function pickColor(c: { name: string; photo: string }) {
    setColorName(c.name);
    setPhoto(c.photo);
  }

  const variant = {
    color: colorName,
    size: isOneSize ? undefined : sizeLabel,
    photo: activeColor?.photo,
  };

  return (
    <div className="mt-6 space-y-6">
      {/* Barva */}
      {colors.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider text-[#9AA3C2] font-bold">Barva</span>
            <span className="text-xs font-bold text-[#1a1a2e]">{colorName}</span>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {colors.map((c) => {
              const isActive = c.name === colorName;
              return (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => pickColor(c)}
                  title={c.name}
                  aria-label={c.name}
                  aria-pressed={isActive}
                  className={`w-9 h-9 rounded-full border-2 transition-all ${
                    isActive ? "border-[#3B7CF4] ring-2 ring-[#3B7CF4]/30" : "border-[#E2E6F3] hover:border-[#9AA3C2]"
                  }`}
                  style={{ backgroundColor: c.hex ?? "#c4c9d4" }}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Velikost */}
      {isOneSize ? (
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider text-[#9AA3C2] font-bold">Velikost:</span>
          <span className="text-sm font-bold text-[#1a1a2e]">{sizes[0].size}</span>
        </div>
      ) : (
        sizes.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wider text-[#9AA3C2] font-bold">
                Velikost
              </span>
              {activeSize && (
                <span className="text-xs font-bold text-[#1a1a2e]">
                  {activeSize.size}
                  {activeSize.isInStock ? (
                    <span className="ml-2 text-[10px] uppercase font-bold text-[#065F46]">skladem</span>
                  ) : (
                    <span className="ml-2 text-[10px] uppercase font-bold text-[#92400E]">
                      na objednávku
                    </span>
                  )}
                </span>
              )}
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {sizes.map((v) => {
                const isActive = v.size === sizeLabel;
                const inStock = v.isInStock === true;
                return (
                  <button
                    key={v.externalId ?? v.size}
                    type="button"
                    onClick={() => setSizeLabel(v.size)}
                    className={`relative px-2 py-2.5 rounded-lg text-sm font-bold border-2 transition-all ${
                      isActive
                        ? "border-[#1a1a2e] bg-[#1a1a2e] text-white"
                        : "border-[#E2E6F3] bg-white text-[#1a1a2e] hover:border-[#3B7CF4]/50"
                    }`}
                    aria-pressed={isActive}
                  >
                    {v.size}
                    {!inStock && (
                      <span
                        className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#FCD34D]"
                        title="Na objednávku"
                      />
                    )}
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-[#9AA3C2] mt-2">
              Žluté tečky = na objednávku (dodání 5-10 dnů). Bez tečky = skladem nebo bez stavu info.
            </p>
          </div>
        )
      )}

      <AddToCartButton
        product={product}
        large
        variant={variant}
        disabled={missing}
        disabledLabel={needSize && !sizeLabel ? "Zvol velikost" : "Zvol barvu"}
      />

      {product.supplierProductId && activeSize && !activeSize.isInStock && (
        <RestockNotifyButton
          supplierProductId={product.supplierProductId}
          variantExternalId={activeSize.externalId}
          variantLabel={activeSize.size}
        />
      )}
    </div>
  );
}
