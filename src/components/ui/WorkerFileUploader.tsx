"use client";

import React, { useState, useRef } from "react";
import { Upload, CheckCircle2, Camera, Image as ImageIcon, FileText, X } from "lucide-react";
import { toast } from "sonner";

interface WorkerFileUploaderProps {
  label: string;
  subLabelPending: string;
  subLabelVerified: string;
  isVerified: boolean;
  onUploadSuccess: () => void;
}

export default function WorkerFileUploader({
  label,
  subLabelPending,
  subLabelVerified,
  isVerified,
  onUploadSuccess,
}: WorkerFileUploaderProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const docRef = useRef<HTMLInputElement>(null);

  // Client-side image compression
  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      // For non-images, skip compression
      if (!file.type.startsWith("image/")) {
        resolve(file);
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 1920;
          const MAX_HEIGHT = 1080;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: "image/webp",
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                reject(new Error("Compression failed"));
              }
            },
            "image/webp",
            0.8
          );
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsSheetOpen(false);
    setIsUploading(true);
    setProgress(0);

    try {
      // Simulate client-side compression (this takes a fraction of a second)
      const processedFile = await compressImage(file);
      console.log(`Original Size: ${(file.size / 1024).toFixed(2)}KB, Compressed Size: ${(processedFile.size / 1024).toFixed(2)}KB`);

      // Simulate upload progress
      const uploadInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(uploadInterval);
            return 100;
          }
          return prev + 20;
        });
      }, 400);

      // Wait for "upload" to complete
      await new Promise((resolve) => setTimeout(resolve, 2200));

      toast.success(`${label} uploaded successfully!`);
      onUploadSuccess();
    } catch (error) {
      toast.error("Failed to process file. Please try again.");
    } finally {
      setIsUploading(false);
      setProgress(0);
      // Reset input value to allow selecting the same file again
      if (e.target) e.target.value = "";
    }
  };

  return (
    <>
      {/* Main Trigger Card */}
      <button
        type="button"
        onClick={() => {
          if (!isVerified && !isUploading) setIsSheetOpen(true);
        }}
        disabled={isVerified || isUploading}
        className={`relative p-3.5 rounded-lg border flex items-center gap-3 text-start transition-all overflow-hidden ${
          isVerified
            ? "bg-[#0B1120] border-slate-800/50 cursor-default"
            : isUploading
            ? "bg-slate-800/80 border-cyan-500/50 cursor-wait"
            : "bg-slate-800/50 border-slate-700/50 hover:bg-slate-700/50 cursor-pointer hover:border-slate-600/50"
        }`}
      >
        {/* Progress Bar Background */}
        {isUploading && (
          <div 
            className="absolute start-0 top-0 bottom-0 bg-cyan-500/10 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        )}

        {isUploading ? (
          <div className="w-5 h-5 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin shrink-0 z-10" />
        ) : isVerified ? (
          <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 z-10" />
        ) : (
          <Upload className="w-5 h-5 text-slate-400 shrink-0 z-10" />
        )}
        
        <div className="z-10 flex-1">
          <span className="text-xs font-bold text-slate-200 block">{label}</span>
          <span
            className={`text-[9px] font-bold uppercase transition-colors ${
              isVerified ? "text-green-500" : isUploading ? "text-cyan-400" : "text-slate-400"
            }`}
          >
            {isUploading ? `Uploading... ${progress}%` : isVerified ? subLabelVerified : subLabelPending}
          </span>
        </div>
      </button>

      {/* Hidden File Inputs */}
      <input type="file" accept="image/*" capture="environment" ref={cameraRef} className="hidden" onChange={handleFileSelect} />
      <input type="file" accept="image/*" ref={galleryRef} className="hidden" onChange={handleFileSelect} />
      <input type="file" accept=".pdf,.doc,.docx" ref={docRef} className="hidden" onChange={handleFileSelect} />

      {/* Bottom Action Sheet UI */}
      {isSheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-fadeIn">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsSheetOpen(false)}
          />

          {/* Sheet */}
          <div className="relative w-full max-w-sm bg-slate-800 rounded-t-2xl sm:rounded-2xl shadow-2xl p-6 transform transition-transform animate-slideUp border-t sm:border border-slate-700/50">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 dir="auto" className="text-lg font-bold text-slate-200">Upload {label}</h3>
                <p dir="auto" className="text-xs text-slate-400">Choose an upload method below</p>
              </div>
              <button 
                onClick={() => setIsSheetOpen(false)}
                className="p-2 rounded-full hover:bg-slate-700/50 text-slate-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Option 1: Take Photo */}
              <button
                onClick={() => cameraRef.current?.click()}
                className="w-full p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50 hover:border-cyan-500/30 flex items-center gap-4 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Camera className="w-6 h-6 text-cyan-400" />
                </div>
                <div className="text-start flex-1">
                  <span className="block text-sm font-bold text-slate-200">Take Photo</span>
                  <span className="block text-xs text-slate-400">Use your camera directly</span>
                </div>
              </button>

              {/* Option 2: Gallery */}
              <button
                onClick={() => galleryRef.current?.click()}
                className="w-full p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50 hover:border-blue-500/30 flex items-center gap-4 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ImageIcon className="w-6 h-6 text-blue-400" />
                </div>
                <div className="text-start flex-1">
                  <span className="block text-sm font-bold text-slate-200">Choose from Gallery</span>
                  <span className="block text-xs text-slate-400">Select an existing photo</span>
                </div>
              </button>

              {/* Option 3: Document */}
              <button
                onClick={() => docRef.current?.click()}
                className="w-full p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50 hover:border-indigo-500/30 flex items-center gap-4 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6 text-indigo-400" />
                </div>
                <div className="text-start flex-1">
                  <span className="block text-sm font-bold text-slate-200">Upload Document</span>
                  <span className="block text-xs text-slate-400">PDF, DOC, DOCX files</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
