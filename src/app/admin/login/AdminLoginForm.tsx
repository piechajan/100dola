"use client";

import { useState } from "react";

export default function AdminLoginForm({ fromUrl }: { fromUrl: string }) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      await fetch("/api/auth/admin/request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: email.trim(), from: fromUrl }),
      });
      setSent(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="bg-[#D1FAE5] border border-[#A7F3D0] rounded-xl p-4 text-sm text-[#065F46]">
        <strong>Odkaz odeslán.</strong> Mrkni do mailu — platí 15 minut.
        Pokud nic nepřijde, e-mail nemusí být v whitelistu admin_users.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block">
        <span className="block text-xs font-bold uppercase tracking-wider text-[#5A6480] mb-1.5">
          E-mail
        </span>
        <input
          type="email"
          required
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="piecha.jan@gmail.com"
          className="w-full px-3 py-2.5 rounded-lg border border-[#E2E6F3] text-sm focus:outline-none focus:border-[#3B7CF4]"
        />
      </label>
      <button
        type="submit"
        disabled={submitting}
        className="w-full px-5 py-3 rounded-full bg-[#1a1a2e] text-white text-sm font-bold hover:opacity-90 disabled:opacity-40"
      >
        {submitting ? "Posílám…" : "Poslat odkaz na e-mail"}
      </button>
    </form>
  );
}
