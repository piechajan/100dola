"use client";

import { useState } from "react";

export default function CancelRequestForm() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch("/api/isaac-test/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch {
      // anti-enum: vždy success
    } finally {
      setDone(true);
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="bg-white rounded-2xl border border-[#E2E6F3] p-6 text-center">
        <div className="text-4xl mb-3">📬</div>
        <h2 className="text-lg font-black text-[#1a1a2e] mb-2">Pokud máš aktivní rezervaci, link je na cestě.</h2>
        <p className="text-sm text-[#5A6480]">
          Zkontroluj schránku <strong>{email}</strong> (i spam). V mailu klikneš na link u rezervace, kterou chceš zrušit. Slot se ihned uvolní.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="bg-white rounded-2xl border border-[#E2E6F3] p-6 space-y-4">
      <input
        type="email"
        required
        autoFocus
        placeholder="tvuj@email.cz"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border border-[#E2E6F3] text-sm focus:outline-none focus:border-[#E8431A]"
      />
      <button
        type="submit"
        disabled={submitting || !email.includes("@")}
        className="w-full px-5 py-3 rounded-full bg-[#E8431A] text-white text-sm font-black hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {submitting ? "Posílám..." : "Poslat link na zrušení"}
      </button>
    </form>
  );
}
