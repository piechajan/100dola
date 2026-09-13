import { MALAGA_ROUTES_V2 } from "@/data/malaga/routes";
import { ARTICLES } from "@/data/articles";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Vyhledávání napříč OBSAHEM webu (ne e-shop produkty — ty řeší /api/shop/search).
// Pokrývá: Malaga trasy, magazínové články, klíčové stránky.

export interface ContentHit {
  id: string;
  type: "Trasa" | "Článek" | "Stránka";
  title: string;
  subtitle: string;
  url: string;
  image?: string | null;
}

/** Fold diakritiky + lowercase — aby „jezera" našlo i „ježera" a psaní bez háčků fungovalo. */
function fold(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

/** AND match: každé slovo dotazu musí být někde v hay. */
function matches(hay: string, tokens: string[]): boolean {
  const h = fold(hay);
  return tokens.every((t) => h.includes(t));
}

interface StaticPage {
  title: string;
  url: string;
  subtitle: string;
  keywords: string;
}

const STATIC_PAGES: StaticPage[] = [
  { title: "Malaga — cyklistická základna", url: "/malaga", subtitle: "Přeprava, uskladnění a ježdění s vlastním kolem", keywords: "malaga španělsko andalusie základna camp tábor vlastní kolo fly to ride" },
  { title: "Trasy v okolí Malagy", url: "/malaga/trasy", subtitle: "Katalog self-guided cyklotras", keywords: "trasy trasa malaga cyklotrasy okruhy vyjížďky kolo silnice gravel andalusie el chorro" },
  { title: "Přeprava kola do Malagy", url: "/malaga/preprava", subtitle: "Jak se tvé kolo dostane do Malagy", keywords: "přeprava doprava transport kolo malaga box příručák" },
  { title: "Uskladnění kola v Malaze", url: "/malaga/uskladneni", subtitle: "Kolo připravené, kdykoli přiletíš", keywords: "uskladnění storage sklad kolo malaga zima" },
  { title: "Ubytování v Malaze", url: "/malaga/ubytovani", subtitle: "Zázemí a nocleh", keywords: "ubytování nocleh malaga apartmán základna" },
  { title: "Balíčky Malaga", url: "/malaga/balicky", subtitle: "Basic vs Exclusive", keywords: "balíčky basic exclusive cena malaga servis" },
  { title: "Lab — detailing a servis kol", url: "/lab", subtitle: "Vosk, PPF, ložiska, bikefit", keywords: "lab detailing vosk wax ppf folie ložiska bearings glaze cleanup bikefit servis kolo" },
  { title: "Social rides", url: "/social-rides", subtitle: "Komunitní vyjížďky a akce", keywords: "social rides vyjížďky komunita akce skupinové ježdění" },
  { title: "O nás", url: "/o-nas", subtitle: "Kdo je za 100dola", keywords: "o nás jan piecha denisa futunatu tým naši lidé organizátoři" },
  { title: "Kontakt", url: "/kontakt", subtitle: "Napiš nebo zavolej", keywords: "kontakt telefon email adresa prodejna" },
  { title: "E-shop", url: "/shop", subtitle: "Kola, komponenty, oblečení, výživa", keywords: "eshop shop obchod kola scott isaac oblečení výživa sponser cep" },
  { title: "Pojištění kola", url: "/pojisteni", subtitle: "Poptávka pojištění", keywords: "pojištění pojistka kolo" },
  { title: "Prodejna", url: "/prodejna", subtitle: "Šternberk, Olomouc, Valašské Meziříčí", keywords: "prodejna šternberk olomouc valašské meziříčí kde koupit kolo" },
  { title: "Magazín", url: "/clanky", subtitle: "Články, průvodce a novinky", keywords: "magazín články blog průvodce novinky recenze" },
];

/**
 * GET /api/content/search?q=<query>
 * Vrací obsahové hity (trasy + články + stránky). Public, bez auth.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();
  if (q.length < 2) return Response.json({ hits: [] });

  const limit = Math.min(30, Math.max(1, Number(searchParams.get("limit")) || 20));
  const tokens = fold(q).split(/\s+/).filter(Boolean);
  const hits: ContentHit[] = [];

  // 1) Malaga trasy
  const ROUTE_KW = "trasa trasy cyklotrasa okruh vyjížďka kolo malaga andalusie";
  for (const r of MALAGA_ROUTES_V2) {
    const hay = `${r.name_cs} ${r.name_es ?? ""} ${r.story_cs} ${r.roads.join(" ")} ${r.slug} ${ROUTE_KW}`;
    if (matches(hay, tokens)) {
      hits.push({
        id: `route:${r.slug}`,
        type: "Trasa",
        title: r.name_cs,
        subtitle: `Malaga · ${r.distance_km} km · ${r.ascent_m} m ↑`,
        url: `/malaga/trasy/${r.slug}`,
        image: r.photos[0] ?? null,
      });
    }
  }

  // 2) Články (jen published)
  for (const a of ARTICLES) {
    if (a.status !== "published") continue;
    const hay = `${a.title} ${a.summary} ${a.slug} ${a.category}`;
    if (matches(hay, tokens)) {
      hits.push({
        id: `article:${a.slug}`,
        type: "Článek",
        title: a.title,
        subtitle: a.summary,
        url: `/clanky/${a.slug}`,
        image: a.image ?? null,
      });
    }
  }

  // 3) Klíčové stránky
  for (const p of STATIC_PAGES) {
    const hay = `${p.title} ${p.subtitle} ${p.keywords} ${p.url}`;
    if (matches(hay, tokens)) {
      hits.push({
        id: `page:${p.url}`,
        type: "Stránka",
        title: p.title,
        subtitle: p.subtitle,
        url: p.url,
        image: null,
      });
    }
  }

  // Rank: title exact/startsWith nahoru; stránky lehce dolů (jsou obecné)
  const qFold = fold(q);
  function score(h: ContentHit): number {
    const t = fold(h.title);
    let s = 0;
    if (t === qFold) s = 100;
    else if (t.startsWith(qFold)) s = 80;
    else if (t.includes(qFold)) s = 60;
    else s = 40;
    if (h.type === "Stránka") s -= 5;
    return s;
  }

  const ranked = hits
    .map((h) => ({ h, s: score(h) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map(({ h }) => h);

  return Response.json({ hits: ranked });
}
