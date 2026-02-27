"use client";
import { ReactNode, useState } from "react";
import Sidebar from "./Sidebar";
import { usePathname } from "next/navigation";
import AuthWrapper from "@/lib/AuthWrapper";

export default function AppShell({
  children,
  showSidebar = true,
}: {
  children: ReactNode;
  showSidebar?: boolean;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  const home = pathname === "/";

  if (isLoginPage || home) {
    return <>{children}</>;
  }

  return (
    <AuthWrapper>
      <div className="flex h-screen w-screen overflow-hidden">
        {showSidebar && (
          <Sidebar
            collapsed={sidebarCollapsed}
            setCollapsed={setSidebarCollapsed}
          />
        )}

        <main
          className={`
        flex-1 transition-all duration-500 ease-in-out overflow-auto
        bg-gray-50
        pt-6 sm:pt-8 lg:pt-10               // ← top padding (responsive)
        px-4 sm:px-6 lg:px-8 xl:px-10       // ← left/right padding (responsive)
      `}
          style={{
            marginLeft: showSidebar
              ? sidebarCollapsed
                ? "88px"
                : "260px"
              : "0px",
          }}
        >
          {children}
        </main>
      </div>
    </AuthWrapper>
  );
}
