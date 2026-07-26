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
  /** Unikátní SEO odstavce per město — cyklistika + region + brand (bez keyword stuffingu). */
  story: string[];
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
      "Nejsme jen obchod — jezdíme. Social rides Valašské Meziříčí jsou pravidelné společné vyjížďky, které pořádáme v rámci naší komunity Open Miles Clinic. Sraz máme u kavárny ve Valašském Meziříčí, jede se svižně, ale pospolu, a poznáváme nejkrásnější valašské a beskydské trasy. Ať jsi začátečník nebo najetý závoďák, u nás si najdeš partu i tempo.",
    bullets: [
      {
        title: "Sraz u kavárny ve Valmezu",
        body: "Scházíme se u kavárny ve Valašském Meziříčí — káva, pokec a jede se. Přesné termíny a místo srazu zveřejňujeme před každou jízdou na Instagramu.",
      },
      {
        title: "Pro všechny úrovně",
        body: "Social rides nejsou závod, ale ani nedělní projížďka. Jede se svižně a pospolu — tempo si každý najde a nikoho nenecháme vzadu. Ideální způsob, jak poznat nové trasy i lidi z regionu.",
      },
      {
        title: "Jezdí se z celého okolí",
        body: "Na vyjížďky dojíždí lidé z celého Valašska i širšího okolí — od Vsetína přes Nový Jičín až po Olomouc. Přidej se, ať jsi odkudkoli.",
      },
    ],
    story: [
      "Cyklistika ve Valašském Meziříčí a okolí má svoji partu — a my jsme její součástí. Social rides pořádáme v rámci komunity Open Miles Clinic pod značkou 100dola sport: pravidelné silniční, gravel i MTB vyjížďky, kde nejde o výkon, ale o dobrou jízdu a lidi kolem. Valašské a beskydské kopce jsou ideální terén, ať zrovna sbíráš formu, nebo si chceš jen v klidu zajezdit.",
      "Za 100dola sport stojí kamenná prodejna ve Šternberku a e-shop — a cyklistiku sami žijeme a jezdíme. Stejnou péči dáváme do výběru kol a vybavení, které prodáváme: silniční, gravel a horská kola SCOTT, ISAAC, Lapierre, Ridley a Pinarello, cyklistické oblečení Q36.5, helmy, tretry, radary a osvětlení. Přijeď se s námi projet, poznej styl a přístup, jaký k cyklistice máme — a když budeš řešit nové kolo, budeš vědět, komu věřit.",
    ],
    faq: [
      {
        q: "Odkud Social rides vyjíždějí?",
        a: "Od kavárny ve Valašském Meziříčí. Přesné místo a čas srazu zveřejňujeme na našich profilech před každou jízdou.",
      },
      {
        q: "Musím být zkušený cyklista?",
        a: "Ne. Jede se svižně, ale pospolu — tempo přizpůsobíme partě a nikoho nenecháme vzadu. Social rides jsou pro všechny úrovně.",
      },
      {
        q: "Stojí to něco?",
        a: "Nic. Žádné přihlášky, žádné poplatky — jen dobrá parta a valašské kopce.",
      },
    ],
    keywords:
      "social rides Valašské Meziříčí, cyklistika Valašské Meziříčí, cyklo vyjížďky Valmez, silniční kola Valašské Meziříčí, gravel Valašsko, cyklistický obchod Valašské Meziříčí, kola SCOTT ISAAC Lapierre Ridley Pinarello, cyklistická komunita Valašsko, 100dola sport",
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
      "Jsi z Vsetína nebo okolí a chceš jezdit s partou? Social rides jsou pravidelné společné vyjížďky, které pořádáme v rámci komunity Open Miles Clinic. Sraz máme u kavárny ve Valašském Meziříčí — kousek od Vsetína — a odtud vyrážíme na valašské a beskydské trasy. Nejsou to jen místní: na vyjížďky dojíždí lidé ze širšího okolí, běžně i z Nového Jičína nebo Olomouce. Jede se svižně, ale pospolu — není to závod a nikoho nenecháme vzadu.",
    bullets: [
      {
        title: "Kousek od Vsetína",
        body: "Sraz je u kavárny ve Valašském Meziříčí (~20 km od Vsetína). Termíny a přesné místo zveřejňujeme na Instagramu — přijeď a jed s námi.",
      },
      {
        title: "Dojíždí se z širšího okolí",
        body: "Na vyjížďky jezdí nejen Vsetíňáci — pravidelně dorazí lidé z Nového Jičína, Valašska i z Olomouce. Za dobrou partou stojí za to popojet.",
      },
      {
        title: "Beskydské a valašské trasy",
        body: "Okruhy zasahují na Vsetínsko, Valašsko i do Beskyd — od klidných vyjížděk po kopcovité tréninky.",
      },
    ],
    story: [
      "Hledáš cyklistickou partu na Vsetínsku? Social rides jsou pravidelné silniční, gravel i MTB vyjížďky, které pořádáme v rámci komunity Open Miles Clinic pod značkou 100dola sport. Vsetínské a beskydské kopce patří k nejhezčím terénům v republice — a jezdí se pospolu: svižně, ale nikoho nenecháme vzadu. Kromě místních dojíždí lidé z Nového Jičína, Valašska i z Olomouce, takže o partu nouze není.",
      "Za 100dola sport stojí kamenná prodejna ve Šternberku a e-shop — a cyklistiku sami žijeme a jezdíme. Prodáváme silniční, gravel a horská kola SCOTT, ISAAC, Lapierre, Ridley a Pinarello, cyklistické oblečení Q36.5, helmy, tretry, radary a osvětlení. Kamennou prodejnu na Vsetíně zatím nemáme, ale kolo i vybavení k tobě po domluvě dovezeme nebo předáme osobně. Nejdřív se přijeď projet a poznej, jaký přístup k cyklistice máme — o kole se pobavíme, až budeš chtít.",
    ],
    faq: [
      {
        q: "Kde je sraz, když jsem ze Vsetína?",
        a: "U kavárny ve Valašském Meziříčí, ~20 km od Vsetína. Přesné místo a čas dáváme na profily před každou jízdou.",
      },
      {
        q: "Odkud lidé na vyjížďky jezdí?",
        a: "Z celého regionu — kromě Vsetínska běžně dojíždí cyklisté z Nového Jičína, Valašska i z Olomouce. Za dobrou partou se popojet vyplatí.",
      },
      {
        q: "Musím být trénovaný?",
        a: "Ne. Social rides jsou pro všechny úrovně — jede se svižně, ale pospolu a nikoho nenecháme vzadu.",
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
      "Jsi z Nového Jičína nebo okolí a chceš jezdit s partou? Social rides jsou pravidelné společné vyjížďky, které pořádáme v rámci komunity Open Miles Clinic. Sraz máme u kavárny ve Valašském Meziříčí — kousek od Nového Jičína — a odtud vyrážíme na beskydské a valašské trasy. Nejezdí jen místní: na vyjížďky dorazí lidé ze širšího okolí, běžně i ze Vsetína nebo Olomouce. Jede se svižně, ale pospolu — není to závod a nikoho nenecháme vzadu.",
    bullets: [
      {
        title: "Kousek od Nového Jičína",
        body: "Sraz je u kavárny ve Valašském Meziříčí (~25 km od Nového Jičína). Termíny a přesné místo zveřejňujeme na Instagramu — přijeď a jed s námi.",
      },
      {
        title: "Dojíždí se z širšího okolí",
        body: "Na vyjížďky jezdí nejen Novojičíňáci — pravidelně dorazí lidé ze Vsetína, Valašska i z Olomouce. Za dobrou partou stojí za to popojet.",
      },
      {
        title: "Beskydské trasy",
        body: "Okruhy zasahují na Novojičínsko, do Beskyd i na Valašsko — od klidných vyjížděk po kopcovité tréninky.",
      },
    ],
    story: [
      "Cyklistika na Novojičínsku má díky blízkým Beskydům skvělé podmínky — a partu k tomu nabízí Social rides. Pořádáme je v rámci komunity Open Miles Clinic pod značkou 100dola sport: pravidelné silniční, gravel i MTB vyjížďky, kde se jede svižně, ale pospolu. Sraz je kousek od Nového Jičína ve Valašském Meziříčí a kromě místních dorazí lidé ze Vsetína, Valašska i z Olomouce.",
      "Za 100dola sport stojí kamenná prodejna ve Šternberku a e-shop — a cyklistiku sami žijeme a jezdíme. Prodáváme silniční, gravel a horská kola SCOTT, ISAAC, Lapierre, Ridley a Pinarello, cyklistické oblečení Q36.5, helmy, tretry, radary a osvětlení. Kamennou prodejnu na Novojičínsku zatím nemáme, ale kolo i vybavení k tobě po domluvě dovezeme nebo předáme osobně. Přijeď se s námi nejdřív projet — poznáš přístup, jaký k cyklistice máme, a o kole se pobavíme, až budeš chtít.",
    ],
    faq: [
      {
        q: "Kde je sraz, když jsem z Nového Jičína?",
        a: "U kavárny ve Valašském Meziříčí, ~25 km od Nového Jičína. Přesné místo a čas dáváme na profily před každou jízdou.",
      },
      {
        q: "Odkud lidé na vyjížďky jezdí?",
        a: "Z celého regionu — kromě Novojičínska běžně dojíždí cyklisté ze Vsetína, Valašska i z Olomouce. Za dobrou partou se popojet vyplatí.",
      },
      {
        q: "Musím být trénovaný?",
        a: "Ne. Social rides jsou pro všechny úrovně — jede se svižně, ale pospolu a nikoho nenecháme vzadu.",
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
