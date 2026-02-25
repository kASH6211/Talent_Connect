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

    const fmt = (n: number) => `₹${(n / 100000).toFixed(1)}L`;

    if (min && max) return `${fmt(min)} – ${fmt(max)} per annum`;
    if (min) return `From ${fmt(min)}`;
    if (max) return `Up to ${fmt(max)}`;
    return "Not disclosed";
  };

  const splitList = (value?: string) =>
    value ? value.split(",").map((v) => v.trim()) : [];

  const qualifications = splitList(offer.required_qualification_ids);
  const programs = splitList(offer.required_program_ids);
  const streams = splitList(offer.required_stream_ids);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      {/* Modal */}
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Close */}
        <button
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-indigo-50 to-blue-50 rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-900">
            {offer.job_title}
          </h2>

          <div className="flex items-center gap-2 mt-2 text-indigo-600 font-medium">
            <Building2 size={16} />
            {offer.industry?.industry_name ?? "Industry"}
          </div>

          {offer.industry?.emailId && (
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
              <Mail size={14} />
              {offer.industry.emailId}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Info Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <InfoCard
              icon={<DollarSign size={16} />}
              label="Salary"
              value={formatSalary()}
            />
            <InfoCard
              icon={<Users size={16} />}
              label="Posts"
              value={offer.number_of_posts?.toString() || "—"}
            />
            <InfoCard
              icon={<CalendarDays size={16} />}
              label="Offer Date"
              value={formatDate(offer.offer_date)}
            />
            <InfoCard
              icon={<CalendarClock size={16} />}
              label="Apply By"
              value={formatDate(offer.last_date)}
            />
          </div>

          {/* Description */}
          {offer.job_description && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Job Description
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {offer.job_description}
              </p>
            </div>
          )}

          {/* Lists */}
          <div className="grid sm:grid-cols-3 gap-4">
            {qualifications.length > 0 && (
              <ListSection title="Qualifications" items={qualifications} />
            )}
            {programs.length > 0 && (
              <ListSection title="Programs" items={programs} />
            )}
            {streams.length > 0 && (
              <ListSection title="Streams" items={streams} />
            )}
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
              <Clock size={16} />
              Status:
              <span
                className={`ml-1 px-3 py-1 rounded-full text-xs font-semibold ${
                  offer.status === "Accepted"
                    ? "bg-green-100 text-green-700"
                    : offer.status === "Rejected"
                      ? "bg-red-100 text-red-700"
                      : offer.status === "Pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-600"
                }`}
              >
                {offer.status}
              </span>
            </div>

            {offer.status === "Pending" && (
              <div className="flex gap-3">
                <button
                  onClick={onReject}
                  className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-semibold transition"
                >
                  Reject
                </button>
                <button
                  onClick={onAccept}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-semibold transition"
                >
                  Accept
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* Info Card */
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
    <div className="bg-gray-50 border rounded-xl p-4">
      <div className="flex items-center gap-2 text-xs text-gray-500 uppercase font-semibold mb-1">
        {icon}
        {label}
      </div>
      <div className="text-sm font-bold text-gray-900">{value}</div>
    </div>
  );
}

/* List Section */
function ListSection({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="bg-gray-50 border rounded-xl p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-2">{title}</h3>
      <ul className="space-y-1 text-sm text-gray-700">
        {items.map((item, i) => (
          <li key={i}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}
