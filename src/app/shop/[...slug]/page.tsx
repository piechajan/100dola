import type { Metadata } from "next";
import Image from "next/image";
import { isProxiedImage } from "@/lib/shop/image-utils";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ShopLayout from "@/components/shop/ShopLayout";
import AddToCartButton from "@/components/shop/AddToCartButton";
import ProductViewTracker from "@/components/shop/ProductViewTracker";
import PDPGallery from "@/components/shop/PDPGallery";
import ConfiguratorUI from "@/components/shop/ConfiguratorUI";
import WishlistButton from "@/components/shop/WishlistButton";
import RecentlyViewedSection from "@/components/shop/RecentlyViewedSection";
import VariantSelector from "@/components/shop/VariantSelector";
import MobileStickyCTA from "@/components/shop/MobileStickyCTA";
import ReviewsSection from "@/components/shop/ReviewsSection";
import Stars from "@/components/shop/Stars";
import { getReviewAggregate, getPublicReviews } from "@/lib/shop/reviews";
import { PRODUCTS, splitVat, formatPrice, type Product } from "@/data/products";
import { getProductBySlugMerged, getShopProducts } from "@/lib/shop/get-products";
import {
  resolveCategoryPath,
  getAllCategoryPaths,
  productInResolvedCategory,
} from "@/lib/shop/category-resolver";
import { recommendForProduct } from "@/lib/shop/recommendations";
import { breadcrumbSchema, itemListSchema, jsonLdString } from "@/lib/seo/schema-helpers";
import { categories } from "@/data/categories";
import { colorToFamily } from "@/lib/shop/colors";

export const dynamicParams = true;
export const revalidate = 3600;

export function generateStaticParams() {
  const products = PRODUCTS.map((p) => ({ slug: [p.slug] }));
  const cats = getAllCategoryPaths().map((slugs) => ({ slug: slugs }));
  return [...products, ...cats];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (slug.length === 1) {
    const product = await getProductBySlugMerged(slug[0]);
    if (product) {
      return {
        title: `${product.name}${product.year ? ` ${product.year}` : ""} — 100dola sport`,
        description: product.note || `${product.name} — ${product.specs.slice(0, 2).join(", ")}`,
        openGraph: {
          title: product.name,
          description: product.note,
          images: [product.photo],
        },
        alternates: { canonical: `/shop/${slug[0]}` },
      };
    }
  }
  const resolved = resolveCategoryPath(slug);
  if (resolved) {
    return {
      title: `${resolved.title} — 100dola sport`,
      description: resolved.description,
      alternates: { canonical: `/shop/${resolved.pathSlugs.join("/")}` },
    };
  }
  return {};
}


export default async function ShopCatchAllPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;

  if (slug.length === 1) {
    const all = await getShopProducts();
    const product = all.find((p) => p.slug === slug[0]);
    if (product) {
      const [aggregate, reviews] = await Promise.all([
        getReviewAggregate(product.slug),
        getPublicReviews(product.slug, 20),
      ]);
      return renderProduct(product, all, aggregate, reviews);
    }
  }

  const resolved = resolveCategoryPath(slug);
  if (!resolved) notFound();

  const all = await getShopProducts();
  const inCategory = all.filter((p) => productInResolvedCategory(resolved, p.categoryId));

  // Schema.org BreadcrumbList + ItemList pro category page
  const breadcrumbs = [
    { name: "E-shop", url: "/shop" },
    ...resolved.pathSlugs.map((slugId, i) => {
      const partialPath = resolved.pathSlugs.slice(0, i + 1).join("/");
      const name =
        i === 0
          ? categories.find((c) => c.id === slugId)?.name ?? slugId
          : i === 1
            ? categories
                .find((c) => c.id === resolved.pathSlugs[0])
                ?.subcategories.find((s) => s.id === slugId)?.name ?? slugId
            : categories
                .find((c) => c.id === resolved.pathSlugs[0])
                ?.subcategories.find((s) => s.id === resolved.pathSlugs[1])
                ?.children?.find((c) => c.id === slugId)?.name ?? slugId;
      return { name, url: `/shop/${partialPath}` };
    }),
  ];
  const breadcrumbLd = breadcrumbSchema(breadcrumbs);
  const itemListLd = itemListSchema({
    name: resolved.title,
    description: resolved.description,
    items: inCategory.slice(0, 30).map((p) => ({
      url: `/shop/${p.slug}`,
      name: p.name,
    })),
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(itemListLd) }} />
      <Navbar />
      <main className="pt-20">
        <ShopLayout
          products={all}
          initialCategoryId={resolved.top.id}
          initialSubId={resolved.sub?.id ?? resolved.child?.id ?? null}
          heading={{
            title: resolved.title,
            description: resolved.description,
            pathSlugs: resolved.pathSlugs,
            count: inCategory.length,
          }}
        />
      </main>
      <Footer />
    </>
  );
}

function renderProduct(
  product: Product,
  all: Product[],
  aggregate: Awaited<ReturnType<typeof getReviewAggregate>> = null,
  reviews: Awaited<ReturnType<typeof getPublicReviews>> = [],
) {
  const { withoutVat, vatAmount } = splitVat(product.priceWithVat, product.vatRate);
  // Rule-based + synergy mapping. Behavioral pipeline později.
  const related = recommendForProduct(product, all, 4);

  // Schema.org Product + AggregateRating + rozšířené Offer
  // Availability: InStock pokud aspoň 1 variant in_stock, jinak PreOrder
  const anyInStock = (product.variants ?? []).some((v) => v.isInStock);
  const availability = anyInStock
    ? "https://schema.org/InStock"
    : product.fulfillment === "supplier"
      ? "https://schema.org/PreOrder"
      : "https://schema.org/InStock";

  const images = product.gallery && product.gallery.length > 0 ? product.gallery : [product.photo];

  const baseSchema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: images,
    description: product.note || `${product.name} — ${product.specs.slice(0, 3).join(", ")}`,
    brand: { "@type": "Brand", name: product.brand },
    sku: product.supplierProductId ?? `own-${product.id}`,
    offers: {
      "@type": "Offer",
      priceCurrency: "CZK",
      price: product.priceWithVat,
      priceValidUntil: new Date(Date.now() + 90 * 24 * 3600 * 1000).toISOString().split("T")[0],
      availability,
      itemCondition: "https://schema.org/NewCondition",
      url: `https://www.100dola.com/shop/${product.slug}`,
      seller: {
        "@type": "Organization",
        name: "100dola sport",
        url: "https://www.100dola.com",
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "CZ",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 14,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn",
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: product.bulky ? 400 : 100,
          currency: "CZK",
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "CZ",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          businessDays: {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          },
          handlingTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 2, unitCode: "DAY" },
          transitTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 3, unitCode: "DAY" },
        },
      },
    },
  };
  if (aggregate && aggregate.rating_count > 0 && aggregate.rating_avg !== null) {
    baseSchema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: Number(aggregate.rating_avg),
      reviewCount: aggregate.rating_count,
      bestRating: 5,
      worstRating: 1,
    };
  }
  const productJsonLd = baseSchema;

  // BreadcrumbList pro PDP: E-shop / <product name>
  // (kategorie path není u supplier produktů spolehlivě dostupný, takže
  //  použijeme jednoduchý 2-level breadcrumb)
  const pdpBreadcrumbLd = breadcrumbSchema([
    { name: "E-shop", url: "/shop" },
    { name: product.name },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(pdpBreadcrumbLd) }}
      />
      <ProductViewTracker
        slug={product.slug}
        name={product.name}
        priceWithVat={product.priceWithVat}
        id={product.id}
        brand={product.brand}
        photo={product.photo}
      />
      <Navbar />
      <main className="pt-20 bg-[#FAFAFA]">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12 pt-8">
          <div className="flex items-center gap-2 text-xs text-[#9AA3C2]">
            <Link href="/shop" className="hover:text-[#3B7CF4]">E-shop</Link>
            <span>/</span>
            <span className="text-[#5A6480]">{product.name}</span>
          </div>
        </div>

        <section className="max-w-[1200px] mx-auto px-6 md:px-12 py-10 md:py-14">
          <div className="grid lg:grid-cols-[1fr_440px] gap-10 md:gap-12">
            <PDPGallery
              mainPhoto={product.photo}
              gallery={product.gallery}
              alt={product.name}
              badges={product.badges}
            />

            <div>
              <div className="flex items-start justify-between gap-3">
                <Link
                  href={`/shop?brand=${encodeURIComponent(product.brand)}`}
                  className="inline-block text-xs text-[#9AA3C2] uppercase tracking-wider mb-2 hover:text-[#1a1a2e] transition-colors"
                >
                  {product.brand}
                </Link>
                <WishlistButton
                  size="large"
                  item={{
                    id: product.id,
                    slug: product.slug,
                    name: product.name,
                    brand: product.brand,
                    priceWithVat: product.priceWithVat,
                    photo: product.photo,
                  }}
                />
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-[#1a1a2e] leading-tight">
                {product.name}
                {product.year && (
                  <span className="text-[#9AA3C2] font-medium ml-2">{product.year}</span>
                )}
              </h1>

              {aggregate && aggregate.rating_count > 0 && (
                <a href="#reviews" className="mt-2 inline-flex items-center gap-2 hover:opacity-80">
                  <Stars value={Number(aggregate.rating_avg ?? 0)} size="small" />
                  <span className="text-xs font-bold text-[#1a1a2e]">
                    {Number(aggregate.rating_avg ?? 0).toFixed(1)}
                  </span>
                  <span className="text-xs text-[#9AA3C2]">
                    ({aggregate.rating_count}{" "}
                    {aggregate.rating_count === 1 ? "recenze" : aggregate.rating_count < 5 ? "recenze" : "recenzí"})
                  </span>
                </a>
              )}

              {product.color && (() => {
                const fam = colorToFamily(product.color);
                const isGrad = fam?.hex.startsWith("linear-gradient");
                return (
                  <div className="mt-3 flex items-center gap-2.5">
                    <span className="text-[10px] uppercase tracking-wider text-[#9AA3C2] font-bold">
                      Barva:
                    </span>
                    <span
                      className="inline-block w-5 h-5 rounded-full border border-[#E2E6F3] shrink-0"
                      style={fam && isGrad ? { background: fam.hex } : { backgroundColor: fam?.hex ?? "#9AA3C2" }}
                      aria-hidden="true"
                    />
                    <span className="text-sm font-semibold text-[#1a1a2e] capitalize">
                      {product.color}
                    </span>
                  </div>
                );
              })()}

              {product.note && (
                <p className="mt-4 text-sm italic text-[#E8431A] font-medium">{product.note}</p>
              )}

              <div className="mt-6 pb-6 border-b border-[#E2E6F3]">
                {product.originalPriceWithVat && (
                  <div className="text-sm text-[#9A9A9A] line-through mb-1">
                    {formatPrice(product.originalPriceWithVat)}
                  </div>
                )}
                <div className="flex items-baseline gap-3">
                  <span
                    className={`text-3xl md:text-4xl font-black ${product.originalPriceWithVat ? "text-[#E8431A]" : "text-[#1a1a2e]"}`}
                  >
                    {formatPrice(product.priceWithVat)}
                  </span>
                  <span className="text-xs text-[#9AA3C2]">vč. DPH</span>
                </div>
                <div className="text-[11px] text-[#9AA3C2] mt-1.5">
                  DPH {product.vatRate} %: {formatPrice(vatAmount)} · Cena bez DPH: {formatPrice(withoutVat)}
                </div>
              </div>

              {product.specs.length > 0 && (
                <ul className="mt-6 space-y-2">
                  {product.specs.map((s) => (
                    <li key={s} className="flex items-start gap-2 text-sm text-[#5A6480]">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#3B7CF4] shrink-0" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              )}

              {!product.hasConfigurator && <VariantSelector product={product} />}

              <div className="mt-8">
                {product.hasConfigurator && product.configuratorSchema ? (
                  <ConfiguratorUI product={product} schema={product.configuratorSchema} />
                ) : (
                  <AddToCartButton product={product} large />
                )}
              </div>

              <div className="mt-6 space-y-2">
                {product.bulky && (
                  <div className="rounded-xl p-3 text-xs bg-[#FFF7ED] text-[#7A5615] border border-[#FBD38D]">
                    <strong>Velký balík.</strong> Doprava 400 Kč. Osobní vyzvednutí (Šternberk / Olomouc / Valašské Meziříčí) zdarma.
                  </div>
                )}
                {product.fulfillment === "supplier" ? (
                  <div className="rounded-xl p-3 text-xs bg-[#F0F4FF] text-[#1a1a2e] border border-[#D6E1FB]">
                    <strong>Objednáváme od dodavatele.</strong> Dodání obvykle 5-10 pracovních dnů. Přesný termín potvrdíme po objednávce.
                  </div>
                ) : (
                  <div className="rounded-xl p-3 text-xs bg-[#F0F4FF] text-[#1a1a2e] border border-[#D6E1FB]">
                    <strong>Skladem na Šternberku.</strong> Termín expedice potvrdíme po objednávce (obvykle do týdne).
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <div id="reviews">
          <ReviewsSection
            productSlug={product.slug}
            productName={product.name}
            aggregate={aggregate}
            reviews={reviews}
          />
        </div>

        <RecentlyViewedSection excludeId={product.id} />

        <MobileStickyCTA product={product} />

        {related.length > 0 && (
          <section className="bg-white py-12 md:py-16 border-t border-[#E2E6F3]">
            <div className="max-w-[1200px] mx-auto px-6 md:px-12">
              <div className="mb-8">
                <div className="text-xs tracking-[0.22em] uppercase font-bold text-[#3B7CF4] mb-2">
                  Hodilo by se k tomu
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e]">Podobné produkty</h2>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {related.map((p) => (
                  <Link
                    key={p.id}
                    href={`/shop/${p.slug}`}
                    className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-[#E2E6F3] hover:border-[#3B7CF4]/40 hover:shadow-lg transition-all"
                  >
                    <div className="relative aspect-[4/3] bg-white">
                      <Image
                        src={p.photo}
                        alt={p.name}
                        fill
                        className="object-contain p-4"
                        sizes="33vw"
                        unoptimized={isProxiedImage(p.photo)}
                      />
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <div className="text-sm font-bold text-[#1a1a2e] leading-tight">{p.name}</div>
                      {p.note && (
                        <div className="text-[11px] text-[#E8431A] italic mt-1">{p.note}</div>
                      )}
                      <div className="text-base font-black text-[#1a1a2e] mt-auto pt-3">
                        {formatPrice(p.priceWithVat)}
                      </div>
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
