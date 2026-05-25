import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import {
  ARTICLES,
  CATEGORY_LABEL,
  CATEGORY_COLOR,
  getArticleBySlug,
  getRelatedArticles,
} from "@/data/articles";
import ZavodMiruSternberk from "@/components/articles/ZavodMiruSternberk";
import KdeKoupitKoloSternberk from "@/components/articles/KdeKoupitKoloSternberk";

const SITE = "https://www.100dola.com";

export function generateStaticParams() {
  return ARTICLES.filter((a) => a.status === "published").map((a) => ({
    slug: a.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const a = getArticleBySlug(slug);
  if (!a) return {};
  return {
    title: a.title,
    description: a.summary,
    alternates: { canonical: `/clanky/${a.slug}` },
    openGraph: {
      type: "article",
      title: a.title,
      description: a.summary,
      url: `/clanky/${a.slug}`,
      images: [{ url: a.image, width: 1200, height: 630 }],
      publishedTime: a.publishedAt,
      authors: [a.author.name],
    },
    twitter: {
      card: "summary_large_image",
      title: a.title,
      description: a.summary,
      images: [a.image],
    },
  };
}

const RENDERERS: Record<string, () => React.ReactElement> = {
  "zavod-miru-2026-sternberk": () => <ZavodMiruSternberk />,
  "kde-koupit-kolo-sternberk": () => <KdeKoupitKoloSternberk />,
  // Další články se přidají postupně:
  // "voskovani-retezu": () => <VoskovaniRetezu />,
  // "keramicka-loziska": () => <KeramickaLoziska />,
  // ...
};

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const a = getArticleBySlug(slug);
  if (!a || a.status !== "published") notFound();

  const Renderer = RENDERERS[a.slug];
  if (!Renderer) notFound();

  const color = CATEGORY_COLOR[a.category];
  const related = getRelatedArticles(a, 3);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.summary,
    image: `${SITE}${a.image}`,
    datePublished: a.publishedAt,
    dateModified: a.updatedAt || a.publishedAt,
    author: {
      "@type": "Person",
      name: a.author.name,
    },
    publisher: { "@id": `${SITE}/#organization` },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE}/clanky/${a.slug}` },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Domů", item: SITE },
      { "@type": "ListItem", position: 2, name: "Magazín", item: `${SITE}/clanky` },
      { "@type": "ListItem", position: 3, name: a.title, item: `${SITE}/clanky/${a.slug}` },
    ],
  };

  // Pro Závod Míru navíc SportsEvent JSON-LD — Google rich result
  const extraJsonLd =
    a.slug === "zavod-miru-2026-sternberk"
      ? {
          "@context": "https://schema.org",
          "@type": "SportsEvent",
          name: "Závod Míru U23 2026",
          description:
            "73. ročník mezinárodního cyklistického závodu Závod Míru U23, 28.–31. května 2026 v Olomouckém kraji. Finále neděle 31. 5. ve Šternberku.",
          startDate: "2026-05-28",
          endDate: "2026-05-31",
          eventStatus: "https://schema.org/EventScheduled",
          eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
          sport: "Cycling",
          location: [
            {
              "@type": "Place",
              name: "Šternberk (cíl finální etapy)",
              address: {
                "@type": "PostalAddress",
                streetAddress: "Radniční",
                addressLocality: "Šternberk",
                postalCode: "78501",
                addressCountry: "CZ",
              },
              geo: {
                "@type": "GeoCoordinates",
                latitude: 49.7311,
                longitude: 17.2978,
              },
            },
          ],
          organizer: {
            "@type": "Organization",
            name: "Asociace Závodu Míru",
            url: "https://zavodmiru.com",
          },
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "CZK",
            availability: "https://schema.org/InStock",
            url: `${SITE}/clanky/zavod-miru-2026-sternberk`,
          },
        }
      : null;

  return (
    <>
      <JsonLd data={articleJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      {extraJsonLd && <JsonLd data={extraJsonLd} />}
      <Navbar />
      <main className="pt-20 bg-white min-h-screen">
        {/* Hero */}
        <section className="relative aspect-[2/1] md:aspect-[3/1] bg-[#F0F2FA]">
          <Image
            src={a.image}
            alt={a.title}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 px-6 md:px-12 py-8 md:py-12 max-w-[820px] mx-auto">
            <Link
              href="/clanky"
              className="inline-flex items-center gap-1 text-xs text-white/80 hover:text-white mb-3"
            >
              ← Magazín
            </Link>
            <div
              className="inline-block text-[10px] font-bold tracking-wider uppercase px-2 py-1 rounded-full mb-3"
              style={{ backgroundColor: `${color}30`, color: "#fff", border: `1px solid ${color}80` }}
            >
              {CATEGORY_LABEL[a.category]}
            </div>
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-white leading-tight">
              {a.title}
            </h1>
            <div className="flex items-center gap-3 mt-4 text-xs md:text-sm text-white/70">
              <span>{a.author.name}{a.author.role ? ` · ${a.author.role}` : ""}</span>
              <span>·</span>
              <span>
                {new Date(a.publishedAt).toLocaleDateString("cs-CZ", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
              {a.readMinutes && (
                <>
                  <span>·</span>
                  <span>{a.readMinutes} min čtení</span>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Content */}
        <Renderer />

        {/* Related */}
        {related.length > 0 && (
          <section className="bg-[#F7F9FF] border-t border-[#E2E6F3] py-16">
            <div className="max-w-[1100px] mx-auto px-6 md:px-12">
              <h2 className="text-xl font-black text-[#1a1a2e] mb-6">Související články</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    href={r.status === "published" ? `/clanky/${r.slug}` : "/clanky"}
                    className={`flex flex-col bg-white rounded-2xl border border-[#E2E6F3] overflow-hidden hover:shadow-lg transition ${
                      r.status === "draft" ? "opacity-70" : ""
                    }`}
                  >
                    <div className="relative aspect-[16/10]">
                      <Image
                        src={r.image}
                        alt={r.title}
                        fill
                        className={`object-cover ${r.status === "draft" ? "grayscale" : ""}`}
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-black text-[#1a1a2e] leading-snug mb-2">
                        {r.title}
                      </h3>
                      <p className="text-xs text-[#9AA3C2]">
                        {r.status === "published" ? "Číst →" : "Připravujeme"}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
