"use client";

import { useState } from "react";

export default function CommunityNewsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

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
            Přihlásíme tě k odběru. Oznámíme nové eventy dřív, než se zaplní.
            Žádný spam. Odhlásit se dá kdykoliv.
          </p>

          {done ? (
            <div className="flex items-center justify-center gap-3 py-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#2EAA6E]">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={3}>
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </div>
              <span className="text-white font-semibold">Perfektní! Dáme ti vědět jako prvnímu.</span>
            </div>
          ) : (
            <form
              onSubmit={(e) => { e.preventDefault(); if (email) setDone(true); }}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tvůj@email.cz"
                required
                className="flex-1 px-5 py-3.5 rounded-full text-sm bg-white/10 border border-white/15 text-white placeholder-white/30 focus:outline-none focus:border-[#2EAA6E] transition-colors"
              />
              <button
                type="submit"
                className="px-6 py-3.5 text-sm font-bold text-white rounded-full transition-opacity hover:opacity-90 shrink-0 bg-[#2EAA6E]"
                style={{ boxShadow: "0 4px 14px #2EAA6E40" }}
              >
                Hlídat akce
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
