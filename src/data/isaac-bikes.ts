// ISAAC bike test fleet — pátek 29.5. až neděle 31.5. 2026.
// Sloty po 1 hodině, kapacita 1 osoba na slot × kolo.

export const ISAAC_BRAND = {
  origin: "Geleen, jih Nizozemska",
  founded: 2001,
  hero: "Holandská boutique značka. Carbon rámy v monocoque konstrukci od roku 2001.",
  bullets: [
    "Sídlo a vývoj — Geleen, Limburg (NL). Plně inhouse návrh.",
    "Specializace — monocoque carbon, ruční laminace, geometrie pro evropské vytrvalce.",
    "Záběr — silnice, endurance a gravel. Modely Meson, Element, Boson, Vitron, Kaon, Torus.",
    "Filozofie — značka pro lidi, kteří kolo žijí, ne jen vlastní. Důraz na detaily nad nápadné logo.",
  ],
  link: "https://www.isaac-cycle.com",
} as const;

export const ISAAC_BRING = [
  { icon: "🪪", label: "Občanský průkaz", required: true, hint: "slouží jako záloha — vrátíme po odevzdání kola" },
  { icon: "⛑", label: "Helma", required: true, hint: "povinná — bez ní jízda nemůže proběhnout" },
  { icon: "🚴", label: "Cyklistické oblečení", required: false, hint: "trika, kraťasy / dres — dle počasí" },
  { icon: "🪛", label: "Vlastní pedály", required: false, hint: "kola jsou bez pedálů, nasadíme tvoje SPD-SL / SPD / flatky" },
  { icon: "👟", label: "Tretry", required: false, hint: "vázané na tvůj typ pedálů" },
] as const;

export type BikeCategory = "road" | "gravel";

export interface IsaacBike {
  slug: string;
  model: string;
  color: string;
  size: "M" | "L";
  groupset: string;
  category: BikeCategory;
  /** Barva pro vizualizaci karty (CSS hex). */
  colorHex: string;
  /** Galerie fotek v /public/media/isaac/<slug>/. První je thumbnail.
   *  Když je array prázdná, používá se barevný chip jako fallback. */
  photos: string[];
}

export const ISAAC_BIKES: IsaacBike[] = [
  // Road — Ultegra Di2
  {
    slug: "meson-mineral-white-l",
    model: "Meson",
    color: "Mineral White",
    size: "L",
    groupset: "Ultegra Di2",
    category: "road",
    colorHex: "#E8E6DD",
    photos: [],
  },
  {
    slug: "meson-ruby-red-m",
    model: "Meson",
    color: "Ruby Red",
    size: "M",
    groupset: "Ultegra Di2",
    category: "road",
    colorHex: "#9B1C2A",
    photos: [],
  },
  {
    slug: "element-granite-grey-l",
    model: "Element",
    color: "Granite Grey",
    size: "L",
    groupset: "Ultegra Di2",
    category: "road",
    colorHex: "#5A5A5A",
    photos: [],
  },

  // Road — 105 Di2
  {
    slug: "boson-mineral-white-m",
    model: "Boson",
    color: "Mineral White",
    size: "M",
    groupset: "105 Di2",
    category: "road",
    colorHex: "#E8E6DD",
    photos: [],
  },
  {
    slug: "boson-sonic-silver-l",
    model: "Boson",
    color: "Sonic Silver",
    size: "L",
    groupset: "105 Di2",
    category: "road",
    colorHex: "#B8B8BE",
    photos: [],
  },
  {
    slug: "vitron-onyx-black-m",
    model: "Vitron",
    color: "Onyx Black",
    size: "M",
    groupset: "105 Di2",
    category: "road",
    colorHex: "#1a1a1a",
    photos: [],
  },
  {
    slug: "vitron-navy-blue-l",
    model: "Vitron",
    color: "Navy Blue",
    size: "L",
    groupset: "105 Di2",
    category: "road",
    colorHex: "#1F2D4A",
    photos: [],
  },

  // Gravel
  {
    slug: "kaon-sapphire-blue-l",
    model: "Kaon",
    color: "Sapphire Blue",
    size: "L",
    groupset: "GRX 610/820 2×12",
    category: "gravel",
    colorHex: "#0F4A8C",
    photos: [],
  },
  {
    slug: "torus-xplore-blast-bronze-m",
    model: "Torus Xplore",
    color: "Blast Bronze",
    size: "M",
    groupset: "GRX 827 Di2 1×12",
    category: "gravel",
    colorHex: "#8C6A3F",
    photos: [],
  },
  {
    slug: "torus-xplore-slade-blue-l",
    model: "Torus Xplore",
    color: "Slade Blue",
    size: "L",
    groupset: "GRX 827 Di2 1×12",
    category: "gravel",
    colorHex: "#465C7E",
    photos: [],
  },
];

export function getBikeBySlug(slug: string): IsaacBike | undefined {
  return ISAAC_BIKES.find((b) => b.slug === slug);
}

export function bikeLabel(b: IsaacBike): string {
  return `${b.model} ${b.color} ${b.groupset} · vel. ${b.size}`;
}

// ── Sloty ────────────────────────────────────────────────────────────────────

export interface SlotDef {
  /** ISO datum (YYYY-MM-DD). */
  date: string;
  /** Hodina začátku (9 = 9:00). */
  hour: number;
  /** Lidský label pro UI. */
  label: string;
  /** Zobrazovaný den pro grupování. */
  dayLabel: string;
  /** UTC ISO timestamp začátku slotu (pro DB UNIQUE constraint). */
  slotStart: string;
  /** UTC ISO timestamp konce slotu. */
  slotEnd: string;
}

const DAY_LABELS: Record<string, string> = {
  "2026-05-29": "Pátek 29. 5.",
  "2026-05-30": "Sobota 30. 5.",
  "2026-05-31": "Neděle 31. 5.",
};

function makeSlot(date: string, hour: number): SlotDef {
  // CEST = UTC+2 v květnu
  const startUtc = new Date(`${date}T${String(hour).padStart(2, "0")}:00:00+02:00`);
  const endUtc = new Date(startUtc.getTime() + 60 * 60 * 1000);
  return {
    date,
    hour,
    label: `${String(hour).padStart(2, "0")}:00–${String(hour + 1).padStart(2, "0")}:00`,
    dayLabel: DAY_LABELS[date] || date,
    slotStart: startUtc.toISOString(),
    slotEnd: endUtc.toISOString(),
  };
}

export const ISAAC_SLOTS: SlotDef[] = [
  // Pátek 29. 5.: 9–16 (poslední slot 15–16)
  ...Array.from({ length: 7 }, (_, i) => makeSlot("2026-05-29", 9 + i)),
  // Sobota 30. 5.: 14–16 (poslední slot 15–16)
  ...Array.from({ length: 2 }, (_, i) => makeSlot("2026-05-30", 14 + i)),
  // Neděle 31. 5.: 9–16 (poslední slot 15–16, zápůjčky končí v 16:00 kvůli dojezdu Závodu Míru)
  ...Array.from({ length: 7 }, (_, i) => makeSlot("2026-05-31", 9 + i)),
];

export const ISAAC_DAYS: { date: string; label: string; slots: SlotDef[] }[] = [
  {
    date: "2026-05-29",
    label: "Pátek 29. 5.",
    slots: ISAAC_SLOTS.filter((s) => s.date === "2026-05-29"),
  },
  {
    date: "2026-05-30",
    label: "Sobota 30. 5.",
    slots: ISAAC_SLOTS.filter((s) => s.date === "2026-05-30"),
  },
  {
    date: "2026-05-31",
    label: "Neděle 31. 5.",
    slots: ISAAC_SLOTS.filter((s) => s.date === "2026-05-31"),
  },
];
