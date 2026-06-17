"use client";

import { useEffect, useState } from "react";
import {
  GOOGLE_REVIEWS,
  GOOGLE_REVIEW_AGGREGATE,
  GOOGLE_BUSINESS_PROFILE_URL,
} from "@/data/google-reviews";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} z 5 hvězdiček`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width="18"
          height="18"
          viewBox="0 0 24 24"
          className={i < rating ? "text-[#FFB400] fill-current" : "text-[#E2E6F3] fill-current"}
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function ReviewsCarousel() {
  const [active, setActive] = useState(0);
  const reviews = GOOGLE_REVIEWS;

  useEffect(() => {
    if (reviews.length <= 1) return;
    const t = setInterval(() => {
      setActive((a) => (a + 1) % reviews.length);
    }, 8000);
    return () => clearInterval(t);
  }, [reviews.length]);

  if (reviews.length < 2) return null;

  return (
    <section className="bg-gradient-to-b from-white via-[#F7F9FF] to-white py-16 md:py-24">
      <div className="max-w-[1080px] mx-auto px-4 md:px-6">
        <div className="text-center mb-10 md:mb-12">
          <div className="inline-flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-[#5A6480]">
            <svg width="16" height="16" viewBox="0 0 48 48">
              <path
                fill="#4285F4"
                d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"
              />
              <path
                fill="#34A853"
                d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"
              />
              <path
                fill="#FBBC05"
                d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z"
              />
              <path
                fill="#EA4335"
                d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"
              />
            </svg>
            Google recenze
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-[#1a1a2e] mb-3">
            Co o nás říkají zákazníci
          </h2>
          <div className="flex items-center justify-center gap-3 text-sm text-[#5A6480]">
            <Stars rating={Math.round(GOOGLE_REVIEW_AGGREGATE.ratingValue)} />
            <span className="font-bold text-[#1a1a2e]">
              {GOOGLE_REVIEW_AGGREGATE.ratingValue.toFixed(1)}
            </span>
            <span>·</span>
            <a
              href={GOOGLE_BUSINESS_PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-[#5A6480]/30 hover:text-[#3B7CF4] hover:decoration-[#3B7CF4]"
            >
              {GOOGLE_REVIEW_AGGREGATE.reviewCount} hodnocení na Google
            </a>
          </div>
        </div>

        <div className="relative">
          <div className="bg-white border border-[#E2E6F3] rounded-3xl p-6 md:p-10 shadow-sm">
            {reviews.map((r, i) => (
              <div
                key={r.author + i}
                className={`${i === active ? "block" : "hidden"} transition-opacity`}
              >
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#3B7CF4] to-[#5C92F6] text-white flex items-center justify-center font-black text-sm flex-shrink-0">
                    {getInitials(r.author)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-[#1a1a2e] truncate">{r.author}</div>
                    <div className="flex items-center gap-2 text-xs text-[#5A6480] mt-0.5">
                      {r.badge && (
                        <span className="bg-[#EAF1FE] text-[#3B7CF4] px-2 py-0.5 rounded-full font-bold">
                          {r.badge}
                        </span>
                      )}
                      <span>{r.date}</span>
                      {r.userReviewCount && r.userReviewCount > 1 && (
                        <span>· {r.userReviewCount} recenzí</span>
                      )}
                    </div>
                  </div>
                  <Stars rating={r.rating} />
                </div>
                <p className="text-base md:text-lg text-[#1a1a2e] leading-relaxed italic">
                  „{r.body}"
                </p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 mt-6">
            {reviews.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Recenze ${i + 1}`}
                onClick={() => setActive(i)}
                className={`h-2 rounded-full transition-all ${
                  i === active ? "w-8 bg-[#3B7CF4]" : "w-2 bg-[#E2E6F3] hover:bg-[#C9DCFC]"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="text-center mt-8">
          <a
            href={GOOGLE_BUSINESS_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#5A6480] hover:text-[#3B7CF4] transition-colors"
          >
            Všech {GOOGLE_REVIEW_AGGREGATE.reviewCount} recenzí na Google
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 17L17 7M17 7H8M17 7v9" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
