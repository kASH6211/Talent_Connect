"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  CalendarDays,
  Users2,
  MailOpen,
  Users,
  Eye,
  TrendingUp,
  AlertCircle,
  Mail,
  Check,
  X,
  Square,
  CheckSquare,
  ArrowRight,
} from "lucide-react";
import api from "@/lib/api";
import OfferViewModal from "@/views/received-offers/view/OfferViewModal";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import clsx from "clsx";
import Pagination from "@/components/common/Pagination";
import { globalNotify } from "@/lib/notification";

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
    sent: { cls: "bg-blue-50 text-blue-700 border-blue-200", Icon: Mail },
    pending: { cls: "bg-blue-50 text-blue-700 border-blue-200", Icon: Clock },
    discussed: { cls: "bg-warning/15 text-warning border-warning/25", Icon: AlertCircle },
    accepted: { cls: "bg-success/15 text-success border-success/25", Icon: CheckCircle2 },
    rejected: { cls: "bg-error/15  text-error  border-error/25", Icon: XCircle },
    "project initiated": { cls: "bg-purple-100 text-purple-700 border-purple-200", Icon: TrendingUp },
    "project completed": { cls: "bg-green-100 text-green-700 border-green-200", Icon: CheckCircle2 },
  };
  const { cls, Icon } = map[s] ?? { cls: "bg-base-200 text-base-content border-base-300", Icon: Clock };
  return (
    <span className={clsx("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border", cls)}>
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
    yellow  :"border-yellow-400 bg-yellow-50 shadow-yellow-100",
  };
  const iconMap: Record<string, string> = {
    indigo: "bg-primary text-primary-content",
    amber: "bg-warning text-warning-content",
    green: "bg-success text-success-content",
    red: "bg-error text-error-content",
    purple: "bg-purple-600 text-white",
    yellow :"bg-yellow-600 text-white",
  };
  const countMap: Record<string, string> = {
    indigo: "text-primary", amber: "text-warning", green: "text-success", red: "text-error", purple: "text-purple-700",
  };
  return (
    <button
      onClick={onClick}
      className={clsx(
        "group relative overflow-hidden rounded-2xl p-5 text-center w-full border-2 transition-all duration-300 cursor-pointer focus:outline-none focus:ring-0",
        active ? `${colorMap[activeColor]} shadow-lg` : "border-base-300 dark:border-base-700 bg-base-100 dark:bg-base-900 hover:border-base-400 shadow-sm hover:shadow-md"
      )}
    >
      <div className={clsx(
        "w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3",
        active ? iconMap[activeColor] : "bg-base-200 dark:bg-base-800 text-base-content/60"
      )}>
        <Icon size={18} />
      </div>
      <div className={clsx("text-3xl font-black leading-none mb-1 tracking-tight", active ? countMap[activeColor] : "text-base-content")}>{count}</div>
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
  const statContainerRef = useRef<HTMLDivElement>(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [currentOffer, setCurrentOffer] = useState<Offer | null>(null);
  const [viewModal, setViewModal] = useState<boolean>(false);
  const [updating, setUpdating] = useState(false);

  const currentOfferRedirect: any = useSelector((state: RootState) => state?.institutes?.offer);

  useEffect(() => {
    if (currentOfferRedirect?.status) setFilter(currentOfferRedirect.status);
  }, [currentOfferRedirect]);

  const load = useCallback(async (targetPage = page, targetLimit = limit) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: targetPage.toString(),
        limit: targetLimit.toString(),
      });
      const res = await api.get(`/job-offer/received?${params}`);

      let data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      if (!Array.isArray(data)) data = [];

      setOffers(data);
      setTotal(res.data?.total || data.length);
      setPage(targetPage);
      setLimit(targetLimit);
      setSelected(new Set()); // Reset selection on page change
    } catch {
      setOffers([]);
      setTotal(0);
    }
    setLoading(false);
  }, [page, limit]);

  useEffect(() => {
    load(1);
  }, [load]);

  // clear selection when clicking outside the stat cards
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (statContainerRef.current && !statContainerRef.current.contains(e.target as Node)) {
        setFilter("All");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleStatusChange = (offerId: number, newStatus: string) => {
    setOffers((prev) => prev.map((o) => o.offer_id === offerId ? { ...o, status: newStatus } : o));
    setViewModal(false);
  };

  const updateSingleStatus = async (id: number, status: string) => {
    setUpdating(true);
    try {
      await api.patch(`/job-offer/${id}/status`, { status });
      setOffers(prev => prev.map(o => o.offer_id === id ? { ...o, status } : o));
      globalNotify(`Set to ${status}`, 'success');
    } catch {
      globalNotify("Failed to update status", 'error');
    } finally {
      setUpdating(false);
    }
  };

  const bulkUpdateStatus = async (status: string) => {
    if (selected.size === 0) return;
    setUpdating(true);
    try {
      const ids = Array.from(selected);
      await api.patch('/job-offer/bulk-status', { ids, status });
      setOffers(prev => prev.map(o => ids.includes(o.offer_id) ? { ...o, status } : o));
      setSelected(new Set());
      globalNotify(`Successfully updated ${ids.length} entries to ${status}`, 'success');
    } catch {
      globalNotify("Failed to update multiple entries", 'error');
    } finally {
      setUpdating(false);
    }
  };

  const toggleSelect = (id: number) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const toggleAllOnPage = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map(o => o.offer_id)));
    }
  };

  /* ── Counters & Filtering ── */
  const now = useMemo(() => Date.now(), []);
  const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;

  const baseOffers = useMemo(() => {
    return offers.filter((o) => {
      return eoiTypeFilter === "All" ||
        (eoiTypeFilter === "Placement" && o.eoi_type === "Placement") ||
        (eoiTypeFilter === "Training" && o.eoi_type === "Industrial Training") ||
        (eoiTypeFilter === "Collaboration" && o.eoi_type === "Collaboration");
    });
  }, [offers, eoiTypeFilter]);

  const pendingDisc = baseOffers.filter((o) => (o.status === "Sent" || o.status === "Pending") && now - new Date(o.offer_date ?? 0).getTime() > TWO_DAYS_MS).length;
  const discussed = baseOffers.filter((o) => o.status === "Discussed").length;
  const accepted = baseOffers.filter((o) => o.status === "Accepted").length;

  const statConfig = [
    { tab: "All", label: "Received", count: baseOffers.length, icon: Users, activeColor: "indigo" },
    { tab: "PendingDiscuss", label: "Response Pending", count: pendingDisc, icon: Clock, activeColor: "amber" },
    { tab: "Discussed", label: " Under Process", count: discussed, icon: CheckCircle2, activeColor: "purple" },
    { tab: "DecisionPending", label: "Decision Pending", count: accepted, icon: CheckCircle2, activeColor: "yellow" },
    { tab: "Accepted", label: "Accepted", count: accepted, icon: CheckCircle2, activeColor: "green" },
    { tab: "Rejected", label: "Rejected", count: accepted, icon: CheckCircle2, activeColor: "red" },
    { tab: " ProjectInitiated", label: " Project Initiated", count: baseOffers.length, icon: Users, activeColor: "indigo" },
    { tab: " ProjectCompleted", label: " Project Completed", count: pendingDisc, icon: Clock, activeColor: "green" },
  ];

  const filtered = useMemo(() => {
    return filter === "All"
      ? baseOffers
      : filter === "PendingDiscuss"
        ? baseOffers.filter((o) => (o.status === "Sent" || o.status === "Pending") && now - new Date(o.offer_date ?? 0).getTime() > TWO_DAYS_MS)
        : baseOffers.filter((o) => o.status === filter);
  }, [baseOffers, filter]);

  return (
    <div className="w-full mx-auto pb-24" style={{ fontFamily: "'Outfit', sans-serif" }}>
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
            <MailOpen size={22} className="text-primary-content" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-base-content tracking-tight leading-tight">
              Application Tracker
            </h1>
            <p className="text-sm text-base-content/50 mt-0.5">
              Manage incoming Expressions of Interest from industry partners
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <select
            className="select select-bordered select-sm w-full sm:w-auto font-medium"
            value={eoiTypeFilter}
            onChange={(e) => setEoiTypeFilter(e.target.value)}
          >
            <option value="All">All Received Types</option>
            <option value="Placement">🎓 Hiring</option>
            <option value="Training">🏭 Training</option>
            <option value="Collaboration">🤝 Collaboration</option>
          </select>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      {!loading && offers.length > 0 && (
        <div ref={statContainerRef} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statConfig.map(({ tab, label, count, icon, activeColor }) => (
            <StatCard key={tab} label={label} count={count} active={filter === tab}
              onClick={() => setFilter(tab)} icon={icon} activeColor={activeColor} />
          ))}
        </div>
      )}

      {/* ── Content ── */}
      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="hidden lg:block">
            <div className="h-12 bg-base-300 dark:bg-base-800 rounded-xl mb-4" />
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-base-200 dark:bg-base-800/50 rounded-xl mb-2" />
            ))}
          </div>
          <div className="lg:hidden space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 rounded-2xl bg-base-300 dark:bg-base-800" />
            ))}
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-3xl border-2 border-dashed border-base-300 dark:border-base-700 bg-base-100 dark:bg-base-900 gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
            <Mail size={30} className="text-primary" />
          </div>
          <div>
            <p className="font-bold text-base-content text-lg uppercase tracking-tight">No Received Application found</p>
            <p className="text-sm text-base-content/50 mt-1">Try changing filters or wait for new responses</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Desktop Table View */}
          <div className="hidden lg:block rounded-2xl border border-base-300 dark:border-base-700 bg-base-100 dark:bg-base-900 shadow-sm overflow-visible">
            <table className="min-w-full divide-y divide-base-200 dark:divide-base-800">
              <thead className="bg-base-200/50 dark:bg-base-800/50">
                <tr>
                  <th className="px-4 py-4 w-10">
                    <button onClick={toggleAllOnPage} className="w-5 h-5 rounded border border-base-300 flex items-center justify-center text-primary bg-base-100">
                      {selected.size === filtered.length && filtered.length > 0 ? <CheckSquare size={14} /> : <Square size={14} className="text-base-content/20" />}
                    </button>
                  </th>
                  <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-base-content/40">Industry Partner</th>
                  <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-base-content/40">EOI Type</th>
                  <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-base-content/40">Title / Details</th>
                  <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-base-content/40">Received</th>
                  <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-base-content/40">Status</th>
                  <th className="px-5 py-4 text-right text-[10px] font-black uppercase tracking-widest text-base-content/40">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-base-200 dark:divide-base-800">
                {filtered.map((offer) => (
                  <tr key={offer.offer_id} className={clsx("hover:bg-base-200/30 dark:hover:bg-base-800/30 transition-colors", selected.has(offer.offer_id) && "bg-primary/5")}>
                    <td className="px-4 py-4">
                      <button onClick={() => toggleSelect(offer.offer_id)} className="w-5 h-5 rounded border border-base-300 flex items-center justify-center text-primary bg-base-100">
                        {selected.has(offer.offer_id) ? <CheckSquare size={14} /> : <Square size={14} className="text-base-content/20" />}
                      </button>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                          <Building2 size={16} />
                        </div>
                        <span className="text-sm font-bold text-base-content">{offer.industry?.industry_name || "Industry Partner"}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <EoiTypePill type={offer.eoi_type} />
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-base-content leading-tight line-clamp-1">
                        {offer.job_title || offer.collaboration_types?.split('|').join(' · ') || "—"}
                      </p>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-xs text-base-content/60">
                      {formatDate(offer.offer_date)}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <StatusBadge status={offer.status} />
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        {offer.status === 'Sent' && (
                          <>
                            <button
                              onClick={(e) => { e.stopPropagation(); updateSingleStatus(offer.offer_id, 'Accepted'); }}
                              className="relative w-7 h-7 rounded-lg bg-success/10 text-success hover:bg-success hover:text-white flex items-center justify-center transition-all tooltip tooltip-bottom"
                              data-tip="Accept"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); updateSingleStatus(offer.offer_id, 'Rejected'); }}
                              className="relative w-7 h-7 rounded-lg bg-error/10 text-error hover:bg-error hover:text-white flex items-center justify-center transition-all tooltip tooltip-bottom"
                              data-tip="Reject"
                            >
                              <X size={14} />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => { setCurrentOffer(offer); setViewModal(true); }}
                          className="relative w-7 h-7 rounded-lg bg-base-200 text-base-content/60 hover:bg-primary hover:text-white flex items-center justify-center transition-all tooltip tooltip-bottom"
                          data-tip="View Details"
                        >
                          <Eye size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {filtered.map((offer) => (
              <div
                key={offer.offer_id}
                onClick={() => { setCurrentOffer(offer); setViewModal(true); }}
                className={clsx(
                  "rounded-2xl border border-base-300 dark:border-base-700 bg-base-100 dark:bg-base-900 p-5 shadow-sm active:scale-[0.98] transition-all",
                  selected.has(offer.offer_id) && "ring-2 ring-primary border-transparent"
                )}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleSelect(offer.offer_id); }}
                      className="w-5 h-5 rounded border border-base-300 flex items-center justify-center text-primary bg-base-100"
                    >
                      {selected.has(offer.offer_id) ? <CheckSquare size={14} /> : <Square size={14} className="text-base-content/20" />}
                    </button>
                    <EoiTypePill type={offer.eoi_type} />
                  </div>
                  <StatusBadge status={offer.status} />
                </div>
                <h3 className="font-bold text-base-content mb-1 leading-tight line-clamp-1">
                  {offer.job_title || offer.collaboration_types?.split('|').join(' · ') || "EOI Request"}
                </h3>
                <div className="flex items-center gap-2 text-xs text-base-content/50 mb-4">
                  <Building2 size={12} /> {offer.industry?.industry_name}
                </div>

                {offer.status === 'Sent' && (
                  <div className="grid grid-cols-2 gap-2 mt-4 mb-4">
                    <button
                      onClick={(e) => { e.stopPropagation(); updateSingleStatus(offer.offer_id, 'Accepted'); }}
                      className="btn btn-sm btn-success text-white font-bold rounded-xl"
                    >
                      Accept
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); updateSingleStatus(offer.offer_id, 'Rejected'); }}
                      className="btn btn-sm btn-error text-white font-bold rounded-xl"
                    >
                      Reject
                    </button>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t border-base-200 dark:border-base-800">
                  <span className="text-[10px] font-black uppercase tracking-widest text-base-content/40">
                    {formatDate(offer.offer_date)}
                  </span>
                  <button className="text-xs font-bold text-primary flex items-center gap-1">
                    <Eye size={14} /> View Details
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-8">
            <Pagination
              total={total}
              page={page}
              limit={limit}
              onPageChange={(p) => load(p, limit)}
              onLimitChange={(l) => load(1, l)}
            />
          </div>
        </div>
      )}

      {/* ── Bulk Action Bar ── */}
      {selected.size > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 fade-in duration-300">
          <div className="bg-base-100 dark:bg-base-900 border border-base-300 dark:border-base-700 shadow-2xl rounded-2xl px-6 py-4 flex items-center gap-8 ring-8 ring-primary/5">
            <div className="flex items-center gap-3 border-r border-base-300 dark:border-base-700 pr-8">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-content font-black shadow-lg shadow-primary/20">
                {selected.size}
              </div>
              <div className="text-sm font-bold text-base-content tracking-tight">Entries<br /><span className="text-primary opacity-70">Selected</span></div>
            </div>

            <div className="flex items-center gap-3">
              <button
                disabled={updating}
                onClick={() => bulkUpdateStatus('Accepted')}
                className="btn btn-success btn-sm text-white font-bold px-6 rounded-xl shadow-lg shadow-success/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
              >
                Accept All Selected
              </button>
              <button
                disabled={updating}
                onClick={() => bulkUpdateStatus('Rejected')}
                className="btn btn-error btn-sm text-white font-bold px-6 rounded-xl shadow-lg shadow-error/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
              >
                Reject All
              </button>
              <button
                onClick={() => setSelected(new Set())}
                className="btn btn-ghost btn-sm font-bold text-base-content/40 hover:text-base-content px-4"
              >
                Cancel
              </button>
            </div>
          </div>
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
