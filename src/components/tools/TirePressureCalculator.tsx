"use client";

import { useMemo, useState } from "react";

/**
 * Kalkulačka tlaku v silničních pláštích. Čistě klientský nástroj.
 *
 * ZÁKLAD — princip 15% průhybu pláště (Berto): širší plášť má při stejném
 * zatížení větší objem, takže na stejný průhyb potřebuje nižší tlak.
 *
 *   p [bar] = C · zatížení kola [kg] / skutečná šířka [mm]^1,35
 *
 * Konstanta je nastavená tak, aby 80kg jezdec na 28 mm s duší na ráfku
 * s vnitřní šířkou 21 mm vyšel na 4,9 bar vzadu.
 *
 * KOREKCE (sada vstupů srovnatelná se SILCA Pro a kalkulačkami Zipp/ENVE):
 *  - vnitřní šířka ráfku → skutečná šířka pláště. Plášť se na širším ráfku
 *    roztáhne, ~0,4 mm na každý 1 mm ráfku nad referenčních 19 mm. Bez tohohle
 *    vstupu je výsledek u moderních širokých ráfků systematicky vysoko.
 *  - povrch → čím hrubší, tím níž. Na tomhle stojí celá myšlenka breakpointu.
 *  - průměrná rychlost → bod, kde se plášť začne odrážet místo přizpůsobovat,
 *    se s rychlostí posouvá nahoru. Vliv je druhořadý, ale měřitelný.
 *  - typ pláště → duše butyl / latex / bezdušové / galuska.
 *  - průměr kola → menší kolo má menší stopu, potřebuje o něco víc.
 *  - hookless ráfek → tvrdý strop 5,0 bar daný normou.
 *
 * Koeficienty povrchu a rychlosti jsou naše parametrizace, ne převzatá data.
 * Výsledek je výchozí nastavení, ne dogma.
 *
 * Základní vzorec sdílí i generátor carouselu na sítě
 * (scripts/social/carousel-tlaky-silnice.mjs), aby web a Instagram neukazovaly
 * jiná čísla.
 */

const C = 9.324;
const EXP = 1.35;
const REF_RIM = 19;
const RIM_SPREAD = 0.4;
const HOOKLESS_MAX_BAR = 5.0;

const SURFACES = [
  { id: "novy", label: "Nový asfalt", factor: 1.0, hint: "hladký, čerstvý povrch" },
  { id: "dobry", label: "Dobrý asfalt", factor: 0.96, hint: "běžná udržovaná silnice" },
  { id: "ojety", label: "Ojetý asfalt", factor: 0.91, hint: "drsný povrch, praskliny" },
  { id: "rozbity", label: "Rozbitý", factor: 0.85, hint: "výtluky, záplaty, spáry" },
  { id: "hruby", label: "Velmi hrubý", factor: 0.79, hint: "kostky, přejezdy, polňačky" },
] as const;

const TIRE_TYPES = [
  { id: "butyl", label: "Duše (butyl)", delta: 0 },
  { id: "latex", label: "Duše (latex)", delta: -0.1 },
  { id: "tubeless", label: "Bezdušové", delta: -0.3 },
  { id: "galuska", label: "Galuska", delta: -0.4 },
] as const;

const WHEELS = [
  { id: "700c", label: "700C", factor: 1.0 },
  { id: "650b", label: "650B", factor: 1.06 },
] as const;

const WIDTHS = [23, 25, 26, 28, 30, 32, 34] as const;

const fmt = (bar: number) => bar.toFixed(1).replace(".", ",");

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

export default function TirePressureCalculator() {
  const [rider, setRider] = useState(78);
  const [gear, setGear] = useState(9);
  const [widthFront, setWidthFront] = useState<number>(28);
  const [widthRear, setWidthRear] = useState<number>(28);
  const [sameWidth, setSameWidth] = useState(true);
  const [rim, setRim] = useState(21);
  const [speed, setSpeed] = useState(30);
  const [surface, setSurface] = useState<string>("dobry");
  const [tireType, setTireType] = useState<string>("butyl");
  const [wheel, setWheel] = useState<string>("700c");
  const [hookless, setHookless] = useState(false);

  const result = useMemo(() => {
    const system = rider + gear;
    const surf = SURFACES.find((s) => s.id === surface) ?? SURFACES[1];
    const type = TIRE_TYPES.find((t) => t.id === tireType) ?? TIRE_TYPES[0];
    const wh = WHEELS.find((w) => w.id === wheel) ?? WHEELS[0];

    // plášť se na širším ráfku roztáhne
    const actual = (labelled: number) =>
      labelled + RIM_SPREAD * (rim - REF_RIM);

    // breakpoint se s rychlostí posouvá nahoru
    const speedFactor = 1 + 0.004 * (speed - 30);

    const one = (labelled: number, share: number) => {
      const w = Math.max(18, actual(labelled));
      const base = (C * system * share) / Math.pow(w, EXP);
      const p = base * surf.factor * speedFactor * wh.factor + type.delta;
      const capped = hookless ? Math.min(p, HOOKLESS_MAX_BAR) : p;
      return {
        bar: Math.max(1.5, capped),
        actualWidth: w,
        over: hookless && p > HOOKLESS_MAX_BAR,
      };
    };

    // vpředu se jede vždy podle widthFront; vzadu podle něj jen když je
    // zaškrtnuté „stejnou vpředu i vzadu"
    return {
      front: one(widthFront, 0.47),
      rear: one(sameWidth ? widthFront : widthRear, 0.53),
    };
  }, [
    rider, gear, widthFront, widthRear, sameWidth, rim, speed, surface,
    tireType, wheel, hookless,
  ]);

  const overLimit = result.front.over || result.rear.over;

  return (
    <div className="rounded-3xl border border-[#E2E6F3] bg-white shadow-sm overflow-hidden">
      <div className="bg-[#1a1a2e] px-6 py-5">
        <h2 className="text-lg md:text-xl font-black text-white text-center">
          Kalkulačka tlaku v pláštích
        </h2>
      </div>

      <div className="p-6 md:p-8 grid md:grid-cols-2 gap-6 md:gap-8">
        <div className="space-y-6">
          <Slider
            label="Hmotnost jezdce v oblečení"
            value={rider}
            display={`${rider} kg`}
            min={45}
            max={120}
            step={1}
            onChange={setRider}
            ticks={["45 kg", "70 kg", "95 kg", "120 kg"]}
          />
          <Slider
            label="Kolo, lahve a výbava"
            value={gear}
            display={`${gear} kg`}
            min={6}
            max={18}
            step={1}
            onChange={setGear}
            ticks={["6 kg", "10 kg", "14 kg", "18 kg"]}
          />
          <Slider
            label="Vnitřní šířka ráfku"
            value={rim}
            display={`${rim} mm`}
            min={15}
            max={30}
            step={1}
            onChange={setRim}
            ticks={["15 mm", "20 mm", "25 mm", "30 mm"]}
          />
          <Slider
            label="Průměrná rychlost"
            value={speed}
            display={`${speed} km/h`}
            min={18}
            max={45}
            step={1}
            onChange={setSpeed}
            ticks={["18", "27", "36", "45"]}
          />
        </div>

        <div className="space-y-5">
          <div>
            <div className="flex items-baseline justify-between mb-2 gap-2 flex-wrap">
              <span className="text-sm text-[#5A6480]">
                Šířka pláště{sameWidth ? "" : " vpředu"}:{" "}
                <span className="font-black text-[#1a1a2e]">
                  {widthFront} mm
                </span>
              </span>
              <button
                type="button"
                onClick={() => setSameWidth(!sameWidth)}
                className="text-xs font-bold text-[#3B7CF4] underline underline-offset-2"
              >
                {sameWidth ? "Vpředu a vzadu jinou" : "Stejnou vpředu i vzadu"}
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {WIDTHS.map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setWidthFront(w)}
                  aria-pressed={widthFront === w}
                  className={`px-1 py-2 rounded-lg border-2 text-sm font-bold transition ${
                    widthFront === w
                      ? "border-[#3B7CF4] bg-[#F0F4FF] text-[#1a1a2e]"
                      : "border-[#E2E6F3] bg-white text-[#5A6480] hover:border-[#3B7CF4]/40"
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          {!sameWidth && (
            <div>
              <div className="text-sm text-[#5A6480] mb-2">
                Šířka pláště vzadu:{" "}
                <span className="font-black text-[#1a1a2e]">{widthRear} mm</span>
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {WIDTHS.map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setWidthRear(w)}
                    aria-pressed={widthRear === w}
                    className={`px-1 py-2 rounded-lg border-2 text-sm font-bold transition ${
                      widthRear === w
                        ? "border-[#3B7CF4] bg-[#F0F4FF] text-[#1a1a2e]"
                        : "border-[#E2E6F3] bg-white text-[#5A6480] hover:border-[#3B7CF4]/40"
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="text-sm text-[#5A6480] mb-2">Povrch</div>
            <div className="grid grid-cols-2 gap-2">
              {SURFACES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSurface(s.id)}
                  aria-pressed={surface === s.id}
                  title={s.hint}
                  className={`px-3 py-2 rounded-xl border-2 text-xs font-bold transition text-left ${
                    surface === s.id
                      ? "border-[#3B7CF4] bg-[#F0F4FF] text-[#1a1a2e]"
                      : "border-[#E2E6F3] bg-white text-[#5A6480] hover:border-[#3B7CF4]/40"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm text-[#5A6480] mb-2">Typ pláště</div>
            <div className="grid grid-cols-2 gap-2">
              {TIRE_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTireType(t.id)}
                  aria-pressed={tireType === t.id}
                  className={`px-3 py-2 rounded-xl border-2 text-xs font-bold transition ${
                    tireType === t.id
                      ? "border-[#3B7CF4] bg-[#F0F4FF] text-[#1a1a2e]"
                      : "border-[#E2E6F3] bg-white text-[#5A6480] hover:border-[#3B7CF4]/40"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex gap-2">
              {WHEELS.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => setWheel(w.id)}
                  aria-pressed={wheel === w.id}
                  className={`px-3 py-2 rounded-xl border-2 text-xs font-bold transition ${
                    wheel === w.id
                      ? "border-[#3B7CF4] bg-[#F0F4FF] text-[#1a1a2e]"
                      : "border-[#E2E6F3] bg-white text-[#5A6480] hover:border-[#3B7CF4]/40"
                  }`}
                >
                  {w.label}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hookless}
                onChange={(e) => setHookless(e.target.checked)}
                className="w-4 h-4 accent-[#3B7CF4]"
              />
              <span className="text-xs font-bold text-[#5A6480]">
                Hookless ráfek
              </span>
            </label>
          </div>
        </div>
      </div>

      <div className="px-6 md:px-8 pb-6 md:pb-8">
        <div className="grid grid-cols-2 gap-3">
          {[
            ["Přední", result.front],
            ["Zadní", result.rear],
          ].map(([label, r]) => {
            const res = r as typeof result.front;
            return (
              <div
                key={label as string}
                className="rounded-2xl bg-[#F0FDF4] border border-[#A7F3D0] px-5 py-4"
              >
                <div className="text-xs uppercase tracking-wider font-bold text-[#065F46] mb-1">
                  {label as string}
                </div>
                <div className="text-2xl md:text-3xl font-black text-[#065F46] tabular-nums">
                  {fmt(res.bar)} bar
                </div>
                <div className="text-xs text-[#047857] tabular-nums">
                  {Math.round(res.bar * 14.5)} psi
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-3 rounded-2xl bg-[#F7F9FC] border border-[#E2E6F3] px-5 py-4">
          <p className="text-xs text-[#5A6480] leading-relaxed">
            Na ráfku s vnitřní šířkou {rim} mm bude{" "}
            <strong className="text-[#1a1a2e]">
              {widthFront}mm plášť reálně měřit asi{" "}
              {result.front.actualWidth.toFixed(1).replace(".", ",")} mm
            </strong>{" "}
            — a právě z téhle skutečné šířky se tlak počítá. Ověřte si ji
            posuvným měřítkem na nahuštěném plášti.
          </p>
        </div>

        {overLimit && (
          <div className="mt-3 rounded-2xl bg-[#FFF4F1] border border-[#F3C9BC] px-5 py-4">
            <p className="text-sm text-[#8A3B28] leading-relaxed">
              <strong>Pozor:</strong> na tyhle parametry by bylo potřeba víc než
              5,0 bar, ale bezháčkový ráfek to nedovolí. Hodnoty jsou oříznuté na
              limit — prakticky to znamená, že{" "}
              <strong>potřebujete širší plášť</strong>.
            </p>
          </div>
        )}

        <p className="text-xs text-[#9AA3C2] leading-relaxed mt-3">
          Výchozí nastavení, ne dogma — dolaďte si ho v rozmezí ±0,2 bar podle
          vlastního pocitu. Nikdy nepřekročte maximální tlak uvedený na plášti
          ani na ráfku; platí ta nižší z obou hodnot.
        </p>
      </div>
    </div>
  );
}
