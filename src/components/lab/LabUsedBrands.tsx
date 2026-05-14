import { LAB_BRAND } from "@/data/lab";
import { LAB_BRANDS } from "@/data/lab-brands";

const brassDark = LAB_BRAND.brassDark;
const accent = LAB_BRAND.color;

export default function LabUsedBrands() {
  return (
    <section className="bg-white py-20 md:py-24">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12 lg:px-20">

        <div className="mb-12 max-w-2xl">
          <div className="text-xs tracking-[0.22em] uppercase font-bold mb-3" style={{ color: brassDark }}>
            Co používáme
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-[#1a1a2e] tracking-tight leading-[1.1]">
            Materiály první ligy.
          </h2>
          <div className="mt-6 w-12 h-px" style={{ backgroundColor: brassDark }} />
          <p className="mt-5 text-base text-[#5A6480] leading-relaxed">
            Žádný neznámý mix z neoznačených kanystrů. Pracujeme se značkami, které mají reálnou trvanlivost a dokumentaci. Pokud by ti nějaká chyběla, dej vědět — máme i alternativy podle preferencí.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {LAB_BRANDS.map((cat) => (
            <article
              key={cat.category}
              className="rounded-2xl border border-[#E2E6F3] bg-white p-6 hover:border-[#1F4937]/40 transition-colors"
            >
              <div className="text-[10px] tracking-[0.18em] uppercase font-bold mb-3" style={{ color: brassDark }}>
                {cat.categoryLabel}
              </div>
              <ul className="space-y-2.5">
                {cat.brands.map((b) => (
                  <li key={b.name} className="flex items-start gap-2">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: accent }} />
                    <div>
                      <div className="text-sm font-black text-[#1a1a2e] leading-tight">{b.name}</div>
                      {b.note && (
                        <div className="text-[11px] text-[#5A6480] leading-relaxed mt-0.5">{b.note}</div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <p className="mt-10 text-xs text-[#9AA3C2] text-center max-w-2xl mx-auto">
          Konkrétní volbu doporučíme podle stavu a kategorie kola — řekneme po prohlídce.
        </p>
      </div>
    </section>
  );
}
