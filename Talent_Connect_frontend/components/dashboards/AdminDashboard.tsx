"use client";

import Link from "next/link";
import {
  Building2,
  Factory,
  Users,
  Briefcase,
  GraduationCap,
  CheckCircle2,
  Send,
} from "lucide-react";
import { useState, useEffect } from "react";
import api from "@/lib/api";

const quickLinks = [
  { label: "Boards & Universities", href: "/masters/boards" },
  { label: "States", href: "/masters/states" },
  { label: "Courses", href: "/masters/stream-branches" },
  { label: "Job Roles", href: "/masters/job-roles" },
  { label: "Industry Sectors", href: "/masters/industry-sectors" },
];

export default function AdminDashboard({ username }: { username: string }) {
  const [counts, setCounts] = useState({
    institutes: 0,
    industries: 0,
    students: 0,
    placements: 0,
    sentOffers: 0,
    acceptedOffers: 0,
  });

  useEffect(() => {
    async function fetchCounts() {
      try {
        const [instRes, indRes, stuRes, placeRes, reqRes] = await Promise.all([
          api.get("/institute"),
          api.get("/industry"),
          api.get("/student"),
          api.get("/student-placement"),
          api.get("/industry-request"),
        ]);

        const getCount = (res: any) => {
          if (Array.isArray(res.data)) return res.data.length;
          if (res.data?.total !== undefined) return res.data.total;
          if (Array.isArray(res.data?.data)) return res.data.data.length;
          return 0;
        };

        const requestsRes = reqRes.data;
        const requests = Array.isArray(requestsRes) ? requestsRes : (requestsRes?.data || []);

        const sent = requests.filter((r: any) =>
          ["Submitted", "Under Review", "Approved", "Completed"].includes(r.requestStatus?.request_status)
        ).length;
        const accepted = requests.filter((r: any) =>
          ["Approved", "Completed"].includes(r.requestStatus?.request_status)
        ).length;

        setCounts({
          institutes: getCount(instRes),
          industries: getCount(indRes),
          students: getCount(stuRes),
          placements: getCount(placeRes),
          sentOffers: sent,
          acceptedOffers: accepted,
        });
      } catch (error) {
        console.error("Failed to fetch dashboard counts", error);
      }
    }
    fetchCounts();
  }, []);

  const statCards = [
    {
      label: "Institutes",
      count: counts.institutes,
      icon: Building2,
      color: "from-primary to-primary/70",
      href: "/institutes",
    },
    {
      label: "Industries",
      count: counts.industries,
      icon: Factory,
      color: "from-secondary to-secondary/70",
      href: "/industries",
    },
    {
      label: "Sent Requests",
      count: counts.sentOffers || 0,
      icon: Send,
      color: "from-indigo-500 to-indigo-600",
      href: "/all-requests",
    },
    {
      label: "Accepted Requests",
      count: counts.acceptedOffers || 0,
      icon: CheckCircle2,
      color: "from-emerald-500 to-emerald-600",
      href: "/all-requests",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden p-7 rounded-2xl bg-primary text-primary-content border border-primary/80">
        {/* Decorative circle */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/30 rounded-full -translate-y-1/2 translate-x-1/2" />

        {/* Main content */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-xl">
            <GraduationCap size={28} className="text-primary-content" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-primary-content">
              Welcome back, {username} 👋
            </h1>
            <p className="text-primary-content/80 text-sm mt-0.5">
              Administrator · Talent Connect Portal
            </p>
          </div>
        </div>

        <p className="mt-4 text-primary-content/70 text-sm leading-relaxed max-w-2xl">
          Full access to all modules — manage institutes, industries, students,
          placements, and master data from here.
        </p>
      </div>

      {/* Quick Access */}
      <div>
        <h2 className="text-xs font-semibold text-base-content/50 uppercase tracking-widest mb-4">
          Quick Access
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map((s) => (
            <Link
              key={s.label}
              href={s.href}
              className="p-5 rounded-xl border border-base-300 bg-base-200 hover:border-primary/40 hover:bg-base-300 hover:scale-[1.02] transition-all group"
            >
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3 shadow-lg`}
              >
                <s.icon size={20} className="text-white" />
              </div>
              <div className="text-base font-bold text-base-content">
                {s.count}
              </div>
              <div className="text-xs text-base-content/50 mt-0.5">
                {s.label}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Master Data quick links */}
      <div>
        <h2 className="text-xs font-semibold text-base-content/50 uppercase tracking-widest mb-4">
          Master Data
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {quickLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="flex items-center justify-between px-4 py-3 rounded-xl bg-base-200 border border-base-300 hover:bg-base-300 hover:border-primary/30 transition-all text-sm text-base-content/70 hover:text-base-content group"
            >
              {l.label}
              <span className="text-base-content/30 group-hover:text-primary transition-colors">
                →
              </span>
            </Link>
          ))}
          <Link
            href="/masters/boards"
            className="flex items-center justify-between px-4 py-3 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all text-sm text-primary hover:text-primary group"
          >
            View All Master Data
            <span className="text-primary/50 group-hover:text-primary transition-colors">
              →
            </span>
          </Link>
        </div>
      </div>

      {/* Mappings */}
      <div>
        <h2 className="text-xs font-semibold text-base-content/50 uppercase tracking-widest mb-4">
          Mappings
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {
              label: "Institute ↔ Qualification",
              href: "/mappings/institute-qualification",
            },
            { label: "Job Role ↔ Qualification", href: "/mappings/job-role-qualification" },
            {
              label: "Qualification ↔ Course",
              href: "/mappings/stream-branch-qualification",
            },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="flex items-center justify-between px-4 py-3 rounded-xl bg-base-200 border border-base-300 hover:bg-base-300 hover:border-secondary/30 transition-all text-sm text-base-content/70 hover:text-base-content group"
            >
              {l.label}
              <span className="text-base-content/30 group-hover:text-secondary transition-colors">
                →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
