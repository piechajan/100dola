import { LAB_INTRO } from "@/data/lab";

export default function LabIntro() {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="max-w-[1100px] mx-auto px-6 md:px-12">
        <h2 className="text-3xl md:text-5xl font-black text-[#1a1a2e] tracking-tight max-w-3xl leading-[1.1]">
          {LAB_INTRO.title}
        </h2>
        <p className="mt-6 text-lg text-[#5A6480] max-w-2xl leading-relaxed">
          {LAB_INTRO.lead}
        </p>

        <div className="mt-14 grid md:grid-cols-3 gap-6">
          {LAB_INTRO.pillars.map((p) => (
            <div
              key={p.title}
              className="rounded-2xl border border-[#E2E6F3] p-6 hover:border-[#1F4937]/40 transition-colors"
            >
              <div className="text-2xl mb-3">{p.icon}</div>
              <div className="text-base font-black text-[#1a1a2e] mb-2">{p.title}</div>
              <div className="text-sm text-[#5A6480] leading-relaxed">{p.text}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
