"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Wrench, Menu, X, User, LogOut, LayoutDashboard } from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguageStore } from "@/store/useLanguageStore";
import { dictionary } from "@/locales/dictionary";
import { useSession, signOut } from "next-auth/react";
import InstallButton from "@/components/InstallButton";

export default function Navbar() {
  const { language } = useLanguageStore();
  const { data: session, status } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const t = dictionary[language]?.landingPage || dictionary.en.landingPage;

  const userRole = ((session?.user as any)?.role || "CLIENT").toUpperCase();
  const profileUrl = userRole === "PROVIDER" 
    ? "/dashboard/provider/profile" 
    : userRole === "ADMIN" 
    ? "/dashboard/admin" 
    : "/dashboard/client/profile";
  
  const dashboardUrl = `/dashboard/${userRole.toLowerCase()}`;

  const roleLabel = userRole === "PROVIDER"
    ? (language === "ar" ? "فني" : "Provider")
    : userRole === "ADMIN"
    ? (language === "ar" ? "مسؤول" : "Admin")
    : (language === "ar" ? "عميل" : "Client");

  return (
    <div className="sticky top-0 z-50 flex flex-col w-full">
      <header className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between bg-slate-950/80 backdrop-blur-md rounded-b-2xl border-b border-slate-800/50 shadow-sm relative">
        <Link href="/" className="flex items-center gap-2 z-50 hover:opacity-90 transition-opacity">
          <div className="p-2 sm:p-2.5 bg-gradient-to-tr from-brand-blue-600 to-brand-orange-500 rounded-lg sm:rounded-xl shadow-lg">
            <Wrench className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <span className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
            Quick<span className="text-brand-orange-500">Handy</span>
          </span>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-3 ms-auto">
          <InstallButton />
          <LanguageSwitcher />
          
          {status === "loading" ? (
            <div className="w-28 h-8 bg-slate-800 animate-pulse rounded-lg"></div>
          ) : session ? (
            <>
              {/* Profile Link */}
              <Link 
                href={profileUrl}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/60 shadow-sm transition-all group"
                title={language === "ar" ? "الملف الشخصي" : "My Profile"}
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-brand-blue-600 to-brand-blue-500 flex items-center justify-center text-xs font-bold text-white shadow group-hover:scale-105 transition-transform">
                  {session.user?.name ? session.user.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
                </div>
                <div className="flex flex-col text-start">
                  <span className="text-xs font-bold text-white group-hover:text-brand-blue-400 transition-colors leading-tight">
                    {session.user?.name?.split(' ')[0] || "User"}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium leading-tight">
                    {roleLabel} • {language === "ar" ? "الملف الشخصي" : "Profile"}
                  </span>
                </div>
              </Link>

              {/* Dashboard Link */}
              <Link
                href={dashboardUrl}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-blue-600/10 hover:bg-brand-blue-600/20 text-brand-blue-400 hover:text-brand-blue-300 border border-brand-blue-500/20 text-xs font-semibold transition-all"
                title={language === "ar" ? "لوحة التحكم" : "Dashboard"}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>{language === "ar" ? "لوحة التحكم" : "Dashboard"}</span>
              </Link>

              {/* Sign Out */}
              <button 
                onClick={() => signOut()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-xs font-semibold rounded-xl text-rose-400 hover:text-rose-300 transition-all border border-rose-500/20"
                title={language === "ar" ? "تسجيل الخروج" : "Sign Out"}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{language === "ar" ? "خروج" : "Sign Out"}</span>
              </button>
            </>
          ) : (
            <>
              <Link 
                href="/login" 
                className="text-xs font-bold text-slate-300 hover:text-white transition-colors px-2 py-1"
              >
                {t.nav.signIn}
              </Link>
              <Link 
                href="/signup" 
                className="px-4 py-2 bg-brand-blue-600 hover:bg-brand-blue-500 text-xs font-bold rounded-lg text-white shadow-md shadow-brand-blue-600/15 transition-all"
              >
                {t.nav.register}
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="md:hidden flex items-center gap-3 z-50">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-300 hover:text-white bg-slate-900 rounded-lg border border-slate-800 transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="absolute top-full start-0 end-0 mt-2 p-4 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl flex flex-col gap-4 animate-fadeIn md:hidden">
            <div className="flex flex-col gap-3 pb-3 border-b border-slate-800">
              <InstallButton />
              <div className="flex justify-start">
                <LanguageSwitcher />
              </div>
            </div>
            
            <div className="flex flex-col gap-2.5 pt-1">
              {status === "loading" ? (
                <div className="w-full h-10 bg-slate-800 animate-pulse rounded-lg"></div>
              ) : session ? (
                <>
                  {/* Profile Link Mobile */}
                  <Link 
                    href={profileUrl}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-3 bg-slate-800/60 rounded-xl hover:bg-slate-800 border border-slate-700/40 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-full bg-brand-blue-500 flex items-center justify-center text-xs font-bold text-white uppercase shadow">
                      {session.user?.name ? session.user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                    </div>
                    <div className="flex flex-col text-start">
                      <span className="text-sm font-bold text-white">
                        {session.user?.name || "User"}
                      </span>
                      <span className="text-xs text-brand-blue-400 font-medium">
                        {roleLabel} • {language === "ar" ? "الملف الشخصي" : "Profile"}
                      </span>
                    </div>
                  </Link>

                  {/* Dashboard Link Mobile */}
                  <Link
                    href={dashboardUrl}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-white text-xs font-bold rounded-xl transition-all border border-slate-700"
                  >
                    <LayoutDashboard className="w-4 h-4 text-brand-orange-400" />
                    <span>{language === "ar" ? "لوحة التحكم" : "Dashboard"}</span>
                  </Link>

                  {/* Sign Out Mobile */}
                  <button 
                    onClick={() => { setIsMobileMenuOpen(false); signOut(); }}
                    className="w-full py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold rounded-xl transition-all border border-rose-500/20 flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{language === "ar" ? "تسجيل الخروج" : "Sign Out"}</span>
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/login" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full py-3 text-center bg-slate-800 hover:bg-slate-750 text-sm font-bold rounded-xl text-white transition-all border border-slate-700"
                  >
                    {t.nav.signIn}
                  </Link>
                  <Link 
                    href="/signup" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full py-3 text-center bg-gradient-to-r from-brand-blue-600 to-brand-blue-500 hover:from-brand-blue-500 hover:to-brand-blue-400 text-sm font-bold rounded-xl text-white shadow-lg shadow-brand-blue-600/20 transition-all"
                  >
                    {t.nav.register}
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>
    </div>
  );
}
