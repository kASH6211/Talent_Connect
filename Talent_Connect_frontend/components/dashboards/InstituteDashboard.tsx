"use client";

import Link from "next/link";
import {
  Users,
  Briefcase,
  ClipboardList,
  Building2,
  Send,
  TrendingUp,
  Inbox,
} from "lucide-react";
import api from "@/lib/api";
import { useEffect, useState } from "react";
import ReceivedOffersPage from "@/app/received-offers/page";

interface Stats {
  students: number;
  placements: number;
  pendingRequests: number;
  receivedOffers: number;
  pendingOffers: number;
  acceptedOffers: number;
}

export default function InstituteDashboard({
  username,
  instituteName,
}: {
  username: string;
  instituteName?: string;
}) {
  const [stats, setStats] = useState<Stats | null>(null);

  // ─── FETCH DATA ─────────────────────────────────────────────────────────────
  useEffect(() => {
    Promise.all([
      api.get("/student/count").catch(() => ({ data: 0 })),
      api.get("/student-placement/count").catch(() => ({ data: 0 })),
      api.get("/industry-request/count").catch(() => ({ data: 0 })),
      api.get("/job-offer/received").catch(() => ({ data: [] })),
    ]).then(([studRes, placRes, reqRes, offerRes]) => {
      const students = typeof studRes.data === "number" ? studRes.data : 0;
      const placements = typeof placRes.data === "number" ? placRes.data : 0;
      const requests = typeof reqRes.data === "number" ? reqRes.data : 0;
      const offers: any[] = Array.isArray(offerRes.data) ? offerRes.data : [];

      setStats({
        students,
        placements,
        pendingRequests: requests,
        receivedOffers: offers.length,
        pendingOffers: offers.filter((o) => o.status === "Pending").length,
        acceptedOffers: offers.filter((o) => o.status === "Accepted").length,
      });
    });
  }, []);

  if (!stats) return <DashboardSkeleton username={username} />;

  return (
    <div className="min-h-screen bg-base-200/30">
      <div className="w-full mx-auto">
        {/* ─── Hero Section ─── */}
        <div className="relative overflow-hidden p-6 lg:p-8 rounded-2xl bg-primary border border-primary/80 shadow-xl mb-10 text-primary-content">
          {/* Accent orb */}
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-primary/30 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md flex-shrink-0">
                <Building2 size={26} className="text-primary-content" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold tracking-tight leading-tight text-primary-content">
                  Welcome, {instituteName || "Institute Name"} 👋
                </h1>
                <p className="text-secondary text-sm font-medium mt-1">
                  Institute Portal · {username}
                </p>
              </div>
            </div>

            <Link
              href="/students"
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full
                         border-2 border-secondary text-secondary font-semibold text-sm
                         hover:bg-secondary hover:text-secondary-content
                         hover:shadow-[0_0_20px_rgba(var(--color-secondary),0.4)]
                         transition-all duration-300 ease-in-out
                         active:scale-95"
            >
              <Users
                size={17}
                className="group-hover:scale-110 transition-transform"
              />
              View My Students
            </Link>
          </div>

          <p className="mt-5 text-primary-content/70 text-base lg:text-lg max-w-3xl">
            Manage students, track placements, and handle Expressions of Interest seamlessly.
          </p>
        </div>

        {/* ─── Received Offers Section ─── */}
        <div className="mt-8">
          <ReceivedOffersPage />
        </div>
      </div>
    </div>
  );
}
function DashboardSkeleton({ username }: { username: string }) {
  return (
    <div className="animate-pulse space-y-10">
      <div className="h-64 rounded-2xl bg-base-300" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-32 rounded-2xl bg-base-300" />)}
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map(i => <div key={i} className="h-40 rounded-2xl bg-base-300" />)}
      </div>
    </div>
  );
}
