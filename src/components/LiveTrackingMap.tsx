"use client";

import React, { useEffect, useState, useRef } from "react";
import { GoogleMap, Marker, DirectionsRenderer, useJsApiLoader } from "@react-google-maps/api";
import { Phone, CheckCircle } from "lucide-react";
import useSWR from "swr";

const containerStyle = {
  width: "100%",
  height: "100%",
};

interface LiveTrackingMapProps {
  bookingId: string;
  clientLocation: { lat: number; lng: number };
  initialHandymanLocation?: { lat: number; lng: number };
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function LiveTrackingMap({ bookingId, clientLocation, initialHandymanLocation }: LiveTrackingMapProps) {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null);
  const [distance, setDistance] = useState<string>("");
  const [eta, setEta] = useState<string>("");
  
  // Real-time polling for Handyman location
  const { data: trackingData } = useSWR(`/api/bookings/${bookingId}/tracking`, fetcher, {
    refreshInterval: 5000,
  });

  const currentHandymanLocation = trackingData?.handymanLat && trackingData?.handymanLng
    ? { lat: trackingData.handymanLat, lng: trackingData.handymanLng }
    : initialHandymanLocation || clientLocation; // fallback if no handyman assigned yet

  // Fetch Directions when locations change
  useEffect(() => {
    if (isLoaded && currentHandymanLocation && clientLocation) {
      const directionsService = new google.maps.DirectionsService();
      directionsService.route(
        {
          origin: currentHandymanLocation,
          destination: clientLocation,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            setDirectionsResponse(result);
            const route = result.routes[0];
            if (route && route.legs[0]) {
              setDistance(route.legs[0].distance?.text || "");
              setEta(route.legs[0].duration?.text || "");
            }
          } else {
            console.error(`Error fetching directions: ${status}`);
          }
        }
      );
    }
  }, [isLoaded, currentHandymanLocation?.lat, currentHandymanLocation?.lng, clientLocation?.lat, clientLocation?.lng]);

  const onLoad = React.useCallback(function callback(map: google.maps.Map) {
    setMap(map);
  }, []);

  const onUnmount = React.useCallback(function callback() {
    setMap(null);
  }, []);

  if (!isLoaded) return <div className="w-full h-full bg-slate-900 animate-pulse rounded-2xl" />;

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden shadow-2xl border border-slate-800 z-0">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={currentHandymanLocation}
        zoom={14}
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
        {!directionsResponse && (
          <>
            <Marker position={clientLocation} icon="http://maps.google.com/mapfiles/ms/icons/blue-dot.png" />
            <Marker position={currentHandymanLocation} icon="http://maps.google.com/mapfiles/ms/icons/orange-dot.png" />
          </>
        )}
        
        {directionsResponse && (
          <DirectionsRenderer
            options={{
              directions: directionsResponse,
              suppressMarkers: false,
              polylineOptions: {
                strokeColor: "#f97316",
                strokeOpacity: 0.8,
                strokeWeight: 5,
              },
            }}
          />
        )}
      </GoogleMap>

      {/* Floating Tracking Card */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[50] w-[90%] max-w-sm pointer-events-auto">
        <div className="bg-slate-950/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 shadow-2xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-orange-500/20 flex items-center justify-center text-brand-orange-500">
                <CheckCircle className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm" dir="auto">Plumber En Route</h3>
                <p className="text-brand-blue-400 text-xs font-semibold" dir="auto">
                  {eta ? `ETA: ${eta}` : "Calculating ETA..."}
                </p>
                <span className="text-[10px] text-slate-400">{distance ? `${distance} away` : ""}</span>
              </div>
            </div>
            <button className="bg-brand-blue-600 hover:bg-brand-blue-500 transition-colors text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg">
              <Phone className="w-4 h-4" />
            </button>
          </div>
          
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-brand-orange-500 to-brand-blue-500 h-full transition-all duration-300" 
              style={{ width: trackingData?.status === 'ARRIVED' ? '100%' : '50%' }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
