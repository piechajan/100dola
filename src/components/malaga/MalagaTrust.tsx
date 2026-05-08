import { MALAGA_BRAND, TRUST_FACTS } from "@/data/malaga";

const accent = MALAGA_BRAND.color;

export default function MalagaTrust() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-20">
          {/* Left — kdo za tím stojí */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-5 h-px" style={{ backgroundColor: accent }} />
              <span className="text-xs tracking-[0.18em] uppercase font-bold" style={{ color: accent }}>
                Kdo za tím stojí
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-[#1a1a2e] leading-[0.95] mb-6">
              Provoz vede<br />Jan Piecha.
            </h2>
            <div className="text-[#5A6480] leading-relaxed space-y-4 max-w-xl">
              <p>
                100dola Malaga vznikla z reálné potřeby — ježdění v Andalusii přes zimu,
                bez opakovaného balení kola a bez kompromisů z půjčovny. Chceme aby model
                fungoval pro tebe stejně jako pro nás.
              </p>
              <p>
                Garantujeme transparentní proces, pojištění během transportu, monitorovaný
                sklad a komunikaci v češtině. Když něco nejde, řekneme to rovnou — a najdeme
                řešení.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3 items-center text-sm">
              <a
                href="mailto:piecha.jan@gmail.com"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full font-bold transition-all hover:opacity-90"
                style={{ backgroundColor: "#1a1a2e", color: "#fff" }}
              >
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <path d="m22 6-10 7L2 6" />
                </svg>
                piecha.jan@gmail.com
              </a>
              <a
                href="tel:+420739045057"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full font-bold border border-[#E2E6F3] hover:border-[#1a1a2e] transition-all text-[#1a1a2e]"
              >
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                +420 739 045 057
              </a>
            </div>
          </div>

          {/* Right — provozní fakta */}
          <div>
            <div className="rounded-3xl p-8" style={{ backgroundColor: MALAGA_BRAND.colorTint }}>
              <div className="text-xs tracking-[0.18em] uppercase font-bold mb-5" style={{ color: accent }}>
                Provozní fakta
              </div>
              <ul className="space-y-4">
                {TRUST_FACTS.map((f) => (
                  <li key={f.text} className="flex gap-4 items-start">
                    <div className="text-2xl shrink-0 leading-none">{f.icon}</div>
                    <div className="text-[#1a1a2e] font-semibold leading-snug pt-0.5">{f.text}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
