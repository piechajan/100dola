import Link from "next/link";
import Image from "next/image";
import BikeInquiryForm from "./BikeInquiryForm";
import { eurToCzk, statusLabel, type Scott2027Platform } from "@/data/scott-2027";

const STATUS_NOTE: Record<Scott2027Platform["status"], string> = {
  launched:
    "Modelová řada byla Scottem oficiálně představena pro rok 2027. Specifikace, váhy a ceny v EUR jsou autoritativní.",
  carryover:
    "Současná generace pokračuje i do modelového roku 2027 — Scott v letošní vlně nezveřejnil redesign. Pokud chceš počkat na další generaci, dej vědět, ozveme se až přijde.",
  redesign_expected:
    "Redesign této platformy očekáváme od Scottu v nadcházejících měsících. Současná verze je v prodeji a níže ji popisujeme — pokud chceš up-to-date info na nové generaci, dej vědět.",
};

export default function ScottPlatformPage({ platform }: { platform: Scott2027Platform }) {
  const main = platform.variants[0];
  const platformLabel =
    platform.platform === "mtb" ? "MTB" : platform.platform === "road" ? "Silnice" : "Gravel";

  return (
    <article className="max-w-[1080px] mx-auto px-4 md:px-6 pt-16 pb-24">
      <nav className="text-xs text-[#5A6480] mb-6">
        <Link href="/clanky" className="hover:text-[#3B7CF4]">
          Magazín
        </Link>
        {" / "}
        <Link href="/clanky/scott-2027" className="hover:text-[#3B7CF4]">
          Scott 2027 lineup
        </Link>
        {" / "}
        <span>{platformLabel}</span>
      </nav>

      <div className="mb-8 md:mb-12">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#3B7CF4]">
            {platformLabel}
          </span>
          <span className="text-xs font-black uppercase tracking-wider bg-[#FFD23F] text-[#1a1a2e] px-2 py-1 rounded-md">
            {statusLabel(platform.status)}
          </span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-[#1a1a2e] mb-3 leading-tight">
          {platform.name}{" "}
          <span className="text-[#5A6480] font-normal">2027</span>
        </h1>
        <p className="text-base md:text-lg text-[#5A6480] leading-relaxed max-w-[760px]">
          {platform.tagline}
        </p>
      </div>

      {main && (
        <div className="relative aspect-[16/9] bg-gradient-to-br from-[#EAF1FE] via-[#F7F9FF] to-[#FFFFFF] rounded-2xl overflow-hidden mb-10">
          <Image
            src={main.photo}
            alt={`${platform.name} ${main.name}`}
            fill
            sizes="(min-width: 1024px) 1080px, 100vw"
            className="object-contain p-8 md:p-12"
            priority
          />
        </div>
      )}

      <div className="bg-[#F7F9FF] border border-[#E2E6F3] rounded-2xl p-6 mb-10">
        <div className="text-xs font-bold uppercase tracking-wider text-[#5A6480] mb-2">
          Honest status
        </div>
        <p className="text-sm text-[#1a1a2e] leading-relaxed">{STATUS_NOTE[platform.status]}</p>
      </div>

      <section className="mb-12">
        <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-3">Co je nové</h2>
        <p className="text-base text-[#1a1a2e] leading-relaxed mb-6">{platform.claim}</p>
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#5A6480] mb-3">
          Klíčové technologie
        </h3>
        <ul className="space-y-2 mb-6">
          {platform.techHighlights.map((t) => (
            <li key={t} className="flex gap-2 text-sm md:text-base text-[#1a1a2e] leading-snug">
              <span className="text-[#3B7CF4] font-black flex-shrink-0">•</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#5A6480] mb-2">Rám</h3>
        <p className="text-sm text-[#1a1a2e] mb-4 leading-snug">{platform.frame}</p>
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#5A6480] mb-2">
          Geometrie / pro koho
        </h3>
        <p className="text-sm text-[#1a1a2e] leading-snug">{platform.geometry}</p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-1">Modelová řada</h2>
        <p className="text-sm text-[#5A6480] mb-6">
          Varianty od top-tier dolů. Ceny v EUR jsou orientační — finální Kč potvrdíme po poptávce
          podle aktuálního kurzu a alokace.
        </p>

        <div className="space-y-4">
          {platform.variants.map((v) => (
            <Link
              key={v.slug}
              href={`/clanky/scott-2027/${platform.slug}/${v.slug}`}
              className="bg-white border border-[#E2E6F3] rounded-2xl overflow-hidden md:flex hover:shadow-lg hover:border-[#C9DCFC] transition group"
            >
              <div className="relative md:w-[260px] aspect-square md:aspect-auto bg-gradient-to-br from-[#EAF1FE] via-[#F7F9FF] to-[#FFFFFF] flex-shrink-0">
                <Image
                  src={v.photo}
                  alt={v.name}
                  fill
                  sizes="(min-width: 768px) 260px, 100vw"
                  className="object-contain p-5 group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="p-5 flex-1">
                <h3 className="text-xl font-black text-[#1a1a2e] mb-2 group-hover:text-[#3B7CF4] transition-colors">
                  {v.name}
                </h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm text-[#1a1a2e] mb-3">
                  <dt className="text-[#5A6480]">Groupset:</dt>
                  <dd className="font-semibold">{v.groupset}</dd>
                  <dt className="text-[#5A6480]">Kola:</dt>
                  <dd className="font-semibold">{v.wheels}</dd>
                  {v.fork && (
                    <>
                      <dt className="text-[#5A6480]">Vidlice:</dt>
                      <dd className="font-semibold">{v.fork}</dd>
                    </>
                  )}
                  {v.weightKg !== null && (
                    <>
                      <dt className="text-[#5A6480]">Váha:</dt>
                      <dd className="font-semibold">{v.weightKg.toFixed(1)} kg</dd>
                    </>
                  )}
                  <dt className="text-[#5A6480]">Velikosti:</dt>
                  <dd className="font-semibold">{v.sizes.join(" / ")}</dd>
                </dl>
                {v.colors.length > 0 && (
                  <div className="text-xs text-[#5A6480] mb-3">
                    <strong className="text-[#1a1a2e]">Barvy:</strong> {v.colors.join(", ")}
                  </div>
                )}
                <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#E2E6F3]">
                  <div>
                    <div className="text-xs text-[#5A6480]">Orientačně</div>
                    <div className="text-lg font-black text-[#1a1a2e]">{eurToCzk(v.priceEur)}</div>
                    {v.priceEur && (
                      <div className="text-[11px] text-[#5A6480]">€ {v.priceEur.toLocaleString("cs-CZ")} MSRP</div>
                    )}
                  </div>
                  <span className="text-sm font-bold text-[#3B7CF4] group-hover:translate-x-1 transition-transform whitespace-nowrap">
                    Detail + galerie →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-3">Mám zájem</h2>
        <p className="text-sm text-[#5A6480] mb-6">
          Vyber konkrétní variantu nebo nech volný formulář — domluvíme se na detailech.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <BikeInquiryForm bikeModel={platform.name} />
          <div className="bg-[#EAF1FE] border border-[#C9DCFC] rounded-2xl p-6">
            <h3 className="text-base font-black text-[#1a1a2e] mb-3">Proč přes nás</h3>
            <ul className="space-y-2 text-sm text-[#1a1a2e]">
              <li className="flex gap-2">
                <span className="text-[#3B7CF4] font-black">✓</span>
                Servis a bikefit přímo u nás ve Šternberku
              </li>
              <li className="flex gap-2">
                <span className="text-[#3B7CF4] font-black">✓</span>
                Osobní převzetí — kolo si můžeš vyzkoušet před převzetím
              </li>
              <li className="flex gap-2">
                <span className="text-[#3B7CF4] font-black">✓</span>
                Doprava do Malagy: kolo posíláme rovnou, ty letíš s příručákem
              </li>
              <li className="flex gap-2">
                <span className="text-[#3B7CF4] font-black">✓</span>
                Voskování řetězu, Lab detailing, keramická ložiska
              </li>
            </ul>
          </div>
        </div>
        {platform.variants.map((v) => (
          <div key={v.slug} id={`inquiry-${v.slug}`} className="mt-8">
            <BikeInquiryForm bikeModel={platform.name} bikeVariant={v.name} />
          </div>
        ))}
      </section>

      <div className="bg-[#1a1a2e] text-white rounded-2xl p-6 mt-12 flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-[#7AA3FF] mb-1">
            Zpět na přehled
          </div>
          <div className="font-black">Scott 2027 lineup — všech 5 platforem</div>
        </div>
        <Link
          href="/clanky/scott-2027"
          className="bg-[#3B7CF4] hover:bg-[#5C92F6] text-white font-bold text-sm px-5 py-2.5 rounded-xl transition"
        >
          Přehled →
        </Link>
      </div>
    </article>
  );
}
