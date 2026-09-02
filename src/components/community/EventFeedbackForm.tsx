"use client";

import { useState } from "react";
import { FEEDBACK_QUESTIONS, FEEDBACK_PS } from "@/data/event-feedback";

type AnswerValue = string | number;

export default function EventFeedbackForm({
  eventSlug,
  signupId,
  color,
}: {
  eventSlug: string;
  signupId?: string;
  color: string;
}) {
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [website, setWebsite] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: string, v: AnswerValue) => setAnswers((a) => ({ ...a, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (website.length > 0) {
      setDone(true);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/event-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventSlug, signupId: signupId || "", answers, website }),
      });
      if (!res.ok) {
        setError("Nepodařilo se odeslat. Zkus to prosím znovu.");
        setSubmitting(false);
        return;
      }
      setDone(true);
    } catch {
      setError("Chyba spojení.");
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="text-center py-10">
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${color}15` }}>
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={2.5}><path d="M20 6 9 17l-5-5" /></svg>
        </div>
        <div className="font-black text-[#1a1a2e] text-lg">Díky moc!</div>
        <p className="text-sm text-[#5A6480] mt-1 max-w-md mx-auto">
          Tvoje zpětná vazba nám pomůže to vypilovat. Vážíme si každé odpovědi.
        </p>
      </div>
    );
  }

  const btn = (active: boolean) => ({
    borderColor: active ? color : "#E2E6F3",
    backgroundColor: active ? color : "transparent",
    color: active ? "#fff" : "#5A6480",
  });

  return (
    <form onSubmit={submit} className="space-y-6">
      {/* Honeypot */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", height: 0, width: 0, overflow: "hidden" }}>
        <input type="text" name="website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
      </div>

      <div className="rounded-xl p-4 text-sm text-[#5A6480] leading-relaxed" style={{ background: `${color}0F` }}>
        {FEEDBACK_PS}
      </div>

      {FEEDBACK_QUESTIONS.map((q) => (
        <div key={q.key}>
          <label className="block text-sm font-bold text-[#1a1a2e] mb-2">
            {q.label}
            {!q.optional && <span style={{ color }}> *</span>}
          </label>

          {q.kind === "rating5" && (
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => set(q.key, n)}
                  className="w-10 h-10 rounded-lg text-sm font-black border-2 transition-all" style={btn(answers[q.key] === n)}>
                  {n}
                </button>
              ))}
            </div>
          )}

          {q.kind === "nps" && (
            <div className="flex flex-wrap gap-1.5">
              {Array.from({ length: 11 }, (_, n) => (
                <button key={n} type="button" onClick={() => set(q.key, n)}
                  className="w-9 h-9 rounded-lg text-xs font-black border-2 transition-all" style={btn(answers[q.key] === n)}>
                  {n}
                </button>
              ))}
            </div>
          )}

          {q.kind === "choice" && (
            <div className="flex flex-wrap gap-2">
              {q.choices?.map((c) => (
                <button key={c.value} type="button" onClick={() => set(q.key, answers[q.key] === c.value ? "" : c.value)}
                  className="px-4 py-2 rounded-full text-sm font-bold border-2 transition-all" style={btn(answers[q.key] === c.value)}>
                  {c.label}
                </button>
              ))}
            </div>
          )}

          {q.kind === "text" && (
            <textarea rows={2} value={(answers[q.key] as string) ?? ""} onChange={(e) => set(q.key, e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm border border-[#E2E6F3] text-[#1a1a2e] placeholder-[#C0C7D8] focus:outline-none focus:border-current transition-colors"
              placeholder="Napiš na rovinu…" style={{ color }} />
          )}
        </div>
      ))}

      {error && <div className="text-sm text-[#E8431A] font-semibold">{error}</div>}

      <button type="submit" disabled={submitting}
        className="w-full py-3.5 text-sm font-black text-white rounded-xl transition-all hover:opacity-90 disabled:opacity-60"
        style={{ backgroundColor: color, boxShadow: `0 4px 16px ${color}40` }}>
        {submitting ? "Odesílám…" : "Odeslat zpětnou vazbu"}
      </button>
      <p className="text-[11px] text-[#9AA3C2] text-center">Anonymní pro ostatní — čte to jen Jan.</p>
    </form>
  );
}
