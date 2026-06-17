/**
 * Reálné recenze 100dola sport z Google Business Profile (Šternberk).
 * URL: https://www.google.com/maps/place/100dola+sport
 *
 * Snapshot pořízený 2026-06-17. Aktuálně 12 recenzí, vše 5★ (perfect 5.0/5).
 * Aktualizace ručně po větším přírůstku nebo když Google změní viditelný subset.
 *
 * NEZMĚŇOVAT TEXT recenze — jsou to autentická slova zákazníků.
 * Pokud chceš víc recenzí, otevři Google Maps → recenze a rozšiř pole níže.
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
    date: "před 3 týdny",
    isoDate: "2026-05-27",
    userReviewCount: 5,
    body: "Se 100dola sport mám výborné zkušenosti – Honza mi dodával jak lyže, tak kolo a pokaždé to bylo na jedničku. Oceňuji především osobní přístup a maximální péči o zákazníka, což je dnes vzácnost. Honza si udělá čas, poradí a vybere přesně to, co potřebujete. Rozhodně doporučuji a vracím se rád.",
  },
  {
    author: "David Fajkoš",
    badge: "Místní průvodce",
    rating: 5,
    date: "před 3 týdny",
    isoDate: "2026-05-27",
    userReviewCount: 4,
    body: "Profesionální přístup s doporučením dle osobních preferencí, skvělá komunikace.",
  },
  {
    author: "Antonín Ondroušek",
    rating: 5,
    date: "před 3 týdny",
    isoDate: "2026-05-27",
    userReviewCount: 9,
    body: "100dola sport je obchod který rozumí cyklistům a sportovcům jako málokterý. Poradí vám tak, že vlastně dostanete přesně to, co potřebujete. Honza je člověk s krásným lidským přístupem a pochopením pro potřeby sportovce. Děkuji za rady a vysněné kolo.",
  },
];

/** Agregát viditelný v Google Maps headline (5,0 ★ z 12 recenzí). */
export const GOOGLE_REVIEW_AGGREGATE = {
  ratingValue: 5.0,
  reviewCount: 12,
  bestRating: 5,
  worstRating: 1,
} as const;

/** Veřejný odkaz na profil — k linku „Více recenzí na Google". */
export const GOOGLE_BUSINESS_PROFILE_URL =
  "https://www.google.com/maps/place/100dola+sport/@49.730278,17.2983371,17z";
