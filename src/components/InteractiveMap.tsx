"use client";

import React, { useEffect, useState, useRef } from "react";
import { MapPin, Phone, CheckCircle, Crosshair, Loader2 } from "lucide-react";

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
  clientLocation,
  showRoute = false,
  routeProgress = 0,
}: InteractiveMapProps) {

  const isTrackingDemo = !interactive;

  const defaultCenter = { lat: 30.3000, lng: 31.7400 };
  const fallbackClientLoc = { lat: 30.2950, lng: 31.7450 };
  const fallbackDemoStart = { lat: 30.3050, lng: 31.7350 };

  const [realLocation, setRealLocation] = useState<{lat: number; lng: number} | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const activeClientLoc = realLocation || clientLocation || fallbackClientLoc;
  const demoStart = providerLocation || fallbackDemoStart;

  const [simulatedProgress, setSimulatedProgress] = useState(0);
  const [routeCoords, setRouteCoords] = useState<[number, number][] | null>(null);

  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const providerMarkerRef = useRef<any>(null);
  const routeLineRef = useRef<any>(null);
  const clientMarkerRef = useRef<any>(null);
  const clientPulseRef = useRef<any>(null);

  // Fetch Real Road Geometry from OSRM (free)
  useEffect(() => {
    if (!isTrackingDemo) return;

    const fetchRoute = async () => {
      try {
        const res = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${demoStart.lng},${demoStart.lat};${activeClientLoc.lng},${activeClientLoc.lat}?geometries=geojson`
        );
        const data = await res.json();
        if (data.routes && data.routes[0]) {
          const coords = data.routes[0].geometry.coordinates.map((c: number[]) => [c[1], c[0]]);
          setRouteCoords(coords);
        }
      } catch (e) {
        console.error("OSRM Error:", e);
      }
    };
    fetchRoute();
  }, [demoStart.lat, demoStart.lng, activeClientLoc.lat, activeClientLoc.lng, isTrackingDemo]);

  // Animation Loop
  useEffect(() => {
    if (!isTrackingDemo) return;
    const interval = setInterval(() => {
      setSimulatedProgress((prev) => {
        if (prev >= 1) return 0;
        return prev + 0.001;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [isTrackingDemo]);

  // Calculate Provider Position along route
  const currentProviderLoc = (() => {
    if (isTrackingDemo) {
      if (routeCoords && routeCoords.length > 0) {
        const totalPoints = routeCoords.length;
        const exactIndex = simulatedProgress * (totalPoints - 1);
        const lowerIndex = Math.floor(exactIndex);
        const upperIndex = Math.min(Math.ceil(exactIndex), totalPoints - 1);
        const fraction = exactIndex - lowerIndex;
        const p1 = routeCoords[lowerIndex];
        const p2 = routeCoords[upperIndex];
        return {
          lat: p1[0] + (p2[0] - p1[0]) * fraction,
          lng: p1[1] + (p2[1] - p1[1]) * fraction,
        };
      }
      return {
        lat: demoStart.lat + (activeClientLoc.lat - demoStart.lat) * simulatedProgress,
        lng: demoStart.lng + (activeClientLoc.lng - demoStart.lng) * simulatedProgress,
      };
    }
    return providerLocation || demoStart;
  })();

  const currentRouteProgress = isTrackingDemo ? simulatedProgress : routeProgress;

  // Leaflet Map Init
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    const L = require("leaflet");
    require("leaflet/dist/leaflet.css");

    if (!mapRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView([defaultCenter.lat, defaultCenter.lng], 14);

      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap",
      }).addTo(map);

      clientMarkerRef.current = L.circleMarker([activeClientLoc.lat, activeClientLoc.lng], {
        color: "#ffffff",
        fillColor: "#3b82f6",
        fillOpacity: 1,
        weight: 3,
        radius: 12,
      }).addTo(map);

      clientPulseRef.current = L.circleMarker([activeClientLoc.lat, activeClientLoc.lng], {
        color: "transparent",
        fillColor: "#3b82f6",
        fillOpacity: 0.3,
        radius: 24,
        className: "animate-ping",
      }).addTo(map);

      providerMarkerRef.current = L.circleMarker([currentProviderLoc.lat, currentProviderLoc.lng], {
        color: "#ffffff",
        fillColor: "#f97316",
        fillOpacity: 1,
        weight: 3,
        radius: 14,
      }).addTo(map);

      routeLineRef.current = L.polyline(
        [[currentProviderLoc.lat, currentProviderLoc.lng], [activeClientLoc.lat, activeClientLoc.lng]],
        {
          color: "#f97316",
          weight: 4,
          dashArray: "5, 10",
          opacity: 0.9,
          lineCap: "round",
          className: "custom-animate-dash",
        }
      ).addTo(map);

      if (interactive && onLocationSelect) {
        map.on("click", (e: any) => {
          onLocationSelect(
            e.latlng.lat,
            e.latlng.lng,
            `Selected Location (${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)})`
          );
        });
      }
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Pan map to client location
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.flyTo([activeClientLoc.lat, activeClientLoc.lng], 15, {
        animate: true,
        duration: 1.5,
      });
    }
  }, [activeClientLoc.lat, activeClientLoc.lng]);

  // Update markers and route
  useEffect(() => {
    if (
      providerMarkerRef.current &&
      routeLineRef.current &&
      clientMarkerRef.current &&
      clientPulseRef.current
    ) {
      providerMarkerRef.current.setLatLng([currentProviderLoc.lat, currentProviderLoc.lng]);
      clientMarkerRef.current.setLatLng([activeClientLoc.lat, activeClientLoc.lng]);
      clientPulseRef.current.setLatLng([activeClientLoc.lat, activeClientLoc.lng]);

      if (routeCoords && routeCoords.length > 0) {
        routeLineRef.current.setLatLngs(routeCoords);
      } else {
        routeLineRef.current.setLatLngs([
          [currentProviderLoc.lat, currentProviderLoc.lng],
          [activeClientLoc.lat, activeClientLoc.lng],
        ]);
      }
    }
  }, [currentProviderLoc, activeClientLoc, routeCoords]);

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
        setIsLocating(false);
      },
      (error) => {
        console.error("Error locating:", error);
        alert("Unable to retrieve your location.");
        setIsLocating(false);
      }
    );
  };

  if (typeof window === "undefined") {
    return <div className="w-full h-full bg-slate-900 rounded-2xl animate-pulse" />;
  }

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900 z-0 font-sans">
      <div ref={mapContainerRef} className="w-full h-full z-0 absolute inset-0 bg-slate-100" />

      <button
        onClick={handleLocateMe}
        disabled={isLocating}
        className="absolute top-4 right-4 z-[50] w-12 h-12 bg-white/90 backdrop-blur-md border border-slate-200 rounded-full flex items-center justify-center shadow-lg hover:bg-white hover:scale-105 transition-all text-slate-700 disabled:opacity-70 disabled:scale-100"
        title="Find My Location"
      >
        {isLocating ? (
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        ) : (
          <Crosshair className="w-6 h-6 text-blue-600" />
        )}
      </button>

      <style>{`
        @keyframes dash {
          to { stroke-dashoffset: -30; }
        }
        .custom-animate-dash {
          animation: dash 1s linear infinite;
        }
      `}</style>

      {isTrackingDemo && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[50] w-[90%] max-w-sm pointer-events-auto">
          <div className="bg-slate-950/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm" dir="auto">Plumber En Route</h3>
                  <p className="text-blue-400 text-xs font-semibold" dir="auto">
                    ETA: {Math.max(1, Math.ceil((1 - currentRouteProgress) * 10))} Minutes
                  </p>
                </div>
              </div>
              <button className="bg-blue-600 hover:bg-blue-500 transition-colors text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg">
                <Phone className="w-4 h-4" />
              </button>
            </div>

            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-orange-500 to-blue-500 h-full transition-all duration-300"
                style={{ width: `${currentRouteProgress * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {interactive && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[50] bg-slate-950/80 backdrop-blur-xl border border-blue-500/30 rounded-full px-5 py-3 text-sm font-semibold text-white shadow-2xl flex items-center gap-3 transition-transform hover:scale-105 pointer-events-none">
          <MapPin className="w-4 h-4 text-orange-500 animate-bounce" />
          <span dir="auto">Click anywhere to select location</span>
        </div>
      )}
    </div>
  );
}
