"use client";

import React, { useState } from "react";
import { Landmark, ArrowDownToLine, Clock, TrendingUp, CheckCircle2, X, CreditCard, Smartphone } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function ProviderWallet() {
  const [balances, setBalances] = React.useState({
    available: 1200.00,
    pending: 0.00,
    lifetime: 0.00
  });

  React.useEffect(() => {
    api.get("/wallet/balance").then((res) => {
      if (res.data) {
        setBalances(prev => ({ 
          ...prev, 
          available: res.data.balance !== undefined ? res.data.balance : prev.available,
          pending: res.data.pending !== undefined ? res.data.pending : prev.pending,
          lifetime: res.data.lifetime !== undefined ? res.data.lifetime : prev.lifetime
        }));
      }
    }).catch(console.error);
  }, []);

  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState("VODAFONE_CASH");
  const [accountDetails, setAccountDetails] = useState("");
  const [bankName, setBankName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawAmount || parseFloat(withdrawAmount) > balances.available || !accountDetails) return;

    setIsProcessing(true);
    try {
      await api.post("/wallet/withdraw", { 
        amount: parseFloat(withdrawAmount), 
        methodType: withdrawMethod,
        accountDetails: withdrawMethod === "BANK_TRANSFER" ? `${bankName} - ${accountDetails}` : accountDetails
      });
      setBalances(prev => ({ 
        ...prev, 
        available: prev.available - parseFloat(withdrawAmount),
        pending: prev.pending + parseFloat(withdrawAmount)
      }));
      setSuccessMsg(`Successfully initiated withdrawal of ${withdrawAmount} EGP via ${withdrawMethod}.`);
      setTimeout(() => {
        setIsWithdrawModalOpen(false);
        setSuccessMsg("");
        setWithdrawAmount("");
        setAccountDetails("");
      }, 3000);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Withdrawal failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const dummyLedger = [
    { id: 1, date: "2026-09-12 14:30", desc: "Booking Payment #1024", method: "Wallet", status: "Completed", amount: 400.00, type: "incoming" },
    { id: 2, date: "2026-09-10 09:15", desc: "Withdrawal to Vodafone", method: "Vodafone Cash", status: "Pending", amount: -500.00, type: "outgoing" },
    { id: 3, date: "2026-09-08 18:00", desc: "Booking Payment #1012", method: "Wallet", status: "Completed", amount: 800.00, type: "incoming" },
  ];

  return (
    <div className="space-y-8">
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

      {/* Saved Payout Methods */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Saved Payout Methods</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#1a1d27] border border-slate-700 p-4 rounded-xl flex items-center gap-4 transition-colors cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
              <Smartphone className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="font-bold text-red-500 text-sm">Vodafone Cash</p>
              <p className="text-xs text-slate-400">010 **** **89</p>
            </div>
          </div>

          <div className="bg-[#1a1d27] border border-slate-700 p-4 rounded-xl flex items-center gap-4 transition-colors cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
              <CreditCard className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className="font-bold text-purple-500 text-sm">InstaPay</p>
              <p className="text-xs text-slate-400">mohamed***@instapay</p>
            </div>
          </div>

          <div className="bg-[#1a1d27] border border-slate-700 p-4 rounded-xl flex items-center gap-4 transition-colors cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <Landmark className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="font-bold text-blue-500 text-sm">Bank Transfer</p>
              <p className="text-xs text-slate-400">EG65 **** **** 1234</p>
              <p className="text-[10px] text-slate-500 mt-0.5">CIB Bank</p>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Ledger */}
      <div className="space-y-4 overflow-hidden pt-4">
        <h3 dir="auto" className="text-sm font-bold text-white uppercase tracking-wider">Earnings & Withdrawals Ledger</h3>
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-sm text-slate-400 bg-slate-900">
            <thead className="text-xs uppercase bg-slate-950/50 text-slate-500 border-b border-slate-800">
              <tr>
                <th className="px-4 py-4 font-semibold">Date</th>
                <th className="px-4 py-4 font-semibold">Description</th>
                <th className="px-4 py-4 font-semibold">Method</th>
                <th className="px-4 py-4 font-semibold">Status</th>
                <th className="px-4 py-4 font-semibold text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              <tr className="hover:bg-slate-800/20 transition-colors">
                <td className="px-4 py-4 whitespace-nowrap text-xs text-slate-300">12 Sept 2026</td>
                <td className="px-4 py-4 font-bold text-white">Plumbing Job #402</td>
                <td className="px-4 py-4 text-xs text-slate-300">Wallet</td>
                <td className="px-4 py-4">
                  <span className="text-[10px] font-bold px-2 py-1 rounded uppercase bg-green-500/10 text-green-400 border border-green-500/20">
                    Completed
                  </span>
                </td>
                <td className="px-4 py-4 text-right font-bold text-green-500">+ 250.00 EGP</td>
              </tr>
              <tr className="hover:bg-slate-800/20 transition-colors">
                <td className="px-4 py-4 whitespace-nowrap text-xs text-slate-300">10 Sept 2026</td>
                <td className="px-4 py-4 font-bold text-white">Withdrawal Request</td>
                <td className="px-4 py-4 text-xs text-slate-300">Vodafone Cash</td>
                <td className="px-4 py-4">
                  <span className="text-[10px] font-bold px-2 py-1 rounded uppercase bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                    Pending
                  </span>
                </td>
                <td className="px-4 py-4 text-right font-bold text-red-400">- 500.00 EGP</td>
              </tr>
              <tr className="hover:bg-slate-800/20 transition-colors">
                <td className="px-4 py-4 whitespace-nowrap text-xs text-slate-300">05 Sept 2026</td>
                <td className="px-4 py-4 font-bold text-white">Electrical Repair</td>
                <td className="px-4 py-4 text-xs text-slate-300">Wallet</td>
                <td className="px-4 py-4">
                  <span className="text-[10px] font-bold px-2 py-1 rounded uppercase bg-green-500/10 text-green-400 border border-green-500/20">
                    Completed
                  </span>
                </td>
                <td className="px-4 py-4 text-right font-bold text-green-500">+ 400.00 EGP</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Withdrawal Modal */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl animate-scaleUp">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Landmark className="w-5 h-5 text-brand-orange-500" />
                <h3 dir="auto" className="text-lg font-bold text-white">Withdraw Funds</h3>
              </div>
              {!successMsg && (
                <button onClick={() => setIsWithdrawModalOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {successMsg ? (
              <div className="py-8 text-center space-y-4 animate-fadeIn">
                <div className="w-16 h-16 bg-green-500/10 rounded-full border border-green-500/20 flex items-center justify-center mx-auto shadow-lg shadow-green-500/10">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <p dir="auto" className="text-sm font-bold text-white leading-relaxed px-4">{successMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleWithdraw} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Amount (EGP)</label>
                  <input 
                    type="number"
                    value={withdrawAmount}
                    max={balances.available}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white font-bold focus:border-brand-orange-500 focus:outline-none focus:ring-1 focus:ring-brand-orange-500 transition-all"
                    placeholder={`Max: ${balances.available}`}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Payout Method</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setWithdrawMethod("VODAFONE_CASH")}
                      className={`p-3 rounded-xl border text-xs font-bold text-center flex flex-col items-center gap-2 transition-all ${
                        withdrawMethod === "VODAFONE_CASH" 
                          ? "border-brand-orange-500 bg-brand-orange-500/10 text-brand-orange-400" 
                          : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      <div className={`w-3 h-3 rounded-full ${withdrawMethod === "VODAFONE_CASH" ? "bg-red-500" : "bg-slate-600"}`} />
                      Vodafone Cash
                    </button>
                    <button
                      type="button"
                      onClick={() => setWithdrawMethod("INSTAPAY")}
                      className={`p-3 rounded-xl border text-xs font-bold text-center flex flex-col items-center gap-2 transition-all ${
                        withdrawMethod === "INSTAPAY" 
                          ? "border-brand-orange-500 bg-brand-orange-500/10 text-brand-orange-400" 
                          : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      <div className={`w-3 h-3 rounded-full ${withdrawMethod === "INSTAPAY" ? "bg-brand-blue-500" : "bg-slate-600"}`} />
                      InstaPay
                    </button>
                    <button
                      type="button"
                      onClick={() => setWithdrawMethod("BANK_TRANSFER")}
                      className={`p-3 rounded-xl border text-xs font-bold text-center flex flex-col items-center gap-2 transition-all ${
                        withdrawMethod === "BANK_TRANSFER" 
                          ? "border-brand-orange-500 bg-brand-orange-500/10 text-brand-orange-400" 
                          : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      <div className={`w-3 h-3 rounded-full ${withdrawMethod === "BANK_TRANSFER" ? "bg-blue-500" : "bg-slate-600"}`} />
                      Bank Transfer
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                    {withdrawMethod === "BANK_TRANSFER" ? "Enter IBAN or Account Number" : "Phone Number / Account Address"}
                  </label>
                  <input 
                    type="text"
                    value={accountDetails}
                    onChange={(e) => setAccountDetails(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white font-bold focus:border-brand-orange-500 focus:outline-none focus:ring-1 focus:ring-brand-orange-500 transition-all"
                    placeholder={withdrawMethod === "BANK_TRANSFER" ? "e.g. EG65 0000 0000 1234" : "e.g. 01012345678 or user@instapay"}
                    required
                  />
                </div>

                {withdrawMethod === "BANK_TRANSFER" && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Bank Name</label>
                    <input 
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white font-bold focus:border-brand-orange-500 focus:outline-none focus:ring-1 focus:ring-brand-orange-500 transition-all"
                      placeholder="e.g. Banque Misr, CIB, NBE"
                      required
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={
                    isProcessing || 
                    !withdrawAmount || 
                    parseFloat(withdrawAmount) > balances.available || 
                    !accountDetails ||
                    (withdrawMethod === "BANK_TRANSFER" && !bankName)
                  }
                  className="w-full py-3.5 mt-2 bg-brand-orange-600 hover:bg-brand-orange-500 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-brand-orange-500/20 flex justify-center items-center active:scale-[0.98]"
                >
                  {isProcessing ? (
                    <div className="w-5 h-5 border-2 border-transparent border-t-white rounded-full animate-spin" />
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
