"use client";

import { STYLE_OPTIONS, TEMPO_OPTIONS, type PublicProfile } from "@/data/public-profile";

function ChipRow({
  label,
  options,
  value,
  onChange,
  color,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string | undefined;
  onChange: (v: string | undefined) => void;
  color: string;
}) {
  return (
    <div>
      <div className="text-[11px] font-bold text-[#9AA3C2] mb-1.5">{label}</div>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const active = value === o.value;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onChange(active ? undefined : o.value)}
              className="px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all"
              style={{
                borderColor: active ? color : "#E2E6F3",
                backgroundColor: active ? color : "transparent",
                color: active ? "#fff" : "#5A6480",
              }}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Volitelné profilové pole do bloku „Zveřejnit mou účast". Veřejně se pak
// v „Kdo jede" ukazuje jen křestní jméno + tenhle profil.
export default function PublicProfileFields({
  color,
  showCity = true,
  value,
  onChange,
}: {
  color: string;
  showCity?: boolean;
  value: PublicProfile;
  onChange: (p: PublicProfile) => void;
}) {
  const set = (patch: Partial<PublicProfile>) => onChange({ ...value, ...patch });
  const inputClass =
    "w-full px-3 py-2 rounded-lg text-sm border border-[#E2E6F3] text-[#1a1a2e] placeholder-[#C0C7D8] focus:outline-none focus:border-current transition-colors";

  return (
    <div className="mt-3 pt-3 border-t border-[#E2E6F3] space-y-3">
      <div className="text-[11px] font-bold text-[#9AA3C2]">
        Tvůj profil (nepovinné — uvidí ostatní v „Kdo jede")
      </div>
      <div className={`grid gap-2 ${showCity ? "grid-cols-2" : "grid-cols-1"}`}>
        <input
          type="number"
          min={0}
          max={120}
          placeholder="Věk"
          value={value.age ?? ""}
          onChange={(e) => {
            const n = Number(e.target.value);
            set({ age: e.target.value ? Math.max(0, Math.min(120, n)) : undefined });
          }}
          className={inputClass}
        />
        {showCity && (
          <input
            type="text"
            placeholder="Město"
            value={value.city ?? ""}
            onChange={(e) => set({ city: e.target.value })}
            className={inputClass}
          />
        )}
      </div>
      <ChipRow label="Styl" options={STYLE_OPTIONS} value={value.style} onChange={(v) => set({ style: v })} color={color} />
      <ChipRow label="Tempo" options={TEMPO_OPTIONS} value={value.tempo} onChange={(v) => set({ tempo: v })} color={color} />
      <input
        type="text"
        placeholder="Instagram (nepovinné — ať se ostatní spojí)"
        value={value.instagram ?? ""}
        onChange={(e) => set({ instagram: e.target.value.replace(/^@/, "") })}
        className={inputClass}
      />
    </div>
  );
}
