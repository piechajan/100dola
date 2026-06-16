/**
 * Scott 2027 lineup data — pro hub `/clanky/scott-2027` + per-platform stránky.
 *
 * Reality check (12.6.2026, ze scott-sports.com):
 *  • Spark RC = jediný confirmed 2027 launch (publikováno na Scott Sports webu)
 *  • Scale / Addict / Addict RC / Addict Gravel = 2026 model year carry-over,
 *    redesign pro 2027 zatím nebyl oznámen (Addict Gravel se očekává 7/2026)
 *
 * Status badge per platforma odráží honest realitu — nelhat zákazníkům.
 *
 * Ceny jsou EUR z brujulabike / euro-bike.com (Scott MSRP nepublikuje).
 * CZK přepočet uváděn orientačně (kurz cca 25 Kč/€), finální CZK ceny jen
 * jako poptávková orientace.
 */

export type Platform = "mtb" | "road" | "gravel";
export type LaunchStatus = "launched" | "carryover" | "redesign_expected";

export interface Scott2027Variant {
  name: string;
  slug: string;
  /** Vodicí groupset (Shimano XTR Di2, SRAM RED AXS atd.) */
  groupset: string;
  /** Wheelset */
  wheels: string;
  /** Fork (jen pro MTB) */
  fork?: string;
  /** Váha kola (kg) — pokud Scott nezveřejnil, null */
  weightKg: number | null;
  /** MSRP v EUR (Scott neposkytuje, brujulabike / euro-bike data) */
  priceEur: number | null;
  /** Barevné varianty — max 4 hlavní */
  colors: string[];
  /** Lokální cesta k fotce v /public/media/scott-2027/ */
  photo: string;
}

export interface Scott2027Platform {
  slug: string;
  name: string;
  /** Krátký podnadpis pro hero (tagline) */
  tagline: string;
  /** Kategorie pro filter hubu */
  platform: Platform;
  /** Stav modelové řady — pravdivě */
  status: LaunchStatus;
  /** Krátký claim (1 věta) — co je signature feature */
  claim: string;
  /** Rám info (materiál, váha, technologie) */
  frame: string;
  /** Klíčové technologie 2027 (bulletpoints) */
  techHighlights: string[];
  /** Geometrie / pro koho je kolo (1-2 věty) */
  geometry: string;
  /** Varianty seřazené od top-tier dolů */
  variants: Scott2027Variant[];
  /** SEO keywords pro meta description */
  seoKeywords: string[];
  /** Datum kdy Scott model oznámil (pro „carry-over" nebo „launched") */
  announcedDate?: string;
}

const STATUS_LABEL: Record<LaunchStatus, string> = {
  launched: "Novinka 2027",
  carryover: "Modelový rok 2027 (carry-over)",
  redesign_expected: "Redesign očekáváme v 2027",
};

export function statusLabel(s: LaunchStatus): string {
  return STATUS_LABEL[s];
}

export const SCOTT_2027: Scott2027Platform[] = [
  {
    slug: "scott-spark-rc-2027",
    name: "Scott Spark RC",
    tagline: "Závodní XC platforma páté generace",
    platform: "mtb",
    status: "launched",
    announcedDate: "2026-06-10",
    claim:
      "Pátá generace Sparku zredukovala váhu rámu o 197 g, posunula tlumič hluboko do spodní trubky a postavila novou krátkou rotující kinematiku okolo střední osy.",
    frame:
      "HMX SL 1 427 g (M, bez tlumiče), HMX 1 570 g, HMF základní tier. 120 mm zdvih vepředu i vzadu.",
    techHighlights: [
      "Save-the-Day úložiště ve spodní trubce s integrovaným multitoolem",
      "Syncros Octopus integrované vedení kabeláže (barevně rozlišené)",
      "Vestavěná úprava úhlu hlavy ±0,5°",
      "Flex-pivot zadní trojúhelník (1 mm v první polovině zdvihu, pak progresivních 5-6 mm)",
      "Modulární kryty tlumiče",
      "UDH zadní háček, 12×148 mm, 55 mm chainline",
      "BSA nebo BB92 středové složení (per varianta)",
    ],
    geometry:
      "Geometrie zachovává RC fokus: posed nad pedály, nižší těžiště díky umístění tlumiče dolů, ultra-rychlá reakce v technickém terénu.",
    variants: [
      {
        name: "Spark RC SL",
        slug: "spark-rc-sl",
        groupset: "SRAM XX SL Eagle AXS Transmission",
        wheels: "Syncros Silverton SL2-30 CL (DT Swiss 240)",
        fork: "RockShox SID Ultimate Flight Attendant 120",
        weightKg: 9.9,
        priceEur: 13699,
        colors: ["Carbon Black"],
        photo: "/media/scott-2027/spark-rc-sl.webp",
      },
      {
        name: "Spark RC World Cup EVO",
        slug: "spark-rc-world-cup-evo",
        groupset: "SRAM XX Eagle AXS",
        wheels: "Syncros Silverton 1.0S-30 CL",
        fork: "RockShox SID Ultimate Flight Attendant",
        weightKg: 10.5,
        priceEur: 12199,
        colors: ["White"],
        photo: "/media/scott-2027/spark-rc-wc-evo.webp",
      },
      {
        name: "Spark RC Pro",
        slug: "spark-rc-pro",
        groupset: "Shimano XTR Di2 12sp",
        wheels: "Syncros Silverton 1.0 Carbon",
        fork: "Fox 34 SL Factory Kashima",
        weightKg: 10.9,
        priceEur: 7599,
        colors: ["Azure White"],
        photo: "/media/scott-2027/spark-rc-pro.webp",
      },
      {
        name: "Spark RC Team",
        slug: "spark-rc-team",
        groupset: "SRAM S1000 AXS Transmission 12sp",
        wheels: "Syncros Silverton 2.5-30 CL",
        fork: "RockShox SID 3P Air",
        weightKg: 12.5,
        priceEur: 4799,
        colors: ["Carbon Black", "Whisper Grey", "Spectral Black", "Cream Green"],
        photo: "/media/scott-2027/spark-rc-team.webp",
      },
      {
        name: "Spark RC Comp",
        slug: "spark-rc-comp",
        groupset: "SRAM Eagle 70 Transmission",
        wheels: "Syncros X-30SE TR",
        fork: "RockShox SID 3P Air",
        weightKg: 12.8,
        priceEur: 3799,
        colors: ["Cumulus White"],
        photo: "/media/scott-2027/spark-rc-comp.webp",
      },
    ],
    seoKeywords: [
      "scott spark rc 2027",
      "scott spark 2027",
      "nový scott spark",
      "spark rc předobjednávka",
      "xc závodní kolo 2027",
      "scott spark cena",
    ],
  },
  {
    slug: "scott-scale",
    name: "Scott Scale",
    tagline: "Hardtail XC platforma — Gen5 carry-over do 2027",
    platform: "mtb",
    status: "carryover",
    announcedDate: "2025-08-01",
    claim:
      "Scale RC Gen5 zůstává v lineupu i pro modelový rok 2027 — sub-9 kg kompletní kolo, geometrie inspirovaná World Cup XC sezónou.",
    frame:
      "Scale Carbon HMX SL (rám 847 g, vel. M), HMX, HMF tier, 6061 hliník u entry modelů. Hardtail design, 100-110 mm zdvih vidlice.",
    techHighlights: [
      "Sub-9 kg kompletní kolo (RC World Cup, vel. M)",
      "Geometrie odvozená z World Cupových šablon",
      "Syncros integrované vedení kabeláže",
      "Monokokový rám HMX SL",
      "Vnitřní vedení (full internal routing)",
    ],
    geometry:
      "Hardtail s race fokusem: nižší stack, delší reach, agresivní úhel hlavy. Pro maraton, watt-hodinové výjezdy a XC závodění.",
    variants: [
      {
        name: "Scale RC World Cup",
        slug: "scale-rc-world-cup",
        groupset: "SRAM XX SL AXS Transmission",
        wheels: "Fulcrum Red Zone Carbon 30",
        fork: "RockShox SID SL Ultimate 3P Air 110",
        weightKg: 9.6,
        priceEur: null,
        colors: ["Hush Purple"],
        photo: "/media/scott-2027/scale-rc-wc.webp",
      },
      {
        name: "Scale RC Team",
        slug: "scale-rc-team",
        groupset: "SRAM S1000 AXS Transmission 12sp",
        wheels: "Syncros Silverton 2.5 TR",
        fork: "RockShox SID SL 3P Air 110",
        weightKg: 11.2,
        priceEur: null,
        colors: ["Carbon Black"],
        photo: "/media/scott-2027/scale-rc-team.webp",
      },
      {
        name: "Scale 910",
        slug: "scale-910",
        groupset: "SRAM Eagle 70 Transmission 12sp",
        wheels: "Syncros X-30SE TR",
        fork: "Fox 32 Float Rhythm 110",
        weightKg: 11.9,
        priceEur: null,
        colors: ["White", "Carbon Black"],
        photo: "/media/scott-2027/scale-910.webp",
      },
      {
        name: "Scale 920",
        slug: "scale-920",
        groupset: "Shimano Deore 12sp",
        wheels: "Alex X-25 TR",
        fork: "RockShox Judy Silver TK Solo Air 110",
        weightKg: 12.9,
        priceEur: null,
        colors: ["White", "Carbon Black", "Ambrosia Green"],
        photo: "/media/scott-2027/scale-920.webp",
      },
    ],
    seoKeywords: [
      "scott scale 2027",
      "scott scale hardtail",
      "scott scale rc",
      "scott scale 910",
      "xc hardtail 2027",
      "scott scale váha",
    ],
  },
  {
    slug: "scott-addict",
    name: "Scott Addict",
    tagline: "Endurance silnička — nová generace, pokračuje do 2027",
    platform: "road",
    status: "carryover",
    announcedDate: "2025-09-15",
    claim:
      "Nová generace Addictu nabízí o 50 % vyšší komfort než předchůdce a zachovává RC úroveň tuhosti v hlavě a středu rámu. Pneumatika až 38 mm.",
    frame:
      "Addict HMX (Premium, model 10) nebo HMX HMF (20, 30, 40, 50). Vedení kabeláže plně integrované, 38 mm prostup pneu.",
    techHighlights: [
      "Save-the-Day úložiště ve spodní trubce + integrovaný multitool",
      "Přední trojúhelník kompatibilní s rámovou brašnou",
      "Syncros D-shape sedlovka",
      "Univerzální T25 nástroj",
      "Geometrie endurance: +5 mm stack, -5 mm reach, -2 mm zadní rozvor proti RC",
    ],
    geometry:
      "Endurance posed pro celodenní jízdy. Klid v nerovnostech, stále svižný posed v kopcích. Vyhovuje hobby závodníkům i ride camp jezdcům v Andalusii.",
    variants: [
      {
        name: "Addict Premium",
        slug: "addict-premium",
        groupset: "Shimano Dura-Ace Di2 Disc 24sp",
        wheels: "Fulcrum WIND 42 DB Carbon",
        weightKg: 7.4,
        priceEur: null,
        colors: ["Whale Grey"],
        photo: "/media/scott-2027/addict-premium.webp",
      },
      {
        name: "Addict 10",
        slug: "addict-10",
        groupset: "SRAM Force AXS Disc 24sp",
        wheels: "Fulcrum WIND 42 DB Carbon",
        weightKg: 7.8,
        priceEur: null,
        colors: ["Plum Grey"],
        photo: "/media/scott-2027/addict-10.webp",
      },
      {
        name: "Addict 20",
        slug: "addict-20",
        groupset: "Shimano Ultegra Di2 Disc 24sp",
        wheels: "Fulcrum WIND 42 DB Carbon",
        weightKg: 8.3,
        priceEur: null,
        colors: ["Cumulus White", "Tungsten Grey", "Violet Pink"],
        photo: "/media/scott-2027/addict-20.webp",
      },
      {
        name: "Addict 30",
        slug: "addict-30",
        groupset: "Shimano 105 Di2 Disc 24sp",
        wheels: "Syncros Capital 1.0 40",
        weightKg: 8.4,
        priceEur: null,
        colors: ["Carbon Black", "Cumulus White", "Frozen Green"],
        photo: "/media/scott-2027/addict-20.webp",
      },
    ],
    seoKeywords: [
      "scott addict 2027",
      "scott addict 30",
      "scott addict 20",
      "scott addict endurance",
      "scott addict 105 di2",
      "silniční kolo endurance 2027",
    ],
  },
  {
    slug: "scott-addict-rc",
    name: "Scott Addict RC",
    tagline: "Závodní aero silnička — nejlehčí produkční stroj Scott",
    platform: "road",
    status: "carryover",
    announcedDate: "2024-08-01",
    claim:
      "Addict RC HMX SL je nejlehčí závodní silnička, jakou Scott vyrobil. 12 W aero zisk, 36 % vyšší komfort a 300 g lehčí proti předchozí generaci.",
    frame:
      "HMX SL (Ultimate), HMX (Pro/Team/10/20/30). Hollow construction bez slepých konců, PP Mandrel molding. Prostup pneu 30 mm standard, 34 mm max.",
    techHighlights: [
      "Aero zisk 12 W (CFD a tunelové testy)",
      "Hmotnost rámu o 300 g lehčí než předchozí Addict RC v3",
      "Komfort vyšší o 36 % (BumpSync test)",
      "Syncros IC-R100-SL integrovaný kokpit",
      "SP-R100-SL D-shape sedlovka",
      "27,2 mm excentrický karbonový steerer",
      "Hollow construction (žádné dead-end tube segments)",
    ],
    geometry:
      "Race fit napříč velikostmi: konzistentní stack/reach. Vhodné pro spurtery, time trial a hobby závodění na silnici.",
    variants: [
      {
        name: "Addict RC Ultimate",
        slug: "addict-rc-ultimate",
        groupset: "SRAM RED AXS Disc 24sp",
        wheels: "Syncros Capital SL 40",
        weightKg: 5.9,
        priceEur: 11999,
        colors: ["Sunbeam Black"],
        photo: "/media/scott-2027/addict-rc-ultimate.webp",
      },
      {
        name: "Addict RC Pro",
        slug: "addict-rc-pro",
        groupset: "Shimano Dura-Ace Di2 Disc 24sp",
        wheels: "Syncros Capital 1.0S 40",
        weightKg: 6.7,
        priceEur: 8499,
        colors: ["Cumulus White / Carbon Black", "Beluga Grey / Seashore Green"],
        photo: "/media/scott-2027/addict-rc-pro.webp",
      },
      {
        name: "Addict RC Team",
        slug: "addict-rc-team",
        groupset: "SRAM Force AXS Disc 24sp",
        wheels: "Syncros Capital 1.0S 40",
        weightKg: 7.0,
        priceEur: null,
        colors: ["Tungsten Grey"],
        photo: "/media/scott-2027/addict-rc-team.webp",
      },
      {
        name: "Addict RC 10",
        slug: "addict-rc-10",
        groupset: "Shimano Ultegra Di2 Disc 24sp",
        wheels: "Syncros Capital 1.0S 40",
        weightKg: 7.0,
        priceEur: null,
        colors: ["Sunbeam Black", "Gelato Blue / Pink"],
        photo: "/media/scott-2027/addict-rc-10.webp",
      },
    ],
    seoKeywords: [
      "scott addict rc 2027",
      "scott addict rc ultimate",
      "scott addict rc pro",
      "scott addict rc cena",
      "scott addict rc 10",
      "aero závodní silnička 2027",
    ],
  },
  {
    slug: "scott-addict-gravel",
    name: "Scott Addict Gravel",
    tagline: "Gravel platforma — redesign 2027 očekáváme v červenci 2026",
    platform: "gravel",
    status: "redesign_expected",
    announcedDate: "2021-09-01",
    claim:
      "Současný Addict Gravel zůstává v prodeji, ale Scott testoval na Unbound prototyp s 32\" koly. 2027 redesign očekáváme oficiálně 7/2026.",
    frame:
      "Addict Gravel Disc HMF Carbon — 930 g (vel. M, RC), vidlice 395 g. Prostup pneu 45 mm (40 mm s blatníky), nižší střed, eccentric karbonový steerer 1 1/4\"-1 1/2\".",
    techHighlights: [
      "Prostup pneu až 45 mm (40 mm s blatníky)",
      "Dvojice úchytů na láhev + úchyty na top tube bag",
      "Úchyty na blatníky (winter setup)",
      "Eccentric karbonový steerer 1 1/4\"-1 1/2\"",
      "Nižší střed než Addict (lepší stabilita v terénu)",
    ],
    geometry:
      "Mezi silničkou a XC: na asfaltu rychlé, na lesní cestě stabilní, na hrubém terénu předvídatelné. Pro gravel závody a backcountry výjezdy.",
    variants: [
      {
        name: "Addict Gravel 10",
        slug: "addict-gravel-10",
        groupset: "SRAM Force AXS 24sp",
        wheels: "DT Swiss GRC1400 Disc",
        weightKg: 8.8,
        priceEur: null,
        colors: ["Carbon"],
        photo: "/media/scott-2027/addict-gravel-10.webp",
      },
      {
        name: "Addict Gravel 20",
        slug: "addict-gravel-20",
        groupset: "SRAM Rival XPLR AXS 1×12",
        wheels: "Syncros RP2.0 Disc",
        weightKg: 9.32,
        priceEur: null,
        colors: ["Carbon"],
        photo: "/media/scott-2027/addict-gravel-20.webp",
      },
      {
        name: "Addict Gravel 30",
        slug: "addict-gravel-30",
        groupset: "Shimano GRX RX810/600 22sp",
        wheels: "Syncros RP2.0 Disc",
        weightKg: 9.44,
        priceEur: null,
        colors: ["Carbon"],
        photo: "/media/scott-2027/addict-gravel-30.webp",
      },
    ],
    seoKeywords: [
      "scott addict gravel 2027",
      "scott addict gravel 10",
      "scott addict gravel 20",
      "scott gravel kolo 2027",
      "gravel kolo scott cena",
    ],
  },
];

export function getPlatformBySlug(slug: string): Scott2027Platform | undefined {
  return SCOTT_2027.find((p) => p.slug === slug);
}

export function getPlatformsByType(type: Platform): Scott2027Platform[] {
  return SCOTT_2027.filter((p) => p.platform === type);
}

/** Orientační CZK přepočet z EUR (kurz 25 CZK/€, +21% DPH už zahrnuto). */
export function eurToCzk(eur: number | null): string {
  if (eur === null) return "Cena na poptávku";
  const czk = Math.round((eur * 25) / 1000) * 1000;
  return `od ${czk.toLocaleString("cs-CZ").replace(/,/g, " ")} Kč`;
}
