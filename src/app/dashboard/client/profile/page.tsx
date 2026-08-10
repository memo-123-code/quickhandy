"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, User, Calendar, ShieldCheck, Star, 
  Clock, MapPin, CreditCard, Plus, Download, 
  RotateCcw, Trash2, Shield, Heart, FileText, Check, X, Wallet
} from "lucide-react";
import AvatarUploader from "@/components/ui/AvatarUploader";
import ClientWallet from "@/components/wallet/ClientWallet";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

type ActiveTab = "PROFILE" | "ORDERS" | "PLACES" | "WALLET" | "SAFETY";

export default function ClientProfile() {
  const router = useRouter();
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<ActiveTab>("PROFILE");

  // Client Info States
  const [name, setName] = useState(session?.user?.name || "");
  const [email, setEmail] = useState(session?.user?.email || "");
  const [phone, setPhone] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  React.useEffect(() => {
    if (session?.user) {
      if (session.user.name) setName(session.user.name);
      if (session.user.email) setEmail(session.user.email);
    }
  }, [session]);

  // Saved Places State
  const [savedPlaces, setSavedPlaces] = useState<{ id: string; label: string; address: string }[]>([]);
  const [newPlaceLabel, setNewPlaceLabel] = useState("");
  const [newPlaceAddress, setNewPlaceAddress] = useState("");
  const [showAddPlace, setShowAddPlace] = useState(false);

  // Trusted Contacts State
  const [trustedContacts, setTrustedContacts] = useState<{ id: string; name: string; phone: string }[]>([]);
  const [newContactName, setNewContactName] = useState("");
  const [newContactPhone, setNewContactPhone] = useState("");
  const [showAddContact, setShowAddContact] = useState(false);

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // await api.post("/client/profile", { name, email, phone });
      setIsSaved(true);
      toast.success("Profile saved successfully");
      setTimeout(() => setIsSaved(false), 2000);
    } catch (err) {
      toast.error("Failed to save profile");
    }
  };

  const handleAddPlace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaceLabel || !newPlaceAddress) return;
    setSavedPlaces((prev) => [
      ...prev,
      { id: Date.now().toString(), label: newPlaceLabel, address: newPlaceAddress }
    ]);
    setNewPlaceLabel("");
    setNewPlaceAddress("");
    setShowAddPlace(false);
  };

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName || !newContactPhone) return;
    setTrustedContacts((prev) => [
      ...prev,
      { id: Date.now().toString(), name: newContactName, phone: newContactPhone }
    ]);
    setNewContactName("");
    setNewContactPhone("");
    setShowAddContact(false);
  };

  const handleDeletePlace = (id: string) => {
    setSavedPlaces((prev) => prev.filter((p) => p.id !== id));
  };

  const handleDeleteContact = (id: string) => {
    setTrustedContacts((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => router.push("/dashboard/client")}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-bold transition-all text-slate-300"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Portal</span>
          </button>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Client Profile</span>
        </div>

        {/* Client Hero Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-brand-blue-950/20 to-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center gap-6 shadow-xl">
          <AvatarUploader 
            onUploadSuccess={(url) => console.log("Uploaded Client Avatar:", url)} 
            size="md"
          />
          <div className="text-center sm:text-start space-y-1 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center sm:justify-start">
              <h2 dir="auto" className="text-lg font-extrabold text-white">{name}</h2>
              <span className="px-2 py-0.5 rounded bg-brand-blue-500/20 border border-brand-blue-500/30 text-brand-blue-400 text-[9px] font-bold uppercase self-center tracking-wider">
                Premium Customer
              </span>
            </div>
            <p dir="auto" className="text-xs text-slate-400">{email}</p>
            <span className="text-[10px] text-slate-500 block mt-1.5">Member since October 2025</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 overflow-x-auto gap-2 md:gap-4 scrollbar-none">
          {[
            { id: "PROFILE", label: "My Profile", labelAr: "بياناتي الشخصية" },
            { id: "ORDERS", label: "Order History", labelAr: "سجل الطلبات" },
            { id: "PLACES", label: "Saved Places", labelAr: "العناوين المحفوظة" },
            { id: "WALLET", label: "Wallet & Funds", labelAr: "المحفظة" },
            { id: "SAFETY", label: "Payment & Safety", labelAr: "الدفع والأمان" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ActiveTab)}
              className={`pb-3 text-xs font-bold transition-all border-b-2 px-1 whitespace-nowrap flex flex-col items-center gap-0.5 ${
                activeTab === tab.id 
                  ? "border-brand-blue-500 text-brand-blue-400" 
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>{tab.label}</span>
              <span className="text-[9px] font-medium opacity-60">{tab.labelAr}</span>
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="space-y-6">

          {/* TAB 1: MY PROFILE FORM */}
          {activeTab === "PROFILE" && (
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4 animate-fadeIn">
              <h3 dir="auto" className="text-sm font-bold text-white">Edit Personal Information</h3>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Full Name</label>
                    <input 
                      type="text" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-blue-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Phone Number</label>
                    <input 
                      type="text" 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-blue-500"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Email Address</label>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-brand-blue-600 hover:bg-brand-blue-500 text-xs font-bold text-white rounded-lg transition-colors"
                  >
                    Save Profile Settings
                  </button>
                  {isSaved && (
                    <span className="text-xs text-green-400 font-bold flex items-center gap-1">
                      <Check className="w-4 h-4" /> Settings Saved
                    </span>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: COMPREHENSIVE ORDER HISTORY */}
          {activeTab === "ORDERS" && (
            <div className="space-y-4 animate-fadeIn">
              <h3 dir="auto" className="text-sm font-bold text-white">Your Past Bookings</h3>
              <div className="space-y-3 max-h-[420px] overflow-y-auto pe-1">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center text-slate-400 text-xs">
                  No past bookings found.
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SAVED PLACES */}
          {activeTab === "PLACES" && (
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-5 animate-fadeIn">
              <div className="flex justify-between items-center">
                <h3 dir="auto" className="text-sm font-bold text-white">Your Addresses</h3>
                <button
                  onClick={() => setShowAddPlace(!showAddPlace)}
                  className="flex items-center gap-1 text-xs font-bold text-brand-blue-400 hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" /> Add New
                </button>
              </div>

              {showAddPlace && (
                <form onSubmit={handleAddPlace} className="p-4 rounded-lg bg-slate-950 border border-slate-850 space-y-3 animate-slideDown">
                  <div className="grid grid-cols-3 gap-2">
                    <input 
                      type="text" 
                      placeholder="Label (e.g. Home 🏠)" 
                      value={newPlaceLabel}
                      onChange={(e) => setNewPlaceLabel(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-md px-3 py-1.5 text-xs text-white"
                    />
                    <input 
                      type="text" 
                      placeholder="Full Address" 
                      value={newPlaceAddress}
                      onChange={(e) => setNewPlaceAddress(e.target.value)}
                      className="col-span-2 bg-slate-900 border border-slate-800 rounded-md px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button 
                      type="button" 
                      onClick={() => setShowAddPlace(false)}
                      className="px-3 py-1 bg-slate-900 text-[10px] rounded hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="px-3 py-1 bg-brand-blue-600 text-[10px] rounded text-white hover:bg-brand-blue-500"
                    >
                      Save Place
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-3.5">
                {(savedPlaces || []).map((place) => (
                  <div key={place.id} className="p-3.5 rounded-lg bg-slate-950 border border-slate-850 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-brand-blue-400" />
                      <div>
                        <span className="text-xs font-bold text-slate-200 block">{place.label}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{place.address}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeletePlace(place.id)}
                      className="p-1.5 text-slate-500 hover:text-red-400 rounded hover:bg-slate-900 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: WALLET */}
          {activeTab === "WALLET" && (
            <div className="animate-fadeIn">
              <ClientWallet />
            </div>
          )}

          {/* TAB 5: PAYMENT & SAFETY */}
          {activeTab === "SAFETY" && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Payment Methods */}
              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
                <h3 dir="auto" className="text-sm font-bold text-white">Payment Option Toggles</h3>
                <div className="space-y-2">
                  {[
                    { id: "cash", label: "Cash on Service Completed", desc: "Pay worker directly" },
                    { id: "card", label: "Saved Visa Card (**** 1234)", desc: "Quick checkout via digital gateway" },
                  ].map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`w-full p-4 rounded-lg border text-start flex justify-between items-center transition-all ${
                        paymentMethod === method.id 
                          ? "border-brand-blue-500 bg-brand-blue-500/5 text-white" 
                          : "border-slate-850 bg-slate-950 text-slate-400"
                      }`}
                    >
                      <div>
                        <span className="text-xs font-bold block">{method.label}</span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">{method.desc}</span>
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        paymentMethod === method.id ? "border-brand-blue-400" : "border-slate-750"
                      }`}>
                        {paymentMethod === method.id && <div className="w-2 h-2 bg-brand-blue-400 rounded-full" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Trusted Contacts for Safety */}
              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-5">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 dir="auto" className="text-sm font-bold text-white">Safety Feature: Trusted Contacts</h3>
                    <p dir="auto" className="text-[10px] text-slate-500 mt-0.5">Automatically share emergency booking details and live coordinates.</p>
                  </div>
                  <button
                    onClick={() => setShowAddContact(!showAddContact)}
                    className="flex items-center gap-1 text-xs font-bold text-brand-blue-400 hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Contact
                  </button>
                </div>

                {showAddContact && (
                  <form onSubmit={handleAddContact} className="p-4 rounded-lg bg-slate-950 border border-slate-850 space-y-3 animate-slideDown">
                    <div className="grid grid-cols-2 gap-2">
                      <input 
                        type="text" 
                        placeholder="Name (e.g. Sarah Wife)" 
                        value={newContactName}
                        onChange={(e) => setNewContactName(e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded-md px-3 py-1.5 text-xs text-white"
                      />
                      <input 
                        type="text" 
                        placeholder="Phone Number" 
                        value={newContactPhone}
                        onChange={(e) => setNewContactPhone(e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded-md px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button 
                        type="button" 
                        onClick={() => setShowAddContact(false)}
                        className="px-3 py-1 bg-slate-900 text-[10px] rounded hover:bg-slate-800"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="px-3 py-1 bg-brand-blue-600 text-[10px] rounded text-white hover:bg-brand-blue-500"
                      >
                        Save Contact
                      </button>
                    </div>
                  </form>
                )}

                <div className="space-y-3">
                  {(trustedContacts || []).map((contact) => (
                    <div key={contact.id} className="p-3.5 rounded-lg bg-slate-950 border border-slate-850 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Heart className="w-4 h-4 text-red-400" />
                        <div>
                          <span className="text-xs font-bold text-slate-200 block">{contact.name}</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">{contact.phone}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDeleteContact(contact.id)}
                        className="p-1.5 text-slate-500 hover:text-red-400 rounded hover:bg-slate-900 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
