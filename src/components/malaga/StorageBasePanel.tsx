import Link from "next/link";
import { MALAGA_BRAND, STORAGE_PRICES, MALAGA_FACTS } from "@/data/malaga";

const accent = MALAGA_BRAND.color;

/**
 * Samostatný panel „Uskladnění kola u nás na základně v Malaze“.
 * Sdílený: /malaga/balicky i blok balíčků na /malaga. Cena, sezóna a vzdálenost
 * od letiště se berou z data/malaga.ts (jeden zdroj pravdy).
 */
export default function StorageBasePanel({ ctaHref = "#poptavka" }: { ctaHref?: string }) {
  return (
    <div className="rounded-3xl border border-[#E2E6F3] bg-[#FAFAFC] p-7 md:p-10 grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-8 items-center">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-5 h-px" style={{ backgroundColor: accent }} />
          <span className="text-xs tracking-[0.18em] uppercase font-bold" style={{ color: accent }}>
            Uskladnění
          </span>
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-[#1a1a2e] leading-tight">
          Uskladnění kola u nás na základně v Malaze
        </h2>
        <p className="mt-3 text-[#5A6480] leading-relaxed max-w-xl">
          Kolo čeká na naší základně, jen {MALAGA_FACTS.baseAirportMinutes} minut od letiště.
          Přiletíš, vyzvedneš si ho a jedeš. Po domluvě ti ho dovezeme na tvé ubytování i zpět na základnu. {STORAGE_PRICES[0].note}
        </p>
        <div className="mt-5 text-sm font-bold text-[#1a1a2e]">
          K dispozici je kompletní zázemí:
        </div>
        <ul className="mt-2 grid grid-cols-2 gap-x-6 gap-y-2 max-w-md text-sm text-[#1a1a2e]">
          {["Káva", "Nářadí", "Šatna", "Sprcha", "Chill zóna"].map((t) => (
            <li key={t} className="flex items-center gap-2">
              <span style={{ color: accent }} aria-hidden>✓</span>
              {t}
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-2xl bg-white border border-[#E2E6F3] p-6 text-center lg:text-left">
        <div className="text-xs font-bold uppercase tracking-wider text-[#9AA3C2]">Uskladnění kola</div>
        <div className="mt-1 text-4xl font-black text-[#1a1a2e]">
          {STORAGE_PRICES[0].priceFromEur} €{" "}
          <span className="text-base font-bold text-[#9AA3C2]">/ měsíc</span>
        </div>
        <p className="mt-2 text-sm text-[#5A6480]">
          Na celou sezónu ({MALAGA_FACTS.seasonLabel}) od {STORAGE_PRICES[1].priceFromEur} €.
        </p>
        <div className="mt-4 flex flex-col sm:flex-row lg:flex-col gap-2">
          <Link
            href={ctaHref}
            className="inline-flex items-center justify-center px-6 py-3 rounded-full text-white text-sm font-bold hover:opacity-90 transition"
            style={{ backgroundColor: accent }}
          >
            Poptat uskladnění
          </Link>
          <Link
            href="/malaga/uskladneni"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-[#1a1a2e] text-[#1a1a2e] text-sm font-bold hover:bg-white transition"
          >
            Více o základně
          </Link>
        </div>
      </div>
    </div>
  );
}
