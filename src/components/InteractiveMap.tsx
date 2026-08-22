"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { MapPin } from "lucide-react";
import { SkeletonCard } from "@/components/ui/SkeletonCard";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const libraries: ("places")[] = ["places"];

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
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "",
    libraries,
  });

  const mapRef = useRef<google.maps.Map | null>(null);

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const onUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  // Smooth pan when clientLocation or providerLocation changes
  useEffect(() => {
    if (mapRef.current) {
      if (providerLocation && (!clientLocation || (clientLocation.lat === 30.3015 && clientLocation.lng === 31.7406))) {
        mapRef.current.panTo(providerLocation);
      } else if (clientLocation) {
        mapRef.current.panTo(clientLocation);
      }
    }
  }, [clientLocation, providerLocation]);

  // Interpolate provider location based on progress along the route
  let activeProviderLoc: { lat: number; lng: number } | null = providerLocation || null;
  if (showRoute && providerLocation && clientLocation) {
    const interpolatedLat =
      providerLocation.lat +
      (clientLocation.lat - providerLocation.lat) * routeProgress;
    const interpolatedLng =
      providerLocation.lng +
      (clientLocation.lng - providerLocation.lng) * routeProgress;
    activeProviderLoc = { lat: interpolatedLat, lng: interpolatedLng };
  }

  const processLocationChange = useCallback(
    (lat: number, lng: number) => {
      if (!interactive || !onLocationSelect) return;

      // Fetch real-world address from Google Maps Geocoding API
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
      fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&language=ar`
      )
        .then((res) => res.json())
        .then((data) => {
          const detailedAddress = data.results?.[0]?.formatted_address || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
          const addressName = `Pinned Location (${detailedAddress})`;
          onLocationSelect(lat, lng, addressName);
        })
        .catch((err) => {
          console.error("Reverse geocoding error:", err);
          onLocationSelect(
            lat,
            lng,
            `Pinned Location (${lat.toFixed(6)}, ${lng.toFixed(6)})`
          );
        });
    },
    [interactive, onLocationSelect]
  );

  const handleMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      processLocationChange(e.latLng.lat(), e.latLng.lng());
    },
    [processLocationChange]
  );

  const handleMarkerDragEnd = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      processLocationChange(e.latLng.lat(), e.latLng.lng());
    },
    [processLocationChange]
  );

  if (loadError) {
    return (
      <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center text-slate-400 p-6 text-center border border-slate-800 rounded-2xl">
        <MapPin className="w-8 h-8 text-brand-orange-500 mb-2" />
        <p dir="auto" className="text-sm font-semibold text-white">Map Failed to Load</p>
        <p dir="auto" className="text-xs text-slate-500 mt-1">Please verify your Google Maps API Key or network connection.</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <SkeletonCard className="w-full h-full min-h-[300px]" />
    );
  }

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
      <style dangerouslySetInnerHTML={{ __html: `.gm-style img { max-width: none !important; }` }} />
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={clientLocation}
        zoom={15}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={handleMapClick}
        options={{
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
        }}
      >
        {/* Client Marker */}
        <Marker
          position={clientLocation}
          title="Service Location"
          draggable={interactive}
          onDragEnd={handleMarkerDragEnd}
        />

        {/* Provider Marker */}
        {activeProviderLoc && (
          <Marker
            position={activeProviderLoc}
            title="Provider GPS Location"
          />
        )}
      </GoogleMap>

      {/* Interactive HUD instructions */}
      {interactive && (
        <div className="absolute bottom-4 start-1/2 -translate-x-1/2 z-[1000] bg-brand-blue-950/85 border border-brand-blue-500/30 rounded-full px-4 py-2 text-xs text-brand-blue-200 shadow-lg backdrop-blur-md pointer-events-none text-center flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-brand-orange-500" />
          <span>Click on the map to pin your location</span>
        </div>
      )}
    </div>
  );
}
