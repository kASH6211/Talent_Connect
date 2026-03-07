"use client";

import { ReactNode, useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { usePathname } from "next/navigation";
import AuthWrapper from "@/lib/AuthWrapper";
import { Menu } from "lucide-react";
import RoleSelectModal from "./landing-page/RoleSelectModal";
import LoginModal from "./LoginModal";
import GlobalConfirmModal from "./common/ConfirmDialogHOC";
import FastTrackOverlay from "./common/FastTrackOverlay";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { updateLoginUi } from "@/store/login";

export default function AppShell({
  children,
  showSidebar = true,
}: {
  children: ReactNode;
  showSidebar?: boolean;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();
  const ui = useSelector((state: RootState) => state.login.ui);

  const allowedRoutes = ["/login", "/", "/contact"];

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function checkMobile() {
      setIsMobile(window.innerWidth < 1024);
    }

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const isLoginPage = pathname === "/login";
  const home = pathname === "/";
  const searchInstitutes = pathname === "/search-institutes";

  return (
    <AuthWrapper>
      {allowedRoutes.includes(pathname) ||
        isLoginPage ||
        home ||
        searchInstitutes ? (
        <>
          {children}
          <FastTrackOverlay />
          <GlobalConfirmModal />

          <RoleSelectModal open={ui.roleSelectModal.open} />
          <LoginModal
            isOpen={ui.loginModal.open}
            onClose={() => dispatch(updateLoginUi({ loginModal: { open: false } }))}
          />
        </>
      ) : (
        <div className="flex h-screen w-screen overflow-hidden">
          {showSidebar && (
            <>
              {isMobile && !mobileSidebarOpen && (
                <button
                  onClick={() => setMobileSidebarOpen(true)}
                  aria-label="Open sidebar"
                  className="fixed top-4 left-4 z-60 p-2 rounded-md bg-primary text-primary-content shadow-lg lg:hidden"
                >
                  <Menu size={24} />
                </button>
              )}

              {(mobileSidebarOpen || !isMobile) && (
                <Sidebar
                  collapsed={sidebarCollapsed}
                  setCollapsed={setSidebarCollapsed}
                  mobileSidebarOpen={mobileSidebarOpen}
                  setMobileSidebarOpen={setMobileSidebarOpen}
                  isMobile={isMobile}
                />
              )}

              {isMobile && mobileSidebarOpen && (
                <div
                  className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                  onClick={() => setMobileSidebarOpen(false)}
                  aria-hidden="true"
                />
              )}
            </>
          )}

          <main
            className="flex-1 transition-all duration-500 ease-in-out overflow-auto bg-gray-50 pt-6 sm:pt-8 lg:pt-10 px-4 sm:px-6 lg:px-8 xl:px-10"
            style={{
              marginLeft:
                showSidebar && !isMobile
                  ? sidebarCollapsed
                    ? "88px"
                    : "260px"
                  : "0px",
            }}
          >
            {children}
          </main>
          <GlobalConfirmModal />
          <FastTrackOverlay />

          <RoleSelectModal open={ui.roleSelectModal.open} />
          <LoginModal
            isOpen={ui.loginModal.open}
            onClose={() => dispatch(updateLoginUi({ loginModal: { open: false } }))}
          />
        </div>
      )}
    </AuthWrapper>
  );
}
