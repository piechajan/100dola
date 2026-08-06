import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ServiceBookingForm from "@/components/sport/ServiceBookingForm";

export const metadata: Metadata = {
  title: { absolute: "Servis kol · bikefit · Šternberk — 100dola sport" },
  description:
    "Servis silničních, gravel, MTB i elektrokol ve Šternberku. Bikefit, detailing, voskování řetězů. Rezervuj termín online — ozveme se do 24 hodin.",
  alternates: { canonical: "/sport/servis" },
};

const SERVICES = [
  {
    title: "Servis kola",
    icon: "🔧",
    desc: "Diagnostika, geometrie, převody, brzdy, kola, BB, headset. Silnice / gravel / MTB / elektrokola.",
    bullets: ["Sezónní prohlídka", "Výměna sady", "Centrace kola", "Hydraulika brzd"],
  },
  {
    title: "Bikefit",
    icon: "📐",
    desc: "Nastavení geometrie kola pod tělo — výška sedla, posed, dosah. Lepší výkon, méně bolesti.",
    bullets: ["2-3h sezení", "Měření na kole", "Doporučení komponent", "Fotodokumentace"],
  },
  {
    title: "Detailing",
    icon: "✨",
    desc: "Mytí, voskování řetězu (paraffin wax), Shield Powder Coat. Kolo jede tišeji a čistěji.",
    bullets: ["Mytí + leštění", "Voskování řetězu", "Ochrana laku", "Foto výsledku"],
  },
];

export default function ServisPage() {
  return (
    <>
      <Navbar />
      <main className="bg-[#F7F9FF]">
        {/* Hero */}
        <section className="bg-white border-b border-[#E2E6F3]">
          <div className="max-w-[1100px] mx-auto px-6 md:px-12 py-12 md:py-20">
            <div className="text-xs tracking-[0.22em] uppercase font-bold text-[#3B7CF4] mb-3">
              Šternberk · Partyzánská 2
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-[#1a1a2e] mb-4 leading-tight">
              Servis, bikefit & detailing<br />tvého kola.
            </h1>
            <p className="text-base md:text-lg text-[#5A6480] max-w-2xl leading-relaxed">
              Rezervuj termín přes formulář níže. Ozvu se ti do <strong className="text-[#1a1a2e]">24 hodin</strong>
              s potvrzením, nebo se domluvíme telefonem.
            </p>
          </div>
        </section>

        {/* Služby */}
        <section className="py-12 md:py-16">
          <div className="max-w-[1100px] mx-auto px-6 md:px-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {SERVICES.map((s) => (
                <div
                  key={s.title}
                  className="bg-white rounded-2xl border border-[#E2E6F3] p-6 hover:shadow-md transition-all"
                >
                  <div className="text-3xl mb-3">{s.icon}</div>
                  <h2 className="text-xl font-black text-[#1a1a2e] mb-2">{s.title}</h2>
                  <p className="text-sm text-[#5A6480] leading-relaxed mb-4">{s.desc}</p>
                  <ul className="space-y-1.5">
                    {s.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2 text-xs text-[#5A6480]">
                        <span className="w-1 h-1 rounded-full bg-[#3B7CF4] mt-1.5 shrink-0" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Form */}
        <section className="py-12 md:py-16 border-t border-[#E2E6F3]">
          <div className="max-w-[760px] mx-auto px-6 md:px-12">
            <div className="text-xs tracking-[0.22em] uppercase font-bold text-[#3B7CF4] mb-3">
              Rezervace termínu
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-6">
              Pošli mi pár informací
            </h2>
            <ServiceBookingForm />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
