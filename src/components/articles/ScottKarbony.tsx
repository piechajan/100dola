import Link from "next/link";

/**
 * SEO článek „Karbon SCOTT: HMF vs HMX vs HMX-SL" — target keywords:
 *   - "SCOTT karbon HMF HMX"
 *   - "rozdíl HMF a HMX"
 *   - "HMX-SL karbon"
 *   - "jaký karbon má SCOTT"
 *   - "SCOTT rám karbon rozdíl / hmotnost"
 *
 * Pozicování: edukativní + prodejní. Vysvětlí grády karbonu a prokliká na
 * konkrétní modely v našem e-shopu, které daný karbon mají.
 */

function ModelLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-[#3B7CF4] font-bold hover:underline">
      {children}
    </Link>
  );
}

export default function ScottKarbony() {
  return (
    <article className="bg-white">
      <div className="max-w-[820px] mx-auto px-6 md:px-12 py-12 md:py-16">
        {/* Lead */}
        <p className="text-lg text-[#5A6480] leading-relaxed mb-10">
          U karbonových rámů SCOTT narazíš na označení <strong>HMF</strong>,{" "}
          <strong>HMX</strong> a u nejvyšších modelů <strong>HMX-SL</strong>.
          Nejde o marketing — jsou to různé třídy karbonu, které se liší hlavně{" "}
          <strong>hmotností a cenou</strong>, zatímco tuhost a pevnost zůstávají
          srovnatelné. Tady je jasně, co znamenají a pro koho dává který smysl —
          i s konkrétními modely, které u nás daný karbon mají.
        </p>

        {/* V kostce */}
        <div className="bg-[#F0F4FF] border border-[#C4D2F0] rounded-2xl p-6 mb-12">
          <div className="text-[10px] uppercase tracking-wider font-bold text-[#3B7CF4] mb-3">
            V kostce
          </div>
          <ul className="space-y-2 text-sm text-[#1a1a2e]">
            <li>
              🧬 <strong>Pořadí od základního k top:</strong> HMF → HMX → HMX-SL
            </li>
            <li>
              ⚖️ <strong>Hlavní rozdíl:</strong> hmotnost a cena — tuhost a
              pevnost zůstávají srovnatelné
            </li>
            <li>
              🪶 <strong>HMX vs HMF:</strong> vyšší modul vláken → méně materiálu
              na stejnou tuhost → rám lehčí typicky o cca 100–200 g
            </li>
            <li>
              🏆 <strong>HMX-SL:</strong> nejlehčí a nejdražší karbon, jen u
              nejvyšších řad a top modelů
            </li>
            <li>
              🎯 <strong>Pro koho:</strong> pro běžné ježdění je rozdíl HMF vs HMX
              v jízdě málo znatelný — nejvíc ho ocení závodníci, kterým jde o
              každý gram
            </li>
          </ul>
        </div>

        {/* HMF */}
        <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-4">
          HMF — základní vysoce modulový karbon
        </h2>
        <p className="text-base text-[#5A6480] leading-relaxed mb-4">
          HMF (High Modulus Fiber) je vysoce modulový karbon, který SCOTT používá
          u dražších modelů. Je pevný a tuhý, jen o něco těžší než vyšší třídy.
          Pro naprostou většinu jezdců je to naprosto dostačující rám — dostaneš
          plné jízdní vlastnosti karbonu za rozumnější cenu.
        </p>
        <p className="text-sm text-[#5A6480] leading-relaxed mb-3">
          <strong className="text-[#1a1a2e]">Modely s karbonem HMF u nás:</strong>
        </p>
        <ul className="space-y-1.5 text-sm text-[#5A6480] mb-10 list-disc pl-5">
          <li>
            <ModelLink href="/shop/scott-addict-40-2026">Scott Addict 40</ModelLink>{" "}
            — endurance silniční kolo, Shimano 105 Di2
          </li>
          <li>
            <ModelLink href="/shop/scott-addict-50-2026">Scott Addict 50</ModelLink>{" "}
            — dostupné karbonové endurance kolo
          </li>
          <li>
            <ModelLink href="/shop/scott-addict-gravel-30-2026">
              Scott Addict Gravel 30
            </ModelLink>{" "}
            — univerzální gravel stroj, GRX 1×12
          </li>
          <li>
            <ModelLink href="/shop/scott-spark-rc-team-issue-2026">
              Scott Spark RC Team Issue
            </ModelLink>{" "}
            — závodní celoodpružené XC s World Cup DNA
          </li>
        </ul>

        {/* HMX */}
        <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-4">
          HMX — lehčí karbon při stejné tuhosti
        </h2>
        <p className="text-base text-[#5A6480] leading-relaxed mb-4">
          HMX používá vlákna s vyšším modulem pružnosti. Díky tomu potřebuje na
          dosažení stejné tuhosti a pevnosti méně materiálu, takže výsledný rám je{" "}
          <strong>lehčí — typicky o cca 100–200 g podle modelu</strong> — při
          zachování stejných jízdních vlastností. Je to dražší varianta, kterou
          ocení hlavně výkonnostní a závodní jezdci.
        </p>
        <p className="text-sm text-[#5A6480] leading-relaxed mb-3">
          <strong className="text-[#1a1a2e]">Modely s karbonem HMX u nás:</strong>
        </p>
        <ul className="space-y-1.5 text-sm text-[#5A6480] mb-10 list-disc pl-5">
          <li>
            <ModelLink href="/shop/scott-scale-rc-team-2026">
              Scott Scale RC Team
            </ModelLink>{" "}
            — závodní XC hardtail, rám Scale HMX, ~11,2 kg
          </li>
          <li>
            <ModelLink href="/shop/scott-scale-rc-world-cup-2026">
              Scott Scale RC World Cup
            </ModelLink>{" "}
            — vrcholný XC hardtail, karbon HMX, ~9,6 kg
          </li>
        </ul>

        {/* HMX-SL */}
        <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-4">
          HMX-SL — nejlehčí a nejdražší
        </h2>
        <p className="text-base text-[#5A6480] leading-relaxed mb-10">
          Nad HMX je ještě <strong>HMX-SL (super light)</strong> — nejlehčí a
          nejdražší karbon, který najdeš u top modelů a nejvyšších řad. Rozdíl
          oproti HMX je opět hlavně v hmotnosti a ceně; jízdní vlastnosti,
          tuhost a pevnost zůstávají na špičkové úrovni. Je to volba pro ty, kdo
          honí každý gram na váze a nejvyšší možnou úroveň výbavy.
        </p>

        {/* Který zvolit */}
        <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-4">
          Který karbon zvolit?
        </h2>
        <p className="text-base text-[#5A6480] leading-relaxed mb-4">
          Zjednodušeně: pořadí od základního k top je{" "}
          <strong>HMF → HMX → HMX-SL</strong>, přičemž hlavní rozdíl je hmotnost
          a cena — tuhost a pevnost zůstávají srovnatelné. Pro běžné ježdění je
          rozdíl mezi HMF a HMX v jízdě málo znatelný; nejvíc ho ocení
          závodníci, kterým jde o každý gram. Jestli řešíš spíš komfort, dojezd
          a poměr cena/výkon, HMF ti dá radost bez přeplácení. Když jedeš na
          výsledek a hmotnost je priorita, dává smysl připlatit za HMX, případně
          HMX-SL u top modelů.
        </p>

        {/* CTA */}
        <div className="bg-[#1a1a2e] text-white rounded-2xl p-6 md:p-8 mt-10 text-center">
          <h3 className="text-xl md:text-2xl font-black mb-2">
            Nevíš, který rám ti sedne?
          </h3>
          <p className="text-sm text-white/70 max-w-[540px] mx-auto mb-5">
            Poradíme podle toho, jak a kde jezdíš — osobně ve Šternberku i na
            dálku. Doporučíme konkrétní model a řekneme rovnou, jestli se ti u
            tvého ježdění vyplatí připlatit za lehčí karbon.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-white text-[#1a1a2e] text-sm font-black hover:opacity-90 transition"
            >
              Prohlédnout kola
            </Link>
            <Link
              href="/kontakt"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-white/30 text-white text-sm font-black hover:bg-white/10 transition"
            >
              Poradit s výběrem
            </Link>
          </div>
        </div>

        <p className="text-xs text-[#9AA3C2] mt-8">
          Zdroj: SCOTT Sports (oficiální popis rozdílu rámů HMF a HMX). Uvedené
          hmotnostní rozdíly jsou orientační a liší se podle konkrétního modelu.
        </p>
      </div>
    </article>
  );
}
