"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { MapPin, Crosshair, Loader2, Phone, CheckCircle } from "lucide-react";

interface InteractiveMapProps {
  interactive?: boolean;
  onLocationSelect?: (lat: number, lng: number, address: string) => void;
  providerLocation?: { lat: number; lng: number };
  clientLocation?: { lat: number; lng: number };
  showRoute?: boolean;
  routeProgress?: number;
}

const containerStyle = {
  width: "100%",
  height: "100%",
};

export default function InteractiveMap({
  interactive = false,
  onLocationSelect,
  providerLocation,
  clientLocation, 
  showRoute = false,
  routeProgress = 0,
}: InteractiveMapProps) {
  
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const isTrackingDemo = !interactive && showRoute;
  const defaultCenter = { lat: 30.3000, lng: 31.7400 };
  const fallbackClientLoc = { lat: 30.2950, lng: 31.7450 };
  const fallbackDemoStart = { lat: 30.3050, lng: 31.7350 };
  
  const [realLocation, setRealLocation] = useState<{lat: number; lng: number} | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const activeClientLoc = clientLocation || realLocation || fallbackClientLoc;
  const demoStart = providerLocation || fallbackDemoStart;

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback() {
    setMap(null);
  }, []);

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (interactive && onLocationSelect && e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      onLocationSelect(lat, lng, `Selected Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
    }
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setRealLocation({ lat: latitude, lng: longitude });
        if (map) {
          map.panTo({ lat: latitude, lng: longitude });
          map.setZoom(15);
        }
        setIsLocating(false);
      },
      (error) => {
        console.error("Error locating:", error);
        alert("Unable to retrieve your location. Please check your permissions.");
        setIsLocating(false);
      }
    );
  };

  if (!isLoaded) {
    return <div className="w-full h-full bg-slate-900 rounded-2xl animate-pulse flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-brand-blue-500 animate-spin" />
    </div>;
  }

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden shadow-2xl border border-slate-800 z-0">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={activeClientLoc}
        zoom={14}
        onClick={handleMapClick}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          disableDefaultUI: true,
          zoomControl: false,
          styles: [
            { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
            {
              featureType: "road",
              elementType: "geometry",
              stylers: [{ color: "#38414e" }],
            },
            {
              featureType: "road",
              elementType: "geometry.stroke",
              stylers: [{ color: "#212a37" }],
            },
            {
              featureType: "road.highway",
              elementType: "geometry",
              stylers: [{ color: "#746855" }],
            },
            {
              featureType: "water",
              elementType: "geometry",
              stylers: [{ color: "#17263c" }],
            },
          ],
        }}
      >
        <Marker 
          position={activeClientLoc} 
          icon="http://maps.google.com/mapfiles/ms/icons/blue-dot.png" 
        />
        {isTrackingDemo && providerLocation && (
          <Marker 
            position={providerLocation} 
            icon="http://maps.google.com/mapfiles/ms/icons/orange-dot.png" 
          />
        )}
      </GoogleMap>

      <button 
        onClick={handleLocateMe}
        disabled={isLocating}
        className="absolute top-4 right-4 z-[50] w-12 h-12 bg-white/90 backdrop-blur-md border border-slate-200 rounded-full flex items-center justify-center shadow-lg hover:bg-white hover:scale-105 transition-all text-slate-700 disabled:opacity-70 disabled:scale-100"
        title="Find My Location"
      >
        {isLocating ? (
          <Loader2 className="w-6 h-6 animate-spin text-brand-blue-500" />
        ) : (
          <Crosshair className="w-6 h-6 text-brand-blue-600" />
        )}
      </button>

      {isTrackingDemo && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[50] w-[90%] max-w-sm pointer-events-auto">
          <div className="bg-slate-950/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-orange-500/20 flex items-center justify-center text-brand-orange-500">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm" dir="auto">Plumber En Route</h3>
                  <p className="text-brand-blue-400 text-xs font-semibold" dir="auto">ETA: {Math.max(1, Math.ceil((1 - routeProgress) * 10))} Minutes</p>
                </div>
              </div>
              <button className="bg-brand-blue-600 hover:bg-brand-blue-500 transition-colors text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg">
                <Phone className="w-4 h-4" />
              </button>
            </div>
            
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-brand-orange-500 to-brand-blue-500 h-full transition-all duration-300" 
                style={{ width: `${routeProgress * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {interactive && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[50] bg-slate-950/80 backdrop-blur-xl border border-brand-blue-500/30 rounded-full px-5 py-3 text-sm font-semibold text-white shadow-2xl flex items-center gap-3 transition-transform hover:scale-105 pointer-events-none">
          <MapPin className="w-4 h-4 text-brand-orange-500 animate-bounce" />
          <span dir="auto">Click anywhere to select location</span>
        </div>
      )}
    </div>
  );
}
