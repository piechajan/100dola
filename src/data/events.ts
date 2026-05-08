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
    id: 0,
    slug: "season-opening",
    title: "Season Opening",
    sport: "Silnice",
    date: "So 19. dubna",
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
    photo: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&q=85&fit=crop",
    mapUrl: "https://en.mapy.cz/turisticka?x=18.0399812&y=49.4375893&z=12",
  },
  {
    id: 1,
    slug: "vyjízdka-od-chochina-kvetna",
    title: "Vyjížďka od Chochina",
    sport: "Silnice",
    date: "So 16. května",
    dateISO: "2026-05-16",
    time: "10:00",
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
    slug: "podzimni-malaga-1",
    title: "Podzimní Malaga I",
    sport: "Malaga",
    date: "16.–22. října",
    dateISO: "2026-10-16",
    time: "—",
    location: "Málaga, Španělsko",
    locationDetail: "Zázemí 100dola Malaga, Málaga",
    distance: "~80 km / den",
    elevation: "~1 000 m / den",
    difficulty: "Střední",
    capacity: 12,
    filled: 4,
    description: "Týdenní cyklistický pobyt v Malaze. Vlastní kolo, vlastní tempo. Říjen je v Andalusii nejlepší — teplo, prázdné silnice, barvy.",
    longDescription: `Podzimní Malaga I je týdenní cyklistický pobyt postavený kolem zázemí 100dola Malaga. Jedeme každý den, tempo si volí každý sám — jsou zde jezdci na různé úrovni a trasy pro každého.

Říjen je v Malaze ideální měsíc — teploty 22–26 °C, prázdné silnice, žádné turistické davy. Kopce nad Malaga nabízí výzvu pro zkušené jezdce, pobřežní silnice jsou perfektní pro pohodovější dny.

V ceně je zázemí, technická podpora a organizace tras. Ubytování si zajišťuje každý sám — pomůžeme s doporučeními.`,
    whatToBring: [
      "Kolo (nebo využij přepravu 100dola Malaga)",
      "Cyklistické oblečení na teplo (20–26 °C)",
      "Sluneční ochrana",
      "Cestovní pojištění",
      "Chuť jezdit",
    ],
    whoIsItFor: "Cyklisté všech úrovní. Ideální pro ty, kdo mají kolo v zázemí 100dola Malaga.",
    organizer: { name: "Jan Piecha", role: "Zakladatel 100dola Malaga" },
    photo: "/media/malaga-hero.jpg",
  },
  {
    id: 4,
    slug: "podzimni-malaga-2",
    title: "Podzimní Malaga II",
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
    filled: 2,
    description: "Druhý termín podzimního pobytu v Malaze. Stejný formát, jiná parta. Kolo čeká, ty jen přileť.",
    longDescription: `Podzimní Malaga II navazuje bezprostředně na první termín — stejné zázemí, stejné trasy, ale nová skupina lidí.

Pokud ti nevyhovuje první termín nebo chceš přijet na oba — kolo zůstane v zázemí 100dola Malaga mezi oběma termíny. Přiletíš znovu s příručákem a jedeš.

Říjen v Andalusii: teploty 20–25 °C, zlaté světlo, silnice bez aut. Nejlepší měsíc na kole v jižní Evropě.`,
    whatToBring: [
      "Kolo (nebo využij přepravu 100dola Malaga)",
      "Cyklistické oblečení na teplo",
      "Sluneční ochrana",
      "Cestovní pojištění",
    ],
    whoIsItFor: "Cyklisté všech úrovní. Vhodné i pro kombinaci s Podzimní Malaga I.",
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
];

export function getEventBySlug(slug: string): Event | undefined {
  return events.find((e) => e.slug === slug);
}

export function getRelatedEvents(event: Event, count = 3): Event[] {
  return events
    .filter((e) => e.slug !== event.slug)
    .sort((a, b) => {
      if (a.sport === event.sport && b.sport !== event.sport) return -1;
      if (b.sport === event.sport && a.sport !== event.sport) return 1;
      return 0;
    })
    .slice(0, count);
}
