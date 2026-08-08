"use client";

import React, { useState, useRef } from "react";
import { Camera, Upload, CheckCircle2, X } from "lucide-react";

interface AvatarUploaderProps {
  initialImage?: string;
  onUploadSuccess: (url: string) => void;
  size?: "sm" | "md" | "lg";
}

export default function AvatarUploader({ initialImage, onUploadSuccess, size = "md" }: AvatarUploaderProps) {
  const [image, setImage] = useState<string | null>(initialImage || null);
  const [isHovering, setIsHovering] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-20 h-20",
    lg: "w-32 h-32"
  };

  const iconClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-10 h-10"
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Mock upload process
    setIsUploading(true);
    setTimeout(() => {
      const mockUrl = URL.createObjectURL(file);
      setImage(mockUrl);
      setIsUploading(false);
      onUploadSuccess(mockUrl);
    }, 1500);
  };

  return (
    <div className="relative group inline-block">
      <div 
        className={`${sizeClasses[size]} rounded-full border-2 overflow-hidden bg-slate-900 border-slate-700/50 shadow-xl transition-all ${isHovering ? "border-brand-blue-500 scale-105" : ""} cursor-pointer`}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onClick={() => fileInputRef.current?.click()}
      >
        {image ? (
          <img src={image} alt="Profile Avatar" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-500">
            <UserIcon className={iconClasses[size]} />
          </div>
        )}

        {/* Hover Overlay */}
        <div className={`absolute inset-0 bg-slate-950/60 backdrop-blur-sm flex flex-col items-center justify-center transition-opacity ${isHovering || isUploading ? "opacity-100" : "opacity-0"}`}>
          {isUploading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Camera className={`text-white ${iconClasses[size]}`} />
              {size === "lg" && <span className="text-[10px] text-white font-bold mt-1 uppercase">Change</span>}
            </>
          )}
        </div>
      </div>
      
      {image && size === "lg" && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setImage(null);
          }}
          className="absolute top-0 end-0 p-1 bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded-full border border-red-500/30 transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      )}

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />
    </div>
  );
}

// Simple internal icon for empty state
function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  );
}
