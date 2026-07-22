"use client";

import { create } from "zustand";

/**
 * Lehký most mezi výběrem barvy na PDP (PdpBuyBox) a hlavní galerií (PDPGallery).
 * Když uživatel zvolí barvu, nastaví se `photo` a galerie přepne hlavní obrázek.
 * Client-only, resetuje se přirozeně při remountu stránky.
 */
interface PdpImageState {
  photo: string | null;
  setPhoto: (photo: string | null) => void;
}

export const usePdpImage = create<PdpImageState>((set) => ({
  photo: null,
  setPhoto: (photo) => set({ photo }),
}));
