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
        <p className="text-lg text-[#5A6480] leading-relaxed mb-6">
          Šternberk leží v srdci Hané, 13 km od Olomouce, a okolní krajina je
          pro cyklistu ráj — Nízký Jeseník na sever, Litovelské Pomoraví na
          jih, Bouzovsko na západ. A kousek za městem začíná legendární kopec{" "}
          <strong>Ecce Homo</strong> (závod automobilů a motocyklů do vrchu)
          — tradiční tréninkový bod všech cyklistů z okolí. Pokud uvažujete o
          novém kole a chcete ho koupit lokálně, namísto „na klik" v anonymním
          e-shopu, je 100dola sport jediný obchod ve Šternberku, který nabízí{" "}
          <strong>prémiová silniční, gravel, horská i elektrokola</strong>{" "}
          evropských a severoamerických značek.
        </p>
        <p className="text-base text-[#5A6480] leading-relaxed mb-10">
          Tento průvodce shrnuje, co u nás najdete, jak vybírat a kolik počítat.
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
              NORCO, Bergamont — silniční, gravel, horská (MTB) a elektrokola
            </li>
            <li>
              💸 <strong>Cenové pásmo:</strong> od ~20 000 Kč po 350 000+ Kč
            </li>
            <li>
              ⛰️ <strong>Lokální klasika:</strong> Ecce Homo — kopec, kam jezdí
              trénovat všichni cyklisti z okolí
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

        {/* 1. Co spolu projdeme */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-4">
            Co spolu projdeme, než si vyberete
          </h2>
          <p className="text-base text-[#5A6480] leading-relaxed mb-4">
            Výběr kola je individuální — neexistuje univerzální „nejlepší kolo".
            Když přijdete, projdeme s vámi pár věcí, abychom doporučení trefili
            přesně. Klidně přijďte „jen se podívat" — žádný tlak, raději si
            sedneme, dáme kafe a vyjasníme:
          </p>
          <ul className="space-y-3 text-base text-[#1a1a2e] leading-relaxed list-disc list-outside ml-5 marker:text-[#3B7CF4]">
            <li>
              <strong>Jak chcete jezdit.</strong> Silnice (asfalt, dlouhé
              výjezdy, kopce typu Ecce Homo)? Gravel (mix asfaltu, šotoliny,
              lesních cest kolem Litovelského Pomoraví)? MTB (singletraily v
              Jeseníkách)? Elektrokolo s vyšším dojezdem na celodenní výlet?
              Nemusíte to mít vyřešené — pomůžeme zorientovat.
            </li>
            <li>
              <strong>Co od kola čekáte.</strong> Trénink na závody? Víkendové
              vyjížďky pro radost? Cestování na kole? Karbonový rám a kvalitní
              groupset dávají smysl v obou případech — i u nižších nájezdů.
              Roční kilometráž není limit, je to spíš ukazatel intenzity
              používání. I hobby jezdec si zaslouží kolo, na které se těší
              a které mu dělá radost už jen tím, jak vypadá v garáži.
            </li>
            <li>
              <strong>Jaký máte rozpočet.</strong> Tady neexistuje špatná
              odpověď — máme kola od 20 000 do 350 000+ Kč. Vždycky najdeme
              variantu, která má pro vaše použití smysl, ne která je nejdražší.
            </li>
            <li>
              <strong>Velikost rámu.</strong> Zaměříme základní rozměry (výška,
              délka v sedu, inseam) přímo v prodejně. Pokud chcete jít do detailu,
              nabízíme i orientační bikefit.
            </li>
          </ul>
          <p className="text-sm text-[#5A6480] leading-relaxed mt-5 italic">
            Krátká zpráva, telefon nebo příchod osobně — všechno funguje.
            Osobní konzultace je u nás zdarma a nezavazuje vás k ničemu.
          </p>
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
            Pásma platí orientačně pro silniční, gravel a MTB modely.{" "}
            <strong>Elektrokola</strong> přidávají typicky 30–60 % k ceně
            ekvivalentního klasického kola (kvůli motoru, baterii a posílené
            geometrii rámu).
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
                    <strong className="text-[#1a1a2e]">20–40 k</strong>
                    <div className="text-[11px] text-[#9AA3C2]">vstup</div>
                  </td>
                  <td className="p-4 text-[#5A6480]">
                    Hliníkový rám, Shimano Tiagra nebo 105 (mechanická), alu
                    kola. Solidní vstup do cyklistiky pro hobby jezdce — kolo,
                    které vás nezklame první sezónu. Z MTB sem patří entry-level
                    hardtaily od SCOTT a Bergamont.
                  </td>
                </tr>
                <tr>
                  <td className="p-4 align-top">
                    <strong className="text-[#1a1a2e]">40–100 k</strong>
                    <div className="text-[11px] text-[#9AA3C2]">střední třída</div>
                  </td>
                  <td className="p-4 text-[#5A6480]">
                    Karbonový rám entry až střední, Shimano 105 Di2 nebo Ultegra
                    mechanická, lepší kola (často karbon entry). Tady začíná
                    cyklistika „nepřemýšlej, jen jeď" — kolo, které vás motivuje
                    vyjet místo aby vás odrazovalo váhou. Pro MTB: kvalitní
                    hardtail nebo entry full-suspension.
                  </td>
                </tr>
                <tr>
                  <td className="p-4 align-top">
                    <strong className="text-[#1a1a2e]">100–200 k</strong>
                    <div className="text-[11px] text-[#9AA3C2]">prémie</div>
                  </td>
                  <td className="p-4 text-[#5A6480]">
                    Lehčí karbon, Shimano Ultegra Di2 nebo SRAM Force AXS,
                    karbonová sada kol, lepší pneumatiky a sedlo. Rozdíl proti
                    střednímu pásmu cítíte na výjezdech, v akceleraci a
                    v handlingu. „Kolo na dlouho" — pravděpodobně vám vydrží
                    10+ let. Pro MTB: serious full-suspension trail/enduro.
                  </td>
                </tr>
                <tr>
                  <td className="p-4 align-top">
                    <strong className="text-[#1a1a2e]">200–350+ k</strong>
                    <div className="text-[11px] text-[#9AA3C2]">top</div>
                  </td>
                  <td className="p-4 text-[#5A6480]">
                    Top modely SCOTT Addict RC, Foil RC, ISAAC Boson SL.
                    Dura-Ace Di2, SRAM Red AXS, hluboká karbonová kola,
                    elektronické řazení s power meterem. Rozdíl proti pásmu
                    100–200 k je v detailech — ale pokud na kole sedíte 5+
                    hodin týdně, ty detaily cítíte. Pro MTB: prémiové enduro
                    a XC race kola.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 4. Proč boutique značka */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-4">
            Proč prémiové kolo má smysl — i pro hobby jezdce
          </h2>
          <p className="text-base text-[#5A6480] leading-relaxed mb-4">
            Rozdíl mezi kolem za 25 tisíc z hypermarketu a kolem za 80 tisíc
            od SCOTTu není v tom, že obě „jezdí". Jezdit jezdí obě — rozdíl
            je v <em>jak</em>:
          </p>
          <ul className="space-y-3 text-base text-[#1a1a2e] leading-relaxed list-disc list-outside ml-5 marker:text-[#3B7CF4]">
            <li>
              <strong>Karbonový rám = jiný zážitek.</strong> Lehčí kolo
              akceleruje rychleji, snadněji ho zvedáte přes obrubník i do
              auta. Karbon tlumí drobné vibrace — po dvouhodinové jízdě
              nemáte rozbolavělé ruce. To není „výkonnostní" benefit, to je
              čistě pohodlí, které si užije i víkendový jezdec.
            </li>
            <li>
              <strong>Geometrie sedí.</strong> SCOTT a ISAAC mají rámy
              navržené tak, aby seděly na evropskou postavu. U levných
              značek často „M" jednoho výrobce odpovídá „L" jiného a po
              dvou letech zjistíte, že máte na kole špatný posaz.
            </li>
            <li>
              <strong>Komponenty se dají servisovat.</strong> Shimano 105 Di2
              z roku 2026 budete moci servisovat i v roce 2036. Levné značky
              používají proprietární komponenty, které za 5 let nikdo neopraví
              — pak se kolo vyhazuje, ne opravuje.
            </li>
            <li>
              <strong>Hodnota při prodeji.</strong> SCOTT Addict z roku 2020
              se dnes prodává za 60 % původní ceny. Kolo z nejmenované
              značky za 30 % — pokud ho vůbec někdo koupí.
            </li>
            <li>
              <strong>Kolo, na které se těšíte.</strong> Tohle je
              <strong> nejdůležitější</strong> a často nepojmenované.
              Pěkné, kvalitní kolo vás <em>táhne ven</em> — i když máte volný
              jen jeden víkendový dopolední čas. Levný kompromis stojí
              v garáži a vždycky najdete důvod, proč nejet. Jeden ze
              spoluvlastníků 100dola sport je sám hobby jezdec — a jezdí
              na karbonovém SCOTTu, protože dobré kolo není o kilometrech,
              ale o tom, jak vás baví ho používat.
            </li>
          </ul>
        </section>

        {/* 5. Jak u nás výběr probíhá */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-4">
            Jak to u nás probíhá — od konzultace po předání
          </h2>
          <p className="text-base text-[#5A6480] leading-relaxed mb-4">
            Většinu modelů objednáváme přímo pod konkrétního zákazníka.
            Díky tomu dostanete <strong>nejnovější model v přesně té
            konfiguraci, kterou chcete</strong> — velikost, barva, případně
            úprava sedla nebo řídítek. Cena je stejná jako u velkých řetězců,
            často nižší, a získáte osobní servis od konzultace až po předání.
          </p>
          <div className="space-y-4 mt-6">
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-[#3B7CF4] text-white text-sm font-black flex items-center justify-center flex-shrink-0">1</div>
              <div>
                <h3 className="font-black text-[#1a1a2e] mb-1">Konzultace</h3>
                <p className="text-sm text-[#5A6480] leading-relaxed">
                  Telefon, e-mail nebo osobně — projdeme, na co kolo chcete,
                  jaké máte představy a rozpočet. Zdarma, nezávazně.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-[#3B7CF4] text-white text-sm font-black flex items-center justify-center flex-shrink-0">2</div>
              <div>
                <h3 className="font-black text-[#1a1a2e] mb-1">Výběr 2–3 modelů</h3>
                <p className="text-sm text-[#5A6480] leading-relaxed">
                  Doporučíme konkrétní modely, které pro vaše použití dávají
                  smysl. Probereme rozdíly, ceny, dostupnost.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-[#3B7CF4] text-white text-sm font-black flex items-center justify-center flex-shrink-0">3</div>
              <div>
                <h3 className="font-black text-[#1a1a2e] mb-1">Zkušební jízda — pokud je možnost</h3>
                <p className="text-sm text-[#5A6480] leading-relaxed">
                  Pokud máme zrovna v showroomu vybraný model nebo blízkého
                  sourozence ve vaší velikosti, domluvíme krátkou jízdu. Pro
                  ISAAC fleet pořádáme příležitostně víkendy hromadných
                  zkušebních jízd — například{" "}
                  <Link href="/isaac-test" className="text-[#3B7CF4] font-bold hover:underline">
                    víkend Závodu Míru 2026
                  </Link>
                  , kde si projedete celé spektrum modelů na jednom místě.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-[#3B7CF4] text-white text-sm font-black flex items-center justify-center flex-shrink-0">4</div>
              <div>
                <h3 className="font-black text-[#1a1a2e] mb-1">Objednávka & příprava</h3>
                <p className="text-sm text-[#5A6480] leading-relaxed">
                  Kolo objednáme, postavíme, seřídíme a zkalibrujeme. Termíny
                  závisí na modelu — obvykle 2–6 týdnů. Pošleme update,
                  kdykoliv je posun.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-[#3B7CF4] text-white text-sm font-black flex items-center justify-center flex-shrink-0">5</div>
              <div>
                <h3 className="font-black text-[#1a1a2e] mb-1">Předání — u nás nebo u vás</h3>
                <p className="text-sm text-[#5A6480] leading-relaxed">
                  Buďto si pro kolo přijedete do Šternberku (Partyzánská 2),
                  nebo vám ho doručíme. <strong>Pravidelně jezdíme do
                  Olomouce, Vsetína, Valašského Meziříčí, Ostravy a Brna</strong>{" "}
                  — osobní předání s krátkou instruktáží je často zdarma nebo
                  za symbolický příspěvek. Domluvíme se podle vaší lokality.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Lokální tipy */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-4">
            Kde se ve Šternberku jezdí
          </h2>
          <p className="text-base text-[#5A6480] leading-relaxed mb-6">
            Když se rozhodujete pro nové kolo, pomáhá vědět, kde ho budete
            reálně mlátit. Tady je rychlý přehled tras, na kterých nás potkáte:
          </p>

          <div className="space-y-4">
            <div className="bg-white border border-[#E2E6F3] rounded-2xl p-5">
              <div className="flex items-baseline gap-3 mb-2">
                <h3 className="text-lg font-black text-[#1a1a2e]">
                  Ecce Homo
                </h3>
                <span className="text-xs uppercase tracking-wider font-bold text-[#E8431A]">
                  Lokální klasika
                </span>
              </div>
              <p className="text-sm text-[#5A6480] leading-relaxed">
                Slavný kopec mezi Šternberkem a Domašovem, kde se od roku 1905
                jezdí <strong>závody automobilů a motocyklů do vrchu</strong>{" "}
                (Mistrovství Evropy v závodech do vrchu, FIA EHCC). Pro cyklistu
                je to <strong>tréninkový bod číslo jedna</strong> —
                7,7 km dlouhá serpentina, ~340 m převýšení, průměrný sklon
                4,4 %. Téměř každý vážnější cyklista z okolí má na Stravě
                segment „Ecce Homo" — perfektní benchmark pro hodinové
                intervaly nebo „pojedu jen tak nahoru a zpátky".
              </p>
            </div>

            <div className="bg-white border border-[#E2E6F3] rounded-2xl p-5">
              <h3 className="text-lg font-black text-[#1a1a2e] mb-2">
                Nízký Jeseník — silnice a gravel
              </h3>
              <p className="text-sm text-[#5A6480] leading-relaxed">
                Směrem na sever od Šternberku se rozkládá Nízký Jeseník —
                klidné silnice s rolling hills, ideální pro silniční výjezdy
                100+ km. Pro gravel jezdce: lesní cesty kolem Bruntálu,
                přejezdy přes pláně Hrubého Jeseníku.
              </p>
            </div>

            <div className="bg-white border border-[#E2E6F3] rounded-2xl p-5">
              <h3 className="text-lg font-black text-[#1a1a2e] mb-2">
                Litovelské Pomoraví — gravel
              </h3>
              <p className="text-sm text-[#5A6480] leading-relaxed">
                Směrem na jih a jihozápad. Říční terasy, lužní lesy, lesní
                a polní cesty. Klidná oblast, kde potkáte kola, ne auta.
                Ideální celodenní gravel okruh 60–80 km.
              </p>
            </div>

            <div className="bg-white border border-[#E2E6F3] rounded-2xl p-5">
              <h3 className="text-lg font-black text-[#1a1a2e] mb-2">
                Hrubý Jeseník — MTB & enduro
              </h3>
              <p className="text-sm text-[#5A6480] leading-relaxed">
                Hodinu autem na sever a jste v Hrubém Jeseníku — Praděd
                (1 491 m), Dlouhé Stráně, technické singletraily. Pro MTB
                jezdce ráj, pro elektrokola s vyšším dojezdem také.
              </p>
            </div>

            <div className="bg-white border border-[#E2E6F3] rounded-2xl p-5">
              <h3 className="text-lg font-black text-[#1a1a2e] mb-2">
                Závod Míru — UCI U23 stage race
              </h3>
              <p className="text-sm text-[#5A6480] leading-relaxed">
                Šternberk je tradičně cílovým městem některé etapy{" "}
                <Link href="/clanky/zavod-miru-2026-sternberk" className="text-[#3B7CF4] font-bold hover:underline">
                  Závodu Míru U23
                </Link>
                . Pro místní cyklisty je to každoroční svátek a dobrý důvod,
                proč se na jaře dostat zpátky do formy.
              </p>
            </div>
          </div>
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
              <strong>Doporučení:</strong> Před návštěvou nám zavolejte nebo
              napište — domluvíme termín, který sedí vám i nám, a budeme se
              vám moct věnovat naplno. Stejně rychle vyřešíme i dotaz na
              dálku, pokud do Šternberku nemáte cestu.
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
