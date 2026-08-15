"use client";

import { useEffect } from "react";
import { usePwaStore, BeforeInstallPromptEvent } from "@/store/usePwaStore";

export default function PwaRegister() {
  const { setDeferredPrompt, setIsInstallable, setIsInstalled, setIsIOS } = usePwaStore();

  useEffect(() => {
    if (typeof window !== "undefined") {
      // 1. Register Service Worker
      if ("serviceWorker" in navigator) {
        window.addEventListener("load", () => {
          navigator.serviceWorker
            .register("/sw.js")
            .then((registration) => {
              console.log("[PWA] Service Worker registered successfully with scope:", registration.scope);
            })
            .catch((error) => {
              console.error("[PWA] Service Worker registration failed:", error);
            });
        });
      }

      // 2. Initial state checks
      const isStandalone = 
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true;

      if (isStandalone) {
        setIsInstalled(true);
        setIsInstallable(false);
      } else {
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
        if (isIosDevice) {
          setIsIOS(true);
          setIsInstallable(true);
        }
      }

      // 3. Event listeners
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
        setIsInstallable(true);
      };

      const handleAppInstalled = () => {
        setDeferredPrompt(null);
        setIsInstallable(false);
        setIsInstalled(true);
        console.log("[PWA] App successfully installed.");
      };

      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.addEventListener("appinstalled", handleAppInstalled);

      return () => {
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        window.removeEventListener("appinstalled", handleAppInstalled);
      };
    }
  }, [setDeferredPrompt, setIsInstallable, setIsInstalled, setIsIOS]);

  return null;
}
