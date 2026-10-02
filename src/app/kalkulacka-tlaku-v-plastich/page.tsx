import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import TirePressureCalculator from "@/components/tools/TirePressureCalculator";

export const metadata: Metadata = {
  title: {
    absolute:
      "Kalkulačka tlaku v pláštích — na kolik foukat silničku | 100dola sport",
  },
  description:
    "Spočítej si tlak v silničních pláštích podle své váhy a šířky pláště. Zvlášť přední a zadní kolo, v barech i psi, včetně bezdušového provozu a limitu hookless ráfků.",
  alternates: { canonical: "/kalkulacka-tlaku-v-plastich" },
  keywords: [
    "kalkulačka tlaku v pláštích",
    "na kolik foukat silničku",
    "tlak v pláštích silniční kolo",
    "tlak v pneumatikách kolo podle váhy",
    "tlak 28mm plášť",
    "tlak tubeless silnice",
    "hookless ráfek maximální tlak",
  ],
  openGraph: {
    title: "Kalkulačka tlaku v pláštích",
    description:
      "Nastav váhu a šířku pláště — spočítej tlak pro přední i zadní kolo.",
  },
};

export default function TirePressureCalculatorPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "Kalkulačka tlaku v pláštích",
          applicationCategory: "UtilitiesApplication",
          operatingSystem: "Web",
          url: "https://www.100dola.com/kalkulacka-tlaku-v-plastich",
          inLanguage: "cs",
          description:
            "Výpočet tlaku v silničních pláštích podle hmotnosti jezdce, šířky pláště, vnitřní šířky ráfku, povrchu, průměrné rychlosti a typu pláště. Zvlášť přední a zadní kolo, včetně limitu bezháčkových ráfků.",
          offers: { "@type": "Offer", price: "0", priceCurrency: "CZK" },
          featureList: [
            "Tlak zvlášť pro přední a zadní kolo",
            "Přepočet skutečné šířky pláště podle vnitřní šířky ráfku",
            "Korekce podle povrchu a průměrné rychlosti",
            "Duše, latex, bezdušové i galusky",
            "Hlídání limitu 5,0 bar u bezháčkových ráfků",
          ],
          publisher: {
            "@type": "Organization",
            name: "100dola sport",
            url: "https://www.100dola.com",
          },
        }}
      />
      <Navbar />
      <main className="pt-28 md:pt-32 bg-gradient-to-b from-[#F7F9FF] to-white min-h-screen">
        <section className="max-w-[900px] mx-auto px-4 md:px-6 pb-16">
          <div className="text-center mb-8 md:mb-10">
            <div className="text-xs tracking-[0.22em] uppercase font-bold text-[#3B7CF4] mb-3">
              Nástroj
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-[#1a1a2e] leading-tight">
              Kalkulačka tlaku v pláštích
            </h1>
            <p className="mt-4 text-base text-[#5A6480] max-w-[620px] mx-auto leading-relaxed">
              Nastav svoji váhu a šířku pláště a zjisti, na kolik foukat přední a
              zadní kolo. Většina silničářů jezdí přefouklá — a tvrdší plášť
              přitom není rychlejší.
            </p>
          </div>

          <TirePressureCalculator />

          <div className="mt-10 grid sm:grid-cols-3 gap-4">
            {[
              [
                "Vzadu víc než vpředu",
                "Na zadní kolo připadá zhruba 53 % hmotnosti, proto je rozdíl 0,4–0,6 bar. Stejný tlak na obou kolech znamená přefouklé přední.",
              ],
              [
                "Širší plášť, nižší tlak",
                "Přechod z 25 na 28 mm znamená asi o 0,7 bar méně při stejném průhybu. Nafouknout širší plášť natvrdo zahodí to, kvůli čemu jste ho kupovali.",
              ],
              [
                "Ověřte si ráfek",
                "Bezháčkové ráfky mají strop 5,0 bar bez ohledu na údaj na plášti. Nevíte, jestli je máte? Zastavte se v prodejně, koukneme na to.",
              ],
            ].map(([h, t]) => (
              <div
                key={h}
                className="rounded-2xl border border-[#E2E6F3] bg-white p-5"
              >
                <div className="text-sm font-black text-[#1a1a2e] mb-1">{h}</div>
                <p className="text-xs text-[#5A6480] leading-relaxed">{t}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-[#E2E6F3] bg-white p-6 text-center">
            <p className="text-sm text-[#5A6480] leading-relaxed">
              Chcete vědět, proč čísla vycházejí takhle, a projít si celou
              tabulku pro 25–32 mm?{" "}
              <Link
                href="/clanky/tlak-v-plastich-silnicni-kolo"
                className="font-bold text-[#3B7CF4] underline underline-offset-2"
              >
                Přečtěte si celý návod
              </Link>
              .
            </p>
          </div>

          <div className="mt-10 rounded-2xl bg-[#1a1a2e] text-white p-6 md:p-8 text-center">
            <h2 className="text-xl md:text-2xl font-black mb-2">
              Řešíte pláště nebo přechod na bezdušové?
            </h2>
            <p className="text-sm text-white/70 max-w-[520px] mx-auto mb-5">
              Změříme skutečnou šířku pláště i ráfku, zkontrolujeme typ ráfku a
              nastavíme tlak na vaši váhu a povrch, po kterém jezdíte. Osobně ve
              Šternberku i na dálku.
            </p>
            <Link
              href="/kontakt"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-white text-[#1a1a2e] text-sm font-black hover:opacity-90 transition"
            >
              Napsat nám
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
