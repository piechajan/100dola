"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cart-store";
import { splitVat, formatPrice, type Product } from "@/data/products";
import WishlistButton from "@/components/shop/WishlistButton";

const BADGE_COLORS: Record<string, string> = {
  "Doporučuje tým": "#E8431A",
  "Novinka": "#2EAA6E",
  "Buď vidět": "#3B7CF4",
};

export default function ProductCard({ product }: { product: Product }) {
  const addToCart = useCart((s) => s.add);
  const openDrawer = useCart((s) => s.openDrawer);
  const { withoutVat, vatAmount } = splitVat(product.priceWithVat, product.vatRate);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    openDrawer();
  };

  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-[#E8E8E8] hover:border-[#E8431A]/20 hover:shadow-lg transition-all duration-200"
    >
      <div className="relative aspect-[4/3] bg-white flex items-center justify-center overflow-hidden">
        <Image
          src={product.photo}
          alt={product.name}
          fill
          className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        {product.badges.length > 0 && (
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
            {product.badges.map((badge) => (
              <span
                key={badge}
                className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full text-white self-start"
                style={{ backgroundColor: BADGE_COLORS[badge] ?? "#1a1a1a" }}
              >
                {badge}
              </span>
            ))}
          </div>
        )}
        <div className="absolute top-2 right-2 z-10">
          <WishlistButton
            item={{
              id: product.id,
              slug: product.slug,
              name: product.name,
              brand: product.brand,
              priceWithVat: product.priceWithVat,
              photo: product.photo,
            }}
          />
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-sm font-bold text-[#111111] leading-snug">
          {product.name}
          {product.year && (
            <span className="text-[#9A9A9A] font-medium ml-1">{product.year}</span>
          )}
        </h3>

        {product.specs.length > 0 && (
          <ul className="mt-2 space-y-0.5">
            {product.specs.map((s) => (
              <li key={s} className="text-[10px] text-[#9A9A9A] flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-[#E8431A] shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        )}

        {product.note && (
          <p className="text-[11px] text-[#E8431A] mt-2 font-medium italic">{product.note}</p>
        )}

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-[#F4F4F4] mt-3">
          <div>
            {product.originalPriceWithVat && (
              <span className="text-xs text-[#9A9A9A] line-through block">
                {formatPrice(product.originalPriceWithVat)}
              </span>
            )}
            <span
              className={`text-base font-black ${product.originalPriceWithVat ? "text-[#E8431A]" : "text-[#111111]"}`}
            >
              {formatPrice(product.priceWithVat)}
            </span>
            <span className="block text-[9px] text-[#9A9A9A] leading-tight">
              DPH {product.vatRate} %: {formatPrice(vatAmount)} · bez DPH: {formatPrice(withoutVat)}
            </span>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            className="p-2 rounded-full bg-[#F4F4F4] hover:bg-[#3B7CF4] active:bg-[#2563CC] transition-colors duration-200 group/btn"
            aria-label="Přidat do košíku"
          >
            <svg
              width="14"
              height="14"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
              className="text-[#666666] group-hover/btn:text-white transition-colors"
            >
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </button>
        </div>
      </div>
    </Link>
  );
}
