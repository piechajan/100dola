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

function matchesDiff(tier: number, d: Diff): boolean {
  if (d === "vse") return true;
  if (d === "lehka") return tier === 1;
  if (d === "stredni") return tier === 2;
  return tier >= 3; // těžká
}

export default function TrasyFilter({ routes }: { routes: MalagaRouteV2[] }) {
  const [diff, setDiff] = useState<Diff>("vse");

  const filtered = useMemo(
    () => routes.filter((r) => matchesDiff(r.tier, diff)),
    [routes, diff],
  );

  return (
    <>
      {/* Filtr obtížnosti */}
      <div className="flex flex-wrap gap-2 mb-8">
        {DIFF_TABS.map((t) => {
          const active = diff === t.key;
          const count =
            t.key === "vse" ? routes.length : routes.filter((r) => matchesDiff(r.tier, t.key)).length;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setDiff(t.key)}
              className={`text-sm font-bold px-4 py-2 rounded-xl border transition-colors ${
                active
                  ? "text-white border-transparent"
                  : "bg-white text-[#5A6480] border-[#E2E6F3] hover:border-[#E8431A]"
              }`}
              style={active ? { backgroundColor: accent } : undefined}
            >
              {t.label}
              <span className={`ml-1.5 font-normal ${active ? "text-white/70" : "text-[#9AA3C2]"}`}>
                {count}
              </span>
            </button>
          );
        })}
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
        <p className="text-sm text-[#9AA3C2] mt-6">Pro tento filtr zatím žádná trasa. Zkus jinou obtížnost.</p>
      )}
    </>
  );
}
