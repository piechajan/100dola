"use client";

import { useState } from "react";

export default function AccountantLoginForm() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch("/api/auth/accountant/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } catch {
      // Pořád zobrazíme sent — anti-enum
      setSent(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-2xl p-6 bg-emerald-50 border border-emerald-200 text-center">
        <div className="text-2xl mb-2">📬</div>
        <p className="text-sm font-bold text-emerald-900 mb-1">Pokud je e-mail v allowlistu, odkaz je na cestě.</p>
        <p className="text-xs text-emerald-800">
          Mrkni do schránky (i do spamu). Odkaz platí 15 minut.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <input
        type="email"
        required
        autoFocus
        placeholder="tvuj@email.cz"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border border-[#E2E6F3] text-sm focus:outline-none focus:border-[#3B7CF4]"
      />
      <button
        type="submit"
        disabled={submitting || !email.includes("@")}
        className="w-full px-4 py-3 rounded-full bg-[#3B7CF4] text-white text-sm font-black hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {submitting ? "Odesílám..." : "Poslat přihlašovací odkaz"}
      </button>
    </form>
  );
}
