"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  SCOTT_2027,
  formatVariantPrice,
  statusLabel,
  type Scott2027Platform,
  type Scott2027Variant,
} from "@/data/scott-2027";
import BikeInquiryForm from "./BikeInquiryForm";

interface FlatVariant {
  platform: Scott2027Platform;
  variant: Scott2027Variant;
  key: string;
  label: string;
}

function flatten(): FlatVariant[] {
  const out: FlatVariant[] = [];
  for (const p of SCOTT_2027) {
    for (const v of p.variants) {
      out.push({
        platform: p,
        variant: v,
        key: `${p.slug}__${v.slug}`,
        label: `${p.name} — ${v.name}`,
      });
    }
  }
  return out;
}

const RECOMMENDED_PAIRS: { a: string; b: string; reason: string }[] = [
  {
    a: "scott-spark-rc-2027__spark-rc-sl",
    b: "scott-spark-rc-2027__spark-rc-world-cup",
    reason: "Top-tier MTB závodní: SL (top elektro) vs World Cup (manuální čistota).",
  },
  {
    a: "scott-addict__addict-30",
    b: "scott-addict__addict-20",
    reason: "Endurance silnice: o jednu úroveň výš za méně peněz.",
  },
  {
    a: "scott-addict-rc__addict-rc-10",
    b: "scott-addict__addict-10",
    reason: "Aero race vs endurance ve stejné cenové třídě.",
  },
  {
    a: "scott-addict-gravel__addict-gravel-10",
    b: "scott-addict-rc__addict-rc-10",
    reason: "Univerzál (gravel) vs čistá závodní silnice za podobné peníze.",
  },
];

interface ColumnProps {
  v: FlatVariant | null;
  onChange: (key: string) => void;
  label: string;
}

function VariantColumn({ v, onChange, label }: ColumnProps) {
  return (
    <div className="bg-white border border-[#E2E6F3] rounded-2xl p-5">
      <div className="text-xs font-bold uppercase tracking-wider text-[#5A6480] mb-2">
        {label}
      </div>
      <select
        value={v?.key || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-sm font-semibold bg-[#F7F9FF] border border-[#E2E6F3] rounded-lg px-3 py-2 mb-4 focus:border-[#3B7CF4] focus:outline-none"
      >
        <option value="">— vyber kolo —</option>
        {SCOTT_2027.map((p) => (
          <optgroup key={p.slug} label={p.name}>
            {p.variants.map((variant) => (
              <option key={`${p.slug}__${variant.slug}`} value={`${p.slug}__${variant.slug}`}>
                {variant.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>

      {v && (
        <div>
          <div className="relative aspect-[4/3] bg-gradient-to-br from-[#EAF1FE] via-[#F7F9FF] to-white rounded-xl overflow-hidden mb-3">
            <Image
              src={v.variant.photo}
              alt={v.label}
              fill
              sizes="(min-width: 768px) 480px, 100vw"
              className="object-contain p-4"
            />
          </div>
          <Link
            href={`/clanky/scott-2027/${v.platform.slug}/${v.variant.slug}`}
            className="block text-sm font-bold text-[#1a1a2e] hover:text-[#3B7CF4] mb-1 truncate"
          >
            {v.platform.name} {v.variant.name}
          </Link>
          <div className="text-xs text-[#5A6480] mb-2">
            <span className="inline-block bg-[#FFD23F] text-[#1a1a2e] font-black px-2 py-0.5 rounded-md mr-2">
              {statusLabel(v.platform.status)}
            </span>
            {v.platform.platform === "mtb"
              ? "MTB"
              : v.platform.platform === "road"
                ? "Silnice"
                : "Gravel"}
          </div>
          <div className="text-lg font-black text-[#1a1a2e]">{formatVariantPrice(v.variant)}</div>
          {v.variant.priceEur && (
            <div className="text-[11px] text-[#5A6480]">
              € {v.variant.priceEur.toLocaleString("cs-CZ")} MSRP
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface SpecRow {
  label: string;
  getA: () => string | null;
  getB: () => string | null;
}

export default function ScottComparison({
  initialA,
  initialB,
}: {
  initialA?: string;
  initialB?: string;
}) {
  const all = useMemo(() => flatten(), []);
  const [aKey, setAKey] = useState<string>(initialA || "spark-rc__spark-rc-sl");
  const [bKey, setBKey] = useState<string>(initialB || "spark-rc__spark-rc-world-cup");

  const a = all.find((f) => f.key === aKey) || null;
  const b = all.find((f) => f.key === bKey) || null;

  const rows: SpecRow[] = [
    {
      label: "Platforma",
      getA: () => a?.platform.name || null,
      getB: () => b?.platform.name || null,
    },
    {
      label: "Typ",
      getA: () =>
        a
          ? a.platform.platform === "mtb"
            ? "MTB"
            : a.platform.platform === "road"
              ? "Silnice"
              : "Gravel"
          : null,
      getB: () =>
        b
          ? b.platform.platform === "mtb"
            ? "MTB"
            : b.platform.platform === "road"
              ? "Silnice"
              : "Gravel"
          : null,
    },
    { label: "Groupset", getA: () => a?.variant.groupset || null, getB: () => b?.variant.groupset || null },
    { label: "Vidlice", getA: () => a?.variant.fork || null, getB: () => b?.variant.fork || null },
    { label: "Tlumič", getA: () => a?.variant.componentry?.shock || null, getB: () => b?.variant.componentry?.shock || null },
    { label: "Kola", getA: () => a?.variant.wheels || null, getB: () => b?.variant.wheels || null },
    { label: "Brzdy", getA: () => a?.variant.componentry?.brakes || null, getB: () => b?.variant.componentry?.brakes || null },
    { label: "Pláště", getA: () => a?.variant.componentry?.tires || null, getB: () => b?.variant.componentry?.tires || null },
    { label: "Kokpit", getA: () => a?.variant.componentry?.cockpit || null, getB: () => b?.variant.componentry?.cockpit || null },
    {
      label: "Váha",
      getA: () => (a?.variant.weightKg ? `${a.variant.weightKg.toFixed(1)} kg` : null),
      getB: () => (b?.variant.weightKg ? `${b.variant.weightKg.toFixed(1)} kg` : null),
    },
    {
      label: "Velikosti",
      getA: () => a?.variant.sizes.join(" / ") || null,
      getB: () => b?.variant.sizes.join(" / ") || null,
    },
    {
      label: "Status modelového roku 2027",
      getA: () => (a ? statusLabel(a.platform.status) : null),
      getB: () => (b ? statusLabel(b.platform.status) : null),
    },
  ];

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
        <span>Srovnání modelů</span>
      </nav>

      <header className="mb-8 md:mb-10">
        <h1 className="text-3xl md:text-5xl font-black text-[#1a1a2e] mb-3 leading-tight">
          Srovnání Scott modelů
        </h1>
        <p className="text-base md:text-lg text-[#5A6480] leading-relaxed max-w-[760px]">
          Vyber dva libovolné modely a uvidíš jejich osazení vedle sebe — groupset, kola, brzdy,
          váhu, ceny. Pokud váháš nad upgrade nebo mezi platformami, tohle je nejrychlejší cesta
          k rozhodnutí.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">
        <VariantColumn v={a} onChange={setAKey} label="Model A" />
        <VariantColumn v={b} onChange={setBKey} label="Model B" />
      </div>

      <div className="bg-white border border-[#E2E6F3] rounded-2xl overflow-hidden mb-10">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F7F9FF] border-b border-[#E2E6F3]">
              <th className="text-left p-3 md:p-4 font-bold text-[#5A6480] w-1/3">Parametr</th>
              <th className="text-left p-3 md:p-4 font-bold text-[#1a1a2e]">{a?.variant.name || "—"}</th>
              <th className="text-left p-3 md:p-4 font-bold text-[#1a1a2e]">{b?.variant.name || "—"}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const va = r.getA();
              const vb = r.getB();
              if (!va && !vb) return null;
              return (
                <tr key={r.label} className="border-b border-[#E2E6F3] last:border-0 align-top">
                  <td className="p-3 md:p-4 text-[#5A6480] font-semibold">{r.label}</td>
                  <td className="p-3 md:p-4 text-[#1a1a2e]">{va || "—"}</td>
                  <td className="p-3 md:p-4 text-[#1a1a2e]">{vb || "—"}</td>
                </tr>
              );
            })}
            <tr className="bg-[#EAF1FE]">
              <td className="p-3 md:p-4 font-black text-[#1a1a2e]">Cena (orientačně)</td>
              <td className="p-3 md:p-4 font-black text-[#1a1a2e]">{a ? formatVariantPrice(a.variant) : "—"}</td>
              <td className="p-3 md:p-4 font-black text-[#1a1a2e]">{b ? formatVariantPrice(b.variant) : "—"}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <section className="mb-12">
        <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-4">
          Doporučená srovnání
        </h2>
        <p className="text-sm text-[#5A6480] mb-6">
          Nejčastější rozhodnutí, na která se nás zákazníci ptají.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {RECOMMENDED_PAIRS.map((pair) => {
            const fa = all.find((f) => f.key === pair.a);
            const fb = all.find((f) => f.key === pair.b);
            if (!fa || !fb) return null;
            return (
              <button
                key={`${pair.a}__${pair.b}`}
                type="button"
                onClick={() => {
                  setAKey(pair.a);
                  setBKey(pair.b);
                  if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="text-left bg-white border border-[#E2E6F3] rounded-2xl p-4 hover:border-[#3B7CF4] hover:shadow-sm transition group"
              >
                <div className="text-sm font-black text-[#1a1a2e] mb-1 group-hover:text-[#3B7CF4]">
                  {fa.variant.name} vs {fb.variant.name}
                </div>
                <div className="text-xs text-[#5A6480] leading-snug">{pair.reason}</div>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-3">
          Nemůžeš se rozhodnout?
        </h2>
        <p className="text-sm text-[#5A6480] mb-6">
          Napiš nám — Honza si projde tvoje preference (typ jízdy, rozpočet, sezona) a doporučí
          konkrétní model. Když chceš, můžeš si přijet zkusit posed do Šternberka.
        </p>
        <BikeInquiryForm
          bikeModel={a && b ? `${a.variant.name} vs ${b.variant.name}` : "Scott 2027"}
        />
      </section>
    </article>
  );
}
