"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  Send,
  CalendarDays,
  Users2,
  MailOpen,
  Users,
  Eye,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import api from "@/lib/api";
import OfferViewModal from "@/views/received-offers/view/OfferViewModal";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

/* ─── Types & Helpers ─────────────────────────────────────────────────────── */
interface Offer {
  offer_id: number;
  eoi_type?: string;
  job_title?: string;
  job_description?: string;
  salary_min?: number;
  salary_max?: number;
  offer_date?: string;
  last_date?: string;
  start_date?: string;
  number_of_posts?: number;
  nature_of_engagement?: string;
  experience_required?: string;
  location?: string;
  is_remote?: boolean;
  duration?: string;
  collaboration_types?: string;
  additional_details?: string;
  status: string;
  industry?: { industry_name?: string; emailId?: string };
}

function fmt(n?: number) {
  if (!n) return null;
  const k = n / 1000;
  return `₹${Number.isInteger(k) ? k : k.toFixed(1)}K`;
}

function salaryStr(min?: number, max?: number) {
  const mn = fmt(min), mx = fmt(max);
  if (mn && mx) return `${mn} – ${mx}`;
  if (mn) return `From ${mn}`;
  if (mx) return `Up to ${mx}`;
  return null;
}

function formatDate(d?: string) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  } catch { return d; }
}

/* ─── Status Badge ────────────────────────────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  const displayStatus = status === "Sent" ? "Received" : status;
  const s = status?.toLowerCase();
  const map: Record<string, { cls: string; Icon: any }> = {
    sent: { cls: "bg-blue-50 text-blue-700 border-blue-200", Icon: Send },
    pending: { cls: "bg-blue-50 text-blue-700 border-blue-200", Icon: Clock },
    discussed: { cls: "bg-warning/15 text-warning border-warning/25", Icon: AlertCircle },
    accepted: { cls: "bg-success/15 text-success border-success/25", Icon: CheckCircle2 },
    rejected: { cls: "bg-error/15  text-error  border-error/25", Icon: XCircle },
    "project initiated": { cls: "bg-purple-100 text-purple-700 border-purple-200", Icon: TrendingUp },
    "project completed": { cls: "bg-green-100 text-green-700 border-green-200", Icon: CheckCircle2 },
  };
  const { cls, Icon } = map[s] ?? { cls: "bg-base-200 text-base-content border-base-300", Icon: Clock };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cls}`}>
      <Icon size={11} />
      {displayStatus}
    </span>
  );
}

/* ─── EOI Type Label ─────────────────────────────────────────────────────── */
function EoiTypePill({ type }: { type?: string }) {
  if (!type) return null;
  const label =
    type === "Placement" ? "🎓 Hire Students" :
      type === "Industrial Training" ? "🏭 Industrial Training" :
        "🤝 Collaboration";
  return (
    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700 border border-indigo-200">
      {label}
    </span>
  );
}

/* ─── Stat Card ───────────────────────────────────────────────────────────── */
function StatCard({ label, count, active, onClick, icon: Icon, activeColor }: {
  label: string; count: number; active: boolean; onClick: () => void; icon: any; activeColor: string;
}) {
  const colorMap: Record<string, string> = {
    indigo: "border-primary bg-primary/10 shadow-primary/20",
    amber: "border-warning bg-warning/10 shadow-warning/20",
    green: "border-success bg-success/10 shadow-success/20",
    red: "border-error bg-error/10 shadow-error/20",
    purple: "border-purple-400 bg-purple-50 shadow-purple-100",
  };
  const iconMap: Record<string, string> = {
    indigo: "bg-primary text-primary-content",
    amber: "bg-warning text-warning-content",
    green: "bg-success text-success-content",
    red: "bg-error text-error-content",
    purple: "bg-purple-600 text-white",
  };
  const countMap: Record<string, string> = {
    indigo: "text-primary", amber: "text-warning", green: "text-success", red: "text-error", purple: "text-purple-700",
  };
  return (
    <button
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl p-5 text-center w-full border-2 transition-all duration-300 cursor-pointer ${active ? `${colorMap[activeColor]} shadow-lg` : "border-base-300 dark:border-base-700 bg-base-100 dark:bg-base-900 hover:border-base-400 shadow-sm hover:shadow-md"}`}
    >
      <div className={`w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${active ? iconMap[activeColor] : "bg-base-200 dark:bg-base-800 text-base-content/60"}`}>
        <Icon size={18} />
      </div>
      <div className={`text-3xl font-black leading-none mb-1 tracking-tight ${active ? countMap[activeColor] : "text-base-content"}`}>{count}</div>
      <div className="text-[10px] font-bold tracking-widest uppercase text-base-content/50">{label}</div>
    </button>
  );
}

/* ─── Main Page ───────────────────────────────────────────────────────────── */
export default function ReceivedOffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("All");
  const [eoiTypeFilter, setEoiTypeFilter] = useState<string>("All");

  const [currentOffer, setCurrentOffer] = useState<Offer | null>(null);
  const [viewModal, setViewModal] = useState<boolean>(false);

  const currentOfferRedirect: any = useSelector((state: RootState) => state?.institutes?.offer);
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

  useEffect(() => { load(); }, []);

  const handleStatusChange = (offerId: number, newStatus: string) => {
    setOffers((prev) => prev.map((o) => o.offer_id === offerId ? { ...o, status: newStatus } : o));
    setViewModal(false);
  };

  /* ── Counters ── */
  const now = useMemo(() => Date.now(), []);
  const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

  // 1. Filter by EOI Type first
  const baseOffers = offers.filter((o) => {
    return eoiTypeFilter === "All" ||
      (eoiTypeFilter === "Placement" && o.eoi_type === "Placement") ||
      (eoiTypeFilter === "Training" && o.eoi_type === "Industrial Training") ||
      (eoiTypeFilter === "Collaboration" && o.eoi_type === "Collaboration");
  });

  const total = baseOffers.length;
  const pendingDisc = baseOffers.filter((o) => (o.status === "Sent" || o.status === "Pending") && now - new Date(o.offer_date ?? 0).getTime() > TWO_DAYS_MS).length;
  const pendingAcc = baseOffers.filter((o) => o.status === "Discussed").length;
  const discussed = baseOffers.filter((o) => o.status === "Discussed").length;
  const accepted = baseOffers.filter((o) => o.status === "Accepted").length;

  const statConfig = [
    { tab: "All", label: "Total EOI Received", count: total, icon: Users, activeColor: "indigo" },
    { tab: "PendingDiscuss", label: "Pending to Discuss (>2d)", count: pendingDisc, icon: Clock, activeColor: "amber" },
    { tab: "PendingAccept", label: "Pending Accept/Reject (>7d)", count: pendingAcc, icon: AlertCircle, activeColor: "red" },
    { tab: "Discussed", label: "Discussed", count: discussed, icon: CheckCircle2, activeColor: "purple" },
    { tab: "Accepted", label: "Accepted", count: accepted, icon: CheckCircle2, activeColor: "green" },
  ];

  const filtered = filter === "All"
    ? baseOffers
    : filter === "PendingDiscuss"
      ? baseOffers.filter((o) => (o.status === "Sent" || o.status === "Pending") && now - new Date(o.offer_date ?? 0).getTime() > TWO_DAYS_MS)
      : filter === "PendingAccept"
        ? baseOffers.filter((o) => o.status === "Discussed")
        : baseOffers.filter((o) => o.status === filter);

  return (
    <div className="w-full mx-auto" style={{ fontFamily: "'Outfit', sans-serif" }}>
      <style>{`
        .sol-btn-eye {
          background: #f8fafc;
          padding: 8px 10px;
          border-radius: 8px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 600;
          border: 1px solid #e2e8f0;
          color: #475569;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
          white-space: nowrap;
          cursor: pointer;
        }
        .sol-btn-text {
          display: inline-block;
          max-width: 0;
          opacity: 0;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          transform: translateX(-5px);
          overflow: hidden;
        }
        .sol-btn-eye:hover {
          padding: 8px 14px;
          background: #eef2ff;
          color: #4f46e5;
          border-color: #c7d2fe;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.15);
        }
        .sol-btn-eye:hover .sol-btn-text {
          max-width: 100px;
          opacity: 1;
          transform: translateX(0);
          margin-left: 6px;
        }
      `}</style>

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
            <MailOpen size={22} className="text-primary-content" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-base-content tracking-tight leading-tight">
              Received EOI
            </h1>
            <p className="text-sm text-base-content/50 mt-0.5">
              Manage incoming Expressions of Interest from industry partners
            </p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <select
            className="select select-bordered select-sm w-full sm:w-auto font-medium"
            value={eoiTypeFilter}
            onChange={(e) => setEoiTypeFilter(e.target.value)}
          >
            <option value="All">All EOI Types</option>
            <option value="Placement">🎓 Hiring</option>
            <option value="Training">🏭 Training</option>
            <option value="Collaboration">🤝 Collaboration</option>
          </select>
        </div>
      </div>

      {/* ── Stat Cards (5) ── */}
      {!loading && offers.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {statConfig.map(({ tab, label, count, icon, activeColor }) => (
            <StatCard key={tab} label={label} count={count} active={filter === tab}
              onClick={() => setFilter(tab)} icon={icon} activeColor={activeColor} />
          ))}
        </div>
      )}

      {/* ── Content ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-base-content/50">
          <Loader2 size={32} className="animate-spin text-primary" />
          <p className="text-sm">Loading received EOI…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl border-2 border-dashed border-base-300 dark:border-base-700 bg-base-100 dark:bg-base-900 gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Send size={24} className="text-primary" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-base-content">No EOI found</p>
            <p className="text-sm text-base-content/50 mt-1">
              {filter === "All" ? "No EOI have been received yet." : `No ${filter.toLowerCase()} EOI at the moment.`}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((offer, index) => {
            const salary = salaryStr(offer.salary_min, offer.salary_max);
            return (
              <div
                key={offer.offer_id}
                className="rounded-2xl border border-base-300 dark:border-base-700 bg-base-100 dark:bg-base-900 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    {/* Left: info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <EoiTypePill type={offer.eoi_type} />
                        {offer.job_title && (
                          <h2 className="text-base font-bold text-base-content leading-tight truncate">
                            {offer.job_title}
                          </h2>
                        )}
                        <StatusBadge status={offer.status} />
                      </div>

                      <div className="flex items-center gap-1.5 text-sm text-base-content/60 mb-3">
                        <Building2 size={13} />
                        <span>{offer.industry?.industry_name || "Industry Partner"}</span>
                      </div>

                      {/* Meta row */}
                      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-base-content/55">
                        <span className="flex items-center gap-1">
                          <CalendarDays size={12} /> Sent: {formatDate(offer.offer_date)}
                        </span>
                        {offer.number_of_posts && (
                          <span className="flex items-center gap-1">
                            <Users2 size={12} /> {offer.number_of_posts} students needed
                          </span>
                        )}
                        {salary && (
                          <span className="flex items-center gap-1 text-success font-semibold">{salary}</span>
                        )}
                        {offer.nature_of_engagement && (
                          <span className="text-base-content/50">{offer.nature_of_engagement}</span>
                        )}
                      </div>

                      {/* Description or collab types */}
                      {offer.job_description && (
                        <p className="mt-3 text-sm text-base-content/60 line-clamp-2 leading-relaxed">
                          {offer.job_description}
                        </p>
                      )}
                      {offer.collaboration_types && !offer.job_description && (
                        <p className="mt-3 text-sm text-base-content/60 line-clamp-2">
                          {offer.collaboration_types.split("|").join(" · ")}
                        </p>
                      )}
                    </div>

                    {/* Right: View button */}
                    <div className="flex items-center gap-2 shrink-0 self-start sm:self-center mt-3 sm:mt-0">
                      <button
                        onClick={() => { setCurrentOffer(offer); setViewModal(true); }}
                        title="View details & update status"
                        className="sol-btn-eye"
                      >
                        <Eye size={16} /> <span className="sol-btn-text">View Details</span>
                      </button>
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
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
