/**
 * AI draft helper pro contact form — Claude vygeneruje návrh odpovědi
 * zákazníkovi, kterou Jan zkontroluje/upraví/odešle. Žádná AI zpráva
 * se NEPOSÍLÁ zákazníkovi přímo (zero halucinace risk pro klienta).
 *
 * Feature flag: ANTHROPIC_API_KEY env. Pokud chybí, jen vrátíme null
 * a Jan dostane mail bez AI draftu (graceful degradation).
 */

import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-haiku-4-5-20251001"; // levný + rychlý pro draft odpovědi
const MAX_TOKENS = 800;

const SYSTEM_PROMPT = `Jsi asistent Jana Piechy, zakladatele 100dola sport (Šternberk, ČR).
100dola má tři pilíře: 1) e-shop, showroom a prodejna ve Šternberku (osobní předání a doručení po Moravě — Valašské Meziříčí, Vsetín, Olomouc, Ostrava)
(silniční/gravel/MTB kola, oblečení, výživa, doplňky), 2) přeprava a uskladnění kol v Malaze
(klient přiletí s příručákem, vlastní kolo už čeká), 3) Open Miles Clinic — komunita social rides,
events, gravel/silnice/skialpy.

Tvůj úkol: navrhneš Janovi **český draft odpovědi** zákazníkovi, který poslal zprávu z webu.
Zákazník dostane jen automatickou potvrzovací odpověď (ne tvůj draft). Tvůj draft pošleme Janovi
do mailu — on ho přečte, případně upraví a sám pošle dál.

Pravidla:
- Tykáme si (Czech cycling community style).
- Honest, friendly, krátký (3-6 vět max).
- Žádné výmysly o cenách / dostupnosti / termínech, které neznáš — místo toho napiš "ověřím a ozvu se".
- Pokud zákazník chce kolo na míru / Malaga storage / event — naveď ho na další krok (které info od něj potřebujeme).
- Konec: podpis "Jan / 100dola" nebo "Měj se, Jan".
- Nepiš HTML, jen prostý text s novými řádky.`;

export interface DraftResult {
  draft: string;
  model: string;
  tokensIn: number;
  tokensOut: number;
}

export interface DraftContext {
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  message: string;
  pageUrl?: string | null;
  productSlug?: string | null;
}

export async function generateAIDraft(
  ctx: DraftContext,
): Promise<{ ok: true; data: DraftResult } | { ok: false; error: string }> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return { ok: false, error: "no_api_key" };

  const client = new Anthropic({ apiKey: key });

  const userParts = [
    `Zákazník: ${ctx.customerName} <${ctx.customerEmail}>`,
    ctx.customerPhone ? `Telefon: ${ctx.customerPhone}` : null,
    ctx.pageUrl ? `Stránka: ${ctx.pageUrl}` : null,
    ctx.productSlug ? `Produkt: ${ctx.productSlug}` : null,
    "",
    "Zpráva od zákazníka:",
    ctx.message,
    "",
    "Napiš Janovi návrh odpovědi (Janova perspektiva, tykání).",
  ].filter(Boolean).join("\n");

  try {
    const resp = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userParts }],
    });
    const text = resp.content
      .filter((c): c is Anthropic.TextBlock => c.type === "text")
      .map((c) => c.text)
      .join("\n")
      .trim();
    return {
      ok: true,
      data: {
        draft: text,
        model: resp.model,
        tokensIn: resp.usage.input_tokens,
        tokensOut: resp.usage.output_tokens,
      },
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
