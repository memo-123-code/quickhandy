"use client";

import React, { useEffect, useState } from "react";
import { Globe } from "lucide-react";
import { useLanguageStore } from "@/store/useLanguageStore";

interface LanguageSwitcherProps {
  className?: string;
}

export default function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const { language, toggleLanguage } = useLanguageStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const defaultClasses = "h-9 flex items-center gap-2 px-3 rounded-full bg-slate-800/50 hover:bg-slate-700/60 border border-slate-700/50 text-slate-300 hover:text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]";

  if (!mounted) {
    return (
      <div className={`w-[68px] h-9 bg-slate-800/50 rounded-xl animate-pulse ${className || ""}`} />
    );
  }

  return (
    <button
      onClick={toggleLanguage}
      className={className || defaultClasses}
      aria-label="Toggle language"
      title={language === "en" ? "التبديل إلى العربية" : "Switch to English"}
    >
      <Globe className="w-3.5 h-3.5 text-brand-blue-400" />
      <span className="text-xs font-semibold tracking-wide">
        {language === "en" ? "AR" : "EN"}
      </span>
    </button>
  );
}
