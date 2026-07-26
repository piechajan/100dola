import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SPORT_CATEGORIES, SPORT_BRAND, getSportCategory } from "@/data/sport-categories";

const accent = SPORT_BRAND.color;

export function generateStaticParams() {
  return SPORT_CATEGORIES.map((c) => ({ slug: c.slug }));
}

// SEO-optimalizované title pro každý sport pillar (location-first)
const SEO_TITLES: Record<string, { title: string; description: string }> = {
  cyklistika: {
    title: "Cyklistický obchod Šternberk — silniční, gravel, MTB, elektrokola",
    description:
      "Kola SCOTT, ISAAC, Lapierre, Ridley, Pinarello, Ghost a NORCO ve Šternberku. Silniční, gravel, horská a elektrokola. Servis kol, bikefit, testovací jízdy. Partyzánská 2.",
  },
  beh: {
    title: "Běžecký obchod Šternberk — boty, oblečení, CEP, kompresní vybavení",
    description:
      "Běžecké boty, oblečení, výživa a kompresní vybavení CEP ve Šternberku. Konzultace běžeckého vybavení, ověřené značky pro silnici i trail.",
  },
  zima: {
    title: "Lyže & skialpy Šternberk — Dynastar, skialpové vybavení",
    description:
      "Lyže Dynastar, skialpy, běžky a backcountry vybavení ve Šternberku. Sezónní servis lyží, konzultace skialpového vybavení.",
  },
  turistika: {
    title: "Turistika & trek Šternberk — backpack vybavení, via ferraty",
    description:
      "Vybavení na jednodenní túry, via ferraty i vícedenní treky. Krosny, hole, oblečení do hor — 100dola sport Šternberk, Partyzánská 2.",
  },
  obleceni: {
    title: "Cyklistické oblečení Šternberk — Q36.5, dresy, kalhoty, vesty",
    description:
      "Cyklistické dresy Q36.5, kalhoty, vesty a větrovky ve Šternberku. Oblečení, které funguje na dlouhých kilometrech.",
  },
  obuv: {
    title: "Cyklotretry & běžecké boty Šternberk",
    description:
      "Tretry, běžecké boty a treková obuv ve Šternberku. Konzultace velikostí, ověřené značky pro každou aktivitu.",
  },
  helmy: {
    title: "Cyklistické helmy Šternberk — aero, MTB, gravel",
    description:
      "Aero, MTB i klasické cyklistické helmy ve Šternberku. Bezpečnost a komfort pro každý styl jízdy.",
  },
  vyziva: {
    title: "Sportovní výživa Šternberk — Sponser, gely, isotonické nápoje",
    description:
      "Sportovní výživa Sponser, gely, tyčinky a izotonické nápoje ve Šternberku. Ověřené na dlouhých výjezdech.",
  },
  vybaveni: {
    title: "Cyklo vybavení & doplňky Šternberk — bidony, brašničky, GPS držáky",
    description:
      "Bidony, brašničky, GPS držáky, taštičky pod sedlo a další cyklo doplňky ve Šternberku.",
  },
  elektronika: {
    title: "Cyklocomputery & světla Šternberk — Magicshine, GPS, senzory",
    description:
      "GPS cyklocomputery, světla Magicshine a senzory ve Šternberku. Chytré vybavení pro chytrou jízdu.",
  },
  kolekce: {
    title: "Jarní cyklistická kolekce 2026 — Šternberk",
    description:
      "Road & Gravel kolekce 2026 ve Šternberku — výběr na novou sezónu od Q36.5, ISAAC, SCOTT a dalších.",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cat = getSportCategory(slug);
  if (!cat) return {};
  const seo = SEO_TITLES[slug];
  return {
    title: seo?.title ?? `${cat.label} Šternberk — 100dola sport`,
    description: seo?.description ?? cat.intro,
    alternates: { canonical: `/sport/${cat.slug}` },
  };
}

export default async function SportCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cat = getSportCategory(slug);
  if (!cat) notFound();

  return (
    <>
      <Navbar />
      <main className="pt-20 bg-[#FAFAFA] min-h-screen">

        {/* Breadcrumb */}
        <div className="max-w-[1200px] mx-auto px-6 md:px-12 lg:px-20 pt-8">
          <div className="flex items-center gap-2 text-xs text-[#9AA3C2]">
            <Link href="/sport" className="hover:text-[#3B7CF4] transition-colors">100dola sport</Link>
            <span>/</span>
            <span className="text-[#5A6480]">{cat.label}</span>
          </div>
        </div>

        {/* Hero */}
        <section className="max-w-[1200px] mx-auto px-6 md:px-12 lg:px-20 pt-12 pb-20">
          <div className="flex items-start gap-5 mb-8">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0"
              style={{ backgroundColor: `${accent}15` }}
            >
              {cat.icon}
            </div>
            <div className="flex-1">
              <div className="text-xs tracking-[0.22em] uppercase font-bold mb-2" style={{ color: accent }}>
                {cat.group === "activity" ? "Podle sportu" : cat.group === "category" ? "Podle kategorie" : "Speciální kolekce"}
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-[#1a1a2e] tracking-tight leading-[1.05]">
                {cat.label}
              </h1>
            </div>
          </div>

          <p className="text-lg text-[#5A6480] leading-relaxed max-w-2xl mb-12">
            {cat.intro}
          </p>

          {/* Coming soon card */}
          <div className="bg-white rounded-3xl border border-[#E2E6F3] p-8 md:p-10 max-w-3xl">
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${accent}15` }}
              >
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={accent} strokeWidth={2.5}>
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </div>
              <div className="text-xs tracking-[0.18em] uppercase font-bold" style={{ color: accent }}>
                Připravujeme
              </div>
            </div>

            <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-4 leading-tight">
              Tahle kategorie se právě rodí.
            </h2>
            <p className="text-base text-[#5A6480] leading-relaxed mb-8">
              {cat.whatComing}
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-bold text-white rounded-full transition-all hover:opacity-90"
                style={{ backgroundColor: accent, boxShadow: `0 4px 16px ${accent}40` }}
              >
                Mezitím do shopu
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/sport"
                className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-bold rounded-full border border-[#E2E6F3] text-[#1a1a2e] hover:border-[#3B7CF4] hover:text-[#3B7CF4] transition-all"
              >
                Všechny kategorie
              </Link>
            </div>
          </div>

          {/* Notify me about this category */}
          <div className="mt-10 max-w-3xl text-sm text-[#9AA3C2] leading-relaxed">
            Chceš dát vědět, jakmile bude {cat.label.toLowerCase()} hotová?{" "}
            <Link href="/community#newsletter" className="font-bold hover:underline" style={{ color: accent }}>
              Přihlas se k newsletteru
            </Link>
            {" "}— pošleme update jen jednou, jakmile to bude live.
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
