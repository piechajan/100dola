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
    slug: "cep-kompresni-vybaveni",
    title: "CEP kompresní vybavení pro běžce — kompletní průvodce (Vsetín, Valašsko, Olomouc)",
    summary:
      "Co kompresní vybavení reálně dělá, jaké modely CEP máme skladem, jak vybrat velikost a komu se vyplatí. Run Socks, Calf Sleeves, Tall Compression, Recovery. 100dola sport — autorizovaný prodej.",
    category: "sport",
    publishedAt: "2026-05-25",
    author: { name: "Jan Piecha", role: "100dola sport" },
    image: "/media/community-hero-jedeme-spolu-9423.jpg",
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
    image: "/media/articles/zavod-miru-sternberk-hero.jpg",
    status: "published",
    readMinutes: 9,
  },
  {
    slug: "kde-koupit-kolo-sternberk",
    title: "Kde si koupit kolo ve Šternberku — průvodce 2026 (SCOTT, ISAAC, road & gravel)",
    summary:
      "Prémiový cyklistický obchod ve Šternberku — SCOTT, ISAAC, Lapierre, Ghost, NORCO. Silniční a gravel kola od 40 000 do 250 000+ Kč. Cenová pásma, doporučené značky a co s kolem dostanete navíc.",
    category: "sport",
    publishedAt: "2026-05-25",
    author: { name: "Jan Piecha", role: "100dola sport" },
    image: "/media/articles/zavod-miru-sternberk-hero.jpg",
    status: "published",
    readMinutes: 7,
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
    image: "/media/articles/voskovani-retezu-hero.jpg",
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
    publishedAt: "",
    author: { name: "100dola Lab", role: "Servis kol" },
    image: "/media/lab/lab-ppf.jpg",
    status: "draft",
    comingSoonHint:
      "Co fakt chrání karbonový rám — PPF folie po sektorech, frame protection film, keramické coatingy. Návod, jak se k tomu postavit.",
  },
  {
    slug: "cestovani-s-kolem-malaga",
    title: "Cestování s kolem do Malagy — bez krabice, bez stresu, bez kompromisů",
    summary:
      "Vlastní kolo na Costa del Sol. Letíš nalehko, jedeš na svém. Praktický průvodce přepravou, uskladněním a sezónou v Andalusii.",
    category: "malaga",
    publishedAt: "",
    author: { name: "Jan Piecha", role: "100dola Malaga" },
    image: "/media/malaga-event.jpg",
    status: "draft",
    comingSoonHint:
      "Kompletní průvodce přepravou kola do Malagy — náš box, ne aviační kufry, sezónní uskladnění, Basic vs. Exclusive balíček.",
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
