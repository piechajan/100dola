// Trasy komunitních vyjížděk (Open Miles Clinic) — proklik na trasu + GPX ke stažení.
// GPX soubory leží v /public/routes/. Přidávej sem další trasy, jak je Jan pošle.
// viewUrl: veřejný odkaz na trasu (Strava aktivita nebo Mapy.com plánovač).

export interface CommunityRoute {
  slug: string;
  name: string;
  area: string;
  /** Krátký popis trasy. */
  note: string;
  distance: string;
  /** Volitelný údaj o převýšení / vrcholu. */
  climb?: string;
  /** Veřejný odkaz na trasu (Strava aktivita / Mapy.com). */
  viewUrl: string;
  /** Cesta ke GPX v /public/routes/. */
  gpx: string;
}

export const COMMUNITY_ROUTES: CommunityRoute[] = [
  {
    slug: "pustevny-climb-valmez",
    name: "Pustevny CLIMB",
    area: "Beskydy · Valašsko",
    note: "Od Chochina přes Pustevny (posezení Libušín) a zpět do Valmezu. Beskydská klasika s výjezdem k Radhošti.",
    distance: "72,5 km",
    climb: "cíl Pustevny 1 009 m n. m.",
    viewUrl: "https://mapy.com/s/magujozafe",
    gpx: "/routes/pustevny-climb-valmez.gpx",
  },
  {
    slug: "lago-di-sance-valmez",
    name: "Lago di Šance",
    area: "Beskydy · Valašsko",
    note: "Přes Bílou, okolo přehrady Šance na Čeladnou (kafe Maralák) a zpět. Dlouhý pohodový den po Beskydech.",
    distance: "100,6 km",
    climb: "Beskydy — Bílá, Šance, Čeladná",
    viewUrl: "https://mapy.com/s/penecaluju",
    gpx: "/routes/lago-di-sance-valmez.gpx",
  },
  {
    slug: "kohutka-valmez",
    name: "Kohútka z Valašského Meziříčí",
    area: "Javorníky · Valašsko",
    note: "Klasický výšlap na hraniční sedlo Kohútka a zpět přes valašské kopce. Dlouhý den se vším všudy.",
    distance: "104,8 km",
    climb: "vrchol Kohútka 915 m n. m.",
    viewUrl: "https://www.strava.com/activities/19365390503",
    gpx: "/routes/kohutka-valmez.gpx",
  },
];
