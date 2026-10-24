"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Wrench, User, Lock, Mail, Phone, Upload, Check, ShieldCheck, Home, ArrowLeft } from "lucide-react";
import { signIn } from "next-auth/react";
import { useLanguageStore } from "@/store/useLanguageStore";
import { dictionary } from "@/locales/dictionary";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function SignupPage() {
  const router = useRouter();
  const language = useLanguageStore((state) => state.language);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const currentLang = mounted ? language : "ar";
  const t = dictionary[currentLang]?.auth?.signup || dictionary.ar.auth.signup;

  const [role, setRole] = useState<"CLIENT" | "PROVIDER">("CLIENT");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  
  // Provider fields
  const [category, setCategory] = useState("Plumbing");
  const [license, setLicense] = useState("");
  const [fileName, setFileName] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileName(e.target.files[0].name);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!name || !email || !password || !phone) {
      setError(t.fillBasic);
      setLoading(false);
      return;
    }

    if (role === "PROVIDER" && (!license || !fileName)) {
      setError(t.kycRequired);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password, role, category, license }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || (language === "ar" ? "فشل إنشاء الحساب" : "Failed to register"));
      }

      const signInResponse = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInResponse?.error) {
        throw new Error(language === "ar" ? "تم التسجيل ولكن تعذر تسجيل الدخول التلقائي." : "Registration successful, but failed to log in.");
      }

      setLoading(false);
      setSuccess(true);

      setTimeout(() => {
        if (role === "CLIENT") {
          router.push("/dashboard/client");
        } else {
          router.push("/dashboard/provider");
        }
      }, 1000);
    } catch (err: any) {
      setError(err.message || (language === "ar" ? "فشل إنشاء الحساب" : "Failed to register"));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden bg-slate-950">
      {/* Top Floating Navigation */}
      <div className="fixed top-4 sm:top-6 inset-x-4 sm:inset-x-8 z-30 flex items-center justify-between pointer-events-none">
        <Link
          href="/"
          className="pointer-events-auto flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 shadow-xl backdrop-blur-md transition-all text-xs sm:text-sm font-medium group active:scale-95"
          title={t.backToHome}
        >
          <ArrowLeft className="w-4 h-4 rtl:rotate-180 group-hover:-translate-x-1 rtl:group-hover:translate-x-1 transition-transform" />
          <Home className="w-4 h-4 text-brand-blue-400 group-hover:text-brand-blue-300" />
          <span>{t.backToHome}</span>
        </Link>

        <div className="pointer-events-auto">
          <LanguageSwitcher />
        </div>
      </div>

      {/* Background blobs */}
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-brand-blue-950/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-orange-950/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-lg z-10 my-8">
        {/* Branding */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-3">
            <div className="p-2.5 bg-gradient-to-tr from-brand-blue-600 to-brand-orange-500 rounded-xl shadow-lg">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-white">
              Quick<span className="text-brand-orange-500">Handy</span>
            </span>
          </Link>
          <h2 dir="auto" className="text-2xl font-bold text-white">{t.createAccount}</h2>
          <p dir="auto" className="text-sm text-slate-400 mt-1">{t.subtitle}</p>
        </div>

        {/* Signup Card */}
        <div className="glass-panel rounded-2xl p-6 md:p-8 shadow-2xl border border-slate-800">
          {/* Role Selector */}
          <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-900/80 rounded-xl mb-6 border border-slate-800/60">
            <button
              type="button"
              onClick={() => { setRole("CLIENT"); setError(""); }}
              className={`py-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                role === "CLIENT"
                  ? "bg-brand-blue-600 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <User className="w-4 h-4" />
              <span>{t.clientTab}</span>
            </button>
            <button
              type="button"
              onClick={() => { setRole("PROVIDER"); setError(""); }}
              className={`py-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                role === "PROVIDER"
                  ? "bg-brand-orange-500 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>{t.providerTab}</span>
            </button>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-lg text-center">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-xs p-3 rounded-lg flex items-center justify-center gap-2">
                <Check className="w-4 h-4 animate-bounce" />
                <span>{language === "ar" ? "تم إنشاء الحساب بنجاح! جاري تحويلك..." : "Account Created! Redirecting straight to your dashboard..."}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 tracking-wider mb-1.5">
                  {t.fullName}
                </label>
                <div className="relative">
                  <User className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full ps-10 pe-4 py-2.5 rounded-xl glass-input text-sm"
                    placeholder={language === "ar" ? "محمد أحمد" : "John Doe"}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 tracking-wider mb-1.5">
                  {t.phone}
                </label>
                <div className="relative">
                  <Phone className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full ps-10 pe-4 py-2.5 rounded-xl glass-input text-sm"
                    placeholder="01012345678"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 tracking-wider mb-1.5">
                {t.email}
              </label>
              <div className="relative">
                <Mail className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full ps-10 pe-4 py-2.5 rounded-xl glass-input text-sm"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 tracking-wider mb-1.5">
                {t.password}
              </label>
              <div className="relative">
                <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full ps-10 pe-4 py-2.5 rounded-xl glass-input text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* SERVICE PROVIDER ADDITIONAL FIELDS (KYC verification) */}
            {role === "PROVIDER" && (
              <div className="border-t border-slate-800/80 pt-4 mt-4 space-y-4 animate-fadeIn">
                <div className="flex items-center gap-2 text-brand-orange-500 text-xs font-bold uppercase tracking-wider mb-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{language === "ar" ? "بيانات التحقق والمهنة (KYC)" : "KYC Professional Credentials"}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 tracking-wider mb-1.5">
                      {t.category}
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl glass-input text-sm bg-slate-900"
                    >
                      <option value="Plumbing">{currentLang === "ar" ? "سباكة (سباك)" : "Plumbing (Plumber)"}</option>
                      <option value="Electrical">{currentLang === "ar" ? "كهرباء (كهربائي)" : "Electrical (Electrician)"}</option>
                      <option value="Carpentry">{currentLang === "ar" ? "نجارة (نجار)" : "Carpentry (Carpenter)"}</option>
                      <option value="HVAC">{currentLang === "ar" ? "تكييف وتبريد (فني تكييف)" : "HVAC (AC Technician)"}</option>
                      <option value="Appliance Repair">{currentLang === "ar" ? "صيانة أجهزة منزلية" : "Appliance Repair"}</option>
                      <option value="Nursing">{currentLang === "ar" ? "خدمات تمريض ورعاية صحية (تمريض منزلي)" : "Home Nursing & Healthcare"}</option>
                      <option value="Pharmacy">{currentLang === "ar" ? "صيدليات ومستلزمات علاجية (صيدلي)" : "Pharmacy & Medical Supplies"}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 tracking-wider mb-1.5">
                      {t.license}
                    </label>
                    <input
                      type="text"
                      value={license}
                      onChange={(e) => setLicense(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                      placeholder={language === "ar" ? "رقم القومي / الترخيص" : "LIC-98765-USA"}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 tracking-wider mb-1.5">
                    {t.uploadKyc}
                  </label>
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-800 hover:border-brand-orange-500/50 rounded-xl cursor-pointer transition-colors bg-slate-950/40">
                    <div className="flex flex-col items-center justify-center pt-3 pb-3">
                      <Upload className="w-6 h-6 text-slate-500 mb-1" />
                      <p dir="auto" className="text-xs text-slate-400">
                        {fileName ? (
                          <span className="text-brand-orange-400 font-semibold">{fileName}</span>
                        ) : (
                          language === "ar" ? "اضغط لرفع بطاقة الهوية أو مستند المهنة" : "Click to upload KYC documents"
                        )}
                      </p>
                      <p dir="auto" className="text-[9px] text-slate-500 mt-0.5">PDF, PNG, JPG (10MB)</p>
                    </div>
                    <input type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileChange} />
                  </label>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || success}
              className={`w-full py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all shadow-lg mt-6 ${
                role === "CLIENT"
                  ? "bg-gradient-to-r from-brand-blue-600 to-brand-blue-500 hover:from-brand-blue-500 hover:to-brand-blue-400 shadow-brand-blue-500/20"
                  : "bg-gradient-to-r from-brand-orange-600 to-brand-orange-500 hover:from-brand-orange-500 hover:to-brand-orange-400 shadow-brand-orange-500/20"
              } disabled:opacity-50`}
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span>{t.registerButton}</span>
              )}
            </button>
          </form>

          <div className="text-center mt-6 pt-4 border-t border-slate-800/80">
            <p dir="auto" className="text-xs text-slate-400">
              {t.haveAccount}{" "}
              <Link href="/login" className="text-brand-blue-400 hover:text-brand-blue-300 font-semibold ms-1">
                {t.signIn}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
