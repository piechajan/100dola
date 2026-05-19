import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CancelRequestForm from "@/components/isaac/CancelRequestForm";

export const metadata: Metadata = {
  title: "Zrušit rezervaci ISAAC test",
  description:
    "Zruš svoji rezervaci testovací jízdy ISAAC — zadej e-mail, pošleme ti link na zrušení.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/isaac-test/zrusit-rezervaci" },
};

export default function CancelRequestPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20 bg-[#F7F9FF] min-h-screen pb-20">
        <div className="max-w-[560px] mx-auto px-6 md:px-12 pt-10">
          <div className="text-xs tracking-[0.22em] uppercase font-bold text-[#E8431A] mb-2">
            ISAAC test
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-3">
            Zrušit rezervaci
          </h1>
          <p className="text-sm text-[#5A6480] mb-6 leading-relaxed">
            Zadej e-mail, který jsi použil/a při rezervaci. Pošleme ti link, kterým rezervaci
            zrušíš jedním klikem. Slot se ihned uvolní pro další zájemce.
          </p>

          <CancelRequestForm />

          <p className="text-xs text-[#9AA3C2] text-center mt-6">
            Máš link na zrušení přímo v potvrzovacím e-mailu? Stačí na něj kliknout — žádný
            tento formulář není potřeba.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
