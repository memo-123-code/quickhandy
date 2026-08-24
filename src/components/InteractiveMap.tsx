"use client";

import React from "react";
import { MapPin, Navigation } from "lucide-react";

interface InteractiveMapProps {
  interactive?: boolean;
  onLocationSelect?: (lat: number, lng: number, address: string) => void;
  providerLocation?: { lat: number; lng: number };
  clientLocation?: { lat: number; lng: number };
  showRoute?: boolean;
  routeProgress?: number;
}

export default function InteractiveMap({
  interactive = false,
  onLocationSelect,
  providerLocation,
  clientLocation = { lat: 30.3015, lng: 31.7406 },
  showRoute = false,
  routeProgress = 0,
}: InteractiveMapProps) {

  const handleMockClick = () => {
    if (interactive && onLocationSelect) {
      // Mock random location around the current client location
      const mockLat = clientLocation.lat + (Math.random() - 0.5) * 0.01;
      const mockLng = clientLocation.lng + (Math.random() - 0.5) * 0.01;
      onLocationSelect(mockLat, mockLng, `Mock Location (${mockLat.toFixed(4)}, ${mockLng.toFixed(4)})`);
    }
  };

  return (
    <div 
      className={`w-full h-full relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900 flex flex-col items-center justify-center transition-colors ${interactive ? 'cursor-pointer hover:bg-slate-800' : ''}`}
      onClick={handleMockClick}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
      
      {/* Mock Map UI Center */}
      <div className="z-10 flex flex-col items-center justify-center text-center p-6 bg-slate-950/80 rounded-2xl border border-brand-blue-500/30 backdrop-blur-md">
        <div className="w-16 h-16 rounded-full bg-brand-blue-900/50 flex items-center justify-center mb-4 border border-brand-blue-500/50 animate-pulse">
          <MapPin className="w-8 h-8 text-brand-orange-500" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">Map Integration Pending</h3>
        <p className="text-sm text-slate-400 max-w-[250px] mb-4">
          Google Maps API is currently unavailable. This is a temporary mock map interface.
        </p>
        
        {interactive && (
          <div className="px-4 py-2 bg-brand-blue-600 text-white text-xs font-semibold rounded-full flex items-center gap-2 hover:bg-brand-blue-500 transition-colors">
            <Navigation className="w-3.5 h-3.5" />
            Click anywhere to pin mock location
          </div>
        )}
      </div>

      {/* Mock Route HUD */}
      {showRoute && providerLocation && (
        <div className="absolute top-4 left-4 z-10 bg-slate-900/90 border border-slate-700 rounded-lg p-3 text-xs text-slate-300 backdrop-blur-md shadow-xl">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-brand-orange-500"></div>
            <span>Provider: {providerLocation.lat.toFixed(4)}, {providerLocation.lng.toFixed(4)}</span>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-brand-blue-500"></div>
            <span>Client: {clientLocation.lat.toFixed(4)}, {clientLocation.lng.toFixed(4)}</span>
          </div>
          <div className="mt-2 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-brand-blue-500 h-full transition-all duration-300" style={{ width: `${routeProgress * 100}%` }}></div>
          </div>
        </div>
      )}
    </div>
  );
}
