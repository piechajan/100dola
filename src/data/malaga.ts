// Single source of truth pro Malaga sekci.
// PRICING_CONFIRMED 2026-04-30 — Jan Piecha.
// Při změně cen / sezóny / fakta upravuj zde, ne v komponentách.

export const MALAGA_BRAND = {
  color: "#E8431A",          // primární akcent — terakotová / andaluské světlo
  colorDark: "#C0341A",       // hover / pressed
  colorTint: "#FFEFE9",       // světlé pozadí pro sekce
  colorTintBorder: "#FAD0BD",
} as const;

export const MALAGA_FACTS = {
  flightTime: "2,5 hod z Prahy",
  sunnyDays: "300+ slunečných dní",
  baseAirportMinutes: 10,
  winterTempRange: "15–22 °C v zimě",
  seasonLabel: "říjen–květen",
  seasonMonths: 8,
} as const;

// Operační rámec — klíčová věta vysvětlující model dopravy.
// Použít na /malaga/preprava + /malaga/balicky.
export const TRANSPORT_FRAMING = {
  scheduling:
    "Termíny dopravy vyhlašujeme po blocích — typicky 2–3 odjezdy v každém sezónním měsíci.",
  shipping:
    "Tvoje kolo cestuje pojištěné v zabezpečeném transportním boxu, sdíleně s dalšími koly.",
} as const;

// ── Pricing ─────────────────────────────────────────────────────────────────

export interface PriceEntry {
  label: string;
  priceFromEur: number;
  priceEbikeFromEur?: number;
  unit: string;
  note?: string;
}

// E-bike surcharge logic — větší, těžší, složitější manipulace v boxu.
export const EBIKE_SURCHARGE = {
  oneWayEur: 100,
  roundTripEur: 150,
  packageBasicEur: 100,
  packageExclusiveEur: 150,
  reason:
    "E-bike je větší a těžší — zabere víc místa v transportním boxu a vyžaduje pečlivější manipulaci. Baterii bereš sám v příručce dle leteckých pravidel.",
} as const;

export const TRANSPORT_PRICES: PriceEntry[] = [
  {
    label: "Doprava one-way",
    priceFromEur: 299,
    priceEbikeFromEur: 399,
    unit: "za kolo",
    note: "Cesta z Česka do Malagy. Pojištění v ceně.",
  },
  {
    label: "Doprava round-trip",
    priceFromEur: 499,
    priceEbikeFromEur: 649,
    unit: "za kolo",
    note: "Tam i zpět v jedné objednávce. Ušetříš 100 € oproti dvěma jednosměrkám.",
  },
];

export const STORAGE_PRICES: PriceEntry[] = [
  {
    label: "Skladování — měsíčně",
    priceFromEur: 70,
    unit: "za kolo / měsíc",
    note: "Bez závazku délky, fakturace po měsících.",
  },
  {
    label: "Skladování — celá sezóna",
    priceFromEur: 449,
    unit: "za kolo / sezóna (8 měs)",
    note: "Říjen–květen. Ušetříš 111 € oproti měsíčnímu tarifu.",
  },
];

export interface Package {
  id: "basic" | "exclusive";
  name: string;
  tagline: string;
  priceFromEur: number;
  priceEbikeFromEur: number;
  popular?: boolean;
  whatsIncluded: string[];
  whatYouDo: string[];
  bestFor: string;
}

export const PACKAGES: Package[] = [
  {
    id: "basic",
    name: "Basic",
    tagline: "Praktické, cenově vědomé. Vlastní kolo v Malaze bez zbytečného servisu navíc.",
    priceFromEur: 849,
    priceEbikeFromEur: 949,
    whatsIncluded: [
      "Doprava CZ → Malaga (one-way)",
      "Skladování celou sezónu (8 měsíců, říjen–květen)",
      "Předání připraveného kola v Malaze",
    ],
    whatYouDo: [
      "Předáš kolo dle instrukcí v ČR",
      "Setup v Malaze (sedlovka, pedály, drobnosti) si dotáhneš sám",
    ],
    bestFor: "Jezdci, co si rádi šáhnou na vlastní kolo a chtějí nejnižší cenu.",
  },
  {
    id: "exclusive",
    name: "Exclusive",
    tagline: "Maximální komfort. Sedneš a jedeš.",
    priceFromEur: 1349,
    priceEbikeFromEur: 1499,
    popular: true,
    whatsIncluded: [
      "Vše z balíčku Basic",
      "Demontáž a profesionální balení v ČR",
      "Sestavení a servisní kontrola v Malaze",
      "Vyzvednutí na letišti Malaga (AGP)",
    ],
    whatYouDo: [
      "Předáš kolo — zbytek je na nás",
    ],
    bestFor: "Jezdci, kteří chtějí ušetřit čas a přiletět rovnou na ride.",
  },
];

export const ADDONS: PriceEntry[] = [
  {
    label: "Vyzvednutí kola u tebe doma",
    priceFromEur: 0,
    unit: "individuální nabídka",
    note: "Cena podle vzdálenosti a způsobu předání (zabalené × naše rozložení × tvůj nebo náš box). Pošleme nabídku po vyplnění poptávky.",
  },
  {
    label: "Návrat kola do ČR po sezóně",
    priceFromEur: 199,
    unit: "za kolo",
    note: "Doplněk k Basic. U Round-trip varianty je v ceně.",
  },
  {
    label: "Pojištění nadstandard",
    priceFromEur: 0,
    unit: "dohodou",
    note: "Pro kola nad běžnou cenovou hladinu.",
  },
];

export const GROUP_NOTE =
  "Pro skupiny od 5 kol a kluby sestavíme individuální nabídku — vždy podle termínu a obsazenosti přepravy.";

// ── How it works ────────────────────────────────────────────────────────────

export interface HowItWorksStep {
  num: string;
  title: string;
  desc: string;
}

export const HOW_IT_WORKS: HowItWorksStep[] = [
  {
    num: "01",
    title: "Předáš nám kolo v ČR",
    desc: "Domluvíme se na výdejním místě nebo přijedeme k tobě. Předáš kolo buď připravené, nebo ho zabalíme za tebe.",
  },
  {
    num: "02",
    title: "Dovezeme ho do Malagy",
    desc: "Tvoje kolo cestuje pojištěné v zabezpečeném transportním boxu, sdíleně s dalšími koly. Termíny vyhlašujeme po blocích.",
  },
  {
    num: "03",
    title: "Letíš nalehko",
    desc: "Žádné tahání krabice s kolem na letiště ani z letiště. Žádné rozebírání, žádný stres u check-inu. Stačí ti batoh a příručák.",
  },
  {
    num: "04",
    title: "Sedneš a jedeš",
    desc: "V Malaze na tebe kolo čeká. U Basic si doděláš pár věcí sám, u Exclusive je úplně připravené k jízdě.",
  },
];

// ── Why own bike ────────────────────────────────────────────────────────────

export const WHY_OWN_BIKE: { title: string; body: string }[] = [
  {
    title: "Tvůj fit, tvůj setup",
    body: "Sedlovka, pedály, geometrie, sedlo — všechno přesně, jak jsi zvyklý. Žádné dvouhodinové experimenty první den.",
  },
  {
    title: "Bez opakovaného balení",
    body: "Kolo nám předáš jednou a my ho dovezeme do Malagy. Pak už jen lítáš nalehko — žádné rozebírání, žádné shánění krabice na kolo.",
  },
  {
    title: "Bez tahání krabice na letiště a z letiště",
    body: "Žádné taxíky s nadměrnou krabicí, žádné čekání na nadměrné zavazadlo v příletové hale. Tvoje kolo cestuje samostatně — ty s batohem.",
  },
  {
    title: "Bez airport stresu",
    body: "Příruční zavazadlo, žádné vysvětlování u check-inu, žádný strach o poškození kola na pásu.",
  },
  {
    title: "Kolo zůstává v Malaze",
    body: "Můžeš přijet pětkrát za zimu — kolo tam pořád čeká připravené. Jeden dovoz, celá sezóna.",
  },
  {
    title: "Vlastní kolo > půjčovna",
    body: "Vlastní geometrie a vlastní zvyk. Kolo, které ti opravdu sedne, v půjčovnách často stejně nenajdeš.",
  },
];

// ── Trust facts (na webu) ───────────────────────────────────────────────────

export const TRUST_FACTS: { icon: string; text: string }[] = [
  { icon: "🔒", text: "Pojištění během transportu" },
  { icon: "📦", text: "Monitorovaný a zabezpečený sklad" },
  { icon: "🛠", text: "Servisní zázemí na místě" },
  { icon: "📍", text: "0 minut od letiště Malaga (AGP)" },
  { icon: "🇨🇿", text: "Komunikace v češtině, smlouva v češtině" },
];

// ── FAQ ─────────────────────────────────────────────────────────────────────

export interface FaqItem {
  q: string;
  a: string;
}

export const FAQ_PREVIEW: FaqItem[] = [
  {
    q: "Jak dlouho transport z Česka do Malagy trvá?",
    a: "Standardně 5–8 dní podle bloku odjezdu. Termíny vyhlašujeme po blocích, typicky 2–3 odjezdy v každém sezónním měsíci.",
  },
  {
    q: "Jak dlouho můžu nechat kolo v Malaze?",
    a: "Měsíčně bez závazku, nebo celou sezónu (říjen–květen, 8 měsíců). Po sezóně kolo buď putuje zpět do ČR, nebo zůstává — záleží na tobě.",
  },
  {
    q: "Co když přiletím v noci?",
    a: "Předání domluvíme na čas, který ti vyhovuje. U balíčku Exclusive je vyzvednutí na letišti součástí ceny.",
  },
  {
    q: "Co když mám e-bike?",
    a: "E-bike vozíme. Doprava je o něco dražší (one-way +100 €, round-trip +150 €) — kolo je větší, těžší a vyžaduje pečlivější manipulaci. Baterii bereš s sebou v příručním zavazadle podle leteckých pravidel — vždy se na ní sami sebe předem ujistíme s aerolinkou klienta.",
  },
  {
    q: "Pojištění během transportu",
    a: "Kolo je pojištěno po celou dobu přepravy. Pro kola nad běžnou cenovou hladinu nabízíme nadstandardní pojištění dohodou.",
  },
];

export const FAQ_FULL: FaqItem[] = [
  ...FAQ_PREVIEW,
  {
    q: "Vyplatí se to oproti půjčovně?",
    a: "Záleží jak často jezdíš. Vlastní kolo dává smysl finančně i komfortem hlavně tehdy, když plánuješ víc než jednu cestu za sezónu, nebo máš kolo, které ti opravdu sedne (geometrie, fit). Půjčovny jsou kompromis — vlastní kolo není.",
  },
  {
    q: "Co když si chci vyzvednout kolo doma?",
    a: "Cenu pickupu kalkulujeme individuálně — záleží na vzdálenosti, jestli předáš kolo zabalené nebo ho budeme rozkládat my, a jestli použijeme tvůj nebo náš box. Vyplň poptávku a pošleme konkrétní nabídku.",
  },
  {
    q: "Můžu jet ve skupině / klubem?",
    a: "Ano. Pro skupiny od 5 kol a kluby sestavíme individuální nabídku — vždy podle termínu a obsazenosti přepravy.",
  },
  {
    q: "Co se stane, když změním termín?",
    a: "Termín příjezdu kola jde upravit do bloku odjezdu, který se ti hodí. Když změníš svůj termín letu, kolo už mezitím v Malaze je — to je celá pointa.",
  },
];

// ── Hero copy ───────────────────────────────────────────────────────────────

export const HERO_COPY = {
  eyebrow: "100DOLA MALAGA",
  h1Line1: "Vlastní kolo",
  h1Line2: "v Malaze.",
  sub: "Letíš nalehko. Jezdíš na svém. Bez opakovaného balení a kompromisů z půjčovny.",
  ctaPrimary: "Poptat dopravu kola",
  ctaSecondary: "Jak to funguje",
} as const;

export const FINAL_CTA_COPY = {
  h2: "Začneš poptávkou. Nemusíš vědět všechno.",
  body: "Napiš nám, co plánuješ. Ozveme se do 24 hodin s konkrétním dalším krokem.",
  cta: "Poslat poptávku",
  email: "info@100dola.com",
  phone: "+420 739 045 057",
} as const;
