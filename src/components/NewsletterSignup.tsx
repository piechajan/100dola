"use client";

import { useState } from "react";

interface Props {
  variant?: "footer" | "inline";
  source?: "shop" | "community" | "malaga" | "lab";
}

export default function NewsletterSignup({ variant = "footer", source = "shop" }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<"pending" | "already_confirmed" | "already_pending" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const payload = {
      email: String(fd.get("email") ?? "").trim(),
      name: String(fd.get("name") ?? "").trim(),
      source,
      honeypot: String(fd.get("website") ?? ""),
    };
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { ok: boolean; status?: string; error?: string };
      if (!res.ok || !data.ok) {
        setError(errorLabel(data.error ?? "unknown"));
        setSubmitting(false);
        return;
      }
      setDone(
        data.status === "already_confirmed"
          ? "already_confirmed"
          : data.status === "already_pending"
            ? "already_pending"
            : "pending",
      );
      setSubmitting(false);
    } catch {
      setError("Něco se pokazilo. Zkus to znovu.");
      setSubmitting(false);
    }
  }

  if (done === "already_confirmed") {
    return (
      <div className="text-xs text-[#9AA3C2]">
        ✓ Tenhle e-mail máme už potvrzený. Děkujeme!
      </div>
    );
  }
  if (done === "already_pending") {
    return (
      <div className="text-xs text-[#9AA3C2]">
        Mail s potvrzením už ti šel — zkontroluj inbox (i spam).
      </div>
    );
  }
  if (done === "pending") {
    return (
      <div className="text-xs text-[#3B7CF4]">
        ✓ Skoro hotovo. Klikni na potvrzovací link v mailu, který jsme ti poslali.
      </div>
    );
  }

  if (variant === "footer") {
    return (
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
        />
        <div className="flex gap-2">
          <input
            type="email"
            name="email"
            required
            placeholder="tvuj@email.cz"
            className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-sm text-white placeholder:text-white/40 focus:border-white/30 focus:outline-none"
          />
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-white text-[#1a1a2e] rounded-lg text-xs font-bold hover:opacity-90 disabled:opacity-50 whitespace-nowrap"
          >
            {submitting ? "…" : "Odebírat"}
          </button>
        </div>
        {error && <div className="text-[11px] text-red-400">{error}</div>}
        <p className="text-[10px] text-white/40 leading-relaxed">
          Cca 1× měsíčně. Odhlásit kdykoliv. GDPR-friendly.
        </p>
      </form>
    );
  }

  // inline variant — pro hero / CTA bloky
  return (
    <form onSubmit={handleSubmit} className="space-y-3 max-w-md">
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <input
          type="text"
          name="name"
          placeholder="Jméno (nepovinné)"
          className="px-3 py-2.5 rounded-lg border border-[#E2E6F3] text-sm focus:border-[#3B7CF4] focus:ring-1 focus:ring-[#3B7CF4] outline-none"
        />
        <input
          type="email"
          name="email"
          required
          placeholder="tvuj@email.cz"
          className="px-3 py-2.5 rounded-lg border border-[#E2E6F3] text-sm focus:border-[#3B7CF4] focus:ring-1 focus:ring-[#3B7CF4] outline-none"
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="w-full px-4 py-2.5 bg-[#1a1a2e] text-white rounded-full text-sm font-bold hover:opacity-90 disabled:opacity-50"
      >
        {submitting ? "Odesílám…" : "Odebírat newsletter"}
      </button>
      {error && <div className="text-xs text-red-700">{error}</div>}
      <p className="text-[11px] text-[#9AA3C2] leading-relaxed">
        Cca 1× měsíčně novinky a tipy. Odhlásit kdykoliv jedním klikem.
      </p>
    </form>
  );
}

function errorLabel(code: string): string {
  switch (code) {
    case "invalid_email": return "E-mail nevypadá platně.";
    default: return "Něco se pokazilo. Zkus to znovu.";
  }
}
