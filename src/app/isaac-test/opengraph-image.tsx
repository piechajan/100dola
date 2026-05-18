import { buildOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-template";

export const runtime = "edge";
export const alt = "Testovací jízdy ISAAC · Šternberk 29.–31. 5.";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OG() {
  return buildOgImage({
    badge: "ISAAC · Šternberk · 29.–31. 5.",
    headline: "Vyzkoušej\nISAAC.",
    subline: "10 road a gravel modelů — Meson, Element, Boson, Vitron, Kaon, Torus Xplore. Hodinová zápůjčka zdarma. V neděli dojezd Závodu Míru.",
    gradient: "linear-gradient(135deg, #1A1A2E 0%, #2A2A4E 50%, #3B7CF4 100%)",
    accent: "#E8431A",
  });
}
