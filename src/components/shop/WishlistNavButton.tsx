"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useWishlist } from "@/lib/wishlist-store";

export default function WishlistNavButton() {
  const count = useWishlist((s) => s.items.length);
  // Hydration safe — wishlist je client only, render bez badge dokud nehydratováno
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  return (
    <Link
      href="/wishlist"
      aria-label={`Oblíbené (${count})`}
      className="relative p-2.5 text-[#9AA3C2] hover:text-[#E8431A] transition-colors rounded-lg hover:bg-[#F0F2FA]"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      {hydrated && count > 0 && (
        <span
          className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-[#E8431A] text-white text-[9px] font-bold"
          aria-hidden="true"
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
