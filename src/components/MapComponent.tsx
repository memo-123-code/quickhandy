"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
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

// Live GPS Tracking Control
function LocateControl({ interactive, onLocationSelect }: any) {
  const map = useMap();
  const [isLocating, setIsLocating] = useState(false);

  return (
    <div className="absolute bottom-[80px] end-4 z-[1000] pointer-events-auto">
      <button
        type="button"
        disabled={isLocating}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!interactive || !onLocationSelect) return;
          
          setIsLocating(true);
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const { latitude, longitude } = pos.coords;
              // Smoothly fly to the user's location (Cinematic Live Tracking)
              map.flyTo([latitude, longitude], 16, { animate: true, duration: 1.5 });
              // Reverse geocode and update pin automatically
              reverseGeocode(latitude, longitude, onLocationSelect);
              setIsLocating(false);
            },
            (err) => {
              console.error("GPS Error:", err);
              setIsLocating(false);
              alert("Unable to retrieve your location. Please check browser permissions.");
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 } // Optimized for instant location retrieval
          );
        }}
        className="bg-slate-900 border-2 border-slate-700 hover:border-brand-orange-500 hover:bg-slate-800 text-brand-orange-500 w-12 h-12 flex items-center justify-center rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.5)] transition-all disabled:opacity-50"
        title="Live GPS Tracking"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={isLocating ? "animate-pulse" : ""}><circle cx="12" cy="12" r="10"/><line x1="22" y1="12" x2="18" y2="12"/><line x1="6" y1="12" x2="2" y2="12"/><line x1="12" y1="6" x2="12" y2="2"/><line x1="12" y1="22" x2="12" y2="18"/></svg>
      </button>
    </div>
  );
}

export default function MapComponent({
  interactive = false,
  onLocationSelect,
  providerLocation,
  clientLocation = { lat: 30.3015, lng: 31.7406 },
  showRoute = false,
  routeProgress = 0,
}: any) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Calculate moving marker position if route is shown
  let activeProviderLoc = providerLocation;
  if (showRoute && providerLocation && clientLocation) {
    const interpolatedLat = providerLocation.lat + (clientLocation.lat - providerLocation.lat) * routeProgress;
    const interpolatedLng = providerLocation.lng + (clientLocation.lng - providerLocation.lng) * routeProgress;
    activeProviderLoc = { lat: interpolatedLat, lng: interpolatedLng };
  }

  // Direct Google Maps Tiles (100% Free, NO API Key needed, Full POIs/Shops in Arabic)
  const tileUrl = "https://mt1.google.com/vt/lyrs=m&hl=ar&x={x}&y={y}&z={z}";

  return (
    <>
      {/* Vibrant Dark Mode Filter: Inverts colors but restores original hues (blue water, green parks) so it looks alive! */}
      <style dangerouslySetInnerHTML={{ __html: `
        .leaflet-tile-pane {
          filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
        }
      ` }} />
      <MapContainer
      center={[clientLocation.lat, clientLocation.lng]}
      zoom={15}
      style={{ width: "100%", height: "100%", zIndex: 1 }}
      zoomControl={true}
    >
      <TileLayer
        url={tileUrl}
        attribution='&copy; Google Maps'
      />
      
      {interactive && onLocationSelect && (
        <>
          <LocationSelector interactive={interactive} onLocationSelect={onLocationSelect} />
          <LocateControl interactive={interactive} onLocationSelect={onLocationSelect} />
        </>
      )}

      {clientLocation && (
        <Marker position={[clientLocation.lat, clientLocation.lng]} />
      )}

      {activeProviderLoc && (
        <Marker position={[activeProviderLoc.lat, activeProviderLoc.lng]} />
      )}
    </MapContainer>
    </>
  );
}
