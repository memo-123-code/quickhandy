"use client";

import React, { useState } from "react";
import { Download, CheckCircle, Smartphone } from "lucide-react";
import { usePwaStore } from "@/store/usePwaStore";

export default function InstallButton() {
  const { deferredPrompt, setDeferredPrompt, isInstallable, setIsInstallable, isInstalled, setIsInstalled, isIOS } = usePwaStore();
  const [showIosTooltip, setShowIosTooltip] = useState(false);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIosTooltip(!showIosTooltip);
      return;
    }

    if (!deferredPrompt || typeof deferredPrompt.prompt !== "function") {
      console.warn("[PWA] Install prompt is not ready or unavailable in this browser.");
      return;
    }

    try {
      // Trigger prompt directly from user interaction
      await deferredPrompt.prompt();

      if (deferredPrompt.userChoice) {
        const choiceResult = await deferredPrompt.userChoice;
        if (choiceResult && choiceResult.outcome === "accepted") {
          console.log("[PWA] User accepted installation.");
          setIsInstalled(true);
          setIsInstallable(false);
        } else {
          console.log("[PWA] User dismissed install prompt.");
        }
      }
    } catch (error) {
      console.error("[PWA] Error launching install prompt:", error);
    } finally {
      setDeferredPrompt(null);
    }
  };

  if (!isInstallable && !isInstalled) {
    return null;
  }

  if (isInstalled) {
    return (
      <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-xs font-bold">
        <CheckCircle className="w-3.5 h-3.5" /> App Installed
      </div>
    );
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={handleInstallClick}
        className="flex items-center gap-1.5 px-4 py-2.5 sm:px-3 sm:py-1.5 bg-gradient-to-r from-brand-blue-600 to-brand-blue-500 hover:from-brand-blue-500 hover:to-brand-blue-400 text-white font-bold rounded-lg text-sm sm:text-xs shadow-md shadow-brand-blue-600/20 transition-all hover:scale-105 active:scale-95"
        title="Install QuickHandy Admin PWA"
      >
        <Download className="w-4 h-4 sm:w-3.5 sm:h-3.5 animate-bounce" />
        <span>Install App</span>
      </button>

      {/* iOS Safari Instruction Popover */}
      {showIosTooltip && isIOS && (
        <div className="absolute end-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-3 text-xs space-y-2 z-50 animate-fadeIn">
          <div className="flex items-center gap-1.5 text-brand-orange-500 font-bold">
            <Smartphone className="w-4 h-4" /> Install on iOS / Safari
          </div>
          <p dir="auto" className="text-[11px] text-slate-300 leading-relaxed">
            Tap the <strong className="text-white">Share icon ⎋</strong> at the bottom of Safari, then scroll down and select <strong className="text-white">'Add to Home Screen'</strong>.
          </p>
          <button
            onClick={() => setShowIosTooltip(false)}
            className="w-full py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded font-semibold text-[11px]"
          >
            Got it
          </button>
        </div>
      )}
    </div>
  );
}
