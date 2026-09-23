// Sdílené konstanty pro prodejní Malaga přihlášku (klient i server).
// Bez "server-only" — importuje se do client komponenty i do API/emailů.

export type MalagaTransportTier = "exclusive_i" | "exclusive_ii" | "exclusive_pro" | "basic";
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
    value: "exclusive_i",
    label: "Exclusive I",
    icon: "📦",
    description:
      "Kolo přivezeš zabalené na sběrné místo, my ho doručíme na ubytování v Malaze a po akci zpět do ČR na sběrné místo.",
  },
  {
    value: "exclusive_ii",
    label: "Exclusive II",
    icon: "🚐",
    description:
      "Vyzvedneme kolo přímo u tebe na adrese a po akci ti ho tam zase přivezeme. Příplatek dle najetých km.",
  },
  {
    value: "exclusive_pro",
    label: "Exclusive PRO",
    icon: "🧰",
    description:
      "Vyzvedneme u tebe, zabalíme, v Malaze složíme a nachystáme (sedneš a jedeš), po akci zase zabalíme, přivezeme domů a složíme zpět na ježdění. +3 000 Kč a příplatek dle km.",
  },
  {
    value: "basic",
    label: "Dopravu neřeším",
    icon: "🚲",
    description: "Kolo si dopravím sám / dopravu nepotřebuji.",
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
// `href` = future hook: proklik na konkrétní produkt (interní e-shop URL, ne ven —
// držíme traffic na 100dola.com). Až budou produkty, jen doplnit href u položky.
export const NUTRITION_ITEMS: { key: string; label: string; hint?: string; href?: string }[] = [
  { key: "gel", label: "Gel" },
  { key: "proteinBar", label: "Proteinová tyčinka" },
  { key: "energyBar", label: "Energetická tyčinka" },
  { key: "protein", label: "Protein" },
  {
    key: "electrolyteTabs",
    label: "Elektrolyty v tabletách",
    hint: "tip na vyjížďku — po cestě doplníš jen vodu",
  },
  { key: "isoDrink", label: "Iontový nápoj" },
  { key: "spareTube", label: "Náhradní duše", hint: "light weight" },
];

// Volitelné doplňky / upsell — JEDNOTNÉ se sekcí „Za příplatek" na stránce eventu
// (Event.addons). Zatím BEZ cen — ceny se přidají dle skupiny/místa/termínu později.
// Zájem se ukládá jako pole klíčů do options.addons.
export const MALAGA_ADDON_OPTIONS: { key: string; label: string; hint?: string }[] = [
  { key: "cabinBag", label: "Příruční zavazadlo do letadla", hint: "místo jen batůžku do kabiny" },
  { key: "breakfast", label: "Snídaně", hint: "možnost aktuálně řešíme" },
  { key: "dinner", label: "Večeře", hint: "možnost aktuálně řešíme" },
  { key: "labService", label: "Péče o kolo v Lab před cestou", hint: "mytí, vosk řetězu, profi zabalení do krabice" },
  { key: "serviceKit", label: "Náhradní duše / CO2 / servisní materiál", hint: "dovezeme, ať to nevláčíš přes letiště" },
  { key: "insurance", label: "Cestovní pojištění + pojištění kola", hint: "zajistíme" },
];
export const MALAGA_ADDON_LABELS: Record<string, string> = MALAGA_ADDON_OPTIONS.reduce(
  (acc, o) => { acc[o.key] = o.label; return acc; },
  {} as Record<string, string>,
);

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

// Krátký štítek pro předmět notifikace (např. „Exclusive II · round-trip").
export function malagaTierShort(tier: MalagaTransportTier, direction?: MalagaDirection | null): string {
  const t =
    tier === "exclusive_i"
      ? "Exclusive I"
      : tier === "exclusive_ii"
        ? "Exclusive II"
        : tier === "exclusive_pro"
          ? "Exclusive PRO"
          : "Dopravu neřeší";
  if (tier === "basic" || !direction) return t;
  return `${t} · ${direction === "roundtrip" ? "round-trip" : "one-way"}`;
}

/** Poznámka o ceně dopravy v kontextu balíčku (fall ride). Bez tvrdých čísel u km. */
export function transportPackageNote(tier: MalagaTransportTier): string {
  switch (tier) {
    case "exclusive_i":
      return "Doprava kola (sběrné místo → Malaga → zpět) je u tohoto termínu v ceně balíčku.";
    case "exclusive_ii":
      return "Vyzvednutí a doručení u tebe na adrese — příplatek dle najetých km, doladíme v nabídce.";
    case "exclusive_pro":
      return "Kompletní servis (zabalení, složení a nachystání — sedneš a jedeš) — +3 000 Kč a příplatek dle km, doladíme v nabídce.";
    case "basic":
      return "Dopravu kola neřešíš — z ceny balíčku odečteme 150 €.";
  }
}

// Orientační cena DOPRAVY (Basic = firemní; Exclusive = „od", prémiová po domluvě).
// Ceny drženy v sync s TRANSPORT_PRICES v malaga.ts (one-way 145/ebike 245, round 200/ebike 350).
export interface TransportEstimate {
  total: number;
  perBike: number;
  bikes: number;
  exclusive: boolean;
}
export function estimateTransportEur(o: {
  transportTier: MalagaTransportTier;
  direction?: MalagaDirection;
  bikeCount?: number;
  bikeType?: MalagaBikeType;
}): TransportEstimate | null {
  if (o.transportTier === "basic") return null;
  const bikes = Math.max(1, o.bikeCount ?? 1);
  const ebike = o.bikeType === "ebike";
  const roundtrip = o.direction === "roundtrip";
  const perBike = roundtrip ? (ebike ? 350 : 200) : (ebike ? 245 : 145);
  // „exclusive" = adresní tier (II/PRO) → cena „od", finální dle km po domluvě.
  const addressBased = o.transportTier === "exclusive_ii" || o.transportTier === "exclusive_pro";
  return { total: perBike * bikes, perBike, bikes, exclusive: addressBased };
}

// Struktura uložená do event_signups.options (jsonb).
export interface MalagaSignupOptions {
  groupKind?: MalagaGroupKind;
  city?: string;
  zip?: string;
  street?: string;
  transportTier: MalagaTransportTier;
  direction?: MalagaDirection;
  bikeCount?: number;
  bikeType?: MalagaBikeType;
  storageAfter?: MalagaStorageAfter;
  accommodation: MalagaAccommodation;
  nutritionSponser: MalagaYesNo;
  nutritionPrefs?: string;
  nutritionItems?: Record<string, number>;
  /** Zájem o volitelné doplňky (klíče z MALAGA_ADDON_OPTIONS) — zatím bez cen. */
  addons?: string[];
  term?: string;
  focus?: string;
  // Veřejný profil („Kdo jede") + souhlas s foto/videem — jen se zveřejněním.
  profile?: import("./public-profile").PublicProfile;
  mediaConsent?: boolean;
}

// Přehledné řádky pro notifikaci Janovi (podklad na nabídku).
export function malagaSummaryLines(o: MalagaSignupOptions): { label: string; value: string }[] {
  const lines: { label: string; value: string }[] = [];
  if (o.groupKind) lines.push({ label: "Typ", value: GROUP_KIND_LABELS[o.groupKind] });
  const cityZip = [o.zip, o.city].filter(Boolean).join(" ");
  const addr = [o.street, cityZip].filter(Boolean).join(", ");
  if (addr) {
    lines.push({ label: o.street ? "Adresa vyzvednutí" : "Odkud (město / PSČ)", value: addr });
  }

  lines.push({ label: "Doprava kola", value: TRANSPORT_TIER_LABELS[o.transportTier] });
  if (o.transportTier !== "basic") {
    if (o.direction) lines.push({ label: "Směr", value: DIRECTION_LABELS[o.direction] });
    if (o.bikeCount) lines.push({ label: "Počet kol", value: String(o.bikeCount) });
    if (o.bikeType) lines.push({ label: "Typ kola", value: BIKE_TYPE_LABELS[o.bikeType] });
    if (o.storageAfter) lines.push({ label: "Kolo po akci", value: STORAGE_AFTER_LABELS[o.storageAfter] });
  }
  const est = estimateTransportEur(o);
  if (est) {
    lines.push({
      label: "Orientační cena dopravy",
      value: `${est.exclusive ? "od " : ""}${est.total} €${est.bikes > 1 ? ` (${est.bikes}× ${est.perBike} €)` : ""}`,
    });
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
  if (o.addons && o.addons.length) {
    lines.push({
      label: "Doplňky (zájem)",
      value: o.addons.map((k) => MALAGA_ADDON_LABELS[k] ?? k).join(", "),
    });
  }
  if (o.term) lines.push({ label: "Termín", value: o.term });
  if (o.focus) lines.push({ label: "Zaměření", value: o.focus });
  return lines;
}
