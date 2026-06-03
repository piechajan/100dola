/**
 * Schema.org JSON-LD helpers — vrací plain objekty pro dangerouslySetInnerHTML.
 * Bez serveru, čistá data transformace.
 */

const SITE_URL = "https://www.100dola.com";

export interface BreadcrumbItem {
  name: string;
  url?: string;
}

/**
 * BreadcrumbList schema.
 * Pro PDP: ['E-shop', 'Kola', 'Silniční', '<product name>']
 * Pro kategorii: ['E-shop', 'Kola', 'Silniční']
 */
export function breadcrumbSchema(items: BreadcrumbItem[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      ...(item.url ? { item: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}` } : {}),
    })),
  };
}

export interface FaqItem {
  question: string;
  answer: string;
}

/**
 * FAQPage schema — pro stránky s často kladenými otázkami.
 * Google rich result: rozšířený SERP s rozbalovacími otázkami.
 */
export function faqPageSchema(items: FaqItem[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.answer,
      },
    })),
  };
}

/**
 * Article / BlogPosting schema pro blog posts.
 */
export interface ArticleSchemaInput {
  url: string;
  title: string;
  description: string;
  image?: string;
  publishedAt: string; // ISO
  updatedAt?: string; // ISO
  authorName?: string;
}

export function articleSchema(input: ArticleSchemaInput): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": input.url.startsWith("http") ? input.url : `${SITE_URL}${input.url}`,
    },
    headline: input.title,
    description: input.description,
    ...(input.image ? { image: [input.image] } : {}),
    datePublished: input.publishedAt,
    ...(input.updatedAt ? { dateModified: input.updatedAt } : {}),
    author: {
      "@type": "Person",
      name: input.authorName ?? "Jan Piecha",
    },
    publisher: {
      "@type": "Organization",
      name: "100dola sport",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo-nav.png`,
      },
    },
  };
}

/**
 * ItemList schema pro kategoriální listing.
 * Pomáhá Googlu pochopit, že stránka je seznam produktů ne tuctů blog článků.
 */
export interface ItemListInput {
  name: string;
  description: string;
  items: Array<{ url: string; name: string; position?: number }>;
}

export function itemListSchema(input: ItemListInput): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: input.name,
    description: input.description,
    numberOfItems: input.items.length,
    itemListElement: input.items.slice(0, 30).map((item, i) => ({
      "@type": "ListItem",
      position: item.position ?? i + 1,
      url: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
      name: item.name,
    })),
  };
}

/**
 * Wrap object → safe JSON-LD string pro dangerouslySetInnerHTML.
 */
export function jsonLdString(schema: Record<string, unknown>): string {
  return JSON.stringify(schema).replace(/</g, "\\u003c");
}
