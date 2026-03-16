"use client";

import { ReactNode, useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { usePathname } from "next/navigation";
import AuthWrapper from "@/lib/AuthWrapper";
import { Menu } from "lucide-react";
import RoleSelectModal from "./landing-page/RoleSelectModal";
import Navbar from "./landing-page/Navbar";
import LoginModal from "./LoginModal";
import LoginPromptModal from "./common/LoginPromptModal";
import ChangePasswordModal from "./common/ChangePasswordModal";
import GlobalConfirmModal from "./common/ConfirmDialogHOC";
import FastTrackOverlay from "./common/FastTrackOverlay";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { updateLoginUi } from "@/store/login";
import { useAuth } from "@/lib/AuthProvider";
import { User, ShieldCheck } from "lucide-react";
import api from "@/lib/api";

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
  const { user, role } = useAuth();

  const allowedRoutes = ["/login", "/", "/contact"];

  const [isMobile, setIsMobile] = useState(false);
  const [orgName, setOrgName] = useState<string | null>(null);

  useEffect(() => {
    function checkMobile() {
      setIsMobile(window.innerWidth < 1024);
    }

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  
  console.log({user , role})

  useEffect(() => {
    if (user?.institute_id && role === "institute" ) {
      api
        .get(`/institute/${user.institute_id}`)
        .then((res) => setOrgName(res.data?.institute_name))
        .catch(console.error);
    } else if (user?.industry_id && role === "industry" ) {
      api
        .get(`/industry/${user.industry_id}`)
        .then((res) => setOrgName(res.data?.industry_name))
        .catch(console.error);
    }
  }, [user, role]);

  const isLoginPage = pathname === "/login";
  const home = pathname === "/";
  const searchInstitutes = pathname === "/search-institutes";

  const isDashboardLayout = !allowedRoutes.includes(pathname) && !home && !searchInstitutes && !isLoginPage;

  return (
    <AuthWrapper>
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-background font-inter">
        <Navbar />

        {user && (
          <div className="flex flex-col shrink-0 overflow-hidden h-5">
            {/* Primary Greeting Banner */}
            <div className="w-full bg-primary border-b border-white/10 h-5 lg:h-12 flex items-center relative overflow-hidden">
              {/* Decorative skew elements for high-fidelity look */}
              <div className="absolute top-0 right-0 w-1/2 h-full bg-white/[0.03] -skew-x-[30deg] translate-x-32" />
              <div className="absolute top-0 left-0  h-full bg-white/[0.02] skew-x-[15deg] -translate-x-16" />

              <div className="max-w-[1600px] mx-auto w-full  sm:px-6 lg:px-2 flex items-center justify-between relative z-10 gap-4 ml-[39px]">
                <div className="flex items-center gap-3">

                  <div className="flex flex-col">

                    <span className="text-xs  ml-4 lg:text-sm font-medium text-white tracking-tight truncate">
                      Welcome : <span className="text-secondary-foreground font-medium">{orgName ?? 'User'}</span>
                    </span>
                  </div>
                </div>


              </div>
            </div>


          </div>
        )}

        <div className="flex-1 flex overflow-hidden relative">
          {isDashboardLayout ? (
            <>
              {showSidebar && (
                <div className="relative shrink-0 h-full z-40">
                  {isMobile && !mobileSidebarOpen && (
                    <button
                      onClick={() => setMobileSidebarOpen(true)}
                      aria-label="Open sidebar"
                      className="fixed top-24  z-[60] flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-white shadow-lg lg:hidden transition active:scale-95"
                    >
                      <Menu size={18} />
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
                      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[45] lg:hidden animate-in fade-in duration-300"
                      onClick={() => setMobileSidebarOpen(false)}
                      aria-hidden="true"
                    />
                  )}
                </div>
              )}

              <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50 pt-4 sm:pt-6 lg:pt-8 px-4 sm:px-6 lg:px-8 xl:px-10 pb-10">
                <div className="max-w-[1600px] mx-auto w-full">
                  {children}
                </div>
                <GlobalConfirmModal />
                <FastTrackOverlay />

                <RoleSelectModal open={ui.roleSelectModal.open} />
                <LoginModal
                  isOpen={ui.loginModal.open}
                  onClose={() => dispatch(updateLoginUi({ loginModal: { open: false } }))}
                />
                {ui.authPrompt.open && (
                  <LoginPromptModal
                    onClose={() => dispatch(updateLoginUi({ authPrompt: { open: false } }))}
                  />
                )}
                <ChangePasswordModal
                  isOpen={user?.is_passwordchanged === 'N' && role !== 'industry'}
                  onClose={() => { }}
                  forced={true}
                />
              </main>
            </>
          ) : (
            <div className="flex-1 overflow-auto focus:outline-none">
              {children}
              <FastTrackOverlay />
              <GlobalConfirmModal />

              <RoleSelectModal open={ui.roleSelectModal.open} />
              <LoginModal
                isOpen={ui.loginModal.open}
                onClose={() => dispatch(updateLoginUi({ loginModal: { open: false } }))}
              />
              {ui.authPrompt.open && (
                <LoginPromptModal
                  onClose={() => dispatch(updateLoginUi({ authPrompt: { open: false } }))}
                />
              )}
              <ChangePasswordModal
                isOpen={user?.is_passwordchanged === 'N' && role !== 'industry'}
                onClose={() => { }}
                forced={true}
              />
            </div>
          )}
        </div>
      </div>
    </AuthWrapper>
  );
}
