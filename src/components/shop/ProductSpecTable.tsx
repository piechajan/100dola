import type { Product } from "@/data/products";

/**
 * Kompletní výbava/specifikace na PDP — rozklikávací (nativní <details>, obsah
 * je v HTML kvůli SEO, bez client JS). Renderuje se jen když má produkt specTable.
 */
export default function ProductSpecTable({ product }: { product: Product }) {
  const rows = product.specTable;
  if (!rows || rows.length === 0) return null;

  return (
    <details className="mt-6 group rounded-2xl border border-[#E2E6F3] bg-white overflow-hidden">
      <summary className="flex items-center justify-between px-5 py-4 cursor-pointer select-none list-none">
        <span className="text-base font-black text-[#1a1a2e]">Kompletní výbava</span>
        <span className="text-[#9AA3C2] text-sm transition-transform group-open:rotate-180">▾</span>
      </summary>
      <div className="px-5 pb-5">
        <table className="w-full text-sm border-collapse">
          <tbody>
            {rows.map((r) => (
              <tr key={r.label} className="border-b border-[#F0F2F8] last:border-0">
                <td className="py-2.5 pr-4 align-top text-[#9AA3C2] font-bold text-xs uppercase tracking-wider w-2/5">
                  {r.label}
                </td>
                <td className="py-2.5 text-[#1a1a2e] font-medium">{r.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
