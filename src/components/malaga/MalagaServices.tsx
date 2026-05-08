import Image from "next/image";
import Link from "next/link";
import { MALAGA_BRAND } from "@/data/malaga";

const accent = MALAGA_BRAND.color;

interface ServiceCard {
  tag: string;
  title: string;
  desc: string;
  href: string;
  photo: string;
  photoCrop?: string;
}

const services: ServiceCard[] = [
  {
    tag: "Doprava",
    title: "Z Česka do Malagy",
    desc: "One-way nebo round-trip. Pojištěné, sdílené v transportním boxu, plánované po blocích.",
    href: "/malaga/preprava",
    photo: "/media/malaga-event.jpg",
    photoCrop: "object-[50%_50%]",
  },
  {
    tag: "Skladování",
    title: "Tvoje kolo čeká přes celou sezónu",
    desc: "Měsíčně bez závazku, nebo celá sezóna říjen–květen za 449 €.",
    href: "/malaga/uskladneni",
    photo: "/media/malaga-hero.jpg",
    photoCrop: "object-[40%_55%]",
  },
  {
    tag: "Balíčky",
    title: "Basic nebo Exclusive",
    desc: "Vyber si, kolik servisu chceš. Od 849 € (Basic) až po 1 349 € (Exclusive — sedneš a jedeš).",
    href: "/malaga/balicky",
    photo: "/media/sport-hero.jpg",
    photoCrop: "object-[35%_30%]",
  },
];

export default function MalagaServices() {
  return (
    <section className="py-20 md:py-28 bg-[#FAFAFC]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
        <div className="max-w-2xl mb-14">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-5 h-px" style={{ backgroundColor: accent }} />
            <span className="text-xs tracking-[0.18em] uppercase font-bold" style={{ color: accent }}>
              Co u nás najdeš
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-[#1a1a2e] leading-[0.95]">
            Tři věci, kvůli kterým<br />s námi cyklisté jezdí.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {services.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="group relative overflow-hidden rounded-3xl bg-white border border-[#E2E6F3] hover:border-transparent transition-all"
              style={{ minHeight: 460 }}
            >
              {/* Photo */}
              <div className="relative h-56 overflow-hidden">
                <Image
                  src={s.photo}
                  alt={s.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className={`object-cover transition-transform duration-500 group-hover:scale-105 ${s.photoCrop ?? ""}`}
                />
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 50%)" }}
                />
                <div
                  className="absolute top-4 left-4 text-[10px] tracking-[0.18em] uppercase font-bold px-3 py-1.5 rounded-full"
                  style={{ backgroundColor: accent, color: "#fff" }}
                >
                  {s.tag}
                </div>
              </div>

              {/* Body */}
              <div className="p-7">
                <div className="text-2xl font-black text-[#1a1a2e] leading-tight mb-3">{s.title}</div>
                <p className="text-sm text-[#5A6480] leading-relaxed mb-6">{s.desc}</p>
                <div className="flex items-center gap-2 text-sm font-bold transition-all group-hover:gap-3" style={{ color: accent }}>
                  Detail
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
