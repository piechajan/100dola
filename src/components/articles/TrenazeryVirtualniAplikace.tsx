import Image from "next/image";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { PRODUCTS, formatPrice } from "@/data/products";
import { ACTIVE_PROMO, promoApplies, promoPrice } from "@/lib/promo";

/**
 * Cena se bere z katalogu, ne z textu článku.
 *
 * Když jsme přecenili T2 a T3 podle trhu, článek dál ukazoval staré částky —
 * přesně ten rozchod, kvůli kterému se nemá cena psát na dvě místa.
 */
function cenaProduktu(slug: string): { bezna: string; sKodem: string | null } {
  const p = PRODUCTS.find((x) => x.slug === slug);
  if (!p) return { bezna: "", sKodem: null };
  const akce = ACTIVE_PROMO && promoApplies(p.categoryId);
  return {
    bezna: formatPrice(p.priceWithVat),
    sKodem: akce ? formatPrice(promoPrice(p.priceWithVat)) : null,
  };
}

/**
 * SEO článek „Trenažéry a virtuální aplikace" — target keywords:
 *   - "chytrý trenažér"
 *   - "Zwift vs Rouvy vs MyWhoosh"
 *   - "jak funguje smart trenažér"
 *   - "FE-C ANT+ Bluetooth trenažér"
 *   - "trenažér na zimu"
 *
 * Pozicování: vysvětlit protokoly tak, aby člověk pochopil, že nekupuje
 * uzamčený ekosystém. Pak porovnat tři aplikace a poslat ho na konkrétní
 * trenažér podle rozpočtu. Cross-sell na Malagu jako alternativu k zimě doma.
 */

const FAQ = [
  {
    q: "Potřebuju na Zwift nebo Rouvy konkrétní značku trenažéru?",
    a: "Ne. Všechny tři velké aplikace komunikují přes standardy ANT+ FE-C, Bluetooth FTMS nebo obojí. Jakýkoli chytrý trenažér, který je podporuje — a všechny naše ano — s nimi bude fungovat.",
  },
  {
    q: "Co znamená, že trenažér je „ovládaný“?",
    a: "Aplikace trenažéru posílá, jaký odpor má nastavit. Když ve Zwiftu najedete na stoupání, trenažér sám přitvrdí. Bez této funkce byste si museli odpor přepínat ručně a sklon trati by neměl žádný efekt.",
  },
  {
    q: "Musím mít doma wi-fi a výkonný počítač?",
    a: "Stačí telefon nebo tablet. Zwift i Rouvy běží na iOS i Androidu, MyWhoosh taky. Na velkou obrazovku se obraz dá poslat přes Apple TV nebo Chromecast.",
  },
  {
    q: "Je nutná kazeta navíc?",
    a: "U direct-drive trenažérů ano — sundáte zadní kolo a kazetu nasadíte na trenažér. Buď koupíte druhou (pohodlnější), nebo budete přendávat tu z kola. Naše trenažéry kazetu v balení nemají.",
  },
  {
    q: "Jak hlučný je chytrý trenažér v bytě?",
    a: "Direct-drive modely se dnes pohybují do 55 dB, což je hlasitost běžného hovoru. Nejvíc slyšet bývá řetěz a ventilátor, ne samotný trenažér. Podložka pod trenažér tlumí přenos vibrací do podlahy.",
  },
];

export default function TrenazeryVirtualniAplikace() {
  return (
    <article className="bg-white">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }}
      />
      <div className="max-w-[820px] mx-auto px-6 md:px-12 py-12 md:py-16">
        <p className="text-lg text-[#5A6480] leading-relaxed mb-10">
          Chytrý trenažér není jen stojan, který klade odpor. Je to zařízení,
          které si s aplikací povídá oběma směry — posílá jí váš výkon a kadenci
          a ona mu zpátky říká, jak moc má přitvrdit.{" "}
          <strong>
            Díky tomu stoupání v aplikaci fakt bolí a sjezd si fakt odpočinete.
          </strong>{" "}
          Tenhle návod vysvětluje, jak to funguje, co znamenají zkratky na
          krabici a kterou aplikaci vybrat.
        </p>

        <div className="bg-[#F0F4FF] border border-[#C4D2F0] rounded-2xl p-6 mb-10">
          <div className="text-[10px] uppercase tracking-wider font-bold text-[#3B7CF4] mb-3">
            V kostce
          </div>
          <ul className="space-y-2 text-sm text-[#1a1a2e]">
            <li>
              🔌 <strong>Nekupujete uzamčený ekosystém.</strong> Protokoly jsou
              standardizované, takže každý náš trenažér jede se Zwiftem, Rouvy
              i MyWhoosh.
            </li>
            <li>
              ⛰️ <strong>Simulace stoupání</strong> je to, co odlišuje modely —
              od 15 % u T2 po 27 % u T3.
            </li>
            <li>
              🎯 <strong>Přesnost ±1 %</strong> znamená, že data z trenažéru jdou
              použít k řízenému tréninku podle zón.
            </li>
            <li>
              🔁 <strong>Kazetu si dokoupíte zvlášť</strong> — nebo přendáte tu
              z kola.
            </li>
          </ul>
        </div>

        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-4">
            Co znamenají ANT+, FE-C a FTMS
          </h2>
          <p className="text-base text-[#5A6480] leading-relaxed mb-4">
            Na krabici každého trenažéru najdete tři až čtyři zkratky. Vypadá to
            složitě, ale v praxi jde jen o to, kdo s kým umí mluvit.
          </p>
          <div className="space-y-3">
            {[
              ["Bluetooth (BLE)", "Spojení s telefonem, tabletem nebo počítačem. Nejjednodušší cesta — nic navíc nekupujete."],
              ["ANT+", "Starší, ale extrémně spolehlivý standard. Používají ho cyklopočítače Garmin a Wahoo. Na počítači potřebujete USB adaptér (malý přijímač do USB portu)."],
              ["FE-C", "Nástavba nad ANT+, která umožňuje aplikaci trenažér OVLÁDAT, ne jen číst data. Tohle je ta důležitá zkratka."],
              ["FTMS", "To samé co FE-C, ale po Bluetooth. Dnešní standard, který podporují všechny velké aplikace."],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-4 items-start">
                <div className="font-black text-[#1a1a2e] min-w-[120px] text-sm pt-0.5">
                  {k}
                </div>
                <p className="text-sm text-[#5A6480] leading-relaxed">{v}</p>
              </div>
            ))}
          </div>
          <p className="text-base text-[#5A6480] leading-relaxed mt-5">
            Jestli si z toho máte odnést jednu věc: <strong>hledejte FE-C nebo
            FTMS</strong>. Bez nich trenažér jen měří a aplikace ho neumí řídit.
            Všechny trenažéry, které vedeme, je mají.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-4">
            Zwift, Rouvy, MyWhoosh — která aplikace
          </h2>
          <p className="text-base text-[#5A6480] leading-relaxed mb-5">
            Tyhle tři pokrývají drtivou většinu lidí. Liší se hlavně tím, jestli
            chcete jezdit v herním světě, po reálných silnicích, nebo zadarmo.
          </p>

          <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
            <table className="w-full text-sm border-collapse min-w-[640px]">
              <thead>
                <tr className="bg-[#F0F4FF] text-[#1a1a2e]">
                  <th className="text-left font-bold p-3 rounded-l-lg">
                    Aplikace
                  </th>
                  <th className="text-left font-bold p-3">Prostředí</th>
                  <th className="text-left font-bold p-3">Komu sedne</th>
                  <th className="text-left font-bold p-3 rounded-r-lg">
                    Co zvážit
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  [
                    "Zwift",
                    "Herní svět, animovaný",
                    "Kdo chce jezdit s lidmi — hromadné starty, závody, skupinovky prakticky nonstop",
                    "Předplatné jen pro jednoho — rodinný tarif Zwift nemá. Zato je tu nejvíc lidí online, takže na doják nikdy nejste sami",
                  ],
                  [
                    "Rouvy",
                    "Reálné video z tratí",
                    "Kdo si chce projet konkrétní stoupání nebo trénovat na závod, který ho čeká",
                    "Česká aplikace, trasy včetně domácích kopců. Jako jediná má sdílené tarify — ve dvou i pro pět jezdců vyjde na osobu zlomek",
                  ],
                  [
                    "MyWhoosh",
                    "Herní svět",
                    "Kdo nechce platit předplatné a vystačí si s menší komunitou",
                    "Zdarma. Méně jezdců online, menší nabídka organizovaných jízd",
                  ],
                ].map((r) => (
                  <tr key={r[0]} className="border-b border-[#E8ECF4] align-top">
                    <td className="p-3 font-black text-[#1a1a2e]">{r[0]}</td>
                    <td className="p-3 text-[#5A6480]">{r[1]}</td>
                    <td className="p-3 text-[#5A6480]">{r[2]}</td>
                    <td className="p-3 text-[#5A6480]">{r[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-sm text-[#8A94AB] leading-relaxed mt-4">
            Všechny tři jedou na telefonu i tabletu a všechny tři umí ovládat
            trenažér přes FE-C nebo FTMS. Vyzkoušejte si je — vybírat aplikaci
            podle trenažéru nemusíte, trenažér umí všechny.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-4">
            Který trenažér podle toho, jak jezdíte
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                href: "/shop/cycplus-r200",
                photo: "/media/products/cycplus-r200-1.webp",
                name: "CYCPLUS R200",
                for: "Začínáte s trenažérem a nechcete utopit majlant. Přesnost ±1 % máte stejnou jako u dražších.",
              },
              {
                href: "/shop/cycplus-t2h",
                photo: "/media/products/cycplus-t2h-1.webp",
                name: "CYCPLUS T2H",
                for: "Nejlepší poměr v nabídce. 85 Nm a stoupání do 20 % utáhne i těžší intervaly.",
              },
              {
                href: "/shop/cycplus-t2",
                photo: "/media/products/cycplus-t2-1.webp",
                name: "CYCPLUS T2",
                for: "Výkyv do stran 8° a provoz bez zásuvky. Nejrealističtější pocit z jízdy za rozumné peníze.",
              },
              {
                href: "/shop/cycplus-t3",
                photo: "/media/products/cycplus-t3-1.webp",
                name: "CYCPLUS T3",
                for: "Stoupání do 27 % a měření rovnováhy levé a pravé nohy. Pro trénink podle dat.",
              },
            ].map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className="flex gap-4 rounded-2xl border border-[#E2E6F3] p-4 hover:border-[#3B7CF4] transition"
              >
                <div className="relative w-[96px] h-[96px] shrink-0">
                  <Image
                    src={t.photo}
                    alt={`${t.name} — chytrý cyklistický trenažér`}
                    fill
                    sizes="88px"
                    className="object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-baseline justify-between gap-3 mb-1">
                    <span className="font-black text-[#1a1a2e]">{t.name}</span>
                    {(() => {
                      const c = cenaProduktu(t.href.replace("/shop/", ""));
                      return (
                        <span className="text-right whitespace-nowrap">
                          <span className="text-sm font-bold text-[#3B7CF4]">{c.bezna}</span>
                          {c.sKodem && (
                            <span className="block text-[11px] font-bold text-[#065F46]">
                              {c.sKodem} s kódem
                            </span>
                          )}
                        </span>
                      );
                    })()}
                  </div>
                  <p className="text-sm text-[#5A6480] leading-relaxed">{t.for}</p>
                </div>
              </Link>
            ))}
          </div>

          <Link
            href="/shop/cycplus-f1-ventilator"
            className="mt-4 flex gap-4 rounded-2xl border border-[#E2E6F3] p-4 hover:border-[#3B7CF4] transition"
          >
            <div className="relative w-[96px] h-[96px] shrink-0">
              <Image
                src="/media/products/cycplus-f1-1.webp"
                alt="CYCPLUS F1 — elektronicky řízený ventilátor pro indoor trénink"
                fill
                sizes="88px"
                className="object-contain"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-baseline justify-between gap-3 mb-1">
                <span className="font-black text-[#1a1a2e]">CYCPLUS F1</span>
                <span className="text-sm font-bold text-[#3B7CF4] whitespace-nowrap">
                  <span className="block">{cenaProduktu("cycplus-f1-ventilator").bezna}</span>
                  {ACTIVE_PROMO && (
                    <span className="block text-[11px] font-bold text-[#7A5615]">
                      {formatPrice(
                        Math.round(
                          (PRODUCTS.find((x) => x.slug === "cycplus-f1-ventilator")
                            ?.priceWithVat ?? 0) *
                            (1 - ACTIVE_PROMO.percentWithBundle / 100),
                        ),
                      )}{" "}
                      v sadě s trenažérem
                    </span>
                  )}
                </span>
              </div>
              <p className="text-sm text-[#5A6480] leading-relaxed">
                Ventilátor, který fouká podle vašeho tepu. Bez chlazení je hodina
                na trenažéru výrazně těžší, než musí být.
              </p>
            </div>
          </Link>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-4">
            Na co lidi narazí při prvním zapojení
          </h2>
          <ol className="space-y-4 text-base text-[#5A6480]">
            <li>
              <strong className="text-[#1a1a2e]">1. Chybí kazeta.</strong>{" "}
              Direct-drive trenažér ji nemá v balení. Buď si koupíte druhou,
              nebo budete přendávat tu z kola — a to vás po třetí jízdě přestane
              bavit.{" "}
              <Link
                href="/kontakt"
                className="font-bold text-[#3B7CF4] underline underline-offset-2"
              >
                Napište nám, jakou máte sadu
              </Link>{" "}
              a kazetu doobjednáme ve správném odstupňování.
            </li>
            <li>
              <strong className="text-[#1a1a2e]">2. Nesedí osa.</strong>{" "}
              Trenažér má adaptéry na rychloupínák i pevnou osu, ale u některých
              rámů potřebujete specifickou.{" "}
              <Link
                href="/shop/osa-trenazer-12mm-m12x10"
                className="font-bold text-[#3B7CF4] underline underline-offset-2"
              >
                M12 × 1.0
              </Link>
              ,{" "}
              <Link
                href="/shop/osa-trenazer-12mm-m12x15"
                className="font-bold text-[#3B7CF4] underline underline-offset-2"
              >
                M12 × 1.5
              </Link>{" "}
              i{" "}
              <Link
                href="/shop/osa-trenazer-focus-rat-boost"
                className="font-bold text-[#3B7CF4] underline underline-offset-2"
              >
                Focus R.A.T. BOOST
              </Link>{" "}
              máme skladem. Druhá osa navíc znamená, že kolo do trenažéru jen
              zacvaknete.
            </li>
            <li>
              <strong className="text-[#1a1a2e]">3. Spárováno dvakrát.</strong>{" "}
              Když trenažér připojíte zároveň po Bluetooth i ANT+, aplikace se
              může chovat podivně. Vyberte jednu cestu.
            </li>
            <li>
              <strong className="text-[#1a1a2e]">4. Opotřebení řetězu.</strong>{" "}
              Na trenažéru jedete pořád na stejném převodu a pod zátěží, takže
              řetěz i kazeta jdou dolů rychleji než venku. Olej navíc odhazuje
              mazivo na podlahu a nábytek.{" "}
              <Link
                href="/shop/navoskovani-retezu"
                className="font-bold text-[#3B7CF4] underline underline-offset-2"
              >
                Navoskovaný řetěz
              </Link>{" "}
              tohle řeší obojí — je suchý na dotek a vydrží 2–3× déle.{" "}
              <Link
                href="/clanky/voskovani-retezu"
                className="font-bold text-[#3B7CF4] underline underline-offset-2"
              >
                Jak voskování funguje
              </Link>
              .
            </li>
          </ol>
        </section>

        {/* Cross-sell Malaga */}
        <section className="mb-12">
          <div className="rounded-2xl bg-[#1a1a2e] text-white p-7 md:p-9">
            <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#FF6B3D] mb-3">
              Nebo úplně jinak
            </div>
            <h2 className="text-xl md:text-2xl font-black mb-3">
              Šlapej celou zimu v teple — na svém kole v Malaze
            </h2>
            <p className="text-white/70 leading-relaxed mb-5">
              Trenažér je skvělý na řízený trénink, ale čtyři měsíce v obýváku
              nikoho nebaví. Tvoje kolo může přezimovat v Malaze: dovezeme ho z
              Česka, počká tam připravené a ty přiletíš jen s příručákem. Žádné
              balení do kufru, žádná půjčovna.
            </p>
            <Link
              href="/malaga"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-[#FF6B3D] text-white text-sm font-black hover:opacity-90 transition"
            >
              Jak to funguje
            </Link>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-5">
            Časté dotazy
          </h2>
          <div className="space-y-5">
            {FAQ.map((f) => (
              <div key={f.q}>
                <div className="font-bold text-[#1a1a2e] mb-1">{f.q}</div>
                <p className="text-base text-[#5A6480] leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="bg-[#F7F9FC] border border-[#E2E6F3] rounded-2xl p-7 md:p-9">
          <h2 className="text-xl md:text-2xl font-black text-[#1a1a2e] mb-3">
            Nevíte, který model dává smysl pro vás?
          </h2>
          <p className="text-[#5A6480] leading-relaxed mb-5">
            Napište nám, jak a jak často trénujete a jaký máte rám. Doporučíme
            konkrétní model, řekneme, jestli potřebujete speciální adaptér osy, a
            poradíme s kazetou. Trenažéry máme na Šternberku k vyzkoušení.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/kontakt"
              className="inline-block bg-[#3B7CF4] text-white font-bold px-6 py-3 rounded-lg hover:opacity-90 transition"
            >
              Poradit s výběrem
            </Link>
            <Link
              href="/shop/doplnky/trenazery/trenazery-chytre"
              className="inline-block border border-[#C4D2F0] text-[#1a1a2e] font-bold px-6 py-3 rounded-lg hover:border-[#3B7CF4] transition"
            >
              Všechny trenažéry
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
