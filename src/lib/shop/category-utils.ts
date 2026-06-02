import type { TopCategory, SubCategory } from "@/data/categories";

/** Sbírá rekurzivně všechny sub IDs (sub + jeho children). */
export function getAllSubIds(sub: SubCategory): string[] {
  if (!sub.children || sub.children.length === 0) return [sub.id];
  return [sub.id, ...sub.children.flatMap(getAllSubIds)];
}

/** Sbírá všechny sub IDs pro top kategorii (hluboce). */
export function getCategorySubIds(cat: TopCategory): string[] {
  return cat.subcategories.flatMap(getAllSubIds);
}

/** Lokalizovaný plural pro „produkt". */
export function productLabel(n: number): string {
  if (n === 1) return "produkt";
  if (n >= 2 && n <= 4) return "produkty";
  return "produktů";
}
