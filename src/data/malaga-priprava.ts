// Příprava kola a co s sebou při přepravě do Malagy.
// Jeden zdroj pravdy pro stránku /malaga/priprava-kola i pro potvrzovací
// e-maily (lib/email.ts). Bez "server-only" — importuje se i do client kódu.
//
// NDA: nikdy nezmiňovat motorky ani sdílený provoz s třetí stranou
// (viz memory project_malaga_buildout). Mluvíme neutrálně o „krabici na kolo“.

export const PRIPRAVA_URL = "https://www.100dola.com/malaga/priprava-kola";

export const BOX = {
  title: "Krabice na kolo",
  intro:
    "Pokud kolo předáváš zabalené, doporučujeme krabici o těchto rozměrech:",
  dims: [
    { label: "Šířka", value: "25 cm" },
    { label: "Výška", value: "86 cm" },
    { label: "Délka", value: "170 cm" },
  ],
  note: "Standardní kartonová krabice na silniční kolo, kterou ti obvykle dají téměř v každém cyklistickém obchodě. Kolo, které se do těchto rozměrů nevejde, nám raději předem napiš — vyřešíme to dřív, než ho začneš balit.",
} as const;

export interface PrepItem {
  title: string;
  detail: string;
}

/** Co s sebou — výbava, bez které se v Malaze zbytečně zdržíš. */
export const CARRY: PrepItem[] = [
  {
    title: "Nabíječky a kabely",
    detail:
      "Wattmetr, Garmin / cyklopočítač, blikačky a nabíječka k elektronickému řazení (Shimano Di2 nebo SRAM AXS).",
  },
  {
    title: "Pumpa nebo kompresor",
    detail: "Malá ruční pumpa stačí.",
  },
  {
    title: "Dvě duše a montpáky",
    detail: "I s tubeless plášti se hodí jako záloha na trase. Přibal i záplaty.",
  },
  {
    title: "Základní sada imbusů",
    detail:
      "Multitool nebo sada imbusů a torxů. Pokud máš karbon, přidej momentový klíč.",
  },
];

/** Další doporučení nad rámec základní výbavy. */
export const EXTRA: PrepItem[] = [
  {
    title: "Pedály a klíč na pedály",
    detail:
      "Pedály nech sundané a přibal pedálový klíč, ať kolo v Malaze sám složíš.",
  },
  {
    title: "Rychlospojka řetězu a náhradní patka přehazovačky",
    detail: "Drobnosti, které na trase zachrání den.",
  },
  {
    title: "Mazivo nebo vosk",
    detail: "Malá lahvička na řetěz stačí.",
  },
  {
    title: "Fotky kola před předáním",
    detail:
      "Pár záběrů celého kola a sériové číslo si schovej. Je to užitečné při jakékoli reklamaci.",
  },
  {
    title: "Poznač si nastavení",
    detail:
      "Výšku sedla a předsazení si změř a zapiš nebo označ lepicí páskou, ať kolo po složení sedí stejně.",
  },
];

/** Co si vzít do příručního zavazadla (kola jedou v krabicích po zemi). */
export const CABIN_ONLY: string[] = [
  "Helma, boty a oblečení na první den na kole.",
  "Doklady a pojištění.",
];

export const PACKING_TIPS: PrepItem[] = [
  {
    title: "Kola ven, destičky chránit",
    detail:
      "Vyndej kola a do třmenů kotoučových brzd vlož rozpěrky nebo karton, ať se destičky nezavřou.",
  },
  {
    title: "Vypusť část vzduchu",
    detail: "S částečně vypuštěnými plášti se kolo snáz balí a ve krabici lépe sedí.",
  },
  {
    title: "Chraň přehazovačku a vidlici",
    detail:
      "Přehazovačku zabal do pěny nebo ji sundej. Do vidlice a zadních patek dej rozpěrky.",
  },
  {
    title: "Pevné uchycení",
    detail:
      "Kolo ve krabici nesmí hrát. Vyplň prázdná místa pěnou, kartonem nebo oblečením.",
  },
];

// ── E-mailové bloky ─────────────────────────────────────────────────────────

/** Čistý text pro e-mail (plain text část). */
export function prepBlockText(): string {
  const lines: string[] = [];
  lines.push("CO S SEBOU A JAK KOLO PŘICHYSTAT");
  lines.push("");
  lines.push(`${BOX.title}: šířka ${BOX.dims[0].value}, výška ${BOX.dims[1].value}, délka ${BOX.dims[2].value}.`);
  lines.push("");
  lines.push("Výbava:");
  for (const i of CARRY) lines.push(`  • ${i.title} — ${i.detail}`);
  lines.push("");
  lines.push("Do příručního zavazadla:");
  for (const i of CABIN_ONLY) lines.push(`  • ${i}`);
  lines.push("");
  lines.push(`Celý seznam i doporučení k balení: ${PRIPRAVA_URL}`);
  return lines.join("\n");
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** HTML blok pro e-mail. `accent` = barva odkazu (Malaga terakota). */
export function prepBlockHtml(accent = "#E8431A"): string {
  const li = (t: string, d?: string) =>
    `<li style="margin:0 0 6px">${d ? `<strong>${esc(t)}</strong> — ${esc(d)}` : esc(t)}</li>`;
  return `
      <div style="background:#F7F9FF;border:1px solid #E2E6F3;border-radius:12px;padding:16px;margin:0 0 16px">
        <div style="font-weight:700;font-size:15px;margin:0 0 10px;color:#1a1a2e">Co s sebou a jak kolo přichystat</div>
        <p style="margin:0 0 10px;font-size:14px;line-height:1.5;color:#1a1a2e">
          <strong>${esc(BOX.title)}:</strong> šířka ${esc(BOX.dims[0].value)}, výška ${esc(BOX.dims[1].value)}, délka ${esc(BOX.dims[2].value)}.
        </p>
        <div style="font-size:13px;font-weight:700;margin:12px 0 4px;color:#1a1a2e">Výbava</div>
        <ul style="margin:0 0 8px;padding-left:18px;font-size:13px;line-height:1.5;color:#5A6480">
          ${CARRY.map((i) => li(i.title, i.detail)).join("")}
        </ul>
        <div style="font-size:13px;font-weight:700;margin:12px 0 4px;color:#1a1a2e">Do příručního zavazadla</div>
        <ul style="margin:0 0 8px;padding-left:18px;font-size:13px;line-height:1.5;color:#5A6480">
          ${CABIN_ONLY.map((t) => li(t)).join("")}
        </ul>
        <p style="margin:10px 0 0;font-size:13px">
          <a href="${PRIPRAVA_URL}" style="color:${accent};font-weight:700">Celý seznam a doporučení k balení →</a>
        </p>
      </div>`;
}
