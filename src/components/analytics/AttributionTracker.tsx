"use client";

import { useEffect } from "react";
import { captureLandingAttribution } from "@/lib/attribution";

export default function AttributionTracker() {
  useEffect(() => {
    captureLandingAttribution();
    // Pixel může nastavit _fbp/_fbc po init (krátká race) — re-capture po 2 s.
    const t = setTimeout(captureLandingAttribution, 2000);
    return () => clearTimeout(t);
  }, []);
  return null;
}
