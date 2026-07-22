"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart-store";
import { formatPrice, splitVat, type Product } from "@/data/products";
import { isProxiedImage } from "@/lib/shop/image-utils";
import VariantSelector from "./VariantSelector";

export default function QuickViewModal({
  product,
  open,
  onClose,
}: {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}) {
  const add = useCart((s) => s.add);
  const openDrawer = useCart((s) => s.openDrawer);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open || !product) return null;

  const { withoutVat, vatAmount } = splitVat(product.priceWithVat, product.vatRate);
  const needsVariant =
    (product.colorOptions?.length ?? 0) > 0 ||
    (product.variants ?? []).some(
      (v) => v.size && !/^one\s*size$|^uni$|^universal$/i.test(v.size),
    );

  function handleAdd() {
    if (!product) return;
    add(product, 1);
    openDrawer();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      <div
        className="relative bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        style={{ animation: "scaleIn 200ms ease-out" }}
      >
        <style>{`@keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }`}</style>

        <button
          type="button"
          onClick={onClose}
          aria-label="Zavřít"
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-[#F0F2FA] text-[#5A6480] z-10"
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="grid md:grid-cols-[1fr_1fr] gap-0">
          <div className="relative aspect-square bg-[#F0F2FA] md:rounded-l-3xl rounded-t-3xl md:rounded-tr-none overflow-hidden">
            <Image
              src={product.photo}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain p-6"
              unoptimized={isProxiedImage(product.photo)}
            />
          </div>

          <div className="p-6 md:p-7 flex flex-col">
            <div className="text-[10px] uppercase tracking-wider text-[#9AA3C2] font-bold mb-1.5">
              {product.brand}
            </div>
            <h2 className="text-xl md:text-2xl font-black text-[#1a1a2e] leading-tight mb-3">
              {product.name}
            </h2>
            {product.note && (
              <p className="text-xs italic text-[#E8431A] mb-3">{product.note}</p>
            )}
            <div className="text-2xl font-black text-[#1a1a2e] mb-1">
              {formatPrice(product.priceWithVat)}
            </div>
            <div className="text-[10px] text-[#9AA3C2] mb-4">
              DPH {product.vatRate} %: {formatPrice(vatAmount)} · bez DPH: {formatPrice(withoutVat)}
            </div>

            {product.specs.length > 0 && (
              <ul className="space-y-1 mb-4">
                {product.specs.slice(0, 4).map((s) => (
                  <li key={s} className="text-xs text-[#5A6480] flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-[#E8431A] shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            )}

            {!product.hasConfigurator && !needsVariant && <VariantSelector product={product} />}

            <div className="mt-auto pt-4 flex flex-col gap-2">
              {needsVariant ? (
                <Link
                  href={`/shop/${product.slug}`}
                  onClick={onClose}
                  className="w-full px-5 py-3 rounded-full bg-[#1a1a2e] text-white text-sm font-bold hover:opacity-90 transition-opacity text-center"
                >
                  Vybrat barvu / velikost →
                </Link>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleAdd}
                    className="w-full px-5 py-3 rounded-full bg-[#1a1a2e] text-white text-sm font-bold hover:opacity-90 transition-opacity"
                  >
                    Do košíku
                  </button>
                  <Link
                    href={`/shop/${product.slug}`}
                    onClick={onClose}
                    className="text-xs text-center text-[#9AA3C2] hover:text-[#3B7CF4]"
                  >
                    Otevřít plný detail →
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
