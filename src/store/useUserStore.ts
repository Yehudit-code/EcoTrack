import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: "user" | "company";
  companyCategory?: string;
  phone?: string;
  birthDate?: string;
  photo?: string;
  createdAt?: string;
  companies?: {
    electricity?: string;
    water?: string;
    transport?: string;
    recycling?: string;
    solar?: string;
  };
    bankName?: string;
  branch?: string;
  accountNumber?: string;
  accountOwner?: string;
}

interface UserState {
  user: UserProfile | null;
  isLoggedIn: boolean;
  _hasHydrated: boolean;
  setUser: (user: UserProfile | null) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isLoggedIn: false,
      _hasHydrated: false,

      setUser: (user) =>
        set({
          user,
          isLoggedIn: !!user,
        }),

      logout: () =>
        set({
          user: null,
          isLoggedIn: false,
        }),
    }),
    {
      name: "ecotrack-user",
      onRehydrateStorage: () => (state) => {
        if (state) state._hasHydrated = true;
      },
    }
  )
);
