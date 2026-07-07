import Link from "next/link";

/**
 * SEO článek "Ochrana laku kola — PPF folie a keramické coatingy" — target keywords:
 *   - "ochrana laku kola"
 *   - "PPF folie kolo"
 *   - "frame protection film"
 *   - "keramický coating kolo"
 *   - "ochrana karbonového rámu"
 *   - "XPEL STEK kolo šternberk"
 *
 * Pozicování: 100dola Lab — chraň lak za desítky tisíc dřív, než ho odře řetěz,
 * kámen z gravelu nebo lanko. Tone: praktický, poctivý — PPF vs coating rozdíl
 * bez marketingového kouře.
 */
export default function OchranaLakuPPF() {
  return (
    <article className="bg-white">
      <div className="max-w-[820px] mx-auto px-6 md:px-12 py-12 md:py-16">
        {/* Lead */}
        <p className="text-lg text-[#5A6480] leading-relaxed mb-10">
          Tvoje nové kolo má lak, který stál klidně 20–40 tisíc z celkové ceny —
          a odře ho první kamínek z gravelu, řetěz při přehození nebo lanko, co se
          léta tře o hlavovou trubku. <strong>Ochrana laku není kosmetika, je to
          pojistka hodnoty.</strong> V tomhle článku si řekneme, co reálně chrání
          (PPF folie) a co jen leští (keramický coating), kam na rámu patří co, a
          jak to řešíme v 100dola Lab.
        </p>

        {/* Quick summary */}
        <div className="bg-[#F0FAF5] border border-[#B6E0CA] rounded-2xl p-6 mb-12">
          <div className="text-[10px] uppercase tracking-wider font-bold text-[#1F4937] mb-3">
            V kostce
          </div>
          <ul className="space-y-2 text-sm text-[#1a1a2e]">
            <li>
              🛡️ <strong>PPF folie</strong> = fyzická polyuretanová vrstva, která
              pohltí odřk a nárazy kamínků. Jediná věc, co reálně brání
              prokřápnutí laku.
            </li>
            <li>
              ✨ <strong>Keramický coating</strong> = tvrdá tenká vrstva pro
              snadné čištění, lesk a odpuzování vody/špíny. Chrání proti
              mikroškrábancům, NE proti nárazu kamene.
            </li>
            <li>
              📍 <strong>Kritické zóny:</strong> spodní trubka, řetězová vzpěra,
              hlavová trubka, vidlice, pod středem — tam odře 90&nbsp;% škod.
            </li>
            <li>
              💸 <strong>Cena:</strong> pre-cut sada klíčových zón od cca
              1&nbsp;500&nbsp;Kč, kompletní obalení rámu 3&nbsp;500–7&nbsp;000&nbsp;Kč,
              keramický coating 1&nbsp;500–3&nbsp;000&nbsp;Kč.
            </li>
            <li>
              🏷️ <strong>Značky:</strong> XPEL, STEK, 3M VentureShield (auto-grade
              PPF) + bike-specific pre-cut kity.
            </li>
          </ul>
        </div>

        {/* 1. Proč */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-4">
            Proč vůbec lak chránit
          </h2>
          <p className="text-base text-[#5A6480] leading-relaxed mb-4">
            Karbonový rám je odolný konstrukčně, ale jeho lak je tenký a měkký —
            výrobci ho drží lehký, ne neprůstřelný. Tři věci ho ničí nejvíc:
          </p>
          <ul className="space-y-3 text-base text-[#1a1a2e] leading-relaxed list-disc list-outside ml-5 marker:text-[#1F4937] mb-6">
            <li>
              <strong>Kamínky z gravelu a silnice.</strong> Odletí zpod předního
              kola na spodní trubku a vidlici. U gravelu je to konstantní pískání.
            </li>
            <li>
              <strong>Řetěz.</strong> Při shození na menší převodník nebo v hrbolech
              řetěz mlátí do řetězové vzpěry (chain slap). Bez ochrany prosekne lak
              během jedné sezóny.
            </li>
            <li>
              <strong>Odírání lanky a bezpečnostních prvků.</strong> Bowdeny, které
              se roky třou o hlavovou/horní trubku, protrou lak až na karbon. Stejně
              tak držáky computeru, tašky na rám, zámek.
            </li>
          </ul>
          <p className="text-base text-[#5A6480] leading-relaxed">
            Odřený lak není jen kosmetika. <strong>Sráží prodejní hodnotu</strong>
            {" "}(kolo za 120&nbsp;tisíc s odřenou spodní trubkou prodáš o tisíce
            levněji) a u prokřápnutí až na karbon vzniká místo, kde se drží vlhkost.
          </p>
        </section>

        {/* 2. PPF vs coating */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-4">
            PPF folie vs keramický coating — co je co
          </h2>
          <p className="text-base text-[#5A6480] leading-relaxed mb-6">
            Nejčastější omyl: „dám si coating a mám kolo chráněné". Coating a folie
            řeší <strong>jiný problém</strong> a nejlíp fungují dohromady.
          </p>
          <div className="overflow-hidden rounded-2xl border border-[#E2E6F3]">
            <table className="w-full text-sm">
              <thead className="bg-[#F0FAF5]">
                <tr>
                  <th className="text-left p-4 font-black text-[#1a1a2e]"></th>
                  <th className="text-left p-4 font-black text-[#1a1a2e]">PPF folie</th>
                  <th className="text-left p-4 font-black text-[#1a1a2e]">Keramický coating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E6F3]">
                <tr>
                  <td className="p-4 align-top font-bold text-[#1F4937]">Náraz kamene / prokřápnutí</td>
                  <td className="p-4 text-[#5A6480]">✅ chrání (pohltí energii)</td>
                  <td className="p-4 text-[#5A6480]">❌ nechrání</td>
                </tr>
                <tr>
                  <td className="p-4 align-top font-bold text-[#1F4937]">Odření řetězem / lankem</td>
                  <td className="p-4 text-[#5A6480]">✅ chrání</td>
                  <td className="p-4 text-[#5A6480]">⚠️ jen mikroškrábance</td>
                </tr>
                <tr>
                  <td className="p-4 align-top font-bold text-[#1F4937]">Snadné čištění / lesk</td>
                  <td className="p-4 text-[#5A6480]">⚠️ dobré (matné i lesklé folie)</td>
                  <td className="p-4 text-[#5A6480]">✅ nejlepší (voda steče, špína nedrží)</td>
                </tr>
                <tr>
                  <td className="p-4 align-top font-bold text-[#1F4937]">Viditelnost</td>
                  <td className="p-4 text-[#5A6480]">téměř neviditelná (na kvalitní aplikaci)</td>
                  <td className="p-4 text-[#5A6480]">neviditelný</td>
                </tr>
                <tr>
                  <td className="p-4 align-top font-bold text-[#1F4937]">Životnost</td>
                  <td className="p-4 text-[#5A6480]">5–10 let, self-healing typy zacelí drobné rýhy teplem</td>
                  <td className="p-4 text-[#5A6480]">1–3 roky, pak obnova</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-[#9AA3C2] mt-4">
            Zjednodušeně: <strong>PPF = brnění</strong> na exponovaná místa,{" "}
            <strong>coating = leštěnka</strong> na celý rám. Ideál je PPF na
            kritické zóny + coating přes zbytek.
          </p>
        </section>

        {/* 3. Kam na rám */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-4">
            Kam na rámu PPF patří (podle priority)
          </h2>
          <p className="text-base text-[#5A6480] leading-relaxed mb-6">
            Obalit celé kolo umí být zbytečně drahé. 90&nbsp;% škod vznikne na
            pár místech — tady je pořadí podle <strong>návratnosti</strong>:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-[#B6E0CA] rounded-xl p-5">
              <div className="text-2xl mb-2">1️⃣</div>
              <h3 className="font-black text-[#1F4937] mb-2">Spodní trubka + vidlice</h3>
              <p className="text-sm text-[#5A6480] leading-relaxed">
                Přední „čelo" nárazů kamínků. U gravelu povinnost. Sem letí všechno
                zpod předního kola.
              </p>
            </div>
            <div className="bg-white border border-[#B6E0CA] rounded-xl p-5">
              <div className="text-2xl mb-2">2️⃣</div>
              <h3 className="font-black text-[#1F4937] mb-2">Řetězová vzpěra</h3>
              <p className="text-sm text-[#5A6480] leading-relaxed">
                Chain slap. Tenká gumová ochrana nestačí — folie pokryje celou
                horní i vnitřní stranu vzpěry.
              </p>
            </div>
            <div className="bg-white border border-[#B6E0CA] rounded-xl p-5">
              <div className="text-2xl mb-2">3️⃣</div>
              <h3 className="font-black text-[#1F4937] mb-2">Hlavová + horní trubka</h3>
              <p className="text-sm text-[#5A6480] leading-relaxed">
                Tam, kde se tře lanko, držák computeru a kde odřeš rám o rám při
                převozu / opření o zeď.
              </p>
            </div>
            <div className="bg-white border border-[#B6E0CA] rounded-xl p-5">
              <div className="text-2xl mb-2">4️⃣</div>
              <h3 className="font-black text-[#1F4937] mb-2">Pod středem + zadní vzpěry</h3>
              <p className="text-sm text-[#5A6480] leading-relaxed">
                Odstřik ze zadního kola, bláto, sůl v zimě. Volitelně, ale u kola,
                co jezdí celoročně, se vyplatí.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Značky */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-4">
            Které materiály používáme
          </h2>
          <div className="space-y-4">
            <div className="bg-white border border-[#E2E6F3] rounded-2xl p-5">
              <h3 className="text-lg font-black text-[#1a1a2e] mb-2">XPEL / STEK</h3>
              <p className="text-sm text-[#5A6480] leading-relaxed">
                Auto-grade PPF, self-healing (drobné rýhy zmizí teplem — sluncem
                nebo teplou vodou). Vysoká odolnost, prakticky neviditelná lesklá
                verze, k dispozici i matná pro matné laky. Pro nás jednička na
                custom aplikaci podle konkrétního rámu.
              </p>
            </div>
            <div className="bg-white border border-[#E2E6F3] rounded-2xl p-5">
              <h3 className="text-lg font-black text-[#1a1a2e] mb-2">3M VentureShield</h3>
              <p className="text-sm text-[#5A6480] leading-relaxed">
                Osvědčená klasika, dostupnější. Skvělá odolnost proti odřK, o něco
                tlustší. Dobrá volba na exponované zóny (spodní trubka, vzpěry),
                kde jde víc o ochranu než o dokonalý lesk.
              </p>
            </div>
            <div className="bg-white border border-[#E2E6F3] rounded-2xl p-5">
              <h3 className="text-lg font-black text-[#1a1a2e] mb-2">
                Pre-cut bike kity + keramické coatingy
              </h3>
              <p className="text-sm text-[#5A6480] leading-relaxed">
                Pro běžné modely rámů existují předstřižené kity — rychlejší
                aplikace, nižší cena. Na finiš přidáváme keramický coating pro
                snadné čištění a lesk. Kombinaci vybíráme podle toho, jestli kolo
                jezdí silnici, gravel nebo celoročně.
              </p>
            </div>
          </div>
        </section>

        {/* 5. Servis */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-4">
            Jak to v 100dola Lab probíhá
          </h2>
          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-[#1F4937] text-white text-sm font-black flex items-center justify-center flex-shrink-0">1</div>
              <div>
                <h3 className="font-black text-[#1a1a2e] mb-1">Konzultace + rozsah</h3>
                <p className="text-sm text-[#5A6480] leading-relaxed">
                  Řekneš značku a model kola, jak jezdíš (silnice / gravel /
                  celoročně) a rozpočet. Doporučíme rozsah — od klíčových zón po
                  kompletní obalení.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-[#1F4937] text-white text-sm font-black flex items-center justify-center flex-shrink-0">2</div>
              <div>
                <h3 className="font-black text-[#1a1a2e] mb-1">Příprava povrchu</h3>
                <p className="text-sm text-[#5A6480] leading-relaxed">
                  Nejdůležitější krok. Dokonalé odmaštění a očištění rámu — pod
                  folií nesmí zůstat prach ani mastnota, jinak nedrží. Nové kolo
                  ideálně řešíme dřív, než na něm najezdíš první bláto.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-[#1F4937] text-white text-sm font-black flex items-center justify-center flex-shrink-0">3</div>
              <div>
                <h3 className="font-black text-[#1a1a2e] mb-1">Aplikace folie</h3>
                <p className="text-sm text-[#5A6480] leading-relaxed">
                  Custom střih na míru rámu nebo pre-cut kit, aplikace za mokra,
                  vytlačení vzduchu a vody. Přesné olemování hran, ať folie
                  nedrží nečistoty a je co nejméně vidět.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-[#1F4937] text-white text-sm font-black flex items-center justify-center flex-shrink-0">4</div>
              <div>
                <h3 className="font-black text-[#1a1a2e] mb-1">Coating + předání</h3>
                <p className="text-sm text-[#5A6480] leading-relaxed">
                  Volitelně keramický coating přes zbytek rámu. Folie potřebuje
                  ~24&nbsp;h na plné vyzrání — kolo si vyzvedneš druhý den. Pro
                  klienty z Vsetína, Olomouce, Valašského Meziříčí, Ostravy i Brna
                  domluvíme osobní předání.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-br from-[#1F4937] to-[#2A6249] text-white rounded-2xl p-6 md:p-8 text-center mt-16">
          <div className="text-[10px] uppercase tracking-wider font-bold text-[#A8DCC3] mb-2">
            100dola Lab — Šternberk
          </div>
          <h2 className="text-xl md:text-2xl font-black mb-3">
            Chraň lak dřív, než ho odře gravel
          </h2>
          <p className="text-sm text-white/80 max-w-md mx-auto mb-5">
            Pošli značku a model kola — ozveme se s návrhem rozsahu a cenou.
            Konzultace zdarma. Nové kolo řešíme nejradši hned z krabice, dokud je
            lak panenský.
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
              Poptat ochranu laku
            </Link>
          </div>
        </section>

        {/* Related */}
        <div className="mt-14 pt-8 border-t border-[#E2E6F3]">
          <h2 className="text-lg font-black text-[#1a1a2e] mb-4">Hodí se k tomu</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link
              href="/clanky/voskovani-retezu"
              className="block bg-white border border-[#E2E6F3] rounded-2xl p-5 hover:border-[#1F4937]/40 transition-colors"
            >
              <div className="text-xs font-bold uppercase tracking-wider text-[#1F4937] mb-2">
                Lab — péče o kola
              </div>
              <h3 className="text-base font-black text-[#1a1a2e] mb-1">
                Voskování řetězů — pro koho má smysl
              </h3>
              <p className="text-xs text-[#5A6480]">
                Čistší pohon, méně odporu, delší životnost řetězu i kazety.
              </p>
            </Link>
            <Link
              href="/clanky/keramicka-loziska"
              className="block bg-white border border-[#E2E6F3] rounded-2xl p-5 hover:border-[#1F4937]/40 transition-colors"
            >
              <div className="text-xs font-bold uppercase tracking-wider text-[#1F4937] mb-2">
                Lab — péče o kola
              </div>
              <h3 className="text-base font-black text-[#1a1a2e] mb-1">
                Keramická ložiska — prémiový upgrade
              </h3>
              <p className="text-xs text-[#5A6480]">
                Hladší roztočení a delší životnost. Další krok po ochraně laku.
              </p>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
