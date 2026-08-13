import type { Product } from "@/data/products";

/**
 * Geometrie rámu na PDP — rozklikávací (nativní <details>, obsah v HTML kvůli
 * SEO). Velikosti jako sloupce, řádky = geometrické hodnoty. Renderuje se jen
 * když má produkt geometry.
 */
export default function ProductGeometryTable({ product }: { product: Product }) {
  const g = product.geometry;
  if (!g || g.rows.length === 0) return null;

  return (
    <details className="mt-3 group rounded-2xl border border-[#E2E6F3] bg-white overflow-hidden">
      <summary className="flex items-center justify-between px-5 py-4 cursor-pointer select-none list-none">
        <span className="text-base font-black text-[#1a1a2e]">Geometrie</span>
        <span className="text-[#9AA3C2] text-sm transition-transform group-open:rotate-180">▾</span>
      </summary>
      <div className="px-5 pb-5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse min-w-[380px]">
            <thead>
              <tr>
                <th className="text-left font-bold text-[10px] uppercase tracking-wider text-[#9AA3C2] pb-2 border-b border-[#E2E6F3]" />
                {g.sizes.map((s) => (
                  <th
                    key={s}
                    className="text-right font-black text-xs text-[#1a1a2e] pb-2 border-b border-[#E2E6F3] px-2"
                  >
                    {s}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {g.rows.map((r) => (
                <tr key={r.label} className="border-b border-[#F0F2F8] last:border-0">
                  <td className="py-2 pr-3 text-[#5A6480]">{r.label}</td>
                  {r.values.map((v, i) => (
                    <td key={i} className="py-2 px-2 text-right text-[#1a1a2e] font-medium tabular-nums">
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {g.note && <p className="mt-3 text-xs text-[#9AA3C2] leading-relaxed">{g.note}</p>}
      </div>
    </details>
  );
}
