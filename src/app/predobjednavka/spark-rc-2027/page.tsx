import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import PreorderForm from "@/components/preorders/PreorderForm";
import PreorderCounter from "@/components/preorders/PreorderCounter";

const MODEL_SLUG = "scott-spark-rc-2027";
const MODEL_LABEL = "Scott Spark RC 2027";

export const metadata: Metadata = {
  title: "Předobjednávka Scott Spark RC 2027 · 100dola sport",
  description:
    "Předobjednejte si nový Scott Spark RC 2027 přes 100dola sport ve Šternberku. Osobní servis, výběr velikosti a varianty, termín dodání domluvíme spolu — osobně, jako v kamenné prodejně.",
  alternates: { canonical: `https://www.100dola.com/predobjednavka/${MODEL_SLUG}` },
  openGraph: {
    title: "Předobjednávka Scott Spark RC 2027 · 100dola sport",
    description:
      "Nová generace závodního XC. Předobjednávka přes 100dola sport — kamenná prodejna ve Šternberku a osobní přístup.",
    url: `https://www.100dola.com/predobjednavka/${MODEL_SLUG}`,
    images: [
      {
        url: "https://www.100dola.com/media/articles/scott-spark-rc-2027-hero.webp",
        width: 1200,
        height: 800,
      },
    ],
  },
  keywords: [
    "Scott Spark RC 2027",
    "Spark RC předobjednávka",
    "nový Scott Spark RC",
    "Scott XC kolo 2027",
    "závodní XC kolo Šternberk",
    "Scott Spark RC cena",
    "100dola sport",
  ],
};

const SITE = "https://www.100dola.com";

export default function SparkRCPreorderPage() {
  // Pozn.: Záměrně NEemitujeme Product JSON-LD — je to předobjednávka bez pevné
  // ceny (domlouvá se osobně). Product bez price/offers/review je pro Google vždy
  // neplatný (GSC „Chybí pole price" / „nutné offers/review/aggregateRating").
  // Necháváme jen breadcrumb; stránka rankuje přes obsah + meta.
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Domů", item: SITE },
      { "@type": "ListItem", position: 2, name: "Magazín", item: `${SITE}/clanky` },
      {
        "@type": "ListItem",
        position: 3,
        name: "Scott Spark RC 2027",
        item: `${SITE}/clanky/scott-spark-rc-2027`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: "Předobjednávka",
        item: `${SITE}/predobjednavka/${MODEL_SLUG}`,
      },
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <Navbar />
      <main className="pt-20 bg-[#F7F9FF] min-h-screen pb-20">
        {/* Hero */}
        <section className="relative isolate overflow-hidden bg-white border-b border-[#E2E6F3]">
          <div className="absolute inset-0 -z-10">
            <Image
              src="/media/articles/scott-spark-rc-2027-hero.webp"
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-white/30" />
            <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-white/10 md:hidden" />
          </div>

          <div className="max-w-[1100px] mx-auto px-6 md:px-12 py-12 md:py-20 relative">
            <div className="text-xs tracking-[0.22em] uppercase font-bold text-[#3B7CF4] mb-2">
              Předobjednávka · 100dola sport
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-[#1a1a2e] leading-tight mb-4">
              Scott Spark RC 2027.
              <br />
              <span className="text-[#3B7CF4]">Buď první.</span>
            </h1>
            <p className="text-base md:text-lg text-[#1a1a2e] max-w-2xl leading-relaxed">
              Nech nám kontakt a my se Ti{" "}
              <strong>osobně ozveme z týmu 100dola sport</strong>. Projdeme spolu modelovou
              řadu, dostupné varianty, velikost a termín dodání. Osobně, jako když k nám přijdeš do prodejny.
            </p>
            <div className="mt-5">
              <PreorderCounter modelSlug={MODEL_SLUG} className="bg-white/85 backdrop-blur px-3 py-1.5 rounded-full border border-[#E2E6F3]" />
            </div>
            <div className="mt-6 flex flex-wrap gap-3 text-xs">
              <span className="bg-white/85 backdrop-blur px-3 py-1.5 rounded-full border border-[#E2E6F3] font-semibold text-[#1a1a2e]">
                🚲 Karbon HMX-SL · rám 1 427 g
              </span>
              <span className="bg-white/85 backdrop-blur px-3 py-1.5 rounded-full border border-[#E2E6F3] font-semibold text-[#1a1a2e]">
                🛠️ Save-the-Day úložiště
              </span>
              <span className="bg-white/85 backdrop-blur px-3 py-1.5 rounded-full border border-[#E2E6F3] font-semibold text-[#1a1a2e]">
                ⚙️ Sedlovka až 200 mm
              </span>
              <span className="bg-white/85 backdrop-blur px-3 py-1.5 rounded-full border border-[#E2E6F3] font-semibold text-[#1a1a2e]">
                🎯 8 modelů · více barev
              </span>
            </div>
          </div>
        </section>

        {/* Form */}
        <section className="max-w-[820px] mx-auto px-6 md:px-12 pt-10">
          <div className="bg-white rounded-3xl border border-[#E2E6F3] shadow-sm p-6 md:p-10">
            <h2 className="text-xl md:text-2xl font-black text-[#1a1a2e] mb-2">
              Předobjednávka Scott Spark RC 2027
            </h2>
            <p className="text-sm text-[#5A6480] mb-6 leading-relaxed">
              Po odeslání Ti zavoláme nebo napíšeme. Probereme spolu konkrétní variantu,
              velikost rámu, termín dodání a další podrobnosti. Předobjednávka
              Tě k ničemu zatím nezavazuje.
            </p>
            <PreorderForm modelSlug={MODEL_SLUG} modelLabel={MODEL_LABEL} />
          </div>

          <div className="mt-8 bg-[#FFF1EA] border border-[#FBC9A8] rounded-2xl p-5 text-sm text-[#9B3D17] leading-relaxed">
            <strong className="text-[#1a1a2e]">Termín dodání:</strong> první dodávky
            už září 2026. Přesný termín pro Tvoji konkrétní variantu potvrdíme
            po obdržení předobjednávky a po sladění s dodavatelem.
          </div>

          <div className="mt-8 text-sm text-[#5A6480] leading-relaxed text-center">
            Chceš nejdřív víc info?{" "}
            <Link
              href="/clanky/scott-spark-rc-2027"
              className="font-bold text-[#3B7CF4] underline hover:no-underline"
            >
              Detailní článek o platformě Spark RC 2027 →
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
