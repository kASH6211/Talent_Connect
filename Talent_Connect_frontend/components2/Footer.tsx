"use client";
import React from "react";
import Link from "next/link";
import {
  Building2,
  Users,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
} from "lucide-react";

export const Footer = () => {
  return (
    <footer className="relative bg-gradient-to-t from-base-300 via-base-200 to-transparent pt-20 lg:pt-32 pb-12 lg:pb-20 overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl -translate-x-32 translate-y-32" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl translate-x-32 -translate-y-32" />

      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-16">
          {/* Brand */}
          <div className="space-y-6 lg:col-span-1">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-primary to-secondary rounded-2xl shadow-lg">
                <Building2 className="w-8 h-8 text-base-100" />
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  TalentConnect
                </h3>
                <p className="text-sm text-base-content/60">
                  Punjab's Talent Network
                </p>
              </div>
            </div>
            <p className="text-base-content/70 leading-relaxed max-w-md">
              Connecting institutes, students, and employers to build Punjab's
              future workforce.
            </p>
          </div>

          {/* Services */}
          <div>
            <h6 className="text-lg font-bold text-base-content mb-6 flex items-center gap-2">
              Services
            </h6>
            {[
              "Student Hiring",
              "Institute Partnerships",
              "Training Programs",
              "Alumni Network",
            ].map((item, idx) => (
              <Link
                key={idx}
                href="#"
                className="block py-2 text-base-content/70 hover:text-primary hover:pl-4 transition-all duration-200 group"
              >
                <span className="group-hover:translate-x-1 transition-transform">
                  {item}
                </span>
              </Link>
            ))}
          </div>

          {/* Company */}
          <div>
            <h6 className="text-lg font-bold text-base-content mb-6 flex items-center gap-2">
              Company
            </h6>
            {["About Us", "Careers", "Blog", "Contact"].map((item, idx) => (
              <Link
                key={idx}
                href="#"
                className="block py-2 text-base-content/70 hover:text-primary hover:pl-4 transition-all duration-200 group"
              >
                <span className="group-hover:translate-x-1 transition-transform">
                  {item}
                </span>
              </Link>
            ))}
          </div>

          {/* Contact */}
          <div>
            <h6 className="text-lg font-bold text-base-content mb-6 flex items-center gap-2">
              Contact Info
            </h6>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-base-100/50 rounded-xl">
                <MapPin className="w-5 h-5 mt-0.5 text-primary flex-shrink-0" />
                <span className="text-base-content/70 text-sm">
                  Chandigarh, Punjab
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-base-100/50 rounded-xl">
                <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-base-content/70 text-sm">
                  +91 172 123 4567
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-base-100/50 rounded-xl">
                <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-base-content/70 text-sm">
                  hello@talentconnect.in
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="bg-base-100/90 backdrop-blur-md rounded-3xl p-8 lg:p-12 border border-base-200/60 shadow-xl mb-12">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="space-y-3">
              <h3 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Stay Updated
              </h3>
              <p className="text-base-content/70 text-lg max-w-md mx-auto">
                Get latest updates on talent opportunities and institute
                partnerships
              </p>
            </div>
            <div className="join bg-base-200/50 rounded-2xl p-1 shadow-lg max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="input input-bordered join-item flex-1 bg-base-100/50 backdrop-blur-sm focus:ring-2 focus:ring-primary/30 rounded-xl px-6 py-4 text-lg placeholder-base-content/50"
              />
              <button className="btn btn-primary join-item px-8 shadow-xl hover:shadow-2xl rounded-xl h-14 font-semibold text-lg gap-2">
                Subscribe
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-base-300/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <p className="text-base-content/60 text-sm">
              © 2026 TalentConnect. All rights reserved. Made with ❤️ in Punjab.
            </p>
            <div className="flex items-center gap-6 text-sm text-base-content/60">
              <Link href="#" className="hover:text-primary transition-colors">
                Privacy
              </Link>
              <Link href="#" className="hover:text-primary transition-colors">
                Terms
              </Link>
              <Link href="#" className="hover:text-primary transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
