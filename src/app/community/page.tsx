import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CommunityHero from "@/components/community/CommunityHero";
import EventListing from "@/components/community/EventListing";
import WhyJoin from "@/components/community/WhyJoin";
import CommunityRules from "@/components/community/CommunityRules";
import GalleryRecap from "@/components/community/GalleryRecap";
import CommunityFAQ from "@/components/community/CommunityFAQ";
import { COMMUNITY_FAQ } from "@/data/community-faq";
import CommunityNewsletter from "@/components/community/CommunityNewsletter";

export const metadata: Metadata = {
  title: { absolute: "Jedeme spolu — Open Miles Clinic | 100dola" },
  description:
    "Open Miles Clinic — sportovní komunita z Valašska. Pravidelné social rides, skialpy, gravel a turistika. Bez startovného, bez ega. Přidej se k nám.",
  alternates: { canonical: "/community" },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: COMMUNITY_FAQ.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.a,
    },
  })),
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "SportsOrganization",
  name: "Open Miles Clinic",
  alternateName: "OMC",
  url: "https://www.100dola.com/community",
  logo: "https://www.100dola.com/media/omc-logo.png",
  description:
    "Sportovní komunita z Valašska. Pravidelné social rides na kole, skialpy, gravel a turistika. Bez startovného, bez ega.",
  sameAs: ["https://www.instagram.com/open_miles_clinic/"],
  parentOrganization: {
    "@type": "Organization",
    name: "FUTUNATU s.r.o.",
    email: "info@100dola.com",
  },
  sport: ["Road cycling", "Gravel cycling", "Mountain biking", "Ski touring", "Cross-country skiing", "Hiking"],
};

export default function CommunityPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />

      <Navbar />
      <main>
        <CommunityHero />
        <EventListing />
        <WhyJoin />
        <CommunityRules />
        <GalleryRecap />
        <CommunityFAQ />
        <CommunityNewsletter />
      </main>
      <Footer />
    </>
  );
}
