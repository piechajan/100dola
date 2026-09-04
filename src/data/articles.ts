// Articles registry — single source of truth pro /clanky hub i detail pages.

export type ArticleCategory = "udalost" | "lab" | "malaga" | "community" | "sport";
export type ArticleStatus = "published" | "draft";

export interface Article {
  slug: string;
  title: string;
  /** Krátký podtitul pro card v hubu (max ~120 znaků). */
  summary: string;
  category: ArticleCategory;
  /** Pro řazení a SEO datePublished. */
  publishedAt: string; // YYYY-MM-DD
  /** Pro řazení a SEO dateModified (default = publishedAt). */
  updatedAt?: string;
  /** Author pro byline. */
  author: { name: string; role?: string };
  /** Hero image (relativní /media/articles/<slug>.jpg, nebo absolutní URL). */
  image: string;
  /** Volitelný landscape obrázek pro širokou hero hlavičku detailu + OG/schema. Fallback = image. */
  heroImage?: string;
  status: ArticleStatus;
  /** Pro published články: minutes reading time (manual estimate). */
  readMinutes?: number;
  /** Pro draft / coming soon — co je tématem. */
  comingSoonHint?: string;
}

export const CATEGORY_LABEL: Record<ArticleCategory, string> = {
  udalost: "Událost",
  lab: "Lab — péče o kola",
  malaga: "Malaga & cestování",
  community: "Open Miles Clinic",
  sport: "Sport & vybavení",
};

export const CATEGORY_COLOR: Record<ArticleCategory, string> = {
  udalost: "#E8431A",
  lab: "#1F4937",
  malaga: "#E8431A",
  community: "#2EAA6E",
  sport: "#3B7CF4",
};

export const ARTICLES: Article[] = [
  {
    slug: "scott-karbony-hmf-hmx-hmx-sl",
    title: "Karbon SCOTT: HMF vs HMX vs HMX-SL — jaký rám vybrat",
    summary:
      "Tři třídy karbonu SCOTT jasně a bez marketingu. Čím se liší HMF, HMX a HMX-SL, o kolik je HMX lehčí — a které naše modely mají který karbon.",
    category: "sport",
    publishedAt: "2026-08-13",
    author: { name: "Jan Piecha", role: "100dola sport" },
    image: "/media/articles/scott-spark-rc-2027-hero.webp",
    status: "published",
    readMinutes: 5,
  },
  {
    slug: "scott-spark-rc-2026-vs-2027",
    title: "Scott Spark RC 2026 vs 2027 — co se reálně mění (Gen4 → Gen5)",
    summary:
      "Stačí to na upgrade? Side-by-side porovnání starší a nové generace Spark RC — rám, kinematika, kokpit, úložiště, váha, cena. Pro lidi, co dnes jezdí Spark RC a zvažují, zda počkat na 2027.",
    category: "sport",
    publishedAt: "2026-06-17",
    author: { name: "Jan Piecha", role: "100dola sport" },
    image: "/media/articles/scott-spark-rc-2027-hero.webp",
    status: "published",
    readMinutes: 7,
  },
  {
    slug: "scott-addict-gravel-2027",
    title: "Scott Addict Gravel 2027 — nový gravel s 57mm prostupem a rámem pod 800 g",
    summary:
      "Kompletní redesign gravel platformy Scott: prostup pneu 57 mm (pobere i 2,2\" MTB plášť), rám HMX 794 g, zadní flex +60 %, úložiště Save the Day v rámu a nářadí v koncovkách řídítek. Technika, zajímavosti a přehled modelů (Premium → Addict 40) s prokliky na specifikaci a cenu. Předobjednávka přes 100dola sport ve Šternberku.",
    category: "sport",
    publishedAt: "2026-09-04",
    author: { name: "Jan Piecha", role: "100dola sport" },
    image: "/media/articles/scott-addict-gravel-2027/test/test-01.webp",
    status: "published",
    readMinutes: 8,
  },
  {
    slug: "scott-spark-rc-2027",
    title: "Scott Spark RC 2027 — nová generace závodního XC, kterou už můžete předobjednat",
    summary:
      "Spark RC 2027 mění hru — rám HMX-SL 1 427 g, integrované Save-the-Day úložiště, nový kokpit Syncros iC-M100-SL a sedlovka až 200 mm. Detailní přehled platformy, modelové řady a předobjednávka přes 100dola sport ve Šternberku.",
    category: "sport",
    publishedAt: "2026-06-10",
    author: { name: "Jan Piecha", role: "100dola sport" },
    image: "/media/articles/scott-spark-rc-2027-hero.webp",
    status: "published",
    readMinutes: 10,
  },
  {
    slug: "cep-kompresni-vybaveni",
    title: "CEP kompresní vybavení pro běžce — kompletní průvodce (Šternberk, Olomouc, Uničov)",
    summary:
      "Co kompresní vybavení reálně dělá, jaké modely CEP máme skladem, jak vybrat velikost a komu se vyplatí. Run Socks, Calf Sleeves, Tall Compression, Recovery. 100dola sport — autorizovaný prodej.",
    category: "sport",
    publishedAt: "2026-05-25",
    author: { name: "Jan Piecha", role: "100dola sport" },
    image: "/media/articles/cep-kompresni-vybaveni-hero.webp",
    status: "published",
    readMinutes: 8,
  },
  {
    slug: "velikost-kola",
    title: "Jak vybrat správnou velikost kola — kompletní průvodce měřením doma",
    summary:
      "Výška, inseam, paže, trup, šířka ramen. Návod krok za krokem, orientační tabulka velikostí, kdy má smysl bikefit. Konzultace zdarma v 100dola sport — pro Šternberk, Vsetín, Valašské Meziříčí, Olomouc a okolí.",
    category: "sport",
    publishedAt: "2026-05-25",
    author: { name: "Jan Piecha", role: "100dola sport" },
    image: "/media/articles/velikost-kola-hero.webp",
    status: "published",
    readMinutes: 9,
  },
  {
    slug: "kde-koupit-kolo-sternberk",
    title: "Kde si koupit kolo ve Šternberku — průvodce 2026 (SCOTT, ISAAC, road & gravel)",
    summary:
      "Prémiový cyklistický obchod ve Šternberku — SCOTT, ISAAC, Lapierre, Ridley, Pinarello, Ghost, NORCO. Silniční a gravel kola od 40 000 do 250 000+ Kč. Cenová pásma, doporučené značky a co s kolem dostanete navíc.",
    category: "sport",
    publishedAt: "2026-05-25",
    author: { name: "Jan Piecha", role: "100dola sport" },
    image: "/media/articles/kde-koupit-kolo-sternberk-hero.webp",
    status: "published",
    readMinutes: 7,
  },
  {
    slug: "czech-tour-2026",
    title: "Czech Tour 2026 — Dlouhé stráně a Pustevny, a jak si je vyjet s námi",
    summary:
      "Czech Tour 2026 (UCI ProSeries, 13.–16. 8.) vrcholí dvěma horskými etapami v našem regionu — v sobotu 15. 8. Dlouhé stráně, v neděli 16. 8. Pustevny. Vyjeď si obě legendární stoupání s námi a půjč si silniční SCOTT zdarma.",
    category: "udalost",
    publishedAt: "2026-07-26",
    author: { name: "Jan Piecha", role: "100dola sport" },
    image: "/media/road-event.jpg",
    status: "published",
    readMinutes: 5,
  },
  {
    slug: "zavod-miru-2026-sternberk",
    title: "Závod Míru 2026 končí ve Šternberku — trasa, program, kde sledovat dojezd",
    summary:
      "Finálová etapa 13. ročníku Závodu Míru U23 vede v neděli 31. 5. 2026 z Krnova do Šternberka. 130,6 km, 2 278 m, dojezd 15:10 (vyhlášení 15:25). Plus testovací jízdy ISAAC v obchodě 100dola sport — celý víkend, zdarma.",
    category: "udalost",
    publishedAt: "2026-05-19",
    author: { name: "Jan Piecha", role: "100dola sport" },
    image: "/media/articles/zavod-miru-sternberk-hero.jpg",
    status: "published",
    readMinutes: 8,
  },
  {
    slug: "voskovani-retezu",
    title: "Voskování řetězů — pro koho má smysl, jak na to a kdy to nechat profesionálovi",
    summary:
      "Vosk vs. olej. Proč voskovaný řetěz drhne méně, vydrží líp a špiní méně. Silca SuperSecret, Molten Speed Wax, Squirt. Postup, ceny, kdy se vyplatí přejít z oleje. 100dola Lab Šternberk + okolí.",
    category: "lab",
    publishedAt: "2026-05-25",
    author: { name: "Jan Piecha", role: "100dola Lab" },
    image: "/media/articles/voskovani-retezu.webp",
    heroImage: "/media/articles/voskovani-retezu-hero.webp",
    status: "published",
    readMinutes: 6,
  },
  {
    slug: "keramicka-loziska",
    title: "Keramická ložiska v kole — prémiový upgrade, který poznáte hned",
    summary:
      "CeramicSpeed, CULT, Enduro Bearings. Lehčí, hladší, odolnější. Reálný benefit ve watech a v plynulém roztočení. Jaké modely doporučujeme, kde mají největší dopad, jak to v 100dola Lab probíhá.",
    category: "lab",
    publishedAt: "2026-05-25",
    author: { name: "Jan Piecha", role: "100dola Lab" },
    image: "/media/lab/pinarello-dogma-hero.jpg",
    status: "published",
    readMinutes: 7,
  },
  {
    slug: "ochrana-laku-ppf",
    title: "Ochrana laku kola — PPF folie, keramické coatingy a co fakt funguje",
    summary:
      "Tvoje nové kolo má lak za 30 000 Kč. STEK / XPel / 3M VentureShield — která fólie kam patří. Plus alternativy: keramické coatingy.",
    category: "lab",
    publishedAt: "2026-07-07",
    author: { name: "100dola Lab", role: "Servis kol" },
    image: "/media/lab/lab-ppf.jpg",
    status: "published",
    readMinutes: 6,
  },
  {
    slug: "cestovani-s-kolem-malaga",
    title: "Cestování s kolem do Malagy — bez krabice, bez stresu, bez kompromisů",
    summary:
      "Vlastní kolo na Costa del Sol. Letíš nalehko, jedeš na svém. Praktický průvodce přepravou, uskladněním a sezónou v Andalusii.",
    category: "malaga",
    publishedAt: "2026-07-07",
    author: { name: "Jan Piecha", role: "100dola Malaga" },
    image: "/media/malaga-event.jpg",
    status: "published",
    readMinutes: 7,
  },
  {
    slug: "doprava-kola-do-malagy",
    title: "Doprava kola do Malagy: jak to funguje krok za krokem",
    summary:
      "Sběr v Šternberku / Olomouci / Valašském Meziříčí / Praze. Fyzický transport dodávkou. Sklad v Malaze 10 minut od letiště. Pojištění, ceník, srovnání s půjčovnou. Realistický návod od Jana, který to dělá od 2024.",
    category: "malaga",
    publishedAt: "2026-06-03",
    author: { name: "Jan Piecha", role: "100dola Malaga" },
    image: "/media/malaga-hero.jpg",
    status: "published",
    readMinutes: 10,
  },
  {
    slug: "vlastni-kolo-malaga-vs-pujcovna",
    title: "Vlastní kolo v Malaze vs půjčovna — kdy se vyplatí co",
    summary:
      "Konkrétní rozpočet pro 3 typické profily cyklistů. Cena, fit, tréninková kontinuita. Půjčovna nebo vlastní kolo? Záleží jak často jezdíš — máme to spočítané.",
    category: "malaga",
    publishedAt: "2026-06-03",
    author: { name: "Jan Piecha", role: "100dola Malaga" },
    image: "/media/malaga-event.jpg",
    status: "published",
    readMinutes: 7,
  },
  {
    slug: "bikefit-sternberk",
    title: "Bikefit ve Šternberku — co měříme, kolik to stojí a kdy ho potřebuješ",
    summary:
      "Nastavení kola na míru. 90–120 minut, basic 2 500 Kč / full s motion capture 4 500 Kč. Statické rozměry, výška sedla, reach, cleat alignment, video analýza. Šternberk pro Olomoucký kraj, Valašsko, Jeseníky.",
    category: "sport",
    publishedAt: "2026-06-03",
    author: { name: "Jan Piecha", role: "100dola sport" },
    image: "/media/obchod/01-obchod.jpg",
    status: "published",
    readMinutes: 6,
  },
  {
    slug: "isaac-boson-vitron-meson",
    title: "ISAAC Meson, Vitron, Element, Boson — komu které kolo pasuje",
    summary:
      "Holandský karbon ISAAC v Česku. Race / aero / endurance / triatlon / gravel — 6 modelů, různé profily jezdců. Naše zkušenosti z ISAAC testovacího víkendu, custom konfigurátor přímo na webu.",
    category: "sport",
    publishedAt: "2026-06-03",
    author: { name: "Jan Piecha", role: "100dola sport" },
    image: "/media/isaac/meson-mineral-white-l/01.jpg",
    status: "published",
    readMinutes: 8,
  },
  {
    slug: "strava-segmenty-sternberk-olomoucky-kraj",
    title: "Strava segmenty v Olomouckém kraji — 5 tras které musíš jet + náš klub",
    summary:
      "Šternberk → Pradědsko, Sovinec stoupání, Velký Kosíř, Velká Kotlina gravel, Hostýnské vrchy. Plus jak najít aktivní cyklisty a jak se zapojit do Open Miles Clinic.",
    category: "community",
    publishedAt: "2026-06-03",
    author: { name: "Jan Piecha", role: "Open Miles Clinic" },
    image: "/media/community-hero-jedeme-spolu-9423.jpg",
    status: "published",
    readMinutes: 6,
  },
  {
    slug: "social-rides-open-miles-clinic",
    title: "Social rides na Valašsku — proč jezdíme pod Open Miles Clinic a co tě čeká",
    summary:
      "Tempo, které sedí. Kafe na začátku, pivo na konci. Místo závodění komunita. Silnice, gravel, MTB, skialpy a běh v Beskydech, Hostýnských vrších a Jeseníkách. Vsetín, Valašské Meziříčí, Rožnov.",
    category: "community",
    publishedAt: "2026-05-25",
    author: { name: "Jan Piecha", role: "Open Miles Clinic" },
    image: "/media/community-hero-jedeme-spolu-9423.jpg",
    status: "published",
    readMinutes: 8,
  },
];

export function getPublishedArticles(): Article[] {
  return ARTICLES.filter((a) => a.status === "published").sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt),
  );
}

export function getArticleBySlug(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}

export function getRelatedArticles(article: Article, n = 3): Article[] {
  return ARTICLES.filter(
    (a) => a.slug !== article.slug && a.category === article.category,
  ).slice(0, n);
}
