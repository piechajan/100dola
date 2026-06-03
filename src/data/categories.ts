export interface SubCategory {
  id: string;
  name: string;
  children?: SubCategory[];
}

export interface TopCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  subcategories: SubCategory[];
}

export const BRANDS = [
  { id: "scott",       name: "Scott",        logo: "/brands/scott.svg" },
  { id: "isaac",       name: "Isaac",        logo: "/brands/isaac.svg" },
  { id: "lapierre",    name: "Lapierre",     logo: "/brands/lapierre.svg" },
  { id: "ghost",       name: "Ghost",        logo: "/brands/ghost.svg" },
  { id: "pells",       name: "Pells",        logo: "/brands/pells.svg" },
  { id: "look",        name: "Look",         logo: "/brands/look.svg" },
  { id: "syncros",     name: "Syncros",      logo: "/brands/syncros.svg" },
  { id: "ffwd",        name: "FFWD",         logo: "/brands/ffwd.svg" },
  { id: "pinarello",   name: "Pinarello",    logo: "/brands/pinarello.svg" },
  { id: "continental", name: "Continental",  logo: "/brands/continental.svg" },
  { id: "magicshine",  name: "MagicShine",   logo: "/brands/magicshine.png" },
  { id: "muc-off",     name: "Muc-Off",      logo: "/brands/muc-off.png" },
  { id: "sponser",     name: "Sponser",      logo: "/brands/sponser.png" },
] as const;

export type BrandId = typeof BRANDS[number]["id"];

export const categories: TopCategory[] = [
  {
    id: "kola",
    name: "Kola",
    icon: "🚴",
    color: "#3B7CF4",
    description: "Silniční, MTB, gravel, triatlonové i elektrokola od prověřených značek.",
    subcategories: [
      {
        id: "silnicni",
        name: "Silniční",
        children: [
          { id: "silnicni-endurance", name: "Endurance" },
          { id: "silnicni-aero", name: "Aero" },
          { id: "silnicni-race", name: "Race" },
        ],
      },
      {
        id: "mtb",
        name: "MTB",
        children: [
          { id: "mtb-pevna", name: "Pevná vidlice" },
          { id: "mtb-celoodpruzena", name: "Celoodpružená" },
        ],
      },
      {
        id: "gravel",
        name: "Gravel",
        children: [
          { id: "gravel-1x", name: "Jednopřevodník" },
          { id: "gravel-2x", name: "Dvoupřevodník" },
        ],
      },
      {
        id: "triatlon",
        name: "Triatlon / TT",
        children: [],
      },
      {
        id: "elektro",
        name: "Elektrokola",
        children: [],
      },
    ],
  },
  {
    id: "obleceni",
    name: "Oblečení",
    icon: "👕",
    color: "#1F4937",
    description: "Dresy, kalhoty, bundy a doplňky pro každé počasí.",
    subcategories: [
      { id: "obleceni-dresy", name: "Dresy", children: [] },
      { id: "obleceni-kalhoty", name: "Kalhoty & laclové", children: [] },
      { id: "obleceni-bundy", name: "Bundy & vesty", children: [] },
      { id: "obleceni-spodni", name: "Spodní prádlo", children: [] },
      { id: "obleceni-zima", name: "Zimní vrstvy", children: [] },
      { id: "obleceni-rukavice-ponozky", name: "Rukavice & ponožky", children: [] },
    ],
  },
  {
    id: "zima",
    name: "Zima",
    icon: "⛷️",
    color: "#7C5CBF",
    description: "Lyže, skialpy, běžky a vše pro zimní sezónu.",
    subcategories: [
      {
        id: "lyze",
        name: "Lyže",
        children: [
          { id: "lyze-radius-do-13", name: "Radius do 13 m" },
          { id: "lyze-radius-13-16", name: "Radius 13–16 m" },
          { id: "lyze-radius-16plus", name: "Radius 16 m+" },
        ],
      },
      {
        id: "skialpy",
        name: "Skialpy",
        children: [
          { id: "skialpy-boty", name: "Boty" },
          { id: "skialpy-lyze", name: "Lyže" },
          { id: "skialpy-vazani", name: "Vázání" },
          { id: "skialpy-pasy", name: "Pásy" },
          { id: "skialpy-hulky", name: "Hůlky" },
        ],
      },
      {
        id: "bezky",
        name: "Běžky",
        children: [
          { id: "bezky-klasika", name: "Klasický styl" },
          { id: "bezky-skate", name: "Skate" },
        ],
      },
    ],
  },
  {
    id: "pece-o-kola",
    name: "Péče o kola",
    icon: "🔧",
    color: "#E8431A",
    description: "Čistění, mazání a údržba — aby kolo jezdilo jako první den.",
    subcategories: [
      { id: "pece-ram", name: "Péče o rám", children: [] },
      { id: "pece-vidlice", name: "Péče o vidlici", children: [] },
      { id: "pece-retez", name: "Mazání na řetěz", children: [] },
      { id: "pece-myti", name: "Mytí", children: [] },
    ],
  },
  {
    id: "vyziva",
    name: "Výživa",
    icon: "⚡",
    color: "#2EAA6E",
    description: "Gely, ionťáky, tyčinky a suplementy pro výkon.",
    subcategories: [
      { id: "vyziva-iontaky", name: "Ionťáky", children: [] },
      { id: "vyziva-gely", name: "Gely", children: [] },
      { id: "vyziva-tycinky", name: "Tyčinky", children: [] },
      { id: "vyziva-proteiny", name: "Proteiny", children: [] },
      { id: "vyziva-kreatin", name: "Kreatin", children: [] },
      { id: "vyziva-regenerace", name: "Regenerace", children: [] },
    ],
  },
  {
    id: "doplnky",
    name: "Doplňky",
    icon: "🛡️",
    color: "#E8A020",
    description: "Helmy, tretry, komponenty, osvětlení a vše ostatní.",
    subcategories: [
      {
        id: "helmy",
        name: "Helmy",
        children: [
          { id: "helmy-kolo", name: "Kolo" },
          { id: "helmy-lyze", name: "Lyže" },
          { id: "helmy-skialpy", name: "Skialpy" },
        ],
      },
      {
        id: "tretry",
        name: "Tretry",
        children: [
          { id: "tretry-silnicni", name: "Silniční" },
          { id: "tretry-gravel", name: "Gravel" },
          { id: "tretry-mtb", name: "MTB" },
        ],
      },
      {
        id: "riditka",
        name: "Řídítka",
        children: [
          { id: "riditka-silnicni", name: "Silniční" },
          { id: "riditka-gravel", name: "Gravel" },
          { id: "riditka-mtb", name: "MTB" },
        ],
      },
      {
        id: "sedla",
        name: "Sedla",
        children: [
          { id: "sedla-silnicni", name: "Silniční" },
          { id: "sedla-gravel", name: "Gravel" },
          { id: "sedla-mtb", name: "MTB" },
        ],
      },
      {
        id: "predstavce",
        name: "Představce",
        children: [
          { id: "predstavce-silnicni", name: "Silniční" },
          { id: "predstavce-gravel", name: "Gravel" },
          { id: "predstavce-mtb", name: "MTB" },
        ],
      },
      {
        id: "aero-kokpit",
        name: "Aero kokpit",
        children: [],
      },
      {
        id: "pedaly",
        name: "Pedály",
        children: [
          { id: "pedaly-silnicni", name: "Silniční" },
          { id: "pedaly-gravel", name: "Gravel" },
          { id: "pedaly-mtb", name: "MTB" },
        ],
      },
      {
        id: "osvetleni",
        name: "Osvětlení",
        children: [],
      },
      {
        id: "bryle",
        name: "Brýle",
        children: [
          { id: "bryle-kolo", name: "Kolo" },
          { id: "bryle-lyze", name: "Lyže" },
        ],
      },
      {
        id: "plastre",
        name: "Pláště",
        children: [
          { id: "plastre-silnicni", name: "Silniční" },
          { id: "plastre-gravel", name: "Gravel" },
          { id: "plastre-mtb", name: "MTB" },
        ],
      },
      {
        id: "vyplety",
        name: "Výplety & ráfky",
        children: [
          { id: "vyplety-silnicni", name: "Silniční" },
          { id: "vyplety-gravel", name: "Gravel" },
          { id: "vyplety-mtb", name: "MTB" },
          { id: "vyplety-triatlon", name: "Triatlon / TT" },
        ],
      },
      {
        id: "wattmetry",
        name: "Wattmetry",
        children: [],
      },
    ],
  },
];

// ─── Orthogonal taxonomies (filtry napříč kategoriemi) ───────────────────────

export type Gender = "M" | "F" | "K" | "U"; // muž / žena / dítě / unisex

export const GENDERS: { id: Gender; label: string; icon: string }[] = [
  { id: "M", label: "Pánské", icon: "👨" },
  { id: "F", label: "Dámské", icon: "👩" },
  { id: "K", label: "Dětské", icon: "🧒" },
  { id: "U", label: "Unisex", icon: "🧍" },
];

export type UseCase = "leisure" | "performance" | "race";

export const USE_CASES: { id: UseCase; label: string; description: string }[] = [
  {
    id: "leisure",
    label: "Pohodlné",
    description: "Vyjížďky, dojíždění, rekreační kilometráž.",
  },
  {
    id: "performance",
    label: "Výkonnostní",
    description: "Trénink, dlouhé jízdy, sportovní použití.",
  },
  {
    id: "race",
    label: "Závodní",
    description: "Maximální výkon, závody, race-day výbava.",
  },
];

export function getCategoryById(id: string): TopCategory | undefined {
  return categories.find((c) => c.id === id);
}
