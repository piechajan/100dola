// Klientská optimalizace fotky před uploadem — zmenší na max `max` px delší strany
// a zakóduje do webp. Chrání web i Blob storage (uploaduje se malý soubor, ne originál).
// Používají signup formuláře (foto účastníka).

export async function resizeToWebp(file: File, max = 512, quality = 0.82): Promise<Blob | null> {
  try {
    const img = await createImageBitmap(file);
    const scale = Math.min(1, max / Math.max(img.width, img.height));
    const w = Math.round(img.width * scale);
    const h = Math.round(img.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, w, h);
    return await new Promise((res) => canvas.toBlob((b) => res(b), "image/webp", quality));
  } catch {
    return null;
  }
}

// Nahraje (už zmenšenou) fotku na Blob přes náš endpoint, vrátí veřejnou URL nebo "".
export async function uploadSignupPhoto(file: File): Promise<string> {
  const resized = await resizeToWebp(file);
  if (!resized) return "";
  const fd = new FormData();
  fd.append("file", new File([resized], "photo.webp", { type: "image/webp" }));
  try {
    const up = await fetch("/api/event-signup/photo", { method: "POST", body: fd });
    if (!up.ok) return "";
    const b = await up.json().catch(() => null);
    return b?.url || "";
  } catch {
    return "";
  }
}
