"use client";

import React, { useState, useEffect, useRef } from "react";
import { Download, X, Shield, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice?: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export default function InstallPrompt() {
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;

    if (isIosDevice && !isStandalone) {
      setIsIOS(true);
      const dismissed = localStorage.getItem("pwa_ios_prompt_dismissed");
      if (!dismissed && window.innerWidth > 768) {
        setShowPrompt(true);
      }
    }

    // Capture standard Chrome/Android/Desktop beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      deferredPromptRef.current = e as BeforeInstallPromptEvent;

      const dismissed = localStorage.getItem("pwa_prompt_dismissed");
      if (!dismissed && window.innerWidth > 768) {
        setShowPrompt(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    setShowPrompt(false);
    const promptEvent = deferredPromptRef.current;

    // Safety check: ensure event object and prompt method exist
    if (!promptEvent || typeof promptEvent.prompt !== "function") {
      console.warn("[PWA] Install prompt event is no longer active or unavailable.");
      return;
    }

    try {
      // Trigger prompt directly upon user click interaction
      await promptEvent.prompt();

      // Safely await userChoice if available
      if (promptEvent.userChoice) {
        const choiceResult = await promptEvent.userChoice;
        if (choiceResult && choiceResult.outcome === "accepted") {
          console.log("[PWA] User accepted the installation.");
          localStorage.setItem("pwa_installed", "true");
        } else {
          console.log("[PWA] User dismissed the installation choice.");
        }
      }
    } catch (error) {
      console.error("[PWA] Exception triggering install prompt:", error);
    } finally {
      deferredPromptRef.current = null;
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    if (isIOS) {
      localStorage.setItem("pwa_ios_prompt_dismissed", "true");
    } else {
      localStorage.setItem("pwa_prompt_dismissed", "true");
    }
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-5 end-5 z-50 max-w-sm w-full bg-slate-900/95 backdrop-blur-md border border-slate-800 p-4 rounded-2xl shadow-2xl space-y-3 animate-fadeIn text-slate-100">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-brand-blue-500/20 border border-brand-blue-500/40 rounded-xl text-brand-blue-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h4 dir="auto" className="text-xs font-bold text-white leading-tight">Install QuickHandy App</h4>
            <p dir="auto" className="text-[10px] text-slate-400 mt-0.5">
              Add to home screen for instant offline access and app notifications.
            </p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-slate-500 hover:text-slate-300 p-1 rounded-lg hover:bg-slate-800 transition-colors"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {isIOS ? (
        <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-850 text-[11px] text-slate-300 space-y-1">
          <div className="font-bold text-white flex items-center gap-1">
            <Smartphone className="w-3.5 h-3.5 text-brand-orange-500" /> iOS Installation:
          </div>
          <p dir="auto" className="text-[10px] text-slate-400">
            Tap the <strong className="text-white">Share button</strong> <span className="inline-block px-1 bg-slate-800 rounded">⎋</span> in Safari, then select <strong className="text-white">'Add to Home Screen'</strong>.
          </p>
        </div>
      ) : (
        <div className="flex gap-2 pt-1">
          <button
            onClick={handleDismiss}
            className="flex-1 py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-all"
          >
            Not Now
          </button>
          <button
            onClick={handleInstallClick}
            className="flex-1 py-2 bg-gradient-to-r from-brand-blue-600 to-brand-blue-500 hover:from-brand-blue-500 hover:to-brand-blue-400 text-white font-bold rounded-xl text-xs shadow-lg shadow-brand-blue-600/20 transition-all flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> Install App
          </button>
        </div>
      )}
    </div>
  );
}
