/**
 * Color family mapping — group 138 unique colors do hlavních rodin pro filter chips.
 * Plus hex swatch pro preview.
 */

export interface ColorFamily {
  id: string;
  label: string;
  hex: string;       // pro chip swatch
  keywords: RegExp;  // co spadá pod tuto rodinu
}

export const COLOR_FAMILIES: ColorFamily[] = [
  { id: "black", label: "Černá", hex: "#1a1a2e", keywords: /\b(black|charcoal|onyx|carbon|anthracite)\b/i },
  { id: "white", label: "Bílá", hex: "#FFFFFF", keywords: /\b(white|cream|ivory|snow|natural)\b/i },
  { id: "grey", label: "Šedá", hex: "#9AA3C2", keywords: /\b(grey|gray|stone|steel|titanium|stucco|silver|smoke|cement|graphite)\b/i },
  { id: "red", label: "Červená", hex: "#E8431A", keywords: /\b(red|burgundy|bordeaux|wine|cherry|ruby|crimson|scarlet|cardinal|coral)\b/i },
  { id: "orange", label: "Oranžová", hex: "#F97316", keywords: /\b(orange|ginger|amber|peach|salmon|terracotta|brick|rust)\b/i },
  { id: "yellow", label: "Žlutá", hex: "#FACC15", keywords: /\b(yellow|gold|fluo\s*yellow|mustard|lemon|sunshine|sand)\b/i },
  { id: "green", label: "Zelená", hex: "#2EAA6E", keywords: /\b(green|eucalyptus|moss|army|olive|forest|mint|emerald|sage|jade|lime|kale)\b/i },
  { id: "blue", label: "Modrá", hex: "#3B7CF4", keywords: /\b(blue|navy|azure|ink|cobalt|denim|royal|sky|teal|aqua|cyan|petrol|aegean)\b/i },
  { id: "purple", label: "Fialová", hex: "#9333EA", keywords: /\b(purple|violet|lavender|wisteria|mauve|prune|aubergine|plum|grape|amethyst|orchid|jacaranda)\b/i },
  { id: "pink", label: "Růžová", hex: "#EC4899", keywords: /\b(pink|flamingo|rose|magenta|fuchsia|raspberry|berry|blush|hot\s*pink|bossa\s*nova)\b/i },
  { id: "brown", label: "Hnědá", hex: "#92400E", keywords: /\b(brown|chocolate|coffee|tan|camel|chestnut|tobacco|bronze|fango|cave|earth|mocha|caramel)\b/i },
  { id: "beige", label: "Béžová", hex: "#D4B896", keywords: /\b(beige|nude|sebino|stucco|ecru|sand|khaki|taupe|stone|biscuit)\b/i },
  { id: "multicolor", label: "Multicolor", hex: "linear-gradient(135deg,#E8431A,#FACC15,#2EAA6E,#3B7CF4,#9333EA)", keywords: /\b(multicolor|combo|mix|rainbow|print|pattern|graphic|abstract)\b/i },
];

export function colorToFamily(raw: string | null | undefined): ColorFamily | null {
  if (!raw) return null;
  const norm = raw.toLowerCase().trim();
  for (const fam of COLOR_FAMILIES) {
    if (fam.keywords.test(norm)) return fam;
  }
  return null;
}

export function colorFamilyId(raw: string | null | undefined): string | null {
  return colorToFamily(raw)?.id ?? null;
}

/**
 * Rozloží název barvy na jednotlivé barevné rodiny (dvoubarevná kola apod.).
 * „Cumulus White/Carbon Black" → [white, black]; „Gelato Blue / Gelato Pink" → [blue, pink].
 */
export function colorToFamilies(raw: string | null | undefined): ColorFamily[] {
  if (!raw) return [];
  const parts = raw
    .split(/[/&+]|\s-\s/)
    .map((s) => s.trim())
    .filter(Boolean);
  const out: ColorFamily[] = [];
  for (const p of parts) {
    const fam = colorToFamily(p);
    if (fam && !out.some((f) => f.id === fam.id)) out.push(fam);
  }
  if (out.length === 0) {
    const fam = colorToFamily(raw);
    if (fam) out.push(fam);
  }
  return out;
}

/**
 * CSS `background` hodnota pro swatch tečku. U dvoubarevných názvů vrací
 * diagonální split (dvě barvy), jinak jednu barvu (příp. fallback hex).
 */
export function swatchBackground(
  raw: string | null | undefined,
  fallbackHex?: string,
): string {
  const fams = colorToFamilies(raw);
  if (fams.length >= 2) {
    const [a, b] = fams;
    return `linear-gradient(135deg, ${a.hex} 0 50%, ${b.hex} 50% 100%)`;
  }
  return fams[0]?.hex ?? fallbackHex ?? "#9AA3C2";
}
