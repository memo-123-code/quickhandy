import React from "react";

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div 
      className={`animate-pulse bg-slate-800/80 rounded-2xl border border-slate-700/50 w-full h-full min-h-[120px] overflow-hidden ${className || ""}`}
    >
      <div className="h-full w-full bg-gradient-to-r from-slate-800/80 via-slate-700/40 to-slate-800/80 skeleton-shimmer" />
    </div>
  );
}

// Global shimmer CSS could be added to globals.css, but standard pulse works too.
