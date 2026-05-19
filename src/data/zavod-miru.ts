// Závod Míru U23 2026 — data pro SEO článek na /isaac-test.
// Source: https://zavodmiru.com/cs/etapy

export const ZAVOD_MIRU_2026 = {
  name: "Závod Míru U23 2026",
  edition: "73. ročník",
  dates: { from: "2026-05-28", to: "2026-05-31" },
  category: "UCI 2.Ncup (Nations' Cup U23)",
  organizer: "Asociace Závodu Míru",
  officialSite: "https://zavodmiru.com",
  totalDistance: 530.8, // 112.2 + 155.6 + 132.4 + 130.6
  totalElevation: 9454, // 1809 + 2403 + 2964 + 2278
  stages: [
    {
      n: 1,
      day: "Čtvrtek 28. 5.",
      date: "2026-05-28",
      from: "Jeseník",
      fromVenue: "Masarykovo náměstí",
      to: "Šumperk",
      toVenue: "ulice 8. května",
      distanceKm: 112.2,
      elevationM: 1809,
    },
    {
      n: 2,
      day: "Pátek 29. 5.",
      date: "2026-05-29",
      from: "Uničov",
      fromVenue: "Masarykovo náměstí",
      to: "Rýmařov",
      toVenue: "náměstí Míru",
      distanceKm: 155.6,
      elevationM: 2403,
    },
    {
      n: 3,
      day: "Sobota 30. 5.",
      date: "2026-05-30",
      from: "Zábřeh",
      fromVenue: "Masarykovo náměstí",
      to: "Dlouhé stráně",
      toVenue: "vrchol přehrady (časovka do kopce)",
      distanceKm: 132.4,
      elevationM: 2964,
    },
    {
      n: 4,
      day: "Neděle 31. 5.",
      date: "2026-05-31",
      from: "Krnov",
      fromVenue: "Hlavní náměstí",
      to: "Šternberk",
      toVenue: "ulice Radniční (centrum, u náměstí)",
      distanceKm: 130.6,
      elevationM: 2278,
      isFinal: true,
      expectedArrival: "17:00–17:30",
    },
  ],
  history: {
    firstYear: 1948,
    legends: ["Jan Veselý", "Vlastimil Moravec", "Sergej Suchorucenkov", "Olaf Ludwig", "Uwe Ampler"],
    note:
      "Závod Míru má v Česku jednu z nejdelších tradic v Evropě. Hlavní elitní ročník (Course de la Paix Praha–Berlín–Varšava) skončil 2006. Od 2013 se nepřetržitě jede mládežnická U23 verze v Olomouckém kraji.",
  },
};

export type ZavodMiruData = typeof ZAVOD_MIRU_2026;
