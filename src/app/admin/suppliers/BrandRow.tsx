"use client";

import { useState, useTransition } from "react";
import { toggleBrand, toggleBrandPublic, runImport } from "./actions";

type Brand = {
  id: string;
  external_id: string;
  brand_name: string;
  brand_slug: string;
  is_enabled: boolean;
  is_public: boolean;
  default_order_flow: string;
  import_filter: Record<string, unknown> | null;
};

export default function BrandRow({
  brand,
  productCount,
}: {
  brand: Brand;
  productCount: number;
}) {
  const [isPending, startTransition] = useTransition();
  const [importMsg, setImportMsg] = useState<{ ok: boolean; message: string } | null>(null);

  const filterText = brand.import_filter
    ? JSON.stringify(brand.import_filter)
    : "—";

  return (
    <tr className="border-t border-[#E2E6F3]">
      <td className="p-3 font-bold">{brand.brand_name}</td>
      <td className="p-3 font-mono text-xs">{brand.external_id}</td>
      <td className="p-3 font-mono text-xs">{brand.brand_slug}</td>
      <td className="p-3">
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-bold ${
            brand.default_order_flow === "lead"
              ? "bg-[#FEF3C7] text-[#92400E]"
              : brand.default_order_flow === "hybrid"
                ? "bg-[#DBEAFE] text-[#1E3A8A]"
                : "bg-[#D1FAE5] text-[#065F46]"
          }`}
        >
          {brand.default_order_flow}
        </span>
      </td>
      <td className="p-3 text-right font-mono">{productCount}</td>
      <td className="p-3 font-mono text-xs max-w-[200px] truncate" title={filterText}>
        {filterText}
      </td>
      <td className="p-3">
        <div className="flex flex-col gap-1">
          <button
            type="button"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                await toggleBrand(brand.id, !brand.is_enabled);
              })
            }
            title="Import: cron stahuje data z feedu do DB"
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              brand.is_enabled
                ? "bg-[#D1FAE5] text-[#065F46] hover:bg-[#A7F3D0]"
                : "bg-[#F7F9FF] text-[#5A6480] hover:bg-[#E2E6F3]"
            } disabled:opacity-50`}
          >
            Import: {brand.is_enabled ? "Zap" : "Vyp"}
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                await toggleBrandPublic(brand.id, !brand.is_public);
              })
            }
            title="Veřejně: zobrazit produkty na /shop"
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              brand.is_public
                ? "bg-[#DBEAFE] text-[#1E3A8A] hover:bg-[#BFDBFE]"
                : "bg-[#F7F9FF] text-[#5A6480] hover:bg-[#E2E6F3]"
            } disabled:opacity-50`}
          >
            Web: {brand.is_public ? "Zap" : "Vyp"}
          </button>
        </div>
      </td>
      <td className="p-3">
        <div className="flex flex-col gap-1">
          <button
            type="button"
            disabled={isPending || !brand.is_enabled}
            onClick={() =>
              startTransition(async () => {
                setImportMsg(null);
                const res = await runImport(brand.id);
                setImportMsg(res);
              })
            }
            className="px-3 py-1 rounded-full bg-[#3B7CF4] text-white text-xs font-bold hover:opacity-90 disabled:opacity-30"
          >
            {isPending ? "Importuje…" : "Importovat teď"}
          </button>
          {importMsg && (
            <span
              className={`text-xs ${importMsg.ok ? "text-[#065F46]" : "text-[#991B1B]"} max-w-[260px]`}
            >
              {importMsg.message}
            </span>
          )}
        </div>
      </td>
    </tr>
  );
}
