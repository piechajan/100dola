import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://100dolamalaga.cz";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const routes = [
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
    "/zasady-cookies",
  ];

  return routes.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified,
    changeFrequency:
      path.startsWith("/malaga") || path === "/lab" ? "weekly" : "monthly",
    priority:
      path === "/malaga" || path === "/lab"
        ? 0.9
        : path.startsWith("/malaga")
          ? 0.8
          : 0.6,
  }));
}
