"use client";

import React from "react";
import { CheckCircle2, AlertCircle, ScanLine, FileText } from "lucide-react";

export type SmartStatus = 'idle' | 'scanning' | 'success' | 'error';

export interface OcrData {
  identified?: string;
  confidence?: string;
  statusText?: string;
  errorText?: string;
}

interface SmartUploadCardProps {
  label: string;
  icon?: React.ReactNode;
  status: SmartStatus;
  ocrData?: OcrData;
  onClick: () => void;
}

export default function SmartUploadCard({
  label,
  icon = <FileText className="w-6 h-6 text-slate-400" />,
  status,
  ocrData,
  onClick
}: SmartUploadCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={status === 'scanning' || status === 'success'}
      className={`relative w-full p-4 rounded-xl border flex flex-col items-start gap-3 text-start transition-all overflow-hidden ${
        status === 'success'
          ? "bg-green-950/20 border-green-500/30 cursor-default"
          : status === 'error'
          ? "bg-red-950/20 border-red-500/40 hover:bg-red-900/30 cursor-pointer"
          : status === 'scanning'
          ? "bg-indigo-950/20 border-indigo-500/50 cursor-wait shadow-[0_0_20px_rgba(99,102,241,0.15)]"
          : "bg-slate-900/50 border-slate-700 hover:bg-slate-800 hover:border-slate-600 cursor-pointer"
      } backdrop-blur-md`}
    >
      {/* Header Row */}
      <div className="flex items-center gap-3 w-full relative z-10">
        <div className={`p-2 rounded-lg shrink-0 ${
          status === 'scanning' ? "bg-indigo-500/20 text-indigo-400"
          : status === 'success' ? "bg-green-500/20 text-green-400"
          : status === 'error' ? "bg-red-500/20 text-red-400"
          : "bg-slate-800 text-slate-400"
        }`}>
          {status === 'scanning' ? <ScanLine className="w-5 h-5 animate-pulse" /> 
           : status === 'success' ? <CheckCircle2 className="w-5 h-5" />
           : status === 'error' ? <AlertCircle className="w-5 h-5" />
           : icon}
        </div>
        <div className="flex-1">
          <span className="text-sm font-bold text-slate-200 block">{label}</span>
          <span className={`text-[10px] font-bold uppercase tracking-wider block mt-0.5 ${
            status === 'scanning' ? "text-indigo-400"
            : status === 'success' ? "text-green-500"
            : status === 'error' ? "text-red-500"
            : "text-slate-500"
          }`}>
            {status === 'idle' ? "Click to Scan (أضغط للبدء)"
             : status === 'scanning' ? "Smart Reader Active / Scanning..."
             : status === 'success' ? "Verified & Cleared"
             : "Verification Failed"}
          </span>
        </div>
      </div>

      {/* Dynamic Content Body */}
      <div className="w-full relative z-10 mt-1">
        {status === 'scanning' && (
          <div className="w-full h-24 rounded-lg bg-slate-950/50 border border-slate-800 relative overflow-hidden flex items-center justify-center">
            <FileText className="w-10 h-10 text-slate-700" />
            {/* Laser Line */}
            <div className="absolute left-0 right-0 h-[2px] bg-indigo-500 shadow-[0_0_12px_3px_rgba(99,102,241,0.9)] animate-laserScan" />
          </div>
        )}

        {status === 'success' && ocrData && (
          <div className="w-full space-y-1.5 p-3 rounded-lg bg-green-950/30 border border-green-500/20 text-[10px] text-green-100 font-mono">
            {ocrData.identified && <div className="flex justify-between"><span className="opacity-70">Identified:</span> <span className="font-bold text-green-400">{ocrData.identified}</span></div>}
            {ocrData.confidence && <div className="flex justify-between"><span className="opacity-70">Confidence:</span> <span className="font-bold text-green-400">{ocrData.confidence}</span></div>}
            {ocrData.statusText && <div className="flex justify-between"><span className="opacity-70">Status:</span> <span className="font-bold text-green-400">{ocrData.statusText}</span></div>}
          </div>
        )}

        {status === 'error' && ocrData?.errorText && (
          <div className="w-full p-3 rounded-lg bg-red-950/30 border border-red-500/20 text-[10px] text-red-200 leading-relaxed">
            {ocrData.errorText}
          </div>
        )}
      </div>

      <style>{`
        @keyframes laserScan {
          0% { top: -5%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 105%; opacity: 0; }
        }
        .animate-laserScan {
          animation: laserScan 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>
    </button>
  );
}
