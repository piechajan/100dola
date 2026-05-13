import { LAB_BRAND, LAB_PROCESS } from "@/data/lab";

const brassDark = LAB_BRAND.brassDark;

export default function LabProcess() {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12 lg:px-20">
        <div className="max-w-2xl mb-14">
          <div className="text-xs tracking-[0.22em] uppercase font-bold mb-3" style={{ color: brassDark }}>
            Proces
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-[#1a1a2e] tracking-tight leading-[1.1]">
            Čtyři kroky, žádné překvapení.
          </h2>
          <div className="mt-6 w-12 h-px" style={{ backgroundColor: brassDark }} />
        </div>

        <div className="grid md:grid-cols-4 gap-5">
          {LAB_PROCESS.map((s) => (
            <div key={s.step} className="relative">
              <div
                className="text-5xl font-black mb-3"
                style={{ color: brassDark, opacity: 0.55 }}
              >
                0{s.step}
              </div>
              <h3 className="text-lg font-black text-[#1a1a2e] mb-2 leading-tight">
                {s.title}
              </h3>
              <p className="text-sm text-[#5A6480] leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
