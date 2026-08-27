import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import PojisteniForm from "@/components/pojisteni/PojisteniForm";

const SITE = "https://www.100dola.com";

export const metadata: Metadata = {
  title: "Pojištění kola, cestovní a úrazové pojištění pro cyklisty | 100dola",
  description:
    "Jak funguje pojištění jízdního kola proti krádeži a poškození, cestovní pojištění do zahraničí (i na kolo v Malaze) a úrazové pojištění cyklisty. Co se vyplatí, jaké jsou podmínky — a nezávazná poptávka na míru.",
  alternates: { canonical: "/pojisteni" },
  openGraph: {
    title: "Pojištění pro cyklisty — kolo, cesty i úraz",
    description:
      "Přehledně: pojištění kola proti krádeži a poškození, cestovní pojištění do zahraničí a úrazové pojištění. Co se vyplatí a jak to funguje.",
    url: `${SITE}/pojisteni`,
    type: "article",
  },
};

/** FAQ — řídí zobrazený seznam i FAQPage schema (pro AI/Google). */
const FAQ: { q: string; a: string }[] = [
  {
    q: "Vyplatí se pojistit kolo proti krádeži?",
    a: "U dražších kol (zhruba od 40 000 Kč, a hlavně nad 100 000 Kč) rozhodně. Průměrná škoda při krádeži kola se pohybuje kolem 25 000 Kč a u karbonových silniček nebo elektrokol jde snadno o šestimístné částky. Levné kolo za pár tisíc většinou pokryje běžné pojištění domácnosti; drahé kolo chce samostatné pojištění s dostatečným limitem.",
  },
  {
    q: "Kryje pojištění domácnosti i kolo?",
    a: "Zpravidla ano, ale s výhradami. Kolo v uzamčeném sklepě nebo bytě obvykle spadá pod pojištění domácnosti. Krádež kola zvenčí (od stojanu, z auta, na cestě) často kryje jen připojištění nebo samostatné pojištění kola — a to za podmínky, že bylo řádně zabezpečené. Vždy si ověř limit plnění, jestli vůbec stačí na hodnotu tvého kola.",
  },
  {
    q: "Jaké podmínky musím splnit, aby pojišťovna plnila při krádeži?",
    a: "Typicky: kolo muselo být uzamčené schváleným zámkem (často se vyžaduje třmen/lanko o průměru alespoň 6 mm) a připevněné k pevnému objektu (stojan, zábradlí). Krádež je nutné nahlásit policii, obvykle do 24 hodin, a pojišťovně nahlásit škodu ve stanovené lhůtě (často do 15 dnů). Schovej si účtenku od kola i od zámku — bez doložení hodnoty se plnění krátí.",
  },
  {
    q: "Potřebuju cestovní pojištění, když jedu na kolo do Malagy nebo Španělska?",
    a: "Ano. Evropský průkaz zdravotního pojištění (EHIC) pokryje jen základní nutnou péči ve veřejném systému — nepokryje repatriaci, soukromou kliniku ani spoluúčast. Navíc pozor: cyklistika bývá vedená jako rizikový/sportovní pohyb, takže je potřeba mít ji v pojistce zahrnutou (často jako připojištění sportu). Bez toho ti při úrazu na kole pojišťovna nemusí plnit.",
  },
  {
    q: "Co pokryje cestovní pojištění pro cyklistu v zahraničí?",
    a: "Léčebné výlohy a úraz (vč. cyklistiky jako sportu, pokud je připojištěná), repatriaci, případně storno cesty, zpoždění a pojištění zavazadel. Některé produkty umí připojistit i sportovní vybavení — tedy samotné kolo — pro případ poškození nebo krádeže během cesty. To řešíme individuálně podle toho, jak a kam jezdíš.",
  },
  {
    q: "Jaký je rozdíl mezi úrazovým a cestovním pojištěním?",
    a: "Cestovní pojištění platí na cestách (hlavně v zahraničí) a řeší léčebné výlohy, repatriaci a podobně. Úrazové pojištění platí trvale — doma i v zahraničí — a vyplácí za trvalé následky, dobu léčení nebo denní odškodné při úrazu. Pro aktivního cyklistu dávají smysl oba: cestovní na výjezdy, úrazové jako celoroční ochrana.",
  },
  {
    q: "Jak u vás poptávka probíhá?",
    a: "Vyplníš krátký formulář (co tě zajímá + kontakt). Ozve se ti náš partner — pojišťovací a finančně-poradenská firma, se kterou spolupracujeme — a připraví nabídku a podmínky na míru. Nezávazně, žádné závazky předem. My u kol jen víme, co dává smysl řešit, a propojíme tě se správným člověkem.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Zprostředkování pojištění pro cyklisty",
  serviceType: "Pojištění kola, cestovní a úrazové pojištění",
  provider: { "@type": "Organization", name: "100dola / FUTUNATU s.r.o.", url: SITE },
  areaServed: "CZ",
  description:
    "Poradenství a zprostředkování pojištění jízdního kola proti krádeži a poškození, cestovního pojištění do zahraničí a úrazového pojištění pro cyklisty.",
  url: `${SITE}/pojisteni`,
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "100dola", item: SITE },
    { "@type": "ListItem", position: 2, name: "Pojištění pro cyklisty", item: `${SITE}/pojisteni` },
  ],
};

const TYPES = [
  {
    tag: "Kolo",
    tagColor: "#3B7CF4",
    zajem: "kolo",
    title: "Pojištění kola — krádež a poškození",
    lead: "Pro dražší kola (silničky, gravely, elektrokola) je samostatné pojištění nejrozumnější ochrana. Kryje krádež, vandalismus, živly, nehodu i poškození při přepravě.",
    points: [
      "Dává smysl hlavně nad 100 000 Kč — tam běžné pojištění domácnosti nestačí limitem.",
      "Podmínka plnění: schválený zámek (často třmen ≥ 6 mm) + kolo připevněné k pevnému objektu.",
      "Krádež nahlásit policii (obvykle do 24 h) a pojišťovně ve lhůtě (často do 15 dnů).",
      "Schovej účtenku od kola i zámku — doloží hodnotu, jinak se plnění krátí.",
    ],
  },
  {
    tag: "Cesty",
    tagColor: "#E8431A",
    zajem: "cestovni",
    title: "Cestovní pojištění — zahraničí a Malaga",
    lead: "Když vezeš kolo za teplem (třeba do Malagy), EHIC nestačí. Cestovní pojištění řeší léčebné výlohy, úraz, repatriaci, zavazadla i storno — a hlavně cyklistiku jako sport.",
    points: [
      "Cyklistika bývá rizikový sport — musí být v pojistce zahrnutá, jinak se úraz na kole neproplácí.",
      "EHIC kryje jen základní veřejnou péči — ne repatriaci ani soukromou kliniku.",
      "Lze připojistit i sportovní vybavení (kolo) proti poškození/krádeži během cesty.",
      "Ideální ke každému výjezdu do Malagy i na jednorázové závody v zahraničí.",
    ],
  },
  {
    tag: "Úraz",
    tagColor: "#2EAA6E",
    zajem: "urazove",
    title: "Úrazové / zdravotní pojištění cyklisty",
    lead: "Platí celoročně — doma i v zahraničí. Vyplácí za trvalé následky, dobu léčení nebo denní odškodné. Pro aktivního jezdce rozumný základ nad rámec cestovního pojištění.",
    points: [
      "Kryje pády a úrazy při tréninku i závodech, ne jen na cestách.",
      "Plnění za trvalé následky, dobu nezbytného léčení, případně hospitalizaci.",
      "Vhodné doplnit k cestovnímu pojištění pro ty, kdo najezdí hodně kilometrů.",
      "Nastavuje se podle rizika a rozsahu ježdění — proto řešíme individuálně.",
    ],
  },
];

export default function PojisteniPage() {
  return (
    <>
      <JsonLd data={serviceJsonLd} />
      <JsonLd data={faqJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <Navbar />
      <main className="pt-20 bg-white">
        {/* Hero */}
        <section className="pt-16 pb-10 md:pt-24 md:pb-14 bg-[#FAFAFA] border-b border-[#E2E6F3]">
          <div className="max-w-[900px] mx-auto px-6 md:px-12">
            <div className="text-xs text-[#9AA3C2] mb-5">
              <Link href="/" className="hover:text-[#1a1a2e]">
                100dola
              </Link>{" "}
              / Pojištění pro cyklisty
            </div>
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#3B7CF4] mb-3">
              Kolo · Cesty · Úraz
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-[#1a1a2e] leading-tight mb-5">
              Pojištění pro cyklisty — bez zbytečné teorie
            </h1>
            <p className="text-lg text-[#5A6480] leading-relaxed mb-8 max-w-[720px]">
              Drahé kolo, výjezd do Malagy nebo naježděné kilometry doma — na tři různé věci se hodí
              tři různá pojištění. Tady je přehledně{" "}
              <strong>co se vyplatí, jaké jsou podmínky</strong> a jak si nechat připravit nabídku na
              míru. Poptávku zpracovává náš pojišťovací partner, se kterým spolupracujeme.
            </p>
            <a
              href="#poptavka"
              className="inline-block bg-[#3B7CF4] hover:bg-[#5C92F6] text-white font-bold text-sm px-6 py-3 rounded-xl transition"
            >
              Chci nezávaznou nabídku →
            </a>
          </div>
        </section>

        {/* Krátká verze */}
        <section className="py-10 md:py-14">
          <div className="max-w-[900px] mx-auto px-6 md:px-12">
            <div className="bg-[#F0F4FF] border border-[#D6E1FB] rounded-2xl p-6 md:p-8">
              <div className="text-xs font-bold uppercase tracking-wider text-[#3B7CF4] mb-3">
                Krátká verze
              </div>
              <ul className="space-y-2 text-sm text-[#1a1a2e]">
                <li>
                  • <strong>Drahé kolo (100k+)</strong> — samostatné pojištění proti krádeži a
                  poškození. Domácnost limitem nestačí.
                </li>
                <li>
                  • <strong>Jedeš za teplem (Malaga, závody v zahraničí)</strong> — cestovní
                  pojištění s cyklistikou jako sportem. EHIC nestačí.
                </li>
                <li>
                  • <strong>Najezdíš hodně km celoročně</strong> — úrazové pojištění platí doma i
                  venku, za trvalé následky a léčení.
                </li>
                <li>
                  • <strong>Nevíš, co potřebuješ?</strong> Napiš nám a partner ti to poskládá na
                  míru — nezávazně.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Tři typy */}
        <section className="pb-6">
          <div className="max-w-[900px] mx-auto px-6 md:px-12 space-y-8">
            {TYPES.map((t) => (
              <div key={t.zajem} className="border border-[#E2E6F3] rounded-2xl p-6 md:p-8">
                <span
                  className="inline-block text-[11px] font-bold uppercase tracking-wider text-white px-2.5 py-1 rounded-full mb-3"
                  style={{ background: t.tagColor }}
                >
                  {t.tag}
                </span>
                <h2 className="text-2xl font-black text-[#1a1a2e] mb-2">{t.title}</h2>
                <p className="text-[#5A6480] leading-relaxed mb-4">{t.lead}</p>
                <ul className="space-y-2 mb-5">
                  {t.points.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-sm text-[#1a1a2e]">
                      <span
                        className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: t.tagColor }}
                      />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href={`#poptavka`}
                  className="inline-block text-sm font-bold text-[#3B7CF4] hover:underline"
                >
                  Poptat {t.tag.toLowerCase()} →
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Malaga cross-link */}
        <section className="py-8">
          <div className="max-w-[900px] mx-auto px-6 md:px-12">
            <div className="bg-[#FFF1EA] border border-[#FBC9A8] rounded-2xl p-6 md:p-8">
              <h2 className="text-xl font-black text-[#1a1a2e] mb-2">
                Vezeš kolo do Malagy?
              </h2>
              <p className="text-sm text-[#5A6480] leading-relaxed mb-4">
                Cestovní pojištění se hodí ke každému výjezdu a pojištění kola dává smysl i po dobu,
                kdy je{" "}
                <Link href="/malaga/uskladneni" className="font-bold text-[#E8431A] hover:underline">
                  uskladněné v Malaze
                </Link>
                . Podívej se, jak funguje{" "}
                <Link href="/malaga/preprava" className="font-bold text-[#E8431A] hover:underline">
                  přeprava kola do Malagy
                </Link>{" "}
                a{" "}
                <Link href="/malaga" className="font-bold text-[#E8431A] hover:underline">
                  celý model 100dola Malaga
                </Link>
                . Přeprava samotná už pojištěná je — tohle řeší tvoje léčebné výlohy a kolo nad rámec
                transportu.
              </p>
            </div>
          </div>
        </section>

        {/* Formulář */}
        <section className="py-8 md:py-12">
          <div className="max-w-[900px] mx-auto px-6 md:px-12">
            <Suspense fallback={<div className="h-64 rounded-2xl bg-[#F7F9FF]" />}>
              <PojisteniForm />
            </Suspense>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-10 md:py-14 bg-[#FAFAFA] border-t border-[#E2E6F3]">
          <div className="max-w-[900px] mx-auto px-6 md:px-12">
            <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-8">
              Časté dotazy
            </h2>
            <div className="space-y-5">
              {FAQ.map((f) => (
                <div key={f.q} className="border-b border-[#E2E6F3] pb-5">
                  <h3 className="text-base font-black text-[#1a1a2e] mb-2">{f.q}</h3>
                  <p className="text-sm text-[#5A6480] leading-relaxed">{f.a}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-[#9AA3C2] mt-8 leading-relaxed">
              Informace jsou obecné a nezávazné — konkrétní rozsah krytí, limity, výluky a spoluúčast
              vždy určují podmínky konkrétní pojišťovny a smlouvy. Poptávku zpracovává náš
              spolupracující pojišťovací a finančně-poradenský partner.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
