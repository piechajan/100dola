"use client";

import { useMemo, useState } from "react";

/**
 * Kalkulačka přibližného dojezdu elektrokola. Čistě klientský nástroj (žádný
 * backend). Model: spotřeba Wh/km = BASE × asistence × terén × hmotnost,
 * dojezd = kapacita / spotřeba. Konstanty laděné na reálné hodnoty
 * (400 Wh, asistence 3, rovina, 75 kg ≈ 64 km). Jde o odhad — na dojezd má
 * vliv i technický stav, stáří baterie, teplota, vítr a technika jízdy.
 */

const TERRAINS = [
  { id: "rovina", label: "Rovina", mult: 1.0 },
  { id: "stredni", label: "Střední", mult: 1.45 },
  { id: "hory", label: "Hory", mult: 2.0 },
] as const;

// asistence 1..5 (Min, 2, 3, 4, Max) → relativní spotřeba
const ASSIST_FACTOR = [0.6, 0.8, 1.0, 1.25, 1.5];
const ASSIST_LABELS = ["Min", "2", "3", "4", "Max"];
const BASE_WH_PER_KM = 6.25;

function Slider({
  label,
  value,
  display,
  min,
  max,
  step,
  onChange,
  ticks,
}: {
  label: string;
  value: number;
  display: string;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  ticks: string[];
}) {
  return (
    <div>
      <div className="text-sm text-[#5A6480] mb-2">
        {label}: <span className="font-black text-[#1a1a2e]">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="w-full accent-[#3B7CF4] cursor-pointer"
      />
      <div className="flex justify-between text-[10px] uppercase tracking-wider text-[#9AA3C2] mt-1">
        {ticks.map((t) => (
          <span key={t}>{t}</span>
        ))}
      </div>
    </div>
  );
}

export default function EbikeRangeCalculator({
  defaultBattery = 500,
}: {
  /** Předvyplněná kapacita baterie (Wh) — pro konkrétní elektrokolo na PDP. */
  defaultBattery?: number;
}) {
  const [battery, setBattery] = useState(
    Math.min(1200, Math.max(300, Math.round(defaultBattery / 25) * 25)),
  );
  const [weight, setWeight] = useState(75);
  const [assist, setAssist] = useState(3); // 1..5
  const [terrain, setTerrain] = useState<(typeof TERRAINS)[number]["id"]>("rovina");

  const rangeKm = useMemo(() => {
    const a = ASSIST_FACTOR[assist - 1];
    const t = TERRAINS.find((x) => x.id === terrain)?.mult ?? 1;
    const w = 1 + 0.35 * (weight - 75) / 75;
    const consumption = BASE_WH_PER_KM * a * t * w;
    return Math.max(1, Math.round(battery / consumption));
  }, [battery, weight, assist, terrain]);

  return (
    <div className="rounded-3xl border border-[#E2E6F3] bg-white shadow-sm overflow-hidden">
      <div className="bg-[#1a1a2e] px-6 py-5">
        <h2 className="text-lg md:text-xl font-black text-white text-center">
          Kalkulačka dojezdu elektrokola
        </h2>
      </div>

      <div className="p-6 md:p-8 grid md:grid-cols-2 gap-6 md:gap-8">
        <div className="space-y-6">
          <Slider
            label="Kapacita baterie"
            value={battery}
            display={`${battery} Wh`}
            min={300}
            max={1200}
            step={25}
            onChange={setBattery}
            ticks={["300 Wh", "600 Wh", "900 Wh", "1200 Wh"]}
          />
          <Slider
            label="Hmotnost jezdce"
            value={weight}
            display={`${weight} kg`}
            min={50}
            max={140}
            step={1}
            onChange={setWeight}
            ticks={["50 kg", "80 kg", "110 kg", "140 kg"]}
          />
        </div>

        <div className="space-y-6">
          <Slider
            label="Úroveň asistence"
            value={assist}
            display={ASSIST_LABELS[assist - 1]}
            min={1}
            max={5}
            step={1}
            onChange={setAssist}
            ticks={ASSIST_LABELS}
          />
          <div>
            <div className="text-sm text-[#5A6480] mb-2">
              Převažující profil:{" "}
              <span className="font-black text-[#1a1a2e]">
                {TERRAINS.find((t) => t.id === terrain)?.label}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {TERRAINS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTerrain(t.id)}
                  aria-pressed={terrain === t.id}
                  className={`px-3 py-2.5 rounded-xl border-2 text-sm font-bold transition ${
                    terrain === t.id
                      ? "border-[#3B7CF4] bg-[#F0F4FF] text-[#1a1a2e]"
                      : "border-[#E2E6F3] bg-white text-[#5A6480] hover:border-[#3B7CF4]/40"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 md:px-8 pb-6 md:pb-8">
        <div className="rounded-2xl bg-[#F0FDF4] border border-[#A7F3D0] px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
          <span className="text-base font-bold text-[#065F46]">
            Dojezd na ekole je přibližně
          </span>
          <span className="text-2xl md:text-3xl font-black text-[#065F46] tabular-nums">
            {rangeKm} km*
          </span>
        </div>
        <p className="text-xs text-[#9AA3C2] leading-relaxed mt-3">
          *Orientační odhad. Na celkový dojezd má dále vliv technický stav ekola,
          stáří baterie, teplota okolí, protivítr, tlak v pláštích a technika jízdy.
        </p>
      </div>
    </div>
  );
}
