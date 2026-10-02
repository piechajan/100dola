import Link from "next/link";
import TlakKalkulacka from "./TlakKalkulacka";

/**
 * SEO článek „Tlak v pláštích na silničce“ — target keywords:
 *   - "tlak v pláštích silniční kolo"
 *   - "na kolik foukat silničku"
 *   - "tlak v pneumatikách kolo tabulka"
 *   - "tlak v plášti podle váhy"
 *   - "tlak 28mm plášť", "tlak tubeless silnička"
 *   - "hookless ráfek maximální tlak"
 *
 * Pozicování: ryze užitkové. Konkrétní čísla hned, pak vysvětlení proč.
 * Prodejní hook až na konci (servis, bezdušový přechod, výběr plášťů).
 */
export default function TlakVPlastichSilnicni() {
  return (
    <article className="bg-white">
      <div className="max-w-[820px] mx-auto px-6 md:px-12 py-12 md:py-16">
        {/* Lead */}
        <p className="text-lg text-[#5A6480] leading-relaxed mb-10">
          Tlak v pláštích je nejlevnější úprava kola, jakou můžete udělat — a
          zároveň ta, kterou nejvíc lidí dělá špatně. Většina silničářů jezdí
          přefouklá, protože se drží čísla vylisovaného na boku pláště nebo
          hodnoty, kterou používali před deseti lety na pětadvacítkách.{" "}
          <strong>
            Tvrdší plášť přitom není rychlejší — od určitého bodu je naopak
            pomalejší, méně bezpečný a výrazně nepohodlnější.
          </strong>{" "}
          Tenhle návod dává konkrétní výchozí hodnoty podle vaší váhy a šířky
          pláště a pak vysvětluje, proč vypadají takhle.
        </p>

        {/* V kostce */}
        <div className="bg-[#F0F4FF] border border-[#C4D2F0] rounded-2xl p-6 mb-10">
          <div className="text-[10px] uppercase tracking-wider font-bold text-[#3B7CF4] mb-3">
            V kostce
          </div>
          <ul className="space-y-2 text-sm text-[#1a1a2e]">
            <li>
              ⚖️ <strong>Tlak se odvíjí od zatížení kola, ne od značky
              pláště.</strong> Těžší jezdec potřebuje víc, lehčí míň.
            </li>
            <li>
              📏 <strong>Širší plášť = nižší tlak.</strong> Přechod z 25 na 28
              mm znamená zhruba o 0,7 bar méně při stejném pocitu.
            </li>
            <li>
              🔁 <strong>Vzadu víc než vpředu</strong> — na zadní kolo připadá
              zhruba 53 % hmotnosti. Rozdíl dělá 0,4–0,6 bar.
            </li>
            <li>
              🚫 <strong>Bezdušové jde o 0,3–0,5 bar níž</strong>, protože
              odpadá riziko proštípnutí duše o ráfek.
            </li>
            <li>
              ⚠️ <strong>Hookless ráfky mají strop 5,0 bar</strong> (72,5 psi)
              bez ohledu na to, co je napsané na plášti.
            </li>
          </ul>
        </div>

        <TlakKalkulacka />

        {/* 1. Proč na tlaku záleží */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-4">
            Proč tvrdší plášť není rychlejší
          </h2>
          <p className="text-base text-[#5A6480] leading-relaxed mb-4">
            Intuice říká, že čím tvrdší plášť, tím míň se deformuje a tím míň
            energie se ztratí. Na dokonale hladkém válci v laboratoři to platí.
            Na skutečné silnici ne.
          </p>
          <p className="text-base text-[#5A6480] leading-relaxed mb-4">
            Jakmile tlak přeroste určitou hranici, plášť přestane pohlcovat
            nerovnosti a začne se po nich odrážet. Energie, která se dřív
            ztrácela deformací gumy, se teď ztrácí rozkmitáním kola, rámu a
            hlavně vašeho těla — a svaly tlumící vibrace spotřebují víc než
            samotné valení. Tomu bodu se říká{" "}
            <strong>breakpoint</strong> a leží níž, než si většina lidí myslí.
            Na běžném českém okresním asfaltu je 7 bar jednoznačně za ním.
          </p>
          <p className="text-base text-[#5A6480] leading-relaxed">
            Druhý důvod je přilnavost. Kontaktní plocha přefouklého pláště je
            menší a tvrdší, takže dřív ztratí přilnavost v zatáčce, na mokru a
            na kanálech. Nižší tlak tady nekupujete pohodlí na úkor výkonu — po
            většinu roku kupujete obojí najednou.
          </p>
        </section>

        {/* 2. Tabulka */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-4">
            Tabulka tlaků podle šířky pláště a váhy
          </h2>
          <p className="text-base text-[#5A6480] leading-relaxed mb-5">
            Hodnoty platí pro plášť s duší na ráfku s vnitřní šířkou kolem
            21 mm. Formát je <strong>zadní / přední</strong> v barech. K váze
            jezdce je připočteno 9 kg za kolo, lahve a výbavu.
          </p>

          <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
            <table className="w-full text-sm border-collapse min-w-[520px]">
              <thead>
                <tr className="bg-[#F0F4FF] text-[#1a1a2e]">
                  <th className="text-left font-bold p-3 rounded-l-lg">
                    Jezdec
                  </th>
                  <th className="text-right font-bold p-3">25 mm</th>
                  <th className="text-right font-bold p-3">28 mm</th>
                  <th className="text-right font-bold p-3">30 mm</th>
                  <th className="text-right font-bold p-3 rounded-r-lg">
                    32 mm
                  </th>
                </tr>
              </thead>
              <tbody className="tabular-nums">
                {[
                  ["60 kg", "4,4 / 3,9", "3,8 / 3,4", "3,5 / 3,1", "3,2 / 2,8"],
                  ["70 kg", "5,1 / 4,5", "4,3 / 3,9", "4,0 / 3,5", "3,6 / 3,2"],
                  ["80 kg", "5,7 / 5,1", "4,9 / 4,3", "4,5 / 4,0", "4,1 / 3,6"],
                  ["90 kg", "6,3 / 5,6", "5,4 / 4,8", "5,0 / 4,4", "4,5 / 4,0"],
                  [
                    "100 kg",
                    "7,0 / 6,2",
                    "6,0 / 5,3",
                    "5,5 / 4,9",
                    "5,0 / 4,4",
                  ],
                ].map((row) => (
                  <tr key={row[0]} className="border-b border-[#E8ECF4]">
                    <td className="p-3 font-bold text-[#1a1a2e]">{row[0]}</td>
                    {row.slice(1).map((v, i) => (
                      <td key={i} className="p-3 text-right text-[#5A6480]">
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-sm text-[#8A94AB] leading-relaxed mt-4">
            Všimněte si, o kolik klesá tlak s rostoucí šířkou. Osmdesátikilový
            jezdec jede na pětadvacítce 5,7 bar, na dvaatřicítce 4,1 bar — a
            přitom má v obou případech stejně prohnutý plášť. Proto nedává smysl
            foukat širší plášť „na jistotu“ tvrdě: tím si zahodíte přesně to,
            kvůli čemu jste ho kupovali.
          </p>
        </section>

        {/* 3. Duše vs tubeless */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-4">
            Duše, bezdušové, nebo galuska
          </h2>
          <p className="text-base text-[#5A6480] leading-relaxed mb-4">
            <strong>S duší</strong> máte spodní hranici danou rizikem
            proštípnutí — když při nájezdu do hrany plášť doteče až na ráfek,
            duše se mezi hranou a ráfkem rozstřihne. Právě tahle obava drží
            většinu lidí zbytečně vysoko.
          </p>
          <p className="text-base text-[#5A6480] leading-relaxed mb-4">
            <strong>Bezdušové (tubeless)</strong> tohle riziko nemá, takže
            můžete jet o 0,3 až 0,5 bar níž při stejné jistotě. To je v praxi
            největší přínos bezdušového systému — ne ani tak odolnost proti
            defektům, jako možnost jet trvale na nižším tlaku. Pozor na spodní
            hranici: pod zhruba 3 bary začne na silničních šířkách hrozit
            odskočení patky v ostré zatáčce.
          </p>
          <p className="text-base text-[#5A6480] leading-relaxed">
            <strong>Galusky</strong> snesou nejnižší tlak ze všech a mají
            nejpříjemnější chod, ale lepení a servis na cestě z nich dělají
            volbu pro závodníky s doprovodem, ne pro běžné ježdění.
          </p>
        </section>

        {/* 4. Šířka ráfku */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-4">
            Vnitřní šířka ráfku mění skutečnou šířku pláště
          </h2>
          <p className="text-base text-[#5A6480] leading-relaxed mb-4">
            Na plášti je napsáno 28 mm, ale to platí pro referenční ráfek.
            Nasazený na širší ráfek se plášť roztáhne do šířky — orientačně{" "}
            <strong>každé 2 mm vnitřní šířky ráfku navíc přidají zhruba
            0,8 mm skutečné šířky pláště</strong>.
          </p>
          <p className="text-base text-[#5A6480] leading-relaxed">
            Dvaadvacítka na moderním ráfku s vnitřní šířkou 25 mm tak reálně
            měří přes 30 mm a chce tlak odpovídající třicítce, ne
            osmadvacítce. Když vám tabulkové hodnoty připadají nízké, změřte si
            posuvným měřítkem skutečnou šířku nahuštěného pláště — často bude
            širší, než čekáte.
          </p>
        </section>

        {/* 5. Hookless — bezpečnost */}
        <section className="mb-12">
          <div className="bg-[#FFF4F1] border border-[#F3C9BC] rounded-2xl p-6">
            <h2 className="text-xl md:text-2xl font-black text-[#1a1a2e] mb-3">
              ⚠️ Hookless ráfky: strop 5,0 bar
            </h2>
            <p className="text-base text-[#5A6480] leading-relaxed mb-3">
              Bezháčkové (hookless) ráfky nemají na okraji háček, který by
              držel patku pláště. Normou daný maximální tlak je u nich{" "}
              <strong>5,0 bar / 72,5 psi</strong> — a platí bez ohledu na to,
              co je napsané na plášti. Překročení znamená riziko, že patka
              přeskočí přes okraj ráfku a plášť za jízdy exploduje.
            </p>
            <p className="text-base text-[#5A6480] leading-relaxed">
              Pokud máte hookless ráfky (dnes velká část karbonových kol včetně
              řady Zipp, Giant nebo Roval), prakticky to znamená, že pro jezdce
              nad 85 kg je pětadvacítka špatná volba — tabulkový tlak by přerostl
              limit. Řešení je jednoduché: širší plášť.{" "}
              <strong>Když si nejste jistí, jestli máte hookless, zastavte se u
              nás a koukneme na to spolu.</strong>
            </p>
          </div>
        </section>

        {/* 6. Měření */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-4">
            Čím měřit, aby to mělo smysl
          </h2>
          <p className="text-base text-[#5A6480] leading-relaxed mb-4">
            Nejlepší tabulka je k ničemu, když ji použijete s manometrem, který
            lže o půl baru. Levné hustilky mají běžně odchylku ±0,5 bar a
            manometry na kompresorech u benzínky bývají ještě dál — ty jsou
            dělané na 2 bary v autě, ne na 5 barů v kole.
          </p>
          <ul className="space-y-2 text-base text-[#5A6480] mb-4">
            <li>
              • <strong>Používejte pořád jednu hustilku.</strong> I nepřesný
              manometr je užitečný, když je nepřesný pořád stejně — naučíte se,
              co na něm znamená váš tlak.
            </li>
            <li>
              • <strong>Digitální manometr</strong> za pár stovek je nejlevnější
              upgrade pocitu z kola, jaký existuje.
            </li>
            <li>
              • <strong>Měřte před výjezdem</strong>, ne po. Plášť se jízdou
              ohřeje a tlak stoupne.
            </li>
          </ul>
        </section>

        {/* 7. Co tlak mění */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-4">
            Kdy od tabulky ubrat a kdy přidat
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="bg-[#F7F9FC] rounded-xl p-5">
              <div className="font-bold text-[#1a1a2e] mb-2">
                Ubrat 0,2–0,4 bar
              </div>
              <ul className="text-sm text-[#5A6480] space-y-1">
                <li>• mokro a studený asfalt</li>
                <li>• rozbitý povrch, výtluky, spáry</li>
                <li>• dlouhá jízda nad 4 hodiny</li>
                <li>• kostky, šotolina, polní přejezd</li>
              </ul>
            </div>
            <div className="bg-[#F7F9FC] rounded-xl p-5">
              <div className="font-bold text-[#1a1a2e] mb-2">
                Přidat 0,2–0,3 bar
              </div>
              <ul className="text-sm text-[#5A6480] space-y-1">
                <li>• hladký nový asfalt</li>
                <li>• závod nebo časovka</li>
                <li>• jízda s brašnami nebo nákladem</li>
                <li>• horko nad 30 °C (tlak sám stoupne — spíš foukejte níž)</li>
              </ul>
            </div>
          </div>
          <p className="text-sm text-[#8A94AB] leading-relaxed mt-4">
            Teplota má měřitelný vliv: změna o 10 °C posune tlak zhruba o
            0,15 bar. Kolo nahuštěné v teplé dílně bude po vyjetí do zimy
            měkčí, než čekáte — a naopak černý plášť na letním sluníčku může
            vystoupat o půl baru nad to, co jste nastavili.
          </p>
        </section>

        {/* 8. Chyby */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-4">
            Čtyři nejčastější chyby
          </h2>
          <ol className="space-y-3 text-base text-[#5A6480]">
            <li>
              <strong className="text-[#1a1a2e]">
                1. Foukání na maximum uvedené na plášti.
              </strong>{" "}
              To číslo není doporučení, ale bezpečnostní strop konstrukce. Je
              to jako jezdit autem pořád na červených otáčkách.
            </li>
            <li>
              <strong className="text-[#1a1a2e]">
                2. Stejný tlak vpředu i vzadu.
              </strong>{" "}
              Přední kolo nese míň, takže stejný tlak znamená přefouklé
              předáka — a ten rozhoduje o přilnavosti v zatáčce.
            </li>
            <li>
              <strong className="text-[#1a1a2e]">
                3. Nezměněný tlak po přechodu na širší plášť.
              </strong>{" "}
              Nejčastější chyba posledních let. Koupíte osmadvacítky kvůli
              pohodlí a nafouknete je jako pětadvacítky.
            </li>
            <li>
              <strong className="text-[#1a1a2e]">
                4. Kontrola jednou za měsíc.
              </strong>{" "}
              Latexové duše ztrácejí i přes bar týdně, butylové desetiny.
              Bezdušové se vyfukují taky. Kontrolujte před každou delší jízdou.
            </li>
          </ol>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-5">
            Časté dotazy
          </h2>
          <div className="space-y-5">
            {[
              {
                q: "Na kolik foukat silniční kolo, když vážím 75 kg?",
                a: "Na 28 mm plášti s duší zhruba 4,6 bar vzadu a 4,1 bar vpředu. Na 25 mm asi 5,4 / 4,8 bar. S bezdušovým systémem jděte o 0,3 bar níž.",
              },
              {
                q: "Je lepší foukat víc, nebo míň?",
                a: "Pokud váháte, foukejte spíš míň. Mírně podhuštěný plášť stojí pár wattů, ale jede bezpečně a pohodlně. Přefouklý ztrácí přilnavost a na nerovném povrchu je i pomalejší.",
              },
              {
                q: "Jak poznám, že mám málo?",
                a: "Plášť se v zatáčce „kroutí“ a kolo působí měkce, při nájezdu do hrany uslyšíte dosednutí na ráfek. U bezdušového se může objevit bublání tmelu. Přidejte po 0,2 bar, než to zmizí.",
              },
              {
                q: "Platí tyhle hodnoty i pro gravel?",
                a: "Ne. Gravel plášť 38–45 mm jede na 2–3 barech a tlak se řídí hlavně povrchem. Tenhle návod je čistě pro silnici.",
              },
              {
                q: "Kolik psi je 5 bar?",
                a: "Zhruba 72,5 psi. Pro rychlý přepočet: 1 bar ≈ 14,5 psi.",
              },
            ].map((f) => (
              <div key={f.q}>
                <div className="font-bold text-[#1a1a2e] mb-1">{f.q}</div>
                <p className="text-base text-[#5A6480] leading-relaxed">
                  {f.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="bg-[#0F1724] rounded-2xl p-7 md:p-9 text-white">
          <h2 className="text-xl md:text-2xl font-black mb-3">
            Nejste si jistí, co máte za ráfky a pláště?
          </h2>
          <p className="text-[#9FB0C4] leading-relaxed mb-5">
            Přijďte do prodejny ve Šternberku. Změříme skutečnou šířku pláště i
            ráfku, zkontrolujeme, jestli jsou vaše ráfky hookless, a nastavíme
            tlak na vaši váhu a povrch, po kterém jezdíte. Pokud zvažujete
            přechod na bezdušový systém, řekneme rovnou, jestli to u vašich kol
            dává smysl.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/kontakt"
              className="inline-block bg-[#7FB2FF] text-[#0F1724] font-bold px-6 py-3 rounded-lg hover:bg-white transition"
            >
              Napsat nám
            </Link>
            <Link
              href="/prodejna"
              className="inline-block border border-[#3A4A60] text-white font-bold px-6 py-3 rounded-lg hover:border-[#7FB2FF] transition"
            >
              Prodejna Šternberk
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
