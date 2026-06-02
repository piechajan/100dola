import Link from "next/link";
import Stars from "./Stars";
import type { ReviewAggregate, PublicReview } from "@/lib/shop/reviews";

export default function ReviewsSection({
  productSlug,
  productName,
  aggregate,
  reviews,
}: {
  productSlug: string;
  productName: string;
  aggregate: ReviewAggregate | null;
  reviews: PublicReview[];
}) {
  const hasReviews = aggregate && aggregate.rating_count > 0;
  const avg = Number(aggregate?.rating_avg ?? 0);

  return (
    <section className="bg-white py-12 md:py-16 border-t border-[#E2E6F3]">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
          <div>
            <div className="text-xs tracking-[0.22em] uppercase font-bold text-[#3B7CF4] mb-2">
              Co říkají zákazníci
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e]">Recenze</h2>
          </div>
          <Link
            href={`/reviews/submit?slug=${encodeURIComponent(productSlug)}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1a1a2e] text-white text-sm font-bold hover:opacity-90 transition-opacity"
          >
            Napsat recenzi
          </Link>
        </div>

        {!hasReviews ? (
          <div className="bg-[#F7F9FF] rounded-2xl border border-[#E2E6F3] p-8 text-center">
            <div className="text-3xl mb-2">⭐</div>
            <h3 className="text-base font-black text-[#1a1a2e] mb-1">
              Buď prvním kdo {productName} ohodnotí
            </h3>
            <p className="text-sm text-[#5A6480] mb-4 max-w-md mx-auto">
              Pomůžeš dalším cyklistům s rozhodováním. Stačí pár vět + hvězdičky.
            </p>
            <Link
              href={`/reviews/submit?slug=${encodeURIComponent(productSlug)}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-[#E2E6F3] text-[#1a1a2e] text-sm font-bold hover:border-[#3B7CF4]/40 transition-colors"
            >
              Přidat recenzi
            </Link>
          </div>
        ) : (
          <>
            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-8 mb-10">
              <div className="bg-[#F7F9FF] rounded-2xl border border-[#E2E6F3] p-5 text-center">
                <div className="text-4xl font-black text-[#1a1a2e] mb-1">{avg.toFixed(1)}</div>
                <Stars value={avg} size="large" />
                <div className="text-xs text-[#9AA3C2] mt-2">
                  {aggregate.rating_count}{" "}
                  {aggregate.rating_count === 1
                    ? "recenze"
                    : aggregate.rating_count < 5
                      ? "recenze"
                      : "recenzí"}
                </div>
              </div>
              <div className="space-y-1.5">
                {[5, 4, 3, 2, 1].map((r) => {
                  const count = (aggregate as unknown as Record<string, number>)[`rating_${r}`] ?? 0;
                  const pct = aggregate.rating_count > 0 ? (count / aggregate.rating_count) * 100 : 0;
                  return (
                    <div key={r} className="flex items-center gap-2 text-xs">
                      <span className="w-3 text-[#5A6480] font-bold">{r}</span>
                      <Stars value={r} size="small" />
                      <div className="flex-1 h-2 bg-[#F0F2FA] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#F5A623] rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-8 text-right text-[#9AA3C2] tabular-nums">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Individual reviews */}
            <div className="space-y-4">
              {reviews.map((r) => (
                <article
                  key={r.id}
                  className="bg-white rounded-2xl border border-[#E2E6F3] p-5"
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#1a1a2e]">{r.customer_name}</span>
                        {r.verified_buyer && (
                          <span className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-full bg-[#D1FAE5] text-[#065F46]">
                            Ověřený nákup
                          </span>
                        )}
                      </div>
                      {r.customer_city && (
                        <div className="text-[10px] text-[#9AA3C2]">{r.customer_city}</div>
                      )}
                    </div>
                    <Stars value={r.rating} />
                  </div>
                  {r.title && (
                    <h3 className="text-base font-bold text-[#1a1a2e] mb-1">{r.title}</h3>
                  )}
                  <p className="text-sm text-[#5A6480] leading-relaxed whitespace-pre-wrap">
                    {r.body}
                  </p>
                  <div className="text-[10px] text-[#9AA3C2] mt-3">
                    {new Date(r.created_at).toLocaleDateString("cs-CZ")}
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
