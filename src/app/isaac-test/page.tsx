import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import IsaacTestForm from "@/components/isaac/IsaacTestForm";
import { ISAAC_BIKES, ISAAC_DAYS, ISAAC_BRAND, ISAAC_BRING } from "@/data/isaac-bikes";

export const metadata: Metadata = {
  title: "Testovací jízdy ISAAC · Šternberk · víkend Závodu Míru 2026",
  description:
    "Vyzkoušej ISAAC kola během víkendu Závodu Míru ve Šternberku — Meson, Element, Boson, Vitron, Torus Xplore. Road i gravel, hodinová zápůjčka zdarma. 29. 5. – 1. 6. 2026.",
  alternates: { canonical: "https://www.100dola.com/isaac-test" },
  keywords: [
    "ISAAC kola test",
    "testovací jízdy Šternberk",
    "Závod Míru Šternberk",
    "Závod Míru 2026 dojezd",
    "Závod Míru U23",
    "cyklistika Šternberk",
    "ISAAC Meson Element Boson Vitron",
  ],
};

export const dynamic = "force-dynamic";

export default function IsaacTestPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20 bg-[#F7F9FF] min-h-screen pb-20">
        {/* Hero */}
        <section className="relative isolate border-b border-[#E2E6F3] overflow-hidden">
          {/* Background photo */}
          <div className="absolute inset-0 -z-10">
            <Image
              src="/media/isaac-hero-store.jpg"
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
            />
            {/* Fade overlay — text čitelnost na bílé vlevo, fotka prosvítá vpravo */}
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-white/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-white/70 via-transparent to-white/20 md:hidden" />
          </div>

          <div className="max-w-[1100px] mx-auto px-6 md:px-12 py-12 md:py-20 relative">
            <div className="text-xs tracking-[0.22em] uppercase font-bold text-[#3B7CF4] mb-2">
              100dola sport
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-[#1a1a2e] leading-tight mb-4">
              Vyzkoušej ISAAC.
            </h1>
            <p className="text-base md:text-lg text-[#1a1a2e] max-w-2xl leading-relaxed">
              Road a gravel modely Meson, Element, Boson, Vitron a Torus Xplore.
              Hodinová zápůjčka zdarma — vyber si kolo a termín. Pátek 29. 5. až pondělí 1. 6. 2026.
            </p>
            <div className="mt-5 inline-flex items-start gap-2 px-4 py-3 rounded-xl bg-[#FFF1EA] border border-[#FBC9A8] text-sm text-[#9B3D17] max-w-2xl">
              <span className="text-base">📍</span>
              <div>
                <strong>Obchod 100dola sport</strong>, vedle kavárny Namístě, náměstí Šternberk.
                V neděli 31. 5. dojezd{" "}
                <a
                  href="https://zavodmiru.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold underline"
                >
                  Závodu Míru
                </a>{" "}
                — a ty si můžeš zkusit nové kolo.
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-8 max-w-2xl">
              <div className="bg-white/85 backdrop-blur rounded-xl p-4 border border-[#E2E6F3]/50">
                <div className="text-[10px] uppercase tracking-wider text-[#9AA3C2] font-bold mb-1">Pátek</div>
                <div className="text-sm font-black text-[#1a1a2e]">29. 5.</div>
                <div className="text-xs text-[#5A6480]">9:00–16:00</div>
              </div>
              <div className="bg-white/85 backdrop-blur rounded-xl p-4 border border-[#E2E6F3]/50">
                <div className="text-[10px] uppercase tracking-wider text-[#9AA3C2] font-bold mb-1">Sobota</div>
                <div className="text-sm font-black text-[#1a1a2e]">30. 5.</div>
                <div className="text-xs text-[#5A6480]">14:00–16:00</div>
              </div>
              <div className="bg-white/85 backdrop-blur rounded-xl p-4 border border-[#E2E6F3]/50">
                <div className="text-[10px] uppercase tracking-wider text-[#9AA3C2] font-bold mb-1">Neděle</div>
                <div className="text-sm font-black text-[#1a1a2e]">31. 5.</div>
                <div className="text-xs text-[#5A6480]">9:00–16:00</div>
              </div>
            </div>
          </div>
        </section>

        {/* Brand intro */}
        <section className="max-w-[1100px] mx-auto px-6 md:px-12 pt-10 pb-2">
          <div className="bg-white rounded-2xl border border-[#E2E6F3] p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              <div className="md:col-span-1">
                <div className="text-[10px] uppercase tracking-wider font-bold text-[#3B7CF4] mb-1">
                  Značka
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] leading-tight mb-2">
                  ISAAC
                </h2>
                <p className="text-xs text-[#9AA3C2]">
                  Holandská boutique značka<br />
                  {ISAAC_BRAND.origin} · od {ISAAC_BRAND.founded}
                </p>
                <a
                  href={ISAAC_BRAND.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-3 text-xs font-bold text-[#3B7CF4] hover:underline"
                >
                  isaac-cycle.com →
                </a>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-[#1a1a2e] font-bold leading-relaxed mb-3">
                  {ISAAC_BRAND.hero}
                </p>
                <ul className="space-y-2 text-sm text-[#5A6480] leading-relaxed">
                  {ISAAC_BRAND.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2">
                      <span className="text-[#3B7CF4] font-black mt-0.5">·</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Co s sebou */}
        <section className="max-w-[1100px] mx-auto px-6 md:px-12 pt-6">
          <div className="bg-white rounded-2xl border border-[#E2E6F3] p-6 md:p-8">
            <div className="flex items-baseline gap-3 mb-4">
              <h2 className="text-lg md:text-xl font-black text-[#1a1a2e]">Co si vezmi s sebou</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {ISAAC_BRING.map((b) => (
                <div
                  key={b.label}
                  className={`p-4 rounded-xl border ${
                    b.required ? "bg-[#FFF8E7] border-[#F5D78E]" : "bg-[#F7F9FF] border-[#E2E6F3]"
                  }`}
                >
                  <div className="text-2xl mb-1">{b.icon}</div>
                  <div className="text-sm font-black text-[#1a1a2e]">
                    {b.label}
                    {b.required && (
                      <span className="ml-1.5 text-[9px] uppercase tracking-wider font-bold text-[#8A5A00] bg-[#FFE5A8] px-1.5 py-0.5 rounded-full">
                        povinné
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[#5A6480] mt-1 leading-snug">{b.hint}</div>
                </div>
              ))}
            </div>
            <p className="text-xs text-[#9AA3C2] mt-4">
              Kola jsou připravená bez pedálů — přijď s vlastními a my je nasadíme. Bez helmy
              testovací jízda nemůže proběhnout.
            </p>
          </div>
        </section>

        {/* Form */}
        <section className="max-w-[1100px] mx-auto px-6 md:px-12 py-10">
          <IsaacTestForm bikes={ISAAC_BIKES} days={ISAAC_DAYS} />
        </section>

        {/* FB Event — sekundární CTA */}
        <section className="max-w-[1100px] mx-auto px-6 md:px-12 -mt-2 mb-2">
          <a
            href="https://www.facebook.com/events/813467078253362"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-white border border-[#E2E6F3] rounded-xl px-5 py-3 hover:border-[#1877F2] hover:shadow-sm transition group"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#1877F2" aria-hidden>
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-black text-[#1a1a2e] leading-tight">
                Ještě nevíš? Zúčastni se akce na Facebooku
              </div>
              <div className="text-xs text-[#5A6480]">
                Notifikace 48 h předem · sdílení s kamarády · diskuze pod eventem
              </div>
            </div>
            <span className="text-xl text-[#5A6480] group-hover:text-[#1877F2] transition" aria-hidden>→</span>
          </a>
        </section>

        {/* Závod Míru — teaser na článek v magazínu */}
        <section className="max-w-[1100px] mx-auto px-6 md:px-12 pb-6">
          <Link
            href="/clanky/zavod-miru-2026-sternberk"
            className="block bg-gradient-to-br from-[#FFF1EA] to-[#FFE0D0] border border-[#FBC9A8] rounded-2xl p-6 md:p-8 hover:shadow-lg transition group"
          >
            <div className="flex items-start gap-4">
              <div className="text-4xl">🚴</div>
              <div className="flex-1">
                <div className="text-[10px] uppercase tracking-wider font-bold text-[#9B3D17] mb-2">
                  V magazínu · událost
                </div>
                <h2 className="text-xl md:text-2xl font-black text-[#1a1a2e] mb-2 leading-tight">
                  Závod Míru 2026 končí ve Šternberku — trasa, program, kde sledovat dojezd
                </h2>
                <p className="text-sm text-[#5A6480] leading-relaxed mb-3">
                  Finálová etapa juniorského UCI Závodu Míru U23 vede v neděli 31. 5. 2026
                  z Krnova do Šternberka. 130,6 km, 2 278 m, dojezd 15:10. Plus
                  všechno o tom, jak spojit dojezd s testovací jízdou ISAAC v centru.
                </p>
                <span className="inline-flex items-center gap-1 text-sm font-bold text-[#E8431A] group-hover:underline">
                  Číst článek →
                </span>
              </div>
            </div>
          </Link>
        </section>

        {/* CTA — eshop */}
        <section className="max-w-[1100px] mx-auto px-6 md:px-12 pb-10">
          <div className="bg-gradient-to-br from-[#1a1a2e] to-[#2a2a4e] text-white rounded-2xl p-6 md:p-8 text-center">
            <div className="text-[10px] uppercase tracking-wider font-bold text-[#9AB4FF] mb-2">
              Líbí se ti kolo?
            </div>
            <h2 className="text-xl md:text-2xl font-black mb-3">
              Cokoliv otestuješ ti dovezeme.
            </h2>
            <p className="text-sm text-white/70 max-w-md mx-auto mb-5">
              Řekneme ti aktuální dostupnost, velikost a termín dodání. Konfigurace na míru,
              nebo se rovnou podívej na 100dola sport.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href="/shop"
                className="px-5 py-3 rounded-full bg-white text-[#1a1a2e] text-sm font-black hover:opacity-90"
              >
                100dola sport e-shop →
              </Link>
              <a
                href="mailto:info@100dola.com?subject=Mám zájem o ISAAC kolo"
                className="px-5 py-3 rounded-full border border-white/30 text-white text-sm font-bold hover:bg-white/10"
              >
                Zeptat se na konkrétní model
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
