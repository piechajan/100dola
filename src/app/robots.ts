import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.100dola.com";

// Zakázané cesty (admin, přihlášení, API, checkout) — platí pro všechny.
const DISALLOW = ["/admin", "/login", "/login-ucetni", "/api/", "/objednavka/"];

// AI vyhledávače a asistenti — explicitně vítáni (roste podíl lidí hledajících
// přes ChatGPT / Perplexity / Claude / Google AI Overviews místo klasického
// vyhledávání). `*` je sice povoluje taky, ale explicitní pravidla to dělají
// jednoznačným a odolným vůči budoucímu zpřísnění `*`. Mapu webu jim dává
// /llms.txt + sitemap.xml.
const AI_BOTS = [
  "GPTBot", // OpenAI training
  "OAI-SearchBot", // ChatGPT Search
  "ChatGPT-User", // ChatGPT browsing on user request
  "ClaudeBot", // Anthropic
  "Claude-Web",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended", // Gemini / AI Overviews
  "Applebot-Extended",
  "Bytespider",
  "CCBot", // Common Crawl (podklad mnoha LLM)
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: DISALLOW,
      },
      {
        userAgent: AI_BOTS,
        allow: "/",
        disallow: DISALLOW,
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
