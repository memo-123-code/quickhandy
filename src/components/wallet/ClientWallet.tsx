"use client";

import React, { useState } from "react";
import { CreditCard, Plus, Clock, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function ClientWallet() {
  const [balance, setBalance] = React.useState(0.00);
  
  React.useEffect(() => {
    api.get("/wallet/balance").then((res) => {
      if (res.data?.balance !== undefined) setBalance(res.data.balance);
    }).catch(console.error);
  }, []);

  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topUpAmount) return;
    
    setIsProcessing(true);
    try {
      await api.post("/wallet/topup", { amount: parseFloat(topUpAmount) });
      setBalance(prev => prev + parseFloat(topUpAmount));
      toast.success(`Successfully added ${topUpAmount} EGP to wallet!`);
      setIsTopUpModalOpen(false);
      setTopUpAmount("");
    } catch (error) {
      toast.error("Failed to process top-up");
    } finally {
      setIsProcessing(false);
    }
  };

  const transactions = [
    { id: "1", date: "June 25, 2026", amount: 400.00, type: "PAYMENT", desc: "Electrical Service - Mohamed Romy" },
    { id: "2", date: "June 22, 2026", amount: 1000.00, type: "TOPUP", desc: "Added via Visa ending in 1234" },
    { id: "3", date: "June 10, 2026", amount: 250.00, type: "PAYMENT", desc: "Plumbing Service - Ali G." },
  ];

  return (
    <div className="space-y-6">
      {/* Wallet Balance Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-brand-blue-900 to-slate-900 border border-brand-blue-500/30 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1 text-center sm:text-start">
          <span className="text-[10px] uppercase font-bold text-brand-blue-300 tracking-wider">Current Balance</span>
          <h2 dir="auto" className="text-3xl font-extrabold text-white">{balance.toFixed(2)} EGP</h2>
        </div>
        <button
          onClick={() => setIsTopUpModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-brand-blue-600 hover:bg-brand-blue-500 font-extrabold text-sm rounded-xl text-white shadow-lg shadow-brand-blue-500/20 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" /> Top-Up Wallet
        </button>
      </div>

      {/* Transaction History */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 dir="auto" className="text-sm font-bold text-white">Recent Transactions</h3>
          <button onClick={() => toast.info("View All transactions feature in development")} className="text-xs font-bold text-brand-blue-400 hover:underline">View All</button>
        </div>
        
        <div className="space-y-3">
          {transactions.map((tx) => (
            <div key={tx.id} className="p-4 rounded-xl bg-slate-950 border border-slate-850 flex justify-between items-center hover:border-slate-750 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  tx.type === "TOPUP" ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"
                }`}>
                  {tx.type === "TOPUP" ? <ArrowUpRight className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                </div>
                <div>
                  <h4 dir="auto" className="text-xs font-bold text-white">{tx.desc}</h4>
                  <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-500">
                    <Clock className="w-3 h-3" /> {tx.date}
                  </div>
                </div>
              </div>
              <span className={`text-sm font-bold ${tx.type === "TOPUP" ? "text-green-500" : "text-white"}`} dir="ltr">
                {tx.type === "TOPUP" ? "+" : "-"}{tx.amount.toFixed(2)} EGP
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Mock Top-Up Modal */}
      {isTopUpModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl animate-scaleUp">
            <h3 dir="auto" className="text-base font-bold text-white mb-4">Add Funds to Wallet</h3>
            <form onSubmit={handleTopUp} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Amount (EGP)</label>
                <input 
                  type="number"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-sm text-white font-bold focus:border-brand-blue-500 focus:outline-none"
                  placeholder="Enter amount..."
                  required
                />
              </div>
              
              <div className="p-4 rounded-xl border border-brand-blue-500/50 bg-brand-blue-500/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-6 h-6 text-brand-blue-400" />
                  <div>
                    <span className="text-xs font-bold text-white block">Saved Visa</span>
                    <span className="text-[10px] text-slate-400">**** **** **** 1234</span>
                  </div>
                </div>
                <CheckCircle2 className="w-5 h-5 text-brand-blue-500" />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTopUpModalOpen(false)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-bold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing || !topUpAmount}
                  className="flex-1 py-3 bg-brand-blue-600 hover:bg-brand-blue-500 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-brand-blue-500/20 flex justify-center items-center gap-2"
                >
                  {isProcessing ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : "Confirm Top-Up"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
