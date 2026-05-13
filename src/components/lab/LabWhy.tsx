import { LAB_BRAND, LAB_WHY } from "@/data/lab";

const accent = LAB_BRAND.color;
const brass = LAB_BRAND.brass;

export default function LabWhy() {
  return (
    <section className="bg-[#0F1A14] text-white py-20 md:py-28">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12 lg:px-20">
        <div className="max-w-3xl mb-14">
          <div className="text-xs tracking-[0.22em] uppercase font-bold mb-3" style={{ color: brass }}>
            Důslednost před rychlostí
          </div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-[1.1]">
            {LAB_WHY.title}
          </h2>
          <div className="mt-6 w-12 h-px" style={{ backgroundColor: brass }} />
          <p className="mt-5 text-lg text-white/65 leading-relaxed">
            {LAB_WHY.lead}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {LAB_WHY.pillars.map((p) => (
            <div
              key={p.title}
              className="rounded-2xl p-7 border border-white/10 bg-white/[0.03] hover:bg-white/[0.05] transition-colors"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: brass }} />
                <span className="w-6 h-px" style={{ backgroundColor: brass }} />
              </div>
              <h3 className="text-xl font-black mb-2">{p.title}</h3>
              <p className="text-sm text-white/70 leading-relaxed">{p.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
