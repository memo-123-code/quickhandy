"use client";

import React, { useEffect, useState } from "react";
import { useLanguageStore } from "@/store/useLanguageStore";

export default function LanguageProvider({ children }: { children: React.ReactNode }) {
  const language = useLanguageStore((state) => state.language);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    root.dir = language === "ar" ? "rtl" : "ltr";
    root.lang = language;

    if (language === "ar") {
      document.body.classList.add("font-cairo");
    } else {
      document.body.classList.remove("font-cairo");
    }
  }, [language, mounted]);

  if (!mounted) {
    // Avoid hydration mismatch by rendering children without language modifications initially
    return <>{children}</>;
  }

  return <>{children}</>;
}
