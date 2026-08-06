import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import { breadcrumbSchema, faqPageSchema } from "@/lib/seo/schema-helpers";
import ScottTestForm from "@/components/scott/ScottTestForm";

const INSTAGRAM = "https://www.instagram.com/100dolasport.cz/";

export const metadata: Metadata = {
  title: { absolute: "Vyzkoušej SCOTT na Czech Tour 2026 — Dlouhé stráně a Pustevny | 100dola sport" },
  description:
    "Přidej se k nám o víkendu Czech Tour 2026 (15.–16. 8.) a půjč si silniční SCOTT zdarma. V sobotu vyjížďka od prodejny 100dola sport ve Šternberku na Dlouhé stráně, v neděli z Valašského Meziříčí na Pustevny. Zápůjčka kol SCOTT Addict a Foil.",
  keywords: [
    "vyzkoušej SCOTT",
    "zápůjčka silničního kola",
    "Czech Tour 2026",
    "Dlouhé stráně kolo",
    "Pustevny kolo",
    "SCOTT Addict RC",
    "SCOTT Foil RC",
    "testovací jízda SCOTT Šternberk",
    "cyklo vyjížďka Valašské Meziříčí",
    "100dola sport",
  ],
  alternates: { canonical: "/vyzkousej-scott" },
  openGraph: {
    title: "Vyzkoušej SCOTT na Czech Tour 2026 — Dlouhé stráně a Pustevny",
    description:
      "Půjč si silniční SCOTT zdarma a vyjeď si s námi kultovní stoupání Czech Tour 2026 — Dlouhé stráně (so 15. 8.) a Pustevny (ne 16. 8.).",
    url: "/vyzkousej-scott",
    type: "website",
    locale: "cs_CZ",
  },
};

// Dva víkendové výjezdy navázané na horské etapy Czech Tour 2026.
// Fakta o závodě jsou ověřená z oficiálních zdrojů (czechtour.com) — viz čísla níže.
// Přesné termíny zápůjček, rezervační stránku a Strava trasy doplní Jan.
const RIDES = [
  {
    key: "sternberk",
    day: "Sobota 15. 8. 2026",
    title: "Šternberk → Dlouhé stráně",
    start: "Sraz u prodejny 100dola sport (Partyzánská 2, Šternberk) — nejdřív káva ve vedlejší kavárně Namístě, pak se jede.",
    climb:
      "Dlouhé stráně jsou jedno z nejtěžších českých stoupání: ~12,5 km do kopce, převýšení ~950 m, vrchol u přečerpávací elektrárny v 1 350 m n. m. Ve stejný den sem finišuje horská etapa Czech Tour 2026 (Pardubice → Dlouhé stráně, nejvíc nastoupaných metrů celého závodu).",
    tag: "Silnice · náročné stoupání",
  },
  {
    key: "valmez",
    day: "Neděle 16. 8. 2026",
    title: "Valašské Meziříčí → Pustevny",
    start: "Sraz u kavárny Tucan na náměstí ve Valašském Meziříčí. Vyjížďka Open Miles Clinic — jede se pospolu, tempo si každý najde.",
    climb:
      "Pustevny jsou ikonický beskydský cíl pod Radhoštěm: ~5,6 km stoupání, převýšení ~410 m, vrchol v 1 009 m n. m. V neděli 16. 8. sem míří závěrečná, rozhodující etapa Czech Tour 2026 (Kroměříž → Pustevny), kde se na vrchol stoupá dvakrát.",
    tag: "Silnice · Open Miles Clinic",
  },
];

const FAQ = [
  {
    q: "Kolik stojí zapůjčení kola SCOTT na vyjížďku?",
    a: "Na společné vyjížďky o víkendu Czech Tour je zápůjčka silničního SCOTT zdarma. K dispozici jsou modely SCOTT Addict RC 10, Foil RC 10, Addict 20 (velikosti M–XL) a gravel Addict Gravel 20 (S–L). Počet kusů je omezený, rezervace spouštíme 1. 8.",
  },
  {
    q: "Můžu si kolo vyzkoušet i mimo vyjížďku?",
    a: "Ano. Po domluvě si můžeš SCOTT vyzkoušet i solo. Zápůjčky nabízíme i v týdnu před akcí — konkrétní termíny doplníme.",
  },
  {
    q: "Jak si kolo zarezervuju?",
    a: "Rezervační stránku spustíme přibližně týden před akcí. Do té doby nám napiš přes kontakt nebo Instagram a domluvíme se — počet kol je omezený, tak neváhej.",
  },
  {
    q: "Musím být zkušený cyklista?",
    a: "Na Dlouhé stráně i Pustevny je to pořádné stoupání, ale vyjížďky jsou přátelské — jede se pospolu a nikoho nenecháme vzadu. Tempo i trasu přizpůsobíme partě.",
  },
  {
    q: "Kde najdu trasu vyjížďky?",
    a: "Přesné trasy zveřejníme na Stravě (s možností stažení GPX) a před akcí je nasdílíme na Instagramu.",
  },
];

export default function VyzkousejScottPage() {
  const breadcrumb = breadcrumbSchema([
    { name: "100dola sport", url: "/" },
    { name: "Vyzkoušej SCOTT — Czech Tour 2026", url: "/vyzkousej-scott" },
  ]);
  const faq = faqPageSchema(FAQ.map((f) => ({ question: f.q, answer: f.a })));

  return (
    <>
      <JsonLd data={breadcrumb} />
      <JsonLd data={faq} />

      <Navbar />
      <main className="pt-20 bg-white">
        {/* Hero */}
        <section className="bg-gradient-to-b from-[#F7F9FF] to-white border-b border-[#E2E6F3]">
          <div className="max-w-[900px] mx-auto px-4 md:px-6 py-14 md:py-20">
            <nav className="text-xs text-[#9AA3C2] mb-4">
              <Link href="/" className="hover:text-[#3B7CF4]">
                100dola sport
              </Link>{" "}
              / <span className="text-[#5A6480]">Vyzkoušej SCOTT · Czech Tour 2026</span>
            </nav>
            <div className="inline-block text-xs font-bold uppercase tracking-[0.18em] text-[#3B7CF4] mb-3">
              Czech Tour 2026 · 15.–16. srpna
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-[#1a1a2e] leading-tight mb-5">
              Vyzkoušej SCOTT na kultovních stoupáních Czech Tour
            </h1>
            <p className="text-base md:text-lg text-[#5A6480] leading-relaxed max-w-[720px]">
              O víkendu 15.–16. srpna 2026 zavítá Czech Tour (dřív Czech Cycling Tour) na
              Dlouhé stráně a Pustevny. My si je vyjedeme s tebou — a silniční kolo SCOTT ti na
              vyjížďku <strong>půjčíme zdarma</strong>. Přijeď se svézt, poznat partu a zjistit,
              jak jede prémiové kolo, které od nás můžeš mít i doma.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="#rezervace"
                className="inline-flex items-center px-6 py-3 rounded-full bg-[#3B7CF4] text-white text-sm font-bold hover:opacity-90 transition-opacity"
              >
                Rezervovat kolo →
              </Link>
              <a
                href={INSTAGRAM}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 rounded-full border-2 border-[#E2E6F3] text-[#1a1a2e] text-sm font-bold hover:border-[#3B7CF4] transition-colors"
              >
                Napiš nám na Instagramu
              </a>
            </div>
          </div>
        </section>

        {/* Dvě vyjížďky */}
        <section className="max-w-[900px] mx-auto px-4 md:px-6 py-14">
          <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-2">Dva výjezdy, dvě legendární stoupání</h2>
          <p className="text-sm text-[#5A6480] mb-8 max-w-[720px]">
            Na obě vyjížďky dojíždí cyklisté ze širšího okolí — od Olomouce po Ostravu. Půjč si
            SCOTT a přidej se k jednomu, nebo rovnou k oběma.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {RIDES.map((r) => (
              <div key={r.key} className="bg-[#F7F9FF] border border-[#E2E6F3] rounded-2xl p-6">
                <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#3B7CF4] mb-2">{r.tag}</div>
                <div className="text-sm font-bold text-[#1a1a2e] mb-1">{r.day}</div>
                <h3 className="text-lg font-black text-[#1a1a2e] mb-3">{r.title}</h3>
                <p className="text-sm text-[#5A6480] leading-relaxed mb-3">{r.start}</p>
                <p className="text-sm text-[#5A6480] leading-relaxed">{r.climb}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Zápůjčka SCOTT */}
        <section className="max-w-[900px] mx-auto px-4 md:px-6 pb-6">
          <div className="bg-[#1a1a2e] text-white rounded-2xl p-7 md:p-9">
            <h2 className="text-xl md:text-2xl font-black mb-3">Silniční SCOTT na víkend zdarma</h2>
            <p className="text-sm md:text-base text-white/80 leading-relaxed mb-4">
              Máme připravená silniční kola <strong>SCOTT Addict RC 10</strong>,{" "}
              <strong>Foil RC 10</strong> a <strong>Addict 20</strong> (vel. M–XL) i gravel{" "}
              <strong>Addict Gravel 20</strong> (S–L). Zápůjčka na vyjížďku je zdarma, počet kol je
              omezený. Testovací jízdy jsou i v týdnu (Po–Pá 3.–7. 8. a Po–St 17.–19. 8., 9:00–16:00).
            </p>
            <p className="text-xs text-white/50 leading-relaxed mb-5">
              Rezervace spouštíme 1. srpna 2026 — do té doby si kola a termíny prohlédni níže. Od 1. 8.
              rovnou rezervuj konkrétní model, velikost a termín.
            </p>
            <Link
              href="#rezervace"
              className="inline-flex items-center px-5 py-2.5 rounded-full bg-white text-[#1a1a2e] text-sm font-bold hover:opacity-90 transition-opacity"
            >
              Vybrat kolo a termín →
            </Link>
          </div>
        </section>

        {/* Konfigurátor / poptávka zápůjčky */}
        <section id="rezervace" className="max-w-[900px] mx-auto px-4 md:px-6 py-12 scroll-mt-24">
          <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-2">Rezervuj si SCOTT na vyjížďku</h2>
          <p className="text-sm text-[#5A6480] mb-7 max-w-[640px]">
            Vyber kolo a termín, nech nám kontakt a my se ti ozveme s potvrzením. Nabídku modelů,
            velikosti a přesné časy ještě doladíme — počet kol je omezený.
          </p>
          <ScottTestForm />
        </section>

        {/* O závodě (SEO) */}
        <section className="max-w-[900px] mx-auto px-4 md:px-6 py-10">
          <h2 className="text-xl md:text-2xl font-black text-[#1a1a2e] mb-4">Czech Tour 2026 — co se jede</h2>
          <div className="space-y-4 text-sm md:text-base text-[#5A6480] leading-relaxed">
            <p>
              Czech Tour (dřív Czech Cycling Tour) je etapový silniční závod kategorie UCI ProSeries.
              Ročník 2026 se jede <strong>13.–16. srpna</strong> ve čtyřech etapách napříč republikou
              a vrcholí dvěma horskými etapami přímo v našem regionu.
            </p>
            <p>
              <strong>Sobota 15. 8.</strong> — 3. etapa cílí na <strong>Dlouhé stráně</strong> v
              Jeseníkách (~171 km, ~2 670 m převýšení, nejvíc z celého závodu). Samotné stoupání měří
              ~12,5 km s vrcholem u přečerpávací elektrárny v 1 350 m n. m.
            </p>
            <p>
              <strong>Neděle 16. 8.</strong> — závěrečná, rozhodující etapa míří z Kroměříže na{" "}
              <strong>Pustevny</strong> v Beskydech (~160 km, ~2 442 m), kde se na vrchol pod Radhoštěm
              stoupá dvakrát. Ideální kulisa pro nedělní vyjížďku z Valašského Meziříčí.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-[900px] mx-auto px-4 md:px-6 py-8 pb-16">
          <h2 className="text-xl md:text-2xl font-black text-[#1a1a2e] mb-5">Časté dotazy</h2>
          <div className="space-y-4">
            {FAQ.map((f) => (
              <div key={f.q} className="border-b border-[#E2E6F3] pb-4">
                <h3 className="text-base font-bold text-[#1a1a2e] mb-1.5">{f.q}</h3>
                <p className="text-sm text-[#5A6480] leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
