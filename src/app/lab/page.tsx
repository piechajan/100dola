import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LabHero from "@/components/lab/LabHero";
import LabIntro from "@/components/lab/LabIntro";
import LabServices from "@/components/lab/LabServices";
import LabWhy from "@/components/lab/LabWhy";
import LabProcess from "@/components/lab/LabProcess";
import LabGallery from "@/components/lab/LabGallery";
import LabFAQ from "@/components/lab/LabFAQ";
import LabCrossSellMalaga from "@/components/lab/LabCrossSellMalaga";
import LabLeadForm from "@/components/lab/LabLeadForm";
import { LAB_FAQ, LAB_CONTACT } from "@/data/lab";

export const metadata: Metadata = {
  title: "100dola Lab — kultivace kola: keramická ložiska, PPF, voskování",
  description:
    "Lab je dílna pro drahá kola. Keramická ložiska (rychlejší kolo), PPF ochrana laku, voskování řetězu, kompletní cleanup. Klid, řemeslo, dokumentace každého zásahu.",
  alternates: {
    canonical: "/lab",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: LAB_FAQ.map((item) => ({
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
  name: "100dola Lab — bike detailing a kultivace kola",
  description:
    "Keramická ložiska, PPF folie, keramická ochrana laku, voskování řetězu, cleanup, kontrola buildu a fitu.",
  provider: {
    "@type": "Organization",
    name: "FUTUNATU s.r.o.",
    email: LAB_CONTACT.email,
    telephone: "+420739045057",
  },
  areaServed: "CZ",
};

export default function LabPage() {
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

      <Navbar />
      <main>
        <LabHero />
        <LabIntro />
        <LabServices />
        <LabWhy />
        <LabProcess />
        <LabGallery />
        <LabFAQ />
        <LabCrossSellMalaga />

        {/* Lead form */}
        <section className="bg-[#F5F7FF] py-20 md:py-28">
          <div className="max-w-[720px] mx-auto px-6 md:px-12">
            <div className="text-center mb-10">
              <div className="text-xs tracking-[0.22em] uppercase font-bold text-[#1F4937] mb-3">
                Poptávka
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-[#1a1a2e] tracking-tight leading-[1.1]">
                Naceň úpravu tvého kola.
              </h2>
              <p className="mt-4 text-base text-[#5A6480]">
                Stačí pár polí. Konkrétní cenu potvrdíme po prohlídce kola.
              </p>
            </div>
            <LabLeadForm />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
