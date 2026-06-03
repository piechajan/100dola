"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

const pillars = [
  {
    tag: "100dola sport · Šternberk & okolí",
    headline: "Vybav se\nna sezónu.",
    description: "Prodejna Šternberk + showroom Valašské Meziříčí. Doručujeme po celé ČR. Složené kolo osobně do Vsetína, Olomouce, Ostravy (i jinam po domluvě).",
    cta: "Do shopu",
    href: "/shop",
    accentColor: "#3B7CF4",
    photo: "/media/sport-hero.jpg",
    photoCrop: "object-[35%_20%]",
    overlayColor: "rgba(20,30,60,0.48)",
    instagram: "https://www.instagram.com/100dolasport.cz/",
  },
  {
    tag: "100dola malaga",
    headline: "Kolo tam\npošleme.",
    description: "Přeprava a uskladnění kol v Malaze. Přiletíš jen s příručákem a jedeš.",
    cta: "Jak to funguje",
    href: "/malaga",
    accentColor: "#E8431A",
    photo: "/media/malaga-event.jpg",
    photoCrop: "object-[50%_50%]",
    overlayColor: "rgba(40,15,5,0.50)",
    instagram: "https://www.instagram.com/100dola_malaga/",
  },
  {
    tag: "Open Miles Clinic",
    headline: "Jedeme\nspolu.",
    description: "Social rides, eventy a komunita. Cyklistika, skialpy, běh, turistika. Sportem to nekončí.",
    cta: "Nadcházející eventy",
    href: "/community",
    accentColor: "#2EAA6E",
    photo: "/media/omc-hero-panel.jpg",
    photoCrop: "object-[50%_45%]",
    overlayColor: "rgba(10,30,20,0.48)",
    instagram: "https://www.instagram.com/open_miles_clinic/",
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
  photoFit,
  panelBg,
  overlayColor,
  instagram,
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
  photoFit?: "cover" | "contain";
  panelBg?: string;
  overlayColor: string;
  instagram: string;
  index: number;
  isLast: boolean;
}) {
  const router = useRouter();
  return (
    <div
      role="link"
      tabIndex={0}
      onClick={() => router.push(href)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          router.push(href);
        }
      }}
      className="group relative flex flex-col justify-between overflow-hidden text-white flex-1 min-h-[380px] md:min-h-0 cursor-pointer"
      style={{
        borderRight: !isLast ? "1px solid rgba(255,255,255,0.08)" : undefined,
        flexBasis: "33.333%",
        backgroundColor: panelBg,
      }}
    >
      {/* SEO-friendly invisible link for crawlers */}
      <Link href={href} className="sr-only" aria-label={`${tag} — ${cta}`}>
        {cta}
      </Link>

      {/* Background photo */}
      <Image
        src={photo}
        alt={tag}
        fill
        quality={85}
        className={`${photoFit === "contain" ? "object-contain" : "object-cover"} transition-transform duration-700 group-hover:scale-105 ${photoCrop ?? ""}`}
        sizes="(max-width: 768px) 100vw, 33vw"
        priority={index <= 2}
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
            borderRadius: "9999px",
          }}
        >
          {tag}
        </div>

        {/* Instagram link top right */}
        <a
          href={instagram}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
          style={{ backgroundColor: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}
          aria-label={`${tag} na Instagramu`}
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
          </svg>
        </a>
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
    </div>
  );
}
