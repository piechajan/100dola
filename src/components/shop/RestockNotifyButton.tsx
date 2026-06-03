"use client";

import { useState } from "react";

export default function RestockNotifyButton({
  supplierProductId,
  variantExternalId,
  variantLabel,
}: {
  supplierProductId: string;
  variantExternalId?: string;
  variantLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setError(null);
    setSubmitting(true);
    try {
      const r = await fetch("/api/stock-notify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          supplier_product_id: supplierProductId,
          variant_external_id: variantExternalId ?? null,
          customer_email: email.trim().toLowerCase(),
          website,
        }),
      });
      if (r.status === 429) {
        setError("Příliš mnoho žádostí — zkus to za chvíli.");
        return;
      }
      if (!r.ok) {
        setError("Nepovedlo se. Zkus to znova.");
        return;
      }
      setDone(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="mt-3 px-4 py-3 rounded-xl bg-[#D1FAE5] border border-[#A7F3D0] text-xs text-[#065F46]">
        <strong>Dáme vědět!</strong> Až naskladníme {variantLabel ? `velikost ${variantLabel}` : "tento produkt"}, dorazí ti e-mail.
      </div>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 text-xs font-bold text-[#3B7CF4] hover:underline"
      >
        🔔 Dej mi vědět až bude {variantLabel ? `velikost ${variantLabel}` : "tato položka"} skladem
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-3 p-3 rounded-xl bg-[#F7F9FF] border border-[#E2E6F3] space-y-2"
    >
      <div className="text-xs font-bold text-[#1a1a2e]">
        🔔 Notifikuj mě při naskladnění
      </div>
      <input
        type="text"
        name="website"
        autoComplete="off"
        tabIndex={-1}
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        style={{ position: "absolute", left: "-9999px" }}
      />
      <div className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tvuj@email.cz"
          className="flex-1 px-3 py-2 rounded-lg border border-[#E2E6F3] text-xs focus:outline-none focus:border-[#3B7CF4]"
        />
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 rounded-lg bg-[#1a1a2e] text-white text-xs font-bold hover:opacity-90 disabled:opacity-40 shrink-0"
        >
          {submitting ? "..." : "OK"}
        </button>
      </div>
      {error && <div className="text-[10px] text-[#991B1B]">{error}</div>}
      <div className="text-[10px] text-[#9AA3C2]">
        Jen 1 e-mail. Můžeš se kdykoliv odhlásit.
      </div>
    </form>
  );
}
