"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const HIDDEN_PREFIXES = ["/admin", "/checkout", "/objednavka"];

export default function ContactBubble() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [productSlug, setProductSlug] = useState<string | null>(null);

  useEffect(() => {
    // Pokud jsme na /shop/<slug>, vytáhneme slug do server kontextu (Jan vidí o čem dotaz je)
    const m = pathname?.match(/^\/shop\/([^/]+)$/);
    setProductSlug(m ? m[1] : null);
  }, [pathname]);

  // ESC zavře popup
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const hidden = HIDDEN_PREFIXES.some((p) => pathname?.startsWith(p));
  if (hidden) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim(),
      phone: String(fd.get("phone") ?? "").trim(),
      message: String(fd.get("message") ?? "").trim(),
      honeypot: String(fd.get("website") ?? ""),
      pageUrl: typeof window !== "undefined" ? window.location.href : null,
      productSlug,
    };
    try {
      const res = await fetch("/api/contact-widget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(errorLabel(data.error ?? "unknown"));
        setSubmitting(false);
        return;
      }
      setDone(true);
      setSubmitting(false);
    } catch {
      setError("Něco se pokazilo. Zkus to znovu nebo zavolej +420 739 045 057.");
      setSubmitting(false);
    }
  }

  return (
    <>
      {/* Floating bubble */}
      {!open && (
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            setDone(false);
            setError(null);
          }}
          aria-label="Napiš nám"
          className="fixed bottom-5 right-5 z-40 w-14 h-14 rounded-full bg-[#3B7CF4] text-white shadow-lg hover:scale-105 transition-transform flex items-center justify-center"
          style={{ boxShadow: "0 8px 24px rgba(59,124,244,0.45)" }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        </button>
      )}

      {/* Popup */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-end justify-end p-3 sm:p-5"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-2xl border border-[#E2E6F3] w-full sm:w-[380px] max-h-[90vh] overflow-auto"
            style={{ boxShadow: "0 16px 60px rgba(26,26,46,0.2)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between p-4 border-b border-[#F0F2FA]">
              <div>
                <div className="text-sm font-black text-[#1a1a2e]">Napiš nám</div>
                <div className="text-[11px] text-[#9AA3C2]">Odpovím do 24 h · Jan</div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Zavřít"
                className="text-[#9AA3C2] hover:text-[#1a1a2e]"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            {done ? (
              <div className="p-5 text-center">
                <div className="text-2xl mb-2">✓</div>
                <div className="text-sm font-bold text-[#1a1a2e] mb-1">Dostal jsem zprávu.</div>
                <p className="text-xs text-[#5A6480] leading-relaxed">
                  Odpovím do 24 hodin. Mezitím ti přišel potvrzovací e-mail.
                </p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="mt-4 px-4 py-2 bg-[#1a1a2e] text-white rounded-full text-xs font-bold"
                >
                  Zavřít
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-4 space-y-3">
                {/* Honeypot */}
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
                />

                <Field name="name" placeholder="Tvoje jméno" required />
                <Field name="email" type="email" placeholder="E-mail" required />
                <Field name="phone" type="tel" placeholder="Telefon (nepovinné)" />
                <Textarea name="message" placeholder="Tvůj dotaz…" required rows={4} />

                {productSlug && (
                  <div className="text-[11px] text-[#9AA3C2]">
                    Dotaz k produktu: <code>{productSlug}</code>
                  </div>
                )}

                {error && (
                  <div className="text-[11px] text-red-700 bg-[#FEE2E2] rounded-lg p-2">{error}</div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full px-4 py-2.5 bg-[#3B7CF4] text-white rounded-full text-sm font-bold hover:opacity-90 disabled:opacity-50"
                >
                  {submitting ? "Posílám…" : "Odeslat zprávu"}
                </button>

                <p className="text-[10px] text-[#9AA3C2] leading-relaxed">
                  Odesláním souhlasíš se zpracováním údajů za účelem odpovědi na dotaz.
                  Údaje uchováme jen po dobu vyřízení (cca 90 dní).
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function Field(props: { name: string; placeholder: string; type?: string; required?: boolean }) {
  return (
    <input
      name={props.name}
      type={props.type ?? "text"}
      placeholder={props.placeholder}
      required={props.required}
      className="w-full px-3 py-2 rounded-lg border border-[#E2E6F3] text-sm focus:border-[#3B7CF4] focus:ring-1 focus:ring-[#3B7CF4] outline-none"
    />
  );
}

function Textarea(props: { name: string; placeholder: string; rows: number; required?: boolean }) {
  return (
    <textarea
      name={props.name}
      placeholder={props.placeholder}
      rows={props.rows}
      required={props.required}
      className="w-full px-3 py-2 rounded-lg border border-[#E2E6F3] text-sm focus:border-[#3B7CF4] focus:ring-1 focus:ring-[#3B7CF4] outline-none resize-none"
    />
  );
}

function errorLabel(code: string): string {
  switch (code) {
    case "name_required":
      return "Doplň prosím jméno.";
    case "invalid_email":
      return "E-mail nevypadá platně.";
    case "message_too_short":
      return "Napiš ještě pár slov o čem to je.";
    case "message_too_long":
      return "Tahle zpráva je už dost dlouhá — zkrať ji prosím.";
    case "rate_limited":
      return "Příliš mnoho zpráv. Zkus to za chvíli, nebo zavolej +420 739 045 057.";
    case "no_db":
      return "Něco se pokazilo na backendu. Zavolej +420 739 045 057.";
    default:
      return "Něco se pokazilo. Zkus to znovu, nebo zavolej +420 739 045 057.";
  }
}
