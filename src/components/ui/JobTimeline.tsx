"use client";

import React from "react";
import { Clock, Navigation2, Wrench, CheckCircle2 } from "lucide-react";

export type BookingStatus = "PENDING" | "EN_ROUTE" | "IN_PROGRESS" | "COMPLETED";

interface JobTimelineProps {
  status: BookingStatus;
}

export default function JobTimeline({ status }: JobTimelineProps) {
  const steps = [
    { id: "PENDING", label: "Pending Approval", icon: Clock, desc: "Worker is reviewing request" },
    { id: "EN_ROUTE", label: "En Route", icon: Navigation2, desc: "Worker is on the way" },
    { id: "IN_PROGRESS", label: "In Progress", icon: Wrench, desc: "Job is being serviced" },
    { id: "COMPLETED", label: "Completed", icon: CheckCircle2, desc: "Service finalized" }
  ];

  const getStatusIndex = () => {
    switch (status) {
      case "PENDING": return 0;
      case "EN_ROUTE": return 1;
      case "IN_PROGRESS": return 2;
      case "COMPLETED": return 3;
      default: return 0;
    }
  };

  const currentIndex = getStatusIndex();

  return (
    <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg">
      <h3 dir="auto" className="text-sm font-bold text-white mb-6">Booking Status</h3>
      
      <div className="relative">
        {/* Background Line */}
        <div className="absolute left-[21px] top-4 bottom-8 w-0.5 bg-slate-800" />
        
        {/* Active Progress Line */}
        <div 
          className="absolute left-[21px] top-4 w-0.5 bg-brand-blue-500 transition-all duration-700 ease-in-out"
          style={{ height: `${(currentIndex / (steps.length - 1)) * 100}%`, maxHeight: "calc(100% - 32px)" }}
        />

        <div className="space-y-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index < currentIndex;
            const isActive = index === currentIndex;
            const isPending = index > currentIndex;

            return (
              <div key={step.id} className="flex gap-4 relative z-10 group">
                <div className={`w-11 h-11 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors duration-500 ${
                  isActive ? "bg-brand-blue-600 border-brand-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]" :
                  isCompleted ? "bg-slate-800 border-brand-blue-500 text-brand-blue-400" :
                  "bg-slate-950 border-slate-800 text-slate-600"
                }`}>
                  <Icon className={`w-5 h-5 ${isActive && "animate-pulse"}`} />
                </div>
                
                <div className="flex-1 pt-2">
                  <h4 dir="auto" className={`text-sm font-bold transition-colors ${
                    isActive ? "text-white" :
                    isCompleted ? "text-slate-300" :
                    "text-slate-500"
                  }`}>
                    {step.label}
                  </h4>
                  <p dir="auto" className={`text-xs transition-colors mt-0.5 ${
                    isActive ? "text-brand-blue-300" :
                    "text-slate-600"
                  }`}>
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
