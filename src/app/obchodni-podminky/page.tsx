import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { COMPANY, STERNBERK_STORE } from "@/data/company";

export const metadata: Metadata = {
  title: "Obchodní podmínky",
  description:
    "Všeobecné obchodní podmínky e-shopu 100dola sport — uzavření kupní smlouvy, dodání, platba, reklamace a odstoupení od smlouvy.",
  alternates: { canonical: "/obchodni-podminky" },
};

const VERSION = "1.0";
const EFFECTIVE_DATE = "18. května 2026";

export default function ObchodniPodminkyPage() {
  const sidloPsc = COMPANY.registeredOffice.postalCode.replace(/(\d{3})(\d{2})/, "$1 $2");
  const psc = STERNBERK_STORE.postalCode.replace(/(\d{3})(\d{2})/, "$1 $2");

  return (
    <>
      <Navbar />
      <main className="pt-20 bg-[#F7F9FF] min-h-screen pb-20">
        <div className="max-w-[820px] mx-auto px-6 md:px-12 pt-10">
          <div className="text-xs tracking-[0.22em] uppercase font-bold text-[#3B7CF4] mb-2">
            Legal
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-[#1a1a2e] mb-2">
            Obchodní podmínky
          </h1>
          <p className="text-sm text-[#9AA3C2] mb-8">
            Verze {VERSION} · platné od {EFFECTIVE_DATE}
          </p>

          <div className="bg-white rounded-2xl border border-[#E2E6F3] p-6 md:p-10 space-y-6 text-sm text-[#1a1a2e] leading-relaxed">

            <section>
              <h2 className="text-lg font-black mb-2">1. Úvodní ustanovení</h2>
              <p className="text-[#5A6480] mb-2">
                Tyto všeobecné obchodní podmínky (dále jen „VOP") upravují vzájemná
                práva a povinnosti smluvních stran vzniklé na základě kupní smlouvy
                uzavírané mezi prodávajícím a kupujícím prostřednictvím internetového
                obchodu <strong>100dola.com</strong> (sekce e-shop).
              </p>
              <p className="text-[#5A6480]">
                <strong>Prodávající:</strong> {COMPANY.name}, IČO {COMPANY.ico},
                DIČ {COMPANY.dic}, sídlem {COMPANY.registeredOffice.streetAddress},{" "}
                {sidloPsc} {COMPANY.registeredOffice.addressLocality},{" "}
                {COMPANY.registration}. Provozovna {STERNBERK_STORE.streetAddress},{" "}
                {psc} {STERNBERK_STORE.addressLocality}. Kontakt:{" "}
                <a href={`mailto:${COMPANY.contact.email}`} className="text-[#3B7CF4]">{COMPANY.contact.email}</a>,{" "}
                <a href={`tel:${COMPANY.contact.phoneIntl}`} className="text-[#3B7CF4]">{COMPANY.contact.phone}</a>.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-black mb-2">2. Vznik kupní smlouvy</h2>
              <ol className="list-decimal pl-5 space-y-1 text-[#5A6480]">
                <li>
                  Veškerá prezentace zboží na webu má informativní charakter a
                  prodávající není povinen uzavřít smlouvu ohledně tohoto zboží
                  (§ 1732 odst. 2 občanského zákoníku se nepoužije).
                </li>
                <li>
                  Web obsahuje informace o zboží včetně cen, daní a nákladů
                  za balné a dodání. Ceny zboží jsou uvedené včetně DPH a zůstávají
                  v platnosti po dobu jejich zobrazení na webu.
                </li>
                <li>
                  Objednávku kupující vytváří přes objednávkový formulář na webu.
                  Před odesláním objednávky kupujícímu umožníme zkontrolovat a měnit
                  údaje, které do objednávky vložil.
                </li>
                <li>
                  Smluvní vztah mezi prodávajícím a kupujícím vzniká doručením
                  potvrzení o přijetí objednávky, jež je prodávajícím zasláno
                  kupujícímu e-mailem.
                </li>
                <li>
                  Kupující souhlasí s použitím komunikačních prostředků na dálku
                  při uzavírání kupní smlouvy. Náklady vzniklé kupujícímu při
                  použití komunikačních prostředků na dálku si hradí kupující sám.
                </li>
              </ol>
            </section>

            <section>
              <h2 className="text-lg font-black mb-2">3. Cena zboží a platební podmínky</h2>
              <p className="text-[#5A6480] mb-2">
                Ceny jsou uvedeny v korunách českých (Kč) včetně DPH. Cenu zboží
                a případné náklady spojené s dodáním zboží může kupující uhradit:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-[#5A6480]">
                <li>
                  <strong>QR platba / bankovní převod</strong> — bezhotovostně na
                  účet prodávajícího, podklady doručíme po vytvoření objednávky.
                </li>
                <li>
                  <strong>Hotově</strong> — při osobním převzetí v prodejně
                  Šternberk.
                </li>
                <li>
                  <strong>Kartou online</strong> — prostřednictvím platební brány
                  (po aktivaci platební brány na e-shopu).
                </li>
              </ul>
              <p className="text-[#5A6480] mt-2">
                Závazek kupujícího uhradit cenu zboží je splněn okamžikem
                připsání částky na účet prodávajícího nebo předáním částky v
                hotovosti.
              </p>
              <p className="text-[#5A6480] mt-3">
                <strong>Záloha u zboží na objednávku a zboží vyšší hodnoty.</strong>{" "}
                U zboží dodávaného na objednávku od externích dodavatelů (zejména
                jízdních kol) a u zboží, jehož cena přesahuje 50&nbsp;000&nbsp;Kč,
                je prodávající oprávněn požadovat před objednáním zboží u dodavatele
                zálohu ve výši <strong>50&nbsp;% kupní ceny</strong>. O požadavku na
                zálohu a platebních údajích prodávající kupujícího informuje po
                vytvoření objednávky; zboží u dodavatele objednává až po připsání
                zálohy. Zaplacená záloha se započítává na kupní cenu; zbývající část
                ceny je splatná před předáním nebo odesláním zboží. Tímto není
                dotčeno právo spotřebitele odstoupit od smlouvy dle čl.&nbsp;5 —
                při řádném odstoupení vrátí prodávající i zaplacenou zálohu v souladu
                se zákonem. U zboží upraveného podle přání kupujícího (např.
                individuální konfigurace kola) může být právo na odstoupení vyloučeno
                dle § 1837 občanského zákoníku.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-black mb-2">4. Dodání zboží</h2>
              <p className="text-[#5A6480] mb-2">
                Zboží je dodáváno na adresu uvedenou kupujícím v objednávce.
                Možnosti dopravy:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-[#5A6480]">
                <li>
                  <strong>Osobní převzetí</strong> v prodejně{" "}
                  {STERNBERK_STORE.streetAddress}, {psc} {STERNBERK_STORE.addressLocality}.
                </li>
                <li>
                  <strong>Zásilkovna / Packeta</strong> — výdejní místa po ČR
                  (není dostupná pro objemné zásilky jako kola a lyže).
                </li>
                <li>
                  <strong>GLS / kurýr</strong> — doručení na adresu, vč. objemných
                  zásilek.
                </li>
              </ul>
              <p className="text-[#5A6480] mt-3">
                <strong>Ceny dopravy:</strong> zdarma při objednávce nad 2 500 Kč (včetně objemných
                zásilek). Do 2 500 Kč činí dopravné 100 Kč (běžný balík) / 400 Kč (objemná zásilka —
                kola, lyže). Osobní vyzvednutí v prodejně je vždy zdarma. Aktuální cena dopravy je
                vždy uvedena v košíku před dokončením objednávky.
              </p>
              <p className="text-[#5A6480] mt-2">
                Předpokládaná doba dodání je 3–10 pracovních dnů od přijetí platby.
                U produktů, které dodáváme od externích dodavatelů, může být
                dodací lhůta delší — v takovém případě o tom kupujícího informujeme.
              </p>
              <p className="text-[#5A6480] mt-2">
                Při dodání kupující zboží zkontroluje a v případě zjevného
                poškození obalu nebo zboží odmítá převzetí, případně sepíše s
                přepravcem zápis o škodě.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-black mb-2">5. Odstoupení od smlouvy</h2>
              <p className="text-[#5A6480] mb-2">
                Kupující, který je spotřebitel, má právo odstoupit od smlouvy ve
                lhůtě <strong>14 dnů</strong> ode dne převzetí zboží, a to bez
                udání důvodu (§ 1829 občanského zákoníku).
              </p>
              <p className="text-[#5A6480] mb-2">
                Pro odstoupení postačí prodávajícímu jednostranné prohlášení —
                např. e-mailem na{" "}
                <a href={`mailto:${COMPANY.contact.email}`} className="text-[#3B7CF4]">{COMPANY.contact.email}</a>.
                Vzorový{" "}
                <a
                  href="https://www.coi.cz/wp-content/uploads/2022/02/vzorovy-formular-pro-odstoupeni-od-smlouvy.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#3B7CF4]"
                >
                  formulář pro odstoupení (ČOI)
                </a>{" "}
                lze využít.
              </p>
              <p className="text-[#5A6480] mb-2">
                Zboží musí být vráceno do 14 dnů od odstoupení, bez známek
                užívání, kompletní a v původním obalu. Kupující nese náklady na
                navrácení zboží zpět prodávajícímu.
              </p>
              <p className="text-[#5A6480]">
                Prodávající vrátí kupujícímu peněžní prostředky včetně nákladů
                na dodání (nejnižší nabízený způsob) nejpozději do 14 dnů od
                odstoupení, a to stejným způsobem, jakým platbu přijal.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-black mb-2">6. Práva z vadného plnění (reklamace)</h2>
              <p className="text-[#5A6480] mb-2">
                Práva a povinnosti smluvních stran ohledně práv z vadného plnění
                se řídí § 2099–2117 občanského zákoníku a zákonem o ochraně
                spotřebitele č. 634/1992 Sb.
              </p>
              <p className="text-[#5A6480] mb-2">
                Záruční doba činí <strong>24 měsíců</strong> ode dne převzetí
                zboží spotřebitelem. U podnikatele se záruka neuplatňuje, pokud
                není výslovně sjednána.
              </p>
              <p className="text-[#5A6480] mb-2">
                Reklamaci uplatní kupující e-mailem na{" "}
                <a href={`mailto:${COMPANY.contact.email}`} className="text-[#3B7CF4]">{COMPANY.contact.email}</a>,
                osobně v prodejně nebo zasláním na adresu provozovny. K reklamaci
                přiloží: doklad o koupi, popis vady, fotografie (pokud lze).
              </p>
              <p className="text-[#5A6480]">
                O reklamaci rozhodneme nejpozději do 30 dnů od jejího uplatnění.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-black mb-2">7. Ochrana osobních údajů</h2>
              <p className="text-[#5A6480]">
                Ochrana osobních údajů kupujícího se řídí samostatným dokumentem{" "}
                <a href="/ochrana-osobnich-udaju" className="text-[#3B7CF4] hover:underline">
                  Zásady zpracování osobních údajů
                </a>
                . Kupující bere na vědomí, že je povinen své osobní údaje
                uvádět správně a pravdivě.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-black mb-2">8. Mimosoudní řešení sporů</h2>
              <p className="text-[#5A6480] mb-2">
                K mimosoudnímu řešení spotřebitelských sporů z kupní smlouvy je
                příslušná <strong>Česká obchodní inspekce</strong> (ČOI), se
                sídlem Štěpánská 567/15, 120 00 Praha 2,{" "}
                <a
                  href="https://www.coi.cz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#3B7CF4]"
                >
                  www.coi.cz
                </a>
                .
              </p>
              <p className="text-[#5A6480]">
                Pro řešení sporů online lze využít platformu{" "}
                <a
                  href="https://ec.europa.eu/consumers/odr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#3B7CF4]"
                >
                  ec.europa.eu/consumers/odr
                </a>
                .
              </p>
            </section>

            <section>
              <h2 className="text-lg font-black mb-2">9. Závěrečná ustanovení</h2>
              <p className="text-[#5A6480] mb-2">
                Vztahy a případné spory, které vzniknou na základě smlouvy, se
                řídí výhradně právem České republiky a budou řešeny příslušnými
                soudy ČR.
              </p>
              <p className="text-[#5A6480]">
                Tyto VOP může prodávající měnit. Nové znění VOP bude zveřejněno
                na webu s uvedením data účinnosti. Závazek vyplývající ze
                smlouvy uzavřené před změnou VOP se řídí zněním VOP platným v
                okamžiku uzavření smlouvy.
              </p>
            </section>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
