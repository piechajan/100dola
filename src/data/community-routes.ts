// Trasy komunitních vyjížděk (Open Miles Clinic) — proklik na Stravu + GPX ke stažení.
// GPX soubory leží v /public/routes/. Přidávej sem další trasy, jak je Jan pošle.

export interface CommunityRoute {
  slug: string;
  name: string;
  area: string;
  /** Krátký popis trasy. */
  note: string;
  distance: string;
  /** Volitelný údaj o převýšení / vrcholu. */
  climb?: string;
  /** Odkaz na Stravu (aktivita nebo trasa) — proklik "Zobrazit na Stravě". */
  stravaUrl: string;
  /** Cesta ke GPX v /public/routes/. */
  gpx: string;
}

export const COMMUNITY_ROUTES: CommunityRoute[] = [
  {
    slug: "kohutka-valmez",
    name: "Kohútka z Valašského Meziříčí",
    area: "Javorníky · Valašsko",
    note: "Klasický výšlap na hraniční sedlo Kohútka a zpět přes valašské kopce. Dlouhý den se vším všudy.",
    distance: "104,8 km",
    climb: "vrchol Kohútka 915 m n. m.",
    stravaUrl: "https://www.strava.com/activities/19365390503",
    gpx: "/routes/kohutka-valmez.gpx",
  },
];
