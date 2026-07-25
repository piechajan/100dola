// Lokální landing stránky pro Local SEO (organika + areaServed).
// URL: /prodejna/[slug]. Publikované = v generateStaticParams + sitemapě;
// nepublikované = nachystané, 404 dokud published:false → true.
//
// Strategie (Jan 2026-07): cílíme na SPORTOVNÍ VYBAVENÍ + OBLEČENÍ (bonitnější
// klientela). Hlavní sortiment = KOLA + vybavení na kolo (helmy, tretry,
// oblečení, radar, osvětlení) + sportovní VÝŽIVA (iontáky, gely, tyčinky) +
// BĚH (boty + oblečení). Šternberk = kamenná prodejna, Olomouc = výdej +
// doručení (LIVE). Valmez + Vsetín = nachystané, spustíme koncem roku po
// potvrzení prostor (published:false). Valmez využívá i community úhel
// „Social rides Valašské Meziříčí".

export interface LocationHighlight {
  title: string;
  body: string;
}

export interface LocationFaq {
  q: string;
  a: string;
}

export interface Location {
  slug: string;
  /** LIVE (v sitemapě + generateStaticParams) když true. */
  published: boolean;
  city: string;
  /** „ve Šternberku" / „v Olomouci" — pro copy. */
  cityLocative: string;
  /** store = kamenná prodejna · pickup = výdej + doručení · community = social
   *  rides komunita (bez prodejny) · coming = zázemí připravujeme. */
  type: "store" | "pickup" | "community" | "coming";
  metaTitle: string;
  metaDescription: string;
  h1: string;
  /** Unikátní úvodní odstavec (ne duplikát mezi městy). */
  intro: string;
  /** Vzdálenost od prodejny Šternberk (km, orientačně) — pro honest copy. */
  distanceKm?: number;
  highlights: LocationHighlight[];
  /** Jak to funguje v tomto městě (výdej / prodejna / doprava). */
  logistics: string;
  /** Volitelný community/lokální úhel (Valmez = social rides). */
  localAngle?: { title: string; body: string };
  faq: LocationFaq[];
  /** SEO keywords do meta. */
  keywords: string;
}

/** Sortiment sdílený napříč městy (formulace se v každém městě liší, obsah sedí). */
const CYCLING_GEAR =
  "helmy, tretry, cyklistické oblečení Q36.5, zadní radar, osvětlení a doplňky";
const NUTRITION = "sportovní výživa — iontové nápoje, gely a tyčinky";
const RUNNING = "běžecké boty a oblečení + kompresní CEP";

export const LOCATIONS: Location[] = [
  // ───────────────────────── ŠTERNBERK (kamenná prodejna, LIVE) ─────────────
  {
    slug: "sternberk",
    published: true,
    city: "Šternberk",
    cityLocative: "ve Šternberku",
    type: "store",
    metaTitle: "Kola, cyklo vybavení a sport Šternberk — 100dola sport",
    metaDescription:
      "Kamenná prodejna 100dola sport ve Šternberku (Partyzánská 2): kola SCOTT / ISAAC / Lapierre, helmy, tretry, cyklo oblečení Q36.5, radar, osvětlení, sportovní výživa (gely, iontáky) a běžecké boty. Servis kol, bikefit, testovací jízdy. Přijď se poradit osobně.",
    h1: "Kola, cyklistické vybavení a sport ve Šternberku",
    intro:
      "Naše kamenná prodejna ve Šternberku na Partyzánské 2 je základna 100dola sport. Nejsme velkosklad — vybíráme věci, které sami jezdíme: silniční, gravel a horská kola SCOTT, ISAAC a Lapierre, vybavení na kolo (helmy, tretry, cyklo oblečení Q36.5, radar, osvětlení), sportovní výživu a běžecké boty. Přijď si nechat poradit osobně, vyzkoušet posed a odjet s věcí, která ti reálně sedne.",
    highlights: [
      {
        title: "Kola SCOTT · ISAAC · Lapierre",
        body: "Silniční, gravel, horská a elektrokola. Poradíme s výběrem podle typu jízdy i rozpočtu, k dispozici testovací jízdy ISAAC a bikefit pro přesné dotažení posedu.",
      },
      {
        title: "Kompletní vybavení na kolo",
        body: `Vše, co k jízdě patří: ${CYCLING_GEAR}. Prémiová kvalita, kterou poznáš na první jízdě — ne nejlevnější, ale nejlepší poměr komfort a výkon.`,
      },
      {
        title: "Sportovní výživa",
        body: `${NUTRITION}. Doplnění energie na trénink i závod — poradíme, co a kdy.`,
      },
      {
        title: "Běh a servis na místě",
        body: `${RUNNING}. A ke kolům kompletní servis, voskování řetězů, keramická ložiska a bikefit přímo na prodejně — osobní přístup, ne servisní páska.`,
      },
    ],
    logistics:
      "Na prodejně na Partyzánské 2 si můžeš vše osobně vyzkoušet, nechat poradit a rovnou odvézt. Co nemáme skladem, dovezeme obvykle do pár dní. Otevřeno je podle otevírací doby níže a kdykoli po předchozí domluvě — zavolej a domluvíme se.",
    faq: [
      {
        q: "Kde přesně prodejnu najdu?",
        a: "Partyzánská 2, Šternberk (785 01). Přesná mapa a otevírací doba jsou na stránce Kontakt.",
      },
      {
        q: "Můžu si kolo nebo vybavení vyzkoušet před koupí?",
        a: "Ano — to je smysl kamenné prodejny. Kolo si osaháš, helmu i tretry vyzkoušíš, u kol nabízíme i testovací jízdy ISAAC a bikefit.",
      },
      {
        q: "Děláte servis kol i pro kola koupená jinde?",
        a: "Ano, servis, voskování řetězu i bikefit děláme bez ohledu na to, kde jsi kolo koupil.",
      },
    ],
    keywords:
      "kola Šternberk, cyklistické vybavení Šternberk, cyklo oblečení Šternberk, servis kol Šternberk, helmy tretry Šternberk, sportovní výživa, běžecké boty Šternberk, bikefit, SCOTT ISAAC Lapierre, Q36.5, CEP",
  },

  // ───────────────────────── OLOMOUC (výdej + doručení, LIVE) ────────────────
  {
    slug: "olomouc",
    published: true,
    city: "Olomouc",
    cityLocative: "v Olomouci",
    type: "pickup",
    distanceKm: 17,
    metaTitle: "Kola, cyklo vybavení a sport Olomouc — 100dola sport",
    metaDescription:
      "100dola sport pro Olomouc: kola SCOTT / ISAAC / Lapierre, helmy, tretry, cyklo oblečení Q36.5, radar, osvětlení, sportovní výživa a běžecké boty. Osobní předání zdarma, servis a bikefit kousek ve Šternberku (17 km). Objednej online, vyzvedni v Olomouci.",
    h1: "Kola, cyklistické vybavení a sport pro Olomouc",
    intro:
      "Jsi z Olomouce a hledáš kvalitní kolo, vybavení a sportovní výživu? 100dola sport máme kousek — kamennou prodejnu ve Šternberku (17 km) a pro Olomouc nabízíme osobní předání a doručení. Objednáš online z e-shopu, my ti věci připravíme a předáme, nebo přijedeš na prodejnu na osobní konzultaci, bikefit a testovací jízdu.",
    highlights: [
      {
        title: "Kola a e-shop s osobním předáním",
        body: "Kola SCOTT, ISAAC a Lapierre + kompletní sortiment z e-shopu (přes 770 produktů). Osobní předání v Olomouci po domluvě zdarma, nebo doručení na adresu.",
      },
      {
        title: "Vybavení na kolo a výživa",
        body: `${CYCLING_GEAR}, k tomu ${NUTRITION}. Prémiová kvalita pro jezdce z Olomouce a okolí, kterou v běžných řetězcích nekoupíš.`,
      },
      {
        title: "Běh, servis a bikefit",
        body: `${RUNNING}. Servis kol, voskování řetězů, bikefit a testovací jízdy ISAAC na prodejně ve Šternberku — 15 minut z Olomouce.`,
      },
    ],
    logistics:
      "Objednej z e-shopu a vyber osobní vyzvednutí — připravíme a domluvíme předání v Olomouci, nebo doručíme na adresu. Doprava zdarma nad 2 500 Kč. Na servis, bikefit a testovací jízdy přijeď na prodejnu do Šternberku (17 km, ~15 min).",
    faq: [
      {
        q: "Máte v Olomouci kamennou prodejnu?",
        a: "Kamennou prodejnu máme ve Šternberku (17 km). Pro Olomouc nabízíme osobní předání a doručení objednávek z e-shopu.",
      },
      {
        q: "Jak funguje osobní předání v Olomouci?",
        a: "Objednáš online, vybereš osobní vyzvednutí, my se ozveme a domluvíme místo a čas předání v Olomouci. Předání je zdarma.",
      },
      {
        q: "Kde si nechám udělat bikefit nebo servis?",
        a: "Na prodejně ve Šternberku, kousek od Olomouce. Stačí zavolat a domluvit termín.",
      },
    ],
    keywords:
      "kola Olomouc, cyklistické vybavení Olomouc, cyklo oblečení Olomouc, servis kol Olomouc, helmy tretry Olomouc, sportovní výživa Olomouc, běžecké boty, bikefit, SCOTT ISAAC, Q36.5",
  },

  // ───────────────────── VALAŠSKÉ MEZIŘÍČÍ (nachystané, NELIVE) ──────────────
  {
    slug: "valasske-mezirici",
    published: true,
    city: "Valašské Meziříčí",
    cityLocative: "ve Valašském Meziříčí",
    type: "community",
    distanceKm: 55,
    metaTitle: "Social rides Valašské Meziříčí — společné vyjížďky | 100dola sport",
    metaDescription:
      "Social rides Valašské Meziříčí — pravidelné společné vyjížďky pro cyklisty z Valašska, Vsetínska a Novojičínska. Vyjíždíme od kavárny ve Valmezu, jede se všemi úrovněmi. Přidej se a poznej valašské a beskydské trasy s dobrou partou.",
    h1: "Social rides Valašské Meziříčí",
    intro:
      "Nejsme jen obchod — jezdíme. Social rides Valašské Meziříčí jsou pravidelné společné vyjížďky pro cyklisty z Valašska, Vsetínska, Novojičínska a okolí. Vyjíždíme od kavárny ve Valašském Meziříčí, jedeme pohodovým tempem a poznáváme nejkrásnější valašské a beskydské trasy. Ať jsi začátečník nebo najetý závoďák, u nás si najdeš partu i tempo.",
    highlights: [
      {
        title: "Pravidelné společné vyjížďky",
        body: "Vyjíždíme od kavárny ve Valašském Meziříčí — sraz, káva a jede se. Trasy po Valašsku a Beskydech, různá tempa, dobrá parta. Termíny a místo srazu najdeš na našich profilech.",
      },
      {
        title: "Pro všechny úrovně",
        body: "Social rides nejsou závod. Jede se pospolu, nikdo nezůstane vzadu. Ideální způsob, jak poznat nové trasy i lidi z regionu — Valmez, Vsetín, Nový Jičín a okolí.",
      },
      {
        title: "Vybavení a servis s sebou",
        body: `Jsme 100dola sport — kola SCOTT / ISAAC / Lapierre, ${CYCLING_GEAR}, ${NUTRITION} i servis. Co potřebuješ, dovezeme přes e-shop s osobním předáním nebo poradíme rovnou na jízdě.`,
      },
    ],
    logistics:
      "Vyjížďky startují od kavárny ve Valašském Meziříčí — přesné termíny a místo srazu zveřejňujeme před každou jízdou na našich profilech (Instagram). Kola, vybavení a servis řešíme přes e-shop s osobním předáním po regionu; kamenné zázemí ve Valmezu připravujeme.",
    localAngle: {
      title: "Jak se přidat",
      body: "Sleduj náš Instagram, kde vypisujeme termíny nejbližších Social rides Valašské Meziříčí. Přijeď na sraz ke kavárně, sedni na kolo a jeď s námi. Žádné přihlášky, žádné poplatky — jen dobrá parta a valašské kopce.",
    },
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
        q: "Kam až jezdíte?",
        a: "Po Valašsku, Vsetínsku, Novojičínsku a Beskydech — poznáváme nejhezčí trasy v regionu.",
      },
      {
        q: "Kde koupím kolo nebo vybavení?",
        a: "Přes náš e-shop s osobním předáním po regionu, nebo se domluvíme přímo na vyjížďce. Kamenné zázemí ve Valašském Meziříčí připravujeme.",
      },
    ],
    keywords:
      "social rides Valašské Meziříčí, cyklisté Valašské Meziříčí, společné vyjížďky Valmez, cyklo komunita Vsetín Nový Jičín, kola Valašské Meziříčí, 100dola sport",
  },

  // ───────────────────────── VSETÍN (nachystané, NELIVE) ─────────────────────
  {
    slug: "vsetin",
    published: false,
    city: "Vsetín",
    cityLocative: "ve Vsetíně",
    type: "coming",
    distanceKm: 70,
    metaTitle: "Kola, cyklo vybavení a sport Vsetín — 100dola sport",
    metaDescription:
      "100dola sport pro Vsetín a okolí — kola SCOTT / ISAAC / Lapierre, helmy, tretry, cyklo oblečení Q36.5, radar, osvětlení, sportovní výživa a běžecké boty. Servis kol a bikefit. Vybavení, které sami jezdíme.",
    h1: "Kola, cyklistické vybavení a sport pro Vsetín",
    intro:
      "Vsetínsko a Beskydy patří k nejkrásnějším místům na kolo v Česku. 100dola sport sem přináší silniční, gravel a horská kola SCOTT, ISAAC a Lapierre, kompletní vybavení na kolo, sportovní výživu i běžecké boty. Vybíráme věci, které sami jezdíme — pro lidi, co chtějí kvalitu, ne kompromis.",
    highlights: [
      {
        title: "Kola SCOTT · ISAAC · Lapierre",
        body: "Silniční, gravel a horská kola s poradenstvím, testovacími jízdami ISAAC a bikefitem.",
      },
      {
        title: "Vybavení na kolo a výživa",
        body: `${CYCLING_GEAR}, k tomu ${NUTRITION}. Prémiová kvalita pro náročné jezdce z Vsetínska a Beskyd.`,
      },
      {
        title: "Běh a servis",
        body: `${RUNNING}. A ke kolům kompletní servis, voskování řetězů a bikefit pro celoroční ježdění.`,
      },
    ],
    logistics:
      "Vsetín a okolí zatím obsluhujeme přes e-shop s osobním předáním a doručením. Rozšíření zázemí v regionu připravujeme — sleduj naše profily.",
    faq: [
      {
        q: "Máte prodejnu ve Vsetíně?",
        a: "Zázemí v regionu připravujeme. Zatím obsluhujeme Vsetínsko přes e-shop s osobním předáním a doručením.",
      },
    ],
    keywords:
      "kola Vsetín, cyklistické vybavení Vsetín, cyklo oblečení Vsetín, servis kol Vsetín, helmy tretry Vsetín, sportovní výživa Vsetín, běžecké boty, bikefit, SCOTT ISAAC, Q36.5",
  },

  // ───────────────────────── NOVÝ JIČÍN (nachystané, NELIVE) ─────────────────
  {
    slug: "novy-jicin",
    published: false,
    city: "Nový Jičín",
    cityLocative: "v Novém Jičíně",
    type: "coming",
    distanceKm: 65,
    metaTitle: "Kola, cyklo vybavení a sport Nový Jičín — 100dola sport",
    metaDescription:
      "100dola sport pro Nový Jičín a okolí — kola SCOTT / ISAAC / Lapierre, helmy, tretry, cyklo oblečení Q36.5, radar, osvětlení, sportovní výživa a běžecké boty. Servis a bikefit. Přidej se k Social rides Valašské Meziříčí, kam to máš kousek.",
    h1: "Kola, cyklistické vybavení a sport pro Nový Jičín",
    intro:
      "Novojičínsko a Beskydy jsou skvělé na kolo. 100dola sport sem přináší silniční, gravel a horská kola SCOTT, ISAAC a Lapierre, kompletní vybavení na kolo, sportovní výživu i běžecké boty — a komunitu Social rides Valašské Meziříčí, kam to máš kousek. Vybíráme věci, které sami jezdíme.",
    highlights: [
      {
        title: "Kola SCOTT · ISAAC · Lapierre",
        body: "Silniční, gravel a horská kola s poradenstvím, testovacími jízdami ISAAC a bikefitem.",
      },
      {
        title: "Vybavení na kolo a výživa",
        body: `${CYCLING_GEAR}, k tomu ${NUTRITION}. Prémiová kvalita pro náročné jezdce z Novojičínska a Beskyd.`,
      },
      {
        title: "Běh a servis",
        body: `${RUNNING}. A ke kolům kompletní servis, voskování řetězů a bikefit pro celoroční ježdění.`,
      },
    ],
    logistics:
      "Nový Jičín a okolí zatím obsluhujeme přes e-shop s osobním předáním a doručením. Rozšíření zázemí v regionu připravujeme — a mezitím se přidej k Social rides Valašské Meziříčí, kam to máš blízko.",
    faq: [
      {
        q: "Máte prodejnu v Novém Jičíně?",
        a: "Zázemí v regionu připravujeme. Zatím obsluhujeme Novojičínsko přes e-shop s osobním předáním a doručením a přes komunitu Social rides.",
      },
    ],
    keywords:
      "kola Nový Jičín, cyklistické vybavení Nový Jičín, cyklo oblečení Nový Jičín, servis kol Nový Jičín, sportovní výživa Nový Jičín, běžecké boty, social rides, SCOTT ISAAC, Q36.5",
  },
];

export function getPublishedLocations(): Location[] {
  return LOCATIONS.filter((l) => l.published);
}

export function getLocationBySlug(slug: string): Location | undefined {
  return LOCATIONS.find((l) => l.slug === slug);
}
