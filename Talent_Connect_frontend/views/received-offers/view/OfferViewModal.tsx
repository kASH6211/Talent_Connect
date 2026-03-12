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
  Mail,
  Briefcase,
  LucideIcon,
  Send,
  TrendingUp,
  Loader2,
  MapPin,
  Info,
  ChevronRight,
  MailOpen,
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
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  required_qualification_ids?: string;
  required_stream_ids?: string;
  preferred_qualification_ids?: string;
  preferred_stream_ids?: string;
  min_students_required?: number;
  number_of_institutes_required?: number;
  industry?: {
    industry_name?: string;
    emailId?: string;
  };
}

interface Option {
  label: string;
  value: any;
}

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
  const modalRef = useRef<HTMLDivElement>(null);
  const [updating, setUpdating] = useState(false);
  const [pendingStatus, setPendingStatus] = useState("");
  const [response, setResponse] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [targetStatus, setTargetStatus] = useState("");
  const [mounted, setMounted] = useState(false);
  const [qualOptions, setQualOptions] = useState<Option[]>([]);
  const [streamOptions, setStreamOptions] = useState<Option[]>([]);

  useEffect(() => {
    setMounted(true);
    if (open) {
      const fetchMetadata = async () => {
        try {
          const [qRes, sRes] = await Promise.all([
            api.get("/qualification?limit=all"),
            api.get("/stream-branch?limit=all"),
          ]);
          const qData = qRes.data?.data || qRes.data || [];
          setQualOptions(qData.map((q: any) => ({
            label: q.qualification || q.qualificationname || "Unknown",
            value: q.qualificationid
          })));
          const sData = sRes.data?.data || sRes.data || [];
          setStreamOptions(sData.map((s: any) => ({
            label: s.stream_branch_name || "Unknown",
            value: s.stream_branch_Id ?? s.stream_branch_id
          })));
        } catch (err) {
          console.error("Failed to fetch metadata", err);
        }
      };
      fetchMetadata();
    }
  }, [open]);

  if (!mounted || !open || !offer) return null;

  const formatDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  const formatSalary = (min?: any, max?: any) => {
    const mn = Number(min) || null;
    const mx = Number(max) || null;
    if (!mn && !mx) return "Not disclosed";
    const fmt = (n: number) => `₹${n >= 100000 ? (n / 100000).toFixed(1) + "L" : (n / 1000).toFixed(0) + "K"}`;
    if (mn && mx) return `${fmt(mn)} – ${fmt(mx)}`;
    return mn ? `From ${fmt(mn)}` : `Up to ${fmt(mx!)}`;
  };

  const resolveNames = (ids: string | undefined, options: Option[]) => {
    if (!ids) return "—";
    const idList = ids.split(",").map((id) => id.trim());
    const names = idList
      .map((id) => options.find((opt) => String(opt.value) === id)?.label)
      .filter(Boolean);
    return names.length > 0 ? names.join(", ") : "—";
  };

  const getNextStatuses = (current: string) => {
    const flow: Record<string, string[]> = {
      Sent: ["Discussed", "Rejected"],
      Pending: ["Discussed", "Rejected"],
      Discussed: ["Accepted", "Rejected"],
      Accepted: ["Project initiated"],
      "Project initiated": ["Project completed"],
      Rejected: [],
      "Project completed": [],
    };
    return flow[current] || [];
  };

  const handleStatusClick = (status: string) => {
    setTargetStatus(status);
    setShowConfirm(true);
  };

  const updateStatus = async () => {
    if (!targetStatus || targetStatus === offer.status) return;
    setUpdating(true);
    setPendingStatus(targetStatus);
    try {
      await api.patch(`/job-offer/${offer.offer_id}/status`, {
        status: targetStatus,
        response: response.trim()
      });
      onStatusChange?.(offer.offer_id, targetStatus);
      globalNotify(`Status updated to ${targetStatus}`, "success");
      setOpen(false);
      setShowConfirm(false);
      setResponse("");
    } catch (e: any) {
      globalNotify(e?.response?.data?.message ?? "Failed to update status", "error");
    } finally {
      setUpdating(false);
      setPendingStatus("");
    }
  };

  const collabList = offer.collaboration_types?.split("|").filter(Boolean) ?? [];

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 backdrop-blur-md bg-base-content/20 animate-in fade-in duration-300" style={{ fontFamily: "'Outfit', sans-serif" }}>
      <div
        ref={modalRef}
        className="bg-base-100 dark:bg-base-950 w-full max-w-5xl max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-base-300 dark:border-base-800 animate-in zoom-in-95 duration-300"
      >
        {/* Header Section */}
        <div className="px-8 py-7 border-b border-base-200 dark:border-base-800 flex items-center justify-between bg-base-100/50 backdrop-blur-xl sticky top-0 z-10">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-primary-content shadow-lg shadow-primary/30 transition-transform hover:scale-105 active:scale-95 cursor-default">
              <MailOpen size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-base-content">
                Application from <span className="text-primary">{offer.industry?.industry_name || "Industry partner"}</span>
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-base-content/30">Reference #{offer.offer_id}</span>
                <span className="w-1 h-1 rounded-full bg-base-content/20" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">{offer.status}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="w-12 h-12 rounded-2xl bg-base-200 hover:bg-error hover:text-white flex items-center justify-center transition-all duration-300 group shadow-sm"
          >
            <X size={20} className="transition-transform group-hover:rotate-90" />
          </button>
        </div>

        {/* Content Section */}
        <div className="flex-1 overflow-y-auto p-8 sm:p-10 space-y-10 custom-scrollbar">

          {/* Engagement Basic Info Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickInfo color="text-indigo-600" bg="bg-indigo-50" icon={Briefcase} label="EOI Type" value={offer.eoi_type || "—"} />
            <QuickInfo color="text-emerald-600" bg="bg-emerald-50" icon={DollarSign} label="Compensation" value={formatSalary(offer.salary_min, offer.salary_max)} />
            <QuickInfo color="text-indigo-600" bg="bg-indigo-50" icon={Users} label="Students" value={offer.number_of_posts?.toString() || "—"} />
            <QuickInfo color="text-amber-600" bg="bg-amber-50" icon={CalendarDays} label="Eol Sent Date" value={formatDate(offer.offer_date)} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Requirements & Engagement Details */}
            <div className="space-y-8">
              <section className="bg-base-100 dark:bg-base-900 border border-base-300 dark:border-base-800 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="px-6 py-4 bg-base-200/50 dark:bg-base-800/50 flex items-center gap-2 border-b border-base-200 dark:border-base-800 font-black text-[10px] uppercase tracking-[0.2em] text-base-content/40">
                  <Info size={14} className="text-primary" /> Engagement Details
                </div>
                <div className="divide-y divide-base-200/50 dark:divide-base-800/50">
                  <DetailRow label="Qualifications" value={resolveNames(offer.required_qualification_ids, qualOptions)} />
                  <DetailRow label="Courses/Trades" value={resolveNames(offer.required_stream_ids, streamOptions)} />
                  <DetailRow label="Nature" value={offer.nature_of_engagement || "—"} />
                  <DetailRow label="Experience" value={offer.experience_required || "—"} />
                  <DetailRow label="Location" value={offer.location ? (
                    <span className="flex items-center gap-1.5 font-bold text-base-content">
                      <MapPin size={14} className="text-primary" />
                      {offer.location} {offer.is_remote && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">Remote</span>}
                    </span>
                  ) : "—"} />
                  <DetailRow label="Duration" value={offer.duration || "—"} />
                  <DetailRow label="Exp. Start Date" value={formatDate(offer.start_date)} />
                </div>
              </section>

              {collabList.length > 0 && (
                <section className="bg-base-100 dark:bg-base-900 border border-base-300 dark:border-base-800 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="px-6 py-4 bg-base-200/50 dark:bg-base-800/50 flex items-center gap-2 border-b border-base-200 dark:border-base-800 font-black text-[10px] uppercase tracking-[0.2em] text-base-content/40">
                    <TrendingUp size={14} className="text-purple-600" /> Collaborations Requirements
                  </div>
                  <div className="divide-y divide-base-200/50 dark:divide-base-800/50">
                    <div className="flex items-start p-5 text-sm gap-4">
                      <div className="w-1/3 text-base-content/30 font-black uppercase text-[10px] pt-1 leading-tight tracking-widest">Types</div>
                      <div className="w-2/3 flex flex-wrap gap-2">
                        {collabList.map(item => (
                          <span key={item} className="px-3 py-1 bg-purple-50 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-[11px] font-bold rounded-xl border border-purple-100 dark:border-purple-800/50">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                    <DetailRow label="Pref. Quals" value={resolveNames(offer.preferred_qualification_ids, qualOptions)} />
                    <DetailRow label="Pref. Courses" value={resolveNames(offer.preferred_stream_ids, streamOptions)} />
                    <DetailRow label="Min Students" value={offer.min_students_required?.toString() || "—"} />
                    <DetailRow label="No. Institutes" value={offer.number_of_institutes_required?.toString() || "—"} />
                  </div>
                </section>
              )}
            </div>

            {/* Right Column: Contact & Overview */}
            <div className="space-y-8">
              <section className="bg-base-100 dark:bg-base-900 border border-base-300 dark:border-base-800 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="px-6 py-4 bg-base-200/50 dark:bg-base-800/50 flex items-center gap-2 border-b border-base-200 dark:border-base-800 font-black text-[10px] uppercase tracking-[0.2em] text-base-content/40">
                  <Users size={14} className="text-emerald-600" /> Contact Person
                </div>
                <div className="divide-y divide-base-200/50 dark:divide-base-800/50">
                  <DetailRow label="Name" value={offer.contact_name || offer.industry?.industry_name || "—"} />
                  <DetailRow label="Email" value={offer.contact_email || offer.industry?.emailId || "—"} />
                  <DetailRow label="Phone" value={offer.contact_phone || "—"} />
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-4 px-2">
                  <div className="w-6 h-6 rounded-lg bg-base-200 dark:bg-base-800 flex items-center justify-center">
                    <Briefcase size={12} className="text-base-content/60" />
                  </div>
                  <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-base-content/40">Detailed Description</h3>
                </div>
                <div className="p-7 rounded-[2rem] bg-base-200/30 dark:bg-base-900/30 border border-base-200 dark:border-base-800 text-sm leading-relaxed text-base-content/70 whitespace-pre-wrap font-medium">
                  {offer.job_description || "No specific job description provided."}
                </div>
              </section>

              {offer.additional_details && (
                <section>
                  <div className="flex items-center gap-2 mb-4 px-2">
                    <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Info size={12} className="text-primary" />
                    </div>
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-base-content/40">Additional Notes</h3>
                  </div>
                  <div className="p-7 rounded-[2rem] bg-primary/5 dark:bg-primary/10 border border-primary/10 text-sm leading-relaxed text-base-content/60 font-medium">
                    {offer.additional_details}
                  </div>
                </section>
              )}
            </div>
          </div>

          {/* Action Center - Sequential Flow */}
          {getNextStatuses(offer.status).length > 0 && (
            <section className="pt-12 border-t border-base-200 dark:border-base-800">
              <div className="flex items-center justify-between mb-8 px-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Send size={16} className="text-primary" />
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] text-base-content">Action Center</h3>
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-base-content/30 bg-base-200 dark:bg-base-800 px-4 py-1.5 rounded-full">
                  Mark Next Sequence
                </div>
              </div>
              <div className="flex flex-wrap gap-5">
                {getNextStatuses(offer.status).map((status) => (
                  <button
                    key={status}
                    disabled={updating}
                    onClick={() => handleStatusClick(status)}
                    className={clsx(
                      "flex-1 min-w-[180px] px-8 py-5 rounded-[1.5rem] border text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:-translate-y-1 active:translate-y-0 active:shadow-md text-center",
                      updating && pendingStatus === status ? "bg-base-200 text-base-content/40 opacity-50 cursor-not-allowed border-transparent" :
                        status === "Accepted" || status === "Project completed" ? "bg-emerald-600 border-emerald-600/50 text-white shadow-emerald-500/20" :
                          status === "Rejected" ? "bg-rose-600 border-rose-600/50 text-white shadow-rose-500/20" :
                            status === "Discussed" ? "bg-amber-500 border-amber-500/50 text-white shadow-amber-500/20" :
                              "bg-primary border-primary/50 text-white shadow-primary/20"
                    )}
                  >
                    {updating && pendingStatus === status ? <Loader2 size={16} className="animate-spin" /> : <ChevronRight size={16} strokeWidth={3} />}
                    {status}
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Confirmation Dialog Overlay */}
        {showConfirm && (
          <div className="absolute inset-0 z-[110] bg-base-content/10 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
            <div className="bg-base-100 border border-base-300 rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200 text-center">
              <div className="w-20 h-20 rounded-3xl bg-warning/10 text-warning flex items-center justify-center mx-auto mb-8 shadow-inner shadow-warning/20">
                <Info size={36} strokeWidth={2.5} />
              </div>
              <h4 className="text-2xl font-black text-base-content mb-3 leading-tight tracking-tight">Are you sure?</h4>
              <p className="text-sm text-base-content/60 mb-8 leading-relaxed font-medium">
                You are about to mark this as <span className="font-bold text-base-content">"{targetStatus}"</span>.
                This action <span className="underline decoration-error/30 text-error">cannot be reversed</span>.
              </p>
              <div className="flex flex-col gap-5">
                <div className="text-left">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-base-content/30 mb-2.5 block px-1">
                    Add Response / Comments
                  </label>
                  <textarea
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    placeholder="Provide a reason or additional comments (optional)..."
                    className="w-full h-28 p-5 rounded-2xl border border-base-300 dark:border-base-800 bg-base-50 dark:bg-base-900/50 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm outline-none resize-none font-medium"
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <button
                    disabled={updating}
                    onClick={updateStatus}
                    className="w-full py-5 rounded-[1.5rem] bg-primary text-primary-content font-black uppercase tracking-[0.2em] text-xs hover:bg-primary/90 transition-all flex items-center justify-center gap-3 shadow-lg shadow-primary/20"
                  >
                    {updating ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} strokeWidth={3} />}
                    Confirm Change
                  </button>
                  <button
                    disabled={updating}
                    onClick={() => { setShowConfirm(false); setResponse(""); }}
                    className="w-full py-5 rounded-[1.5rem] border border-base-300 text-base-content/40 font-black uppercase tracking-[0.2em] text-xs hover:bg-base-200 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

function QuickInfo({ icon: Icon, label, value, color, bg }: { icon: LucideIcon; label: string; value: string; color: string; bg: string }) {
  return (
    <div className="flex-1 min-w-[120px] p-6 rounded-[2rem] bg-base-100 dark:bg-base-900 border border-base-300 dark:border-base-800 flex flex-col items-center justify-center text-center group transition-all hover:bg-base-200/30 hover:shadow-md">
      <div className={clsx("w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all group-hover:scale-110 shadow-sm", bg, color)}>
        <Icon size={28} strokeWidth={2.5} />
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-base-content/20 mb-1.5 leading-none">{label}</p>
      <p className="font-extrabold text-sm text-base-content tracking-tight leading-tight">{value}</p>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex items-start p-5 text-sm gap-4 transition-colors hover:bg-base-200/30">
      <div className="w-1/3 text-base-content/30 font-black uppercase text-[10px] pt-1.5 leading-tight tracking-[0.2em]">
        {label}
      </div>
      <div className="w-2/3 text-base-content font-bold break-words leading-relaxed">
        {value || "—"}
      </div>
    </div>
  );
}
