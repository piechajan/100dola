import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EbikeRangeCalculator from "@/components/tools/EbikeRangeCalculator";

export const metadata: Metadata = {
  title: { absolute: "Kalkulačka dojezdu elektrokola — odhad dojezdu e-kola | 100dola sport" },
  description:
    "Spočítej si přibližný dojezd elektrokola. Nastav kapacitu baterie, hmotnost jezdce, úroveň asistence a profil trasy (rovina / kopce) a zjisti orientační dojezd v km.",
  alternates: { canonical: "/kalkulacka-dojezdu-elektrokola" },
  keywords: [
    "kalkulačka dojezdu elektrokola",
    "dojezd elektrokola",
    "výpočet dojezdu e-kola",
    "kapacita baterie elektrokolo",
    "jak daleko ujede elektrokolo",
    "dojezd ebike",
  ],
  openGraph: {
    title: "Kalkulačka dojezdu elektrokola",
    description:
      "Nastav baterii, váhu, asistenci a terén — spočítej orientační dojezd elektrokola.",
  },
};

export default function EbikeRangeCalculatorPage() {
  return (
    <>
      <Navbar />
      <main className="bg-gradient-to-b from-[#F7F9FF] to-white min-h-screen">
        <section className="max-w-[900px] mx-auto px-4 md:px-6 pt-10 md:pt-16 pb-16">
          <div className="text-center mb-8 md:mb-10">
            <div className="text-xs tracking-[0.22em] uppercase font-bold text-[#3B7CF4] mb-3">
              Nástroj
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-[#1a1a2e] leading-tight">
              Kalkulačka dojezdu elektrokola
            </h1>
            <p className="mt-4 text-base text-[#5A6480] max-w-[620px] mx-auto leading-relaxed">
              Přehoď si baterii, hmotnost, úroveň asistence a profil trasy —
              a zjisti, jak daleko přibližně ujedeš. Rychlá orientace, než vybereš
              elektrokolo nebo naplánuješ výlet.
            </p>
          </div>

          <EbikeRangeCalculator />

          <div className="mt-10 grid sm:grid-cols-3 gap-4">
            {[
              ["Baterie", "Větší kapacita (Wh) = delší dojezd. Watthodiny najdeš v parametrech baterie."],
              ["Asistence & terén", "Vyšší asistence a kopce spotřebu výrazně zvednou — nejvíc ušetříš v nižších režimech na rovině."],
              ["Reálný svět", "Odhad je orientační. Chlad, protivítr, tlak v pláštích a styl jízdy dojezd dál mění."],
            ].map(([h, t]) => (
              <div key={h} className="rounded-2xl border border-[#E2E6F3] bg-white p-5">
                <div className="text-sm font-black text-[#1a1a2e] mb-1">{h}</div>
                <p className="text-xs text-[#5A6480] leading-relaxed">{t}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-2xl bg-[#1a1a2e] text-white p-6 md:p-8 text-center">
            <h2 className="text-xl md:text-2xl font-black mb-2">
              Vybíráš elektrokolo nebo řešíš dojezd?
            </h2>
            <p className="text-sm text-white/70 max-w-[520px] mx-auto mb-5">
              Poradíme s výběrem podle toho, jak a kde jezdíš — osobně ve Šternberku
              i na dálku. Napiš nám a doporučíme konkrétní model a baterii.
            </p>
            <Link
              href="/kontakt"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-white text-[#1a1a2e] text-sm font-black hover:opacity-90 transition"
            >
              Poradit s výběrem
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
