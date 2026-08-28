import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MALAGA_BRAND } from "@/data/malaga";
import { MALAGA_ROUTES_V2 } from "@/data/malaga/routes";
import { TIER_LABEL, TIER_COLOR, FLAG_META } from "@/data/malaga/routes/types";
import MalagaLeadForm from "@/components/malaga/MalagaLeadForm";

const accent = MALAGA_BRAND.color;

export const metadata: Metadata = {
  title: "Cyklo trasy kolem Malagy — silnice, gravel a stoupání v Andalusii",
  description:
    "Kam vyrazit na kole z Malagy: domácí stoupání Montes de Málaga, bílé vesnice Axarquíe, profesionální Zafarraya, gravel El Chorro i pobřežní recovery. Doporučené okruhy podle formy — GPX a doladění řešíme na místě.",
  alternates: { canonical: "/malaga/trasy" },
};

const breadcrumbsJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "100dola Malaga", item: "https://www.100dola.com/malaga" },
    { "@type": "ListItem", position: 2, name: "Trasy", item: "https://www.100dola.com/malaga/trasy" },
  ],
};

const itemListJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Cyklo trasy kolem Malagy",
  itemListElement: MALAGA_ROUTES_V2.map((r, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: r.name_cs,
    url: `https://www.100dola.com/malaga/trasy/${r.slug}`,
  })),
};

export default function TrasyPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      <Navbar />
      <main className="pt-20">
        {/* Hero */}
        <section className="pt-32 pb-12 md:pt-40 md:pb-16 bg-white">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
            <div className="text-xs text-[#9AA3C2] mb-6">
              <Link href="/malaga" className="hover:text-[#1a1a2e]">100dola Malaga</Link>
              <span className="mx-2">/</span>
              <span className="text-[#1a1a2e] font-semibold">Trasy a okruhy</span>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <span className="w-5 h-px" style={{ backgroundColor: accent }} />
              <span className="text-xs tracking-[0.18em] uppercase font-bold" style={{ color: accent }}>
                Trasy a okruhy
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-[#1a1a2e] leading-[0.95] max-w-3xl">
              Kam z Malagy<br />
              <span style={{ color: accent }}>vyrazit na kole.</span>
            </h1>
            <p className="mt-6 text-lg text-[#5A6480] leading-relaxed max-w-2xl">
              Costa del Sol není jen pláž. Od domácího stoupání nad městem přes bílé
              vesnice a profesionální stoupáky až po gravel v roklích — základna
              10 minut od letiště tě dostane k terénu pro každou formu. Tady je
              výběr okruhů, které jezdíme my.
            </p>
          </div>
        </section>

        {/* Routes grid */}
        <section className="py-12 md:py-16 bg-[#FAFAFC]">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {MALAGA_ROUTES_V2.map((r) => {
                const flags = FLAG_META.filter((f) => r.flags[f.key]);
                return (
                  <Link
                    key={r.slug}
                    href={`/malaga/trasy/${r.slug}`}
                    className="group rounded-3xl p-7 md:p-8 bg-white border border-[#E2E6F3] hover:border-[#E8431A] transition-colors flex flex-col"
                  >
                    <div className="flex items-center gap-2 flex-wrap mb-4">
                      <span
                        className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full text-white"
                        style={{ backgroundColor: TIER_COLOR[r.tier] }}
                      >
                        {TIER_LABEL[r.tier]} · DS {r.difficulty_score}
                      </span>
                      <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#F0F2FA] text-[#5A6480]">
                        {r.distance_km} km
                      </span>
                      <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#F0F2FA] text-[#5A6480]">
                        ↗ {r.ascent_m} m
                      </span>
                      {flags.map((f) => (
                        <span key={f.key} title={f.label} className="text-[11px] px-1.5 py-1 rounded-full bg-[#FFF1EA]">
                          {f.emoji}
                        </span>
                      ))}
                    </div>

                    <h2 className="text-xl md:text-2xl font-black text-[#1a1a2e] leading-tight mb-3 group-hover:text-[#E8431A] transition-colors">
                      {r.name_cs}
                    </h2>
                    <p className="text-sm text-[#5A6480] leading-relaxed mb-5 line-clamp-4">{r.story_cs}</p>

                    <div className="mt-auto space-y-3">
                      {r.cafes[0] && (
                        <div className="text-xs text-[#5A6480] pt-3 border-t border-[#F0F2FA]">
                          ☕ <span className="font-semibold text-[#1a1a2e]">Zastávka:</span> {r.cafes[0].name} ({r.cafes[0].town})
                        </div>
                      )}
                      <div className="text-xs text-[#9AA3C2] italic">Komu sedne: {r.who_it_suits_cs}</div>
                      <div className="text-sm font-bold" style={{ color: accent }}>
                        Detail trasy, mapa a GPX →
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Honest note */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="text-sm text-[#5A6480] leading-relaxed rounded-2xl p-5 bg-white border border-[#E2E6F3]">
                <span className="font-bold text-[#1a1a2e]">GPX a doladění na místě.</span>{" "}
                Přesné trasy, aktuální stav silnic a variace podle počasí a tvojí formy
                probereme po příletu. Kilometry a převýšení výše jsou orientační —
                každý okruh jde zkrátit i prodloužit.
              </div>
              <div
                className="text-sm leading-relaxed rounded-2xl p-5"
                style={{ backgroundColor: MALAGA_BRAND.colorTint, color: "#1a1a2e" }}
              >
                <span className="font-bold">🚐 Nejsi na to sám.</span>{" "}
                Máme v Malaze vlastního mechanika, poradíme kam podle formy, kde je kafe —
                a když se něco na trase pokazí, zavoláš a my tě vyzvedneme. Ptej se na
                uskladnění + trasy v poptávce níž.
              </div>
            </div>
          </div>
        </section>

        {/* Lead form */}
        <section id="poptavka" className="py-16 md:py-24 bg-[#1a0e08]">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-10 items-start">
              <div className="text-white">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-5 h-px" style={{ backgroundColor: accent }} />
                  <span className="text-xs tracking-[0.22em] uppercase font-bold" style={{ color: accent }}>
                    Uskladnění + trasy
                  </span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black leading-[0.95] mb-5">
                  Chceš svoje kolo<br />ready v Malaze?
                </h2>
                <p className="text-white/70 text-lg leading-relaxed max-w-md">
                  Napiš nám, kdy plánuješ přijet a jak jezdíš. Doporučíme trasy podle
                  tvojí formy a kolo ti připravíme, ať po příletu jen sedneš a jedeš.
                </p>
              </div>
              <MalagaLeadForm defaultIntent="storage" />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
