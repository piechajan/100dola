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
    id: 1,
    slug: "blanik-gravel-2025",
    title: "Blaník Gravel",
    sport: "Gravel",
    date: "So 26. dubna 2025",
    dateISO: "2025-04-26",
    time: "07:30",
    location: "Mladá Vožice",
    locationDetail: "Start: parkoviště u nádraží Mladá Vožice",
    distance: "120 km",
    elevation: "1 800 m",
    difficulty: "Střední",
    capacity: 24,
    filled: 18,
    description: "Klasická jarní gravel jízda přes Blaník. Otevírá sezónu pořádnou dávkou štěrku a výhledů.",
    longDescription: `Blaník Gravel je naše tradiční jarní otevírací akce. Jedeme přes Blaník, Vlašimsko a zpět přes lesní cesty a polní štěrkové silnice. Trasa kombinuje asfalt a gravel v poměru 40/60.

Tempo je skupinové — jedeme jako jeden peloton, přizpůsobujeme se pomalejším. Na trase jsou dvě plánované zastávky: u pekárny v Bystřici (km 45) a u přírodní restaurace u Blaníku (km 85).

Akce je vhodná pro zkušenější jezdce na gravelovém nebo silničním kole s vhodnou geometrií na delší jízdu.`,
    whatToBring: [
      "Gravel nebo silniční kolo (minimálně 32mm plášť doporučen)",
      "Cyklistická helma — povinná",
      "Jídlo a pití na cca 4–5 hodin",
      "Záplaty, rezervní duše, minihuška",
      "Dle počasí — větrovka nebo pláštěnka",
      "Nabitý telefon a power bank",
    ],
    whoIsItFor: "Jezdci se zkušeností 80+ km jednorázově. Gravel nebo silniční kolo s výbavou.",
    organizer: { name: "Jan Piecháček", role: "Zakladatel Open Miles Clinic" },
    photo: "https://images.unsplash.com/photo-1544191696-15693a5c5a38?w=1400&q=85&fit=crop",
    photoGallery: [
      "https://images.unsplash.com/photo-1502904550040-7534597429ae?w=700&q=80&fit=crop",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=80&fit=crop",
      "https://images.unsplash.com/photo-1501147830916-ce44a6359892?w=700&q=80&fit=crop",
    ],
  },
  {
    id: 2,
    slug: "omc-wednesday-social",
    title: "OMC Wednesday Social",
    sport: "Silnice",
    date: "St 30. dubna 2025",
    dateISO: "2025-04-30",
    time: "18:00",
    location: "Praha — start Prokopák",
    locationDetail: "Start: parkoviště Prokopské údolí, Praha 5",
    distance: "45 km",
    elevation: "420 m",
    difficulty: "Lehká",
    capacity: 20,
    filled: 11,
    description: "Pravidelná středeční večerní vyjížďka. Tempo klidné, nálada dobrá. Vhodné pro každého.",
    longDescription: `Wednesday Social je naše nejčastější akce — pravidelná středeční vyjížďka, která se koná každé dva týdny od dubna do října.

Jedeme po prověřené trase přes Prokopák, Řeporyje a zpátky přes Motol. Tempo je konverzační — dojedeš a přitom si popovídáš. Po jízdě je typicky spontánní afterride v místním pivovaru nebo kavárně.

Tato akce je ideální pro nové lidi v komunitě — bezpečný start, žádný závazek, příjemná parta.`,
    whatToBring: [
      "Silniční nebo gravel kolo",
      "Helma — povinná",
      "Voda a svačina",
      "Světla (jezdíme do setmění)",
      "Dobrá nálada",
    ],
    whoIsItFor: "Kdokoliv na kole. Začátečníci i zkušení. Tempo přizpůsobíme.",
    organizer: { name: "Jan Piecháček", role: "Zakladatel Open Miles Clinic" },
    photo: "/media/road-event.jpg",
    photoGallery: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=80&fit=crop",
      "https://images.unsplash.com/photo-1501147830916-ce44a6359892?w=700&q=80&fit=crop",
    ],
  },
  {
    id: 3,
    slug: "malaga-spring-ride",
    title: "Malaga Spring Ride",
    sport: "Malaga",
    date: "Po 12. května 2025",
    dateISO: "2025-05-12",
    time: "08:00",
    location: "Málaga, Španělsko",
    locationDetail: "Start: zázemí 100dola Malaga, Calle Larios",
    distance: "85 km",
    elevation: "1 200 m",
    difficulty: "Střední",
    capacity: 16,
    filled: 9,
    description: "Skupinová vyjížďka v Andalusii. Slunce, výhledy na moře a silnice bez aut.",
    longDescription: `Malaga Spring Ride je skupinová jízda organizovaná přímo v rámci zázemí 100dola Malaga. Jedeme z centra Malagy do hor přes Caminito del Rey a zpátky pobřežní silnicí s výhledy na Středozemní moře.

Trasa je nádherná — stoupáme do 700 m n.m., pak klesáme k moři a finišujeme espresso na terase. Teploty v květnu okolo 22–26 °C.

Akce je primárně určena pro lidi, kteří mají kolo v zázemí 100dola Malaga, nebo si kolo přivezou vlastní cestou.`,
    whatToBring: [
      "Kolo (nebo využij zázemí 100dola Malaga)",
      "Lehké cyklistické oblečení — v Malaze je teplo",
      "Sluneční ochrana",
      "Plná láhev — na trase jsou omezené zdroje vody",
      "Pas nebo ID",
    ],
    whoIsItFor: "Pro zákazníky služby 100dola Malaga a kohokoliv, kdo přicestuje s kolem.",
    organizer: { name: "Jan Piecháček", role: "Zakladatel Open Miles Clinic" },
    photo: "/media/malaga-event.jpg",
  },
  {
    id: 4,
    slug: "krkonose-skialpy",
    title: "Krkonoše — skialpový den",
    sport: "Skialpy",
    date: "So 17. května 2025",
    dateISO: "2025-05-17",
    time: "06:00",
    location: "Špindlerův Mlýn",
    locationDetail: "Start: parkoviště Sv. Petr, Špindlerův Mlýn",
    distance: "18 km",
    elevation: "1 100 m",
    difficulty: "Náročná",
    capacity: 12,
    filled: 7,
    description: "Pozdní jarní skialpinismus. Ideální podmínky, firn a prázdné hřebeny.",
    longDescription: `Pozdní jarní skialpinismus v Krkonoších je jeden z nejvíc odměňujících zážitků — firn, slunce, prázdné hřebeny a výhledy na celé Čechy.

Výstup vede přes Svatopeterský hřeben na Kozí hřbet a zpátky přes Zlaté návrší. Celková délka 18 km, převýšení 1 100 m. Technicky středně náročné, fyzicky náročné.

Startujeme v 6:00 ráno, abychom využili ranní firn. Doporučená výbava včetně lavinového vybavení je povinná.`,
    whatToBring: [
      "Skialpové lyže s pásy",
      "Lavinové vybavení: lopata, sonda, detektor — povinné",
      "Přilba",
      "Zásoby jídla a pití na celý den",
      "Slunce: brýle + opalovací krém faktor 50",
      "Náhradní oblečení do batohu",
    ],
    whoIsItFor: "Pro zkušené skialpinisty s lavinovým vybavením. Bez zkušeností není vhodné.",
    organizer: { name: "Jan Piecháček", role: "Zakladatel Open Miles Clinic" },
    photo: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=1400&q=85&fit=crop",
  },
  {
    id: 5,
    slug: "mtb-krivoklatsko",
    title: "MTB Křivoklátsko",
    sport: "MTB",
    date: "Ne 25. května 2025",
    dateISO: "2025-05-25",
    time: "09:00",
    location: "Křivoklát",
    locationDetail: "Start: parkoviště u hradu Křivoklát",
    distance: "55 km",
    elevation: "900 m",
    difficulty: "Střední",
    capacity: 18,
    filled: 4,
    description: "Technický MTB výjezd přes Křivoklátsko. Lesy, singletracky a dobré kafé na konci.",
    longDescription: `Křivoklátsko je jeden z nejkrásnějších MTB regionů v Čechách. Jedeme přes CHKO Křivoklátsko — lesy, singletracky, kamenné výjezdy a dávky ve stylu enduro.

Trasa je technicky pestrá — kombinace lesních cest a singletrackových úseků. Doporučujeme full suspension nebo hardtail s dobrým odpružením.

Po jízdě máme rezervovaný stůl v hospodě přímo v Křivoklátě.`,
    whatToBring: [
      "MTB kolo — full suspension nebo hardtail",
      "Helma — povinná, chrániče vhodné",
      "Hydration pack nebo lahve min. 2l",
      "Svačina + energetické tyčinky",
      "Základní nářadí a záplaty",
    ],
    whoIsItFor: "MTB jezdci se zkušeností s technickým terénem. Pro začátečníky nevhodné.",
    organizer: { name: "Jan Piecháček", role: "Zakladatel Open Miles Clinic" },
    photo: "https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?w=1400&q=85&fit=crop",
  },
  {
    id: 6,
    slug: "omc-saturday-long",
    title: "OMC Saturday Long Ride",
    sport: "Silnice",
    date: "So 7. června 2025",
    dateISO: "2025-06-07",
    time: "07:00",
    location: "Praha — Sázava — Praha",
    locationDetail: "Start: parkoviště Smíchov nábřeží, Praha 5",
    distance: "140 km",
    elevation: "1 600 m",
    difficulty: "Náročná",
    capacity: 20,
    filled: 12,
    description: "Dlouhá sobotní jízda přes Posázaví. Pro ty, co chtějí pořádné kilometry.",
    longDescription: `Saturday Long Ride je naše největší pravidelná akce. Jedeme přes Posázaví — jedna z nejkrásnějších cykloregionů u Prahy. Trasa kombinuje říční údolí, stoupání do kopců a rychlé sjezdy.

140 km, 1 600 m převýšení — fyzicky náročná akce, ale odměna stojí za to. Na trase jsou tři plánované zastávky včetně oběda v restauraci u Sázavy.

Akce je pro zkušené jezdce, kteří pravidelně jedou 100+ km.`,
    whatToBring: [
      "Silniční nebo gravel kolo v dobrém technickém stavu",
      "Dres, kraťasy, návleky (ráno může být chladno)",
      "Jídlo + doplňování na zastávkách",
      "Peníze na oběd (cca 200–300 Kč)",
      "Záplaty, minihuška, multitool",
    ],
    whoIsItFor: "Zkušení silniční jezdci. Min. 100 km na kole za posledních 30 dní.",
    organizer: { name: "Jan Piecháček", role: "Zakladatel Open Miles Clinic" },
    photo: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&q=85&fit=crop",
  },
];

export function getEventBySlug(slug: string): Event | undefined {
  return events.find((e) => e.slug === slug);
}

export function getRelatedEvents(event: Event, count = 3): Event[] {
  return events
    .filter((e) => e.slug !== event.slug)
    .sort((a, b) => {
      // same sport first
      if (a.sport === event.sport && b.sport !== event.sport) return -1;
      if (b.sport === event.sport && a.sport !== event.sport) return 1;
      return 0;
    })
    .slice(0, count);
}
