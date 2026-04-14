"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export interface Participant {
  id: string;
  firstName: string;
  lastName: string;
  nickname: string;
  club: string;
  city: string;
  photoDataUrl: string;
  eventSlug: string;
  registeredAt: string;
}

function storageKey(slug: string) {
  return `omc_registrations_${slug}`;
}

function loadParticipants(slug: string): Participant[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(storageKey(slug)) || "[]");
  } catch {
    return [];
  }
}

function saveParticipant(slug: string, p: Participant) {
  const existing = loadParticipants(slug);
  localStorage.setItem(storageKey(slug), JSON.stringify([...existing, p]));
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
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

        {/* List */}
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
                  <div className="font-bold text-sm text-[#1a1a2e] truncate">
                    {p.firstName} {p.lastName}
                    {p.nickname && <span className="text-[#9AA3C2] font-normal ml-1.5">„{p.nickname}"</span>}
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
  const [photoDataUrl, setPhotoDataUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
    const participant: Participant = {
      id: crypto.randomUUID(),
      firstName,
      lastName,
      nickname,
      club,
      city,
      photoDataUrl,
      eventSlug,
      registeredAt: new Date().toISOString(),
    };
    saveParticipant(eventSlug, participant);
    setTimeout(() => onSuccess(participant), 400);
  };

  const inputClass = "w-full px-4 py-3 rounded-xl text-sm border border-[#E2E6F3] text-[#1a1a2e] placeholder-[#C0C7D8] focus:outline-none focus:border-current transition-colors";

  const photoInputId = `photo-upload-${eventSlug}`;

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] flex flex-col"
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
          {/* Photo upload — label approach, reliable across all browsers */}
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

          {/* Name row */}
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Jméno *"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className={inputClass}
            />
            <input
              type="text"
              placeholder="Příjmení *"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className={inputClass}
            />
          </div>

          <input
            type="text"
            placeholder="Přezdívka"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className={inputClass}
          />
          <input
            type="text"
            placeholder="Klub nebo skupina"
            value={club}
            onChange={(e) => setClub(e.target.value)}
            className={inputClass}
          />
          <input
            type="text"
            placeholder="Město *"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
            className={inputClass}
          />

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

      {/* Participant avatars — klikatelné */}
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
