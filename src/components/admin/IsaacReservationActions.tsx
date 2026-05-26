"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

interface Props {
  id: number;
  status: string;
  customerName: string;
}

export default function IsaacReservationActions({ id, status, customerName }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function patchStatus(newStatus: string) {
    setBusy(true);
    setError(null);
    try {
      const r = await fetch(`/api/admin/isaac-test/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        setError(d.error || "Chyba");
        return;
      }
      startTransition(() => router.refresh());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setBusy(false);
    }
  }

  async function hardDelete() {
    if (!confirm(`Opravdu smazat rezervaci ${customerName}? Tato akce je nevratná.`)) return;
    setBusy(true);
    setError(null);
    try {
      const r = await fetch(`/api/admin/isaac-test/${id}`, { method: "DELETE" });
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        setError(d.error || "Smazání selhalo");
        return;
      }
      startTransition(() => router.refresh());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setBusy(false);
    }
  }

  const disabled = busy || isPending;

  return (
    <div className="flex flex-wrap gap-1 items-center">
      {status !== "cancelled" && (
        <button
          type="button"
          onClick={() => patchStatus("cancelled")}
          disabled={disabled}
          className="px-2 py-1 rounded text-[10px] font-bold border border-[#E2E6F3] text-[#5A6480] hover:border-[#E8431A] hover:text-[#E8431A] transition disabled:opacity-40"
          title="Stornovat (slot se uvolní pro další)"
        >
          Stornovat
        </button>
      )}
      {status === "reserved" && (
        <button
          type="button"
          onClick={() => patchStatus("completed")}
          disabled={disabled}
          className="px-2 py-1 rounded text-[10px] font-bold border border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition disabled:opacity-40"
          title="Dorazil a vrátil"
        >
          ✓ Dokončeno
        </button>
      )}
      {status === "reserved" && (
        <button
          type="button"
          onClick={() => patchStatus("no_show")}
          disabled={disabled}
          className="px-2 py-1 rounded text-[10px] font-bold border border-amber-200 text-amber-700 hover:bg-amber-50 transition disabled:opacity-40"
          title="Nedorazil"
        >
          No-show
        </button>
      )}
      <button
        type="button"
        onClick={hardDelete}
        disabled={disabled}
        className="px-2 py-1 rounded text-[10px] font-bold border border-red-200 text-red-700 hover:bg-red-50 transition disabled:opacity-40"
        title="Trvale smazat z databáze (např. testovací rezervace)"
      >
        🗑️ Smazat
      </button>
      {error && (
        <span className="text-[10px] text-red-600 ml-1" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
