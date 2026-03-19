"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/AuthProvider";
import { getDashboardRoute } from "./helper";
import SpinnerFallback from "@/components/Spinner";

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
      "/search-institutes",
      "/about"
    ];

    const isPublic = publicRoutes.includes(pathname);

    // Not logged in → block private routes
    if (!user && !isPublic) {
      router.replace("/");
      return;
    }

    // Logged in → block guest-only routes
    if (user && isPublic) {
      const guestOnlyRoutes = ["/login", "/signup", "/forgot-password"];
      const isGuestOnly = guestOnlyRoutes.includes(pathname);

      if (isGuestOnly) {
        const dashboard = getDashboardRoute(role);
        router.replace(dashboard);
        return;
      }
    }

    // If no redirect needed, allow render
    setChecking(false);
  }, [user, role, loading, pathname, router]);

  // 🔒 Show spinner while checking auth OR redirecting
  if (loading || checking) {
    return <SpinnerFallback />;
  }

  return <>{children}</>;
}
