"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Wrench, Shield, Zap, Clock, Star, Users, ArrowRight, 
  CheckCircle2, Droplet, Flashlight, Hammer, Wind, 
  Paintbrush, Grid, Tv, Flame, Layers, Radio, Sparkles,
  Phone, MessageSquare, Navigation
} from "lucide-react";
import { toast } from "sonner";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguageStore } from "@/store/useLanguageStore";
import { dictionary } from "@/locales/dictionary";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import { useSession, signOut } from "next-auth/react";
import MobilePwaBanner from "@/components/MobilePwaBanner";

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const { language } = useLanguageStore();
  const { data: session, status } = useSession();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const t = dictionary[language].landingPage;
  const tServices = dictionary[language].clientDashboard.services;

  const categories = [
    { name: "Plumbing", desc: "Leaking pipes, faucet repairs, drain cleaning", icon: Droplet, color: "text-blue-400" },
    { name: "Electrical", desc: "Short circuits, wiring, light fixture installs", icon: Flashlight, color: "text-amber-400" },
    { name: "Carpentry", desc: "Furniture assembly, cabinet repairs, door hanging", icon: Hammer, color: "text-orange-400" },
    { name: "HVAC & AC", desc: "AC servicing, filter replacements, heating repairs", icon: Wind, color: "text-teal-400" },
    { name: "Painter", desc: "Painting walls, wallpaper installation, decorative finishes", icon: Paintbrush, color: "text-rose-400" },
    { name: "Tile Setter", desc: "Ceramic, porcelain, marble tile installation", icon: Grid, color: "text-indigo-400" },
    { name: "Home Appliance Repair", desc: "Washing machines, refrigerators, microwave repair", icon: Tv, color: "text-violet-400" },
    { name: "Blacksmith / Welder", desc: "Metal doors, window bars, gates, welding repairs", icon: Flame, color: "text-red-400" },
    { name: "Gypsum Board", desc: "Ceiling design, drywalls, decorative plaster installations", icon: Layers, color: "text-sky-400" },
    { name: "Satellite Dish Tech", desc: "Receiver setup, dish alignment, signal tuning", icon: Radio, color: "text-emerald-400" },
    { name: "Cleaning Services", desc: "Deep home cleaning, post-construction cleaning", icon: Sparkles, color: "text-pink-400" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden flex flex-col justify-between">
      
      {/* Background blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-brand-blue-950/20 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-brand-orange-950/10 blur-[140px] pointer-events-none" />

      {/* Sticky Top Group */}
      <div className="sticky top-0 z-50 flex flex-col w-full">
        <MobilePwaBanner />
        <header className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-3 sm:py-5 flex items-center justify-between bg-slate-950/80 backdrop-blur-md rounded-b-2xl border-b border-slate-800/50 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="p-2 sm:p-2.5 bg-gradient-to-tr from-brand-blue-600 to-brand-orange-500 rounded-lg sm:rounded-xl shadow-lg">
              <Wrench className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
              Quick<span className="text-brand-orange-500">Handy</span>
            </span>
          </div>
        
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          {status === "loading" ? (
            <div className="w-24 h-8 bg-slate-800 animate-pulse rounded-lg"></div>
          ) : session ? (
            <>
              <Link href={`/dashboard/${(session.user as any)?.role?.toLowerCase() || 'client'}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 rounded-full bg-brand-blue-500 flex items-center justify-center text-xs font-bold text-white uppercase">
                  {session.user?.name?.charAt(0) || "U"}
                </div>
                <span className="text-xs font-bold text-white hidden sm:inline-block">
                  {session.user?.name?.split(' ')[0]}
                </span>
              </Link>
              <button 
                onClick={() => signOut()}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-lg text-slate-300 transition-all border border-slate-700"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link 
                href="/login" 
                className="text-xs font-bold text-slate-300 hover:text-white transition-colors"
              >
                {t.nav.signIn}
              </Link>
              <Link 
                href="/signup" 
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-brand-blue-600 hover:bg-brand-blue-500 text-xs font-bold rounded-lg text-white shadow-md shadow-brand-blue-600/15 transition-all"
              >
                {t.nav.register}
              </Link>
            </>
          )}
        </div>
      </header>
      </div>

      {/* Hero Section */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 md:py-16 z-10 flex-1 flex flex-col justify-center space-y-10 sm:space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-6 text-start">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-orange-500/10 border border-brand-orange-500/25 rounded-full text-xs font-bold text-brand-orange-400">
              <Zap className="w-3.5 h-3.5 fill-brand-orange-400" />
              <span>{t.hero.badge}</span>
            </div>

            <h1 dir="auto" className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.2] sm:leading-[1.1]">
              {t.hero.title1} <br />
              <span className="bg-gradient-to-r from-brand-blue-400 via-brand-orange-400 to-brand-gold-500 bg-clip-text text-transparent">
                {t.hero.title2}
              </span>
            </h1>

            <p dir="auto" className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-xl">
              {t.hero.subtitle}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 w-full">
              <Link 
                href="/login"
                className="w-full sm:w-auto px-5 py-3 sm:px-6 sm:py-3.5 bg-gradient-to-r from-brand-blue-600 to-brand-blue-500 hover:from-brand-blue-500 hover:to-brand-blue-400 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg shadow-brand-blue-500/20 hover:scale-[1.02] transition-all"
              >
                <span dir="auto">{t.hero.bookNow}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </Link>
              
              <Link 
                href="/signup"
                className="w-full sm:w-auto px-5 py-3 sm:px-6 sm:py-3.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl font-bold text-sm text-slate-200 flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
              >
                <span>{t.hero.becomeProvider}</span>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-3 gap-2 sm:gap-6 pt-6 sm:pt-8 border-t border-slate-900 max-w-lg">
              <div className="space-y-1">
                <div className="text-lg sm:text-2xl font-extrabold text-white">
                  <AnimatedCounter targetValue={t.stats.arrival.value as number} decimals={t.stats.arrival.decimals} suffix={t.stats.arrival.suffix} />
                </div>
                <div className="text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-wider font-semibold mt-0.5 sm:mt-1 leading-tight sm:leading-normal">{t.stats.arrival.label}</div>
              </div>
              <div className="space-y-1">
                <div className="text-lg sm:text-2xl font-extrabold text-white">
                  <AnimatedCounter targetValue={t.stats.jobs.value as number} decimals={t.stats.jobs.decimals} suffix={t.stats.jobs.suffix} />
                </div>
                <div className="text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-wider font-semibold mt-0.5 sm:mt-1 leading-tight sm:leading-normal">{t.stats.jobs.label}</div>
              </div>
              <div className="space-y-1">
                <div className="text-lg sm:text-2xl font-extrabold text-white">
                  <AnimatedCounter targetValue={t.stats.rating.value as number} decimals={t.stats.rating.decimals} suffix={t.stats.rating.suffix} />
                </div>
                <div className="text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-wider font-semibold mt-0.5 sm:mt-1 leading-tight sm:leading-normal">{t.stats.rating.label}</div>
              </div>
            </div>
          </div>

          {/* Hero Right - High Fidelity Tracking Mockup */}
          <div className="lg:col-span-5 space-y-4 lg:ms-auto w-full max-w-md mx-auto lg:mx-0">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block text-start">{t.tracking.title}</span>
            
            {/* Mock Dashboard Tracking Card */}
            <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-2xl relative overflow-hidden space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-orange-500 pulse-online" />
                  <span className="text-[10px] font-bold text-brand-orange-400 uppercase tracking-wider">{t.tracking.arrivingSoon}</span>
                </div>
                <span className="text-xs font-extrabold text-white bg-slate-950/80 px-2 py-0.5 rounded border border-slate-850" dir="ltr">
                  {t.tracking.eta}
                </span>
              </div>

              {/* Simple Vector Route Graphic */}
              <div className="h-28 bg-slate-950 rounded-xl relative overflow-hidden border border-slate-900 flex items-center justify-center">
                <div className="absolute inset-0 opacity-10" style={{
                  backgroundImage: "radial-gradient(circle, #38acf7 1px, transparent 1px)",
                  backgroundSize: "16px 16px"
                }} />
                
                {/* Simulated Path */}
                <svg className="absolute inset-0 w-full h-full">
                  <path d="M 50,70 Q 150,20 200,80 T 320,30" fill="none" stroke="#f97316" strokeWidth="3" strokeLinecap="round" strokeDasharray="6 4" />
                </svg>

                {/* Client Pin */}
                <div className={`absolute top-[30px] end-[50px] flex flex-col items-center`}>
                  <div className="bg-brand-blue-600 p-1 rounded-full border border-white">
                    <Navigation className="w-3 h-3 text-white rotate-45" />
                  </div>
                  <span className="text-[8px] bg-slate-900 px-1 rounded mt-0.5">{t.tracking.you}</span>
                </div>

                {/* Provider Pin */}
                <div className={`absolute top-[65px] start-[185px] flex flex-col items-center`}>
                  <span className="absolute w-6 h-6 rounded-full bg-brand-orange-500/30 pulse-online" />
                  <div className="bg-brand-orange-500 p-1.5 rounded-full border border-brand-orange-400 z-10">
                    <Wrench className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span className="text-[8px] bg-slate-900 px-1 rounded mt-0.5 text-brand-orange-400 font-bold">{t.tracking.provider}</span>
                </div>
              </div>

              {/* Provider Info */}
              <div className="flex items-center gap-3 bg-slate-950/40 p-3 rounded-xl border border-slate-900">
                <div className="w-9 h-9 rounded-full bg-brand-orange-500/10 border border-brand-orange-500/20 flex items-center justify-center text-brand-orange-400 font-bold text-sm">
                  AS
                </div>
                <div className="flex-1">
                  <h4 dir="auto" className="text-xs font-bold text-slate-200">{t.tracking.providerName}</h4>
                  <p className="text-[9px] text-slate-500" dir="ltr">{t.tracking.providerDesc}</p>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => toast.info('Calling technician... (Mock)')} className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                    <Phone className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => toast.info('Opening chat... (Mock)')} className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                    <MessageSquare className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Feature Banner */}
            <div className="p-4 rounded-2xl bg-brand-blue-950/20 border border-brand-blue-500/25 flex items-start gap-3.5">
              <Shield className="w-5 h-5 text-brand-blue-400 shrink-0 mt-0.5" />
              <div>
                <h4 dir="auto" className="text-xs font-bold text-white">{t.trust.title}</h4>
                <p dir="auto" className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                  {t.trust.desc}
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Dedicated Expanded Category Section */}
        <div className="space-y-5 sm:space-y-6 pt-8 sm:pt-10 border-t border-slate-900">
          <div className="text-center md:text-start space-y-2">
            <span className="text-[10px] font-bold text-brand-orange-500 uppercase tracking-widest block">{t.categories.badge}</span>
            <h2 dir="auto" className="text-2xl sm:text-3xl font-extrabold text-white">{t.categories.title}</h2>
            <p dir="auto" className="text-xs text-slate-400 max-w-lg mx-auto md:mx-0">
              {t.categories.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {(categories || []).map((cat, idx) => {
              const Icon = cat.icon;
              const catName = tServices[cat.name as keyof typeof tServices] || cat.name;
              const catDesc = t.categories.desc[cat.name as keyof typeof t.categories.desc] || cat.desc;

              return (
                <Link
                  key={idx}
                  href={`/dashboard/client?service=${encodeURIComponent(cat.name.toLowerCase())}`}
                  className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-brand-blue-500/30 hover:scale-[1.02] hover:shadow-xl hover:shadow-brand-blue-500/5 transition-all flex flex-col justify-between min-h-[120px] sm:min-h-[140px] group cursor-pointer text-start"
                >
                  <div className={`p-2.5 rounded-xl bg-slate-950 border border-slate-850 w-fit ${cat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1 mt-4">
                    <h4 dir="auto" className="text-xs sm:text-sm font-bold text-white group-hover:text-brand-blue-400 transition-colors">{catName}</h4>
                    <p dir="auto" className="text-[9px] sm:text-[10px] text-slate-500 leading-normal">{catDesc}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500 z-10 bg-slate-950/85 backdrop-blur-sm">
        <div className="max-w-7xl w-full mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>{t.footer.copyright}</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-slate-300">{t.footer.privacy}</Link>
            <Link href="/terms" className="hover:text-slate-300">{t.footer.terms}</Link>
            <Link href="/support" className="hover:text-slate-300">{t.footer.support}</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
