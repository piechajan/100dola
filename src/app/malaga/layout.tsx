import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "100dola Malaga — vlastní kolo v Malaze, bez krabice na letišti",
    template: "%s | 100dola Malaga",
  },
  description:
    "Uteč české zimě — dovezeme tvoje kolo do Malagy a necháme ho tam přes celou zimu i sezónu. Letíš nalehko, jezdíš na svém. Doprava, skladování a balíčky pro cyklisty.",
  openGraph: {
    type: "website",
    siteName: "100dola Malaga",
    locale: "cs_CZ",
    images: ["/media/malaga-hero.jpg"],
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function MalagaLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
