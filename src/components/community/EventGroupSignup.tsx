"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { trackMetaEvent } from "@/components/analytics/MetaPixel";
import { trackGoogleEvent } from "@/components/analytics/GoogleAnalytics";
import { uploadSignupPhoto } from "@/lib/resize-image";
import {
  STAY_OPTIONS,
  formatNights,
  type EventStayType,
} from "@/data/events-signup";

interface Member {
  name: string;
  email: string;
  phone: string;
}

const MAX_MEMBERS = 10;

function addDays(iso: string, n: number): string {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}


// ── Portal ──────────────────────────────────────────────────────────────────
function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}

// ── Signup modal ──────────────────────────────────────────────────────────────
function SignupModal({
  eventSlug,
  eventTitle,
  color,
  venue,
  startISO,
  onClose,
  onSuccess,
}: {
  eventSlug: string;
  eventTitle: string;
  color: string;
  venue: string;
  startISO: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const presetFrom = startISO;
  const presetTo = addDays(startISO, 3); // pá → po
  const presetLabel = formatNights(presetFrom, presetTo) ?? "pá → po";

  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [stayType, setStayType] = useState<EventStayType>("pension");
  const [nightMode, setNightMode] = useState<"preset" | "custom">("preset");
  const [customFrom, setCustomFrom] = useState(presetFrom);
  const [customTo, setCustomTo] = useState(presetTo);
  const [note, setNote] = useState("");
  const [gdpr, setGdpr] = useState(false);
  const [publicConsent, setPublicConsent] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setPhotoFile(f);
    setPhotoPreview(URL.createObjectURL(f));
  };

  const addMember = () => {
    if (members.length >= MAX_MEMBERS) return;
    setMembers((prev) => [...prev, { name: "", email: "", phone: "" }]);
  };
  const removeMember = (idx: number) =>
    setMembers((prev) => prev.filter((_, i) => i !== idx));
  const updateMember = (idx: number, field: keyof Member, value: string) =>
    setMembers((prev) => prev.map((m, i) => (i === idx ? { ...m, [field]: value } : m)));

  const isPension = stayType === "pension";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (website.length > 0) {
      // Honeypot — předstíráme úspěch, nic neposíláme.
      onSuccess();
      return;
    }
    if (!gdpr) {
      setError("Pro odeslání potřebujeme tvůj souhlas se zpracováním údajů.");
      return;
    }

    const cleanMembers = members
      .filter((m) => m.name.trim().length > 0)
      .map((m) => ({ name: m.name.trim(), email: m.email.trim(), phone: m.phone.trim() }));

    const nightsFrom = isPension ? (nightMode === "preset" ? presetFrom : customFrom) : "";
    const nightsTo = isPension ? (nightMode === "preset" ? presetTo : customTo) : "";

    setSubmitting(true);
    try {
      // Fotku nahráváme jen se souhlasem se zveřejněním účasti.
      let photoUrl = "";
      if (publicConsent && photoFile) {
        photoUrl = await uploadSignupPhoto(photoFile);
      }

      const res = await fetch("/api/event-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventSlug,
          leadName: leadName.trim(),
          leadEmail: leadEmail.trim(),
          leadPhone: leadPhone.trim(),
          members: cleanMembers,
          stayType,
          nightsFrom,
          nightsTo,
          note: note.trim(),
          consentGdpr: true,
          publicConsent,
          photoUrl,
          website,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error || "Přihlášku se nepodařilo odeslat. Zkus to prosím znovu.");
        setSubmitting(false);
        return;
      }
      trackMetaEvent("CompleteRegistration", {
        content_name: "Event signup",
        content_category: eventSlug,
      });
      trackGoogleEvent("sign_up", {
        method: "event_group",
        event_category: "community",
        event_label: eventSlug,
      });
      onSuccess();
    } catch {
      setError("Chyba spojení. Zkontroluj připojení a zkus to znovu.");
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl text-sm border border-[#E2E6F3] text-[#1a1a2e] placeholder-[#C0C7D8] focus:outline-none focus:border-current transition-colors";

  return (
    <Portal>
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 999999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
        }}
        onClick={onClose}
      >
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(3px)" }} />
        <div
          style={{
            position: "relative",
            background: "#ffffff",
            borderRadius: 20,
            width: "100%",
            maxWidth: 480,
            boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
            maxHeight: "92vh",
            display: "flex",
            flexDirection: "column",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0F2FA] shrink-0">
            <div>
              <h3 className="font-black text-[#1a1a2e]">Přihlásit se na akci</h3>
              <p className="text-xs text-[#9AA3C2] mt-0.5">{eventTitle}</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#F0F2FA] flex items-center justify-center hover:bg-[#E2E6F3] transition-colors"
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 overflow-y-auto" style={{ color }}>
            {/* Honeypot */}
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

            {/* Lead */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#9AA3C2] mb-2">Ty (hlavní kontakt)</div>
              <div className="space-y-3">
                <input type="text" placeholder="Jméno a příjmení *" value={leadName}
                  onChange={(e) => setLeadName(e.target.value)} required minLength={2} className={inputClass} />
                <input type="email" placeholder="E-mail *" value={leadEmail}
                  onChange={(e) => setLeadEmail(e.target.value)} required className={inputClass} />
                <input type="tel" placeholder="Telefon *" value={leadPhone}
                  onChange={(e) => setLeadPhone(e.target.value)} required minLength={6} className={inputClass} />
              </div>
            </div>

            {/* Members */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-bold uppercase tracking-wider text-[#9AA3C2]">
                  Další členové{members.length > 0 ? ` (${members.length})` : ""}
                </div>
                <span className="text-[11px] text-[#C0C7D8]">jméno stačí</span>
              </div>

              {members.length > 0 && (
                <div className="space-y-3 mb-3">
                  {members.map((m, i) => (
                    <div key={i} className="rounded-xl border border-[#E2E6F3] p-3 space-y-2 relative">
                      <button
                        type="button"
                        onClick={() => removeMember(i)}
                        aria-label="Odebrat člena"
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#F0F2FA] flex items-center justify-center hover:bg-[#FDE3DC] text-[#9AA3C2] hover:text-[#E8431A] transition-colors"
                      >
                        <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path d="M18 6 6 18M6 6l12 12" />
                        </svg>
                      </button>
                      <input type="text" placeholder={`Jméno člena ${i + 1} *`} value={m.name}
                        onChange={(e) => updateMember(i, "name", e.target.value)} className={inputClass} />
                      <div className="grid grid-cols-2 gap-2">
                        <input type="email" placeholder="E-mail" value={m.email}
                          onChange={(e) => updateMember(i, "email", e.target.value)} className={inputClass} />
                        <input type="tel" placeholder="Telefon" value={m.phone}
                          onChange={(e) => updateMember(i, "phone", e.target.value)} className={inputClass} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {members.length < MAX_MEMBERS ? (
                <button
                  type="button"
                  onClick={addMember}
                  className="w-full py-2.5 rounded-xl border-2 border-dashed text-sm font-bold transition-colors"
                  style={{ borderColor: `${color}55`, color }}
                >
                  + Přidat člena {members.length === 0 ? "(rodina / skupina)" : ""}
                </button>
              ) : (
                <p className="text-[11px] text-[#9AA3C2] text-center">Maximum {MAX_MEMBERS} členů — víc řešíme e-mailem.</p>
              )}
            </div>

            {/* Stay */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#9AA3C2] mb-2">Pobyt (pro celou skupinu)</div>
              <div className="space-y-2">
                {STAY_OPTIONS.map((opt) => {
                  const active = stayType === opt.value;
                  return (
                    <label
                      key={opt.value}
                      className="flex items-start gap-3 cursor-pointer rounded-xl border-2 p-3 transition-all select-none"
                      style={{
                        borderColor: active ? color : "#E2E6F3",
                        backgroundColor: active ? `${color}08` : "transparent",
                      }}
                    >
                      <input
                        type="radio"
                        name="stayType"
                        checked={active}
                        onChange={() => setStayType(opt.value)}
                        className="sr-only"
                      />
                      <span className="text-lg leading-none mt-0.5">{opt.icon}</span>
                      <span>
                        <span className="block text-sm font-bold text-[#1a1a2e]">{opt.label}</span>
                        <span className="block text-xs text-[#9AA3C2] mt-0.5 leading-relaxed">{opt.description}</span>
                      </span>
                    </label>
                  );
                })}
              </div>

              {/* Nights — jen pro ubytování */}
              {isPension && (
                <div className="mt-3 rounded-xl bg-[#F7F9FF] p-3 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input type="radio" name="nightMode" checked={nightMode === "preset"} onChange={() => setNightMode("preset")} />
                    <span className="text-[#1a1a2e]">{presetLabel}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input type="radio" name="nightMode" checked={nightMode === "custom"} onChange={() => setNightMode("custom")} />
                    <span className="text-[#1a1a2e]">Vlastní termín</span>
                  </label>
                  {nightMode === "custom" && (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <label className="text-[11px] text-[#9AA3C2]">
                        Od
                        <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className={inputClass} />
                      </label>
                      <label className="text-[11px] text-[#9AA3C2]">
                        Do
                        <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} className={inputClass} />
                      </label>
                    </div>
                  )}
                  <p className="text-[11px] text-[#9AA3C2] leading-relaxed">
                    Ubytování v {venue} zařídíme my — konkrétní pokoj a kapacitu doladíme po přihlášce.
                  </p>
                </div>
              )}
            </div>

            {/* Note */}
            <textarea
              placeholder="Poznámka (nepovinné) — cokoliv, co bychom měli vědět"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className={inputClass}
            />

            {/* Zveřejnit účast — social proof */}
            <div
              className="rounded-xl border-2 p-3 transition-all"
              style={{
                borderColor: publicConsent ? color : "#E2E6F3",
                backgroundColor: publicConsent ? `${color}08` : "transparent",
              }}
            >
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <div
                  className="w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all"
                  style={{ borderColor: publicConsent ? color : "#C0C7D8", backgroundColor: publicConsent ? color : "transparent" }}
                >
                  {publicConsent && (
                    <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={3}>
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  )}
                </div>
                <input type="checkbox" checked={publicConsent} onChange={(e) => setPublicConsent(e.target.checked)} className="sr-only" />
                <span>
                  <span className="block text-sm font-bold text-[#1a1a2e]">Zveřejnit mou účast</span>
                  <span className="block text-xs text-[#9AA3C2] mt-0.5 leading-relaxed">
                    Tvoje jméno (a fotka, když přidáš) se ukáže v seznamu „kdo jede" — ať ostatní vidí, že se jede, třeba se přidá i kamarád. Bez souhlasu jsi jen „Účastník".
                  </span>
                </span>
              </label>

              {publicConsent && (
                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[#E2E6F3]">
                  <label
                    htmlFor={`photo-${eventSlug}`}
                    className="w-12 h-12 rounded-full border-2 border-dashed flex items-center justify-center overflow-hidden cursor-pointer shrink-0"
                    style={{ borderColor: `${color}55` }}
                  >
                    {photoPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photoPreview} alt="náhled" className="w-full h-full object-cover" />
                    ) : (
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#C0C7D8" strokeWidth={1.5}>
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    )}
                  </label>
                  <div>
                    <label htmlFor={`photo-${eventSlug}`} className="text-sm font-semibold cursor-pointer" style={{ color }}>
                      {photoPreview ? "Změnit fotku" : "Přidat fotku"}
                    </label>
                    <p className="text-xs text-[#C0C7D8] mt-0.5">Nepovinné · ať tě ostatní poznají</p>
                  </div>
                  <input id={`photo-${eventSlug}`} type="file" accept="image/*" className="sr-only" onChange={handlePhoto} />
                </div>
              )}
            </div>

            {/* GDPR */}
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <div
                className="w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all"
                style={{ borderColor: gdpr ? color : "#C0C7D8", backgroundColor: gdpr ? color : "transparent" }}
              >
                {gdpr && (
                  <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={3}>
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                )}
              </div>
              <input type="checkbox" checked={gdpr} onChange={(e) => setGdpr(e.target.checked)} className="sr-only" />
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
            <p className="text-[10px] text-[#C0C7D8] text-center leading-relaxed">
              Ubytování i parkování řešíme my. Po odeslání ti přijde potvrzení na e-mail.
            </p>
          </form>
        </div>
      </div>
    </Portal>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function EventGroupSignup({
  eventSlug,
  eventTitle,
  color,
  venue,
  startISO,
  filledCount = 0,
  capacity,
}: {
  eventSlug: string;
  eventTitle: string;
  color: string;
  venue: string;
  startISO: string;
  filledCount?: number;
  capacity: number;
}) {
  const [showForm, setShowForm] = useState(false);
  const [done, setDone] = useState(false);
  const left = Math.max(0, capacity - filledCount);
  const fillPct = capacity > 0 ? Math.min(100, (filledCount / capacity) * 100) : 0;

  if (done) {
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
        <div className="font-black text-[#1a1a2e] text-sm">Přihláška odeslána!</div>
        <div className="text-xs text-[#9AA3C2] mt-1 leading-relaxed">
          Potvrzení jsme ti poslali na e-mail. Ubytování a parkování zařídíme my a ozveme se ti s detaily.
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Kapacita — reálný počet přihlášených z DB */}
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

      <div className="mb-4">
        <div className="text-xs text-[#9AA3C2] font-medium uppercase tracking-wider mb-1">Přihlášení</div>
        <div className="font-black text-[#1a1a2e] text-lg leading-tight mb-1">Jeď sám nebo vezmi partu</div>
        <p className="text-xs text-[#5A6480] leading-relaxed">
          Přihlas sebe i celou skupinu (rodina, kamarádi, klub). Ubytování v {venue} i parkování zařídíme my.
        </p>
      </div>

      <button
        onClick={() => setShowForm(true)}
        className="w-full py-3.5 text-sm font-black text-white rounded-xl transition-all hover:opacity-90 hover:shadow-xl"
        style={{ backgroundColor: color, boxShadow: `0 4px 16px ${color}40` }}
      >
        Přihlásit se na akci
      </button>
      <p className="text-[10px] text-[#C0C7D8] text-center mt-3 leading-relaxed">
        Můžeš přidat až 10 dalších členů. Ubytování i parkování řešíme my.
      </p>

      {showForm && (
        <SignupModal
          eventSlug={eventSlug}
          eventTitle={eventTitle}
          color={color}
          venue={venue}
          startISO={startISO}
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
