"use client";

import { useWishlist, type WishlistItem } from "@/lib/wishlist-store";

/**
 * Heart icon toggleButton — funguje na ProductCard (small) i PDP (large).
 * Pure UI: outline když není v wishlistu, filled when in.
 */
export default function WishlistButton({
  item,
  size = "small",
}: {
  item: Omit<WishlistItem, "addedAt">;
  size?: "small" | "large";
}) {
  const isInWishlist = useWishlist((s) => s.has(item.id));
  const toggle = useWishlist((s) => s.toggle);

  const w = size === "large" ? 22 : 16;

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    toggle(item);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={isInWishlist ? "Odebrat z oblíbených" : "Přidat do oblíbených"}
      aria-pressed={isInWishlist}
      className={`${size === "large" ? "p-2.5" : "p-1.5"} rounded-full transition-all ${
        isInWishlist
          ? "text-[#E8431A] bg-white hover:bg-[#FEE2E2]"
          : "text-[#9AA3C2] bg-white/80 backdrop-blur-sm hover:text-[#E8431A] hover:bg-white"
      }`}
    >
      <svg
        width={w}
        height={w}
        viewBox="0 0 24 24"
        fill={isInWishlist ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={isInWishlist ? 0 : 2.2}
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}
