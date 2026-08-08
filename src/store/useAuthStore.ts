import { create } from "zustand";
import Cookies from "js-cookie";
import type { User } from "@/types/api";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: Cookies.get("auth_token") || null,
  isAuthenticated: !!Cookies.get("auth_token"),

  login: (user: User, token: string) => {
    // Save token to cookies (expires in 7 days, adjust as needed)
    Cookies.set("auth_token", token, { expires: 7, secure: true, sameSite: "strict" });
    
    set({
      user,
      token,
      isAuthenticated: true,
    });
  },

  logout: () => {
    // Remove token from cookies
    Cookies.remove("auth_token");
    
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },

  setUser: (user: User) => {
    set({ user });
  },
}));
