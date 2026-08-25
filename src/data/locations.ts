// Lokální landing stránky pro Local SEO (organika + areaServed).
// URL: /prodejna/[slug]. Publikované = v generateStaticParams + sitemapě;
// nepublikované = nachystané, 404 dokud published:false → true.
//
// Strategie (Jan 2026-07): cílíme na SPORTOVNÍ VYBAVENÍ + OBLEČENÍ (bonitnější
// klientela). Hlavní sortiment = KOLA + vybavení na kolo (helmy, tretry,
// oblečení, radar, osvětlení) + sportovní VÝŽIVA (iontáky, gely, tyčinky) +
// BĚH (boty + oblečení). Šternberk = kamenná prodejna. Olomouc, Valašské
// Meziříčí, Vsetín, Rožnov pod Radhoštěm = výdej + doručení (LIVE, model jako
// Olomouc — NE kamenná prodejna). Nový Jičín = nachystané (published:false).
// Valašská města využívají i community úhel „Social rides".

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
      "Kamenná prodejna 100dola sport ve Šternberku (Partyzánská 2): kola SCOTT / ISAAC / Ridley / Pinarello, helmy, tretry, cyklo oblečení Q36.5, radar, osvětlení, sportovní výživa (gely, iontáky) a běžecké boty. Servis kol, bikefit, testovací jízdy. Přijď se poradit osobně.",
    h1: "Kola, cyklistické vybavení a sport ve Šternberku",
    intro:
      "Naše kamenná prodejna ve Šternberku na Partyzánské 2 je základna 100dola sport. Nejsme velkosklad — vybíráme věci, které sami jezdíme: silniční, gravel a horská kola SCOTT, ISAAC, Ridley a Pinarello, vybavení na kolo (helmy, tretry, cyklo oblečení Q36.5, radar, osvětlení), sportovní výživu a běžecké boty. Přijď si nechat poradit osobně, vyzkoušet posed a odjet s věcí, která ti reálně sedne.",
    highlights: [
      {
        title: "Kola SCOTT · ISAAC · Ridley · Pinarello",
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
      "kola Šternberk, cyklistické vybavení Šternberk, cyklo oblečení Šternberk, servis kol Šternberk, helmy tretry Šternberk, sportovní výživa, běžecké boty Šternberk, bikefit, SCOTT ISAAC Ridley Pinarello, Q36.5, CEP",
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
      "100dola sport pro Olomouc: kola SCOTT / ISAAC / Lapierre / Ridley / Pinarello, helmy, tretry, cyklo oblečení Q36.5, radar, osvětlení, sportovní výživa a běžecké boty. Osobní odběr ve Šternberku zdarma, dovoz po domluvě; servis a bikefit kousek (17 km). Objednej online, vyzvedni v Olomouci.",
    h1: "Kola, cyklistické vybavení a sport pro Olomouc",
    intro:
      "Jsi z Olomouce a hledáš kvalitní kolo, vybavení a sportovní výživu? 100dola sport máme kousek — kamennou prodejnu ve Šternberku (17 km) a pro Olomouc nabízíme osobní předání a doručení. Objednáš online z e-shopu, my ti věci připravíme a předáme, nebo přijedeš na prodejnu na osobní konzultaci, bikefit a testovací jízdu.",
    highlights: [
      {
        title: "Kola a e-shop s osobním předáním",
        body: "Kola SCOTT, ISAAC, Lapierre, Ridley a Pinarello + kompletní sortiment z e-shopu (přes 770 produktů). Osobní předání v Olomouci po domluvě, nebo doručení na adresu.",
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
        a: "Objednáš online, vybereš osobní vyzvednutí, my se ozveme a domluvíme místo a čas předání v Olomouci. Osobní odběr na prodejně ve Šternberku je zdarma; dovoz a předání ve městě je jedna z možností — termín i cenu potvrdíme po objednávce.",
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
    type: "pickup",
    distanceKm: 55,
    metaTitle: "Kola, cyklo vybavení a sport Valašské Meziříčí — 100dola sport",
    metaDescription:
      "100dola sport ve Valašském Meziříčí — kola SCOTT / ISAAC / Lapierre / Ridley / Pinarello, helmy, tretry, cyklo oblečení Q36.5, radar, osvětlení, sportovní výživa a běžecké boty. Servis a bikefit.",
    h1: "Kola, cyklistické vybavení a sport ve Valašském Meziříčí",
    intro:
      "Jsme z Valašska a jezdíme tady stejné kopce jako ty. 100dola sport není anonymní e-shop — kolo ti vybereme, složíme, seřídíme a osobně přivezeme až do Valašského Meziříčí. Silniční, gravel a horská kola SCOTT, ISAAC, Lapierre, Ridley a Pinarello, vybavení na kolo, sportovní výživu i běžecké boty vybíráme podle toho, co sami jezdíme. Bez obíhání prodejen — domluvíme se, přivezeme a předáme z ruky do ruky, seřízené a připravené na první jízdu.",
    highlights: [
      {
        title: "Kola SCOTT · ISAAC · Lapierre · Ridley · Pinarello",
        body: "Silniční, gravel a horská kola. Poradíme s výběrem, nabízíme testovací jízdy ISAAC a bikefit.",
      },
      {
        title: "Vybavení na kolo a výživa",
        body: `${CYCLING_GEAR}, k tomu ${NUTRITION}. Kvalita pro jezdce, co na Valašsku najezdí víc než pár nedělních kilometrů.`,
      },
      {
        title: "Běh a servis",
        body: `${RUNNING}. A ke kolům kompletní servis, voskování řetězů a bikefit.`,
      },
    ],
    logistics:
      "Vyber si z e-shopu a domluv osobní předání — kolo složíme, seřídíme a přivezeme přímo do Valašského Meziříčí, nebo doručíme na adresu. Doprava zdarma nad 2 500 Kč. Chceš bikefit, testovací jízdu ISAAC nebo velký servis? Skoč za námi na prodejnu ve Šternberku, ale kolo a vybavení k tobě dovezeme i bez toho.",
    localAngle: {
      title: "Jezdíme tady s tebou — Social rides Valašské Meziříčí",
      body: "Ve Valmezu točíme komunitní vyjížďky Open Miles Clinic. Nejsme přespolní, co sem jednou za rok dovezou kola — potkáš nás na trénincích i na kafi. Přidej se, poznáš lidi i to, jak ke kolu a jízdě přistupujeme.",
    },
    faq: [
      {
        q: "Přivezete kolo až ke mně do Valašského Meziříčí?",
        a: "Ano. Vybrané kolo složíme, seřídíme a osobně přivezeme do Valašského Meziříčí — nebo doručíme na adresu. Jsme z Valašska, takže to k tobě není žádná výprava. Termín předání potvrdíme po objednávce.",
      },
      {
        q: "Kde si nechám udělat bikefit nebo servis?",
        a: "Na naší prodejně ve Šternberku (bikefit, testovací jízdy ISAAC, velký servis). Běžné vybavení a kola ale k tobě do Valmezu dovezeme, takže kvůli nákupu nikam jezdit nemusíš.",
      },
    ],
    keywords:
      "kola Valašské Meziříčí, cyklistické vybavení Valašské Meziříčí, cyklo oblečení Valašské Meziříčí, servis kol Valašské Meziříčí, sportovní výživa, běžecké boty, SCOTT ISAAC, Q36.5",
  },

  // ───────────────────────── VSETÍN (nachystané, NELIVE) ─────────────────────
  {
    slug: "vsetin",
    published: true,
    city: "Vsetín",
    cityLocative: "ve Vsetíně",
    type: "pickup",
    distanceKm: 70,
    metaTitle: "Kola, cyklo vybavení a sport Vsetín — 100dola sport",
    metaDescription:
      "100dola sport pro Vsetín a okolí — kola SCOTT / ISAAC / Lapierre / Ridley / Pinarello, helmy, tretry, cyklo oblečení Q36.5, radar, osvětlení, sportovní výživa a běžecké boty. Servis kol a bikefit. Vybavení, které sami jezdíme.",
    h1: "Kola, cyklistické vybavení a sport pro Vsetín",
    intro:
      "Vsetínsko a Beskydy jsou náš domov i náš trénink. 100dola sport ti kolo vybere, složí, seřídí a osobně přiveze až na Vsetín — silniční, gravel a horská kola SCOTT, ISAAC, Lapierre, Ridley a Pinarello, vybavení na kolo, sportovní výživu i běžecké boty vybíráme podle toho, co sami jezdíme po zdejších kopcích. Žádný anonymní balík z e-shopu, ale kolo předané z ruky do ruky, připravené na první výšlap.",
    highlights: [
      {
        title: "Kola SCOTT · ISAAC · Lapierre · Ridley · Pinarello",
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
      "Objednej z e-shopu a vyber osobní vyzvednutí — složené kolo i vybavení předáme přímo ve Vsetíně, nebo doručíme na adresu. Doprava zdarma nad 2 500 Kč. Servis, bikefit a testovací jízdy ISAAC jsou na prodejně ve Šternberku.",
    localAngle: {
      title: "Jezdíme tady s tebou — Social rides Vsetín",
      body: "Na Vsetínsku a v Beskydech točíme komunitní vyjížďky Open Miles Clinic. Nejsme přespolní obchod — potkáš nás na trénincích v terénu, který sám jezdíš. Přidej se a poznej náš přístup k jízdě i k výběru vybavení.",
    },
    faq: [
      {
        q: "Přivezete kolo až ke mně na Vsetín?",
        a: "Ano. Vybrané kolo složíme, seřídíme a osobně přivezeme na Vsetín — nebo doručíme na adresu. Jsme z Valašska, takže k tobě dorazíme rádi. Termín předání potvrdíme po objednávce.",
      },
      {
        q: "Kde si nechám udělat bikefit nebo servis?",
        a: "Bikefit, testovací jízdy ISAAC a velký servis děláme na prodejně ve Šternberku. Kolo a běžné vybavení ale k tobě na Vsetín dovezeme, takže kvůli nákupu nikam jezdit nemusíš.",
      },
    ],
    keywords:
      "kola Vsetín, cyklistické vybavení Vsetín, cyklo oblečení Vsetín, servis kol Vsetín, helmy tretry Vsetín, sportovní výživa Vsetín, běžecké boty, bikefit, SCOTT ISAAC, Q36.5",
  },

  // ─────────────── ROŽNOV POD RADHOŠTĚM (výdej + doručení, LIVE) ─────────────
  {
    slug: "roznov-pod-radhostem",
    published: true,
    city: "Rožnov pod Radhoštěm",
    cityLocative: "v Rožnově pod Radhoštěm",
    type: "pickup",
    distanceKm: 62,
    metaTitle: "Kola, cyklo vybavení a sport Rožnov pod Radhoštěm — 100dola sport",
    metaDescription:
      "100dola sport pro Rožnov pod Radhoštěm a Beskydy — kola SCOTT / ISAAC / Lapierre / Ridley / Pinarello, helmy, tretry, cyklo oblečení Q36.5, radar, osvětlení, sportovní výživa a běžecké boty. Osobní předání a doručení, servis a bikefit. Vybavení, které sami jezdíme.",
    h1: "Kola, cyklistické vybavení a sport pro Rožnov pod Radhoštěm",
    intro:
      "Rožnov a Beskydy — od pohodových údolí po pořádné stoupáky — jezdíme sami a rádi. 100dola sport ti kolo vybere, složí, seřídí a osobně přiveze až do Rožnova pod Radhoštěm: silniční, gravel a horská kola SCOTT, ISAAC, Lapierre, Ridley a Pinarello, vybavení na kolo, sportovní výživu i běžecké boty vybíráme podle toho, co sami jezdíme v beskydském terénu. Ne anonymní zásilka, ale kolo předané osobně, připravené na první beskydský výšlap.",
    highlights: [
      {
        title: "Kola SCOTT · ISAAC · Lapierre · Ridley · Pinarello",
        body: "Silniční, gravel a horská kola s poradenstvím, testovacími jízdami ISAAC a bikefitem — ať sedí posed i výběr podle beskydského terénu.",
      },
      {
        title: "Vybavení na kolo a výživa",
        body: `${CYCLING_GEAR}, k tomu ${NUTRITION}. Prémiová kvalita pro jezdce z Rožnovska a Beskyd, kterou v běžných řetězcích nekoupíš.`,
      },
      {
        title: "Běh a servis",
        body: `${RUNNING}. A ke kolům kompletní servis, voskování řetězů a bikefit pro celoroční ježdění.`,
      },
    ],
    logistics:
      "Objednej z e-shopu a vyber osobní vyzvednutí — složené kolo i vybavení předáme v Rožnově pod Radhoštěm, nebo doručíme na adresu. Doprava zdarma nad 2 500 Kč. Servis, bikefit a testovací jízdy ISAAC jsou na prodejně ve Šternberku.",
    localAngle: {
      title: "Social rides Valašské Meziříčí",
      body: "Kousek od Rožnova jezdíme komunitní vyjížďky Open Miles Clinic ve Valašském Meziříčí — přidej se, poznáš lidi i náš přístup k jízdě.",
    },
    faq: [
      {
        q: "Máte prodejnu v Rožnově pod Radhoštěm?",
        a: "Kamennou prodejnu máme ve Šternberku. Pro Rožnov a Beskydy nabízíme osobní předání složeného kola a vybavení a doručení — plus komunitu Social rides ve Valašském Meziříčí kousek od Rožnova.",
      },
      {
        q: "Jak funguje osobní předání v Rožnově?",
        a: "Objednáš online, vybereš osobní vyzvednutí, ozveme se a domluvíme místo a čas předání v Rožnově pod Radhoštěm. Osobní odběr na prodejně ve Šternberku je zdarma; dovoz a předání ve městě je jedna z možností — termín i cenu potvrdíme po objednávce.",
      },
    ],
    keywords:
      "kola Rožnov pod Radhoštěm, cyklistické vybavení Rožnov, cyklo oblečení Rožnov, servis kol Rožnov, sportovní výživa Beskydy, běžecké boty Rožnov, bikefit, SCOTT ISAAC, Q36.5",
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
      "100dola sport pro Nový Jičín a okolí — kola SCOTT / ISAAC / Lapierre / Ridley / Pinarello, helmy, tretry, cyklo oblečení Q36.5, radar, osvětlení, sportovní výživa a běžecké boty. Servis a bikefit. Přidej se k Social rides Valašské Meziříčí, kam to máš kousek.",
    h1: "Kola, cyklistické vybavení a sport pro Nový Jičín",
    intro:
      "Novojičínsko a Beskydy jsou skvělé na kolo a my je jezdíme sami. 100dola sport ti kolo vybere, složí, seřídí a osobně přiveze do Nového Jičína: silniční, gravel a horská kola SCOTT, ISAAC, Lapierre, Ridley a Pinarello, vybavení na kolo, sportovní výživu i běžecké boty vybíráme podle toho, co sami najezdíme. K tomu komunita Social rides Valašské Meziříčí, kam to máš kousek — ne přespolní obchod, ale lidi, které potkáš v terénu.",
    highlights: [
      {
        title: "Kola SCOTT · ISAAC · Lapierre · Ridley · Pinarello",
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
