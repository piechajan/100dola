export type Difficulty = "Lehká" | "Střední" | "Náročná";

export type Sport =
  | "Silnice"
  | "Gravel"
  | "MTB"
  | "Skialpy"
  | "Běžky"
  | "Turistika"
  | "Malaga";

export interface Event {
  id: number;
  slug: string;
  title: string;
  sport: Sport;
  date: string;
  dateISO: string;
  time: string;
  location: string;
  locationDetail: string;
  distance: string;
  elevation: string;
  difficulty: Difficulty;
  capacity: number;
  filled: number;
  description: string;
  longDescription: string;
  whatToBring: string[];
  whoIsItFor: string;
  organizer: { name: string; role: string };
  photo: string;
  photoGallery?: string[];
  routeUrl?: string;
  mapUrl?: string;
  stravaActivityUrl?: string;
  isPast?: boolean;
  /** Externí URL pro CTA — pokud je nastaveno, event se nepoužívá standardní /community registrační flow, ale rovnou link sem (např. ISAAC test → /isaac-test). */
  externalUrl?: string;
  externalCtaLabel?: string;
  /** Cesta ke GPX v /public (pro výškový profil na detailu). */
  gpxPath?: string;
  /** Počet přihlášených jezdců (např. na Stravě) — zobrazí se na detailu. */
  participants?: number;
  /** Prominentní SCOTT test CTA (link na /vyzkousej-scott). Nastaveno POUZE na Pustevny jízdě. */
  scottCta?: boolean;
  /** Restaurace/podnik startu (sraz) — s prokliky na IG/web. */
  startVenue?: EventVenue;
  /** Restaurace/podnik cíle (posezení) — s prokliky na IG/web. */
  endVenue?: EventVenue;
  /** Varianty obtížnosti/délky (např. lehká do 70 km, střední 70–100, extra 160). */
  difficultyVariants?: Array<{ label: string; distance: string; elevationM?: number; note?: string }>;
}

export interface EventVenue {
  name: string;
  /** Krátký popis role (např. „sraz", „cíl — posezení po jízdě"). */
  role?: string;
  instagram?: string;
  web?: string;
  facebook?: string;
}

export const SPORT_COLORS: Record<Sport, string> = {
  Silnice: "#3B7CF4",
  Gravel: "#E8431A",
  MTB: "#2EAA6E",
  Skialpy: "#7C5CBF",
  Běžky: "#00A8CC",
  Turistika: "#8B6E52",
  Malaga: "#C4622D",
};

export const SPORT_ICONS: Record<Sport, string> = {
  Silnice: "🚴",
  Gravel: "🚵",
  MTB: "⛰️",
  Skialpy: "🎿",
  Běžky: "⛷️",
  Turistika: "🥾",
  Malaga: "☀️",
};

export const DIFFICULTY_COLOR: Record<Difficulty, string> = {
  Lehká: "#2EAA6E",
  Střední: "#E8A020",
  Náročná: "#E8431A",
};

export const events: Event[] = [
  {
    id: 60,
    slug: "puchov-pain",
    title: "Púchov PAIN 💪",
    sport: "Silnice",
    date: "Ne 30. srpna",
    dateISO: "2026-08-30",
    time: "09:00",
    location: "Valašské Meziříčí → Púchov (SK)",
    locationDetail: "Sraz café Tucan, náměstí Valašské Meziříčí (výjezd 9:00)",
    distance: "160 km",
    elevation: "~1 500 m",
    difficulty: "Náročná",
    capacity: 20,
    filled: 0,
    description:
      "Nejnáročnější klubovka Open Miles Clinic — 160 km do Púchova a zpět. Sraz café Tucan, cíl posezení Po Cestě. Dlouhý poctivý den v sedle pro zkušené jezdce.",
    longDescription: `Púchov PAIN je královská etapa Open Miles Clinic — dlouhá, kopcovitá a poctivá. Vyjíždíme od café Tucan na náměstí ve Valašském Meziříčí přes valašské a slovenské kopce směr Púchov a zpět. Celkem 160 km.

Tempo držíme skupinové, ale je to dálka — počítej s poctivým dnem v sedle. Na sebe počkáme, nikoho nenecháme v tom.

Po jízdě klasika — společné posezení v restauraci Po Cestě.`,
    whatToBring: [
      "Silniční kolo v dobrém stavu",
      "Helma",
      "2 lahve + jídlo na cestu",
      "Vrstva navíc a nářadí na defekt",
    ],
    whoIsItFor: "Zkušení jezdci, co si chtějí sáhnout na dlouhé kilometry.",
    organizer: { name: "Open Miles Clinic", role: "klubová jízda" },
    photo: "/media/puchov-pain.webp",
    routeUrl: "https://mapy.com/s/metasorafo",
    startVenue: {
      name: "Café Tucan",
      role: "sraz",
      instagram: "https://www.instagram.com/kavarnatucan/",
      web: "https://www.cafetucan.cz",
      facebook: "https://www.facebook.com/cafeetucan/",
    },
    endVenue: {
      name: "Po Cestě",
      role: "cíl — posezení po jízdě",
      instagram: "https://www.instagram.com/poceste_restaurace/",
      web: "https://poceste.cz",
    },
  },
  {
    id: 61,
    slug: "thursday-easy-ride",
    title: "thursday EASY ride 🚴",
    sport: "Silnice",
    date: "Čt 3. září",
    dateISO: "2026-09-03",
    time: "16:15",
    location: "Valašské Meziříčí",
    locationDetail: "Start Chochino Koloniál Kafe, Křížná 250 (16:15)",
    distance: "~40 km",
    elevation: "~300 m",
    difficulty: "Lehká",
    capacity: 20,
    filled: 0,
    description:
      "Pohodová čtvrteční vyjížďka Open Miles Clinic. Start Chochino Koloniál Kafe, cíl posezení Vista Bar. Tempo pro každého — přijeď se svézt.",
    longDescription: `thursday EASY ride je pohodová čtvrteční klubovka Open Miles Clinic — žádné závodění, jen svézt se, provětrat nohy a dát si po jízdě něco dobrého.

Startujeme od Chochino Koloniál Kafe, projedeme příjemnou okolní smyčku kolem 40 km a zakončíme společně ve Vista Baru.

Ideální, když si chceš zajezdit ve skupině bez tlaku na výkon. Přijď na jakémkoliv silničním kole.`,
    whatToBring: ["Silniční kolo", "Helma", "Lahev a drobná svačina", "Dobrá nálada"],
    whoIsItFor: "Pro všechny — pohodové tempo, nikdo se neztratí.",
    organizer: { name: "Open Miles Clinic", role: "klubová jízda" },
    photo: "/media/thursday-easy-ride-2026.webp",
    routeUrl: "https://mapy.com/s/cusucagugo",
    startVenue: {
      name: "Chochino Koloniál Kafe",
      role: "start",
      instagram: "https://www.instagram.com/chochino_proste_jine_kokino/",
      web: "https://chochino.cz",
    },
    endVenue: {
      name: "Vista Bar",
      role: "cíl — posezení po jízdě",
      instagram: "https://www.instagram.com/vista.bar/",
      web: "https://www.vistabar.cz",
    },
  },
  {
    id: 62,
    slug: "rychlebske-stezky-2026",
    title: "Rychlebské stezky",
    sport: "MTB",
    date: "Pá–Ne 25.–27. září",
    dateISO: "2026-09-25",
    time: "celý víkend",
    location: "Černá Voda, Jeseníky",
    locationDetail: "Rychlebské stezky — singletrailové centrum, Černá Voda",
    distance: "Trail centrum",
    elevation: "13 tratí · 8 superflow",
    difficulty: "Náročná",
    capacity: 20,
    filled: 0,
    description:
      "Víkend na Rychlebských stezkách — jedno z nejlepších singletrailových center v ČR (IMBA ocenění). V případě zájmu nás kontaktuj, zajistíme ubytování. Vhodná výbava: horské kolo.",
    longDescription: `Prodloužený víkend na Rychlebských stezkách v Jeseníkách — technické kamenité tratě i moderní flow traily, 13 pojmenovaných tratí a 8 superflow sekcí. Jedno z mála center na světě s oceněním IMBA za model trail (Superflow).

Program:
• Pátek — individuální příjezd
• Sobota — ježdění, koupání v lomu, společné opíkání
• Neděle — ježdění, odjezd v odpoledních hodinách

Vhodná výbava: horské kolo (ideálně celoodpružené), helma, chrániče.

**V případě zájmu nás kontaktuj — zajistíme ubytování.** Napiš nám a domluvíme detaily (doprava, ubytování).`,
    whatToBring: [
      "Horské kolo (celoodpružené ideální)",
      "Helma (ideálně integrální) + chrániče",
      "Náhradní duše, nářadí, pumpa",
      "Vrstvy na hory — počasí se mění",
    ],
    whoIsItFor: "Jezdci se zkušeností na trailech — technické i flow tratě pro pokročilé.",
    organizer: { name: "Open Miles Clinic", role: "klubová akce" },
    photo: "/media/rychlebske-stezky-2026.webp",
    routeUrl: "https://www.rychlebskestezky.cz/cs/trails",
    externalCtaLabel: "Mám zájem — kontaktovat",
    startVenue: {
      name: "Rychlebské stezky",
      role: "trailové centrum",
      instagram: "https://www.instagram.com/rychlebske_stezky/",
      web: "https://www.rychlebskestezky.cz",
    },
  },
  {
    id: 40,
    slug: "pustevny-climb-valmez",
    title: "Pustevny CLIMB",
    sport: "Silnice",
    date: "So 6. června",
    dateISO: "2026-06-06",
    time: "10:00",
    location: "Valašské Meziříčí → Pustevny",
    locationDetail: "Sraz u kavárny Chochino, Valašské Meziříčí (výjezd 10:00)",
    distance: "72,5 km",
    elevation: "~610 m",
    difficulty: "Náročná",
    capacity: 20,
    filled: 13,
    participants: 13,
    description: "Od Chochina přes Pustevny (posezení Libušín) zpět do Valmezu. Beskydská klasika k Radhošti. Klubová jízda Open Miles Clinic.",
    longDescription: `Pustevny CLIMB je beskydská klasika Open Miles Clinic. Vyjíždíme od kavárny Chochino ve Valašském Meziříčí, míříme přes valašské kopce nahoru na Pustevny s posezením u Libušína, a stejnou parádní cestou zpět do Valmezu.

Trasa má 72,5 km a ~610 m převýšení — výjezd na Pustevny prověří nohy, ale tempo držíme skupinové a nahoře na sebe počkáme. Za jasného počasí je od Radhoště výhled až na Slovensko.

Po jízdě klasika — kafe a něco dobrého na zpátečku.

→ [Stáhnout GPX](/routes/pustevny-climb-valmez.gpx)`,
    whatToBring: [
      "Silniční nebo gravel kolo",
      "Helma — povinná",
      "Voda na 2× láhev",
      "Drobnou svačinu nebo gel",
      "Větrovku (na Pustevnách umí zafoukat)",
    ],
    whoIsItFor: "Pro pravidelné silničáře. Výjezd na Pustevny je náročnější, ale tempo je skupinové — nahoře i v údolí se najdeme.",
    organizer: { name: "Jan Piecha", role: "Zakladatel Open Miles Clinic" },
    photo: "/media/pustevny-climb-ride.webp",
    routeUrl: "https://mapy.com/s/magujozafe",
    gpxPath: "/routes/pustevny-climb-valmez.gpx",
    isPast: true,
    scottCta: true,
  },
  {
    id: 41,
    slug: "lago-di-sance-valmez",
    title: "Lago di Šance",
    sport: "Silnice",
    date: "So 27. června",
    dateISO: "2026-06-27",
    time: "09:00",
    location: "Valašské Meziříčí → Beskydy (Šance)",
    locationDetail: "Sraz u kavárny Chochino, Valašské Meziříčí (výjezd 09:00)",
    distance: "100,6 km",
    elevation: "~645 m",
    difficulty: "Střední",
    capacity: 20,
    filled: 10,
    participants: 10,
    description: "Přes Bílou, okolo přehrady Šance na Čeladnou (kafe Maralák) a zpět. Dlouhý pohodový den po Beskydech.",
    longDescription: `Lago di Šance je dlouhý pohodový den v Beskydech. Z Valašského Meziříčí jedeme přes Bílou, okolo přehrady Šance na Čeladnou (kafe Maralák) a zpátky údolím.

Trasa má 100,6 km a ~645 m převýšení — bez velkých kopců, ale pořádná porce kilometrů v krásné krajině. Ideální na klidné vytrvalostní tempo ve skupině.

Kafe zastávka v Čeladné u Maraláku je součástí plánu — protáhneme nohy a jedeme zpátky.

→ [Stáhnout GPX](/routes/lago-di-sance-valmez.gpx)`,
    whatToBring: [
      "Silniční nebo gravel kolo",
      "Helma — povinná",
      "Voda na 2× láhev",
      "Svačinu na dlouhý den",
      "Peníze na kafe v Čeladné",
    ],
    whoIsItFor: "Pro silničáře se základní vytrvalostí. Dlouhá, ale pohodová jízda — tempo skupinové.",
    organizer: { name: "Jan Piecha", role: "Zakladatel Open Miles Clinic" },
    photo: "/media/lago-di-sance-ride.webp",
    routeUrl: "https://mapy.com/s/penecaluju",
    gpxPath: "/routes/lago-di-sance-valmez.gpx",
    isPast: true,
  },
  {
    id: 42,
    slug: "kohutka-valmez",
    title: "Kohútka",
    sport: "Silnice",
    date: "So 18. července",
    dateISO: "2026-07-18",
    time: "10:00",
    location: "Valašské Meziříčí → Kohútka",
    locationDetail: "Sraz u kavárny Chochino, Valašské Meziříčí (výjezd 10:00)",
    distance: "104,8 km",
    elevation: "~1 017 m",
    difficulty: "Náročná",
    capacity: 20,
    filled: 0,
    description: "Výšlap na hraniční sedlo Kohútka v Javorníkách a zpět přes valašské kopce. Dlouhý den se vším všudy.",
    longDescription: `Kohútka je královská etapa Open Miles Clinic — výšlap na hraniční sedlo Kohútka v Javorníkách a zpět přes valašské kopce. Dlouhý den se vším všudy.

Trasa má 104,8 km a ~1 017 m převýšení. Výjezd na Kohútku je hlavní chod dne, ale i cesta tam a zpět má svoje kopečky. Tempo skupinové, na stoupáních se přirozeně rozjedeme a nahoře se zase najdeme.

Kdo dojede Kohútku, ten má den splněný. Detaily jízdy najdeš i na Stravě.

→ [Stáhnout GPX](/routes/kohutka-valmez.gpx)`,
    whatToBring: [
      "Silniční nebo gravel kolo",
      "Helma — povinná",
      "Voda na 2× láhev",
      "Jídlo a gely na dlouhý den",
      "Větrovku na sjezd z Kohútky",
    ],
    whoIsItFor: "Pro zkušené silničáře. Dlouhá jízda s výrazným stoupáním — počítej s celým dnem na kole.",
    organizer: { name: "Jan Piecha", role: "Zakladatel Open Miles Clinic" },
    photo: "/media/kohutka-ride.webp",
    routeUrl: "https://www.strava.com/activities/19365390503",
    stravaActivityUrl: "https://www.strava.com/activities/19365390503",
    gpxPath: "/routes/kohutka-valmez.gpx",
    isPast: true,
  },
  {
    id: 43,
    slug: "saint-hostyn-valmez",
    title: "Saint Hostýn",
    sport: "Silnice",
    date: "Ne 14. června",
    dateISO: "2026-06-14",
    time: "10:00",
    location: "Valašské Meziříčí → Svatý Hostýn",
    locationDetail: "Sraz u kavárny Tucan, náměstí Valašské Meziříčí (výjezd 10:00)",
    distance: "82,3 km",
    elevation: "~646 m",
    difficulty: "Střední",
    capacity: 20,
    filled: 8,
    participants: 8,
    description: "Výjezd od kavárny Tucan (Valmez náměstí) na Svatý Hostýn, pak Troják a Tesák, posezení v restauraci Po Cestě. Klubová jízda Open Miles Clinic.",
    longDescription: `Saint Hostýn je klasická nedělní klubová jízda Open Miles Clinic. Vyjíždíme od kavárny Tucan na náměstí ve Valašském Meziříčí, míříme na Svatý Hostýn, pak přes Troják a Tesák, s posezením v restauraci Po Cestě.

Trasa má 82,3 km a ~646 m převýšení — příjemný nedělní den s výjezdem na poutní Hostýn a hřebenovkou Hostýnských vrchů. Tempo skupinové, čekáme na sebe v cílech.

Posezení v restauraci Po Cestě je součástí plánu — dobré jídlo a odpočinek uprostřed jízdy.

→ [Stáhnout GPX](/routes/saint-hostyn-valmez.gpx)`,
    whatToBring: [
      "Silniční nebo gravel kolo",
      "Helma — povinná",
      "Voda na 2× láhev",
      "Drobnou svačinu nebo gel",
      "Peníze na oběd v restauraci Po Cestě",
    ],
    whoIsItFor: "Pro pravidelné silničáře. Nedělní pohodová jízda s jedním výjezdem — tempo skupinové.",
    organizer: { name: "Jan Piecha", role: "Zakladatel Open Miles Clinic" },
    photo: "/media/road-event.jpg",
    routeUrl: "https://mapy.com/s/bulahakuja",
    gpxPath: "/routes/saint-hostyn-valmez.gpx",
    isPast: true,
  },
  {
    id: 0,
    slug: "season-opening",
    title: "Season Opening",
    sport: "Silnice",
    date: "Ne 19. dubna",
    dateISO: "2026-04-19",
    time: "09:45",
    location: "Kavárna Chochino, Valašské Meziříčí",
    locationDetail: "Sraz přímo u kavárny Chochino, Valašské Meziříčí",
    distance: "63–68 km",
    elevation: "565–670 m",
    difficulty: "Střední",
    capacity: 20,
    filled: 6,
    description: "Otevíráme sezónu. Dvě trasy na výběr — Cappuccino (63,7 km / 565 m) nebo Espresso (67,9 km / 670 m). Sraz u Chochina, jedeme spolu.",
    longDescription: `Season Opening je neformální start sezóny pro celou komunitu Open Miles Clinic. Sraz v 9:45 u kavárny Chochino, výjezd v 10:00. Po jízdě se vracíme na kávu a projdeme, co nás čeká v sezóně.

Na výběr jsou dvě trasy — vyber si podle nálady:

☕ **Cappuccino — 63,7 km · 565 m · ~4 hod**
Okruh z Valašského Meziříčí přes kopce a zpátky. Dvě výraznější stoupání, max. výška 670 m n.m. Pohodové tempo, ideální start sezóny.
→ [Stáhnout GPX](/routes/season-opening-cappuccino.gpx)

☕ **Espresso — 67,9 km · 670 m · ~4,5 hod**
Delší varianta se stejným charakterem — o trochu více převýšení, o trochu více kilometrů. Pro ty, kdo chtějí sezónu otevřít pořádně.
→ [Stáhnout GPX](/routes/season-opening-espresso.gpx)

Jedeme vždy v jedné skupině — tempo přizpůsobíme. Kdo chce Cappuccino, odbočí dřív.`,
    whatToBring: [
      "Silniční nebo gravel kolo",
      "Helma — povinná",
      "Voda a svačina na 2–3 hodiny",
      "Dle počasí — větrovka",
      "Dobrá nálada",
    ],
    whoIsItFor: "Kdokoliv na kole. Tempo přizpůsobíme skupině.",
    organizer: { name: "Jan Piecha", role: "Zakladatel Open Miles Clinic" },
    photo: "/media/season-opening.jpg",
    mapUrl: "https://en.mapy.cz/turisticka?x=18.0399812&y=49.4375893&z=12",
  },
  {
    id: 8,
    slug: "trojak-tesak",
    title: "Troják — Tesák",
    sport: "Silnice",
    date: "So 2. května",
    dateISO: "2026-05-02",
    time: "09:45",
    location: "Valašské Meziříčí — Hostýnské vrchy",
    locationDetail: "Sraz u kavárny Chochino, Valašské Meziříčí (kafe 9:45, výjezd ~10:00)",
    distance: "~95 km",
    elevation: "~1 400 m",
    difficulty: "Náročná",
    capacity: 20,
    filled: 9,
    description: "Klasický okruh přes Troják a Tesák. Krásné stoupání hřebenovkou, sjezdy přes valašské kopečky. Klubová sobota Open Miles Clinic.",
    longDescription: `Troják (933 m) a Tesák patří mezi klasické cíle valašských silničářů. Tradiční sobotní okruh Open Miles Clinic vede z Valašského Meziříčí přes hřebenovku Hostýnských vrchů.

Stoupání nahoru je zvládnutelné v jakémkoli tempu — skupina se rozdělí podle síly a v cíli se zase najde. Výhled z hřebene je za jasného počasí ažň po Slovensko.

Po jízdě klasika — kafe a něco dobrého v některé z místních kaváren / hospůdek.`,
    whatToBring: [
      "Silniční nebo gravel kolo",
      "Helma — povinná",
      "Voda na 2× láhev",
      "Drobnou svačinu nebo gel",
      "Větrovku (na hřebeni umí zafoukat)",
    ],
    whoIsItFor: "Pro pravidelné silničáře. Tempo skupinové, ale na stoupáních se přirozeně rozjedeme — čekáme na sebe v cílech.",
    organizer: { name: "Jan Piecha", role: "Zakladatel Open Miles Clinic" },
    photo: "/media/road-event.jpg",
    isPast: true,
  },
  {
    id: 1,
    slug: "vyjizdka-od-chochina-kvetna",
    title: "Vyjížďka od Chochina",
    sport: "Silnice",
    date: "So 16. května",
    dateISO: "2026-05-16",
    time: "09:45",
    location: "Kavárna Chochino, Valašské Meziříčí",
    locationDetail: "Sraz u kavárny Chochino. Při horším počasí přesun na neděli 17. 5.",
    distance: "55 km",
    elevation: "600 m",
    difficulty: "Střední",
    capacity: 20,
    filled: 3,
    description: "Jarní vyjížďka z Valašského Meziříčí. Při horším počasí se přesouváme na neděli 17. 5. — rozhodnutí den předem.",
    longDescription: `Jarní vyjížďka v dobrém tempu přes Vsetínsko a zpátky. Trasa vede přes Bečvu, kopce nad Vsetínem a zpátky po silnicích s výhledem na Beskydy.

Při horším počasí (déšť, silný vítr) se akce přesouvá na neděli 17. 5. — rozhodnutí oznámíme den předem přes skupinový chat.

Sraz u Chochina v 10:00.`,
    whatToBring: [
      "Silniční nebo gravel kolo",
      "Helma — povinná",
      "Jídlo a pití na ~2,5 hodiny",
      "Větrovka nebo pláštěnka dle předpovědi",
      "Nabitý telefon",
    ],
    whoIsItFor: "Jezdci se základní kondicí. Průměrné tempo skupiny ~25–28 km/h.",
    organizer: { name: "Jan Piecha", role: "Zakladatel Open Miles Clinic" },
    photo: "https://images.unsplash.com/photo-1501147830916-ce44a6359892?w=1400&q=85&fit=crop",
  },
  {
    id: 9,
    slug: "dusna-solan",
    title: "Dušná — Soláň",
    sport: "Silnice",
    date: "So 23. května",
    dateISO: "2026-05-23",
    time: "09:45",
    location: "Valašské Meziříčí — Beskydy",
    locationDetail: "Sraz u kavárny Chochino, Valašské Meziříčí (kafe 9:45, výjezd ~10:00)",
    distance: "~95 km",
    elevation: "~1 500 m",
    difficulty: "Náročná",
    capacity: 20,
    filled: 8,
    description: "Dva valašské klasické vrchy v jedné jízdě. Dušná i Soláň — sjezd přes Velké Karlovice, návrat údolím Bečvy. Klubová sobota Open Miles Clinic.",
    longDescription: `Klasický valašský kombo okruh, který Open Miles Clinic jezdí pravidelně každou jarní sezónu. Dušná (1024 m) a Soláň (861 m) patří mezi cíle, kde se silničář napracuje, ale za výhled stojí.

Trasa vede z Valmezu přes Bečvu k Vsetínu, výjezd na Dušnou, sjezd do Velkých Karlovic, výjezd na Soláň, návrat údolím. Tempo skupinové, čekáme na sebe nahoře i v údolích.

Po jízdě klasika v některé z karlovských restaurací nebo zpátky u Chochina.`,
    whatToBring: [
      "Silniční nebo gravel kolo",
      "Helma — povinná",
      "Voda na 2× láhev",
      "Drobnou svačinu nebo gel",
      "Větrovku (na hřebenech umí zafoukat i v květnu)",
    ],
    whoIsItFor: "Pro pravidelné silničáře. Dva vrchy stoupání — tempo skupinové, na stoupáních se přirozeně rozjedeme, dolů znovu spolu.",
    organizer: { name: "Jan Piecha", role: "Zakladatel Open Miles Clinic" },
    photo: "/media/road-event.jpg",
    isPast: true,
  },
  {
    id: 2,
    slug: "turistika-beskydy-leto",
    title: "Turistika Beskydy",
    sport: "Turistika",
    date: "So 18. července",
    dateISO: "2026-07-18",
    time: "08:30",
    location: "Pustevny, Beskydy",
    locationDetail: "Start: parkoviště Pustevny, Trojanovice",
    distance: "22 km",
    elevation: "950 m",
    difficulty: "Střední",
    capacity: 16,
    filled: 2,
    description: "Letní túra přes hřebeny Beskyd. Radhošť, Pustevny, výhledy až na Tatry. Tempo pohodové, parta dobrá.",
    longDescription: `Letní výšlap přes nejkrásnější část Beskyd — z Pusteven na Radhošť a přes Čertův mlýn zpátky. Trasa kombinuje lesní pěšiny a otevřené hřebeny s výhledem na Slovensko.

Celkem 22 km, 950 m převýšení — fyzicky střední zátěž, technicky nenáročné. Počítejte s 6–7 hodinami včetně zastávek.

Na trase plánujeme oběd v horské boudě a kávovou zastávku na Pustevnách.`,
    whatToBring: [
      "Pohodlná turistická obuv — povinná",
      "Batoh s vodou min. 1,5 l",
      "Svačina a peníze na oběd (cca 200 Kč)",
      "Lehká nepromokavá bunda",
      "Sluneční ochrana a brýle",
      "Trekingové hole — doporučeny",
    ],
    whoIsItFor: "Kdokoliv v dobré fyzické kondici. Zkušenost s horskou turistikou výhodou.",
    organizer: { name: "Jan Piecha", role: "Zakladatel Open Miles Clinic" },
    photo: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=1400&q=85&fit=crop",
  },
  {
    id: 3,
    slug: "malaga-fall-ride-1",
    title: "Malaga fall ride I",
    sport: "Malaga",
    date: "23.–29. října",
    dateISO: "2026-10-23",
    time: "—",
    location: "Málaga, Španělsko",
    locationDetail: "Zázemí 100dola Malaga, Málaga",
    distance: "~80 km / den",
    elevation: "~1 000 m / den",
    difficulty: "Střední",
    capacity: 12,
    filled: 4,
    description: "Týdenní cyklistický pobyt v Malaze. Vlastní kolo, vlastní tempo. Říjen je v Andalusii nejlepší — teplo, prázdné silnice, barvy.",
    longDescription: `Malaga fall ride I je týdenní cyklistický pobyt postavený kolem zázemí 100dola Malaga. Jedeme každý den, tempo si volí každý sám — jsou zde jezdci na různé úrovni a trasy pro každého.

Říjen je v Malaze ideální měsíc — teploty 22–26 °C, prázdné silnice, žádné turistické davy. Kopce nad Malaga nabízí výzvu pro zkušené jezdce, pobřežní silnice jsou perfektní pro pohodovější dny.

V ceně je zázemí, technická podpora a organizace tras. Ubytování si zajišťuje každý sám — pomůžeme s doporučeními.`,
    whatToBring: [
      "Kolo (nebo využij [přepravu 100dola Malaga](/malaga/preprava))",
      "Cyklistické oblečení na teplo (20–26 °C)",
      "Sluneční ochrana",
      "Cestovní pojištění — [zajistíme cestovní i pojištění kola](/pojisteni?zajem=cestovni)",
      "Chuť jezdit",
    ],
    whoIsItFor: "Cyklisté všech úrovní. Ideální pro ty, kdo mají kolo v zázemí 100dola Malaga.",
    organizer: { name: "Jan Piecha", role: "Zakladatel 100dola Malaga" },
    photo: "/media/malaga-hero.jpg",
  },
  {
    id: 4,
    slug: "malaga-fall-ride-2",
    title: "Malaga fall ride II",
    sport: "Malaga",
    date: "30. října – 6. listopadu",
    dateISO: "2026-10-30",
    time: "—",
    location: "Málaga, Španělsko",
    locationDetail: "Zázemí 100dola Malaga, Málaga",
    distance: "~80 km / den",
    elevation: "~1 000 m / den",
    difficulty: "Střední",
    capacity: 12,
    filled: 2,
    description: "Druhý termín podzimního pobytu v Malaze. Stejný formát, jiná parta. Kolo čeká, ty jen přileť.",
    longDescription: `Malaga fall ride II navazuje bezprostředně na první termín — stejné zázemí, stejné trasy, ale nová skupina lidí.

Pokud ti nevyhovuje první termín nebo chceš přijet na oba — kolo zůstane v zázemí 100dola Malaga mezi oběma termíny. Přiletíš znovu s příručákem a jedeš.

Říjen v Andalusii: teploty 20–25 °C, zlaté světlo, silnice bez aut. Nejlepší měsíc na kole v jižní Evropě.`,
    whatToBring: [
      "Kolo (nebo využij [přepravu 100dola Malaga](/malaga/preprava))",
      "Cyklistické oblečení na teplo",
      "Sluneční ochrana",
      "Cestovní pojištění — [zajistíme cestovní i pojištění kola](/pojisteni?zajem=cestovni)",
    ],
    whoIsItFor: "Cyklisté všech úrovní. Vhodné i pro kombinaci s Malaga fall ride I.",
    organizer: { name: "Jan Piecha", role: "Zakladatel 100dola Malaga" },
    photo: "/media/malaga-event.jpg",
  },
  {
    id: 5,
    slug: "skialpy-mala-fatra",
    title: "Skialpy Malá Fatra",
    sport: "Skialpy",
    date: "So 19. prosince",
    dateISO: "2026-12-19",
    time: "07:00",
    location: "Malá Fatra, Slovensko",
    locationDetail: "Start: parkoviště Štefanová, Malá Fatra NP",
    distance: "16 km",
    elevation: "1 050 m",
    difficulty: "Náročná",
    capacity: 10,
    filled: 1,
    description: "Otevření skialpové sezóny v Malé Fatře. První sníh, první výstupy. Rarita — hřebeny bez lidí.",
    longDescription: `Malá Fatra je pro skialpinismus jeden z nejlepších prosincových cílů — v prosinci bývá stabilní sněhová pokrývka na hřebenech a minimum lidí.

Výstup vede přes Štefanovou na Velký Kriváň (1709 m) a zpátky klasickým sjezdovým hřebenem. Celkem 16 km, 1050 m převýšení. Fyzicky a technicky náročné.

Startujeme v 7:00 ráno ze Štefanové. Lavinové vybavení je podmínkou účasti — bez detektoru, lopaty a sondy není možné akce se zúčastnit.`,
    whatToBring: [
      "Skialpové lyže s pásy",
      "Lavinové vybavení: detektor, lopata, sonda — povinné",
      "Přilba",
      "Batoh s jídlem a termoskou",
      "Záložní oblečení",
      "Sluneční brýle nebo maska",
    ],
    whoIsItFor: "Zkušení skialpinisté s lavinovým kurzem. Bez zkušeností nevhodné.",
    organizer: { name: "Jan Piecha", role: "Zakladatel Open Miles Clinic" },
    photo: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=1400&q=85&fit=crop",
  },
  {
    id: 6,
    slug: "isaac-test-sternberk",
    title: "Vyzkoušej ISAAC · Šternberk",
    sport: "Silnice",
    date: "Pá–Po 29. 5. – 1. 6.",
    dateISO: "2026-05-29",
    time: "9:00",
    location: "Obchod 100dola sport, Šternberk",
    locationDetail: "Obchod 100dola sport, vedle kavárny Namístě, náměstí Šternberk. V neděli 31. 5. dojezd Závodu Míru.",
    mapUrl: "https://www.google.com/maps?q=100dola+sport+Partyz%C3%A1nsk%C3%A1+2+%C5%A0ternberk&output=embed&z=16",
    distance: "Showroom",
    elevation: "—",
    difficulty: "Lehká",
    capacity: 180,
    filled: 39,
    isPast: true,
    description: "Testovací jízdy ISAAC kol — Meson, Element, Boson, Vitron a Torus Xplore. Road i gravel modely. Hodinová zápůjčka zdarma. Vyber si kolo a termín v rezervačním systému.",
    longDescription: `Čtyři dny testovacích jízd ISAAC v obchodě 100dola sport, vedle kavárny Namístě na náměstí ve Šternberku. V **neděli 31. 5. dojezd Závodu Míru** přímo na náměstí — a ty si můžeš zkusit nové kolo.

Hodinová zápůjčka zdarma, road i gravel modely.

**Termíny:**
- **Pátek 29. 5.** — 9:00 až 16:00 (7 slotů)
- **Sobota 30. 5.** — 14:00 až 16:00 (2 sloty)
- **Neděle 31. 5.** — 9:00 až 16:00 (7 slotů, kvůli dojezdu Závodu Míru)
- **Pondělí 1. 6.** — 9:00 až 16:00 (7 slotů)

**Co najdeš:**
- 8 kol — Meson, Element, Boson, Vitron (road), Torus Xplore (gravel)
- Skupiny pohonu Ultegra Di2, 105 Di2, GRX 610/820, GRX 827 Di2
- Velikosti M a L

**Před vyzvednutím** podepíšeš krátký protokol o zápůjčce (vyrobíme my, ty jen podepíšeš) a předáš občanský průkaz jako zálohu — vrátíme ti ho ihned po odevzdání kola. Po dobu zápůjčky plně odpovídáš za kolo.

Rezervační systém ti pošle potvrzení s odkazem do Google kalendáře a ráno v den testu připomínku.`,
    whatToBring: [
      "Občanský průkaz (povinný — záloha, vrátíme po odevzdání kola)",
      "Helma (povinná)",
      "Cyklistické oblečení",
      "Vlastní pedály (kola jsou bez nich, nasadíme tvoje)",
      "Cyklistické tretry vázané na tvoje pedály",
    ],
    whoIsItFor: "Pro každého, kdo zvažuje koupi nového road nebo gravel kola — a chce si ho zkusit než utratí 80 000 Kč a víc.",
    organizer: { name: "Jan Piecha", role: "100dola sport" },
    photo: "/media/sport-hero.jpg",
    externalUrl: "/isaac-test",
    externalCtaLabel: "Rezervovat termín",
  },
  {
    id: 50,
    slug: "pustevny-czech-cycling-tour",
    title: "SCOTT test — Pustevny, Czech Cycling Tour",
    sport: "Silnice",
    date: "Ne 16. srpna",
    dateISO: "2026-08-16",
    time: "10:00",
    location: "Náměstí 6/4, Valašské Meziříčí",
    locationDetail: "Sraz od kavárny Tucan, náměstí Valašské Meziříčí (výjezd 10:00)",
    distance: "~72 km",
    elevation: "~1 000 m",
    difficulty: "Střední",
    capacity: 20,
    filled: 0,
    description: "Vyjížďka na Pustevny o víkendu Czech Tour 2026. Sraz od kavárny Tucan na náměstí ve Valašském Meziříčí, po jízdě posezení. Možnost zapůjčení silničních kol SCOTT.",
    longDescription: `Vyjížďka na Pustevny o víkendu Czech Tour 2026. Sraz od kavárny Tucan na náměstí ve Valašském Meziříčí, míříme přes valašské kopce nahoru na Pustevny a stejnou parádní cestou zpět.

Po vyjížďce společné posezení (Včelín Rožnov).

**Zapůjčení kol SCOTT:** Na tuto vyjížďku si můžeš zapůjčit silniční kolo SCOTT — Addict 20, Addict RC 10 nebo Foil RC 10. Booking poběží přes rezervační stránku, kterou spustíme cca týden před akcí.

→ [Stáhnout GPX](/routes/pustevny-climb-valmez.gpx)`,
    whatToBring: [
      "Silniční kolo (nebo si zapůjč SCOTT)",
      "Helma — povinná",
      "Voda na 2× láhev",
      "Drobnou svačinu nebo gel",
      "Větrovku (na Pustevnách umí zafoukat)",
    ],
    whoIsItFor: "Pro silničáře se základní vytrvalostí. Výjezd na Pustevny prověří nohy, ale tempo držíme skupinové — nahoře na sebe počkáme.",
    organizer: { name: "Jan Piecha", role: "Zakladatel Open Miles Clinic" },
    photo: "/media/pustevny-climb-ride.webp",
    routeUrl: "https://mapy.com/s/magujozafe",
    gpxPath: "/routes/pustevny-climb-valmez.gpx",
    scottCta: true,
  },
  {
    id: 52,
    slug: "dlouhe-strane-czech-cycling-tour",
    title: "SCOTT test — Dlouhé stráně, Czech Cycling Tour",
    sport: "Silnice",
    date: "So 15. srpna",
    dateISO: "2026-08-15",
    time: "9:00",
    location: "Obchod 100dola sport, Šternberk",
    locationDetail: "Sraz u prodejny 100dola sport, Šternberk (výjezd 9:00)",
    distance: "—",
    elevation: "—",
    difficulty: "Náročná",
    capacity: 20,
    filled: 0,
    description: "Vyjížďka ze Šternberku na Dlouhé stráně o víkendu Czech Tour 2026. Sraz u prodejny 100dola sport, po jízdě posezení. Možnost zapůjčení silničních kol SCOTT.",
    longDescription: `Vyjížďka ze Šternberku na Dlouhé stráně o víkendu Czech Tour 2026. Sraz u prodejny 100dola sport ve Šternberku, odkud společně vyrážíme na jedno z nejtěžších českých stoupání.

Dlouhé stráně jsou kultovní výjezd — ~12,5 km do kopce, převýšení ~950 m, vrchol u přečerpávací elektrárny v 1 350 m n. m. Ve stejný den sem finišuje horská etapa Czech Tour 2026 (Pardubice → Dlouhé stráně, nejvíc nastoupaných metrů celého závodu), takže nahoře chytneš i závodní atmosféru.

Jede se pospolu, nikoho nenecháme vzadu — tempo i trasu přizpůsobíme partě. Po vyjížďce společné posezení.

**Zapůjčení kol SCOTT:** Na tuto vyjížďku si můžeš zapůjčit silniční kolo SCOTT — Addict 20, Addict RC 10 nebo Foil RC 10. Booking poběží přes rezervační stránku, kterou spustíme cca týden před akcí.

Přesnou trasu vyjížďky doplníme.`,
    whatToBring: [
      "Silniční kolo (nebo si zapůjč SCOTT)",
      "Helma — povinná",
      "Voda na 2× láhev",
      "Drobnou svačinu nebo gel",
      "Větrovku na sjezd z vrcholu",
    ],
    whoIsItFor: "Pro silničáře, kteří si chtějí sáhnout na dno na dlouhém stoupání. Tempo držíme skupinové — nahoře na sebe počkáme.",
    organizer: { name: "Jan Piecha", role: "Zakladatel Open Miles Clinic" },
    photo: "/media/road-event.jpg",
    scottCta: true,
  },
  {
    id: 51,
    slug: "odry-2026",
    title: "Odry",
    sport: "Silnice",
    date: "So 22. srpna",
    dateISO: "2026-08-22",
    time: "09:00",
    location: "Křižná 250, Valašské Meziříčí",
    locationDetail: "Sraz od kavárny Tucan, Valašské Meziříčí (výjezd 09:00)",
    distance: "—",
    elevation: "—",
    difficulty: "Lehká",
    capacity: 20,
    filled: 0,
    description: "Sobotní vyjížďka směr Odry. Podrobnější info doplníme brzy.",
    longDescription: `Podrobnější info doplníme brzy.`,
    whatToBring: [
      "Silniční nebo gravel kolo",
      "Helma — povinná",
      "Voda a drobnou svačinu",
    ],
    whoIsItFor: "Pro jezdce se základní kondicí. Tempo skupinové.",
    organizer: { name: "Jan Piecha", role: "Zakladatel Open Miles Clinic" },
    photo: "/media/road-event.jpg",
  },
];

// Po Events frontend swap (commit 1cee84f) frontend čte z DB přes
// lib/events-db.ts → getPublishedEvents(); helpery getEventBySlug /
// getRelatedEvents přesunuty inline do /community/event/[slug]/page.tsx
// (operují nad runtime fetched seznamem).
// Static `events` array zůstává jako bundle fallback (DB prázdná → static).
