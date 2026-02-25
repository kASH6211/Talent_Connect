"use client";

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

  const formatDate = (d?: string) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatSalary = () => {
    const toNumber = (val?: number | string) => (val ? Number(val) : null);

    const min = toNumber(offer.salary_min);
    const max = toNumber(offer.salary_max);

    const fmt = (n: number) => `₹${(n / 100000).toFixed(1)} LPA`;

    if (min && max) return `${fmt(min)} – ${fmt(max)}`;
    if (min) return `From ${fmt(min)}`;
    if (max) return `Up to ${fmt(max)}`;
    return "Not disclosed";
  };

  const splitList = (value?: string) =>
    value ? value.split(",").map((v) => v.trim()) : [];

  const qualifications = splitList(offer.required_qualification_ids);
  const programs = splitList(offer.required_program_ids);
  const streams = splitList(offer.required_stream_ids);

  const statusStyles = {
    Pending: {
      bg: "bg-amber-50 text-amber-800 border-amber-200",
      icon: Clock,
      accent: "border-l-4 border-amber-400",
    },
    Accepted: {
      bg: "bg-emerald-50 text-emerald-800 border-emerald-200",
      icon: CheckCircle2,
      accent: "border-l-4 border-emerald-500",
    },
    Rejected: {
      bg: "bg-rose-50 text-rose-800 border-rose-200",
      icon: XCircle,
      accent: "border-l-4 border-rose-500",
    },
  };

  const StatusConfig = statusStyles[
    offer.status as keyof typeof statusStyles
  ] || {
    bg: "bg-gray-50 text-gray-800 border-gray-200",
    icon: Clock,
    accent: "border-l-4 border-gray-400",
  };

  const StatusIcon = StatusConfig.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
      {/* Modal Content */}
      <div
        className="
          relative w-full max-w-2xl lg:max-w-4xl 
          bg-white rounded-2xl sm:rounded-3xl 
          shadow-2xl overflow-hidden
          max-h-[92vh] overflow-y-auto
          animate-in fade-in zoom-in-95 duration-300
          border border-gray-200
        "
      >
        {/* Close Button */}
        <button
          onClick={() => setOpen(false)}
          className="
            absolute top-4 right-4 sm:top-6 sm:right-6 
            p-3 rounded-full 
            bg-white/90 hover:bg-gray-100 
            text-gray-700 hover:text-gray-900 
            shadow-md hover:shadow-lg transition-all z-10
          "
        >
          <X size={22} strokeWidth={2.5} />
        </button>

        {/* Header */}
        <div className="px-6 pt-8 pb-6 sm:px-10 sm:pt-10 border-b bg-gradient-to-b from-gray-50 to-white">
          <div className="flex items-start gap-5">
            <div
              className="
                flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl 
                bg-gradient-to-br from-indigo-500 to-indigo-700 
                flex items-center justify-center shadow-lg ring-1 ring-indigo-400/30
              "
            >
              <Briefcase size={32} className="text-white" strokeWidth={1.8} />
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight leading-tight">
                {offer.job_title}
              </h2>

              <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-3 text-gray-700 text-base sm:text-lg">
                <div className="flex items-center gap-2.5 font-medium">
                  <Building2 size={18} className="text-indigo-600" />
                  {offer.industry?.industry_name || "Industry Partner"}
                </div>

                {offer.industry?.emailId && (
                  <div className="flex items-center gap-2.5 text-base">
                    <Mail size={18} className="text-gray-600" />
                    <span className="font-mono text-gray-700 truncate max-w-[260px]">
                      {offer.industry.emailId}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 lg:p-10 space-y-10">
          {/* Key Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 lg:gap-6">
            <InfoCard
              icon={<DollarSign size={20} className="text-emerald-600" />}
              label="Salary Package"
              value={formatSalary()}
              accent="border-l-4 border-emerald-500"
            />
            <InfoCard
              icon={<Users size={20} className="text-indigo-600" />}
              label="Positions"
              value={offer.number_of_posts?.toString() || "—"}
              accent="border-l-4 border-indigo-500"
            />
            <InfoCard
              icon={<CalendarDays size={20} className="text-amber-600" />}
              label="Offered On"
              value={formatDate(offer.offer_date)}
              accent="border-l-4 border-amber-500"
            />
            <InfoCard
              icon={<CalendarClock size={20} className="text-purple-600" />}
              label="Apply By"
              value={formatDate(offer.last_date)}
              accent="border-l-4 border-purple-500"
            />
          </div>

          {/* Job Description */}
          {offer.job_description && (
            <div className="space-y-4 bg-gray-50/70 rounded-2xl p-6 lg:p-8 border border-gray-200">
              <h3 className="text-xl lg:text-2xl font-semibold text-gray-900 flex items-center gap-3">
                <Briefcase size={22} className="text-indigo-600" />
                Job Description
              </h3>
              <div className="prose prose-base sm:prose-lg text-gray-800 leading-relaxed max-w-none">
                {offer.job_description}
              </div>
            </div>
          )}

          {/* Requirements Grid */}
          {/* {(qualifications.length > 0 ||
            programs.length > 0 ||
            streams.length > 0) && (
            <div className="grid sm:grid-cols-3 gap-6">
              {qualifications.length > 0 && (
                <RequirementSection
                  title="Required Qualifications"
                  items={qualifications}
                  accent="border-l-4 border-indigo-500"
                />
              )}
              {programs.length > 0 && (
                <RequirementSection
                  title="Required Programs"
                  items={programs}
                  accent="border-l-4 border-purple-500"
                />
              )}
              {streams.length > 0 && (
                <RequirementSection
                  title="Required Streams / Branches"
                  items={streams}
                  accent="border-l-4 border-blue-500"
                />
              )}
            </div>
          )} */}

          {/* Footer / Status & Actions */}
          <div className="pt-8 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div
                className={`
                  inline-flex items-center gap-2.5 px-5 py-2 rounded-full text-base font-medium border shadow-sm
                  ${StatusConfig.bg} ${StatusConfig.accent}
                `}
              >
                <StatusIcon size={18} />
                {offer.status}
              </div>
            </div>

            {offer.status === "Pending" && (
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <button
                  onClick={onReject}
                  className="
                    flex-1 sm:flex-none px-8 py-3 rounded-xl font-semibold text-base
                    bg-rose-600 hover:bg-rose-700 text-white 
                    transition-all shadow-md hover:shadow-lg
                    disabled:opacity-60 disabled:cursor-not-allowed
                  "
                >
                  Reject Offer
                </button>

                <button
                  onClick={onAccept}
                  className="
                    flex-1 sm:flex-none px-8 py-3 rounded-xl font-semibold text-base
                    bg-indigo-600 hover:bg-indigo-700 text-white 
                    transition-all shadow-md hover:shadow-lg
                    disabled:opacity-60 disabled:cursor-not-allowed
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

function InfoCard({
  icon,
  label,
  value,
  accent = "",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div
      className={`
        bg-white border border-gray-200 rounded-xl p-5 
        hover:shadow-md transition-all duration-200
        ${accent}
      `}
    >
      <div className="flex items-center gap-3 text-sm text-gray-600 font-medium uppercase tracking-wide mb-2">
        {icon}
        {label}
      </div>
      <div className="text-lg lg:text-xl font-semibold text-gray-900">
        {value}
      </div>
    </div>
  );
}

function RequirementSection({
  title,
  items,
  accent = "",
}: {
  title: string;
  items: string[];
  accent?: string;
}) {
  return (
    <div
      className={`
        bg-white rounded-2xl p-6 lg:p-7 
        border border-gray-200 shadow-sm hover:shadow-md transition-all
        ${accent}
      `}
    >
      <h4 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-200/70">
        {title}
      </h4>
      <ul className="space-y-3 text-base lg:text-lg text-gray-800">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="mt-1.5 h-2 w-2 rounded-full bg-indigo-500 flex-shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
