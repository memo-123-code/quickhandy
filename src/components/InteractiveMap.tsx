"use client";

import React, { useEffect } from "react";
import { MapPin } from "lucide-react";
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

// Custom premium markers
const createCustomIcon = (iconHtml: string) => {
  return L.divIcon({
    html: iconHtml,
    className: 'bg-transparent border-none',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });
};

const clientIcon = createCustomIcon(`
  <div class="relative flex items-center justify-center w-10 h-10">
    <div class="absolute inset-0 bg-brand-blue-500 rounded-full animate-ping opacity-20"></div>
    <div class="relative z-10 w-8 h-8 bg-brand-blue-600 rounded-full border-2 border-white flex items-center justify-center shadow-lg">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
    </div>
    <div class="absolute -bottom-1.5 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white"></div>
    <div class="absolute -bottom-1 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-brand-blue-600"></div>
  </div>
`);

const providerIcon = createCustomIcon(`
  <div class="relative flex items-center justify-center w-10 h-10">
    <div class="absolute inset-0 bg-brand-orange-500 rounded-full animate-ping opacity-20"></div>
    <div class="relative z-10 w-8 h-8 bg-brand-orange-500 rounded-full border-2 border-white flex items-center justify-center shadow-lg">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
    </div>
    <div class="absolute -bottom-1.5 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white"></div>
    <div class="absolute -bottom-1 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-brand-orange-500"></div>
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
        onLocationSelect(e.latlng.lat, e.latlng.lng, \`Selected Location (\${e.latlng.lat.toFixed(4)}, \${e.latlng.lng.toFixed(4)})\`);
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

  // Interpolate provider location based on progress along the route
  let activeProviderLoc: { lat: number; lng: number } | null = providerLocation || null;
  if (showRoute && providerLocation && clientLocation) {
    const interpolatedLat = providerLocation.lat + (clientLocation.lat - providerLocation.lat) * routeProgress;
    const interpolatedLng = providerLocation.lng + (clientLocation.lng - providerLocation.lng) * routeProgress;
    activeProviderLoc = { lat: interpolatedLat, lng: interpolatedLng };
  }

  // Ensure SSR doesn't crash before Leaflet loads
  if (typeof window === 'undefined') {
    return <div className="w-full h-full bg-slate-900 rounded-2xl animate-pulse"></div>;
  }

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900 z-0 group">
      <MapContainer 
        center={[clientLocation.lat, clientLocation.lng]} 
        zoom={14} 
        style={{ width: '100%', height: '100%', zIndex: 0 }}
        zoomControl={false}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
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
                onLocationSelect(pos.lat, pos.lng, \`Pinned Location (\${pos.lat.toFixed(4)}, \${pos.lng.toFixed(4)})\`);
              }
            }
          }}
        />

        {activeProviderLoc && (
          <Marker 
            position={[activeProviderLoc.lat, activeProviderLoc.lng]} 
            icon={providerIcon}
          />
        )}

        {showRoute && activeProviderLoc && (
          <Polyline 
            positions={[
              [activeProviderLoc.lat, activeProviderLoc.lng],
              [clientLocation.lat, clientLocation.lng]
            ]}
            pathOptions={{ color: '#0ea5e9', weight: 4, dashArray: '8, 8', opacity: 0.6 }}
          />
        )}
      </MapContainer>

      {/* Interactive HUD instructions */}
      {interactive && (
        <div className="absolute bottom-4 start-1/2 -translate-x-1/2 z-[1000] bg-brand-blue-950/85 border border-brand-blue-500/30 rounded-full px-4 py-2 text-xs text-brand-blue-200 shadow-lg backdrop-blur-md pointer-events-none text-center flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
          <MapPin className="w-3.5 h-3.5 text-brand-orange-500" />
          <span>Click on the map or drag pin to select location</span>
        </div>
      )}

      {/* Route Tracking HUD */}
      {showRoute && activeProviderLoc && (
        <div className="absolute top-4 left-4 z-[1000] bg-slate-900/90 border border-slate-700 rounded-lg p-3 text-xs text-slate-300 backdrop-blur-md shadow-xl w-64 max-w-[90vw]">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-brand-orange-500 animate-pulse"></div>
            <span className="font-semibold text-white">Live Provider Tracking</span>
          </div>
          <div className="mt-2 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-brand-blue-500 h-full transition-all duration-300" style={{ width: \`\${routeProgress * 100}%\` }}></div>
          </div>
        </div>
      )}
    </div>
  );
}
