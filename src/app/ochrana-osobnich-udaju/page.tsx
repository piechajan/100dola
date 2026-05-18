import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { COMPANY, STERNBERK_STORE } from "@/data/company";

export const metadata: Metadata = {
  title: "Ochrana osobních údajů",
  description:
    "Zásady zpracování osobních údajů 100dola — kdo je správce, jaké údaje sbíráme, jak je používáme a jaká jsou vaše práva podle GDPR.",
  alternates: { canonical: "/ochrana-osobnich-udaju" },
};

const VERSION = "1.0";
const EFFECTIVE_DATE = "18. května 2026";

export default function PrivacyPage() {
  const sidloPsc = COMPANY.registeredOffice.postalCode.replace(/(\d{3})(\d{2})/, "$1 $2");
  const psc = STERNBERK_STORE.postalCode.replace(/(\d{3})(\d{2})/, "$1 $2");

  return (
    <>
      <Navbar />
      <main className="pt-20 bg-[#F7F9FF] min-h-screen pb-20">
        <div className="max-w-[820px] mx-auto px-6 md:px-12 pt-10">
          <div className="text-xs tracking-[0.22em] uppercase font-bold text-[#3B7CF4] mb-2">
            Legal · GDPR
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-[#1a1a2e] mb-2">
            Ochrana osobních údajů
          </h1>
          <p className="text-sm text-[#9AA3C2] mb-8">
            Verze {VERSION} · platné od {EFFECTIVE_DATE}
          </p>

          <div className="bg-white rounded-2xl border border-[#E2E6F3] p-6 md:p-10 space-y-6 text-sm text-[#1a1a2e] leading-relaxed">

            <section>
              <h2 className="text-lg font-black mb-2">1. Správce osobních údajů</h2>
              <p className="text-[#5A6480]">
                Správcem osobních údajů ve smyslu nařízení (EU) 2016/679 (GDPR) je{" "}
                <strong>{COMPANY.name}</strong>, IČO {COMPANY.ico}, DIČ {COMPANY.dic},
                sídlem {COMPANY.registeredOffice.streetAddress}, {sidloPsc}{" "}
                {COMPANY.registeredOffice.addressLocality}. Provozovna:{" "}
                {STERNBERK_STORE.streetAddress}, {psc} {STERNBERK_STORE.addressLocality}.
              </p>
              <p className="text-[#5A6480] mt-2">
                Kontakt pro otázky k ochraně osobních údajů:{" "}
                <a href={`mailto:${COMPANY.contact.email}`} className="text-[#3B7CF4]">{COMPANY.contact.email}</a>,{" "}
                <a href={`tel:${COMPANY.contact.phoneIntl}`} className="text-[#3B7CF4]">{COMPANY.contact.phone}</a>.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-black mb-2">2. Jaké údaje zpracováváme</h2>
              <ul className="list-disc pl-5 space-y-1 text-[#5A6480]">
                <li><strong>Identifikační:</strong> jméno, příjmení, název firmy, IČO, DIČ.</li>
                <li><strong>Kontaktní:</strong> e-mail, telefon, doručovací adresa.</li>
                <li><strong>Transakční:</strong> objednávky, faktury, doklady o platbách.</li>
                <li>
                  <strong>Technické (cookies, analytics):</strong> IP adresa, identifikátor
                  prohlížeče, údaje o návštěvě stránek (pouze s vaším souhlasem v cookie
                  bannerech).
                </li>
                <li>
                  <strong>Specifické pro službu:</strong> u rezervací testovacích jízd
                  číslo občanského průkazu (předáváno jen v papírovém protokolu jako záloha,
                  v elektronické podobě ho neukládáme).
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-black mb-2">3. Účely zpracování a právní základ</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border border-[#E2E6F3]">
                  <thead className="bg-[#F7F9FF]">
                    <tr>
                      <th className="text-left p-2 border-b border-[#E2E6F3]">Účel</th>
                      <th className="text-left p-2 border-b border-[#E2E6F3]">Právní základ</th>
                      <th className="text-left p-2 border-b border-[#E2E6F3]">Doba uchovávání</th>
                    </tr>
                  </thead>
                  <tbody className="text-[#5A6480]">
                    <tr><td className="p-2 border-b border-[#F0F2FA]">Plnění objednávky / smlouvy</td><td className="p-2 border-b border-[#F0F2FA]">čl. 6 odst. 1 písm. b) GDPR</td><td className="p-2 border-b border-[#F0F2FA]">10 let (zákonné lhůty)</td></tr>
                    <tr><td className="p-2 border-b border-[#F0F2FA]">Účetnictví a daňové doklady</td><td className="p-2 border-b border-[#F0F2FA]">čl. 6 odst. 1 písm. c) GDPR (zákon č. 235/2004 Sb.)</td><td className="p-2 border-b border-[#F0F2FA]">10 let</td></tr>
                    <tr><td className="p-2 border-b border-[#F0F2FA]">Rezervace testovacích jízd</td><td className="p-2 border-b border-[#F0F2FA]">čl. 6 odst. 1 písm. b) GDPR</td><td className="p-2 border-b border-[#F0F2FA]">2 roky po skončení akce</td></tr>
                    <tr><td className="p-2 border-b border-[#F0F2FA]">Newsletter (akce, novinky)</td><td className="p-2 border-b border-[#F0F2FA]">čl. 6 odst. 1 písm. a) GDPR — souhlas</td><td className="p-2 border-b border-[#F0F2FA]">do odhlášení</td></tr>
                    <tr><td className="p-2 border-b border-[#F0F2FA]">Analytics & marketing cookies</td><td className="p-2 border-b border-[#F0F2FA]">čl. 6 odst. 1 písm. a) GDPR — souhlas</td><td className="p-2 border-b border-[#F0F2FA]">13–26 měsíců</td></tr>
                    <tr><td className="p-2">Kontaktní formulář / poptávka</td><td className="p-2">čl. 6 odst. 1 písm. f) GDPR — oprávněný zájem</td><td className="p-2">3 roky</td></tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-black mb-2">4. Příjemci a zpracovatelé</h2>
              <p className="text-[#5A6480] mb-2">
                Vaše údaje předáváme pouze prověřeným zpracovatelům, kteří pro nás
                zajišťují konkrétní služby. Každý z nich má uzavřenou smlouvu o
                zpracování osobních údajů (DPA):
              </p>
              <ul className="list-disc pl-5 space-y-1 text-[#5A6480]">
                <li>
                  <strong>Supabase Inc.</strong> (USA, EU servery — Frankfurt) — databáze webu.
                </li>
                <li>
                  <strong>Vercel Inc.</strong> (USA / EU) — hosting a CDN.
                </li>
                <li>
                  <strong>Resend Inc.</strong> (USA) — transakční e-maily.
                </li>
                <li>
                  <strong>Fakturoid s.r.o.</strong> (ČR) — fakturace.
                </li>
                <li>
                  <strong>Meta Platforms Ireland Ltd.</strong> — Meta Pixel, jen
                  s vaším souhlasem v cookie banneru (analytika reklamních kampaní).
                </li>
                <li>
                  <strong>Google Ireland Ltd.</strong> — Google Analytics 4 / Google Ads,
                  jen s vaším souhlasem v cookie banneru.
                </li>
                <li>
                  <strong>Strava Inc.</strong> (USA) — propojení Open Miles Clinic
                  akcí (jen pokud se přihlásíte přes Stravu).
                </li>
                <li>
                  <strong>Cloudflare Inc.</strong> (USA / globální CDN) — DNS a
                  ochrana před útoky.
                </li>
              </ul>
              <p className="text-[#5A6480] mt-2">
                Předávání mimo EU/EHS je ošetřeno standardními smluvními doložkami
                (SCC) podle čl. 46 GDPR.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-black mb-2">5. Vaše práva</h2>
              <p className="text-[#5A6480] mb-2">Podle GDPR máte právo:</p>
              <ul className="list-disc pl-5 space-y-1 text-[#5A6480]">
                <li><strong>na přístup</strong> k vašim osobním údajům (čl. 15);</li>
                <li><strong>na opravu</strong> nepřesných údajů (čl. 16);</li>
                <li><strong>na výmaz</strong> („právo být zapomenut") (čl. 17), pokud již nemáme zákonnou povinnost údaje uchovávat;</li>
                <li><strong>na omezení zpracování</strong> (čl. 18);</li>
                <li><strong>na přenositelnost</strong> údajů (čl. 20);</li>
                <li><strong>vznést námitku</strong> proti zpracování na základě oprávněného zájmu (čl. 21);</li>
                <li><strong>odvolat souhlas</strong> (newsletter, analytics, marketing) kdykoliv;</li>
                <li><strong>podat stížnost</strong> u dozorového úřadu —{" "}
                  <a
                    href="https://www.uoou.cz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#3B7CF4]"
                  >
                    Úřad pro ochranu osobních údajů
                  </a>{" "}
                  (uoou.cz).
                </li>
              </ul>
              <p className="text-[#5A6480] mt-2">
                Pro uplatnění jakéhokoliv práva nám napište na{" "}
                <a href={`mailto:${COMPANY.contact.email}`} className="text-[#3B7CF4]">{COMPANY.contact.email}</a>.
                Odpovíme do 30 dnů.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-black mb-2">6. Cookies</h2>
              <p className="text-[#5A6480]">
                Web používá cookies — esenciální (vždy aktivní, technicky nutné
                pro chod stránek) a volitelné (analytika, marketing — jen s vaším
                souhlasem). Detaily a možnost úpravy preferencí najdete na{" "}
                <a href="/zasady-cookies" className="text-[#3B7CF4] hover:underline">
                  zásady cookies
                </a>
                .
              </p>
            </section>

            <section>
              <h2 className="text-lg font-black mb-2">7. Zabezpečení</h2>
              <p className="text-[#5A6480]">
                Údaje jsou chráněny TLS šifrováním při přenosu, na úrovni DB
                přístupovými právy (RLS), produkční zálohy jsou šifrované.
                Přístup k údajům mají pouze nezbytné osoby s odůvodněnou potřebou.
                Nikomu osobní údaje neprodáváme.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-black mb-2">8. Změny zásad</h2>
              <p className="text-[#5A6480]">
                Tyto zásady můžeme aktualizovat. Aktuální verzi vždy najdete na
                této stránce s uvedením data účinnosti. Pokud změny ovlivní vaše
                práva, upozorníme vás na ně i e-mailem (pokud jste nám e-mail
                poskytli).
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
