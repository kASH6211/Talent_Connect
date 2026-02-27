"use client";

import { useAuth } from "@/hooks/useAuth";
import {
  GraduationCap,
  User,
  Settings,
  ShieldCheck,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { ThemeToggle } from "@/components2/ThemeToggle";

export default function Header() {
  const { user, role, logout, loading } = useAuth();

  const avatarSrc =
    "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp";
  const displayName = user?.username || "John Doe";
  const displayRole = role || "Industry Partner";
  const displayEmail = "john.doe@company.com";

  return (
    <header className="sticky top-0 z-50 w-full bg-base-100 border-b border-base-200 h-[64px]">
      <div className="flex items-center justify-between h-full px-6">
        {/* Logo */}
        <div className="flex items-center gap-3">
          {/* <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
            <GraduationCap
              size={16}
              className="text-primary-content"
              strokeWidth={2.5}
            />
          </div> */}

          <div className="leading-tight">
            <span className="text-sm font-semibold tracking-tight text-base-content">
              Talent
              <span className="text-primary font-semibold">Connect</span>
            </span>
            <p className="text-[10px] uppercase tracking-wider text-base-content/50 mt-0.5">
              Placement Dashboard
            </p>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          <ThemeToggle />

          {/* Avatar Dropdown */}
          <div className="dropdown dropdown-end">
            <button
              tabIndex={0}
              disabled={loading}
              className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-base-200 transition-colors"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden">
                <img
                  src={avatarSrc}
                  alt="avatar"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp";
                  }}
                />
              </div>

              <div className="hidden sm:block text-left leading-tight">
                <p className="text-sm font-medium text-base-content">
                  {displayName}
                </p>
                <p className="text-xs text-base-content/60">{displayRole}</p>
              </div>

              <ChevronDown size={14} className="text-base-content/50" />
            </button>

            {/* Dropdown */}
            <div className="dropdown-content mt-2 w-64 bg-base-100 border border-base-200 rounded-lg shadow-md overflow-hidden">
              <div className="p-4 border-b border-base-200">
                <p className="text-sm font-medium">{displayName}</p>
                <p className="text-xs text-base-content/60">{displayEmail}</p>
              </div>

              <div className="py-1">
                {[
                  { icon: User, label: "Profile" },
                  { icon: Settings, label: "Settings" },
                  { icon: ShieldCheck, label: "Job Offers" },
                ].map(({ icon: Icon, label }) => (
                  <a
                    key={label}
                    className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-base-200 cursor-pointer transition-colors"
                  >
                    <Icon size={16} className="text-base-content/60" />
                    {label}
                  </a>
                ))}
              </div>

              <div className="border-t border-base-200">
                <a
                  onClick={logout}
                  className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-error/10 hover:text-error cursor-pointer transition-colors"
                >
                  <LogOut size={16} />
                  Logout
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
