import Link from "next/link";

/**
 * SEO článek "CEP kompresní vybavení pro běžce" — target keywords:
 *   - "CEP podkolenky"
 *   - "CEP legíny"
 *   - "CEP kompresní"
 *   - "kompresní podkolenky běh"
 *   - "kompresní legíny běh"
 *   - "kompresní vybavení šternberk / olomouc"
 *   - "běžecké vybavení šternberk"
 *
 * Pozicování: 100dola sport — autoritativní průvodce CEP brand. Cíl
 * Olomoucký kraj a Šternbersko (Olomouc, Uničov, Litovel, Hranice, Mohelnice).
 */
export default function CepKompresniVybaveni() {
  return (
    <article className="bg-white">
      <div className="max-w-[820px] mx-auto px-6 md:px-12 py-12 md:py-16">
        {/* Lead */}
        <p className="text-lg text-[#5A6480] leading-relaxed mb-10">
          <strong>CEP</strong> je německá značka, která definovala
          kompresní vybavení pro běžce, triatlonisty a vytrvalostní
          sportovce. V Česku má pověst <em>standard pro lidi, kteří to
          s běháním myslí vážně</em> — a pokud jste ze Šternberku, je
          velká pravděpodobnost, že jsme jediný obchod v dosahu, který
          drží kompletní řadu. V tomto článku ukážeme, co kompresní
          vybavení dělá, jaké modely CEP doporučujeme a komu se vyplatí.
        </p>

        {/* Quick summary */}
        <div className="bg-[#FFF1EA] border border-[#FBC9A8] rounded-2xl p-6 mb-12">
          <div className="text-[10px] uppercase tracking-wider font-bold text-[#9B3D17] mb-3">
            V kostce
          </div>
          <ul className="space-y-2 text-sm text-[#1a1a2e]">
            <li>
              🏃‍♂️ <strong>Co to je:</strong> kompresní textil s graduovaným
              tlakem (silnější u kotníku, slabší výš) — podkolenky, legíny,
              návleky, ponožky, rukávy
            </li>
            <li>
              ⚡ <strong>Hlavní benefit:</strong> lepší krevní oběh, méně
              otoku po dlouhém běhu, rychlejší regenerace, méně bolestivých
              lýtkových svalů
            </li>
            <li>
              🎯 <strong>Pro koho:</strong> vytrvalostní běžci (10k+), trail
              runneři, triatlonisti, lidé s tendencí k otokům nebo křečím
            </li>
            <li>
              💸 <strong>Ceny:</strong> ponožky od 450 Kč, návleky od 700
              Kč, kompletní podkolenky 1 800–2 800 Kč
            </li>
            <li>
              📍 <strong>Kde:</strong> 100dola sport Šternberk, Partyzánská 2.
              Pro klienty z Olomouce, Uničova, Litovle, Mohelnice a Hranic
              posíláme nebo dovezeme osobně
            </li>
          </ul>
        </div>

        {/* 1. Co dělá */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-4">
            Co kompresní vybavení reálně dělá
          </h2>
          <p className="text-base text-[#5A6480] leading-relaxed mb-4">
            Kompresní textil funguje tak, že vytváří{" "}
            <strong>graduovaný tlak</strong> — nejsilnější u kotníku
            (typicky 18–22 mmHg) a postupně slabší směrem nahoru. Tento
            tlakový gradient:
          </p>
          <ul className="space-y-3 text-base text-[#1a1a2e] leading-relaxed list-disc list-outside ml-5 marker:text-[#E8431A] mb-6">
            <li>
              <strong>Podporuje žilní návrat krve.</strong> Krev má méně
              tendenci „stát" v lýtku — méně otoků, méně tíhy v nohou.
            </li>
            <li>
              <strong>Stabilizuje svaly.</strong> Méně vibrací lýtkového
              svalu při dopadu = méně mikrotraumat = rychlejší regenerace.
              Měřitelný efekt u běhů 10k+.
            </li>
            <li>
              <strong>Snižuje pravděpodobnost křečí.</strong> Lepší zásobení
              kyslíkem ke svalům, lepší odvod laktátu.
            </li>
            <li>
              <strong>Termoregulace.</strong> CEP textil odvádí vlhkost
              a v zimě udržuje teplotu kotníku (kde se nejrychleji ztrácí).
            </li>
          </ul>

          <p className="text-base text-[#5A6480] leading-relaxed">
            Kdy benefit poznáte: <strong>první trail run nad 15 km, první
            maraton, první triatlon nad olympic distance, první vytrvalostní
            závod.</strong> Pokud běháte 3× týdně 5 km, benefit existuje, ale
            není tak dramatický. Pokud si chcete v 50 letech udržet zdravé
            nohy, je to investice, která se vyplatí kumulativně.
          </p>
        </section>

        {/* 2. Modely */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-4">
            Které modely CEP máme a komu sedí
          </h2>

          <div className="space-y-4">
            <div className="bg-white border border-[#E2E6F3] rounded-2xl p-5">
              <div className="flex items-baseline gap-3 mb-2">
                <h3 className="text-lg font-black text-[#1a1a2e]">
                  Run Compression Socks
                </h3>
                <span className="text-xs uppercase tracking-wider font-bold text-[#E8431A]">
                  od 450 Kč
                </span>
              </div>
              <p className="text-sm text-[#5A6480] leading-relaxed mb-2">
                Kompresní ponožky do poloviny lýtka. Lehčí varianta — pro
                běžecké tréninky, kratší závody (5–15 km), jako každodenní
                doplněk pro lidi s otoky.
              </p>
              <p className="text-xs text-[#9AA3C2]">
                <strong>Vhodné pro:</strong> rekreační běžce, runy do 21 km,
                jako pracovní podpora pro lidi se stojácím povoláním.
              </p>
            </div>

            <div className="bg-white border border-[#E2E6F3] rounded-2xl p-5">
              <div className="flex items-baseline gap-3 mb-2">
                <h3 className="text-lg font-black text-[#1a1a2e]">
                  Calf Sleeves (Návleky na lýtka)
                </h3>
                <span className="text-xs uppercase tracking-wider font-bold text-[#E8431A]">
                  od 700 Kč
                </span>
              </div>
              <p className="text-sm text-[#5A6480] leading-relaxed mb-2">
                Pouze lýtko, bez chodidla. Můžete kombinovat s vlastními
                běžeckými ponožkami. Hodně populární u trailových runnerů,
                kteří chtějí kompresí + svou oblíbenou ponožku.
              </p>
              <p className="text-xs text-[#9AA3C2]">
                <strong>Vhodné pro:</strong> trail runy, ultratraily,
                běžce s preferovanou značkou ponožek.
              </p>
            </div>

            <div className="bg-white border border-[#E2E6F3] rounded-2xl p-5">
              <div className="flex items-baseline gap-3 mb-2">
                <h3 className="text-lg font-black text-[#1a1a2e]">
                  The Run Compression Socks Tall
                </h3>
                <span className="text-xs uppercase tracking-wider font-bold text-[#E8431A]">
                  od 1 800 Kč
                </span>
              </div>
              <p className="text-sm text-[#5A6480] leading-relaxed mb-2">
                Plné kompresní podkolenky — od chodidla po pod koleno. Maximální
                kompresí efekt. Bavlna + nylon + lycra v patentovaném mixu CEP.
              </p>
              <p className="text-xs text-[#9AA3C2]">
                <strong>Vhodné pro:</strong> půlmaratony, maratony, ultratrail.
                Hlavní volba pro vážné běžce.
              </p>
            </div>

            <div className="bg-white border border-[#E2E6F3] rounded-2xl p-5">
              <div className="flex items-baseline gap-3 mb-2">
                <h3 className="text-lg font-black text-[#1a1a2e]">
                  Recovery Compression Socks
                </h3>
                <span className="text-xs uppercase tracking-wider font-bold text-[#E8431A]">
                  od 2 200 Kč
                </span>
              </div>
              <p className="text-sm text-[#5A6480] leading-relaxed mb-2">
                Speciální regenerační varianta — vyšší tlakový gradient
                (22–32 mmHg). Nosí se PO běhu, nejlépe pár hodin (klidně i
                v noci). Urychluje odplav laktátu, snižuje pocit „těžkých
                nohou" druhý den.
              </p>
              <p className="text-xs text-[#9AA3C2]">
                <strong>Vhodné pro:</strong> regenerace po dlouhém běhu nebo
                triatlonu. Také po cestování (let, dlouhý let).
              </p>
            </div>

            <div className="bg-white border border-[#E2E6F3] rounded-2xl p-5">
              <div className="flex items-baseline gap-3 mb-2">
                <h3 className="text-lg font-black text-[#1a1a2e]">
                  Arm Sleeves (Návleky na paže)
                </h3>
                <span className="text-xs uppercase tracking-wider font-bold text-[#E8431A]">
                  od 700 Kč
                </span>
              </div>
              <p className="text-sm text-[#5A6480] leading-relaxed mb-2">
                Méně známé, ale chytré — kompresí + UV ochrana + termoregulace.
                Cyklisti je oceňují na chladnější vyjížďky, kdy chcete krátký
                dres + extra teplo na paže.
              </p>
              <p className="text-xs text-[#9AA3C2]">
                <strong>Vhodné pro:</strong> cyklistiku, jarní/podzimní běhy,
                triatlon bike leg.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Pro koho */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-4">
            Pro koho je CEP to pravé
          </h2>
          <p className="text-base text-[#5A6480] leading-relaxed mb-3">
            CEP má dvě tváře. Jednu funkční — <strong>must-have výbavu profíků</strong>{" "}
            v běhu, triatlonu a vytrvalostním sportu. A druhou{" "}
            <strong>lifestyle</strong>: kvalitní materiál, čisté řezy, výrazné barvy a
            logo, které dolaďuje outfit i mimo trénink. Pár, který si koupíte na
            maraton, nosíte pak roky i k mikině po městě.
          </p>
          <p className="text-base text-[#5A6480] leading-relaxed mb-6">
            Není to vybavení jen pro elitu — ale ani „obyčejná ponožka navíc".
            CEP je pro lidi, kteří chtějí z tréninku víc, déle se v běhu udržet,
            a kterým není jedno, jak věci po těle vypadají. Reálné cílovky:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-[#FBC9A8] rounded-xl p-5">
              <div className="text-2xl mb-2">🏃‍♀️</div>
              <h3 className="font-black text-[#9B3D17] mb-2">Vytrvalostní běžci</h3>
              <p className="text-sm text-[#5A6480] leading-relaxed">
                Půlmaraton, maraton, ultra. Lýtka po 25 km poděkují.
                Návleky nebo plné podkolenky — podle ročního období.
              </p>
            </div>
            <div className="bg-white border border-[#FBC9A8] rounded-xl p-5">
              <div className="text-2xl mb-2">⛰️</div>
              <h3 className="font-black text-[#9B3D17] mb-2">Trailrunneři</h3>
              <p className="text-sm text-[#5A6480] leading-relaxed">
                Nízký Jeseník, Bouzovsko, Oderské vrchy. Tady má komprese
                navíc smysl — ochrana před oděrkami od kamenů, větví, klestí.
              </p>
            </div>
            <div className="bg-white border border-[#FBC9A8] rounded-xl p-5">
              <div className="text-2xl mb-2">🏊</div>
              <h3 className="font-black text-[#9B3D17] mb-2">Triatlonisti</h3>
              <p className="text-sm text-[#5A6480] leading-relaxed">
                Aero kompresí na kolo + běh. CEP má speciální triatlon řadu,
                která se dá nosit pod neopren.
              </p>
            </div>
            <div className="bg-white border border-[#FBC9A8] rounded-xl p-5">
              <div className="text-2xl mb-2">💼</div>
              <h3 className="font-black text-[#9B3D17] mb-2">Pracující se stojicím povoláním</h3>
              <p className="text-sm text-[#5A6480] leading-relaxed">
                Lékaři, sestry, učitelé, prodavači. Otoky po 12 h ve stoje
                jsou reálná věc — kompresí (i jen Run Socks) přes den
                pomáhá.
              </p>
            </div>
            <div className="bg-white border border-[#FBC9A8] rounded-xl p-5">
              <div className="text-2xl mb-2">✈️</div>
              <h3 className="font-black text-[#9B3D17] mb-2">Časté cestování letadlem</h3>
              <p className="text-sm text-[#5A6480] leading-relaxed">
                Dlouhý let = riziko otoků a (vzácně) trombózy.
                Compression Recovery Socks na let do USA, Asie nebo do
                Malagy na kolo.
              </p>
            </div>
            <div className="bg-white border border-[#FBC9A8] rounded-xl p-5">
              <div className="text-2xl mb-2">🧓</div>
              <h3 className="font-black text-[#9B3D17] mb-2">Aktivní senioři</h3>
              <p className="text-sm text-[#5A6480] leading-relaxed">
                Po 50. roce mají žíly tendenci k oslabování. Kompresí
                pomáhá udržet aktivitu (turistika, lehčí běhy) bez
                bolesti nohou.
              </p>
            </div>
            <div className="bg-white border border-[#FBC9A8] rounded-xl p-5">
              <div className="text-2xl mb-2">✨</div>
              <h3 className="font-black text-[#9B3D17] mb-2">Lifestyle &amp; outfit</h3>
              <p className="text-sm text-[#5A6480] leading-relaxed">
                Nejvíc podceňované využití — CEP nosíte i mimo trénink. Stylová
                náhrada za bílé sportovní ponožky pod sneakers, doplněk k
                technickým outfitům (Lululemon, On, Stone Island), výrazná barva
                jako visual statement. Materiál vydrží 5+ let bez ztráty tvaru.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Jak vybrat velikost */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-4">
            Jak vybrat velikost — nejčastější chyba
          </h2>
          <p className="text-base text-[#5A6480] leading-relaxed mb-4">
            CEP velikosti se <strong>NE</strong>řídí velikostí boty. Řídí se
            <strong> obvodem kotníku a obvodem lýtka v nejširším místě</strong>.
            To je důvod, proč spousta lidí, kteří si koupí CEP online bez
            měření, dostane špatnou velikost a kompresí necítí.
          </p>

          <div className="bg-[#F0F4FF] border border-[#C4D2F0] rounded-2xl p-6 mb-4">
            <h3 className="font-black text-[#1a1a2e] mb-3">Jak se změřit doma</h3>
            <ol className="space-y-2 text-sm text-[#5A6480] list-decimal list-outside ml-5">
              <li>
                Krejčovským metrem změřte <strong>obvod kotníku</strong> v
                nejštíhlejším místě (mezi kotníkovou kostí a dolní hranou
                lýtkového svalu).
              </li>
              <li>
                Změřte <strong>obvod lýtka</strong> v nejširším místě
                (typicky 12–15 cm nad kotníkovou kostí).
              </li>
              <li>
                Změřte <strong>obvod stehna</strong> (jen pro plné
                triatlonové legíny).
              </li>
            </ol>
            <p className="text-xs text-[#9AA3C2] mt-3 italic">
              Měříme to v prodejně rychleji a přesněji — pokud jste z
              Olomouce, Uničova nebo Litovle, stačí přijet
              jednou, pak posíláme.
            </p>
          </div>

          <p className="text-sm text-[#9AA3C2] italic">
            CEP má 4 velikosti (II, III, IV, V) podle obvodu lýtka. Tabulka
            velikostí se najde na obale, ale doporučujeme se nechat změřit —
            rozdíl mezi „kompresí, která pracuje" a „kompresí, která ničí
            cévy" je v rozmezí 1 cm.
          </p>
        </section>

        {/* 5. Mýty */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-4">
            Nejčastější mýty o kompresním vybavení
          </h2>

          <div className="space-y-3">
            <div className="bg-white border border-[#E2E6F3] rounded-xl p-4">
              <div className="font-black text-[#1a1a2e] text-sm mb-1">
                ❌ „To je jen psychologický efekt"
              </div>
              <p className="text-sm text-[#5A6480]">
                Měřeno v laboratoři: kompresí 18–22 mmHg snižuje vibrace
                lýtkového svalu o 25 % během běhu. To se přepisuje na
                méně mikrotraumat a rychlejší regeneraci. Subjektivní
                pocit „lehčích nohou" je důsledek, ne příčina.
              </p>
            </div>
            <div className="bg-white border border-[#E2E6F3] rounded-xl p-4">
              <div className="font-black text-[#1a1a2e] text-sm mb-1">
                ❌ „Stačí mi kvalitní běžecká ponožka"
              </div>
              <p className="text-sm text-[#5A6480]">
                Kvalitní ponožka řeší úpln jiný problém (odvod vlhkosti,
                tlumení, neodřití). Kompresní vybavení řeší krevní oběh.
                Tady není jedno místo druhého.
              </p>
            </div>
            <div className="bg-white border border-[#E2E6F3] rounded-xl p-4">
              <div className="font-black text-[#1a1a2e] text-sm mb-1">
                ❌ „CEP je drahá — Decathlon má levnější"
              </div>
              <p className="text-sm text-[#5A6480]">
                CEP používá patentovanou tkaninu s definovanými tlakovými
                gradienty (graduace). Levné kompresní ponožky často mají
                rovnoměrný tlak — to nepodporuje žilní návrat, jen mačká.
                Cena 1 800 Kč za podkolenky, které vydrží 3–5 sezón, je
                ekonomicky lepší než ponožka za 500 Kč, kterou vyhodíte
                za rok.
              </p>
            </div>
            <div className="bg-white border border-[#E2E6F3] rounded-xl p-4">
              <div className="font-black text-[#1a1a2e] text-sm mb-1">
                ❌ „Když je teplo, kompresí mě udusí"
              </div>
              <p className="text-sm text-[#5A6480]">
                Moderní CEP modely (zejména Run a Triathlon řada) jsou
                lehké, prodyšné, s mesh panely v zónách, kde je třeba
                ventilace. Léto v CEP je v pohodě, pokud máte správnou
                velikost.
              </p>
            </div>
          </div>
        </section>

        {/* 6. Geo */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-4">
            Pro klienty ze Šternberku a okolí
          </h2>
          <div className="bg-[#FFF1EA] border border-[#FBC9A8] rounded-2xl p-6">
            <p className="text-sm text-[#5A6480] leading-relaxed mb-4">
              CEP brand v Česku není zastoupen v každém běžeckém obchodě —
              na Šternbersku jsme jeden z mála, kdo drží kompletní řadu
              skladem a kdo umí poradit s výběrem velikosti přímo
              v prodejně.
            </p>
            <ul className="space-y-2 text-sm text-[#1a1a2e] list-disc list-outside ml-5 marker:text-[#9B3D17]">
              <li>
                <strong>Šternberk, Olomouc, Uničov:</strong> nejjednodušší
                cesta — přijeďte do prodejny, změříme a vyzkoušíte
              </li>
              <li>
                <strong>Litovel, Mohelnice, Hranice:</strong> doručíme
                osobně při dohodě, často během týdne
              </li>
              <li>
                <strong>Ostrava, Brno, Praha:</strong> posíláme balíkem nebo
                přivezeme při pravidelných cestách
              </li>
              <li>
                <strong>Konzultace na dálku:</strong> pošlete míry kotníku
                a lýtka, doporučíme model a velikost
              </li>
            </ul>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-br from-[#9B3D17] to-[#E8431A] text-white rounded-2xl p-6 md:p-8 text-center mt-16">
          <div className="text-[10px] uppercase tracking-wider font-bold text-[#FFD5C2] mb-2">
            CEP — autorizovaný prodej 100dola sport
          </div>
          <h2 className="text-xl md:text-2xl font-black mb-3">
            Pomůžeme vybrat správný model
          </h2>
          <p className="text-sm text-white/85 max-w-md mx-auto mb-5">
            Stačí krátký dotaz — typ běhu, vzdálenost, velikost, případně
            obvod lýtka. Doporučíme model a vyřešíme dodání podle vašeho
            města.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/sport/beh"
              className="px-5 py-3 rounded-full bg-white text-[#9B3D17] text-sm font-black hover:opacity-90"
            >
              Běh & běžecké vybavení →
            </Link>
            <Link
              href="/kontakt"
              className="px-5 py-3 rounded-full border border-white/30 text-white text-sm font-bold hover:bg-white/10"
            >
              Kontaktovat 100dola sport
            </Link>
          </div>
        </section>
      </div>
    </article>
  );
}
