"use client";
import { ReactNode, useState } from "react";
import Sidebar from "./Sidebar";
import { usePathname } from "next/navigation";
import Header from "./Header";

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

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {showSidebar && (
        <Sidebar
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />
      )}

      <main
        className={`flex-1 transition-all duration-500 ease-in-out overflow-auto bg-gray-50`}
        style={{
          marginLeft: showSidebar
            ? sidebarCollapsed
              ? "88px"
              : "260px"
            : "0px",
        }}
      >
        <Header />
        {children}
      </main>
    </div>
  );
}
