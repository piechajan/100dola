import { buildOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-template";

export const runtime = "edge";
export const alt = "100dola Lab — Péče o kola";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OG() {
  return buildOgImage({
    badge: "100dola Lab",
    headline: "Tvoje kolo,\njak má jet.",
    subline: "Servis, ošetření a péče o kola na úrovni detailingu. Vosk řetězu, PPF folie, ložiska, leštění, fit.",
    gradient: "linear-gradient(135deg, #0A1E15 0%, #143C2A 50%, #1F4937 100%)",
    accent: "#C9A86E",
  });
}
