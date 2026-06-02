import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ShopLayout from "@/components/shop/ShopLayout";
import AddToCartButton from "@/components/shop/AddToCartButton";
import ProductViewTracker from "@/components/shop/ProductViewTracker";
import PDPGallery from "@/components/shop/PDPGallery";
import { PRODUCTS, splitVat, formatPrice, type Product } from "@/data/products";
import { getProductBySlugMerged, getShopProducts } from "@/lib/shop/get-products";
import {
  resolveCategoryPath,
  getAllCategoryPaths,
  productInResolvedCategory,
} from "@/lib/shop/category-resolver";

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
    if (product) return renderProduct(product, all);
  }

  const resolved = resolveCategoryPath(slug);
  if (!resolved) notFound();

  const all = await getShopProducts();
  const inCategory = all.filter((p) => productInResolvedCategory(resolved, p.categoryId));

  return (
    <>
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

function renderProduct(product: Product, all: Product[]) {
  const { withoutVat, vatAmount } = splitVat(product.priceWithVat, product.vatRate);
  const related = all
    .filter((p) => p.id !== product.id && p.categoryId === product.categoryId)
    .slice(0, 3);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.photo,
    description: product.note,
    brand: { "@type": "Brand", name: product.brand },
    offers: {
      "@type": "Offer",
      priceCurrency: "CZK",
      price: product.priceWithVat,
      availability: "https://schema.org/PreOrder",
      url: `https://www.100dola.com/shop/${product.slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <ProductViewTracker
        slug={product.slug}
        name={product.name}
        priceWithVat={product.priceWithVat}
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
              <Link
                href={`/shop?brand=${encodeURIComponent(product.brand)}`}
                className="inline-block text-xs text-[#9AA3C2] uppercase tracking-wider mb-2 hover:text-[#1a1a2e] transition-colors"
              >
                {product.brand}
              </Link>
              <h1 className="text-3xl md:text-4xl font-black text-[#1a1a2e] leading-tight">
                {product.name}
                {product.year && (
                  <span className="text-[#9AA3C2] font-medium ml-2">{product.year}</span>
                )}
              </h1>

              {product.color && (
                <div className="mt-2 flex items-center gap-2 text-sm text-[#5A6480]">
                  <span className="text-xs uppercase tracking-wider text-[#9AA3C2] font-bold">Barva:</span>
                  <span className="font-semibold capitalize">{product.color}</span>
                </div>
              )}

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

              <div className="mt-8">
                {product.hasConfigurator ? (
                  <div className="rounded-2xl border-2 border-dashed border-[#3B7CF4]/30 p-5 bg-[#F0F4FF]">
                    <div className="text-[10px] uppercase tracking-wider font-bold text-[#3B7CF4] mb-2">
                      Custom kolo
                    </div>
                    <h3 className="text-base font-black text-[#1a1a2e] mb-1">
                      Sestav si kolo na míru
                    </h3>
                    <p className="text-xs text-[#5A6480] leading-relaxed mb-4">
                      Vyber si sadu, výplety, kohouty a další komponenty. Cena se aktualizuje
                      podle volby. Configurator připravujeme — zatím se ozvi a poradíme přímo.
                    </p>
                    <a
                      href="mailto:piecha.jan@gmail.com?subject=Konfigurace%20kola%20-%20"
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#1a1a2e] text-white text-sm font-bold hover:opacity-90 transition-opacity"
                    >
                      Domluvit konfiguraci
                    </a>
                    <div className="mt-3">
                      <AddToCartButton product={product} />
                    </div>
                  </div>
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
                    <strong>Skladem na Šternberku.</strong> Odesíláme do 2 pracovních dnů.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

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
