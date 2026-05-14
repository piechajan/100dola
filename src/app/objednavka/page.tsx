import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CheckoutForm from "@/components/shop/CheckoutForm";

export const metadata: Metadata = {
  title: "Objednávka — 100dola sport",
  description: "Dokončení objednávky. Doprava GLS / Zásilkovna / osobní vyzvednutí. Platba QR / převod / hotovost.",
  alternates: { canonical: "/objednavka" },
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20 bg-[#F7F9FF] min-h-screen pb-20">
        <div className="max-w-[1100px] mx-auto px-6 md:px-12 pt-10 md:pt-12">
          <div className="mb-8">
            <div className="text-xs tracking-[0.22em] uppercase font-bold text-[#3B7CF4] mb-2">
              Objednávka
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-[#1a1a2e] tracking-tight">
              Dokončení objednávky
            </h1>
          </div>

          <CheckoutForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
