"use client";

import { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  DollarSign,
  Clock,
  Building2,
  Users,
  CheckCircle2,
  XCircle,
  CalendarDays,
  CalendarClock,
  Mail,
  Briefcase,
  LucideIcon,
  Send,
  TrendingUp,
  Loader2,
  MapPin,
  Info,
  ChevronRight,
} from "lucide-react";
import api from "@/lib/api";
import clsx from "clsx";
import { globalNotify } from "@/lib/notification";

/* ─── Types & Constants ─────────────────────────────────────────────────── */
interface Offer {
  offer_id: number;
  eoi_type?: string;
  job_title?: string;
  job_description?: string;
  salary_min?: number | string;
  salary_max?: number | string;
  offer_date?: string;
  last_date?: string;
  number_of_posts?: number;
  nature_of_engagement?: string;
  experience_required?: string;
  location?: string;
  is_remote?: boolean;
  start_date?: string;
  duration?: string;
  collaboration_types?: string;
  additional_details?: string;
  status: string;
  industry?: {
    industry_name?: string;
    emailId?: string;
  };
}

const ALL_STATUSES = [
  "Discussed",
  "Accepted",
  "Rejected",
  "Project initiated",
  "Project completed",
];

const STATUS_CONFIG: Record<string, { bg: string; text: string; icon: LucideIcon; light: string }> = {
  Sent: { bg: "bg-blue-600", text: "text-blue-600", light: "bg-blue-50 dark:bg-blue-500/10", icon: Send },
  Discussed: { bg: "bg-amber-600", text: "text-amber-600", light: "bg-amber-50 dark:bg-amber-500/10", icon: Clock },
  Accepted: { bg: "bg-emerald-600", text: "text-emerald-600", light: "bg-emerald-50 dark:bg-emerald-500/10", icon: CheckCircle2 },
  Rejected: { bg: "bg-rose-600", text: "text-rose-600", light: "bg-rose-50 dark:bg-rose-500/10", icon: XCircle },
  "Project initiated": { bg: "bg-purple-600", text: "text-purple-600", light: "bg-purple-50 dark:bg-purple-500/10", icon: TrendingUp },
  "Project completed": { bg: "bg-green-600", text: "text-green-600", light: "bg-green-50 dark:bg-green-500/10", icon: CheckCircle2 },
};

/* ─── Styles ───────────────────────────────────────────────────────────── */
const sectionTitleCls = "text-[10px] font-black uppercase tracking-[0.2em] text-base-content/40 mb-3 flex items-center gap-2";
const cardCls = "p-5 rounded-2xl border border-base-300 dark:border-base-700 bg-base-100 dark:bg-base-900 shadow-sm transition-all hover:border-primary/20";
const infoRowCls = "flex items-start gap-3 py-2 text-sm border-b border-base-200 dark:border-base-800 last:border-0";

/* ─── Main Component ───────────────────────────────────────────────────── */
export default function OfferViewModal({
  open,
  setOpen,
  offer,
  onStatusChange,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  offer?: Offer | null;
  onStatusChange?: (offerId: number, newStatus: string) => void;
}) {
  const [updating, setUpdating] = useState(false);
  const [pendingStatus, setPendingStatus] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted || !open || !offer) return null;

  const formatDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  const formatSalary = () => {
    const min = Number(offer.salary_min) || null;
    const max = Number(offer.salary_max) || null;
    if (!min && !max) return "Not disclosed";
    const fmt = (n: number) => `₹${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K`;
    if (min && max) return `${fmt(min)} – ${fmt(max)}`;
    return min ? `From ${fmt(min)}` : `Up to ${fmt(max!)}`;
  };

  const updateStatus = async (newStatus: string) => {
    if (newStatus === offer.status) return;
    setUpdating(true);
    setPendingStatus(newStatus);
    try {
      await api.patch(`/job-offer/${offer.offer_id}/status`, { status: newStatus });
      onStatusChange?.(offer.offer_id, newStatus);
      globalNotify(`Status updated to ${newStatus}`, "success");
      setOpen(false);
    } catch (e: any) {
      globalNotify(e?.response?.data?.message ?? "Failed to update status", "error");
    } finally {
      setUpdating(false);
      setPendingStatus("");
    }
  };

  const config = STATUS_CONFIG[offer.status] || STATUS_CONFIG.Sent;
  const StatusIcon = config.icon;
  const collabList = offer.collaboration_types?.split("|").filter(Boolean) ?? [];

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-base-content/40 backdrop-blur-md transition-opacity animate-in fade-in duration-300"
        onClick={() => setOpen(false)}
      />

      {/* Modal */}
      <div className="relative w-full max-w-5xl bg-base-100 dark:bg-base-950 border border-base-300 dark:border-base-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 fade-in duration-300">

        {/* Header Section */}
        <div className="relative flex-shrink-0 bg-gradient-to-br from-primary via-primary/95 to-secondary p-10 sm:p-12">
          <button
            onClick={() => setOpen(false)}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-md transition-all z-20"
          >
            <X size={20} />
          </button>

          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white shadow-lg backdrop-blur-md">
                <Briefcase size={28} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-3 py-1 bg-white/10 border border-white/20 rounded-full text-[10px] font-black uppercase tracking-widest text-white/90">
                    {offer.eoi_type}
                  </span>
                  <div className={clsx(
                    "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm",
                    offer.status === "Accepted" || offer.status === "Project completed" ? "bg-emerald-100 text-emerald-700" :
                      offer.status === "Rejected" ? "bg-rose-100 text-rose-700" :
                        offer.status === "Discussed" ? "bg-amber-100 text-amber-700" :
                          offer.status === "Project initiated" ? "bg-purple-100 text-purple-700" :
                            "bg-white text-primary"
                  )}>
                    <StatusIcon size={12} />
                    {offer.status === "Sent" ? "Received" : offer.status}
                  </div>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight tracking-tight">
                  {offer.job_title || offer.collaboration_types?.split('|').join(' · ') || "EOI Request"}
                </h2>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-2">
              <div className="flex items-center gap-2 text-white/80">
                <Building2 size={18} className="text-white" />
                <span className="text-sm font-bold tracking-tight">{offer.industry?.industry_name}</span>
              </div>
              {offer.industry?.emailId && (
                <div className="flex items-center gap-2 text-white/80">
                  <Mail size={18} className="text-white" />
                  <span className="text-sm font-medium tracking-tight opacity-90">{offer.industry.emailId}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 overflow-y-auto p-10 sm:p-14 space-y-12 custom-scrollbar">

          {/* Quick Info Grid - 4 columns on large screens */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <QuickInfo color="text-emerald-600" bg="bg-emerald-50 dark:bg-emerald-500/10" icon={DollarSign} label="Compensation" value={formatSalary()} />
            <QuickInfo color="text-indigo-600" bg="bg-indigo-50 dark:bg-indigo-500/10" icon={Users} label="Students Required" value={offer.number_of_posts?.toString() || "—"} />
            <QuickInfo color="text-amber-600" bg="bg-amber-50 dark:bg-amber-500/10" icon={CalendarDays} label="Eol Sent Date" value={formatDate(offer.offer_date)} />
            <QuickInfo color="text-purple-600" bg="bg-purple-50 dark:bg-purple-500/10" icon={CalendarClock} label="Expected Start" value={formatDate(offer.start_date)} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Engagement Details */}
            <div className="space-y-8">
              <section>
                <h3 className={sectionTitleCls}><Info size={14} /> Engagement Details</h3>
                <div className={cardCls}>
                  <div className={infoRowCls}>
                    <span className="w-24 font-bold text-base-content/40">Nature</span>
                    <span className="font-semibold text-base-content">{offer.nature_of_engagement || "—"}</span>
                  </div>
                  <div className={infoRowCls}>
                    <span className="w-24 font-bold text-base-content/40">Experience</span>
                    <span className="font-semibold text-base-content">{offer.experience_required || "—"}</span>
                  </div>
                  <div className={infoRowCls}>
                    <span className="w-24 font-bold text-base-content/40">Location</span>
                    <span className="font-semibold text-base-content flex items-center gap-1.5">
                      <MapPin size={14} className="text-primary" />
                      {offer.location || "—"} {offer.is_remote && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">Remote</span>}
                    </span>
                  </div>
                  <div className={infoRowCls}>
                    <span className="w-24 font-bold text-base-content/40">Duration</span>
                    <span className="font-semibold text-base-content">{offer.duration || "—"}</span>
                  </div>
                </div>
              </section>

              {collabList.length > 0 && (
                <section>
                  <h3 className={sectionTitleCls}><TrendingUp size={14} /> Collaborations</h3>
                  <div className="space-y-2">
                    {collabList.map(item => (
                      <div key={item} className="flex items-center gap-3 p-3 rounded-xl border border-base-200 dark:border-base-800 bg-base-200/50 dark:bg-base-900/50 text-xs font-bold text-base-content/70">
                        <CheckCircle2 size={16} className="text-emerald-500" />
                        {item}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Right Column: Description & Notes */}
            <div className="space-y-8">
              <section>
                <h3 className={sectionTitleCls}><Briefcase size={14} /> Overview</h3>
                <div className={clsx(cardCls, "min-h-[140px] italic text-base-content/70 leading-relaxed text-sm")}>
                  {offer.job_description || "No specific job description provided."}
                </div>
              </section>

              {offer.additional_details && (
                <section>
                  <h3 className={sectionTitleCls}><Info size={14} /> Additional Notes</h3>
                  <div className="p-5 rounded-2xl bg-base-200/50 dark:bg-base-900/50 border border-base-300 dark:border-base-800 text-sm leading-relaxed text-base-content/60">
                    {offer.additional_details}
                  </div>
                </section>
              )}
            </div>
          </div>

          {/* Action Center */}
          <section className="pt-6 border-t border-base-200 dark:border-base-800">
            <h3 className={sectionTitleCls}><Send size={14} /> Action Center</h3>
            <div className="flex flex-wrap gap-3">
              {ALL_STATUSES.filter(s => s !== offer.status).map(status => (
                <button
                  key={status}
                  disabled={updating}
                  onClick={() => updateStatus(status)}
                  className={clsx(
                    "flex-1 min-w-[140px] px-5 py-3 rounded-2xl border text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-sm whitespace-nowrap",
                    updating && pendingStatus === status ? "bg-base-200 text-base-content opacity-50" :
                      status === "Accepted" ? "bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700 hover:scale-[1.02] active:scale-95" :
                        status === "Rejected" ? "bg-rose-600 border-rose-600 text-white hover:bg-rose-700 hover:scale-[1.02] active:scale-95" :
                          "bg-base-100 dark:bg-base-900 border-base-300 dark:border-base-700 text-base-content hover:border-primary hover:text-primary hover:scale-[1.02] active:scale-95"
                  )}
                >
                  {updating && pendingStatus === status ? <Loader2 size={14} className="animate-spin" /> : <ChevronRight size={14} />}
                  {status}
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>,
    document.body
  );
}

function QuickInfo({ icon: Icon, label, value, color, bg }: { icon: LucideIcon; label: string; value: string; color: string; bg: string }) {
  return (
    <div className="flex-1 min-w-[120px] p-4 rounded-3xl bg-base-200/50 dark:bg-base-900 border border-base-300 dark:border-base-800 flex flex-col items-center justify-center text-center group transition-all hover:bg-base-100">
      <div className={clsx("w-10 h-10 rounded-2xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110", bg, color)}>
        <Icon size={20} />
      </div>
      <p className="text-[9px] font-black uppercase tracking-widest text-base-content/40 mb-1">{label}</p>
      <p className="font-black text-sm text-base-content tracking-tight">{value}</p>
    </div>
  );
}
