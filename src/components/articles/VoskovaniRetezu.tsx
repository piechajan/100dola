import Link from "next/link";

/**
 * SEO článek "Voskování řetězů" — target keywords:
 *   - "voskování řetězů"
 *   - "voskovaný řetěz"
 *   - "vosk vs olej řetěz"
 *   - "Silca SuperSecret"
 *   - "Molten Speed Wax"
 *   - "voskování řetězu Šternberk / Vsetín / Olomouc"
 *
 * Pozicování: Lab — péče o kola. Edukativní, ale s jasným CTA "necháme to
 * za vás" pro lidi co to nechtějí dělat doma.
 */
export default function VoskovaniRetezu() {
  return (
    <article className="bg-white">
      <div className="max-w-[820px] mx-auto px-6 md:px-12 py-12 md:py-16">
        {/* Lead */}
        <p className="text-lg text-[#5A6480] leading-relaxed mb-10">
          Voskování řetězů přišlo z časovkářského a triatletického prostředí,
          kde každý ušetřený watt rozhoduje. V posledních letech se ale
          rozšířilo i mezi amatéry — protože benefit není jen ve výkonu, ale
          hlavně v <strong>čistotě, životnosti a klidu při údržbě</strong>.
          Tenhle článek vysvětluje, kdy má smysl řetěz voskovat, jaké rozdíly
          jsou mezi značkami, a jak to děláme my v 100dola Lab pro klienty,
          kteří si nechtějí špinit ruce.
        </p>

        {/* Quick summary box */}
        <div className="bg-[#F0FAF5] border border-[#B6E0CA] rounded-2xl p-6 mb-12">
          <div className="text-[10px] uppercase tracking-wider font-bold text-[#1F4937] mb-3">
            V kostce
          </div>
          <ul className="space-y-2 text-sm text-[#1a1a2e]">
            <li>
              ⚙️ <strong>Co to je:</strong> řetěz je odmaštěn na surový kov a
              ponořen do horkého parafínového vosku s aditivy
            </li>
            <li>
              ✨ <strong>Hlavní benefit:</strong> řetěz nešpiní (nesedne na
              něm prach), tichý chod, 2–3× delší životnost soukolí
            </li>
            <li>
              💸 <strong>Ekonomika:</strong> jedno voskování ~150–250 Kč,
              vydrží 200–400 km. Úspora 1 výměny sestavy řetěz+kazeta+převodník
              = 5 000–15 000 Kč
            </li>
            <li>
              🧪 <strong>Značky v Labu:</strong> Silca SuperSecret, Molten
              Speed Wax (testujeme)
            </li>
            <li>
              📍 <strong>Kde to provádíme:</strong> 100dola Lab, Šternberk
              (Partyzánská 2). Pravidelní klienti z Vsetína, Olomouce a
              Valašského Meziříčí
            </li>
          </ul>
        </div>

        {/* 1. Vosk vs olej */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-4">
            Vosk vs. olej — proč to vůbec měnit
          </h2>
          <p className="text-base text-[#5A6480] leading-relaxed mb-4">
            Olejové maziva fungují tak, že na řetězu zůstává tenký film. Ten
            zachycuje prach, písek a brzdový prach — a vzniká „černá pasta",
            která řetěz <strong>brousí zevnitř</strong>. Po pár stovkách
            kilometrů máte:
          </p>
          <ul className="space-y-3 text-base text-[#1a1a2e] leading-relaxed list-disc list-outside ml-5 marker:text-[#1F4937] mb-6">
            <li>Špinavý řetěz, kazetu, převodník</li>
            <li>Špinavé lýtko po každé jízdě</li>
            <li>Šustivý nebo skřípavý chod</li>
            <li>Předčasné opotřebení soukolí (řetěz „protáhne", kazeta se vydrolí, převodník se obrousí)</li>
          </ul>

          <p className="text-base text-[#5A6480] leading-relaxed mb-4">
            Vosk funguje obráceně. Vosk je <strong>tuhý při pokojové teplotě</strong>
            — drží uvnitř článků řetězu (tam, kde má). Když na řetěz padne
            prach, prostě sklouzne, protože nemá na čem ulpět. To znamená:
          </p>
          <ul className="space-y-3 text-base text-[#1a1a2e] leading-relaxed list-disc list-outside ml-5 marker:text-[#1F4937]">
            <li>Řetěz vypadá pořád čistý — i po 200 km</li>
            <li>Nešpiníte lýtko, kalhoty, sedlovku</li>
            <li>Šlapání je tišší (vědecky měřené 1–3 W úspora)</li>
            <li>
              Soukolí (kazeta + převodník) vydrží{" "}
              <strong>2–3× déle</strong> než s olejem
            </li>
          </ul>
        </section>

        {/* 2. Pro koho má smysl */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-4">
            Pro koho má voskování smysl
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-[#B6E0CA] rounded-xl p-5">
              <h3 className="font-black text-[#1F4937] mb-2">✅ Má smysl</h3>
              <ul className="text-sm text-[#5A6480] space-y-2 list-disc list-outside ml-4">
                <li>Silniční jezdci (vyšší tempo, vyšší zájem o čistotu)</li>
                <li>Gravel jezdci v sušším počasí</li>
                <li>Lidé, kteří nesnášejí špínu na lýtku a oblečení</li>
                <li>Triatlonisti a časovkáři</li>
                <li>Hobby cyklisti s kolem za 80+ tisíc (chrání investici)</li>
                <li>Komutéři, kteří jezdí 5× týdně</li>
              </ul>
            </div>
            <div className="bg-white border border-[#FBC9A8] rounded-xl p-5">
              <h3 className="font-black text-[#9B3D17] mb-2">⚠️ Spíš ne</h3>
              <ul className="text-sm text-[#5A6480] space-y-2 list-disc list-outside ml-4">
                <li>MTB / enduro v mokrém terénu (vosk se vymývá rychle)</li>
                <li>Bikepacking s deštěm (totéž)</li>
                <li>Jezdci, kteří najedou méně než 500 km ročně</li>
                <li>
                  Levná kola (E1/E2 řetězy) — soukolí je dráž než přínos
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* 3. Postup */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-4">
            Jak voskování probíhá — krok za krokem
          </h2>
          <p className="text-base text-[#5A6480] leading-relaxed mb-6">
            Postup vypadá jednoduše, ale detail rozhoduje o tom, zda vosk
            opravdu „chytí". Tady je to, co se děje v 100dola Lab:
          </p>

          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-[#1F4937] text-white text-sm font-black flex items-center justify-center flex-shrink-0">1</div>
              <div>
                <h3 className="font-black text-[#1a1a2e] mb-1">Hlubinné odmaštění (ultrazvuk)</h3>
                <p className="text-sm text-[#5A6480] leading-relaxed">
                  Řetěz musí být zbaven všech zbytků originálního mazadla
                  (Shimano dodává řetězy s těžkým mazivem proti korozi
                  v dopravě). Ultrazvuk + odmašťovač ve dvou cyklech, pak
                  oplach acetonem nebo IPA. Suchý, čistý kov.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-[#1F4937] text-white text-sm font-black flex items-center justify-center flex-shrink-0">2</div>
              <div>
                <h3 className="font-black text-[#1a1a2e] mb-1">Příprava vosku (90–95 °C)</h3>
                <p className="text-sm text-[#5A6480] leading-relaxed">
                  Vosk se rozehřeje v dedikovaném slow-cookeru. Není to
                  parafínová svíčka z hobbymarketu — speciální směs parafínu
                  s PTFE / molybden disulfidem / nano-aditivy podle značky.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-[#1F4937] text-white text-sm font-black flex items-center justify-center flex-shrink-0">3</div>
              <div>
                <h3 className="font-black text-[#1a1a2e] mb-1">Ponoření a promíchání</h3>
                <p className="text-sm text-[#5A6480] leading-relaxed">
                  Řetěz visí na drátu, ponoří se do horkého vosku, opatrně
                  protáhne (aby vosk pronikl do všech článků). 10–15 minut.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-[#1F4937] text-white text-sm font-black flex items-center justify-center flex-shrink-0">4</div>
              <div>
                <h3 className="font-black text-[#1a1a2e] mb-1">Vychladnutí + rozhýbání</h3>
                <p className="text-sm text-[#5A6480] leading-relaxed">
                  Řetěz se nechá vychladnout na řidším podkladě (asi 30 minut).
                  Pak se ohýbá v každém článku, aby ztuhlý vosk popraskal a
                  články zůstaly volné. Tohle je krok, kde amatéři chybují
                  nejčastěji.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-[#1F4937] text-white text-sm font-black flex items-center justify-center flex-shrink-0">5</div>
              <div>
                <h3 className="font-black text-[#1a1a2e] mb-1">Montáž + první test</h3>
                <p className="text-sm text-[#5A6480] leading-relaxed">
                  Řetěz nasadíme zpět na kolo, projedeme řazením a uděláme
                  zkušební jízdu (≈3 km). Pokud něco šustí, krátká úprava.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Značky */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-4">
            Které značky vosku používáme
          </h2>
          <div className="space-y-4">
            <div className="bg-white border border-[#E2E6F3] rounded-2xl p-5">
              <h3 className="text-lg font-black text-[#1a1a2e] mb-2">
                Silca SuperSecret Hot Wax
              </h3>
              <p className="text-sm text-[#5A6480] leading-relaxed">
                Americká značka, prémie. Směs parafínu s wolframovým prachem
                a PTFE — extrémně tichý chod, dlouhá životnost. Drahá, ale
                osvědčená. Naše první volba pro silniční kola s drahým
                soukolím (Dura-Ace, Red AXS).
              </p>
            </div>
            <div className="bg-white border border-[#E2E6F3] rounded-2xl p-5">
              <h3 className="text-lg font-black text-[#1a1a2e] mb-2">
                Molten Speed Wax
              </h3>
              <p className="text-sm text-[#5A6480] leading-relaxed">
                Americká, dostupnější. Parafín + PTFE + molybden disulfid.
                Trochu kratší životnost mezi voskováním (200–300 km vs.
                300–400 km u Silca), ale poloviční cena. Dobré pro hobby
                jezdce a gravel.
              </p>
            </div>
            <div className="bg-white border border-[#E2E6F3] rounded-2xl p-5">
              <h3 className="text-lg font-black text-[#1a1a2e] mb-2">
                Squirt Long Lasting Lube
              </h3>
              <p className="text-sm text-[#5A6480] leading-relaxed">
                <strong>Pozor — Squirt není „hot wax", je to drip-on
                emulze.</strong> Účinkuje podobně (vosk zaschne na řetězu)
                ale aplikuje se z lahvičky. Vhodný pro DIY a pro lidi, co
                nechtějí celý proces ultrazvuk + slow-cooker. Méně účinný
                než hot wax, ale méně práce.
              </p>
            </div>
          </div>
        </section>

        {/* 5. DIY vs my */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-4">
            Doma vs. necháme to vám
          </h2>
          <p className="text-base text-[#5A6480] leading-relaxed mb-4">
            Voskovat si řetěz doma <strong>jde</strong>, ale připravte se na:
          </p>
          <ul className="space-y-3 text-base text-[#1a1a2e] leading-relaxed list-disc list-outside ml-5 marker:text-[#1F4937] mb-6">
            <li>
              <strong>Vstupní investice ~3 000–5 000 Kč</strong> (slow-cooker,
              ultrazvuková čistička, vosk, držák řetězu, master link kleště)
            </li>
            <li>
              <strong>1–2 hodiny práce</strong> při prvním voskování (než se
              do toho dostanete)
            </li>
            <li>
              <strong>Riziko nedokonalého odmaštění</strong> — vosk pak
              neudrží, řetěz po 100 km „povolí"
            </li>
            <li>
              <strong>Manželka vám možná zkříží jednou pánev</strong> — slow-cooker
              už nesmí na jídlo
            </li>
          </ul>
          <p className="text-base text-[#5A6480] leading-relaxed">
            Pokud to chcete zkusit sami, doporučíme značky a postup. Pokud
            si chcete jen koupit nový řetěz a mít ho předzákladově voskovaný,
            uděláme to v 100dola Lab za 150–250 Kč podle značky vosku.
            Voskovaný řetěz vám pak naservírujeme jako instant zážitek —
            otevřete obal, nasadíte, jedete.
          </p>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-br from-[#1F4937] to-[#2A6249] text-white rounded-2xl p-6 md:p-8 text-center mt-16">
          <div className="text-[10px] uppercase tracking-wider font-bold text-[#A8DCC3] mb-2">
            100dola Lab — Šternberk
          </div>
          <h2 className="text-xl md:text-2xl font-black mb-3">
            Necháme to za vás
          </h2>
          <p className="text-sm text-white/80 max-w-md mx-auto mb-5">
            Voskování řetězu od 150 Kč, do druhého dne. Pro pravidelné klienty
            z Vsetína, Olomouce, Valašského Meziříčí — dohodneme čas tak,
            aby cesta nebyla zbytečná. Stačí napsat.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/lab"
              className="px-5 py-3 rounded-full bg-white text-[#1F4937] text-sm font-black hover:opacity-90"
            >
              100dola Lab →
            </Link>
            <Link
              href="/kontakt"
              className="px-5 py-3 rounded-full border border-white/30 text-white text-sm font-bold hover:bg-white/10"
            >
              Objednat voskování
            </Link>
          </div>
        </section>
      </div>
    </article>
  );
}
