"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Turnstile, { isTurnstileConfigured } from "@/components/Turnstile";

type Interest = "kolo" | "cestovni" | "urazove";

const OPTIONS: { value: Interest; label: string; hint: string }[] = [
  {
    value: "kolo",
    label: "Pojištění kola — krádež a poškození",
    hint: "Kryje krádež, vandalismus, nehodu i poškození při přepravě. Vhodné hlavně u dražších kol (100 000 Kč+).",
  },
  {
    value: "cestovni",
    label: "Cestovní pojištění — zahraničí / Malaga",
    hint: "Léčebné výlohy v zahraničí vč. cyklistiky jako rizikového sportu, úraz, zavazadla, storno.",
  },
  {
    value: "urazove",
    label: "Úrazové / zdravotní pojištění cyklisty",
    hint: "Trvalé následky, doba léčení, denní odškodné. Platí i doma, nejen na cestách.",
  },
];

/**
 * Poptávkový formulář pro pojištění. Přednastaví zájem z `?zajem=kolo|cestovni|urazove`
 * (prokliky napříč webem cílí přímo na relevantní typ). POST → /api/pojisteni-inquiry
 * → e-mail Janovi (partner = kamarádova pojišťovací firma se ozve zpět).
 */
export default function PojisteniForm({ className }: { className?: string }) {
  const params = useSearchParams();
  const preset = params.get("zajem");
  const initial = new Set<Interest>(
    OPTIONS.map((o) => o.value).filter((v) => v === preset),
  );

  const [interests, setInterests] = useState<Set<Interest>>(initial);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");

  function toggle(v: Interest) {
    setInterests((prev) => {
      const next = new Set(prev);
      if (next.has(v)) next.delete(v);
      else next.add(v);
      return next;
    });
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg("");
    if (interests.size === 0) {
      setStatus("error");
      setErrorMsg("Vyber alespoň jeden typ pojištění, který tě zajímá.");
      return;
    }
    setStatus("sending");
    const fd = new FormData(e.currentTarget);
    const payload = {
      full_name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      interests: Array.from(interests),
      notes: String(fd.get("notes") ?? ""),
      consent: fd.get("consent") === "on",
      company: String(fd.get("company") ?? ""), // honeypot
      turnstileToken: turnstileToken || undefined,
    };
    if (!payload.consent || !payload.email || !payload.full_name) {
      setStatus("error");
      setErrorMsg("Vyplň jméno, e-mail a souhlas se zpracováním údajů.");
      return;
    }
    try {
      const res = await fetch("/api/pojisteni-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("send_failed");
      setStatus("sent");
    } catch {
      setStatus("error");
      setErrorMsg("Něco se pokazilo. Zkus to znovu nebo zavolej na +420 739 045 057.");
    }
  }

  if (status === "sent") {
    return (
      <div className={`bg-[#E8F5E9] border border-[#A5D6A7] rounded-2xl p-6 ${className ?? ""}`}>
        <div className="text-sm font-bold text-[#1B5E20] mb-1">Poptávka odeslaná ✓</div>
        <p className="text-sm text-[#1a1a2e] leading-snug">
          Ozveme se ti s konkrétní nabídkou a podmínkami. Poptávku zpracovává náš partner —
          pojišťovací a finančně-poradenská firma, se kterou spolupracujeme. Mezitím můžeš zavolat na{" "}
          <a href="tel:+420739045057" className="font-bold text-[#3B7CF4]">
            +420 739 045 057
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form
      id="poptavka"
      onSubmit={onSubmit}
      className={`bg-[#F7F9FF] border border-[#E2E6F3] rounded-2xl p-6 scroll-mt-24 ${className ?? ""}`}
    >
      <div className="text-xs font-bold uppercase tracking-wider text-[#3B7CF4] mb-1">
        Nezávazná poptávka
      </div>
      <h3 className="text-lg md:text-xl font-black text-[#1a1a2e] mb-1">
        Chci nabídku pojištění
      </h3>
      <p className="text-sm text-[#5A6480] mb-4 leading-snug">
        Vyber, co tě zajímá, nech na sebe kontakt a my (resp. náš pojišťovací partner) se ti ozveme
        s konkrétní nabídkou a podmínkami. Nezávazné, žádné závazky předem.
      </p>

      <fieldset className="mb-4">
        <legend className="text-xs font-bold text-[#1a1a2e] mb-2">Zajímá mě *</legend>
        <div className="space-y-2">
          {OPTIONS.map((o) => (
            <label
              key={o.value}
              className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition ${
                interests.has(o.value)
                  ? "border-[#3B7CF4] bg-white"
                  : "border-[#E2E6F3] bg-white hover:border-[#B9C6E8]"
              }`}
            >
              <input
                type="checkbox"
                checked={interests.has(o.value)}
                onChange={() => toggle(o.value)}
                className="mt-0.5 shrink-0"
              />
              <span>
                <span className="block text-sm font-bold text-[#1a1a2e]">{o.label}</span>
                <span className="block text-xs text-[#5A6480] leading-snug mt-0.5">{o.hint}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <label className="block">
          <span className="text-xs font-bold text-[#1a1a2e]">Jméno a příjmení *</span>
          <input
            name="name"
            type="text"
            required
            className="w-full mt-1 px-3 py-2 border border-[#E2E6F3] rounded-lg text-sm bg-white focus:outline-none focus:border-[#3B7CF4]"
          />
        </label>
        <label className="block">
          <span className="text-xs font-bold text-[#1a1a2e]">E-mail *</span>
          <input
            name="email"
            type="email"
            required
            className="w-full mt-1 px-3 py-2 border border-[#E2E6F3] rounded-lg text-sm bg-white focus:outline-none focus:border-[#3B7CF4]"
          />
        </label>
      </div>
      <label className="block mb-3">
        <span className="text-xs font-bold text-[#1a1a2e]">Telefon (volitelně)</span>
        <input
          name="phone"
          type="tel"
          className="w-full mt-1 px-3 py-2 border border-[#E2E6F3] rounded-lg text-sm bg-white focus:outline-none focus:border-[#3B7CF4]"
        />
      </label>
      <label className="block mb-3">
        <span className="text-xs font-bold text-[#1a1a2e]">Poznámka (volitelně)</span>
        <textarea
          name="notes"
          rows={3}
          placeholder="Např. hodnota kola, kam a kdy jedeš, jak často jezdíš v zahraničí…"
          className="w-full mt-1 px-3 py-2 border border-[#E2E6F3] rounded-lg text-sm bg-white focus:outline-none focus:border-[#3B7CF4]"
        />
      </label>

      {/* Honeypot — skryté pole, člověk nevyplní. */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] w-px h-px opacity-0"
      />

      <label className="flex items-start gap-2 mb-4 cursor-pointer">
        <input name="consent" type="checkbox" required className="mt-0.5" />
        <span className="text-xs text-[#5A6480] leading-snug">
          Souhlasím se zpracováním osobních údajů pro vyřízení poptávky a jejich předání
          spolupracujícímu pojišťovacímu partnerovi. Údaje neukládáme déle, než je nutné.
        </span>
      </label>

      <Turnstile onToken={setTurnstileToken} className="mb-3" />

      <button
        type="submit"
        disabled={status === "sending" || (isTurnstileConfigured && !turnstileToken)}
        className="w-full bg-[#3B7CF4] hover:bg-[#5C92F6] disabled:opacity-50 text-white font-bold text-sm px-6 py-3 rounded-xl transition"
      >
        {status === "sending" ? "Odesílám…" : "Chci nezávaznou nabídku →"}
      </button>

      {status === "error" && errorMsg && (
        <p className="text-xs text-red-600 mt-2">{errorMsg}</p>
      )}

      <p className="text-[11px] text-[#5A6480] mt-3 text-center">
        Nebo rovnou zavolej:{" "}
        <a href="tel:+420739045057" className="font-bold text-[#3B7CF4]">
          +420 739 045 057
        </a>
      </p>
    </form>
  );
}
