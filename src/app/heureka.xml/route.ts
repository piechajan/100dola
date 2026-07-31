import { getShopProducts } from "@/lib/shop/get-products";
import { categories, BRANDS } from "@/data/categories";
import type { Product } from "@/data/products";

/**
 * Heureka „Ověřeno zákazníky" / porovnávač — produktový XML feed.
 *
 * Dynamicky generováno z živého katalogu (getShopProducts = static PRODUCTS +
 * supplier_products), takže nové produkty i položky z dodavatelských feedů se
 * propisují samy. Varianta (velikost/barva) = samostatný SHOPITEM se sdíleným
 * ITEMGROUP_ID. Ceny jsou už s DPH (priceWithVat).
 *
 * Servírováno na /heureka.xml, ISR 1 h.
 */
export const revalidate = 3600;

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.100dola.com";

// ── Pomocníci ────────────────────────────────────────────────────────────────

const brandName = (slug: string): string =>
  BRANDS.find((b) => b.id === slug)?.name ?? slug;

// categoryId → "Kola | Silniční | Aero" (Heureka CATEGORYTEXT používá " | ")
function buildCategoryIndex(): Map<string, string> {
  const map = new Map<string, string>();
  for (const top of categories) {
    map.set(top.id, top.name);
    for (const sub of top.subcategories) {
      map.set(sub.id, `${top.name} | ${sub.name}`);
      for (const child of sub.children ?? []) {
        map.set(child.id, `${top.name} | ${sub.name} | ${child.name}`);
      }
    }
  }
  return map;
}
const CATEGORY_INDEX = buildCategoryIndex();
const categoryText = (id: string): string => CATEGORY_INDEX.get(id) ?? "Sport";

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function cdata(s: string): string {
  return `<![CDATA[${s.replace(/\]\]>/g, "]]&gt;")}]]>`;
}
function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}
function absImg(photo: string | undefined): string {
  if (!photo) return "";
  if (photo.startsWith("http")) return photo;
  return `${BASE_URL}${photo.startsWith("/") ? "" : "/"}${photo}`;
}

interface ItemFields {
  itemId: string;
  groupId?: string;
  name: string;
  product: string;
  desc: string;
  url: string;
  img: string;
  galleryImgs: string[];
  price: number;
  manuf: string;
  cat: string;
  productNo?: string;
  delivery: number;
  params: Array<{ name: string; val: string }>;
}

function renderItem(f: ItemFields): string {
  const lines: string[] = ["  <SHOPITEM>"];
  lines.push(`    <ITEM_ID>${esc(f.itemId)}</ITEM_ID>`);
  if (f.groupId) lines.push(`    <ITEMGROUP_ID>${esc(f.groupId)}</ITEMGROUP_ID>`);
  lines.push(`    <PRODUCTNAME>${esc(f.name)}</PRODUCTNAME>`);
  lines.push(`    <PRODUCT>${esc(f.product)}</PRODUCT>`);
  lines.push(`    <DESCRIPTION>${cdata(f.desc)}</DESCRIPTION>`);
  lines.push(`    <URL>${esc(f.url)}</URL>`);
  if (f.img) lines.push(`    <IMGURL>${esc(f.img)}</IMGURL>`);
  for (const g of f.galleryImgs) lines.push(`    <IMGURL_ALTERNATIVE>${esc(g)}</IMGURL_ALTERNATIVE>`);
  lines.push(`    <PRICE_VAT>${f.price}</PRICE_VAT>`);
  lines.push(`    <MANUFACTURER>${esc(f.manuf)}</MANUFACTURER>`);
  lines.push(`    <CATEGORYTEXT>${esc(f.cat)}</CATEGORYTEXT>`);
  if (f.productNo) lines.push(`    <PRODUCTNO>${esc(f.productNo)}</PRODUCTNO>`);
  lines.push(`    <DELIVERY_DATE>${f.delivery}</DELIVERY_DATE>`);
  for (const p of f.params) {
    lines.push("    <PARAM>");
    lines.push(`      <PARAM_NAME>${esc(p.name)}</PARAM_NAME>`);
    lines.push(`      <VAL>${esc(p.val)}</VAL>`);
    lines.push("    </PARAM>");
  }
  lines.push("  </SHOPITEM>");
  return lines.join("\n");
}

function itemsForProduct(p: Product): string[] {
  const price = Math.round(p.priceWithVat);
  if (!price || price <= 0) return []; // bez ceny do feedu nepatří

  const url = `${BASE_URL}/shop/${p.slug}`;
  const img = absImg(p.photo);
  const desc = (stripHtml(p.note || "").slice(0, 3000)) || p.name;
  const cat = categoryText(p.categoryId);
  const manuf = brandName(p.brand);
  const galleryImgs = (p.gallery ?? []).map(absImg).filter(Boolean).slice(0, 5);

  const variants = (p.variants ?? []).filter((v) => v.sku);
  if (variants.length > 0) {
    return variants.map((v) =>
      renderItem({
        itemId: v.sku as string,
        groupId: String(p.id),
        name: `${p.name}${v.size ? ` – ${v.size}` : ""}${v.color ? ` ${v.color}` : ""}`,
        product: p.name,
        desc,
        url,
        img,
        galleryImgs,
        price,
        manuf,
        cat,
        productNo: v.sku,
        delivery: v.isInStock ? 0 : 14,
        params: [
          ...(v.size ? [{ name: "Velikost", val: v.size }] : []),
          ...(v.color ? [{ name: "Barva", val: v.color }] : []),
        ],
      }),
    );
  }

  return [
    renderItem({
      itemId: String(p.id),
      name: p.name,
      product: p.name,
      desc,
      url,
      img,
      galleryImgs,
      price,
      manuf,
      cat,
      delivery: p.stockStatus === "in_stock" ? 0 : 14,
      params: [],
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
    .filter((p) => !p.hasConfigurator) // konfigurovatelná kola zatím ne (base-aware delta se řeší zvlášť)
    .flatMap(itemsForProduct);

  const xml =
    `<?xml version="1.0" encoding="utf-8"?>\n<SHOP>\n${items.join("\n")}\n</SHOP>\n`;

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
