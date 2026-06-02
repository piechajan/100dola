"use client";

export default function ActiveFilterChip({
  label,
  onClear,
}: {
  label: string;
  onClear: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded-full text-xs font-bold bg-[#1a1a2e] text-white">
      {label}
      <button
        type="button"
        onClick={onClear}
        className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-white/15 transition-colors"
        aria-label={`Odstranit filtr ${label}`}
      >
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </span>
  );
}
