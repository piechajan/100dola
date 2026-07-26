import Link from "next/link";

// Fakta o Czech Tour 2026 jsou ověřená z oficiálních zdrojů (czechtour.com).
// Šternberk/Valmez nejsou hostitelská města — napojení přes cílová stoupání
// (Dlouhé stráně / Pustevny), kam pořádáme vyjížďky. Termíny/trasy vyjížděk
// a rezervace kol SCOTT doplníme (viz /vyzkousej-scott).

const STAGES = [
  { n: "1", day: "Čt 13. 8.", route: "Praha → Karlovy Vary", km: "~163 km", vert: "~2 311 m" },
  { n: "2", day: "Pá 14. 8.", route: "Mladá Boleslav → Ještěd", km: "~156 km", vert: "~2 500 m" },
  { n: "3", day: "So 15. 8.", route: "Pardubice → Dlouhé stráně", km: "~171 km", vert: "~2 670 m", highlight: true },
  { n: "4", day: "Ne 16. 8.", route: "Kroměříž → Pustevny", km: "~160 km", vert: "~2 442 m", highlight: true },
];

export default function CzechTour2026() {
  return (
    <article className="max-w-[820px] mx-auto px-6 md:px-8 py-12 md:py-16">
      {/* Perex */}
      <p className="text-lg md:text-xl text-[#1a1a2e] leading-relaxed font-medium mb-8">
        Czech Tour (dřív Czech Cycling Tour) je etapový silniční závod kategorie{" "}
        <strong>UCI ProSeries</strong>. Ročník 2026 se jede <strong>13.–16. srpna</strong> ve
        čtyřech etapách napříč republikou a vrcholí dvěma horskými etapami přímo v našem regionu —
        v sobotu na <strong>Dlouhých stráních</strong> v Jeseníkách, v neděli na{" "}
        <strong>Pustevnách</strong> v Beskydech. A obě si je s tebou vyjedeme.
      </p>

      {/* Etapy tabulka */}
      <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-4">Etapy Czech Tour 2026</h2>
      <div className="rounded-2xl border border-[#E2E6F3] overflow-hidden mb-4">
        {STAGES.map((s) => (
          <div
            key={s.n}
            className={`flex items-center gap-4 px-4 md:px-5 py-3.5 border-b border-[#F0F2FA] last:border-0 ${
              s.highlight ? "bg-[#F7F9FF]" : "bg-white"
            }`}
          >
            <div className="w-7 h-7 rounded-full bg-[#1a1a2e] text-white text-xs font-black flex items-center justify-center shrink-0">
              {s.n}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-black text-[#1a1a2e]">
                {s.route} {s.highlight && <span className="text-[#3B7CF4]">· cíl do vrchu</span>}
              </div>
              <div className="text-xs text-[#9AA3C2]">{s.day}</div>
            </div>
            <div className="text-right text-xs text-[#5A6480] shrink-0">
              <div className="font-bold text-[#1a1a2e]">{s.km}</div>
              <div>{s.vert}</div>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-[#9AA3C2] mb-12">
        Kompletní harmonogram, čas dojezdů a startovní listinu najdeš na oficiálním webu{" "}
        <a href="https://www.czechtour.com/cs/etapy" target="_blank" rel="noopener noreferrer" className="text-[#3B7CF4] font-bold hover:underline">
          czechtour.com
        </a>
        .
      </p>

      {/* Sobota — Dlouhé stráně / Šternberk */}
      <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-3">
        Sobota 15. 8. — Dlouhé stráně (vyjížďka ze Šternberku)
      </h2>
      <p className="text-base text-[#5A6480] leading-relaxed mb-4">
        Třetí etapa (Pardubice → Dlouhé stráně) má <strong>nejvíc nastoupaných metrů z celého
        závodu</strong> a končí cílem do vrchu u přečerpávací elektrárny v Jeseníkách. Dlouhé stráně
        patří k nejtěžším českým stoupáním: <strong>~12,5 km</strong> souvislého kopce, převýšení{" "}
        <strong>~950 m</strong>, vrchol v <strong>1 350 m n. m.</strong> — dvakrát dějiště Závodu míru
        a metka každého silničáře z okolí.
      </p>
      <p className="text-base text-[#5A6480] leading-relaxed mb-10">
        My na něj vyrazíme s tebou. Sraz je u prodejny <strong>100dola sport</strong> ve Šternberku
        (Partyzánská 2) — nejdřív káva ve vedlejší kavárně Namístě, pak se jede. Kolo řešit nemusíš:
        silniční <strong>SCOTT ti na vyjížďku půjčíme zdarma</strong>.
      </p>

      {/* Neděle — Pustevny / Valmez */}
      <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-3">
        Neděle 16. 8. — Pustevny (vyjížďka z Valašského Meziříčí)
      </h2>
      <p className="text-base text-[#5A6480] leading-relaxed mb-4">
        Závěrečná, rozhodující etapa (Kroměříž → Pustevny) se láme až v horách — na vrchol pod
        Radhoštěm se stoupá <strong>dvakrát</strong>. Pustevny jsou ikonický beskydský cíl:{" "}
        <strong>~5,6 km</strong> stoupání, převýšení <strong>~410 m</strong>, vrchol v{" "}
        <strong>1 009 m n. m.</strong>, lesnatý a ve stínu — ideální na letní výšlap.
      </p>
      <p className="text-base text-[#5A6480] leading-relaxed mb-10">
        Vyjížďka Open Miles Clinic vyráží v neděli od kavárny <strong>Tucan</strong> na náměstí ve
        Valašském Meziříčí. Jede se pospolu — svižně, ale nikoho nenecháme vzadu. Dojíždí i lidé ze
        Vsetína, Nového Jičína nebo Olomouce. Zápůjčka silničního SCOTTu opět zdarma.
      </p>

      {/* CTA — testování + zápůjčka */}
      <div className="bg-[#1a1a2e] text-white rounded-2xl p-7 md:p-9 mb-10">
        <div className="text-xs font-bold uppercase tracking-[0.16em] text-white/60 mb-2">
          Vyjeď si to s námi
        </div>
        <h2 className="text-xl md:text-2xl font-black mb-3">
          Půjč si silniční SCOTT zdarma a přidej se na etapu
        </h2>
        <p className="text-sm md:text-base text-white/80 leading-relaxed mb-5">
          Na obě vyjížďky máme připravená silniční kola SCOTT (Addict, Foil). Vyber si model, termín
          a rezervuj — kolo si můžeš vyzkoušet i solo po domluvě, klidně i v týdnu před akcí.
        </p>
        <Link
          href="/vyzkousej-scott"
          className="inline-flex items-center px-6 py-3 rounded-full bg-white text-[#1a1a2e] text-sm font-black hover:opacity-90 transition-opacity"
        >
          Vyzkoušej SCOTT · termíny a rezervace →
        </Link>
      </div>

      {/* Kde sledovat */}
      <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-3">Kde sledovat dojezd</h2>
      <p className="text-base text-[#5A6480] leading-relaxed mb-4">
        Nejlepší atmosféra je v cíli obou horských etap — v sobotu na <strong>Dlouhých stráních</strong>,
        v neděli na <strong>Pustevnách</strong>. Přesné časy dojezdů zveřejní pořadatel před závodem;
        počítej s odpolednem. Když s námi pojedeš vyjížďku, dostaneš se do terénu závodu na vlastním
        (respektive zapůjčeném) kole ještě před peletonem.
      </p>
      <p className="text-sm text-[#9AA3C2] leading-relaxed">
        Termíny a trasy našich vyjížděk (vč. GPX ke stažení) doplníme a nasdílíme na{" "}
        <a href="https://www.instagram.com/100dolasport.cz/" target="_blank" rel="noopener noreferrer" className="text-[#3B7CF4] font-bold hover:underline">
          Instagramu
        </a>{" "}
        a na stránce{" "}
        <Link href="/vyzkousej-scott" className="text-[#3B7CF4] font-bold hover:underline">
          Vyzkoušej SCOTT
        </Link>
        .
      </p>
    </article>
  );
}
