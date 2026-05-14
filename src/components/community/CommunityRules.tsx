import { COMMUNITY_RULES } from "@/data/community-rules";

export default function CommunityRules() {
  return (
    <section className="bg-white py-20 md:py-24">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12 lg:px-20">

        <div className="mb-12 max-w-2xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-5 h-px bg-[#2EAA6E]" />
            <span className="text-xs tracking-[0.18em] uppercase font-bold text-[#2EAA6E]">Jak jezdíme</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-[#1a1a2e] tracking-tight leading-[1.1]">
            Pravidla v balíku.
          </h2>
          <p className="mt-5 text-base text-[#5A6480] leading-relaxed">
            Sedm věcí, na kterých stojí plynulá a bezpečná skupinová jízda. Není to byrokracie — je to ohled na všechny okolo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {COMMUNITY_RULES.map((rule) => (
            <article
              key={rule.n}
              className="rounded-2xl border border-[#E2E6F3] bg-white p-6 hover:border-[#2EAA6E]/40 transition-colors"
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black text-white"
                  style={{ backgroundColor: "#2EAA6E" }}
                >
                  {rule.n}
                </div>
                <h3 className="text-lg font-black text-[#1a1a2e] leading-tight">
                  {rule.title}
                </h3>
              </div>
              <p className="text-sm text-[#5A6480] leading-relaxed">{rule.desc}</p>
            </article>
          ))}
        </div>

        <p className="mt-10 text-sm text-[#9AA3C2] text-center max-w-2xl mx-auto">
          Pravidla nejsou zákony, ale dohoda, která drží skupinu pohromadě. Kdo jezdí poprvé, zeptá se před startem — vždycky všechno ukážeme v praxi.
        </p>
      </div>
    </section>
  );
}
