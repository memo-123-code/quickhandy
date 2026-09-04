"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { 
  Droplet, Flashlight, Hammer, Wind, Image as ImageIcon, 
  MapPin, Clock, Calendar, ShieldCheck, Star, Phone, 
  MessageSquare, AlertCircle, X, Search, LogOut, CheckCircle, Navigation, Crosshair,
  Paintbrush, Grid, Tv, Flame, Layers, Radio, Sparkles, User,
  Zap, Snowflake, LayoutGrid, WashingMachine, Anvil, Satellite, Truck, AppWindow, Bug, Cctv, Loader2
} from "lucide-react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguageStore } from "@/store/useLanguageStore";
import { dictionary } from "@/locales/dictionary";
import { api } from "@/lib/api";

const InteractiveMap = dynamic(() => import("@/components/InteractiveMap"), {
  ssr: false,
  loading: () => <SkeletonCard className="w-full h-full min-h-[300px]" />
});

type BookingStep = "SELECT_SERVICE" | "BOOKING_FORM" | "WAITING_FOR_BIDS" | "SEARCHING" | "QUOTE_RECEIVED" | "TRACKING" | "COMPLETED";

export default function ClientDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { language } = useLanguageStore();
  const t = dictionary[language].clientDashboard;

  const [step, setStep] = useState<BookingStep>("SELECT_SERVICE");
  const [selectedService, setSelectedService] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Backend Integration State
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [activeQuote, setActiveQuote] = useState<any>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  // Booking Form State (Defaulting to Cairo/Zagazig coordinates)
  const [address, setAddress] = useState("Detecting your location...");
  const [lat, setLat] = useState(30.3071);
  const [lng, setLng] = useState(31.7428);
  const [isEmergency, setIsEmergency] = useState(true);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [problemDescription, setProblemDescription] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Tracking State
  const [eta, setEta] = useState(6); // minutes
  const [routeProgress, setRouteProgress] = useState(0.3);
  const [liveBookingStatus, setLiveBookingStatus] = useState<string>("EN_ROUTE");
  const [liveProviderCoords, setLiveProviderCoords] = useState<{ lat: number; lng: number } | undefined>(undefined);

  // Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string; time: string }[]>([]);

  // Localization and Autocomplete states
  const [conversionRate, setConversionRate] = useState(1.0);
  const [currencySymbol, setCurrencySymbol] = useState(" EGP");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearchingLoc, setIsSearchingLoc] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(true);
  const [lastSelectedAddress, setLastSelectedAddress] = useState("");

  const handleUseCurrentLocation = () => {
    setIsDetectingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLat(latitude);
          setLng(longitude);
          
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
              {
                headers: {
                  "Accept-Language": "ar,en",
                  "User-Agent": "QuickHandyClientDashboard/2.0"
                }
              }
            );
            const data = await res.json();
            
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
            
            const fallbackName = data.display_name?.split(',').slice(0, 3).join('، ');
            const locationName = smartAddress.length > 0 ? smartAddress.join("، ") : fallbackName;
            
            // Smart Prompt: Encourage user to type the plot number since free APIs don't have it
            const addr = `موقعك الحالي: ${locationName} - قطعة/مبنى رقم: `;
            setAddress(addr);
            setLastSelectedAddress(addr);
          } catch (err) {
            console.error("Reverse geocoding error:", err);
            const fallbackAddr = `Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
            setAddress(fallbackAddr);
            setLastSelectedAddress(fallbackAddr);
          } finally {
            setIsDetectingLocation(false);
          }
        },
        (error) => {
          console.warn("Geolocation failed, using Cairo/Zagazig fallback:", error);
          setIsDetectingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 } // Optimized: Faster timeout, allows 1min cache to prevent repeated hanging
      );
    } else {
      setIsDetectingLocation(false);
    }
  };

  const getLocalizedPriceRange = (service: string) => {
    const egpRates: Record<string, { min: number; max: number }> = {
      "Plumbing": { min: 120, max: 200 },
      "Electrical": { min: 150, max: 250 },
      "Carpentry": { min: 100, max: 180 },
      "HVAC": { min: 200, max: 350 },
      "Painter": { min: 90, max: 160 },
      "Tile Setter": { min: 110, max: 200 },
      "Home Appliance Repair": { min: 130, max: 220 },
      "Blacksmith / Welder": { min: 140, max: 250 },
      "Gypsum Board": { min: 120, max: 210 },
      "Satellite Dish Tech": { min: 80, max: 150 },
      "Cleaning Services": { min: 60, max: 120 },
    };

    const rateInfo = egpRates[service] || { min: 100, max: 200 };
    return `${rateInfo.min} - ${rateInfo.max} EGP / Visit`;
  };
  
  // Dynamic Provider Info from Active Quote — NO fallback mock data
  const getProviderPhoto = (photoUrl?: string) => photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(activeQuote?.provider?.name || 'P')}&background=1e40af&color=fff&size=100`;
  
  const provider = activeQuote?.provider || null;
  const proposedPrice = activeQuote?.price ?? null;

  const services = [
    { id: "Plumbing", name: "Plumbing", icon: Droplet, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    { id: "Electrical", name: "Electrical", icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    { id: "Carpentry", name: "Carpentry", icon: Hammer, color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" },
    { id: "HVAC", name: "HVAC & AC", icon: Snowflake, color: "text-teal-500", bg: "bg-teal-500/10", border: "border-teal-500/20" },
    { id: "Painter", name: "Painter", icon: Paintbrush, color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20" },
    { id: "Tile Setter", name: "Tile Setter", icon: LayoutGrid, color: "text-indigo-500", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
    { id: "Home Appliance Repair", name: "Appliance Repair", icon: WashingMachine, color: "text-violet-500", bg: "bg-violet-500/10", border: "border-violet-500/20" },
    { id: "Blacksmith / Welder", name: "Blacksmith / Welder", icon: Anvil, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" },
    { id: "Gypsum Board", name: "Gypsum Board", icon: Layers, color: "text-sky-500", bg: "bg-sky-500/10", border: "border-sky-500/20" },
    { id: "Satellite Dish Tech", name: "Satellite Tech", icon: Satellite, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    { id: "Cleaning Services", name: "Cleaning Services", icon: Sparkles, color: "text-pink-500", bg: "bg-pink-500/10", border: "border-pink-500/20" },
    { id: "Moving & Packing", name: "Moving & Packing", icon: Truck, color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
    { id: "Aluminum & Glass", name: "Aluminum & Glass", icon: AppWindow, color: "text-cyan-500", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
    { id: "Pest Control", name: "Pest Control", icon: Bug, color: "text-lime-500", bg: "bg-lime-500/10", border: "border-lime-500/20" },
    { id: "Security & CCTV", name: "Security & CCTV", icon: Cctv, color: "text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/20" },
  ];

  // Parse service from URL query parameter
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const serviceParam = params.get("service");
      if (serviceParam) {
        // Find matching service by ID or Name (case-insensitive)
        const matched = services.find(
          s => s.id.toLowerCase() === serviceParam.toLowerCase() || s.name.toLowerCase() === serviceParam.toLowerCase()
        );
        if (matched) {
          setSelectedService(matched.id);
          setStep("BOOKING_FORM");
        }
      }
    }
  }, []);

  // Detect location on Load (with Cairo/Zagazig fallback)
  useEffect(() => {
    const fallbackLocation = async () => {
      const fallbackLat = 30.3071;
      const fallbackLng = 31.7428;
      setLat(fallbackLat);
      setLng(fallbackLng);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${fallbackLat}&lon=${fallbackLng}&zoom=12`,
          {
            headers: {
              "Accept-Language": "en,ar",
              "User-Agent": "QuickHandyClientDashboard/1.0"
            }
          }
        );
        const data = await res.json();
        const neighborhood = data.address?.neighbourhood || data.address?.suburb || data.address?.quarter || data.address?.city_district;
        const city = data.address?.city || data.address?.town || data.address?.village;
        const locationName = neighborhood ? `${neighborhood}, ${city || ''}`.replace(/,\s*$/, '') : (city || "Zagazig");
        const addr = `Current Location (${locationName})`;
        setAddress(addr);
        setLastSelectedAddress(addr);
      } catch (err) {
        setAddress("Zagazig, Al Sharqia");
        setLastSelectedAddress("Zagazig, Al Sharqia");
      } finally {
        setIsDetectingLocation(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLat(latitude);
          setLng(longitude);
          
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`, {
              headers: { "Accept-Language": "ar,en", "User-Agent": "QuickHandyClientDashboard/2.0" }
            });
            const data = await res.json();
            
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
            
            const fallbackName = data.display_name?.split(',').slice(0, 3).join('، ');
            const detailedAddress = smartAddress.length > 0 ? smartAddress.join("، ") : fallbackName;
            
            // Smart Prompt: Encourage user to type the plot number since free APIs don't have it
            const addr = `موقعك الحالي: ${detailedAddress} - قطعة/مبنى رقم: `;
            
            setAddress(addr);
            setLastSelectedAddress(addr);
          } catch (err) {
            console.error("Reverse geocoding error:", err);
            const fallbackAddr = `Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
            setAddress(fallbackAddr);
            setLastSelectedAddress(fallbackAddr);
          } finally {
            setIsDetectingLocation(false);
          }
        },
        (error) => {
          console.warn("Geolocation permission denied or failed, using Cairo/Zagazig fallback:", error);
          fallbackLocation();
        },
        // Optimized for INITIAL MOUNT: Low accuracy for instant load, infinite cache allowed. 
        // We only need a rough area on mount. High accuracy is reserved for manual button clicks.
        { enableHighAccuracy: false, timeout: 3000, maximumAge: Infinity }
      );
    } else {
      fallbackLocation();
    }
  }, []);

  // Autocomplete Location Search (Nominatim - Egypt only)
  useEffect(() => {
    if (
      !address ||
      address.length < 3 ||
      address === lastSelectedAddress ||
      address.startsWith("Current Location") ||
      address.startsWith("Pinned Location") ||
      isDetectingLocation
    ) {
      setSuggestions([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setIsSearchingLoc(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=5&countrycodes=eg&accept-language=ar`, {
          headers: { "User-Agent": "QuickHandyClientDashboard/1.0" }
        });
        const data = await res.json();
        if (data && data.length > 0) {
          const formattedSuggestions = data.map((item: any) => ({
            display_name: item.display_name,
            lat: item.lat.toString(),
            lon: item.lon.toString()
          }));
          setSuggestions(formattedSuggestions);
        }
      } catch (err) {
        console.error("Error fetching geocoding suggestions:", err);
      } finally {
        setIsSearchingLoc(false);
      }
    }, 600);

    return () => clearTimeout(delayDebounce);
  }, [address, lastSelectedAddress, isDetectingLocation]);

  // Handle mock image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLocationSelect = (selectedLat: number, selectedLng: number, selectedAddress: string) => {
    setLat(selectedLat);
    setLng(selectedLng);
    setAddress(selectedAddress);
    setLastSelectedAddress(selectedAddress);
  };

  // Sending real API request
  const handleRequestNow = async () => {
    if (!problemDescription || problemDescription.trim() === "") {
      toast.error("Please describe the issue before posting.");
      return;
    }
    if (status !== "authenticated") {
      toast.error("You must be logged in to request a service.");
      router.push("/login");
      return;
    }

    setIsSubmitting(true);
    // Clear any stale quote state from a previous request
    setQuotes([]);
    setActiveQuote(null);
    setBookingId(null);

    try {
      const res = await api.post("/bookings", {
        serviceType: selectedService,
        locationLat: lat,
        locationLng: lng,
        address,
        problemDescription,
        imageUrl: imagePreview,
        isEmergency,
        scheduleDate: isEmergency ? undefined : scheduleDate,
        scheduleTime: isEmergency ? undefined : scheduleTime,
      });
      
      const newBookingId = res.data?.bookingId || res.data?.id;
      if (!newBookingId) {
        throw new Error("No booking ID returned from server");
      }

      // Only advance the step AFTER a successful API response
      setBookingId(newBookingId);
      setStep("WAITING_FOR_BIDS");
      setElapsedTime(0);
      toast.success("Request posted! Waiting for provider quotes...");
    } catch (error: any) {
      console.error("Booking error:", error);
      const msg = error?.response?.data?.error || "Failed to post request. Please try again.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Polling for real quotes & elapsed timer
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    let timerId: NodeJS.Timeout;

    if (step === "WAITING_FOR_BIDS" && bookingId) {
      // Polling quotes every 4s
      intervalId = setInterval(async () => {
        try {
          const res = await api.get(`/bookings/${bookingId}/quotes`);
          if (res.data && res.data.length > 0) {
            setQuotes(res.data);
            setActiveQuote(res.data[0]);
            setStep("QUOTE_RECEIVED");
            clearInterval(intervalId);
            clearInterval(timerId);
          }
        } catch (error) {
          console.error("Failed to fetch quotes", error);
        }
      }, 4000);

      // Increment elapsed time every 1s
      timerId = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (timerId) clearInterval(timerId);
    };
  }, [step, bookingId]);

  // Real-time synchronization with backend booking status during TRACKING
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (step === "TRACKING" && bookingId) {
      intervalId = setInterval(async () => {
        try {
          const res = await api.get(`/bookings/${bookingId}`);
          if (res.data && res.data.status) {
            const status = res.data.status;
            setLiveBookingStatus(status);

            if (res.data.providerLat && res.data.providerLng) {
              setLiveProviderCoords({
                lat: res.data.providerLat,
                lng: res.data.providerLng
              });
            }

            if (status === "EN_ROUTE") {
              setRouteProgress(0.35);
              setEta(4);
            } else if (status === "ARRIVED") {
              setRouteProgress(0.66);
              setEta(0);
            } else if (status === "IN_PROGRESS") {
              setRouteProgress(0.9);
            } else if (status === "COMPLETED") {
              setRouteProgress(1);
              setStep("COMPLETED");
              toast.success("Job completed by provider!");
              clearInterval(intervalId);
            }
          }
        } catch (error) {
          console.error("Tracking status poll error:", error);
        }
      }, 3000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [step, bookingId]);

  const handleAcceptQuote = async () => {
    if (!activeQuote) return;
    try {
      await api.post(`/quotes/${activeQuote.id}/accept`);
      setStep("TRACKING");
      setRouteProgress(0);
      setEta(6);
      toast.success("Quote accepted! Provider dispatched.");
    } catch (error) {
      console.error("Failed to accept quote", error);
      toast.error("Could not accept quote.");
    }
  };

  const handleDeclineQuote = async () => {
    if (!activeQuote) return;
    try {
      await api.post(`/quotes/${activeQuote.id}/decline`);
      setQuotes((prev) => prev.filter((q) => q.id !== activeQuote.id));
      setActiveQuote(null);
      setStep("WAITING_FOR_BIDS");
      toast.success("Quote declined. Waiting for others.");
    } catch (error) {
      console.error("Failed to decline quote", error);
      toast.error("Could not decline quote.");
    }
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  // Auth guard — redirect unauthenticated users
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Show loading while session is resolving
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-brand-blue-500/30 border-t-brand-blue-500 rounded-full animate-spin" />
          <p dir="auto" className="text-slate-400 text-sm">Loading your portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] overflow-hidden bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      
      {/* SIDEBAR: Booking panel & states */}
      <div className="w-full h-[55vh] md:h-full md:w-[420px] shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shadow-2xl z-20">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-brand-blue-600 rounded-lg">
              <Droplet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 dir="auto" className="text-sm font-bold text-white">QuickHandy</h1>
              <p dir="auto" className="text-[10px] text-brand-blue-400 font-semibold">CLIENT PORTAL</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <LanguageSwitcher />
            <button 
              onClick={() => router.push("/dashboard/client/profile")}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="My Profile & Settings"
            >
              <User className="w-4 h-4" />
            </button>
            <button 
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dynamic Content Body based on steps */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          
          {/* STEP 1: Select Service Category */}
          {step === "SELECT_SERVICE" && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <h2 dir="auto" className="text-xl font-bold text-white">{t.greeting}</h2>
                <p dir="auto" className="text-xs text-slate-400 mt-1">{t.subtitle}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 pb-8">
                {services.map((s) => {
                  const Icon = s.icon;
                  // Look up translation using the English ID as the key, fallback to original name if missing
                  const translatedName = t.services[s.id as keyof typeof t.services] || s.name;
                  
                  return (
                    <button
                      key={s.id}
                      onClick={() => {
                        setSelectedService(s.id);
                        setStep("BOOKING_FORM");
                      }}
                      className={`flex flex-col text-start p-4 rounded-xl border ${s.bg} ${s.border} hover:bg-slate-800 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]`}
                    >
                      <div className={`p-2.5 rounded-lg bg-slate-950/40 w-fit mb-3 ${s.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-sm text-slate-200">{translatedName}</span>
                      <span className="text-[9px] text-slate-500 mt-0.5">{t.viewRates}</span>
                    </button>
                  );
                })}
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-850 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-brand-orange-500 shrink-0 mt-0.5" />
                <div>
                  <h4 dir="auto" className="text-xs font-bold text-slate-200">QuickHandy Safety Guarantee</h4>
                  <p dir="auto" className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                    All service providers are fully background-checked, licensed, and insured. Your satisfaction is guaranteed on every task.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Interactive Booking Form */}
          {step === "BOOKING_FORM" && (
            <div className="space-y-5 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-brand-blue-600/20 text-brand-blue-400 text-[10px] font-bold uppercase">
                    {selectedService}
                  </span>
                  <h2 dir="auto" className="text-lg font-bold text-white">Booking Details</h2>
                </div>
                <button 
                  onClick={() => setStep("SELECT_SERVICE")}
                  className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Change
                </button>
              </div>

              {/* How It Works Info Card */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-brand-blue-950/30 to-slate-900 border border-brand-blue-500/10 flex items-start gap-3 shadow-lg">
                <MessageSquare className="w-5 h-5 text-brand-blue-400 shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <h4 className="text-xs font-bold text-brand-blue-300 mb-1 text-start" dir="rtl">نظام عروض الأسعار</h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed text-start" dir="rtl">
                    عظام عروض الأسعار: نظام عروض الأسعار: سيتم إرسال تفاصيل مشكلتك للفنيين المتاحين؛ هؤلاء سيقومون بتقديم عروض أسعار بناءً على التفاصيل والصور.. كامل الحق في قبول العرض المناسب لك أو رفضه.
                  </p>
                </div>
              </div>

              {/* Location Input (Synced with Map Click & Free Nominatim Autocomplete) */}
              <div className="relative">
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
                  Service Location
                </label>
                <div className="relative">
                  <MapPin className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-orange-500 z-10" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    disabled={isDetectingLocation}
                    className="w-full ps-9 pe-24 py-2 rounded-lg glass-input text-xs disabled:opacity-75 disabled:cursor-not-allowed"
                    placeholder="Search location in Egypt..."
                  />

                  {/* GPS / Use Current Location Button on the right side */}
                  <div className="absolute end-1.5 top-1/2 -translate-y-1/2 flex items-center z-10">
                    <button
                      type="button"
                      onClick={handleUseCurrentLocation}
                      disabled={isDetectingLocation}
                      title="Use Current Location"
                      className="flex items-center gap-1 px-2 py-1 rounded bg-brand-blue-500/10 hover:bg-brand-blue-500/20 border border-brand-blue-500/30 text-[10px] text-brand-blue-300 transition-colors"
                    >
                      {isDetectingLocation ? (
                        <span className="w-3.5 h-3.5 border-2 border-brand-blue-400 border-t-transparent rounded-full animate-spin block" />
                      ) : (
                        <>
                          <Crosshair className="w-3.5 h-3.5 text-brand-orange-400 animate-pulse" />
                          <span className="font-medium">Locate</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Free Nominatim Suggestions Dropdown */}
                {suggestions.length > 0 && (
                  <div className="absolute start-0 end-0 mt-1 z-30 max-h-48 overflow-y-auto rounded-lg bg-slate-900 border border-slate-800 shadow-2xl divide-y divide-slate-800/50 animate-fadeIn">
                    {(suggestions || []).map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setAddress(item.display_name);
                          setLastSelectedAddress(item.display_name);
                          setLat(parseFloat(item.lat));
                          setLng(parseFloat(item.lon));
                          setSuggestions([]);
                        }}
                        className="w-full text-start px-3 py-2 hover:bg-slate-800 text-[11px] text-slate-300 transition-colors truncate"
                        title={item.display_name}
                      >
                        {item.display_name}
                      </button>
                    ))}
                  </div>
                )}
                {isSearchingLoc && (
                  <div className="absolute end-20 top-[28px] z-30">
                    <span className="w-3 h-3 border-2 border-brand-blue-500 border-t-transparent rounded-full animate-spin block" />
                  </div>
                )}

                <span className="text-[9px] text-slate-500 mt-1 block">
                  For search for a place in Egypt, use use GPS, or point manually on the map.
                </span>
              </div>

              {/* Upload Image Section */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold text-slate-400 uppercase">
                    Upload Photo of the Problem
                  </label>
                  <span className="text-[10px] text-slate-500">(Optional)</span>
                </div>
                {imagePreview ? (
                  <div className="relative h-28 rounded-lg overflow-hidden border border-slate-850 group">
                    <img src={imagePreview} alt="Problem preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImagePreview(null)}
                      className="absolute top-2 end-2 p-1 bg-slate-950/80 hover:bg-slate-900 rounded-full text-slate-300"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-slate-800 hover:border-brand-blue-500/50 hover:bg-brand-blue-500/5 rounded-lg cursor-pointer transition-all bg-slate-950/40 group">
                    <div className="flex flex-col items-center gap-1.5">
                      <ImageIcon className="w-5 h-5 text-slate-400 group-hover:text-brand-blue-400 transition-colors" />
                      <span className="text-xs text-slate-300 font-medium group-hover:text-white">Upload a photo</span>
                      <span className="text-[9px] text-slate-500 text-center max-w-[240px] mt-0.5" dir="rtl">
                        (يمكنكم رفع صوره من المشكلة حيث أن عروض الأسعار تكون دقيقة)
                      </span>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                )}
              </div>

              {/* Problem Description */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold text-slate-400 uppercase">
                    Describe the issue <span className="text-brand-orange-500 font-bold">*</span>
                  </label>
                  <span className="text-[10px] text-brand-orange-400 font-medium">Required</span>
                </div>
                <textarea
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                  required
                  className="w-full p-3 rounded-lg glass-input text-xs h-24 resize-none border-slate-800 focus:border-brand-blue-500 focus:ring-1 focus:ring-brand-blue-500/30"
                  placeholder="E.g., Kitchen skin is leaking rapidly from the main pipe. Need immediate repair."
                />
                <span className="text-[9px] text-slate-500 mt-1 block text-end font-medium" dir="rtl">
                  برجاء كتابة مشكلتك لتسهيل وتوضيح المشكلة للفنيي على العروض المناسبة
                </span>
              </div>

              {/* Time Toggle (Now vs Schedule) */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
                  Service Time
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-lg border border-slate-850">
                  <button
                    type="button"
                    onClick={() => setIsEmergency(true)}
                    className={`py-1.5 text-xs rounded font-semibold transition-all ${
                      isEmergency
                        ? "bg-brand-orange-500 text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Request Now (Emergency)
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEmergency(false)}
                    className={`py-1.5 text-xs rounded font-semibold transition-all ${
                      !isEmergency
                        ? "bg-brand-blue-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Schedule Later
                  </button>
                </div>
              </div>

              {/* Scheduled Inputs (if not emergency) */}
              {!isEmergency && (
                <div className="grid grid-cols-2 gap-2 animate-slideDown">
                  <div>
                    <div className="relative">
                      <Calendar className="absolute start-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                      <input
                        type="date"
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                        className="w-full ps-8 pe-2 py-1.5 rounded-md glass-input text-[11px]"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="relative">
                      <Clock className="absolute start-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                      <input
                        type="time"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                        className="w-full ps-8 pe-2 py-1.5 rounded-md glass-input text-[11px]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Action Button */}
              <button
                onClick={handleRequestNow}
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all shadow-lg bg-gradient-to-r from-brand-blue-600 to-brand-blue-500 hover:from-brand-blue-500 hover:to-brand-blue-400 shadow-brand-blue-500/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Posting Request...</>
                ) : (
                  isEmergency ? "Post Request & Receive Custom Quotes" : "Schedule Request & Receive Custom Quotes"
                )}
              </button>
            </div>
          )}

          {/* STEP 3: Waiting for Bids State */}
          {step === "WAITING_FOR_BIDS" && (
            <div className="h-full flex flex-col items-center justify-center py-12 space-y-6 animate-fadeIn">
              <div className="relative flex items-center justify-center">
                {/* Radar effect */}
                <div className="absolute w-32 h-32 rounded-full border border-brand-blue-500/20 animate-ping" style={{ animationDuration: "3s" }} />
                <div className="absolute w-24 h-24 rounded-full bg-brand-blue-500/5 animate-pulse" />
                <div className="relative p-5 bg-slate-900 rounded-full border border-brand-blue-500/30">
                  <Clock className="w-8 h-8 text-brand-blue-400 animate-spin" style={{ animationDuration: "8s" }} />
                </div>
              </div>
              <div className="text-center space-y-2 px-4">
                <h3 dir="auto" className="text-base font-bold text-white">Waiting for Quotes</h3>
                
                {/* Elapsed Timer Display */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-blue-900/30 border border-brand-blue-500/20 rounded-full my-2">
                  <div className="w-2 h-2 rounded-full bg-brand-blue-400 animate-pulse" />
                  <span className="text-sm font-mono font-bold text-brand-blue-300">
                    {Math.floor(elapsedTime / 60).toString().padStart(2, '0')}:{(elapsedTime % 60).toString().padStart(2, '0')}
                  </span>
                </div>

                <p className="text-xs text-brand-blue-300 font-medium" dir="rtl">
                  جاري إرسال تفاصيل مشكلتك للفنيين... يرجى الانتظار لتلقي عروض الأسعار.
                </p>
                <p dir="auto" className="text-[10px] text-slate-500 max-w-[280px] mx-auto">
                  Handymen in your area are reviewing your issue details and photos.
                </p>
              </div>

              <div className="w-full bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-3 max-w-[320px]">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Request Type:</span>
                  <span className="text-slate-200 font-bold">{selectedService}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Location:</span>
                  <span className="text-slate-200 font-bold truncate max-w-[150px]">{address}</span>
                </div>
              </div>

              <button
                onClick={() => setStep("BOOKING_FORM")}
                className="text-xs font-semibold text-red-400 hover:text-red-300 hover:underline"
              >
                Cancel Request
              </button>
            </div>
          )}

          {/* STEP 3.5: Quote Received & Negotiation Panel */}
          {step === "QUOTE_RECEIVED" && (
            <div className="space-y-5 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded bg-brand-blue-600/20 text-brand-blue-400 text-[10px] font-bold uppercase flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-blue-400 animate-ping" />
                  Quote Received
                </span>
                <span className="text-[10px] text-slate-400">Negotiating Live</span>
              </div>

              {/* Provider Info Card */}
              {provider ? (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-850 space-y-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <img
                    src={getProviderPhoto(provider.photoUrl)}
                    alt={provider.name || "Provider"}
                    className="w-12 h-12 rounded-full object-cover border border-brand-orange-500/30"
                  />
                  <div className="flex-1">
                    <h4 dir="auto" className="text-sm font-bold text-white">{provider.name || "Provider"}</h4>
                    <span className="text-xs text-brand-orange-400 font-semibold uppercase tracking-wider block mt-0.5">
                      Certified {selectedService}
                    </span>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-3.5 h-3.5 fill-brand-gold-500 text-brand-gold-500" />
                      <span className="text-xs font-bold text-slate-200">{provider.rating ?? "N/A"}</span>
                      <span className="text-[10px] text-slate-500">({provider.reviews ?? 0} reviews)</span>
                    </div>
                  </div>
                </div>

                {provider.vehicle && (
                <div className="text-xs bg-slate-900 p-2.5 rounded-lg text-slate-300 border border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase tracking-wider mb-0.5">Vehicle</span>
                    <span className="font-medium text-slate-200">{provider.vehicle}</span>
                  </div>
                </div>
                )}

                {/* Proposed Price Highlight Block */}
                {proposedPrice !== null && (
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-brand-orange-950/20 to-slate-900 border border-brand-orange-500/25 flex justify-between items-center">
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Proposed Quote</span>
                    <span className="text-lg font-extrabold text-brand-orange-400">{proposedPrice} EGP</span>
                  </div>
                  <div className="text-end">
                    <span className="text-xs font-bold text-brand-orange-300 block" dir="rtl">السعر المقترح: {proposedPrice} جنيه</span>
                    <span className="text-[8px] text-slate-500">Subject to agreement</span>
                  </div>
                </div>
                )}

                {/* Chat (Live) Button */}
                <button
                  onClick={() => setIsChatOpen(true)}
                  className="w-full py-2.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-xs font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                >
                  <MessageSquare className="w-4 h-4 text-brand-blue-400 animate-bounce" />
                  <span>Chat & Negotiate (Live)</span>
                </button>
              </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-850 text-center text-slate-400 text-sm">
                  Loading provider details...
                </div>
              )}

              {/* Action Buttons */}

              <div className="space-y-2.5">
                <button
                  onClick={handleAcceptQuote}
                  className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all shadow-lg bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 shadow-green-600/20 flex flex-col items-center justify-center"
                >
                  <span>Accept Quote & Dispatch Provider</span>
                  <span className="text-[10px] opacity-80 font-normal mt-0.5">(قبول العرض وتأكيد الطلب)</span>
                </button>

                <button
                  onClick={handleDeclineQuote}
                  className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all shadow-lg bg-slate-950 hover:bg-slate-900 border border-slate-800 flex flex-col items-center justify-center"
                >
                  <span className="text-red-400">Decline & Wait for Others</span>
                  <span className="text-[10px] text-slate-500 font-normal mt-0.5">(رفض العرض)</span>
                </button>
              </div>
            </div>
          )}


          {/* STEP 4: Real-time Tracking Panel */}
          {step === "TRACKING" && (
            <div className="space-y-5 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase flex items-center gap-1.5 ${
                  liveBookingStatus === "ARRIVED" 
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" 
                    : liveBookingStatus === "IN_PROGRESS"
                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                    : "bg-green-500/20 text-green-400 border border-green-500/30"
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                  {liveBookingStatus === "ARRIVED"
                    ? "Provider Has Arrived 📍"
                    : liveBookingStatus === "IN_PROGRESS"
                    ? "Work In Progress 🛠️"
                    : "Provider En Route 🚚"}
                </span>
                <div className="text-xs text-slate-400 font-medium">
                  {liveBookingStatus === "ARRIVED" 
                    ? <span className="font-bold text-amber-400">At Location</span>
                    : liveBookingStatus === "IN_PROGRESS"
                    ? <span className="font-bold text-blue-400">Working</span>
                    : <>ETA: <span className="font-bold text-brand-orange-500">{eta} mins</span></>}
                </div>
              </div>

              {/* Provider Info Card */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-850 space-y-4">
                <div className="flex items-center gap-3">
                  <img
                    src={provider.photoUrl}
                    alt={provider.name}
                    className="w-12 h-12 rounded-full object-cover border border-brand-orange-500/30"
                  />
                  <div className="flex-1">
                    <h4 dir="auto" className="text-sm font-bold text-white">{provider.name}</h4>
                    <span className="text-xs text-brand-orange-400 font-semibold uppercase tracking-wider block mt-0.5">
                      Certified {selectedService}
                    </span>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-3.5 h-3.5 fill-brand-gold-500 text-brand-gold-500" />
                      <span className="text-xs font-bold text-slate-200">{provider.rating}</span>
                      <span className="text-[10px] text-slate-500">({provider.reviews} reviews)</span>
                    </div>
                  </div>
                </div>

                <div className="text-xs bg-slate-900 p-2.5 rounded-lg text-slate-300 border border-slate-800">
                  <span className="text-slate-400 block text-[9px] uppercase tracking-wider mb-0.5">Vehicle / Equipment</span>
                  <span className="font-medium text-slate-200">{provider.vehicle}</span>
                </div>

                {/* Call/Message Action buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={`tel:${provider.phone}`}
                    className="py-2 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-xs font-bold text-center flex items-center justify-center gap-2 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-brand-blue-400" />
                    <span>Call Provider</span>
                  </a>
                  <button
                    onClick={() => setIsChatOpen(true)}
                    className="py-2 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-brand-blue-400" />
                    <span>Chat (Live)</span>
                  </button>
                </div>
              </div>

              {/* Booking Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400 uppercase font-semibold">
                  <span className="text-brand-orange-400 font-bold">Assigned</span>
                  <span className={liveBookingStatus === "ARRIVED" || liveBookingStatus === "IN_PROGRESS" ? "text-amber-400 font-bold" : ""}>Arrived</span>
                  <span className={liveBookingStatus === "IN_PROGRESS" ? "text-blue-400 font-bold" : ""}>Work</span>
                </div>
                <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-850">
                  <div 
                    className="h-full bg-gradient-to-r from-brand-orange-600 via-amber-500 to-green-500 transition-all duration-700 ease-out"
                    style={{ width: `${routeProgress * 100}%` }}
                  />
                </div>
              </div>

              <div className="p-3 bg-brand-orange-950/10 border border-brand-orange-500/20 rounded-lg flex gap-2">
                <AlertCircle className="w-4 h-4 text-brand-orange-500 shrink-0 mt-0.5" />
                <p dir="auto" className="text-[10px] text-slate-400 leading-relaxed">
                  For your safety, please verify that the provider matches the profile photo and vehicle details listed above before granting entry.
                </p>
              </div>

              <button
                onClick={() => setStep("SELECT_SERVICE")}
                className="w-full py-2.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-xs font-bold text-red-400 transition-colors"
              >
                Cancel Service Booking
              </button>
            </div>
          )}

          {/* STEP 5: Completed / Review State */}
          {step === "COMPLETED" && (
            <div className="py-8 text-center space-y-5 animate-fadeIn">
              <div className="inline-flex p-4 bg-green-500/10 rounded-full border border-green-500/20">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <div>
                <h3 dir="auto" className="text-xl font-bold text-white">Job Completed!</h3>
                <p dir="auto" className="text-xs text-slate-400 mt-1">
                  {provider.name} has finished your request. Your agreed quote payment has been released.
                </p>
              </div>

              {/* Rating Card */}
              <div className="bg-slate-950 border border-slate-850 p-5 rounded-xl space-y-4 max-w-[320px] mx-auto text-start">
                <h4 dir="auto" className="text-xs font-bold text-slate-300 text-center">Rate Your Experience</h4>
                <div className="flex justify-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} onClick={() => toast.info(`Rated ${star} stars (Mock)`)} className="hover:scale-110 active:scale-95 transition-transform">
                      <Star className="w-7 h-7 text-brand-gold-500 fill-brand-gold-500 hover:brightness-110" />
                    </button>
                  ))}
                </div>
                <textarea
                  className="w-full p-2.5 rounded-lg glass-input text-xs h-16 resize-none"
                  placeholder="Leave an optional review for Marcus..."
                />
                <button
                  onClick={() => setStep("SELECT_SERVICE")}
                  className="w-full py-2 bg-brand-blue-600 hover:bg-brand-blue-500 text-xs font-bold rounded-lg text-white transition-colors"
                >
                  Submit & Back to Dashboard
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 text-center text-[10px] text-slate-500 bg-slate-950/20">
          Need help? <Link href="/support" className="text-brand-blue-400 hover:underline">Contact Customer Care</Link>
        </div>

      </div>

      {/* MAP AREA: 45vh on mobile, fills remaining screen on desktop */}
      <div className="w-full h-[45vh] md:h-full flex-1 relative z-10">
        <InteractiveMap
          interactive={step === "BOOKING_FORM"}
          onLocationSelect={handleLocationSelect}
          providerLocation={step === "TRACKING" ? (liveProviderCoords || { lat: lat - 0.0028, lng: lng - 0.009 }) : undefined}
          clientLocation={{ lat: lat, lng: lng }}
          showRoute={step === "TRACKING"}
          routeProgress={routeProgress}
        />
      </div>

      {/* Chat Modal Overlay */}
      {isChatOpen && (
        <div className="absolute inset-0 z-[2000] bg-slate-950/60 backdrop-blur-sm flex items-end md:items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col h-[480px] overflow-hidden animate-slideUp">
            {/* Header */}
            <div className="p-4 border-b border-slate-800/80 bg-slate-950/40 flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <img
                    src={provider.photoUrl}
                    alt={provider.name}
                    className="w-9 h-9 rounded-full object-cover border border-brand-orange-500/20"
                  />
                  <span className="absolute bottom-0 end-0 w-2.5 h-2.5 bg-green-500 border-2 border-slate-900 rounded-full" />
                </div>
                <div>
                  <h4 dir="auto" className="text-xs font-bold text-white">{provider.name}</h4>
                  <span className="text-[9px] text-green-400 font-medium">Online & Ready</span>
                </div>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="p-1.5 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Message History */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950/25 flex flex-col">
              {(chatMessages || []).map((msg, idx) => {
                if (msg.sender === "system") {
                  return (
                    <div key={idx} className="flex justify-center my-2">
                      <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] px-3 py-1.5 rounded-lg text-center max-w-[90%]">
                        <span dir="auto">{msg.text}</span>
                      </div>
                    </div>
                  );
                }
                const isMe = msg.sender === "client";
                return (
                  <div
                    key={idx}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-[11px] leading-relaxed shadow-sm ${
                        isMe
                          ? "bg-brand-blue-600 text-white rounded-te-none"
                          : "bg-slate-800 text-slate-200 rounded-ts-none text-end"
                      }`}
                      dir={isMe ? "ltr" : "rtl"}
                    >
                      <p dir="auto">{msg.text}</p>
                      <span className="block text-[8px] text-slate-400 mt-1 text-end">
                        {msg.time}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Message Input Form */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!newMessage.trim() || !bookingId) return;
                
                const textToSend = newMessage;
                setNewMessage(""); 
                
                const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                setChatMessages((prev) => [...prev, { sender: "client", text: textToSend, time }]);

                try {
                  await api.post(`/bookings/${bookingId}/chat`, {
                    senderId: session?.user?.id || 'CLIENT',
                    senderRole: 'CLIENT',
                    text: textToSend
                  });
                } catch (err) {
                  console.error("Failed to send message", err);
                  toast.error("Failed to send message.");
                }
              }}
              className="p-3 bg-slate-900 border-t border-slate-800/80 flex gap-2"
            >
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-blue-500 transition-colors"
              />
              <button
                type="submit"
                className="bg-brand-blue-600 hover:bg-brand-blue-500 text-xs font-bold px-4 py-2 rounded-xl text-white transition-colors"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
