import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger"
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const bgStyles = {
    danger: "bg-red-500 hover:bg-red-600 shadow-red-500/20",
    warning: "bg-brand-orange-500 hover:bg-brand-orange-600 shadow-brand-orange-500/20",
    info: "bg-brand-blue-500 hover:bg-brand-blue-600 shadow-brand-blue-500/20"
  };

  const iconStyles = {
    danger: "text-red-500 bg-red-500/10 border-red-500/20",
    warning: "text-brand-orange-500 bg-brand-orange-500/10 border-brand-orange-500/20",
    info: "text-brand-blue-500 bg-brand-blue-500/10 border-brand-blue-500/20"
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-5">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${iconStyles[variant]}`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <h3 dir="auto" className="text-xl font-bold text-white mb-2">{title}</h3>
          <p dir="auto" className="text-slate-400 leading-relaxed mb-6">{message}</p>
          
          <div className="flex items-center gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`px-5 py-2.5 text-sm font-medium text-white rounded-lg transition-colors shadow-lg ${bgStyles[variant]}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
