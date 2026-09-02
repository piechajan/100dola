"use client";

import { useState } from "react";

export default function FeedbackTestButton() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const send = async () => {
    setLoading(true);
    setMsg(null);
    setErr(null);
    try {
      const res = await fetch("/api/admin/event-feedback/send-test", { method: "POST" });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(d.error || "Nepodařilo se odeslat.");
        return;
      }
      setMsg(`Zkušební dotazník odeslán na ${d.sentTo ?? "tvůj e-mail"}.`);
    } catch {
      setErr("Síťová chyba.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={send}
        disabled={loading}
        className="px-4 py-2 text-xs font-bold rounded-full border border-[#C9DCFC] text-[#3B7CF4] hover:bg-[#F0F4FF] disabled:opacity-50"
      >
        {loading ? "Odesílám…" : "✉ Poslat zkušební dotazník na můj mail"}
      </button>
      {msg && <span className="text-[11px] text-[#10B981] font-semibold">{msg}</span>}
      {err && <span className="text-[11px] text-red-600 font-semibold">{err}</span>}
    </div>
  );
}
