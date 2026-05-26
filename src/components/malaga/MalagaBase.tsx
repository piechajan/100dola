import { MALAGA_BRAND, MALAGA_FACTS } from "@/data/malaga";

const accent = MALAGA_BRAND.color;

const facts = [
  { icon: "✈", label: "Z Prahy", value: MALAGA_FACTS.flightTime },
  { icon: "📍", label: "Od letiště Malaga (AGP)", value: `${MALAGA_FACTS.baseAirportMinutes} minut` },
  { icon: "🌡", label: "Teploty v zimě", value: MALAGA_FACTS.winterTempRange },
  { icon: "☀", label: "Slunce", value: MALAGA_FACTS.sunnyDays },
  { icon: "🚲", label: "Tereny", value: "Road i gravel hned za rohem" },
  { icon: "☕", label: "Servis", value: "Kavárny, výhledy, klimy" },
];

export default function MalagaBase() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
        <div className="max-w-2xl mb-14">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-5 h-px" style={{ backgroundColor: accent }} />
            <span className="text-xs tracking-[0.18em] uppercase font-bold" style={{ color: accent }}>
              Destinace
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-[#1a1a2e] leading-[0.95]">
            Malaga jako tvoje<br />cyklistická základna.
          </h2>
          <p className="mt-5 text-[#5A6480] text-lg leading-relaxed max-w-xl">
            Z Prahy 2,5 hodiny letu. 10 minut od letiště do naší základny. A pak už jen
            silnice, výhledy a kafe.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Map placeholder — Andalusie */}
          <div
            className="relative h-[420px] rounded-3xl overflow-hidden"
            style={{ backgroundColor: MALAGA_BRAND.colorTint }}
          >
            {/* SVG simplified Andalusia map indicator */}
            <div className="absolute inset-0 flex items-center justify-center">
              <svg width="100%" height="100%" viewBox="0 0 400 400" className="opacity-30">
                <path
                  d="M50 200 Q100 150 180 160 Q260 170 320 200 Q360 240 340 290 Q280 320 200 310 Q120 300 70 270 Q40 240 50 200Z"
                  fill={accent}
                  fillOpacity="0.18"
                  stroke={accent}
                  strokeWidth="1.5"
                />
                {/* Pin: Malaga */}
                <circle cx="240" cy="260" r="9" fill={accent} />
                <circle cx="240" cy="260" r="20" fill={accent} fillOpacity="0.2">
                  <animate attributeName="r" from="20" to="32" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="fill-opacity" from="0.3" to="0" dur="2s" repeatCount="indefinite" />
                </circle>
                <text x="252" y="265" fontSize="14" fontWeight="700" fill="#1a1a2e">Malaga</text>
                {/* Pin: Sevilla */}
                <circle cx="120" cy="220" r="4" fill="#1a1a2e" fillOpacity="0.4" />
                <text x="130" y="224" fontSize="11" fill="#5A6480">Sevilla</text>
                {/* Pin: Granada */}
                <circle cx="250" cy="220" r="4" fill="#1a1a2e" fillOpacity="0.4" />
                <text x="260" y="224" fontSize="11" fill="#5A6480">Granada</text>
              </svg>
            </div>
            <div className="absolute bottom-6 left-6 right-6">
              <div className="text-xs tracking-[0.18em] uppercase font-bold mb-1" style={{ color: accent }}>
                Andalusie
              </div>
              <div className="text-2xl font-black text-[#1a1a2e] leading-tight">
                Costa del Sol & vnitrozemí
              </div>
              <div className="text-sm text-[#5A6480] mt-1">
                Pobřeží, hory, oliva, kafe.
              </div>
            </div>
          </div>

          {/* Facts grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {facts.map((f) => (
              <div
                key={f.label}
                className="rounded-2xl p-5 border border-[#E2E6F3] hover:border-[#E8431A] transition-colors"
              >
                <div className="text-2xl mb-3">{f.icon}</div>
                <div className="text-xs tracking-wide uppercase font-bold text-[#9AA3C2] mb-1">
                  {f.label}
                </div>
                <div className="text-base font-black text-[#1a1a2e]">{f.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
