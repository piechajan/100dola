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

export interface Componentry {
  frame?: string;
  fork?: string;
  shock?: string;
  drivetrain?: string;
  brakes?: string;
  wheels?: string;
  tires?: string;
  cockpit?: string;
}

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
  /** Přesná CZ retailová cena vč. DPH (oficiální Scott ceník) — má přednost před priceEur. */
  priceCzk?: number;
  /** Barevné varianty — max 4 hlavní */
  colors: string[];
  /** Lokální cesta k hlavní fotce v /public/media/scott-2027/ */
  photo: string;
  /** Velikosti rámu */
  sizes: string[];
  /** Galerie 3-6 fotek na detail stránce */
  gallery: string[];
  /** Detailní componentry breakdown */
  componentry?: Componentry;
  /** Link na oficiální Scott Sports stránku */
  scottUrl?: string;
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
  /** Volitelná hero fotka platformy pro kartu v hubu (jinak fallback na variants[0].photo) */
  heroPhoto?: string;
}

const STATUS_LABEL: Record<LaunchStatus, string> = {
  launched: "Novinka 2027",
  carryover: "Modelový rok 2027 (carry-over)",
  redesign_expected: "Design očekáváme na podzim 2026",
};

export function statusLabel(s: LaunchStatus): string {
  return STATUS_LABEL[s];
}

const MTB_SIZES = ["S", "M", "L", "XL"];
const ROAD_SIZES = ["XXS", "XS", "S", "M", "L", "XL", "XXL"];
const GRAVEL_SIZES = ["XS / 49", "S / 52", "M / 54", "L / 56", "XL / 58"];

function gal(slug: string, count: number): string[] {
  return Array.from({ length: count }, (_, i) =>
    `/media/scott-2027/gallery/${slug}/${String(i + 1).padStart(2, "0")}.webp`,
  );
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
        priceCzk: 337990,
        colors: ["Piano Black / Carbon Black"],
        photo: "/media/scott-2027/spark-rc-sl.webp",
        sizes: MTB_SIZES,
        gallery: ["/media/scott-2027/spark-rc-sl.webp"],
        scottUrl: "https://www.scott-sports.com/global/en/product/scott-spark-rc-sl-bike",
        componentry: {
          frame: "Spark RC Carbon HMX SL, flex pivot, adjustable head angle, 1 870 g s tlumičem",
          fork: "RockShox SID Ultimate Flight Attendant (electronic), 120 mm, 15×110 Maxle Stealth, 44 mm offset",
          shock: "RockShox SIDLuxe Ultimate Flight Attendant Custom (electronic), 120 mm, T165×45",
          drivetrain: "SRAM XX SL Eagle AXS Transmission 12sp, XX SL carbon kliky s power meterem 34T, XS 1299 kazeta 10-52, AXS Rocker Pod",
          brakes: "SRAM Motive Ultimate 4-Piston, HS2 CL kotouče 180/160",
          wheels: "Syncros Silverton SL2-30 CL full carbon, DT Swiss 240 Ratchet EXP náboje",
          tires: "Maxxis Rekon Race 29×2,4\" 120 TPI tubeless EXO",
          cockpit: "Syncros Fraser iC SL XC Carbon integrovaný, -12°/8°/740 mm; RockShox Reverb AXS dropper 31,6 (100/125/125/150); Syncros Belcarra V1.0 carbon rails",
        },
      },
      {
        name: "Spark RC World Cup EVO",
        slug: "spark-rc-world-cup-evo",
        groupset: "SRAM XX Eagle AXS",
        wheels: "Syncros Silverton 1.0S-30 CL",
        fork: "RockShox SID Ultimate Flight Attendant",
        weightKg: 10.5,
        priceEur: 12199,
        priceCzk: 298990,
        colors: ["Rush White / Carbon Black"],
        photo: "/media/scott-2027/spark-rc-wc-evo.webp",
        sizes: MTB_SIZES,
        gallery: ["/media/scott-2027/spark-rc-wc-evo.webp"],
        scottUrl: "https://www.scott-sports.com/global/en/product/scott-spark-rc-world-cup-evo-bike",
        componentry: {
          frame: "Spark RC Carbon HMX, BB92, UDH",
          fork: "RockShox SID Ultimate Flight Attendant, 120 mm",
          shock: "RockShox SIDLuxe Ultimate Flight Attendant Custom, 120 mm, T165×45",
          drivetrain: "SRAM XX Eagle AXS Transmission, carbon kliky s power meterem 34T, XX SL přehazovačka, XS 1299 kazeta 10-52",
          brakes: "SRAM Motive Ultimate 4-Piston, HS2 CL 180/160",
          wheels: "Syncros Silverton 1.0S-30 CL, DT Swiss 240 Ratchet EXP",
          tires: "Maxxis Rekon Race 29×2,4\" 120 TPI EXO",
          cockpit: "Syncros Fraser iC SL XC Carbon, -12°/8°/740 mm; RockShox Reverb AXS dropper",
        },
      },
      {
        name: "Spark RC World Cup",
        slug: "spark-rc-world-cup",
        groupset: "SRAM X01 Eagle AXS 12sp",
        wheels: "Syncros Silverton 1.0-30",
        fork: "RockShox SID Select+ RL3 Air, 120 mm",
        weightKg: 10.9,
        priceEur: 8699,
        priceCzk: 215790,
        colors: ["Cumulus White / Carbon Black"],
        photo: "/media/scott-2027/spark-rc-wc.webp",
        sizes: MTB_SIZES,
        gallery: ["/media/scott-2027/spark-rc-wc.webp"],
        scottUrl: "https://www.scott-sports.com/global/en/product/scott-spark-rc-world-cup-bike",
        componentry: {
          frame: "Spark RC Carbon HMX, BB92, UDH",
          fork: "RockShox SID Select+ RL3 Air, Charger 3-mode tlumení, 120 mm",
          shock: "RockShox NUDE 5 RL3 Trunnion, 3-mode, T165×45",
          drivetrain: "SRAM X01 Eagle AXS 12sp, X01 DUB carbon kliky 32T, X01 XG1295 10-52, SRAM GX AXS Rocker",
          brakes: "SRAM Level TLM, HS2 180/160",
          wheels: "Syncros Silverton 1.0-30 6-Bolt carbon",
          tires: "Maxxis Rekon Race 29×2,4\" 120 TPI tubeless",
          cockpit: "Syncros Fraser iC SL XC Carbon -12°/740 mm; FOX Transfer SL Performance Elite dropper 31,6; Syncros Belcarra Regular 1.5 Ti rails",
        },
      },
      {
        name: "Spark RC Pro",
        slug: "spark-rc-pro",
        groupset: "Shimano XTR Di2 12sp",
        wheels: "Syncros Silverton 1.0 Carbon",
        fork: "Fox 34 SL Factory Kashima",
        weightKg: 10.9,
        priceEur: 7599,
        priceCzk: 187190,
        colors: ["Obsidian Purple / Carbon Black"],
        photo: "/media/scott-2027/spark-rc-pro.webp",
        sizes: MTB_SIZES,
        gallery: ["/media/scott-2027/spark-rc-pro.webp"],
        scottUrl: "https://www.scott-sports.com/global/en/product/scott-spark-rc-pro-bike",
        componentry: {
          frame: "Spark RC Carbon HMF, BB92, UDH",
          fork: "FOX 34 SL Float Performance Elite Air Grip SL, 3-mode, 120 mm",
          shock: "FOX NUDE 6 EVOL Trunnion, 3-mode, 120-80 mm adjustable",
          drivetrain: "Shimano XT Di2 RD-M8250 SGS 12sp, XT FC-M8200-1 kliky 34T, XT CS-M8200 10-51, XT řetěz",
          brakes: "Shimano XT M8220 4-Piston, RT-CL700 kotouče 180/160",
          wheels: "Syncros Silverton 1.0-30 CL carbon",
          tires: "Maxxis Rekon Race 29×2,4\" 120 TPI",
          cockpit: "Syncros Fraser iC SL XC Carbon -12°/740 mm; Syncros Duncan Dropper 1.5XC 31,6/100 mm",
        },
      },
      {
        name: "Spark RC Team Issue",
        slug: "spark-rc-team-issue",
        groupset: "SRAM GX Eagle AXS Transmission 12sp",
        wheels: "Syncros Silverton CF2 carbon",
        fork: "RockShox SID Flight Attendant (electronic), 120 mm",
        weightKg: null,
        priceEur: null,
        priceCzk: 187190,
        colors: ["Carbon Black", "Dorado Grey", "Ultra Blue"],
        photo: "/media/scott-2027/spark-rc-team-issue.webp",
        sizes: MTB_SIZES,
        gallery: ["/media/scott-2027/spark-rc-team-issue.webp"],
        scottUrl: "https://www.scott-sports.com/global/en/product/scott-spark-rc-team-issue-bike",
        componentry: {
          frame: "Spark RC Carbon HMF, BB92, UDH",
          fork: "RockShox SID Ultimate Flight Attendant (electronic), 120 mm",
          shock: "RockShox SIDLuxe Flight Attendant (electronic), 120 mm, T165×45",
          drivetrain: "SRAM GX Eagle AXS Transmission 12sp (wireless), GX kliky s Spindle power meterem 34T, GX XS-1275 kazeta 10-52, AXS Pod",
          brakes: "SRAM Motive Bronze 4-Piston, HS2 180/160",
          wheels: "Syncros Silverton CF2 carbon",
          tires: "Maxxis Aspen 29×2,4\" foldable tubeless",
          cockpit: "Syncros Fraser iC SL XC Carbon integrovaný; Syncros dropper post; Syncros Celista Cut-Out sedlo, Cr-Mo rails",
        },
      },
      {
        name: "Spark RC Expert",
        slug: "spark-rc-expert",
        groupset: "Shimano XT / Deore Di2 12sp",
        wheels: "Syncros Silverton AL2 (alloy)",
        fork: "FOX 34 SL Factory Grip SL Kashima, 120 mm",
        weightKg: null,
        priceEur: null,
        priceCzk: 145590,
        colors: ["Tungsten Grey"],
        photo: "/media/scott-2027/spark-rc-expert.webp",
        sizes: MTB_SIZES,
        gallery: ["/media/scott-2027/spark-rc-expert.webp"],
        scottUrl: "https://www.scott-sports.com/global/en/product/scott-spark-rc-expert-bike",
        componentry: {
          frame: "Spark RC Carbon HMF, BB92, UDH",
          fork: "FOX 34 SL Factory Grip SL, Kashima, 3P, Kabolt 15×110, tapered, Reb. Adj, Lockout, 120 mm",
          shock: "FOX Nude Factory, Twinloc, 120 mm",
          drivetrain: "Shimano XT Di2 RD-M8250 12sp (wireless electronic), XT FC-M8200 kliky 34T, Deore CS-M7200 10-51, řetěz",
          brakes: "Shimano Deore BR-M6220 4-Piston",
          wheels: "Syncros Silverton AL2 alloy",
          tires: "Maxxis Aspen 29×2,4\" foldable tubeless",
          cockpit: "Syncros Fraser 2.0 XC Alloy; Syncros dropper post; Syncros Celista Cut-Out sedlo, Cr-Mo rails",
        },
      },
      {
        name: "Spark RC Team",
        slug: "spark-rc-team",
        groupset: "SRAM S1000 AXS Transmission 12sp",
        wheels: "Syncros Silverton 2.5-30 CL",
        fork: "RockShox SID 3P Air",
        weightKg: 12.5,
        priceEur: 4799,
        priceCzk: 119590,
        colors: ["Spectral Black", "Cream Green / Carbon Black"],
        photo: "/media/scott-2027/spark-rc-team.webp",
        sizes: MTB_SIZES,
        gallery: ["/media/scott-2027/spark-rc-team.webp"],
        scottUrl: "https://www.scott-sports.com/global/en/product/scott-spark-rc-team-bike",
        componentry: {
          frame: "Spark RC Carbon HMF, BB92, UDH, 12×148, 55 mm chainline",
          fork: "RockShox SID 3P Air s Rush RL 3-mode tlumení, 120 mm, 44 mm offset",
          shock: "RockShox NUDE 5 RL3 Trunnion, 3-mode, T165×45",
          drivetrain: "SRAM S1000 Eagle AXS Transmission 12sp, Eagle 70 kliky 34T, XS 1270 V2 kazeta 10-52, AXS Pod ovladač",
          brakes: "SRAM DB6 4-Piston, Centerline CL 180/160",
          wheels: "Syncros Silverton 2.5-30 CL, 28H",
          tires: "Maxxis Rekon Race 29×2,4\" 120 TPI EXO",
          cockpit: "Syncros Fraser 2.0 XC Alloy 740 mm/8°; XC 2.0 stem -12°; Duncan Dropper 1.5XC 31,6/100 mm",
        },
      },
      {
        name: "Spark RC Comp",
        slug: "spark-rc-comp",
        groupset: "SRAM Eagle 70 Transmission",
        wheels: "Syncros X-30SE TR",
        fork: "RockShox SID 3P Air / FOX 32 Rhythm",
        weightKg: 12.8,
        priceEur: 3799,
        priceCzk: 93590,
        colors: ["Cumulus White"],
        photo: "/media/scott-2027/spark-rc-comp.webp",
        sizes: MTB_SIZES,
        gallery: ["/media/scott-2027/spark-rc-comp.webp"],
        scottUrl: "https://www.scott-sports.com/global/en/product/scott-spark-rc-comp-bike",
        componentry: {
          frame: "Spark RC Carbon HMF, BB92, UDH",
          fork: "FOX 32 Float Rhythm Grip, 3-mode, 120 mm",
          shock: "FOX Float LV Custom EVOL Performance Trunnion DPS, 120 mm",
          drivetrain: "SRAM Eagle 70 Transmission 12sp, kliky 34T, XS 1270 V2 10-52, Eagle 70 Trigger",
          brakes: "SRAM DB4 4-Piston, Centerline CL 180/160",
          wheels: "Syncros X-30SE rims 32H, Formula CL náboje",
          tires: "Maxxis Rekon Race 29×2,4\" 120 TPI",
          cockpit: "Syncros Fraser 2.0 XC Alloy 740/8°; XC 2.0 stem; Duncan Dropper 1.5XC 31,6/100 mm",
        },
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
        sizes: MTB_SIZES,
        gallery: gal("scale-rc-world-cup", 6),
        scottUrl: "https://www.scott-sports.com/global/en/product/scott-scale-rc-world-cup-bike",
        componentry: {
          frame: "Scale Carbon HMX, adjustable head angle, BB92, UDH",
          fork: "RockShox SID SL Ultimate 3P Air, Charger Race Day 2, 110 mm, 15×110 Maxle Stealth",
          drivetrain: "SRAM XX SL Eagle AXS Transmission 12sp, XX Eagle AXS carbon kliky s power meterem 34T, XS 1297 10-52",
          brakes: "SRAM Motive Ultimate 4-Piston, HS2 CL 180/160",
          wheels: "Fulcrum Red Zone Carbon CL, 30 mm, 28H, XD driver",
          tires: "Maxxis Rekon Race 29×2,4\" 120 TPI EXO",
          cockpit: "Syncros Fraser iC SL XC Carbon -12°/740 mm; Duncan Dropper 1.5XC 31,6/100 mm",
        },
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
        sizes: MTB_SIZES,
        gallery: gal("scale-rc-team", 6),
        scottUrl: "https://www.scott-sports.com/global/en/product/scott-scale-rc-team-bike",
        componentry: {
          frame: "Scale Carbon HMF, adjustable head angle, BB92, UDH",
          fork: "RockShox SID SL 3P Air, Rush RL 3-mode, 110 mm, 44 mm offset",
          drivetrain: "SRAM S1000 Eagle AXS Transmission 12sp, Eagle 70 kliky 34T, XS 1270 V2 10-52",
          brakes: "SRAM DB6 4-Piston, Centerline CL 180/160",
          wheels: "Syncros Silverton 2.5-30 CL, 28H",
          tires: "Maxxis Rekon Race 29×2,4\" 120 TPI EXO",
          cockpit: "Syncros Fraser 2.0 XC Alloy 740 mm/8°; XC 2.0 stem -12°; Duncan Dropper 1.5XC 31,6/100 mm",
        },
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
        sizes: MTB_SIZES,
        gallery: gal("scale-910", 6),
        scottUrl: "https://www.scott-sports.com/global/en/product/scott-scale-910-bike",
        componentry: {
          frame: "Scale Carbon HMF, BB92, UDH, 12×148",
          fork: "FOX 32 Float Rhythm Grip, 3-mode, 110 mm, 44 mm offset",
          drivetrain: "SRAM Eagle 70 Transmission 12sp, kliky 32T DUB, XS 1270 V2 10-52, Eagle 70 Trigger",
          brakes: "Shimano MT401, RT10 CL 180/160",
          wheels: "Syncros X-30SE rims 32H, Formula náboje",
          tires: "Maxxis Rekon Race 29×2,4\" 120 TPI EXO",
          cockpit: "Syncros Alloy 6061 T-shape flat 740 mm/9°; DC 3.0 stem 0°/31,8; Duncan Dropper 31,6",
        },
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
        sizes: MTB_SIZES,
        gallery: gal("scale-920", 6),
        scottUrl: "https://www.scott-sports.com/global/en/product/scott-scale-920-bike",
        componentry: {
          frame: "Scale Carbon HMF, BB92, UDH, 12×148, 55 mm chainline",
          fork: "RockShox Judy Silver TK Solo Air, 110 mm, 51 mm offset, lockout",
          drivetrain: "Shimano Deore RD-M6100 SGS 12sp, FC-MT512-1 kliky 32T, CS-M6100 10-51, SL-M6100-R Rapidfire",
          brakes: "Shimano MT200, RT10 CL 180/160",
          wheels: "Alex X-25 rims 32H, Formula náboje (Micro Spline)",
          tires: "Maxxis Rekon Race 29×2,4\" EXO TR",
          cockpit: "Syncros Alloy 6061 T-shape 740/9°; DC 3.0 stem 0°; Duncan Dropper 31,6",
        },
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
        sizes: ROAD_SIZES,
        gallery: gal("addict-premium", 6),
        scottUrl: "https://www.scott-sports.com/global/en/product/scott-addict-premium-bike",
        componentry: {
          frame: "Addict HMX Carbon, endurance geometrie",
          fork: "Addict HMX Flatmount Disc, 27,2 mm eccentric carbon steerer",
          drivetrain: "Shimano Dura-Ace Di2 R9250, ST-R9270 24sp, FC-R9200 50×34, CS-R8101 11-34",
          brakes: "Shimano BR-R9270 Hyd, RT-CL900 160/160",
          wheels: "Fulcrum WIND 42 DB Carbon 24F/24R",
          tires: "Schwalbe PRO ONE Fold 700×34C (F/R)",
          cockpit: "Syncros IC-R100-SL carbon integrovaný; SP-R101-CF sedlovka; Tofino V 1.0 Cut Out sedlo",
        },
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
        sizes: ROAD_SIZES,
        gallery: gal("addict-10", 6),
        scottUrl: "https://www.scott-sports.com/global/en/product/scott-addict-10-bike",
        componentry: {
          frame: "Addict HMX Carbon, endurance geometrie, UDH, integrated storage",
          fork: "Addict HMX Flatmount Disc, 27,2 mm eccentric carbon steerer",
          drivetrain: "SRAM FORCE AXS 24sp electronic, FORCE kliky s power meterem 46/33, FORCE XG1270 E1 10-36",
          brakes: "SRAM FORCE AXS HRD, Paceline kotouče 160/160",
          wheels: "Fulcrum WIND 42 DB Carbon 24F/24R",
          tires: "Schwalbe ONE Fold 700×34C",
          cockpit: "Syncros HB-R100-CF řidítka; ST-R300-AL stem; SP-R101-CF sedlovka; Tofino V 2.0 Cut Out",
        },
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
        sizes: ROAD_SIZES,
        gallery: gal("addict-20", 6),
        scottUrl: "https://www.scott-sports.com/global/en/product/scott-addict-20-bike",
        componentry: {
          frame: "Addict HMF Carbon, ride geometrie, UDH, integrated storage",
          fork: "Addict HMF Flatmount Disc, 27,2 mm eccentric carbon steerer",
          drivetrain: "Shimano Ultegra Di2 R8150 24sp, FC-R8100 50-34, CS-R7100 11-34",
          brakes: "Shimano BR-R8170 Hyd, RT-CL800 160/160",
          wheels: "Fulcrum WIND 42 DB Carbon 24F/24R",
          tires: "Schwalbe ONE Fold 700×34C",
          cockpit: "Syncros HB-R100-CF řidítka; ST-R310-AL stem; SP-R101-CF sedlovka",
        },
      },
      {
        name: "Addict 30",
        slug: "addict-30",
        groupset: "Shimano 105 Di2 Disc 24sp",
        wheels: "Syncros Capital 1.0 40",
        weightKg: 8.4,
        priceEur: null,
        colors: ["Carbon Black", "Cumulus White", "Frozen Green"],
        photo: "/media/scott-2027/addict-30.webp",
        sizes: ROAD_SIZES,
        gallery: gal("addict-30", 6),
        scottUrl: "https://www.scott-sports.com/global/en/product/scott-addict-30-bike",
        componentry: {
          frame: "Addict HMF Carbon, ride geometrie, UDH, integrated storage",
          fork: "Addict HMF Flatmount Disc, 27,2 mm eccentric carbon steerer",
          drivetrain: "Shimano 105 Di2 R7150 24sp, FC-R7100 50-34, CS-R7100 11-34",
          brakes: "Shimano BR-R7170 Hyd, RT-CL700 160/160",
          wheels: "Syncros Capital 1.0 40 Disc 24F/24R",
          tires: "Schwalbe ONE Fold 700×34C",
          cockpit: "Syncros HB-R100-AL řidítka; ST-R310-AL stem; SP-R101-CF sedlovka",
        },
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
    heroPhoto: "/media/scott-2027/addict-rc-pro-hero.webp",
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
        sizes: ROAD_SIZES,
        gallery: gal("addict-rc-ultimate", 6),
        scottUrl: "https://www.scott-sports.com/global/en/product/scott-addict-rc-ultimate-bike",
        componentry: {
          frame: "Addict RC HMX SL, race geometrie",
          fork: "Addict RC HMX SL Flatmount Disc, 27,2 mm eccentric carbon steerer",
          drivetrain: "SRAM RED AXS 24sp, RED HRD shifters, RED kliky s power meterem 46/33, RED XG1290 E1 10-33",
          brakes: "SRAM RED AXS HRD, Paceline X 160/140",
          wheels: "Syncros Capital SL 40 mm",
          tires: "Schwalbe Aerothan TLE 700×29C (F/R)",
          cockpit: "Syncros IC-R100-SL integrovaný; SP-R100-SL sedlovka; Belcarra Regular SL",
        },
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
        sizes: ROAD_SIZES,
        gallery: gal("addict-rc-pro", 5),
        scottUrl: "https://www.scott-sports.com/global/en/product/scott-addict-rc-pro-bike",
        componentry: {
          frame: "Addict RC HMX, race geometrie",
          fork: "Addict RC HMX Flatmount Disc, 27,2 mm eccentric carbon steerer",
          drivetrain: "Shimano Dura-Ace Di2 R9250 24sp, ST-R9270, FC-R9200 52×36, CS-R9200 11-34",
          brakes: "Shimano BR-R9270 Hyd, RT-CL900 160/140",
          wheels: "Syncros Capital 1.0S 40 mm 24F/24R",
          tires: "Schwalbe PRO ONE TL-Easy 700×30C",
          cockpit: "Syncros IC-R100-SL integrovaný; SP-R100-SL sedlovka; Belcarra Regular 1.0",
        },
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
        sizes: ROAD_SIZES,
        gallery: gal("addict-rc-team", 6),
        scottUrl: "https://www.scott-sports.com/global/en/product/scott-addict-rc-team-bike",
        componentry: {
          frame: "Addict RC HMX, race geometrie",
          fork: "Addict RC HMX Flatmount Disc, 27,2 mm eccentric carbon steerer",
          drivetrain: "SRAM FORCE AXS 24sp electronic, FORCE HRD shifters, FORCE kliky s power meterem 48/35, FORCE XG1270 E1 10-36",
          brakes: "SRAM FORCE AXS HRD, Paceline 160/140",
          wheels: "Syncros Capital 1.0S 40 mm 24F/24R",
          tires: "Schwalbe ONE TLE Race-Guard 700×30C",
          cockpit: "Syncros IC-R100-SL carbon integrovaný; SP-R101-CF sedlovka; Belcarra Regular 2.0",
        },
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
        sizes: ROAD_SIZES,
        gallery: gal("addict-rc-10", 6),
        scottUrl: "https://www.scott-sports.com/global/en/product/scott-addict-rc-10-bike",
        componentry: {
          frame: "Addict RC HMX, race geometrie",
          fork: "Addict RC HMX Flatmount Disc, 27,2 mm eccentric carbon steerer",
          drivetrain: "Shimano Ultegra Di2 R8150 24sp, ST-R8170, FC-R8100 52×36, CS-R8101 11-34",
          brakes: "Shimano BR-R8170 Hyd, RT-CL800 160/140",
          wheels: "Syncros Capital 1.0S 40 mm 24F/24R",
          tires: "Schwalbe ONE TLE Race-Guard 700×30C",
          cockpit: "Syncros IC-R100-SL carbon integrovaný; SP-R101-CF sedlovka; Belcarra Regular 2.0",
        },
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
    name: "Scott Addict Gravel 2027",
    tagline: "Kompletně nový gravel — 57mm prostup, rám pod 800 g",
    platform: "gravel",
    status: "launched",
    announcedDate: "2026-08-01",
    heroPhoto: "/media/scott-2027/addict-gravel-rc.webp",
    claim:
      "Kompletní redesign: prostup pneu 57 mm (pojme i 2,2\" MTB plášť), rám HMX 794 g, zadní flex +60 %, úložiště v rámu i nářadí schované v koncovkách řídítek.",
    frame:
      "Addict Gravel HMX Carbon — 794 g (M, −75 g oproti minulé generaci), HMF 990 g. Prostup pneu 57 mm, patky 425 mm (u středu zúžené na 8,5 mm), zadní flex +60 % / přední +30 %, tuhost záměrně snížena o <5 % kvůli přilnavosti. UDH měnitelný hanger, integrované úložiště Save the Day.",
    techHighlights: [
      "Prostup pneu 57 mm — pojme i 2,2\" MTB plášť (žádná 32\" verze)",
      "Rám HMX 794 g (−75 g), HMF 990 g",
      "Zadní flex +60 %, přední +30 % — komfort bez odpružení",
      "Úložiště Save the Day v rámu (duše, montpáky, mini pumpa)",
      "Nářadí schované v koncovkách řídítek (T25 klíč + tubeless kit)",
      "Košíky na vnitřku vidlice → −35 % setrvačnosti, hbitější řízení",
      "7 velikostí XXS–XXL, hlava 70°, integrované zadní světlo",
    ],
    geometry:
      "Reach 398 / stack 575 (M), rozvor 1060 mm, hlava 70°, BB drop −78 mm. Delší přední část = jistota v rychlosti, patky 425 mm jako silniční Addict = svižnost. Od gravel závodů po bikepacking.",
    variants: [
      {
        name: "Addict Gravel 10",
        slug: "addict-gravel-10",
        groupset: "SRAM Force XPLR AXS 13sp",
        wheels: "Fulcrum Soniq Carbon GR",
        weightKg: 8.2,
        priceEur: null,
        colors: ["Carbon"],
        photo: "/media/scott-2027/addict-gravel-10.webp",
        sizes: GRAVEL_SIZES,
        gallery: gal("addict-gravel-10", 5),
        scottUrl: "https://www.scott-sports.com/global/en/product/scott-addict-gravel-10-bike",
        componentry: {
          frame: "Addict Gravel Disc HMF Carbon, gravel geometrie",
          fork: "Addict Gravel HMF Flatmount Disc, 1 1/4\"-1 1/2\" eccentric carbon steerer",
          drivetrain: "SRAM FORCE eTap AXS 24sp electronic, FORCE HRD shifters, FORCE kliky 46/33, FORCE XG1270 10-36",
          brakes: "SRAM FORCE eTap AXS HRD, CenterLine XR 160/160",
          wheels: "DT Swiss GRC1400 Disc 24F/24R",
          tires: "Schwalbe G-One Bite Performance 700×45C (F/R)",
          cockpit: "Syncros Creston 1.0 X Carbon 31,8 mm řidítka; RR2.0 stem; Duncan 1.0 Aero sedlovka; Tofino Regular 1.0 Cutout sedlo",
        },
      },
      {
        name: "Addict Gravel 20",
        slug: "addict-gravel-20",
        groupset: "SRAM Force XPLR AXS 13sp",
        wheels: "Fulcrum Soniq Carbon GR",
        weightKg: 8.6,
        priceEur: null,
        colors: ["Carbon"],
        photo: "/media/scott-2027/addict-gravel-20.webp",
        sizes: GRAVEL_SIZES,
        gallery: gal("addict-gravel-20", 4),
        scottUrl: "https://www.scott-sports.com/global/en/product/scott-addict-gravel-20-bike",
        componentry: {
          frame: "Addict Gravel Disc HMF Carbon, gravel geometrie",
          fork: "Addict Gravel HMF Flatmount Disc, 1 1/4\"-1 1/2\" eccentric carbon steerer",
          drivetrain: "SRAM RIVAL XPLR eTap AXS 12sp electronic, RIVAL HRD shifters, RIVAL 1 WIDE kliky 42T, XPLR XG1251 10-44 (1× setup)",
          brakes: "SRAM RIVAL eTap AXS HRD, Paceline 160/160",
          wheels: "Syncros RP2.0 Disc",
          tires: "Schwalbe G-One Bite Performance 700×45C (F/R)",
          cockpit: "Syncros Creston 2.0 X Alloy 31,8 mm řidítka; RR2.0 stem; Duncan 1.0 Aero sedlovka; Tofino Regular 2.0 Cutout",
        },
      },
      {
        name: "Addict Gravel 40",
        slug: "addict-gravel-30",
        groupset: "Shimano GRX 12sp",
        wheels: "Syncros Capital GR alloy",
        weightKg: 8.7,
        priceEur: null,
        colors: ["Carbon"],
        photo: "/media/scott-2027/addict-gravel-30.webp",
        sizes: GRAVEL_SIZES,
        gallery: gal("addict-gravel-30", 3),
        scottUrl: "https://www.scott-sports.com/global/en/product/scott-addict-gravel-30-bike",
        componentry: {
          frame: "Addict Gravel Disc HMF Carbon, gravel geometrie",
          fork: "Addict Gravel HMF Flatmount Disc, eccentric carbon steerer",
          drivetrain: "Shimano GRX RX810/600 mix 22sp (2× setup)",
          brakes: "Shimano GRX hydraulické",
          wheels: "Syncros RP2.0 Disc",
          tires: "Schwalbe G-One 700×45C",
          cockpit: "Syncros Creston Alloy řidítka; standardní gravel setup",
        },
      },
    ],
    seoKeywords: [
      "scott addict gravel 2027",
      "nový scott gravel 2027",
      "scott addict gravel 57mm",
      "scott addict gravel recenze",
      "scott addict gravel cena",
      "scott gravel kolo 2027",
      "gravel kolo scott 100dola",
      "scott addict gravel předobjednávka",
    ],
  },
];

export function getPlatformBySlug(slug: string): Scott2027Platform | undefined {
  return SCOTT_2027.find((p) => p.slug === slug);
}

export function getVariantBySlug(
  platformSlug: string,
  variantSlug: string,
): { platform: Scott2027Platform; variant: Scott2027Variant } | undefined {
  const platform = getPlatformBySlug(platformSlug);
  if (!platform) return undefined;
  const variant = platform.variants.find((v) => v.slug === variantSlug);
  if (!variant) return undefined;
  return { platform, variant };
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

/**
 * Cena varianty pro zobrazení. Preferuje přesnou CZ cenu z oficiálního
 * Scott ceníku (priceCzk), jinak fallback na orientační přepočet z EUR.
 */
export function formatVariantPrice(v: Scott2027Variant): string {
  if (v.priceCzk != null) {
    return `${v.priceCzk.toLocaleString("cs-CZ").replace(/,/g, " ")} Kč`;
  }
  return eurToCzk(v.priceEur);
}
