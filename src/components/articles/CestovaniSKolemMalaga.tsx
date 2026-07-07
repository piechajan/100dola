import Link from "next/link";

/**
 * SEO článek "Cestování s kolem do Malagy" — target keywords:
 *   - "cestování s kolem do malagy / španělska"
 *   - "létat nalehko s kolem"
 *   - "vlastní kolo malaga zima"
 *   - "cyklo dovolená andalusie"
 *   - "co si sbalit na kolo do španělska"
 *
 * Komplement k /clanky/doprava-kola-do-malagy (ta řeší LOGISTIKU přepravy).
 * Tento článek = pohled CESTOVATELE: létáš nalehko, kolo tam čeká, co sbalit,
 * kdy jet, jak vypadá příjezd. Vede na poptávku a na doprava/vlastni-kolo články.
 */
export default function CestovaniSKolemMalaga() {
  return (
    <article className="bg-white">
      <div className="max-w-[820px] mx-auto px-6 md:px-12 py-12 md:py-16">
        {/* Lead */}
        <p className="text-lg text-[#5A6480] leading-relaxed mb-10">
          Představ si to takhle: doletíš do Malagy jen s příručním zavazadlem,
          za 15 minut jsi u skladu, kolo na tebe čeká nahuštěné a namazané — a
          vyrážíš do hor. <strong>Žádný kufr s kolem, žádné balení, žádné modlení
          na přepážce, jestli letadlo kolo veze.</strong> Tenhle článek je o tom,
          jak vypadá cesta do Malagy z tvého pohledu, když kolo řeší někdo jiný.
        </p>

        {/* Quick summary */}
        <div className="bg-[#FFF1EA] border border-[#FBC9A8] rounded-2xl p-6 mb-12">
          <div className="text-[10px] uppercase tracking-wider font-bold text-[#E8431A] mb-3">
            Krátká verze
          </div>
          <ul className="space-y-2 text-sm text-[#1a1a2e]">
            <li>✈️ <strong>Létáš nalehko</strong> — příruční zavazadlo s helmou, tretrami a dresem. Levnější letenka, žádný nadměrný náklad.</li>
            <li>🚲 <strong>Kolo je už v Malaze</strong> — dovezeme ho jednou, zůstane přes sezónu ve skladu 10 min od letiště (AGP).</li>
            <li>🔧 <strong>Připraveno k jízdě</strong> — napíšeš den před příletem, máme kolo nachystané: tlak, mazání, kontrola.</li>
            <li>🗓️ <strong>Ideální sezóna</strong> — listopad až březen, když v Česku mrzne. 15–20&nbsp;°C a suché silnice.</li>
            <li>🔁 <strong>Vyplatí se od 2 cest za sezónu</strong> — pak už je vlastní kolo skladem levnější než létat s kufrem.</li>
          </ul>
          <div className="mt-4 pt-4 border-t border-[#FBC9A8]">
            <Link
              href="/malaga#poptat"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#E8431A] text-white text-sm font-bold hover:opacity-90 transition-opacity"
            >
              Naplánovat cestu →
            </Link>
          </div>
        </div>

        {/* 1. Proč ne kufr */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-4">
            Proč nebrat kolo v kufru pokaždé znova
          </h2>
          <p className="text-base text-[#5A6480] leading-relaxed mb-4">
            Létání s kolem v boxu zní jednoduše, dokud to nezažiješ podruhé. Pak
            zjistíš, že tě to stojí čas i nervy:
          </p>
          <ul className="space-y-3 text-base text-[#1a1a2e] leading-relaxed list-disc list-outside ml-5 marker:text-[#E8431A] mb-6">
            <li><strong>Balení a rozbalení</strong> — dvě hodiny před cestou, dvě po příletu, a stejně zpátky. Každou cestu znova.</li>
            <li><strong>Poplatky a limity</strong> — nadměrné zavazadlo, různá pravidla aerolinek, riziko že kolo neveze konkrétní spoj.</li>
            <li><strong>Riziko poškození</strong> — handleři s kolem nezacházejí v rukavičkách. Ohnutý měnič, prasklý disk, škrábance.</li>
            <li><strong>Stres na letišti</strong> — negabaritní výdej, čekání, jestli box vůbec dorazil.</li>
          </ul>
          <p className="text-base text-[#5A6480] leading-relaxed">
            Když jedeš jednou za život, klidně to zvládneš. Když ale jezdíš v zimě
            opakovaně, <strong>opakuje se i ten cirkus</strong>. A přesně to řeší
            model „kolo zůstane v Malaze".
          </p>
        </section>

        {/* 2. Jak to vypadá */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-4">
            Jak cesta vypadá z tvého pohledu
          </h2>
          <div className="space-y-6">
            {[
              { n: "1", t: "Jednou pošleš kolo", b: "Před sezónou předáš kolo na sběrném místě (Šternberk / Olomouc / Valašské Meziříčí / Praha přes partnera) nebo ho vyzvedneme. Dál se o přepravu nestaráš." },
              { n: "2", t: "Kolo čeká v Malaze", b: "Ve vnitřním, monitorovaném skladu 10 minut od letiště. Má svůj věšák, štítek a fotku stavu při příjezdu. Zůstává tam přes celou sezónu, ne jen na jeden pobyt." },
              { n: "3", t: "Rezervuješ let nalehko", b: "Kupuješ jen letenku pro sebe, bez nadměrného zavazadla. Přílet na Málaga–Costa del Sol (AGP), odkud je většina cyklo terénu do hodiny." },
              { n: "4", t: "Napíšeš nám den předem", b: "Dáš vědět, kdy dorazíš. Kolo připravíme: nahustíme pláště, namažeme řetěz, zkontrolujeme brzdy. Máš ho ready před skladem." },
              { n: "5", t: "Přiletíš a jedeš", b: "Z letiště ke skladu, převezmeš kolo, kafe na cestu — a vyrážíš. Žádné skládání, žádné shánění nářadí, žádná ztracená hodina." },
            ].map((s) => (
              <div key={s.n} className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[#E8431A] text-white font-black text-sm flex items-center justify-center shrink-0">{s.n}</div>
                <div>
                  <h3 className="text-base font-black text-[#1a1a2e] mb-1">{s.t}</h3>
                  <p className="text-sm text-[#5A6480] leading-relaxed">{s.b}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Co sbalit */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-4">
            Co si sbalit do příručního
          </h2>
          <p className="text-base text-[#5A6480] leading-relaxed mb-6">
            Když kolo čeká na místě, do letadla si bereš jen to osobní. Vejde se
            to do příručáku a batohu:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-[#FBC9A8] rounded-xl p-5">
              <h3 className="font-black text-[#E8431A] mb-2">Na tělo</h3>
              <ul className="text-sm text-[#5A6480] leading-relaxed space-y-1 list-disc ml-4 marker:text-[#E8431A]">
                <li>Helma, tretry, brýle, rukavice</li>
                <li>2–3 dresy a kraťasy, návleky pro chladná rána</li>
                <li>Bunda/vesta do větru, čepice pod helmu</li>
              </ul>
            </div>
            <div className="bg-white border border-[#FBC9A8] rounded-xl p-5">
              <h3 className="font-black text-[#E8431A] mb-2">Elektronika + osobní</h3>
              <ul className="text-sm text-[#5A6480] leading-relaxed space-y-1 list-disc ml-4 marker:text-[#E8431A]">
                <li>Garmin/computer + nabíječka, čidla (pokud vozíš vlastní)</li>
                <li>Pedály, sedlo nebo bidony — jen pokud si je chceš vozit sám</li>
                <li>Náhradní duše/tretra spony dle preference</li>
              </ul>
            </div>
          </div>
          <p className="text-sm text-[#9AA3C2] mt-4">
            Věci jako pumpa, základní nářadí a servis máme na místě. Co potřebuješ
            mít vlastní (sedlo, pedály, konkrétní čidla), vezmeš v příručáku —
            nebo je necháš rovnou na kole ve skladu.
          </p>
        </section>

        {/* 4. Sezóna */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-4">
            Kdy do Andalusie jet
          </h2>
          <p className="text-base text-[#5A6480] leading-relaxed mb-6">
            Kouzlo Malagy je zimní sezóna. Zatímco v Česku je led a tma, na Costa
            del Sol jezdíš v krátkém rukávu:
          </p>
          <div className="overflow-hidden rounded-2xl border border-[#E2E6F3]">
            <table className="w-full text-sm">
              <thead className="bg-[#FFF1EA]">
                <tr>
                  <th className="text-left p-4 font-black text-[#1a1a2e]">Období</th>
                  <th className="text-left p-4 font-black text-[#1a1a2e]">Proč</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E6F3]">
                <tr>
                  <td className="p-4 align-top font-bold text-[#E8431A]">Listopad–březen</td>
                  <td className="p-4 text-[#5A6480]">Hlavní důvod, proč sem jezdit. 15–20&nbsp;°C, suché silnice, prázdné cesty. Ideální na zimní objem i únikový víkend z mrazu.</td>
                </tr>
                <tr>
                  <td className="p-4 align-top font-bold text-[#E8431A]">Duben–květen</td>
                  <td className="p-4 text-[#5A6480]">Zelené kopce, příjemné teploty, delší dny. Skvělé na delší výjezdy do hor.</td>
                </tr>
                <tr>
                  <td className="p-4 align-top font-bold text-[#E8431A]">Léto</td>
                  <td className="p-4 text-[#5A6480]">Horko — jezdí se brzy ráno. Spíš pro ty, co míří výš do hor za chladem.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-base text-[#5A6480] leading-relaxed mt-6">
            Protože kolo zůstává ve skladu celou sezónu, můžeš přiletět víckrát —
            prodloužený víkend v prosinci, týden v únoru, jarní blok v dubnu.
            Pokaždé jen letenka nalehko.
          </p>
        </section>

        {/* 5. Basic vs Exclusive stručně */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-4">
            Kolik práce chceš mít
          </h2>
          <p className="text-base text-[#5A6480] leading-relaxed mb-6">
            Přeprava má dvě úrovně komfortu — podle toho, kolik si chceš udělat
            sám. Detailní ceník a proces najdeš v článku o dopravě, tady krátce:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white border-2 border-[#E2E6F3] rounded-2xl p-6">
              <div className="text-xs font-bold uppercase tracking-wider text-[#9AA3C2] mb-2">Basic</div>
              <p className="text-sm text-[#5A6480] leading-relaxed">
                Kolo přivezeš v jetelném stavu, my ho dovezeme a uskladníme.
                Cenově nejvýhodnější, drobnou přípravu po příletu zvládneš sám.
              </p>
            </div>
            <div className="bg-[#1a1a2e] text-white rounded-2xl p-6">
              <div className="text-xs font-bold uppercase tracking-wider text-white/60 mb-2">Exkluzivní</div>
              <p className="text-sm text-white/85 leading-relaxed">
                Vyzvednutí od tebe, profi zabalení, servisní kontrola a kompletní
                montáž v Malaze. Přijedeš a kolo je 100&nbsp;% ready. Maximální
                komfort.
              </p>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <div className="bg-gradient-to-br from-[#E8431A] to-[#FF6B3D] text-white rounded-2xl p-8 md:p-10 mb-8">
          <h2 className="text-2xl md:text-3xl font-black mb-2">Poletíš do Malagy nalehko?</h2>
          <p className="text-sm md:text-base text-white/90 mb-6 max-w-lg">
            Napiš nám termín a model kola. Ozveme se s konkrétní nabídkou.
            Zavolat můžeš taky kdykoliv: <strong>+420 739 045 057</strong>.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/malaga#poptat" className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white text-[#1a1a2e] text-sm font-bold hover:opacity-90 transition-opacity">
              Naplánovat cestu →
            </Link>
            <Link href="/malaga" className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/10 text-white text-sm font-bold border border-white/20 hover:bg-white/20 transition-colors">
              Vše o Malaze
            </Link>
          </div>
        </div>

        {/* Related */}
        <div className="mt-6 pt-8 border-t border-[#E2E6F3]">
          <h2 className="text-lg font-black text-[#1a1a2e] mb-4">Hodí se k tomu</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link
              href="/clanky/doprava-kola-do-malagy"
              className="block bg-white border border-[#E2E6F3] rounded-2xl p-5 hover:border-[#E8431A]/40 transition-colors"
            >
              <div className="text-xs font-bold uppercase tracking-wider text-[#E8431A] mb-2">Malaga</div>
              <h3 className="text-base font-black text-[#1a1a2e] mb-1">Doprava kola do Malagy krok za krokem</h3>
              <p className="text-xs text-[#5A6480]">Logistika, ceník, pojištění, sběrná místa — jak přeprava reálně funguje.</p>
            </Link>
            <Link
              href="/clanky/vlastni-kolo-malaga-vs-pujcovna"
              className="block bg-white border border-[#E2E6F3] rounded-2xl p-5 hover:border-[#E8431A]/40 transition-colors"
            >
              <div className="text-xs font-bold uppercase tracking-wider text-[#E8431A] mb-2">Malaga</div>
              <h3 className="text-base font-black text-[#1a1a2e] mb-1">Vlastní kolo vs půjčovna — kdy se co vyplatí</h3>
              <p className="text-xs text-[#5A6480]">Konkrétní rozpočet pro 3 profily jezdců. Kdy dává smysl vozit vlastní.</p>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
