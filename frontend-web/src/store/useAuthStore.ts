"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface UserProfile {
  id: string;
  phone: string;
  display_name: string | null;
  location: string;
  bank_name: string | null;
  bank_account_number: string | null;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  userStatus: string | null; // trial_active, trial_expired, subscribed_active, subscription_expired
  profile: UserProfile | null;
  setTokens: (access: string, refresh: string) => void;
  setUserStatus: (status: string) => void;
  setProfile: (profile: UserProfile) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      userStatus: null,
      profile: null,
      setTokens: (access, refresh) => set({ accessToken: access, refreshToken: refresh }),
      setUserStatus: (status) => set({ userStatus: status }),
      setProfile: (profile) => set({ profile }),
      clearSession: () => set({ accessToken: null, refreshToken: null, userStatus: null, profile: null }),
    }),
    {
      name: "fitnaija-auth-store",
      storage: createJSONStorage(() => window.localStorage),
    }
  )
);
