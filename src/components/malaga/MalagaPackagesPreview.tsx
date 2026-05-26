import Link from "next/link";
import { MALAGA_BRAND, PACKAGES, GROUP_NOTE } from "@/data/malaga";

const accent = MALAGA_BRAND.color;

export default function MalagaPackagesPreview() {
  return (
    <section className="py-20 md:py-28 bg-[#FAFAFC]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
        <div className="max-w-2xl mb-14">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-5 h-px" style={{ backgroundColor: accent }} />
            <span className="text-xs tracking-[0.18em] uppercase font-bold" style={{ color: accent }}>
              Balíčky
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-[#1a1a2e] leading-[0.95]">
            Vyber si, kolik<br />servisu chceš.
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {PACKAGES.map((p) => {
            const isExclusive = p.id === "exclusive";
            return (
              <div
                key={p.id}
                className={`relative rounded-3xl p-8 md:p-10 transition-all ${
                  isExclusive
                    ? "border-2 text-white"
                    : "border border-[#E2E6F3] bg-white"
                }`}
                style={
                  isExclusive
                    ? { backgroundColor: "#1a1a2e", borderColor: accent }
                    : undefined
                }
              >
                {p.popular && (
                  <div
                    className="absolute -top-3 right-8 text-[10px] tracking-[0.2em] uppercase font-black px-3 py-1.5 rounded-full"
                    style={{ backgroundColor: accent, color: "#fff" }}
                  >
                    Doporučeno
                  </div>
                )}

                <div
                  className={`text-xs tracking-[0.18em] uppercase font-bold mb-3 ${
                    isExclusive ? "" : "text-[#9AA3C2]"
                  }`}
                  style={isExclusive ? { color: accent } : undefined}
                >
                  Balíček {p.name}
                </div>

                <div className={`text-3xl md:text-4xl font-black mb-2 ${isExclusive ? "text-white" : "text-[#1a1a2e]"}`}>
                  od {p.priceFromEur.toLocaleString("cs-CZ")} €
                </div>
                <div
                  className="text-xs font-semibold mb-4 inline-block px-2.5 py-1 rounded-full"
                  style={
                    isExclusive
                      ? { backgroundColor: `${accent}25`, color: accent }
                      : { backgroundColor: `${accent}12`, color: accent }
                  }
                >
                  E-bike od {p.priceEbikeFromEur.toLocaleString("cs-CZ")} €
                </div>
                <p className={`text-sm leading-relaxed mb-7 ${isExclusive ? "text-white/65" : "text-[#5A6480]"}`}>
                  {p.tagline}
                </p>

                <div className={`text-xs tracking-wide uppercase font-bold mb-3 ${isExclusive ? "text-white/45" : "text-[#9AA3C2]"}`}>
                  Co je v balíčku
                </div>
                <ul className="space-y-2.5 mb-6">
                  {p.whatsIncluded.map((item) => (
                    <li key={item} className="flex gap-3 items-start">
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={accent} strokeWidth={2.5} className="mt-0.5 shrink-0">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                      <span className={`text-sm ${isExclusive ? "text-white/85" : "text-[#1a1a2e]"}`}>{item}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/malaga/balicky#${p.id}`}
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-full transition-all hover:gap-3"
                  style={
                    isExclusive
                      ? { backgroundColor: accent, color: "#fff" }
                      : { backgroundColor: "#1a1a2e", color: "#fff" }
                  }
                >
                  Vybrat {p.name}
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            );
          })}
        </div>

        {/* Footnote on group + final price */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="text-sm text-[#5A6480] leading-relaxed rounded-2xl p-5 bg-white border border-[#E2E6F3]">
            <span className="font-bold text-[#1a1a2e]">Konečnou cenu</span> stanovíme podle termínu, počtu kol a způsobu předání.
            Pošleme nabídku do 48 hodin po vyplnění poptávky.
          </div>
          <div className="text-sm text-[#5A6480] leading-relaxed rounded-2xl p-5 bg-white border border-[#E2E6F3]">
            <span className="font-bold text-[#1a1a2e]">Skupina nebo klub?</span> {GROUP_NOTE}
          </div>
        </div>
      </div>
    </section>
  );
}
