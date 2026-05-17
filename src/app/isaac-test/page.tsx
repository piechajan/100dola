import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import IsaacTestForm from "@/components/isaac/IsaacTestForm";
import { ISAAC_BIKES, ISAAC_DAYS } from "@/data/isaac-bikes";

export const metadata: Metadata = {
  title: "Testovací jízdy ISAAC · 100dola sport",
  description:
    "Vyzkoušej ISAAC kola — Meson, Element, Boson, Vitron, Kaon a Torus Xplore. Road a gravel modely s Ultegra Di2, 105 Di2 a GRX. Zápůjčka 1 hodina zdarma, 29.–31. května 2026.",
  alternates: { canonical: "https://www.100dola.com/isaac-test" },
};

export const dynamic = "force-dynamic";

export default function IsaacTestPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20 bg-[#F7F9FF] min-h-screen pb-20">
        {/* Hero */}
        <section className="bg-white border-b border-[#E2E6F3]">
          <div className="max-w-[1100px] mx-auto px-6 md:px-12 py-12 md:py-16">
            <div className="text-xs tracking-[0.22em] uppercase font-bold text-[#3B7CF4] mb-2">
              100dola sport · Testovací jízdy
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-[#1a1a2e] leading-tight mb-4">
              Vyzkoušej ISAAC.
            </h1>
            <p className="text-base md:text-lg text-[#5A6480] max-w-2xl leading-relaxed">
              Road a gravel modely Meson, Element, Boson, Vitron, Kaon a Torus Xplore.
              Hodinová zápůjčka zdarma — vyber si kolo a termín. Pátek 29. 5. až neděle 31. 5. 2026.
            </p>
            <div className="grid grid-cols-3 gap-3 mt-8 max-w-2xl">
              <div className="bg-[#F7F9FF] rounded-xl p-4">
                <div className="text-[10px] uppercase tracking-wider text-[#9AA3C2] font-bold mb-1">Pátek</div>
                <div className="text-sm font-black text-[#1a1a2e]">29. 5.</div>
                <div className="text-xs text-[#5A6480]">9:00–16:00</div>
              </div>
              <div className="bg-[#F7F9FF] rounded-xl p-4">
                <div className="text-[10px] uppercase tracking-wider text-[#9AA3C2] font-bold mb-1">Sobota</div>
                <div className="text-sm font-black text-[#1a1a2e]">30. 5.</div>
                <div className="text-xs text-[#5A6480]">14:00–17:00</div>
              </div>
              <div className="bg-[#F7F9FF] rounded-xl p-4">
                <div className="text-[10px] uppercase tracking-wider text-[#9AA3C2] font-bold mb-1">Neděle</div>
                <div className="text-sm font-black text-[#1a1a2e]">31. 5.</div>
                <div className="text-xs text-[#5A6480]">9:00–17:00</div>
              </div>
            </div>
          </div>
        </section>

        {/* Form */}
        <section className="max-w-[1100px] mx-auto px-6 md:px-12 py-10">
          <IsaacTestForm bikes={ISAAC_BIKES} days={ISAAC_DAYS} />
        </section>
      </main>
      <Footer />
    </>
  );
}
