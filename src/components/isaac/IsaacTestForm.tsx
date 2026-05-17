"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { IsaacBike, SlotDef } from "@/data/isaac-bikes";
import { bikeLabel } from "@/data/isaac-bikes";

interface Day {
  date: string;
  label: string;
  slots: SlotDef[];
}

interface TakenSlot {
  bikeSlug: string;
  slotStart: string;
}

interface Props {
  bikes: IsaacBike[];
  days: Day[];
}

export default function IsaacTestForm({ bikes, days }: Props) {
  const [selectedBike, setSelectedBike] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [consentResp, setConsentResp] = useState(false);
  const [consentProto, setConsentProto] = useState(false);
  const [taken, setTaken] = useState<TakenSlot[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  useEffect(() => {
    fetch("/api/isaac-test/reservations")
      .then((r) => r.json())
      .then((d) => setTaken(d.taken || []))
      .catch(() => setTaken([]));
  }, []);

  const takenSet = useMemo(
    () => new Set(taken.map((t) => `${t.bikeSlug}::${t.slotStart}`)),
    [taken],
  );

  function isSlotTaken(bikeSlug: string, slotStart: string): boolean {
    return takenSet.has(`${bikeSlug}::${slotStart}`);
  }

  const bike = bikes.find((b) => b.slug === selectedBike);
  const slot = days.flatMap((d) => d.slots).find((s) => s.slotStart === selectedSlot);

  const canSubmit =
    !submitting &&
    selectedBike &&
    selectedSlot &&
    fullName.trim().length >= 2 &&
    email.includes("@") &&
    phone.trim().length >= 6 &&
    consentResp &&
    consentProto;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setResult(null);
    try {
      const res = await fetch("/api/isaac-test/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bikeSlug: selectedBike,
          slotStart: selectedSlot,
          fullName,
          email,
          phone,
          notes: notes || undefined,
          consentResponsibility: true,
          consentProtocol: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResult({ ok: false, message: data.error || "Rezervace selhala" });
        if (res.status === 409) {
          // Refresh taken slots
          fetch("/api/isaac-test/reservations")
            .then((r) => r.json())
            .then((d) => setTaken(d.taken || []));
        }
        return;
      }
      setResult({
        ok: true,
        message: `Rezervace potvrzena: ${data.reservation.bike}, ${data.reservation.slotLabel}.`,
      });
      // Reset form
      setSelectedBike(null);
      setSelectedSlot(null);
      setFullName("");
      setEmail("");
      setPhone("");
      setNotes("");
      setConsentResp(false);
      setConsentProto(false);
      // Refresh taken slots
      fetch("/api/isaac-test/reservations")
        .then((r) => r.json())
        .then((d) => setTaken(d.taken || []));
    } catch (e) {
      setResult({ ok: false, message: e instanceof Error ? e.message : "Network error" });
    } finally {
      setSubmitting(false);
    }
  }

  if (result?.ok) {
    return (
      <div className="bg-white rounded-2xl border border-[#E2E6F3] p-8 md:p-12 text-center">
        <div className="text-5xl mb-4">🚲</div>
        <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-3">Rezervace potvrzena</h2>
        <p className="text-base text-[#5A6480] max-w-lg mx-auto mb-2">{result.message}</p>
        <p className="text-sm text-[#5A6480] max-w-lg mx-auto mb-6">
          Detail jsme ti poslali e-mailem. Před vyzvednutím podepíšeš krátký protokol o zápůjčce —
          doneste si prosím doklad totožnosti.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            type="button"
            onClick={() => setResult(null)}
            className="px-5 py-3 rounded-full bg-[#3B7CF4] text-white text-sm font-black hover:opacity-90"
          >
            Rezervovat další termín
          </button>
          <Link
            href="/sport"
            className="px-5 py-3 rounded-full border border-[#E2E6F3] text-[#1a1a2e] text-sm font-bold hover:border-[#3B7CF4]"
          >
            Zpět na 100dola sport
          </Link>
        </div>
      </div>
    );
  }

  const groupedBikes = {
    road: bikes.filter((b) => b.category === "road"),
    gravel: bikes.filter((b) => b.category === "gravel"),
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      {result && !result.ok && (
        <div className="rounded-xl p-4 bg-red-50 border border-red-200 text-sm text-red-900">
          <strong>{result.message}</strong>
        </div>
      )}

      {/* Honeypot */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="absolute -left-[9999px]"
        aria-hidden="true"
      />

      {/* Krok 1: kolo */}
      <section className="bg-white rounded-2xl border border-[#E2E6F3] p-6 md:p-8">
        <div className="flex items-baseline gap-3 mb-4">
          <div className="w-7 h-7 rounded-full bg-[#3B7CF4] text-white text-xs font-black flex items-center justify-center">
            1
          </div>
          <h2 className="text-lg md:text-xl font-black text-[#1a1a2e]">Vyber kolo</h2>
        </div>

        <div className="mb-2 text-[11px] uppercase tracking-wider text-[#9AA3C2] font-bold">Road</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-5">
          {groupedBikes.road.map((b) => (
            <BikeCard
              key={b.slug}
              bike={b}
              selected={selectedBike === b.slug}
              onSelect={() => {
                setSelectedBike(b.slug);
                if (selectedSlot && isSlotTaken(b.slug, selectedSlot)) {
                  setSelectedSlot(null);
                }
              }}
            />
          ))}
        </div>

        <div className="mb-2 text-[11px] uppercase tracking-wider text-[#9AA3C2] font-bold">Gravel</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {groupedBikes.gravel.map((b) => (
            <BikeCard
              key={b.slug}
              bike={b}
              selected={selectedBike === b.slug}
              onSelect={() => {
                setSelectedBike(b.slug);
                if (selectedSlot && isSlotTaken(b.slug, selectedSlot)) {
                  setSelectedSlot(null);
                }
              }}
            />
          ))}
        </div>
      </section>

      {/* Krok 2: termín */}
      <section
        className={`bg-white rounded-2xl border border-[#E2E6F3] p-6 md:p-8 transition-opacity ${selectedBike ? "" : "opacity-50 pointer-events-none"}`}
      >
        <div className="flex items-baseline gap-3 mb-4">
          <div className="w-7 h-7 rounded-full bg-[#3B7CF4] text-white text-xs font-black flex items-center justify-center">
            2
          </div>
          <h2 className="text-lg md:text-xl font-black text-[#1a1a2e]">Vyber čas</h2>
          {!selectedBike && (
            <span className="text-xs text-[#9AA3C2]">— nejdřív vyber kolo nahoře</span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {days.map((day) => (
            <div key={day.date}>
              <div className="text-sm font-black text-[#1a1a2e] mb-2">{day.label}</div>
              <div className="space-y-1.5">
                {day.slots.map((s) => {
                  const isTaken = selectedBike ? isSlotTaken(selectedBike, s.slotStart) : false;
                  const isSelected = selectedSlot === s.slotStart;
                  return (
                    <button
                      key={s.slotStart}
                      type="button"
                      disabled={!selectedBike || isTaken}
                      onClick={() => setSelectedSlot(s.slotStart)}
                      className={`w-full px-3 py-2.5 rounded-lg text-sm font-bold text-left transition border ${
                        isSelected
                          ? "bg-[#3B7CF4] text-white border-[#3B7CF4]"
                          : isTaken
                          ? "bg-[#F0F2FA] text-[#9AA3C2] border-transparent line-through cursor-not-allowed"
                          : "bg-[#F7F9FF] text-[#1a1a2e] border-[#E2E6F3] hover:border-[#3B7CF4]"
                      }`}
                    >
                      {s.label}
                      {isTaken && <span className="ml-2 text-[10px] uppercase">obsazeno</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Krok 3: kontakt */}
      <section
        className={`bg-white rounded-2xl border border-[#E2E6F3] p-6 md:p-8 transition-opacity ${selectedSlot ? "" : "opacity-50 pointer-events-none"}`}
      >
        <div className="flex items-baseline gap-3 mb-4">
          <div className="w-7 h-7 rounded-full bg-[#3B7CF4] text-white text-xs font-black flex items-center justify-center">
            3
          </div>
          <h2 className="text-lg md:text-xl font-black text-[#1a1a2e]">Kontakt</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Celé jméno *"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="md:col-span-2 px-4 py-3 rounded-xl border border-[#E2E6F3] text-sm focus:outline-none focus:border-[#3B7CF4]"
          />
          <input
            type="email"
            placeholder="E-mail *"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-4 py-3 rounded-xl border border-[#E2E6F3] text-sm focus:outline-none focus:border-[#3B7CF4]"
          />
          <input
            type="tel"
            placeholder="Telefon *"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="px-4 py-3 rounded-xl border border-[#E2E6F3] text-sm focus:outline-none focus:border-[#3B7CF4]"
          />
          <textarea
            placeholder="Poznámka — výška, váha, požadavek na sedlo (volitelné)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="md:col-span-2 px-4 py-3 rounded-xl border border-[#E2E6F3] text-sm focus:outline-none focus:border-[#3B7CF4]"
          />
        </div>

        {/* Souhlasy */}
        <div className="mt-5 space-y-3">
          <label className="flex items-start gap-3 text-sm text-[#1a1a2e] cursor-pointer">
            <input
              type="checkbox"
              checked={consentResp}
              onChange={(e) => setConsentResp(e.target.checked)}
              className="mt-1 w-4 h-4 flex-shrink-0"
            />
            <span>
              Beru na vědomí, že <strong>po dobu zápůjčky plně odpovídám za kolo</strong> a případné
              poškození / ztrátu hradím v plné výši.
            </span>
          </label>
          <label className="flex items-start gap-3 text-sm text-[#1a1a2e] cursor-pointer">
            <input
              type="checkbox"
              checked={consentProto}
              onChange={(e) => setConsentProto(e.target.checked)}
              className="mt-1 w-4 h-4 flex-shrink-0"
            />
            <span>
              Souhlasím, že před vyzvednutím podepíšu <strong>protokol o zápůjčce</strong> a
              prokážu se dokladem totožnosti.
            </span>
          </label>
        </div>

        {/* Summary + submit */}
        <div className="mt-6 pt-5 border-t border-[#F0F2FA] flex items-center justify-between flex-wrap gap-4">
          <div className="text-sm text-[#5A6480]">
            {bike && slot ? (
              <>
                <strong className="text-[#1a1a2e]">{bikeLabel(bike)}</strong>
                <br />
                {slot.dayLabel} · {slot.label} (60 min, zdarma)
              </>
            ) : (
              <span className="text-[#9AA3C2]">Vyber kolo a čas nahoře</span>
            )}
          </div>
          <button
            type="submit"
            disabled={!canSubmit}
            className="px-6 py-3 rounded-full bg-[#3B7CF4] text-white text-sm font-black hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? "Rezervuji..." : "Rezervovat termín"}
          </button>
        </div>
      </section>

      <p className="text-xs text-[#9AA3C2] text-center">
        Po odeslání rezervace ti přijde potvrzovací e-mail. Pokud nemůžeš přijít, ozvi se prosím
        co nejdříve, ať slot může využít někdo jiný.
      </p>
    </form>
  );
}

function BikeCard({
  bike,
  selected,
  onSelect,
}: {
  bike: IsaacBike;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex items-center gap-3 p-3 rounded-xl text-left transition border-2 ${
        selected
          ? "border-[#3B7CF4] bg-[#F7F9FF]"
          : "border-transparent bg-[#F7F9FF] hover:border-[#E2E6F3]"
      }`}
    >
      <div
        className="w-12 h-12 rounded-lg flex-shrink-0 border border-[#E2E6F3]"
        style={{ backgroundColor: bike.colorHex }}
        aria-hidden
      />
      <div className="min-w-0">
        <div className="text-sm font-black text-[#1a1a2e] truncate">
          {bike.model} <span className="font-normal text-[#5A6480]">·</span> {bike.color}
        </div>
        <div className="text-xs text-[#5A6480] truncate">
          {bike.groupset} · vel. {bike.size}
        </div>
      </div>
      {selected && (
        <div className="ml-auto text-[#3B7CF4] text-lg" aria-hidden>
          ✓
        </div>
      )}
    </button>
  );
}
