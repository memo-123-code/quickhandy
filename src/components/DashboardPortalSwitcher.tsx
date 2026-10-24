"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { 
  Home, User, Wrench, Shield, ChevronDown, Check, 
  ArrowLeftRight, LogOut 
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useLanguageStore } from "@/store/useLanguageStore";

interface Props {
  currentRole: "client" | "provider" | "admin";
}

export default function DashboardPortalSwitcher({ currentRole }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { language } = useLanguageStore();
  const isAr = language === "ar";

  const portals = [
    {
      id: "client",
      title: isAr ? "لوحة العميل" : "Client Portal",
      sub: isAr ? "طلب وتتبع الخدمات" : "Book & track services",
      href: "/dashboard/client",
      icon: User,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      activeBorder: "border-blue-500/40",
    },
    {
      id: "provider",
      title: isAr ? "لوحة الفني" : "Provider Portal",
      sub: isAr ? "استقبال وتنفيذ الطلبات" : "Receive & fulfill orders",
      href: "/dashboard/provider",
      icon: Wrench,
      color: "text-orange-400",
      bg: "bg-orange-500/10",
      activeBorder: "border-orange-500/40",
    },
    {
      id: "admin",
      title: isAr ? "لوحة الإدارة" : "Admin Suite",
      sub: isAr ? "إدارة المستخدمين والعمليات" : "Manage users & ops",
      href: "/dashboard/admin",
      icon: Shield,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      activeBorder: "border-emerald-500/40",
    },
  ];

  const current = portals.find((p) => p.id === currentRole) || portals[0];
  const CurrentIcon = current.icon;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Switcher Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-200 transition-all text-xs font-medium shadow-sm hover:border-slate-600 active:scale-95"
        title={isAr ? "التبديل بين اللوحات" : "Switch Portal"}
      >
        <ArrowLeftRight className="w-3.5 h-3.5 text-slate-400" />
        <CurrentIcon className={`w-3.5 h-3.5 ${current.color}`} />
        <span className="hidden sm:inline font-semibold">{current.title}</span>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full mt-2 end-0 w-64 bg-slate-900/95 backdrop-blur-xl border border-slate-700/70 rounded-xl shadow-2xl p-2 z-50 animate-fadeIn">
          <div className="px-3 py-2 border-b border-slate-800 text-[11px] font-semibold text-slate-400 flex items-center justify-between">
            <span>{isAr ? "التنقل السريع بين اللوحات" : "Switch Dashboard"}</span>
            <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
              QuickHandy
            </span>
          </div>

          <div className="space-y-1 py-1.5">
            {portals.map((p) => {
              const Icon = p.icon;
              const isActive = p.id === currentRole;
              return (
                <Link
                  key={p.id}
                  href={p.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between p-2 rounded-lg text-xs transition-all ${
                    isActive
                      ? `${p.bg} border ${p.activeBorder} text-white font-semibold`
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`p-1.5 rounded-md ${p.bg}`}>
                      <Icon className={`w-4 h-4 ${p.color}`} />
                    </div>
                    <div className="text-start">
                      <p className="leading-tight">{p.title}</p>
                      <p className="text-[10px] text-slate-400 font-normal leading-tight mt-0.5">{p.sub}</p>
                    </div>
                  </div>
                  {isActive && <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                </Link>
              );
            })}
          </div>

          <div className="border-t border-slate-800 pt-1.5 mt-1 space-y-1">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 p-2 rounded-lg text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <div className="p-1 rounded bg-slate-800 text-slate-400">
                <Home className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <span>{isAr ? "الصفحة الرئيسية للموقع" : "Home Landing Page"}</span>
            </Link>

            <button
              type="button"
              onClick={async () => {
                setIsOpen(false);
                await signOut({ callbackUrl: "/login" });
              }}
              className="w-full flex items-center gap-2 p-2 rounded-lg text-xs text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <div className="p-1 rounded bg-red-500/10 text-red-400">
                <LogOut className="w-3.5 h-3.5" />
              </div>
              <span>{isAr ? "تسجيل الخروج" : "Sign Out"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
