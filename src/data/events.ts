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
    slug: "vyjízdka-od-chochina-kvetna",
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
      "Kolo (nebo využij přepravu 100dola Malaga)",
      "Cyklistické oblečení na teplo",
      "Sluneční ochrana",
      "Cestovní pojištění",
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
    date: "Pá–Ne 29.–31. května",
    dateISO: "2026-05-29",
    time: "9:00",
    location: "Obchod 100dola sport, Šternberk",
    locationDetail: "Obchod 100dola sport, vedle kavárny Namístě, náměstí Šternberk. V neděli 31. 5. dojezd Závodu Míru.",
    mapUrl: "https://www.google.com/maps?q=100dola+sport+Partyz%C3%A1nsk%C3%A1+2+%C5%A0ternberk&output=embed&z=16",
    distance: "Showroom",
    elevation: "—",
    difficulty: "Lehká",
    capacity: 180,
    filled: 0,
    description: "Testovací jízdy ISAAC kol — Meson, Element, Boson, Vitron, Kaon a Torus Xplore. Road i gravel modely. Hodinová zápůjčka zdarma. Vyber si kolo a termín v rezervačním systému.",
    longDescription: `Tři dny testovacích jízd ISAAC v obchodě 100dola sport, vedle kavárny Namístě na náměstí ve Šternberku. V **neděli 31. 5. dojezd Závodu Míru** přímo na náměstí — a ty si můžeš zkusit nové kolo.

Hodinová zápůjčka zdarma, road i gravel modely.

**Termíny:**
- **Pátek 29. 5.** — 9:00 až 16:00 (7 slotů)
- **Sobota 30. 5.** — 14:00 až 16:00 (2 sloty)
- **Neděle 31. 5.** — 9:00 až 16:00 (7 slotů, kvůli dojezdu Závodu Míru)

**Co najdeš:**
- 10 kol — Meson, Element, Boson, Vitron (road), Kaon, Torus Xplore (gravel)
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
