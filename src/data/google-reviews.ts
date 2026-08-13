/**
 * Reálné recenze 100dola sport z Google Business Profile (Šternberk).
 * URL: https://www.google.com/maps/place/100dola+sport
 *
 * Snapshot 2026-08-13 (Playwright scrape). Aktuálně 13 recenzí, vše 5★ (5.0/5).
 * Aktualizace ručně po větším přírůstku nebo když Google změní viditelný subset.
 *
 * Texty jsou autentické (drobná korektura zjevných překlepů; smysl a slova
 * zákazníka zachována). Neměnit význam ani nefabrikovat.
 * Pro víc recenzí otevři Google Maps → recenze a rozšiř pole níže.
 */

export interface GoogleReview {
  author: string;
  /** "Místní průvodce" nebo prázdné. */
  badge?: string;
  /** 1-5. */
  rating: number;
  /** Relativní formulace tak jak Google ukazuje. */
  date: string;
  /** Pro Schema.org — ISO datum (přibližné, pro deduplikaci v Schema.org). */
  isoDate: string;
  body: string;
  /** Počet uživatelových recenzí na Google (signál důvěryhodnosti). */
  userReviewCount?: number;
}

export const GOOGLE_REVIEWS: GoogleReview[] = [
  {
    author: "Ondrej Lakomý",
    rating: 5,
    date: "před 2 měsíci",
    isoDate: "2026-06-05",
    userReviewCount: 5,
    body: "Se 100dola sport mám výborné zkušenosti – Honza mi dodával jak lyže, tak kolo a pokaždé to bylo na jedničku. Oceňuji především osobní přístup a maximální péči o zákazníka, což je dnes vzácnost. Honza si udělá čas, poradí a vybere přesně to, co potřebujete. Rozhodně doporučuji a vracím se rád.",
  },
  {
    author: "Antonín Ondroušek",
    rating: 5,
    date: "před 2 měsíci",
    isoDate: "2026-06-05",
    userReviewCount: 9,
    body: "100dola sport je obchod, který rozumí cyklistům a sportovcům jako málokterý. Poradí vám tak, že vlastně dostanete přesně to, co potřebujete. Honza je člověk s krásným lidským přístupem a pochopením pro potřeby sportovce. Děkuji za rady a vysněné kolo.",
  },
  {
    author: "Barbora Dimovová",
    rating: 5,
    date: "před 2 měsíci",
    isoDate: "2026-06-05",
    body: "Top servis od začátku do konce! Ochotný přístup, všechno mi vysvětlili, poradili a hlavně mi doporučili boty přesně podle toho, co jsem potřebovala. Bylo vidět, že to dělají od srdíčka. Navíc jsem ještě dostala milý dárek navíc, což už dneska člověk moc nezažije. Doporučuju všema deseti a rozhodně se tam ráda vrátím znovu něco pokoupit.",
  },
  {
    author: "Jan Koplík",
    rating: 5,
    date: "před týdnem",
    isoDate: "2026-08-06",
    body: "U Honzi jsem si pořídil své vysněné kolo a jsem moc spokojený. Skvělý osobní přístup a velmi vstřícný, což se dnes už málo vidí. V tomto obchodě je radost nakupovat.",
  },
  {
    author: "Ondrej Doleček",
    rating: 5,
    date: "před 2 měsíci",
    isoDate: "2026-06-05",
    body: "Parádní jednání, jsem velice spokojený s obchodem. Při problému s přehazovačkou mi byla ihned zapůjčena nová stejného typu a já mohl spokojeně jezdit. Reklamace netrvala vůbec dlouho, vše bylo namontované a seřízené na jedničku. Velice doporučuji.",
  },
  {
    author: "Marek Rygel",
    rating: 5,
    date: "před 2 měsíci",
    isoDate: "2026-06-05",
    body: "Spokojenost. Honza dovede skvěle poradit s výběrem. Bral jsem jak bajka, tak silničku, tak hromadu drobností. Vše proběhlo rychle a bez problému.",
  },
  {
    author: "Jakub Sikora",
    rating: 5,
    date: "před 2 měsíci",
    isoDate: "2026-06-05",
    body: "100dola sport mohu jen doporučit, Honza je odborník na svém místě s profesionálním přístupem k zákazníkovi a ochotou se vším poradit.",
  },
  {
    author: "David Zdráhala",
    rating: 5,
    date: "před 2 měsíci",
    isoDate: "2026-06-05",
    body: "Profesionální přístup, vstřícné osobní jednání, profi služby, prostě tam se chcete vracet.",
  },
  {
    author: "David Fajkoš",
    badge: "Místní průvodce",
    rating: 5,
    date: "před 2 měsíci",
    isoDate: "2026-06-05",
    userReviewCount: 4,
    body: "Profesionální přístup s doporučením dle osobních preferencí, skvělá komunikace.",
  },
  {
    author: "Jura Baroš",
    rating: 5,
    date: "před 2 měsíci",
    isoDate: "2026-06-05",
    body: "Vše jak by mělo být. Respektive spíše nadstandard. Od objednání po doručení na pohodu.",
  },
  {
    author: "Tereza Ociskova",
    rating: 5,
    date: "před 2 měsíci",
    isoDate: "2026-06-05",
    body: "Maximální spokojenost. Se vším poradí a vysvětlí. Vřele doporučuji.",
  },
  {
    author: "David Hubeňák",
    rating: 5,
    date: "před 2 měsíci",
    isoDate: "2026-06-05",
    body: "Profesionální a individuální přístup se zaměřením na kvalitu a potřeby zákazníka!",
  },
  {
    author: "Karel Slepica",
    rating: 5,
    date: "před 2 měsíci",
    isoDate: "2026-06-05",
    body: "Profesionální přístup a skvělá atmosféra.",
  },
];

/** Agregát viditelný v Google Maps headline (5,0 ★ z 13 recenzí). */
export const GOOGLE_REVIEW_AGGREGATE = {
  ratingValue: 5.0,
  reviewCount: 13,
  bestRating: 5,
  worstRating: 1,
} as const;

/** Veřejný odkaz na profil — k linku „Více recenzí na Google". */
export const GOOGLE_BUSINESS_PROFILE_URL =
  "https://www.google.com/maps/place/100dola+sport/@49.730278,17.2983371,17z";
