import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MALAGA_BRAND } from "@/data/malaga";
import { MALAGA_ROUTES, SURFACE_LABEL, SURFACE_EMOJI } from "@/data/malagaRoutes";
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
    { "@type": "ListItem", position: 1, name: "100dola Malaga", item: "https://100dolamalaga.cz/malaga" },
    { "@type": "ListItem", position: 2, name: "Trasy", item: "https://100dolamalaga.cz/malaga/trasy" },
  ],
};

const itemListJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Cyklo trasy kolem Malagy",
  itemListElement: MALAGA_ROUTES.map((r, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: r.name,
    description: r.tagline,
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
              {MALAGA_ROUTES.map((r) => (
                <div
                  key={r.slug}
                  className="rounded-3xl p-7 md:p-8 bg-white border border-[#E2E6F3] flex flex-col"
                >
                  <div className="flex items-center gap-2 flex-wrap mb-4">
                    <span
                      className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: `${accent}14`, color: accent }}
                    >
                      {SURFACE_EMOJI[r.surface]} {SURFACE_LABEL[r.surface]}
                    </span>
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#F0F2FA] text-[#5A6480]">
                      {r.level}
                    </span>
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#F0F2FA] text-[#5A6480]">
                      {r.distanceKm}
                    </span>
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#F0F2FA] text-[#5A6480]">
                      ↗ {r.climbM}
                    </span>
                  </div>

                  <h2 className="text-xl md:text-2xl font-black text-[#1a1a2e] leading-tight mb-1">
                    {r.name}
                  </h2>
                  <p className="text-sm font-semibold mb-3" style={{ color: accent }}>
                    {r.tagline}
                  </p>
                  <p className="text-sm text-[#5A6480] leading-relaxed mb-5">{r.description}</p>

                  <div className="mt-auto space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {r.highlights.map((h) => (
                        <span
                          key={h}
                          className="text-[11px] text-[#1a1a2e] bg-[#FAFAFC] border border-[#E2E6F3] px-2.5 py-1 rounded-full"
                        >
                          {h}
                        </span>
                      ))}
                    </div>
                    <div className="text-xs text-[#5A6480] pt-3 border-t border-[#F0F2FA]">
                      <span className="mr-3">☕ <span className="font-semibold text-[#1a1a2e]">Zastávka:</span> {r.stop}</span>
                    </div>
                    <div className="text-xs text-[#9AA3C2] italic">Komu sedne: {r.bestFor}</div>
                  </div>
                </div>
              ))}
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
                Poradíme, kam podle formy, kde je servis a kafe, a když se něco na
                trase pokazí, ozveš se. Ptej se na uskladnění + trasy v poptávce níž.
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
