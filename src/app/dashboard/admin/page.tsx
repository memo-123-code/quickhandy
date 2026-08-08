"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  ShieldAlert, Users, TrendingUp, TrendingDown, DollarSign, Clock, FileText, 
  Check, X, AlertTriangle, MessageSquare, BarChart2, 
  ExternalLink, UserCheck, LogOut, Bell, Search, Filter, 
  ChevronDown, Settings, Download, Sliders, Info, Calendar, 
  ChevronLeft, ChevronRight, ArrowUpDown, User, Plus, RefreshCw, 
  FileSpreadsheet, Shield, Eye, HelpCircle, CheckCircle2, XCircle
} from "lucide-react";
import InstallButton from "@/components/InstallButton";
import AdminFinancials from "@/components/wallet/AdminFinancials";
import { apiMock } from "@/services/apiMock";
import { AdminTab, PendingProvider, DisputeTicket, PlatformUser, NotificationItem } from "@/types/admin";
import { initialNotifications, initialProviders, initialDisputes, initialPlatformUsers } from "@/lib/mockData";
import { toast } from "sonner";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>("KPI_ANALYTICS");
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  
  // Header state
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  // Financial Chart Timeframe Filter State
  const [timeframe, setTimeframe] = useState<"WEEKLY" | "MONTHLY" | "YEARLY">("MONTHLY");

  // KYC State
  const [providers, setProviders] = useState<PendingProvider[]>(initialProviders);  const [kycSearch, setKycSearch] = useState("");
  const [kycStatusFilter, setKycStatusFilter] = useState<string>("ALL");
  const [kycPage, setKycPage] = useState(1);
  const itemsPerPage = 5;

  // Disputes State
  const [disputes, setDisputes] = useState<DisputeTicket[]>(initialDisputes);  const [disputeSort, setDisputeSort] = useState<"NEWEST" | "OLDEST" | "PRIORITY">("NEWEST");
  const [disputeFilter, setDisputeFilter] = useState<"ALL" | "OPEN" | "RESOLVED">("ALL");

  // User Management State
  const [usersList, setUsersList] = useState<PlatformUser[]>(initialPlatformUsers);  const [userRoleFilter, setUserRoleFilter] = useState<"ALL" | "CLIENT" | "PROVIDER">("ALL");
  const [userSearch, setUserSearch] = useState("");

  // Platform Settings State
  const [platformConfig, setPlatformConfig] = useState({
    commissionPercentage: 20,
    minimumJobFee: 35,
    emergencySurcharge: 15,
    autoApproveKYC: false,
    categories: ["Plumbing", "Electrical", "Carpentry", "HVAC", "Painting", "Appliance Repair"],
    newCategoryInput: "",
  });

  // Export State
  const [exportingFormat, setExportingFormat] = useState<string | null>(null);

  // Modal State
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Confirm",
    variant: "danger" as "danger" | "warning" | "info",
    onConfirm: () => {},
  });

  const openModal = (config: Partial<typeof modalConfig>) => {
    setModalConfig({ ...modalConfig, ...config, isOpen: true });
  };

  const closeModal = () => setModalConfig(prev => ({ ...prev, isOpen: false }));

  // KYC Actions
  const handleApproveKyc = async (id: string) => {
    setIsProcessing(id);
    try {
      await apiMock.approveKYC(id);
      setProviders(prev => (prev || []).map(p => p.id === id ? { ...p, status: "APPROVED" } : p));
      toast.success(`Provider ${id} approved successfully.`);
    } catch (error) {
      toast.error("Failed to approve provider.");
    } finally {
      setIsProcessing(null);
    }
  };

  const handleRejectKyc = (id: string) => {
    openModal({
      title: "Reject KYC Application",
      message: "Are you sure you want to reject this KYC application? This will permanently deny the provider's access.",
      confirmText: "Reject Application",
      variant: "danger",
      onConfirm: async () => {
        setIsProcessing(id);
        try {
          await apiMock.rejectKYC(id);
          setProviders(prev => (prev || []).map(p => p.id === id ? { ...p, status: "REJECTED" } : p));
          toast.error(`Provider ${id} application rejected.`);
        } catch (error) {
          toast.error("Failed to reject provider.");
        } finally {
          setIsProcessing(null);
        }
      }
    });
  };

  const handleRequestInfoKyc = (id: string) => {
    openModal({
      title: "Request More Information",
      message: "Are you sure you want to request more information? The provider will be notified.",
      confirmText: "Request Info",
      variant: "warning",
      onConfirm: async () => {
        setIsProcessing(id);
        try {
          await apiMock.requestInfoKYC(id);
          setProviders(prev => (prev || []).map(p => p.id === id ? { ...p, status: "INFO_REQUESTED" } : p));
          toast.info(`More information requested for Provider ${id}.`);
        } catch (error) {
          toast.error("Failed to request info.");
        } finally {
          setIsProcessing(null);
        }
      }
    });
  };

  // Dispute Actions
  const handleResolveDispute = (id: string) => {
    openModal({
      title: "Resolve Dispute Ticket",
      message: "Are you sure you want to mark this ticket as resolved?",
      confirmText: "Resolve Ticket",
      variant: "info",
      onConfirm: async () => {
        setIsProcessing(id);
        try {
          await apiMock.resolveDispute(id);
          setDisputes(prev => (prev || []).map(d => d.id === id ? { ...d, status: "RESOLVED" } : d));
          toast.success(`Dispute ${id} resolved successfully.`);
        } catch (error) {
          toast.error("Failed to resolve dispute.");
        } finally {
          setIsProcessing(null);
        }
      }
    });
  };

  const handleLogout = () => {
    router.push("/login");
  };

  // Filtered KYC Providers
  const filteredProviders = useMemo(() => {
    return providers.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(kycSearch.toLowerCase()) || 
                            p.license.toLowerCase().includes(kycSearch.toLowerCase()) ||
                            p.id.toLowerCase().includes(kycSearch.toLowerCase());
      const matchesStatus = kycStatusFilter === "ALL" || p.status === kycStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [providers, kycSearch, kycStatusFilter]);

  // Paginated KYC Providers
  const totalKycPages = Math.ceil(filteredProviders.length / itemsPerPage) || 1;
  const paginatedProviders = useMemo(() => {
    const start = (kycPage - 1) * itemsPerPage;
    return filteredProviders.slice(start, start + itemsPerPage);
  }, [filteredProviders, kycPage]);

  // Filtered and Sorted Disputes
  const filteredDisputes = useMemo(() => {
    let result = disputes.filter(d => disputeFilter === "ALL" || d.status === disputeFilter);

    if (disputeSort === "NEWEST") {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (disputeSort === "OLDEST") {
      result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (disputeSort === "PRIORITY") {
      const priorityMap = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      result.sort((a, b) => priorityMap[b.priority] - priorityMap[a.priority]);
    }
    return result;
  }, [disputes, disputeFilter, disputeSort]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return usersList.filter(u => {
      const matchesRole = userRoleFilter === "ALL" || u.role === userRoleFilter;
      const matchesSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
                            u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
                            u.id.toLowerCase().includes(userSearch.toLowerCase());
      return matchesRole && matchesSearch;
    });
  }, [usersList, userRoleFilter, userSearch]);

  // Financial Chart Data based on selected Timeframe
  const chartData = useMemo(() => {
    if (timeframe === "WEEKLY") {
      return {
        label: "Weekly Platform Revenue",
        total: "$4,710",
        growth: "+8.4% vs last week",
        items: [
          { label: "Mon", amt: 420, pct: "40%" },
          { label: "Tue", amt: 550, pct: "55%" },
          { label: "Wed", amt: 610, pct: "65%" },
          { label: "Thu", amt: 580, pct: "60%" },
          { label: "Fri", amt: 790, pct: "82%" },
          { label: "Sat", amt: 920, pct: "95%" },
          { label: "Sun", amt: 840, pct: "88%" },
        ]
      };
    } else if (timeframe === "YEARLY") {
      return {
        label: "Yearly Platform Revenue Growth",
        total: "$190,400",
        growth: "+32.1% YoY",
        items: [
          { label: "2023", amt: 24500, pct: "35%" },
          { label: "2024", amt: 38200, pct: "55%" },
          { label: "2025", amt: 54900, pct: "75%" },
          { label: "2026 YTD", amt: 72800, pct: "98%" },
        ]
      };
    }
    // Default: MONTHLY
    return {
      label: "Monthly Platform Gross Profit",
      total: "$14,840",
      growth: "+14.2% MoM",
      items: [
        { label: "Jan", amt: 1200, pct: "30%" },
        { label: "Feb", amt: 1800, pct: "45%" },
        { label: "Mar", amt: 2100, pct: "55%" },
        { label: "Apr", amt: 2800, pct: "70%" },
        { label: "May", amt: 3400, pct: "85%" },
        { label: "Jun", amt: 3900, pct: "95%" },
      ]
    };
  }, [timeframe]);

  const handleTriggerExport = (format: string) => {
    setExportingFormat(format);
    setTimeout(() => {
      setExportingFormat(null);
      toast.success(`Report exported successfully as ${format.toUpperCase()}!`);
    }, 1200);
  };

  return (
    <>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-brand-blue-500 selection:text-white">
      
      {/* Top Navbar */}
      <nav className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 py-3 flex items-center justify-between shadow-xl relative z-40 sticky top-0">
        
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-800/80 border border-slate-700/60 rounded-xl text-brand-blue-400 shadow-inner">
            <ShieldAlert className="w-5 h-5 text-brand-blue-400" />
          </div>
          <div>
            <h1 dir="auto" className="text-md font-bold text-white tracking-wide">QuickHandy Admin Panel</h1>
            <p dir="auto" className="text-[9px] text-brand-blue-400 font-bold uppercase tracking-widest">Enterprise Administration Suite</p>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="hidden md:flex items-center relative w-80">
          <Search className="w-4 h-4 text-slate-400 absolute start-3 pointer-events-none" />
          <input 
            type="text"
            placeholder="Global search (Clients, Tickets, KYC)..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="w-full ps-9 pe-8 py-1.5 bg-slate-950/70 border border-slate-800 focus:border-brand-blue-500/80 focus:ring-1 focus:ring-brand-blue-500 rounded-lg text-xs text-slate-200 placeholder-slate-500 outline-none transition-all"
          />
          {globalSearch && (
            <button onClick={() => setGlobalSearch("")} className="absolute end-2 text-slate-500 hover:text-slate-300">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-3">

          {/* Standalone PWA Install Button */}
          <InstallButton />

          {/* Notifications Bell Dropdown */}
          <div className="relative">
            <button 
              onClick={() => { setShowNotifications(!showNotifications); setShowProfileMenu(false); }}
              className="p-2 bg-slate-800 hover:bg-slate-750 border border-slate-700/60 rounded-lg text-slate-300 relative transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {notifications.some(n => n.unread) && (
                <span className="absolute -top-1 -end-1 w-2.5 h-2.5 bg-brand-orange-500 rounded-full ring-2 ring-slate-900 animate-ping" />
              )}
              {notifications.some(n => n.unread) && (
                <span className="absolute -top-1 -end-1 w-2.5 h-2.5 bg-brand-orange-500 rounded-full ring-2 ring-slate-900" />
              )}
            </button>

            {/* Notifications Popover */}
            {showNotifications && (
              <div className="absolute end-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-4 space-y-3 z-50 animate-fadeIn">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <h4 dir="auto" className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-brand-blue-400" /> Notifications
                  </h4>
                  <button 
                    onClick={() => setNotifications(prev => prev.map(n => ({ ...n, unread: false })))}
                    className="text-[10px] text-brand-blue-400 hover:underline"
                  >
                    Mark all read
                  </button>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {(notifications || []).map(n => (
                    <div key={n.id} className={`p-2.5 rounded-lg border text-xs space-y-1 transition-colors ${
                      n.unread ? "bg-slate-850/80 border-slate-750" : "bg-slate-950/40 border-slate-850 text-slate-400"
                    }`}>
                      <div className="flex justify-between items-start">
                        <span className="font-semibold text-slate-200">{n.title}</span>
                        {n.unread && <span className="w-1.5 h-1.5 rounded-full bg-brand-blue-400 mt-1 shrink-0" />}
                      </div>
                      <span className="text-[10px] text-slate-500 block">{n.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button 
              onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }}
              className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-750 border border-slate-700/60 rounded-lg transition-all"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-brand-blue-600 to-brand-blue-400 flex items-center justify-center text-[10px] font-bold text-white uppercase shadow-sm">
                SA
              </div>
              <div className="text-start hidden sm:block">
                <span className="text-xs font-bold text-white block leading-tight">Super Admin</span>
                <span className="text-[9px] text-slate-400 block">admin@quickhandy.com</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute end-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 space-y-1 z-50 animate-fadeIn text-xs">
                <div className="px-3 py-2 border-b border-slate-800">
                  <p dir="auto" className="font-bold text-white">Administrator Session</p>
                  <p dir="auto" className="text-[10px] text-slate-400">Role: Full Control</p>
                </div>
                <button 
                  onClick={() => { setActiveTab("PLATFORM_SETTINGS"); setShowProfileMenu(false); }}
                  className="w-full text-start px-3 py-2 rounded-lg hover:bg-slate-800 flex items-center gap-2 text-slate-300"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400" /> Platform Settings
                </button>
                <button 
                  onClick={() => { setActiveTab("REPORTS_EXPORTS"); setShowProfileMenu(false); }}
                  className="w-full text-start px-3 py-2 rounded-lg hover:bg-slate-800 flex items-center gap-2 text-slate-300"
                >
                  <Download className="w-3.5 h-3.5 text-slate-400" /> Export Reports
                </button>
                <div className="border-t border-slate-800 pt-1">
                  <button 
                    onClick={handleLogout}
                    className="w-full text-start px-3 py-2 rounded-lg hover:bg-red-500/10 text-red-400 flex items-center gap-2 font-semibold"
                  >
                    <LogOut className="w-3.5 h-3.5 text-red-400" /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </nav>

      {/* Main Layout Grid */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* Left Sidebar Navigation */}
        <aside className="w-full md:w-64 bg-slate-900/60 border-b md:border-b-0 md:border-r border-slate-800/80 p-4 space-y-6 shrink-0 flex flex-col justify-between">
          <div className="space-y-4">
            
            <div>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-3 block mb-2">Core Operations</span>
              
              <div className="space-y-1">
                <button
                  onClick={() => setActiveTab("KPI_ANALYTICS")}
                  className={`w-full text-start px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-3 transition-all ${
                    activeTab === "KPI_ANALYTICS" 
                      ? "bg-gradient-to-r from-brand-blue-600 to-brand-blue-500 text-white shadow-lg shadow-brand-blue-600/20" 
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-850/60"
                  }`}
                >
                  <BarChart2 className="w-4 h-4" />
                  <span>KPIs & Financials</span>
                </button>

                <button
                  onClick={() => setActiveTab("KYC_VERIFICATION")}
                  className={`w-full text-start px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                    activeTab === "KYC_VERIFICATION" 
                      ? "bg-gradient-to-r from-brand-blue-600 to-brand-blue-500 text-white shadow-lg shadow-brand-blue-600/20" 
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-850/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <UserCheck className="w-4 h-4" />
                    <span>KYC Verification</span>
                  </div>
                  {providers.filter(p=>p.status==="PENDING").length > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-brand-orange-500 text-[9px] text-white font-bold animate-pulse">
                      {providers.filter(p=>p.status==="PENDING").length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab("DISPUTE_MANAGEMENT")}
                  className={`w-full text-start px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                    activeTab === "DISPUTE_MANAGEMENT" 
                      ? "bg-gradient-to-r from-brand-blue-600 to-brand-blue-500 text-white shadow-lg shadow-brand-blue-600/20" 
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-850/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Dispute Tickets</span>
                  </div>
                  {disputes.filter(d=>d.status==="OPEN").length > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-red-500 text-[9px] text-white font-bold">
                      {disputes.filter(d=>d.status==="OPEN").length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            <div>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-3 block mb-2">Management & Admin</span>
              
              <div className="space-y-1">
                <button
                  onClick={() => setActiveTab("USER_MANAGEMENT")}
                  className={`w-full text-start px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-3 transition-all ${
                    activeTab === "USER_MANAGEMENT" 
                      ? "bg-gradient-to-r from-brand-blue-600 to-brand-blue-500 text-white shadow-lg shadow-brand-blue-600/20" 
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-850/60"
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>User Management</span>
                </button>

                <button
                  onClick={() => setActiveTab("PLATFORM_SETTINGS")}
                  className={`w-full text-start px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-3 transition-all ${
                    activeTab === "PLATFORM_SETTINGS" 
                      ? "bg-gradient-to-r from-brand-blue-600 to-brand-blue-500 text-white shadow-lg shadow-brand-blue-600/20" 
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-850/60"
                  }`}
                >
                  <Sliders className="w-4 h-4" />
                  <span>Settings & Config</span>
                </button>

                <button
                  onClick={() => setActiveTab("REPORTS_EXPORTS")}
                  className={`w-full text-start px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-3 transition-all ${
                    activeTab === "REPORTS_EXPORTS" 
                      ? "bg-gradient-to-r from-brand-blue-600 to-brand-blue-500 text-white shadow-lg shadow-brand-blue-600/20" 
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-850/60"
                  }`}
                >
                  <Download className="w-4 h-4" />
                  <span>Reports & Exports</span>
                </button>
              </div>
            </div>

          </div>

          {/* System Status Footer */}
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-[10px] space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span>Platform Health</span>
              <span className="text-green-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping" /> Operational
              </span>
            </div>
            <p dir="auto" className="text-slate-500 text-[9px]">v2.4.0 Enterprise Edition</p>
          </div>
        </aside>

        {/* Dynamic Main Content Area */}
        <main className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto bg-slate-950">
          
          {/* TAB 1: KPI & FINANCIALS */}
          {activeTab === "KPI_ANALYTICS" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 dir="auto" className="text-xl font-extrabold text-white tracking-tight">System Performance</h2>
                  <p dir="auto" className="text-xs text-slate-400 mt-0.5">Real-time platform metrics, growth indicators, and financial analytics.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Live System Sync</span>
                  <button onClick={() => toast.info('Syncing live data... (Mock)')} className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 active:scale-95 transition-all">
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* KPI Cards with Growth Indicators & Interactive Click-Through */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Active Clients */}
                <div 
                  onClick={() => setActiveTab("USER_MANAGEMENT")}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-brand-blue-500/50 space-y-3 cursor-pointer transition-all duration-200 hover:shadow-xl hover:shadow-brand-blue-500/5 group"
                >
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="text-[10px] uppercase font-bold tracking-wider group-hover:text-white transition-colors">Active Clients</span>
                    <div className="p-2 rounded-lg bg-slate-800/80 group-hover:bg-brand-blue-500/20 group-hover:text-brand-blue-400 transition-colors">
                      <Users className="w-4 h-4 text-brand-blue-400" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-white tracking-tight">2,452</div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-850">
                    <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> +12% vs last week
                    </span>
                    <span className="text-[9px] text-slate-500 group-hover:text-brand-blue-400 transition-colors">View users &rarr;</span>
                  </div>
                </div>

                {/* Verified Providers */}
                <div 
                  onClick={() => setActiveTab("KYC_VERIFICATION")}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-brand-orange-500/50 space-y-3 cursor-pointer transition-all duration-200 hover:shadow-xl hover:shadow-brand-orange-500/5 group"
                >
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="text-[10px] uppercase font-bold tracking-wider group-hover:text-white transition-colors">Verified Providers</span>
                    <div className="p-2 rounded-lg bg-slate-800/80 group-hover:bg-brand-orange-500/20 group-hover:text-brand-orange-400 transition-colors">
                      <UserCheck className="w-4 h-4 text-brand-orange-500" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-white tracking-tight">318</div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-850">
                    <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> +5% vs yesterday
                    </span>
                    <span className="text-[9px] text-brand-orange-400 font-bold underline">
                      {providers.filter(p=>p.status==="PENDING").length} pending KYC &rarr;
                    </span>
                  </div>
                </div>

                {/* Active Bookings */}
                <div 
                  onClick={() => setActiveTab("DISPUTE_MANAGEMENT")}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 space-y-3 cursor-pointer transition-all duration-200 hover:shadow-xl hover:shadow-amber-500/5 group"
                >
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="text-[10px] uppercase font-bold tracking-wider group-hover:text-white transition-colors">Active Bookings</span>
                    <div className="p-2 rounded-lg bg-slate-800/80 group-hover:bg-amber-500/20 group-hover:text-amber-400 transition-colors">
                      <Clock className="w-4 h-4 text-brand-gold-500 animate-pulse" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-brand-gold-500 tracking-tight">18</div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-850">
                    <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> +8% vs yesterday
                    </span>
                    <span className="text-[9px] text-slate-400 group-hover:text-amber-400 transition-colors">6 emergency dispatches</span>
                  </div>
                </div>

                {/* Today's Commission */}
                <div 
                  onClick={() => setActiveTab("PLATFORM_SETTINGS")}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 space-y-3 cursor-pointer transition-all duration-200 hover:shadow-xl hover:shadow-emerald-500/5 group"
                >
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="text-[10px] uppercase font-bold tracking-wider group-hover:text-white transition-colors">Today's Commission</span>
                    <div className="p-2 rounded-lg bg-slate-800/80 group-hover:bg-emerald-500/20 group-hover:text-emerald-400 transition-colors">
                      <DollarSign className="w-4 h-4 text-emerald-400" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-emerald-400 tracking-tight">$340.50</div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-850">
                    <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> +18% vs yesterday
                    </span>
                    <span className="text-[9px] text-slate-400 group-hover:text-emerald-400 transition-colors">Platform fee ({platformConfig.commissionPercentage}%)</span>
                  </div>
                </div>

              </div>

              {/* Financial Analytics Chart with Dropdown Timeframe Filter */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6 shadow-xl relative">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <h3 dir="auto" className="text-sm font-bold text-white">{chartData.label}</h3>
                    <p dir="auto" className="text-[10px] text-slate-400 mt-0.5">Calculated after {platformConfig.commissionPercentage}% platform cut on completed service bookings.</p>
                  </div>
                  
                  {/* Dropdown Range Filter */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 font-medium">Time Range:</span>
                    <div className="relative">
                      <select 
                        value={timeframe} 
                        onChange={(e) => setTimeframe(e.target.value as any)}
                        className="bg-slate-950 border border-slate-800 text-slate-200 text-xs font-bold rounded-lg px-3 py-1.5 pe-8 appearance-none focus:outline-none focus:border-brand-blue-500 cursor-pointer"
                      >
                        <option value="WEEKLY">Weekly Breakdown</option>
                        <option value="MONTHLY">Monthly Overview (2026)</option>
                        <option value="YEARLY">Yearly Trends</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute end-2.5 top-2.5 pointer-events-none" />
                    </div>
                    
                    <span className="text-xs font-bold text-brand-blue-400 bg-brand-blue-500/10 px-3 py-1 rounded-lg border border-brand-blue-500/20">
                      Total: {chartData.total} ({chartData.growth})
                    </span>
                  </div>
                </div>

                {/* CSS Bar Chart */}
                <div className="h-56 flex items-end gap-3 sm:gap-6 pt-8 border-b border-slate-800">
                  {(chartData?.items || []).map((data, idx) => (
                    <div key={idx} className="flex-1 h-full flex flex-col items-center justify-end gap-2 group cursor-pointer relative">
                      {/* Hover Tooltip */}
                      <div className="text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 border border-slate-700 px-2.5 py-1 rounded-md shadow-2xl absolute -top-4 z-20 pointer-events-none">
                        ${data.amt.toLocaleString('en-US')}
                      </div>
                      
                      {/* Bar Fill */}
                      <div 
                        className="w-full bg-gradient-to-t from-brand-blue-900/60 via-brand-blue-600 to-brand-blue-400 group-hover:brightness-125 rounded-t-lg transition-all duration-300 shadow-lg shadow-brand-blue-500/10"
                        style={{ height: data.pct }}
                      />
                      
                      <span className="text-[10px] text-slate-400 font-bold pb-2 group-hover:text-white transition-colors">{data.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Admin Financials Widget */}
              <div className="mt-8">
                <h3 dir="auto" className="text-xl font-extrabold text-white tracking-tight mb-4">Financials & Ledger</h3>
                <AdminFinancials />
              </div>
            </div>
          )}

          {/* TAB 2: KYC DOCUMENT VERIFICATION */}
          {activeTab === "KYC_VERIFICATION" && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 dir="auto" className="text-xl font-extrabold text-white">KYC Provider Approvals</h2>
                <p dir="auto" className="text-xs text-slate-400 mt-0.5">Verify and approve professional licenses, background checks, and identity certificates.</p>
              </div>

              {/* Filters & Search Toolbar */}
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                
                {/* Search Bar */}
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute start-3 top-2.5" />
                  <input 
                    type="text" 
                    placeholder="Search by Name, License #, ID..." 
                    value={kycSearch}
                    onChange={(e) => { setKycSearch(e.target.value); setKycPage(1); }}
                    className="w-full ps-9 pe-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-blue-500 transition-colors"
                  />
                  {kycSearch && (
                    <button onClick={() => setKycSearch("")} className="absolute end-3 top-2.5 text-slate-500 hover:text-slate-300">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Status Filter Dropdown */}
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Filter Status:</span>
                  <div className="relative w-full sm:w-44">
                    <select 
                      value={kycStatusFilter} 
                      onChange={(e) => { setKycStatusFilter(e.target.value); setKycPage(1); }}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs font-bold rounded-lg px-3 py-2 pe-8 appearance-none focus:outline-none focus:border-brand-blue-500 cursor-pointer"
                    >
                      <option value="ALL">All Statuses ({providers.length})</option>
                      <option value="PENDING">Pending Only ({providers.filter(p=>p.status==="PENDING").length})</option>
                      <option value="APPROVED">Approved ({providers.filter(p=>p.status==="APPROVED").length})</option>
                      <option value="REJECTED">Rejected ({providers.filter(p=>p.status==="REJECTED").length})</option>
                      <option value="INFO_REQUESTED">Info Requested ({providers.filter(p=>p.status==="INFO_REQUESTED").length})</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute end-2.5 top-3 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Table Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-start border-collapse">
                    <thead>
                      <tr className="bg-slate-950/80 border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        <th className="px-6 py-4">ID</th>
                        <th className="px-6 py-4">Name</th>
                        <th className="px-6 py-4">Category</th>
                        <th className="px-6 py-4">License Number</th>
                        <th className="px-6 py-4">KYC Documents</th>
                        <th className="px-6 py-4 text-center">Status</th>
                        <th className="px-6 py-4 text-end">Inline Quick Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
                      {paginatedProviders.length === 0 ? (
                        <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-500 text-xs">
                            No provider KYC records found matching criteria.
                          </td>
                        </tr>
                      ) : (
                        (paginatedProviders || []).map((p) => (
                          <tr key={p.id} className="hover:bg-slate-850/40 transition-colors">
                            <td className="px-6 py-4 font-mono font-bold text-slate-400">{p.id}</td>
                            <td className="px-6 py-4 font-bold text-white">{p.name}</td>
                            <td className="px-6 py-4">
                              <span className="px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-[10px] font-semibold text-slate-300">
                                {p.category}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-mono text-slate-400">{p.license}</td>
                            <td className="px-6 py-4">
                              <a 
                                href="#" 
                                onClick={(e) => { e.preventDefault(); toast.info(`Opening document: ${p.documentName}`); }}
                                className="inline-flex items-center gap-1.5 text-brand-blue-400 hover:text-brand-blue-300 hover:underline font-medium"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span>{p.documentName}</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold tracking-wide uppercase ${
                                p.status === "PENDING"
                                  ? "bg-brand-orange-500/10 text-brand-orange-500 border border-brand-orange-500/30"
                                  : p.status === "APPROVED"
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                  : p.status === "INFO_REQUESTED"
                                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                                  : "bg-red-500/10 text-red-400 border border-red-500/30"
                              }`}>
                                {p.status.replace("_", " ")}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-end">
                              <div className="inline-flex items-center gap-1.5 justify-end">
                                <button
                                  onClick={() => handleApproveKyc(p.id)}
                                  disabled={p.status === "APPROVED"}
                                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
                                    p.status === "APPROVED"
                                      ? "bg-emerald-500/20 text-emerald-300 cursor-default opacity-50"
                                      : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
                                  }`}
                                  title="Approve Provider"
                                >
                                  {isProcessing === p.id ? <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Check className="w-3 h-3" />} Approve
                                </button>
                                
                                <button
                                  onClick={() => handleRequestInfoKyc(p.id)}
                                  disabled={p.status === "INFO_REQUESTED"}
                                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
                                    p.status === "INFO_REQUESTED"
                                      ? "bg-amber-500/20 text-amber-300 cursor-default opacity-50"
                                      : "bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-500/40"
                                  }`}
                                  title="Request Info"
                                >
                                  {isProcessing === p.id ? <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <HelpCircle className="w-3 h-3" />} Req Info
                                </button>

                                <button
                                  onClick={() => handleRejectKyc(p.id)}
                                  disabled={p.status === "REJECTED"}
                                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
                                    p.status === "REJECTED"
                                      ? "bg-red-500/20 text-red-300 cursor-default opacity-50"
                                      : "bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/40"
                                  }`}
                                  title="Reject Provider"
                                >
                                  {isProcessing === p.id ? <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <X className="w-3 h-3" />} Reject
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Table Pagination Controls */}
                <div className="bg-slate-950/80 px-6 py-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-slate-400">
                    Showing <strong className="text-white">{filteredProviders.length === 0 ? 0 : (kycPage - 1) * itemsPerPage + 1}</strong> to <strong className="text-white">{Math.min(kycPage * itemsPerPage, filteredProviders.length)}</strong> of <strong className="text-white">{filteredProviders.length}</strong> providers
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setKycPage(p => Math.max(p - 1, 1))}
                      disabled={kycPage === 1}
                      className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs text-slate-400 font-bold px-2">
                      Page {kycPage} of {totalKycPages}
                    </span>
                    <button
                      onClick={() => setKycPage(p => Math.min(p + 1, totalKycPages))}
                      disabled={kycPage >= totalKycPages}
                      className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: DISPUTE MANAGEMENT */}
          {activeTab === "DISPUTE_MANAGEMENT" && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 dir="auto" className="text-xl font-extrabold text-white">Active Dispute Tickets</h2>
                <p dir="auto" className="text-xs text-slate-400 mt-0.5">Resolve billing issues, damage claims, and service disputes between clients and workers.</p>
              </div>

              {/* Toolbar with Sorting & Status Filters */}
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                
                {/* Status Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-semibold">Status:</span>
                  <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
                    {(["ALL", "OPEN", "RESOLVED"] as const).map(st => (
                      <button
                        key={st}
                        onClick={() => setDisputeFilter(st)}
                        className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                          disputeFilter === st 
                            ? "bg-brand-blue-600 text-white shadow-sm" 
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort Controls */}
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                    <ArrowUpDown className="w-3.5 h-3.5" /> Sort By:
                  </span>
                  <select
                    value={disputeSort}
                    onChange={(e) => setDisputeSort(e.target.value as any)}
                    className="bg-slate-950 border border-slate-800 text-slate-200 text-xs font-bold rounded-lg px-3 py-1.5 focus:outline-none focus:border-brand-blue-500 cursor-pointer"
                  >
                    <option value="NEWEST">Date (Newest First)</option>
                    <option value="OLDEST">Date (Oldest First)</option>
                    <option value="PRIORITY">Priority Level (High &rarr; Low)</option>
                  </select>
                </div>

              </div>

              {/* Disputes List */}
              <div className="grid grid-cols-1 gap-4">
                {filteredDisputes.length === 0 ? (
                  <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl text-slate-500 text-xs">
                    No dispute tickets match the current filter.
                  </div>
                ) : (
                  (filteredDisputes || []).map((d) => (
                    <div key={d.id} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 shadow-xl hover:border-slate-750 transition-all">
                      
                      {/* Ticket Header & Badges */}
                      <div className="flex justify-between items-start flex-wrap gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2.5 py-0.5 rounded-full bg-slate-950 border border-slate-800 font-mono text-[10px] font-bold text-slate-400">
                              {d.id}
                            </span>
                            
                            {/* Open / Resolved Status Badge */}
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                              d.status === "OPEN" 
                                ? "bg-red-500/10 text-red-400 border border-red-500/30" 
                                : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            }`}>
                              {d.status}
                            </span>

                            {/* Priority Badge */}
                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                              d.priority === "HIGH" 
                                ? "bg-red-600 text-white animate-pulse" 
                                : d.priority === "MEDIUM" 
                                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" 
                                : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                            }`}>
                              {d.priority} PRIORITY
                            </span>
                          </div>

                          <h3 dir="auto" className="text-base font-extrabold text-white mt-1.5">{d.title}</h3>
                        </div>

                        {/* Timestamp & Relative Time */}
                        <div className="text-end">
                          <span className="text-xs font-bold text-slate-300 block">{d.relativeTime}</span>
                          <span className="text-[10px] text-slate-500 block font-mono">Date: {d.createdAt}</span>
                        </div>
                      </div>

                      {/* Dispute Info Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-950 rounded-xl border border-slate-850 text-xs">
                        <div>
                          <span className="text-slate-500 block text-[9px] uppercase tracking-wider font-bold">Client</span>
                          <span className="font-bold text-slate-200">{d.clientName}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[9px] uppercase tracking-wider font-bold">Service Provider</span>
                          <span className="font-bold text-slate-200">{d.providerName}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[9px] uppercase tracking-wider font-bold">Task Reference</span>
                          <span className="font-mono font-bold text-brand-blue-400">{d.taskId}</span>
                        </div>
                      </div>

                      {/* Description */}
                      <p dir="auto" className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-850 italic">
                        "{d.description}"
                      </p>

                      {/* Resolution Actions */}
                      <div className="flex justify-end items-center gap-2 pt-2">
                        {d.status === "OPEN" ? (
                          <>
                            <button 
                              onClick={() => toast.info(`Investigating ticket ${d.id}...`)}
                              className="px-4 py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl text-xs font-bold text-slate-300 transition-all"
                            >
                              Investigate
                            </button>
                            <button 
                              onClick={() => handleResolveDispute(d.id)}
                              disabled={isProcessing === d.id}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-bold text-white transition-all shadow-md flex items-center gap-1.5"
                            >
                              {isProcessing === d.id ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check className="w-3.5 h-3.5" />} Mark Resolved
                            </button>
                          </>
                        ) : (
                          <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>Ticket Resolved</span>
                          </div>
                        )}
                      </div>

                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: USER MANAGEMENT */}
          {activeTab === "USER_MANAGEMENT" && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 dir="auto" className="text-xl font-extrabold text-white">User Management</h2>
                <p dir="auto" className="text-xs text-slate-400 mt-0.5">Manage clients, service providers, account statuses, and platform permissions.</p>
              </div>

              {/* User Controls Bar */}
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute start-3 top-2.5" />
                  <input 
                    type="text" 
                    placeholder="Search users by name, email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full ps-9 pe-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-blue-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-semibold">Role:</span>
                  <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
                    {(["ALL", "CLIENT", "PROVIDER"] as const).map(r => (
                      <button
                        key={r}
                        onClick={() => setUserRoleFilter(r)}
                        className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                          userRoleFilter === r 
                            ? "bg-brand-blue-600 text-white shadow-sm" 
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Users Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-start border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-950/80 border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400">
                        <th className="px-6 py-4">User ID</th>
                        <th className="px-6 py-4">Name & Email</th>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Jobs / Rating</th>
                        <th className="px-6 py-4">Joined Date</th>
                        <th className="px-6 py-4 text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {(filteredUsers || []).map(u => (
                        <tr key={u.id} className="hover:bg-slate-850/40 transition-colors">
                          <td className="px-6 py-4 font-mono font-bold text-slate-400">{u.id}</td>
                          <td className="px-6 py-4">
                            <span className="font-bold text-white block">{u.name}</span>
                            <span className="text-[10px] text-slate-400">{u.email}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                              u.role === "CLIENT" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              u.status === "ACTIVE" 
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : u.status === "SUSPENDED" 
                                ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            }`}>
                              {u.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-semibold block">{u.completedJobs || 0} jobs</span>
                            {u.rating && <span className="text-[10px] text-brand-gold-500 font-bold">★ {u.rating}</span>}
                          </td>
                          <td className="px-6 py-4 font-mono text-slate-400">{u.joinedDate}</td>
                          <td className="px-6 py-4 text-end">
                            <button 
                              onClick={() => {
                                setUsersList(prev => prev.map(usr => usr.id === u.id ? { ...usr, status: usr.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE" } : usr));
                              }}
                              className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                                u.status === "ACTIVE" 
                                  ? "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30"
                                  : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              }`}
                            >
                              {u.status === "ACTIVE" ? "Suspend" : "Activate"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PLATFORM SETTINGS & CONFIG */}
          {activeTab === "PLATFORM_SETTINGS" && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 dir="auto" className="text-xl font-extrabold text-white">Platform Settings & Configuration</h2>
                <p dir="auto" className="text-xs text-slate-400 mt-0.5">Control commission fees, emergency surcharges, and service categories.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Financial Controls */}
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl">
                  <h3 dir="auto" className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                    <DollarSign className="w-4 h-4 text-emerald-400" /> Platform Fee Rates
                  </h3>
                  
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-slate-400 font-medium mb-1">Platform Cut (%)</label>
                      <input 
                        type="number"
                        value={platformConfig.commissionPercentage}
                        onChange={(e) => setPlatformConfig({ ...platformConfig, commissionPercentage: Number(e.target.value) })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-medium mb-1">Minimum Job Fee ($)</label>
                      <input 
                        type="number"
                        value={platformConfig.minimumJobFee}
                        onChange={(e) => setPlatformConfig({ ...platformConfig, minimumJobFee: Number(e.target.value) })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-medium mb-1">Emergency Dispatch Surcharge ($)</label>
                      <input 
                        type="number"
                        value={platformConfig.emergencySurcharge}
                        onChange={(e) => setPlatformConfig({ ...platformConfig, emergencySurcharge: Number(e.target.value) })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-bold"
                      />
                    </div>
                  </div>

                  <button 
                    onClick={() => toast.success("Platform parameters updated successfully!")}
                    className="w-full py-2.5 bg-brand-blue-600 hover:bg-brand-blue-500 text-white font-bold rounded-xl text-xs shadow-lg transition-all"
                  >
                    Save Financial Configuration
                  </button>
                </div>

                {/* Categories Management */}
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl">
                  <h3 dir="auto" className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                    <Sliders className="w-4 h-4 text-brand-blue-400" /> Active Service Categories
                  </h3>

                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Add new category (e.g. Roofing)"
                      value={platformConfig.newCategoryInput}
                      onChange={(e) => setPlatformConfig({ ...platformConfig, newCategoryInput: e.target.value })}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500"
                    />
                    <button 
                      onClick={() => {
                        if (!platformConfig.newCategoryInput) return;
                        setPlatformConfig({
                          ...platformConfig,
                          categories: [...platformConfig.categories, platformConfig.newCategoryInput],
                          newCategoryInput: "",
                        });
                      }}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-white text-xs font-bold rounded-lg"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {(platformConfig?.categories || []).map((cat, idx) => (
                      <span key={idx} className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 flex items-center gap-2">
                        {cat}
                        <button 
                          onClick={() => setPlatformConfig({ ...platformConfig, categories: platformConfig.categories.filter((_, i) => i !== idx) })}
                          className="text-slate-500 hover:text-red-400"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 6: REPORTS & EXPORTS */}
          {activeTab === "REPORTS_EXPORTS" && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 dir="auto" className="text-xl font-extrabold text-white">Reports & Data Exports</h2>
                <p dir="auto" className="text-xs text-slate-400 mt-0.5">Download analytical spreadsheets, audit logs, and PDF executive summaries.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 shadow-xl">
                  <div className="p-3 bg-brand-blue-500/10 rounded-xl text-brand-blue-400 w-fit">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 dir="auto" className="text-sm font-bold text-white">Financial Statement (CSV/XLSX)</h3>
                    <p dir="auto" className="text-xs text-slate-400 mt-1">Complete breakdown of all completed bookings and platform commissions.</p>
                  </div>
                  <button 
                    onClick={() => handleTriggerExport("excel")}
                    disabled={exportingFormat === "excel"}
                    className="w-full py-2 bg-brand-blue-600 hover:bg-brand-blue-500 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" /> 
                    {exportingFormat === "excel" ? "Generating..." : "Download Excel Report"}
                  </button>
                </div>

                <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 shadow-xl">
                  <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400 w-fit">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 dir="auto" className="text-sm font-bold text-white">KYC Verification Logs (PDF)</h3>
                    <p dir="auto" className="text-xs text-slate-400 mt-1">Audit log of all approved, pending, and rejected provider credentials.</p>
                  </div>
                  <button 
                    onClick={() => handleTriggerExport("pdf")}
                    disabled={exportingFormat === "pdf"}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" /> 
                    {exportingFormat === "pdf" ? "Generating..." : "Download PDF Audit"}
                  </button>
                </div>

                <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 shadow-xl">
                  <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400 w-fit">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 dir="auto" className="text-sm font-bold text-white">Dispute History Export</h3>
                    <p dir="auto" className="text-xs text-slate-400 mt-1">Export dispute resolutions, client refund stats, and provider ratings.</p>
                  </div>
                  <button 
                    onClick={() => handleTriggerExport("dispute_csv")}
                    disabled={exportingFormat === "dispute_csv"}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" /> 
                    {exportingFormat === "dispute_csv" ? "Generating..." : "Export Disputes CSV"}
                  </button>
                </div>

              </div>
            </div>
          )}

        </main>

      </div>

      </div>
      <ConfirmModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        variant={modalConfig.variant}
        onClose={closeModal}
        onConfirm={modalConfig.onConfirm}
      />
    </>
  );
}
