// Sdílená data testovacího SCOTT fleetu (Šternberk) — používá je jak konfigurátor
// rezervace (ScottTestForm), tak detailní stránky s galerií (/vyzkousej-scott/[slug]).
//
// Specs vychází z scott-sports.com / endorphinrepublic.cz (ročníkově se liší
// — u konkrétních testovacích kusů ověřit fyzicky).
//
// photos[0] je úvodní / náhledová fotka (thumbnail v kartě konfigurátoru).
// productSlug je připraveno na budoucí feed-driven produktovou stránku (koupě) —
// zatím UNSET. Až bude e-shop napojený, nastaví se productSlug + přepne
// SCOTT_TEST_PRODUCT_PAGES_LIVE = true a detail se přesměruje na /shop/<productSlug>.

export interface ScottTestBike {
  slug: string;
  model: string;
  cat: string;
  sizes: string[];
  photos: string[];
  specs: string[];
  productSlug?: string;
}

export const SCOTT_TEST_BIKES: ScottTestBike[] = [
  {
    slug: "addict-rc-10",
    model: "SCOTT Addict RC 10",
    cat: "Silniční · závodní",
    sizes: ["M", "L", "XL"],
    photos: [
      "/media/scott-test/addict-rc-10/01.webp",
      "/media/scott-test/addict-rc-10/02.webp",
      "/media/scott-test/addict-rc-10/03.webp",
      "/media/scott-test/addict-rc-10/04.webp",
    ],
    specs: [
      "Rám Addict RC HMX carbon (~7 kg)",
      "Shimano Ultegra Di2 (elektronické řazení)",
      "Hydraulické kotoučové brzdy",
      "Karbonová kola Syncros Capital",
    ],
  },
  {
    slug: "addict-20",
    model: "SCOTT Addict 20",
    cat: "Silniční · endurance",
    sizes: ["M", "L", "XL"],
    photos: [
      "/media/scott-test/addict-20/01.webp",
      "/media/scott-test/addict-20/02.webp",
      "/media/scott-test/addict-20/03.webp",
      "/media/scott-test/addict-20/04.webp",
    ],
    specs: [
      "Rám Addict HMF carbon (endurance geometrie)",
      "Skupina Shimano (dle výbavy)",
      "Hydraulické kotoučové brzdy",
      "Komfort na dlouhé trasy, ~8 kg",
    ],
  },
  {
    slug: "foil-rc-10",
    model: "SCOTT Foil RC 10",
    cat: "Silniční · aero",
    sizes: ["M"],
    photos: [
      "/media/scott-test/foil-rc-10/01.webp",
      "/media/scott-test/foil-rc-10/02.webp",
      "/media/scott-test/foil-rc-10/03.webp",
      "/media/scott-test/foil-rc-10/04.webp",
      "/media/scott-test/foil-rc-10/05.webp",
    ],
    specs: [
      "Rám Foil RC HMX carbon (aero)",
      "Shimano Ultegra Di2",
      "Aero karbonová kola (60 mm)",
      "Hydraulické kotoučové brzdy",
    ],
  },
  {
    slug: "fastline",
    model: "SCOTT Fastlane",
    cat: "Silniční · elektro",
    sizes: ["L"],
    photos: [
      "/media/scott-test/fastline/01.webp",
      "/media/scott-test/fastline/02.webp",
      "/media/scott-test/fastline/03.webp",
      "/media/scott-test/fastline/04.webp",
    ],
    specs: [
      "Lehká e-silnička, pod 10 kg",
      "Skrytý motor TQ HPR40 + baterie 290 Wh",
      "Karbonový rám (geometrie Addict)",
      "Vypadá jako klasická silnička",
    ],
  },
  {
    slug: "addict-gravel-20",
    model: "SCOTT Addict Gravel 20",
    cat: "Gravel",
    sizes: ["M", "L", "XL"],
    photos: [
      "/media/scott-test/addict-gravel-20/01.webp",
      "/media/scott-test/addict-gravel-20/02.webp",
      "/media/scott-test/addict-gravel-20/03.webp",
      "/media/scott-test/addict-gravel-20/04.webp",
      "/media/scott-test/addict-gravel-20/05.webp",
      "/media/scott-test/addict-gravel-20/06.webp",
      "/media/scott-test/addict-gravel-20/07.webp",
    ],
    specs: [
      "Rám Addict Gravel HMF carbon",
      "Shimano GRX (gravel skupina)",
      "Pláště Schwalbe G-ONE 35 mm",
      "Hydraulické kotoučové brzdy",
    ],
  },
];

// Feature flag pro budoucí přepnutí detailu na feed-driven produktovou stránku.
// false → detail stránky renderují galerii + specs (viz [slug]/page.tsx).
// true (+ nastavený productSlug u kola) → detail přesměruje na /shop/<productSlug>.
export const SCOTT_TEST_PRODUCT_PAGES_LIVE = false;

export function getScottTestBike(slug: string): ScottTestBike | undefined {
  return SCOTT_TEST_BIKES.find((b) => b.slug === slug);
}
