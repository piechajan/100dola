import Image from "next/image";
import Link from "next/link";

export default function CommunityHero() {
  return (
    <section className="relative overflow-hidden bg-[#0d1a10] text-white" style={{ minHeight: "70vh" }}>
      {/* Background photo */}
      <Image
        src="/media/community-hero-jedeme-spolu-9423.jpg"
        alt="Skupina cyklistů"
        fill
        sizes="100vw"
        className="object-cover opacity-65"
        style={{ transform: "scale(1.18) translateX(8%)" }}
        priority
      />

      {/* Gradient */}
      <div className="absolute inset-0" style={{
        background: "linear-gradient(to right, rgba(10,25,15,0.95) 0%, rgba(10,25,15,0.6) 60%, transparent 100%)"
      }} />

      <div className="relative max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20 flex flex-col justify-end pt-28 md:pt-32 pb-16 md:pb-24" style={{ minHeight: "70vh" }}>

        {/* Eyebrow */}
        <div className="flex items-center gap-3 mb-5">
          <Image
            src="/media/omc-logo.png"
            alt="Open Miles Clinic"
            width={48}
            height={48}
            className="rounded-xl"
          />
          <span className="text-xs tracking-[0.2em] uppercase font-bold text-[#2EAA6E]">
            Open Miles Clinic
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.93] max-w-3xl">
          Jedeme
          <br />
          <span style={{ color: "#2EAA6E" }}>spolu.</span>
        </h1>

        <p className="mt-6 text-lg text-white/60 max-w-lg leading-relaxed">
          Jsme sportovní komunita z Valašska. Ego necháváme doma
          a sdílíme víc než jen společné kilometry. Začínáme u kafe
          a sportem nekončíme.
        </p>

        {/* Sport badges */}
        <div className="mt-8 flex flex-wrap gap-2">
          {[
            { label: "Kolo", color: "#3B7CF4" },
            { label: "Gravel", color: "#E8431A" },
            { label: "MTB", color: "#2EAA6E" },
            { label: "Skialpy", color: "#7C5CBF" },
            { label: "Běžky", color: "#00A8CC" },
            { label: "Turistika", color: "#8B6E52" },
          ].map((sport) => (
            <span
              key={sport.label}
              className="text-xs font-bold px-3 py-1.5 rounded-full"
              style={{ backgroundColor: `${sport.color}25`, color: sport.color, border: `1px solid ${sport.color}40` }}
            >
              {sport.label}
            </span>
          ))}
        </div>

        {/* CTAs */}
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="#eventy"
            className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-bold text-white rounded-full transition-all hover:opacity-90"
            style={{ backgroundColor: "#2EAA6E", boxShadow: "0 4px 20px #2EAA6E40" }}
          >
            Nadcházející akce
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
          <Link
            href="#newsletter"
            className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-bold rounded-full border border-white/25 text-white/70 hover:border-white/50 hover:text-white transition-all"
          >
            Hlídat nové akce
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-14 flex gap-10">
          {[
            { value: "20+", label: "akcí za rok" },
            { value: "50+", label: "aktivních členů" },
            { value: "5", label: "typů aktivit" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-2xl font-black text-white">{s.value}</div>
              <div className="text-xs text-white/35 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
