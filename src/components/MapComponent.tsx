"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Circle, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet's default icon paths in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function reverseGeocode(lat: number, lng: number, onLocationSelect: any) {
  fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
    headers: {
      "Accept-Language": "ar,en",
      "User-Agent": "QuickHandyClientDashboard/2.0"
    }
  })
  .then(res => res.json())
  .then(data => {
    // Smart Parsing for house-level accuracy
    const addressDetails = data.address || {};
    const house = addressDetails.house_number || addressDetails.building;
    const road = addressDetails.road || addressDetails.pedestrian;
    const neighbourhood = addressDetails.neighbourhood || addressDetails.suburb || addressDetails.quarter;
    const city = addressDetails.city || addressDetails.town || addressDetails.village;
    
    let smartAddress = [];
    if (house) smartAddress.push(`مبنى/رقم ${house}`);
    if (road) smartAddress.push(road);
    if (neighbourhood) smartAddress.push(neighbourhood);
    if (city) smartAddress.push(city);
    
    const fallbackName = data.display_name?.split(',').slice(0, 3).join('، '); // Shorter fallback
    const finalAddress = smartAddress.length > 0 ? smartAddress.join("، ") : fallbackName;
    
    onLocationSelect(lat, lng, finalAddress || `موقع محدد (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
  })
  .catch(() => {
    onLocationSelect(lat, lng, `موقع محدد (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
  });
}

// Custom component to handle map clicks for interactive mode
function LocationSelector({ interactive, onLocationSelect }: any) {
  useMapEvents({
    click(e) {
      if (!interactive || !onLocationSelect) return;
      reverseGeocode(e.latlng.lat, e.latlng.lng, onLocationSelect);
    }
  });
  return null;
}

// Smart "Locate Me" Button Overlay
function SmartLocateControl({ setProviderLocation, setIsFlashFeedback }: any) {
  const map = useMap();
  const [isLocating, setIsLocating] = useState(false);

  return (
    <div className="absolute top-4 end-4 z-[1000] flex items-center gap-2 pointer-events-auto">
      <button
        type="button"
        disabled={isLocating}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsLocating(true);
          
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const { latitude, longitude } = pos.coords;
              // Smoothly fly to the updated location
              map.flyTo([latitude, longitude], 16, { animate: true, duration: 1.5 });
              
              if (setProviderLocation) {
                 setProviderLocation({ lat: latitude, lng: longitude });
              }
              
              setIsLocating(false);
              // Trigger flash feedback on marker
              setIsFlashFeedback(true);
              setTimeout(() => setIsFlashFeedback(false), 2000);
            },
            (err) => {
              console.error("GPS Error:", err);
              setIsLocating(false);
              // Fallback for desktop testing / denial
              alert("GPS signal unavailable. Defaulting to current view.");
              map.flyTo([30.2982, 31.7418], 14, { animate: true, duration: 1.5 });
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 }
          );
        }}
        className="px-3.5 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-850 border border-brand-orange-500/40 text-xs font-bold text-white shadow-xl backdrop-blur-md flex items-center gap-2 transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
        title="Recenter Map on Real GPS Location"
      >
        <svg className={`w-4 h-4 text-brand-orange-500 ${isLocating ? "animate-spin" : ""}`} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="22" y1="12" x2="18" y2="12"/><line x1="6" y1="12" x2="2" y2="12"/><line x1="12" y1="6" x2="12" y2="2"/><line x1="12" y1="22" x2="12" y2="18"/>
        </svg>
        <span>{isLocating ? "Finding Location... (جاري تحديد الموقع...)" : "Locate Me (تحديد موقعي)"}</span>
      </button>
    </div>
  );
}

export default function MapComponent({
  interactive = false,
  onLocationSelect,
  providerLocation,
  setProviderLocation,
  clientLocation,
  jobCategory = "General Maintenance",
  showRoute = false,
  routeProgress = 0,
}: any) {
  const [mounted, setMounted] = useState(false);
  const [isFlashFeedback, setIsFlashFeedback] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Center on 10th of Ramadan City
  const defaultCenter: [number, number] = [30.2982, 31.7418];

  // Calculate moving marker position if route is shown
  let activeProviderLoc = providerLocation;
  if (showRoute && providerLocation && clientLocation) {
    const interpolatedLat = providerLocation.lat + (clientLocation.lat - providerLocation.lat) * routeProgress;
    const interpolatedLng = providerLocation.lng + (clientLocation.lng - providerLocation.lng) * routeProgress;
    activeProviderLoc = { lat: interpolatedLat, lng: interpolatedLng };
  }

  // OpenStreetMap Tiles (100% Free, NO API Key needed)
  const tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  // --- Requirements Implementations ---
  // 1. Pulsing Location Marker for Provider
  const providerIcon = L.divIcon({
    html: `<div class="relative w-6 h-6 -top-3 -left-3 transition-transform duration-500 ${isFlashFeedback ? 'scale-125' : ''}">
             <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
             <span class="relative inline-flex rounded-full h-6 w-6 bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center">
                <div class="w-2 h-2 bg-white rounded-full"></div>
             </span>
           </div>`,
    className: "custom-provider-icon",
    iconSize: [0, 0]
  });

  // 2. Categorized Service Pins
  const getServiceIcon = (category: string) => {
    let bgClass = "bg-green-500";
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`; // Wrench
    
    if (category === "Plumbing") {
      bgClass = "bg-cyan-500";
      svg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>`; // Water Drop
    } else if (category === "Electrical") {
      bgClass = "bg-amber-500";
      svg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`; // Lightning Bolt
    }
    
    const html = `<div class="w-8 h-8 ${bgClass} rounded-full border-2 border-white flex items-center justify-center shadow-lg relative -top-4 -left-4">${svg}</div>`;
    
    return L.divIcon({
      html,
      className: "custom-leaflet-icon",
      iconSize: [0, 0],
    });
  };

  // 3. High-Demand Zones
  const highDemandZones = [
    { center: [30.2982, 31.7418] as [number, number], radius: 600, options: { fillColor: '#f97316', fillOpacity: 0.25, stroke: false } },
    { center: [30.3050, 31.7500] as [number, number], radius: 450, options: { fillColor: '#f97316', fillOpacity: 0.25, stroke: false } }, // Neighborhood 22/25 roughly
    { center: [30.2900, 31.7350] as [number, number], radius: 500, options: { fillColor: '#f97316', fillOpacity: 0.25, stroke: false } }
  ];

  // Mock Nearby Jobs (For display if no active client)
  const mockNearbyJobs = [
    { lat: 30.2995, lng: 31.7430, category: "Plumbing" },
    { lat: 30.2950, lng: 31.7400, category: "Electrical" },
    { lat: 30.3010, lng: 31.7380, category: "General Maintenance" }
  ];

  return (
    <>
      <MapContainer
        center={defaultCenter}
        zoom={14}
        style={{ width: "100%", height: "100%", zIndex: 1 }}
        zoomControl={true}
      >
        <TileLayer
          url={tileUrl}
          attribution='&copy; OpenStreetMap'
        />
        
        {interactive && onLocationSelect && (
          <LocationSelector interactive={interactive} onLocationSelect={onLocationSelect} />
        )}

        {/* Smart Locate Me Overlay */}
        {setProviderLocation && (
          <SmartLocateControl setProviderLocation={setProviderLocation} setIsFlashFeedback={setIsFlashFeedback} />
        )}

        {/* High Demand Heatmap Overlays */}
        {highDemandZones.map((zone, idx) => (
          <Circle key={`zone-${idx}`} center={zone.center} radius={zone.radius} pathOptions={zone.options} />
        ))}

        {/* Client Marker or Mock Nearby Jobs */}
        {clientLocation ? (
          <Marker position={[clientLocation.lat, clientLocation.lng]} icon={getServiceIcon(jobCategory)} />
        ) : (
          mockNearbyJobs.map((job, idx) => (
            <Marker key={`mock-${idx}`} position={[job.lat, job.lng]} icon={getServiceIcon(job.category)} />
          ))
        )}

        {/* Pulsing Provider Marker */}
        {activeProviderLoc && (
          <Marker position={[activeProviderLoc.lat, activeProviderLoc.lng]} icon={providerIcon} />
        )}
      </MapContainer>
    </>
  );
}
