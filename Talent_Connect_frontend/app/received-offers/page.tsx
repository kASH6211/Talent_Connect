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
  Users2,
  MailOpen,
  Users,
  Eye,
  Check,
  X,
} from "lucide-react";
import api from "@/lib/api";
import OfferViewModal from "@/views/received-offers/view/OfferViewModal";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

/* ─── Types & Helpers ─────────────────────────────────────────────────────── */
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
  industry?: { industry_name?: string };
}

function fmt(n?: number) {
  if (!n) return null;
  return `₹${(n / 100000).toFixed(1)}L`;
}

function salaryStr(min?: number, max?: number) {
  const mn = fmt(min),
    mx = fmt(max);
  if (mn && mx) return `${mn} – ${mx}`;
  if (mn) return `From ${mn}`;
  if (mx) return `Up to ${mx}`;
  return null;
}

function formatDate(d?: string) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return d;
  }
}

/* ─── Status Badge ────────────────────────────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  const map: Record<string, { cls: string; Icon: any }> = {
    pending: {
      cls: "bg-warning/15 text-warning border-warning/25",
      Icon: Clock,
    },
    accepted: {
      cls: "bg-success/15 text-success border-success/25",
      Icon: CheckCircle2,
    },
    rejected: {
      cls: "bg-error/15  text-error  border-error/25",
      Icon: XCircle,
    },
  };
  const { cls, Icon } = map[s] ?? {
    cls: "bg-base-200 text-base-content border-base-300",
    Icon: Clock,
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cls}`}
    >
      <Icon size={11} />
      {status}
    </span>
  );
}

/* ─── Stat Card ───────────────────────────────────────────────────────────── */
function StatCard({
  label,
  count,
  active,
  onClick,
  icon: Icon,
  activeColor,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  icon: any;
  activeColor: string;
}) {
  const colorMap: Record<string, string> = {
    indigo: "border-primary bg-primary/10 shadow-primary/20",
    amber: "border-warning bg-warning/10 shadow-warning/20",
    green: "border-success bg-success/10 shadow-success/20",
    red: "border-error bg-error/10 shadow-error/20",
  };
  const iconMap: Record<string, string> = {
    indigo: "bg-primary text-primary-content",
    amber: "bg-warning text-warning-content",
    green: "bg-success text-success-content",
    red: "bg-error text-error-content",
  };
  const countMap: Record<string, string> = {
    indigo: "text-primary",
    amber: "text-warning",
    green: "text-success",
    red: "text-error",
  };

  return (
    <button
      onClick={onClick}
      className={`
        group relative overflow-hidden rounded-2xl p-5 text-center w-full
        border-2 transition-all duration-300 cursor-pointer
        ${
          active
            ? `${colorMap[activeColor]} shadow-lg`
            : "border-base-300 dark:border-base-700 bg-base-100 dark:bg-base-900 hover:border-base-400 dark:hover:border-base-600 shadow-sm hover:shadow-md"
        }
      `}
    >
      <div
        className={`w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${active ? iconMap[activeColor] : "bg-base-200 dark:bg-base-800 text-base-content/60"}`}
      >
        <Icon size={18} />
      </div>
      <div
        className={`text-3xl font-black leading-none mb-1 tracking-tight ${active ? countMap[activeColor] : "text-base-content"}`}
      >
        {count}
      </div>
      <div className="text-[10px] font-bold tracking-widest uppercase text-base-content/50">
        {label}
      </div>
    </button>
  );
}

/* ─── Main Page ───────────────────────────────────────────────────────────── */
export default function ReceivedOffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>("All");

  const [currentOffer, setCurrentOffer] = useState<Offer | null>(null);
  const [viewModal, setViewModal] = useState<boolean>(false);

  const currentOfferRedirect: any = useSelector(
    (state: RootState) => state?.institutes?.offer,
  );

  useEffect(() => {
    if (currentOfferRedirect?.status) setFilter(currentOfferRedirect.status);
  }, [currentOfferRedirect]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/job-offer/received");
      setOffers(res.data ?? []);
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

  const tabs = ["All", "Pending", "Accepted", "Rejected"];
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

  const statConfig = [
    { tab: "All", icon: Users, activeColor: "indigo" },
    { tab: "Pending", icon: Clock, activeColor: "amber" },
    { tab: "Accepted", icon: CheckCircle2, activeColor: "green" },
    { tab: "Rejected", icon: XCircle, activeColor: "red" },
  ];

  return (
    <div className="w-full  mx-auto">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
            <MailOpen
              size={22}
              className="text-primary-content"
              strokeWidth={2}
            />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-base-content tracking-tight leading-tight">
              Received Offers
            </h1>
            <p className="text-sm text-base-content/50 mt-0.5">
              Manage incoming job offers from industry partners
            </p>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      {!loading && offers.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {statConfig.map(({ tab, icon, activeColor }) => (
            <StatCard
              key={tab}
              label={tab === "All" ? "Total" : tab}
              count={counts[tab]}
              active={filter === tab}
              onClick={() => setFilter(tab)}
              icon={icon}
              activeColor={activeColor}
            />
          ))}
        </div>
      )}

      {/* ── Content ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-base-content/50">
          <Loader2 size={32} className="animate-spin text-primary" />
          <p className="text-sm">Loading received offers…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl border-2 border-dashed border-base-300 dark:border-base-700 bg-base-100 dark:bg-base-900 gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Send size={24} className="text-primary" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-base-content">No offers found</p>
            <p className="text-sm text-base-content/50 mt-1">
              {filter === "All"
                ? "No job offers have been received yet."
                : `No ${filter.toLowerCase()} offers at the moment.`}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((offer, index) => {
            const isPending = offer.status === "Pending";
            const salary = salaryStr(offer.salary_min, offer.salary_max);
            const isUpdating = updating === offer.offer_id;

            return (
              <div
                key={offer.offer_id}
                className="rounded-2xl border border-base-300 dark:border-base-700 bg-base-100 dark:bg-base-900 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Card body */}
                <div className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    {/* Left: info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h2 className="text-base font-bold text-base-content leading-tight truncate">
                          {offer.job_title}
                        </h2>
                        <StatusBadge status={offer.status} />
                      </div>

                      <div className="flex items-center gap-1.5 text-sm text-base-content/60 mb-3">
                        <Building2 size={13} />
                        <span>
                          {offer.industry?.industry_name || "Industry Partner"}
                        </span>
                      </div>

                      {/* Meta row */}
                      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-base-content/55">
                        <span className="flex items-center gap-1">
                          <CalendarDays size={12} />
                          Sent: {formatDate(offer.offer_date)}
                        </span>
                        {offer.last_date && (
                          <span className="flex items-center gap-1">
                            <CalendarClock size={12} />
                            Apply by: {formatDate(offer.last_date)}
                          </span>
                        )}
                        {offer.number_of_posts && (
                          <span className="flex items-center gap-1">
                            <Users2 size={12} />
                            {offer.number_of_posts} post
                            {offer.number_of_posts !== 1 ? "s" : ""}
                          </span>
                        )}
                        {salary && (
                          <span className="flex items-center gap-1 text-success font-semibold">
                            {salary}
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      {offer.job_description && (
                        <p className="mt-3 text-sm text-base-content/60 line-clamp-2 leading-relaxed">
                          {offer.job_description}
                        </p>
                      )}
                    </div>

                    {/* Right: actions */}
                    <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                      {/* View button */}
                      <button
                        onClick={() => {
                          setCurrentOffer(offer);
                          setViewModal(true);
                        }}
                        title="View details"
                        className="w-8 h-8 rounded-lg border border-base-300 dark:border-base-700 bg-base-200 dark:bg-base-800 text-base-content/60 hover:border-primary hover:bg-primary hover:text-primary-content flex items-center justify-center transition-all duration-200"
                      >
                        <Eye size={15} />
                      </button>

                      {/* Accept / Reject — only for Pending */}
                      {isPending && (
                        <>
                          <button
                            onClick={() =>
                              updateStatus(offer.offer_id, "Accepted")
                            }
                            disabled={isUpdating}
                            title="Accept offer"
                            className="h-8 px-3 rounded-lg bg-success/15 hover:bg-success text-success hover:text-success-content border border-success/30 hover:border-success text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 disabled:opacity-50"
                          >
                            {isUpdating ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <Check size={13} />
                            )}
                            Accept
                          </button>

                          <button
                            onClick={() =>
                              updateStatus(offer.offer_id, "Rejected")
                            }
                            disabled={isUpdating}
                            title="Reject offer"
                            className="h-8 px-3 rounded-lg bg-error/15 hover:bg-error text-error hover:text-error-content border border-error/30 hover:border-error text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 disabled:opacity-50"
                          >
                            {isUpdating ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <X size={13} />
                            )}
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Modal ── */}
      <OfferViewModal
        open={viewModal}
        setOpen={setViewModal}
        offer={currentOffer}
        onAccept={() => {
          if (currentOffer) {
            updateStatus(currentOffer.offer_id, "Accepted").then(() =>
              setViewModal(false),
            );
          }
        }}
        onReject={() => {
          if (currentOffer) {
            updateStatus(currentOffer.offer_id, "Rejected").then(() =>
              setViewModal(false),
            );
          }
        }}
      />
    </div>
  );
}
