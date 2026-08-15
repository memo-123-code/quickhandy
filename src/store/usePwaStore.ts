import { create } from 'zustand';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice?: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

interface PwaState {
  deferredPrompt: BeforeInstallPromptEvent | null;
  setDeferredPrompt: (prompt: BeforeInstallPromptEvent | null) => void;
  isInstallable: boolean;
  setIsInstallable: (val: boolean) => void;
  isInstalled: boolean;
  setIsInstalled: (val: boolean) => void;
  isIOS: boolean;
  setIsIOS: (val: boolean) => void;
}

export const usePwaStore = create<PwaState>((set) => ({
  deferredPrompt: null,
  setDeferredPrompt: (prompt) => set({ deferredPrompt: prompt }),
  isInstallable: false,
  setIsInstallable: (val) => set({ isInstallable: val }),
  isInstalled: false,
  setIsInstalled: (val) => set({ isInstalled: val }),
  isIOS: false,
  setIsIOS: (val) => set({ isIOS: val }),
}));
