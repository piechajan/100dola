// Sdílené konstanty pro skupinovou přihlášku na akci (klient i server).
// Bez "server-only" — importuje se i do client komponenty formuláře.

export type EventStayType = "pension" | "car" | "van" | "car_tent";

export interface StayOption {
  value: EventStayType;
  label: string;
  icon: string;
  description: string;
}

// Pobyt je JEDEN pro celou skupinu — právě jedna volba.
export const STAY_OPTIONS: StayOption[] = [
  {
    value: "pension",
    label: "Ubytování — Pension Radost",
    icon: "🛏",
    description: "Přímo na základně. Vyber termín (pá→po nebo vlastní počet nocí).",
  },
  {
    value: "car",
    label: "Místo na auto",
    icon: "🚗",
    description: "Zaparkuješ u základny, spíš po svém.",
  },
  {
    value: "van",
    label: "Místo na dodávku",
    icon: "🚐",
    description: "Místo pro dodávku / obytku u základny.",
  },
  {
    value: "car_tent",
    label: "Místo na auto + stan",
    icon: "⛺",
    description: "Auto a stan u základny.",
  },
];

export const STAY_LABELS: Record<EventStayType, string> = STAY_OPTIONS.reduce(
  (acc, o) => {
    acc[o.value] = o.label;
    return acc;
  },
  {} as Record<EventStayType, string>,
);

export function stayLabel(value: EventStayType): string {
  return STAY_LABELS[value] ?? value;
}

const CZ_DOW = ["ne", "po", "út", "st", "čt", "pá", "so"];

function nightsWord(n: number): string {
  if (n === 1) return "noc";
  if (n >= 2 && n <= 4) return "noci";
  return "nocí";
}

// "pá 25. 9. → po 28. 9. · 3 noci" — jen pro ubytování (pension).
export function formatNights(from?: string | null, to?: string | null): string | undefined {
  if (!from || !to) return undefined;
  const f = new Date(`${from}T12:00:00`);
  const t = new Date(`${to}T12:00:00`);
  if (Number.isNaN(f.getTime()) || Number.isNaN(t.getTime())) return undefined;
  const nights = Math.max(0, Math.round((t.getTime() - f.getTime()) / 86_400_000));
  const fmt = (d: Date) => `${CZ_DOW[d.getDay()]} ${d.getDate()}. ${d.getMonth() + 1}.`;
  return `${fmt(f)} → ${fmt(t)} · ${nights} ${nightsWord(nights)}`;
}
