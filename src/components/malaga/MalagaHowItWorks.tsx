import { MALAGA_BRAND, HOW_IT_WORKS } from "@/data/malaga";

const accent = MALAGA_BRAND.color;

export default function MalagaHowItWorks() {
  return (
    <section id="jak-to-funguje" className="py-20 md:py-28 bg-white">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-5 h-px" style={{ backgroundColor: accent }} />
            <span className="text-xs tracking-[0.18em] uppercase font-bold" style={{ color: accent }}>
              Jak to funguje
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-[#1a1a2e] leading-[0.95]">
            Čtyři kroky.<br />Žádné komplikace.
          </h2>
        </div>

        {/* Desktop: 4 columns with arrows. Mobile: vertical stack. */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-4">
          {HOW_IT_WORKS.map((step, i) => (
            <div key={step.num} className="relative">
              {/* Arrow on desktop, except last */}
              {i < HOW_IT_WORKS.length - 1 && (
                <div className="hidden md:block absolute top-7 -right-2 z-10">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={accent} strokeWidth={2}>
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              )}

              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-black mb-5"
                style={{ backgroundColor: `${accent}12`, color: accent }}
              >
                {step.num}
              </div>
              <div className="text-lg font-black text-[#1a1a2e] mb-2">{step.title}</div>
              <div className="text-sm text-[#5A6480] leading-relaxed">{step.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
