"use client";

import { useState } from "react";

interface Brand {
  id: string;
  name: string;
  logo: string;
}

/** Inline chip s monochromatic logem — pro horizontální brand strip. */
export function BrandChip({
  brand,
  active,
  onClick,
}: {
  brand: Brand;
  active: boolean;
  onClick: () => void;
}) {
  const [logoFailed, setLogoFailed] = useState(false);
  const baseStyle = active
    ? { backgroundColor: "#1a1a2e", color: "#fff", borderColor: "#1a1a2e" }
    : { backgroundColor: "#fff", color: "#5A6480", borderColor: "#E2E6F3" };

  return (
    <button
      type="button"
      onClick={onClick}
      title={brand.name}
      aria-label={brand.name}
      aria-pressed={active}
      className="px-3 py-1.5 rounded-full text-xs font-bold border transition-all duration-150 shrink-0 flex items-center justify-center"
      style={{ ...baseStyle, minHeight: 30, minWidth: 56 }}
    >
      {!logoFailed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={brand.logo}
          alt={brand.name}
          className="object-contain"
          style={{
            height: 16,
            maxWidth: 80,
            filter: active ? "brightness(0) invert(1)" : "brightness(0)",
            opacity: active ? 1 : 0.75,
          }}
          onError={() => setLogoFailed(true)}
          loading="lazy"
          decoding="async"
        />
      ) : (
        <span>{brand.name}</span>
      )}
    </button>
  );
}

/** Velký tile pro „Naše značky" grid — logo s text fallbackem. */
export function BrandTile({
  brand,
  active,
  onClick,
}: {
  brand: Brand;
  active: boolean;
  onClick: () => void;
}) {
  const [logoFailed, setLogoFailed] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col items-center justify-center rounded-2xl border-2 transition-all duration-150 hover:shadow-md overflow-hidden"
      style={{
        borderColor: active ? "#1a1a2e" : "#E2E6F3",
        backgroundColor: active ? "#1a1a2e" : "#fff",
        height: 88,
        padding: "12px 16px",
      }}
    >
      {!logoFailed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={brand.logo}
          alt={brand.name}
          className="w-full object-contain transition-all duration-150"
          style={{
            maxHeight: 40,
            maxWidth: 120,
            filter: active ? "brightness(0) invert(1)" : "none",
            opacity: active ? 1 : 0.85,
          }}
          onError={() => setLogoFailed(true)}
        />
      ) : (
        <span
          className="font-black text-sm text-center leading-tight transition-colors"
          style={{ color: active ? "#fff" : "#1a1a2e" }}
        >
          {brand.name}
        </span>
      )}
    </button>
  );
}
