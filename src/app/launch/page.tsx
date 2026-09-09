"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation, useInView } from 'framer-motion';
import Image from 'next/image';
import { 
  Wrench, Shield, Zap, Clock, Star, Users, CheckCircle2, Navigation,
  Droplet, Flashlight, Hammer, Wind, Paintbrush, Grid, Tv, Flame, Layers, Radio, Sparkles,
  Play
} from "lucide-react";

// The total sequence of our cinematic presentation
const SCENES = [
  { id: 0, name: 'Hook', duration: 6000 },
  { id: 1, name: 'Problem', duration: 5000 },
  { id: 2, name: 'Solution', duration: 7000 },
  { id: 3, name: 'Journey', duration: 8000 },
  { id: 4, name: 'Services', duration: 8000 },
  { id: 5, name: 'TwoSides', duration: 7000 },
  { id: 6, name: 'Impact', duration: 5000 },
  { id: 7, name: 'TechShowcase', duration: 8000 },
  { id: 8, name: 'Montage', duration: 6000 },
  { id: 9, name: 'Ecosystem', duration: 7000 },
  { id: 10, name: 'Climax', duration: 6000 },
  { id: 11, name: 'Final', duration: 10000 }, // Hold final frame
];

export default function LaunchVideo() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentScene, setCurrentScene] = useState(0);
  const [progress, setProgress] = useState(0);
  
  // Audio ref (optional, placeholder for cinematic track)
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startVideo = () => {
    setIsPlaying(true);
    setCurrentScene(0);
    // Try to play audio if added
    if (audioRef.current) {
      audioRef.current.volume = 0.5;
      audioRef.current.play().catch(e => console.log("Audio autoplay blocked", e));
    }
  };

  useEffect(() => {
    if (!isPlaying) return;

    const sceneDuration = SCENES[currentScene]?.duration || 5000;
    const startTime = Date.now();

    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setProgress(Math.min((elapsed / sceneDuration) * 100, 100));
    }, 50);

    const timer = setTimeout(() => {
      if (currentScene < SCENES.length - 1) {
        setCurrentScene(prev => prev + 1);
      } else {
        // End of video behavior
      }
    }, sceneDuration);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [currentScene, isPlaying]);

  if (!isPlaying) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="z-10 flex flex-col items-center"
        >
          <div className="relative w-64 h-64 mb-8 group cursor-pointer" onClick={startVideo}>
            <div className="absolute inset-0 bg-brand-blue-500 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>
            <div className="relative w-full h-full rounded-full border-2 border-white/10 flex items-center justify-center bg-black/50 backdrop-blur-md group-hover:border-brand-blue-500/50 transition-colors duration-700">
              <Play className="w-20 h-20 text-white translate-x-2 group-hover:scale-110 transition-transform duration-500" />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold tracking-widest text-white uppercase font-outfit">QuickHandy</h1>
          <p className="text-slate-400 mt-2 tracking-[0.2em] uppercase text-sm">Cinematic Experience</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black text-white overflow-hidden font-outfit select-none">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900/40 via-black to-black opacity-80"></div>
      </div>

      {/* Cinematic Letterboxing */}
      <div className="absolute top-0 left-0 right-0 h-[8vh] bg-black z-50"></div>
      <div className="absolute bottom-0 left-0 right-0 h-[8vh] bg-black z-50 flex items-center px-8">
         <div className="w-full h-0.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-brand-blue-500"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "linear", duration: 0.05 }}
            />
         </div>
      </div>

      {/* Main Scene Container */}
      <div className="absolute top-[8vh] bottom-[8vh] left-0 right-0 z-10 flex items-center justify-center perspective-[2000px]">
        <AnimatePresence mode="wait">
          
          {/* SCENE 01: THE HOOK */}
          {currentScene === 0 && (
            <motion.div
              key="scene0"
              className="absolute inset-0 flex flex-col items-center justify-center"
              initial={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 1.05, filter: "blur(5px)" }}
              transition={{ duration: 2, ease: "easeInOut" }}
            >
              <motion.div 
                className="absolute inset-0 opacity-30"
                initial={{ scale: 1.2, rotate: 5 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 6, ease: "easeOut" }}
              >
                <Image src="/images/promo/cinematic_logo.png" alt="Hook" fill className="object-cover" />
              </motion.div>
              
              <div className="z-10 text-center">
                <motion.h1 
                  className="text-7xl md:text-9xl font-black tracking-tighter"
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 1.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  QUICKHANDY
                </motion.h1>
                <motion.p 
                  className="mt-6 text-xl md:text-3xl text-brand-blue-400 font-light tracking-[0.2em] uppercase"
                  initial={{ opacity: 0, clipPath: "inset(0 100% 0 0)" }}
                  animate={{ opacity: 1, clipPath: "inset(0 0% 0 0)" }}
                  transition={{ duration: 2, delay: 1.5, ease: "easeInOut" }}
                >
                  Your Everyday Services. One Powerful Platform.
                </motion.p>
              </div>
            </motion.div>
          )}

          {/* SCENE 02: THE PROBLEM */}
          {currentScene === 1 && (
            <motion.div
              key="scene1"
              className="absolute inset-0 flex items-center justify-center bg-slate-950"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
            >
              <div className="absolute inset-0 overflow-hidden opacity-20">
                <motion.div 
                  className="grid grid-cols-4 md:grid-cols-8 gap-4 w-[150vw] h-[150vh] -translate-x-1/4 -translate-y-1/4"
                  animate={{ 
                    rotate: [0, 2],
                    scale: [1, 1.05]
                  }}
                  transition={{ duration: 10, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
                >
                  {Array.from({ length: 128 }).map((_, i) => (
                    <div key={i} className="bg-slate-900 rounded-lg animate-pulse" style={{ animationDelay: `${Math.random() * 2}s` }} />
                  ))}
                </motion.div>
              </div>
              <motion.div 
                className="z-10 max-w-4xl text-center px-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.5, delay: 0.5 }}
              >
                <h2 className="text-4xl md:text-6xl font-medium leading-tight text-slate-300">
                  Finding the right service<br/>shouldn't be <span className="text-brand-orange-500 font-bold italic">complicated.</span>
                </h2>
              </motion.div>
            </motion.div>
          )}

          {/* SCENE 03: THE SOLUTION */}
          {currentScene === 2 && (
            <motion.div
              key="scene2"
              className="absolute inset-0 flex flex-col items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 1.5 }}
            >
              <motion.div
                className="absolute text-center z-20"
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 0, y: -50 }}
                transition={{ duration: 1.5, delay: 2.5 }}
              >
                <h2 className="text-5xl md:text-7xl font-bold">Meet Quickhandy.</h2>
                <p className="text-2xl text-brand-blue-400 mt-4 tracking-widest">A smarter way.</p>
              </motion.div>

              <motion.div 
                className="relative w-[90vw] md:w-[70vw] h-[60vh] md:h-[70vh] rounded-2xl overflow-hidden shadow-[0_0_100px_rgba(56,172,247,0.3)] border border-white/10"
                initial={{ opacity: 0, rotateX: 45, y: 150, scale: 0.8 }}
                animate={{ opacity: 1, rotateX: 0, y: 0, scale: 1 }}
                transition={{ duration: 2.5, delay: 2, ease: [0.16, 1, 0.3, 1] }}
                style={{ transformStyle: "preserve-3d" }}
              >
                <Image src="/images/promo/landing_ui.png" alt="UI" fill className="object-cover object-top" />
              </motion.div>
            </motion.div>
          )}

          {/* SCENE 04: THE USER JOURNEY */}
          {currentScene === 3 && (
            <motion.div
              key="scene3"
              className="absolute inset-0 flex flex-col items-center justify-center px-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
            >
              <div className="flex gap-8 items-center justify-center w-full max-w-6xl mb-12">
                {['Discover', 'Choose', 'Request', 'Connect'].map((step, idx) => (
                  <motion.div 
                    key={step}
                    className="flex flex-col items-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.8, duration: 1 }}
                  >
                    <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-xl font-bold mb-4 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                      {idx + 1}
                    </div>
                    <span className="text-xl tracking-wider text-slate-300">{step}</span>
                  </motion.div>
                ))}
              </div>

              <motion.div 
                className="relative w-full max-w-4xl h-[50vh] rounded-xl overflow-hidden border border-white/5"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 3, duration: 1.5, ease: "easeOut" }}
              >
                <Image src="/images/promo/booking_ui.png" alt="Booking UI" fill className="object-cover" />
              </motion.div>
            </motion.div>
          )}

          {/* SCENE 05: SERVICES */}
          {currentScene === 4 && (
            <motion.div
              key="scene4"
              className="absolute inset-0 flex flex-col items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
            >
              <motion.h2 
                className="text-4xl md:text-6xl font-light mb-16 text-center"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
              >
                Whatever service you need,<br/>
                <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-blue-400 to-brand-blue-600">Quickhandy helps you find it.</span>
              </motion.h2>

              <div className="relative w-full max-w-5xl h-[50vh]">
                <motion.div 
                  className="absolute inset-0 rounded-2xl overflow-hidden border border-white/10 shadow-[0_20px_100px_rgba(0,0,0,0.8)]"
                  initial={{ opacity: 0, rotateY: -30, x: -100 }}
                  animate={{ opacity: 1, rotateY: 0, x: 0 }}
                  transition={{ delay: 1, duration: 2, ease: "easeOut" }}
                >
                  <Image src="/images/promo/services_ui.png" alt="Services" fill className="object-cover" />
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* SCENE 06: TWO SIDES */}
          {currentScene === 5 && (
            <motion.div
              key="scene5"
              className="absolute inset-0 flex flex-col items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
            >
              <motion.h2 
                className="absolute top-20 text-4xl font-bold tracking-widest text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
              >
                Connecting People.<br/><span className="text-brand-orange-500 font-light">Creating Opportunities.</span>
              </motion.h2>

              <div className="flex w-full max-w-6xl justify-between items-center px-10 mt-10">
                {/* Customer */}
                <motion.div 
                  className="w-[30vw] h-[50vh] relative rounded-xl overflow-hidden border border-white/10"
                  initial={{ opacity: 0, x: -100 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1, duration: 1.5 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-brand-blue-900/50 to-transparent z-10 flex p-6">
                    <span className="text-2xl font-bold">Customer</span>
                  </div>
                  <Image src="/images/promo/profile_ui.png" alt="Customer" fill className="object-cover object-left" />
                </motion.div>

                {/* Connection */}
                <motion.div 
                  className="flex-1 flex justify-center"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 2, duration: 1 }}
                >
                  <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.3)]">
                    <Wrench className="w-10 h-10 text-black" />
                  </div>
                </motion.div>

                {/* Provider */}
                <motion.div 
                  className="w-[30vw] h-[50vh] relative rounded-xl overflow-hidden border border-white/10"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.5, duration: 1.5 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-brand-orange-900/50 to-transparent z-10 flex p-6">
                    <span className="text-2xl font-bold">Provider</span>
                  </div>
                  <Image src="/images/promo/provider_ui.png" alt="Provider" fill className="object-cover object-right" />
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* SCENE 07: COMMUNITY IMPACT */}
          {currentScene === 6 && (
            <motion.div
              key="scene6"
              className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 to-black"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
            >
              <div className="text-center z-10">
                <motion.h2 
                  className="text-5xl md:text-7xl font-light text-slate-300"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 1.5 }}
                >
                  More than a <span className="font-bold text-white">service platform.</span>
                </motion.h2>
                <motion.h3
                  className="text-3xl md:text-5xl mt-6 text-brand-orange-400 font-medium"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2, duration: 1.5 }}
                >
                  A platform that creates opportunities.
                </motion.h3>
              </div>
              
              {/* Subtle background UI floating */}
              <motion.div 
                className="absolute inset-0 opacity-10 pointer-events-none"
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.15 }}
                transition={{ duration: 5 }}
              >
                <Image src="/images/promo/provider_wallet.png" alt="Wallet" fill className="object-cover" />
              </motion.div>
            </motion.div>
          )}

          {/* SCENE 08: TECH SHOWCASE */}
          {currentScene === 7 && (
            <motion.div
              key="scene7"
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
            >
              <motion.div 
                className="absolute w-[120vw] h-[120vh]"
                initial={{ scale: 1.5, rotate: -5, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ duration: 8, ease: "easeOut" }}
              >
                <Image src="/images/promo/dispatch_map_cinematic.png" alt="Dispatch Map" fill className="object-cover" />
              </motion.div>
              
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-10"></div>

              <motion.div 
                className="z-20 text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.5, duration: 1.5, ease: "backOut" }}
              >
                <h2 className="text-6xl font-black tracking-widest uppercase">Smart Dispatch</h2>
                <div className="w-32 h-1 bg-brand-blue-500 mx-auto mt-6 mb-6 rounded-full"></div>
                <p className="text-2xl text-slate-300 font-light">Real-time precision. Intelligent routing.</p>
              </motion.div>
            </motion.div>
          )}

          {/* SCENE 09: FEATURE MONTAGE */}
          {currentScene === 8 && (
            <motion.div
              key="scene8"
              className="absolute inset-0 bg-black"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Feature 1: Map */}
              <motion.div
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 1, 0] }}
                transition={{ duration: 2, times: [0, 0.1, 0.9, 1] }}
              >
                <Image src="/images/promo/dispatch_map_ui.png" alt="F1" fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent flex items-end justify-center pb-24">
                  <h2 className="text-6xl font-bold">Live Tracking</h2>
                </div>
              </motion.div>

              {/* Feature 2: Booking */}
              <motion.div
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 1, 0] }}
                transition={{ delay: 2, duration: 2, times: [0, 0.1, 0.9, 1] }}
              >
                <Image src="/images/promo/booking_ui.png" alt="F2" fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent flex items-end justify-center pb-24">
                  <h2 className="text-6xl font-bold">Visual Diagnostics</h2>
                </div>
              </motion.div>

              {/* Feature 3: Wallet */}
              <motion.div
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 1, 0] }}
                transition={{ delay: 4, duration: 2, times: [0, 0.1, 0.9, 1] }}
              >
                <Image src="/images/promo/provider_wallet.png" alt="F3" fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent flex items-end justify-center pb-24">
                  <h2 className="text-6xl font-bold">Digital Wallet</h2>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* SCENE 10: ECOSYSTEM */}
          {currentScene === 9 && (
            <motion.div
              key="scene9"
              className="absolute inset-0 flex items-center justify-center bg-black"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
            >
              <div className="relative w-full max-w-4xl h-[60vh]">
                {/* Center Logo */}
                <motion.div 
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-brand-blue-900/30 border border-brand-blue-500/50 flex items-center justify-center z-20 shadow-[0_0_100px_rgba(56,172,247,0.5)]"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5, duration: 1.5 }}
                >
                  <Image src="/images/promo/logo.png" alt="Logo" width={100} height={100} className="object-contain" />
                </motion.div>

                {/* Orbiting Elements */}
                {[
                  { icon: Users, label: "Customers", delay: 0.5, angle: 0 },
                  { icon: Wrench, label: "Providers", delay: 0.7, angle: 72 },
                  { icon: Shield, label: "Security", delay: 0.9, angle: 144 },
                  { icon: Zap, label: "Speed", delay: 1.1, angle: 216 },
                  { icon: Star, label: "Quality", delay: 1.3, angle: 288 },
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    className="absolute top-1/2 left-1/2 z-10"
                    initial={{ opacity: 0, x: "-50%", y: "-50%" }}
                    animate={{ 
                      opacity: 1, 
                      x: `calc(-50% + ${Math.cos((item.angle * Math.PI) / 180) * 250}px)`, 
                      y: `calc(-50% + ${Math.sin((item.angle * Math.PI) / 180) * 250}px)`
                    }}
                    transition={{ delay: item.delay, duration: 1, type: "spring" }}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-white">
                        <item.icon className="w-8 h-8" />
                      </div>
                      <span className="text-sm font-bold tracking-wider">{item.label}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* SCENE 11: CINEMATIC CLIMAX */}
          {currentScene === 10 && (
            <motion.div
              key="scene10"
              className="absolute inset-0 flex flex-col items-center justify-center bg-black"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
            >
               <motion.div 
                 className="absolute inset-0 bg-brand-blue-500 mix-blend-overlay"
                 initial={{ opacity: 0 }}
                 animate={{ opacity: [0, 0.2, 0] }}
                 transition={{ duration: 3, delay: 1 }}
               />
               
               <motion.h1 
                 className="text-6xl md:text-8xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500"
                 initial={{ scale: 0.8, opacity: 0, filter: "blur(20px)" }}
                 animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
                 transition={{ duration: 2, ease: "easeOut" }}
               >
                 One Platform.
               </motion.h1>
               <motion.h1 
                 className="text-6xl md:text-8xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-brand-blue-300 to-brand-blue-700 mt-2"
                 initial={{ scale: 0.8, opacity: 0, filter: "blur(20px)" }}
                 animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
                 transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
               >
                 Endless Possibilities.
               </motion.h1>
            </motion.div>
          )}

          {/* SCENE 12: FINAL BRAND FRAME */}
          {currentScene === 11 && (
            <motion.div
              key="scene11"
              className="absolute inset-0 flex flex-col items-center justify-center bg-[#050B14]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 2 }}
            >
              <motion.div 
                className="relative w-[300px] md:w-[500px] h-[150px] md:h-[250px]"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 2, ease: "easeOut" }}
              >
                <Image src="/images/promo/cinematic_logo.png" alt="QuickHandy" fill className="object-contain" />
              </motion.div>

              <motion.p 
                className="mt-8 text-xl md:text-2xl text-slate-400 font-light tracking-[0.3em] uppercase text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 3, duration: 2 }}
              >
                Making Everyday Services Easier.
              </motion.p>

              <motion.div 
                className="mt-16 flex gap-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 4.5, duration: 1.5 }}
              >
                <a href="/" className="px-8 py-4 bg-brand-blue-600 hover:bg-brand-blue-500 rounded-full font-bold tracking-widest text-sm uppercase transition-colors shadow-[0_0_30px_rgba(56,172,247,0.3)]">
                  Launch Platform
                </a>
              </motion.div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
