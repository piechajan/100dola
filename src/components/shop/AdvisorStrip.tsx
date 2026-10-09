"use client";

import Link from "next/link";
import { trackMetaEvent } from "@/components/analytics/MetaPixel";
import { trackGoogleEvent } from "@/components/analytics/GoogleAnalytics";
import {
  GOOGLE_REVIEW_AGGREGATE,
  GOOGLE_BUSINESS_PROFILE_URL,
} from "@/data/google-reviews";

const PHONE_DISPLAY = "+420 739 045 057";
const PHONE_HREF = "tel:+420739045057";

/**
 * „Poradíme s výběrem" — konzultační cesta u dražšího zboží (trenažéry apod.).
 * Kdo kupuje za desítky tisíc, chce se ujistit o kompatibilitě (osa, kazeta,
 * řetěz) dřív, než zaplatí. Pod tlačítky je krátká řada důvěry — jen to, co je
 * doložitelné (Google hodnocení, zákonná 14denní lhůta, osobní odběr).
 *
 * Klik se měří jako Meta „Contact" a GA „generate_lead" / „click_to_call", aby
 * šlo ve vyhodnocení poznat, kolik lidí radu skutečně použilo.
 */
export default function AdvisorStrip({
  context,
  productName,
  productSlug,
}: {
  /** Kde se pruh zobrazuje — jen pro reporting. */
  context: "category" | "pdp";
  productName?: string;
  productSlug?: string;
}) {
  const params = new URLSearchParams({ tema: "vyber-trenazeru" });
  if (productName) params.set("produkt", productName);
  if (productSlug) params.set("slug", productSlug);
  const inquiryHref = `/kontakt?${params.toString()}#kontakt-formular`;

  function onCall() {
    trackMetaEvent("Contact", { content_name: "advisor-call", content_category: context });
    trackGoogleEvent("click_to_call", { location: `advisor-${context}` });
  }
  function onInquiry() {
    trackMetaEvent("Contact", { content_name: "advisor-inquiry", content_category: context });
    trackGoogleEvent("generate_lead", { location: `advisor-${context}` });
  }

  return (
    <section
      aria-label="Poradíme s výběrem"
      className="rounded-2xl border border-[#E2E6F3] bg-[#F7F9FF] p-5 md:p-6"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="max-w-xl">
          <h2 className="text-lg md:text-xl font-black text-[#1a1a2e]">
            Poradíme s výběrem
          </h2>
          <p className="mt-1 text-sm text-[#5A6480] leading-relaxed">
            Napiš nám značku kola a typ řazení. Ověříme ti kompatibilitu —
            osu, kazetu i řetěz — ať můžeš po rozbalení rovnou jezdit.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
          <a
            href={PHONE_HREF}
            onClick={onCall}
            className="inline-flex items-center justify-center px-5 py-3 rounded-full bg-[#1a1a2e] text-white text-sm font-black hover:opacity-90 transition"
          >
            Zavolat {PHONE_DISPLAY}
          </a>
          <Link
            href={inquiryHref}
            onClick={onInquiry}
            className="inline-flex items-center justify-center px-5 py-3 rounded-full border border-[#1a1a2e] text-[#1a1a2e] text-sm font-black hover:bg-white transition"
          >
            Napsat dotaz
          </Link>
        </div>
      </div>

      <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-[#5A6480]">
        <li>
          <a
            href={GOOGLE_BUSINESS_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-[#1a1a2e] underline decoration-[#5A6480]/30 hover:decoration-[#3B7CF4]"
          >
            ★ {GOOGLE_REVIEW_AGGREGATE.ratingValue.toFixed(1)} na Google ({GOOGLE_REVIEW_AGGREGATE.reviewCount} hodnocení)
          </a>
        </li>
        <li>Vrácení do 14 dnů bez udání důvodu</li>
        <li>Osobní odběr ve Šternberku zdarma</li>
      </ul>
    </section>
  );
}
