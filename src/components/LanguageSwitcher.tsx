"use client";

import React, { useEffect, useState } from "react";
import { Globe } from "lucide-react";
import { useLanguageStore } from "@/store/useLanguageStore";

export default function LanguageSwitcher() {
  const { language, toggleLanguage } = useLanguageStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Render a placeholder to avoid hydration mismatch
    return (
      <div className="w-[72px] h-9 bg-slate-800/50 rounded-full animate-pulse"></div>
    );
  }

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/50 hover:bg-slate-700/60 border border-slate-700/50 text-slate-300 hover:text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
      aria-label="Toggle language"
    >
      <Globe className="w-4 h-4 text-brand-blue-400" />
      <span className="text-xs font-semibold tracking-wide">
        {language === "en" ? "AR" : "EN"}
      </span>
    </button>
  );
}
