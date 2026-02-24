"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  Send,
  CalendarDays,
  CalendarClock,
  FileText,
  Users2,
  Banknote,
  BadgeCheck,
  MailOpen,
  Users,
  ArrowRight,
} from "lucide-react";
import api from "@/lib/api";

interface Offer {
  offer_id: number;
  job_title: string;
  job_description?: string;
  salary_min?: number;
  salary_max?: number;
  offer_date?: string;
  last_date?: string;
  number_of_posts?: number;
  status: string;
  required_qualification_ids?: string;
  required_program_ids?: string;
  required_stream_ids?: string;
  industry?: { industry_name?: string; email?: string };
}

const statusConfig: Record<
  string,
  { badge: string; icon: any; label: string; ring: string }
> = {
  Pending: {
    badge: "badge-warning",
    icon: Clock,
    label: "Pending",
    ring: "border-warning/20",
  },
  Accepted: {
    badge: "badge-success",
    icon: CheckCircle2,
    label: "Accepted",
    ring: "border-success/20",
  },
  Rejected: {
    badge: "badge-error",
    icon: XCircle,
    label: "Rejected",
    ring: "border-error/20",
  },
  Withdrawn: {
    badge: "badge-neutral",
    icon: XCircle,
    label: "Withdrawn",
    ring: "border-base-300",
  },
};

export default function ReceivedOffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>("All");

  // ─── ALL LOGIC UNCHANGED ───────────────────────────────────────────────────
  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/job-offer/received");
      setOffers(res.data);
    } catch {
      setOffers([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (offer_id: number, status: string) => {
    setUpdating(offer_id);
    try {
      await api.patch(`/job-offer/${offer_id}/status`, { status });
      setOffers((prev) =>
        prev.map((o) => (o.offer_id === offer_id ? { ...o, status } : o)),
      );
    } catch {}
    setUpdating(null);
  };

  const fmt = (n?: number) => (n ? `₹${(n / 100000).toFixed(1)}L` : null);
  const salaryStr = (min?: number, max?: number) => {
    const mn = fmt(min);
    const mx = fmt(max);
    if (mn && mx) return `${mn} – ${mx} per annum`;
    if (mn) return `From ${mn} per annum`;
    if (mx) return `Up to ${mx} per annum`;
    return null;
  };

  const formatDate = (d?: string) => {
    if (!d) return null;
    try {
      return new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return d;
    }
  };

  const tabs = ["All", "Pending", "Accepted", "Rejected", "Withdrawn"];
  const counts = tabs.reduce(
    (acc, t) => ({
      ...acc,
      [t]:
        t === "All"
          ? offers.length
          : offers.filter((o) => o.status === t).length,
    }),
    {} as Record<string, number>,
  );

  const filtered =
    filter === "All" ? offers : offers.filter((o) => o.status === filter);

  // ─── COMPACT Detail Component ──────────────────────────────────────────────
  function Detail({ icon: Icon, label, value, highlight, success }: any) {
    return (
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-1 text-xs text-base-content/50">
          <Icon size={10} />
          <span className="truncate">{label}</span>
        </div>
        <div
          className={`font-medium text-xs ${
            success
              ? "text-success"
              : highlight
                ? "text-warning"
                : value
                  ? "text-base-content"
                  : "text-base-content/30 font-normal"
          }`}
        >
          {value ?? "—"}
        </div>
      </div>
    );
  }

  // ─── RENDER (ULTRA-MINIMAL SPACING) ────────────────────────────────────────
  return (
    <div className="p-2 sm:p-3 lg:p-4">
      <div className="w-full">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-base-content flex items-center gap-2 mb-1">
                <MailOpen size={24} className="text-primary" />
                Received Job Offers
              </h1>
              <p className="text-base-content/60 text-sm sm:text-base max-w-xl">
                Job offers sent to your institute by industry partners
              </p>
            </div>
            {!loading && offers.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {["Pending", "Accepted", "Rejected"].map(
                  (s) =>
                    counts[s] > 0 && (
                      <span
                        key={s}
                        className="badge badge-outline badge-xs text-xs px-2"
                      >
                        {counts[s]} {s}
                      </span>
                    ),
                )}
              </div>
            )}
          </div>
        </div>

        {/* Compact Tabs */}
        {!loading && offers.length > 0 && (
          <section className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
            {tabs.map((t, idx) => {
              const isActive = filter === t;
              const count = counts[t] || 0;
              const Icon =
                t === "All"
                  ? Users
                  : t === "Pending"
                    ? Clock
                    : t === "Accepted"
                      ? CheckCircle2
                      : t === "Rejected"
                        ? XCircle
                        : ArrowRight;

              return (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className="group bg-white/80 hover:bg-white data-[active=true]:bg-primary/90 data-[active=true]:text-white rounded-lg p-3 shadow-sm hover:shadow-md border border-gray-200/50 hover:border-primary/40 transition-all duration-200 h-full flex flex-col justify-center items-center gap-2"
                  data-active={isActive}
                >
                  {/* Icon */}
                  <div
                    className={`w-10 h-10 bg-gradient-to-br ${isActive ? "from-primary to-primary/80 shadow-lg" : "from-gray-100 to-gray-200 group-hover:from-primary/10"} rounded-lg flex items-center justify-center transition-all mb-2`}
                  >
                    <Icon
                      size={18}
                      className={`${isActive ? "text-white drop-shadow-sm" : "text-gray-600 group-hover:text-primary"}`}
                    />
                  </div>

                  {/* Label - Always visible, bold on hover */}
                  <p
                    className={`text-xs font-semibold transition-all ${isActive ? "text-white" : "text-gray-700 group-hover:text-primary font-bold"}`}
                  >
                    {t}
                  </p>

                  {/* Count */}
                  <p className="text-lg font-bold text-gray-900 data-[active=true]:text-white">
                    {count}
                  </p>
                </button>
              );
            })}
          </section>
        )}

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 gap-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-32 rounded-xl bg-base-100 border border-base-200 animate-pulse"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-base-content/40 text-center">
            <div className="w-14 h-14 rounded-xl bg-base-100 border border-base-200 flex items-center justify-center">
              <Send size={24} className="opacity-40" />
            </div>
            <div>
              <h3 className="text-lg font-bold mb-1">
                {filter === "All"
                  ? "No job offers"
                  : `No ${filter.toLowerCase()} offers`}
              </h3>
              <p className="text-sm">Check back later for new opportunities</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((offer) => {
              const sc = statusConfig[offer.status] ?? statusConfig["Pending"];
              const StatusIcon = sc.icon;
              const salary = salaryStr(offer.salary_min, offer.salary_max);
              const isPending = offer.status === "Pending";

              return (
                <div
                  key={offer.offer_id}
                  className={`rounded-xl bg-base-100 border-2 ${sc.ring} shadow-sm hover:shadow-md transition-all duration-200 p-4`}
                >
                  {/* Header - Compact */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-lg font-bold text-base-content truncate">
                          {offer.job_title}
                        </h2>
                        <span
                          className={`badge ${sc.badge} badge-sm text-xs gap-1 px-2 py-0.5`}
                        >
                          <StatusIcon size={10} />
                          {sc.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1.5 text-xs text-base-content/60">
                        <Building2 size={12} />
                        <span className="font-medium truncate">
                          {offer.industry?.industry_name ?? "Industry"}
                        </span>
                        {offer.industry?.email && (
                          <span className="opacity-50 truncate max-w-32">
                            · {offer.industry.email}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs bg-base-50 px-2 py-0.5 rounded-full text-base-content/40 whitespace-nowrap">
                      #{offer.offer_id}
                    </span>
                  </div>

                  {/* Details Grid - Compact */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                    <Detail
                      icon={CalendarDays}
                      label="Offer Date"
                      value={formatDate(offer.offer_date)}
                    />
                    <Detail
                      icon={CalendarClock}
                      label="Apply By"
                      value={formatDate(offer.last_date)}
                      highlight
                    />
                    <Detail
                      icon={Users2}
                      label="Posts"
                      value={offer.number_of_posts?.toString() ?? null}
                    />
                    <Detail
                      icon={Banknote}
                      label="Salary"
                      value={salary}
                      success
                    />
                  </div>

                  {/* Description - Compact */}
                  {offer.job_description && (
                    <div className="pt-3 mt-3 border-t border-base-200">
                      <div className="flex items-center gap-1.5 text-xs text-base-content/50 mb-1.5">
                        <FileText size={10} />
                        <span>Job Description</span>
                      </div>
                      <p className="text-sm text-base-content/70 leading-relaxed text-xs max-h-12 overflow-hidden line-clamp-3">
                        {offer.job_description}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons - Compact */}
                  {isPending && (
                    <div className="pt-3 mt-3 border-t border-base-200">
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            updateStatus(offer.offer_id, "Accepted")
                          }
                          disabled={updating === offer.offer_id}
                          className="btn btn-success text-xs gap-1 px-3 py-1.5 flex-1 h-auto"
                        >
                          {updating === offer.offer_id ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <CheckCircle2 size={12} />
                          )}
                          Accept
                        </button>
                        <button
                          onClick={() =>
                            updateStatus(offer.offer_id, "Rejected")
                          }
                          disabled={updating === offer.offer_id}
                          className="btn btn-outline btn-error text-xs gap-1 px-3 py-1.5 flex-1 h-auto"
                        >
                          {updating === offer.offer_id ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <XCircle size={12} />
                          )}
                          Reject
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
