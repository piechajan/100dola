"use client";

import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/data/products";
import { usePdpImage } from "@/lib/pdp-image-store";
import { readVariantFromUrl, writeVariantToUrl, matchBySlug } from "@/lib/shop/variant-url";
import AddToCartButton from "./AddToCartButton";
import RestockNotifyButton from "./RestockNotifyButton";
import ProductInquiryButton from "./ProductInquiryButton";
import SizeGuide from "./SizeGuide";

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
export default function PdpBuyBox({
  product,
  soldOut = false,
}: {
  product: Product;
  soldOut?: boolean;
}) {
  const colors = product.colorOptions ?? [];
  const setPhoto = usePdpImage((s) => s.setPhoto);
  // Limitovaný „1 kus": skladová velikost jde koupit, ostatní na dotaz.
  // Po prodeji (soldOut) je na dotaz i skladová velikost.
  const isLimited = product.limitedOneOff === true;

  const sizes = useMemo<SizeVariant[]>(
    () => (product.variants ?? []).filter((v) => v.size && v.size.trim().length > 0),
    [product.variants],
  );

  const isOneSize =
    sizes.length === 1 && /^one\s*size$|^uni$|^universal$/i.test(sizes[0].size ?? "");

  const [colorName, setColorName] = useState<string | undefined>(colors[0]?.name);

  // Velikosti patřící k aktuálně vybrané barvě. Pokud varianty nenesou barvu
  // (nebo produkt nemá colorOptions), ukážeme všechny — chování beze změny.
  const sizesForColor = useMemo<SizeVariant[]>(() => {
    if (!colorName || !sizes.some((v) => v.color)) return sizes;
    const matched = sizes.filter((v) => v.color === colorName);
    return matched.length > 0 ? matched : sizes;
  }, [sizes, colorName]);

  const defaultSize = sizesForColor.find((v) => v.isInStock) ?? sizesForColor[0];
  const [sizeLabel, setSizeLabel] = useState<string | undefined>(defaultSize?.size);

  // Sdílitelné odkazy: na mountu přednastav barvu/velikost z URL
  // (?barva=…&velikost=…) a nastav galerii na foto zvolené barvy.
  useEffect(() => {
    const { barva, velikost } = readVariantFromUrl();
    const urlColor = matchBySlug(colors, barva, (c) => c.name);
    const urlSize = matchBySlug(sizes, velikost, (v) => v.size ?? "");
    if (urlColor) setColorName(urlColor.name);
    if (urlSize?.size) setSizeLabel(urlSize.size);
    const initColor = urlColor ?? colors[0];
    if (initColor?.photo) setPhoto(initColor.photo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeColor = colors.find((c) => c.name === colorName);
  const activeSize = sizesForColor.find((v) => v.size === sizeLabel);

  const needColor = colors.length > 0;
  const needSize = sizes.length > 0 && !isOneSize;
  const missing = (needColor && !colorName) || (needSize && !sizeLabel);

  const activeInStock = activeSize?.isInStock === true && !soldOut;
  // „Na dotaz" režim: limitovaný produkt, kde vybraná velikost není skladem
  // (jiná než skladová velikost) nebo je celý produkt už vyprodaný.
  const inquiryMode = isLimited && (soldOut || (activeSize != null && !activeInStock));

  function pickColor(c: { name: string; photo: string }) {
    setColorName(c.name);
    setPhoto(c.photo);
    // Přepni na skladovou velikost nové barvy (jinak první dostupnou).
    let nextSize = sizeLabel;
    if (sizes.some((v) => v.color)) {
      const forColor = sizes.filter((v) => v.color === c.name);
      const next = forColor.find((v) => v.isInStock) ?? forColor[0];
      if (next?.size) {
        setSizeLabel(next.size);
        nextSize = next.size;
      }
    }
    writeVariantToUrl(c.name, isOneSize ? undefined : nextSize);
  }

  function pickSize(size: string) {
    setSizeLabel(size);
    writeVariantToUrl(colorName, size);
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
              <span className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider text-[#9AA3C2] font-bold">
                  Velikost
                </span>
                <SizeGuide categoryId={product.categoryId} />
              </span>
              {activeSize && (
                <span className="text-xs font-bold text-[#1a1a2e]">
                  {activeSize.size}
                  {activeInStock ? (
                    <span className="ml-2 text-[10px] uppercase font-bold text-[#065F46]">skladem</span>
                  ) : (
                    <span className="ml-2 text-[10px] uppercase font-bold text-[#92400E]">
                      {isLimited ? "na dotaz" : "na objednávku"}
                    </span>
                  )}
                </span>
              )}
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {sizesForColor.map((v) => {
                const isActive = v.size === sizeLabel;
                const inStock = v.isInStock === true && !soldOut;
                return (
                  <button
                    key={v.externalId ?? v.size}
                    type="button"
                    onClick={() => v.size && pickSize(v.size)}
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
              {isLimited
                ? "Bez tečky = poslední kus skladem. Velikosti se žlutou tečkou jsou na dotaz — napiš nám a zkusíme sehnat."
                : "Žluté tečky = na objednávku (dodání 5-10 dnů). Bez tečky = skladem nebo bez stavu info."}
            </p>
          </div>
        )
      )}

      {inquiryMode ? (
        <ProductInquiryButton
          productName={product.name}
          productSlug={product.slug}
          size={isOneSize ? undefined : sizeLabel}
          soldOut={soldOut}
        />
      ) : (
        <AddToCartButton
          product={product}
          large
          variant={variant}
          disabled={missing}
          disabledLabel={needSize && !sizeLabel ? "Zvol velikost" : "Zvol barvu"}
        />
      )}

      {product.supplierProductId && activeSize && !activeSize.isInStock && (
        <RestockNotifyButton
          supplierProductId={product.supplierProductId}
          variantExternalId={activeSize.externalId}
          variantLabel={activeSize.size}
        />
      )}

      {/* Reassurance strip u tlačítka do košíku */}
      <div className="pt-4 mt-2 border-t border-[#E2E6F3] grid grid-cols-2 gap-x-4 gap-y-2">
        {[
          ["🚚", "Doprava zdarma nad 2 500 Kč"],
          ["🛡️", "14 dní na vrácení zdarma"],
          ["🏬", "Osobní odběr ve Šternberku"],
          ["🔧", "Vlastní servis a bikefit"],
        ].map(([icon, text]) => (
          <div key={text} className="flex items-center gap-2 text-xs text-[#5A6480]">
            <span aria-hidden className="text-sm leading-none">{icon}</span>
            <span>{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
