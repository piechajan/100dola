"use client";

import Link from "next/link";

/**
 * „Na dotaz" CTA pro limitované produkty (limitedOneOff): buď zákazník vybral
 * velikost, kterou nemáme skladem, nebo je poslední kus už prodaný (soldOut).
 * Nabídneme poptávku dostupnosti. Traffic zůstává na webu — odkaz na /kontakt
 * s předvyplněným produktem a velikostí (formulář si to načte z query).
 */
export default function ProductInquiryButton({
  productName,
  productSlug,
  size,
  soldOut = false,
}: {
  productName: string;
  productSlug: string;
  size?: string;
  soldOut?: boolean;
}) {
  const params = new URLSearchParams({ produkt: productName, slug: productSlug });
  if (size) params.set("velikost", size);
  const href = `/kontakt?${params.toString()}#kontakt-formular`;

  return (
    <div className="space-y-2">
      <div className="rounded-xl px-4 py-3 bg-[#FFF7ED] border border-[#FBD38D] text-xs text-[#7A5615]">
        {soldOut
          ? "Poslední kus už je pryč. Napiš nám — zkusíme sehnat další nebo nabídnout alternativu."
          : size
            ? `Velikost ${size} nemáme skladem — je na dotaz. Napiš nám a zkusíme ji sehnat.`
            : "Tato velikost je na dotaz. Napiš nám a zkusíme ji sehnat."}
      </div>
      <Link
        href={href}
        className="flex items-center justify-center w-full px-6 py-4 rounded-full bg-[#1a1a2e] text-white text-sm font-black hover:opacity-90 transition"
      >
        Poptat dostupnost
      </Link>
    </div>
  );
}
