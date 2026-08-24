"use client";

import React, { useEffect, useState } from "react";
import { MapPin, Phone, CheckCircle } from "lucide-react";
import { MapContainer, TileLayer, Marker, useMapEvents, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default Leaflet icon paths in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const createCustomIcon = (iconHtml: string) => {
  return L.divIcon({
    html: iconHtml,
    className: 'bg-transparent border-none',
    iconSize: [48, 48],
    iconAnchor: [24, 48],
  });
};

const clientIcon = createCustomIcon(`
  <div class="relative flex items-center justify-center w-12 h-12 group">
    <div class="absolute inset-0 bg-brand-blue-500 rounded-full animate-ping opacity-30"></div>
    <div class="relative z-10 w-8 h-8 bg-brand-blue-600 rounded-full border-[3px] border-white flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.6)]">
      <div class="w-2.5 h-2.5 bg-white rounded-full"></div>
    </div>
    <div class="absolute -bottom-2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white drop-shadow-md"></div>
  </div>
`);

const providerIcon = createCustomIcon(`
  <div class="relative flex items-center justify-center w-12 h-12">
    <div class="absolute inset-0 bg-brand-orange-500 rounded-full animate-ping opacity-40" style="animation-duration: 2s;"></div>
    <div class="relative z-10 w-10 h-10 bg-gradient-to-br from-brand-orange-400 to-brand-orange-600 rounded-full border-[3px] border-white flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.7)]">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
    </div>
    <div class="absolute -bottom-2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-white drop-shadow-lg"></div>
  </div>
`);

interface InteractiveMapProps {
  interactive?: boolean;
  onLocationSelect?: (lat: number, lng: number, address: string) => void;
  providerLocation?: { lat: number; lng: number };
  clientLocation?: { lat: number; lng: number };
  showRoute?: boolean;
  routeProgress?: number;
}

function MapClickHandler({ interactive, onLocationSelect }: { interactive: boolean; onLocationSelect?: (lat: number, lng: number, address: string) => void }) {
  useMapEvents({
    click(e) {
      if (interactive && onLocationSelect) {
        onLocationSelect(e.latlng.lat, e.latlng.lng, `Selected Location (${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)})`);
      }
    },
  });
  return null;
}

export default function InteractiveMap({
  interactive = false,
  onLocationSelect,
  providerLocation,
  clientLocation = { lat: 30.3015, lng: 31.7406 }, // Default 10th of Ramadan City
  showRoute = false,
  routeProgress = 0,
}: InteractiveMapProps) {

  // Force tracking demo UI if not in interactive mode
  const isTrackingDemo = !interactive; 

  const [simulatedProgress, setSimulatedProgress] = useState(0);

  useEffect(() => {
    if (!isTrackingDemo) return;
    const interval = setInterval(() => {
      setSimulatedProgress((prev) => {
        if (prev >= 1) return 0; // loop back
        return prev + 0.002; // Smooth movement
      });
    }, 50);
    return () => clearInterval(interval);
  }, [isTrackingDemo]);

  // Demo Provider starts slightly Southwest of the Client
  const demoStart = { lat: clientLocation.lat - 0.015, lng: clientLocation.lng - 0.015 };
  
  const currentProviderLoc = isTrackingDemo 
    ? {
        lat: demoStart.lat + (clientLocation.lat - demoStart.lat) * simulatedProgress,
        lng: demoStart.lng + (clientLocation.lng - demoStart.lng) * simulatedProgress,
      }
    : providerLocation;

  const currentRouteProgress = isTrackingDemo ? simulatedProgress : routeProgress;

  if (typeof window === 'undefined') {
    return <div className="w-full h-full bg-slate-900 rounded-2xl animate-pulse"></div>;
  }

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900 z-0 font-sans">
      <MapContainer 
        center={[clientLocation.lat, clientLocation.lng]} 
        zoom={14} 
        style={{ width: '100%', height: '100%', zIndex: 0 }}
        zoomControl={false}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        
        <MapClickHandler interactive={interactive} onLocationSelect={onLocationSelect} />
        
        <Marker 
          position={[clientLocation.lat, clientLocation.lng]} 
          icon={clientIcon}
          draggable={interactive}
          eventHandlers={{
            dragend: (e) => {
              if (interactive && onLocationSelect) {
                const marker = e.target;
                const pos = marker.getLatLng();
                onLocationSelect(pos.lat, pos.lng, `Pinned Location (${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)})`);
              }
            }
          }}
        />

        {currentProviderLoc && (
          <Marker 
            position={[currentProviderLoc.lat, currentProviderLoc.lng]} 
            icon={providerIcon}
          />
        )}

        {currentProviderLoc && (
          <Polyline 
            positions={[
              [currentProviderLoc.lat, currentProviderLoc.lng],
              [clientLocation.lat, clientLocation.lng]
            ]}
            pathOptions={{ 
              color: '#f97316', 
              weight: 5, 
              dashArray: '10, 15', 
              opacity: 0.8,
              lineCap: 'round',
              className: 'animate-[dash_1s_linear_infinite]'
            }}
          />
        )}
      </MapContainer>

      {/* Global CSS for Polyline animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes dash {
          to { stroke-dashoffset: -25; }
        }
        .animate-\\[dash_1s_linear_infinite\\] {
          animation: dash 1s linear infinite;
        }
      `}} />

      {/* Smart UI Overlay (Glassmorphism Tracking Card) */}
      {isTrackingDemo && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] w-[90%] max-w-sm">
          <div className="bg-slate-950/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-orange-500/20 flex items-center justify-center text-brand-orange-500">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm" dir="auto">Plumber En Route</h3>
                  <p className="text-brand-blue-400 text-xs font-semibold" dir="auto">ETA: {Math.max(1, Math.ceil((1 - currentRouteProgress) * 10))} Minutes</p>
                </div>
              </div>
              <button className="bg-brand-blue-600 hover:bg-brand-blue-500 transition-colors text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg">
                <Phone className="w-4 h-4" />
              </button>
            </div>
            
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-brand-orange-500 to-brand-blue-500 h-full transition-all duration-300" 
                style={{ width: \`\${currentRouteProgress * 100}%\` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive HUD instructions */}
      {interactive && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] bg-slate-950/80 backdrop-blur-xl border border-brand-blue-500/30 rounded-full px-5 py-3 text-sm font-semibold text-white shadow-2xl flex items-center gap-3 transition-transform hover:scale-105">
          <MapPin className="w-4 h-4 text-brand-orange-500 animate-bounce" />
          <span dir="auto">Click anywhere to select location</span>
        </div>
      )}
    </div>
  );
}
