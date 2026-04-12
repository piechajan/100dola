import Link from "next/link";
import Image from "next/image";

const pillars = [
  {
    tag: "100dola sport",
    headline: "Vybav se\nna sezónu.",
    description: "Kurátorský výběr kol, lyží a vybavení od lidí, kteří sport opravdu žijí.",
    cta: "Do shopu",
    href: "/shop",
    accentColor: "#3B7CF4",
    photo: "/media/sport-hero.jpg",
    photoCrop: "object-[45%_10%]",
    overlayColor: "rgba(20,30,60,0.48)",
  },
  {
    tag: "100dola malaga",
    headline: "Kolo tam\npošleme.",
    description: "Přeprava a uskladnění kola ve Španělsku. Přiletíš jen se spříručákem a jedeš.",
    cta: "Jak to funguje",
    href: "/malaga",
    accentColor: "#7C5CBF",
    photo: "/media/malaga-hero.jpg",
    photoCrop: "object-[40%_20%]",
    overlayColor: "rgba(30,15,50,0.42)",
  },
  {
    tag: "Open Miles Clinic",
    headline: "Jedeme\nspolu.",
    description: "Social rides, skupinové akce a komunita sportovců. Cyklistika, skialpy, běh.",
    cta: "Nadcházející eventy",
    href: "/community",
    accentColor: "#2EAA6E",
    photo: "/media/community-hero.jpg",
    photoCrop: "object-[30%_30%]",
    overlayColor: "rgba(10,30,20,0.48)",
  },
];

export default function Hero() {
  return (
    <section
      className="flex flex-col md:flex-row w-full"
      style={{ minHeight: "calc(100vh - 80px)", marginTop: 80 }}
    >
      {pillars.map((pillar, i) => (
        <PillarPanel
          key={pillar.tag}
          {...pillar}
          index={i}
          isLast={i === pillars.length - 1}
        />
      ))}
    </section>
  );
}

function PillarPanel({
  tag,
  headline,
  description,
  cta,
  href,
  accentColor,
  photo,
  photoCrop,
  overlayColor,
  index,
  isLast,
}: {
  tag: string;
  headline: string;
  description: string;
  cta: string;
  href: string;
  accentColor: string;
  photo: string;
  photoCrop?: string;
  overlayColor: string;
  index: number;
  isLast: boolean;
}) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col justify-between overflow-hidden text-white flex-1 min-h-[380px] md:min-h-0"
      style={{
        borderRight: !isLast ? "1px solid rgba(255,255,255,0.08)" : undefined,
        flexBasis: "33.333%",
      }}
    >
      {/* Background photo */}
      <Image
        src={photo}
        alt={tag}
        fill
        className={`object-cover transition-transform duration-700 group-hover:scale-105 ${photoCrop ?? ""}`}
        sizes="(max-width: 768px) 100vw, 33vw"
        priority={index === 0}
      />

      {/* Dark overlay */}
      <div
        className="absolute inset-0 transition-opacity duration-300 group-hover:opacity-80"
        style={{ backgroundColor: overlayColor }}
      />

      {/* Gradient bottom — čitelnost textu */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)",
        }}
      />

      {/* Top: tag */}
      <div className="relative p-8 md:p-10 lg:p-12 flex items-start justify-between">
        <div
          className="text-[10px] tracking-[0.2em] uppercase font-bold px-3 py-1.5 rounded-full backdrop-blur-sm"
          style={{
            backgroundColor: `${accentColor}30`,
            color: "white",
            border: `1px solid ${accentColor}60`,
          }}
        >
          {tag}
        </div>

        {/* Index number top right */}
        <div className="text-xs font-black text-white/20 tabular-nums">
          {String(index + 1).padStart(2, "0")}
        </div>
      </div>

      {/* Bottom: content */}
      <div className="relative p-8 md:p-10 lg:p-12 pt-0">
        {/* Accent line */}
        <div
          className="w-8 h-0.5 mb-5 rounded-full transition-all duration-300 group-hover:w-14"
          style={{ backgroundColor: accentColor }}
        />

        {/* Headline */}
        <h2 className="text-4xl sm:text-5xl md:text-4xl lg:text-5xl xl:text-6xl font-black leading-[0.92] tracking-tight mb-4 whitespace-pre-line text-white drop-shadow-lg">
          {headline}
        </h2>

        {/* Description */}
        <p className="text-sm md:text-base text-white/70 leading-relaxed mb-8 max-w-xs">
          {description}
        </p>

        {/* CTA */}
        <div
          className="inline-flex items-center gap-2.5 px-5 py-3 text-sm font-bold rounded-full text-white transition-all duration-200 group-hover:gap-4"
          style={{
            backgroundColor: accentColor,
            boxShadow: `0 4px 20px ${accentColor}50`,
          }}
        >
          {cta}
          <svg
            width="14"
            height="14"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
