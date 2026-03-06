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
  { label: "Students", to: "/#students" },
  { label: "Industries", to: "/#industries" },
  // { label: "Placements", to: "/placements" },
  { label: "Contact", to: "/contact" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const isActive = (to: string) =>
    typeof window !== "undefined" && window.location.pathname === to;

  return (
    <nav className="bg-primary text-primary-content sticky top-0 z-50 shadow-md">
      <div className="container mx-auto flex items-center justify-between py-3 px-4">
        <Link href="/" className="flex items-center gap-3">
          <img
            src={"/Gov Logo.png"}
            alt="Govt of Punjab Logo"
            className="h-12 w-12 object-contain"
          />

          <div>
            <h1 className="text-primary-foreground text-sm font-bold leading-tight">
              HUNAR PUNJAB
            </h1>
            <p className="text-footer-fg text-xs">
              Hub for Upskilling, Networking and Access to Rozgar
            </p>
          </div>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          {pageLinks.map((link) =>
            link.to.includes("#") ? (
              <a
                key={link.label}
                href={link.to}
                className="text-primary-foreground/80 hover:text-primary-foreground text-sm font-medium transition-colors"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.label}
                href={link.to}
                className={`text-sm font-medium transition-colors ${
                  isActive(link.to)
                    ? "text-primary-foreground"
                    : "text-primary-foreground/80 hover:text-primary-foreground"
                }`}
              >
                {link.label}
              </Link>
            ),
          )}
          <button
            onClick={() => {
              dispatch(updateLoginUi({ roleSelectModal: { open: true } }));
            }}
            className="bg-secondary text-secondary-foreground px-5 py-1.5 rounded text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Login
          </button>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-primary-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-nav border-t border-primary-foreground/10 px-4 pb-4">
          {pageLinks.map((link) =>
            link.to.includes("#") ? (
              <a
                key={link.label}
                href={link.to}
                className="block py-2 text-primary-foreground/80 hover:text-primary-foreground text-sm"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.label}
                href={link.to}
                className="block py-2 text-primary-foreground/80 hover:text-primary-foreground text-sm"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ),
          )}
          <Link
            href="/login"
            className="mt-2 bg-secondary text-secondary-foreground px-5 py-1.5 rounded text-sm font-semibold w-full inline-block text-center"
            onClick={() => setMobileOpen(false)}
          >
            Login
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
