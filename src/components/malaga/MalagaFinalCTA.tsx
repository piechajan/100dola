import Image from "next/image";
import { MALAGA_BRAND, FINAL_CTA_COPY } from "@/data/malaga";
import MalagaLeadForm from "./MalagaLeadForm";

const accent = MALAGA_BRAND.color;

export default function MalagaFinalCTA() {
  return (
    <section id="poptavka" className="relative py-20 md:py-28 bg-[#1a0e08] overflow-hidden">
      {/* Background photo */}
      <Image
        src="/media/malaga-event.jpg"
        alt="Malaga ride"
        fill
        sizes="100vw"
        quality={85}
        className="object-cover opacity-30"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(20,10,5,0.92) 0%, rgba(20,10,5,0.85) 100%)",
        }}
      />

      <div className="relative max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-12 lg:gap-16 items-center">
          {/* Left — pitch */}
          <div className="text-white">
            <div className="flex items-center gap-2 mb-5">
              <span className="w-5 h-px" style={{ backgroundColor: accent }} />
              <span className="text-xs tracking-[0.22em] uppercase font-bold" style={{ color: accent }}>
                Poptávka
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[0.95] mb-5">
              {FINAL_CTA_COPY.h2}
            </h2>
            <p className="text-white/70 text-lg leading-relaxed max-w-md mb-8">
              {FINAL_CTA_COPY.body}
            </p>
            <div className="text-sm text-white/60 space-y-2">
              <div>
                <span className="text-white/40">E-mail · </span>
                <a href={`mailto:${FINAL_CTA_COPY.email}`} className="hover:text-white" style={{ color: accent }}>
                  {FINAL_CTA_COPY.email}
                </a>
              </div>
              <div>
                <span className="text-white/40">Telefon · </span>
                <a href={`tel:${FINAL_CTA_COPY.phone.replace(/\s/g, "")}`} className="hover:text-white" style={{ color: accent }}>
                  {FINAL_CTA_COPY.phone}
                </a>
              </div>
            </div>
          </div>

          {/* Right — form */}
          <div>
            <MalagaLeadForm />
          </div>
        </div>
      </div>
    </section>
  );
}
