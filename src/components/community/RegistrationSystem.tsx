"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

export interface Participant {
  id: string;
  firstName: string;
  lastName: string;
  nickname: string;
  club: string;
  city: string;
  phone: string;
  email: string;
  photoDataUrl: string;
  isVip: boolean;
  eventSlug: string;
  registeredAt: string;
}

// Per-event key (for display on event page)
function storageKey(slug: string) {
  return `omc_registrations_${slug}`;
}

// Global contacts key — all registrants across all events, for future mailing
const GLOBAL_CONTACTS_KEY = "omc_contacts_all";

function loadParticipants(slug: string): Participant[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(storageKey(slug)) || "[]");
  } catch {
    return [];
  }
}

function saveParticipant(slug: string, p: Participant) {
  // Save to per-event list
  const existing = loadParticipants(slug);
  localStorage.setItem(storageKey(slug), JSON.stringify([...existing, p]));

  // Save to global contacts list (deduplicated by email)
  try {
    const contacts: Participant[] = JSON.parse(localStorage.getItem(GLOBAL_CONTACTS_KEY) || "[]");
    const alreadyExists = contacts.some((c) => c.email === p.email);
    if (!alreadyExists) {
      localStorage.setItem(GLOBAL_CONTACTS_KEY, JSON.stringify([...contacts, p]));
    } else {
      // Update existing contact — keep latest data, merge isVip flag
      const updated = contacts.map((c) =>
        c.email === p.email ? { ...c, ...p, isVip: c.isVip || p.isVip } : c
      );
      localStorage.setItem(GLOBAL_CONTACTS_KEY, JSON.stringify(updated));
    }
  } catch {
    // non-critical
  }

  // Also persist server-side via API (for future mailing/CRM use)
  fetch("/api/registrations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...p, photoDataUrl: "" }), // strip photo from server payload
  }).catch(() => { /* non-blocking */ });
}

// ── Portal — renders children at document.body level ─────────────────────────
function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}

// ── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({
  participant,
  size = 36,
  className = "",
}: {
  participant: Participant;
  size?: number;
  className?: string;
}) {
  const initials = `${participant.firstName[0]}${participant.lastName[0]}`.toUpperCase();
  if (participant.photoDataUrl) {
    return (
      <img
        src={participant.photoDataUrl}
        alt={`${participant.firstName} ${participant.lastName}`}
        width={size}
        height={size}
        className={`rounded-full object-cover border-2 border-white ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className={`rounded-full border-2 border-white flex items-center justify-center text-white font-black text-xs shrink-0 ${className}`}
      style={{ width: size, height: size, background: "linear-gradient(135deg, #3B7CF4, #2EAA6E)" }}
    >
      {initials}
    </div>
  );
}

// ── Participants Modal ────────────────────────────────────────────────────────
function ParticipantsModal({
  participants,
  onClose,
  color,
}: {
  participants: Participant[];
  onClose: () => void;
  color: string;
}) {
  return (
    <Portal>
      <div
        style={{
          position: "fixed", inset: 0, zIndex: 999999,
          display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
        }}
        onClick={onClose}
      >
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(3px)" }} />
        <div
          style={{
            position: "relative", background: "#ffffff", borderRadius: 20,
            width: "100%", maxWidth: 440,
            boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
            overflow: "hidden",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0F2FA]">
            <div>
              <h3 className="font-black text-[#1a1a2e]">Kdo jede</h3>
              <p className="text-xs text-[#9AA3C2] mt-0.5">{participants.length} registrovaných účastníků</p>
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

          <div className="max-h-[60vh] overflow-y-auto divide-y divide-[#F0F2FA]">
            {participants.length === 0 ? (
              <div className="py-12 text-center text-[#C0C7D8]">
                <div className="text-3xl mb-2">🚴</div>
                <div className="text-sm">Zatím nikdo. Buď první!</div>
              </div>
            ) : (
              participants.map((p) => (
                <div key={p.id} className="flex items-center gap-4 px-6 py-4 hover:bg-[#FAFAFA] transition-colors">
                  <Avatar participant={p} size={44} />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-[#1a1a2e] truncate flex items-center gap-1.5">
                      {p.firstName} {p.lastName}
                      {p.nickname && <span className="text-[#9AA3C2] font-normal">„{p.nickname}"</span>}
                      {p.isVip && (
                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-600 shrink-0">VIP</span>
                      )}
                    </div>
                    <div className="text-xs text-[#9AA3C2] truncate">
                      {[p.city, p.club].filter(Boolean).join(" · ")}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Portal>
  );
}

// ── Registration Modal ────────────────────────────────────────────────────────
function RegistrationModal({
  eventSlug,
  color,
  onClose,
  onSuccess,
}: {
  eventSlug: string;
  color: string;
  onClose: () => void;
  onSuccess: (p: Participant) => void;
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [nickname, setNickname] = useState("");
  const [club, setClub] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [photoDataUrl, setPhotoDataUrl] = useState("");
  const [isVip, setIsVip] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  // Honeypot — pro reálné uživatele neviditelné. Bot ho vyplní → server tichá 200.
  const [website, setWebsite] = useState("");

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoDataUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Honeypot — když je vyplněné, předstíráme úspěch ale nikam neukládáme.
    if (website.length > 0) {
      setTimeout(() => onClose(), 400);
      return;
    }
    const participant: Participant = {
      id: crypto.randomUUID(),
      firstName,
      lastName,
      nickname,
      club,
      city,
      phone,
      email,
      photoDataUrl,
      isVip,
      eventSlug,
      registeredAt: new Date().toISOString(),
    };
    try {
      saveParticipant(eventSlug, participant);
    } catch {
      // localStorage may be unavailable — continue anyway
    }
    setTimeout(() => onSuccess(participant), 400);
  };

  const inputClass = "w-full px-4 py-3 rounded-xl text-sm border border-[#E2E6F3] text-[#1a1a2e] placeholder-[#C0C7D8] focus:outline-none focus:border-current transition-colors";
  const photoInputId = `photo-upload-${eventSlug}`;

  return (
    <Portal>
      <div
        style={{
          position: "fixed", inset: 0, zIndex: 999999,
          display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
        }}
        onClick={onClose}
      >
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(3px)" }} />
        <div
          style={{
            position: "relative", background: "#ffffff", borderRadius: 20,
            width: "100%", maxWidth: 440,
            boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
            maxHeight: "90vh", display: "flex", flexDirection: "column",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0F2FA] shrink-0">
            <h3 className="font-black text-[#1a1a2e]">Přihlásit se na akci</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#F0F2FA] flex items-center justify-center hover:bg-[#E2E6F3] transition-colors"
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-3 overflow-y-auto">
            {/* Photo upload */}
            <div className="flex items-center gap-4 mb-4">
              <label
                htmlFor={photoInputId}
                className="w-16 h-16 rounded-full border-2 border-dashed border-[#E2E6F3] flex items-center justify-center overflow-hidden cursor-pointer hover:border-current transition-colors shrink-0"
                style={{ color }}
              >
                {photoDataUrl ? (
                  <img src={photoDataUrl} alt="foto" className="w-full h-full object-cover" />
                ) : (
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#C0C7D8" strokeWidth={1.5}>
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                )}
              </label>
              <div>
                <label htmlFor={photoInputId} className="text-sm font-semibold cursor-pointer" style={{ color }}>
                  {photoDataUrl ? "Změnit fotku" : "Nahrát profilovou fotku"}
                </label>
                <p className="text-xs text-[#C0C7D8] mt-0.5">Nepovinné · JPG nebo PNG</p>
              </div>
              <input
                id={photoInputId}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handlePhoto}
              />
            </div>

            {/* Honeypot — neviditelné pole pro detekci botů */}
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

            {/* Name */}
            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="Jméno *" value={firstName}
                onChange={(e) => setFirstName(e.target.value)} required className={inputClass} />
              <input type="text" placeholder="Příjmení *" value={lastName}
                onChange={(e) => setLastName(e.target.value)} required className={inputClass} />
            </div>
            <input type="text" placeholder="Přezdívka" value={nickname}
              onChange={(e) => setNickname(e.target.value)} className={inputClass} />
            <input type="text" placeholder="Klub nebo skupina" value={club}
              onChange={(e) => setClub(e.target.value)} className={inputClass} />
            <input type="text" placeholder="Město" value={city}
              onChange={(e) => setCity(e.target.value)} className={inputClass} />
            <input type="email" placeholder="E-mail *" value={email}
              onChange={(e) => setEmail(e.target.value)} required className={inputClass} />
            <div>
              <input type="tel" placeholder="Telefon" value={phone}
                onChange={(e) => setPhone(e.target.value)} className={inputClass} />
              <p className="text-[11px] text-[#9AA3C2] mt-1.5 leading-relaxed px-1">
                Hodí se, pokud dorazíš později nebo tě nabereme po cestě.
              </p>
            </div>

            {/* VIP checkbox */}
            <label
              className="flex items-start gap-3 cursor-pointer rounded-xl border-2 p-4 transition-all select-none"
              style={{
                borderColor: isVip ? color : "#E2E6F3",
                backgroundColor: isVip ? `${color}08` : "transparent",
              }}
            >
              <div
                className="w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all"
                style={{
                  borderColor: isVip ? color : "#C0C7D8",
                  backgroundColor: isVip ? color : "transparent",
                }}
              >
                {isVip && (
                  <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={3}>
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                )}
              </div>
              <input
                type="checkbox"
                checked={isVip}
                onChange={(e) => setIsVip(e.target.checked)}
                className="sr-only"
              />
              <div>
                <div className="text-sm font-bold text-[#1a1a2e]">Stát se VIP členem 100dola</div>
                <div className="text-xs text-[#9AA3C2] mt-0.5 leading-relaxed">
                  Jako první dostaneš pozvánky na eventy, exkluzivní nabídky a časem třeba i body za každou akci nebo výhodnější nákup vybavení.
                </div>
              </div>
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 text-sm font-black text-white rounded-xl transition-all hover:opacity-90 disabled:opacity-60 mt-2"
              style={{ backgroundColor: color, boxShadow: `0 4px 16px ${color}40` }}
            >
              {submitting ? "Přihlašuji..." : "Potvrdit přihlášení"}
            </button>
            <p className="text-[10px] text-[#C0C7D8] text-center leading-relaxed">
              Přihlášením souhlasíš s podmínkami účasti. Odhlásit se lze do 48h před akcí.
            </p>
          </form>
        </div>
      </div>
    </Portal>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function RegistrationSystem({
  eventSlug,
  color,
  spotsLeft,
  filledCount,
  capacity,
}: {
  eventSlug: string;
  color: string;
  spotsLeft: number;
  filledCount: number;
  capacity: number;
}) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showList, setShowList] = useState(false);
  const [done, setDone] = useState(false);
  const almostFull = (filledCount / capacity) * 100 >= 75;
  const fillPct = Math.min(100, ((filledCount + participants.length) / capacity) * 100);
  const totalFilled = filledCount + participants.length;
  const totalLeft = capacity - totalFilled;

  useEffect(() => {
    setParticipants(loadParticipants(eventSlug));
  }, [eventSlug]);

  const handleSuccess = (p: Participant) => {
    setParticipants((prev) => [...prev, p]);
    setShowForm(false);
    setDone(true);
  };

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
        <div className="font-black text-[#1a1a2e] text-sm">Přihlášení potvrzeno!</div>
        <div className="text-xs text-[#9AA3C2] mt-1 mb-4">Uvidíme tě na startu.</div>
        <button
          onClick={() => setShowList(true)}
          className="text-xs font-semibold underline underline-offset-2"
          style={{ color }}
        >
          Podívat se, kdo jede
        </button>
        {showList && (
          <ParticipantsModal participants={participants} onClose={() => setShowList(false)} color={color} />
        )}
      </div>
    );
  }

  return (
    <>
      {/* Capacity bar */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="text-xs text-[#9AA3C2] font-medium">Kapacita</div>
          <div className="font-black text-[#1a1a2e] text-lg">{totalFilled} / {capacity}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-[#9AA3C2] font-medium">Zbývá</div>
          <div className="font-black text-lg" style={{ color: almostFull ? "#E8431A" : color }}>
            {totalLeft} míst
          </div>
        </div>
      </div>

      <div className="h-2 bg-[#F0F2FA] rounded-full overflow-hidden mb-2">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${fillPct}%`, backgroundColor: almostFull ? "#E8431A" : color }}
        />
      </div>

      {almostFull && (
        <div className="text-xs font-semibold text-[#E8431A] mb-3">
          ⚠️ Skoro plno — registruj se rychle
        </div>
      )}

      {/* Participant avatars */}
      <button
        onClick={() => setShowList(true)}
        className="flex items-center gap-2 mb-5 mt-3 hover:opacity-80 transition-opacity group"
      >
        <div className="flex -space-x-2">
          {participants.slice(0, 5).map((p) => (
            <Avatar key={p.id} participant={p} size={32} />
          ))}
          {participants.length === 0 && Array.from({ length: Math.min(5, filledCount) }).map((_, i) => (
            <div
              key={i}
              className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white"
              style={{ backgroundColor: color, opacity: 0.7 + i * 0.06 }}
            >
              {String.fromCharCode(65 + i)}
            </div>
          ))}
        </div>
        <span className="text-xs text-[#9AA3C2] group-hover:text-[#5A6480] transition-colors">
          {participants.length > 0
            ? `${participants.length} registrovaných — zobrazit`
            : `a dalších ${Math.max(0, filledCount - 5)} jede`
          }
        </span>
      </button>

      {/* CTA */}
      <button
        onClick={() => setShowForm(true)}
        disabled={totalLeft <= 0}
        className="w-full py-3.5 text-sm font-black text-white rounded-xl transition-all hover:opacity-90 hover:shadow-xl disabled:opacity-50"
        style={{ backgroundColor: color, boxShadow: `0 4px 16px ${color}40` }}
      >
        {totalLeft > 0 ? "Přihlásit se na akci" : "Zapsat na čekací listinu"}
      </button>
      <p className="text-[10px] text-[#C0C7D8] text-center mt-3 leading-relaxed">
        Přihlášením souhlasíš s podmínkami účasti. Odhlásit se lze do 48h před akcí.
      </p>

      {/* Modals */}
      {showForm && (
        <RegistrationModal
          eventSlug={eventSlug}
          color={color}
          onClose={() => setShowForm(false)}
          onSuccess={handleSuccess}
        />
      )}
      {showList && (
        <ParticipantsModal
          participants={participants}
          onClose={() => setShowList(false)}
          color={color}
        />
      )}
    </>
  );
}
