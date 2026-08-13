import {
  GOOGLE_REVIEWS,
  GOOGLE_REVIEW_AGGREGATE,
  GOOGLE_BUSINESS_PROFILE_URL,
} from "@/data/google-reviews";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-0.5 align-middle" aria-label={`${rating} z 5 hvězdiček`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="15" height="15" viewBox="0 0 24 24" className={i < rating ? "text-[#FFB400] fill-current" : "text-[#E2E6F3] fill-current"}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </span>
  );
}

/**
 * Kompaktní firemní social proof na PDP: agregát Google hodnocení + 3 krátké
 * autentické recenze. Zřetelně označené jako Google recenze o obchodu (NEplést
 * s produktovými recenzemi). Server komponenta — obsah v HTML kvůli SEO.
 */
export default function GoogleReviewsCompact() {
  // vyber 3 stručné, silné recenze pro kompaktní blok
  const picks = GOOGLE_REVIEWS.filter((r) => r.body.length <= 180).slice(0, 3);
  const shown = picks.length >= 3 ? picks : GOOGLE_REVIEWS.slice(0, 3);

  return (
    <section className="mt-6 rounded-2xl border border-[#E2E6F3] bg-white p-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="inline-flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
            <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z" />
            <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z" />
            <path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z" />
            <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z" />
          </svg>
          <span className="text-sm font-black text-[#1a1a2e]">
            {GOOGLE_REVIEW_AGGREGATE.ratingValue.toFixed(1)}
          </span>
          <Stars rating={Math.round(GOOGLE_REVIEW_AGGREGATE.ratingValue)} />
        </div>
        <a
          href={GOOGLE_BUSINESS_PROFILE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-bold text-[#5A6480] hover:text-[#3B7CF4] underline decoration-[#5A6480]/30 hover:decoration-[#3B7CF4]"
        >
          {GOOGLE_REVIEW_AGGREGATE.reviewCount} hodnocení na Google
        </a>
      </div>

      <div className="mt-4 space-y-3">
        {shown.map((r) => (
          <div key={r.author} className="text-sm">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#1a1a2e]">{r.author}</span>
              <Stars rating={r.rating} />
            </div>
            <p className="text-[#5A6480] leading-relaxed mt-0.5">„{r.body}"</p>
          </div>
        ))}
      </div>
    </section>
  );
}
