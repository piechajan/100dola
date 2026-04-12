"use client";

import { useState } from "react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <section className="py-16 md:py-20" style={{ backgroundColor: "#EEF3FF" }}>
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
        <div className="max-w-2xl mx-auto text-center">

          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="w-5 h-px bg-[#9AA3C2]" />
            <span className="text-xs tracking-[0.18em] uppercase font-bold text-[#9AA3C2]">Newsletter</span>
            <span className="w-5 h-px bg-[#9AA3C2]" />
          </div>

          <h2 className="text-3xl md:text-4xl font-black text-[#1a1a2e] mb-3">
            Jednou za čas.{" "}
            <span style={{ color: "#3B7CF4" }}>Jen to, co stojí za to.</span>
          </h2>

          <p className="text-[#9AA3C2] mb-8 leading-relaxed">
            Nové eventy, doporučení vybavení a novinky z komunity. Bez spamu. Odhlásit se dá kdykoliv.
          </p>

          {submitted ? (
            <div className="flex items-center justify-center gap-3 py-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#3B7CF4]">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={3}>
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </div>
              <span className="text-[#1a1a2e] font-semibold">Super! Uvidíme se v inboxu.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tvůj@email.cz"
                required
                className="flex-1 px-5 py-3.5 rounded-full text-sm bg-white border border-[#E2E6F3] text-[#1a1a2e] placeholder-[#9AA3C2] focus:outline-none focus:border-[#3B7CF4] transition-colors"
              />
              <button
                type="submit"
                className="px-6 py-3.5 text-sm font-bold text-white rounded-full transition-opacity hover:opacity-90 shrink-0 bg-[#3B7CF4]"
                style={{ boxShadow: "0 4px 14px #3B7CF430" }}
              >
                Přihlásit se
              </button>
            </form>
          )}

          <p className="mt-4 text-xs text-[#C0C7D8]">
            Odesláním souhlasíš se zpracováním emailu pro zasílání newsletteru.
          </p>
        </div>
      </div>
    </section>
  );
}
