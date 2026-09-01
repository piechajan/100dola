"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import type { EventParticipantsData, PublicParticipant } from "@/lib/event-participants";

function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

function Avatar({
  p,
  color,
  size = 44,
  onClick,
}: {
  p: PublicParticipant;
  color: string;
  size?: number;
  onClick?: () => void;
}) {
  const common = "rounded-full border-2 border-white object-cover shrink-0";
  if (p.photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={p.photoUrl}
        alt={p.name}
        width={size}
        height={size}
        onClick={onClick}
        className={`${common} ${onClick ? "cursor-pointer hover:opacity-90" : ""}`}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className={`${common} flex items-center justify-center text-white font-black text-xs`}
      style={{ width: size, height: size, background: color }}
    >
      {initials(p.name)}
    </div>
  );
}

export default function EventParticipants({
  data,
  color,
}: {
  data: EventParticipantsData;
  color: string;
}) {
  const [enlarged, setEnlarged] = useState<PublicParticipant | null>(null);

  if (data.signups === 0) {
    return (
      <div className="text-sm text-[#9AA3C2]">
        Zatím nikdo přihlášený — buď první, kdo se přidá.
      </div>
    );
  }

  return (
    <>
      <div className="flex items-baseline justify-between mb-4">
        <div className="font-black text-[#1a1a2e] text-lg">Kdo jede</div>
        <div className="text-xs text-[#9AA3C2]">
          {data.people} {data.people === 1 ? "člověk" : data.people >= 2 && data.people <= 4 ? "lidé" : "lidí"} · {data.signups}{" "}
          {data.signups === 1 ? "přihláška" : data.signups >= 2 && data.signups <= 4 ? "přihlášky" : "přihlášek"}
        </div>
      </div>

      {/* Zveřejnění účastníci */}
      {data.consented.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-4">
          {data.consented.map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => p.photoUrl && setEnlarged(p)}
              className="flex flex-col items-center gap-1.5 w-16"
            >
              <Avatar p={p} color={color} onClick={p.photoUrl ? () => setEnlarged(p) : undefined} />
              <span className="text-[11px] text-[#5A6480] text-center leading-tight truncate w-full">
                {p.name.split(/\s+/)[0]}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Anonymní účastníci */}
      {data.anon > 0 && (
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: data.anon }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-2 rounded-full bg-[#F0F2FA] pl-1 pr-3 py-1"
              title="Účastník nezveřejnil své jméno"
            >
              <div className="w-6 h-6 rounded-full bg-[#C0C7D8] flex items-center justify-center text-white text-[10px] font-bold">
                ?
              </div>
              <span className="text-xs text-[#9AA3C2]">Účastník {i + 1}</span>
            </div>
          ))}
        </div>
      )}

      {/* Enlarge modal */}
      {enlarged && enlarged.photoUrl && (
        <Portal>
          <div
            style={{ position: "fixed", inset: 0, zIndex: 999999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
            onClick={() => setEnlarged(null)}
          >
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(3px)" }} />
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={enlarged.photoUrl}
                alt={enlarged.name}
                className="rounded-2xl max-w-[80vw] max-h-[70vh] object-contain"
                style={{ boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}
              />
              <div className="text-center text-white font-bold mt-3">{enlarged.name}</div>
            </div>
          </div>
        </Portal>
      )}
    </>
  );
}
