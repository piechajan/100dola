// „Naši lidé" — organizátoři / guideové 100dola. Připraveno (scaffold).
// Až Jan pošle profily + fotky + IG handle → doplnit a vyrenderovat sekci
// (placement: /o-nas nebo /community — potvrdí Jan). Foto: stáhnout a
// optimalizovat do /public/media/team/*.webp (ne hotlink z IG).

export interface TeamMember {
  slug: string;
  name: string;
  role: string;
  bio: string;
  photo?: string; // /media/team/<slug>.webp
  instagram?: string; // handle bez @
  strava?: string; // profil URL nebo id
}

export const TEAM: TeamMember[] = [
  {
    slug: "jan-piecha",
    name: "Jan Piecha",
    role: "Zakladatel 100dola · Málaga & Valašsko",
    bio: "Jan stojí za 100dola sport i za základnou v Málaze. Sportem žije, ale po svém — kolo je spíš záminka pro to ostatní: dobří lidi, kus přírody, poctivé jídlo, espresso cestou a pivo na konci. Není to typ, co drží mikrofon a je středem večírku; je ten, kdo v pozadí zařídí, aby den vyšel a všichni odjížděli spokojení. Nejlepší nápady prý dostává ve třetině dlouhého stoupání, kdy už bolí nohy a hlava se konečně vypne.",
    // photo: "/media/team/jan-piecha.webp",  // ← Jan doplní
    // instagram: "",                          // ← Jan doplní
  },
  // Další organizátoři — Jan pošle profily + fotky + IG handle.
];

// OMC Instagram — 3–4 kurátorské příspěvky (obrázek + odkaz na post).
// Doplní se ručně (jako google-reviews snapshot); auto-sync přes IG Basic
// Display API je overkill (token refresh). Obrázky stáhnout+optimalizovat
// do /public/media/omc-insta/*.webp, ne hotlinkovat z instagramu.
export interface OmcInstaPost {
  image: string; // /media/omc-insta/<n>.webp
  url: string; // odkaz na příspěvek
  caption?: string;
}

export const OMC_INSTAGRAM: OmcInstaPost[] = [
  // Jan pošle 3–4 příspěvky (nebo IG handle skupiny → stáhnu a optimalizuju).
];
