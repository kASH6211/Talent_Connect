"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

interface Props {
  children: React.ReactNode;
}

export default function AuthWrapper({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, role, loading } = useAuth();

  // Prevent multiple redirects in the same effect run
  // const hasRedirected = useRef(false);

  const getDashboardRoute = (userRole: string = "") => {
    const r = userRole.toLowerCase();
    switch (r) {
      case "superadmin":
        return "/admin/dashboard";
      case "institute":
        return "/institute/dashboard";
      case "industry":
        return "/industry/dashboard";
      default:
        return "/";
    }
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted || loading) return;

    const token = localStorage.getItem("tc_token");

    const publicRoutes = ["/", "/login", "/signup", "/forgot-password"];
    const isPublicRoute = publicRoutes.includes(pathname);

    if (token) {
      if (isPublicRoute) {
        const target = getDashboardRoute(role || user?.role || "");
        if (pathname !== target) {
          router.replace(target);
        }
      }
    } else {
      if (!isPublicRoute) {
        router.replace("/login");
      }
    }
  }, [pathname, user, role, loading, mounted]);

  // ── Render logic ───────────────────────────────────────────────────────

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  const token = localStorage.getItem("tc_token");

  if (!token && !["/", "/login"].includes(pathname)) {
    return null; // or a minimal "Redirecting..." message
  }

  // Normal render
  return <>{children}</>;
}
