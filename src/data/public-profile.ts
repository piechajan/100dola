// Veřejný profil účastníka („Kdo jede") — vše volitelné, jen se souhlasem se
// zveřejněním. Veřejně se ukazuje jen KŘESTNÍ jméno (ne příjmení).

export interface PublicProfile {
  age?: number;
  city?: string;
  style?: string; // silnice / gravel / mtb
  tempo?: string; // pohoda / rekreacni / vykon
  instagram?: string; // handle bez @ (přirozené propojení)
}

export const STYLE_OPTIONS: { value: string; label: string }[] = [
  { value: "silnice", label: "Silnice" },
  { value: "gravel", label: "Gravel" },
  { value: "mtb", label: "MTB" },
];

export const TEMPO_OPTIONS: { value: string; label: string }[] = [
  { value: "pohoda", label: "Pohodář" },
  { value: "rekreacni", label: "Rekreační" },
  { value: "vykon", label: "Výkonnostní" },
];

const STYLE_LABELS = new Map(STYLE_OPTIONS.map((o) => [o.value, o.label]));
const TEMPO_LABELS = new Map(TEMPO_OPTIONS.map((o) => [o.value, o.label]));

// Křestní jméno pro veřejné zobrazení.
export function firstNameOf(full: string): string {
  return full.trim().split(/\s+/)[0] || full;
}

// Krátký meta řádek do karty účastníka: „34 · Valmez · Gravel · Pohodář".
export function profileMeta(p: {
  age?: number | null;
  city?: string | null;
  style?: string | null;
  tempo?: string | null;
}): string {
  return [
    p.age ? String(p.age) : null,
    p.city || null,
    p.style ? STYLE_LABELS.get(p.style) ?? p.style : null,
    p.tempo ? TEMPO_LABELS.get(p.tempo) ?? p.tempo : null,
  ]
    .filter(Boolean)
    .join(" · ");
}
