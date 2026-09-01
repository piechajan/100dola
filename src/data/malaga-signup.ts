// Sdílené konstanty pro prodejní Malaga přihlášku (klient i server).
// Bez "server-only" — importuje se do client komponenty i do API/emailů.

export type MalagaTransportTier = "basic" | "exclusive_full" | "exclusive_pickup" | "none";
export type MalagaDirection = "oneway" | "roundtrip";
export type MalagaBikeType = "road" | "gravel" | "mtb" | "ebike";
export type MalagaStorageAfter = "no" | "winter" | "yearround";
export type MalagaYesNo = "interest" | "no";
export type MalagaAccommodation = "interest" | "own";
export type MalagaGroupKind = "individual" | "group" | "club";

export interface OptionCard<T extends string> {
  value: T;
  label: string;
  icon: string;
  description: string;
}

// Ceny „od" — jeden zdroj pravdy je src/data/malaga.ts; tady jen pro copy karet.
export const TRANSPORT_TIER_OPTIONS: OptionCard<MalagaTransportTier>[] = [
  {
    value: "basic",
    label: "Basic — dovezu kolo sám",
    icon: "📦",
    description:
      "Kolo přivezeš zabalené v boxu/krabici na sběrné místo. Nejlevnější varianta. One-way od 125 €, round-trip od 200 €.",
  },
  {
    value: "exclusive_full",
    label: "Exclusive — vyzvedneme a připravíme",
    icon: "⭐",
    description:
      "Vyzvedneme kolo u tebe, zabalíme a připravíme na cestu. V Malaze ti ho složíme a nachystáme — přijedeš a jedeš.",
  },
  {
    value: "exclusive_pickup",
    label: "Exclusive — jen svoz od tebe",
    icon: "🚚",
    description:
      "Kolo máš zabalené v boxu/krabici, jen ho vyzvedneme u tebe a odvezeme. Bez balení a přípravy.",
  },
  {
    value: "none",
    label: "Dopravu neřeším",
    icon: "🚲",
    description: "Kolo už mám v Malaze nebo si dopravu zajistím jinak.",
  },
];

export const DIRECTION_OPTIONS: OptionCard<MalagaDirection>[] = [
  { value: "roundtrip", label: "Zpáteční", icon: "🔁", description: "Tam i zpět. Ušetříš 50 €." },
  { value: "oneway", label: "Jednosměrná", icon: "➡️", description: "Jen jedním směrem." },
];

export const BIKE_TYPE_OPTIONS: OptionCard<MalagaBikeType>[] = [
  { value: "road", label: "Silniční", icon: "🚴", description: "" },
  { value: "gravel", label: "Gravel", icon: "🌾", description: "" },
  { value: "mtb", label: "MTB", icon: "⛰️", description: "" },
  { value: "ebike", label: "E-bike", icon: "🔋", description: "Příplatek (one-way +100 €, round-trip +150 €)." },
];

// SPONSER položky k předobjednání na místě (za zvýhodněné ceny pro účastníky).
export const NUTRITION_ITEMS: { key: string; label: string }[] = [
  { key: "gel", label: "Gel" },
  { key: "proteinBar", label: "Proteinová tyčinka" },
  { key: "energyBar", label: "Energetická tyčinka" },
  { key: "protein", label: "Protein" },
  { key: "electrolyteTabs", label: "Elektrolyty v tabletách" },
  { key: "isoDrink", label: "Iontový nápoj" },
];

export const STORAGE_AFTER_OPTIONS: OptionCard<MalagaStorageAfter>[] = [
  { value: "no", label: "Ne, vezu zpět", icon: "↩️", description: "Kolo se vrací s tebou." },
  { value: "winter", label: "Přes zimu", icon: "❄️", description: "Kolo počká v Malaze do jara. Od 69 €/měs, sezóna od 449 €." },
  { value: "yearround", label: "Celoročně", icon: "🗓️", description: "Kolo zůstává v Malaze jako základna." },
];

// ── Label mapy (pro emaily / souhrny) ───────────────────────────────────────

function labelMap<T extends string>(opts: OptionCard<T>[]): Record<T, string> {
  return opts.reduce((acc, o) => {
    acc[o.value] = o.label;
    return acc;
  }, {} as Record<T, string>);
}

export const TRANSPORT_TIER_LABELS = labelMap(TRANSPORT_TIER_OPTIONS);
export const DIRECTION_LABELS = labelMap(DIRECTION_OPTIONS);
export const BIKE_TYPE_LABELS = labelMap(BIKE_TYPE_OPTIONS);
export const STORAGE_AFTER_LABELS = labelMap(STORAGE_AFTER_OPTIONS);

export const GROUP_KIND_LABELS: Record<MalagaGroupKind, string> = {
  individual: "Jednotlivec",
  group: "Skupina",
  club: "Klub",
};

// Krátký štítek pro předmět notifikace (např. „Exclusive · round-trip").
export function malagaTierShort(tier: MalagaTransportTier, direction?: MalagaDirection | null): string {
  const t =
    tier === "basic"
      ? "Basic"
      : tier === "exclusive_full"
        ? "Exclusive (full)"
        : tier === "exclusive_pickup"
          ? "Exclusive (svoz)"
          : "Bez dopravy";
  if (tier === "none" || !direction) return t;
  return `${t} · ${direction === "roundtrip" ? "round-trip" : "one-way"}`;
}

// Struktura uložená do event_signups.options (jsonb).
export interface MalagaSignupOptions {
  groupKind?: MalagaGroupKind;
  transportTier: MalagaTransportTier;
  direction?: MalagaDirection;
  bikeCount?: number;
  bikeType?: MalagaBikeType;
  storageAfter?: MalagaStorageAfter;
  accommodation: MalagaAccommodation;
  nutritionSponser: MalagaYesNo;
  nutritionPrefs?: string;
  nutritionItems?: Record<string, number>;
  term?: string;
  focus?: string;
}

// Přehledné řádky pro notifikaci Janovi (podklad na nabídku).
export function malagaSummaryLines(o: MalagaSignupOptions): { label: string; value: string }[] {
  const lines: { label: string; value: string }[] = [];
  if (o.groupKind) lines.push({ label: "Typ", value: GROUP_KIND_LABELS[o.groupKind] });

  lines.push({ label: "Doprava kola", value: TRANSPORT_TIER_LABELS[o.transportTier] });
  if (o.transportTier !== "none") {
    if (o.direction) lines.push({ label: "Směr", value: DIRECTION_LABELS[o.direction] });
    if (o.bikeCount) lines.push({ label: "Počet kol", value: String(o.bikeCount) });
    if (o.bikeType) lines.push({ label: "Typ kola", value: BIKE_TYPE_LABELS[o.bikeType] });
    if (o.storageAfter) lines.push({ label: "Kolo po akci", value: STORAGE_AFTER_LABELS[o.storageAfter] });
  }

  lines.push({
    label: "Ubytování",
    value: o.accommodation === "interest" ? "Zájem — zařídíme my" : "Vlastní",
  });
  lines.push({
    label: "Výživa SPONSER",
    value: o.nutritionSponser === "interest" ? "Zájem (za zvýhodněné ceny)" : "Nemá zájem",
  });
  if (o.nutritionItems) {
    const itemLabels = new Map(NUTRITION_ITEMS.map((it) => [it.key, it.label]));
    const picked = Object.entries(o.nutritionItems)
      .filter(([, qty]) => qty > 0)
      .map(([key, qty]) => `${itemLabels.get(key) ?? key} ×${qty}`);
    if (picked.length) lines.push({ label: "SPONSER položky", value: picked.join(", ") });
  }
  if (o.nutritionPrefs) lines.push({ label: "Poznámka k výživě", value: o.nutritionPrefs });
  if (o.term) lines.push({ label: "Termín", value: o.term });
  if (o.focus) lines.push({ label: "Zaměření", value: o.focus });
  return lines;
}
