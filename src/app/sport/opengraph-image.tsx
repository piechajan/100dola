import { buildOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-template";

export const runtime = "edge";
export const alt = "100dola sport — Vybavíme tě na sezónu";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OG() {
  return buildOgImage({
    badge: "100dola sport",
    headline: "Vybav se\nna sezónu.",
    subline: "Kola, lyže a vybavení vybrané lidmi, kteří sport opravdu žijí. Kamenná prodejna ve Šternberku + e-shop.",
    gradient: "linear-gradient(135deg, #0F1F3D 0%, #1F3D7E 50%, #3B7CF4 100%)",
    accent: "#3B7CF4",
  });
}
