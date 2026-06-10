import Link from "next/link";

/**
 * SEO článek "Keramická ložiska v kole" — target keywords:
 *   - "keramická ložiska kolo"
 *   - "CeramicSpeed ložiska"
 *   - "CULT ložiska"
 *   - "keramické středové složení"
 *   - "lepší ložiska kolo"
 *   - "voskování řetězu šternberk / vsetín"
 *
 * Pozicování: 100dola Lab — prémiový upgrade pro kola za 80+ tisíc.
 * Tone: prodejní — keramika je pro každého, kdo chce maximum, ne jen pros.
 */
export default function KeramickaLoziska() {
  return (
    <article className="bg-white">
      <div className="max-w-[820px] mx-auto px-6 md:px-12 py-12 md:py-16">
        {/* Lead */}
        <p className="text-lg text-[#5A6480] leading-relaxed mb-10">
          Keramická ložiska jsou ten typ upgradu, který poznáte hned a zároveň
          si na něj nezvyknete. Plynulejší roztočení, méně odporu, nižší
          opotřebení — a u kola za 80+ tisíc je to jako vyměnit dobré
          pláště za prémiové. <strong>Stejné kolo, jiný zážitek.</strong>{" "}
          V tomto článku popíšeme, co keramická ložiska reálně dělají, jaké
          značky stojí za peníze, a jak vyměnit ložiska v 100dola Lab.
        </p>

        {/* Quick summary */}
        <div className="bg-[#F0FAF5] border border-[#B6E0CA] rounded-2xl p-6 mb-12">
          <div className="text-[10px] uppercase tracking-wider font-bold text-[#1F4937] mb-3">
            V kostce
          </div>
          <ul className="space-y-2 text-sm text-[#1a1a2e]">
            <li>
              💎 <strong>Co to je:</strong> hybridní ložiska s ocelovými
              kroužky a kuličkami z keramiky (Si₃N₄). Hladší povrch, nižší
              tření, vyšší tuhost
            </li>
            <li>
              ⚡ <strong>Hlavní benefit:</strong> 1–9 W úspora na celé
              kolo, plynulejší roztočení, jednodušší rotace v nízkých
              rychlostech (start, výjezd)
            </li>
            <li>
              🛡️ <strong>Životnost:</strong> 2–3× déle než ocelová, méně
              náchylná na vodu a prach
            </li>
            <li>
              💸 <strong>Cenový rozsah:</strong> headset 1 500–4 000 Kč,
              středové složení 4 000–12 000 Kč, kompletní wheel set upgrade
              15 000–30 000 Kč
            </li>
            <li>
              📍 <strong>Kde to děláme:</strong> 100dola Lab, Šternberk
              (Partyzánská 2) — pravidelní klienti z Vsetína, Olomouce,
              Valašského Meziříčí, Ostravy a Brna
            </li>
          </ul>
        </div>

        {/* 1. Co dělají */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-4">
            Co keramická ložiska reálně dělají
          </h2>
          <p className="text-base text-[#5A6480] leading-relaxed mb-4">
            Klíčový rozdíl je <strong>tvrdost a hladkost kuliček</strong>.
            Keramické (Si₃N₄ — nitrid křemíku) jsou:
          </p>
          <ul className="space-y-3 text-base text-[#1a1a2e] leading-relaxed list-disc list-outside ml-5 marker:text-[#1F4937] mb-6">
            <li>
              <strong>Lehčí o 60 %</strong> než stejně velké ocelové. Méně
              hmoty = méně setrvačnosti.
            </li>
            <li>
              <strong>Tvrdší a hladší.</strong> Povrchové nerovnosti, které
              u ocelových kuliček vytvářejí tření, u keramických prakticky
              nejsou.
            </li>
            <li>
              <strong>Odolnější vůči korozi.</strong> Voda, sůl ze silnic
              v zimě, prach z gravelu — keramika tomu odolává mnohem líp.
            </li>
            <li>
              <strong>Méně náročné na mazivo.</strong> Některá ložiska (CULT
              od Campagnola) jezdí prakticky nasucho.
            </li>
          </ul>

          <p className="text-base text-[#5A6480] leading-relaxed">
            Reálný benefit cítíte hlavně v <strong>plynulém roztočení</strong>
            {" "}— při startu z 0 km/h, při výjezdu do kopce v nízkých
            kadencích, při zatáčení a změně sklonu silnice. Není to o
            maximální rychlosti na rovince (tam rozdíl rozhodne aerodynamika,
            ne ložiska), ale o <em>kvalitě jízdy</em>.
          </p>
        </section>

        {/* 2. Pro koho */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-4">
            Pro koho jsou keramická ložiska
          </h2>
          <p className="text-base text-[#5A6480] leading-relaxed mb-6">
            Keramika není „jen pro WorldTour" — moderní hybridní ložiska
            jsou cenově dostupná i pro nadšeného hobby jezdce. Nejvíc z nich
            vytěží tito:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-[#B6E0CA] rounded-xl p-5">
              <div className="text-2xl mb-2">🏎️</div>
              <h3 className="font-black text-[#1F4937] mb-2">Majitelé kvalitních kol</h3>
              <p className="text-sm text-[#5A6480] leading-relaxed">
                Investovali jste 80, 120, 200+ tisíc do kola. Karbonový rám,
                Dura-Ace nebo Force AXS, karbonová kola. Ložiska jsou jediná
                komponenta, která v té sestavě bývá ještě průměrná —
                a právě tu vyladíte.
              </p>
            </div>
            <div className="bg-white border border-[#B6E0CA] rounded-xl p-5">
              <div className="text-2xl mb-2">🏃</div>
              <h3 className="font-black text-[#1F4937] mb-2">Triatlonisti a časovkáři</h3>
              <p className="text-sm text-[#5A6480] leading-relaxed">
                V Ironman bike legu nebo na časovce hraje každý watt roli.
                Keramika dává 1–3 W na celém kole — to je v 4-hodinovém
                výkonu reálných 15–40 sekund.
              </p>
            </div>
            <div className="bg-white border border-[#B6E0CA] rounded-xl p-5">
              <div className="text-2xl mb-2">⛰️</div>
              <h3 className="font-black text-[#1F4937] mb-2">Kopcoví jezdci</h3>
              <p className="text-sm text-[#5A6480] leading-relaxed">
                Stoupání v nízkých rychlostech a kadencích — tam je rozdíl
                nejcítitelnější. Na Ecce Homo nebo Pradědu poznáte plynulejší
                přechod do dalšího tlaku.
              </p>
            </div>
            <div className="bg-white border border-[#B6E0CA] rounded-xl p-5">
              <div className="text-2xl mb-2">⚙️</div>
              <h3 className="font-black text-[#1F4937] mb-2">Mechanicky zaměření</h3>
              <p className="text-sm text-[#5A6480] leading-relaxed">
                Cítí, kdy řetěz „drhne", kdy je středové složení rozladěné,
                kdy headset začíná „klepat". Pro ně jsou keramická ložiska
                logický další krok — komponenta, která zůstane v pořádku
                roky bez doteku.
              </p>
            </div>
            <div className="bg-white border border-[#B6E0CA] rounded-xl p-5">
              <div className="text-2xl mb-2">🎁</div>
              <h3 className="font-black text-[#1F4937] mb-2">Dárek sobě / partnerovi</h3>
              <p className="text-sm text-[#5A6480] leading-relaxed">
                Keramický headset za 2 500 Kč je dárek, který se cyklistovi
                líbí víc než nové ponožky. Kompletní upgrade středového
                složení za 8 000 Kč je vánoční překvapení v jiné lize.
              </p>
            </div>
            <div className="bg-white border border-[#B6E0CA] rounded-xl p-5">
              <div className="text-2xl mb-2">🌱</div>
              <h3 className="font-black text-[#1F4937] mb-2">Dlouhodobí investoři</h3>
              <p className="text-sm text-[#5A6480] leading-relaxed">
                Kolo si chcete nechat 8–10 let. Ocelová ložiska budete měnit
                každé 2 roky, keramická typicky vydrží celou tu dobu. Cena
                za rok provozu je u keramiky často nižší.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Kde se vyplatí měnit */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-4">
            Kde na kole má keramika největší dopad
          </h2>
          <p className="text-base text-[#5A6480] leading-relaxed mb-6">
            Ne všechna ložiska v kole jsou stejně důležitá. Tady je pořadí
            podle <strong>návratnosti investice</strong> (Kč za měřitelný
            přínos):
          </p>

          <div className="overflow-hidden rounded-2xl border border-[#E2E6F3]">
            <table className="w-full text-sm">
              <thead className="bg-[#F0FAF5]">
                <tr>
                  <th className="text-left p-4 font-black text-[#1a1a2e]">Komponenta</th>
                  <th className="text-left p-4 font-black text-[#1a1a2e]">Cena</th>
                  <th className="text-left p-4 font-black text-[#1a1a2e]">Co dostanete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E6F3]">
                <tr>
                  <td className="p-4 align-top">
                    <strong className="text-[#1F4937]">1. Wheel hubs</strong>
                    <div className="text-[11px] text-[#9AA3C2]">přední + zadní náboj</div>
                  </td>
                  <td className="p-4 align-top">
                    <strong>8 000–20 000 Kč</strong>
                  </td>
                  <td className="p-4 text-[#5A6480]">
                    Největší dopad — kola se točí celý čas. Plynulejší
                    roztočení v zatáčkách a downhillech, kola se „nepřilepí"
                    při dlouhém volném dojetí.
                  </td>
                </tr>
                <tr>
                  <td className="p-4 align-top">
                    <strong className="text-[#1F4937]">2. Středové složení</strong>
                    <div className="text-[11px] text-[#9AA3C2]">bottom bracket</div>
                  </td>
                  <td className="p-4 align-top">
                    <strong>4 000–12 000 Kč</strong>
                  </td>
                  <td className="p-4 text-[#5A6480]">
                    Při každém šlápnutí. CeramicSpeed Coated BB typicky
                    1–2 W úspora. Životnost 3–5× delší než stock BB.
                  </td>
                </tr>
                <tr>
                  <td className="p-4 align-top">
                    <strong className="text-[#1F4937]">3. Pulley wheels</strong>
                    <div className="text-[11px] text-[#9AA3C2]">kladky přehazovačky</div>
                  </td>
                  <td className="p-4 align-top">
                    <strong>5 000–15 000 Kč</strong>
                  </td>
                  <td className="p-4 text-[#5A6480]">
                    CeramicSpeed OSPW System — velké jumbo kladky s keramikou.
                    Estetický wow-faktor + 1 W úspora + tichý chod.
                  </td>
                </tr>
                <tr>
                  <td className="p-4 align-top">
                    <strong className="text-[#1F4937]">4. Headset</strong>
                    <div className="text-[11px] text-[#9AA3C2]">řízení</div>
                  </td>
                  <td className="p-4 align-top">
                    <strong>1 500–4 000 Kč</strong>
                  </td>
                  <td className="p-4 text-[#5A6480]">
                    Méně technický přínos, ale výrazně lepší pocit při
                    nízkorychlostním manévrování. Headset bývá první, kdo
                    začne „klepat" po pár tisících km — keramický vydrží
                    několikanásobně víc.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 4. Značky */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-4">
            Které značky doporučujeme
          </h2>
          <div className="space-y-4">
            <div className="bg-white border border-[#E2E6F3] rounded-2xl p-5">
              <h3 className="text-lg font-black text-[#1a1a2e] mb-2">
                CeramicSpeed
              </h3>
              <p className="text-sm text-[#5A6480] leading-relaxed">
                Dánská značka, branch leader. Standard pro WorldTour týmy
                (Ineos, Visma). Modelové řady: standard Hybrid bearing
                (entry), <strong>Coated</strong> (povrchová úprava pro nižší
                tření), <strong>OSPW System</strong> (jumbo pulley wheels).
                Cena vyšší, ale s tím dobrá životnost a vědomě prémiový pocit.
              </p>
            </div>
            <div className="bg-white border border-[#E2E6F3] rounded-2xl p-5">
              <h3 className="text-lg font-black text-[#1a1a2e] mb-2">
                CULT (Campagnolo)
              </h3>
              <p className="text-sm text-[#5A6480] leading-relaxed">
                Italská značka, prémiová. Originální CULT ložiska v
                Campagnolo Super Record kolech a BB30 — kuličky z keramiky
                a zinkulové dráhy. Jezdí prakticky nasucho. Pro fanoušky
                Campy a Italské estetiky.
              </p>
            </div>
            <div className="bg-white border border-[#E2E6F3] rounded-2xl p-5">
              <h3 className="text-lg font-black text-[#1a1a2e] mb-2">
                Enduro Bearings (USA)
              </h3>
              <p className="text-sm text-[#5A6480] leading-relaxed">
                Americká značka, dostupnější cenově. Hybridní keramika
                Si₃N₄ + ocelové dráhy. Pro hobby cyklistu výborný
                kompromis — 70 % výkonu CeramicSpeed za 50 % ceny.
                Doporučujeme pro střední cenové pásmo.
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
                <h3 className="font-black text-[#1a1a2e] mb-1">Konzultace</h3>
                <p className="text-sm text-[#5A6480] leading-relaxed">
                  Telefon, e-mail, osobně. Probereme, co od upgradu čekáte,
                  jaké máte kolo, jaký rozpočet. Doporučíme komponentu a
                  značku, která má pro vás největší benefit.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-[#1F4937] text-white text-sm font-black flex items-center justify-center flex-shrink-0">2</div>
              <div>
                <h3 className="font-black text-[#1a1a2e] mb-1">Objednávka ložisek</h3>
                <p className="text-sm text-[#5A6480] leading-relaxed">
                  Objednáme přesný model pro vaše kolo (rozměry BB,
                  vidlice, hub-spec se liší — důležité je vybrat správně).
                  Dodací lhůta 3–10 dní.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-[#1F4937] text-white text-sm font-black flex items-center justify-center flex-shrink-0">3</div>
              <div>
                <h3 className="font-black text-[#1a1a2e] mb-1">Demontáž a montáž</h3>
                <p className="text-sm text-[#5A6480] leading-relaxed">
                  Profesionální nástroje (BB lis, hub press, headset cup
                  press), maziva podle doporučení výrobce. Práce trvá
                  1–3 hodiny podle rozsahu, kolo si můžete vyzvednout
                  následující den.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-[#1F4937] text-white text-sm font-black flex items-center justify-center flex-shrink-0">4</div>
              <div>
                <h3 className="font-black text-[#1a1a2e] mb-1">Předání + krátká testovací jízda</h3>
                <p className="text-sm text-[#5A6480] leading-relaxed">
                  Před předáním projedeme kolo na vlastní kůži (~3 km),
                  ověříme že vše šlape hladce. Pro klienty z Vsetína,
                  Olomouce, Ostravy a Brna nabízíme i osobní předání ve
                  vašem městě.
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
            Vyšlapte si víc ze svého kola
          </h2>
          <p className="text-sm text-white/80 max-w-md mx-auto mb-5">
            Pošlete nám značku a model kola — ozveme se s konkrétním
            návrhem a cenou. Konzultace zdarma. Pro pravidelné klienty
            z Vsetína, Olomouce, Valašského Meziříčí, Ostravy i Brna
            domluvíme osobní předání.
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
              Poptat upgrade
            </Link>
          </div>
        </section>
      </div>
    </article>
  );
}
