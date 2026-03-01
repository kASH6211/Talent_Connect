"use client";

import Link from "next/link";
import {
  Users,
  Briefcase,
  ClipboardList,
  Building2,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  TrendingUp,
  Inbox,
} from "lucide-react";
import api from "@/lib/api";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { setCurrentOffer } from "@/store/institute";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ReceivedOffersPage from "@/app/received-offers/page";

interface Offer {
  offer_id: number;
  job_title: string;
  salary_min?: number;
  salary_max?: number;
  offer_date?: string;
  last_date?: string;
  status: string;
  industry?: { industry_name?: string };
}

const statusConfig: Record<
  string,
  { badge: string; icon: any; label: string }
> = {
  Pending: { badge: "badge-warning", icon: Clock, label: "Pending" },
  Accepted: { badge: "badge-success", icon: CheckCircle2, label: "Accepted" },
  Rejected: { badge: "badge-error", icon: XCircle, label: "Rejected" },
  Withdrawn: { badge: "badge-neutral", icon: XCircle, label: "Withdrawn" },
};

const fmt = (n?: number) => (n ? `₹${(n / 100000).toFixed(1)}L` : null);
const salaryStr = (min?: number, max?: number) => {
  const mn = fmt(min);
  const mx = fmt(max);
  if (mn && mx) return `${mn} – ${mx}`;
  if (mn) return `From ${mn}`;
  if (mx) return `Up to ${mx}`;
  return null;
};

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
  const [recentOffers, setRecentOffers] = useState<Offer[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingOffers, setLoadingOffers] = useState(true);

  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  // ─── ALL LOGIC 100% UNCHANGED ──────────────────────────────────────────────
  useEffect(() => {
    Promise.all([
      api.get("/student/count").catch(() => ({ data: 0 })),
      api.get("/student-placement/count").catch(() => ({ data: 0 })),
      api.get("/industry-request/count").catch(() => ({ data: 0 })),
      api.get("/job-offer/received").catch(() => ({ data: [] })),
    ])
      .then(([studRes, placRes, reqRes, offerRes]) => {
        const students = typeof studRes.data === "number" ? studRes.data : 0;
        const placements = typeof placRes.data === "number" ? placRes.data : 0;
        const requests = typeof reqRes.data === "number" ? reqRes.data : 0;
        const offers: Offer[] = Array.isArray(offerRes.data)
          ? offerRes.data
          : [];
        setStats({
          students,
          placements,
          pendingRequests: requests,
          receivedOffers: offers.length,
          pendingOffers: offers.filter((o) => o.status === "Pending").length,
          acceptedOffers: offers.filter((o) => o.status === "Accepted").length,
        });
        setRecentOffers(offers.slice(0, 5));
      })
      .finally(() => {
        setLoadingStats(false);
        setLoadingOffers(false);
      });
  }, []);

  const statCards = [
    {
      label: "My Students",
      value: stats?.students,
      icon: Users,
      color: "from-indigo-600 to-[#7976ff]/90",
      note: "enrolled students",
      href: "/students",
    },
    {
      label: "Placements",
      value: stats?.placements,
      icon: TrendingUp,
      color: "from-[#7976ff] to-indigo-600",
      note: "placed students",
      href: "/placements",
    },
    {
      label: "Industry Requests",
      value: stats?.pendingRequests,
      icon: ClipboardList,
      color: "from-amber-500 to-amber-600",
      note: "pending requests",
      href: "/industry-requests",
    },
    {
      label: "Received Offers",
      value: stats?.receivedOffers,
      icon: Inbox,
      color: "from-purple-600 to-[#7976ff]/90",
      note: "job offers received",
      href: "/received-offers",
    },
  ];

  const actions = [
    {
      icon: Users,
      label: "View My Students",
      description: "Browse students enrolled at your institute",
      href: "/students",
      color: "from-indigo-600 to-[#7976ff]/90",
    },
    {
      icon: Briefcase,
      label: "View Placements",
      description: "Track placement records for your students",
      href: "/placements",
      color: "from-[#7976ff] to-indigo-600",
    },
    {
      icon: ClipboardList,
      label: "Industry Requests",
      description: "Manage campus placement & internship requests",
      href: "/industry-requests",
      color: "from-amber-500 to-amber-600",
    },
    {
      icon: Send,
      label: "Received Offers",
      description: "Accept or reject job offers from industries",
      href: "/received-offers",
      color: "from-purple-600 to-[#7976ff]/90",
    },
  ];

  // ─── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-base-200/30">
      <div className="w-full mx-auto">
        {/* Hero Section */}
        <div className="relative overflow-hidden p-6 lg:p-8 rounded-2xl bg-base-100 border border-base-200 shadow-xl mb-10">
          {/* Subtle accent orb */}
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-[#7976ff]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex items-center justify-between gap-6">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-xl bg-gradient-to-br from-[#7976ff] to-indigo-600 flex items-center justify-center shadow-md flex-shrink-0">
                <Building2 size={26} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-base-content">
                  Welcome, {username} 👋
                </h1>
                <p className="text-[#7976ff] font-medium text-base lg:text-lg mt-1">
                  Institute Portal · {instituteName ?? "Institute Account"}
                </p>
              </div>
            </div>
          </div>

          <p className="mt-5 text-base-content/70 max-w-3xl text-base lg:text-lg">
            Manage students, track placements, handle industry requests
            seamlessly.
          </p>
        </div>

        {/* Received Offers Content directly on Dashboard */}
        <div className="mt-8">
          <ReceivedOffersPage />
        </div>
      </div>
    </div>
  );
}
