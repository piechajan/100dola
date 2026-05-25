import Link from "next/link";
import Image from "next/image";

/**
 * SEO článek "Social rides na Valašsku — Open Miles Clinic" — target keywords:
 *   - "social rides valašsko"
 *   - "social rides vsetín"
 *   - "social rides valašské meziříčí"
 *   - "cyklistická komunita valašsko"
 *   - "Open Miles Clinic"
 *   - "skialpy valašsko"
 *   - "vyjížďky beskydy"
 *
 * Pozicování: pohodová cyklistická komunita pro dospělé jezdce, kteří
 * chtějí pravidelný pohyb + dobré kafe + lidi bez ega. Geo: Valašsko +
 * Beskydy + Jeseníky.
 */
export default function SocialRidesOmc() {
  return (
    <article className="bg-white">
      <div className="max-w-[820px] mx-auto px-6 md:px-12 py-12 md:py-16">
        {/* Lead */}
        <p className="text-lg text-[#5A6480] leading-relaxed mb-10">
          <strong>Open Miles Clinic</strong> je společenství lidí na
          Valašsku, kteří se rádi hýbou — silnice, gravel, MTB, skialpy,
          běh, túry v Beskydech. Žádné závodění, žádné ego. Jezdíme tempem,
          které sedí většině, začínáme nebo končíme v dobré kavárně, a vždy
          se na konec sejdeme nad kafem nebo pivem. Tohle je článek o tom,
          co OMC je, jak to probíhá a jak se přidat.
        </p>

        {/* Quick summary */}
        <div className="bg-[#EDFAF3] border border-[#A8DCC3] rounded-2xl p-6 mb-12">
          <div className="text-[10px] uppercase tracking-wider font-bold text-[#2EAA6E] mb-3">
            V kostce
          </div>
          <ul className="space-y-2 text-sm text-[#1a1a2e]">
            <li>
              👥 <strong>Kdo:</strong> dospělí jezdci na Valašsku a okolí
              (Vsetín, Valašské Meziříčí, Rožnov, Karolinka, Hostýnské vrchy,
              Beskydy)
            </li>
            <li>
              🚲 <strong>Co:</strong> silniční vyjížďky, gravel, MTB,
              skialpy v zimě, běh, jednodenní túry
            </li>
            <li>
              ☕ <strong>Princip:</strong> tempo skupiny, kafe na začátku
              nebo na konci, lokální podniky, nikdo není sám
            </li>
            <li>
              📍 <strong>Hlavní lokality:</strong> Valašsko + Beskydy +
              Hostýnské vrchy + Jeseníky (jen občas)
            </li>
            <li>
              🆓 <strong>Cena:</strong> jen za vlastní kafe a oběd.
              Registrace a účast je zdarma.
            </li>
          </ul>
        </div>

        {/* 1. Proč to vzniklo */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-4">
            Proč Open Miles Clinic vznikl
          </h2>
          <p className="text-base text-[#5A6480] leading-relaxed mb-4">
            Cyklistická scéna na Valašsku má dvě extrémy: na jedné straně
            závodní týmy s vysokým tempem a tlakem na čísla; na druhé jezdí
            kdokoliv sám se Stravou v ruce. Mezi tím chyběl prostor pro
            <strong> dospělé lidi, kteří se chtějí hýbat pro radost, ale ne
            sami</strong> — a kteří k cyklistice patří i kafe, jídlo a pokec
            po jízdě.
          </p>
          <p className="text-base text-[#5A6480] leading-relaxed">
            OMC vznikl v roce 2025 jako pravidelná setkávání u Chochino
            Koloniál Kafé ve Valašském Meziříčí. Z pár lidí se rozrostla
            komunita, která dnes vyjíždí napříč všemi sezónami a aktivitami.
          </p>
        </section>

        {/* 2. Hodnoty */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-4">
            Na čem nám záleží
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-[#A8DCC3] rounded-xl p-5">
              <div className="text-2xl mb-2">🤝🏼</div>
              <h3 className="font-black text-[#2EAA6E] mb-2">Tempo skupiny</h3>
              <p className="text-sm text-[#5A6480] leading-relaxed">
                Nikdo není sám vepředu, nikdo není sám vzadu. Pokud rozdíl
                ve výkonnosti není diametrální, vyjedeš kopec svým tempem
                a nahoře tě počkáme. Vracíme se spolu.
              </p>
            </div>
            <div className="bg-white border border-[#A8DCC3] rounded-xl p-5">
              <div className="text-2xl mb-2">📍</div>
              <h3 className="font-black text-[#2EAA6E] mb-2">Prověřené, lokální</h3>
              <p className="text-sm text-[#5A6480] leading-relaxed">
                Spolupracujeme s osvědčenými kavárnami a restauracemi
                v regionu — vyjížďky tam buď začínají, nebo končí. Kafe,
                pivo, pokec a sdílení. K pohybu pro nás patří stejně jako
                kola.
              </p>
            </div>
            <div className="bg-white border border-[#A8DCC3] rounded-xl p-5">
              <div className="text-2xl mb-2">🏔️</div>
              <h3 className="font-black text-[#2EAA6E] mb-2">Kolo, lyže, příroda</h3>
              <p className="text-sm text-[#5A6480] leading-relaxed">
                Cyklistika v sezóně, skialpy a běžky v zimě, túry a běh
                celoročně. Platforma roste s komunitou — pokud chcete přidat
                aktivitu, kterou tu chybí, řekněte.
              </p>
            </div>
            <div className="bg-white border border-[#A8DCC3] rounded-xl p-5">
              <div className="text-2xl mb-2">❤️</div>
              <h3 className="font-black text-[#2EAA6E] mb-2">Žádné ego</h3>
              <p className="text-sm text-[#5A6480] leading-relaxed">
                Přijdete sami, odejdete s kontakty. Komunita je základ —
                vybavení je bonus. Hodně lidí u nás našlo nové parťáky
                na vyjížďky i mimo OMC eventy.
              </p>
            </div>
            <div className="bg-white border border-[#A8DCC3] rounded-xl p-5 md:col-span-2">
              <div className="text-2xl mb-2">✨</div>
              <h3 className="font-black text-[#2EAA6E] mb-2">Stylová cyklistika</h3>
              <p className="text-sm text-[#5A6480] leading-relaxed">
                Sport, který nás baví, si zaslouží péči o detaily — pěkné
                kolo, dobrý dres, ladící vybavení. Není to o póze, je to
                o radosti z celku. K dobrému kolu patří dobré kafe a
                rozumné lidi okolo.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Aktivity */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-4">
            Co jezdíme a kde
          </h2>

          <div className="space-y-5">
            <div className="bg-white border border-[#E2E6F3] rounded-2xl p-5">
              <div className="flex items-baseline gap-3 mb-2">
                <h3 className="text-lg font-black text-[#1a1a2e]">🚴‍♂️ Silniční vyjížďky</h3>
                <span className="text-xs uppercase tracking-wider font-bold text-[#2EAA6E]">
                  jaro – podzim
                </span>
              </div>
              <p className="text-sm text-[#5A6480] leading-relaxed">
                Sobotní a nedělní vyjížďky 60–120 km, většinou od kavárny
                Chochino ve Valašském Meziříčí. Trasy přes Vsetín, Karolinku,
                Velké Karlovice, Soláň, Hostýnské vrchy. Tempo skupiny,
                společný start, společný cíl.
              </p>
            </div>

            <div className="bg-white border border-[#E2E6F3] rounded-2xl p-5">
              <div className="flex items-baseline gap-3 mb-2">
                <h3 className="text-lg font-black text-[#1a1a2e]">🧗 Gravel a MTB</h3>
                <span className="text-xs uppercase tracking-wider font-bold text-[#2EAA6E]">
                  jaro – podzim
                </span>
              </div>
              <p className="text-sm text-[#5A6480] leading-relaxed">
                Lesní cesty Beskyd, traily kolem Vsetína a Rožnova, výjezdy
                na hřebeny. Méně asfalt, víc přírody. Vhodné pro
                gravel kolo i hardtail MTB.
              </p>
            </div>

            <div className="bg-white border border-[#E2E6F3] rounded-2xl p-5">
              <div className="flex items-baseline gap-3 mb-2">
                <h3 className="text-lg font-black text-[#1a1a2e]">⛷️ Skialpy a běžky</h3>
                <span className="text-xs uppercase tracking-wider font-bold text-[#2EAA6E]">
                  zima
                </span>
              </div>
              <p className="text-sm text-[#5A6480] leading-relaxed">
                Beskydy (Lysá hora, Soláň, Pustevny), Jeseníky (Praděd,
                Dlouhé Stráně) když to počasí dovolí. Vyrážíme za dobrým
                sněhem, ne za výškovkou. Skialpový kroužek je menší než
                cyklo, ale stálý.
              </p>
            </div>

            <div className="bg-white border border-[#E2E6F3] rounded-2xl p-5">
              <div className="flex items-baseline gap-3 mb-2">
                <h3 className="text-lg font-black text-[#1a1a2e]">🏃 Běh a túry</h3>
                <span className="text-xs uppercase tracking-wider font-bold text-[#2EAA6E]">
                  celoročně
                </span>
              </div>
              <p className="text-sm text-[#5A6480] leading-relaxed">
                Společné běhy, jednodenní túry, sezónní akce. Hostýnské
                vrchy, Pulčín, Vsetínské vrchy, údolí Bečvy. Pro běžce
                máme i konzultace vybavení — viz článek o CEP.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Typický průběh */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-4">
            Jak typický OMC den vypadá
          </h2>
          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-[#2EAA6E] text-white text-sm font-black flex items-center justify-center flex-shrink-0">1</div>
              <div>
                <h3 className="font-black text-[#1a1a2e] mb-1">Sraz u kavárny (9:00)</h3>
                <p className="text-sm text-[#5A6480] leading-relaxed">
                  Většinou Chochino Koloniál Kafé ve Valašském Meziříčí
                  (nebo jiná dle ridu). Espresso, krátký pokec, kontrola
                  kola, doplnění lahví.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-[#2EAA6E] text-white text-sm font-black flex items-center justify-center flex-shrink-0">2</div>
              <div>
                <h3 className="font-black text-[#1a1a2e] mb-1">Společný start (9:30)</h3>
                <p className="text-sm text-[#5A6480] leading-relaxed">
                  Vyrážíme jako skupina, tempo se ladí podle nejpomalejšího.
                  V kopcích každý svým tempem, nahoře čekáme.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-[#2EAA6E] text-white text-sm font-black flex items-center justify-center flex-shrink-0">3</div>
              <div>
                <h3 className="font-black text-[#1a1a2e] mb-1">Coffee stop v polovině</h3>
                <p className="text-sm text-[#5A6480] leading-relaxed">
                  Po 30–50 km zastávka v lokálním podniku — kafe, voda,
                  případně lehký oběd. Předem víme kde.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-[#2EAA6E] text-white text-sm font-black flex items-center justify-center flex-shrink-0">4</div>
              <div>
                <h3 className="font-black text-[#1a1a2e] mb-1">Druhá půlka + cíl</h3>
                <p className="text-sm text-[#5A6480] leading-relaxed">
                  Klidnější tempo, obvykle 30–60 km zpátky. Cíl většinou
                  tam, kde jsme začali (Valašské Meziříčí) nebo v jiném
                  partnerském podniku.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-[#2EAA6E] text-white text-sm font-black flex items-center justify-center flex-shrink-0">5</div>
              <div>
                <h3 className="font-black text-[#1a1a2e] mb-1">Pivo, oběd, povídání</h3>
                <p className="text-sm text-[#5A6480] leading-relaxed">
                  Kdo má čas, zůstává na pivo nebo oběd. Tady se obvykle
                  rodí přátelství i plány na další vyjížďky. Nikdo nikoho
                  netlačí — kdo musí zpátky, jede.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Pro koho */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-4">
            Pro koho je OMC
          </h2>
          <p className="text-base text-[#5A6480] leading-relaxed mb-6">
            Komunita stojí na dvou typech lidí — a oba se doplňují:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-[#A8DCC3] rounded-xl p-5">
              <h3 className="font-black text-[#2EAA6E] mb-2">Dospělý hobby cyklista</h3>
              <ul className="text-sm text-[#5A6480] space-y-2 list-disc list-outside ml-4">
                <li>Jezdí pro radost, ne pro čas</li>
                <li>Chce pravidelný pohyb a parťáky</li>
                <li>Ocení pěkné kolo a dobré kafe</li>
                <li>Nepotřebuje trénink ani tlak</li>
              </ul>
            </div>
            <div className="bg-white border border-[#A8DCC3] rounded-xl p-5">
              <h3 className="font-black text-[#2EAA6E] mb-2">Bývalý nebo aktivní závodník</h3>
              <ul className="text-sm text-[#5A6480] space-y-2 list-disc list-outside ml-4">
                <li>Chce občas vyjet bez stopwatch</li>
                <li>Hledá víkendovou socialní výjezd</li>
                <li>Pomáhá ostatním v kopcích, sdílí zkušenosti</li>
                <li>Pro něj OMC = reset z tlaku</li>
              </ul>
            </div>
          </div>
          <p className="text-base text-[#5A6480] leading-relaxed mt-6">
            <strong>Nepotřebujete:</strong> drahé kolo, závodní formu,
            zkušenosti, ani Strava účet. Jen funkční kolo a chuť vyjet.
            Pokud teprve uvažujete o novém kole, rádi vám poradíme — viz{" "}
            <Link href="/clanky/kde-koupit-kolo-sternberk" className="text-[#3B7CF4] font-bold hover:underline">
              průvodce nákupu kola
            </Link>
            .
          </p>
        </section>

        {/* 6. Jak se přidat */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-4">
            Jak se přidat
          </h2>
          <div className="space-y-4">
            <div className="bg-white border border-[#E2E6F3] rounded-2xl p-5">
              <h3 className="font-black text-[#1a1a2e] mb-2">1. Sleduj kalendář akcí</h3>
              <p className="text-sm text-[#5A6480] leading-relaxed">
                Nejbližší akce jsou na{" "}
                <Link href="/community" className="text-[#2EAA6E] font-bold hover:underline">
                  community page 100dola
                </Link>
                {" "}— typ jízdy, kde, kdy. Stačí přijít na sraz, není potřeba
                se předem hlásit (pokud to není event s kapacitou).
              </p>
            </div>
            <div className="bg-white border border-[#E2E6F3] rounded-2xl p-5">
              <h3 className="font-black text-[#1a1a2e] mb-2">2. Sleduj nás na Stravě a Instagramu</h3>
              <p className="text-sm text-[#5A6480] leading-relaxed">
                Strava klub{" "}
                <a
                  href="https://www.strava.com/clubs/2070600"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#FC4C02] font-bold hover:underline"
                >
                  Open Miles Clinic
                </a>
                {" "}— tam jsou všechny eventy a aktivity. Plus{" "}
                <a
                  href="https://www.instagram.com/open_miles_clinic/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#2EAA6E] font-bold hover:underline"
                >
                  @open_miles_clinic
                </a>
                {" "}na Instagramu pro fotky z vyjížděk.
              </p>
            </div>
            <div className="bg-white border border-[#E2E6F3] rounded-2xl p-5">
              <h3 className="font-black text-[#1a1a2e] mb-2">3. Přijď</h3>
              <p className="text-sm text-[#5A6480] leading-relaxed">
                Žádná registrace, žádné poplatky. Stačí přijet na sraz,
                pozdravit a vyjet s námi. První vyjížďka je vždycky
                doporučujeme tu kratší — abys poznal/a tempo a styl. Pak
                už si vybereš podle nálady.
              </p>
            </div>
          </div>
        </section>

        {/* 7. Geo */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-4">
            Kde nás potkáš
          </h2>
          <div className="bg-[#EDFAF3] border border-[#A8DCC3] rounded-2xl p-6">
            <p className="text-sm text-[#5A6480] leading-relaxed mb-3">
              Hlavní zázemí OMC je <strong>Valašsko</strong> (Valašské
              Meziříčí, Vsetín, Rožnov pod Radhoštěm, Karolinka). Cyklisty
              ale máme i z Olomouce, Ostravy, Brna a Prahy — kdo má cestu,
              přijíždí.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <strong className="text-[#1F4937]">Cyklo lokality:</strong>
                <ul className="text-[#5A6480] mt-1 space-y-0.5 list-disc list-outside ml-4">
                  <li>Valašsko (Vsetínské vrchy, Javorníky)</li>
                  <li>Hostýnské vrchy</li>
                  <li>Beskydy (Lysá hora, Pustevny)</li>
                  <li>Bečva a Litovelské Pomoraví</li>
                </ul>
              </div>
              <div>
                <strong className="text-[#1F4937]">Zimní lokality:</strong>
                <ul className="text-[#5A6480] mt-1 space-y-0.5 list-disc list-outside ml-4">
                  <li>Beskydy (Lysá hora, Soláň)</li>
                  <li>Hostýnské vrchy</li>
                  <li>Jeseníky (Praděd, Dlouhé Stráně)</li>
                  <li>Bílé Karpaty</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 8. Propojení se 100dola sport */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-4">
            Propojení se 100dola sport
          </h2>
          <p className="text-base text-[#5A6480] leading-relaxed mb-4">
            Open Miles Clinic vyrostl kolem{" "}
            <Link href="/sport" className="text-[#3B7CF4] font-bold hover:underline">
              100dola sport
            </Link>
            {" "}— prodejny cyklistického a sportovního vybavení ve Šternberku
            (a od 2027 plánovaně ve Vsetíně). Spojení dává smysl:
          </p>
          <ul className="space-y-3 text-base text-[#1a1a2e] leading-relaxed list-disc list-outside ml-5 marker:text-[#2EAA6E]">
            <li>
              Pokud uvažujete o novém kole — pomůžeme vybrat (
              <Link href="/clanky/kde-koupit-kolo-sternberk" className="text-[#3B7CF4] font-bold hover:underline">
                průvodce
              </Link>
              )
            </li>
            <li>
              Pokud potřebujete servis — máme dílnu{" "}
              <Link href="/lab" className="text-[#3B7CF4] font-bold hover:underline">
                100dola Lab
              </Link>
            </li>
            <li>
              Pokud uvažujete o zimním ježdění v teple — provozujeme{" "}
              <Link href="/malaga" className="text-[#3B7CF4] font-bold hover:underline">
                cycling base v Malaze
              </Link>
              {" "}(přeprava + uskladnění kol)
            </li>
            <li>
              Pokud chcete běžet/skialpovat — máme i běžecké a skialpové
              vybavení (CEP, Dynastar a další)
            </li>
          </ul>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-br from-[#1F4937] to-[#2EAA6E] text-white rounded-2xl p-6 md:p-8 text-center mt-16">
          <div className="text-[10px] uppercase tracking-wider font-bold text-[#A8DCC3] mb-2">
            Open Miles Clinic
          </div>
          <h2 className="text-xl md:text-2xl font-black mb-3">
            Přijď zkusit. Není to závazek.
          </h2>
          <p className="text-sm text-white/80 max-w-md mx-auto mb-5">
            První vyjížďka je vždycky nejlepší způsob, jak poznat, zda
            tempo a styl sedí. Nikdo nikoho netlačí, nikdo neměří.
            Jezdíme jak máme rádi — společně.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/community"
              className="px-5 py-3 rounded-full bg-white text-[#1F4937] text-sm font-black hover:opacity-90"
            >
              Nadcházející eventy →
            </Link>
            <a
              href="https://www.strava.com/clubs/2070600"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-full border border-white/30 text-white text-sm font-bold hover:bg-white/10"
            >
              Strava klub OMC
            </a>
          </div>
        </section>
      </div>
    </article>
  );
}
