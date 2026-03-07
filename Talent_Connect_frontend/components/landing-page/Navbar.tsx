"use client";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import logo from "../assets/Gov Logo.png";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { updateLoginUi } from "@/store/login";

const pageLinks = [
  { label: "Home", to: "/" },
  { label: "Institutes", to: "/#institutes" },
  // { label: "Students", to: "/#students" },
  // { label: "Industries", to: "/#industries" },
  // { label: "Placements", to: "/placements" },
  { label: "Contact", to: "/contact" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const isActive = (to: string) =>
    typeof window !== "undefined" && window.location.pathname === to;

  return (
    <nav className="bg-primary/95 text-white sticky top-0 z-50 backdrop-blur-md shadow-[0_2px_15px_rgba(0,0,0,0.1)] border-b border-white/10">
      <div className="container mx-auto flex items-center justify-between py-2.5 px-6 lg:px-10">
        <Link href="/" className="flex items-center gap-4 group transition-transform duration-300 hover:scale-[1.02]">
          <div className="relative">
            <img
              src={"/Gov Logo.png"}
              alt="Govt of Punjab Logo"
              className="h-14 w-14 object-contain drop-shadow-md"
            />
            <div className="absolute -inset-1 bg-white/10 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>

          <div className="border-l border-white/20 pl-4 py-1">
            <h1 className="text-white text-lg font-black leading-tight tracking-wider uppercase">
              HUNAR PUNJAB
            </h1>
            <p className="text-white/70 text-[10px] uppercase font-bold tracking-[0.1em]">
              Upskilling • Networking • Rozgar
            </p>
          </div>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          <div className="flex items-center gap-6">
            {pageLinks.map((link) =>
              link.to.includes("#") ? (
                <a
                  key={link.label}
                  href={link.to}
                  className="relative py-2 text-sm font-bold text-white/80 hover:text-white transition-colors group"
                >
                  {link.label}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-secondary transition-all duration-300 group-hover:w-full"></span>
                </a>
              ) : (
                <Link
                  key={link.label}
                  href={link.to}
                  className={`relative py-2 text-sm font-bold transition-colors group ${isActive(link.to) ? "text-white" : "text-white/80 hover:text-white"
                    }`}
                >
                  {link.label}
                  <span className={`absolute bottom-0 left-0 h-0.5 bg-secondary transition-all duration-300 group-hover:w-full ${isActive(link.to) ? 'w-full' : 'w-0'}`}></span>
                </Link>
              ),
            )}
          </div>

          <div className="h-8 w-px bg-white/10 mx-2"></div>

          <button
            onClick={() => {
              dispatch(updateLoginUi({ roleSelectModal: { open: true } }));
            }}
            className="bg-secondary text-white px-7 py-2 rounded-lg text-xs font-black uppercase tracking-widest shadow-lg hover:shadow-secondary/20 hover:scale-105 active:scale-95 transition-all duration-300 border-2 border-transparent hover:border-white/20"
          >
            Login
          </button>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-primary border-t border-white/10 px-6 py-6 animate-in slide-in-from-top duration-300">
          <div className="space-y-4">
            {pageLinks.map((link) =>
              link.to.includes("#") ? (
                <a
                  key={link.label}
                  href={link.to}
                  className="block py-2 text-lg font-bold text-white/80 hover:text-white transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  href={link.to}
                  className={`block py-2 text-lg font-bold transition-colors ${isActive(link.to) ? "text-secondary" : "text-white/80 hover:text-white"
                    }`}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ),
            )}
            <div className="pt-4 mt-4 border-t border-white/10">
              <button
                onClick={() => {
                  dispatch(updateLoginUi({ roleSelectModal: { open: true } }));
                  setMobileOpen(false);
                }}
                className="w-full bg-secondary text-white py-4 rounded-lg text-sm font-black uppercase tracking-widest shadow-xl"
              >
                Login to Portal
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
