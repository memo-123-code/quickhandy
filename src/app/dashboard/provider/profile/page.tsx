"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Award, TrendingUp, Landmark, Star, 
  Shield, CheckCircle2, AlertCircle, Phone, 
  MapPin, Check, Plus, CreditCard, ChevronRight, HelpCircle, X, MessageSquare, Upload
} from "lucide-react";
import WorkerFileUploader from "@/components/ui/WorkerFileUploader";
import AvatarUploader from "@/components/ui/AvatarUploader";
import ProviderWallet from "@/components/wallet/ProviderWallet";
import { api } from "@/lib/api";
import { toast } from "sonner";

type ActiveTab = "OVERVIEW" | "PROFESSIONAL" | "WALLET" | "PREFERENCES";

export default function ProviderProfile() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ActiveTab>("OVERVIEW");
  
  // Profile Data
  const provider = {
    name: "Provider User",
    rating: 4.95,
    reviews: 142,
    completedJobs: 142,
    walletBalance: 450.00,
    lifetimeRevenue: 12800.00,
    acceptanceRate: "97%",
    cancellationRate: "2%",
    photoUrl: "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=120&h=120&fit=crop&crop=faces"
  };

  // Payout Methods State
  const [vodafoneNumber, setVodafoneNumber] = useState("");
  const [instapayAddress, setInstapayAddress] = useState("");
  const [iban, setIban] = useState("");
  
  // Document Verification State
  const [docsStatus, setDocsStatus] = useState({
    nationalId: false,
    criminalRecord: false,
    certificates: false
  });
  const [verificationError, setVerificationError] = useState<string | null>(null);

  const isFullyVerified = docsStatus.nationalId && docsStatus.criminalRecord && docsStatus.certificates;

  // Preferences State
  const [radius, setRadius] = useState(15);
  const [allowEmergency, setAllowEmergency] = useState(false); // Default to false until verified
  const [allowScheduled, setAllowScheduled] = useState(false); // Default to false until verified

  const handleUpdateAvailability = async (type: "EMERGENCY" | "SCHEDULED", value: boolean) => {
    try {
      if (type === "EMERGENCY") setAllowEmergency(value);
      if (type === "SCHEDULED") setAllowScheduled(value);
      // await api.post("/provider/profile", { type, value });
      toast.success("Availability updated");
    } catch (err) {
      toast.error("Failed to update availability");
      // Revert on failure
      if (type === "EMERGENCY") setAllowEmergency(!value);
      if (type === "SCHEDULED") setAllowScheduled(!value);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => router.push("/dashboard/provider")}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-bold transition-all text-slate-300"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Portal</span>
          </button>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Worker Profile</span>
        </div>

        {/* Verification Warning Banner */}
        {!isFullyVerified && (
          <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/20 flex gap-3 items-center animate-pulse">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-bold text-start text-red-400" dir="rtl">
                حسابك غير مفعل. يرجى استكمال البيانات المهنية ورفع الأوراق المطلوبة للبدء في تلقي الطلبات.
              </p>
            </div>
          </div>
        )}

        <div className="p-6 rounded-2xl bg-gradient-to-r from-brand-orange-950/20 to-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center gap-6 shadow-xl">
          <div className="relative">
            <AvatarUploader 
              initialImage={provider.photoUrl} 
              onUploadSuccess={(url) => console.log("Uploaded Provider Avatar:", url)} 
              size="md"
            />
            <span className="absolute bottom-0 end-0 w-5 h-5 z-20 bg-green-500 border-2 border-slate-900 rounded-full flex items-center justify-center pointer-events-none">
              <Check className="w-3.5 h-3.5 text-white" />
            </span>
          </div>
          <div className="text-center sm:text-start space-y-2 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center sm:justify-start">
              <h2 dir="auto" className="text-xl font-extrabold text-white">{provider.name}</h2>
              <span className="px-2 py-0.5 rounded bg-green-500/20 border border-green-500/30 text-green-400 text-[10px] font-bold uppercase self-center tracking-wider">
                Verified Pro
              </span>
            </div>
            <p dir="auto" className="text-xs text-slate-400">Certified Mechatronics & Electrical Specialist</p>
            <div className="flex items-center justify-center sm:justify-start gap-1.5 mt-2">
              <Star className="w-4 h-4 fill-brand-gold-500 text-brand-gold-500" />
              <span className="text-xs font-bold text-slate-200">{provider.rating}</span>
              <span className="text-xs text-slate-500">({provider.reviews} reviews)</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 overflow-x-auto gap-2 md:gap-4 scrollbar-none">
          {[
            { id: "OVERVIEW", label: "Overview & Earnings", labelAr: "الإحصائيات والأرباح" },
            { id: "PROFESSIONAL", label: "Professional Info", labelAr: "البيانات المهنية" },
            { id: "WALLET", label: "Wallet & Payouts", labelAr: "المحفظة والصرف" },
            { id: "PREFERENCES", label: "Availability", labelAr: "العمل والجاهزية" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ActiveTab)}
              className={`pb-3 text-xs font-bold transition-all border-b-2 px-1 whitespace-nowrap flex flex-col items-center gap-0.5 ${
                activeTab === tab.id 
                  ? "border-brand-orange-500 text-brand-orange-400" 
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>{tab.label}</span>
              <span className="text-[9px] font-medium opacity-60">{tab.labelAr}</span>
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="space-y-6">

          {/* TAB 1: OVERVIEW & EARNINGS */}
          {activeTab === "OVERVIEW" && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">Wallet Balance</span>
                  <span className="text-base font-extrabold text-white">{provider.walletBalance.toFixed(2)} EGP</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">Lifetime Earnings</span>
                  <span className="text-base font-extrabold text-brand-orange-400">{provider.lifetimeRevenue.toLocaleString('en-US')} EGP</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">Jobs Completed</span>
                  <span className="text-base font-extrabold text-white">{provider.completedJobs}</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">Acceptance Rate</span>
                  <span className="text-base font-extrabold text-green-400">{provider.acceptanceRate}</span>
                </div>
              </div>

              {/* Weekly Performance Bar Chart */}
              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 dir="auto" className="text-sm font-bold text-white">Weekly Performance</h3>
                  <span className="text-xs text-brand-orange-400 font-bold">Total: 2,150 EGP</span>
                </div>
                <div className="h-24 flex items-end justify-between pt-6 gap-3.5">
                  {[
                    { day: "Mon", amt: 350, pct: "45%" },
                    { day: "Tue", amt: 580, pct: "65%" },
                    { day: "Wed", amt: 300, pct: "35%" },
                    { day: "Thu", amt: 710, pct: "80%" },
                    { day: "Fri", amt: 850, pct: "90%" },
                    { day: "Sat", amt: 450, pct: "50%" },
                    { day: "Sun", amt: 0, pct: "0%" },
                  ].map((item, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group cursor-pointer animate-fadeIn">
                      <div className="text-[8px] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 px-1 rounded absolute -translate-y-8">
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

              {/* Recent Activity Ledger */}
              <div className="space-y-3">
                <h3 dir="auto" className="text-sm font-bold text-white">Recent Activity Ledger</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto pe-1">
                  {([].map((job: any) => (
                    <div key={job.id} className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-850 flex justify-between items-center hover:bg-slate-900 transition-all">
                      <div>
                        <span className="text-xs font-bold text-slate-200 block">{job.task}</span>
                        <span className="text-[9px] text-slate-500 block mt-0.5">{job.date} • Client: {job.client}</span>
                      </div>
                      <span className="text-xs font-bold text-green-400">+{job.earning} EGP</span>
                    </div>
                  )))}
                  <p className="text-xs text-slate-500 text-center py-4">No recent completed jobs.</p>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: PROFESSIONAL INFO */}
          {activeTab === "PROFESSIONAL" && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Skills Inventory */}
              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
                <h3 dir="auto" className="text-sm font-bold text-white">Skills & Specializations</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block mb-2">Primary Specialization</span>
                    <span className="px-3 py-1 rounded-lg bg-brand-orange-500/10 border border-brand-orange-500/30 text-brand-orange-400 text-xs font-bold">
                      Certified Electrical & Mechatronics Specialist
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block mb-2">Sub-Skills & Tags</span>
                    <div className="flex flex-wrap gap-2">
                      {["Circuit Repair", "Home Wiring", "Appliance Diagnostics", "AC Maintenance", "Smart Home Setup", "Emergency Dispatches"].map((skill, idx) => (
                        <span key={idx} className="px-2 py-1 rounded-md bg-slate-950 border border-slate-850 text-[10px] text-slate-300 font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio & Experience */}
              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <h3 dir="auto" className="text-sm font-bold text-white">Experience & Biography</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs border-b border-slate-850 pb-2">
                    <span className="text-slate-400">Years of Experience:</span>
                    <span className="font-bold text-white">8 Years</span>
                  </div>
                  <div className="text-xs space-y-1">
                    <span className="text-slate-400 block">Biography:</span>
                    <p dir="auto" className="text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-lg border border-slate-850">
                      I specialize in domestic and light industrial electrical work, mechatronics troubleshooting, and emergency home dispatches. Background-checked and certified technician servicing 10th of Ramadan and surrounding neighborhoods.
                    </p>
                  </div>
                </div>
              </div>

              {/* Documents Verification Status */}
              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 dir="auto" className="text-sm font-bold text-white">Verification & Credentials</h3>
                  <span className="text-[10px] text-slate-500">Click a card to simulate upload</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  
                  {/* National ID Card */}
                  <WorkerFileUploader
                    label="National ID"
                    subLabelPending="Upload Pending (أضغط للرفع)"
                    subLabelVerified="Verified"
                    isVerified={docsStatus.nationalId}
                    onUploadSuccess={() => setDocsStatus((prev) => ({ ...prev, nationalId: true }))}
                  />

                  {/* Criminal Record Card */}
                  <WorkerFileUploader
                    label="Criminal Record"
                    subLabelPending="Upload Pending (أضغط للرفع)"
                    subLabelVerified="Verified (الفيش)"
                    isVerified={docsStatus.criminalRecord}
                    onUploadSuccess={() => setDocsStatus((prev) => ({ ...prev, criminalRecord: true }))}
                  />

                  {/* Certificates Card */}
                  <WorkerFileUploader
                    label="Certificates"
                    subLabelPending="Upload Pending (أضغط للرفع)"
                    subLabelVerified="Verified"
                    isVerified={docsStatus.certificates}
                    onUploadSuccess={() => setDocsStatus((prev) => ({ ...prev, certificates: true }))}
                  />

                </div>
              </div>

            </div>
          )}

          {/* TAB 3: WALLET & PAYOUTS */}
          {activeTab === "WALLET" && (
            <div className="animate-fadeIn">
              <ProviderWallet />
            </div>
          )}

          {/* TAB 4: AVAILABILITY & PREFERENCES */}
          {activeTab === "PREFERENCES" && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Service Radius Slider */}
              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 dir="auto" className="text-sm font-bold text-white">Service Travel Radius</h3>
                  <span className="text-xs font-bold text-brand-orange-500">{radius} km</span>
                </div>
                <div className="space-y-2">
                  <input 
                    type="range" 
                    min="5" 
                    max="50" 
                    value={radius} 
                    onChange={(e) => setRadius(parseInt(e.target.value))}
                    className="w-full accent-brand-orange-500 bg-slate-950 h-2 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                    <span>5 km</span>
                    <span>25 km</span>
                    <span>50 km</span>
                  </div>
                </div>
              </div>

              {/* Shift Management */}
              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
                <h3 dir="auto" className="text-sm font-bold text-white">Availability Preferences</h3>
                <div className="divide-y divide-slate-850">
                  
                  <div className="py-3.5 flex justify-between items-center">
                    <div>
                      <span className="text-xs font-bold text-white block">Available for Emergency/Instant Jobs</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">Receive immediate gig dispatches within your radius</span>
                    </div>
                    <button
                      onClick={() => {
                        if (!isFullyVerified) {
                          setVerificationError("عفواً، لا يمكنك تفعيل حسابك واستقبال الطلبات قبل رفع جميع الأوراق الرسمية المطلوبة (البطاقة، الفيش، والشهادات).");
                          setTimeout(() => setVerificationError(null), 5000);
                          return;
                        }
                        handleUpdateAvailability("EMERGENCY", !allowEmergency);
                      }}
                      className={`relative w-11 h-6 rounded-full p-0.5 transition-colors ${
                        allowEmergency ? "bg-brand-orange-500" : "bg-slate-800"
                      } ${!isFullyVerified ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <span className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                        allowEmergency ? "translate-x-5" : "translate-x-0"
                      }`} />
                    </button>
                  </div>

                  <div className="py-3.5 flex justify-between items-center">
                    <div>
                      <span className="text-xs font-bold text-white block">Accept Scheduled Bookings</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">Allow clients to book appointments in advance</span>
                    </div>
                    <button
                      onClick={() => {
                        if (!isFullyVerified) {
                          setVerificationError("عفواً، لا يمكنك تفعيل حسابك واستقبال الطلبات قبل رفع جميع الأوراق الرسمية المطلوبة (البطاقة، الفيش، والشهادات).");
                          setTimeout(() => setVerificationError(null), 5000);
                          return;
                        }
                        handleUpdateAvailability("SCHEDULED", !allowScheduled);
                      }}
                      className={`relative w-11 h-6 rounded-full p-0.5 transition-colors ${
                        allowScheduled ? "bg-brand-orange-500" : "bg-slate-800"
                      } ${!isFullyVerified ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <span className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                        allowScheduled ? "translate-x-5" : "translate-x-0"
                      }`} />
                    </button>
                  </div>

                </div>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* Modal moved to ProviderWallet component */}

      {/* Verification Error Toast */}
      {verificationError && (
        <div className="fixed top-4 end-4 z-[3000] p-4 rounded-xl bg-slate-900 border border-red-500/40 text-xs text-white shadow-2xl flex items-center gap-3 animate-slideDown max-w-sm">
          <Shield className="w-5 h-5 text-red-500 shrink-0" />
          <div className="flex-1 text-start" dir="rtl">
            <span className="font-bold block text-red-450">تنبيه التفعيل</span>
            <span className="text-[11px] text-slate-350 block mt-0.5">{verificationError}</span>
          </div>
          <button 
            onClick={() => setVerificationError(null)}
            className="p-1 hover:bg-slate-850 rounded text-slate-450 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

    </div>
  );
}
