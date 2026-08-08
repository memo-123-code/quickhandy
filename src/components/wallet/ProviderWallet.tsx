"use client";

import React, { useState } from "react";
import { Landmark, ArrowDownToLine, Clock, TrendingUp, CheckCircle2, X } from "lucide-react";
import { apiMock } from "@/services/apiMock";
import { mockEndpoints } from "@/services/mockEndpoints";
import { toast } from "sonner";

export default function ProviderWallet() {
  const [balances, setBalances] = React.useState({
    available: 0.00,
    pending: 1250.00,
    lifetime: 12800.00
  });

  React.useEffect(() => {
    mockEndpoints.getWalletBalance("provider-1").then(b => 
      setBalances(prev => ({ ...prev, available: b }))
    );
  }, []);

  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState("vodafone");
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawAmount || parseFloat(withdrawAmount) > balances.available) return;

    setIsProcessing(true);
    try {
      await apiMock.processWithdrawal(parseFloat(withdrawAmount), withdrawMethod);
      setSuccessMsg(`Successfully initiated withdrawal of ${withdrawAmount} EGP via ${withdrawMethod === 'vodafone' ? 'Vodafone Cash' : 'InstaPay'}.`);
      setTimeout(() => {
        setIsWithdrawModalOpen(false);
        setSuccessMsg("");
        setWithdrawAmount("");
      }, 3000);
    } catch (err) {
      toast.error("Withdrawal failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const ledger = [
    { id: "1", date: "Today, 2:30 PM", desc: "Living Room Rewiring", amount: 400.00, status: "AVAILABLE" },
    { id: "2", date: "Yesterday, 10:15 AM", desc: "Plumbing Leak Fix", amount: 250.00, status: "PENDING" },
    { id: "3", date: "June 25, 2026", desc: "Withdrawal to Vodafone Cash", amount: -800.00, status: "COMPLETED" },
    { id: "4", date: "June 23, 2026", desc: "AC Maintenance", amount: 600.00, status: "AVAILABLE" },
  ];

  return (
    <div className="space-y-6">
      {/* Earnings Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Available to Withdraw */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-brand-orange-900/40 to-slate-900 border border-brand-orange-500/30 flex flex-col justify-between shadow-lg relative overflow-hidden">
          <div className="absolute top-0 end-0 w-32 h-32 bg-brand-orange-500/10 rounded-full blur-3xl -me-10 -mt-10 pointer-events-none" />
          <div className="space-y-1 relative z-10">
            <span className="text-[10px] uppercase font-bold text-brand-orange-300 tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Available to Withdraw
            </span>
            <h2 dir="auto" className="text-3xl font-extrabold text-white">{balances.available.toFixed(2)} <span className="text-sm font-medium text-slate-400">EGP</span></h2>
          </div>
          <button
            onClick={() => setIsWithdrawModalOpen(true)}
            className="mt-6 w-full flex items-center justify-center gap-2 py-2.5 bg-brand-orange-600 hover:bg-brand-orange-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-brand-orange-500/20 active:scale-[0.98] relative z-10"
          >
            <ArrowDownToLine className="w-4 h-4" /> Withdraw Funds
          </button>
        </div>

        {/* Pending Clearance */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Pending Clearance
            </span>
            <h2 dir="auto" className="text-2xl font-extrabold text-white">{balances.pending.toFixed(2)} <span className="text-sm font-medium text-slate-500">EGP</span></h2>
            <p dir="auto" className="text-[9px] text-slate-500 leading-tight mt-2">Funds from recent bookings take up to 48 hours to clear for security.</p>
          </div>
        </div>

        {/* Total Earned (Lifetime) */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" /> Total Earned (Lifetime)
            </span>
            <h2 dir="auto" className="text-2xl font-extrabold text-white">{balances.lifetime.toLocaleString()} <span className="text-sm font-medium text-slate-500">EGP</span></h2>
          </div>
        </div>
      </div>

      {/* Transaction Ledger */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 dir="auto" className="text-sm font-bold text-white">Earnings & Withdrawals Ledger</h3>
        <div className="space-y-3 max-h-[400px] overflow-y-auto pe-2">
          {ledger.map((tx) => (
            <div key={tx.id} className="p-4 rounded-xl bg-slate-950 border border-slate-850 flex justify-between items-center hover:bg-slate-900 transition-colors">
              <div>
                <h4 dir="auto" className="text-xs font-bold text-white">{tx.desc}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[9px] text-slate-500">{tx.date}</span>
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                    tx.status === "AVAILABLE" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                    tx.status === "PENDING" ? "bg-brand-gold-500/10 text-brand-gold-400 border-brand-gold-500/20" :
                    "bg-slate-800 text-slate-400 border-slate-700"
                  }`}>
                    {tx.status}
                  </span>
                </div>
              </div>
              <span className={`text-sm font-bold ${tx.amount > 0 ? "text-green-500" : "text-white"}`} dir="ltr">
                {tx.amount > 0 ? "+" : ""}{tx.amount.toFixed(2)} EGP
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Withdrawal Modal */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl animate-scaleUp">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Landmark className="w-5 h-5 text-brand-orange-500" />
                <h3 dir="auto" className="text-sm font-bold text-white">Withdraw Funds</h3>
              </div>
              {!successMsg && (
                <button onClick={() => setIsWithdrawModalOpen(false)} className="text-slate-500 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {successMsg ? (
              <div className="py-6 text-center space-y-4 animate-fadeIn">
                <div className="w-16 h-16 bg-green-500/10 rounded-full border border-green-500/20 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <p dir="auto" className="text-sm font-bold text-white leading-relaxed px-4">{successMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleWithdraw} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Amount (EGP)</label>
                  <input 
                    type="number"
                    value={withdrawAmount}
                    max={balances.available}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white font-bold focus:border-brand-orange-500 focus:outline-none"
                    placeholder={`Max: ${balances.available}`}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Payout Method</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setWithdrawMethod("vodafone")}
                      className={`p-4 rounded-xl border text-xs font-bold text-center flex flex-col items-center gap-2 transition-all ${
                        withdrawMethod === "vodafone" 
                          ? "border-brand-orange-500 bg-brand-orange-500/10 text-brand-orange-400" 
                          : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      <div className={`w-3 h-3 rounded-full ${withdrawMethod === "vodafone" ? "bg-red-500" : "bg-slate-600"}`} />
                      Vodafone Cash
                    </button>
                    <button
                      type="button"
                      onClick={() => setWithdrawMethod("instapay")}
                      className={`p-4 rounded-xl border text-xs font-bold text-center flex flex-col items-center gap-2 transition-all ${
                        withdrawMethod === "instapay" 
                          ? "border-brand-orange-500 bg-brand-orange-500/10 text-brand-orange-400" 
                          : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      <div className={`w-3 h-3 rounded-full ${withdrawMethod === "instapay" ? "bg-brand-blue-500" : "bg-slate-600"}`} />
                      InstaPay
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing || !withdrawAmount || parseFloat(withdrawAmount) > balances.available}
                  className="w-full py-3.5 bg-brand-orange-600 hover:bg-brand-orange-500 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-brand-orange-500/20 flex justify-center items-center"
                >
                  {isProcessing ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : "Confirm Withdrawal"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
