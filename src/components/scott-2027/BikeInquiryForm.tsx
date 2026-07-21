"use client";

import { useState } from "react";

interface Props {
  bikeModel: string;
  bikeVariant?: string;
  /** Když je zadáno, formulář zobrazí výběr modelu (dropdown) místo fixní varianty. */
  models?: string[];
  className?: string;
}

/**
 * Generic poptávkový formulář pro modely, které ještě nejsou v e-shopu.
 * Zatím (12.6.2026) Scott 2027 lineup je jen na poptávku — Jan potvrdí
 * dostupnost telefonicky/mailem podle alokace od distributora.
 *
 * Posílá POST na /api/bike-inquiry → ukládá do Supabase + notifikace Janovi.
 */
export default function BikeInquiryForm({ bikeModel, bikeVariant, models, className }: Props) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const fd = new FormData(e.currentTarget);
    const selectedModel = fd.get("model_select");
    const data = {
      bike_model: bikeModel,
      bike_variant: models
        ? selectedModel
          ? String(selectedModel)
          : null
        : (bikeVariant ?? null),
      full_name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      notes: String(fd.get("notes") ?? ""),
      consent: fd.get("consent") === "on",
    };
    if (!data.consent || !data.email || !data.full_name) {
      setStatus("error");
      return;
    }
    try {
      const res = await fetch("/api/bike-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("send_failed");
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className={`bg-[#E8F5E9] border border-[#A5D6A7] rounded-2xl p-6 ${className ?? ""}`}>
        <div className="text-sm font-bold text-[#1B5E20] mb-1">Poptávka odeslaná ✓</div>
        <p className="text-sm text-[#1a1a2e] leading-snug">
          Ozveme se ti během 24 h. Mezitím můžeš zavolat na{" "}
          <a href="tel:+420739045057" className="font-bold text-[#3B7CF4]">
            +420 739 045 057
          </a>{" "}
          nebo napsat na{" "}
          <a href="mailto:piecha.jan@gmail.com" className="font-bold text-[#3B7CF4]">
            piecha.jan@gmail.com
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className={`bg-[#F7F9FF] border border-[#E2E6F3] rounded-2xl p-6 ${className ?? ""}`}>
      <div className="text-xs font-bold uppercase tracking-wider text-[#3B7CF4] mb-1">
        Nezávazná poptávka
      </div>
      <h3 className="text-lg md:text-xl font-black text-[#1a1a2e] mb-1">
        {bikeModel}
        {bikeVariant && <span className="text-[#5A6480] font-normal"> · {bikeVariant}</span>}
      </h3>
      <p className="text-sm text-[#5A6480] mb-4 leading-snug">
        Modely ze Scott 2027 lineupu zatím nejsou v e-shopu. Pošli nám detail a ozveme se ti s
        dostupností, cenou v Kč a termínem.
      </p>

      {models && models.length > 0 && (
        <label className="block mb-3">
          <span className="text-xs font-bold text-[#1a1a2e]">Model, který tě zajímá</span>
          <select
            name="model_select"
            defaultValue={bikeVariant ?? ""}
            className="w-full mt-1 px-3 py-2 border border-[#E2E6F3] rounded-lg text-sm bg-white focus:outline-none focus:border-[#3B7CF4]"
          >
            <option value="">— vyber model (nebo nech volné) —</option>
            {models.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <label className="block">
          <span className="text-xs font-bold text-[#1a1a2e]">Jméno a příjmení *</span>
          <input
            name="name"
            type="text"
            required
            className="w-full mt-1 px-3 py-2 border border-[#E2E6F3] rounded-lg text-sm focus:outline-none focus:border-[#3B7CF4]"
          />
        </label>
        <label className="block">
          <span className="text-xs font-bold text-[#1a1a2e]">E-mail *</span>
          <input
            name="email"
            type="email"
            required
            className="w-full mt-1 px-3 py-2 border border-[#E2E6F3] rounded-lg text-sm focus:outline-none focus:border-[#3B7CF4]"
          />
        </label>
      </div>
      <label className="block mb-3">
        <span className="text-xs font-bold text-[#1a1a2e]">Telefon (volitelně)</span>
        <input
          name="phone"
          type="tel"
          className="w-full mt-1 px-3 py-2 border border-[#E2E6F3] rounded-lg text-sm focus:outline-none focus:border-[#3B7CF4]"
        />
      </label>
      <label className="block mb-3">
        <span className="text-xs font-bold text-[#1a1a2e]">Co tě zajímá (velikost, varianta, termín)</span>
        <textarea
          name="notes"
          rows={3}
          placeholder="Např. Spark RC Pro vel. L, červené barvě, dostupnost na podzim 2026…"
          className="w-full mt-1 px-3 py-2 border border-[#E2E6F3] rounded-lg text-sm focus:outline-none focus:border-[#3B7CF4]"
        />
      </label>

      <label className="flex items-start gap-2 mb-4 cursor-pointer">
        <input name="consent" type="checkbox" required className="mt-0.5" />
        <span className="text-xs text-[#5A6480] leading-snug">
          Souhlasím se zpracováním osobních údajů pro vyřízení poptávky. Údaje neukládáme déle, než
          je nutné.
        </span>
      </label>

      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full bg-[#3B7CF4] hover:bg-[#5C92F6] disabled:opacity-50 text-white font-bold text-sm px-6 py-3 rounded-xl transition"
      >
        {status === "sending" ? "Odesílám…" : "Poptat tento model →"}
      </button>

      {status === "error" && (
        <p className="text-xs text-red-600 mt-2">
          Něco se pokazilo. Zkus to znovu nebo zavolej na +420 739 045 057.
        </p>
      )}

      <p className="text-[11px] text-[#5A6480] mt-3 text-center">
        Nebo nám rovnou zavolej:{" "}
        <a href="tel:+420739045057" className="font-bold text-[#3B7CF4]">
          +420 739 045 057
        </a>
      </p>
    </form>
  );
}
