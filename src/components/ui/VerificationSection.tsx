"use client";

import { useState, useRef } from 'react';
import { Upload, CheckCircle2, ScanLine, TerminalSquare, FileText } from 'lucide-react';

type DocKey = 'id' | 'criminal' | 'certs';
type ScanStatus = 'idle' | 'scanning' | 'verified' | 'error';

interface DocState {
  status: ScanStatus;
  result?: string;
  previewUrl?: string;
  fileName?: string;
  fileSize?: string;
}

export default function VerificationSection() {
  const [docs, setDocs] = useState<Record<DocKey, DocState>>({
    id: { status: 'idle' },
    criminal: { status: 'idle' },
    certs: { status: 'idle' }
  });
  const [logs, setLogs] = useState<string[]>([]);

  // Refs for hidden file inputs
  const idInputRef = useRef<HTMLInputElement>(null);
  const criminalInputRef = useRef<HTMLInputElement>(null);
  const certsInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, docKey: DocKey, docName: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset input value to allow selecting the same file again if needed
    event.target.value = '';

    // Create object URL for local preview
    const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined;
    const fileSizeStr = formatFileSize(file.size);

    // 1. Start Scanning State with Preview
    setDocs((prev) => ({
      ...prev,
      [docKey]: {
        status: 'scanning',
        previewUrl,
        fileName: file.name,
        fileSize: fileSizeStr
      }
    }));
    
    setLogs((prev) => [...prev, `[System] Initiating upload for ${docName} (${fileSizeStr})...`]);

    try {
      // 2. Prepare FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', docKey);

      // 3. Real API call
      const response = await fetch('/api/verify-document', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process document');
      }

      // 4. Update state on success
      setDocs((prev) => ({
        ...prev,
        [docKey]: {
          ...prev[docKey],
          status: 'verified',
          result: data.data.ocrResult
        }
      }));
      setLogs((prev) => [...prev, `[System] ${docName} processed. ${data.data.logMessage}`]);

    } catch (error: any) {
      console.error("Upload error:", error);
      setDocs((prev) => ({
        ...prev,
        [docKey]: {
          ...prev[docKey],
          status: 'error',
          result: error.message || 'Verification Failed'
        }
      }));
      setLogs((prev) => [...prev, `[Error] ${docName} failed: ${error.message || 'Unknown error'}`]);
    }
  };

  const triggerUpload = (docKey: DocKey) => {
    if (docs[docKey].status === 'scanning') return;
    
    if (docKey === 'id') idInputRef.current?.click();
    else if (docKey === 'criminal') criminalInputRef.current?.click();
    else if (docKey === 'certs') certsInputRef.current?.click();
  };

  const renderThumbnail = (docState: DocState) => {
    if (docState.previewUrl) {
      return (
        <div className="relative w-12 h-12 shrink-0 rounded-lg overflow-hidden border border-slate-700">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={docState.previewUrl} alt="Preview" className="object-cover w-full h-full" />
        </div>
      );
    }
    // PDF or no preview
    if (docState.status !== 'idle') {
      return (
        <div className="w-12 h-12 shrink-0 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700">
          <FileText className="w-6 h-6 text-slate-400" />
        </div>
      );
    }
    return <Upload className="w-5 h-5 shrink-0" />;
  };

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold text-white mb-4">Verification & Credentials</h3>
      
      {/* Hidden File Inputs */}
      <input type="file" accept="image/*,application/pdf" className="hidden" ref={idInputRef} onChange={(e) => handleFileUpload(e, 'id', 'National ID')} />
      <input type="file" accept="image/*,application/pdf" className="hidden" ref={criminalInputRef} onChange={(e) => handleFileUpload(e, 'criminal', 'Criminal Record')} />
      <input type="file" accept="image/*,application/pdf" className="hidden" ref={certsInputRef} onChange={(e) => handleFileUpload(e, 'certs', 'Certificates')} />

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* National ID Card */}
        <div 
          onClick={() => triggerUpload('id')}
          className={`relative p-4 rounded-xl border cursor-pointer transition-all overflow-hidden ${
            docs.id.status === 'verified' ? 'bg-slate-900/50 border-green-500/50' 
            : docs.id.status === 'error' ? 'bg-red-950/20 border-red-500/50'
            : 'bg-[#1a1d27] border-slate-700 hover:border-slate-500'
          }`}
        >
          {docs.id.status === 'idle' && (
            <div className="flex items-center gap-3 text-gray-400">
              {renderThumbnail(docs.id)}
              <div>
                <p className="font-medium text-white">National ID</p>
                <p className="text-xs">UPLOAD PENDING (أضغط للرفع)</p>
              </div>
            </div>
          )}
          {docs.id.status === 'scanning' && (
            <div className="flex items-center gap-3 text-blue-400 animate-pulse">
              {renderThumbnail(docs.id)}
              <div className="flex-1 truncate">
                <p className="font-medium text-blue-400">Uploading & Analyzing...</p>
                <p className="text-xs truncate" title={docs.id.fileName}>{docs.id.fileName}</p>
              </div>
              <ScanLine className="w-5 h-5 shrink-0 animate-[spin_3s_linear_infinite]" />
            </div>
          )}
          {docs.id.status === 'verified' && (
            <div className="flex items-center gap-3 text-green-500">
              {renderThumbnail(docs.id)}
              <div className="flex-1">
                <p className="font-medium text-white flex items-center justify-between">
                  National ID <CheckCircle2 className="w-4 h-4 shrink-0" />
                </p>
                <p className="text-xs text-green-500 line-clamp-2">{docs.id.result}</p>
              </div>
            </div>
          )}
          {docs.id.status === 'error' && (
            <div className="flex items-center gap-3 text-red-500">
              {renderThumbnail(docs.id)}
              <div className="flex-1">
                <p className="font-medium text-white">National ID</p>
                <p className="text-xs text-red-500 line-clamp-2">{docs.id.result}</p>
              </div>
            </div>
          )}
        </div>

        {/* Criminal Record Card */}
        <div 
          onClick={() => triggerUpload('criminal')}
          className={`relative p-4 rounded-xl border cursor-pointer transition-all overflow-hidden ${
            docs.criminal.status === 'verified' ? 'bg-slate-900/50 border-green-500/50' 
            : docs.criminal.status === 'error' ? 'bg-red-950/20 border-red-500/50'
            : 'bg-[#1a1d27] border-slate-700 hover:border-slate-500'
          }`}
        >
          {docs.criminal.status === 'idle' && (
            <div className="flex items-center gap-3 text-gray-400">
              {renderThumbnail(docs.criminal)}
              <div>
                <p className="font-medium text-white">Criminal Record</p>
                <p className="text-xs">UPLOAD PENDING (أضغط للرفع)</p>
              </div>
            </div>
          )}
          {docs.criminal.status === 'scanning' && (
            <div className="flex items-center gap-3 text-blue-400 animate-pulse">
              {renderThumbnail(docs.criminal)}
              <div className="flex-1 truncate">
                <p className="font-medium text-blue-400">Uploading & Analyzing...</p>
                <p className="text-xs truncate" title={docs.criminal.fileName}>{docs.criminal.fileName}</p>
              </div>
              <ScanLine className="w-5 h-5 shrink-0 animate-[spin_3s_linear_infinite]" />
            </div>
          )}
          {docs.criminal.status === 'verified' && (
            <div className="flex items-center gap-3 text-green-500">
              {renderThumbnail(docs.criminal)}
              <div className="flex-1">
                <p className="font-medium text-white flex items-center justify-between">
                  Criminal Record <CheckCircle2 className="w-4 h-4 shrink-0" />
                </p>
                <p className="text-xs text-green-500 line-clamp-2">{docs.criminal.result}</p>
              </div>
            </div>
          )}
          {docs.criminal.status === 'error' && (
            <div className="flex items-center gap-3 text-red-500">
              {renderThumbnail(docs.criminal)}
              <div className="flex-1">
                <p className="font-medium text-white">Criminal Record</p>
                <p className="text-xs text-red-500 line-clamp-2">{docs.criminal.result}</p>
              </div>
            </div>
          )}
        </div>

        {/* Certificates Card */}
        <div 
          onClick={() => triggerUpload('certs')}
          className={`relative p-4 rounded-xl border cursor-pointer transition-all overflow-hidden ${
            docs.certs.status === 'verified' ? 'bg-slate-900/50 border-green-500/50' 
            : docs.certs.status === 'error' ? 'bg-red-950/20 border-red-500/50'
            : 'bg-[#1a1d27] border-slate-700 hover:border-slate-500'
          }`}
        >
          {docs.certs.status === 'idle' && (
            <div className="flex items-center gap-3 text-gray-400">
              {renderThumbnail(docs.certs)}
              <div>
                <p className="font-medium text-white">Certificates</p>
                <p className="text-xs">UPLOAD PENDING (أضغط للرفع)</p>
              </div>
            </div>
          )}
          {docs.certs.status === 'scanning' && (
            <div className="flex items-center gap-3 text-blue-400 animate-pulse">
              {renderThumbnail(docs.certs)}
              <div className="flex-1 truncate">
                <p className="font-medium text-blue-400">Uploading & Analyzing...</p>
                <p className="text-xs truncate" title={docs.certs.fileName}>{docs.certs.fileName}</p>
              </div>
              <ScanLine className="w-5 h-5 shrink-0 animate-[spin_3s_linear_infinite]" />
            </div>
          )}
          {docs.certs.status === 'verified' && (
            <div className="flex items-center gap-3 text-green-500">
              {renderThumbnail(docs.certs)}
              <div className="flex-1">
                <p className="font-medium text-white flex items-center justify-between">
                  Certificates <CheckCircle2 className="w-4 h-4 shrink-0" />
                </p>
                <p className="text-xs text-green-500 line-clamp-2">{docs.certs.result}</p>
              </div>
            </div>
          )}
          {docs.certs.status === 'error' && (
            <div className="flex items-center gap-3 text-red-500">
              {renderThumbnail(docs.certs)}
              <div className="flex-1">
                <p className="font-medium text-white">Certificates</p>
                <p className="text-xs text-red-500 line-clamp-2">{docs.certs.result}</p>
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
              <div key={index} className={`animate-slideUp ${log.startsWith('[Error]') ? 'text-red-400' : 'text-green-400'}`}>
                <span className="text-slate-500">[{new Date().toLocaleTimeString()}]</span> {log}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
