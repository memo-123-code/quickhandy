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

  const defaultClasses = "h-9 flex items-center gap-1.5 px-3 rounded-xl bg-slate-800/60 hover:bg-slate-700/70 border border-slate-700/60 text-slate-300 hover:text-white transition-all duration-200 active:scale-95";

  if (!mounted) {
    return (
      <div className={`w-[54px] h-8 bg-slate-800/50 rounded-lg animate-pulse ${className || ""}`} />
    );
  }

  return (
    <button
      onClick={toggleLanguage}
      className={className || defaultClasses}
      aria-label="Toggle language"
      title={language === "en" ? "التبديل إلى العربية" : "Switch to English"}
    >
      <Globe className="w-3.5 h-3.5 text-brand-blue-400 shrink-0" />
      <span className="text-xs font-bold tracking-wide">
        {language === "en" ? "AR" : "EN"}
      </span>
    </button>
  );
}
