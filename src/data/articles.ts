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
    slug: "zavod-miru-2026-sternberk",
    title: "Závod Míru 2026 končí ve Šternberku — trasa, program, kde sledovat dojezd",
    summary:
      "Finálová etapa 73. ročníku Závodu Míru U23 vede v neděli 31. 5. 2026 z Krnova do Šternberka. 130,6 km, 2 278 m, dojezd kolem 17:00. Plus testovací jízdy ISAAC v obchodě 100dola sport — celý víkend, zdarma.",
    category: "udalost",
    publishedAt: "2026-05-19",
    author: { name: "Jan Piecha", role: "100dola sport" },
    image: "/media/sport-hero.jpg",
    status: "published",
    readMinutes: 8,
  },
  {
    slug: "voskovani-retezu",
    title: "Voskování řetězů — pro koho má smysl, jak na to a kdy to nechat profesionálovi",
    summary:
      "Vosk vs. olej. Proč voskovaný řetěz drhne méně, vydrží líp a špiní méně. Návod krok za krokem + kdy se nevyplatí.",
    category: "lab",
    publishedAt: "",
    author: { name: "100dola Lab", role: "Servis kol" },
    image: "/media/lab/lab-wax.jpg",
    status: "draft",
    comingSoonHint:
      "Detailní průvodce voskováním řetězů — Silca SuperSecret vs Molten Speed Wax vs Squirt, postup ultrazvuk + vosk + dryer, kdy se vyplatí přejít z oleje.",
  },
  {
    slug: "keramicka-loziska",
    title: "Keramická ložiska v kole — kdy jsou výhrou a kdy zbytečnou útratou",
    summary:
      "CeramicSpeed, CULT, Enduro. Reálný benefit ve watech, jak dlouho vydrží, na co si dát pozor. Pro koho má smysl a kdo si vystačí s kvalitními ocelovými.",
    category: "lab",
    publishedAt: "",
    author: { name: "100dola Lab", role: "Servis kol" },
    image: "/media/lab/lab-bearings.jpg",
    status: "draft",
    comingSoonHint:
      "Test keramických ložisek pro headset, středové složení a kola — jaké modely, kolik watu reálně ušetří, kdy je vyměnit.",
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
      "Tempo, které sedí. Kafe na konci. Místo závodění komunita. Vyjížďky, skialpy, MTB, turistika v Beskydech a Jeseníkách.",
    category: "community",
    publishedAt: "",
    author: { name: "Open Miles Clinic", role: "Komunita" },
    image: "/media/community-hero-jedeme-spolu-9423.jpg",
    status: "draft",
    comingSoonHint:
      "Jak fungují social rides Open Miles Clinic — tempo, formát, místa, kdo jezdí. Pro úplné začátečníky i závodníky.",
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
