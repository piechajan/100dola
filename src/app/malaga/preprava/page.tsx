import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MALAGA_BRAND, TRANSPORT_PRICES, TRANSPORT_FRAMING, ADDONS, GROUP_NOTE, EBIKE_SURCHARGE } from "@/data/malaga";
import MalagaLeadForm from "@/components/malaga/MalagaLeadForm";

const accent = MALAGA_BRAND.color;

export const metadata: Metadata = {
  title: "Přeprava kola do Malagy — pojištěná, plánovaná po blocích",
  description:
    "Doprava kola z Česka do Malagy a zpět. One-way od 299 €, round-trip od 499 €. Pojištěná přeprava v zabezpečeném transportním boxu, sdíleně s dalšími koly.",
  alternates: { canonical: "/malaga/preprava" },
};

const breadcrumbsJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "100dola Malaga", item: "https://www.100dola.com/malaga" },
    { "@type": "ListItem", position: 2, name: "Přeprava kola", item: "https://www.100dola.com/malaga/preprava" },
  ],
};

export default function PrepravaPage() {
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
            <span className="text-[#1a1a2e] font-semibold">Přeprava kola</span>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <span className="w-5 h-px" style={{ backgroundColor: accent }} />
            <span className="text-xs tracking-[0.18em] uppercase font-bold" style={{ color: accent }}>
              Přeprava
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-[#1a1a2e] leading-[0.95] max-w-3xl">
            Tvoje kolo dorazí do Malagy.<br />
            <span style={{ color: accent }}>Ty letíš nalehko.</span>
          </h1>
          <p className="mt-6 text-lg text-[#5A6480] leading-relaxed max-w-2xl">
            One-way nebo round-trip. Pojištěná přeprava ve sdíleném transportním
            boxu, plánovaná po blocích. Žádné rozebírání, žádná krabice na letiště, žádný stres na check-inu.
          </p>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 md:py-20 bg-[#FAFAFC]">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl">
            {TRANSPORT_PRICES.map((p) => (
              <div
                key={p.label}
                className="rounded-3xl p-8 bg-white border border-[#E2E6F3]"
              >
                <div className="text-xs tracking-[0.18em] uppercase font-bold text-[#9AA3C2] mb-3">
                  {p.label}
                </div>
                <div className="text-4xl md:text-5xl font-black text-[#1a1a2e] mb-1">
                  od {p.priceFromEur} €
                </div>
                <div className="text-sm text-[#9AA3C2] mb-4">{p.unit}</div>
                {p.priceEbikeFromEur && (
                  <div
                    className="text-xs font-semibold mb-4 inline-block px-3 py-1.5 rounded-full"
                    style={{ backgroundColor: `${MALAGA_BRAND.color}12`, color: MALAGA_BRAND.color }}
                  >
                    E-bike od {p.priceEbikeFromEur} €
                  </div>
                )}
                {p.note && <p className="text-sm text-[#5A6480] leading-relaxed">{p.note}</p>}
              </div>
            ))}
          </div>

          {/* E-bike note */}
          <div
            className="mt-6 max-w-4xl rounded-2xl p-5 text-sm leading-relaxed"
            style={{ backgroundColor: MALAGA_BRAND.colorTint, color: "#1a1a2e" }}
          >
            <span className="font-bold">⚡ E-bike: </span>
            {EBIKE_SURCHARGE.reason}
          </div>

          {/* Operational framing */}
          <div className="mt-10 rounded-3xl p-8 max-w-4xl" style={{ backgroundColor: MALAGA_BRAND.colorTint }}>
            <div className="text-xs tracking-[0.18em] uppercase font-bold mb-3" style={{ color: accent }}>
              Jak doprava probíhá
            </div>
            <p className="text-[#1a1a2e] leading-relaxed">
              {TRANSPORT_FRAMING.scheduling} {TRANSPORT_FRAMING.shipping}
            </p>
          </div>
        </div>
      </section>

      {/* Process steps */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
          <h2 className="text-3xl md:text-4xl font-black text-[#1a1a2e] mb-10 max-w-2xl">
            Co se děje s tvým kolem.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                title: "Předání v ČR",
                body: "Domluvíme výdejní místo nebo vyzvednutí u tebe doma. Předáš kolo zabalené, nebo ho zabalíme za tebe.",
              },
              {
                step: "02",
                title: "Naložení do bloku",
                body: "Tvoje kolo jede pojištěné v zabezpečeném transportním boxu, sdíleně s dalšími koly stejného odjezdu.",
              },
              {
                step: "03",
                title: "Přeprava 5–8 dní",
                body: "Po naložení jde transport přímo do Malagy. Žádné překládání u cizího kurýra.",
              },
              {
                step: "04",
                title: "Příjem v Malaze",
                body: "Kolo je vyloženo, zkontrolováno a uloženo v naší základně. Připraveno na tebe.",
              },
            ].map((s) => (
              <div key={s.step}>
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black mb-4"
                  style={{ backgroundColor: `${accent}15`, color: accent }}
                >
                  {s.step}
                </div>
                <div className="text-lg font-black text-[#1a1a2e] mb-2">{s.title}</div>
                <div className="text-sm text-[#5A6480] leading-relaxed">{s.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Add-ons */}
      <section className="py-16 md:py-20 bg-[#FAFAFC]">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
          <h2 className="text-3xl md:text-4xl font-black text-[#1a1a2e] mb-10">
            Doplňky a příplatky
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl">
            {ADDONS.map((a) => (
              <div key={a.label} className="rounded-2xl p-6 bg-white border border-[#E2E6F3]">
                <div className="font-black text-[#1a1a2e] mb-1">{a.label}</div>
                <div className="text-sm font-bold mb-3" style={{ color: accent }}>
                  {a.priceFromEur > 0 ? `od ${a.priceFromEur} €` : a.unit}
                </div>
                {a.note && <p className="text-sm text-[#5A6480] leading-relaxed">{a.note}</p>}
              </div>
            ))}
          </div>
          <div className="mt-8 max-w-3xl text-sm text-[#5A6480] leading-relaxed">
            <span className="font-bold text-[#1a1a2e]">Skupiny: </span>
            {GROUP_NOTE}
          </div>
        </div>
      </section>

      {/* Pojištění cross-link */}
      <section className="py-8 bg-white">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
          <Link
            href="/pojisteni?zajem=cestovni"
            className="block rounded-2xl border border-[#FBC9A8] bg-[#FFF1EA] p-6 md:p-7 hover:border-[#E8431A] transition"
          >
            <div className="text-xs font-bold uppercase tracking-wider text-[#E8431A] mb-1">
              Pojištění na cestu
            </div>
            <div className="text-lg font-black text-[#1a1a2e]">
              Cestovní pojištění i pojištění kola — zajistíme →
            </div>
            <p className="text-sm text-[#5A6480] mt-1 leading-snug">
              Přeprava kola je pojištěná. Tvoje léčebné výlohy na cestě a samotné kolo proti krádeži
              a poškození řešíme zvlášť — přes našeho pojišťovacího partnera.
            </p>
          </Link>
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
                  Poptávka přepravy
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black leading-[0.95] mb-5">
                Domluvíme termín<br />a pošleme nabídku.
              </h2>
              <p className="text-white/70 text-lg leading-relaxed max-w-md">
                Stačí pár polí. Konkrétní cenu spočítáme podle termínu, počtu kol a způsobu předání.
              </p>
            </div>
            <MalagaLeadForm defaultIntent="transport" />
          </div>
        </div>
      </section>
      </main>
      <Footer />
    </>
  );
}
