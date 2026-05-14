"use client";

import { useCart } from "@/lib/cart-store";

export default function CartButton() {
  const items = useCart((s) => s.items);
  const openDrawer = useCart((s) => s.openDrawer);
  const itemCount = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <button
      type="button"
      onClick={openDrawer}
      aria-label={`Košík (${itemCount} ${itemCount === 1 ? "položka" : "položek"})`}
      className="relative flex p-2.5 text-[#9AA3C2] hover:text-[#1a1a2e] transition-colors rounded-lg hover:bg-[#F0F2FA]"
    >
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
      {itemCount > 0 ? (
        <span
          className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-[#E8431A] text-white text-[10px] font-black flex items-center justify-center px-1 leading-none"
          aria-hidden="true"
        >
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      ) : (
        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#3B7CF4]" />
      )}
    </button>
  );
}
