"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SIGNUP_STATUSES, SIGNUP_STATUS_META, type SignupStatus } from "@/data/signup-status";

export default function SignupStatusEditor({
  id,
  currentStatus,
  currentNote,
}: {
  id: string;
  currentStatus: SignupStatus;
  currentNote: string | null;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<SignupStatus>(currentStatus);
  const [note, setNote] = useState(currentNote ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const dirty = status !== currentStatus || note !== (currentNote ?? "");

  const save = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch(`/api/admin/event-signups/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNote: note }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error || "Nepodařilo se uložit.");
        setSaving(false);
        return;
      }
      setSaved(true);
      router.refresh();
    } catch {
      setError("Síťová chyba.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as SignupStatus);
            setSaved(false);
          }}
          className="px-3 py-2 text-xs font-semibold border border-[#E2E6F3] rounded-lg bg-white focus:outline-none focus:border-[#3B7CF4]"
        >
          {SIGNUP_STATUSES.map((s) => (
            <option key={s} value={s}>
              {SIGNUP_STATUS_META[s].label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={save}
          disabled={saving || !dirty}
          className="px-4 py-2 text-xs font-bold text-white rounded-lg bg-[#1a1a2e] hover:opacity-90 disabled:opacity-40"
        >
          {saving ? "Ukládám…" : "Uložit"}
        </button>
        {saved && !dirty && <span className="text-xs text-[#10B981] font-semibold">✓ Uloženo</span>}
      </div>

      <textarea
        value={note}
        onChange={(e) => {
          setNote(e.target.value);
          setSaved(false);
        }}
        rows={2}
        placeholder="Poznámka — co je potřeba dořešit (u nás / u zákazníka)…"
        className="w-full px-3 py-2 text-xs border border-[#E2E6F3] rounded-lg focus:outline-none focus:border-[#3B7CF4]"
      />

      {error && <div className="text-xs text-red-600 font-semibold">{error}</div>}
    </div>
  );
}
