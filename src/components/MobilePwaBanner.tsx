"use client";

import React, { useState, useEffect, useRef } from "react";
import { Download, X, Wrench } from "lucide-react";
import { useLanguageStore } from "@/store/useLanguageStore";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice?: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export default function MobilePwaBanner() {
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const { language } = useLanguageStore();

  useEffect(() => {
    // Check if device is mobile
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    
    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;

    if (isIosDevice && !isStandalone && isMobile) {
      setIsIOS(true);
      const dismissed = localStorage.getItem("pwa_mobile_prompt_dismissed");
      if (!dismissed) {
        setShowPrompt(true);
      }
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      deferredPromptRef.current = e as BeforeInstallPromptEvent;

      if (window.innerWidth <= 768) {
        const dismissed = localStorage.getItem("pwa_mobile_prompt_dismissed");
        if (!dismissed) {
          setShowPrompt(true);
        }
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

    if (!promptEvent || typeof promptEvent.prompt !== "function") {
      if (isIOS) {
        alert(language === 'ar' ? 'يرجى الضغط على زر المشاركة ثم "إضافة إلى الشاشة الرئيسية"' : 'Please tap the Share button and select "Add to Home Screen"');
      }
      return;
    }

    try {
      await promptEvent.prompt();
      if (promptEvent.userChoice) {
        const choiceResult = await promptEvent.userChoice;
        if (choiceResult && choiceResult.outcome === "accepted") {
          localStorage.setItem("pwa_installed", "true");
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
    localStorage.setItem("pwa_mobile_prompt_dismissed", "true");
  };

  if (!showPrompt) return null;

  const text = language === 'ar' 
    ? "تثبيت تطبيق QuickHandy للحصول على تجربة أفضل" 
    : "Install QuickHandy app for a better experience";
  const btnText = language === 'ar' ? "تثبيت الآن" : "Install Now";

  return (
    <div className="md:hidden w-full bg-brand-blue-600 text-white px-3 py-2.5 flex items-center justify-between shadow-md">
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        <div className="p-1.5 bg-white/20 rounded-lg shrink-0">
          <Wrench className="w-4 h-4 text-white" />
        </div>
        <p className="text-[11px] font-semibold leading-tight truncate" dir="auto">
          {text}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0 ms-2">
        <button 
          onClick={handleInstallClick}
          className="bg-white text-brand-blue-600 hover:bg-slate-100 px-3 py-1.5 rounded-md text-[11px] font-bold shadow-sm flex items-center gap-1 transition-colors whitespace-nowrap"
        >
          <Download className="w-3.5 h-3.5" />
          {btnText}
        </button>
        <button 
          onClick={handleDismiss}
          className="text-white/80 hover:text-white p-1"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
