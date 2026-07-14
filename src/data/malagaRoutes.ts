// Self-guided trasy kolem Malagy — inspirace + destination readiness.
// Charakter tras je popsaný poctivě; přesné GPX a doladění podle formy
// sdílíme po příletu (proto ranges, ne pseudopřesné GPS metriky).

export type RouteSurface = "road" | "gravel" | "mixed";
export type RouteLevel = "začátečník" | "hobby" | "zkušený" | "silný jezdec";

export interface MalagaRoute {
  slug: string;
  name: string;
  surface: RouteSurface;
  level: RouteLevel;
  /** přibližná délka okruhu z/kolem základny */
  distanceKm: string;
  /** přibližné převýšení */
  climbM: string;
  /** jedním dechem, co to je */
  tagline: string;
  /** delší popis charakteru */
  description: string;
  /** highlighty na trase */
  highlights: string[];
  /** kavárna / zastávka */
  stop: string;
  /** komu sedne */
  bestFor: string;
}

export const SURFACE_LABEL: Record<RouteSurface, string> = {
  road: "Silnice",
  gravel: "Gravel",
  mixed: "Silnice + gravel",
};

export const SURFACE_EMOJI: Record<RouteSurface, string> = {
  road: "🚴",
  gravel: "🪨",
  mixed: "🚵",
};

export const MALAGA_ROUTES: MalagaRoute[] = [
  {
    slug: "montes-de-malaga-puerto-del-leon",
    name: "Montes de Málaga — Puerto del León",
    surface: "road",
    level: "hobby",
    distanceKm: "50–65 km",
    climbM: "≈ 1 000 m",
    tagline: "Domácí klasika. Táhlé stoupání z města rovnou do hor.",
    description:
      "Signature výjezd, který máš z centra do pár minut. Souvislé, dobře jezditelné stoupání přírodním parkem Montes de Málaga až k sedlu okolo 900 m — plynulé serpentiny ve stínu borovic, nahoře výhled zpátky na moře. Ideální první ride po příletu: rozjezd, kterým si otestuješ formu, a přitom slušná porce metrů.",
    highlights: ["Souvislý výjezd přírodním parkem", "Výhled na Malagu a moře", "Hladký asfalt, málo aut"],
    stop: "Venta / kavárna u sedla — káva a tortilla nahoře",
    bestFor: "První den, zahřívací výjezd, kdokoli s trochou formy",
  },
  {
    slug: "axarquia-comares-balkony",
    name: "Axarquía — balkónové vesnice a Comares",
    surface: "road",
    level: "zkušený",
    distanceKm: "70–90 km",
    climbM: "1 500–2 000 m",
    tagline: "Bílé vesnice na kopcích a kraťoučké prudké rampy.",
    description:
      "Východně od Malagy začíná Axarquía — kraj bílých vesnic přilepených na hřebeny. Jízda je tu o krátkých, ale prudkých výjezdech mezi vesnicemi jako Comares nebo Almáchar. Odměna: balkónové výhledy do údolí a prázdné silnice, kde potkáš spíš pomeranče než auta. Punchy den pro nohy, co snesou procenta.",
    highlights: ["Bílé vesnice Comares, Almáchar", "Prudké rampy 10 %+", "Prázdné venkovské silnice"],
    stop: "Náměstí v Comares — kafe s výhledem do údolí",
    bestFor: "Kdo má rád kopce a chce sbírat vesnice",
  },
  {
    slug: "zafarraya-velky-den",
    name: "Zafarraya — dlouhý stoupák pro velký den",
    surface: "road",
    level: "silný jezdec",
    distanceKm: "100–130 km",
    climbM: "1 800–2 300 m",
    tagline: "Táhlý výjezd starou železniční tratí. Trénink jako profíci.",
    description:
      "Klasika, na které trénují profesionální týmy. Dlouhé, rovnoměrné stoupání k sedlu Zafarraya bývalou železniční tratí — mírný sklon, který drží tempo hodiny. Velký celodenní okruh s návratem přes vnitrozemí. Když chceš odjet objem a otestovat vytrvalost, tohle je ono.",
    highlights: ["Rovnoměrný profesionální stoupák", "Tunel staré železnice", "Objemový celodenní okruh"],
    stop: "Bar v Ventas de Zafarraya na sedle",
    bestFor: "Objemový trénink, silní jezdci a kempy",
  },
  {
    slug: "guadalhorce-el-chorro-gravel",
    name: "El Chorro & údolí Guadalhorce — gravel",
    surface: "mixed",
    level: "hobby",
    distanceKm: "55–75 km",
    climbM: "800–1 200 m",
    tagline: "Tyrkysové přehrady, rokle a šotolina mimo provoz.",
    description:
      "Gravelový výlet do vnitrozemí k soutěsce El Chorro (nad ní visí slavný Caminito del Rey) a tyrkysovým přehradám Guadalhorce. Mix zpevněných cest, klidného asfaltu a lesních úseků. Scenérie, kvůli které si budeš pořád zastavovat na fotky — a přitom skoro bez aut.",
    highlights: ["Soutěska El Chorro", "Tyrkysové přehrady", "Šotolina a lesní cesty bez aut"],
    stop: "Kiosk u jezera Embalse del Conde de Guadalhorce",
    bestFor: "Gravel jezdci, kdo chce scenérii bez provozu",
  },
  {
    slug: "pobrezi-rincon-recovery",
    name: "Pobřeží — Rincón de la Victoria (recovery)",
    surface: "road",
    level: "začátečník",
    distanceKm: "35–50 km",
    climbM: "200–400 m",
    tagline: "Rovina u moře. Lehký den, káva s výhledem na Středozemí.",
    description:
      "Klidný pobřežní okruh po cyklostezkách a vedlejších silnicích východně podél moře. Skoro bez převýšení, ideální na regeneraci mezi náročnými dny, na první rozjezd nebo pro toho, kdo teprve nabírá kilometry. Otočka u pláže, káva a zpět.",
    highlights: ["Cyklostezka u moře", "Minimum převýšení", "Pláže a promenády"],
    stop: "Chiringuito na pláži v Rincón de la Victoria",
    bestFor: "Regenerace, začátečníci, lehký den",
  },
  {
    slug: "ronda-epicky-okruh",
    name: "Ronda — epický horský den",
    surface: "road",
    level: "silný jezdec",
    distanceKm: "120–160 km",
    climbM: "2 500–3 200 m",
    tagline: "Královská etapa přes hory k městu na skále.",
    description:
      "Nejtěžší a nejkrásnější den v nabídce. Cesta serpentinami přes pohoří až k Rondě — městu posazenému nad hlubokou roklí El Tajo. Vysoké převýšení, dlouhé stoupáky, velké ticho hor. Buď jako celodenní výzva, nebo s podporou vozu, který ti veze věci a čeká na vrcholech.",
    highlights: ["Město Ronda nad roklí El Tajo", "Vysokohorské serpentiny", "Dlouhé souvislé stoupáky"],
    stop: "Kavárna v centru Rondy nad roklí",
    bestFor: "Silní jezdci, kdo chce jeden velký zážitkový den",
  },
];
