"use client";

import { useRef, useState } from "react";
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
} from "lucide-react";
import api from "@/lib/api";

const ALL_STATUSES = [
  "Discussed",
  "Accepted",
  "Rejected",
  "Project initiated",
  "Project completed",
];

const STATUS_COLORS: Record<string, { bg: string; text: string; icon: LucideIcon }> = {
  Sent: { bg: "bg-blue-50", text: "text-blue-700", icon: Send },
  Pending: { bg: "bg-blue-50", text: "text-blue-700", icon: Clock },
  Discussed: { bg: "bg-amber-100", text: "text-amber-800", icon: Clock },
  Accepted: { bg: "bg-emerald-100", text: "text-emerald-800", icon: CheckCircle2 },
  Rejected: { bg: "bg-rose-100", text: "text-rose-800", icon: XCircle },
  "Project initiated": { bg: "bg-purple-100", text: "text-purple-800", icon: TrendingUp },
  "Project completed": { bg: "bg-green-100", text: "text-green-800", icon: CheckCircle2 },
  Withdrawn: { bg: "bg-gray-100", text: "text-gray-700", icon: X },
};

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
  required_qualification_ids?: string;
  required_stream_ids?: string;
  industry?: {
    industry_name?: string;
    emailId?: string;
  };
}

interface OfferViewModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  offer?: Offer | null;
  onStatusChange?: (offerId: number, newStatus: string) => void;
}

export default function OfferViewModal({
  open,
  setOpen,
  offer,
  onStatusChange,
}: OfferViewModalProps) {
  const [changingStatus, setChangingStatus] = useState(false);
  const [pendingStatus, setPendingStatus] = useState("");
  const [statusError, setStatusError] = useState("");

  const modalRef = useRef<HTMLDivElement>(null);

  if (!open || !offer) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) setOpen(false);
  };

  const formatDate = (d?: string) =>
    d
      ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
      : "—";

  const formatSalary = () => {
    const min = offer.salary_min ? Number(offer.salary_min) : null;
    const max = offer.salary_max ? Number(offer.salary_max) : null;
    if (min === null && max === null) return "Not disclosed";

    const fmt = (n: number) => {
      const k = n / 1000;
      return `₹${Number.isInteger(k) ? k : k.toFixed(1)}K`;
    };

    if (min !== null && max !== null) return `${fmt(min)} – ${fmt(max)}`;
    if (min !== null) return `From ${fmt(min)}`;
    return `Up to ${fmt(max!)}`;
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!newStatus || newStatus === offer.status) return;
    setPendingStatus(newStatus);
    setChangingStatus(true);
    setStatusError("");
    try {
      await api.patch(`/job-offer/${offer.offer_id}/status`, { status: newStatus });
      onStatusChange?.(offer.offer_id, newStatus);
      setOpen(false);
    } catch (e: any) {
      setStatusError(e?.response?.data?.message ?? "Failed to update status");
    } finally {
      setChangingStatus(false);
      setPendingStatus("");
    }
  };

  const StatusConfig = STATUS_COLORS[offer.status] ?? STATUS_COLORS["Pending"];
  const StatusIcon = StatusConfig.icon;

  const eoiTypeLabel =
    offer.eoi_type === "Placement"
      ? "🎓 Hire Students (Placement)"
      : offer.eoi_type === "Industrial Training"
        ? "🏭 Industrial Training"
        : offer.eoi_type === "Collaboration"
          ? "🤝 Collaboration"
          : offer.eoi_type;

  const collabList = offer.collaboration_types?.split("|").filter(Boolean) ?? [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-lg sm:max-w-xl md:max-w-2xl bg-white rounded-xl shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        {/* Close button */}
        <button
          onClick={() => setOpen(false)}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-gray-100 text-gray-600 hover:text-gray-900 z-10"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="px-5 sm:px-7 pt-6 pb-4 border-b bg-gray-50/70">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center">
              <Briefcase size={24} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              {eoiTypeLabel && (
                <span className="inline-block mb-2 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
                  {eoiTypeLabel}
                </span>
              )}
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                {offer.job_title || "Expression of Interest"}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                <div className="flex items-center gap-1.5">
                  <Building2 size={16} />
                  {offer.industry?.industry_name || "Company"}
                </div>
                {offer.industry?.emailId && (
                  <div className="flex items-center gap-1.5">
                    <Mail size={16} />
                    <span className="font-mono truncate max-w-[220px]">
                      {offer.industry.emailId}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-5 sm:px-7 py-5 border-b">
          {offer.salary_min || offer.salary_max ? (
            <QuickStat icon={DollarSign} label="Salary/Stipend" value={formatSalary()} color="text-emerald-700" />
          ) : null}
          {offer.number_of_posts ? (
            <QuickStat icon={Users} label="Students Required" value={offer.number_of_posts.toString()} color="text-indigo-700" />
          ) : null}
          {offer.offer_date ? (
            <QuickStat icon={CalendarDays} label="Sent On" value={formatDate(offer.offer_date)} color="text-amber-700" />
          ) : null}
          {offer.start_date ? (
            <QuickStat icon={CalendarClock} label="Start Date" value={formatDate(offer.start_date)} color="text-purple-700" />
          ) : null}
        </div>

        {/* Main content */}
        <div className="p-5 sm:p-7 space-y-6">

          {/* Engagement details for Placement / Training */}
          {(offer.nature_of_engagement || offer.experience_required || offer.location) && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Engagement Details</h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-700">
                {offer.nature_of_engagement && (
                  <div><span className="text-gray-500">Nature:</span> {offer.nature_of_engagement}</div>
                )}
                {offer.experience_required && (
                  <div><span className="text-gray-500">Experience:</span> {offer.experience_required}</div>
                )}
                {offer.location && (
                  <div><span className="text-gray-500">Location:</span> {offer.location}{offer.is_remote ? " (Remote OK)" : ""}</div>
                )}
                {offer.duration && (
                  <div><span className="text-gray-500">Duration:</span> {offer.duration}</div>
                )}
              </div>
            </div>
          )}

          {/* Job description */}
          {offer.job_description && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Description</h3>
              <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{offer.job_description}</div>
            </div>
          )}

          {/* Collaboration types */}
          {collabList.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Collaboration Type(s)</h3>
              <ul className="space-y-1">
                {collabList.map((c) => (
                  <li key={c} className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle2 size={14} className="text-indigo-600 flex-shrink-0" /> {c}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Additional details */}
          {offer.additional_details && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Additional Details</h3>
              <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{offer.additional_details}</div>
            </div>
          )}

          {/* Status & Actions */}
          <div className="pt-4 border-t space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm font-semibold text-gray-700">Current Status:</span>
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${StatusConfig.bg} ${StatusConfig.text}`}>
                <StatusIcon size={15} />
                {offer.status === "Sent" ? "Received" : offer.status}
              </div>
            </div>

            {/* Status Change (Institute can update) */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Update Status</p>
              <div className="flex flex-wrap gap-2">
                {ALL_STATUSES.filter((s) => s !== offer.status).map((s) => {
                  const cfg = STATUS_COLORS[s] ?? STATUS_COLORS.Pending;
                  const Ico = cfg.icon;
                  return (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(s)}
                      disabled={changingStatus}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${cfg.bg} ${cfg.text} border-current/20 hover:brightness-95 disabled:opacity-50`}
                    >
                      {changingStatus && pendingStatus === s ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Ico size={12} />
                      )}
                      {s}
                    </button>
                  );
                })}
              </div>
              {statusError && (
                <p className="text-xs text-red-600 mt-2">{statusError}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface QuickStatProps { icon: LucideIcon; label: string; value: string; color: string; }
function QuickStat({ icon: Icon, label, value, color }: QuickStatProps) {
  return (
    <div className="text-center sm:text-left">
      <div className={`flex items-center justify-center sm:justify-start gap-1.5 text-sm font-medium ${color}`}>
        <Icon size={16} />{label}
      </div>
      <div className="mt-0.5 text-base sm:text-lg font-semibold text-gray-900">{value}</div>
    </div>
  );
}
