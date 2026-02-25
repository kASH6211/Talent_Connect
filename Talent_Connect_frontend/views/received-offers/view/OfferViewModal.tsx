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
      bg: "bg-amber-100 text-amber-800 border-amber-300",
      icon: Clock,
    },
    Accepted: {
      bg: "bg-emerald-100 text-emerald-800 border-emerald-300",
      icon: CheckCircle2,
    },
    Rejected: {
      bg: "bg-rose-100 text-rose-800 border-rose-300",
      icon: XCircle,
    },
  };

  const StatusConfig = statusStyles[
    offer.status as keyof typeof statusStyles
  ] || {
    bg: "bg-gray-100 text-gray-800 border-gray-300",
    icon: Clock,
  };

  const StatusIcon = StatusConfig.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/65 backdrop-blur-md"
        onClick={() => setOpen(false)}
      />

      {/* Modal Content */}
      <div
        className="
          relative w-full max-w-2xl lg:max-w-3xl 
          bg-white/95 backdrop-blur-xl 
          rounded-2xl sm:rounded-3xl 
          shadow-2xl border border-gray-200/80
          max-h-[92vh] overflow-y-auto
          animate-in fade-in zoom-in-95 duration-300
        "
      >
        {/* Close Button */}
        <button
          onClick={() => setOpen(false)}
          className="
            absolute top-4 right-4 sm:top-5 sm:right-5 
            p-2.5 rounded-full 
            bg-white/80 hover:bg-gray-100 
            text-gray-700 hover:text-gray-900 
            transition-all shadow-sm hover:shadow
          "
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="px-6 pt-7 pb-5 sm:px-8 sm:pt-8 border-b bg-gradient-to-b from-indigo-50/70 to-white/50">
          <div className="flex items-start gap-4">
            <div
              className="
                flex-shrink-0 w-14 h-14 rounded-2xl 
                bg-gradient-to-br from-indigo-500 to-indigo-600 
                flex items-center justify-center shadow-md
              "
            >
              <Briefcase size={26} className="text-white" strokeWidth={1.8} />
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight leading-tight">
                {offer.job_title}
              </h2>

              <div className="mt-2.5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-gray-700">
                <div className="flex items-center gap-2 font-medium">
                  <Building2 size={16} className="text-indigo-600" />
                  {offer.industry?.industry_name || "Industry Partner"}
                </div>

                {offer.industry?.emailId && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail size={15} className="text-gray-500" />
                    <span className="font-mono text-gray-600 truncate max-w-[220px]">
                      {offer.industry.emailId}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 space-y-8">
          {/* Key Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
            <InfoCard
              icon={<DollarSign size={18} />}
              label="Salary"
              value={formatSalary()}
            />
            <InfoCard
              icon={<Users size={18} />}
              label="Positions"
              value={offer.number_of_posts?.toString() || "—"}
            />
            <InfoCard
              icon={<CalendarDays size={18} />}
              label="Offered On"
              value={formatDate(offer.offer_date)}
            />
            <InfoCard
              icon={<CalendarClock size={18} />}
              label="Apply By"
              value={formatDate(offer.last_date)}
            />
          </div>

          {/* Job Description */}
          {offer.job_description && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Briefcase size={18} className="text-indigo-600" />
                Job Description
              </h3>
              <div className="prose prose-sm sm:prose text-gray-700 leading-relaxed max-w-none">
                {offer.job_description}
              </div>
            </div>
          )}

          {/* Requirements Grid */}
          {(qualifications.length > 0 ||
            programs.length > 0 ||
            streams.length > 0) && (
            <div className="grid sm:grid-cols-3 gap-5">
              {qualifications.length > 0 && (
                <RequirementSection
                  title="Qualifications"
                  items={qualifications}
                />
              )}
              {programs.length > 0 && (
                <RequirementSection title="Programs" items={programs} />
              )}
              {streams.length > 0 && (
                <RequirementSection title="Streams" items={streams} />
              )}
            </div>
          )}

          {/* Footer / Status & Actions */}
          <div className="pt-6 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-center gap-3">
              <div
                className={`
                  inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium border
                  ${StatusConfig.bg} ${StatusConfig.icon || ""}
                `}
              >
                <StatusIcon size={16} />
                {offer.status}
              </div>
            </div>

            {offer.status === "Pending" && (
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button
                  onClick={onReject}
                  className="
                    flex-1 sm:flex-none px-6 py-2.5 rounded-lg font-medium 
                    bg-rose-600 hover:bg-rose-700 text-white 
                    transition-all shadow-sm hover:shadow
                    disabled:opacity-60 disabled:cursor-not-allowed
                  "
                >
                  Reject Offer
                </button>

                <button
                  onClick={onAccept}
                  className="
                    flex-1 sm:flex-none px-6 py-2.5 rounded-lg font-medium 
                    bg-indigo-600 hover:bg-indigo-700 text-white 
                    transition-all shadow-sm hover:shadow
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
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-gray-50/80 border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-center gap-2 text-xs text-gray-500 font-medium uppercase tracking-wide mb-1.5">
        {icon}
        {label}
      </div>
      <div className="text-base font-semibold text-gray-900">{value}</div>
    </div>
  );
}

function RequirementSection({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div className="bg-gray-50/70 border border-gray-200 rounded-xl p-5">
      <h4 className="text-sm font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200/70">
        {title}
      </h4>
      <ul className="space-y-2 text-sm text-gray-700">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
