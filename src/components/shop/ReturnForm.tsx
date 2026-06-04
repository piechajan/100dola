"use client";

import { useState } from "react";

const RETURN_TYPES = [
  { value: "withdrawal", label: "Odstoupení od smlouvy (do 14 dnů)" },
  { value: "warranty", label: "Reklamace v záruce" },
  { value: "damaged", label: "Poškozeno v dopravě" },
  { value: "other", label: "Jiný důvod" },
];

export default function ReturnForm({
  orderId,
  customerEmail,
  customerName,
}: {
  orderId: string;
  customerEmail: string;
  customerName: string;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [returnType, setReturnType] = useState("withdrawal");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const payload = {
      orderId,
      customerEmail,
      returnType,
      itemsDescription: String(fd.get("itemsDescription") ?? "").trim(),
      reason: String(fd.get("reason") ?? "").trim(),
      honeypot: String(fd.get("website") ?? ""),
    };
    try {
      const res = await fetch("/api/returns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(errorLabel(data.error ?? "unknown"));
        setSubmitting(false);
        return;
      }
      setDone(true);
      setSubmitting(false);
    } catch {
      setError("Něco se pokazilo. Zkus to znovu nebo zavolej +420 739 045 057.");
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="bg-white rounded-2xl border border-[#A7F3D0] p-8 text-center">
        <div className="text-4xl mb-3">✓</div>
        <h3 className="text-xl font-black text-[#065F46] mb-2">Žádost přijata</h3>
        <p className="text-sm text-[#5A6480] leading-relaxed">
          Ozvu se ti do 2 pracovních dnů. Mezitím ti přišel potvrzovací e-mail.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#E2E6F3] p-6 md:p-8 space-y-5">
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
      />

      <div>
        <span className="text-[11px] text-[#5A6480] font-bold block mb-1">Zákazník</span>
        <p className="text-sm text-[#1a1a2e]">
          <strong>{customerName}</strong> · {customerEmail}
        </p>
      </div>

      <div>
        <span className="text-[11px] text-[#5A6480] font-bold block mb-2">
          Typ vrácení <span className="text-red-600">*</span>
        </span>
        <div className="space-y-2">
          {RETURN_TYPES.map((t) => (
            <label key={t.value} className="flex items-start gap-2 cursor-pointer">
              <input
                type="radio"
                name="returnType"
                value={t.value}
                checked={returnType === t.value}
                onChange={(e) => setReturnType(e.target.value)}
                className="mt-1 w-4 h-4 accent-[#3B7CF4]"
              />
              <span className="text-sm text-[#1a1a2e]">{t.label}</span>
            </label>
          ))}
        </div>
      </div>

      <label className="block">
        <span className="text-[11px] text-[#5A6480] font-bold block mb-1">
          Co vracíš (název produktu, počet kusů) <span className="text-red-600">*</span>
        </span>
        <input
          name="itemsDescription"
          type="text"
          required
          placeholder="Pinarello Dogma GR (velikost L, 1×)"
          className="w-full px-3 py-2.5 rounded-lg border border-[#E2E6F3] text-sm focus:border-[#3B7CF4] focus:ring-1 focus:ring-[#3B7CF4] outline-none"
        />
      </label>

      <label className="block">
        <span className="text-[11px] text-[#5A6480] font-bold block mb-1">
          Důvod / popis problému <span className="text-red-600">*</span>
        </span>
        <textarea
          name="reason"
          rows={5}
          required
          placeholder={returnType === "warranty"
            ? "Co se stalo (např. praskl rám u headtube, brzda se odešla po 100 km…)"
            : returnType === "damaged"
              ? "Co je poškozeno + kdy jsi to zjistil (např. při převzetí, hned doma…)"
              : "Stručně proč chceš vrátit (např. velikost nesedí, koupíš jinou…)"}
          className="w-full px-3 py-2.5 rounded-lg border border-[#E2E6F3] text-sm focus:border-[#3B7CF4] focus:ring-1 focus:ring-[#3B7CF4] outline-none"
        />
      </label>

      {error && (
        <div className="rounded-lg p-3 text-sm bg-red-50 text-red-700 border border-red-200">{error}</div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-[#F0F2FA]">
        <p className="text-[11px] text-[#9AA3C2] leading-relaxed">
          Po obdržení žádosti ti pošlu instrukce k odeslání zboží.
        </p>
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-3 bg-[#1a1a2e] text-white rounded-full text-sm font-bold hover:opacity-90 disabled:opacity-50 shrink-0"
        >
          {submitting ? "Odesílám…" : "Odeslat žádost"}
        </button>
      </div>
    </form>
  );
}

function errorLabel(code: string): string {
  switch (code) {
    case "order_not_found": return "Tuto objednávku neznám.";
    case "email_mismatch": return "E-mail neodpovídá objednávce.";
    case "items_required": return "Doplň prosím co vracíš.";
    case "reason_too_short": return "Napiš ještě pár slov o důvodu.";
    case "invalid_return_type": return "Vyber typ vrácení.";
    case "rate_limited": return "Příliš mnoho žádostí. Zkus to za chvíli, nebo zavolej.";
    default: return "Něco se pokazilo. Zkus to znovu, nebo zavolej +420 739 045 057.";
  }
}
