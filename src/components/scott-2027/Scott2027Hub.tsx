import Link from "next/link";
import Image from "next/image";
import { SCOTT_2027, statusLabel, type LaunchStatus, type Platform } from "@/data/scott-2027";

const PLATFORM_LABEL: Record<Platform, string> = {
  mtb: "MTB",
  road: "Silniční",
  gravel: "Gravel",
};

const STATUS_CLASS: Record<LaunchStatus, string> = {
  launched: "bg-[#FFD23F] text-[#1a1a2e]",
  carryover: "bg-[#E2E6F3] text-[#1a1a2e]",
  redesign_expected: "bg-[#FFE5CC] text-[#7C3500]",
};

export default function Scott2027Hub() {
  const sections: { key: Platform; title: string; subtitle: string }[] = [
    { key: "mtb", title: "MTB", subtitle: "Závodní XC platformy Spark a Scale" },
    { key: "road", title: "Silnice", subtitle: "Endurance Addict a aero Addict RC" },
    { key: "gravel", title: "Gravel", subtitle: "Addict Gravel — současná i očekávaná verze" },
  ];

  return (
    <article className="max-w-[1080px] mx-auto px-4 md:px-6 pt-16 pb-24">
      <div className="mb-10 md:mb-14">
        <div className="text-xs font-bold uppercase tracking-wider text-[#3B7CF4] mb-2">
          Scott 2027 lineup
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-[#1a1a2e] mb-4 leading-tight">
          Co Scott chystá pro rok 2027
        </h1>
        <p className="text-base md:text-lg text-[#5A6480] leading-relaxed max-w-[720px]">
          Pět modelových řad rozdělených na MTB, silnici a gravel. K červnu 2026 je oficiálně
          launched jen <strong>Spark RC</strong> — zbytek lineupu pokračuje do modelového roku 2027
          z předchozích generací nebo na redesign teprve čekáme. Tady je honest přehled, ne
          marketing pumpa.
        </p>
      </div>

      {sections.map((s) => {
        const items = SCOTT_2027.filter((p) => p.platform === s.key);
        if (items.length === 0) return null;
        return (
          <section key={s.key} className="mb-14">
            <div className="flex items-end justify-between mb-6 border-b border-[#E2E6F3] pb-3">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-[#5A6480]">
                  {PLATFORM_LABEL[s.key]}
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e]">{s.title}</h2>
              </div>
              <span className="text-xs text-[#5A6480] hidden md:block">{s.subtitle}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {items.map((p) => (
                <Link
                  key={p.slug}
                  href={`/clanky/scott-2027/${p.slug}`}
                  className="block bg-white border border-[#E2E6F3] rounded-2xl overflow-hidden hover:shadow-lg transition group"
                >
                  <div className="relative aspect-[4/3] bg-gradient-to-br from-[#EAF1FE] via-[#F7F9FF] to-[#FFFFFF]">
                    <Image
                      src={p.variants[0]?.photo ?? "/media/scott-2027/spark-rc-sl.webp"}
                      alt={p.name}
                      fill
                      sizes="(min-width: 768px) 50vw, 100vw"
                      className="object-contain p-6 md:p-8 group-hover:scale-105 transition-transform"
                    />
                    <span
                      className={`absolute top-3 left-3 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md ${STATUS_CLASS[p.status]}`}
                    >
                      {statusLabel(p.status)}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-black text-[#1a1a2e] mb-1">{p.name}</h3>
                    <p className="text-sm text-[#5A6480] mb-3 leading-snug">{p.tagline}</p>
                    <div className="text-xs text-[#3B7CF4] font-bold flex items-center gap-1">
                      Detail platformy
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}

      <div className="bg-gradient-to-br from-[#EAF1FE] via-white to-[#F7F9FF] border border-[#C9DCFC] rounded-2xl p-6 md:p-8 mt-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
          <div className="flex-1">
            <div className="text-xs font-bold uppercase tracking-wider text-[#3B7CF4] mb-1">
              Rozhodovací pomůcka
            </div>
            <h2 className="text-xl md:text-2xl font-black text-[#1a1a2e] mb-1">
              Srovnání dvou modelů vedle sebe
            </h2>
            <p className="text-sm text-[#5A6480] leading-snug max-w-[520px]">
              Vyber dva libovolné Scott modely a porovnej groupset, kola, brzdy, váhu, cenu na
              jedné stránce. Plus doporučená srovnání pro nejčastější rozhodnutí.
            </p>
          </div>
          <Link
            href="/clanky/scott-2027/srovnani"
            className="bg-[#3B7CF4] hover:bg-[#5C92F6] text-white font-bold text-sm px-5 py-3 rounded-xl transition whitespace-nowrap text-center"
          >
            Otevřít srovnání →
          </Link>
        </div>
      </div>

      <div className="bg-[#1a1a2e] text-white rounded-2xl p-8 mt-12">
        <h2 className="text-xl md:text-2xl font-black mb-2">Chceš konkrétní model?</h2>
        <p className="text-sm text-white/70 mb-4 max-w-[640px]">
          Scott 2027 lineup zatím nemáme v e-shopu — alokace od distributora teprve řešíme. Pošli
          nám poptávku přes formulář na detailu platformy, telefonicky nebo mailem a domluvíme se
          na konkrétní variantě, ceně v Kč a termínu.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href="tel:+420739045057"
            className="bg-[#3B7CF4] hover:bg-[#5C92F6] text-white font-bold text-sm px-5 py-3 rounded-xl transition text-center"
          >
            +420 739 045 057
          </a>
          <a
            href="mailto:piecha.jan@gmail.com"
            className="bg-white/10 hover:bg-white/20 text-white font-bold text-sm px-5 py-3 rounded-xl transition text-center"
          >
            piecha.jan@gmail.com
          </a>
        </div>
      </div>
    </article>
  );
}
