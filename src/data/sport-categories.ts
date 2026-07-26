// Sport pillar — kategorie pro /sport/* sub-routes.
// Single source of truth pro Navbar dropdown + stub stránky.

export interface SportCategory {
  slug: string;
  label: string;
  icon: string;
  intro: string;       // Krátké pozicování (1 věta) pro stub
  whatComing: string;  // Co se chystá (2-3 věty)
  group: "activity" | "category" | "collection";
}

export const SPORT_CATEGORIES: SportCategory[] = [
  // — Podle sportu —
  {
    slug: "cyklistika",
    label: "Cyklistika",
    icon: "🚴",
    intro: "Road, gravel, MTB i triatlon — vše, co se hodí pro vážnou jízdu.",
    whatComing: "Připravujeme katalog kol Scott, Lapierre, Ridley a Pinarello, sezónní oblečení Q36.5, helmy a doplňky. Mezitím se podívej na naše doporučené modely v shopu.",
    group: "activity",
  },
  {
    slug: "beh",
    label: "Běh & Trail",
    icon: "🏃",
    intro: "Silnice i trail — boty, oblečení a výživa pro běhání.",
    whatComing: "Sekce roste s naší vlastní zkušeností. Budou tu doporučené modely bot a běžeckého oblečení, které sami jezdíme a testujeme.",
    group: "activity",
  },
  {
    slug: "turistika",
    label: "Turistika & Trek",
    icon: "🥾",
    intro: "Jednodenní túry i via ferraty — backpack vybavení.",
    whatComing: "Plánujeme katalog batohů, treková obuv, výživa na dlouhé výlety a doplňky pro výškové akce.",
    group: "activity",
  },
  {
    slug: "zima",
    label: "Zimní sporty",
    icon: "⛷️",
    intro: "Skialpy, běžky a backcountry — výbava pro zimní pohyb.",
    whatComing: "Připravujeme katalog skialpových lyží Dynastar, vázání, batohů s ABS, lavinového vybavení a běžeckého oblečení.",
    group: "activity",
  },

  // — Podle kategorie —
  {
    slug: "obleceni",
    label: "Oblečení",
    icon: "👕",
    intro: "Dresy, kalhoty, vesty a větrovky — to, co opravdu funguje na dlouhých kilometrech.",
    whatComing: "Q36.5, MAAP a další značky, které sami nosíme. Sezónní kolekce budou letos rozšířené o gravel a zimní vrstvy.",
    group: "category",
  },
  {
    slug: "obuv",
    label: "Obuv",
    icon: "👟",
    intro: "Tretry, běžecké boty, treková obuv — pro každou aktivitu.",
    whatComing: "Plánujeme nabídku silničních tretrů, gravel/MTB obuvi a trail running modelů s vlastním testem na páteřním tempu.",
    group: "category",
  },
  {
    slug: "helmy",
    label: "Helmy & přilby",
    icon: "⛑️",
    intro: "Aero i klasické cyklo helmy — bezpečnost je pro nás první.",
    whatComing: "Connect models s integrovaným světlem (Magicshine), aero helmy pro silnici, all-mountain pro MTB.",
    group: "category",
  },
  {
    slug: "vyziva",
    label: "Výživa & doplňky",
    icon: "⚡",
    intro: "Isotonické nápoje, gely, tyčinky — ověřené na dlouhých výjezdech.",
    whatComing: "Sponser, SiS, Maurten a další osvědčené značky. Připravujeme sady na konkrétní disciplíny.",
    group: "category",
  },
  {
    slug: "vybaveni",
    label: "Vybavení & doplňky",
    icon: "🎒",
    intro: "Bidony, brašničky, GPS držáky, taštičky pod sedlo.",
    whatComing: "Drobné vybavení, které dělá ride komfortnější — od bidonů po nářadí na trasu.",
    group: "category",
  },
  {
    slug: "elektronika",
    label: "Elektronika & GPS",
    icon: "📡",
    intro: "GPS počítače, světla, senzory — chytré vybavení pro chytrou jízdu.",
    whatComing: "Wahoo, Garmin, Magicshine. Připravujeme i sady pro radary, světla a navigaci, které spolu fungují bez kompromisů.",
    group: "category",
  },

  // — Speciální —
  {
    slug: "kolekce",
    label: "Jarní kolekce 2026",
    icon: "🌸",
    intro: "Road & Gravel kolekce 2026 — výběr na novou sezónu.",
    whatComing: "Spojení kola, dresů, helem a doplňků do jedné kompaktní kolekce. Vybírali jsme tak, aby všechno spolu sedělo — vizuálně i funkčně.",
    group: "collection",
  },
];

export function getSportCategory(slug: string): SportCategory | undefined {
  return SPORT_CATEGORIES.find((c) => c.slug === slug);
}

export const SPORT_BRAND = {
  color: "#3B7CF4",
  colorDark: "#2563CC",
  colorLight: "#7EA8F8",
  bgSoft: "#F0F4FF",
} as const;
