"use client";
import React from "react";
import {
  ArrowRight,
  Users,
  Building2,
  GraduationCap,
  Briefcase,
} from "lucide-react";

const HeroSection: React.FC = () => {
  const stats = [
    { value: "10+", label: "Institutes", icon: Building2 },
    { value: "50K+", label: "Students", icon: Users },
    { value: "45+", label: "Employers", icon: Briefcase },
    { value: "128+", label: "Active MoUs", icon: GraduationCap },
  ];

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-base-100 via-base-200 to-base-300 overflow-hidden">
      {/* Subtle background elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5" />
      <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-primary/10 blur-xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-secondary/10 blur-xl animate-pulse delay-1000" />

      <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-32 lg:px-12 grid lg:grid-cols-2 items-center gap-16 z-10">
        {/* Left - Main Content */}
        <div className="space-y-8 lg:max-w-lg">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-primary/10 rounded-full w-fit">
            <div className="w-2 h-2 bg-primary rounded-full animate-ping" />
            <span className="text-sm font-medium text-primary">
              Punjab's Talent Network
            </span>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-base-content via-primary to-secondary bg-clip-text text-transparent leading-tight">
              TalentConnect
              <span className="block lg:inline text-2xl lg:text-4xl font-normal text-base-content/70">
                {" "}
                – Bridge Skills & Opportunities
              </span>
            </h1>
            <p className="text-xl text-base-content/70 leading-relaxed max-w-md">
              Connect institutes, students, and employers to build Punjab's
              future workforce.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button className="btn btn-primary btn-lg shadow-lg hover:shadow-xl gap-2 h-14 px-8 text-lg font-semibold">
              Start Hiring
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="btn btn-outline btn-lg border-2 h-14 px-8 text-lg font-semibold hover:bg-primary/5">
              Partner With Us
            </button>
          </div>
        </div>

        {/* Right - Elegant Simple Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 w-full">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="group bg-base-100/90 backdrop-blur-md p-6 lg:p-8 rounded-2xl border border-base-200/60 hover:border-primary/40 transition-all duration-300 h-full flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl flex items-center justify-center mb-4 border border-primary/20">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-2xl lg:text-3xl font-bold text-base-content mb-2 leading-tight">
                  {stat.value}
                </div>
                <p className="text-sm text-base-content/70 font-medium leading-relaxed">
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
