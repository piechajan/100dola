import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MalagaHero from "@/components/malaga/MalagaHero";
import MalagaHowItWorks from "@/components/malaga/MalagaHowItWorks";
import MalagaServices from "@/components/malaga/MalagaServices";
import MalagaWhyOwnBike from "@/components/malaga/MalagaWhyOwnBike";
import MalagaBase from "@/components/malaga/MalagaBase";
import MalagaPackagesPreview from "@/components/malaga/MalagaPackagesPreview";
import MalagaTrust from "@/components/malaga/MalagaTrust";
import MalagaFAQPreview from "@/components/malaga/MalagaFAQPreview";
import MalagaFinalCTA from "@/components/malaga/MalagaFinalCTA";
import WeatherWidget from "@/components/malaga/WeatherWidget";
import { FAQ_PREVIEW } from "@/data/malaga";

export const metadata: Metadata = {
  title: { absolute: "100dola Malaga — vlastní kolo v Malaze, bez krabice na letišti" },
  description:
    "Dovezeme tvoje kolo z Česka do Malagy a uskladníme přes celou zimu (říjen–květen). Letíš nalehko, jezdíš na svém. Balíčky od 849 €.",
  alternates: {
    canonical: "/malaga",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_PREVIEW.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.a,
    },
  })),
};

const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "100dola Malaga — doprava a skladování kol v Malaze",
  description:
    "Doprava kola z Česka do Malagy, skladování přes sezónu (říjen–květen) a balíčky pro cyklisty.",
  provider: {
    "@type": "Organization",
    name: "FUTUNATU s.r.o.",
    email: "info@100dola.com",
    telephone: "+420739045057",
  },
  areaServed: ["CZ", "ES"],
  offers: [
    { "@type": "Offer", name: "Basic", priceCurrency: "EUR", price: "849" },
    { "@type": "Offer", name: "Exclusive", priceCurrency: "EUR", price: "1349" },
  ],
};

export default function MalagaPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            name: "100dola Malaga — přeprava a uskladnění kola",
            serviceType: "Bike transport and storage",
            description:
              "Doprava a celosezónní uskladnění kola v Malaze. Letíš nalehko, jedeš na svém. Bez opakovaného balení a kompromisů z půjčovny.",
            url: "https://www.100dola.com/malaga",
            provider: { "@id": "https://www.100dola.com/#organization" },
            areaServed: { "@type": "Country", name: "Česká republika" },
            audience: { "@type": "Audience", audienceType: "Cyklisté" },
          }),
        }}
      />
      <Navbar />
      <main className="pt-20">
        <MalagaHero />
        <section className="py-8 bg-white">
          <div className="max-w-[1000px] mx-auto px-6 md:px-12">
            <WeatherWidget />
          </div>
        </section>
        <MalagaHowItWorks />
        <MalagaServices />
        <MalagaWhyOwnBike />
        <MalagaBase />
        <MalagaPackagesPreview />
        <MalagaTrust />
        <MalagaFAQPreview />

        {/* Pojištění cross-link */}
        <section className="py-10 bg-white">
          <div className="max-w-[1000px] mx-auto px-6 md:px-12">
            <Link
              href="/pojisteni?zajem=cestovni"
              className="block rounded-2xl border border-[#FBC9A8] bg-[#FFF1EA] p-6 md:p-8 hover:border-[#E8431A] transition"
            >
              <div className="text-xs font-bold uppercase tracking-wider text-[#E8431A] mb-1">
                Pojištění na cestu i na kolo
              </div>
              <div className="text-lg md:text-xl font-black text-[#1a1a2e]">
                Cestovní pojištění a pojištění kola do Malagy — zajistíme →
              </div>
              <p className="text-sm text-[#5A6480] mt-1 leading-snug">
                Přeprava je pojištěná. Tvoje léčebné výlohy na cestě a kolo proti krádeži a
                poškození řešíme zvlášť přes našeho pojišťovacího partnera. Nezávazně poptej.
              </p>
            </Link>
          </div>
        </section>

        <MalagaFinalCTA />
      </main>
      <Footer />
    </>
  );
}
