"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { trackMetaEvent } from "@/components/analytics/MetaPixel";
import { trackGoogleEvent } from "@/components/analytics/GoogleAnalytics";
import MalagaBoxBanner from "@/components/malaga/MalagaBoxBanner";
import { uploadSignupPhoto } from "@/lib/resize-image";
import PublicProfileFields from "@/components/community/PublicProfileFields";
import type { PublicProfile } from "@/data/public-profile";
import {
  TRANSPORT_TIER_OPTIONS,
  DIRECTION_OPTIONS,
  BIKE_TYPE_OPTIONS,
  STORAGE_AFTER_OPTIONS,
  NUTRITION_ITEMS,
  estimateTransportEur,
  type MalagaTransportTier,
  type MalagaDirection,
  type MalagaBikeType,
  type MalagaStorageAfter,
  type MalagaGroupKind,
  type MalagaAccommodation,
  type MalagaYesNo,
} from "@/data/malaga-signup";

interface Member {
  name: string;
  email: string;
  phone: string;
}

const MAX_MEMBERS = 10;

function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}

// Malá radio-karta pro sekce s ikonou + popisem.
function RadioCards<T extends string>({
  options,
  value,
  onChange,
  color,
  name,
}: {
  options: { value: T; label: string; icon: string; description: string }[];
  value: T;
  onChange: (v: T) => void;
  color: string;
  name: string;
}) {
  return (
    <div className="space-y-2">
      {options.map((opt) => {
        const active = value === opt.value;
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
              name={name}
              checked={active}
              onChange={() => onChange(opt.value)}
              className="sr-only"
            />
            <span className="text-lg leading-none mt-0.5">{opt.icon}</span>
            <span>
              <span className="block text-sm font-bold text-[#1a1a2e]">{opt.label}</span>
              {opt.description && (
                <span className="block text-xs text-[#9AA3C2] mt-0.5 leading-relaxed">{opt.description}</span>
              )}
            </span>
          </label>
        );
      })}
    </div>
  );
}

function Chips<T extends string>({
  options,
  value,
  onChange,
  color,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  color: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className="px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all"
            style={{
              borderColor: active ? color : "#E2E6F3",
              backgroundColor: active ? color : "transparent",
              color: active ? "#fff" : "#5A6480",
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <div className="text-xs font-bold uppercase tracking-wider text-[#9AA3C2] mb-2">{children}</div>
);

function SignupModal({
  eventSlug,
  eventTitle,
  eventDate,
  color,
  onClose,
  onSuccess,
}: {
  eventSlug: string;
  eventTitle: string;
  eventDate: string;
  color: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [street, setStreet] = useState("");
  const [groupKind, setGroupKind] = useState<MalagaGroupKind>("individual");
  const [members, setMembers] = useState<Member[]>([]);

  const [transportTier, setTransportTier] = useState<MalagaTransportTier>("basic");
  const [direction, setDirection] = useState<MalagaDirection>("roundtrip");
  const [bikeCount, setBikeCount] = useState(1);
  const [bikeType, setBikeType] = useState<MalagaBikeType>("road");
  const [storageAfter, setStorageAfter] = useState<MalagaStorageAfter>("no");

  const [accommodation, setAccommodation] = useState<MalagaAccommodation>("interest");
  const [accFrom, setAccFrom] = useState("");
  const [accTo, setAccTo] = useState("");

  const [nutritionSponser, setNutritionSponser] = useState<MalagaYesNo>("interest");
  const [nutritionPrefs, setNutritionPrefs] = useState("");
  const [nutritionItems, setNutritionItems] = useState<Record<string, number>>({});

  const [term, setTerm] = useState(eventDate);
  const [focus, setFocus] = useState("");
  const [note, setNote] = useState("");
  const [gdpr, setGdpr] = useState(false);
  const [publicConsent, setPublicConsent] = useState(false);
  const [publicProfile, setPublicProfile] = useState<PublicProfile>({});
  const [mediaConsent, setMediaConsent] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [website, setWebsite] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setItemQty = (key: string, qty: number) =>
    setNutritionItems((prev) => ({ ...prev, [key]: Math.max(0, Math.min(99, qty || 0)) }));
  const setPhoto = (f: File | undefined | null) => {
    if (!f || !f.type.startsWith("image/")) return;
    setPhotoFile(f);
    setPhotoPreview(URL.createObjectURL(f));
  };
  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => setPhoto(e.target.files?.[0]);
  const handlePhotoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setPhoto(e.dataTransfer.files?.[0]);
  };

  const hasTransport = transportTier !== "none";
  const isExclusive = transportTier === "exclusive_full" || transportTier === "exclusive_pickup";
  const transportEst = estimateTransportEur({ transportTier, direction, bikeCount, bikeType });

  const addMember = () => {
    if (members.length >= MAX_MEMBERS) return;
    setMembers((prev) => [...prev, { name: "", email: "", phone: "" }]);
  };
  const removeMember = (idx: number) => setMembers((prev) => prev.filter((_, i) => i !== idx));
  const updateMember = (idx: number, field: keyof Member, value: string) =>
    setMembers((prev) => prev.map((m, i) => (i === idx ? { ...m, [field]: value } : m)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (website.length > 0) {
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

    // Položky SPONSER jen když je zájem — a jen nenulové.
    const cleanItems =
      nutritionSponser === "interest"
        ? Object.fromEntries(Object.entries(nutritionItems).filter(([, q]) => q > 0))
        : {};

    setSubmitting(true);
    try {
      // Fotku nahráváme jen se souhlasem se zveřejněním (klient ji zmenší na webp).
      let photoUrl = "";
      if (publicConsent && photoFile) {
        photoUrl = await uploadSignupPhoto(photoFile);
      }

      const res = await fetch("/api/malaga-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventSlug,
          leadName: leadName.trim(),
          leadEmail: leadEmail.trim(),
          leadPhone: leadPhone.trim(),
          city: city.trim(),
          zip: zip.trim(),
          street: isExclusive ? street.trim() : "",
          groupKind,
          members: cleanMembers,
          transportTier,
          direction: hasTransport ? direction : undefined,
          bikeCount: hasTransport ? bikeCount : undefined,
          bikeType: hasTransport ? bikeType : undefined,
          storageAfter: hasTransport ? storageAfter : undefined,
          accommodation,
          accommodationFrom: accommodation === "interest" ? accFrom : "",
          accommodationTo: accommodation === "interest" ? accTo : "",
          nutritionSponser,
          nutritionPrefs: nutritionSponser === "interest" ? nutritionPrefs.trim() : "",
          nutritionItems: cleanItems,
          term: term.trim(),
          focus: focus.trim(),
          note: note.trim(),
          consentGdpr: true,
          publicConsent,
          photoUrl,
          publicProfile: publicConsent
            ? { ...publicProfile, city: publicProfile.city || city.trim() || undefined }
            : undefined,
          mediaConsent,
          website,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error || "Přihlášku se nepodařilo odeslat. Zkus to prosím znovu.");
        setSubmitting(false);
        return;
      }
      trackMetaEvent("Lead", { content_name: "Malaga signup", content_category: eventSlug });
      trackGoogleEvent("generate_lead", {
        event_category: "malaga",
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
            maxWidth: 520,
            boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
            maxHeight: "92vh",
            display: "flex",
            flexDirection: "column",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-[#F0F2FA] shrink-0" style={{ background: `${color}0A` }}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-[#1a1a2e]">Přihlásit se — {eventTitle}</h3>
                <p className="text-xs font-semibold mt-0.5" style={{ color }}>
                  Vlastní kolo v Malaze. Letíš jen s příručákem.
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-[#E2E6F3] transition-colors shrink-0"
              >
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5 overflow-y-auto" style={{ color }}>
            {/* Honeypot */}
            <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", top: "-9999px", height: 0, width: 0, overflow: "hidden" }}>
              <label htmlFor={`hp-${eventSlug}`}>Web (nevyplňuj)</label>
              <input id={`hp-${eventSlug}`} type="text" name="website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
            </div>

            {/* A. Kdo jsi */}
            <div>
              <SectionTitle>Kdo jsi</SectionTitle>
              <div className="space-y-3">
                <input type="text" placeholder="Jméno a příjmení *" value={leadName} onChange={(e) => setLeadName(e.target.value)} required minLength={2} className={inputClass} />
                <input type="email" placeholder="E-mail *" value={leadEmail} onChange={(e) => setLeadEmail(e.target.value)} required className={inputClass} />
                <input type="tel" placeholder="Telefon *" value={leadPhone} onChange={(e) => setLeadPhone(e.target.value)} required minLength={6} className={inputClass} />
                <div className="grid grid-cols-[1fr_auto] gap-3">
                  <input type="text" placeholder="Město" value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} />
                  <input type="text" placeholder="PSČ" value={zip} onChange={(e) => setZip(e.target.value)} inputMode="numeric" className={`${inputClass} w-28`} />
                </div>
                <p className="text-[11px] text-[#9AA3C2] -mt-1">Kvůli nejbližšímu sběrnému místu / odhadu svozu. Přesnou adresu řešíme až u Exclusive.</p>
                <Chips
                  options={[
                    { value: "individual", label: "Jednotlivec" },
                    { value: "group", label: "Skupina" },
                    { value: "club", label: "Klub" },
                  ]}
                  value={groupKind}
                  onChange={setGroupKind}
                  color={color}
                />
              </div>

              {/* Členové */}
              {members.length > 0 && (
                <div className="space-y-3 mt-3">
                  {members.map((m, i) => (
                    <div key={i} className="rounded-xl border border-[#E2E6F3] p-3 space-y-2 relative">
                      <button type="button" onClick={() => removeMember(i)} aria-label="Odebrat člena" className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#F0F2FA] flex items-center justify-center hover:bg-[#FDE3DC] text-[#9AA3C2] hover:text-[#E8431A] transition-colors">
                        <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M18 6 6 18M6 6l12 12" /></svg>
                      </button>
                      <input type="text" placeholder={`Jméno člena ${i + 1} *`} value={m.name} onChange={(e) => updateMember(i, "name", e.target.value)} className={inputClass} />
                      <div className="grid grid-cols-2 gap-2">
                        <input type="email" placeholder="E-mail" value={m.email} onChange={(e) => updateMember(i, "email", e.target.value)} className={inputClass} />
                        <input type="tel" placeholder="Telefon" value={m.phone} onChange={(e) => updateMember(i, "phone", e.target.value)} className={inputClass} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {members.length < MAX_MEMBERS && (
                <button type="button" onClick={addMember} className="w-full mt-3 py-2.5 rounded-xl border-2 border-dashed text-sm font-bold transition-colors" style={{ borderColor: `${color}55`, color }}>
                  + Přidat člena (skupina / klub)
                </button>
              )}
            </div>

            {/* B. Doprava kola */}
            <div>
              <SectionTitle>Doprava kola</SectionTitle>
              <RadioCards options={TRANSPORT_TIER_OPTIONS} value={transportTier} onChange={setTransportTier} color={color} name="transportTier" />

              {hasTransport && (
                <div className="mt-3 rounded-xl bg-[#F7F9FF] p-3 space-y-3">
                  <div>
                    <div className="text-[11px] font-bold text-[#9AA3C2] mb-1.5">Směr</div>
                    <Chips options={DIRECTION_OPTIONS.map((o) => ({ value: o.value, label: o.label }))} value={direction} onChange={setDirection} color={color} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-[11px] font-bold text-[#9AA3C2] mb-1.5">Počet kol</div>
                      <input type="number" min={1} max={20} value={bikeCount} onChange={(e) => setBikeCount(Math.max(1, Math.min(20, Number(e.target.value) || 1)))} className={inputClass} />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-[#9AA3C2] mb-1.5">Typ kola</div>
                      <Chips options={BIKE_TYPE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))} value={bikeType} onChange={setBikeType} color={color} />
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-[#9AA3C2] mb-1.5">Nechat kolo v Malaze po akci?</div>
                    <RadioCards options={STORAGE_AFTER_OPTIONS} value={storageAfter} onChange={setStorageAfter} color={color} name="storageAfter" />
                  </div>
                </div>
              )}

              {/* Adresa vyzvednutí — jen u Exclusive (vyzvedneme/svezeme u tebe) */}
              {isExclusive && (
                <div className="mt-3">
                  <div className="text-[11px] font-bold text-[#9AA3C2] mb-1.5">Adresa vyzvednutí</div>
                  <input type="text" placeholder="Ulice a č.p." value={street} onChange={(e) => setStreet(e.target.value)} className={inputClass} />
                  <p className="text-[11px] text-[#9AA3C2] mt-1">Kde kolo vyzvedneme (město a PSČ máš výše).</p>
                </div>
              )}

              {/* Info banner — box → příručák (sdílená komponenta) */}
              <div className="mt-3">
                <MalagaBoxBanner color={color} />
              </div>

              {/* Živý orientační odhad DOPRAVY */}
              {transportEst && (
                <div className="mt-3 rounded-xl p-3" style={{ background: `${color}12` }}>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-sm font-bold text-[#1a1a2e]">Orientační cena dopravy</span>
                    <span className="text-base font-black" style={{ color }}>
                      {transportEst.exclusive ? "od " : ""}{transportEst.total} €
                    </span>
                  </div>
                  <p className="text-[11px] text-[#9AA3C2] mt-1">
                    {transportEst.bikes > 1 ? `${transportEst.bikes}× ${transportEst.perBike} € · ` : ""}
                    Jen doprava. Ubytování a výživu doladíme v nabídce.{transportEst.exclusive ? " Exkluzivní servis po domluvě." : ""}
                  </p>
                </div>
              )}
            </div>

            {/* C. Ubytování */}
            <div>
              <SectionTitle>Ubytování ve stejné lokaci</SectionTitle>
              <RadioCards
                options={[
                  { value: "interest", label: "Mám zájem — zařídíme my", icon: "🏨", description: "Vybereme a zajistíme ubytování v lokaci základny. Nemusíš nic hledat." },
                  { value: "own", label: "Mám vlastní", icon: "🔑", description: "Ubytování si řeším sám." },
                ]}
                value={accommodation}
                onChange={setAccommodation}
                color={color}
                name="accommodation"
              />
              {accommodation === "interest" && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <label className="text-[11px] text-[#9AA3C2]">
                    Od
                    <input type="date" value={accFrom} onChange={(e) => { const v = e.target.value; setAccFrom(v); if (!accTo || accTo < v) setAccTo(v); }} className={inputClass} />
                  </label>
                  <label className="text-[11px] text-[#9AA3C2]">
                    Do
                    <input type="date" value={accTo} min={accFrom || undefined} onChange={(e) => setAccTo(e.target.value)} className={inputClass} />
                  </label>
                  <p className="col-span-2 text-[11px] text-[#9AA3C2]">Necháš prázdné = po dobu akce.</p>
                </div>
              )}
            </div>

            {/* D. Výživa SPONSER */}
            <div>
              <SectionTitle>Výživa na místě — SPONSER</SectionTitle>
              <RadioCards
                options={[
                  { value: "interest", label: "Mám zájem", icon: "🥤", description: "Gely, iontové nápoje, proteiny a doplňky SPONSER (švýcarská prémiová značka) na místě — za zvýhodněné ceny pro účastníky." },
                  { value: "no", label: "Nemám zájem", icon: "—", description: "Výživu si vezmu vlastní." },
                ]}
                value={nutritionSponser}
                onChange={setNutritionSponser}
                color={color}
                name="nutritionSponser"
              />
              {nutritionSponser === "interest" && (
                <div className="mt-3 rounded-xl bg-[#F7F9FF] p-3 space-y-2">
                  <p className="text-[11px] text-[#9AA3C2]">Kolik čeho chceš předobjednat? (za zvýhodněné ceny, upřesníme v nabídce)</p>
                  {NUTRITION_ITEMS.map((it) => (
                    <div key={it.key} className="flex items-center justify-between gap-3">
                      <span className="text-sm text-[#1a1a2e]">
                        {it.href ? (
                          <a href={it.href} target="_blank" rel="noopener" className="underline decoration-dotted hover:opacity-80" style={{ color }}>
                            {it.label}
                          </a>
                        ) : (
                          it.label
                        )}
                        {it.hint && <span className="text-[#9AA3C2]"> ({it.hint})</span>}
                      </span>
                      <input
                        type="number"
                        min={0}
                        max={99}
                        value={nutritionItems[it.key] ?? 0}
                        onChange={(e) => setItemQty(it.key, Number(e.target.value))}
                        aria-label={`Počet — ${it.label}`}
                        className="w-16 px-2 py-1.5 rounded-lg text-sm border border-[#E2E6F3] text-[#1a1a2e] text-center focus:outline-none focus:border-current"
                      />
                    </div>
                  ))}
                  <input
                    type="text"
                    placeholder="Něco jiného / poznámka (nepovinné)"
                    value={nutritionPrefs}
                    onChange={(e) => setNutritionPrefs(e.target.value)}
                    className={`${inputClass} mt-1`}
                  />
                </div>
              )}
            </div>

            {/* E. Termín / zaměření */}
            <div>
              <SectionTitle>Termín a zaměření</SectionTitle>
              <div className="space-y-3">
                <input type="text" placeholder="Termín (např. říjen / listopad)" value={term} onChange={(e) => setTerm(e.target.value)} className={inputClass} />
                <input type="text" placeholder="Zaměření (km bloky / social / gravel / nevím)" value={focus} onChange={(e) => setFocus(e.target.value)} className={inputClass} />
              </div>
            </div>

            {/* F. Poznámka + GDPR */}
            <textarea placeholder="Poznámka (nepovinné)" value={note} onChange={(e) => setNote(e.target.value)} rows={2} className={inputClass} />

            {/* Zveřejnit účast — social proof */}
            <div
              className="rounded-xl border-2 p-3 transition-all"
              style={{ borderColor: publicConsent ? color : "#E2E6F3", backgroundColor: publicConsent ? `${color}08` : "transparent" }}
            >
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <div className="w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all" style={{ borderColor: publicConsent ? color : "#C0C7D8", backgroundColor: publicConsent ? color : "transparent" }}>
                  {publicConsent && <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={3}><path d="M20 6 9 17l-5-5" /></svg>}
                </div>
                <input type="checkbox" checked={publicConsent} onChange={(e) => setPublicConsent(e.target.checked)} className="sr-only" />
                <span>
                  <span className="block text-sm font-bold text-[#1a1a2e]">Zveřejnit mou účast</span>
                  <span className="block text-xs text-[#9AA3C2] mt-0.5 leading-relaxed">
                    Tvoje jméno (a fotka, když přidáš) se ukáže v seznamu „kdo jede". Bez souhlasu jsi jen „Účastník".
                  </span>
                </span>
              </label>
              {publicConsent && (
                <div
                  className="flex items-center gap-3 mt-3 pt-3 border-t border-[#E2E6F3]"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handlePhotoDrop}
                >
                  <label
                    htmlFor={`malaga-photo-${eventSlug}`}
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
                    <label htmlFor={`malaga-photo-${eventSlug}`} className="text-sm font-semibold cursor-pointer" style={{ color }}>
                      {photoPreview ? "Změnit fotku" : "Přidat fotku"}
                    </label>
                    <p className="text-xs text-[#C0C7D8] mt-0.5">Nepovinné · klikni nebo přetáhni · zmenšíme za tebe</p>
                  </div>
                  <input id={`malaga-photo-${eventSlug}`} type="file" accept="image/*" className="sr-only" onChange={handlePhoto} />
                </div>
              )}
              {publicConsent && (
                <PublicProfileFields color={color} showCity={false} value={publicProfile} onChange={setPublicProfile} />
              )}
            </div>

            {/* Foto/video z akce — info + souhlas */}
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input type="checkbox" checked={mediaConsent} onChange={(e) => setMediaConsent(e.target.checked)} className="mt-0.5 w-4 h-4 shrink-0" style={{ accentColor: color }} />
              <span className="text-xs text-[#5A6480] leading-relaxed">
                Na akci pořizujeme <strong>fotky a videa</strong> (i pro naše sociální sítě). Zaškrtnutím souhlasíš, že na nich můžeš být. Když nechceš, nech prázdné a řekni nám to na místě.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer select-none">
              <div className="w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all" style={{ borderColor: gdpr ? color : "#C0C7D8", backgroundColor: gdpr ? color : "transparent" }}>
                {gdpr && <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={3}><path d="M20 6 9 17l-5-5" /></svg>}
              </div>
              <input type="checkbox" checked={gdpr} onChange={(e) => setGdpr(e.target.checked)} className="sr-only" />
              <span className="text-xs text-[#5A6480] leading-relaxed">
                Souhlasím se zpracováním osobních údajů.{" "}
                <a href="/ochrana-osobnich-udaju" target="_blank" className="font-bold underline" style={{ color }}>Zásady</a>
              </span>
            </label>

            {error && <div className="text-xs text-[#E8431A] font-semibold">{error}</div>}

            <button type="submit" disabled={submitting} className="w-full py-3.5 text-sm font-black text-white rounded-xl transition-all hover:opacity-90 disabled:opacity-60" style={{ backgroundColor: color, boxShadow: `0 4px 16px ${color}40` }}>
              {submitting ? "Odesílám..." : "Odeslat poptávku"}
            </button>
            <p className="text-[10px] text-[#C0C7D8] text-center leading-relaxed">
              Nezávazné — ozveme se ti s konkrétní nabídkou a cenou. Termín potvrdíme po objednávce.
            </p>
          </form>
        </div>
      </div>
    </Portal>
  );
}

export default function MalagaEventSignup({
  eventSlug,
  eventTitle,
  eventDate,
  color,
  filledCount = 0,
  capacity,
}: {
  eventSlug: string;
  eventTitle: string;
  eventDate: string;
  color: string;
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
        <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: `${color}15` }}>
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={2.5}><path d="M20 6 9 17l-5-5" /></svg>
        </div>
        <div className="font-black text-[#1a1a2e] text-sm">Poptávka odeslána!</div>
        <div className="text-xs text-[#9AA3C2] mt-1 leading-relaxed">
          Potvrzení máš v e-mailu. Ozveme se ti s konkrétní nabídkou a cenou.
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
        <div className="font-black text-[#1a1a2e] text-lg leading-tight mb-1">Vlastní kolo v Malaze</div>
        <p className="text-xs text-[#5A6480] leading-relaxed">
          Kolo dovezeme, ubytování i výživu (SPONSER) řešíme na místě. Ty letíš jen s příručákem.
        </p>
      </div>

      <button onClick={() => setShowForm(true)} className="w-full py-3.5 text-sm font-black text-white rounded-xl transition-all hover:opacity-90 hover:shadow-xl" style={{ backgroundColor: color, boxShadow: `0 4px 16px ${color}40` }}>
        Přihlásit se na akci
      </button>
      <p className="text-[10px] text-[#C0C7D8] text-center mt-3 leading-relaxed">
        Nezávazné. Ozveme se ti s nabídkou a cenou.
      </p>

      {showForm && (
        <SignupModal
          eventSlug={eventSlug}
          eventTitle={eventTitle}
          eventDate={eventDate}
          color={color}
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
