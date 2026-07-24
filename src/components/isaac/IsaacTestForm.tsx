"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { IsaacBike, SlotDef } from "@/data/isaac-bikes";
import { bikeLabel } from "@/data/isaac-bikes";
import BikeGalleryModal from "./BikeGalleryModal";
import { trackMetaEvent } from "@/components/analytics/MetaPixel";
import { trackGoogleEvent } from "@/components/analytics/GoogleAnalytics";
import { getAttribution } from "@/lib/attribution";

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
  const [galleryBike, setGalleryBike] = useState<IsaacBike | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [consentTerms, setConsentTerms] = useState(false);
  const [consentGdpr, setConsentGdpr] = useState(false);
  const [subscribeNewsletter, setSubscribeNewsletter] = useState(false);
  const [taken, setTaken] = useState<TakenSlot[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  // Now-ticker — re-renderuje každou minutu, aby uplynulé sloty získaly fade
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    fetch("/api/isaac-test/reservations")
      .then((r) => r.json())
      .then((d) => setTaken(d.taken || []))
      .catch(() => setTaken([]));
  }, []);

  useEffect(() => {
    // Tick každou minutu — fade past slots in real-time
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  function isSlotInPast(slotStart: string): boolean {
    return new Date(slotStart).getTime() <= now;
  }

  // Auto-deselect slot který právě uplynul
  useEffect(() => {
    if (selectedSlot && isSlotInPast(selectedSlot)) {
      setSelectedSlot(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now, selectedSlot]);

  // Normalizace formátu slotStart — API vrací "2026-05-29T07:00:00Z",
  // ISAAC_SLOTS generuje "2026-05-29T07:00:00.000Z" (přes toISOString).
  // Sjednotíme oba na ISO bez milisekund.
  function normSlot(s: string): string {
    return s.replace(/\.\d{3}Z$/, "Z");
  }

  const takenSet = useMemo(
    () => new Set(taken.map((t) => `${t.bikeSlug}::${normSlot(t.slotStart)}`)),
    [taken],
  );

  function isSlotTaken(bikeSlug: string, slotStart: string): boolean {
    return takenSet.has(`${bikeSlug}::${normSlot(slotStart)}`);
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
    consentTerms &&
    consentGdpr;

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
          consentTerms: true,
          consentGdpr: true,
          subscribeNewsletter,
          attribution: getAttribution(),
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
      // Analytics conversion events
      trackMetaEvent(
        "Lead",
        {
          content_name: "ISAAC test reservation",
          content_category: bike?.category || "bike",
        },
        data.eventId, // shodné s CAPI Lead → Meta dedup
      );
      trackGoogleEvent("generate_lead", {
        event_category: "isaac_test",
        event_label: data.reservation.bike,
        value: 1,
      });
      // Reset form
      setSelectedBike(null);
      setSelectedSlot(null);
      setFullName("");
      setEmail("");
      setPhone("");
      setNotes("");
      setConsentTerms(false);
      setConsentGdpr(false);
      setSubscribeNewsletter(false);
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
    <>
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
              onOpenGallery={() => setGalleryBike(b)}
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
              onOpenGallery={() => setGalleryBike(b)}
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
                  const isPast = isSlotInPast(s.slotStart);
                  const isTaken = selectedBike ? isSlotTaken(selectedBike, s.slotStart) : false;
                  const isSelected = selectedSlot === s.slotStart;
                  const isDisabled = !selectedBike || isTaken || isPast;
                  return (
                    <button
                      key={s.slotStart}
                      type="button"
                      disabled={isDisabled}
                      aria-disabled={isDisabled}
                      onClick={(e) => {
                        if (isDisabled) {
                          e.preventDefault();
                          return;
                        }
                        setSelectedSlot(s.slotStart);
                      }}
                      className={`w-full px-3 py-2.5 rounded-lg text-sm font-bold text-left transition border flex items-center justify-between ${
                        isSelected
                          ? "bg-[#3B7CF4] text-white border-[#3B7CF4] shadow-md"
                          : isPast
                          ? "bg-[#F7F9FF] text-[#C5CADC] border-transparent opacity-30 line-through cursor-not-allowed pointer-events-none select-none"
                          : isTaken
                          ? "bg-[#F7F9FF] text-[#C5CADC] border-transparent opacity-40 line-through cursor-not-allowed pointer-events-none select-none"
                          : selectedBike
                          ? "bg-white text-[#1a1a2e] border-[#3B7CF4]/30 hover:border-[#3B7CF4] hover:bg-[#F0F4FF] shadow-sm cursor-pointer"
                          : "bg-[#F7F9FF] text-[#9AA3C2] border-[#E2E6F3] cursor-not-allowed"
                      }`}
                    >
                      <span>{s.label}</span>
                      {isPast ? (
                        <span className="text-[9px] uppercase tracking-wider font-bold no-underline">
                          uplynulo
                        </span>
                      ) : isTaken ? (
                        <span className="text-[9px] uppercase tracking-wider font-bold no-underline">
                          obsazeno
                        </span>
                      ) : null}
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
            placeholder="Doplnění (volitelné)"
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
              checked={consentTerms}
              onChange={(e) => setConsentTerms(e.target.checked)}
              className="mt-1 w-4 h-4 flex-shrink-0"
            />
            <span>
              Souhlasím s{" "}
              <Link
                href="/isaac-test/podminky"
                target="_blank"
                className="text-[#3B7CF4] font-bold hover:underline"
              >
                podmínkami zápůjčky
              </Link>{" "}
              — plnou odpovědností za kolo po dobu testu a podpisem protokolu před vyzvednutím.
            </span>
          </label>
          <label className="flex items-start gap-3 text-sm text-[#1a1a2e] cursor-pointer">
            <input
              type="checkbox"
              checked={consentGdpr}
              onChange={(e) => setConsentGdpr(e.target.checked)}
              className="mt-1 w-4 h-4 flex-shrink-0"
            />
            <span>
              Souhlasím se{" "}
              <Link
                href="/zasady-cookies"
                target="_blank"
                className="text-[#3B7CF4] font-bold hover:underline"
              >
                zpracováním osobních údajů
              </Link>{" "}
              pro účely rezervace a komunikace o ní.
            </span>
          </label>
          <label className="flex items-start gap-3 text-sm text-[#5A6480] cursor-pointer">
            <input
              type="checkbox"
              checked={subscribeNewsletter}
              onChange={(e) => setSubscribeNewsletter(e.target.checked)}
              className="mt-1 w-4 h-4 flex-shrink-0"
            />
            <span>
              Chci občas dostat e-mail o nových akcích, kolech a vychytávkách 100dola sport (volitelné).
            </span>
          </label>
        </div>

        {/* Důležité info před submit */}
        <div className="mt-6 rounded-xl bg-[#FFF9EB] border border-[#F3E1A8] p-4 text-xs text-[#5A4A1F] leading-relaxed">
          <div className="font-black text-[#1a1a2e] mb-1.5">Než to odešleš:</div>
          <ul className="space-y-1 list-disc list-inside marker:text-[#C9A227]">
            <li>
              <strong>Jedna rezervace na den</strong> — v jednom dni si můžeš zarezervovat
              max. jeden slot (1 hodina jízdy).
            </li>
            <li>
              <strong>Přijď o pár minut dřív</strong> — do hodiny se počítá i nastavení kola.
            </li>
          </ul>
        </div>

        {/* Summary + submit */}
        <div className="mt-5 pt-5 border-t border-[#F0F2FA] flex items-center justify-between flex-wrap gap-4">
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
        Po odeslání rezervace ti přijde potvrzovací e-mail s odkazem do Google Kalendáře.
        Ráno v den testu ti pošleme připomínku. Cancel link najdeš v obou mailech —
        nebo si rezervaci{" "}
        <Link
          href="/isaac-test/zrusit-rezervaci"
          className="text-[#E8431A] font-bold hover:underline"
        >
          zruš tady
        </Link>
        .
      </p>
    </form>

    <BikeGalleryModal bike={galleryBike} onClose={() => setGalleryBike(null)} />
    </>
  );
}

function BikeCard({
  bike,
  selected,
  onSelect,
  onOpenGallery,
}: {
  bike: IsaacBike;
  selected: boolean;
  onSelect: () => void;
  onOpenGallery: () => void;
}) {
  const hasPhotos = bike.photos.length > 0;
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-xl transition border-2 ${
        selected
          ? "border-[#3B7CF4] bg-[#F7F9FF]"
          : "border-transparent bg-[#F7F9FF] hover:border-[#E2E6F3]"
      }`}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onOpenGallery();
        }}
        className="relative w-12 h-12 rounded-lg flex-shrink-0 border border-[#E2E6F3] overflow-hidden group/photo"
        aria-label={`Galerie ${bike.model} ${bike.color}`}
      >
        {hasPhotos ? (
          <Image
            src={bike.photos[0]}
            alt=""
            fill
            className="object-cover"
            sizes="48px"
            quality={70}
          />
        ) : (
          <div className="w-full h-full" style={{ backgroundColor: bike.colorHex }} aria-hidden />
        )}
        <div className="absolute inset-0 bg-black/0 group-hover/photo:bg-black/30 transition flex items-center justify-center text-white opacity-0 group-hover/photo:opacity-100 text-[10px] font-bold">
          {hasPhotos ? "Galerie" : "Náhled"}
        </div>
      </button>
      <button
        type="button"
        onClick={onSelect}
        className="flex-1 min-w-0 text-left"
      >
        <div className="text-sm font-black text-[#1a1a2e] truncate">
          {bike.model} <span className="font-normal text-[#5A6480]">·</span> {bike.color}
        </div>
        <div className="text-xs text-[#5A6480] truncate">
          {bike.groupset} · vel. {bike.size}
        </div>
      </button>
      {selected && (
        <div className="text-[#3B7CF4] text-lg flex-shrink-0" aria-hidden>
          ✓
        </div>
      )}
    </div>
  );
}
