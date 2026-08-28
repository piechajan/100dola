import Link from "next/link";

/**
 * SEO článek "Doprava kola do Malagy: jak to funguje krok za krokem".
 * Target keywords:
 *   - "doprava kola do malagy" / "doprava kola do španělska"
 *   - "100dola malaga doprava"
 *   - "jak dopravit kolo do španělska"
 *   - "vlastní kolo malaga"
 *   - "cyklistika malaga zima"
 *
 * Goal: explain Janovy core service (Malaga transport) krok za krokem,
 * snížit objection (cost / risk / hassle), vést k lead form.
 */
export default function DopravaKolaMalaga() {
  return (
    <article className="bg-white">
      <div className="max-w-[820px] mx-auto px-6 md:px-12 py-12 md:py-16">
        <p className="text-lg text-[#5A6480] leading-relaxed mb-10">
          <strong>Doprava kola do Malagy</strong> přes 100dola není „posílání balíku" — je to
          služba postavená na třech principech: jednou ho dovezeme, on tam <em>zůstane</em>, a vy
          tam létáte jen s ručním zavazadlem. Tento článek vysvětluje krok po kroku, jak to
          funguje, kolik to stojí, kdy se to vyplatí a co dělat když&nbsp;něco potřebujete řešit
          přímo z Malagy.
        </p>

        {/* Quick summary */}
        <div className="bg-[#FFF1EA] border border-[#FBC9A8] rounded-2xl p-6 mb-12">
          <div className="text-xs font-bold uppercase tracking-wider text-[#E8431A] mb-2">
            Krátká verze
          </div>
          <ul className="space-y-1.5 text-sm text-[#1a1a2e]">
            <li>• <strong>Sběr</strong> — kolo si vyzvedneme nebo ho přivezete na sběrné místo (Šternberk / Olomouc / Valašské Meziříčí / Praha přes partnera).</li>
            <li>• <strong>Transport</strong> — fyzicky dopravujeme v ucelených dodávkách, ne kurýrem. Typicky 5-8 dní podle bloku odjezdu.</li>
            <li>• <strong>Sklad v Malaze</strong> — kolo má svůj prostor, schované, monitorované, připravené.</li>
            <li>• <strong>Vy pak létáte light</strong> — ruční zavazadlo s helmou a tretrami, kolo na vás čeká.</li>
            <li>• <strong>Cena</strong> — od 150 € jednosměrně, round-trip od 250 €. Sklad od 69 €/měsíc.</li>
          </ul>
          <div className="mt-4 pt-4 border-t border-[#FBC9A8]">
            <Link
              href="/malaga#poptat"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#E8431A] text-white text-sm font-bold hover:opacity-90 transition-opacity"
            >
              Poptat dopravu →
            </Link>
          </div>
        </div>

        {/* TOC */}
        <h2 className="text-2xl font-black text-[#1a1a2e] mt-12 mb-4">Obsah</h2>
        <ol className="space-y-1.5 text-sm text-[#5A6480] mb-12 ml-5 list-decimal">
          <li><a href="#proc" className="text-[#3B7CF4] hover:underline">Proč nedávat kolo letecky pokaždé znova</a></li>
          <li><a href="#proces" className="text-[#3B7CF4] hover:underline">Jak proces vypadá krok po kroku</a></li>
          <li><a href="#balicky" className="text-[#3B7CF4] hover:underline">One-way vs round-trip: co je v ceně</a></li>
          <li><a href="#cena" className="text-[#3B7CF4] hover:underline">Kolik to stojí (a kdy se to vyplatí)</a></li>
          <li><a href="#sklad" className="text-[#3B7CF4] hover:underline">Co dělá sklad v Malaze jiným</a></li>
          <li><a href="#pojisteni" className="text-[#3B7CF4] hover:underline">Pojištění, riziko, co když se něco pokazí</a></li>
          <li><a href="#faq" className="text-[#3B7CF4] hover:underline">Časté otázky</a></li>
        </ol>

        {/* Section 1 — Why */}
        <h2 id="proc" className="text-2xl md:text-3xl font-black text-[#1a1a2e] mt-16 mb-4">
          Proč nedávat kolo letecky pokaždé znova
        </h2>
        <p className="text-base text-[#5A6480] leading-relaxed mb-5">
          Když se cyklista rozhoduje, jak vzít kolo do Andalusie, má v podstatě tři možnosti.
          Nikdy ne jednoduchá volba — všechny tři něco stojí. Pojďme realisticky:
        </p>
        <div className="overflow-x-auto -mx-6 md:mx-0 mb-8">
          <table className="w-full text-sm">
            <thead className="text-[10px] uppercase tracking-wider text-[#9AA3C2] font-bold border-b border-[#E2E6F3]">
              <tr>
                <th className="text-left p-3">Varianta</th>
                <th className="text-left p-3">Náklad / cesta</th>
                <th className="text-left p-3">Čas / hassle</th>
                <th className="text-left p-3">Riziko</th>
              </tr>
            </thead>
            <tbody className="text-[#1a1a2e]">
              <tr className="border-b border-[#F0F2FA]">
                <td className="p-3 font-bold">Letecky s kolem</td>
                <td className="p-3">poplatek za kolo 75 € jednosměrně + box (~300 € jednou)</td>
                <td className="p-3">2 h balení / rozbalení každou cestu</td>
                <td className="p-3">Vyšší — handlers se nezajímají, vidlice / disk často poškozené</td>
              </tr>
              <tr className="border-b border-[#F0F2FA]">
                <td className="p-3 font-bold">Půjčovna v Malaze</td>
                <td className="p-3">200–400 €/týden</td>
                <td className="p-3">Žádné balení; ale ne tvoje geometrie</td>
                <td className="p-3">Riziko spíš v komfortu — neumíš to kolo, fit nesedí</td>
              </tr>
              <tr className="bg-[#FFF1EA]">
                <td className="p-3 font-bold">100dola transport + sklad</td>
                <td className="p-3">Jednou dovoz od 150 € + 69 €/měsíc sklad</td>
                <td className="p-3">Nulový — kolo už tam je</td>
                <td className="p-3">Nízké — víme co děláme, monitor, pojištěno</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-base text-[#5A6480] leading-relaxed mb-5">
          Skutečný break-even je <strong>dvě cesty za sezónu</strong>. Pokud jedeš jen jednou
          v životě, půjčovna nebo letecky je v pořádku. Pokud jezdíš v zimě pravidelně (cyklistický
          přípravný kemp, několik víkendů, listopad–březen), <strong>vlastní kolo skladované
          v Malaze</strong> šetří peníze i nervy.
        </p>

        {/* Section 2 — Process */}
        <h2 id="proces" className="text-2xl md:text-3xl font-black text-[#1a1a2e] mt-16 mb-4">
          Jak proces vypadá krok po kroku
        </h2>

        <div className="space-y-6 mb-8">
          {[
            {
              n: "1",
              title: "Domluvíme se",
              body: "Poptáš dopravu přes náš online formulář nebo zavoláš (+420 739 045 057). Probereme termín, model kola, kde tě vyzvedneme, jestli one-way nebo round-trip. Většinou do 24 h.",
            },
            {
              n: "2",
              title: "Sběr",
              body: "Kolo si vyzvedneme nebo ho přivezeš na jedno ze sběrných míst (Šternberk — naše prodejna Partyzánská 2, Olomouc, Valašské Meziříčí, Praha přes partnera). Předáš kolo včetně případného příslušenství (pedály, sedlo, batoh).",
            },
            {
              n: "3",
              title: "Příprava a transport",
              body: "Připravíme kolo na cestu — kolo naložíme, nebo ho po domluvě rozebereme a zabalíme do našeho transportního boxu. Fyzicky vezeme dodávkou (ne kurýr) přes Německo a Francii do Malagy. 5–8 dní podle bloku odjezdu.",
            },
            {
              n: "4",
              title: "Uložení v Malaze",
              body: "Kolo dorazí do našeho skladu (vnitřní prostor, monitorovaný, suchý, kontrola teploty). Dostane svůj věšák, popisek, fotografii ve stavu při příjezdu. Posíláme ti potvrzení s fotkou.",
            },
            {
              n: "5",
              title: "Tvůj let",
              body: "Letíš s ručním zavazadlem. Helma, tretry, dres, kraťasy, nabíječka na Garmin. Dotud podstatně levnější letenky než s kolem.",
            },
            {
              n: "6",
              title: "Vyzvednutí v Malaze",
              body: "Z letiště přijdeš/přijedeš ke skladu (10 min od letiště Málaga, AGP), my máme kolo pumpu, lehký servis, mazání, kontrolu, kafe. Vyjedeš do hor.",
            },
            {
              n: "7",
              title: "Po sezóně",
              body: "Buď kolo zůstává až do další cesty (sklad běží od 69 €/měsíc), nebo ho stejnou cestou vezeme zpátky.",
            },
          ].map((step) => (
            <div key={step.n} className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-[#E8431A] text-white font-black text-sm flex items-center justify-center shrink-0">
                {step.n}
              </div>
              <div>
                <h3 className="text-base font-black text-[#1a1a2e] mb-1">{step.title}</h3>
                <p className="text-sm text-[#5A6480] leading-relaxed">{step.body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Section 3 — Packages */}
        <h2 id="balicky" className="text-2xl md:text-3xl font-black text-[#1a1a2e] mt-16 mb-4">
          One-way vs round-trip: co je v ceně
        </h2>
        <p className="text-base text-[#5A6480] leading-relaxed mb-6">
          Rozdíl je primárně v míře práce, kterou děláme my, a v komfortu, který dostáváš.
          Oba balíčky končí stejně — tvoje kolo bezpečně v Malaze. Cesta tam je jiná.
        </p>
        <div className="grid md:grid-cols-2 gap-4 mb-10">
          <div className="bg-white border-2 border-[#E2E6F3] rounded-2xl p-6">
            <div className="text-xs font-bold uppercase tracking-wider text-[#9AA3C2] mb-2">
              Doprava one-way
            </div>
            <div className="text-3xl font-black text-[#1a1a2e] mb-1">150 €</div>
            <div className="text-xs text-[#9AA3C2] mb-4">jednosměrně, za kolo</div>
            <ul className="space-y-2 text-sm text-[#1a1a2e]">
              <li>✓ Doprava kola do Malagy (nebo zpět)</li>
              <li>✓ Sběr na 4 místech v ČR</li>
              <li>✓ Kolo přivezeš v rideable stavu (může mít nasazené pedály a sedlo)</li>
              <li>✓ Pojištění transportu na hodnotu kola</li>
              <li>✓ Servisní kontrola i kompletní montáž v Malaze po domluvě</li>
            </ul>
          </div>
          <div className="bg-[#1a1a2e] text-white rounded-2xl p-6 relative">
            <div className="absolute -top-3 right-6 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#E8431A]">
              Nejoblíbenější
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-white/60 mb-2">
              Doprava round-trip
            </div>
            <div className="text-3xl font-black mb-1">250 €</div>
            <div className="text-xs text-white/60 mb-4">tam i zpět, za kolo</div>
            <ul className="space-y-2 text-sm">
              <li>✓ Vše z one-way</li>
              <li>✓ <strong>Cesta tam i zpět</strong> v jedné objednávce</li>
              <li>✓ <strong>Ušetříš 50 €</strong> oproti dvěma jednosměrkám</li>
              <li>✓ Mezi cestami kolo hlídáme ve skladu (od 69 €/měsíc)</li>
              <li>✓ Kolo na tebe čeká rideable, ať přiletíš kdykoliv</li>
            </ul>
          </div>
        </div>

        {/* Exkluzivní full-service (nadstandard) */}
        <div className="bg-[#FFF1EA] border border-[#FBC9A8] rounded-2xl p-6 mb-10">
          <div className="text-xs font-bold uppercase tracking-wider text-[#E8431A] mb-2">
            Exkluzivní full-service (nadstandard)
          </div>
          <p className="text-sm text-[#1a1a2e] leading-relaxed mb-2">
            Chceš to úplně bez starostí? K dopravě přidáme kompletní servis: <strong>vyzvednutí přímo
            z domova</strong>, profesionální zabalení do našeho boxu, <strong>servisní kontrolu</strong>
            {" "}před cestou, v Malaze rozbalení a <strong>kompletní montáž</strong> (kolo na tebe čeká
            rideable) a foto dokumentaci stavu při příjezdu i odjezdu.
          </p>
          <p className="text-sm text-[#5A6480]">Cenu potvrdíme podle rozsahu — napiš nám do poptávky.</p>
        </div>

        {/* Section 4 — Cost */}
        <h2 id="cena" className="text-2xl md:text-3xl font-black text-[#1a1a2e] mt-16 mb-4">
          Kolik to stojí (a kdy se to vyplatí)
        </h2>
        <p className="text-base text-[#5A6480] leading-relaxed mb-5">
          Realistický rozpočet pro <strong>vícenásobné cesty v sezóně</strong> (listopad–březen),
          srovnaný s alternativami:
        </p>
        <div className="bg-[#F7F9FF] border border-[#E2E6F3] rounded-2xl p-6 mb-8">
          <h3 className="text-base font-black text-[#1a1a2e] mb-3">Příklad: 3 cesty během zimy (1 týden každá)</h3>
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-[#E2E6F3]">
                <td className="py-2 text-[#5A6480]">Vozit kolo letecky s sebou (6× poplatek za kolo à 75 € + box)</td>
                <td className="py-2 text-right font-bold">~450 € + box ~300 € poprvé</td>
              </tr>
              <tr className="border-b border-[#E2E6F3]">
                <td className="py-2 text-[#5A6480]">Půjčovna v Malaze (3× týden, ~300 €)</td>
                <td className="py-2 text-right font-bold">~900 €</td>
              </tr>
              <tr>
                <td className="py-2 font-bold text-[#1a1a2e]">100dola: round-trip doprava (250 €) + 4 měsíce skladu</td>
                <td className="py-2 text-right font-black text-[#E8431A]">~525 €</td>
              </tr>
            </tbody>
          </table>
          <p className="text-xs text-[#9AA3C2] mt-4">
            Levnější než půjčovna a srovnatelné s vožením kola letecky — jenže <strong>u nás
            létáš pokaždé light</strong> (žádné balení, žádný box, žádné riziko poškození), máš
            vždy své kolo připravené a <strong>neřešíš tahání kola z letiště na ubytování</strong>
            {" "}(ve skupině klidně několik kol). Čím víc cest, tím víc to hraje pro nás.
          </p>
        </div>

        {/* Section 5 — Storage */}
        <h2 id="sklad" className="text-2xl md:text-3xl font-black text-[#1a1a2e] mt-16 mb-4">
          Co dělá sklad v Malaze jiným
        </h2>
        <p className="text-base text-[#5A6480] leading-relaxed mb-5">
          Nejsme garážové family business kde se kola hází na sebe. Sklad v Malaze je
          dedikovaný prostor, kde každé kolo má své místo. Konkrétně:
        </p>
        <ul className="space-y-2 text-base text-[#5A6480] mb-8 ml-5 list-disc">
          <li>Vnitřní prostor (žádné kolísání teploty z vlhka nebo přímého slunce)</li>
          <li>Monitorovaný kamerový systém + alarm</li>
          <li>Každé kolo má svůj stojan / věšák — žádné navalování</li>
          <li>Pravidelná kontrola tlaku v pláštích (jednou za měsíc)</li>
          <li>Štítky s tvým jménem, modelem, fotkou při příjezdu</li>
          <li>10 minut od letiště Málaga (AGP) — fakt 10 minut, žádné „90 minut autobusem"</li>
        </ul>
        <p className="text-base text-[#5A6480] leading-relaxed mb-8">
          Když si nás <strong>napíšeš den před příletem</strong>, máme kolo připraveno před
          skladem, pláště nafouknuté, řetěz namazaný, brzdy zkontrolované. Vyzvedneš,
          ujedeš.
        </p>

        {/* Section 6 — Insurance */}
        <h2 id="pojisteni" className="text-2xl md:text-3xl font-black text-[#1a1a2e] mt-16 mb-4">
          Pojištění, riziko, co když se něco pokazí
        </h2>
        <p className="text-base text-[#5A6480] leading-relaxed mb-5">
          Kola v naší transportní vozové dopravě jsou pojištěna na <strong>plnou hodnotu kola</strong> —
          ne na nějaký paušál „do 50 000 Kč". Pokud máš kolo za 200 000 Kč, je krytí 200 000 Kč.
          Vyžadujeme jen fotografie aktuálního stavu a doklad o pořízení (nebo expertní odhad).
        </p>
        <p className="text-base text-[#5A6480] leading-relaxed mb-5">
          Sklad v Malaze je <strong>oddělené pojištění</strong> — kryje krádež, požár, vodní škodu.
          Kolo je u nás pojištěno po celou dobu skladování, ne jen v aktivním měsíci.
        </p>
        <p className="text-base text-[#5A6480] leading-relaxed mb-8">
          A když se něco pokazí cestou? Jsi v Malaze, řešíš zraněnou hlavu, ne reklamaci.
          Jan je <strong>dostupný osobně</strong> — telefon, WhatsApp, voláš a něco se děje.
          Žádný call center, žádné ticket queue.
        </p>

        {/* Section 7 — FAQ */}
        <h2 id="faq" className="text-2xl md:text-3xl font-black text-[#1a1a2e] mt-16 mb-4">
          Časté otázky
        </h2>
        <div className="space-y-5 mb-12">
          {[
            {
              q: "Jak dlouho transport trvá?",
              a: "Standardně 5–8 dní podle bloku odjezdu. Bloky vyhlašujeme po měsících — typicky 2–3 odjezdy v každém zimním měsíci. Pokud potřebuješ kolo v Malaze konkrétní víkend, dej vědět 2–3 týdny dopředu.",
            },
            {
              q: "Vezete jen silnice / gravel / MTB?",
              a: "Všechno. Od race silnice (Cervélo, ISAAC, Specialized) po enduro (Trek, Scott, YT). Bohužel zatím nevezeme tandemy a fatbiky širší než 700×50 mm — neprojdou nám boxem.",
            },
            {
              q: "Co s elektrokolem?",
              a: "Vezeme. Akumulátor jede odděleně v lithium-safe boxu (omezení Euro pravidel pro silniční transport). Cena +100 € k one-way dopravě kvůli specifickému balení.",
            },
            {
              q: "Můžete vyzvednout kolo přímo doma?",
              a: "Ano — do 100 km od kteréhokoliv ze sběrných míst (Šternberk, Olomouc, Valašské Meziříčí, Praha) obvykle zdarma, jinak po domluvě.",
            },
            {
              q: "Můžu během skladování poslat / vyměnit komponenty (sedlo, kazetu)?",
              a: "Ano. Pošli nám díl poštou na sklad v Malaze, dáme to na kolo před tvým příletem. Standardně účtujeme jen práci servisu (od 15 € podle úkonu).",
            },
            {
              q: "A když nezbudu jezdit a kolo bude v Malaze dlouho?",
              a: "Sklad můžeš zrušit kdykoliv. Buď ho vezeme zpátky (Basic 150 €), nebo ho prodáme v Malaze přes naše kontakty (komise 12 %, většinou rychle pro race carbon kola).",
            },
          ].map((item) => (
            <div key={item.q} className="border-b border-[#E2E6F3] pb-5">
              <h3 className="text-base font-bold text-[#1a1a2e] mb-2">{item.q}</h3>
              <p className="text-sm text-[#5A6480] leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>

        {/* Final CTA */}
        <div className="bg-gradient-to-br from-[#E8431A] to-[#FF6B3D] text-white rounded-2xl p-8 md:p-10 mb-8">
          <h2 className="text-2xl md:text-3xl font-black mb-2">Vezmeme tvoje kolo do Malagy?</h2>
          <p className="text-sm md:text-base text-white/90 mb-6 max-w-lg">
            Napiš nám termín a model kola. Ozveme se s konkrétní nabídkou do 24 h.
            Volat můžeš taky kdykoliv: <strong>+420 739 045 057</strong>.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/malaga#poptat"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white text-[#1a1a2e] text-sm font-bold hover:opacity-90 transition-opacity"
            >
              Poptat dopravu →
            </Link>
            <Link
              href="/malaga"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/10 text-white text-sm font-bold border border-white/20 hover:bg-white/20 transition-colors"
            >
              Vše o Malaze
            </Link>
          </div>
        </div>

        {/* Related */}
        <h2 className="text-xl font-black text-[#1a1a2e] mt-16 mb-4">Hodí se k tomu</h2>
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <Link
            href="/clanky/vlastni-kolo-malaga-vs-pujcovna"
            className="block bg-white border border-[#E2E6F3] rounded-2xl p-5 hover:border-[#E8431A]/40 transition-colors"
          >
            <div className="text-xs font-bold uppercase tracking-wider text-[#E8431A] mb-2">
              Malaga
            </div>
            <h3 className="text-base font-black text-[#1a1a2e] mb-1">
              Vlastní kolo v Malaze vs půjčovna
            </h3>
            <p className="text-xs text-[#5A6480]">
              Konkrétní rozpočet, kdy se to vyplatí a komu naopak ne.
            </p>
          </Link>
          <Link
            href="/clanky/velikost-kola"
            className="block bg-white border border-[#E2E6F3] rounded-2xl p-5 hover:border-[#3B7CF4]/40 transition-colors"
          >
            <div className="text-xs font-bold uppercase tracking-wider text-[#3B7CF4] mb-2">
              Sport
            </div>
            <h3 className="text-base font-black text-[#1a1a2e] mb-1">
              Jak vybrat správnou velikost kola
            </h3>
            <p className="text-xs text-[#5A6480]">
              Když chceš pak na svém kole sedět v Malaze pohodlně 6 h denně.
            </p>
          </Link>
        </div>
      </div>
    </article>
  );
}
