"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { getStoredUser, TokenPayload } from "@/lib/auth";

// Global cache (module-level)
let _cachedUser: TokenPayload | null | undefined = undefined;

export function clearAuthCache() {
  _cachedUser = undefined;
}

export function useAuth() {
  const router = useRouter();
  const hasChecked = useRef(false);

  // Try to read synchronously first (no loading flicker)
  const initialUser = _cachedUser !== undefined ? _cachedUser : getStoredUser();

  const [user, setUser] = useState<TokenPayload | null>(initialUser);
  const [loading, setLoading] = useState(initialUser === undefined);

  useEffect(() => {
    // Only run once — prevent double-check
    if (hasChecked.current) return;
    hasChecked.current = true;

    // If we already have user synchronously, no need to re-check
    if (_cachedUser !== undefined) {
      setUser(_cachedUser);
      setLoading(false);
      return;
    }

    // Otherwise, read from storage (fallback)
    const payload = getStoredUser();
    _cachedUser = payload;
    setUser(payload);
    setLoading(false);
  }, []);

  const logout = () => {
    _cachedUser = null;
    localStorage.removeItem("tc_token");
    clearAuthCache();
    router.replace("/");
  };

  return {
    user,
    loading,
    role: user?.role ?? null,
    isAdmin: user?.role === "admin",
    isInstitute: user?.role === "institute",
    isIndustry: user?.role === "industry",
    logout,
  };
}
