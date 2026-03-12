"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Menu,
  X,
  UserCircle,
  ChevronDown,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { updateLoginUi } from "@/store/login";
import { useAuth } from "@/lib/AuthProvider";
import { getDashboardRoute } from "@/lib/helper";
import { useEffect, useRef, useState } from "react";

const getProfileUrl = (role: string) => {
  switch (role) {
    case 'superadmin':
      return '/admin/profile';

    case 'industry':
      return '/industry/profile';

    case 'institute':
      return '/institute/profile';

    default:
      return '/';
  }
}

const pageLinks = [
  { label: "Home", to: "/" },
  { label: "Contact", to: "/contact" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch<AppDispatch>();
  const { user, logout, role } = useAuth();

  const pathname = usePathname();
  const isActive = (to: string) => pathname === to;

  const navLinks = user
    ? [
      ...pageLinks.filter(
        (link) => link.label === "Home" || link.label === "Contact",
      ),
      { label: "Dashboard", to: getDashboardRoute(role) },
    ]
    : pageLinks;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-primary/95 text-white sticky top-0 z-50 backdrop-blur-md shadow-[0_2px_15px_rgba(0,0,0,0.1)] border-b border-white/10 shrink-0">
      <div
        className={`${user ? "w-full px-6 lg:px-10" : "container mx-auto px-6 lg:px-10"} flex items-center justify-between py-2.5`}
      >
        <Link
          href="/"
          className="flex items-center gap-4 group transition-transform duration-300 "
        >
          <div className="relative">
            <img
              src={"/logo.png"}
              alt="Govt of Punjab Logo"
              className="h-14 w-14 object-contain drop-shadow-md"
            />
            <div className="absolute -inset-1 bg-white/10 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>

          <div className="border-l border-white/20 pl-4 py-1">
            <h1 className="text-white text-lg font-medium leading-tight tracking-wider uppercase">
              HUNAR PUNJAB
            </h1>
            <p className="text-white/90 text-xs font-medium  tracking-wide">
              Hub for Upskilling, Networking and Access to Rozgar
            </p>
          </div>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          <div className="flex items-center gap-6">
            {navLinks.map((link) =>
              link.to.includes("#") ? (
                <a
                  key={link.label}
                  href={link.to}
                  className="relative py-2 text-sm font-semibold text-white/90 hover:text-white transition-colors group"
                >
                  {link.label}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-secondary transition-all duration-300 group-hover:w-full"></span>
                </a>
              ) : (
                <Link
                  key={link.label}
                  href={link.to}
                  className={`relative py-2 text-sm font-semibold transition-colors group ${isActive(link.to)
                    ? "text-white"
                    : "text-white/90 hover:text-white"
                    }`}
                >
                  {link.label}
                  <span
                    className={`absolute bottom-0 left-0 h-0.5 bg-secondary transition-all duration-300 group-hover:w-full ${isActive(link.to) ? "w-full" : "w-0"}`}
                  ></span>
                </Link>
              ),
            )}
          </div>

          <div className="h-8 w-px bg-white/10 mx-2"></div>

          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all active:scale-95 group/user"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-secondary to-orange-400 flex items-center justify-center text-white shadow-lg overflow-hidden border-2 border-white/20">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-bold uppercase">
                      {user.username.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="flex flex-col items-start leading-none gap-0.5">
                  <span className="text-xs font-semibold text-white/90 uppercase tracking-wide">
                    Hi, {user.username}
                  </span>
                  <span className="text-sm font-semibold text-white uppercase tracking-tight">
                    {role || "User"}
                  </span>
                </div>
                <ChevronDown
                  size={14}
                  className={`text-white/70 transition-transform duration-300 ${userDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-100 py-3 text-slate-800 animate-in fade-in slide-in-from-top-4 duration-200">
                  <div className="px-5 py-2 mb-2 border-b border-slate-50">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Account Details
                    </p>
                    <p className="text-sm font-bold text-primary truncate">
                      {user.username}
                    </p>
                  </div>

                  <Link
                    href={getProfileUrl(user.role)}
                    className="flex items-center gap-3 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-primary transition-colors"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <UserCircle size={18} />
                    View Profile
                  </Link>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-3 px-5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => {
                dispatch(updateLoginUi({ roleSelectModal: { open: true } }));
              }}
              className="bg-secondary text-white px-7 py-2 rounded-lg text-xs font-bold uppercase tracking-widest shadow-lg hover:shadow-secondary/20 hover:scale-105 active:scale-95 transition-all duration-300 border-2 border-transparent hover:border-white/20"
            >
              Login
            </button>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-primary border-t border-white/10 px-6 py-6 animate-in slide-in-from-top duration-300">
          <div className="space-y-4">
            {user && (
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary to-orange-400 flex items-center justify-center text-white shadow-lg overflow-hidden border-2 border-white/20">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-bold uppercase">
                      {user.username.charAt(0)}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold text-white/90 uppercase tracking-wide">
                    Hi, {user.username}
                  </p>
                  <p className="text-lg font-semibold text-white uppercase tracking-tight">
                    {role || "User"}
                  </p>
                </div>
              </div>
            )}

            {navLinks.map((link) =>
              link.to.includes("#") ? (
                <a
                  key={link.label}
                  href={link.to}
                  className="block py-2 text-lg font-semibold text-white/90 hover:text-white transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  href={link.to}
                  className={`block py-2 text-lg font-semibold transition-colors ${isActive(link.to)
                    ? "text-secondary"
                    : "text-white/90 hover:text-white"
                    }`}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ),
            )}

            <div className="pt-4 mt-4 border-t border-white/10">
              {user ? (
                <div className="space-y-3">
                  <Link
                    href={getProfileUrl(user.role)}
                    className="w-full flex items-center justify-center gap-3 bg-white/10 text-white py-4 rounded-lg text-sm font-semibold uppercase tracking-widest shadow-xl shadow-black/10"
                    onClick={() => setMobileOpen(false)}
                  >
                    <UserCircle size={20} />
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-3 bg-red-500/80 text-white py-4 rounded-lg text-sm font-semibold uppercase tracking-widest shadow-xl shadow-red-900/20"
                  >
                    <LogOut size={20} />
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    dispatch(
                      updateLoginUi({ roleSelectModal: { open: true } }),
                    );
                    setMobileOpen(false);
                  }}
                  className="w-full bg-secondary text-white py-4 rounded-lg text-sm font-semibold uppercase tracking-widest shadow-xl"
                >
                  Login to Portal
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
