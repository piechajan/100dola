"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      setError(true);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F7FF]">
      <div className="w-full max-w-sm mx-4">

        {/* Logo */}
        <div className="flex justify-center mb-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-sport-box.png?v=2" alt="100dola sport" style={{ height: 160, width: "auto" }} />
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-[#E2E6F3] p-8 shadow-sm">
          <h1 className="text-xl font-black text-[#1a1a2e] mb-1">Preview přístup</h1>
          <p className="text-sm text-[#9AA3C2] mb-6">Zadej heslo pro zobrazení webu.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
              placeholder="Heslo"
              autoFocus
              required
              className={`w-full px-4 py-3.5 rounded-xl text-sm border text-[#1a1a2e] placeholder-[#C0C7D8] focus:outline-none transition-colors ${
                error ? "border-red-300 bg-red-50" : "border-[#E2E6F3] focus:border-[#3B7CF4]"
              }`}
            />

            {error && (
              <p className="text-xs text-red-500 font-medium">Špatné heslo. Zkus to znovu.</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 text-sm font-bold text-white rounded-xl transition-opacity hover:opacity-90 disabled:opacity-60 bg-[#3B7CF4]"
              style={{ boxShadow: "0 4px 14px #3B7CF430" }}
            >
              {loading ? "Ověřuji..." : "Vstoupit"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[#C0C7D8] mt-6">
          100dola — interní preview
        </p>
      </div>
    </div>
  );
}
