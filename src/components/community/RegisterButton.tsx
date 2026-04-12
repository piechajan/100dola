"use client";

import { useState } from "react";

export default function RegisterButton({
  color,
  spotsLeft,
}: {
  color: string;
  spotsLeft: number;
}) {
  const [state, setState] = useState<"idle" | "form" | "done">("idle");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  if (state === "done") {
    return (
      <div className="text-center py-4">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
          style={{ backgroundColor: `${color}15` }}
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={2.5}>
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <div className="font-black text-[#1a1a2e] text-sm">Přihlášení potvrzeno!</div>
        <div className="text-xs text-[#9AA3C2] mt-1">Potvrzení přijde na email.</div>
      </div>
    );
  }

  if (state === "form") {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (name && email) setState("done");
        }}
        className="space-y-3"
      >
        <input
          type="text"
          placeholder="Jméno a příjmení"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-xl text-sm border border-[#E2E6F3] text-[#1a1a2e] placeholder-[#C0C7D8] focus:outline-none focus:border-current transition-colors"
          style={{ "--tw-ring-color": color } as React.CSSProperties}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-xl text-sm border border-[#E2E6F3] text-[#1a1a2e] placeholder-[#C0C7D8] focus:outline-none transition-colors"
        />
        <button
          type="submit"
          className="w-full py-3 text-sm font-black text-white rounded-xl transition-opacity hover:opacity-90"
          style={{ backgroundColor: color, boxShadow: `0 4px 14px ${color}35` }}
        >
          Potvrdit přihlášení
        </button>
        <button
          type="button"
          onClick={() => setState("idle")}
          className="w-full text-xs text-[#C0C7D8] hover:text-[#9AA3C2] transition-colors py-1"
        >
          Zrušit
        </button>
      </form>
    );
  }

  return (
    <button
      onClick={() => setState("form")}
      className="w-full py-3.5 text-sm font-black text-white rounded-xl transition-all hover:opacity-90 hover:shadow-xl"
      style={{ backgroundColor: color, boxShadow: `0 4px 16px ${color}40` }}
    >
      {spotsLeft > 0 ? "Přihlásit se na akci" : "Zapsat na čekací listinu"}
    </button>
  );
}
