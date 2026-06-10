import Link from "next/link";
import Image from "next/image";
import SparkStickyCTA from "./SparkStickyCTA";
import PreorderCounter from "@/components/preorders/PreorderCounter";

/**
 * Scott Spark RC 2027 — magazínový článek + předobjednávkový hub.
 * Target keywords (CZ): "scott spark rc 2027", "nový scott spark", "spark rc předobjednávka",
 * "závodní xc kolo 2027", "scott xc 100dola", "spark rc cena", "syncros silverton cf",
 * "scott spark rc 2027 vs 2024", "scott spark rc porovnání".
 */
export default function ScottSparkRC2027() {
  return (
    <article className="bg-white">
      <SparkStickyCTA />
      <div className="max-w-[820px] mx-auto px-6 md:px-12 py-12 md:py-16">
        {/* Lead */}
        <p className="text-lg text-[#5A6480] leading-relaxed mb-8">
          Nový{" "}
          <Link
            href="/predobjednavka/spark-rc-2027"
            className="font-bold text-[#3B7CF4] underline decoration-2 underline-offset-2 hover:no-underline"
          >
            SPARK
          </Link>{" "}
          RC 2027 právě odstartoval novou kapitolu závodního XC. V tomhle textu projdeme
          celou platformu — od filozofie rámu HMX-SL přes Ride Dynamics systém až po
          komponenty Syncros. Pokud zvažuješ nákup, je{" "}
          <Link
            href="/predobjednavka/spark-rc-2027"
            className="font-bold text-[#3B7CF4] hover:underline"
          >
            předobjednávka už otevřená
          </Link>
          .
        </p>

        {/* Preorder counter — FOMO badge, viditelné jen když je 3+ leadů */}
        <PreorderCounter modelSlug="scott-spark-rc-2027" className="mb-6" />

        {/* Sticky info-box: pro koho to je + CTA */}
        <div className="bg-[#EAF1FE] border border-[#C9DCFC] rounded-2xl p-6 mb-12">
          <div className="text-xs font-bold uppercase tracking-wider text-[#3B7CF4] mb-2">
            Rychlá orientace
          </div>
          <ul className="space-y-2 text-sm text-[#1a1a2e]">
            <li>
              <strong>Co to je:</strong> nová generace závodní XC platformy Scott Spark RC,
              modelový rok 2027.
            </li>
            <li>
              <strong>Hmotnost rámu HMX-SL ve velikosti M:</strong> 1 427 g (s lakováním a
              krytkami, bez odpružení).
            </li>
            <li>
              <strong>Řada:</strong> 8 modelů, několik barevných variant, karbonové
              konstrukce HMX-SL / HMX / HMF.
            </li>
            <li>
              <strong>Dostupnost v ČR:</strong> dodávky koncem 2026 / začátek 2027 — termín
              potvrdíme po předobjednávce.
            </li>
            <li>
              <strong>Kde si ho objednat:</strong>{" "}
              <Link
                href="/predobjednavka/spark-rc-2027"
                className="font-bold text-[#3B7CF4] underline hover:no-underline"
              >
                přes formulář na 100dola.com
              </Link>{" "}
              nebo na prodejně 100dola sport ve Šternberku.
            </li>
          </ul>
        </div>

        {/* Hero photo */}
        <figure className="my-10 -mx-6 md:-mx-12">
          <div className="relative aspect-[3/2] bg-[#F0F2FA] rounded-none md:rounded-2xl overflow-hidden">
            <Image
              src="/media/articles/scott-spark-rc-2027/spark-rc-01.webp"
              alt="Scott Spark RC 2027 — bílé provedení HMX-SL na cestě mezi cypřiši"
              fill
              sizes="(max-width: 768px) 100vw, 820px"
              className="object-cover"
              priority
            />
          </div>
          <figcaption className="text-xs text-[#9AA3C2] text-center mt-3 px-6">
            Nový Spark RC 2027 — generace, která mění hru. Foto: Scott Sports.
          </figcaption>
        </figure>

        <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mt-12 mb-4">
          Nejúspěšnější XC platforma jde do další generace
        </h2>
        <p className="text-base text-[#5A6480] leading-relaxed mb-5">
          Spark RC patří mezi nejúspěšnější závodní XC platformy v historii cyklistiky.
          Tituly mistrů světa, vítězství ve Světovém poháru, olympijské medaile. Kolo,
          jehož jméno se za posledních patnáct let stalo synonymem výkonu na nejvyšší
          úrovni.
        </p>
        <p className="text-base text-[#5A6480] leading-relaxed mb-5">
          To dědictví ale není jen nostalgie — je to závazek. Důkaz toho, co toto jméno
          musí nést i dnes. A přesně proto Scott s novou generací nešel cestou kosmetické
          změny. Spark RC 2027 je{" "}
          <strong className="text-[#1a1a2e]">nejkomplexnější závodní XC kolo SCOTT v historii značky</strong>
          .
        </p>

        <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mt-12 mb-4">
          Tři principy, na kterých Spark RC stojí
        </h2>
        <p className="text-base text-[#5A6480] leading-relaxed mb-5">
          Vývojový tým si dal pravidlo: každé konstrukční rozhodnutí musí obstát ve třech
          rovinách současně. Pokud ne, nejde to do výroby.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
          <div className="bg-[#F7F9FF] rounded-xl p-5 border border-[#E2E6F3]">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#3B7CF4] mb-1">
              Princip 1
            </div>
            <div className="text-base font-black text-[#1a1a2e]">Nízká hmotnost</div>
            <p className="text-sm text-[#5A6480] mt-2 leading-relaxed">
              Ne za každou cenu — gram se škrtá jen tam, kde nešroubuje výkon ani životnost.
            </p>
          </div>
          <div className="bg-[#F7F9FF] rounded-xl p-5 border border-[#E2E6F3]">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#3B7CF4] mb-1">
              Princip 2
            </div>
            <div className="text-base font-black text-[#1a1a2e]">Dynamika jízdy</div>
            <p className="text-sm text-[#5A6480] mt-2 leading-relaxed">
              Kontrolovaná pružnost rámu, která pomáhá držet stopu a trakci v zatáčce.
            </p>
          </div>
          <div className="bg-[#F7F9FF] rounded-xl p-5 border border-[#E2E6F3]">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#3B7CF4] mb-1">
              Princip 3
            </div>
            <div className="text-base font-black text-[#1a1a2e]">Bezchybný výkon</div>
            <p className="text-sm text-[#5A6480] mt-2 leading-relaxed">
              Integrace, kompatibilita a servis tak, abys o kolo v den závodu nemusel
              řešit nic.
            </p>
          </div>
        </div>

        {/* Comparison block — SEO target: "scott spark rc 2027 vs 2024" / "porovnání" */}
        <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mt-12 mb-4">
          Spark RC 2027 vs předchozí generace — co se reálně mění
        </h2>
        <p className="text-base text-[#5A6480] leading-relaxed mb-5">
          Pokud jezdíš na předchozím Spark RC (modelové roky 2022-2025), nová generace
          přináší 4 hmatatelné posuny — ne marketingová čísla, ale věci, které ucítíš na
          první vyjížďce.
        </p>
        <div className="overflow-hidden rounded-2xl border border-[#E2E6F3] mb-6">
          <table className="w-full text-sm">
            <thead className="bg-[#F7F9FF]">
              <tr className="text-left text-[10px] uppercase tracking-wider text-[#5A6480] font-bold">
                <th className="px-4 py-3">Co</th>
                <th className="px-4 py-3">Spark RC (2022-2025)</th>
                <th className="px-4 py-3 bg-[#EAF1FE] text-[#3B7CF4]">Spark RC 2027</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E6F3]">
              <tr>
                <td className="px-4 py-3 font-bold text-[#1a1a2e]">Hmotnost rámu (M)</td>
                <td className="px-4 py-3 text-[#5A6480]">~1 580 g (HMX)</td>
                <td className="px-4 py-3 bg-[#EAF1FE]/50 font-bold text-[#1a1a2e]">
                  1 427 g (HMX-SL) <span className="text-[#3B7CF4]">−153 g</span>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-bold text-[#1a1a2e]">Úložiště v rámu</td>
                <td className="px-4 py-3 text-[#5A6480]">Bez integrovaného úložiště</td>
                <td className="px-4 py-3 bg-[#EAF1FE]/50 font-bold text-[#1a1a2e]">
                  Save-the-Day + integrované nářadí
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-bold text-[#1a1a2e]">Teleskopická sedlovka</td>
                <td className="px-4 py-3 text-[#5A6480]">125-150 mm</td>
                <td className="px-4 py-3 bg-[#EAF1FE]/50 font-bold text-[#1a1a2e]">
                  150-200 mm (větší vel.)
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-bold text-[#1a1a2e]">Servis tlumiče</td>
                <td className="px-4 py-3 text-[#5A6480]">Standardní přístup</td>
                <td className="px-4 py-3 bg-[#EAF1FE]/50 font-bold text-[#1a1a2e]">
                  Magnetické kryty + odtok
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-bold text-[#1a1a2e]">Kola Syncros</td>
                <td className="px-4 py-3 text-[#5A6480]">Silverton SL (alu paprsky)</td>
                <td className="px-4 py-3 bg-[#EAF1FE]/50 font-bold text-[#1a1a2e]">
                  Silverton CF I (karbonové paprsky)
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-bold text-[#1a1a2e]">Kompatibilita tlumičů</td>
                <td className="px-4 py-3 text-[#5A6480]">Specifické rozměry Scott</td>
                <td className="px-4 py-3 bg-[#EAF1FE]/50 font-bold text-[#1a1a2e]">
                  Standardní XC + Scott tuning
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-[#5A6480] leading-relaxed mb-12">
          <strong>Pro koho má upgrade smysl:</strong> pokud závodíš a předchozí Spark RC je
          starší než 3 sezóny, posun v rámu (153 g) + sedlovce + úložišti se ti vrátí v
          čase a komfortu. Pokud jezdíš hobby a máš Spark RC 2024+, rozdíl bude jemný —
          spíš počkej rok a vezmi si novou generaci později.
        </p>

        <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mt-12 mb-4">
          Nízká hmotnost, která dává smysl
        </h2>
        <p className="text-base text-[#5A6480] leading-relaxed mb-5">
          Lehké kolo má smysl jen tehdy, když lehkost neberou jiné věci — třeba trakce,
          stabilita nebo životnost. Spark RC 2027 nesleduje nejnižší číslo na váze za
          každou cenu. Sleduje{" "}
          <strong className="text-[#1a1a2e]">smysluplné rozložení hmotnosti</strong>, které
          se přímo promítá do výkonu na stezce i závodní trati. Každý ušetřený gram má
          svůj účel.
        </p>

        <figure className="my-10 -mx-6 md:-mx-12">
          <div className="relative aspect-[16/7] bg-[#F0F2FA] rounded-none md:rounded-2xl overflow-hidden">
            <Image
              src="/media/articles/scott-spark-rc-2027/spark-rc-02.webp"
              alt="Detail nového rámu Spark RC — hlavová trubka, středové složení, integrace tlumiče a CeramicSpeed SLT"
              fill
              sizes="(max-width: 768px) 100vw, 820px"
              className="object-cover"
            />
          </div>
          <figcaption className="text-xs text-[#9AA3C2] text-center mt-3 px-6">
            Hlavová trubka, středové složení a SLT systém — místa, kde se výkon rozhoduje.
          </figcaption>
        </figure>

        <h3 className="text-xl font-black text-[#1a1a2e] mt-10 mb-3">Nízké těžiště</h3>
        <p className="text-base text-[#5A6480] leading-relaxed mb-5">
          Díky optimalizovanému uspořádání rámu a pokročilé kinematice je{" "}
          <strong className="text-[#1a1a2e]">tlumič umístěn co nejníže v podvozku</strong>.
          Tím Scott mohl ubrat karbonový materiál přesně tam, kde už nepřispívá k výkonu,
          a hmotnost soustředit nízko. Reálně se to projeví na stabilitě, přesnosti v
          zatáčkách a ovladatelnosti.
        </p>
        <p className="text-base text-[#5A6480] leading-relaxed mb-5">
          Oblast středového složení je naopak vyztužená — efektivně přenáší zatížení při
          šlapání a maximalizuje přenos síly. Zadní tlumič leží v ideální pozici, plně
          chráněný před nečistotami, vodou a nárazy. Výsledkem je{" "}
          <strong className="text-[#1a1a2e]">konzistentní chování odpružení</strong> i po
          tisících kilometrů na stezkách.
        </p>

        <div className="bg-[#F7F9FF] border-l-4 border-[#3B7CF4] p-5 my-8 rounded-r-xl">
          <p className="text-sm text-[#1a1a2e] leading-relaxed">
            <strong>Sada rámu Spark RC HMX-SL váží ve velikosti M pouhých 1 427 g</strong>{" "}
            — včetně kompletního lakování, všech krytek a spojovacího materiálu kloubů, bez
            odpružení. To řadí Spark RC mezi nejlehčí závodní XC fullsuspension rámy na
            trhu.
          </p>
        </div>

        <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mt-12 mb-4">
          Nekompromisní dynamika jízdy
        </h2>
        <p className="text-base text-[#5A6480] leading-relaxed mb-5">
          Druhý pilíř, ze kterého nová generace stojí. Spark RC je navržen jako{" "}
          <strong className="text-[#1a1a2e]">ucelený systém</strong> — boční, vertikální a
          torzní pružnost rámu spolu hladce spolupracují. Tuhost je tam, kde zlepšuje
          přenos síly. Pružné zóny zase tam, kde zvyšují přilnavost a tlumí drobné
          nárazy.
        </p>
        <p className="text-base text-[#5A6480] leading-relaxed mb-5">
          Pokročilá jízdní dynamika tady nespočívá v izolovaných číslech ve sportovním
          katalogu. Spočívá ve{" "}
          <strong className="text-[#1a1a2e]">
            vytvoření celku, který převádí pohyby jezdce na rychlost, kontrolu a jistotu
          </strong>
          v jakémkoli terénu.
        </p>

        <figure className="my-10 -mx-6 md:-mx-12">
          <div className="relative aspect-[16/7] bg-[#F0F2FA] rounded-none md:rounded-2xl overflow-hidden">
            <Image
              src="/media/articles/scott-spark-rc-2027/spark-rc-03.webp"
              alt="Detail karbonového profilu Spark RC — sedlové trubky, tlumič a koleno"
              fill
              sizes="(max-width: 768px) 100vw, 820px"
              className="object-cover"
            />
          </div>
        </figure>

        <blockquote className="border-l-4 border-[#3B7CF4] pl-6 my-8 italic">
          <p className="text-base md:text-lg text-[#1a1a2e] leading-relaxed mb-2">
            „Kolo téměř pluje přes všechny kameny a kořeny — udržím rychlost a zároveň
            spotřebuju méně energie v náročném terénu. Tu si pak nechám na zbytek závodu.
            Je to prostě úžasné."
          </p>
          <footer className="text-sm text-[#5A6480] not-italic">
            — <strong>Filippo Colombo</strong>, SCOTT-SRAM MTB Racing Team
          </footer>
        </blockquote>

        <h3 className="text-xl font-black text-[#1a1a2e] mt-10 mb-3">
          Přilnavost = rychlost
        </h3>
        <p className="text-base text-[#5A6480] leading-relaxed mb-5">
          Pokud kolo není vyvážené, jezdci pociťují vysokofrekvenční vibrace, kterým se
          říká <em>chatter</em>. Pneumatika začne skákat, místo aby se přilnula k povrchu.
          K tomu typicky dochází při rychlém vjezdu do zatáčky, kdy je guma na hranici
          přilnavosti — pak rychlost klesá, ovládání se rozhasí a ztrácíš jistotu.
        </p>
        <p className="text-base text-[#5A6480] leading-relaxed mb-5">
          Tahle ztráta přilnavosti není o jedné součástce. Je to{" "}
          <strong className="text-[#1a1a2e]">výsledek narušení rovnováhy celého systému</strong>{" "}
          — roli hraje odpružení, pneumatiky, kola a zejména rám. Tím, že byl Spark RC
          navržen jako integrovaný systém, Scott může přesně řídit, jak tyhle prvky
          spolupracují: potlačit chvění, obnovit trakci a zajistit jistější jízdu.
        </p>

        <figure className="my-10 -mx-6 md:-mx-12">
          <div className="relative aspect-[16/7] bg-[#F0F2FA] rounded-none md:rounded-2xl overflow-hidden">
            <Image
              src="/media/articles/scott-spark-rc-2027/spark-rc-04.webp"
              alt="Detail bočního profilu Spark RC s logem SCOTT na top tubu"
              fill
              sizes="(max-width: 768px) 100vw, 820px"
              className="object-cover"
            />
          </div>
        </figure>

        <blockquote className="border-l-4 border-[#3B7CF4] pl-6 my-8 italic">
          <p className="text-base md:text-lg text-[#1a1a2e] leading-relaxed mb-2">
            „V zatáčkách se cítíš mnohem jistěji, máš to pořád pod kontrolou. Je to trochu
            jako být v malém kokonu."
          </p>
          <footer className="text-sm text-[#5A6480] not-italic">
            — <strong>Bjorn Riley</strong>, SCOTT-SRAM MTB Racing Team
          </footer>
        </blockquote>

        <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mt-12 mb-4">
          Bezchybný výkon i v den závodu
        </h2>
        <p className="text-base text-[#5A6480] leading-relaxed mb-5">
          Třetí pilíř je o tom, abys o kolo nemusel řešit nic v okamžiku, kdy by ti to
          stálo závod. Lehké vedení kabelů, otevřená kompatibilita komponent a rychlý
          přístup k nastavení odpružení dávají výkon doslova na dosah ruky. Integrace je
          přesná, nastavení intuitivní, plně chráněný tlumič poskytuje konzistentní výkon
          i po hodinách v náročném terénu.
        </p>

        <h3 className="text-xl font-black text-[#1a1a2e] mt-10 mb-3">Kryt rámu</h3>
        <p className="text-base text-[#5A6480] leading-relaxed mb-5">
          Servis a nastavení tlumiče jsou intuitivní díky{" "}
          <strong className="text-[#1a1a2e]">snadno přístupnému rámu</strong> s horním a
          zadním krytem. Magnetické a zacvakávací kryty umožňují rychlý přístup k tlumiči
          a vnitřním částem — v dílně je servis rychlý a bezproblémový. Oba kryty rámu
          jsou utěsněné, aby chránily tlumič před vniknutím nečistot a vody.
        </p>
        <p className="text-base text-[#5A6480] leading-relaxed mb-5">
          Pro případ, že by se v rámu přesto nějaká vlhkost objevila (typicky při použití
          děleného horního krytu s elektronickým tlumičem), je v rámu velký odtokový otvor.
          Hřídel tlumiče i těsnění zůstávají plně chráněné — což je přesně to, co
          rozhoduje o tom, jestli ti odpružení vydrží konzistentně fungovat po celou
          sezónu.
        </p>

        <figure className="my-10 -mx-6 md:-mx-12">
          <div className="relative aspect-[16/7] bg-[#F0F2FA] rounded-none md:rounded-2xl overflow-hidden">
            <Image
              src="/media/articles/scott-spark-rc-2027/spark-rc-05.webp"
              alt="Detail nového rámu — kola Syncros Silverton CF I, klikový set SRAM XX SL"
              fill
              sizes="(max-width: 768px) 100vw, 820px"
              className="object-cover"
            />
          </div>
        </figure>

        <h3 className="text-xl font-black text-[#1a1a2e] mt-10 mb-3">
          Plná kompatibilita tlumičů
        </h3>
        <p className="text-base text-[#5A6480] leading-relaxed mb-5">
          Spark RC je sladěn s dodávaným nastavením odpružení tak, aby fungoval ihned po
          vybalení. Dodávané tlumiče mají speciální tuning optimalizovaný pro platformu
          Spark RC. Pokud preferuješ vlastní setup, můžeš{" "}
          <strong className="text-[#1a1a2e]">namontovat jakýkoli standardní XC tlumič</strong>{" "}
          — kompatibilita zůstává plná. Nový snadno použitelný indikátor průhybu a zdvihu
          ti pak pomůže ladit.
        </p>

        <h3 className="text-xl font-black text-[#1a1a2e] mt-10 mb-3">
          Neomezená hloubka teleskopické sedlovky
        </h3>
        <p className="text-base text-[#5A6480] leading-relaxed mb-5">
          Tvar rámu i nastavení sedlovky jsou optimalizovány pro moderní XC. Speciálně
          navržený adaptér pro košík na láhev posouvá závity mimo rám — díky tomu se
          teleskopická sedlovka může <strong className="text-[#1a1a2e]">zasunout úplně</strong>.
        </p>
        <p className="text-base text-[#5A6480] leading-relaxed mb-5">
          Velikost M má specifikovaný výsuv 150 mm. Všechny velikosti rámu zvládnou
          minimálně 150 mm, větší velikosti pak{" "}
          <strong className="text-[#1a1a2e]">teleskopické sedlovky s dlouhým zdvihem až 200 mm</strong>
          , přičemž zůstává nízká výška sedla. To dovoluje snížit těžiště, snadněji se
          přesouvat do stran, jemně ladit rovnováhu a udržet plnou kontrolu i na
          nejnáročnějších sjezdech.
        </p>

        <figure className="my-10 -mx-6 md:-mx-12">
          <div className="relative aspect-[16/7] bg-[#F0F2FA] rounded-none md:rounded-2xl overflow-hidden">
            <Image
              src="/media/articles/scott-spark-rc-2027/spark-rc-06.webp"
              alt="Detail teleskopické sedlovky Syncros, plášť Maxxis Aspen 29×2,4 a sada Save-the-Day"
              fill
              sizes="(max-width: 768px) 100vw, 820px"
              className="object-cover"
            />
          </div>
        </figure>

        <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mt-12 mb-4">
          Sada Syncros SAVE THE DAY + integrované nářadí
        </h2>
        <p className="text-base text-[#5A6480] leading-relaxed mb-5">
          Úložný prostor, ochrana a integrace patří mezi klíčové aspekty platformy.
          Vybrané modely — včetně RC Pro — jsou vybaveny úložným prostorem{" "}
          <strong className="text-[#1a1a2e]">Save-the-Day</strong>, do kterého se vejde
          taška s pumpičkou, duší a montpákami. Na stezce jsi tedy připravený téměř na
          cokoli.
        </p>
        <p className="text-base text-[#5A6480] leading-relaxed mb-5">
          Po otevření krytu spodní trubky je{" "}
          <strong className="text-[#1a1a2e]">integrované nářadí</strong> snadno přístupné
          vedle tlumiče v určeném držáku. Pokrývá všechno potřebné pro každodenní použití:
          6mm imbus pro osu, T25 Torx pro jemné doladění a (podle modelu) 3mm nebo 2,5mm
          imbus pro nastavení tlumiče.
        </p>

        <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mt-12 mb-4">
          Syncros — nová kola Silverton CF I a kokpit iC-M100-SL
        </h2>
        <p className="text-base text-[#5A6480] leading-relaxed mb-5">
          Syncros sehrál při vývoji Spark RC klíčovou roli — dodal řadu komponent
          optimalizovaných pro novou platformu a vytvořil tak{" "}
          <strong className="text-[#1a1a2e]">kompletní ekosystém</strong> kolem kola.
        </p>
        <p className="text-base text-[#5A6480] leading-relaxed mb-5">
          Nová <strong>kola Silverton CF I</strong> jsou vybavena karbonovými paprsky a
          přepracovaným profilem ráfku — lehčí, rychlejší, perfektně sladěná s
          dynamikou rámu. Doplňuje je{" "}
          <strong>integrovaný kokpit iC-M100-SL</strong> připravený na závody. Nabízí
          výjimečnou stabilitu, kontrolu a odezvu v ultralehkém provedení.
        </p>

        <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mt-12 mb-4">
          Produktová řada Spark RC 2027
        </h2>
        <p className="text-base text-[#5A6480] leading-relaxed mb-5">
          Řada Spark RC zahrnuje{" "}
          <strong className="text-[#1a1a2e]">8 různých modelů</strong> a několik barevných
          variant. Všechny modely využívají kompletní karbonovou konstrukci{" "}
          <strong>HMX-SL / HMX / HMF</strong> a nabízejí stejné technologické výhody bez
          ohledu na úroveň výbavy. Liší se převážně osazením (SRAM XX SL Eagle vs Eagle
          AXS vs nižší řady), výplety a barevným provedením.
        </p>

        <div className="grid grid-cols-2 gap-3 my-8">
          <div className="relative aspect-square rounded-xl overflow-hidden bg-[#F0F2FA]">
            <Image
              src="/media/articles/scott-spark-rc-2027/spark-rc-07.webp"
              alt="Spark RC 2027 v černém matném provedení"
              fill
              sizes="(max-width: 768px) 50vw, 410px"
              className="object-cover"
            />
          </div>
          <div className="relative aspect-square rounded-xl overflow-hidden bg-[#F0F2FA]">
            <Image
              src="/media/articles/scott-spark-rc-2027/spark-rc-08.webp"
              alt="Spark RC 2027 v sage / pastelově zeleném provedení"
              fill
              sizes="(max-width: 768px) 50vw, 410px"
              className="object-cover"
            />
          </div>
          <div className="relative aspect-square rounded-xl overflow-hidden bg-[#F0F2FA]">
            <Image
              src="/media/articles/scott-spark-rc-2027/spark-rc-09.webp"
              alt="Spark RC 2027 v modrém metalickém provedení"
              fill
              sizes="(max-width: 768px) 50vw, 410px"
              className="object-cover"
            />
          </div>
          <div className="relative aspect-square rounded-xl overflow-hidden bg-[#F0F2FA]">
            <Image
              src="/media/articles/scott-spark-rc-2027/spark-rc-10.webp"
              alt="Spark RC 2027 v top provedení se zlatým Fox odpružením"
              fill
              sizes="(max-width: 768px) 50vw, 410px"
              className="object-cover"
            />
          </div>
        </div>

        <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mt-12 mb-4">
          Video — tech detail přímo od Scott
        </h2>
        <p className="text-base text-[#5A6480] leading-relaxed mb-5">
          Pokud chceš celou platformu vidět v pohybu — vývojový tým Scott rozebírá
          konstrukci, geometrii i osazení v oficiálním tech videu:
        </p>
        <div className="relative aspect-video rounded-2xl overflow-hidden bg-black my-6 border border-[#E2E6F3]">
          <iframe
            src="https://www.youtube-nocookie.com/embed/kgoi7NyFMGE"
            title="Scott Spark RC 2027 — tech video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
            className="absolute inset-0 w-full h-full"
          />
        </div>
        <p className="text-xs text-[#9AA3C2] mb-10">
          Zdroj:{" "}
          <a
            href="https://www.youtube.com/watch?v=kgoi7NyFMGE"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-[#3B7CF4]"
          >
            Scott Sports na YouTube
          </a>
          .
        </p>

        {/* Predobjednavka CTA box */}
        <div className="bg-gradient-to-br from-[#1a1a2e] to-[#2C3047] text-white rounded-3xl p-8 md:p-10 my-12">
          <div className="text-xs font-bold uppercase tracking-[0.22em] text-[#7AA3FF] mb-3">
            Předobjednávka otevřená
          </div>
          <h3 className="text-2xl md:text-3xl font-black leading-tight mb-3">
            Chceš nový{" "}
            <Link
              href="/predobjednavka/spark-rc-2027"
              className="underline decoration-[#3B7CF4] decoration-4 underline-offset-4 hover:decoration-white"
            >
              Spark RC 2027
            </Link>
            ?
          </h3>
          <p className="text-base text-white/80 leading-relaxed mb-6 max-w-xl">
            Nech nám kontakt a my se ti osobně ozveme — projdeme spolu modelovou řadu,
            velikost, dostupnost a kdy bude tvoje konkrétní specifikace u nás. Žádný
            anonymní e-shop, žádné automatické sliby termínů.
          </p>
          <Link
            href="/predobjednavka/spark-rc-2027"
            className="inline-flex items-center gap-2 bg-[#3B7CF4] hover:bg-[#5C92F6] text-white font-bold px-7 py-3.5 rounded-xl transition"
          >
            Předobjednat Spark RC 2027 →
          </Link>
          <p className="text-xs text-white/50 mt-5">
            Předobjednávkou tě nic nezavazuje. Domluvíme spolu termín a podrobnosti
            telefonicky nebo na prodejně.
          </p>
        </div>

        {/* Kontaktní box — tým 100dola sport */}
        <div className="bg-[#F7F9FF] border border-[#E2E6F3] rounded-2xl p-7 my-12">
          <div className="text-xs font-bold uppercase tracking-wider text-[#3B7CF4] mb-2">
            Máte dotaz?
          </div>
          <h3 className="text-xl font-black text-[#1a1a2e] mb-2">
            Tým 100dola sport vám rád odpoví
          </h3>
          <p className="text-sm text-[#5A6480] leading-relaxed mb-5">
            Modelová řada, dostupnost, porovnání variant, financování, výkup starého kola
            — napiš a my se ti ozveme.
          </p>
          <PreorderInquiryForm />
        </div>

        {/* Final intent push */}
        <p className="text-sm text-[#5A6480] leading-relaxed mt-10">
          Nový Spark RC 2027 je investice, která se v dlouhodobém měřítku vyplatí — XC
          kola Scott se v sérii drží v top ratingu několik let v řadě. Pokud na něj
          čekáte,{" "}
          <Link
            href="/predobjednavka/spark-rc-2027"
            className="font-bold text-[#3B7CF4] underline hover:no-underline"
          >
            předobjednávka přes 100dola sport
          </Link>{" "}
          ti zaručí, že budeš mezi prvními, komu se kolo dostane do rukou.
        </p>
      </div>
    </article>
  );
}

/**
 * Krátký inquiry formulář v článku — odešle dotaz tymu 100dola sport.
 * Reuse: /api/contact endpoint (topic: "sport").
 */
function PreorderInquiryForm() {
  return (
    <form
      action="/api/contact"
      method="POST"
      className="grid grid-cols-1 sm:grid-cols-2 gap-3"
    >
      <input
        type="text"
        name="name"
        placeholder="Jméno a příjmení"
        required
        minLength={2}
        maxLength={120}
        className="w-full px-4 py-3 rounded-xl bg-white border border-[#E2E6F3] text-sm text-[#1a1a2e] placeholder:text-[#9AA3C2] focus:outline-none focus:border-[#3B7CF4]"
      />
      <input
        type="email"
        name="email"
        placeholder="E-mail"
        required
        maxLength={254}
        className="w-full px-4 py-3 rounded-xl bg-white border border-[#E2E6F3] text-sm text-[#1a1a2e] placeholder:text-[#9AA3C2] focus:outline-none focus:border-[#3B7CF4]"
      />
      <input
        type="hidden"
        name="topic"
        value="sport"
      />
      <input
        type="hidden"
        name="consentGdpr"
        value="true"
      />
      {/* honeypot */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden
      />
      <textarea
        name="message"
        rows={3}
        placeholder="Co byste rádi věděli o Spark RC 2027? (model, velikost, termín…)"
        required
        minLength={5}
        maxLength={2000}
        className="w-full px-4 py-3 rounded-xl bg-white border border-[#E2E6F3] text-sm text-[#1a1a2e] placeholder:text-[#9AA3C2] focus:outline-none focus:border-[#3B7CF4] sm:col-span-2"
        defaultValue="Mám dotaz ohledně Scott Spark RC 2027 — "
      />
      <button
        type="submit"
        className="sm:col-span-2 bg-[#1a1a2e] hover:bg-[#2C3047] text-white font-bold py-3 rounded-xl transition"
      >
        Odeslat dotaz týmu 100dola sport
      </button>
      <p className="text-xs text-[#9AA3C2] sm:col-span-2">
        Odesláním souhlasíte se zpracováním údajů pro účely vyřízení dotazu.
      </p>
    </form>
  );
}
