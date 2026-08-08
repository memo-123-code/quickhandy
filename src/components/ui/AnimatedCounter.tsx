"use client";

import React, { useEffect, useState } from "react";
import { useLanguageStore } from "@/store/useLanguageStore";

interface AnimatedCounterProps {
  targetValue: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
}

export default function AnimatedCounter({ 
  targetValue, 
  duration = 2000, 
  decimals = 0,
  prefix = "",
  suffix = ""
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const { language } = useLanguageStore();

  useEffect(() => {
    let startTime: number | null = null;
    let animationFrame: number;

    const easeOutExpo = (t: number) => {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    };

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      const easedProgress = easeOutExpo(progress);
      setCount(easedProgress * targetValue);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      } else {
        setCount(targetValue);
      }
    };

    animationFrame = requestAnimationFrame(step);

    return () => cancelAnimationFrame(animationFrame);
  }, [targetValue, duration]);

  const formattedNumber = new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(count);

  return (
    <span dir="ltr" className="inline-block">
      {prefix}{formattedNumber}{suffix}
    </span>
  );
}
