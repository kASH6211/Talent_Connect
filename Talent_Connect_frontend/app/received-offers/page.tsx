"use client";

import { use, useEffect, useState } from "react";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  Send,
  CalendarDays,
  CalendarClock,
  FileText,
  Users2,
  Banknote,
  MailOpen,
  Users,
  ArrowRight,
  Eye,
} from "lucide-react";
import api from "@/lib/api";
import JobDetailModal from "@/views/sent-offer/view/JobDetailModal";
import OfferViewModal from "@/views/received-offers/view/OfferViewModal";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

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
  required_qualification_ids?: string;
  required_program_ids?: string;
  required_stream_ids?: string;
  industry?: { industry_name?: string; email?: string };
}

const statusConfig: Record<
  string,
  { badge: string; icon: any; label: string; ring: string }
> = {
  Pending: {
    badge: "bg-amber-100 text-amber-700",
    icon: Clock,
    label: "Pending",
    ring: "border-amber-200",
  },
  Accepted: {
    badge: "bg-green-100 text-green-700",
    icon: CheckCircle2,
    label: "Accepted",
    ring: "border-green-200",
  },
  Rejected: {
    badge: "bg-red-100 text-red-700",
    icon: XCircle,
    label: "Rejected",
    ring: "border-red-200",
  },
  Withdrawn: {
    badge: "bg-gray-100 text-gray-600",
    icon: XCircle,
    label: "Withdrawn",
    ring: "border-gray-200",
  },
};

export default function ReceivedOffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>("All");

  const [currentOffer, setCurrentOffer] = useState<Offer | null | any>(null);
  const [viewModal, setViewModal] = useState<boolean>(false);

  const currnetOfferRedirect: any = useSelector(
    (state: RootState) => state?.institutes?.offer,
  );

  console.log("currentOfferRedireec", currnetOfferRedirect);

  useEffect(() => {
    if (currnetOfferRedirect?.status) {
      setFilter(currnetOfferRedirect?.status);
    }
  }, [currnetOfferRedirect]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/job-offer/received");
      setOffers(res.data);
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

  const fmt = (n?: number) => (n ? `₹${(n / 100000).toFixed(1)}L` : null);

  const salaryStr = (min?: number, max?: number) => {
    const mn = fmt(min);
    const mx = fmt(max);
    if (mn && mx) return `${mn} – ${mx} per annum`;
    if (mn) return `From ${mn} per annum`;
    if (mx) return `Up to ${mx} per annum`;
    return null;
  };

  const formatDate = (d?: string) => {
    if (!d) return null;
    try {
      return new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return d;
    }
  };

  const tabs = ["All", "Pending", "Accepted", "Rejected", "Withdrawn"];

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

  function Detail({ icon: Icon, label, value }: any) {
    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Icon size={12} />
          {label}
        </div>
        <div className="text-sm font-semibold text-gray-700">
          {value ?? "—"}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="mb-8 flex flex-col lg:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MailOpen size={28} className="text-primary" />
            Received Job Offers
          </h1>
          <p className="text-gray-500 mt-1">
            Job offers sent to your institute by industry partners
          </p>
        </div>
      </div>

      {/* Tabs */}
      {!loading && offers.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-10">
          {tabs.map((t) => {
            const isActive = filter === t;
            const count = counts[t] || 0;

            const Icon =
              t === "All"
                ? Users
                : t === "Pending"
                  ? Clock
                  : t === "Accepted"
                    ? CheckCircle2
                    : t === "Rejected"
                      ? XCircle
                      : ArrowRight;

            return (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`group relative rounded-2xl p-5 border transition-all duration-300 text-center overflow-hidden
            ${
              isActive
                ? "bg-primary text-white border-primary shadow-lg scale-[1.02]"
                : "bg-white border-gray-200 hover:border-primary/40 hover:shadow-md hover:-translate-y-1"
            }`}
              >
                {/* Background Glow Effect */}
                {!isActive && (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                )}

                {/* Icon */}
                <div
                  className={`w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center transition-all duration-300
              ${
                isActive
                  ? "bg-white/20"
                  : "bg-gray-100 group-hover:bg-primary/10"
              }`}
                >
                  <Icon
                    size={20}
                    className={`transition-colors duration-300 ${
                      isActive
                        ? "text-white"
                        : "text-gray-500 group-hover:text-primary"
                    }`}
                  />
                </div>

                {/* Label */}
                <div
                  className={`text-sm font-semibold transition-colors duration-300 ${
                    isActive
                      ? "text-white"
                      : "text-gray-700 group-hover:text-primary"
                  }`}
                >
                  {t}
                </div>

                {/* Count */}
                <div
                  className={`text-2xl font-bold mt-1 transition-all duration-300 ${
                    isActive
                      ? "text-white"
                      : "text-gray-900 group-hover:text-primary"
                  }`}
                >
                  {count}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="text-center py-16">
          <Loader2 className="animate-spin mx-auto" size={30} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Send size={30} className="mx-auto mb-3" />
          <p>No offers found</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filtered.map((offer) => {
            const sc = statusConfig[offer.status] ?? statusConfig["Pending"];
            const StatusIcon = sc.icon;
            const salary = salaryStr(offer.salary_min, offer.salary_max);
            const isPending = offer.status === "Pending";

            return (
              <div
                key={offer.offer_id}
                className={`bg-white rounded-2xl border ${sc.ring} shadow-md hover:shadow-lg transition-all p-6`}
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold">{offer.job_title}</h2>
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                      <Building2 size={14} />
                      {offer.industry?.industry_name ?? "Industry"}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Eye Button */}
                    <button
                      className="p-2 rounded-lg border hover:bg-gray-100 transition"
                      onClick={() => {
                        setViewModal(true);
                        setCurrentOffer(offer);
                      }}
                    >
                      <Eye size={18} />
                    </button>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${sc.badge}`}
                    >
                      <StatusIcon size={12} />
                      {sc.label}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                  <Detail
                    icon={CalendarDays}
                    label="Offer Date"
                    value={formatDate(offer.offer_date)}
                  />
                  <Detail
                    icon={CalendarClock}
                    label="Apply By"
                    value={formatDate(offer.last_date)}
                  />
                  <Detail
                    icon={Users2}
                    label="Posts"
                    value={offer.number_of_posts?.toString()}
                  />
                  <Detail icon={Banknote} label="Salary" value={salary} />
                </div>

                {offer.job_description && (
                  <p className="text-sm text-gray-600 mb-4">
                    {offer.job_description}
                  </p>
                )}

                {/* Buttons */}
                {isPending && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => updateStatus(offer.offer_id, "Accepted")}
                      disabled={updating === offer.offer_id}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition"
                    >
                      {updating === offer.offer_id ? (
                        <Loader2 size={16} className="animate-spin mx-auto" />
                      ) : (
                        "Accept"
                      )}
                    </button>

                    <button
                      onClick={() => updateStatus(offer.offer_id, "Rejected")}
                      disabled={updating === offer.offer_id}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition"
                    >
                      {updating === offer.offer_id ? (
                        <Loader2 size={16} className="animate-spin mx-auto" />
                      ) : (
                        "Reject"
                      )}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <OfferViewModal
        open={viewModal}
        setOpen={setViewModal}
        offer={currentOffer}
        onAccept={() => {
          updateStatus(currentOffer.offer_id, "Accepted").then(() => {
            setViewModal(false);
          });
        }}
        onReject={() =>
          updateStatus(currentOffer.offer_id, "Rejected").then(() =>
            setViewModal(false),
          )
        }
      />
    </div>
  );
}
