"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  username: string;
  role: string;
  is_passwordchanged: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  role: string;
  loading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for token in URL (SSO Callback)
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get("token");

    if (urlToken) {
      try {
        // Simple JWT decode (payload is the second part)
        const base64Url = urlToken.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        );
        const decoded = JSON.parse(jsonPayload);

        // Construct user object from token payload
        const ssoUser = {
          id: decoded.sub,
          username: decoded.username,
          role: decoded.role,
          industry_id: decoded.industry_id,
          institute_id: decoded.institute_id,
          is_passwordchanged: decoded.is_passwordchanged || 'Y',
        };

        login(ssoUser, urlToken);

        // Clean up URL
        const newUrl = window.location.pathname;
        window.history.replaceState({}, "", newUrl);
      } catch (e) {
        console.error("Failed to process SSO token", e);
      }
    }

    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("tc_token");

    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  /* 
  useEffect(() => {
    if (!loading && user && user.is_passwordchanged === 'N') {
      const path = window.location.pathname;
      if (path !== '/change-password' && path !== '/login' && path !== '/') {
        router.replace('/change-password');
      }
    }
  }, [user, loading, router]);
  */

  const login = (user: User, token: string) => {
    localStorage.setItem("tc_token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem("tc_token");
    localStorage.removeItem("user");
    setUser(null);
    // Hard reload ensures all in-memory state (React Query, Redux) is cleared
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || "",
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};
