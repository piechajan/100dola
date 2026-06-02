"use client";

import { useTransition } from "react";
import { moderateReview } from "./actions";

export default function ModerationButtons({
  reviewId,
  productSlug,
  status,
}: {
  reviewId: string;
  productSlug: string;
  status: string;
}) {
  const [isPending, startTransition] = useTransition();

  function update(newStatus: "approved" | "rejected" | "spam") {
    startTransition(async () => {
      await moderateReview(reviewId, newStatus, productSlug);
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        disabled={isPending || status === "approved"}
        onClick={() => update("approved")}
        className="px-3 py-1.5 rounded-full text-xs font-bold bg-[#D1FAE5] text-[#065F46] hover:bg-[#A7F3D0] disabled:opacity-30"
      >
        Schválit
      </button>
      <button
        type="button"
        disabled={isPending || status === "rejected"}
        onClick={() => update("rejected")}
        className="px-3 py-1.5 rounded-full text-xs font-bold bg-[#FECACA] text-[#991B1B] hover:bg-[#FCA5A5] disabled:opacity-30"
      >
        Odmítnout
      </button>
      <button
        type="button"
        disabled={isPending || status === "spam"}
        onClick={() => update("spam")}
        className="px-3 py-1.5 rounded-full text-xs font-bold bg-[#1a1a2e] text-white hover:opacity-80 disabled:opacity-30"
      >
        Spam
      </button>
    </div>
  );
}
