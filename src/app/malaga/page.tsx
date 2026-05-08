import type { Metadata } from "next";
import MalagaHero from "@/components/malaga/MalagaHero";
import MalagaHowItWorks from "@/components/malaga/MalagaHowItWorks";
import MalagaServices from "@/components/malaga/MalagaServices";
import MalagaWhyOwnBike from "@/components/malaga/MalagaWhyOwnBike";
import MalagaBase from "@/components/malaga/MalagaBase";
import MalagaPackagesPreview from "@/components/malaga/MalagaPackagesPreview";
import MalagaTrust from "@/components/malaga/MalagaTrust";
import MalagaFAQPreview from "@/components/malaga/MalagaFAQPreview";
import MalagaFinalCTA from "@/components/malaga/MalagaFinalCTA";
import { FAQ_PREVIEW } from "@/data/malaga";

export const metadata: Metadata = {
  title: "100dola Malaga — vlastní kolo v Malaze, bez krabice na letišti",
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
    email: "piecha.jan@gmail.com",
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

      <MalagaHero />
      <MalagaHowItWorks />
      <MalagaServices />
      <MalagaWhyOwnBike />
      <MalagaBase />
      <MalagaPackagesPreview />
      <MalagaTrust />
      <MalagaFAQPreview />
      <MalagaFinalCTA />
    </>
  );
}
