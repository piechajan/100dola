"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { trackMetaEvent } from "@/components/analytics/MetaPixel";
import { trackGoogleEvent } from "@/components/analytics/GoogleAnalytics";
import { getAttribution } from "@/lib/attribution";

export interface OvernightOption {
  value: string;
  label: string;
}

export interface FoodOption {
  value: string;
  label: string;
  note?: string;
}

function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}

const inputClass =
  "w-full px-4 py-3 rounded-xl text-sm border border-[#E2E6F3] text-[#1a1a2e] placeholder-[#C0C7D8] focus:outline-none focus:border-current transition-colors";

function SignupModal({
  eventSlug,
  eventTitle,
  color,
  overnightOptions,
  askShoes,
  foodOptions,
  onClose,
  onSuccess,
}: {
  eventSlug: string;
  eventTitle: string;
  color: string;
  overnightOptions: OvernightOption[];
  askShoes: boolean;
  foodOptions: FoodOption[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [overnight, setOvernight] = useState<string[]>([]);
  const [footSize, setFootSize] = useState("");
  const [shoeColor, setShoeColor] = useState("");
  const [food, setFood] = useState<Record<string, number>>({});
  const [ownFood, setOwnFood] = useState(false);
  const [gdpr, setGdpr] = useState(false);
  const [website, setWebsite] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const toggle = (value: string) =>
    setOvernight((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));

  const toggleFood = (value: string) =>
    setFood((prev) => {
      const next = { ...prev };
      if (next[value]) delete next[value];
      else next[value] = 1;
      return next;
    });
  const changeQty = (value: string, delta: number) =>
    setFood((prev) => ({ ...prev, [value]: Math.min(20, Math.max(1, (prev[value] ?? 1) + delta)) }));
  const toggleOwnFood = () => {
    setOwnFood((v) => !v);
    setFood({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!firstName.trim() || !lastName.trim()) {
      setError("Vyplň prosím jméno a příjmení.");
      return;
    }
    if (!gdpr) {
      setError("Pro odeslání potvrď souhlas se zpracováním osobních údajů.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/event-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "light",
          eventSlug,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          city: city.trim(),
          phone: phone.trim(),
          overnight,
          footSize: footSize.trim(),
          shoeColor: shoeColor.trim(),
          food: Object.entries(food).map(([value, qty]) => ({ value, qty })),
          ownFood,
          consentGdpr: true,
          website,
          attribution: getAttribution(),
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error || "Přihlášku se nepodařilo odeslat. Zkus to prosím znovu.");
        setSubmitting(false);
        return;
      }
      trackMetaEvent("CompleteRegistration", { content_name: "Event signup", content_category: eventSlug });
      trackGoogleEvent("sign_up", { method: "event_light", event_category: "community", event_label: eventSlug });
      onSuccess();
    } catch {
      setError("Chyba spojení. Zkontroluj připojení a zkus to znovu.");
      setSubmitting(false);
    }
  };

  return (
    <Portal>
      <div
        style={{ position: "fixed", inset: 0, zIndex: 999999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
        onClick={onClose}
      >
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(3px)" }} />
        <div
          style={{
            position: "relative",
            background: "#ffffff",
            borderRadius: 20,
            width: "100%",
            maxWidth: 440,
            boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
            maxHeight: "92vh",
            display: "flex",
            flexDirection: "column",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0F2FA] shrink-0">
            <div>
              <h3 className="font-black text-[#1a1a2e]">Přihlásit se na akci</h3>
              <p className="text-xs text-[#9AA3C2] mt-0.5">{eventTitle}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Zavřít"
              className="w-8 h-8 rounded-full bg-[#F0F2FA] flex items-center justify-center hover:bg-[#E2E6F3] transition-colors"
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 overflow-y-auto" style={{ color }}>
            <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", top: "-9999px", height: 0, width: 0, overflow: "hidden" }}>
              <label htmlFor={`hp-${eventSlug}`}>Web (nevyplňuj)</label>
              <input
                id={`hp-${eventSlug}`}
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="Jméno *" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputClass} autoComplete="given-name" />
              <input type="text" placeholder="Příjmení *" value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputClass} autoComplete="family-name" />
            </div>
            <input type="text" placeholder="Město" value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} autoComplete="address-level2" />
            <input type="tel" placeholder="Telefon (nepovinné)" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} autoComplete="tel" />

            {askShoes && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor={`foot-${eventSlug}`} className="block text-xs font-bold uppercase tracking-wider text-[#9AA3C2] mb-1.5">
                    Velikost nohy (EU)
                  </label>
                  <input
                    id={`foot-${eventSlug}`}
                    type="text"
                    inputMode="decimal"
                    placeholder="např. 40 nebo 43"
                    value={footSize}
                    onChange={(e) => setFootSize(e.target.value)}
                    maxLength={10}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor={`shoe-${eventSlug}`} className="block text-xs font-bold uppercase tracking-wider text-[#9AA3C2] mb-1.5">
                    Barva treter
                  </label>
                  <input
                    id={`shoe-${eventSlug}`}
                    type="text"
                    placeholder="např. černá"
                    value={shoeColor}
                    onChange={(e) => setShoeColor(e.target.value)}
                    maxLength={60}
                    className={inputClass}
                  />
                </div>
              </div>
            )}

            <fieldset>
              <legend className="text-xs font-bold uppercase tracking-wider text-[#9AA3C2] mb-2">Chtěl bych přespat</legend>
              <div className="space-y-2">
                {overnightOptions.map((opt) => {
                  const active = overnight.includes(opt.value);
                  return (
                    <label
                      key={opt.value}
                      className="flex items-center gap-3 rounded-xl border-2 px-3 py-2.5 cursor-pointer select-none transition-all"
                      style={{ borderColor: active ? color : "#E2E6F3", backgroundColor: active ? `${color}08` : "transparent" }}
                    >
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={() => toggle(opt.value)}
                        className="w-4 h-4 shrink-0"
                        style={{ accentColor: color }}
                      />
                      <span className="text-sm font-semibold text-[#1a1a2e]">{opt.label}</span>
                    </label>
                  );
                })}
              </div>
              <p className="text-[11px] text-[#9AA3C2] mt-2">Nepovinné — nechceš-li přespat, nech prázdné.</p>
            </fieldset>

            {foodOptions.length > 0 && (
              <fieldset>
                <legend className="text-xs font-bold uppercase tracking-wider text-[#9AA3C2] mb-2">Co chceš na gril a k ohni</legend>
                <div className="space-y-2">
                  {foodOptions.map((opt) => {
                    const qty = food[opt.value] ?? 0;
                    const active = qty > 0;
                    return (
                      <div
                        key={opt.value}
                        className="flex items-center gap-3 rounded-xl border-2 px-3 py-2.5 select-none transition-all"
                        style={{
                          borderColor: active ? color : "#E2E6F3",
                          backgroundColor: active ? `${color}08` : "transparent",
                          opacity: ownFood ? 0.45 : 1,
                        }}
                      >
                        <label className="flex items-center gap-3 flex-1 cursor-pointer min-w-0">
                          <input
                            type="checkbox"
                            checked={active}
                            disabled={ownFood}
                            onChange={() => toggleFood(opt.value)}
                            className="w-4 h-4 shrink-0"
                            style={{ accentColor: color }}
                          />
                          <span className="text-sm font-semibold text-[#1a1a2e]">
                            {opt.label}
                            {opt.note && <span className="block text-[11px] font-medium text-[#9AA3C2]">{opt.note}</span>}
                          </span>
                        </label>
                        {active && (
                          <div className="flex items-center gap-2 shrink-0">
                            <button type="button" onClick={() => changeQty(opt.value, -1)} aria-label={`Méně kusů: ${opt.label}`} className="w-7 h-7 rounded-full bg-[#F0F2FA] font-black text-[#1a1a2e]">−</button>
                            <span className="w-8 text-center text-sm font-black text-[#1a1a2e]">{qty} ks</span>
                            <button type="button" onClick={() => changeQty(opt.value, 1)} aria-label={`Více kusů: ${opt.label}`} className="w-7 h-7 rounded-full bg-[#F0F2FA] font-black text-[#1a1a2e]">+</button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <label
                    className="flex items-center gap-3 rounded-xl border-2 px-3 py-2.5 cursor-pointer select-none transition-all"
                    style={{ borderColor: ownFood ? color : "#E2E6F3", backgroundColor: ownFood ? `${color}08` : "transparent" }}
                  >
                    <input type="checkbox" checked={ownFood} onChange={toggleOwnFood} className="w-4 h-4 shrink-0" style={{ accentColor: color }} />
                    <span className="text-sm font-semibold text-[#1a1a2e]">Budu mít vlastní</span>
                  </label>
                </div>
                <p className="text-[11px] text-[#9AA3C2] mt-2">Pití si bere každý své.</p>
              </fieldset>
            )}

            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input type="checkbox" checked={gdpr} onChange={(e) => setGdpr(e.target.checked)} className="mt-0.5 w-4 h-4 shrink-0" style={{ accentColor: color }} />
              <span className="text-xs text-[#5A6480] leading-relaxed">
                Souhlasím se zpracováním osobních údajů pro účely organizace akce.{" "}
                <a href="/ochrana-osobnich-udaju" target="_blank" className="font-bold underline" style={{ color }}>Zásady</a>
              </span>
            </label>

            {error && <div className="text-xs text-[#E8431A] font-semibold">{error}</div>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 text-sm font-black text-white rounded-xl transition-all hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: color, boxShadow: `0 4px 16px ${color}40` }}
            >
              {submitting ? "Odesílám..." : "Odeslat přihlášku"}
            </button>
          </form>
        </div>
      </div>
    </Portal>
  );
}

export default function EventLightSignup({
  eventSlug,
  eventTitle,
  color,
  filledCount = 0,
  capacity,
  overnightOptions,
  askShoes = false,
  foodOptions = [],
}: {
  eventSlug: string;
  eventTitle: string;
  color: string;
  filledCount?: number;
  capacity: number;
  overnightOptions: OvernightOption[];
  askShoes?: boolean;
  foodOptions?: FoodOption[];
}) {
  const [showForm, setShowForm] = useState(false);
  const [done, setDone] = useState(false);
  const left = Math.max(0, capacity - filledCount);
  const fillPct = capacity > 0 ? Math.min(100, (filledCount / capacity) * 100) : 0;

  if (done) {
    return (
      <div className="text-center py-4">
        <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: `${color}15` }}>
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={2.5}>
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <div className="font-black text-[#1a1a2e] text-sm">Jsi přihlášený!</div>
        <div className="text-xs text-[#9AA3C2] mt-1 leading-relaxed">Díky, vidíme se na startu. Těšíme se na tebe.</div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="text-xs text-[#9AA3C2] font-medium">Kapacita</div>
          <div className="font-black text-[#1a1a2e] text-lg">{filledCount} / {capacity}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-[#9AA3C2] font-medium">Zbývá</div>
          <div className="font-black text-lg" style={{ color }}>{left} míst</div>
        </div>
      </div>
      <div className="h-2 bg-[#F0F2FA] rounded-full overflow-hidden mb-5">
        <div className="h-full rounded-full transition-all" style={{ width: `${fillPct}%`, backgroundColor: color }} />
      </div>

      <button
        onClick={() => setShowForm(true)}
        disabled={left === 0}
        className="w-full py-3.5 text-sm font-black text-white rounded-xl transition-all hover:opacity-90 hover:shadow-xl disabled:opacity-50"
        style={{ backgroundColor: color, boxShadow: `0 4px 16px ${color}40` }}
      >
        {left === 0 ? "Obsazeno" : "Přihlásit se na akci"}
      </button>
      <p className="text-[10px] text-[#C0C7D8] text-center mt-3 leading-relaxed">
        Stačí jméno a město. Zváni jsou všichni, kdo s námi aspoň jednou jeli.
      </p>

      {showForm && (
        <SignupModal
          eventSlug={eventSlug}
          eventTitle={eventTitle}
          color={color}
          overnightOptions={overnightOptions}
          askShoes={askShoes}
          foodOptions={foodOptions}
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            setDone(true);
          }}
        />
      )}
    </>
  );
}
