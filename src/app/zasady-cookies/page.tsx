import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: { absolute: "Zásady cookies — 100dola" },
  description: "Jaké cookies a externí skripty 100dola.com používá, k čemu, jak dlouho a jak je odmítnout.",
  alternates: { canonical: "/zasady-cookies" },
};

export default function CookiesPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20 bg-white min-h-screen">
        <article className="max-w-[760px] mx-auto px-6 md:px-12 py-12 md:py-16">

          <div className="text-xs tracking-[0.22em] uppercase font-bold text-[#3B7CF4] mb-2">
            Právní informace
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-[#1a1a2e] tracking-tight leading-[1.05] mb-8">
            Zásady cookies
          </h1>

          <p className="text-base text-[#5A6480] leading-relaxed mb-6">
            Provozovatel webu <strong>100dola.com</strong> je <strong>FUTUNATU s.r.o.</strong>, IČO 07376766, se sídlem Rybná 716/24, 110 00 Praha 1.
          </p>

          <h2 className="text-xl font-black text-[#1a1a2e] mt-10 mb-3">Co jsou cookies</h2>
          <p className="text-sm text-[#5A6480] leading-relaxed mb-4">
            Drobné textové soubory, které prohlížeč ukládá při návštěvě webu. Slouží k zapamatování přihlášení, košíku, preferencí nebo k anonymnímu měření návštěvnosti.
          </p>

          <h2 className="text-xl font-black text-[#1a1a2e] mt-10 mb-3">Jaké cookies používáme</h2>

          <h3 className="text-base font-black text-[#1a1a2e] mt-6 mb-2">1. Nezbytné (vždy aktivní)</h3>
          <p className="text-sm text-[#5A6480] leading-relaxed mb-2">
            Bez nich web nefunguje. ePrivacy směrnice je z požadavku na souhlas vyjímá.
          </p>
          <ul className="text-sm text-[#5A6480] leading-relaxed space-y-1 ml-5 list-disc">
            <li><code className="text-xs">100dola-cart</code> — obsah košíku (localStorage)</li>
            <li><code className="text-xs">admin_session</code> — přihlášení do administrace (cookie, jen pro správce webu)</li>
            <li><code className="text-xs">100dola-cookies-consent</code> — záznam tvé volby cookies (localStorage)</li>
          </ul>

          <h3 className="text-base font-black text-[#1a1a2e] mt-6 mb-2">2. Analytika (jen se souhlasem)</h3>
          <p className="text-sm text-[#5A6480] leading-relaxed mb-2">
            Měření návštěvnosti pro zlepšení webu. <strong>Google Analytics 4</strong> a{" "}
            <strong>Microsoft Clarity</strong> (anonymní heat-mapy) spouštíme až po tvém souhlasu
            s analytikou. <strong>Vercel Analytics</strong> běží bez cookies a bez osobních
            identifikátorů (cookieless) na základě oprávněného zájmu.
          </p>

          <h3 className="text-base font-black text-[#1a1a2e] mt-6 mb-2">3. Marketing (jen se souhlasem)</h3>
          <p className="text-sm text-[#5A6480] leading-relaxed">
            <strong>Meta Pixel</strong> (Facebook/Instagram) a <strong>Meta Conversions API</strong>{" "}
            pro měření konverzí a remarketing — řídí se tvým souhlasem s marketingem (se souhlasem
            plná data, bez souhlasu bez osobních údajů). <strong>Heureka „Ověřeno zákazníky"</strong>{" "}
            — po nákupu můžeme předat tvůj e-mail Heurece pro dotazník spokojenosti na základě
            oprávněného zájmu; kdykoli máš právo vznést námitku.
          </p>

          <h2 className="text-xl font-black text-[#1a1a2e] mt-10 mb-3">Externí služby</h2>
          <ul className="text-sm text-[#5A6480] leading-relaxed space-y-2 ml-5 list-disc">
            <li><strong>Vercel</strong> — hosting, CDN, Edge funkce. Detaily: vercel.com/legal/privacy-policy</li>
            <li><strong>Cloudflare</strong> — DNS + Email Routing. Detaily: cloudflare.com/cs-cz/privacypolicy/</li>
            <li><strong>Resend</strong> — odesílání transakčních e-mailů. Detaily: resend.com/privacy</li>
            <li><strong>Supabase</strong> — databáze (registrace, objednávky). Detaily: supabase.com/privacy</li>
            <li><strong>Packeta / Zásilkovna</strong> — výběr výdejny u objednávky (jen pokud klient otevře widget)</li>
            <li><strong>Microsoft Clarity</strong> — anonymní heat-mapy a analytika chování (jen se souhlasem s analytikou)</li>
            <li><strong>Meta Platforms</strong> — Meta Pixel a Conversions API pro měření reklam (jen se souhlasem s marketingem)</li>
            <li><strong>Google</strong> — Google Analytics 4 / Ads (jen se souhlasem s analytikou/marketingem)</li>
            <li><strong>Strava</strong> — propojení s Open Miles Clinic eventy</li>
          </ul>

          <h2 className="text-xl font-black text-[#1a1a2e] mt-10 mb-3">Jak souhlas spravovat</h2>
          <p className="text-sm text-[#5A6480] leading-relaxed mb-4">
            Při první návštěvě se ti zobrazí cookies banner. Můžeš:
          </p>
          <ul className="text-sm text-[#5A6480] leading-relaxed space-y-1 ml-5 list-disc">
            <li><strong>Přijmout vše</strong> — všechny kategorie cookies</li>
            <li><strong>Odmítnout</strong> — jen nezbytné</li>
            <li><strong>Detail</strong> — vybírat jednotlivě</li>
          </ul>
          <p className="text-sm text-[#5A6480] leading-relaxed mt-4">
            Změnit volbu lze vymazáním cookies pro doménu 100dola.com v prohlížeči — banner se znovu objeví.
          </p>

          <h2 className="text-xl font-black text-[#1a1a2e] mt-10 mb-3">Kontakt</h2>
          <p className="text-sm text-[#5A6480] leading-relaxed">
            Dotazy / žádosti o výmaz dat:{" "}
            <a href="mailto:info@100dola.com" className="text-[#3B7CF4] font-bold hover:underline">
              info@100dola.com
            </a>
          </p>

          <p className="text-xs text-[#9AA3C2] mt-12">
            Naposledy aktualizováno: 2026-05-14
          </p>
        </article>
      </main>
      <Footer />
    </>
  );
}
