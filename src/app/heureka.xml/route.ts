import { gzipSync, gunzipSync } from "node:zlib";
import { unstable_cache } from "next/cache";
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
 * Servírováno na /heureka.xml, ISR 1 h. Hotové XML (2,8 MB) je navíc v Data Cache
 * jako gzip+base64 (~0,3 MB; limit jedné položky cache je 2 MB), takže se za
 * hodinu skládá 1× globálně a feed nikdy netahá DB sám (čte sdílenou cache
 * getShopProducts).
 */
export const revalidate = 3600;
export const maxDuration = 60;

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.100dola.com";

// ── Dodací doba (DELIVERY_DATE, dny) ─────────────────────────────────────────
//
// JEDINÉ místo, kde se ladí lhůty — Jan může upravit podle skutečných dodavatelů.
// Heureka blokuje obchody s nerealistickou dodací dobou, proto NIKDY nedáváme 0
// u zboží, které nemáme fyzicky u nás. Žádné pole lead_time v DB zatím není,
// takže se řídíme (a) kdo zboží vede = fulfillment, (b) skladovostí
// (variants[].isInStock / availability / stockStatus).
// Konzistentní s texty na webu: PDP „od dodavatele 3–8 prac. dnů",
// varianty „na objednávku 5–10 dnů", VOP „3–10 prac. dnů".
const DELIVERY_DAYS = {
  /** Skladem u nás (Šternberk) — expedice do 2 dnů. */
  ownInStock: 2,
  /** Skladem u dodavatele — objednáme, dorazí k nám a odesíláme (PDP: 3–8 dnů). */
  supplierInStock: 5,
  /** Není skladem / na objednávku / stav neznámý — doba dodavatele, rozumně dlouhá. */
  onOrder: 14,
  /** Tvrdý strop (Heureka: nad 3 týdny je podezřelé). */
  max: 21,
} as const;

type StockState = "in" | "out" | "unknown";

function stockOfVariant(v: NonNullable<Product["variants"]>[number]): StockState {
  if (v.isInStock === true) return "in";
  if (v.isInStock === false) return "out";
  const a = (v.availability ?? "").toLowerCase();
  if (a.includes("skladem")) return "in";
  if (a.includes("objedn")) return "out";
  return "unknown";
}

function deliveryDays(
  p: Product,
  v?: NonNullable<Product["variants"]>[number],
): number {
  const own = (p.fulfillment ?? "own") === "own";
  let stock: StockState;
  if (v) stock = stockOfVariant(v);
  else if (own) stock = p.stockStatus === "on_request" ? "out" : "in";
  else stock = "unknown"; // supplier bez variant: sklad ve feedu neznáme → neslibujeme
  let days: number;
  if (stock === "in") days = own ? DELIVERY_DAYS.ownInStock : DELIVERY_DAYS.supplierInStock;
  else days = DELIVERY_DAYS.onOrder;
  return Math.min(days, DELIVERY_DAYS.max);
}

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
        // Heureka nedovolí 2 položky se stejnou URL → varianta dostane unikátní
        // query param (stránka produktu ho ignoruje, ale URL je unikátní).
        url: `${url}?varianta=${encodeURIComponent(v.sku as string)}`,
        img,
        galleryImgs,
        price,
        manuf,
        cat,
        productNo: v.sku,
        delivery: deliveryDays(p, v),
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
      delivery: deliveryDays(p),
      params: [],
    }),
  ];
}

async function buildFeedXml(): Promise<string> {
  // Při výpadku DB vyhodíme chybu (nechceme do cache uložit feed jen se static
  // katalogem); getShopProducts sám padá zpět na static, takže kontrolujeme výsledek.
  const products = await getShopProducts();
  if (!products.some((p) => p.fulfillment === "supplier")) {
    throw new Error("supplier catalog missing — refusing to cache degraded feed");
  }

  const seen = new Set<string>();
  const items = products
    .filter((p) => !p.hasConfigurator) // konfigurovatelná kola zatím ne (base-aware delta se řeší zvlášť)
    .flatMap(itemsForProduct)
    .filter((it) => {
      // Duplicitní ITEM_ID (stejné SKU u více produktů) — Heureka bere jen první.
      const m = it.match(/<ITEM_ID>([^<]*)<\/ITEM_ID>/);
      const id = m?.[1] ?? "";
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });

  return `<?xml version="1.0" encoding="utf-8"?>\n<SHOP>\n${items.join("\n")}\n</SHOP>\n`;
}

const getFeedGz = unstable_cache(
  async () => gzipSync(Buffer.from(await buildFeedXml(), "utf-8")).toString("base64"),
  ["heureka-feed-gz-v1"],
  { revalidate: 3600, tags: ["shop-products"] },
);

export async function GET(): Promise<Response> {
  let xml: string;
  try {
    xml = gunzipSync(Buffer.from(await getFeedGz(), "base64")).toString("utf-8");
  } catch (e) {
    console.error("[heureka.xml] build failed:", e);
    return new Response("Feed temporarily unavailable", {
      status: 503,
      headers: { "Retry-After": "300", "Cache-Control": "no-store" },
    });
  }

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
