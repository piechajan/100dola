import Image from "next/image";
import { MALAGA_BRAND, WHY_OWN_BIKE } from "@/data/malaga";

const accent = MALAGA_BRAND.color;

export default function MalagaWhyOwnBike() {
  return (
    <section className="py-20 md:py-28" style={{ backgroundColor: MALAGA_BRAND.colorTint }}>
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Photo */}
          <div className="relative h-[420px] md:h-[520px] rounded-3xl overflow-hidden order-2 lg:order-1">
            <Image
              src="/media/sport-hero.jpg"
              alt="Vlastní kolo, vlastní setup"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-[35%_25%]"
            />
          </div>

          {/* Body */}
          <div className="order-1 lg:order-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-5 h-px" style={{ backgroundColor: accent }} />
              <span className="text-xs tracking-[0.18em] uppercase font-bold" style={{ color: accent }}>
                Vlastní kolo &gt; půjčovna
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-[#1a1a2e] leading-[0.95] mb-4">
              Proč vlastní kolo<br />místo půjčovny.
            </h2>
            <p className="text-[#5A6480] text-lg leading-relaxed mb-8 max-w-md">
              Půjčovna je kompromis. My to řešíme jinak.
            </p>

            <div className="space-y-5">
              {WHY_OWN_BIKE.map((item) => (
                <div key={item.title} className="flex gap-4">
                  <div
                    className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center mt-0.5"
                    style={{ backgroundColor: accent }}
                  >
                    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={3}>
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-black text-[#1a1a2e] mb-1">{item.title}</div>
                    <div className="text-sm text-[#5A6480] leading-relaxed">{item.body}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
