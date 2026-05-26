"use client";

import { useState } from "react";
import Link from "next/link";
import { trackMetaEvent } from "@/components/analytics/MetaPixel";
import { trackGoogleEvent } from "@/components/analytics/GoogleAnalytics";

const TOPICS = [
  { value: "general", label: "Obecná otázka" },
  { value: "sport", label: "100dola sport — kola, vybavení" },
  { value: "malaga", label: "100dola Malaga — přeprava / pobyty" },
  { value: "lab", label: "100dola Lab — servis kol" },
  { value: "community", label: "Open Miles Clinic — akce" },
  { value: "store", label: "Kamenná prodejna Šternberk" },
] as const;

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [topic, setTopic] = useState<(typeof TOPICS)[number]["value"]>("general");
  const [message, setMessage] = useState("");
  const [consentGdpr, setConsentGdpr] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  const canSubmit =
    !submitting &&
    name.trim().length >= 2 &&
    email.includes("@") &&
    message.trim().length >= 5 &&
    consentGdpr;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setResult(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, email, phone: phone || undefined, topic, message,
          consentGdpr: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResult({ ok: false, message: data.error || "Odeslání selhalo" });
        return;
      }
      setResult({
        ok: true,
        message: "Zpráva odeslána. Ozveme se ti během 48 hodin.",
      });
      trackMetaEvent("Lead", {
        content_name: "Contact form",
        content_category: topic,
      });
      trackGoogleEvent("generate_lead", {
        event_category: "contact",
        event_label: topic,
        value: 1,
      });
      setName(""); setEmail(""); setPhone(""); setMessage("");
      setTopic("general"); setConsentGdpr(false);
    } catch (e) {
      setResult({ ok: false, message: e instanceof Error ? e.message : "Network error" });
    } finally {
      setSubmitting(false);
    }
  }

  if (result?.ok) {
    return (
      <div className="bg-white rounded-2xl border border-[#E2E6F3] p-6 md:p-8 text-center">
        <div className="text-4xl mb-3">📨</div>
        <h3 className="text-xl font-black text-[#1a1a2e] mb-2">{result.message}</h3>
        <p className="text-sm text-[#5A6480] mb-5">
          Pro rychlé věci: <a href="tel:+420739045057" className="text-[#3B7CF4] font-bold">+420 739 045 057</a>.
        </p>
        <button
          type="button"
          onClick={() => setResult(null)}
          className="text-xs font-bold text-[#3B7CF4] hover:underline"
        >
          Poslat další zprávu
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="bg-white rounded-2xl border border-[#E2E6F3] p-6 md:p-8 space-y-4">
      {result && !result.ok && (
        <div className="rounded-xl p-3 bg-red-50 border border-red-200 text-sm text-red-900">
          {result.message}
        </div>
      )}

      <input
        type="text" name="website" tabIndex={-1} autoComplete="off"
        className="absolute -left-[9999px]" aria-hidden="true"
      />

      <div>
        <label className="block text-xs font-bold text-[#5A6480] uppercase tracking-wider mb-1.5">
          Téma
        </label>
        <select
          value={topic}
          onChange={(e) => setTopic(e.target.value as typeof topic)}
          className="w-full px-4 py-3 rounded-xl border border-[#E2E6F3] text-sm bg-white focus:outline-none focus:border-[#3B7CF4]"
        >
          {TOPICS.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input
          type="text" placeholder="Jméno *" required
          value={name} onChange={(e) => setName(e.target.value)}
          className="px-4 py-3 rounded-xl border border-[#E2E6F3] text-sm focus:outline-none focus:border-[#3B7CF4]"
        />
        <input
          type="email" placeholder="E-mail *" required
          value={email} onChange={(e) => setEmail(e.target.value)}
          className="px-4 py-3 rounded-xl border border-[#E2E6F3] text-sm focus:outline-none focus:border-[#3B7CF4]"
        />
      </div>

      <input
        type="tel" placeholder="Telefon (volitelné)"
        value={phone} onChange={(e) => setPhone(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border border-[#E2E6F3] text-sm focus:outline-none focus:border-[#3B7CF4]"
      />

      <textarea
        placeholder="Tvoje zpráva *" required minLength={5}
        value={message} onChange={(e) => setMessage(e.target.value)}
        rows={5}
        className="w-full px-4 py-3 rounded-xl border border-[#E2E6F3] text-sm focus:outline-none focus:border-[#3B7CF4]"
      />

      <label className="flex items-start gap-3 text-sm text-[#1a1a2e] cursor-pointer">
        <input
          type="checkbox" checked={consentGdpr}
          onChange={(e) => setConsentGdpr(e.target.checked)}
          className="mt-1 w-4 h-4 flex-shrink-0"
        />
        <span>
          Souhlasím se{" "}
          <Link
            href="/ochrana-osobnich-udaju"
            target="_blank"
            className="text-[#3B7CF4] font-bold hover:underline"
          >
            zpracováním osobních údajů
          </Link>{" "}
          pro účely odpovědi na tuto zprávu.
        </span>
      </label>

      <button
        type="submit" disabled={!canSubmit}
        className="w-full px-6 py-3 rounded-full bg-[#3B7CF4] text-white text-sm font-black hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {submitting ? "Odesílám..." : "Odeslat zprávu"}
      </button>
    </form>
  );
}
