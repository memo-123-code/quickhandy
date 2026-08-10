"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { 
  Wrench, Shield, Check, X, Bell, Award, 
  TrendingUp, MapPin, Play, CheckSquare, 
  LogOut, Phone, MessageSquare, ShieldAlert,
  ArrowRight, Landmark, Camera, User, CreditCard
} from "lucide-react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { SkeletonCard } from "@/components/ui/SkeletonCard";

const Map = dynamic(() => import("@/components/InteractiveMap"), {
  ssr: false,
  loading: () => <SkeletonCard className="w-full h-full min-h-[300px]" />
});

type ProviderState = "IDLE" | "INCOMING_REQUEST" | "WAITING_CLIENT_APPROVAL" | "EN_ROUTE" | "JOB_IN_PROGRESS" | "JOB_COMPLETED";

export default function ProviderDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isOnline, setIsOnline] = useState(false);
  const [dashboardState, setDashboardState] = useState<ProviderState>("IDLE");
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Wallet & Stats State (InDrive Prepaid Wallet model)
  const [prepaidBalance, setPrepaidBalance] = useState(0.00); // Default prepaid wallet balance
  
  const [activeJob, setActiveJob] = useState<any>(null);
  const [jobId, setJobId] = useState<string | null>(null);

  // Real GPS Provider Location State
  const [providerCoords, setProviderCoords] = useState<{ lat: number; lng: number } | undefined>(undefined);

  // Trigger and continuously watch real-time GPS location
  useEffect(() => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setProviderCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => {
          console.warn("Could not fetch provider GPS:", err);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );

      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setProviderCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => console.warn("GPS watch position error:", err),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  useEffect(() => {
    // Fetch actual wallet balance
    api.get("/wallet/balance").then((res) => {
      if (res.data?.balance !== undefined) {
        setPrepaidBalance(res.data.balance);
      }
    }).catch(console.error);
  }, []);

  const [completedJobsCount, setCompletedJobsCount] = useState(3);
  const [commissionNotification, setCommissionNotification] = useState<string | null>(null);
  
  // Top-Up Modal State
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("100");
  const [topUpSuccess, setTopUpSuccess] = useState(false);

  // Bidding State
  const [bidAmount, setBidAmount] = useState("250");
  const [showPhotoPreview, setShowPhotoPreview] = useState(false);
  const [showActivePhoto, setShowActivePhoto] = useState(false);
  const [isImageFullscreen, setIsImageFullscreen] = useState(false);

  // Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string; time: string }[]>([]);


  // Enforcement: Block going online if prepaidBalance <= 0
  useEffect(() => {
    if (prepaidBalance <= 0) {
      setIsOnline(false);
      setDashboardState("IDLE");
    }
  }, [prepaidBalance]);

  // Polling for incoming jobs
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOnline && dashboardState === "IDLE") {
      interval = setInterval(async () => {
        try {
          const res = await api.get("/provider/jobs/incoming");
          if (res.data && res.data.id) {
            setActiveJob(res.data);
            setJobId(res.data.id);
            setDashboardState("INCOMING_REQUEST");
          }
        } catch (error) {
          console.error("Polling error", error);
        }
      }, 5000);
    } else if (!isOnline) {
      setDashboardState("IDLE");
      setActiveJob(null);
      setJobId(null);
    }
    return () => clearInterval(interval);
  }, [isOnline, dashboardState]);

  const handleSendQuote = async () => {
    if (!jobId) return;
    setIsProcessing(true);
    try {
      await api.post("/quotes", {
        bookingId: jobId,
        price: parseFloat(bidAmount) || 250
      });
      
      setDashboardState("WAITING_CLIENT_APPROVAL");
    } catch (err) {
      toast.error("Failed to send quote.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Polling for client quote acceptance
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (dashboardState === "WAITING_CLIENT_APPROVAL" && jobId) {
      interval = setInterval(async () => {
        try {
          const res = await api.get(`/bookings/${jobId}`);
          if (res.data && (res.data.status === "ACCEPTED" || res.data.status === "IN_PROGRESS")) {
            setDashboardState("EN_ROUTE");
            toast.success("Client accepted your quote! Dispatched.");
          }
        } catch (error) {
          console.error("Booking approval check error", error);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [dashboardState, jobId]);

  const handleDeclineJob = () => {
    setDashboardState("IDLE");
    // Wait another 8 seconds to trigger another request
    if (isOnline) {
      setTimeout(() => {
        if (isOnline) setDashboardState("INCOMING_REQUEST");
      }, 8000);
    }
  };

  const handleCompleteJob = async () => {
    setIsProcessing(true);
    try {
      const parsedBid = parseFloat(bidAmount) || 250;
      const commission = parsedBid * 0.10; // 10% commission
      const finalBalance = prepaidBalance - commission;
      
      setPrepaidBalance(finalBalance);
      setCompletedJobsCount((prev) => prev + 1);
      
      // Show Toast Notification for Commission Deduction
      setCommissionNotification(
        `تم تحصيل 10% عمولة المنصة (${commission} جنيه). رصيد محفظتك الحالي: ${finalBalance} جنيه.`
      );
      
      setDashboardState("JOB_COMPLETED");
      
      setTimeout(() => {
        setDashboardState("IDLE");
      }, 3500);
    } catch (err) {
      toast.error("Failed to complete job.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTopUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    const parsedAmount = parseFloat(topUpAmount) || 100;
    try {
      // In a real app we'd call the backend to process payment
      setPrepaidBalance((prev) => prev + parsedAmount);
      setTopUpSuccess(true);
      setTimeout(() => {
        setIsTopUpOpen(false);
        setTopUpSuccess(false);
      }, 2000);
    } catch (err) {
      toast.error("Failed to process top-up.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLogout = () => {
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row relative">
      
      {/* Commission Deduction Alert Toast */}
      {commissionNotification && (
        <div className="fixed top-4 end-4 z-[3000] p-4 rounded-xl bg-slate-900 border border-brand-orange-500/40 text-xs text-white shadow-2xl flex items-center gap-3 animate-slideDown max-w-sm">
          <ShieldAlert className="w-5 h-5 text-brand-orange-500 shrink-0" />
          <div className="flex-1">
            <span className="font-bold block">Commission Deducted</span>
            <span className="text-[11px] text-slate-300 block mt-0.5" dir="rtl">{commissionNotification}</span>
          </div>
          <button 
            onClick={() => setCommissionNotification(null)}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* SIDEBAR: Stats, Wallet & Active Jobs */}
      <div className="w-full md:w-[420px] shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shadow-2xl z-20">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-brand-orange-500 rounded-lg">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 dir="auto" className="text-sm font-bold text-white">QuickHandy</h1>
              <p dir="auto" className="text-[10px] text-brand-orange-400 font-semibold">PROVIDER PORTAL</p>
            </div>
          </div>

          {/* ONLINE/OFFLINE TOGGLE */}
          <button
            onClick={() => {
              if (prepaidBalance <= 0) return;
              setIsOnline(!isOnline);
            }}
            disabled={prepaidBalance <= 0}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-800/50 bg-slate-900/40 hover:bg-slate-850/60 transition-all ${
              prepaidBalance <= 0 ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
            }`}
            title={prepaidBalance <= 0 ? "Top-up required to go online" : "Toggle Online Status"}
          >
            <span className={`text-[10px] font-bold uppercase transition-colors ${
              isOnline ? "text-green-400" : "text-slate-400"
            }`}>
              {isOnline ? "Online" : "Offline"}
            </span>
            <div
              className={`relative w-12 h-6.5 rounded-full p-1 transition-all ${
                isOnline ? "bg-green-500" : "bg-slate-750"
              }`}
            >
              <span className={`block w-4.5 h-4.5 rounded-full bg-white transition-transform ${
                isOnline ? "translate-x-5.5" : "translate-x-0"
              }`} />
            </div>
          </button>
        </div>

        {/* Dashboard Panels */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">

          {/* Wallet Blocker Warning Banner */}
          {prepaidBalance <= 0 && (
            <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/20 flex gap-3 items-start animate-pulse">
              <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-red-400" dir="rtl" style={{ textAlign: "start" }}>حسابك متوقف مؤقتاً</h4>
                <p className="text-[10px] text-slate-400 mt-1 leading-relaxed text-start" dir="rtl">
                  رصيد محفظتك لا يكفي لاستقبال طلبات جديدة. يرجى شحن المحفظة بنجاح.
                </p>
              </div>
            </div>
          )}

          {/* STATE 1: IDLE / OFFLINE (Show Stats and Wallet) */}
          {(dashboardState === "IDLE" || dashboardState === "INCOMING_REQUEST" || dashboardState === "WAITING_CLIENT_APPROVAL") && (
            <div className="space-y-5 animate-fadeIn">
              {/* Online Notification Panel */}
              {!isOnline ? (
                <div className="p-4 rounded-xl bg-brand-blue-950/20 border border-brand-blue-500/20 flex gap-3 items-start">
                  <Shield className="w-5 h-5 text-brand-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 dir="auto" className="text-xs font-bold text-slate-200">You are currently Offline</h4>
                    <p dir="auto" className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                      {prepaidBalance <= 0 
                        ? "Please top-up your prepaid balance to go online and receive jobs." 
                        : "Toggle your status to Online in the top right to start receiving custom quote requests in your area."}
                    </p>
                  </div>
                </div>
              ) : dashboardState === "WAITING_CLIENT_APPROVAL" ? (
                <div className="p-4 rounded-xl bg-brand-orange-950/20 border border-brand-orange-500/20 flex gap-3 items-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-orange-500 animate-ping shrink-0" />
                  <div className="flex-1">
                    <h4 dir="auto" className="text-xs font-bold text-brand-orange-400">Waiting for Client Approval</h4>
                    <p dir="auto" className="text-[9px] text-slate-400 mt-0.5">
                      Your quote of {bidAmount} EGP has been submitted to {activeJob?.clientName || "the client"}. Waiting for response...
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-green-950/10 border border-green-500/20 flex gap-3 items-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 pulse-online shrink-0" />
                  <div>
                    <h4 dir="auto" className="text-xs font-bold text-green-400">Waiting for Incoming Requests</h4>
                    <p dir="auto" className="text-[9px] text-slate-400 mt-0.5">Your GPS location is active. Stay on this screen.</p>
                  </div>
                </div>
              )}

              {/* Wallet Widgets */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-850 space-y-2">
                  <div className="flex justify-between items-center text-slate-500">
                    <span className="text-[9px] uppercase font-bold tracking-wider">Prepaid Wallet Balance</span>
                    <Landmark className="w-3.5 h-3.5 text-brand-orange-500" />
                  </div>
                  <span className={`text-xl font-extrabold block ${prepaidBalance <= 0 ? "text-red-500" : "text-white"}`}>
                    {prepaidBalance.toFixed(2)} EGP
                  </span>
                  <button
                    onClick={() => setIsTopUpOpen(true)}
                    className="w-full py-1 text-[10px] font-bold text-center bg-brand-orange-500/10 hover:bg-brand-orange-500/20 border border-brand-orange-500/30 text-brand-orange-400 rounded transition-all"
                  >
                    Top-Up Wallet (شحن المحفظة)
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-850 space-y-1.5 flex flex-col justify-between">
                  <div className="flex justify-between items-center text-slate-500">
                    <span className="text-[9px] uppercase font-bold tracking-wider">Completed Jobs</span>
                    <Award className="w-3.5 h-3.5 text-brand-gold-500" />
                  </div>
                  <span className="text-xl font-extrabold text-white">{completedJobsCount}</span>
                  <span className="text-[9px] text-slate-400 block font-medium">Rating: 4.95⭐</span>
                </div>
              </div>

              {/* Weekly Earnings Visual Chart (EGP) */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-850 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-200">Weekly Performance</span>
                  <span className="text-[10px] text-brand-orange-400 font-bold">Total: 2,150 EGP</span>
                </div>
                {/* CSS Bar Chart */}
                <div className="h-20 flex items-end justify-between pt-4 gap-2">
                  {[
                    { day: "Mon", amt: 350, pct: "45%" },
                    { day: "Tue", amt: 580, pct: "65%" },
                    { day: "Wed", amt: 300, pct: "35%" },
                    { day: "Thu", amt: 710, pct: "80%" },
                    { day: "Fri", amt: 850, pct: "90%" },
                    { day: "Sat", amt: 450, pct: "50%" },
                  ].map((item, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group cursor-pointer">
                      <div className="text-[8px] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 px-1 rounded absolute -translate-y-6">
                        {item.amt} EGP
                      </div>
                      <div 
                        className="w-full bg-brand-orange-500/20 group-hover:bg-brand-orange-500 rounded-t-sm transition-all"
                        style={{ height: item.pct }}
                      />
                      <span className="text-[9px] text-slate-500 font-bold">{item.day}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Jobs list (EGP) */}
              <div className="space-y-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Recent Activity</span>
                
                <div className="space-y-2">
                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-850 flex justify-between items-center">
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">Leaking Kitchen Sink</span>
                      <span className="text-[9px] text-slate-500 block">Plumbing • Completed 2h ago</span>
                    </div>
                    <span className="text-xs font-bold text-green-400">+250.00 EGP</span>
                  </div>
                  
                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-850 flex justify-between items-center">
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">Living Room Rewiring</span>
                      <span className="text-[9px] text-slate-500 block">Electrical • Completed Yesterday</span>
                    </div>
                    <span className="text-xs font-bold text-green-400">+400.00 EGP</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STATE 2: ACTIVE TASK - EN ROUTE & IN PROGRESS */}
          {(dashboardState === "EN_ROUTE" || dashboardState === "JOB_IN_PROGRESS") && (
            <div className="space-y-5 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded bg-brand-orange-500/20 text-brand-orange-400 text-[10px] font-bold uppercase flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-orange-500 pulse-online" />
                  {dashboardState === "EN_ROUTE" ? "Navigating to Client" : "Job In Progress"}
                </span>
                <span className="text-xs text-slate-400 font-bold">Agreed Quote: {bidAmount} EGP</span>
              </div>

              {/* Client Info Card */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-850 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-850 border border-slate-700 flex items-center justify-center text-brand-blue-400 font-extrabold text-sm">
                    {activeJob?.clientName ? activeJob.clientName.split(" ").map((n: string)=>n[0]).join("") : ""}
                  </div>
                  <div className="flex-1">
                    <h4 dir="auto" className="text-sm font-bold text-white">{activeJob.clientName}</h4>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-[10px] text-slate-400">Rating: {activeJob.clientRating}⭐</span>
                    </div>
                  </div>
                </div>

                {/* Client Address */}
                <div className="text-xs bg-slate-900 p-2.5 rounded-lg text-slate-300 border border-slate-800 flex gap-2 items-start">
                  <MapPin className="w-4 h-4 text-brand-orange-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase tracking-wider">Client Location</span>
                    <span className="font-medium text-slate-200">{activeJob.address}</span>
                  </div>
                </div>

                {/* Problem Description */}
                <div className="text-xs bg-slate-900 p-2.5 rounded-lg text-slate-300 border border-slate-800">
                  <span className="text-slate-400 block text-[9px] uppercase tracking-wider mb-0.5">Description</span>
                  <p dir="auto" className="text-slate-200 leading-relaxed text-[11px]">{activeJob.description}</p>
                </div>

                {/* Attached Photo Section */}
                <div className="text-xs bg-slate-900 p-2.5 rounded-lg text-slate-300 border border-slate-800 space-y-2">
                  <span className="text-slate-400 block text-[9px] uppercase tracking-wider">Attached Photo (صورة المشكلة المرفقة)</span>
                  <button
                    type="button"
                    onClick={() => setShowActivePhoto(!showActivePhoto)}
                    className="w-full py-1.5 rounded bg-slate-850 hover:bg-slate-800 border border-slate-800 text-[10px] font-bold text-slate-300 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5 text-brand-blue-400" />
                    <span>{showActivePhoto ? "Hide Attached Photo" : "View Attached Photo (عرض صورة المشكلة)"}</span>
                  </button>
                  {showActivePhoto && (
                    <div className="h-28 rounded-lg overflow-hidden border border-slate-850 mt-1.5 animate-fadeIn">
                      <img 
                        src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&fit=crop" 
                        alt="Client problem attachment" 
                        onClick={() => setIsImageFullscreen(true)}
                        className="w-full h-full object-cover cursor-zoom-in hover:opacity-90 transition-opacity"
                      />
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={`tel:${activeJob.clientPhone}`}
                    className="py-2 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-xs font-bold text-center flex items-center justify-center gap-2 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-brand-blue-400" />
                    <span>Call Client</span>
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

              {/* Progress Flow Actions */}
              <div className="space-y-2">
                {dashboardState === "EN_ROUTE" ? (
                  <button
                    onClick={() => setDashboardState("JOB_IN_PROGRESS")}
                    className="w-full py-3.5 rounded-xl bg-brand-orange-500 hover:bg-brand-orange-400 text-sm font-bold text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-orange-500/10"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>I Have Arrived / Start Job</span>
                  </button>
                ) : (
                  <button
                    onClick={handleCompleteJob}
                    disabled={isProcessing}
                    className="w-full py-3.5 rounded-xl bg-green-600 hover:bg-green-500 text-sm font-bold text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-500/10"
                  >
                    {isProcessing ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckSquare className="w-4 h-4" />}
                    <span>{isProcessing ? "Processing..." : "Complete Job / Deduct Commission"}</span>
                  </button>
                )}
                
                <button
                  onClick={handleDeclineJob}
                  className="w-full py-2 bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 rounded-lg text-xs font-semibold text-red-400 transition-colors text-center"
                >
                  Cancel / Emergency Decline
                </button>
              </div>
            </div>
          )}

          {/* STATE 3: JOB COMPLETED SPLASH */}
          {dashboardState === "JOB_COMPLETED" && (
            <div className="py-12 text-center space-y-4 animate-fadeIn">
              <div className="inline-flex p-4 bg-green-500/10 rounded-full border border-green-500/20">
                <Check className="w-10 h-10 text-green-500" />
              </div>
              <div>
                <h3 dir="auto" className="text-xl font-bold text-white">Job Completed!</h3>
                <p dir="auto" className="text-xs text-slate-400 mt-1">
                  Collect <span className="text-brand-orange-400 font-bold">{bidAmount} EGP</span> in Cash directly from the client.
                </p>
                <span className="text-[10px] text-slate-500 mt-1.5 block">
                  10% Platform Commission ({parseFloat(bidAmount)*0.1} EGP) has been deducted from your prepaid balance.
                </span>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 text-center flex items-center justify-between bg-slate-950/20">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push("/dashboard/provider/profile")}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-bold transition-all"
            >
              <User className="w-3.5 h-3.5 text-brand-orange-400" /> Profile
            </button>
            <span className="text-slate-700">|</span>
            <button 
              onClick={handleLogout}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
          <span className="text-[10px] text-slate-500">QuickHandy Provider v1.2</span>
        </div>

      </div>

      {/* MAP AREA: 100% width on mobile, fills remaining screen on desktop */}
      <div className="flex-1 h-[calc(100vh-280px)] md:h-screen relative z-10">
        <Map
          providerLocation={providerCoords || activeJob?.providerCoords}
          clientLocation={activeJob?.clientCoords}
          showRoute={dashboardState === "EN_ROUTE" || dashboardState === "JOB_IN_PROGRESS"}
          routeProgress={dashboardState === "JOB_IN_PROGRESS" ? 1 : 0.3}
        />
      </div>


      {/* STATE 4: INCOMING REQUEST ALERT MODAL */}
      {dashboardState === "INCOMING_REQUEST" && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl shadow-brand-orange-500/5 animate-scaleUp">
            
            {/* Header / Alarm */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-brand-orange-500/10 border border-brand-orange-500/20 rounded-lg">
                  <Bell className="w-5 h-5 text-brand-orange-500 animate-bounce" />
                </span>
                <div>
                  <span className="text-[10px] font-bold text-brand-orange-500 uppercase tracking-widest block">NEW CUSTOM QUOTE REQUEST</span>
                  <h3 dir="auto" className="text-md font-bold text-white">{activeJob.category} Job</h3>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-slate-850 border border-slate-800 text-[10px] font-bold text-slate-355">
                {activeJob.distance} away
              </span>
            </div>

            {/* Client Details */}
            <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex justify-between items-center mb-4">
              <div>
                <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Client</span>
                <span className="text-sm font-bold text-white">{activeJob.clientName}</span>
                <span className="text-[9px] text-slate-500 block mt-0.5">{activeJob.address}</span>
              </div>
              <div className="text-end">
                <span className="text-[9px] text-slate-400 block">Rating</span>
                <span className="text-sm font-bold text-white">{activeJob.clientRating} ⭐</span>
              </div>
            </div>

            {/* Problem Description */}
            <div className="space-y-1 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Problem Description</span>
                <button 
                  onClick={() => setShowPhotoPreview(!showPhotoPreview)}
                  className="text-[10px] text-brand-blue-400 font-bold hover:underline"
                >
                  {showPhotoPreview ? "Hide Photo" : "View Photo"}
                </button>
              </div>
              <p dir="auto" className="text-xs text-slate-300 bg-slate-950/40 p-3 rounded-lg border border-slate-850 leading-relaxed">
                "{activeJob.description}"
              </p>
              {showPhotoPreview && (
                <div className="mt-2 h-36 rounded-lg overflow-hidden border border-slate-850">
                  <img 
                    src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&fit=crop" 
                    alt="Problem attachment" 
                    onClick={() => setIsImageFullscreen(true)}
                    className="w-full h-full object-cover cursor-zoom-in hover:opacity-90 transition-opacity"
                  />
                </div>
              )}
            </div>

            {/* Bidding Form */}
            <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-3 mb-6">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Your Price Proposal</label>
                <span className="text-[9px] text-slate-500">EGP Currency</span>
              </div>
              <div className="relative">
                <input 
                  type="number"
                  value={bidAmount}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setBidAmount(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg ps-4 pe-12 py-2 text-sm text-white font-bold focus:outline-none focus:border-brand-orange-500"
                  placeholder="250"
                />
                <span className="absolute end-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">EGP</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleDeclineJob}
                className="py-3 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-bold text-slate-300 transition-all"
              >
                Decline
              </button>
              <button
                onClick={handleSendQuote}
                disabled={isProcessing}
                className="py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 text-xs font-bold text-white shadow-lg shadow-green-600/25 transition-all flex flex-col items-center justify-center"
              >
                {isProcessing ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin my-1" />
                ) : (
                  <>
                    <span>Send Quote to Client</span>
                    <span className="text-[8px] font-normal opacity-80 mt-0.5">(إرسال عرض السعر)</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Top-Up Wallet Modal */}
      {isTopUpOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl animate-scaleUp">
            
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-brand-orange-500" />
                <h3 dir="auto" className="text-sm font-bold text-white">Top-Up Prepaid Wallet</h3>
              </div>
              <button 
                onClick={() => setIsTopUpOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-full hover:bg-slate-850"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {topUpSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="inline-flex p-3 bg-green-500/10 rounded-full border border-green-500/20 text-green-500">
                  <Check className="w-8 h-8" />
                </div>
                <h4 dir="auto" className="text-base font-bold text-white">Top-Up Successful!</h4>
                <p dir="auto" className="text-xs text-slate-400">
                  {topUpAmount} EGP has been added to your prepaid balance.
                </p>
              </div>
            ) : (
              <form onSubmit={handleTopUpSubmit} className="space-y-4">
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Amount to Top-Up (EGP)</label>
                  <input 
                    type="number"
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white font-bold"
                    placeholder="100"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block">Payment Method</label>
                  <div className="p-3.5 rounded-lg border border-brand-orange-500/20 bg-brand-orange-500/5 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200">Vodafone Cash / Fawry</span>
                    <span className="text-[9px] text-brand-orange-400 font-semibold">Immediate Credit</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3 bg-gradient-to-r from-brand-orange-600 to-brand-orange-500 hover:from-brand-orange-500 hover:to-brand-orange-400 font-bold text-sm text-white rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {isProcessing && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  <span>{isProcessing ? "Processing..." : "Confirm Payment & Top-Up"}</span>
                </button>

              </form>
            )}

          </div>
        </div>
      )}

      {/* Chat Modal Overlay */}
      {isChatOpen && (
        <div className="absolute inset-0 z-[2000] bg-slate-950/60 backdrop-blur-sm flex items-end md:items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col h-[480px] overflow-hidden animate-slideUp">
            {/* Header */}
            <div className="p-4 border-b border-slate-800/80 bg-slate-950/40 flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-slate-800 border border-brand-blue-500/20 flex items-center justify-center text-brand-blue-400 font-extrabold text-xs">
                    AM
                  </div>
                  <span className="absolute bottom-0 end-0 w-2.5 h-2.5 bg-green-500 border-2 border-slate-900 rounded-full" />
                </div>
                <div>
                  <h4 dir="auto" className="text-xs font-bold text-white">{activeJob.clientName}</h4>
                  <span className="text-[9px] text-green-400 font-medium">Client • Online</span>
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
                const isMe = msg.sender === "provider";
                return (
                  <div
                    key={idx}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-[11px] leading-relaxed shadow-sm ${
                        isMe
                          ? "bg-brand-orange-600 text-white rounded-te-none"
                          : "bg-slate-800 text-slate-200 rounded-ts-none text-start"
                      }`}
                      dir={isMe ? "ltr" : "rtl"}
                    >
                      <p dir="auto">{msg.text}</p>
                      <span className="block text-[8px] text-slate-400 mt-1 text-start">
                        {msg.time}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Message Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newMessage.trim()) return;
                const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                setChatMessages((prev) => [
                  ...prev,
                  { sender: "provider", text: newMessage, time }
                ]);
                setNewMessage("");

                // Mock auto-reply after 1.5 seconds
                setTimeout(() => {
                  setChatMessages((prev) => [
                    ...prev,
                    {
                      sender: "client",
                      text: "تمام يا هندسة، أنا في انتظارك.",
                      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                    }
                  ]);
                }, 1500);
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
                className="bg-brand-orange-600 hover:bg-brand-orange-500 text-xs font-bold px-4 py-2 rounded-xl text-white transition-colors"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}
      {/* FULLSCREEN LIGHTBOX MODAL */}
      {isImageFullscreen && (
        <div 
          onClick={() => setIsImageFullscreen(false)}
          className="fixed inset-0 z-[4000] bg-black/90 flex items-center justify-center p-4 animate-fadeIn cursor-zoom-out"
        >
          <button
            onClick={() => setIsImageFullscreen(false)}
            className="absolute top-6 end-6 text-white hover:text-gray-300 bg-black/40 p-2 rounded-full cursor-pointer transition-all hover:scale-105"
          >
            <X className="w-5 h-5" />
          </button>
          <img 
            src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1000&fit=crop" 
            alt="High-res problem attachment" 
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl transition-transform duration-300 cursor-default animate-scaleUp"
          />
        </div>
      )}

    </div>
  );
}
