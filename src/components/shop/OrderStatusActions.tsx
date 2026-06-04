"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  orderId: string;
  currentStatus: string;
  paidAt?: string | null;
  shippedAt?: string | null;
  trackingNumber?: string | null;
  trackingCarrier?: string | null;
}

export default function OrderStatusActions({
  orderId,
  currentStatus,
  paidAt,
  shippedAt,
  trackingNumber: initialTracking,
  trackingCarrier: initialCarrier,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [trackingNumber, setTrackingNumber] = useState(initialTracking || "");
  const [trackingCarrier, setTrackingCarrier] = useState(initialCarrier || "zasilkovna");

  const updateStatus = async (status: string, payload?: Record<string, unknown>) => {
    setLoading(status);
    setError(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, ...payload }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error || "Nepodařilo se aktualizovat status.");
        setLoading(null);
        return;
      }
      router.refresh();
    } catch {
      setError("Síťová chyba. Zkus to znovu.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {currentStatus === "pending" && (
          <button
            type="button"
            onClick={() => updateStatus("paid")}
            disabled={loading !== null}
            className="px-4 py-2 text-xs font-bold text-white rounded-full bg-[#10B981] hover:opacity-90 disabled:opacity-50"
          >
            {loading === "paid" ? "Ukládám…" : "Označit jako zaplaceno"}
          </button>
        )}

        {(currentStatus === "paid" || currentStatus === "pending") && (
          <div className="flex gap-2 items-stretch flex-wrap">
            <select
              value={trackingCarrier}
              onChange={(e) => setTrackingCarrier(e.target.value)}
              className="px-3 py-2 text-xs border border-[#E2E6F3] rounded-full focus:outline-none focus:border-[#3B7CF4] bg-white"
            >
              <option value="zasilkovna">Zásilkovna</option>
              <option value="gls">GLS</option>
              <option value="dpd">DPD</option>
              <option value="ceska_posta">Česká pošta</option>
              <option value="osobne">Osobní vyzvednutí</option>
              <option value="other">Jiný dopravce</option>
            </select>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Tracking č."
              className="px-3 py-2 text-xs border border-[#E2E6F3] rounded-full focus:outline-none focus:border-[#3B7CF4] w-44"
            />
            <button
              type="button"
              onClick={() => updateStatus("shipped", {
                trackingNumber: trackingNumber.trim() || undefined,
                trackingCarrier: trackingCarrier || undefined,
              })}
              disabled={loading !== null}
              className="px-4 py-2 text-xs font-bold text-white rounded-full bg-[#3B7CF4] hover:opacity-90 disabled:opacity-50"
            >
              {loading === "shipped" ? "Ukládám…" : "Označit jako odesláno + email"}
            </button>
          </div>
        )}

        {currentStatus !== "cancelled" && currentStatus !== "shipped" && (
          <button
            type="button"
            onClick={() => {
              if (confirm("Opravdu stornovat objednávku?")) updateStatus("cancelled");
            }}
            disabled={loading !== null}
            className="px-4 py-2 text-xs font-bold rounded-full border border-[#FCA5A5] text-[#991B1B] hover:bg-[#FEE2E2] disabled:opacity-50"
          >
            {loading === "cancelled" ? "Ukládám…" : "Stornovat"}
          </button>
        )}
      </div>

      {paidAt && (
        <div className="text-[11px] text-[#9AA3C2]">
          Zaplaceno: {new Date(paidAt).toLocaleString("cs-CZ")}
        </div>
      )}
      {shippedAt && (
        <div className="text-[11px] text-[#9AA3C2]">
          Odesláno: {new Date(shippedAt).toLocaleString("cs-CZ")}
          {initialTracking && (
            <span className="ml-2 font-mono">· track: {initialTracking}</span>
          )}
        </div>
      )}

      {error && (
        <div className="rounded-lg p-2 text-xs bg-red-50 text-red-700 border border-red-200">
          {error}
        </div>
      )}
    </div>
  );
}
