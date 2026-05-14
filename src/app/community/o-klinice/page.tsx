import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "O Open Miles Clinic — komunita pohybu | 100dola",
  description:
    "Open Miles Clinic je sportovní komunita z Valašska. Pravidelné social rides na kole, skialpy v zimě, gravel a turistika podle sezóny. Ego necháváme doma.",
  alternates: { canonical: "/community/o-klinice" },
};

const stats = [
  { value: "2025", label: "rok založení" },
  { value: "2", label: "sezóny" },
  { value: "6", label: "typů aktivit" },
];

const principles = [
  {
    title: "Nikoho neztratíme.",
    text: "Tempo se přizpůsobuje skupině. Na rychlejší se počká, pomalejší dotáhneme. Vracíme se vždy všichni.",
  },
  {
    title: "Bez ega, bez startovného.",
    text: "Social rides jsou zdarma. Žádné body, žádné výsledkové listiny. Jen kafe na startu a kilometry mezi nimi.",
  },
  {
    title: "Lokální, ale otevřená.",
    text: "Vyrostli jsme na Valašsku. Pravidelně jezdíme i z Prahy a okolí. Přidat se může kdokoliv, kdo má chuť.",
  },
  {
    title: "Pohyb je celoroční.",
    text: "Léto = kolo, gravel, MTB. Zima = skialpy, běžky. Mezisezóna = turistika a kafe. Komunita roste s ročními obdobími.",
  },
];

export default function OKlinicePage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-[#0d1a10] text-white" style={{ minHeight: "60vh" }}>
          <Image
            src="/media/community-hero-jedeme-spolu-9423.jpg"
            alt="Open Miles Clinic — skupina cyklistů"
            fill
            sizes="100vw"
            className="object-cover opacity-50"
            priority
          />
          <div className="absolute inset-0" style={{
            background: "linear-gradient(to right, rgba(10,25,15,0.95) 0%, rgba(10,25,15,0.6) 70%, rgba(10,25,15,0.3) 100%)"
          }} />

          <div className="relative max-w-[1200px] mx-auto px-6 md:px-12 lg:px-20 flex flex-col justify-end pb-16 md:pb-24 pt-32 md:pt-40" style={{ minHeight: "60vh" }}>
            <div className="flex items-center gap-3 mb-5">
              <Image
                src="/media/omc-logo.png"
                alt="Open Miles Clinic"
                width={48}
                height={48}
                className="rounded-xl"
              />
              <span className="text-xs tracking-[0.2em] uppercase font-bold text-[#2EAA6E]">
                Open Miles Clinic
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[0.95] max-w-3xl">
              Komunita, ne klub.
            </h1>
            <p className="mt-6 text-lg text-white/70 max-w-2xl leading-relaxed">
              Od roku 2025 jezdíme spolu. Začalo to pár lidmi v kavárně, dnes pravidelně vyrážíme napříč Valašskem, Prahou a okolím.
              Bez startovného, bez výsledků, bez ega.
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="bg-white py-16 md:py-20">
          <div className="max-w-[1100px] mx-auto px-6 md:px-12">
            <div className="grid grid-cols-3 gap-8 md:gap-12 max-w-2xl mx-auto">
              {stats.map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-4xl md:text-5xl font-black text-[#1a1a2e]">{s.value}</div>
                  <div className="text-xs text-[#9AA3C2] mt-2 uppercase tracking-wider">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Principles */}
        <section className="bg-[#EDFAF3] py-20 md:py-24">
          <div className="max-w-[1100px] mx-auto px-6 md:px-12">
            <div className="mb-12 max-w-2xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-5 h-px bg-[#2EAA6E]" />
                <span className="text-xs tracking-[0.18em] uppercase font-bold text-[#2EAA6E]">Jak fungujeme</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-[#1a1a2e] tracking-tight leading-[1.1]">
                Čtyři věci, na kterých stojíme.
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              {principles.map((p, idx) => (
                <div key={p.title} className="bg-white rounded-2xl p-7 border border-[#E2E6F3]">
                  <div className="text-3xl font-black text-[#2EAA6E]/30 mb-2">0{idx + 1}</div>
                  <h3 className="text-lg font-black text-[#1a1a2e] mb-2 leading-tight">{p.title}</h3>
                  <p className="text-sm text-[#5A6480] leading-relaxed">{p.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-white py-20 md:py-24">
          <div className="max-w-[800px] mx-auto px-6 md:px-12 text-center">
            <h2 className="text-3xl md:text-4xl font-black text-[#1a1a2e] tracking-tight leading-[1.1]">
              Stačí přijít jednou.
            </h2>
            <p className="mt-5 text-lg text-[#5A6480] leading-relaxed">
              Žádné dotazníky, žádný členský poplatek. Najdi nejbližší akci, klikni přihlásit, přijď.
            </p>
            <div className="mt-10 flex flex-wrap gap-3 justify-center">
              <Link
                href="/community#eventy"
                className="inline-flex items-center gap-2 px-7 py-4 text-sm font-bold text-white rounded-full transition-all hover:opacity-90"
                style={{ backgroundColor: "#2EAA6E", boxShadow: "0 4px 20px #2EAA6E40" }}
              >
                Nejbližší akce
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <a
                href="https://www.instagram.com/open_miles_clinic/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-7 py-4 text-sm font-bold rounded-full border border-[#E2E6F3] text-[#1a1a2e] hover:border-[#2EAA6E] hover:text-[#2EAA6E] transition-all"
              >
                @open_miles_clinic
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
