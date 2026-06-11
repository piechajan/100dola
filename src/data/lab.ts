// 100dola Lab — single source of truth pro Lab sekci.
// Po prvních realizacích vyměnit Unsplash placeholdery za vlastní foto v /public/media/lab/.

export const LAB_BRAND = {
  name: "100dola Lab",
  tagline: "Kultivace stroje",
  color: "#1F4937",       // deep emerald (base)
  colorDark: "#163528",
  colorLight: "#2E6651",
  bgDark: "#0F1A14",
  bgMid: "#1A2620",
  // Champagne / brushed brass accent — premium řemeslo, ne kasino zlato
  brass: "#C9A86E",       // světlejší — na tmavé pozadí
  brassDark: "#8C6A3F",   // tmavší — na světlé pozadí (čitelnost)
} as const;

export const LAB_HERO = {
  eyebrow: "100dola Lab — kultivace stroje",
  h1Line1: "Tichý posun.",
  h1Line2: "Vyladěné kolo.",
  sub: "Keramická ložiska, ochrana laku, voskování řetězu. O pár wattů rychleji.",
  ctaPrimary: "Naceň úpravu mého kola",
  ctaSecondary: "Co všechno Lab umí",
  image: "/media/lab/pinarello-dogma-hero.jpg",
};

export const LAB_INTRO = {
  title: "Lab není detailing. Je to kultivace stroje.",
  lead:
    "Tři věci, díky kterým drahé kolo jezdí dál, déle a rychleji — vyladění, ochrana, péče. Bez kompromisů na materiálech, s dokumentací každého zásahu.",
  pillars: [
    { icon: "⚡", title: "Vyladění", text: "Keramická ložiska, build check, fit. Vše se točí lépe a o pár wattů rychleji." },
    { icon: "🛡", title: "Ochrana", text: "PPF folie a keramika laku. Carbon a lak přečkají sezóny bez šrámů a šedi." },
    { icon: "🧪", title: "Péče", text: "Voskování řetězu, cleanup, servisní diagnostika. Drivetrain tichý, vše dotažené." },
  ],
};

export interface LabService {
  slug: string;
  label: string;       // brand-named ("Lab Bearings")
  eyebrow: string;     // krátké pozicování ("Rychlejší kolo")
  title: string;       // generický název ("Keramická ložiska")
  description: string;
  bullets: string[];
  priceFrom: string;
  image: string;
}

export const LAB_SERVICES: LabService[] = [
  {
    slug: "bearings",
    label: "Lab Bearings",
    eyebrow: "Rychlejší kolo",
    title: "Keramická ložiska",
    description:
      "Náboje, středové složení, pedály. Menší tření = lépe se točí. Rozdíl cítíš zejména na dlouhých kilometrech a v rovinách.",
    bullets: [
      "Náboje, středové složení, pedály",
      "Měřitelně méně třecích ztrát (watty navíc)",
      "Životnost cca 3× delší než standardních ložisek",
    ],
    priceFrom: "od 4 900 Kč",
    image:
      "https://images.unsplash.com/photo-1571333250630-f0230c320b6d?w=900&h=700&fit=crop&auto=format&q=80",
  },
  {
    slug: "shield",
    label: "Lab Shield",
    eyebrow: "Ochrana carbon",
    title: "PPF folie na rám",
    description:
      "Transparentní fólie chrání carbon proti odřením od bidonů, kamínkům z cesty, kapkám potu i šrámům při transportu.",
    bullets: [
      "Kompletní rám / přední trojúhelník / lokální zóny",
      "Self-healing povrch (drobné šrámy mizí teplem)",
      "Životnost 5+ let, vrácení carbonu do originálu",
    ],
    priceFrom: "od 2 950 Kč",
    image: "/media/lab/ppf-folie-ram.webp",
  },
  {
    slug: "glaze",
    label: "Lab Glaze",
    eyebrow: "Lesk a snadné čištění",
    title: "Keramická ochrana laku",
    description:
      "Tekutá keramika vytvoří hladkou bariéru. Špína a voda se na laku drží míň, čištění je rychlejší, lak vydrží barvu déle.",
    bullets: [
      "Hydrofobní efekt — voda steče i s nečistotami",
      "UV ochrana proti vyblednutí laku",
      "Trvanlivost 1–3 roky podle režimu jízdy",
    ],
    priceFrom: "od 2 950 Kč",
    image: "/media/lab/pinarello-dogma-hero.jpg",
  },
  {
    slug: "wax",
    label: "Lab Wax",
    eyebrow: "Tichý a čistý drivetrain",
    title: "Voskování řetězu",
    description:
      "Parafínový vosk místo oleje. Tichý chod, čistý drivetrain, nižší opotřebení převodů a kazety. Brzy také na e-shopu — předvoskované řetězy XT, Ultegra, XTR, Dura-Ace, ready k nasazení.",
    bullets: [
      "Nový řetěz (vlastní) — od 500 Kč",
      "Používaný řetěz — cena se zvyšuje o odmaštění",
      "Jednorázové / sezónní (6 měsíců) / roční smlouva",
      "Méně třecích ztrát než olej, drivetrain zůstává čistý",
    ],
    priceFrom: "od 500 Kč",
    image:
      "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=900&h=700&fit=crop&auto=format&q=80",
  },
  {
    slug: "cleanup",
    label: "Lab Cleanup",
    eyebrow: "Reset",
    title: "Kompletní cleanup + servisní check",
    description:
      "Důkladné čištění, diagnostika všech komponent, drobný servis. Kolo přijde po sezóně špinavé, vrátí se vyladěné.",
    bullets: [
      "Pre-sezónní nebo post-sezónní reset",
      "Servisní diagnostika + drobný servis",
      "Foto-dokumentace stavu před/po",
    ],
    priceFrom: "od 1 900 Kč",
    image:
      "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=900&h=700&fit=crop&auto=format&q=80",
  },
  {
    slug: "fit",
    label: "Lab Fit",
    eyebrow: "Build & fit check",
    title: "Kontrola buildu a fitu",
    description:
      "Kontrola momentů, alignement, základní bike fit. Pro kola po servisu, po transportu nebo na začátku sezóny.",
    bullets: [
      "Kontrola momentů a alignementu",
      "Základní bike fit (sedlo, kontaktní body)",
      "Doporučení + foto-dokumentace",
    ],
    priceFrom: "od 1 500 Kč",
    image:
      "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=900&h=700&fit=crop&auto=format&q=80",
  },
];

export const LAB_WHY = {
  title: "Proč Lab a ne servis za rohem",
  lead: "Lab není levnější ani rychlejší. Je důslednější.",
  pillars: [
    {
      title: "Klidné prostředí",
      text: "Tvoje kolo nečeká v hromadě. Pracujeme po jednom kole, v čisté dílně, bez chaosu.",
    },
    {
      title: "Materiály první ligy",
      text: "Žádné kompromisy na fóliích (PPF), voscích a keramických coatingech. Jen značky s reálnou trvanlivostí.",
    },
    {
      title: "Dokumentace každého zásahu",
      text: "Foto před, foto po, popis co se dělalo. Klient má referenci a v případě potřeby evidenci.",
    },
    {
      title: "Garance na PPF",
      text: "Na nalepenou PPF folii dáváme záruku 3 měsíce — pokud se v té době někde odlepí, opravíme bez doplatku. U ostatních zásahů ručíme za provedení podle dohody.",
    },
  ],
};

export const LAB_PROCESS = [
  { step: 1, title: "Předáš kolo", text: "V Labu nebo svozem po Praze. Termín si domluvíš v konfigurátoru nebo přes formulář." },
  { step: 2, title: "Diagnostika", text: "Projedeme stav, odsouhlasíme rozsah a finální cenu. Žádné překvapení v účtu." },
  { step: 3, title: "Práce v Labu", text: "Podle rozsahu 1–5 dnů. Foto-dokumentace v každém kroku." },
  { step: 4, title: "Vyzvedneš si vyladěné", text: "S dokumentací zásahů a doporučením, kdy přijít znovu." },
];

export const LAB_GALLERY = [
  {
    src: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=1400&h=1050&fit=crop&auto=format&q=80",
    alt: "Detail road kola — vyleštěný drivetrain",
  },
  {
    src: "https://images.unsplash.com/photo-1502161254066-6c74afbf07aa?w=1400&h=1050&fit=crop&auto=format&q=80",
    alt: "Road bike studio — celkový pohled",
  },
  {
    src: "https://images.unsplash.com/photo-1505705694340-019e1e335916?w=1400&h=1050&fit=crop&auto=format&q=80",
    alt: "Makro detail carbon rámu",
  },
  {
    src: "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=1400&h=1050&fit=crop&auto=format&q=80",
    alt: "Workshop — kolo na servisním stojanu",
  },
  {
    src: "https://images.unsplash.com/photo-1571333250630-f0230c320b6d?w=1400&h=1050&fit=crop&auto=format&q=80",
    alt: "Detail čistého řetězu po voskování",
  },
  {
    src: "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=1400&h=1050&fit=crop&auto=format&q=80",
    alt: "Premium road kolo — bok rámu",
  },
];

export const LAB_FAQ = [
  {
    q: "Jak dlouho kolo zůstává v Labu?",
    a: "Podle rozsahu. Voskování řetězu hotové do druhého dne, kompletní Shield + Glaze 3–5 dnů. Přesný termín potvrdíme předem.",
  },
  {
    q: "Co když se kolo poškodí?",
    a: "Lab je pojištěný a každé kolo máme nafoceno před zásahem. V případě sporu existuje jasná dokumentace původního stavu.",
  },
  {
    q: "Co znamená „rychlejší kolo“ u keramických ložisek?",
    a: "Keramická ložiska mají menší tření než ocelová. V praxi to znamená měřitelně méně třecích ztrát — kolo se točí déle ve volnoběhu a na dlouhých kilometrech ušetříš watty.",
  },
  {
    q: "Můžu si kolo nechat zavézt?",
    a: "Ano, lze to po domluvě zařídit.",
  },
  {
    q: "Jak dlouho zásahy vydrží?",
    a: "Záleží na podmínkách — kolik najezdíš, v jakém počasí, jak často kolo myješ, jestli silnice nebo MTB. PPF folie obecně vydrží roky, Lab Glaze měsíce až roky, voskování se doplňuje podle stylu jízdy. Co je ale doložené nezávislým testováním: řetěz s parafinovým voskem vydrží 2–3× déle než s běžným olejem (ZeroFriction Cycling). Konkrétní termín další péče doporučíme po prohlídce kola.",
  },
  {
    q: "Můžu si vybrat jen jednu věc, ne celý balíček?",
    a: "Žádný balíček není povinný. Vyber si jen to, co dává smysl pro tvoje kolo. Lab není „all or nothing“.",
  },
];

export const LAB_CONTACT = {
  email: "info@100dola.com",
  phone: "+420 739 045 057",
  phoneHref: "+420739045057",
  location: "Praha (přesná adresa Labu se sdílí po domluvě termínu)",
};

export const LAB_CROSS_SELL_MALAGA = {
  eyebrow: "Po Labu do Malagy",
  title: "Vyladěné kolo si zaslouží taky kilometry.",
  text:
    "Když ti kolo vyjde z Labu — keramická ložiska, ochrana laku, čistý drivetrain — má smysl ho neuložit do sklepa, ale rovnou ho vyslat tam, kde se dá jezdit i v zimě. Malaga převezme tvoje kolo na celou off-season a v lednu se na něm dá rovnou jezdit.",
  cta: "Podívat se na Malagu",
  href: "/malaga",
};
