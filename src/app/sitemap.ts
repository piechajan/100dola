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
    "/community",
    "/o-nas",
    "/shop",
  ];

  return routes.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified,
    changeFrequency: path.startsWith("/malaga") ? "weekly" : "monthly",
    priority: path === "/malaga" ? 0.9 : path.startsWith("/malaga") ? 0.8 : 0.6,
  }));
}
