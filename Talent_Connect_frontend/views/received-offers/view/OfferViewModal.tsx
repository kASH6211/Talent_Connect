"use client";

import { useRef } from "react"; // ← add this import
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
} from "lucide-react";

interface Offer {
  offer_id: number;
  job_title: string;
  job_description?: string;
  salary_min?: number | string;
  salary_max?: number | string;
  offer_date?: string;
  last_date?: string;
  number_of_posts?: number;
  status: string;
  required_qualification_ids?: string;
  required_program_ids?: string;
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
  onAccept?: () => void;
  onReject?: () => void;
}

export default function OfferViewModal({
  open,
  setOpen,
  offer,
  onAccept,
  onReject,
}: OfferViewModalProps) {
  if (!open || !offer) return null;

  const modalRef = useRef<HTMLDivElement>(null);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Close only if clicked directly on the backdrop (not on modal content)
    if (e.target === e.currentTarget) {
      setOpen(false);
    }
  };

  const formatDate = (d?: string) =>
    d
      ? new Date(d).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "—";

  const formatSalary = () => {
    const min = offer.salary_min ? Number(offer.salary_min) : null;
    const max = offer.salary_max ? Number(offer.salary_max) : null;

    if (min === null && max === null) return "Not disclosed";
    if (min !== null && max !== null) {
      return `₹${(min / 100000).toFixed(1)} – ₹${(max / 100000).toFixed(1)} LPA`;
    }
    if (min !== null) return `From ₹${(min / 100000).toFixed(1)} LPA`;
    return `Up to ₹${(max! / 100000).toFixed(1)} LPA`;
  };

  const statusStyles: Record<
    string,
    { bg: string; text: string; icon: LucideIcon }
  > = {
    Pending: {
      bg: "bg-amber-100",
      text: "text-amber-800",
      icon: Clock,
    },
    Accepted: {
      bg: "bg-emerald-100",
      text: "text-emerald-800",
      icon: CheckCircle2,
    },
    Rejected: {
      bg: "bg-rose-100",
      text: "text-rose-800",
      icon: XCircle,
    },
  };

  const defaultStatus = {
    bg: "bg-gray-100",
    text: "text-gray-700",
    icon: Clock,
  };

  const StatusConfig = statusStyles[offer.status] ?? defaultStatus;
  const StatusIcon = StatusConfig.icon;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick} // ← added
    >
      <div
        ref={modalRef} // ← optional, but good practice
        className="
          relative w-full max-w-lg sm:max-w-xl md:max-w-2xl
          bg-white rounded-xl shadow-xl overflow-hidden
          max-h-[90vh] overflow-y-auto
        "
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
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                {offer.job_title}
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
          <QuickStat
            icon={DollarSign}
            label="Salary"
            value={formatSalary()}
            color="text-emerald-700"
          />
          <QuickStat
            icon={Users}
            label="Positions"
            value={offer.number_of_posts?.toString() ?? "—"}
            color="text-indigo-700"
          />
          <QuickStat
            icon={CalendarDays}
            label="Offered"
            value={formatDate(offer.offer_date)}
            color="text-amber-700"
          />
          <QuickStat
            icon={CalendarClock}
            label="Apply by"
            value={formatDate(offer.last_date)}
            color="text-purple-700"
          />
        </div>

        {/* Main content */}
        <div className="p-5 sm:p-7 space-y-7">
          {/* Description */}
          {offer.job_description && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Briefcase size={18} className="text-indigo-600" />
                Description
              </h3>
              <div className="text-gray-700 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                {offer.job_description}
              </div>
            </div>
          )}

          {/* Status & Actions */}
          <div className="pt-4 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div
              className={`
                inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium
                ${StatusConfig.bg} ${StatusConfig.text}
              `}
            >
              <StatusIcon size={16} />
              {offer.status}
            </div>

            {offer.status === "Pending" && (
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button
                  onClick={onReject}
                  className="
                    px-6 py-2.5 rounded-lg font-medium
                    bg-rose-600 hover:bg-rose-700 text-white
                    transition-colors
                  "
                >
                  Reject Offer
                </button>

                <button
                  onClick={onAccept}
                  className="
                    px-6 py-2.5 rounded-lg font-medium
                    bg-indigo-600 hover:bg-indigo-700 text-white
                    transition-colors
                  "
                >
                  Accept Offer
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface QuickStatProps {
  icon: LucideIcon;
  label: string;
  value: string;
  color: string;
}

function QuickStat({ icon: Icon, label, value, color }: QuickStatProps) {
  return (
    <div className="text-center sm:text-left">
      <div
        className={`flex items-center justify-center sm:justify-start gap-1.5 text-sm font-medium ${color}`}
      >
        <Icon size={16} />
        {label}
      </div>
      <div className="mt-0.5 text-base sm:text-lg font-semibold text-gray-900">
        {value}
      </div>
    </div>
  );
}
