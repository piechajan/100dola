import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MALAGA_BRAND, PACKAGES, ADDONS, GROUP_NOTE, FAQ_FULL, EBIKE_SURCHARGE } from "@/data/malaga";
import MalagaLeadForm from "@/components/malaga/MalagaLeadForm";

const accent = MALAGA_BRAND.color;

export const metadata: Metadata = {
  title: "Balíčky a ceny — Basic od 849 € a Exclusive od 1 349 €",
  description:
    "Vyber si, kolik servisu chceš. Basic (od 849 €) — doprava + skladování celou sezónu. Exclusive (od 1 349 €) — kompletní balení, sestavení a vyzvednutí na letišti.",
  alternates: { canonical: "/malaga/balicky" },
};

const breadcrumbsJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "100dola Malaga", item: "https://100dolamalaga.cz/malaga" },
    { "@type": "ListItem", position: 2, name: "Balíčky", item: "https://100dolamalaga.cz/malaga/balicky" },
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_FULL.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

export default function BalickyPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <Navbar />
      <main className="pt-20">

      {/* Hero */}
      <section className="pt-32 pb-12 md:pt-40 md:pb-16 bg-white">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
          <div className="text-xs text-[#9AA3C2] mb-6">
            <Link href="/malaga" className="hover:text-[#1a1a2e]">100dola Malaga</Link>
            <span className="mx-2">/</span>
            <span className="text-[#1a1a2e] font-semibold">Balíčky a ceny</span>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <span className="w-5 h-px" style={{ backgroundColor: accent }} />
            <span className="text-xs tracking-[0.18em] uppercase font-bold" style={{ color: accent }}>
              Balíčky a ceny
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-[#1a1a2e] leading-[0.95] max-w-3xl">
            Vyber si, kolik<br />
            <span style={{ color: accent }}>servisu chceš.</span>
          </h1>
          <p className="mt-6 text-lg text-[#5A6480] leading-relaxed max-w-2xl">
            Basic je praktický a cenově vědomý. Exclusive je pro lidi, co chtějí
            přiletět rovnou na ride. Oba zahrnují dopravu CZ → Malaga a skladování
            přes celou sezónu.
          </p>
        </div>
      </section>

      {/* Packages */}
      <section className="py-12 md:py-16 bg-[#FAFAFC]">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {PACKAGES.map((p) => {
              const isExclusive = p.id === "exclusive";
              return (
                <div
                  key={p.id}
                  id={p.id}
                  className={`relative rounded-3xl p-8 md:p-10 ${
                    isExclusive ? "border-2 text-white" : "border border-[#E2E6F3] bg-white"
                  }`}
                  style={isExclusive ? { backgroundColor: "#1a1a2e", borderColor: accent } : undefined}
                >
                  {p.popular && (
                    <div
                      className="absolute -top-3 right-8 text-[10px] tracking-[0.2em] uppercase font-black px-3 py-1.5 rounded-full"
                      style={{ backgroundColor: accent, color: "#fff" }}
                    >
                      Doporučeno
                    </div>
                  )}

                  <div
                    className={`text-xs tracking-[0.18em] uppercase font-bold mb-3 ${
                      isExclusive ? "" : "text-[#9AA3C2]"
                    }`}
                    style={isExclusive ? { color: accent } : undefined}
                  >
                    Balíček {p.name}
                  </div>

                  <div className={`text-4xl md:text-5xl font-black mb-2 ${isExclusive ? "text-white" : "text-[#1a1a2e]"}`}>
                    od {p.priceFromEur.toLocaleString("cs-CZ")} €
                  </div>
                  <div
                    className="text-xs font-semibold mb-4 inline-block px-3 py-1.5 rounded-full"
                    style={
                      isExclusive
                        ? { backgroundColor: `${accent}25`, color: accent }
                        : { backgroundColor: `${accent}12`, color: accent }
                    }
                  >
                    E-bike od {p.priceEbikeFromEur.toLocaleString("cs-CZ")} €
                  </div>
                  <p className={`text-base leading-relaxed mb-7 ${isExclusive ? "text-white/70" : "text-[#5A6480]"}`}>
                    {p.tagline}
                  </p>

                  <div className={`text-xs tracking-wide uppercase font-bold mb-3 ${isExclusive ? "text-white/45" : "text-[#9AA3C2]"}`}>
                    Co je v balíčku
                  </div>
                  <ul className="space-y-2.5 mb-6">
                    {p.whatsIncluded.map((item) => (
                      <li key={item} className="flex gap-3 items-start">
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={accent} strokeWidth={2.5} className="mt-0.5 shrink-0">
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                        <span className={`text-sm ${isExclusive ? "text-white/85" : "text-[#1a1a2e]"}`}>{item}</span>
                      </li>
                    ))}
                  </ul>

                  <div className={`text-xs tracking-wide uppercase font-bold mb-3 mt-5 ${isExclusive ? "text-white/45" : "text-[#9AA3C2]"}`}>
                    Co řešíš ty
                  </div>
                  <ul className="space-y-2.5 mb-7">
                    {p.whatYouDo.map((item) => (
                      <li key={item} className="flex gap-3 items-start">
                        <span className="text-[#9AA3C2] mt-0.5">·</span>
                        <span className={`text-sm ${isExclusive ? "text-white/65" : "text-[#5A6480]"}`}>{item}</span>
                      </li>
                    ))}
                  </ul>

                  <div className={`text-xs leading-relaxed mb-6 ${isExclusive ? "text-white/55" : "text-[#9AA3C2]"} italic`}>
                    Komu sedne: {p.bestFor}
                  </div>

                  <Link
                    href="#poptavka"
                    className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-full transition-all hover:gap-3"
                    style={
                      isExclusive
                        ? { backgroundColor: accent, color: "#fff" }
                        : { backgroundColor: "#1a1a2e", color: "#fff" }
                    }
                  >
                    Vybrat {p.name}
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              );
            })}
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="text-sm text-[#5A6480] leading-relaxed rounded-2xl p-5 bg-white border border-[#E2E6F3]">
              <span className="font-bold text-[#1a1a2e]">Konečnou cenu</span> stanovíme podle termínu, počtu kol a způsobu předání. Pošleme nabídku do 24 hodin po vyplnění poptávky.
            </div>
            <div
              className="text-sm leading-relaxed rounded-2xl p-5"
              style={{ backgroundColor: MALAGA_BRAND.colorTint, color: "#1a1a2e" }}
            >
              <span className="font-bold">⚡ E-bike: </span>{EBIKE_SURCHARGE.reason}
            </div>
            <div className="text-sm text-[#5A6480] leading-relaxed rounded-2xl p-5 bg-white border border-[#E2E6F3]">
              <span className="font-bold text-[#1a1a2e]">Skupina nebo klub?</span> {GROUP_NOTE}
            </div>
          </div>
        </div>
      </section>

      {/* Add-ons */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
          <h2 className="text-3xl md:text-4xl font-black text-[#1a1a2e] mb-10">
            Doplňky a příplatky
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {ADDONS.map((a) => (
              <div key={a.label} className="rounded-2xl p-6 bg-[#FAFAFC] border border-[#E2E6F3]">
                <div className="font-black text-[#1a1a2e] mb-1">{a.label}</div>
                <div className="text-sm font-bold mb-3" style={{ color: accent }}>
                  {a.priceFromEur > 0 ? `od ${a.priceFromEur} €` : a.unit}
                </div>
                {a.note && <p className="text-sm text-[#5A6480] leading-relaxed">{a.note}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-20" style={{ backgroundColor: MALAGA_BRAND.colorTint }}>
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
          <h2 className="text-3xl md:text-4xl font-black text-[#1a1a2e] mb-10">
            Časté otázky k balíčkům.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 max-w-5xl">
            {FAQ_FULL.map((item) => (
              <div key={item.q}>
                <div className="font-black text-[#1a1a2e] mb-2">{item.q}</div>
                <p className="text-sm text-[#5A6480] leading-relaxed">{item.a}</p>
              </div>
            ))}
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
                  Poptávka balíčku
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black leading-[0.95] mb-5">
                Vyber, vyplň, odešli.<br />Pošleme cenu na míru.
              </h2>
              <p className="text-white/70 text-lg leading-relaxed max-w-md">
                Stačí pár polí. Konkrétní cenu spočítáme podle termínu, počtu kol a způsobu předání.
              </p>
            </div>
            <MalagaLeadForm defaultIntent="package" />
          </div>
        </div>
      </section>
      </main>
      <Footer />
    </>
  );
}
