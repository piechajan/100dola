import Link from "next/link";
import { LAB_BRAND, LAB_HERO } from "@/data/lab";

const accent = LAB_BRAND.color;

export default function LabHero() {
  return (
    <section className="relative overflow-hidden bg-[#0F1A14] text-white" style={{ minHeight: "85vh" }}>
      {/* Pinarello Dogma — full-bleed hero photo */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={LAB_HERO.image}
        alt="Pinarello Dogma — 100dola Lab kultivace stroje"
        className="absolute inset-0 w-full h-full object-cover opacity-65"
        loading="eager"
      />

      {/* Left-to-right dark gradient for text legibility */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, rgba(10,18,14,0.86) 0%, rgba(10,18,14,0.55) 55%, rgba(10,18,14,0.1) 100%)",
        }}
      />

      <div
        className="relative max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20 flex flex-col justify-end pb-16 md:pb-24 pt-32 md:pt-40"
        style={{ minHeight: "85vh" }}
      >
        <div className="flex items-center gap-3 mb-6">
          <span className="w-8 h-px" style={{ backgroundColor: LAB_BRAND.brass }} />
          <span className="text-xs tracking-[0.22em] uppercase font-bold" style={{ color: LAB_BRAND.brass }}>
            {LAB_HERO.eyebrow}
          </span>
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.92] max-w-3xl">
          {LAB_HERO.h1Line1}
          <br />
          <span style={{ color: "#7BC9A8" }}>{LAB_HERO.h1Line2}</span>
        </h1>

        <p className="mt-6 text-lg md:text-xl text-white/75 max-w-xl leading-relaxed">
          {LAB_HERO.sub}
        </p>

        <div className="mt-9 flex flex-wrap gap-3">
          <Link
            href="#poptavka"
            className="inline-flex items-center gap-2 px-7 py-4 text-sm font-bold text-white rounded-full transition-all hover:opacity-90"
            style={{ backgroundColor: accent, boxShadow: `0 4px 24px ${accent}60` }}
          >
            {LAB_HERO.ctaPrimary}
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
          <Link
            href="#sluzby"
            className="inline-flex items-center gap-2 px-7 py-4 text-sm font-bold rounded-full border border-white/30 text-white/85 hover:border-white/60 hover:text-white transition-all"
          >
            {LAB_HERO.ctaSecondary}
          </Link>
        </div>
      </div>
    </section>
  );
}
