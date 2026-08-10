"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Mail, Lock, User, Shield, Wrench, Loader2 } from "lucide-react";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { signIn, getSession } from "next-auth/react";

type Role = "CLIENT" | "PROVIDER" | "ADMIN";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("CLIENT");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const roles = [
    { id: "CLIENT", label: "Client", icon: User },
    { id: "PROVIDER", label: "Provider", icon: Wrench },
    { id: "ADMIN", label: "Admin", icon: Shield },
  ] as const;

  const handleQuickFill = (selectedRole: Role) => {
    setRole(selectedRole);
    if (selectedRole === "CLIENT") {
      setEmail("client@quickhandy.com");
      setPassword("Test@1234");
    } else if (selectedRole === "PROVIDER") {
      setEmail("provider@quickhandy.com");
      setPassword("Test@1234");
    } else {
      setEmail("admin@quickhandy.com");
      setPassword("Test@1234");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!email || !password) {
        throw new Error("Please fill in all fields.");
      }

      const response = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (response?.error) {
        throw new Error("Invalid email or password. Please check your credentials.");
      }
      
      // Get real session to route based on actual role from DB
      const session = await getSession();
      const actualRole = (session?.user as any)?.role || role;
      
      toast.success(`Welcome back! Signed in as ${actualRole.charAt(0) + actualRole.slice(1).toLowerCase()}`);

      // Route based on actual DB role
      if (actualRole === "CLIENT") {
        router.push("/dashboard/client");
      } else if (actualRole === "PROVIDER") {
        router.push("/dashboard/provider");
      } else if (actualRole === "ADMIN") {
        router.push("/dashboard/admin");
      } else {
        router.push("/dashboard/client");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to authenticate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl p-8 flex flex-col gap-8">
        
        {/* Segmented Control */}
        <div className="flex bg-slate-900/80 p-1.5 rounded-xl border border-slate-700/50 relative">
          {roles.map((r) => {
            const Icon = r.icon;
            const isActive = role === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setRole(r.id)}
                className={`flex-1 relative flex flex-col items-center justify-center py-2.5 z-10 transition-colors duration-300 ${
                  isActive ? "text-white" : "text-slate-400 hover:text-slate-300"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-blue-500 rounded-lg shadow-md"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon className={`w-5 h-5 mb-1 z-10 relative ${isActive ? "text-white" : "text-slate-500"}`} />
                <span className="text-xs font-semibold z-10 relative">{r.label}</span>
              </button>
            );
          })}
        </div>

        {/* Demo Account Auto-Fill */}
        <div className="bg-slate-900/40 rounded-xl p-4 border border-slate-700/30">
          <p dir="auto" className="text-xs font-semibold text-blue-400 mb-3 uppercase tracking-wider">Demo Account Click-to-Fill:</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleQuickFill("CLIENT")}
              type="button"
              className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-md transition-colors"
            >
              Client Demo
            </button>
            <button
              onClick={() => handleQuickFill("PROVIDER")}
              type="button"
              className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-md transition-colors"
            >
              Provider Demo
            </button>
            <button
              onClick={() => handleQuickFill("ADMIN")}
              type="button"
              className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-md transition-colors"
            >
              Admin Demo
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          {/* Email Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-500 transition-colors">
                <Mail className="w-5 h-5" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-slate-900/50 border border-slate-700 text-slate-100 rounded-xl ps-11 pe-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-600"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Password
              </label>
              <button type="button" onClick={() => toast.info("Forgot password feature in development")} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                Forgot?
              </button>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-500 transition-colors">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900/50 border border-slate-700 text-slate-100 rounded-xl ps-11 pe-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-600"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In as {role.charAt(0) + role.slice(1).toLowerCase()}</span>
                <ArrowRight className="w-5 h-5 rtl:rotate-180" />
              </>
            )}
          </button>

          <div className="text-center mt-2">
            <span className="text-sm text-slate-400">
              Don't have an account?{" "}
              <Link href="/signup" className="text-blue-400 hover:text-blue-300 font-medium">
                Sign Up
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
