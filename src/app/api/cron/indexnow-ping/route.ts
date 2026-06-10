import { NextRequest, NextResponse } from "next/server";
import { PRODUCTS } from "@/data/products";
import { ARTICLES } from "@/data/articles";
import { getPublishedEvents } from "@/lib/events-db";
import { logCronRun } from "@/lib/cron-monitor";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.100dola.com";
const HOST = new URL(BASE_URL).host;
const INDEXNOW_KEY = "52ed4ca6acc142289ec774ffc3db1883";
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/IndexNow";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function buildUrlList(): Promise<string[]> {
  const events = await getPublishedEvents();
  const staticRoutes = [
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
    "/isaac-test",
    "/isaac-test/podminky",
    "/clanky",
    "/kontakt",
    "/obchodni-podminky",
    "/ochrana-osobnich-udaju",
    "/zasady-cookies",
  ];

  const productRoutes = PRODUCTS.map((p) => `/shop/${p.slug}`);
  const eventRoutes = events
    .filter((e) => !e.externalUrl)
    .map((e) => `/community/event/${e.slug}`);
  const articleRoutes = ARTICLES.filter((a) => a.status === "published").map(
    (a) => `/clanky/${a.slug}`,
  );
  // Předobjednávkové landing stránky — high SEO intent
  const preorderRoutes = ["/predobjednavka/spark-rc-2027"];

  return [
    ...staticRoutes,
    ...productRoutes,
    ...eventRoutes,
    ...articleRoutes,
    ...preorderRoutes,
  ].map((p) => `${BASE_URL}${p}`);
}

export async function GET(req: NextRequest) {
  const expected = process.env.CRON_SECRET;
  if (expected) {
    const got = req.headers.get("authorization");
    if (got !== `Bearer ${expected}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return logCronRun("indexnow-ping", "0 5 * * 1", async () => {
    const urlList = await buildUrlList();

    const body = {
      host: HOST,
      key: INDEXNOW_KEY,
      keyLocation: `${BASE_URL}/${INDEXNOW_KEY}.txt`,
      urlList,
    };

    const res = await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(body),
    });

    const text = await res.text();

    return NextResponse.json({
      ok: res.ok,
      status: res.status,
      submittedCount: urlList.length,
      response: text.slice(0, 500),
      ranAt: new Date().toISOString(),
    });
  });
}
