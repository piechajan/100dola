"use client";

import { useState } from "react";

export default function CommunityNewsletter() {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "newsletter",
          id: crypto.randomUUID(),
          registeredAt: new Date().toISOString(),
          email: email.trim(),
          consent: true,
          website,
        }),
      });
      if (!res.ok) throw new Error("Server error");
      setDone(true);
    } catch {
      setError("Něco se nepovedlo. Zkus to znovu za chvíli.");
      setSubmitting(false);
    }
  };

  return (
    <section id="newsletter" className="py-16 md:py-20 bg-[#1a1a2e]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
        <div className="max-w-2xl mx-auto text-center">

          <div className="text-4xl mb-5">🚴</div>

          <h2 className="text-3xl md:text-4xl font-black text-white mb-3">
            Buď první, kdo ví{" "}
            <span style={{ color: "#2EAA6E" }}>o nové akci.</span>
          </h2>

          <p className="text-white/40 mb-8 leading-relaxed">
            Nové akce ti pošleme do 24 h po zveřejnění. Před akcí, na kterou se přihlásíš, dostaneš ještě připomínku 48 h předem. Žádný spam, kdykoliv se odhlásíš.
          </p>

          {done ? (
            <div className="flex items-center justify-center gap-3 py-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#2EAA6E]">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={3}>
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </div>
              <span className="text-white font-semibold">Hotovo. Welcome mail máš ve schránce.</span>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              {/* Honeypot — pro reálné uživatele neviditelné; vyplněné = spam */}
              <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", top: "-9999px", height: 0, width: 0, overflow: "hidden" }}>
                <label htmlFor="website-url-hp-newsletter">Web (nevyplňuj)</label>
                <input
                  id="website-url-hp-newsletter"
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tvůj@email.cz"
                required
                disabled={submitting}
                className="flex-1 px-5 py-3.5 rounded-full text-sm bg-white/10 border border-white/15 text-white placeholder-white/30 focus:outline-none focus:border-[#2EAA6E] transition-colors disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3.5 text-sm font-bold text-white rounded-full transition-opacity hover:opacity-90 disabled:opacity-60 shrink-0 bg-[#2EAA6E]"
                style={{ boxShadow: "0 4px 14px #2EAA6E40" }}
              >
                {submitting ? "Ukládám..." : "Hlídat akce"}
              </button>
            </form>
          )}

          {error && (
            <div className="mt-4 text-sm text-red-300">{error}</div>
          )}
        </div>
      </div>
    </section>
  );
}
