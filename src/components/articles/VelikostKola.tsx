import Link from "next/link";

/**
 * SEO článek "Jak vybrat velikost kola" — target keywords:
 *   - "jak vybrat velikost kola"
 *   - "velikost kola podle výšky"
 *   - "tabulka velikostí kol"
 *   - "měření inseam"
 *   - "bikefit Šternberk / Vsetín / Olomouc"
 *
 * Pozicování: prodejní, konzultativní. Měření doma jako orientace,
 * pak osobní konzultace + bikefit jako sales hook.
 */
export default function VelikostKola() {
  return (
    <article className="bg-white">
      <div className="max-w-[820px] mx-auto px-6 md:px-12 py-12 md:py-16">
        {/* Lead */}
        <p className="text-lg text-[#5A6480] leading-relaxed mb-10">
          Správná velikost rámu je nejdůležitější parametr kola — víc než
          značka, komponenty nebo cena. Špatná velikost ničí nejen výkon,
          ale hlavně dlouhodobé zdraví zad, kolen a rukou. Tento průvodce
          ukazuje, jak se doma změřit pro orientaci a jak vybíráme velikost
          společně v 100dola sport. <strong>Konzultace je u nás vždy
          zdarma</strong> — a u dražších kol důrazně doporučujeme i
          bikefit.
        </p>

        {/* Quick summary */}
        <div className="bg-[#F0F4FF] border border-[#C4D2F0] rounded-2xl p-6 mb-12">
          <div className="text-[10px] uppercase tracking-wider font-bold text-[#3B7CF4] mb-3">
            V kostce
          </div>
          <ul className="space-y-2 text-sm text-[#1a1a2e]">
            <li>
              📏 <strong>Co změřit doma:</strong> výška, inseam (vnitřní
              délka nohou), délka paže, trup, šířka ramen
            </li>
            <li>
              🪜 <strong>Stačí pomůcky:</strong> krejčovský metr, ploché
              tvrdé desky (kniha), zeď, partner na zapsání čísel
            </li>
            <li>
              📋 <strong>Použijeme to k čemu:</strong> orientační výběr
              rámové velikosti, doporučení modelu, kontrola u dodavatele
              dostupnosti
            </li>
            <li>
              🎯 <strong>Bikefit:</strong> pro kola nad 60k a pro lidi,
              kteří ježdí 3+× týdně, doporučujeme i bikefit (nastavení
              sedla, řídítek, vzdáleností) — 1 500–3 500 Kč podle rozsahu
            </li>
            <li>
              📍 <strong>Kde:</strong> 100dola sport Šternberk, Partyzánská 2.
              Pro klienty z Vsetína, Valašského Meziříčí, Olomouce, Ostravy
              a Brna domluvíme osobní termín
            </li>
          </ul>
        </div>

        {/* 1. Proč velikost rozhoduje */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-4">
            Proč je velikost důležitější než značka
          </h2>
          <p className="text-base text-[#5A6480] leading-relaxed mb-4">
            Levné kolo ve správné velikosti přebije drahé kolo ve špatné.
            Důvod je jednoduchý: <strong>celá geometrie rámu (reach, stack,
            seat tube angle, head tube angle)</strong> je navržená pro
            konkrétní rozsah tělesných proporcí. Když sedíte na kole o
            velikost vedle:
          </p>
          <ul className="space-y-3 text-base text-[#1a1a2e] leading-relaxed list-disc list-outside ml-5 marker:text-[#3B7CF4]">
            <li>
              <strong>Zranění kolen.</strong> Špatná výška sedla = patelární
              tendinitida nebo IT band syndrom. Trvá rok, než to přejde.
            </li>
            <li>
              <strong>Bolest zad.</strong> Příliš dlouhé top tube = vy se
              musíte natáhnout, krční páteř protestuje po hodině.
            </li>
            <li>
              <strong>Necitlivé ruce.</strong> Špatná pozice = příliš váhy
              na řídítkách, tlak na nervy v dlaních.
            </li>
            <li>
              <strong>Bolest hýždí a sedacího nervu.</strong> Špatný úhel
              sedla nebo špatná výška = znecitlivění, otlaky.
            </li>
            <li>
              <strong>Nižší výkon.</strong> Tělo má jeden silový optimální
              úhel kolen — odchýlení se = ztrácíte watty.
            </li>
          </ul>
          <p className="text-base text-[#5A6480] leading-relaxed mt-4">
            Tohle je proč ke každému kolu, které u nás kupujete,
            probereme velikost dvakrát: <strong>jednou před objednáním</strong>{" "}
            (abychom objednali správnou variantu) a <strong>jednou po
            sestavení</strong> (abychom dotáhli sedlo, řídítka a další
            detaily na míru).
          </p>
        </section>

        {/* 2. Měření doma - kompletní návod */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-4">
            Jak se změřit doma — orientace pro výběr velikosti
          </h2>
          <p className="text-base text-[#5A6480] leading-relaxed mb-6">
            Tyto míry vám pomohou udělat <strong>orientační výběr</strong>{" "}
            ze 3–4 variant velikosti rámu. Finální rozhodnutí děláme
            v prodejně, kde si na kolo i fyzicky sednete. Pomůcky: krejčovský
            metr, tvrdá rovná deska (kniha v pevné vazbě), zeď a partner.
          </p>

          <div className="space-y-6">
            <div className="bg-white border border-[#E2E6F3] rounded-2xl p-5">
              <div className="flex items-baseline gap-3 mb-3">
                <span className="w-8 h-8 rounded-full bg-[#3B7CF4] text-white text-sm font-black flex items-center justify-center flex-shrink-0">1</span>
                <h3 className="text-lg font-black text-[#1a1a2e]">Výška (height)</h3>
              </div>
              <p className="text-sm text-[#5A6480] leading-relaxed mb-3">
                <strong>Jak:</strong> Postavte se k rovné zdi bez bot, paty,
                hýždě a lopatky lehce dotýkají zdi. Hlava ve neutrální pozici
                (brada rovnoběžná se zemí). Položte tvrdou desku na temeno
                hlavy, kolmou ke zdi. Změřte vzdálenost od podlahy k desce.
              </p>
              <p className="text-xs text-[#9AA3C2]">
                <strong>Typický rozsah:</strong> 155–200 cm. Z výšky odhadneme
                vstupní velikost rámu (XS, S, M, L, XL), ale není to dostačující
                samostatně — proto měříme i inseam.
              </p>
            </div>

            <div className="bg-white border border-[#E2E6F3] rounded-2xl p-5">
              <div className="flex items-baseline gap-3 mb-3">
                <span className="w-8 h-8 rounded-full bg-[#3B7CF4] text-white text-sm font-black flex items-center justify-center flex-shrink-0">2</span>
                <h3 className="text-lg font-black text-[#1a1a2e]">Inseam (vnitřní délka nohou)</h3>
              </div>
              <p className="text-sm text-[#5A6480] leading-relaxed mb-3">
                <strong>Jak:</strong> Stůjte bos, nohy 15 cm od sebe. Mezi
                nohy si vsuňte knihu nebo tvrdou desku tak, aby se vám tlačila
                přesně do rozkroku (jak by tlačilo sedlo kola — pevně, ale
                pohodlně). Změřte vzdálenost od horní hrany knihy k podlaze.
              </p>
              <p className="text-xs text-[#9AA3C2]">
                <strong>Klíčová míra.</strong> Inseam určuje výšku sedla
                (typicky inseam × 0,883) a do velké míry rozhoduje o velikosti
                rámu. Dva lidé stejné výšky mohou mít inseam lišící se o 5+
                cm — pak potřebují jinou velikost.
              </p>
            </div>

            <div className="bg-white border border-[#E2E6F3] rounded-2xl p-5">
              <div className="flex items-baseline gap-3 mb-3">
                <span className="w-8 h-8 rounded-full bg-[#3B7CF4] text-white text-sm font-black flex items-center justify-center flex-shrink-0">3</span>
                <h3 className="text-lg font-black text-[#1a1a2e]">Délka paže</h3>
              </div>
              <p className="text-sm text-[#5A6480] leading-relaxed mb-3">
                <strong>Jak:</strong> Paži natáhněte do strany kolmo na trup,
                dlaň otevřená dolů. Změřte vzdálenost od horní hrany ramene
                (acromion — kostnatý výběžek) ke špičce prostředníčku.
              </p>
              <p className="text-xs text-[#9AA3C2]">
                <strong>Použití:</strong> Pomáhá určit délku top tube
                a doporučenou délku stem (představce). Dlouhé paže = můžete
                jet delší rám / delší stem. Krátké paže = potřebujete
                kratší kombinaci.
              </p>
            </div>

            <div className="bg-white border border-[#E2E6F3] rounded-2xl p-5">
              <div className="flex items-baseline gap-3 mb-3">
                <span className="w-8 h-8 rounded-full bg-[#3B7CF4] text-white text-sm font-black flex items-center justify-center flex-shrink-0">4</span>
                <h3 className="text-lg font-black text-[#1a1a2e]">Délka trupu</h3>
              </div>
              <p className="text-sm text-[#5A6480] leading-relaxed mb-3">
                <strong>Jak:</strong> Sedněte si rovně na pevnou židli bez
                opěrky. Změřte vzdálenost od sedacích kostí (sit bones —
                kostnaté body, na kterých sedíte) k horní hraně lopatky
                (nebo k bázi krku). Partner měří krejčovským metrem.
              </p>
              <p className="text-xs text-[#9AA3C2]">
                <strong>Použití:</strong> Spolu s délkou paže určuje reach
                (dosah) — jak daleko od sedla máte řídítka. Kombinace
                krátký trup + dlouhé paže = delší rám OK. Dlouhý trup +
                krátké paže = pozor, snáz se přetížíte vepředu.
              </p>
            </div>

            <div className="bg-white border border-[#E2E6F3] rounded-2xl p-5">
              <div className="flex items-baseline gap-3 mb-3">
                <span className="w-8 h-8 rounded-full bg-[#3B7CF4] text-white text-sm font-black flex items-center justify-center flex-shrink-0">5</span>
                <h3 className="text-lg font-black text-[#1a1a2e]">Šířka ramen</h3>
              </div>
              <p className="text-sm text-[#5A6480] leading-relaxed mb-3">
                <strong>Jak:</strong> Postavte se rovně. Změřte vzdálenost
                mezi horními hranami obou ramen (od acromion k acromion).
              </p>
              <p className="text-xs text-[#9AA3C2]">
                <strong>Použití:</strong> Určuje šířku řídítek. Pravidlo:
                šířka řídítek = šířka ramen ±2 cm. Standardní silniční řídítka
                jsou 38/40/42/44 cm. Příliš úzká = stísněný posaz, příliš
                široká = ztrácíte aerodynamiku.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Co s mírami */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-4">
            Co s těmi mírami dál
          </h2>
          <p className="text-base text-[#5A6480] leading-relaxed mb-6">
            Když máte zápisek se všemi pěti mírami, máte sami pro sebe
            jasnější obrázek — a nám to dramaticky zjednoduší konzultaci.
            Tady je co s nimi:
          </p>

          <div className="overflow-hidden rounded-2xl border border-[#E2E6F3] mb-6">
            <table className="w-full text-sm">
              <thead className="bg-[#F0F4FF]">
                <tr>
                  <th className="text-left p-4 font-black text-[#1a1a2e]">Výška</th>
                  <th className="text-left p-4 font-black text-[#1a1a2e]">Inseam (orientačně)</th>
                  <th className="text-left p-4 font-black text-[#1a1a2e]">Rám silnice/gravel</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E6F3]">
                <tr>
                  <td className="p-3 font-bold">155–164 cm</td>
                  <td className="p-3 text-[#5A6480]">70–76 cm</td>
                  <td className="p-3 text-[#5A6480]">XS / 47–50 cm</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold">164–172 cm</td>
                  <td className="p-3 text-[#5A6480]">75–82 cm</td>
                  <td className="p-3 text-[#5A6480]">S / 51–53 cm</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold">172–180 cm</td>
                  <td className="p-3 text-[#5A6480]">80–86 cm</td>
                  <td className="p-3 text-[#5A6480]">M / 54–55 cm</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold">180–188 cm</td>
                  <td className="p-3 text-[#5A6480]">85–92 cm</td>
                  <td className="p-3 text-[#5A6480]">L / 56–58 cm</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold">188–196 cm</td>
                  <td className="p-3 text-[#5A6480]">90–98 cm</td>
                  <td className="p-3 text-[#5A6480]">XL / 58–60 cm</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold">196+ cm</td>
                  <td className="p-3 text-[#5A6480]">95+ cm</td>
                  <td className="p-3 text-[#5A6480]">XXL / 60+ cm</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-sm text-[#9AA3C2] italic">
            Tato tabulka je orientační — různé značky mají různé geometrie
            (SCOTT, ISAAC, Ridley, Pinarello, Ghost se navzájem liší o 1–2 cm
            v stejné velikosti). Při výběru konkrétního kola s vámi
            porovnáme jeho geometrii s vašimi mírami.
          </p>
        </section>

        {/* 4. Pojďme to projít spolu */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-4">
            Pojďme to projít spolu — konzultace v 100dola sport
          </h2>
          <p className="text-base text-[#5A6480] leading-relaxed mb-6">
            Tabulka výše vás dostane na 80 %. Posledních 20 % rozhoduje
            o tom, jestli budete kolo milovat nebo se na něm budete trápit —
            a to je něco, co se měřit doma nedá. Když přijdete s mírami
            (nebo si vás změříme my), projdeme:
          </p>

          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-[#3B7CF4] text-white text-sm font-black flex items-center justify-center flex-shrink-0">1</div>
              <div>
                <h3 className="font-black text-[#1a1a2e] mb-1">Kontrola vašich měr</h3>
                <p className="text-sm text-[#5A6480] leading-relaxed">
                  Pokud jste si měřili doma, znovu zkontrolujeme klíčové
                  (inseam, šířku ramen). Pokud nemáte, změříme. Trvá 5
                  minut. Zdarma.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-[#3B7CF4] text-white text-sm font-black flex items-center justify-center flex-shrink-0">2</div>
              <div>
                <h3 className="font-black text-[#1a1a2e] mb-1">Doporučení 2–3 modelů</h3>
                <p className="text-sm text-[#5A6480] leading-relaxed">
                  Podle vašich měr, typu jízdy a rozpočtu doporučíme
                  konkrétní modely. Porovnáme jejich geometrii s vašimi
                  proporcemi — někdy se ukáže, že „L" jednoho výrobce vám
                  sedne, „L" jiného ne.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-[#3B7CF4] text-white text-sm font-black flex items-center justify-center flex-shrink-0">3</div>
              <div>
                <h3 className="font-black text-[#1a1a2e] mb-1">Sednutí na kolo</h3>
                <p className="text-sm text-[#5A6480] leading-relaxed">
                  Pokud máme v showroomu blízký model ve vaší velikosti,
                  na kolo si fyzicky sednete (stacionární trenažér).
                  Zkontrolujeme úhel kolena, vzdálenost k řídítkům, polohu
                  zad. Není test ride, ale ukáže to základní pozici.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-[#3B7CF4] text-white text-sm font-black flex items-center justify-center flex-shrink-0">4</div>
              <div>
                <h3 className="font-black text-[#1a1a2e] mb-1">Objednání</h3>
                <p className="text-sm text-[#5A6480] leading-relaxed">
                  Když jste rozhodnutí, objednáme přesný model v přesné
                  velikosti. Zaplatíte zálohu, ostatek při převzetí. Dodací
                  termín 2–6 týdnů.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-[#3B7CF4] text-white text-sm font-black flex items-center justify-center flex-shrink-0">5</div>
              <div>
                <h3 className="font-black text-[#1a1a2e] mb-1">Doladění při převzetí</h3>
                <p className="text-sm text-[#5A6480] leading-relaxed">
                  Když je kolo hotové, nastavíme výšku sedla, sklon sedla,
                  pozici brzd a řídítek na vaše proporce. Tohle je
                  standardní servis ke každému kolu — neúčtujeme.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Bikefit */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-4">
            Bikefit — když chcete jistotu detailu
          </h2>
          <p className="text-base text-[#5A6480] leading-relaxed mb-4">
            Bikefit je hlubší proces než „nastavení sedla". Trvá 1,5–3 hodiny
            a posunete s nikým v 100dola Lab dovnitř toho, kde jsou všechny
            vaše bolestivé body, asymetrie, opotřebení. Je to investice do
            zdraví a do toho, abyste kolo opravdu užívali, ne jen vlastnili.
          </p>

          <div className="bg-[#F0F4FF] border border-[#C4D2F0] rounded-2xl p-6">
            <h3 className="font-black text-[#1a1a2e] mb-3">Kdo bikefit potřebuje</h3>
            <ul className="space-y-2 text-sm text-[#5A6480] list-disc list-outside ml-5">
              <li>Kdo si kupuje kolo za 60+ tisíc — chrání investici</li>
              <li>
                Kdo ježdí 3+× týdně nebo přes 4 000 km ročně — opakované
                pozice ve špatném úhlu se sčítají
              </li>
              <li>
                Kdo měl už někdy bolest zad / kolen / krční páteře po jízdě —
                pravděpodobně máte špatnou pozici
              </li>
              <li>Triatlonisti, časovkáři — aerodynamická pozice je samostatná disciplína</li>
              <li>Lidé s asymetriemi (jedna noha kratší, scoliosa) — to je samostatný setup</li>
              <li>
                Kdokoliv, kdo chce z kola maximum — bikefit je technologie,
                která dělá rozdíl
              </li>
            </ul>
            <div className="mt-5 pt-5 border-t border-[#C4D2F0] flex flex-wrap gap-4 text-sm">
              <div>
                <strong className="text-[#1a1a2e]">Basic bikefit:</strong>{" "}
                1,5 hodiny, 1 500 Kč — stačí pro 90 % hobby cyklistů
              </div>
              <div>
                <strong className="text-[#1a1a2e]">Pro bikefit:</strong>{" "}
                3 hodiny, 3 500 Kč — s video analýzou, pro závodníky a
                triatlonisty
              </div>
            </div>
          </div>
        </section>

        {/* 6. Geo */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-4">
            Pro klienty mimo Šternberk
          </h2>
          <p className="text-base text-[#5A6480] leading-relaxed mb-4">
            Pravidelně k nám jezdí cyklisti z širšího okolí — Olomouc,
            Vsetín, Valašské Meziříčí, Rožnov pod Radhoštěm, Ostrava, Brno
            i Praha. Pro klienty mimo Šternberk:
          </p>
          <ul className="space-y-3 text-base text-[#1a1a2e] leading-relaxed list-disc list-outside ml-5 marker:text-[#3B7CF4]">
            <li>
              <strong>Konzultace na dálku.</strong> Pošlete míry e-mailem
              nebo přes WhatsApp, projedem to videohovorem. Bez nutnosti
              první cesty.
            </li>
            <li>
              <strong>Osobní termín v prodejně.</strong> Když přijedete,
              vyhradíme si na vás 1–2 hodiny tak, aby cesta měla smysl.
            </li>
            <li>
              <strong>Doručení kola k vám.</strong> Po objednání kolo
              přivezeme osobně do Olomouce, Vsetína, Valašského Meziříčí,
              Ostravy nebo Brna. Při předání ještě jednou nastavíme pozici.
            </li>
            <li>
              <strong>Bikefit přijezd.</strong> Bikefit se dělá v Šternberku
              (nemůžeme tahat stacionární trenažér a kameru), ale pro
              klienty mimo region se snažíme jet vstříc termínem.
            </li>
          </ul>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-br from-[#1a1a2e] to-[#2a2a4e] text-white rounded-2xl p-6 md:p-8 text-center mt-16">
          <div className="text-[10px] uppercase tracking-wider font-bold text-[#9AB4FF] mb-2">
            100dola sport — konzultace zdarma
          </div>
          <h2 className="text-xl md:text-2xl font-black mb-3">
            Pošlete míry, ozveme se s návrhem
          </h2>
          <p className="text-sm text-white/70 max-w-md mx-auto mb-5">
            Stačí 5 minut měření doma. Pošlete čísla e-mailem, do hodiny
            vám pošleme orientační odhad velikosti a 2–3 modelové návrhy.
            Bez závazku, bez tlaku.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/kontakt"
              className="px-5 py-3 rounded-full bg-white text-[#1a1a2e] text-sm font-black hover:opacity-90"
            >
              Kontaktovat 100dola sport →
            </Link>
            <Link
              href="/clanky/kde-koupit-kolo-sternberk"
              className="px-5 py-3 rounded-full border border-white/30 text-white text-sm font-bold hover:bg-white/10"
            >
              Průvodce nákupem kola
            </Link>
          </div>
        </section>
      </div>
    </article>
  );
}
