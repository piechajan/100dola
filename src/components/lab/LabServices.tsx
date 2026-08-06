import Image from "next/image";
import { LAB_BRAND, LAB_SERVICES } from "@/data/lab";

const accent = LAB_BRAND.color;
const brassDark = LAB_BRAND.brassDark;

export default function LabServices() {
  return (
    <section id="sluzby" className="bg-[#F5F7FF] py-20 md:py-28">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
        <div className="max-w-2xl mb-14">
          <div className="text-xs tracking-[0.22em] uppercase font-bold mb-3" style={{ color: brassDark }}>
            Co Lab umí
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-[#1a1a2e] tracking-tight leading-[1.1]">
            Šest věcí. Vybíráš jen ty, co dávají smysl tvému kolu.
          </h2>
          <div className="mt-6 w-12 h-px" style={{ backgroundColor: brassDark }} />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {LAB_SERVICES.map((svc) => (
            <article
              key={svc.slug}
              className="bg-white rounded-3xl overflow-hidden border border-[#E2E6F3] hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              <div className="relative h-48 overflow-hidden bg-[#1F4937]">
                <Image
                  src={svc.image}
                  alt={svc.title}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  className="object-cover opacity-90"
                />
                <div className="absolute top-3 left-3">
                  <span
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase text-white"
                    style={{ backgroundColor: accent }}
                  >
                    {svc.label}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="text-[10px] tracking-[0.18em] uppercase font-bold mb-1.5" style={{ color: brassDark }}>
                  {svc.eyebrow}
                </div>
                <h3 className="text-xl font-black text-[#1a1a2e] mb-2 leading-tight">
                  {svc.title}
                </h3>
                <p className="text-sm text-[#5A6480] leading-relaxed mb-4">
                  {svc.description}
                </p>

                <ul className="space-y-1.5 mb-5">
                  {svc.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-xs text-[#5A6480]">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={accent}
                        strokeWidth={3}
                        className="mt-0.5 shrink-0"
                      >
                        <path d="M5 12l5 5L20 7" />
                      </svg>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-4" style={{ borderTop: `1px solid ${brassDark}30` }}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-[#1a1a2e]">{svc.priceFrom}</span>
                    <span className="text-[11px] text-[#9AA3C2]">Finální cena po diagnostice</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-10 text-sm text-[#9AA3C2] text-center max-w-2xl mx-auto">
          Ceny jsou orientační. Po prohlídce kola potvrdíme konkrétní rozsah a finální cenu — bez překvapení.
        </p>
      </div>
    </section>
  );
}
