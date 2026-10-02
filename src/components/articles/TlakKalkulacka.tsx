"use client";

import { useState } from "react";

/**
 * Kalkulačka tlaku v silničních pláštích.
 *
 * Stejný vzorec jako v carouselu na sítě (scripts/social/carousel-tlaky-silnice.mjs),
 * ať web a Instagram neukazují jiná čísla:
 *
 *   p [bar] = C · zatížení kola [kg] / šířka [mm]^1,35
 *
 * Vychází z principu 15% průhybu pláště (Berto): širší plášť má při stejném
 * zatížení větší objem, takže na stejný průhyb potřebuje nižší tlak. Konstanta
 * je nastavená tak, aby 80kg jezdec na 28 mm s duší vyšel na 4,9 bar vzadu.
 */

const C = 9.324;
const EXP = 1.35;
const REAR_SHARE = 0.53;

/** Bezdušový plášť se obejde bez rezervy na proštípnutí duše. */
const TUBELESS_DELTA = -0.3;

const WIDTHS = [23, 25, 26, 28, 30, 32, 34] as const;

function fmt(bar: number) {
  return bar.toFixed(1).replace(".", ",");
}

export default function TlakKalkulacka() {
  const [rider, setRider] = useState(78);
  const [gear, setGear] = useState(9);
  const [width, setWidth] = useState<number>(28);
  const [tubeless, setTubeless] = useState(false);

  const system = rider + gear;
  const divisor = Math.pow(width, EXP);
  const delta = tubeless ? TUBELESS_DELTA : 0;

  const rear = Math.max(1.5, (C * system * REAR_SHARE) / divisor + delta);
  const front = Math.max(1.5, (C * system * (1 - REAR_SHARE)) / divisor + delta);

  return (
    <div className="bg-[#0F1724] rounded-2xl p-6 md:p-8 my-10 text-white">
      <div className="text-[10px] uppercase tracking-wider font-bold text-[#7FB2FF] mb-5">
        Kalkulačka tlaku
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="text-sm text-[#9FB0C4]">
            Hmotnost jezdce v oblečení — {rider} kg
          </span>
          <input
            type="range"
            min={45}
            max={120}
            step={1}
            value={rider}
            onChange={(e) => setRider(Number(e.target.value))}
            className="w-full mt-2 accent-[#7FB2FF]"
          />
        </label>

        <label className="block">
          <span className="text-sm text-[#9FB0C4]">
            Kolo + lahve + výbava — {gear} kg
          </span>
          <input
            type="range"
            min={6}
            max={16}
            step={1}
            value={gear}
            onChange={(e) => setGear(Number(e.target.value))}
            className="w-full mt-2 accent-[#7FB2FF]"
          />
        </label>
      </div>

      <div className="mt-6">
        <span className="text-sm text-[#9FB0C4]">Šířka pláště</span>
        <div className="flex flex-wrap gap-2 mt-2">
          {WIDTHS.map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => setWidth(w)}
              aria-pressed={width === w}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
                width === w
                  ? "bg-[#7FB2FF] text-[#0F1724]"
                  : "bg-[#1C2838] text-[#C7D4E4] hover:bg-[#263548]"
              }`}
            >
              {w} mm
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-3 mt-6 cursor-pointer">
        <input
          type="checkbox"
          checked={tubeless}
          onChange={(e) => setTubeless(e.target.checked)}
          className="w-4 h-4 accent-[#7FB2FF]"
        />
        <span className="text-sm text-[#C7D4E4]">
          Bezdušové (tubeless) — bez duše odpadá riziko proštípnutí, jde jet níž
        </span>
      </label>

      <div className="grid grid-cols-2 gap-4 mt-8">
        <div className="bg-[#1C2838] rounded-xl p-5">
          <div className="text-xs uppercase tracking-wider text-[#9FB0C4] mb-1">
            Zadní
          </div>
          <div className="text-4xl font-black tabular-nums">{fmt(rear)}</div>
          <div className="text-xs text-[#9FB0C4] mt-1">
            bar · {Math.round(rear * 14.5)} psi
          </div>
        </div>
        <div className="bg-[#1C2838] rounded-xl p-5">
          <div className="text-xs uppercase tracking-wider text-[#9FB0C4] mb-1">
            Přední
          </div>
          <div className="text-4xl font-black tabular-nums">{fmt(front)}</div>
          <div className="text-xs text-[#9FB0C4] mt-1">
            bar · {Math.round(front * 14.5)} psi
          </div>
        </div>
      </div>

      <p className="text-xs text-[#8296AC] leading-relaxed mt-5">
        Orientační výchozí hodnoty pro ~21 mm vnitřní šířku ráfku. Ber je jako
        první nástřel, ne jako dogma — pak si pohraj v rozmezí ±0,3 bar podle
        povrchu a vlastního pocitu. <strong className="text-[#C7D4E4]">Nikdy
        nepřekroč maximální tlak uvedený na plášti ani na ráfku</strong>, platí
        ta nižší z obou hodnot.
      </p>
    </div>
  );
}
