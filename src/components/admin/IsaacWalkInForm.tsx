"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { IsaacBike, SlotDef } from "@/data/isaac-bikes";
import { bikeLabel } from "@/data/isaac-bikes";

interface Props {
  bikes: IsaacBike[];
  slots: SlotDef[];
}

interface TakenSlot {
  bikeSlug: string;
  slotStart: string;
}

export default function IsaacWalkInForm({ bikes, slots }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  // Form state
  const [bikeSlug, setBikeSlug] = useState("");
  const [slotStart, setSlotStart] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  function reset() {
    setBikeSlug("");
    setSlotStart("");
    setFullName("");
    setEmail("");
    setPhone("");
    setNotes("");
    setResult(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setResult(null);
    try {
      const r = await fetch("/api/admin/isaac-test/walk-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bikeSlug,
          slotStart,
          fullName,
          email: email || undefined,
          phone: phone || undefined,
          notes: notes || undefined,
        }),
      });
      const data = await r.json();
      if (!r.ok) {
        setResult({ ok: false, message: data.error || "Chyba" });
        return;
      }
      setResult({ ok: true, message: "✅ Walk-in zapsán (status: completed)." });
      reset();
      startTransition(() => router.refresh());
    } catch (e) {
      setResult({ ok: false, message: e instanceof Error ? e.message : "Network error" });
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-full bg-[#FFF8E7] border border-[#F5D78E] text-[#7A5615] hover:bg-[#FFEFC2]"
      >
        + Přidat walk-in
      </button>
    );
  }

  const groupedBikes = {
    road: bikes.filter((b) => b.category === "road"),
    gravel: bikes.filter((b) => b.category === "gravel"),
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-[#F5D78E] p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-black text-[#1a1a2e]">Walk-in rezervace</h3>
        <button
          type="button"
          onClick={() => { setOpen(false); reset(); }}
          className="text-[#9AA3C2] hover:text-[#1a1a2e] text-xs"
        >
          ✕ Zavřít
        </button>
      </div>
      <p className="text-xs text-[#5A6480] mb-4">
        Klient přišel bez rezervace. Vytvoří se rezervace přímo se stavem <strong>completed</strong>.
        E-maily se nezasílají.
      </p>

      <form onSubmit={submit} className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <select
            value={bikeSlug}
            onChange={(e) => setBikeSlug(e.target.value)}
            required
            className="px-3 py-2 rounded-lg border border-[#E2E6F3] text-sm bg-white"
          >
            <option value="">-- Vyber kolo --</option>
            <optgroup label="Road">
              {groupedBikes.road.map((b) => (
                <option key={b.slug} value={b.slug}>
                  {bikeLabel(b)}
                </option>
              ))}
            </optgroup>
            <optgroup label="Gravel">
              {groupedBikes.gravel.map((b) => (
                <option key={b.slug} value={b.slug}>
                  {bikeLabel(b)}
                </option>
              ))}
            </optgroup>
          </select>

          <select
            value={slotStart}
            onChange={(e) => setSlotStart(e.target.value)}
            required
            className="px-3 py-2 rounded-lg border border-[#E2E6F3] text-sm bg-white"
          >
            <option value="">-- Vyber slot --</option>
            {slots.map((s) => (
              <option key={s.slotStart} value={s.slotStart}>
                {s.dayLabel} {s.label}
              </option>
            ))}
          </select>
        </div>

        <input
          type="text"
          placeholder="Jméno klienta *"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-[#E2E6F3] text-sm"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="email"
            placeholder="E-mail (volitelné)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-3 py-2 rounded-lg border border-[#E2E6F3] text-sm"
          />
          <input
            type="tel"
            placeholder="Telefon (volitelné)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="px-3 py-2 rounded-lg border border-[#E2E6F3] text-sm"
          />
        </div>

        <textarea
          placeholder="Poznámka (např. zájem o koupi, kontakt na později)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 rounded-lg border border-[#E2E6F3] text-sm"
        />

        {result && (
          <div
            className={`rounded-lg p-3 text-sm ${result.ok ? "bg-emerald-50 text-emerald-900 border border-emerald-200" : "bg-red-50 text-red-900 border border-red-200"}`}
          >
            {result.message}
          </div>
        )}

        <button
          type="submit"
          disabled={busy || isPending}
          className="px-5 py-2.5 rounded-full bg-[#1a1a2e] text-white text-sm font-black hover:opacity-90 disabled:opacity-40"
        >
          {busy ? "Ukládám..." : "Uložit walk-in"}
        </button>
      </form>
    </div>
  );
}
