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
  MailOpen,
  Users,
  Check,
  X,
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
  { color: string; icon: any; label: string; bgColor: string }
> = {
  Pending: {
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-900/20",
    icon: Clock,
    label: "Pending",
  },
  Accepted: {
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-900/20",
    icon: CheckCircle2,
    label: "Accepted",
  },
  Rejected: {
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-900/20",
    icon: XCircle,
    label: "Rejected",
  },
  Withdrawn: {
    color: "text-slate-600 dark:text-slate-400",
    bgColor: "bg-slate-50 dark:bg-slate-900/20",
    icon: XCircle,
    label: "Withdrawn",
  },
};

export default function ReceivedOffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>("All");

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
    if (mn && mx) return `${mn} – ${mx}`;
    if (mn) return `From ${mn}`;
    if (mx) return `Up to ${mx}`;
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

  function Detail({ icon: Icon, label, value }: any) {
    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Icon size={14} className="flex-shrink-0" />
          <span>{label}</span>
        </div>
        <div className="text-sm font-semibold text-slate-900 dark:text-white">
          {value ?? "—"}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-600 dark:bg-blue-500 flex items-center justify-center">
              <MailOpen size={20} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Received Job Offers
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400 ml-13">
            Job offers sent to your institute by industry partners
          </p>
        </div>

        {/* Tab Filter */}
        {!loading && offers.length > 0 && (
          <div className="mb-6 overflow-x-auto">
            <div className="flex gap-2 pb-2">
              {tabs.map((t) => {
                const isActive = filter === t;
                const count = counts[t] || 0;

                return (
                  <button
                    key={t}
                    onClick={() => setFilter(t)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                      isActive
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-400"
                    }`}
                  >
                    {t} <span className="ml-1.5 font-bold">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-40 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 animate-pulse"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-500 dark:text-slate-400 text-center">
            <div className="w-16 h-16 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
              <Send size={28} className="text-slate-400 dark:text-slate-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                {filter === "All"
                  ? "No job offers"
                  : `No ${filter.toLowerCase()} offers`}
              </h3>
              <p className="text-sm">Check back later for new opportunities</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((offer) => {
              const sc = statusConfig[offer.status] ?? statusConfig["Pending"];
              const StatusIcon = sc.icon;
              const salary = salaryStr(offer.salary_min, offer.salary_max);
              const isPending = offer.status === "Pending";

              return (
                <div
                  key={offer.offer_id}
                  className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all overflow-hidden"
                >
                  {/* Status Bar */}
                  <div className={`h-1 ${sc.bgColor}`} />

                  <div className="p-6">
                    {/* Top Section */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3 mb-2">
                          <div className="flex-1">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                              {offer.job_title}
                            </h2>
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                              <Building2 size={14} />
                              <span className="font-medium">
                                {offer.industry?.industry_name ?? "Industry"}
                              </span>
                            </div>
                          </div>
                          <div
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${sc.bgColor} flex-shrink-0`}
                          >
                            <StatusIcon size={14} className={sc.color} />
                            <span className={`text-xs font-semibold ${sc.color}`}>
                              {sc.label}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-medium px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg whitespace-nowrap">
                        ID: {offer.offer_id}
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
                      <Detail
                        icon={CalendarDays}
                        label="Offer Date"
                        value={formatDate(offer.offer_date)}
                      />
                      <Detail
                        icon={CalendarClock}
                        label="Apply By"
                        value={formatDate(offer.last_date)}
                      />
                      <Detail
                        icon={Users2}
                        label="Openings"
                        value={offer.number_of_posts?.toString()}
                      />
                      <Detail
                        icon={Banknote}
                        label="Salary (p.a.)"
                        value={salary}
                      />
                    </div>

                    {/* Description */}
                    {offer.job_description && (
                      <div className="mb-6">
                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-2">
                          {offer.job_description}
                        </p>
                      </div>
                    )}

                    {/* Action Buttons - Compact */}
                    {isPending && (
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            updateStatus(offer.offer_id, "Accepted")
                          }
                          disabled={updating === offer.offer_id}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {updating === offer.offer_id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Check size={14} />
                          )}
                          Accept
                        </button>
                        <button
                          onClick={() =>
                            updateStatus(offer.offer_id, "Rejected")
                          }
                          disabled={updating === offer.offer_id}
                          className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {updating === offer.offer_id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <X size={14} />
                          )}
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}