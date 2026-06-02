import { categories, type TopCategory, type SubCategory } from "@/data/categories";

export interface ResolvedCategory {
  /** TopCategory match (always present pokud resolved) */
  top: TopCategory;
  /** Level-2 subcategory (e.g. „silnicni" pod „kola") */
  sub?: SubCategory;
  /** Level-3 child (e.g. „silnicni-aero") */
  child?: SubCategory;
  /** Slug path pro canonical URL */
  pathSlugs: string[];
  /** Default heading + meta */
  title: string;
  description: string;
}

/**
 * Resolve URL path → category hierarchy.
 *
 * Akceptované tvary:
 *   ["kola"]                          → top: Kola
 *   ["kola", "silnicni"]              → top: Kola, sub: Silniční
 *   ["kola", "silnicni", "aero"]      → top: Kola, sub: Silniční, child: Aero
 *   ["doplnky", "vyplety"]            → top: Doplňky, sub: Výplety & ráfky
 *   ["obleceni", "dresy"]             → top: Oblečení, sub: Dresy
 *
 * Vrací null pokud path neexistuje (caller dá notFound()).
 */
export function resolveCategoryPath(pathSlugs: string[]): ResolvedCategory | null {
  if (pathSlugs.length === 0) return null;

  const [topSlug, subSlug, childSlug] = pathSlugs;
  const top = categories.find((c) => c.id === topSlug);
  if (!top) return null;

  if (!subSlug) {
    return {
      top,
      pathSlugs: [top.id],
      title: top.name,
      description: top.description,
    };
  }

  const sub = top.subcategories.find((s) => s.id === subSlug);
  if (!sub) return null;

  if (!childSlug) {
    return {
      top,
      sub,
      pathSlugs: [top.id, sub.id],
      title: `${sub.name} — ${top.name}`,
      description: `${sub.name} v kategorii ${top.name.toLowerCase()}: ${top.description.toLowerCase()}`,
    };
  }

  const child = sub.children?.find((c) => c.id === childSlug);
  if (!child) return null;

  return {
    top,
    sub,
    child,
    pathSlugs: [top.id, sub.id, child.id],
    title: `${child.name} — ${sub.name} — ${top.name}`,
    description: `${child.name} ${sub.name.toLowerCase()} v kategorii ${top.name.toLowerCase()}.`,
  };
}

/** Všechny URL path-y pro static generation. */
export function getAllCategoryPaths(): string[][] {
  const out: string[][] = [];
  for (const top of categories) {
    out.push([top.id]);
    for (const sub of top.subcategories) {
      out.push([top.id, sub.id]);
      for (const child of sub.children ?? []) {
        out.push([top.id, sub.id, child.id]);
      }
    }
  }
  return out;
}

/**
 * Filter helper — produkt patří do resolved kategorie?
 *   child: exact match na categoryId nebo prefix (child-X)
 *   sub:   exact match nebo prefix (sub-X, sub-Y)
 *   top:   match na cokoliv z getCategorySubIds (deep)
 */
export function productInResolvedCategory(
  resolved: ResolvedCategory,
  productCategoryId: string,
): boolean {
  if (resolved.child) {
    return (
      productCategoryId === resolved.child.id ||
      productCategoryId.startsWith(resolved.child.id + "-")
    );
  }
  if (resolved.sub) {
    return (
      productCategoryId === resolved.sub.id ||
      productCategoryId.startsWith(resolved.sub.id + "-")
    );
  }
  // top — match na top.id sám (např. produkt s categoryId="doplnky" co nemá sub)
  // NEBO na cokoliv co je rekurzivně pod top
  if (productCategoryId === resolved.top.id) return true;
  for (const sub of resolved.top.subcategories) {
    if (productCategoryId === sub.id) return true;
    if (productCategoryId.startsWith(sub.id + "-")) return true;
    for (const child of sub.children ?? []) {
      if (productCategoryId === child.id) return true;
    }
  }
  return false;
}
