"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Wrench, Menu, X } from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguageStore } from "@/store/useLanguageStore";
import { dictionary } from "@/locales/dictionary";
import { useSession, signOut } from "next-auth/react";
import InstallButton from "@/components/InstallButton";

export default function Navbar() {
  const { language } = useLanguageStore();
  const { data: session, status } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const t = dictionary[language].landingPage;

  return (
    <div className="sticky top-0 z-50 flex flex-col w-full">
      <header className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-3 sm:py-5 flex items-center justify-between bg-slate-950/80 backdrop-blur-md rounded-b-2xl border-b border-slate-800/50 shadow-sm relative">
        <div className="flex items-center gap-2 z-50">
          <div className="p-2 sm:p-2.5 bg-gradient-to-tr from-brand-blue-600 to-brand-orange-500 rounded-lg sm:rounded-xl shadow-lg">
            <Wrench className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <span className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
            Quick<span className="text-brand-orange-500">Handy</span>
          </span>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4 ms-auto">
          <InstallButton />
          <LanguageSwitcher />
          {status === "loading" ? (
            <div className="w-24 h-8 bg-slate-800 animate-pulse rounded-lg"></div>
          ) : session ? (
            <>
              <Link href={`/dashboard/${(session.user as any)?.role?.toLowerCase() || 'client'}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 rounded-full bg-brand-blue-500 flex items-center justify-center text-xs font-bold text-white uppercase">
                  {session.user?.name?.charAt(0) || "U"}
                </div>
                <span className="text-xs font-bold text-white">
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
            <div className="flex flex-col gap-4 pb-4 border-b border-slate-800">
              <InstallButton />
              <div className="flex justify-start">
                <LanguageSwitcher />
              </div>
            </div>
            
            <div className="flex flex-col gap-3 pt-2">
              {status === "loading" ? (
                <div className="w-full h-10 bg-slate-800 animate-pulse rounded-lg"></div>
              ) : session ? (
                <>
                  <Link 
                    href={`/dashboard/${(session.user as any)?.role?.toLowerCase() || 'client'}`} 
                    className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-brand-blue-500 flex items-center justify-center text-xs font-bold text-white uppercase">
                      {session.user?.name?.charAt(0) || "U"}
                    </div>
                    <span className="text-sm font-bold text-white">
                      Dashboard ({session.user?.name?.split(' ')[0]})
                    </span>
                  </Link>
                  <button 
                    onClick={() => signOut()}
                    className="w-full py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-sm font-bold rounded-xl transition-all border border-rose-500/20"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/login" 
                    className="w-full py-3 text-center bg-slate-800 hover:bg-slate-700 text-sm font-bold rounded-xl text-white transition-all border border-slate-700"
                  >
                    {t.nav.signIn}
                  </Link>
                  <Link 
                    href="/signup" 
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
