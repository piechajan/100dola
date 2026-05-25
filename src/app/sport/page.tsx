import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SPORT_CATEGORIES, SPORT_BRAND } from "@/data/sport-categories";

export const metadata: Metadata = {
  title: "Sportovní obchod Šternberk — kola, běh, ski, skialpy",
  description:
    "100dola sport ve Šternberku (Partyzánská 2, vedle Namístě): silniční a gravel kola, horská kola, elektrokola, běžecké vybavení, lyže a skialpy. Servis kol, bikefit, testovací jízdy.",
  alternates: { canonical: "/sport" },
};

const accent = SPORT_BRAND.color;

const ACTIVITY = SPORT_CATEGORIES.filter((c) => c.group === "activity");
const CATEGORY = SPORT_CATEGORIES.filter((c) => c.group === "category");

export default function SportPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-[#0a1428] text-white" style={{ minHeight: "60vh" }}>
          <Image
            src="/media/sport-hero.jpg"
            alt="100dola sport"
            fill
            sizes="100vw"
            quality={80}
            priority
            className="object-cover opacity-55"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to right, rgba(10,20,40,0.92) 0%, rgba(10,20,40,0.6) 55%, rgba(10,20,40,0.15) 100%)",
            }}
          />
          <div
            className="relative max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20 flex flex-col justify-end pb-16 md:pb-24 pt-32 md:pt-40"
            style={{ minHeight: "60vh" }}
          >
            <div className="flex items-center gap-3 mb-5">
              <span className="w-8 h-px" style={{ backgroundColor: accent }} />
              <span className="text-xs tracking-[0.22em] uppercase font-bold" style={{ color: "#7EA8F8" }}>
                100dola sport
              </span>
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[0.95] max-w-3xl">
              Vybav se
              <br />
              <span style={{ color: "#7EA8F8" }}>na sezónu.</span>
            </h1>
            <p className="mt-6 text-lg text-white/70 max-w-xl leading-relaxed">
              Kola, oblečení, výživa a vybavení vybrané lidmi, kteří sport opravdu žijí.
              Žádný náhodný katalog — jen to, co sami testujeme nebo jezdíme.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-7 py-4 text-sm font-bold text-white rounded-full transition-all hover:opacity-90"
                style={{ backgroundColor: accent, boxShadow: `0 4px 24px ${accent}50` }}
              >
                Do shopu
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* Categories grid */}
        <section className="bg-white py-20 md:py-24">
          <div className="max-w-[1200px] mx-auto px-6 md:px-12 lg:px-20">

            <div className="mb-12 max-w-2xl">
              <div className="text-xs tracking-[0.22em] uppercase font-bold mb-3" style={{ color: accent }}>
                Podle sportu
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-[#1a1a2e] tracking-tight">
                Co tě baví, to taky řešíme.
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
              {ACTIVITY.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/sport/${cat.slug}`}
                  className="group block rounded-2xl border border-[#E2E6F3] bg-white p-6 hover:border-[#3B7CF4]/40 hover:shadow-lg transition-all"
                >
                  <div className="text-3xl mb-3">{cat.icon}</div>
                  <h3 className="text-lg font-black text-[#1a1a2e] mb-1.5 leading-tight">{cat.label}</h3>
                  <p className="text-xs text-[#5A6480] leading-relaxed">{cat.intro}</p>
                </Link>
              ))}
            </div>

            <div className="mb-12 max-w-2xl">
              <div className="text-xs tracking-[0.22em] uppercase font-bold mb-3" style={{ color: accent }}>
                Podle kategorie
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-[#1a1a2e] tracking-tight">
                Vybíráš podle typu produktu.
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {CATEGORY.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/sport/${cat.slug}`}
                  className="group flex flex-col items-center text-center rounded-2xl border border-[#E2E6F3] bg-white p-5 hover:border-[#3B7CF4]/40 hover:shadow-md transition-all"
                >
                  <div className="text-2xl mb-2">{cat.icon}</div>
                  <div className="text-sm font-bold text-[#1a1a2e]">{cat.label}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA to current shop */}
        <section className="bg-[#F0F4FF] py-16 md:py-20">
          <div className="max-w-[800px] mx-auto px-6 md:px-12 text-center">
            <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-4">
              Plné kategorie postupně doplňujeme.
            </h2>
            <p className="text-base text-[#5A6480] mb-8 leading-relaxed">
              Mezitím se podívej do shopu — vybrané produkty, které sami testujeme a doporučujeme.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-7 py-4 text-sm font-bold text-white rounded-full transition-all hover:opacity-90"
              style={{ backgroundColor: accent, boxShadow: `0 4px 24px ${accent}40` }}
            >
              Vybrané produkty v shopu
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
