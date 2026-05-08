import Image from "next/image";
import Link from "next/link";
import { MALAGA_BRAND, HERO_COPY, MALAGA_FACTS } from "@/data/malaga";

const accent = MALAGA_BRAND.color;

export default function MalagaHero() {
  return (
    <section className="relative overflow-hidden bg-[#1a0e08] text-white" style={{ minHeight: "85vh" }}>
      {/* Background photo */}
      <Image
        src="/media/malaga-hero.jpg"
        alt="Malaga — cyklistická základna"
        fill
        sizes="100vw"
        quality={88}
        priority
        className="object-cover opacity-55"
      />

      {/* Left-to-right gradient for text legibility */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, rgba(20,10,5,0.92) 0%, rgba(20,10,5,0.65) 55%, rgba(20,10,5,0.2) 100%)",
        }}
      />

      <div
        className="relative max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20 flex flex-col justify-end pb-16 md:pb-24 pt-32 md:pt-40"
        style={{ minHeight: "85vh" }}
      >
        {/* Eyebrow */}
        <div className="flex items-center gap-3 mb-6">
          <span className="w-8 h-px" style={{ backgroundColor: accent }} />
          <span className="text-xs tracking-[0.22em] uppercase font-bold" style={{ color: accent }}>
            {HERO_COPY.eyebrow}
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.92] max-w-3xl">
          {HERO_COPY.h1Line1}
          <br />
          <span style={{ color: accent }}>{HERO_COPY.h1Line2}</span>
        </h1>

        {/* Sub */}
        <p className="mt-6 text-lg md:text-xl text-white/75 max-w-xl leading-relaxed">
          {HERO_COPY.sub}
        </p>

        {/* CTAs */}
        <div className="mt-9 flex flex-wrap gap-3">
          <Link
            href="#poptavka"
            className="inline-flex items-center gap-2 px-7 py-4 text-sm font-bold text-white rounded-full transition-all hover:opacity-90"
            style={{ backgroundColor: accent, boxShadow: `0 4px 24px ${accent}50` }}
          >
            {HERO_COPY.ctaPrimary}
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
          <Link
            href="#jak-to-funguje"
            className="inline-flex items-center gap-2 px-7 py-4 text-sm font-bold rounded-full border border-white/30 text-white/85 hover:border-white/60 hover:text-white transition-all"
          >
            {HERO_COPY.ctaSecondary}
          </Link>
        </div>

        {/* Micro-strip */}
        <div className="mt-14 pt-6 border-t border-white/15 flex flex-wrap gap-x-8 gap-y-2 text-sm text-white/60">
          <span>✈ {MALAGA_FACTS.flightTime}</span>
          <span>☀ {MALAGA_FACTS.sunnyDays}</span>
          <span>🌡 {MALAGA_FACTS.winterTempRange}</span>
          <span>📍 {MALAGA_FACTS.baseAirportMinutes} min od letiště Malaga</span>
        </div>
      </div>
    </section>
  );
}
