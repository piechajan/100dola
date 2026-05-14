"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-store";
import type { Product } from "@/data/products";

interface Props {
  product: Product;
  large?: boolean;
}

export default function AddToCartButton({ product, large }: Props) {
  const [qty, setQty] = useState(1);
  const addToCart = useCart((s) => s.add);
  const openDrawer = useCart((s) => s.openDrawer);
  const [adding, setAdding] = useState(false);

  const handleAdd = () => {
    setAdding(true);
    addToCart(product, qty);
    openDrawer();
    setTimeout(() => setAdding(false), 400);
  };

  return (
    <div className={`flex ${large ? "gap-3" : "gap-2"} items-stretch`}>
      <div className="inline-flex items-stretch border-2 border-[#E2E6F3] rounded-full overflow-hidden">
        <button
          type="button"
          onClick={() => setQty(Math.max(1, qty - 1))}
          aria-label="Snížit množství"
          className="w-10 flex items-center justify-center text-[#5A6480] hover:bg-[#F0F2FA] disabled:opacity-30"
          disabled={qty <= 1}
        >
          −
        </button>
        <span className={`${large ? "w-12 text-base" : "w-10 text-sm"} text-center font-black text-[#1a1a2e] flex items-center justify-center`}>
          {qty}
        </span>
        <button
          type="button"
          onClick={() => setQty(qty + 1)}
          aria-label="Zvýšit množství"
          className="w-10 flex items-center justify-center text-[#5A6480] hover:bg-[#F0F2FA]"
        >
          +
        </button>
      </div>
      <button
        type="button"
        onClick={handleAdd}
        disabled={adding}
        className={`flex-1 ${large ? "py-4 text-sm" : "py-3 text-sm"} font-black text-white rounded-full transition-all hover:opacity-90 disabled:opacity-60 inline-flex items-center justify-center gap-2`}
        style={{ backgroundColor: "#3B7CF4", boxShadow: "0 4px 16px #3B7CF440" }}
      >
        {adding ? "Přidávám…" : "Do košíku"}
        {!adding && (
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
        )}
      </button>
    </div>
  );
}
