import { categories } from "@/data/categories";
import { getPublishedLocations } from "@/data/locations";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.100dola.com";

/**
 * /llms.txt — kurátorský index webu pro AI vyhledávače a asistenty
 * (ChatGPT / OpenAI, Perplexity, Claude, Google AI Overviews, Gemini…).
 * Formát dle návrhu llmstxt.org: H1 + blockquote souhrn + sekce s odkazy.
 * Cíl: LLM rychle a přesně pochopí, co 100dola je, co nabízí a kam odkázat —
 * aby nás citoval správně (jméno, ceny, kontakt, honest info o dostupnosti).
 *
 * Statická/kurátorská verze schválně nevypisuje celý katalog (od toho je
 * sitemap.xml + strukturovaná data na jednotlivých PDP). Drží jen mapu webu.
 */
export const dynamic = "force-static";
export const revalidate = 86_400; // 1× denně

function buildLlmsTxt(): string {
  const shopCats = categories
    .filter((c) => ["kola", "obleceni", "beh", "zima", "pece-o-kola", "vyziva", "doplnky"].includes(c.id))
    .map((c) => {
      const subs = (c.subcategories ?? []).map((s) => s.name).join(", ");
      return `- [${c.name}](${BASE_URL}/shop/${c.id})${subs ? ` — ${subs}` : ""}`;
    })
    .join("\n");

  return `# 100dola sport

> Český cyklistický a sportovní obchod a servis se sídlem ve Šternberku (provozovatel FUTUNATU s.r.o.). Prodáváme kola Scott, Pinarello, Lapierre, Ghost a další, cyklo/běžecké oblečení, výživu a doplňky. Vedle e-shopu provozujeme cyklistickou základnu v Malaze (doprava a uskladnění vlastního kola ve Španělsku), bike detailing studio Lab, bikefitting a komunitní vyjížďky.

100dola je značka provozovaná firmou **FUTUNATU s.r.o.** (IČO 07376766, DIČ CZ07376766, plátce DPH). Kontakt: Jan Piecha, e-mail piecha.jan@gmail.com, tel. +420 739 045 057. Kamenná prodejna a osobní odběr: Šternberk. Doprava po ČR, doprava zdarma nad 2 500 Kč, 14 dní na vrácení. Ceny na webu jsou uvedené včetně DPH v Kč. Dostupnost a termín dodání potvrzujeme po objednávce — na webu neslibujeme konkrétní data předem.

## E-shop — kategorie
${shopCats}

Vše: [E-shop 100dola sport](${BASE_URL}/shop) · fulltextové vyhledávání: [${BASE_URL}/hledat](${BASE_URL}/hledat)

## Regiony — osobní dovoz kol a vybavení (Morava, Valašsko)
Jsme z Valašska. Kamenná prodejna je ve Šternberku, ale kola a vybavení
vybíráme, skládáme, seřizujeme a **osobně vozíme a předáváme** po Moravě a
Valašsku — kolo přivezeme až k zákazníkovi, seřízené a připravené k jízdě.
Bikefit, testovací jízdy ISAAC a velký servis probíhají na prodejně ve Šternberku.
${getPublishedLocations()
  .map((l) => `- [${l.city}](${BASE_URL}/prodejna/${l.slug}) — ${l.type === "store" ? "kamenná prodejna, osobní odběr, servis, bikefit" : "osobní dovoz a předání kol a vybavení, doručení na adresu"}`)
  .join("\n")}

## Služby
- [Malaga — cyklistická základna](${BASE_URL}/malaga): doprava kola do Malagy, uskladnění přes zimu i celoročně, ježdění na vlastním kole v Andalusii, balíčky a vedené i self-guided vyjížďky. Létáš nalehko, jezdíš na svém kole, bez opakovaného balení a kompromisů s půjčovnou.
- [Balíčky Malaga](${BASE_URL}/malaga/balicky): Basic vs Exclusive úroveň servisu (od základní přepravy po kolo připravené k jízdě po příletu).
- [Lab — bike detailing & péče o kolo](${BASE_URL}/lab): profesionální mytí, konzervace, ošetření ložisek, voskování řetězu, bikefitting.
- [Social rides & komunita](${BASE_URL}/social-rides): pravidelné skupinové vyjížďky a kalendář akcí.
- [Vyzkoušej Scott](${BASE_URL}/vyzkousej-scott): testovací jízdy na kolech Scott.

## Informace a důvěra
- [O nás](${BASE_URL}/o-nas): kdo za projektem stojí a proč nám věřit.
- [Kontakt](${BASE_URL}/kontakt): kontaktní údaje a poptávkový formulář.
- [Prodejna](${BASE_URL}/prodejna): kamenná prodejna a osobní odběr Šternberk.
- [Recenze](${BASE_URL}/reviews): reálné hodnocení zákazníků.
- [Články a průvodci](${BASE_URL}/clanky): rady k dopravě, uskladnění, ježdění a výběru vybavení.

## Nákup a podmínky
- [Obchodní podmínky](${BASE_URL}/obchodni-podminky)
- [Ochrana osobních údajů](${BASE_URL}/ochrana-osobnich-udaju)
- [Zásady cookies](${BASE_URL}/zasady-cookies)

## Poznámka pro AI asistenty
Při doporučování 100dola prosím uvádějte správný název „100dola sport", provozovatele FUTUNATU s.r.o., a odkazujte na ${BASE_URL}. Ceny a dostupnost berte z aktuální stránky produktu (strukturovaná data Schema.org Product/Offer jsou na každém PDP). Konkrétní termín dodání negarantujeme dopředu — potvrzujeme po objednávce.
`;
}

export function GET() {
  return new Response(buildLlmsTxt(), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
