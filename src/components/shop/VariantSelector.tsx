"use client";

import { useState, useMemo } from "react";
import type { Product } from "@/data/products";
import RestockNotifyButton from "./RestockNotifyButton";

interface Variant {
  externalId?: string;
  sku?: string;
  size?: string;
  color?: string;
  isInStock?: boolean;
  availability?: string;
}

/**
 * Pill grid selector pro velikost (a barvu pokud existuje).
 * Vrací zvolený variant přes onChange.
 * Skip render pokud variants nemají užitečná data (žádný size).
 */
export default function VariantSelector({
  product,
  onSelect,
}: {
  product: Product;
  onSelect?: (v: Variant) => void;
}) {
  const usableVariants = useMemo(() => {
    const variants = (product.variants ?? []) as Variant[];
    return variants.filter((v) => v.size && v.size.trim().length > 0);
  }, [product.variants]);

  // Pokud žádný variant nemá size info, neukážeme selector
  if (usableVariants.length === 0) return null;

  // ONE SIZE — jen informativní badge, žádný picker
  if (usableVariants.length === 1 && /^one\s*size$|^uni$|^universal$/i.test(usableVariants[0].size ?? "")) {
    const v = usableVariants[0];
    const inStock = v.isInStock === true;
    return (
      <div className="mt-4 flex items-center gap-2">
        <span className="text-xs uppercase tracking-wider text-[#9AA3C2] font-bold">Velikost:</span>
        <span className="text-sm font-bold text-[#1a1a2e]">
          {v.size}
          {inStock ? (
            <span className="ml-2 text-[10px] uppercase font-bold text-[#065F46] bg-[#D1FAE5] px-1.5 py-0.5 rounded-full">
              skladem
            </span>
          ) : (
            <span className="ml-2 text-[10px] uppercase font-bold text-[#92400E] bg-[#FEF3C7] px-1.5 py-0.5 rounded-full">
              na objednávku
            </span>
          )}
        </span>
      </div>
    );
  }

  // Default první v stock, jinak první
  const defaultVariant = usableVariants.find((v) => v.isInStock) ?? usableVariants[0];
  return (
    <InnerSelector
      variants={usableVariants}
      initial={defaultVariant}
      onSelect={onSelect}
      supplierProductId={product.supplierProductId}
    />
  );
}

function InnerSelector({
  variants,
  initial,
  onSelect,
  supplierProductId,
}: {
  variants: Variant[];
  initial: Variant;
  onSelect?: (v: Variant) => void;
  supplierProductId?: string;
}) {
  const [selected, setSelected] = useState<Variant>(initial);

  function pick(v: Variant) {
    setSelected(v);
    onSelect?.(v);
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs uppercase tracking-wider text-[#9AA3C2] font-bold">
          Velikost
        </span>
        <span className="text-xs font-bold text-[#1a1a2e]">
          {selected.size}
          {selected.isInStock ? (
            <span className="ml-2 text-[10px] uppercase font-bold text-[#065F46]">skladem</span>
          ) : (
            <span className="ml-2 text-[10px] uppercase font-bold text-[#92400E]">na objednávku</span>
          )}
        </span>
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
        {variants.map((v) => {
          const isActive = v.externalId === selected.externalId;
          const inStock = v.isInStock === true;
          return (
            <button
              key={v.externalId ?? v.size}
              type="button"
              onClick={() => pick(v)}
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
      {supplierProductId && !selected.isInStock && (
        <RestockNotifyButton
          supplierProductId={supplierProductId}
          variantExternalId={selected.externalId}
          variantLabel={selected.size}
        />
      )}
    </div>
  );
}
