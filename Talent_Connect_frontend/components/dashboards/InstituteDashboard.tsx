"use client";

import { useEffect, useState } from "react";
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
  { bgColor: string; textColor: string; icon: any; label: string }
> = {
  Pending: {
    bgColor: "bg-amber-50 dark:bg-amber-900/20",
    textColor: "text-amber-700 dark:text-amber-300",
    icon: Clock,
    label: "Pending",
  },
  Accepted: {
    bgColor: "bg-green-50 dark:bg-green-900/20",
    textColor: "text-green-700 dark:text-green-300",
    icon: CheckCircle2,
    label: "Accepted",
  },
  Rejected: {
    bgColor: "bg-red-50 dark:bg-red-900/20",
    textColor: "text-red-700 dark:text-red-300",
    icon: XCircle,
    label: "Rejected",
  },
  Withdrawn: {
    bgColor: "bg-slate-50 dark:bg-slate-900/20",
    textColor: "text-slate-700 dark:text-slate-300",
    icon: XCircle,
    label: "Withdrawn",
  },
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
      label: "Students",
      value: stats?.students,
      icon: Users,
      bgColor: "bg-green-50 dark:bg-green-900/20",
      iconColor: "text-green-600 dark:text-green-400",
      borderColor: "border-green-200 dark:border-green-800",
      href: "/students",
    },
    {
      label: "Placements",
      value: stats?.placements,
      icon: TrendingUp,
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      iconColor: "text-blue-600 dark:text-blue-400",
      borderColor: "border-blue-200 dark:border-blue-800",
      href: "/placements",
    },
    {
      label: "Industry Requests",
      value: stats?.pendingRequests,
      icon: ClipboardList,
      bgColor: "bg-amber-50 dark:bg-amber-900/20",
      iconColor: "text-amber-600 dark:text-amber-400",
      borderColor: "border-amber-200 dark:border-amber-800",
      href: "/industry-requests",
    },
    {
      label: "Job Offers",
      value: stats?.receivedOffers,
      icon: Inbox,
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      iconColor: "text-purple-600 dark:text-purple-400",
      borderColor: "border-purple-200 dark:border-purple-800",
      href: "/received-offers",
    },
  ];

  const actions = [
    {
      icon: Users,
      label: "My Students",
      description: "Browse and manage enrolled students",
      href: "/students",
      color: "text-green-600 dark:text-green-400",
      bgHover: "hover:bg-green-50 dark:hover:bg-green-900/10",
    },
    {
      icon: Briefcase,
      label: "Placements",
      description: "Track placement records and statistics",
      href: "/placements",
      color: "text-blue-600 dark:text-blue-400",
      bgHover: "hover:bg-blue-50 dark:hover:bg-blue-900/10",
    },
    {
      icon: ClipboardList,
      label: "Industry Requests",
      description: "Manage recruitment and internship requests",
      href: "/industry-requests",
      color: "text-amber-600 dark:text-amber-400",
      bgHover: "hover:bg-amber-50 dark:hover:bg-amber-900/10",
    },
    {
      icon: Send,
      label: "Job Offers",
      description: "Accept or reject job offers from companies",
      href: "/received-offers",
      color: "text-purple-600 dark:text-purple-400",
      bgHover: "hover:bg-purple-50 dark:hover:bg-purple-900/10",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="relative p-8">
            {/* Decorative background */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 right-0 w-80 h-80 bg-green-200 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            </div>

            <div className="relative flex items-center gap-6">
              <div className="w-16 h-16 rounded-xl bg-green-600 dark:bg-green-500 flex items-center justify-center shadow-lg">
                <Building2 size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                  Welcome, {username} 👋
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  {instituteName ?? "Institute Account"} • Manage students, track placements, handle requests
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <section>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
            Overview
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((card, idx) => (
              <Link
                key={idx}
                href={card.href}
                className={`bg-white dark:bg-slate-800 rounded-xl border ${card.borderColor} shadow-sm hover:shadow-md transition-all duration-200 p-6 group`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg ${card.bgColor} flex items-center justify-center`}>
                    <card.icon size={20} className={card.iconColor} />
                  </div>
                </div>
                {loadingStats ? (
                  <div className="h-8 w-16 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse mb-2" />
                ) : (
                  <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                    {card.value !== undefined ? card.value : "—"}
                  </div>
                )}
                <p className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                  {card.label}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* Offer Status Summary */}
        {stats && stats.receivedOffers > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-2">
                <Clock size={18} className="text-amber-600 dark:text-amber-400" />
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Pending Offers</span>
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {stats.pendingOffers}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Action required from your side
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle2 size={18} className="text-green-600 dark:text-green-400" />
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Accepted Offers</span>
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {stats.acceptedOffers}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Successfully confirmed offers
              </p>
            </div>
          </div>
        )}

        {/* Recent Offers Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Recent Offers
            </h2>
            <Link
              href="/received-offers"
              className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 transition-colors"
            >
              View all
              <ArrowRight size={14} />
            </Link>
          </div>

          {loadingOffers ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-20 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 animate-pulse"
                />
              ))}
            </div>
          ) : recentOffers.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 border-dashed p-12 text-center">
              <Send size={32} className="text-slate-400 dark:text-slate-600 mx-auto mb-3 opacity-50" />
              <p className="text-slate-600 dark:text-slate-400 font-medium">
                No job offers received yet
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Check back later for new opportunities
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOffers.map((offer) => {
                const sc = statusConfig[offer.status] ?? statusConfig["Pending"];
                const StatusIcon = sc.icon;
                const salary = salaryStr(offer.salary_min, offer.salary_max);

                return (
                  <div
                    key={offer.offer_id}
                    className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all p-5 group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-slate-900 dark:text-white truncate">
                            {offer.job_title}
                          </h3>
                          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${sc.bgColor} ${sc.textColor} flex-shrink-0`}>
                            <StatusIcon size={12} />
                            {sc.label}
                          </div>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1">
                          <Building2 size={14} />
                          {offer.industry?.industry_name ?? "Industry"}
                        </p>
                      </div>

                      <div className="flex flex-col sm:text-right">
                        {salary && (
                          <div className="font-bold text-slate-900 dark:text-white">
                            {salary}
                          </div>
                        )}
                        {offer.last_date && (
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Due: <span className="font-semibold">{offer.last_date}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {actions.map((action, idx) => (
              <Link
                key={idx}
                href={action.href}
                className={`bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all p-6 group ${action.bgHover}`}
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-slate-100 dark:bg-slate-700 group-hover:scale-110 transition-transform`}>
                  <action.icon size={20} className={action.color} />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {action.label}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  {action.description}
                </p>
                <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                  View
                  <ArrowRight size={12} />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Footer Note */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 text-sm text-blue-900 dark:text-blue-300">
          <span className="font-semibold">📌 Note:</span> All data is scoped to your institute. Contact the admin for access to other modules.
        </div>
      </div>
    </div>
  );
}