"use client";

import { useEffect, useRef } from "react";
import { useUserStore } from "@/store/useUserStore";

export default function AppUserBootstrap() {
  const setUser = useUserStore((state) => state.setUser);
  const hasHydrated = useUserStore((state) => state._hasHydrated);

  const loadedRef = useRef(false);

  useEffect(() => {
    // prevent double execution (Strict Mode)
    if (!hasHydrated || loadedRef.current) return;
    loadedRef.current = true;

    const loadUser = async () => {
      try {
        const res = await fetch("/api/me", {
          credentials: "include",
        });

        if (!res.ok) {
          setUser(null);
          return;
        }

        const data = await res.json();
        setUser(data.user ?? null);
      } catch {
        setUser(null);
      }
    };

    loadUser();
  }, [hasHydrated, setUser]);

  return null;
}
