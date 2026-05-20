import Link from "next/link";
import { ZAVOD_MIRU_2026 } from "@/data/zavod-miru";
import { STERNBERK_STORE } from "@/data/company";

/**
 * SEO článek o Závodu Míru 2026 — primární target keywords:
 *   - "závod míru dojezd šternberk"
 *   - "závod míru 2026 trasa"
 *   - "závod míru 2026 program"
 *   - "závod míru u23 šternberk"
 *   - "cyklistika šternberk květen 2026"
 *
 * Umístěn dole na /isaac-test stránce, anchor #zavod-miru-sternberk.
 * Plus /zavod-miru-sternberk rewrite na /isaac-test#zavod-miru-sternberk.
 */
export default function ZavodMiruSternberk() {
  const final = ZAVOD_MIRU_2026.stages.find((s) => s.isFinal)!;

  return (
    <article id="zavod-miru-sternberk" className="bg-white">
      <div className="max-w-[820px] mx-auto px-6 md:px-12 py-12 md:py-16">
        {/* Lead intro — hero už je v page wrapperu */}
        <p className="text-lg text-[#5A6480] leading-relaxed mb-2">
          Finálová 4. etapa juniorského UCI Závodu Míru U23 vede v neděli{" "}
          <strong>31. května 2026</strong> z Krnova přes Hrubý Jeseník do cíle na centrum
          Šternberka — <strong>130,6 km, 2 278 m převýšení</strong>, předpokládaný dojezd
          kolem <strong>17:00–17:30</strong>. Tři dny předtím se peloton žene Olomouckým
          krajem přes Šumperk, Rýmařov a sjezd z Dlouhých Strání.
        </p>
        <p className="text-[10px] text-[#9AA3C2] mb-10">
          Hero foto: Hlavní náměstí Šternberk —{" "}
          <a
            href="https://commons.wikimedia.org/wiki/File:Sternberg_-_city_center.jpg"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Wikimedia Commons
          </a>
          , CC BY-SA.
        </p>

        {/* Quick facts box */}
        <div className="bg-[#FFF1EA] border border-[#FBC9A8] rounded-2xl p-6 mb-12">
          <div className="text-[10px] uppercase tracking-wider font-bold text-[#9B3D17] mb-3">
            Klíčové informace
          </div>
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <dt className="text-[#9B3D17] mb-0.5">Datum dojezdu</dt>
              <dd className="font-black text-[#1a1a2e]">Neděle 31. 5. 2026</dd>
            </div>
            <div>
              <dt className="text-[#9B3D17] mb-0.5">Místo cíle</dt>
              <dd className="font-black text-[#1a1a2e]">Šternberk, Radniční</dd>
            </div>
            <div>
              <dt className="text-[#9B3D17] mb-0.5">Délka etapy</dt>
              <dd className="font-black text-[#1a1a2e]">130,6 km</dd>
            </div>
            <div>
              <dt className="text-[#9B3D17] mb-0.5">Předpokládaný dojezd</dt>
              <dd className="font-black text-[#1a1a2e]">17:00–17:30</dd>
            </div>
          </dl>
        </div>

        {/* Co se tu děje */}
        <section className="mb-12">
          <h3 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-4">
            Co se tu děje celý víkend
          </h3>
          <p className="text-base text-[#5A6480] leading-relaxed mb-4">
            Šternberk je v neděli cíl etapy — ale celý víkend od pátku 29. 5. žije
            cyklistikou. Centrum města se promění v cyklistickou zónu. Náměstí a Radniční
            ulice budou plné stánků, doprovodného programu a fanoušků.
          </p>
          <p className="text-base text-[#5A6480] leading-relaxed">
            V obchodě <strong>100dola sport</strong> ({STERNBERK_STORE.streetAddress},{" "}
            {STERNBERK_STORE.landmark}) jsme přesně v centru dění. Otevřeli jsme pro tebe{" "}
            <strong>tři dny testovacích jízd ISAAC zdarma</strong> — silniční a gravel
            modely, hodinová zápůjčka, deset kol na výběr. Když přijdeš v neděli, nejdřív si
            zajezdíš a pak chytíš dojezd peletonu na hlavním náměstí.{" "}
            <Link href="/isaac-test" className="text-[#3B7CF4] font-bold hover:underline">
              Rezervuj si testovací jízdu
            </Link>{" "}
            — sloty se plní rychle.
          </p>
        </section>

        {/* Trasa všech 4 etap */}
        <section className="mb-12">
          <h3 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-4">
            Trasa všech etap
          </h3>
          <p className="text-base text-[#5A6480] leading-relaxed mb-5">
            Celý závod má <strong>530,8 km</strong> a <strong>9 454 m</strong> převýšení —
            mnohem víc, než kolik najezdí elitní WorldTour závody za 4 dny. Hrubý Jeseník
            si vybírá daň.
          </p>

          <div className="overflow-x-auto rounded-2xl border border-[#E2E6F3]">
            <table className="w-full text-sm">
              <thead className="bg-[#F7F9FF] text-[10px] uppercase tracking-wider text-[#9AA3C2]">
                <tr>
                  <th className="text-left p-3 font-bold">Den</th>
                  <th className="text-left p-3 font-bold">Etapa</th>
                  <th className="text-left p-3 font-bold">Trasa</th>
                  <th className="text-right p-3 font-bold">km</th>
                  <th className="text-right p-3 font-bold">m ↑</th>
                </tr>
              </thead>
              <tbody>
                {ZAVOD_MIRU_2026.stages.map((s) => (
                  <tr
                    key={s.n}
                    className={`border-t border-[#F0F2FA] ${s.isFinal ? "bg-[#FFF8F2]" : ""}`}
                  >
                    <td className="p-3 text-xs font-bold text-[#1a1a2e]">{s.day}</td>
                    <td className="p-3 text-xs">
                      <strong>{s.n}. etapa</strong>
                      {s.isFinal && (
                        <span className="ml-1.5 inline-block text-[9px] uppercase tracking-wider font-bold text-white bg-[#E8431A] px-1.5 py-0.5 rounded-full">
                          finále
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-xs text-[#5A6480]">
                      <strong className="text-[#1a1a2e]">{s.from}</strong> ({s.fromVenue})
                      <br />
                      <span className="text-[#9AA3C2]">→</span>{" "}
                      <strong className="text-[#1a1a2e]">{s.to}</strong> ({s.toVenue})
                    </td>
                    <td className="p-3 text-right text-xs font-bold text-[#1a1a2e]">
                      {s.distanceKm}
                    </td>
                    <td className="p-3 text-right text-xs font-bold text-[#1a1a2e]">
                      {s.elevationM.toLocaleString("cs-CZ")}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-[#F7F9FF]">
                <tr>
                  <td colSpan={3} className="p-3 text-xs font-black text-[#1a1a2e]">
                    Celkem
                  </td>
                  <td className="p-3 text-right text-xs font-black text-[#1a1a2e]">
                    {ZAVOD_MIRU_2026.totalDistance.toFixed(1)}
                  </td>
                  <td className="p-3 text-right text-xs font-black text-[#1a1a2e]">
                    {ZAVOD_MIRU_2026.totalElevation.toLocaleString("cs-CZ")}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          <p className="text-xs text-[#9AA3C2] mt-3">
            Zdroj: oficiální stránka{" "}
            <a
              href={ZAVOD_MIRU_2026.officialSite}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#3B7CF4] hover:underline"
            >
              zavodmiru.com
            </a>
            .
          </p>
        </section>

        {/* Final stage detail */}
        <section className="mb-12">
          <h3 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-4">
            Finálová etapa: Krnov → Šternberk
          </h3>
          <p className="text-base text-[#5A6480] leading-relaxed mb-4">
            <strong>Neděle {final.date.split("-").reverse().join(". ")}</strong>. Peloton
            startuje na Hlavním náměstí v <strong>Krnově</strong>, projíždí Hrubým
            Jeseníkem, sjezdy do Bruntálu a Olomouckého kraje. Cíl je v centru Šternberka
            na ulici <strong>Radniční</strong> — přímo u Horního náměstí, pár metrů od
            obchodu 100dola sport.
          </p>
          <p className="text-base text-[#5A6480] leading-relaxed mb-4">
            Profil etapy je <strong>kopcovitý</strong> — 2 278 m převýšení na 130,6 km.
            Sjezdové úseky a několik kratších stoupání nedaleko cíle dávají šanci jak
            sprinterům ze skupiny, tak útočníkům. Pokud má někdo manko v celkovém pořadí
            a chce zaútočit, tahle etapa je poslední možnost.
          </p>
          <p className="text-base text-[#5A6480] leading-relaxed">
            Dojezd se očekává <strong>mezi 17:00 a 17:30</strong>. Doporučujeme přijet do
            centra Šternberka <strong>aspoň hodinu předem</strong> — parkování je
            omezené, ulice kolem trasy uzavřené, ale atmosféra na náměstí stojí za to.
          </p>
        </section>

        {/* Kde sledovat */}
        <section className="mb-12">
          <h3 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-4">
            Kde sledovat dojezd ve Šternberku
          </h3>
          <ul className="space-y-3 text-base text-[#5A6480] leading-relaxed list-disc pl-5">
            <li>
              <strong className="text-[#1a1a2e]">Hlavní cíl — ulice Radniční</strong>:
              přímo u Horního náměstí. Hlavní VIP zóna a finální 200 m je tady.
            </li>
            <li>
              <strong className="text-[#1a1a2e]">Horní náměstí</strong>: stánky,
              komentátoři, vyhlášení vítězů etapy a celého závodu. Po dojezdu se sem
              přesouvá energie.
            </li>
            <li>
              <strong className="text-[#1a1a2e]">Obchod 100dola sport</strong> (
              {STERNBERK_STORE.streetAddress}, {STERNBERK_STORE.landmark}): testovací
              jízdy ISAAC zdarma, otevřeno celý víkend.
            </li>
            <li>
              <strong className="text-[#1a1a2e]">TV / živé vysílání</strong>: ČT Sport
              vysílá živě finále závodu od cca 16:00.
            </li>
          </ul>
        </section>

        {/* CTA */}
        <div className="bg-gradient-to-br from-[#1a1a2e] to-[#2a2a4e] text-white rounded-2xl p-6 md:p-8 mb-12">
          <div className="text-[10px] uppercase tracking-wider font-bold text-[#9AB4FF] mb-2">
            Spoj zážitek
          </div>
          <h3 className="text-2xl md:text-3xl font-black mb-3">
            Otestuj kolo, sleduj závod.
          </h3>
          <p className="text-sm text-white/70 max-w-md mb-5">
            Tři dny ISAAC testovacích jízd v obchodě 100dola sport — pátek od 9:00,
            sobota od 14:00, neděle od 9:00. Hodinová zápůjčka zdarma, road i gravel,
            10 kol na výběr. V neděli si zajezdíš dopoledne a odpoledne chytíš dojezd
            peletonu.
          </p>
          <Link
            href="/isaac-test"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#E8431A] text-white text-sm font-black hover:opacity-90"
          >
            Rezervovat termín testovací jízdy →
          </Link>
        </div>

        {/* Co dělat ve Šternberku */}
        <section className="mb-12">
          <h3 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-4">
            Co dělat ve Šternberku, když jsi tu o víkendu
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
            <div className="bg-[#F7F9FF] rounded-2xl p-5">
              <div className="text-2xl mb-2">☕</div>
              <h4 className="font-black text-[#1a1a2e] mb-1">Kavárna Namístě</h4>
              <p className="text-sm text-[#5A6480] leading-relaxed">
                Hned vedle našeho obchodu. Specialty kafe, domácí limonády, snídaně. Bistro
                NAMÍSTĚ patří mezi nejlépe hodnocené kavárny olomouckého regionu (Gault
                Millau). Skvělé místo, kde počkat na dojezd.
              </p>
            </div>
            <div className="bg-[#F7F9FF] rounded-2xl p-5">
              <div className="text-2xl mb-2">🏰</div>
              <h4 className="font-black text-[#1a1a2e] mb-1">Hrad Šternberk</h4>
              <p className="text-sm text-[#5A6480] leading-relaxed">
                Gotický hrad nad městem (10 min pěšky z náměstí). Otevřeno o víkendu, vstup
                cca 150 Kč, krásný výhled na město a okolí. Možnost prohlídky interiérů.
              </p>
            </div>
            <div className="bg-[#F7F9FF] rounded-2xl p-5">
              <div className="text-2xl mb-2">🛏️</div>
              <h4 className="font-black text-[#1a1a2e] mb-1">Pension U Hradu</h4>
              <p className="text-sm text-[#5A6480] leading-relaxed mb-2">
                Ubytování i restaurace pod samotným hradem (Ořechová 15). Restaurace s
                výhledem na hrad a zahrady, výborné jídlo, kamenný krb. Deluxe pokoje
                s terasou a panoramatickým výhledem na město.
              </p>
              <a
                href="https://www.pension-uhradu.cz/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-[#3B7CF4] hover:underline"
              >
                pension-uhradu.cz →
              </a>
            </div>
            <div className="bg-[#F7F9FF] rounded-2xl p-5">
              <div className="text-2xl mb-2">🚴</div>
              <h4 className="font-black text-[#1a1a2e] mb-1">Test ISAAC kola</h4>
              <p className="text-sm text-[#5A6480] leading-relaxed">
                Hodinová zápůjčka zdarma — silnice nebo gravel. Vyber si Meson, Element,
                Boson, Vitron, Kaon nebo Torus Xplore. Vyzkoušíš si kolo, na které sis sám
                netroufnul přijet objednat naslepo.
              </p>
            </div>
            <div className="bg-[#F7F9FF] rounded-2xl p-5">
              <div className="text-2xl mb-2">🍻</div>
              <h4 className="font-black text-[#1a1a2e] mb-1">Po dojezdu závodu</h4>
              <p className="text-sm text-[#5A6480] leading-relaxed">
                Náměstí žije ještě hodiny po vyhlášení. Restaurace a kavárny v centru jsou
                otevřené, atmosféra je výborná. Šternberk je v neděli 31. 5. nejlepší
                cíl na večerní pivo z celého kraje.
              </p>
            </div>
          </div>
        </section>

        {/* Tipy kde sledovat / co vidět kolem trasy */}
        <section className="mb-12">
          <h3 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-4">
            Tipy na zajímavá místa v okolí
          </h3>
          <p className="text-base text-[#5A6480] leading-relaxed mb-5">
            Pokud nechceš jen čekat v cíli, kolem Šternberka je spousta míst, kde se dá
            spojit sledování závodu s prohlídkou nebo procházkou. Sem tipy ověřené:
          </p>
          <div className="space-y-3">
            {[
              {
                icon: "🏆",
                name: "Cílová zóna — Radniční ulice + Horní náměstí",
                desc: "Hlavní cíl etapy. Nejlepší atmosféra, VIP zóna, komentátoři, vyhlášení. Přijď 1–2 h před dojezdem.",
                mapsUrl:
                  "https://www.google.com/maps/place/Horn%C3%AD+n%C3%A1m%C4%9Bst%C3%AD,+785+01+%C5%A0ternberk/",
              },
              {
                icon: "🏰",
                name: "Hrad Šternberk",
                desc: "Gotický hrad nad městem — 10 min pěšky z náměstí. Z hradeb krásný výhled na cílovou zónu i okolí. O víkendu otevřeno, vstup ~150 Kč.",
                mapsUrl:
                  "https://www.google.com/maps/place/Hrad+%C5%A0ternberk/",
              },
              {
                icon: "⛪",
                name: "Klášter a kostel Zvěstování Panny Marie",
                desc: "Bývalý augustiniánský klášter pod hradem. Tichý a historicky zajímavý prostor pár metrů od cíle, dobrá pauza mezi závodem a vyhlášením.",
                mapsUrl:
                  "https://www.google.com/maps/search/Kl%C3%A1%C5%A1ter+Zv%C4%9Bstov%C3%A1n%C3%AD+Panny+Marie+%C5%A0ternberk/",
              },
              {
                icon: "🌄",
                name: "Vyhlídka Lipina",
                desc: "Asi 5 km nad Šternberkem — panoramatický pohled na město a Hrubý Jeseník. Pokud přijedeš na kole, populární Strava segment z města nahoru.",
                mapsUrl:
                  "https://www.google.com/maps/place/Lipina+u+%C5%A0ternberka/",
              },
              {
                icon: "🌲",
                name: "Mariánské Údolí (Hlubočky)",
                desc: "Lesní oblast 12 km jihovýchodně od Šternberka — kavárna v lese, procházky podél Bystřice. Klidný únik před dojezdem do města.",
                mapsUrl:
                  "https://www.google.com/maps/place/Mari%C3%A1nsk%C3%A9+%C3%9Adol%C3%AD,+Hlubo%C4%8Dky/",
              },
              {
                icon: "🍺",
                name: "Šternberk centrum po závodě",
                desc: "Po vyhlášení žijí náměstí a kavárny ještě hodiny. Restaurace v centru otevřené, atmosféra výborná — Šternberk je v ten večer nejlepší cíl na pivo v kraji.",
                mapsUrl:
                  "https://www.google.com/maps/place/N%C3%A1m%C4%9Bst%C3%AD+%C5%A0ternberk/",
              },
            ].map((spot) => (
              <div
                key={spot.name}
                className="bg-white border border-[#E2E6F3] rounded-2xl p-4 flex items-start gap-4"
              >
                <div className="text-2xl flex-shrink-0">{spot.icon}</div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-[#1a1a2e] mb-1">{spot.name}</h4>
                  <p className="text-sm text-[#5A6480] leading-relaxed mb-2">{spot.desc}</p>
                  <a
                    href={spot.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#3B7CF4] hover:underline"
                  >
                    📍 Otevřít v Google Mapách →
                  </a>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-[#9AA3C2] mt-4">
            Detailní trasa etapy se obvykle zveřejňuje pár dní před závodem na{" "}
            <a
              href="https://zavodmiru.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#3B7CF4] hover:underline"
            >
              zavodmiru.com
            </a>{" "}
            — pokud chceš peloton chytit na konkrétním místě trasy mimo Šternberk,
            zkontroluj časovou mapu těsně před dnem etapy.
          </p>
        </section>

        {/* Historie závodu */}
        <section className="mb-12">
          <h3 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-4">
            Krátce o tradici Závodu Míru
          </h3>
          <p className="text-base text-[#5A6480] leading-relaxed mb-3">
            Závod Míru patří k nejstarším etapovým cyklistickým závodům v Evropě. Poprvé
            se jel v roce <strong>1948</strong> mezi Varšavou a Prahou jako symbol
            poválečného sblížení tří států (později Praha–Berlín–Varšava). Mezi vítězi
            jsou jména jako Jan Veselý, Olaf Ludwig nebo Uwe Ampler.
          </p>
          <p className="text-base text-[#5A6480] leading-relaxed mb-3">
            Elitní mezinárodní ročník skončil v roce 2006. Od roku <strong>2013</strong>{" "}
            se nepřetržitě jede mládežnická U23 verze v Olomouckém kraji — jedna z
            nejdůležitějších evropských akcí pro nadějné juniory a U23 jezdce. Letos
            závodí v kategorii <strong>UCI Nations&apos; Cup U23</strong>, kam jezdí
            mladí jezdci z WorldTour stájí (BORA-hansgrohe, Movistar, INEOS) i národní
            týmy.
          </p>
          <p className="text-base text-[#5A6480] leading-relaxed">
            Pokud jsi nikdy nebyl na cyklistickém závodě naživo,{" "}
            <strong>Závod Míru je dobrý začátek</strong> — atmosféra, peloton těsně u
            tebe, doprovodný program ve startovních i cílových městech, a v neděli ve
            Šternberku celý víkend cyklistických aktivit.
          </p>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h3 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-5">
            Časté otázky
          </h3>
          <div className="space-y-4">
            {FAQ_ITEMS.map((q) => (
              <details
                key={q.q}
                className="group bg-white border border-[#E2E6F3] rounded-xl p-5 cursor-pointer"
              >
                <summary className="text-base font-black text-[#1a1a2e] flex items-start justify-between gap-3 list-none">
                  <span>{q.q}</span>
                  <span className="text-[#9AA3C2] group-open:rotate-180 transition-transform">
                    ▾
                  </span>
                </summary>
                <p className="mt-3 text-sm text-[#5A6480] leading-relaxed">{q.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <div className="bg-[#F7F9FF] border border-[#E2E6F3] rounded-2xl p-6 md:p-8 text-center">
          <h3 className="text-xl md:text-2xl font-black text-[#1a1a2e] mb-2">
            Plánuješ si víkend ve Šternberku?
          </h3>
          <p className="text-sm text-[#5A6480] mb-5">
            Rezervuj si hodinovou testovací jízdu ISAAC — pátek, sobota nebo neděle.
            Hodinu si zajezdíš, pak chytíš dojezd peletonu.
          </p>
          <Link
            href="/isaac-test"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#3B7CF4] text-white text-sm font-black hover:opacity-90"
          >
            Vybrat kolo a termín →
          </Link>
        </div>
      </div>
    </article>
  );
}

const FAQ_ITEMS = [
  {
    q: "Kde přesně je dojezd Závodu Míru ve Šternberku?",
    a: "Cílovka 4. etapy je v centru Šternberka na ulici Radniční, hned u Horního náměstí. Posledních 200 metrů je široká cílová zóna s VIP tribunou. Náš obchod 100dola sport je vzdálen pár desítek metrů na Partyzánské 2.",
  },
  {
    q: "V kolik hodin dojede peloton 31. května?",
    a: "Předpokládaný dojezd je mezi 17:00 a 17:30. Start v Krnově je v poledne, etapa má 130,6 km a 2 278 m převýšení. Přesný čas se může posunout o ±15 minut podle průměrné rychlosti pelotonu. Doporučujeme přijet aspoň hodinu předem.",
  },
  {
    q: "Kde zaparkovat?",
    a: "Parkování v centru bude o víkendu omezené kvůli uzavírkám pro závod. Doporučujeme parkoviště u nádraží nebo u nákupního centra Albert (~10 min pěšky do centra). V neděli může parkování zaplnit už od dopoledne.",
  },
  {
    q: "Vstupné na dojezd?",
    a: "Sledování závodu je zdarma. Celý víkend včetně doprovodného programu na náměstí je volně přístupný. Vstupné se neplatí.",
  },
  {
    q: "Bude se vysílat v TV?",
    a: "Ano, finálová etapa do Šternberku se přenáší živě na ČT Sport, typicky od cca 16:00 do vyhlášení vítěze etapy a celkového pořadí. Záznamy etap se opakují na ČT Sport a online na ČT iVysílání.",
  },
  {
    q: "Můžu si v ten den zajet sám na kole?",
    a: "Ano — kromě úseků uzavřených pro závod (cca 1 hodina před průjezdem pelotonu) je celý kraj dostupný. Plus si u nás v obchodě 100dola sport můžeš vyzkoušet ISAAC kolo — hodinová zápůjčka zdarma, road i gravel. Rezervuj termín na stránce isaac-test.",
  },
];
