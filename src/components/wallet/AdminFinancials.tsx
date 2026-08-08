"use client";

import React from "react";
import { DollarSign, TrendingUp, TrendingDown, Activity, ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function AdminFinancials() {
  const stats = {
    grossVolume: 124500.00,
    platformProfit: 24900.00, // 20% cut
    payoutsPending: 18450.00,
    activeDisputes: 1200.00
  };

  const ledger = [
    { id: "1", type: "COMMISSION", desc: "20% Cut - Order #1024", amount: 80.00, date: "Today, 14:30" },
    { id: "2", type: "COMMISSION", desc: "20% Cut - Order #1023", amount: 50.00, date: "Today, 11:15" },
    { id: "3", type: "PAYOUT", desc: "Provider Payout - Eng. Mohamed Romy", amount: -800.00, date: "Yesterday, 09:00" },
    { id: "4", type: "COMMISSION", desc: "20% Cut - Order #1021", amount: 120.00, date: "Yesterday, 16:45" },
    { id: "5", type: "REFUND", desc: "Client Refund - Order #1012", amount: -300.00, date: "June 25, 2026" },
  ];

  return (
    <div className="space-y-6">
      
      {/* Financial KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-green-900/40 to-slate-900 border border-green-500/30">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-green-400" />
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Gross Volume</span>
          </div>
          <h2 dir="auto" className="text-2xl font-extrabold text-white">{stats.grossVolume.toLocaleString()} <span className="text-sm font-medium text-slate-500">EGP</span></h2>
        </div>
        
        <div className="p-5 rounded-2xl bg-gradient-to-br from-brand-blue-900/40 to-slate-900 border border-brand-blue-500/30">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-brand-blue-400" />
            <span className="text-[10px] uppercase font-bold text-slate-400">Platform Profit (20%)</span>
          </div>
          <h2 dir="auto" className="text-2xl font-extrabold text-white">{stats.platformProfit.toLocaleString()} <span className="text-sm font-medium text-slate-500">EGP</span></h2>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-brand-orange-400" />
            <span className="text-[10px] uppercase font-bold text-slate-400">Pending Payouts</span>
          </div>
          <h2 dir="auto" className="text-2xl font-extrabold text-white">{stats.payoutsPending.toLocaleString()} <span className="text-sm font-medium text-slate-500">EGP</span></h2>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-red-400" />
            <span className="text-[10px] uppercase font-bold text-slate-400">Funds in Dispute</span>
          </div>
          <h2 dir="auto" className="text-2xl font-extrabold text-white">{stats.activeDisputes.toLocaleString()} <span className="text-sm font-medium text-slate-500">EGP</span></h2>
        </div>
      </div>

      {/* Main Ledger */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 dir="auto" className="text-sm font-bold text-white">Platform Master Ledger</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-start border-collapse">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="py-3 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Transaction ID</th>
                <th className="py-3 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</th>
                <th className="py-3 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Description</th>
                <th className="py-3 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Type</th>
                <th className="py-3 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-end">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {ledger.map((row) => (
                <tr key={row.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4 text-xs font-mono text-slate-500">TXN-{row.id}982A</td>
                  <td className="py-3 px-4 text-xs text-slate-400">{row.date}</td>
                  <td className="py-3 px-4 text-xs font-bold text-white">{row.desc}</td>
                  <td className="py-3 px-4">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${
                      row.type === "COMMISSION" ? "bg-brand-blue-500/10 text-brand-blue-400 border-brand-blue-500/20" :
                      row.type === "PAYOUT" ? "bg-slate-800 text-slate-400 border-slate-700" :
                      "bg-red-500/10 text-red-400 border-red-500/20"
                    }`}>
                      {row.type}
                    </span>
                  </td>
                  <td className={`py-3 px-4 text-sm font-bold text-end flex items-center justify-end gap-1 ${
                    row.amount > 0 ? "text-green-500" : "text-white"
                  }`}>
                    {row.amount > 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5 text-red-500" />}
                    {Math.abs(row.amount).toFixed(2)} EGP
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
