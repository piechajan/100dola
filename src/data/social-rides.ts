// Social rides — komunitní vyjížďky (NE prodejna). Route: /social-rides/[slug].
// Rozdíl od /prodejna (store/local SEO): social rides je komunita, běží LIVE
// pro Valmez/Vsetín/Nový Jičín i bez kamenného zázemí. Vyjíždíme od kavárny
// ve Valašském Meziříčí, trasy pokrývají celý region (Valašsko, Vsetínsko,
// Novojičínsko, Beskydy). Obsah je per-město unikátní (Google penalizuje
// duplicity), ale poctivě uvádí, že sraz je ve Valmezu.

export interface SocialRideFaq {
  q: string;
  a: string;
}

export interface SocialRide {
  slug: string;
  published: boolean;
  city: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  intro: string;
  bullets: { title: string; body: string }[];
  faq: SocialRideFaq[];
  keywords: string;
}

/** Sraz je vždy ve Valmezu — ostatní města uvádí vzdálenost a lokální trasy. */
export const SOCIAL_RIDES: SocialRide[] = [
  {
    slug: "valasske-mezirici",
    published: true,
    city: "Valašské Meziříčí",
    metaTitle: "Social rides Valašské Meziříčí — společné vyjížďky | 100dola sport",
    metaDescription:
      "Social rides Valašské Meziříčí — pravidelné společné vyjížďky pro cyklisty z Valašska a okolí. Vyjíždíme od kavárny ve Valmezu, jede se všemi úrovněmi. Přidej se a poznej valašské a beskydské trasy s dobrou partou.",
    h1: "Social rides Valašské Meziříčí",
    intro:
      "Nejsme jen obchod — jezdíme. Social rides Valašské Meziříčí jsou pravidelné společné vyjížďky pro cyklisty z Valašska a okolí. Sraz máme u kavárny ve Valašském Meziříčí, jedeme pohodovým tempem a poznáváme nejkrásnější valašské a beskydské trasy. Ať jsi začátečník nebo najetý závoďák, u nás si najdeš partu i tempo.",
    bullets: [
      {
        title: "Sraz u kavárny ve Valmezu",
        body: "Scházíme se u kavárny ve Valašském Meziříčí — káva, pokec a jede se. Přesné termíny a místo srazu zveřejňujeme před každou jízdou na Instagramu.",
      },
      {
        title: "Pro všechny úrovně",
        body: "Social rides nejsou závod. Jede se pospolu, nikdo nezůstane vzadu. Ideální způsob, jak poznat nové trasy i lidi z regionu.",
      },
      {
        title: "Valašské a beskydské trasy",
        body: "Poznáváme nejhezčí okruhy po Valašsku a Beskydech — od pohodových vyjížděk po kopcovité tréninkové bloky.",
      },
    ],
    faq: [
      {
        q: "Odkud Social rides vyjíždějí?",
        a: "Od kavárny ve Valašském Meziříčí. Přesné místo a čas srazu zveřejňujeme na našich profilech před každou jízdou.",
      },
      {
        q: "Musím být zkušený cyklista?",
        a: "Ne. Jede se pospolu a pohodovým tempem — Social rides jsou pro všechny úrovně.",
      },
      {
        q: "Stojí to něco?",
        a: "Nic. Žádné přihlášky, žádné poplatky — jen dobrá parta a valašské kopce.",
      },
    ],
    keywords:
      "social rides Valašské Meziříčí, cyklo vyjížďky Valmez, cyklistická komunita Valašské Meziříčí, společné vyjížďky Valašsko, 100dola sport",
  },
  {
    slug: "vsetin",
    published: true,
    city: "Vsetín",
    metaTitle: "Social rides Vsetín — společné cyklovyjížďky | 100dola sport",
    metaDescription:
      "Social rides pro cyklisty ze Vsetínska — pravidelné společné vyjížďky. Sraz u kavárny ve Valašském Meziříčí (kousek od Vsetína), jede se všemi úrovněmi po Valašsku a Beskydech. Přidej se k partě.",
    h1: "Social rides pro cyklisty ze Vsetínska",
    intro:
      "Jsi z Vsetína nebo okolí a chceš jezdit s partou? Social rides jsou pravidelné společné vyjížďky 100dola sport. Sraz máme u kavárny ve Valašském Meziříčí — kousek od Vsetína — a odtud vyrážíme na valašské a beskydské trasy. Pohodové tempo, dobrá parta, žádný závod.",
    bullets: [
      {
        title: "Kousek od Vsetína",
        body: "Sraz je u kavárny ve Valašském Meziříčí (~20 km od Vsetína). Termíny a přesné místo zveřejňujeme na Instagramu — přijeď a jed s námi.",
      },
      {
        title: "Pro všechny úrovně",
        body: "Jede se pospolu a pohodovým tempem, nikdo nezůstane vzadu. Ideální, jak poznat nové trasy i cyklisty z regionu.",
      },
      {
        title: "Beskydské a valašské trasy",
        body: "Okruhy zasahují na Vsetínsko, Valašsko i do Beskyd — od klidných vyjížděk po kopcovité tréninky.",
      },
    ],
    faq: [
      {
        q: "Kde je sraz, když jsem ze Vsetína?",
        a: "U kavárny ve Valašském Meziříčí, ~20 km od Vsetína. Přesné místo a čas dáváme na profily před každou jízdou.",
      },
      {
        q: "Musím být trénovaný?",
        a: "Ne. Social rides jsou pro všechny úrovně, jede se pospolu.",
      },
    ],
    keywords:
      "social rides Vsetín, cyklo vyjížďky Vsetín, cyklistická komunita Vsetín, společné vyjížďky Vsetínsko, 100dola sport",
  },
  {
    slug: "novy-jicin",
    published: true,
    city: "Nový Jičín",
    metaTitle: "Social rides Nový Jičín — společné cyklovyjížďky | 100dola sport",
    metaDescription:
      "Social rides pro cyklisty z Novojičínska — pravidelné společné vyjížďky. Sraz u kavárny ve Valašském Meziříčí (kousek od Nového Jičína), jede se všemi úrovněmi po Beskydech a Valašsku. Přidej se.",
    h1: "Social rides pro cyklisty z Novojičínska",
    intro:
      "Jsi z Nového Jičína nebo okolí a chceš jezdit s partou? Social rides jsou pravidelné společné vyjížďky 100dola sport. Sraz máme u kavárny ve Valašském Meziříčí — kousek od Nového Jičína — a odtud vyrážíme na beskydské a valašské trasy. Pohodové tempo, dobrá parta, žádný závod.",
    bullets: [
      {
        title: "Kousek od Nového Jičína",
        body: "Sraz je u kavárny ve Valašském Meziříčí (~25 km od Nového Jičína). Termíny a přesné místo zveřejňujeme na Instagramu — přijeď a jed s námi.",
      },
      {
        title: "Pro všechny úrovně",
        body: "Jede se pospolu a pohodovým tempem, nikdo nezůstane vzadu. Skvělý způsob, jak poznat nové trasy i lidi z regionu.",
      },
      {
        title: "Beskydské trasy",
        body: "Okruhy zasahují na Novojičínsko, do Beskyd i na Valašsko — od klidných vyjížděk po kopcovité tréninky.",
      },
    ],
    faq: [
      {
        q: "Kde je sraz, když jsem z Nového Jičína?",
        a: "U kavárny ve Valašském Meziříčí, ~25 km od Nového Jičína. Přesné místo a čas dáváme na profily před každou jízdou.",
      },
      {
        q: "Musím být trénovaný?",
        a: "Ne. Social rides jsou pro všechny úrovně, jede se pospolu.",
      },
    ],
    keywords:
      "social rides Nový Jičín, cyklo vyjížďky Nový Jičín, cyklistická komunita Nový Jičín, společné vyjížďky Novojičínsko Beskydy, 100dola sport",
  },
];

export function getPublishedSocialRides(): SocialRide[] {
  return SOCIAL_RIDES.filter((r) => r.published);
}

export function getSocialRideBySlug(slug: string): SocialRide | undefined {
  return SOCIAL_RIDES.find((r) => r.slug === slug);
}
