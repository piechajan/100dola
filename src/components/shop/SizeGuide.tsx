"use client";

import { useState } from "react";

type GuideKind = "bike" | "shoe" | "apparel";

/** Určí typ tabulky velikostí z categoryId. Vrátí null = žádná tabulka. */
export function sizeGuideKind(categoryId: string): GuideKind | null {
  if (/^tretry|^obuv|-boty$|^skialpy-boty/.test(categoryId)) return "shoe";
  if (/^obleceni/.test(categoryId)) return "apparel";
  if (/silnicni|gravel|^mtb|^kola|bike/.test(categoryId)) return "bike";
  return null;
}

const TABLES: Record<GuideKind, { title: string; head: string[]; rows: string[][]; note: string }> = {
  bike: {
    title: "Velikost rámu podle výšky",
    head: ["Velikost", "Výška jezdce"],
    rows: [
      ["XS", "156–164 cm"],
      ["S", "163–172 cm"],
      ["M", "170–179 cm"],
      ["L", "177–186 cm"],
      ["XL", "184–193 cm"],
      ["XXL", "191–200 cm"],
    ],
    note: "Orientační rozpětí — u konkrétního modelu se liší podle geometrie. Na pomezí velikostí nebo pro přesný posed doporučíme velikost my (i bikefit ve Šternberku).",
  },
  shoe: {
    title: "Tretry — velikosti",
    head: ["EU", "UK", "Délka nohy"],
    rows: [
      ["38", "5", "24,0 cm"],
      ["39", "6", "24,7 cm"],
      ["40", "6,5", "25,3 cm"],
      ["41", "7,5", "26,0 cm"],
      ["42", "8", "26,7 cm"],
      ["43", "9", "27,3 cm"],
      ["43,5", "9,5", "27,7 cm"],
      ["44", "10", "28,0 cm"],
      ["45", "10,5", "28,7 cm"],
      ["46", "11,5", "29,3 cm"],
      ["47", "12", "30,0 cm"],
      ["48", "13", "30,7 cm"],
    ],
    note: "Změř délku chodidla (od paty ke špičce) a přiřaď nejbližší vyšší hodnotu. Cyklistické tretry sedí těsně — pro širší nohu ber raději vyšší velikost.",
  },
  apparel: {
    title: "Oblečení — velikosti",
    head: ["Velikost", "Hrudník", "Pas"],
    rows: [
      ["XS", "84–88 cm", "72–76 cm"],
      ["S", "88–94 cm", "76–82 cm"],
      ["M", "94–100 cm", "82–88 cm"],
      ["L", "100–106 cm", "88–94 cm"],
      ["XL", "106–112 cm", "94–100 cm"],
      ["XXL", "112–120 cm", "100–108 cm"],
    ],
    note: "Cyklistické oblečení má závodní (těsný) střih. Pokud jsi mezi velikostmi nebo chceš volnější padnutí, ber vyšší velikost.",
  },
};

export default function SizeGuide({ categoryId }: { categoryId: string }) {
  const kind = sizeGuideKind(categoryId);
  const [open, setOpen] = useState(false);
  if (!kind) return null;
  const t = TABLES[kind];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs font-bold text-[#3B7CF4] hover:underline"
      >
        Tabulka velikostí
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={t.title}
        >
          <div
            className="w-full max-w-md bg-white rounded-2xl border border-[#E2E6F3] shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E6F3]">
              <h3 className="text-base font-black text-[#1a1a2e]">{t.title}</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Zavřít"
                className="w-8 h-8 rounded-full text-[#9AA3C2] hover:bg-[#F0F4FF] hover:text-[#1a1a2e] transition-colors flex items-center justify-center text-lg leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-5">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr>
                    {t.head.map((h) => (
                      <th
                        key={h}
                        className="text-left font-bold text-[10px] uppercase tracking-wider text-[#9AA3C2] pb-2 border-b border-[#E2E6F3]"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {t.rows.map((r) => (
                    <tr key={r[0]} className="border-b border-[#F0F2F8] last:border-0">
                      {r.map((c, i) => (
                        <td
                          key={i}
                          className={`py-2 ${i === 0 ? "font-black text-[#1a1a2e]" : "text-[#5A6480]"}`}
                        >
                          {c}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-4 text-xs text-[#5A6480] leading-relaxed">{t.note}</p>
              <p className="mt-3 text-xs text-[#9AA3C2]">
                Nejsi si jistý? Napiš na{" "}
                <a href="mailto:info@100dola.com" className="text-[#3B7CF4] hover:underline">
                  info@100dola.com
                </a>{" "}
                — poradíme.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
