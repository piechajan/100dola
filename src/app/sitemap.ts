import type { MetadataRoute } from "next";
import { PRODUCTS } from "@/data/products";
import { events } from "@/data/events";
import { ARTICLES } from "@/data/articles";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.100dola.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticRoutes = [
    "",
    "/malaga",
    "/malaga/preprava",
    "/malaga/uskladneni",
    "/malaga/balicky",
    "/lab",
    "/community",
    "/community/o-klinice",
    "/o-nas",
    "/shop",
    "/sport",
    "/sport/cyklistika",
    "/sport/beh",
    "/sport/turistika",
    "/sport/zima",
    "/sport/obleceni",
    "/sport/obuv",
    "/sport/helmy",
    "/sport/vyziva",
    "/sport/vybaveni",
    "/sport/elektronika",
    "/sport/kolekce",
    "/isaac-test",
    "/isaac-test/podminky",
    "/clanky",
    "/kontakt",
    "/obchodni-podminky",
    "/ochrana-osobnich-udaju",
    "/zasady-cookies",
  ];

  const productRoutes = PRODUCTS.map((p) => `/shop/${p.slug}`);
  const eventRoutes = events
    .filter((e) => !e.externalUrl)
    .map((e) => `/community/event/${e.slug}`);
  const articleRoutes = ARTICLES.filter((a) => a.status === "published").map(
    (a) => `/clanky/${a.slug}`,
  );

  const allRoutes = [...staticRoutes, ...productRoutes, ...eventRoutes, ...articleRoutes];

  return allRoutes.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified,
    changeFrequency:
      path.startsWith("/malaga") || path === "/lab" || path === "/isaac-test"
        ? "weekly"
        : "monthly",
    priority:
      path === "" || path === "/isaac-test"
        ? 1.0
        : path === "/malaga" || path === "/lab" || path === "/community"
          ? 0.9
          : path.startsWith("/malaga") || path.startsWith("/sport") || path.startsWith("/shop/")
            ? 0.7
            : 0.6,
  }));
}
