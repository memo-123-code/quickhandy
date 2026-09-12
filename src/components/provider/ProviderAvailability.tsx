"use client";

import React, { useState } from "react";
import { MapPin, Zap, Plus, Clock, Activity, CheckCircle2 } from "lucide-react";

export default function ProviderAvailability() {
  const [isOnline, setIsOnline] = useState(true);
  const [emergencyDispatches, setEmergencyDispatches] = useState(false);

  const [schedule, setSchedule] = useState([
    { day: "Saturday", label: "السبت", active: true, start: "09:00", end: "18:00" },
    { day: "Sunday", label: "الأحد", active: true, start: "09:00", end: "18:00" },
    { day: "Monday", label: "الإثنين", active: true, start: "09:00", end: "18:00" },
    { day: "Tuesday", label: "الثلاثاء", active: true, start: "09:00", end: "18:00" },
    { day: "Wednesday", label: "الأربعاء", active: true, start: "09:00", end: "18:00" },
    { day: "Thursday", label: "الخميس", active: true, start: "09:00", end: "18:00" },
    { day: "Friday", label: "الجمعة", active: false, start: "09:00", end: "18:00" },
  ]);

  const toggleDay = (index: number) => {
    const newSchedule = [...schedule];
    newSchedule[index].active = !newSchedule[index].active;
    setSchedule(newSchedule);
  };

  const updateTime = (index: number, field: "start" | "end", value: string) => {
    const newSchedule = [...schedule];
    newSchedule[index][field] = value;
    setSchedule(newSchedule);
  };

  const areas = ["10th of Ramadan City", "El Shorouk", "Badr City"];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Quick Status Controls (Top) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Current Status */}
        <div className="p-5 rounded-xl bg-[#1a1d27] border border-slate-800 flex justify-between items-center transition-colors shadow-lg">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isOnline ? 'bg-green-500/10 border border-green-500/20' : 'bg-slate-800 border border-slate-700'}`}>
              <Activity className={`w-5 h-5 ${isOnline ? 'text-green-500' : 'text-slate-500'}`} />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Current Status</p>
              {isOnline ? (
                <p className="text-xs text-green-400 flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  Accepting New Jobs
                </p>
              ) : (
                <p className="text-xs text-slate-500 mt-0.5">Offline</p>
              )}
            </div>
          </div>
          <button
            onClick={() => setIsOnline(!isOnline)}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              isOnline ? "bg-green-500" : "bg-slate-700"
            }`}
          >
            <span className={`block w-5 h-5 rounded-full bg-white transition-transform ${
              isOnline ? "translate-x-6" : "translate-x-1"
            } mt-0.5 shadow-sm`} />
          </button>
        </div>

        {/* Emergency Dispatches */}
        <div className="p-5 rounded-xl bg-[#1a1d27] border border-slate-800 flex justify-between items-center transition-colors shadow-lg">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${emergencyDispatches ? 'bg-brand-orange-500/10 border border-brand-orange-500/20' : 'bg-slate-800 border border-slate-700'}`}>
              <Zap className={`w-5 h-5 ${emergencyDispatches ? 'text-brand-orange-500' : 'text-slate-500'}`} />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Emergency Dispatches</p>
              <p className="text-xs text-slate-400 mt-0.5" dir="rtl">طوارئ 24/7</p>
            </div>
          </div>
          <button
            onClick={() => setEmergencyDispatches(!emergencyDispatches)}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              emergencyDispatches ? "bg-brand-orange-500" : "bg-slate-700"
            }`}
          >
            <span className={`block w-5 h-5 rounded-full bg-white transition-transform ${
              emergencyDispatches ? "translate-x-6" : "translate-x-1"
            } mt-0.5 shadow-sm`} />
          </button>
        </div>
      </div>

      {/* 2. Weekly Schedule (Middle) */}
      <div className="p-6 rounded-xl bg-[#1a1d27] border border-slate-800 space-y-6 shadow-lg">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-brand-orange-500" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Working Hours (مواعيد العمل)</h3>
        </div>
        <div className="space-y-0 divide-y divide-slate-800/50 border border-slate-800/50 rounded-xl overflow-hidden">
          {schedule.map((day, idx) => (
            <div key={idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/30 hover:bg-slate-800/20 transition-colors">
              <div className="flex items-center gap-4 w-40">
                <button
                  onClick={() => toggleDay(idx)}
                  className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${
                    day.active ? "bg-brand-orange-500" : "bg-slate-700"
                  }`}
                >
                  <span className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                    day.active ? "translate-x-5" : "translate-x-1"
                  } mt-0.5 shadow-sm`} />
                </button>
                <div>
                  <p className="text-sm font-bold text-white">{day.day}</p>
                  <p className="text-xs text-slate-500" dir="rtl">{day.label}</p>
                </div>
              </div>
              
              {day.active ? (
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <input
                      type="time"
                      value={day.start}
                      onChange={(e) => updateTime(idx, "start", e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-lg pl-3 pr-2 py-2 text-xs text-white font-medium focus:border-brand-orange-500 focus:outline-none transition-all w-[110px]"
                    />
                  </div>
                  <span className="text-slate-500 text-xs font-medium">to</span>
                  <div className="relative">
                    <input
                      type="time"
                      value={day.end}
                      onChange={(e) => updateTime(idx, "end", e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-lg pl-3 pr-2 py-2 text-xs text-white font-medium focus:border-brand-orange-500 focus:outline-none transition-all w-[110px]"
                    />
                  </div>
                </div>
              ) : (
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest sm:me-16">Day Off</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 3. Coverage Area (Bottom) */}
      <div className="p-6 rounded-xl bg-[#1a1d27] border border-slate-800 space-y-6 shadow-lg">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-brand-orange-500" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Service Areas (نطاق العمل)</h3>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {areas.map((area, idx) => (
            <div key={idx} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-orange-500/10 border border-brand-orange-500/20 text-brand-orange-400 text-xs font-bold shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {area}
            </div>
          ))}
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 border border-dashed border-slate-600 hover:border-slate-400 text-slate-400 hover:text-white text-xs font-bold transition-colors cursor-pointer">
            <Plus className="w-3.5 h-3.5" />
            Add New Area
          </button>
        </div>
      </div>
    </div>
  );
}
