// src/store/useUserStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: "user" | "company";
  companyCategory?: string;
  photo?: string;
}

interface UserState {
  user: UserProfile | null;
  isLoggedIn: boolean;
  setUser: (user: UserProfile | null) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isLoggedIn: false,
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
    }
  )
);
