"use client";

import { useEffect, useRef } from "react";
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
  const hasRedirected = useRef(false);

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

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Wait until auth state is settled
    if (loading) return;

    if (hasRedirected.current) return;

    const token = localStorage.getItem("tc_token");

    // Public routes that authenticated users should not access
    const publicRoutes = ["/", "/login", "/signup", "/forgot-password"];
    const isPublicRoute = publicRoutes.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`),
    );

    if (token && user) {
      // ── User is logged in ───────────────────────────────────────────────
      if (isPublicRoute) {
        const target = getDashboardRoute(role || "");

        // Prevent redirect loop if already on correct dashboard
        if (pathname !== target) {
          hasRedirected.current = true;
          router.replace(target);
        }
      }
    } else {
      if (!isPublicRoute) {
        sessionStorage.setItem("redirectAfterLogin", pathname);
        router.replace("/login");
      }
    }
  }, [router, pathname, user, role, loading]);

  // ── Render logic ───────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  const token =
    typeof window !== "undefined" ? localStorage.getItem("tc_token") : null;

  if (!token && !["/", "/login"].includes(pathname)) {
    return null; // or a minimal "Redirecting..." message
  }

  // Normal render
  return <>{children}</>;
}
