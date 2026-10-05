import { getShopProducts } from "@/lib/shop/get-products";
import { categories, BRANDS } from "@/data/categories";
import type { Product } from "@/data/products";

/**
 * Produktový feed pro Meta Commerce Manager (Instagram Shopping + Facebook Shops).
 *
 * Formát: RSS 2.0 s namespace `g:` — tedy totéž schéma, které žere i Google
 * Merchant Center. Jeden feed proto obslouží oboje; až budeme chtít Google
 * Shopping, stačí vložit stejnou URL.
 *
 * Proč zvlášť a ne úprava heureka.xml: Heureka má vlastní schéma (SHOPITEM,
 * PRICE_VAT, CATEGORYTEXT) a Meta ho nepřečte. Data ale tečou ze stejného
 * zdroje — getShopProducts (statický katalog + supplier_products), takže se
 * oba feedy nemůžou rozejít.
 *
 * Varianty (velikost/barva) jdou do feedu jako samostatné položky se sdíleným
 * `item_group_id`, aby je Meta seskupila pod jeden produkt.
 *
 * Servírováno na /meta-feed.xml, ISR 1 h (stejně jako Heureka, kvůli egressu —
 * viz pravidlo o sdílené cache nad list dotazy).
 */
export const revalidate = 3600;

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.100dola.com";

const brandName = (slug: string): string =>
  BRANDS.find((b) => b.id === slug)?.name ?? slug;

/** categoryId → "Doplňky > Trenažéry > Chytré trenažéry" (Meta chce " > "). */
function buildCategoryIndex(): Map<string, string> {
  const map = new Map<string, string>();
  for (const top of categories) {
    map.set(top.id, top.name);
    for (const sub of top.subcategories) {
      map.set(sub.id, `${top.name} > ${sub.name}`);
      for (const child of sub.children ?? []) {
        map.set(child.id, `${top.name} > ${sub.name} > ${child.name}`);
      }
    }
  }
  return map;
}
const CATEGORY_INDEX = buildCategoryIndex();
const categoryPath = (id: string): string => CATEGORY_INDEX.get(id) ?? "Sport";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}
function absImg(photo: string | undefined): string {
  if (!photo) return "";
  if (photo.startsWith("http")) return photo;
  return `${BASE_URL}${photo.startsWith("/") ? "" : "/"}${photo}`;
}

interface Entry {
  id: string;
  groupId?: string;
  title: string;
  description: string;
  link: string;
  image: string;
  gallery: string[];
  price: number;
  brand: string;
  category: string;
  availability: "in stock" | "available for order";
  size?: string;
  color?: string;
  mpn?: string;
}

function renderEntry(e: Entry): string {
  const l: string[] = ["  <item>"];
  l.push(`    <g:id>${esc(e.id)}</g:id>`);
  if (e.groupId) l.push(`    <g:item_group_id>${esc(e.groupId)}</g:item_group_id>`);
  // Meta omezuje title na 150 znaků, description na 9 999
  l.push(`    <g:title>${esc(e.title.slice(0, 150))}</g:title>`);
  l.push(`    <g:description>${esc(e.description.slice(0, 5000))}</g:description>`);
  l.push(`    <g:link>${esc(e.link)}</g:link>`);
  if (e.image) l.push(`    <g:image_link>${esc(e.image)}</g:image_link>`);
  for (const g of e.gallery) l.push(`    <g:additional_image_link>${esc(g)}</g:additional_image_link>`);
  l.push(`    <g:availability>${e.availability}</g:availability>`);
  l.push(`    <g:condition>new</g:condition>`);
  l.push(`    <g:price>${e.price} CZK</g:price>`);
  l.push(`    <g:brand>${esc(e.brand)}</g:brand>`);
  l.push(`    <g:product_type>${esc(e.category)}</g:product_type>`);
  if (e.mpn) l.push(`    <g:mpn>${esc(e.mpn)}</g:mpn>`);
  if (e.size) l.push(`    <g:size>${esc(e.size)}</g:size>`);
  if (e.color) l.push(`    <g:color>${esc(e.color)}</g:color>`);
  l.push("  </item>");
  return l.join("\n");
}

function entriesForProduct(p: Product): string[] {
  const price = Math.round(p.priceWithVat);
  if (!price || price <= 0) return []; // bez ceny Meta položku odmítne

  const link = `${BASE_URL}/shop/${p.slug}`;
  const image = absImg(p.photo);
  if (!image) return []; // bez obrázku taky — radši vynechat než mít feed s chybami

  const description = stripHtml(p.note || "") || p.name;
  const category = categoryPath(p.categoryId);
  const brand = brandName(p.brand);
  const gallery = (p.gallery ?? []).map(absImg).filter(Boolean).slice(0, 10);

  const variants = (p.variants ?? []).filter((v) => v.sku);
  if (variants.length > 0) {
    return variants.map((v) =>
      renderEntry({
        id: v.sku as string,
        groupId: String(p.id),
        title: `${p.name}${v.size ? ` – ${v.size}` : ""}${v.color ? ` ${v.color}` : ""}`,
        description,
        link: `${link}?varianta=${encodeURIComponent(v.sku as string)}`,
        image,
        gallery,
        price,
        brand,
        category,
        availability: v.isInStock ? "in stock" : "available for order",
        size: v.size,
        color: v.color,
        mpn: v.sku,
      }),
    );
  }

  return [
    renderEntry({
      id: String(p.id),
      title: p.name,
      description,
      link,
      image,
      gallery,
      price,
      brand,
      category,
      availability: p.stockStatus === "on_request" ? "available for order" : "in stock",
    }),
  ];
}

export async function GET(): Promise<Response> {
  let products: Product[] = [];
  try {
    products = await getShopProducts();
  } catch {
    products = [];
  }

  const items = products
    .filter((p) => !p.hasConfigurator) // konfigurovatelná kola mají cenu až po konfiguraci
    .flatMap(entriesForProduct);

  const xml =
    `<?xml version="1.0" encoding="utf-8"?>\n` +
    `<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n` +
    `<channel>\n` +
    `  <title>100dola sport — produktový katalog</title>\n` +
    `  <link>${BASE_URL}</link>\n` +
    `  <description>Kola, komponenty a doplňky 100dola sport</description>\n` +
    `${items.join("\n")}\n` +
    `</channel>\n</rss>\n`;

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
