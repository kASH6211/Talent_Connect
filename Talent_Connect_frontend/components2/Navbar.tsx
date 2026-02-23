"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { ThemeToggle } from "./ThemeToggle";

export const Navbar = () => {
  const pathname = usePathname();
  const [isIndustriesOpen, setIsIndustriesOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsIndustriesOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { name: "Home", path: "/" },
    // { name: "Hiring", path: "/hiring" },
    { name: "Institute", path: "/institutes" },
    // { name: "Faculty", path: "/faculty" },
    // { name: "Students", path: "/students" },
    { name: "University", path: "/university-board" },
    //  { name: "Industries", path: "/industries" },
  ];

  const industriesLinks = [
    { name: "Industries", path: "/industries" },
    { name: "Industrial Training", path: "/industrial-training" },
    { name: "Industry Collaboration", path: "/industry-collaboration" },
  ];

  const isActivePath = (path: string) =>
    path === "/" ? pathname === path : pathname.startsWith(path);

  return (
    <nav className="navbar py-4 px-6 lg:px-8 sticky top-0 z-50 bg-base-100/95 backdrop-blur-md border-b border-base-200/30 shadow-sm">
      {/* Logo */}
      <div className="navbar-start">
        <Link
          href="/"
          className="flex items-center gap-2 p-2 rounded-lg hover:bg-base-200/50 transition-all duration-200 group"
        >
          <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 p-2">
            <Image
              src="/talent-connect.png"
              alt="Talent Connect"
              width={22}
              height={22}
              className="object-contain"
              priority
            />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent hidden md:inline">
            TalentConnect
          </span>
        </Link>
      </div>

      {/* Navigation - Fixed center bar */}
      <div className="navbar-center hidden lg:flex">
        <div className="flex items-center gap-1 px-4 py-2.5 bg-base-200/50 backdrop-blur-sm rounded-full border border-base-300/30">
          {navLinks.map((link) => {
            const isActive = isActivePath(link.path);
            return (
              <Link
                key={link.path}
                href={link.path}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 capitalize tracking-wide flex items-center ${
                  isActive
                    ? "bg-primary text-white shadow-md scale-[1.05]"
                    : "text-base-content/70 hover:text-base-content hover:bg-base-100/50 hover:shadow-sm"
                }`}
              >
                {link.name}
              </Link>
            );
          })}

          {/* Industries Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation(); // Prevent parent event bubbling
                setIsIndustriesOpen(!isIndustriesOpen);
              }}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 capitalize tracking-wide flex items-center gap-1.5 hover:bg-base-100/50 hover:shadow-sm group ${
                industriesLinks.some((link) => isActivePath(link.path))
                  ? "bg-primary text-white shadow-md scale-[1.05]"
                  : "text-base-content/70 hover:text-base-content"
              }`}
            >
              Industries
              <svg
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isIndustriesOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {isIndustriesOpen && (
              <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-base-100/95 backdrop-blur-xl shadow-xl border border-base-200/40 rounded-2xl w-56 p-1 mt-1 z-50">
                {industriesLinks.map((link) => {
                  const isActive = isActivePath(link.path);
                  return (
                    <Link
                      key={link.path}
                      href={link.path}
                      className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 block w-full hover:bg-base-200/50 ${
                        isActive
                          ? "bg-primary text-white shadow-md"
                          : "text-base-content/70 hover:text-base-content"
                      }`}
                      onClick={() => setIsIndustriesOpen(false)}
                    >
                      <div className="w-2 h-2 rounded-full bg-current opacity-50" />
                      {link.name}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right side actions */}
      <div className="navbar-end items-center gap-2">
        <Link
          href="/login"
          className={`btn btn-sm px-6 py-2.5 rounded-full font-medium text-sm tracking-wide capitalize border-2 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center ${
            pathname === "/login"
              ? "btn-primary bg-primary text-white hover:bg-primary/90"
              : "btn-outline hover:bg-primary/5 hover:border-primary/50 hover:text-primary"
          }`}
        >
          Login
        </Link>
        <ThemeToggle />
      </div>
    </nav>
  );
};
