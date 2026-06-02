"use client";

import type { SubCategory } from "@/data/categories";

export default function SubCatCard({
  sub,
  color,
  active,
  onClick,
}: {
  sub: SubCategory;
  color: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left p-4 rounded-xl border transition-all duration-150 bg-white"
      style={
        active
          ? { borderColor: color, backgroundColor: `${color}08` }
          : { borderColor: "#E2E6F3" }
      }
    >
      <div
        className="text-sm font-bold leading-tight mb-1"
        style={{ color: active ? color : "#1a1a2e" }}
      >
        {sub.name}
      </div>
      {sub.children && sub.children.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {sub.children.map((child) => (
            <span
              key={child.id}
              className="text-[10px] px-2 py-0.5 rounded-full font-medium"
              style={
                active
                  ? { backgroundColor: `${color}20`, color }
                  : { backgroundColor: "#F0F2FA", color: "#9AA3C2" }
              }
            >
              {child.name}
            </span>
          ))}
        </div>
      )}
    </button>
  );
}
