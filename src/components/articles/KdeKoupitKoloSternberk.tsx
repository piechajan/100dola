import Link from "next/link";
import { STERNBERK_STORE } from "@/data/company";

/**
 * SEO článek "Kde si koupit kolo ve Šternberku" — primární target keywords:
 *   - "kde koupit kolo šternberk"
 *   - "kola šternberk"
 *   - "silniční kolo šternberk"
 *   - "SCOTT kola Šternberk"
 *   - "ISAAC kola Šternberk"
 *   - "cyklistický obchod Šternberk"
 *   - "gravel kolo šternberk"
 *   - "kolo Olomoucký kraj"
 *
 * Pozicování: prémiový obchod, stylové dražší kola, bonitnější zákazník.
 * Tone: přátelský expert, žádný high-pressure sales, ale jasné že tady
 * dostaneš víc než ve supermarketu nebo na bazaru.
 */
export default function KdeKoupitKoloSternberk() {
  return (
    <article className="bg-white">
      <div className="max-w-[820px] mx-auto px-6 md:px-12 py-12 md:py-16">
        {/* Lead intro */}
        <p className="text-lg text-[#5A6480] leading-relaxed mb-10">
          Šternberk leží v srdci Hané, 13 km od Olomouce, a okolní krajina je
          pro cyklistu ráj — Nízký Jeseník na sever, Litovelské Pomoraví na
          jih, Bouzovsko na západ. Pokud uvažujete o novém kole a chcete ho
          koupit lokálně, namísto „na klik" v anonymním e-shopu, je 100dola
          sport jediný obchod ve Šternberku, který se specializuje na{" "}
          <strong>prémiové silniční a gravel modely</strong> evropských a
          severoamerických značek. Tento průvodce shrnuje, co u nás najdete,
          jak vybírat a kolik počítat.
        </p>

        {/* TOC / quick facts */}
        <div className="bg-[#F0F4FF] border border-[#C4D2F0] rounded-2xl p-6 mb-12">
          <div className="text-[10px] uppercase tracking-wider font-bold text-[#3B7CF4] mb-3">
            V kostce
          </div>
          <ul className="space-y-2 text-sm text-[#1a1a2e]">
            <li>
              📍 <strong>Kde:</strong> 100dola sport, Partyzánská 141/2, Šternberk
              (vedle kavárny Namístě)
            </li>
            <li>
              🚲 <strong>Co prodáváme:</strong> SCOTT, ISAAC, Lapierre, Ghost,
              NORCO, Bergamont — silniční, gravel, MTB, elektrokola
            </li>
            <li>
              💸 <strong>Cenové pásmo:</strong> od ~40 000 Kč po 250 000+ Kč
            </li>
            <li>
              🕘 <strong>Otevřeno:</strong> St 9:30–16, Čt 9–17, Pá 9–16, So 9–12
            </li>
            <li>
              ☎️ <strong>Kontakt:</strong>{" "}
              <a
                href="tel:+420739045057"
                className="text-[#3B7CF4] font-bold hover:underline"
              >
                +420 739 045 057
              </a>{" "}
              (přijďte raději po domluvě — ať máme čas)
            </li>
          </ul>
        </div>

        {/* 1. Než vyrazíte */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-4">
            Než vyrazíte do prodejny — co si vyjasnit doma
          </h2>
          <p className="text-base text-[#5A6480] leading-relaxed mb-4">
            Nákup kola není jen o značce a barvě. Vyplatí se přijít s rámcovou
            představou — ušetříte sobě i nám hodinu vykládání:
          </p>
          <ul className="space-y-3 text-base text-[#1a1a2e] leading-relaxed list-disc list-outside ml-5 marker:text-[#3B7CF4]">
            <li>
              <strong>Typ jízdy.</strong> Silnice (asfalt, dlouhé výjezdy)?
              Gravel (mix asfaltu, šotoliny, lesních cest)? MTB (singletraily,
              skoky)? Trekové kolo do města? Elektrokolo na turistiku se ženou?
              U nás dominuje road a gravel — to je naše doma.
            </li>
            <li>
              <strong>Realistický roční nájezd.</strong> 1 500 km ročně volá po
              jiném kole než 10 000 km. U vyšších nájezdů má smysl
              karbonový rám a kvalitní groupset (Shimano 105 Di2, Ultegra, GRX).
            </li>
            <li>
              <strong>Rozpočtové pásmo.</strong> Kolo za 60 000 a kolo za 150 000
              jsou jiné světy. Konkrétní čísla rozebíráme níže.
            </li>
            <li>
              <strong>Výška a délka v sedu.</strong> Pro správnou velikost rámu
              stačí výška a délka v sedu (nebo přijďte na orientační bikefit).
            </li>
          </ul>
        </section>

        {/* 2. Značky které doporučujeme */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-4">
            Značky, které u nás najdete — a proč zrovna tyhle
          </h2>
          <p className="text-base text-[#5A6480] leading-relaxed mb-6">
            Neprodáváme všechno. Nabídku jsme vybrali tak, aby v každé
            cenové kategorii bylo kolo, které sami doporučujeme — ne aby polička
            byla plná. Hlavní značky:
          </p>

          <div className="space-y-5">
            <div className="bg-white border border-[#E2E6F3] rounded-2xl p-5">
              <h3 className="text-lg font-black text-[#1a1a2e] mb-2">SCOTT</h3>
              <p className="text-sm text-[#5A6480] leading-relaxed">
                Švýcarská značka s tradicí od roku 1958. Pro nás
                <strong> hlavní opora silničního a MTB programu</strong> —
                modely Addict (silnice), Foil (aero), Solace (endurance),
                Genius a Spark (MTB). Geometrie sedí na evropskou postavu,
                karbonové rámy jsou prověřené, servisní síť funguje.
                Pokud váháte mezi značkami a chcete „sázku na jistotu", SCOTT
                je dobrá volba.
              </p>
            </div>

            <div className="bg-white border border-[#E2E6F3] rounded-2xl p-5">
              <h3 className="text-lg font-black text-[#1a1a2e] mb-2">
                ISAAC <span className="text-sm font-normal text-[#9AA3C2]">— holandská boutique</span>
              </h3>
              <p className="text-sm text-[#5A6480] leading-relaxed">
                Méně známá značka, kterou jsme zařadili záměrně —{" "}
                <strong>karbonové rámy v poměru kvalita/cena lepší než
                u větších značek</strong>. Modely Meson a Element pro silnici,
                Boson aero, Vitron endurance, Kaon a Torus Xplore pro gravel.
                Pokud chcete kolo, které nepotkáte na každé vyjížďce,
                je ISAAC volba pro vás.{" "}
                <Link href="/isaac-test" className="text-[#3B7CF4] font-bold hover:underline">
                  Zkušební jízdy ISAAC pořádáme pravidelně →
                </Link>
              </p>
            </div>

            <div className="bg-white border border-[#E2E6F3] rounded-2xl p-5">
              <h3 className="text-lg font-black text-[#1a1a2e] mb-2">Lapierre · Ghost · NORCO · Bergamont</h3>
              <p className="text-sm text-[#5A6480] leading-relaxed">
                Doplňkové značky pro konkrétní disciplíny —{" "}
                <strong>Lapierre</strong> pro endurance a gravel,{" "}
                <strong>Ghost</strong> a <strong>NORCO</strong> pro MTB
                (cross-country i trail), <strong>Bergamont</strong> pro
                městské a trekové kolo. Doporučujeme ad hoc podle toho, na co
                hledáte kolo.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Cenová pásma */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-4">
            Kolik počítat — cenová pásma 2026
          </h2>
          <p className="text-base text-[#5A6480] leading-relaxed mb-6">
            Ceny jsou orientační pro <strong>silniční a gravel kola
            s karbonovým rámem</strong> (alu modely u SCOTT a ISAAC začínají
            o ~10–15 tisíc níž).
          </p>

          <div className="overflow-hidden rounded-2xl border border-[#E2E6F3]">
            <table className="w-full text-sm">
              <thead className="bg-[#F0F4FF]">
                <tr>
                  <th className="text-left p-4 font-black text-[#1a1a2e]">Pásmo</th>
                  <th className="text-left p-4 font-black text-[#1a1a2e]">Co dostanete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E6F3]">
                <tr>
                  <td className="p-4 align-top">
                    <strong className="text-[#1a1a2e]">40–60 k</strong>
                    <div className="text-[11px] text-[#9AA3C2]">vstupní karbon</div>
                  </td>
                  <td className="p-4 text-[#5A6480]">
                    Karbon rám entry-level, Shimano 105 mechanika (12-rychlostní),
                    alu kola. Reálné kolo na 5 000–10 000 km ročně. Pro
                    začínajícího nebo hobby jezdce ideální start.
                  </td>
                </tr>
                <tr>
                  <td className="p-4 align-top">
                    <strong className="text-[#1a1a2e]">60–100 k</strong>
                    <div className="text-[11px] text-[#9AA3C2]">střední pásmo</div>
                  </td>
                  <td className="p-4 text-[#5A6480]">
                    Lepší rám, Shimano 105 Di2 nebo Ultegra mechanická, lepší
                    sada kol (často karbon), lepší pneumatiky. Tady začíná
                    cyklistika „nepřemýšlej, jen jeď" — kolo, které vás motivuje
                    vyjet, místo aby vás odrazovalo váhou nebo chladnou
                    geometrií.
                  </td>
                </tr>
                <tr>
                  <td className="p-4 align-top">
                    <strong className="text-[#1a1a2e]">100–150 k</strong>
                    <div className="text-[11px] text-[#9AA3C2]">prémie</div>
                  </td>
                  <td className="p-4 text-[#5A6480]">
                    Shimano Ultegra Di2 nebo SRAM Force AXS, karbonová sada
                    kol, lehčí rám. Rozdíl proti střednímu pásmu cítíte na
                    výjezdech, na akceleraci a v handlingu. Tohle je „kolo
                    na dlouho" — pravděpodobně vám vydrží 10+ let.
                  </td>
                </tr>
                <tr>
                  <td className="p-4 align-top">
                    <strong className="text-[#1a1a2e]">150+ k</strong>
                    <div className="text-[11px] text-[#9AA3C2]">top</div>
                  </td>
                  <td className="p-4 text-[#5A6480]">
                    Top modely SCOTT Addict RC, Foil RC, ISAAC Boson SL.
                    Dura-Ace Di2, Red AXS, hluboké karbon disky. Rozdíl
                    proti pásmu 100k je v detailech — ale pokud na nich
                    sedíte 5 hodin v týdnu, ty detaily vidíte i cítíte.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 4. Proč boutique značka */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-4">
            Proč boutique značka místo supermarketu
          </h2>
          <p className="text-base text-[#5A6480] leading-relaxed mb-4">
            Nejdražší část kola je rám. A na rámu se sázení na nízkou cenu
            podepíše nejvíc — geometrií, kvalitou karbonu a životností. Kolo
            za 25 tisíc z hyper­marketu dělá v zásadě totéž co kolo za 60 tisíc
            od SCOTTu, ale:
          </p>
          <ul className="space-y-3 text-base text-[#1a1a2e] leading-relaxed list-disc list-outside ml-5 marker:text-[#3B7CF4]">
            <li>
              <strong>Geometrie sedí.</strong> SCOTT a ISAAC mají
              prošlapané rozměry — víte, že L bude L. U levných značek se
              často „M" jednoho výrobce chová jako „L" jiného.
            </li>
            <li>
              <strong>Komponenty se dají servisovat.</strong> Shimano 105
              Di2 z roku 2026 budete moci servisovat i v roce 2036. Levnější
              značky používají proprietární komponenty, které za 5 let
              nikdo neopraví.
            </li>
            <li>
              <strong>Hodnota při prodeji.</strong> SCOTT Addict z roku 2020
              se dnes prodává za 60 % původní ceny. Kolo z nejmenované
              značky za 30 % původní ceny — pokud ho vůbec někdo koupí.
            </li>
            <li>
              <strong>Jezdíte raději.</strong> Tohle je nejdůležitější. Hezké,
              kvalitní kolo vás táhne ven. Levný kompromis máte v garáži a
              vždycky najdete důvod proč nejet.
            </li>
          </ul>
        </section>

        {/* 5. Test ride */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-4">
            Vyzkoušet si kolo před nákupem
          </h2>
          <p className="text-base text-[#5A6480] leading-relaxed mb-4">
            Vybírat kolo bez vyzkoušení je jako kupovat boty online — někdy
            to vyjde, většinou ne úplně. Před pořízením kola za 60 000+ Kč si
            domluvte zkušební jízdu:
          </p>
          <ul className="space-y-3 text-base text-[#1a1a2e] leading-relaxed list-disc list-outside ml-5 marker:text-[#3B7CF4]">
            <li>
              <strong>ISAAC fleet</strong> — pořádáme pravidelně víkendy
              zkušebních jízd s celou paletou ISAAC modelů (Meson, Element,
              Boson, Vitron, Kaon, Torus Xplore).{" "}
              <Link href="/isaac-test" className="text-[#3B7CF4] font-bold hover:underline">
                Nejbližší termíny →
              </Link>
            </li>
            <li>
              <strong>SCOTT a další značky</strong> — individuální zkušební
              jízda po dohodě. Stačí{" "}
              <Link href="/kontakt" className="text-[#3B7CF4] font-bold hover:underline">
                zavolat nebo napsat
              </Link>
              , domluvíme se na termínu, který sedí.
            </li>
          </ul>
        </section>

        {/* 6. Co dostanete v 100dola */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-4">
            Co k tomu v 100dola sport dostanete navíc
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#F7F9FF] border border-[#E2E6F3] rounded-xl p-5">
              <div className="text-2xl mb-2">📐</div>
              <h3 className="font-black text-[#1a1a2e] mb-1">
                Konzultace velikosti
              </h3>
              <p className="text-sm text-[#5A6480]">
                Před objednáním zkontrolujeme s vámi velikost rámu podle
                tělesných proporcí. Bez nás byste mohli stranou koupit kolo
                o velikost vedle.
              </p>
            </div>
            <div className="bg-[#F7F9FF] border border-[#E2E6F3] rounded-xl p-5">
              <div className="text-2xl mb-2">🛠️</div>
              <h3 className="font-black text-[#1a1a2e] mb-1">
                Hotové kolo na vyzvednutí
              </h3>
              <p className="text-sm text-[#5A6480]">
                Kolo dostanete <em>kompletně sestavené, seřízené a
                zkalibrované</em> — ne v krabici, ne s manuálem v ruce.
                Nasedáte a jedete.
              </p>
            </div>
            <div className="bg-[#F7F9FF] border border-[#E2E6F3] rounded-xl p-5">
              <div className="text-2xl mb-2">🎨</div>
              <h3 className="font-black text-[#1a1a2e] mb-1">
                Sladěné doplňky
              </h3>
              <p className="text-sm text-[#5A6480]">
                K novému kolu rádi doporučíme oblečení (Q36.5), helmu, světla
                Magicshine, brýle a další doplňky tak, aby celek dával smysl —
                technicky i vizuálně.
              </p>
            </div>
            <div className="bg-[#F7F9FF] border border-[#E2E6F3] rounded-xl p-5">
              <div className="text-2xl mb-2">🌍</div>
              <h3 className="font-black text-[#1a1a2e] mb-1">
                Cycling base v Malaze
              </h3>
              <p className="text-sm text-[#5A6480]">
                Pokud uvažujete o zimním ježdění, provozujeme cycling base
                v Malaze — váš kolo tam doveze, uskladní a vy přiletíte jen
                s příručkou.{" "}
                <Link href="/malaga" className="text-[#3B7CF4] font-bold hover:underline">
                  Jak to funguje →
                </Link>
              </p>
            </div>
          </div>
        </section>

        {/* 7. Praktické info */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-4">
            Kde nás najdete
          </h2>
          <div className="bg-[#FFF1EA] border border-[#FBC9A8] rounded-2xl p-6">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
              <div>
                <dt className="text-[10px] uppercase tracking-wider text-[#9B3D17] font-bold mb-1">
                  Adresa
                </dt>
                <dd className="text-[#1a1a2e]">
                  <a
                    href={STERNBERK_STORE.mapsLinkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-black hover:underline"
                  >
                    Partyzánská 141/2, 785 01 Šternberk
                  </a>
                  <br />
                  <span className="text-[#5A4500]">{STERNBERK_STORE.landmark}</span>
                </dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-wider text-[#9B3D17] font-bold mb-1">
                  Otevírací doba
                </dt>
                <dd className="text-[#1a1a2e]">
                  Středa 9:30–16<br />
                  Čtvrtek 9–17<br />
                  Pátek 9–16<br />
                  Sobota 9–12<br />
                  <span className="text-[#5A4500]">Po, Út, Ne — po domluvě, jsme na telefonu</span>
                </dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-wider text-[#9B3D17] font-bold mb-1">
                  Telefon
                </dt>
                <dd className="text-[#1a1a2e]">
                  <a
                    href="tel:+420739045057"
                    className="font-black hover:underline"
                  >
                    +420 739 045 057
                  </a>
                  <br />
                  <span className="text-[#5A4500]">Jan Piecha</span>
                </dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-wider text-[#9B3D17] font-bold mb-1">
                  E-mail
                </dt>
                <dd className="text-[#1a1a2e]">
                  <a
                    href="mailto:info@100dola.com"
                    className="font-black hover:underline"
                  >
                    info@100dola.com
                  </a>
                </dd>
              </div>
            </dl>
            <p className="text-xs text-[#5A4500] mt-5 leading-relaxed">
              <strong>Doporučení:</strong> Před návštěvou (zejména pokud chcete
              konkrétní kolo prohlédnout nebo zkusit) si zavolejte. Máme malou
              prodejnu a chceme mít čas věnovat se vám naplno.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-br from-[#1a1a2e] to-[#2a2a4e] text-white rounded-2xl p-6 md:p-8 text-center mt-16">
          <div className="text-[10px] uppercase tracking-wider font-bold text-[#9AB4FF] mb-2">
            Připraveni vybrat kolo?
          </div>
          <h2 className="text-xl md:text-2xl font-black mb-3">
            Přijďte se podívat. Nebo nám napište.
          </h2>
          <p className="text-sm text-white/70 max-w-md mx-auto mb-5">
            Pokud máte konkrétní představu, řekneme aktuální dostupnost a
            termín. Pokud teprve uvažujete, projedeme možnosti.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/kontakt"
              className="px-5 py-3 rounded-full bg-white text-[#1a1a2e] text-sm font-black hover:opacity-90"
            >
              Kontaktovat 100dola sport →
            </Link>
            <Link
              href="/isaac-test"
              className="px-5 py-3 rounded-full border border-white/30 text-white text-sm font-bold hover:bg-white/10"
            >
              Testovací jízdy ISAAC
            </Link>
          </div>
        </section>
      </div>
    </article>
  );
}
