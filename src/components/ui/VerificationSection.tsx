"use client";

import { useState } from 'react';
import { Upload, CheckCircle2, ScanLine, TerminalSquare } from 'lucide-react';

export default function VerificationSection() {
  // States: 'idle' | 'scanning' | 'verified'
  const [docs, setDocs] = useState({ id: 'idle', criminal: 'idle', certs: 'idle' });
  const [logs, setLogs] = useState<string[]>([]);

  const handleScan = (docKey: 'id' | 'criminal' | 'certs', docName: string, result: string, logMsg: string) => {
    // 1. Start Scanning State
    setDocs((prev) => ({ ...prev, [docKey]: 'scanning' }));
    
    // 2. Simulate AI Processing Delay (3 seconds)
    setTimeout(() => {
      setDocs((prev) => ({ ...prev, [docKey]: 'verified' }));
      setLogs((prev) => [...prev, `[System] ${docName} processed. ${logMsg}`]);
    }, 3000);
  };

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold text-white mb-4">Verification & Credentials</h3>
      
      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* National ID Card */}
        <div 
          onClick={() => docs.id === 'idle' && handleScan('id', 'National ID', 'AI Confidence: 99.8% | Type: ID Match', 'Face matched.')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            docs.id === 'verified' ? 'bg-slate-900/50 border-green-500/50' : 'bg-[#1a1d27] border-slate-700 hover:border-slate-500'
          }`}
        >
          {docs.id === 'idle' && (
            <div className="flex items-center gap-3 text-gray-400">
              <Upload className="w-5 h-5" />
              <div>
                <p className="font-medium text-white">National ID</p>
                <p className="text-xs">UPLOAD PENDING (أضغط للرفع)</p>
              </div>
            </div>
          )}
          {docs.id === 'scanning' && (
            <div className="flex items-center gap-3 text-blue-400 animate-pulse">
              <ScanLine className="w-5 h-5 animate-[spin_3s_linear_infinite]" />
              <div>
                <p className="font-medium text-blue-400">Scanning Document...</p>
                <p className="text-xs">AI Smart Reader Active</p>
              </div>
            </div>
          )}
          {docs.id === 'verified' && (
            <div className="flex items-center gap-3 text-green-500">
              <CheckCircle2 className="w-5 h-5" />
              <div>
                <p className="font-medium text-white">National ID</p>
                <p className="text-xs text-green-500">AI Confidence: 99.8% | Type: ID Match</p>
              </div>
            </div>
          )}
        </div>

        {/* Criminal Record Card */}
        <div 
          onClick={() => docs.criminal === 'idle' && handleScan('criminal', 'Criminal Record', 'AI Confidence: 95.0% | Status: Cleared', 'No infractions found.')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            docs.criminal === 'verified' ? 'bg-slate-900/50 border-green-500/50' : 'bg-[#1a1d27] border-slate-700 hover:border-slate-500'
          }`}
        >
          {docs.criminal === 'idle' && (
            <div className="flex items-center gap-3 text-gray-400">
              <Upload className="w-5 h-5" />
              <div>
                <p className="font-medium text-white">Criminal Record</p>
                <p className="text-xs">UPLOAD PENDING (أضغط للرفع)</p>
              </div>
            </div>
          )}
          {docs.criminal === 'scanning' && (
            <div className="flex items-center gap-3 text-blue-400 animate-pulse">
              <ScanLine className="w-5 h-5 animate-[spin_3s_linear_infinite]" />
              <div>
                <p className="font-medium text-blue-400">Scanning Document...</p>
                <p className="text-xs">AI Smart Reader Active</p>
              </div>
            </div>
          )}
          {docs.criminal === 'verified' && (
            <div className="flex items-center gap-3 text-green-500">
              <CheckCircle2 className="w-5 h-5" />
              <div>
                <p className="font-medium text-white">Criminal Record</p>
                <p className="text-xs text-green-500">AI Confidence: 95.0% | Status: Cleared</p>
              </div>
            </div>
          )}
        </div>

        {/* Certificates Card */}
        <div 
          onClick={() => docs.certs === 'idle' && handleScan('certs', 'Certificates', 'AI Confidence: 94.2% | Verified', 'Genuine Document Detected.')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            docs.certs === 'verified' ? 'bg-slate-900/50 border-green-500/50' : 'bg-[#1a1d27] border-slate-700 hover:border-slate-500'
          }`}
        >
          {docs.certs === 'idle' && (
            <div className="flex items-center gap-3 text-gray-400">
              <Upload className="w-5 h-5" />
              <div>
                <p className="font-medium text-white">Certificates</p>
                <p className="text-xs">UPLOAD PENDING (أضغط للرفع)</p>
              </div>
            </div>
          )}
          {docs.certs === 'scanning' && (
            <div className="flex items-center gap-3 text-blue-400 animate-pulse">
              <ScanLine className="w-5 h-5 animate-[spin_3s_linear_infinite]" />
              <div>
                <p className="font-medium text-blue-400">Scanning Document...</p>
                <p className="text-xs">AI Smart Reader Active</p>
              </div>
            </div>
          )}
          {docs.certs === 'verified' && (
            <div className="flex items-center gap-3 text-green-500">
              <CheckCircle2 className="w-5 h-5" />
              <div>
                <p className="font-medium text-white">Certificates</p>
                <p className="text-xs text-green-500">AI Confidence: 94.2% | Verified</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Terminal Report (Appears only if there are logs) */}
      {logs.length > 0 && (
        <div className="mt-6 p-4 bg-black/80 rounded-xl border border-slate-800 font-mono text-sm shadow-xl">
          <div className="flex items-center gap-2 text-slate-400 mb-3 border-b border-slate-800 pb-2">
            <TerminalSquare className="w-4 h-4" />
            <span>AI VERIFICATION SYSTEM LOGS</span>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index} className="text-green-400 animate-slideUp">
                <span className="text-slate-500">[{new Date().toLocaleTimeString()}]</span> {log}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
