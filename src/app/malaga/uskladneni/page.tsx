import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MALAGA_BRAND, STORAGE_PRICES, TRUST_FACTS, MALAGA_FACTS } from "@/data/malaga";
import MalagaLeadForm from "@/components/malaga/MalagaLeadForm";

const accent = MALAGA_BRAND.color;

export const metadata: Metadata = {
  title: "Uskladnění kola v Malaze — celá sezóna říjen–květen",
  description:
    "Tvoje kolo čeká v Malaze přes celou sezónu (8 měsíců). Měsíčně 70 € nebo celá sezóna od 449 €. Monitorovaný sklad, pojištění, servisní zázemí.",
  alternates: { canonical: "/malaga/uskladneni" },
};

const breadcrumbsJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "100dola Malaga", item: "https://100dolamalaga.cz/malaga" },
    { "@type": "ListItem", position: 2, name: "Uskladnění", item: "https://100dolamalaga.cz/malaga/uskladneni" },
  ],
};

export default function UskladneniPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />
      <Navbar />
      <main className="pt-20">

      {/* Hero */}
      <section className="pt-32 pb-12 md:pt-40 md:pb-16 bg-white">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
          <div className="text-xs text-[#9AA3C2] mb-6">
            <Link href="/malaga" className="hover:text-[#1a1a2e]">100dola Malaga</Link>
            <span className="mx-2">/</span>
            <span className="text-[#1a1a2e] font-semibold">Uskladnění</span>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <span className="w-5 h-px" style={{ backgroundColor: accent }} />
            <span className="text-xs tracking-[0.18em] uppercase font-bold" style={{ color: accent }}>
              Uskladnění
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-[#1a1a2e] leading-[0.95] max-w-3xl">
            Tvoje kolo čeká v Malaze.<br />
            <span style={{ color: accent }}>Celou sezónu.</span>
          </h1>
          <p className="mt-6 text-lg text-[#5A6480] leading-relaxed max-w-2xl">
            Dovezeš kolo jednou, a pak už jen lítáš nalehko. Můžeš přijet pětkrát
            za zimu — kolo tam pořád čeká připravené. Žádné rozebírání mezi cestami.
          </p>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 md:py-20 bg-[#FAFAFC]">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
          <h2 className="text-3xl md:text-4xl font-black text-[#1a1a2e] mb-10 max-w-2xl">
            Měsíčně, nebo celá sezóna.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl">
            {STORAGE_PRICES.map((p, i) => (
              <div
                key={p.label}
                className={`rounded-3xl p-8 ${
                  i === 1 ? "bg-[#1a1a2e] text-white border-2" : "bg-white border border-[#E2E6F3]"
                }`}
                style={i === 1 ? { borderColor: accent } : undefined}
              >
                <div
                  className={`text-xs tracking-[0.18em] uppercase font-bold mb-3 ${
                    i === 1 ? "" : "text-[#9AA3C2]"
                  }`}
                  style={i === 1 ? { color: accent } : undefined}
                >
                  {p.label}
                </div>
                <div className={`text-4xl md:text-5xl font-black mb-1 ${i === 1 ? "text-white" : "text-[#1a1a2e]"}`}>
                  {p.priceFromEur === 70 ? `${p.priceFromEur} €` : `od ${p.priceFromEur} €`}
                </div>
                <div className={`text-sm mb-5 ${i === 1 ? "text-white/55" : "text-[#9AA3C2]"}`}>{p.unit}</div>
                {p.note && (
                  <p className={`text-sm leading-relaxed ${i === 1 ? "text-white/75" : "text-[#5A6480]"}`}>
                    {p.note}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 text-sm text-[#5A6480] max-w-3xl">
            Sezóna {MALAGA_FACTS.seasonLabel} ({MALAGA_FACTS.seasonMonths} měsíců). Mimo sezónu
            (červen–září) skladujeme po individuální dohodě — napiš nám termín a domluvíme.
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-20 items-start">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-[#1a1a2e] mb-5 leading-[0.95]">
                Co skladování zahrnuje.
              </h2>
              <p className="text-[#5A6480] leading-relaxed">
                Není to kotec za rohem. Sklad je monitorovaný, pojištěný a 0 minut od letiště
                Malaga (AGP). Když kolo potřebuješ, vyzvedneš a jedeš.
              </p>
            </div>

            <div className="rounded-3xl p-8" style={{ backgroundColor: MALAGA_BRAND.colorTint }}>
              <ul className="space-y-4">
                {TRUST_FACTS.map((f) => (
                  <li key={f.text} className="flex gap-4 items-start">
                    <div className="text-2xl shrink-0 leading-none">{f.icon}</div>
                    <div className="text-[#1a1a2e] font-semibold leading-snug pt-0.5">{f.text}</div>
                  </li>
                ))}
                <li className="flex gap-4 items-start">
                  <div className="text-2xl shrink-0 leading-none">🔋</div>
                  <div className="text-[#1a1a2e] font-semibold leading-snug pt-0.5">
                    Pravidelná kontrola tlaku v gumách a baterií u e-bike
                  </div>
                </li>
                <li className="flex gap-4 items-start">
                  <div className="text-2xl shrink-0 leading-none">🔁</div>
                  <div className="text-[#1a1a2e] font-semibold leading-snug pt-0.5">
                    Vyzvednutí a uložení vždy po koordinaci se základnou
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Repeat trips logic */}
      <section className="py-16 md:py-20 bg-[#FAFAFC]">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
          <div className="max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-black text-[#1a1a2e] mb-5 leading-[0.95]">
              Jezdíš víckrát za zimu? Tady to dává největší smysl.
            </h2>
            <p className="text-[#5A6480] text-lg leading-relaxed mb-6">
              Skladování je celá pointa modelu. Jeden dovoz na podzim, kolo zůstane.
              Přiletíš v listopadu, jedeš týden, vrátíš se domů — kolo zůstává připravené.
              Příště přijedeš v lednu, sedneš a jedeš znovu. A tak pětkrát za sezónu.
            </p>
            <Link
              href="/malaga/balicky"
              className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-bold rounded-full transition-all hover:opacity-90"
              style={{ backgroundColor: accent, color: "#fff", boxShadow: `0 4px 16px ${accent}40` }}
            >
              Mrknout na balíčky
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Lead form */}
      <section className="py-16 md:py-24 bg-[#1a0e08]">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-10 items-start">
            <div className="text-white">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-5 h-px" style={{ backgroundColor: accent }} />
                <span className="text-xs tracking-[0.22em] uppercase font-bold" style={{ color: accent }}>
                  Poptávka skladování
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black leading-[0.95] mb-5">
                Domluvíme termín a místo v hale.
              </h2>
              <p className="text-white/70 text-lg leading-relaxed max-w-md">
                Napiš nám, na jak dlouho a od kdy. Dostaneš nabídku do 24 hodin.
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
