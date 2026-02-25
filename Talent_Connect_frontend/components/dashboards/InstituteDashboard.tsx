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
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-6 lg:py-10 mx-auto">
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

        {/* Stats Grid */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:gap-6 mb-10">
          {statCards.map((c, idx) => (
            <Link
              key={idx}
              href={c.href}
              className="group relative bg-base-100 rounded-2xl p-5 lg:p-6 border border-base-200 shadow-md hover:shadow-xl hover:shadow-[#7976ff]/10 transition-all duration-300 overflow-hidden flex items-center justify-between gap-4"
            >
              {/* Hover glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#7976ff]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none" />

              <div className="flex-1 min-w-0">
                <p className="text-sm text-base-content/70 mb-1">{c.label}</p>
                {loadingStats ? (
                  <div className="h-8 w-16 rounded bg-base-200 animate-pulse mb-1" />
                ) : (
                  <p className="text-2xl lg:text-3xl font-bold text-base-content">
                    {c.value !== undefined ? c.value : "—"}
                  </p>
                )}
                <p className="text-sm text-base-content/70 mt-1">{c.note}</p>
              </div>

              <div
                className={`w-14 h-14 lg:w-16 lg:h-16 flex items-center justify-center rounded-xl bg-gradient-to-br ${c.color} shadow-md flex-shrink-0 group-hover:scale-105 transition-transform`}
              >
                <c.icon size={24} className="text-white" />
              </div>
            </Link>
          ))}
        </section>

        {/* Offer Status Badges */}
        {stats && stats.receivedOffers > 0 && (
          <div className="flex flex-wrap gap-3 mb-10">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#7976ff]/5 border border-[#7976ff]/20 text-sm">
              <Clock size={16} className="text-[#7976ff]" />
              <span className="font-semibold text-[#7976ff]">
                {stats.pendingOffers}
              </span>
              <span className="text-base-content/70">pending</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-success/5 border border-success/20 text-sm">
              <CheckCircle2 size={16} className="text-success" />
              <span className="font-semibold text-success">
                {stats.acceptedOffers}
              </span>
              <span className="text-base-content/70">accepted</span>
            </div>
          </div>
        )}

        {/* Recent Offers */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl lg:text-2xl font-bold text-base-content">
              Recent Offers
            </h2>
            <Link
              href="/received-offers"
              className="text-[#7976ff] hover:text-[#7976ff]/80 text-sm lg:text-base flex items-center gap-1.5 font-medium transition-colors"
            >
              View all{" "}
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </div>

          {loadingOffers ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 rounded-xl bg-base-100 border border-base-200/50 animate-pulse shadow-sm"
                />
              ))}
            </div>
          ) : recentOffers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4 text-base-content/50 text-center bg-base-100 border border-base-200 rounded-2xl shadow-md">
              <div className="w-16 h-16 rounded-xl bg-base-200 flex items-center justify-center">
                <Send size={28} className="opacity-40" />
              </div>
              <p className="text-lg font-medium">No job offers received yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOffers.map((offer) => {
                const sc =
                  statusConfig[offer.status] ?? statusConfig["Pending"];
                const StatusIcon = sc.icon;
                const salary = salaryStr(offer.salary_min, offer.salary_max);
                return (
                  <div
                    onClick={() => {
                      dispatch(setCurrentOffer(offer));
                      router.push("/received-offers");
                    }}
                    key={offer.offer_id}
                    className="group flex items-center justify-between gap-4 p-4 lg:p-5 rounded-xl bg-base-100 border border-base-200/50 hover:border-[#7976ff]/30 hover:bg-base-50/80 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-[#7976ff]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#7976ff]/20 transition-colors">
                        <StatusIcon size={20} className="text-[#7976ff]" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-base-content text-base lg:text-lg truncate">
                            {offer.job_title}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs lg:text-sm font-medium
                              ${
                                offer.status === "Accepted"
                                  ? "bg-success/10 text-success"
                                  : offer.status === "Rejected"
                                    ? "bg-error/10 text-error"
                                    : offer.status === "Pending"
                                      ? "bg-warning/10 text-warning"
                                      : "bg-neutral/10 text-neutral"
                              }`}
                          >
                            <StatusIcon size={14} />
                            {sc.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-sm text-base-content/70">
                          <Building2 size={14} />
                          <span className="truncate">
                            {offer.industry?.industry_name ?? "Industry"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex-shrink-0 text-right min-w-[120px]">
                      {salary && (
                        <div className="text-base lg:text-lg font-bold text-success">
                          {salary}
                        </div>
                      )}
                      {offer.last_date && (
                        <div className="text-xs lg:text-sm text-base-content/60 mt-1">
                          Due:{" "}
                          <span className="text-warning font-medium">
                            {offer.last_date}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Quick Actions */}
        <section className="mb-10">
          <h2 className="text-xl lg:text-2xl font-bold text-base-content mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
            {actions.map((a, idx) => (
              <Link
                key={idx}
                href={a.href}
                className="group relative bg-base-100 rounded-2xl p-6 lg:p-7 border border-base-200 shadow-md hover:shadow-xl hover:shadow-[#7976ff]/10 hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full"
              >
                <div className="flex items-center justify-between mb-5">
                  <div
                    className={`w-12 h-12 lg:w-14 lg:h-14 flex items-center justify-center rounded-xl bg-gradient-to-br ${a.color} shadow-md group-hover:scale-105 transition-transform`}
                  >
                    <a.icon size={24} className="text-white" />
                  </div>
                </div>

                <h3 className="font-semibold text-base lg:text-lg text-base-content group-hover:text-[#7976ff] transition-colors mb-2">
                  {a.label}
                </h3>
                <p className="text-sm lg:text-base text-base-content/70 flex-1">
                  {a.description}
                </p>

                <div className="mt-4 flex items-center gap-2 text-sm text-[#7976ff]/70 group-hover:text-[#7976ff] transition-all">
                  Open{" "}
                  <ArrowRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Info Note */}
        <div className="p-4 rounded-xl bg-base-100/80 border border-base-200/50 text-sm text-base-content/70 shadow-sm">
          <span className="font-semibold text-base-content">Note:</span> Data
          scoped to your institute. Contact admin for other modules.
        </div>
      </div>
    </div>
  );
}
