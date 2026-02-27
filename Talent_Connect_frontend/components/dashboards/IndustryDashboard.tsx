"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Briefcase,
  ClipboardList,
  Factory,
  ArrowRight,
  CheckCircle2,
  Users,
  GraduationCap,
  TrendingUp,
  Calendar,
  Award,
  Sparkles,
  Clock,
  Ban,
  XCircle,
  Send,
  Loader2,
} from "lucide-react";
import api from "@/lib/api";
import { setCurrentIndustry } from "@/store/industry";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Offer {
  status: string;
  [key: string]: any;
}

// ─── Quick Actions ────────────────────────────────────────────────────────────
const quickActions = [
  {
    icon: Sparkles,
    title: "New Placement Drive",
    description: "Launch recruitment or internship drive",
    href: "/industry-requests/new",
    gradient: "from-success to-success/70",
    badge: "Popular",
  },
  {
    icon: Users,
    title: "View Candidates",
    description: "Browse student profiles",
    href: "/placements/candidates",
    gradient: "from-primary to-primary/70",
  },
  {
    icon: Briefcase,
    title: "Track Placements",
    description: "Monitor status & analytics",
    href: "/placements",
    gradient: "from-secondary to-secondary/70",
  },
  {
    icon: GraduationCap,
    title: "Find Institutes",
    description: "Search by location & courses",
    href: "/find-institutes",
    gradient: "from-accent to-accent/70",
  },
];

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  icon: Icon,
  iconClass,
  valueClass,
  active,
  onClick,
  loading,
}: {
  label: string;
  value: number | string;
  icon: any;
  iconClass: string;
  valueClass: string;
  active?: boolean;
  onClick?: () => void;
  loading?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        group relative text-left bg-base-100 dark:bg-base-900 rounded-2xl p-5 border-2
        shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden w-full
        ${
          active
            ? `${iconClass.replace("bg-", "border-").split(" ")[0]} shadow-md`
            : "border-base-300 dark:border-base-700 hover:border-base-400 dark:hover:border-base-600"
        }
      `}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold uppercase tracking-widest text-base-content/50 mb-1.5">
            {label}
          </p>
          {loading ? (
            <div className="h-8 w-16 bg-base-200 dark:bg-base-800 rounded-lg animate-pulse" />
          ) : (
            <p
              className={`text-3xl font-black leading-none tracking-tight ${valueClass}`}
            >
              {value}
            </p>
          )}
        </div>
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-3 ${iconClass}`}
        >
          <Icon size={20} className="text-white" />
        </div>
      </div>
    </button>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function IndustryDashboard({
  username,
  industryName = "Leading Tech Corp",
}: {
  username: string;
  industryName?: string;
}) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    api
      .get("/job-offer/sent")
      .then((res) => setOffers(res.data ?? []))
      .catch(() => setOffers([]))
      .finally(() => setLoadingStats(false));
  }, []);

  const total = offers.length;
  const accepted = offers.filter((o) => o.status === "Accepted").length;
  const pending = offers.filter((o) => o.status === "Pending").length;
  const rejected = offers.filter((o) => o.status === "Rejected").length;
  const withdrawn = offers.filter((o) => o.status === "Withdrawn").length;

  const statsData = [
    {
      label: "Total Sent",
      value: total,
      icon: TrendingUp,
      iconClass: "bg-primary",
      valueClass: "text-primary",
    },
    {
      label: "Accepted",
      value: accepted,
      icon: CheckCircle2,
      iconClass: "bg-success",
      valueClass: "text-success",
    },
    {
      label: "Pending",
      value: pending,
      icon: Clock,
      iconClass: "bg-warning",
      valueClass: "text-warning",
    },
    {
      label: "Not Interested",
      value: rejected,
      icon: Ban,
      iconClass: "bg-error",
      valueClass: "text-error",
    },
    {
      label: "Withdrawn",
      value: withdrawn,
      icon: XCircle,
      iconClass: "bg-secondary",
      valueClass: "text-secondary",
    },
  ];

  return (
    <div className="w-full  mx-auto">
      {/* ── Hero ── */}
      <div className="relative overflow-hidden rounded-2xl bg-base-100 dark:bg-base-900 border border-base-300 dark:border-base-700 shadow-sm p-6 sm:p-7 mb-8">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-primary/8 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 flex-shrink-0">
              <Factory
                size={22}
                className="text-primary-content"
                strokeWidth={2}
              />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-base-content tracking-tight leading-tight">
                Welcome, {username} 👋
              </h1>
              <p className="text-sm text-primary font-semibold mt-0.5">
                Industry Dashboard · {industryName}
              </p>
            </div>
          </div>
          <Link
            href="/find-institutes"
            className="btn btn-primary btn-sm gap-2 self-start sm:self-auto shadow-md"
          >
            <Send size={14} /> Send Offers
          </Link>
        </div>
        <p className="mt-4 text-sm text-base-content/50 max-w-2xl">
          Manage drives, track placements, and collaborate with institutes
          seamlessly.
        </p>
      </div>

      {/* ── Offer Stats ── */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-base-content/50">
            Offer Overview
          </h2>
          <Link
            href="/sent-offers"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            View all <ArrowRight size={12} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {statsData.map((stat) => (
            <StatCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              icon={stat.icon}
              iconClass={stat.iconClass}
              valueClass={stat.valueClass}
              loading={loadingStats}
              onClick={() => {
                dispatch(setCurrentIndustry(stat));
                router.push("/sent-offers");
              }}
            />
          ))}
        </div>
      </section>

      {/* ── Quick Actions ── */}
      <section className="mb-8">
        <h2 className="text-sm font-bold uppercase tracking-widest text-base-content/50 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <Link
                key={idx}
                href={action.href}
                className="group relative bg-base-100 dark:bg-base-900 rounded-2xl p-5 border border-base-300 dark:border-base-700 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col h-full"
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-11 h-11 flex items-center justify-center rounded-xl bg-gradient-to-br ${action.gradient} shadow-md group-hover:scale-110 group-hover:rotate-3 transition-transform duration-200`}
                  >
                    <Icon size={20} className="text-white" />
                  </div>
                  {action.badge && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-success/10 text-success border border-success/20 px-2 py-0.5 rounded-full">
                      {action.badge}
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-sm text-base-content group-hover:text-primary transition-colors mb-1">
                  {action.title}
                </h3>
                <p className="text-xs text-base-content/55 flex-1 leading-relaxed">
                  {action.description}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Bottom Section ── */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-base-100 dark:bg-base-900 rounded-2xl p-5 sm:p-6 border border-base-300 dark:border-base-700 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-widest text-base-content/50 mb-4">
            Recent Activity
          </h3>
          <div className="space-y-2">
            {[
              {
                title: "NIT Trichy - Campus Drive Approved",
                time: "2h ago",
                icon: CheckCircle2,
              },
              {
                title: "IIT Bombay - 50 Applications Received",
                time: "1 day ago",
                icon: Users,
              },
              {
                title: "VIT Vellore - Drive Scheduled",
                time: "3 days ago",
                icon: Calendar,
              },
            ].map((activity, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-base-200/50 dark:hover:bg-base-800/50 transition-colors group cursor-pointer border border-transparent hover:border-base-300 dark:hover:border-base-700"
              >
                <div className="w-9 h-9 flex items-center justify-center bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors flex-shrink-0">
                  <activity.icon size={16} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-base-content truncate">
                    {activity.title}
                  </p>
                  <p className="text-xs text-base-content/50 flex items-center gap-1 mt-0.5">
                    <Clock size={11} /> {activity.time}
                  </p>
                </div>
                <ArrowRight
                  size={14}
                  className="text-base-content/30 group-hover:translate-x-0.5 group-hover:text-primary transition-all flex-shrink-0"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Success Rate Card */}
        <div className="bg-base-100 dark:bg-base-900 rounded-2xl p-5 sm:p-6 border border-warning/25 bg-warning/5 shadow-sm flex flex-col items-center justify-center text-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-warning/15 border border-warning/25 flex items-center justify-center">
            <Award size={26} className="text-warning" />
          </div>
          <div>
            {loadingStats ? (
              <div className="h-12 w-24 bg-base-200 dark:bg-base-800 rounded-xl animate-pulse mx-auto mb-2" />
            ) : (
              <p className="text-5xl font-black text-warning leading-none">
                {total > 0 ? `${Math.round((accepted / total) * 100)}%` : "—"}
              </p>
            )}
            <p className="text-sm text-base-content/60 mt-2 font-medium">
              Offer Acceptance Rate
            </p>
            {!loadingStats && total > 0 && (
              <p className="text-xs text-base-content/40 mt-1">
                {accepted} of {total} offers accepted
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
