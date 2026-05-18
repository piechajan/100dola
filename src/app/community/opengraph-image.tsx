import { buildOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-template";

export const runtime = "edge";
export const alt = "Open Miles Clinic — Pohyb je lepší ve skupině";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OG() {
  return buildOgImage({
    badge: "Open Miles Clinic",
    headline: "Jedeme\nspolu.",
    subline: "Social rides, eventy a komunita lidí, kteří sport žijí. Cyklistika, gravel, MTB, skialpy, turistika.",
    gradient: "linear-gradient(135deg, #061E11 0%, #0F4029 50%, #2EAA6E 100%)",
    accent: "#2EAA6E",
  });
}
