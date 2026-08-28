"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { MalagaRouteV2 } from "@/data/malaga/routes/types";
import { TIER_LABEL, TIER_COLOR, FLAG_META } from "@/data/malaga/routes/types";

const accent = "#E8431A";

// Obtížnostní skupiny nad tiery (§4): lehká=T1, střední=T2, těžká=T3+T4.
type Diff = "vse" | "lehka" | "stredni" | "tezka";
const DIFF_TABS: { key: Diff; label: string }[] = [
  { key: "vse", label: "Vše" },
  { key: "lehka", label: "Lehká" },
  { key: "stredni", label: "Střední" },
  { key: "tezka", label: "Těžká" },
];
type RType = "vse" | "okruh" | "tam-zpet";
const TYPE_TABS: { key: RType; label: string }[] = [
  { key: "vse", label: "Vše" },
  { key: "okruh", label: "Okruh" },
  { key: "tam-zpet", label: "Tam a zpět" },
];

function matchesDiff(tier: number, d: Diff): boolean {
  if (d === "vse") return true;
  if (d === "lehka") return tier === 1;
  if (d === "stredni") return tier === 2;
  return tier >= 3;
}

function roundUp(n: number, step: number) {
  return Math.ceil(n / step) * step;
}

function FilterTabs<K extends string>({
  tabs,
  active,
  onSet,
  countFn,
}: {
  tabs: { key: K; label: string }[];
  active: K;
  onSet: (k: K) => void;
  countFn?: (k: K) => number;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((t) => {
        const on = active === t.key;
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => onSet(t.key)}
            className={`text-sm font-bold px-4 py-2 rounded-xl border transition-colors ${
              on ? "text-white border-transparent" : "bg-white text-[#5A6480] border-[#E2E6F3] hover:border-[#E8431A]"
            }`}
            style={on ? { backgroundColor: accent } : undefined}
          >
            {t.label}
            {countFn && (
              <span className={`ml-1.5 font-normal ${on ? "text-white/70" : "text-[#9AA3C2]"}`}>{countFn(t.key)}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default function TrasyFilter({ routes }: { routes: MalagaRouteV2[] }) {
  const bounds = useMemo(() => {
    const kmMax = roundUp(Math.max(...routes.map((r) => r.distance_km)), 10);
    const ascMax = roundUp(Math.max(...routes.map((r) => r.ascent_m)), 100);
    return { kmMax, ascMax };
  }, [routes]);

  const [diff, setDiff] = useState<Diff>("vse");
  const [rtype, setRtype] = useState<RType>("vse");
  const [maxKm, setMaxKm] = useState(bounds.kmMax);
  const [maxAsc, setMaxAsc] = useState(bounds.ascMax);

  const filtered = useMemo(
    () =>
      routes.filter(
        (r) =>
          matchesDiff(r.tier, diff) &&
          (rtype === "vse" || (rtype === "okruh" ? r.loop : !r.loop)) &&
          r.distance_km <= maxKm &&
          r.ascent_m <= maxAsc,
      ),
    [routes, diff, rtype, maxKm, maxAsc],
  );

  function reset() {
    setDiff("vse");
    setRtype("vse");
    setMaxKm(bounds.kmMax);
    setMaxAsc(bounds.ascMax);
  }
  const isDefault = diff === "vse" && rtype === "vse" && maxKm === bounds.kmMax && maxAsc === bounds.ascMax;

  return (
    <>
      {/* Filtr */}
      <div className="rounded-2xl border border-[#E2E6F3] bg-white p-5 mb-8 space-y-5">
        <div>
          <div className="text-[11px] uppercase tracking-wider font-bold text-[#9AA3C2] mb-2">Obtížnost</div>
          <FilterTabs
            tabs={DIFF_TABS}
            active={diff}
            onSet={setDiff}
            countFn={(k) => (k === "vse" ? routes.length : routes.filter((r) => matchesDiff(r.tier, k)).length)}
          />
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-wider font-bold text-[#9AA3C2] mb-2">Typ trasy</div>
          <FilterTabs tabs={TYPE_TABS} active={rtype} onSet={setRtype} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <label className="block">
            <span className="text-[11px] uppercase tracking-wider font-bold text-[#9AA3C2]">
              Vzdálenost do: <span className="text-[#1a1a2e]">{maxKm} km</span>
            </span>
            <input
              type="range"
              min={roundUp(Math.min(...routes.map((r) => r.distance_km)), 10) - 10}
              max={bounds.kmMax}
              step={10}
              value={maxKm}
              onChange={(e) => setMaxKm(Number(e.target.value))}
              className="w-full mt-2 accent-[#E8431A]"
            />
          </label>
          <label className="block">
            <span className="text-[11px] uppercase tracking-wider font-bold text-[#9AA3C2]">
              Převýšení do: <span className="text-[#1a1a2e]">{maxAsc} m</span>
            </span>
            <input
              type="range"
              min={0}
              max={bounds.ascMax}
              step={100}
              value={maxAsc}
              onChange={(e) => setMaxAsc(Number(e.target.value))}
              className="w-full mt-2 accent-[#E8431A]"
            />
          </label>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#5A6480]">
            <strong className="text-[#1a1a2e]">{filtered.length}</strong> {filtered.length === 1 ? "trasa" : filtered.length < 5 ? "trasy" : "tras"}
          </span>
          {!isDefault && (
            <button type="button" onClick={reset} className="text-sm font-bold text-[#3B7CF4] hover:underline">
              Zrušit filtr
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((r) => {
          const flags = FLAG_META.filter((f) => r.flags[f.key]);
          return (
            <Link
              key={r.slug}
              href={`/malaga/trasy/${r.slug}`}
              className="group rounded-3xl p-7 md:p-8 bg-white border border-[#E2E6F3] hover:border-[#E8431A] transition-colors flex flex-col"
            >
              <div className="flex items-center gap-2 flex-wrap mb-4">
                <span
                  className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full text-white"
                  style={{ backgroundColor: TIER_COLOR[r.tier] }}
                >
                  {TIER_LABEL[r.tier]} · DS {r.difficulty_score}
                </span>
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#F0F2FA] text-[#5A6480]">
                  {r.distance_km} km
                </span>
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#F0F2FA] text-[#5A6480]">
                  ↗ {r.ascent_m} m
                </span>
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#F0F2FA] text-[#5A6480]">
                  {r.loop ? "okruh" : "tam a zpět"}
                </span>
                {flags.map((f) => (
                  <span key={f.key} title={f.label} className="text-[11px] px-1.5 py-1 rounded-full bg-[#FFF1EA]">
                    {f.emoji}
                  </span>
                ))}
              </div>

              <h2 className="text-xl md:text-2xl font-black text-[#1a1a2e] leading-tight mb-3 group-hover:text-[#E8431A] transition-colors">
                {r.name_cs}
              </h2>
              <p className="text-sm text-[#5A6480] leading-relaxed mb-5 line-clamp-4">{r.story_cs}</p>

              <div className="mt-auto space-y-3">
                {r.cafes[0] && (
                  <div className="text-xs text-[#5A6480] pt-3 border-t border-[#F0F2FA]">
                    ☕ <span className="font-semibold text-[#1a1a2e]">Zastávka:</span> {r.cafes[0].name} ({r.cafes[0].town})
                  </div>
                )}
                <div className="text-xs text-[#9AA3C2] italic">Komu sedne: {r.who_it_suits_cs}</div>
                <div className="text-sm font-bold" style={{ color: accent }}>
                  Detail trasy, mapa a GPX →
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="text-sm text-[#9AA3C2] mt-6">Pro tento filtr žádná trasa. Zkus víc kilometrů/převýšení nebo jinou obtížnost.</p>
      )}
    </>
  );
}
