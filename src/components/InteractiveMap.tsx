"use client";

import React from "react";
import dynamic from "next/dynamic";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { MapPin } from "lucide-react";

// Dynamically import MapComponent to prevent SSR issues with Leaflet's 'window' object
const MapComponent = dynamic(() => import("./MapComponent"), {
  ssr: false,
  loading: () => <SkeletonCard className="w-full h-full min-h-[300px]" />,
});

interface InteractiveMapProps {
  interactive?: boolean;
  onLocationSelect?: (lat: number, lng: number, address: string) => void;
  providerLocation?: { lat: number; lng: number };
  clientLocation?: { lat: number; lng: number };
  showRoute?: boolean;
  routeProgress?: number;
}

export default function InteractiveMap(props: InteractiveMapProps) {
  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl z-0">
      <MapComponent {...props} />
      
      {/* Interactive HUD instructions */}
      {props.interactive && (
        <div className="absolute bottom-4 start-1/2 -translate-x-1/2 z-[1000] bg-brand-blue-950/85 border border-brand-blue-500/30 rounded-full px-4 py-2 text-xs text-brand-blue-200 shadow-lg backdrop-blur-md pointer-events-none text-center flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-brand-orange-500" />
          <span>Click on the map to pin your location</span>
        </div>
      )}
    </div>
  );
}
