"use client";

import React, { useEffect, useState } from "react";
import { MapPin, Phone, CheckCircle } from "lucide-react";
import { MapContainer, TileLayer, CircleMarker, useMapEvents, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";

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
  clientLocation, 
  showRoute = false,
  routeProgress = 0,
}: InteractiveMapProps) {

  // Force tracking demo UI if not in interactive mode
  const isTrackingDemo = !interactive; 

  // Hardcode coordinates to guarantee visibility exactly within 10th of Ramadan City
  const defaultCenter = { lat: 30.3000, lng: 31.7400 };
  const fallbackClientLoc = { lat: 30.2950, lng: 31.7450 };
  const fallbackDemoStart = { lat: 30.3050, lng: 31.7350 };
  
  const activeClientLoc = clientLocation || fallbackClientLoc;
  const demoStart = providerLocation || fallbackDemoStart;

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

  const currentProviderLoc = isTrackingDemo 
    ? {
        lat: demoStart.lat + (activeClientLoc.lat - demoStart.lat) * simulatedProgress,
        lng: demoStart.lng + (activeClientLoc.lng - demoStart.lng) * simulatedProgress,
      }
    : providerLocation || demoStart;

  const currentRouteProgress = isTrackingDemo ? simulatedProgress : routeProgress;

  if (typeof window === 'undefined') {
    return <div className="w-full h-full bg-slate-900 rounded-2xl animate-pulse" />;
  }

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900 z-0 font-sans">
      <MapContainer 
        center={[defaultCenter.lat, defaultCenter.lng]} 
        zoom={14} 
        style={{ width: '100%', height: '100%', zIndex: 0 }}
        zoomControl={false}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap'
        />
        
        <MapClickHandler interactive={interactive} onLocationSelect={onLocationSelect} />
        
        {/* Client Marker (Blue Circle) */}
        <CircleMarker 
          center={[activeClientLoc.lat, activeClientLoc.lng]}
          pathOptions={{ color: '#ffffff', fillColor: '#3b82f6', fillOpacity: 1, weight: 3 }}
          radius={12}
        />
        
        {/* Outer glowing pulse for Client */}
        <CircleMarker 
          center={[activeClientLoc.lat, activeClientLoc.lng]}
          pathOptions={{ color: 'transparent', fillColor: '#3b82f6', fillOpacity: 0.3 }}
          radius={24}
          className="animate-ping"
        />

        {/* Handyman Marker (Orange Circle) */}
        {currentProviderLoc && (
          <CircleMarker 
            center={[currentProviderLoc.lat, currentProviderLoc.lng]} 
            pathOptions={{ color: '#ffffff', fillColor: '#f97316', fillOpacity: 1, weight: 3 }}
            radius={14}
          />
        )}
        
        {/* Outer glowing pulse for Handyman */}
        {currentProviderLoc && (
          <CircleMarker 
            center={[currentProviderLoc.lat, currentProviderLoc.lng]} 
            pathOptions={{ color: 'transparent', fillColor: '#f97316', fillOpacity: 0.4 }}
            radius={28}
          />
        )}

        {/* Animated Polyline Route */}
        {currentProviderLoc && (
          <Polyline 
            positions={[
              [currentProviderLoc.lat, currentProviderLoc.lng],
              [activeClientLoc.lat, activeClientLoc.lng]
            ]}
            pathOptions={{ 
              color: '#f97316', 
              weight: 4, 
              dashArray: '5, 10', 
              opacity: 0.9,
              lineCap: 'round',
              className: 'custom-animate-dash'
            }}
          />
        )}
      </MapContainer>

      {/* Global CSS for Polyline animation without Next.js parsing issues */}
      <style>{`
        @keyframes dash {
          to { stroke-dashoffset: -30; }
        }
        .custom-animate-dash {
          animation: dash 1s linear infinite;
        }
      `}</style>

      {/* Smart UI Overlay (Glassmorphism Tracking Card) */}
      {isTrackingDemo && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] w-[90%] max-w-sm pointer-events-auto">
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
                style={{ width: `${currentRouteProgress * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive HUD instructions */}
      {interactive && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] bg-slate-950/80 backdrop-blur-xl border border-brand-blue-500/30 rounded-full px-5 py-3 text-sm font-semibold text-white shadow-2xl flex items-center gap-3 transition-transform hover:scale-105 pointer-events-none">
          <MapPin className="w-4 h-4 text-brand-orange-500 animate-bounce" />
          <span dir="auto">Click anywhere to select location</span>
        </div>
      )}
    </div>
  );
}
