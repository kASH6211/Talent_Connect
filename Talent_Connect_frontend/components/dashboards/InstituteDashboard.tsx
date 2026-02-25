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
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { off } from "process";
import { setCurrentOffer } from "@/store/institute";
import { useRouter } from "next/navigation";

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
      color: "from-success to-success/70",
      note: "enrolled students",
      href: "/students",
    },
    {
      label: "Placements",
      value: stats?.placements,
      icon: TrendingUp,
      color: "from-primary to-primary/70",
      note: "placed students",
      href: "/placements",
    },
    {
      label: "Industry Requests",
      value: stats?.pendingRequests,
      icon: ClipboardList,
      color: "from-warning to-warning/70",
      note: "pending requests",
      href: "/industry-requests",
    },
    {
      label: "Received Offers",
      value: stats?.receivedOffers,
      icon: Inbox,
      color: "from-secondary to-secondary/70",
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
      color: "from-success to-success/70",
    },
    {
      icon: Briefcase,
      label: "View Placements",
      description: "Track placement records for your students",
      href: "/placements",
      color: "from-primary to-primary/70",
    },
    {
      icon: ClipboardList,
      label: "Industry Requests",
      description: "Manage campus placement & internship requests",
      href: "/industry-requests",
      color: "from-warning to-warning/70",
    },
    {
      icon: Send,
      label: "Received Offers",
      description: "Accept or reject job offers from industries",
      href: "/received-offers",
      color: "from-secondary to-secondary/70",
    },
  ];

  // ─── COMPACT RENDER (ULTRA-MINIMAL SPACING) ────────────────────────────────
  return (
    <div className="p-2 sm:p-3 lg:p-4">
      <div className="w-full space-y-4">
        {/* Hero Section - Compact */}
        <div className="relative overflow-hidden p-4 rounded-xl bg-gradient-to-br from-success/5 via-base-100 to-base-100 border border-success/20 shadow-sm">
          <div className="absolute top-0 right-0 w-24 h-24 bg-success/3 rounded-full -translate-y-1/2 translate-x-1/2" />

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-success to-success/70 flex items-center justify-center shadow-md">
              <Building2 size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-base-content">
                Welcome, {username} 👋
              </h1>
              <p className="text-success text-xs sm:text-sm">
                Institute Portal · {instituteName ?? "Institute Account"}
              </p>
            </div>
          </div>

          <p className="mt-2 text-sm text-base-content/70 max-w-lg">
            Manage students, track placements, handle industry requests
          </p>
        </div>

        {/* Stats Cards - Compact */}
        <section>
          <h2 className="text-xs font-semibold text-base-content/60 uppercase tracking-wider mb-3">
            Overview
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {statCards.map((c, idx) => (
              <Link
                key={idx}
                href={c.href}
                className="group bg-base-100 rounded-lg p-3 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all border border-base-200/50 h-full flex flex-col justify-between"
              >
                <div
                  className={`w-9 h-9 rounded-lg bg-gradient-to-br ${c.color} flex items-center justify-center mb-2 shadow-md`}
                >
                  <c.icon size={16} className="text-white" />
                </div>
                {loadingStats ? (
                  <div className="h-6 w-12 rounded bg-base-200 animate-pulse mb-1" />
                ) : (
                  <div className="text-lg font-bold text-base-content">
                    {c.value !== undefined ? c.value : "—"}
                  </div>
                )}
                <div className="text-xs text-base-content/60 mb-1">
                  {c.note}
                </div>
                <div className="text-xs font-semibold text-base-content/80 group-hover:text-primary transition-colors">
                  {c.label}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Offer Status Badges - Compact */}
        {stats && stats.receivedOffers > 0 && (
          <div className="flex gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-warning/5 border border-warning/20 text-xs">
              <Clock size={12} className="text-warning" />
              <span className="font-semibold text-warning">
                {stats.pendingOffers}
              </span>
              <span className="text-base-content/60">pending</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success/5 border border-success/20 text-xs">
              <CheckCircle2 size={12} className="text-success" />
              <span className="font-semibold text-success">
                {stats.acceptedOffers}
              </span>
              <span className="text-base-content/60">accepted</span>
            </div>
          </div>
        )}

        {/* Recent Offers - Compact */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-base-content/60 uppercase tracking-wider">
              Recent Offers
            </h2>
            <Link
              href="/received-offers"
              className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-all"
            >
              View all <ArrowRight size={10} />
            </Link>
          </div>
          {loadingOffers ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-12 rounded-lg bg-base-100 border border-base-200/50 animate-pulse shadow-sm"
                />
              ))}
            </div>
          ) : recentOffers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-base-content/40 text-center rounded-lg border-2 border-dashed border-base-200 bg-base-50">
              <div className="w-10 h-10 rounded-lg bg-base-100 border border-base-200 flex items-center justify-center">
                <Send size={20} className="opacity-40" />
              </div>
              <p className="text-sm">No job offers received yet</p>
            </div>
          ) : (
            <div className="space-y-2">
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
                    className="group flex items-center gap-3 p-3 rounded-lg bg-base-100 border border-base-200/50 hover:border-primary/30 hover:bg-base-50 hover:shadow-sm transition-all"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-semibold text-base-content truncate max-w-[180px]">
                          {offer.job_title}
                        </span>
                        <span
                          className={`badge ${sc.badge} badge-xs text-xs px-2 py-0.5 gap-0.5`}
                        >
                          <StatusIcon size={9} />
                          {sc.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-xs text-base-content/60">
                        <Building2 size={10} />
                        <span className="truncate max-w-[120px]">
                          {offer.industry?.industry_name ?? "Industry"}
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right min-w-[100px]">
                      {salary && (
                        <div className="text-xs font-bold text-success">
                          {salary}
                        </div>
                      )}
                      {offer.last_date && (
                        <div className="text-xs text-base-content/50 mt-0.5">
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

        {/* Quick Actions - Compact */}
        <section>
          <h2 className="text-xs font-semibold text-base-content/60 uppercase tracking-wider mb-3">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {actions.map((a, idx) => (
              <Link
                key={idx}
                href={a.href}
                className="group bg-base-100 rounded-lg p-3 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all border border-base-200/50 h-full flex flex-col"
              >
                <div
                  className={`w-9 h-9 rounded-lg bg-gradient-to-br ${a.color} flex items-center justify-center mb-2 shadow-md group-hover:scale-105 transition-transform`}
                >
                  <a.icon size={16} className="text-white" />
                </div>
                <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">
                  {a.label}
                </h3>
                <p className="text-xs text-base-content/70 flex-1">
                  {a.description}
                </p>
                <div className="mt-2 flex items-center gap-1 text-xs text-base-content/40 group-hover:text-primary transition-all">
                  Open{" "}
                  <ArrowRight
                    size={10}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Info Box - Compact */}
        <div className="p-3 rounded-lg bg-base-50 border border-base-200/50 text-xs text-base-content/70">
          <span className="font-semibold">Note:</span> Data scoped to your
          institute. Contact admin for other modules.
        </div>
      </div>
    </div>
  );
}
