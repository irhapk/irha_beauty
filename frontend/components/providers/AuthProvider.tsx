"use client";

import { useEffect } from "react";

import { fetchCurrentUser } from "@/lib/api";
import { useAuthStore } from "@/store";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((s) => s.setUser);
  const clearUser = useAuthStore((s) => s.clearUser);
  const setLoading = useAuthStore((s) => s.setLoading);

  useEffect(() => {
    async function init(): Promise<void> {
      setLoading(true);
      try {
        const user = await fetchCurrentUser();
        setUser(user);
      } catch {
        clearUser();
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [setUser, clearUser, setLoading]);

  return <>{children}</>;
}
