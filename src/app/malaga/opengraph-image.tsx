import { buildOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-template";

export const runtime = "edge";
export const alt = "100dola Malaga — Vlastní kolo v Malaze";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OG() {
  return buildOgImage({
    badge: "100dola Malaga",
    headline: "Vlastní kolo\nv Malaze.",
    subline: "Letíš nalehko, jedeš na svém. Bez opakovaného balení a kompromisů z půjčovny.",
    gradient: "linear-gradient(135deg, #2A0E04 0%, #6A2110 50%, #E8431A 100%)",
    accent: "#E8431A",
  });
}
