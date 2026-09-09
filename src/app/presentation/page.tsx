"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { 
  Wrench, Shield, Zap, Clock, Star, Users, CheckCircle2, Navigation,
  Droplet, Flashlight, Hammer, Wind, Paintbrush, Grid, Tv, Flame, Layers, Radio, Sparkles,
  ArrowRight, AlertCircle, XCircle, TrendingUp, TrendingDown, Briefcase, Activity, Target,
  RefreshCcw, Smartphone, MapPin, CheckSquare, Search, Lock, Wallet, Play
} from "lucide-react";

// --- GLOBAL CONFIG ---
const SCENES = [
  { id: 1, duration: 8000, name: "INTRO" },
  { id: 2, duration: 10000, name: "WHAT IS QUICKHANDY" },
  { id: 3, duration: 9000, name: "MARKET / DATA" },
  { id: 4, duration: 12000, name: "CUSTOMER PROBLEMS" },
  { id: 5, duration: 10000, name: "PROVIDER PROBLEMS" },
  { id: 6, duration: 6000, name: "SOLUTION TRANSITION" },
  { id: 7, duration: 16000, name: "SOLUTIONS" },
  { id: 8, duration: 9000, name: "BEFORE / AFTER" },
  { id: 9, duration: 10000, name: "BUSINESS MODEL" },
  { id: 10, duration: 8000, name: "IMPACT" },
  { id: 11, duration: 10000, name: "FINAL" }
];

// --- HIGH-END SCENE COMPONENTS ---

const Scene01Intro = () => (
  <motion.div key="scene01" className="absolute inset-0 flex items-center justify-center bg-[#02050A] overflow-hidden"
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.05 }} transition={{ duration: 1 }}>
    
    {/* Abstract Premium Background */}
    <motion.div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] opacity-20 pointer-events-none"
      animate={{ rotate: 360 }} transition={{ duration: 100, repeat: Infinity, ease: "linear" }}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-blue-900/40 via-transparent to-transparent blur-3xl"></div>
    </motion.div>

    {/* Cinematic 3D Dolly In */}
    <motion.div 
      className="absolute inset-0 flex items-center justify-center z-10"
      initial={{ scale: 0.8, y: 100, rotateX: 30, opacity: 0 }}
      animate={{ scale: 1, y: 0, rotateX: 0, opacity: 1 }}
      transition={{ duration: 3, ease: [0.16, 1, 0.3, 1] }}
      style={{ perspective: 1500 }}
    >
      <div className="relative w-[120vw] md:w-[85vw] h-[85vh] mt-32 rounded-t-[3rem] overflow-hidden shadow-[0_-20px_100px_rgba(56,172,247,0.15)] border-t border-x border-white/5 bg-slate-900/50 backdrop-blur-sm">
        <Image src="/images/promo/landing_ui.png" alt="Platform UI" fill className="object-cover object-top opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#02050A] via-[#02050A]/80 to-transparent"></div>
      </div>
    </motion.div>

    {/* Typography Entrance */}
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, filter: "blur(20px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
      >
        <Image src="/images/promo/cinematic_logo.png" alt="QuickHandy" width={300} height={120} className="object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]" />
      </motion.div>
      
      <div className="overflow-hidden mt-6">
        <motion.p 
          className="text-xl md:text-2xl text-brand-blue-400 font-light tracking-[0.4em] uppercase"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.5, delay: 1.5, ease: [0.16, 1, 0.3, 1] }}
        >
          The Next Generation
        </motion.p>
      </div>
      <div className="overflow-hidden mt-2">
        <motion.p 
          className="text-sm md:text-base text-slate-500 font-light tracking-[0.2em] uppercase"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.5, delay: 1.8, ease: [0.16, 1, 0.3, 1] }}
        >
          Digital Service Ecosystem
        </motion.p>
      </div>
    </div>
  </motion.div>
);

const Scene02WhatIs = () => {
  return (
    <motion.div key="scene02" className="absolute inset-0 flex items-center justify-center bg-[#02050A] overflow-hidden"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }}>
      
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>

      <motion.div className="absolute top-16 left-16 z-20" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5, duration: 1 }}>
        <h2 className="text-4xl font-bold tracking-[0.2em] text-white uppercase flex items-center gap-4">
          <div className="w-12 h-1 bg-brand-blue-500"></div> The Ecosystem
        </h2>
        <p className="text-slate-500 tracking-widest uppercase mt-4 text-sm">Connecting every node flawlessly</p>
      </motion.div>

      {/* Advanced Animated Network */}
      <div className="relative w-full max-w-5xl aspect-video flex items-center justify-center z-10">
        
        {/* Core Node */}
        <motion.div 
          className="absolute z-30 flex flex-col items-center justify-center"
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.4, delay: 1 }}
        >
          <div className="w-40 h-40 rounded-full bg-[#02050A] border border-white/10 flex items-center justify-center shadow-[0_0_100px_rgba(56,172,247,0.2)] relative">
            <div className="absolute inset-[-2px] rounded-full bg-gradient-to-tr from-brand-blue-500 to-brand-orange-500 animate-spin" style={{ animationDuration: '4s', zIndex: -1, maskImage: 'linear-gradient(#fff 0 0)', maskComposite: 'exclude' }}></div>
            <Image src="/images/promo/logo.png" alt="Core" width={80} height={80} className="object-contain" />
          </div>
        </motion.div>

        {/* Orbiting Elements */}
        {[
          { x: -350, y: -100, label: "CUSTOMERS", icon: Users, color: "text-white" },
          { x: 350, y: -100, label: "PROVIDERS", icon: Wrench, color: "text-brand-orange-400" },
          { x: 0, y: 250, label: "BUSINESSES", icon: Briefcase, color: "text-brand-blue-400" }
        ].map((node, i) => (
          <React.Fragment key={`node-${i}`}>
            {/* SVG Connecting Line */}
            <motion.svg className="absolute inset-0 w-full h-full pointer-events-none z-10"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 + i * 0.5 }}>
              <motion.line 
                x1="50%" y1="50%" 
                x2={`calc(50% + ${node.x}px)`} y2={`calc(50% + ${node.y}px)`} 
                stroke="rgba(255,255,255,0.1)" strokeWidth="2" strokeDasharray="5,5"
              />
              {/* Particle flowing on line */}
              <motion.circle r="3" fill="#38acf7"
                animate={{ 
                  cx: ["50%", `calc(50% + ${node.x}px)`],
                  cy: ["50%", `calc(50% + ${node.y}px)`],
                  opacity: [0, 1, 0]
                }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.5, ease: "easeInOut" }}
              />
            </motion.svg>

            {/* Node UI */}
            <motion.div 
              className="absolute z-20 flex flex-col items-center"
              initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
              animate={{ opacity: 1, x: node.x, y: node.y, scale: 1 }}
              transition={{ delay: 1.5 + i * 0.3, type: "spring", bounce: 0.3 }}
            >
              <div className="w-24 h-24 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent"></div>
                <node.icon className={`w-10 h-10 ${node.color} drop-shadow-lg`} />
              </div>
              <div className="mt-4 px-4 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                <span className="text-xs font-bold tracking-widest text-slate-300">{node.label}</span>
              </div>
            </motion.div>
          </React.Fragment>
        ))}

      </div>
    </motion.div>
  );
};

const Scene03Services = () => (
  <motion.div key="scene03" className="absolute inset-0 flex flex-col items-center justify-center bg-[#02050A] overflow-hidden"
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.1 }} transition={{ duration: 1 }}>
    
    <motion.div className="absolute top-16 left-16 z-20" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5, duration: 1 }}>
      <h2 className="text-sm font-bold tracking-[0.5em] text-brand-orange-500 uppercase mb-4">Core Ecosystem</h2>
      <h3 className="text-5xl font-light text-white tracking-wide">Endless & Diverse Services.</h3>
    </motion.div>

    <motion.div 
      className="absolute inset-0 flex items-center justify-center z-10 mt-24"
      initial={{ opacity: 0, y: 100, rotateX: 20 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 2, ease: "easeOut", delay: 1 }}
      style={{ perspective: 1200 }}
    >
      <div className="relative w-[85vw] h-[75vh] rounded-2xl overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.8)] border border-white/5 bg-slate-900/20 backdrop-blur-sm group">
        <Image src="/images/promo/services_ui.png" alt="Services" fill className="object-cover object-top opacity-80 group-hover:opacity-100 transition-opacity duration-1000" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#02050A] via-[#02050A]/20 to-transparent"></div>
      </div>
    </motion.div>
  </motion.div>
);

const Scene04CustomerProblems = () => {
  const problems = [
    { id: "01", title: "TRUST", desc: "Difficulty verifying reliability", icon: Shield },
    { id: "02", title: "AVAILABILITY", desc: "Finding skilled pros quickly", icon: Clock },
    { id: "03", title: "PRICING", desc: "Unclear or inconsistent costs", icon: Wallet },
    { id: "04", title: "SAFETY", desc: "Strangers in the home", icon: AlertCircle }
  ];

  return (
    <motion.div key="scene04" className="absolute inset-0 flex flex-col items-center justify-center bg-[#02050A]"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -100 }} transition={{ duration: 1 }}>
      
      <motion.div className="absolute top-16 left-16" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
        <h2 className="text-sm font-bold tracking-[0.5em] text-red-500 uppercase mb-4">The Challenge</h2>
        <h3 className="text-5xl font-light text-white tracking-wide">Customer Problems</h3>
      </motion.div>

      <div className="w-full max-w-7xl px-16 flex flex-col gap-4 mt-20">
        {problems.map((prob, idx) => (
          <motion.div key={idx} 
            className="flex items-center gap-8 bg-slate-900/30 p-6 rounded-2xl border border-red-500/10 backdrop-blur-sm"
            initial={{ opacity: 0, x: 100, filter: "blur(10px)" }} animate={{ opacity: 1, x: 0, filter: "blur(0px)" }} transition={{ delay: 1.5 + idx * 0.5, type: "spring" }}>
            <div className="text-4xl font-black text-slate-800 w-16">{prob.id}</div>
            <div className="w-16 h-16 rounded-xl bg-red-500/5 flex items-center justify-center border border-red-500/20">
              <prob.icon className="w-8 h-8 text-red-400" />
            </div>
            <div>
              <h4 className="text-2xl font-bold text-white tracking-widest uppercase">{prob.title}</h4>
              <p className="text-slate-400 mt-1 font-light tracking-wide">{prob.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

const Scene05ProviderProblems = () => (
  <motion.div key="scene05" className="absolute inset-0 flex flex-col items-center justify-center bg-[#02050A]"
    initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 1 }}>
    
    <motion.div className="absolute top-16 right-16 text-right" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
      <h2 className="text-sm font-bold tracking-[0.5em] text-brand-orange-500 uppercase mb-4">The Challenge</h2>
      <h3 className="text-5xl font-light text-white tracking-wide">Provider Problems</h3>
    </motion.div>

    <div className="flex items-center justify-center gap-16 w-full max-w-6xl">
      <motion.div className="w-1/3" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1 }}>
        <div className="w-full aspect-square rounded-full bg-slate-900/50 border border-brand-orange-500/20 flex items-center justify-center relative overflow-hidden backdrop-blur-md">
          <Wrench className="w-32 h-32 text-slate-700 absolute" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#02050A] to-transparent"></div>
        </div>
      </motion.div>

      <div className="w-2/3 flex flex-col gap-6">
        {[
          { text: "Lack of consistent work", icon: TrendingDown },
          { text: "Wasted time searching for clients", icon: Clock },
          { text: "Unstable income streams", icon: Activity }
        ].map((item, idx) => (
          <motion.div key={idx} className="flex items-center gap-6 bg-slate-900/30 p-6 rounded-2xl border border-brand-orange-500/10"
            initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.5 + idx * 0.4, type: "spring" }}>
            <div className="w-12 h-12 rounded-full bg-brand-orange-500/10 border border-brand-orange-500/30 flex items-center justify-center">
              <item.icon className="w-6 h-6 text-brand-orange-400" />
            </div>
            <p className="text-2xl font-light text-slate-300 tracking-wide">{item.text}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </motion.div>
);

const Scene06SolutionTransition = () => (
  <motion.div key="scene06" className="absolute inset-0 flex items-center justify-center bg-[#02050A]"
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.2 }} transition={{ duration: 1.5 }}>
    
    <div className="relative w-full max-w-4xl aspect-video flex items-center justify-center">
      {/* Chaos nodes morphing into order */}
      <motion.div className="absolute inset-0 flex items-center justify-center"
        initial={{ filter: "blur(0px)" }} animate={{ filter: "blur(20px)", opacity: 0 }} transition={{ duration: 2, delay: 1 }}>
        {Array.from({ length: 15 }).map((_, i) => (
          <div key={i} className="absolute w-2 h-2 bg-red-500 rounded-full"
            style={{ top: `${Math.random()*100}%`, left: `${Math.random()*100}%` }} />
        ))}
      </motion.div>

      {/* The Reorganization */}
      <motion.div className="z-10 text-center flex flex-col items-center"
        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 2.5, duration: 2, ease: "easeOut" }}>
        <div className="w-24 h-24 mb-8 rounded-full bg-brand-blue-500/10 border border-brand-blue-500/30 flex items-center justify-center shadow-[0_0_80px_rgba(56,172,247,0.3)]">
           <Image src="/images/promo/logo.png" alt="Logo" width={50} height={50} className="object-contain" />
        </div>
        <h2 className="text-6xl font-black text-white tracking-[0.3em] uppercase">QUICKHANDY</h2>
        <div className="w-0 h-px bg-gradient-to-r from-transparent via-brand-blue-500 to-transparent mt-8" style={{ animation: "expand 1s forwards 3s" }}></div>
        <h3 className="text-xl text-brand-blue-400 mt-8 tracking-[0.5em] uppercase font-light">The Solution Engine</h3>
        <style jsx>{`@keyframes expand { to { w-full } }`}</style>
      </motion.div>
    </div>
  </motion.div>
);

const Scene07Solutions = () => {
  const [activeSol, setActiveSol] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSol(prev => (prev < 3 ? prev + 1 : 3));
    }, 4000); 
    return () => clearInterval(timer);
  }, []);

  const solutions = [
    { id: "01", title: "SMART REAL-TIME MATCHING", icon: MapPin, image: "/images/promo/dispatch_map_cinematic.png", desc: "Customer Request → Location → Available Providers → Selected Provider" },
    { id: "02", title: "VISUAL PRE-DIAGNOSIS", icon: Smartphone, image: "/images/promo/booking_ui.png", desc: "Photo/Video → Diagnosis → Transparent Cost → Provider Receives Request" },
    { id: "03", title: "SECURITY SHIELD", icon: Shield, image: "/images/promo/profile_ui.png", desc: "Identity Verification → Background Checks → Trusted Professional" },
    { id: "04", title: "ECONOMIC EMPOWERMENT", icon: TrendingUp, image: "/images/promo/provider_wallet.png", desc: "Job Received → Completed → More Opportunities → Professional Growth" },
  ];

  return (
    <motion.div key="scene07" className="absolute inset-0 flex flex-col items-center justify-center bg-[#02050A]"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }}>
      
      <div className="absolute top-12 left-16 z-20">
        <h2 className="text-sm font-bold tracking-[0.5em] text-brand-blue-500 uppercase mb-4">Core Platform</h2>
        <h3 className="text-4xl font-light text-white tracking-wide">Solutions</h3>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeSol} className="w-full h-full flex items-center justify-center"
          initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.8, ease: "easeOut" }}>
          
          <div className="relative z-10 w-full max-w-7xl flex flex-col md:flex-row items-center gap-16 px-16 mt-16">
            <div className="flex-1">
              <div className="flex items-center gap-6 mb-8">
                <div className="text-6xl font-black text-slate-800">{solutions[activeSol].id}</div>
                <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight uppercase tracking-widest">
                  {solutions[activeSol].title}
                </h2>
              </div>
              
              <div className="flex flex-col gap-4">
                {solutions[activeSol].desc.split(' → ').map((step, idx) => (
                  <motion.div key={idx} className="flex items-center gap-4 bg-slate-900/50 p-4 rounded-xl border border-white/5 backdrop-blur-sm"
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + idx * 0.15 }}>
                    <CheckSquare className="w-5 h-5 text-brand-blue-400" />
                    <span className="text-lg text-slate-300 font-light tracking-wide">{step}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="flex-1 w-full aspect-square max-h-[60vh] relative rounded-3xl overflow-hidden shadow-[0_20px_100px_rgba(0,0,0,0.5)] border border-white/10 group perspective-1000">
              <motion.div
                initial={{ rotateY: 15, scale: 0.9 }}
                animate={{ rotateY: 0, scale: 1 }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="w-full h-full"
              >
                <Image src={solutions[activeSol].image} alt="UI Preview" fill className="object-cover object-top bg-[#02050A]" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#02050A] via-transparent to-transparent"></div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Progress Bar */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-4">
        {solutions.map((_, i) => (
          <div key={i} className={`w-16 h-1 rounded-full transition-all duration-500 ${i === activeSol ? 'bg-brand-blue-500' : 'bg-slate-800'}`}></div>
        ))}
      </div>
    </motion.div>
  );
};

const Scene08BeforeAfter = () => (
  <motion.div key="scene08" className="absolute inset-0 flex items-center justify-center bg-[#02050A]"
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }}>
    
    <div className="grid grid-cols-2 w-full h-full">
      {/* BEFORE */}
      <motion.div className="flex flex-col items-center justify-center bg-[#02050A] p-12 relative"
        initial={{ x: "-10%" }} animate={{ x: 0 }} transition={{ duration: 2, ease: "easeOut" }}>
        <h2 className="text-xl font-bold tracking-[0.5em] text-slate-600 mb-16 uppercase">Before Quickhandy</h2>
        <div className="flex flex-col gap-8 text-center text-3xl font-light text-slate-700 tracking-widest uppercase">
          <span>Fragmented</span>
          <span>Manual</span>
          <span>Unclear</span>
          <span>Uncertain</span>
          <span>Disconnected</span>
        </div>
      </motion.div>

      {/* AFTER */}
      <motion.div className="flex flex-col items-center justify-center bg-brand-blue-900/10 p-12 border-l border-white/5 relative overflow-hidden"
        initial={{ x: "10%" }} animate={{ x: 0 }} transition={{ duration: 2, ease: "easeOut" }}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-blue-500/10 via-transparent to-transparent"></div>
        <h2 className="text-xl font-bold tracking-[0.5em] text-brand-blue-400 mb-16 uppercase z-10">With Quickhandy</h2>
        <div className="flex flex-col gap-8 text-center text-4xl font-bold text-white tracking-widest uppercase z-10">
          <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }}>Connected</motion.span>
          <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }}>Organized</motion.span>
          <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.4 }}>Transparent</motion.span>
          <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.6 }}>Verified</motion.span>
          <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.8 }}>Efficient</motion.span>
        </div>
      </motion.div>
    </div>
  </motion.div>
);

const Scene09BusinessModel = () => (
  <motion.div key="scene09" className="absolute inset-0 flex flex-col items-center justify-center bg-[#02050A]"
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }}>
    
    <motion.div className="absolute top-16 left-16" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
      <h2 className="text-sm font-bold tracking-[0.5em] text-slate-500 uppercase mb-4">Financials</h2>
      <h3 className="text-5xl font-light text-white tracking-wide">Business Model</h3>
    </motion.div>

    <div className="flex flex-col md:flex-row gap-8 w-full max-w-7xl px-16 mt-20">
      {[
        { id: "01", title: "OPERATIONS", subtitle: "Transactions & Commission" },
        { id: "02", title: "SUBSCRIPTIONS", subtitle: "Premium Provider Tier" },
        { id: "03", title: "B2B CONTRACTS", subtitle: "Corporate Maintenance" }
      ].map((model, idx) => (
        <motion.div key={idx} className="flex-1 flex flex-col items-start bg-slate-900/40 border border-white/5 p-10 rounded-3xl relative overflow-hidden group backdrop-blur-md hover:bg-slate-900/60 transition-colors duration-500"
          initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 + idx * 0.3, type: "spring" }}>
          
          <div className="text-5xl font-light text-brand-blue-500/50 mb-8">{model.id}</div>
          
          <div className="w-full z-10">
            <h3 className="text-2xl font-bold text-white mb-4 tracking-wider">{model.title}</h3>
            <p className="text-slate-400 font-light tracking-wide">{model.subtitle}</p>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brand-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </motion.div>
      ))}
    </div>
  </motion.div>
);

const Scene10Impact = () => (
  <motion.div key="scene10" className="absolute inset-0 flex flex-col items-center justify-center bg-[#02050A]"
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }}>
    
    <motion.div className="absolute top-16 text-center" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
      <h2 className="text-sm font-bold tracking-[0.5em] text-brand-orange-500 uppercase mb-4">The Impact</h2>
    </motion.div>

    <motion.h2 className="text-6xl font-light text-slate-300 z-10 text-center leading-tight mb-20"
      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1, duration: 2, ease: "easeOut" }}>
      Growing the <span className="font-bold text-white italic">Value</span>.<br/>
      Creating the <span className="font-bold text-brand-orange-500 italic">Impact</span>.
    </motion.h2>

    <div className="z-10 flex flex-wrap justify-center items-center gap-6 max-w-5xl px-8">
      {['Customers', '+', 'Professionals', '+', 'Businesses', '=', 'Opportunities'].map((item, idx) => (
        <motion.div key={idx} 
          className={`flex items-center justify-center ${item === '+' || item === '=' ? 'text-slate-600 text-3xl' : 'bg-slate-900/50 border border-white/10 px-8 py-4 rounded-full backdrop-blur-sm'}`}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5 + idx * 0.2, type: "spring" }}>
          <span className={`text-xl font-medium tracking-widest uppercase ${item === 'Opportunities' ? 'text-brand-blue-400 font-bold' : 'text-slate-200'}`}>
            {item}
          </span>
        </motion.div>
      ))}
    </div>
  </motion.div>
);

const Scene11Final = () => (
  <motion.div key="scene11" className="absolute inset-0 flex flex-col items-center justify-center bg-[#02050A]"
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }}>
    
    <motion.div className="relative w-[300px] md:w-[400px] h-[150px] z-10"
      initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1, duration: 2, ease: "easeOut" }}>
      <Image src="/images/promo/cinematic_logo.png" alt="QuickHandy" fill className="object-contain" />
    </motion.div>

    <motion.p className="mt-8 text-xl text-slate-500 font-light tracking-[0.5em] uppercase text-center z-10"
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.5, duration: 2 }}>
      Making Everyday Services Easier
    </motion.p>
  </motion.div>
);

// --- MAIN CONTROLLER ---

export default function PresentationVideo() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [sceneIndex, setSceneIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const startPresentation = () => {
    setIsPlaying(true);
    setSceneIndex(0);
  };

  useEffect(() => {
    if (!isPlaying) return;

    const currentDuration = SCENES[sceneIndex]?.duration || 5000;
    const startTime = Date.now();

    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setProgress(Math.min((elapsed / currentDuration) * 100, 100));
    }, 50);

    const timer = setTimeout(() => {
      if (sceneIndex < SCENES.length - 1) {
        setSceneIndex(prev => prev + 1);
      }
    }, currentDuration);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [sceneIndex, isPlaying]);

  if (!isPlaying) {
    return (
      <div className="min-h-screen bg-[#02050A] flex flex-col items-center justify-center font-outfit">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }} className="flex flex-col items-center cursor-pointer group" onClick={startPresentation}>
          <div className="w-24 h-24 rounded-full bg-brand-blue-500/10 border border-brand-blue-500/30 flex items-center justify-center group-hover:scale-110 group-hover:bg-brand-blue-500/20 transition-all duration-500 shadow-[0_0_50px_rgba(56,172,247,0.2)]">
            <Play className="w-10 h-10 text-white ml-2 opacity-80 group-hover:opacity-100" />
          </div>
          <p className="mt-8 text-sm font-light tracking-[0.5em] text-slate-500 uppercase">Premium Presentation</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#02050A] overflow-hidden font-outfit text-white">
      {/* Master Progress Indicator */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/5 z-50">
        <motion.div 
          className="h-full bg-gradient-to-r from-brand-blue-500 to-brand-blue-400 shadow-[0_0_15px_rgba(56,172,247,0.5)]"
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
          transition={{ ease: "linear", duration: 0.05 }}
        />
      </div>

      <AnimatePresence mode="wait">
        {sceneIndex === 0 && <Scene01Intro key="s1" />}
        {sceneIndex === 1 && <Scene02WhatIs key="s2" />}
        {sceneIndex === 2 && <Scene03Services key="s3" />}
        {sceneIndex === 3 && <Scene04CustomerProblems key="s4" />}
        {sceneIndex === 4 && <Scene05ProviderProblems key="s5" />}
        {sceneIndex === 5 && <Scene06SolutionTransition key="s6" />}
        {sceneIndex === 6 && <Scene07Solutions key="s7" />}
        {sceneIndex === 7 && <Scene08BeforeAfter key="s8" />}
        {sceneIndex === 8 && <Scene09BusinessModel key="s9" />}
        {sceneIndex === 9 && <Scene10Impact key="s10" />}
        {sceneIndex === 10 && <Scene11Final key="s11" />}
      </AnimatePresence>
    </div>
  );
}
