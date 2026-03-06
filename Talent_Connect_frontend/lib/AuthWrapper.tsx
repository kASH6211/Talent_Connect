"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/AuthProvider";
import { getDashboardRoute } from "./helper";

export default function AuthWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, role, loading } = useAuth();

  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (loading) return;

    const publicRoutes = [
      "/",
      "/login",
      "/signup",
      "/forgot-password",
      "/contact",
    ];
    const publicRoutes = ["/", "/login", "/signup", "/forgot-password", "/search-institutes"];
    const guestOnlyRoutes = ["/login", "/signup", "/forgot-password"];
    const isPublic = publicRoutes.includes(pathname);
    const isGuestOnly = guestOnlyRoutes.includes(pathname);

    // Not logged in → block private routes
    if (!user && !isPublic) {
      router.replace("/");
      return;
    }

    // Logged in → block guest-only routes
    if (user && isGuestOnly) {
      const dashboard = getDashboardRoute(role);
      if (pathname !== dashboard) {
        router.replace(dashboard);
        return;
      }
    }

    // If no redirect needed, allow render
    setChecking(false);
  }, [user, role, loading, pathname, router]);

  // 🔒 Show spinner while checking auth OR redirecting
  if (loading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return <>{children}</>;
}
