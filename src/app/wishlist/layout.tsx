import type { Metadata } from "next";

// Wishlist je osobní klientská stránka (obsah v localStorage) — nemá SEO
// hodnotu a nemá se indexovat. Odkazy z ní ať Google následuje.
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function WishlistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
