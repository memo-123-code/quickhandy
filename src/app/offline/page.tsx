"use client";

import React, { useState, useEffect } from "react";
import { WifiOff, RefreshCw, ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function OfflinePage() {
  const [isRetrying, setIsRetrying] = useState(false);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleRetry = () => {
    setIsRetrying(true);
    setTimeout(() => {
      if (navigator.onLine) {
        window.location.reload();
      } else {
        setIsRetrying(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center selection:bg-brand-blue-500 selection:text-white">
      
      {/* Background Glow */}
      <div className="absolute w-96 h-96 bg-brand-blue-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Main Container */}
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-3xl space-y-6 shadow-2xl relative overflow-hidden">
        
        {/* Header Icon */}
        <div className="mx-auto w-20 h-20 bg-slate-800/80 border border-slate-700/60 rounded-2xl flex items-center justify-center text-brand-orange-500 shadow-inner animate-pulse">
          <WifiOff className="w-10 h-10" />
        </div>

        {/* Content */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <ShieldAlert className="w-3 h-3 text-brand-orange-500" /> Offline Mode Active
          </div>
          <h1 dir="auto" className="text-2xl font-black text-white tracking-tight">No Internet Connection</h1>
          <p dir="auto" className="text-xs text-slate-400 leading-relaxed">
            You are currently offline. QuickHandy Admin cached items remain accessible, but live metrics and network updates require internet connectivity.
          </p>
        </div>

        {/* Status Indicator */}
        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-850 text-xs flex items-center justify-between">
          <span className="text-slate-400 font-medium">Network Status:</span>
          <span className={`font-bold flex items-center gap-1.5 ${isOnline ? "text-emerald-400" : "text-brand-orange-500"}`}>
            <span className={`w-2 h-2 rounded-full ${isOnline ? "bg-emerald-400 animate-ping" : "bg-brand-orange-500"}`} />
            {isOnline ? "Connection Restored" : "Offline"}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="w-full py-3 bg-gradient-to-r from-brand-blue-600 to-brand-blue-500 hover:from-brand-blue-500 hover:to-brand-blue-400 text-white font-bold rounded-xl text-xs shadow-lg shadow-brand-blue-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRetrying ? "animate-spin" : ""}`} />
            {isRetrying ? "Checking connection..." : "Retry Connection"}
          </button>

          <Link
            href="/dashboard/admin"
            className="w-full py-3 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Go to Cached Dashboard
          </Link>
        </div>

      </div>

      {/* Footer */}
      <footer className="mt-8 text-[10px] text-slate-600 font-medium">
        QuickHandy PWA Fallback Engine &bull; Enterprise Administration
      </footer>

    </div>
  );
}
