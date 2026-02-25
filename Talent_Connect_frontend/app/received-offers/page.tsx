"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  Send,
  CalendarDays,
  CalendarClock,
  Users2,
  Banknote,
  MailOpen,
  Users,
  Eye,
  ArrowRight,
} from "lucide-react";
import api from "@/lib/api";
import OfferViewModal from "@/views/received-offers/view/OfferViewModal";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

/* ─── Updated Global Styles ──────────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

  .sol-root { font-family: 'Outfit', sans-serif; }

  @keyframes sol-fade-up {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .sol-fade-up { animation: sol-fade-up 0.4s cubic-bezier(0.16,1,0.3,1) both; }
  .sol-delay-1 { animation-delay: 0.05s; }
  .sol-delay-2 { animation-delay: 0.1s; }

  .sol-stat {
    position: relative;
    overflow: hidden;
    border-radius: 16px;
    padding: 24px;
    border: 1.5px solid rgba(0,0,0,0.06);
    background: #fff;
    cursor: pointer;
    transition: all 0.28s cubic-bezier(0.16,1,0.3,1);
    text-align: center;
  }
  .sol-stat:hover {
    transform: translateY(-5px);
    box-shadow: 0 16px 40px rgba(0,0,0,0.14);
  }
  .sol-stat.active-all      { border-color: #6366f1; background: linear-gradient(135deg,#eef2ff,#e0e7ff); box-shadow: 0 12px 32px rgba(99,102,241,0.25); }
  .sol-stat.active-pending  { border-color: #f59e0b; background: linear-gradient(135deg,#fffbeb,#fef3c7); box-shadow: 0 12px 32px rgba(245,158,11,0.25); }
  .sol-stat.active-accepted { border-color: #10b981; background: linear-gradient(135deg,#ecfdf5,#d1fae5); box-shadow: 0 12px 32px rgba(16,185,129,0.25); }
  .sol-stat.active-rejected { border-color: #ef4444; background: linear-gradient(135deg,#fef2f2,#fee2e2); box-shadow: 0 12px 32px rgba(239,68,68,0.25); }

  .sol-stat-icon {
    width: 52px; height: 52px;
    border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 14px;
    transition: transform 0.28s;
  }
  .sol-stat:hover .sol-stat-icon { transform: scale(1.12) rotate(6deg); }

  .sol-stat-count {
    font-size: 36px;
    font-weight: 800;
    line-height: 1;
    margin-bottom: 6px;
    letter-spacing: -0.8px;
  }
  .sol-stat-label {
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 1px;
    text-transform: uppercase;
    opacity: 0.7;
  }

  .sol-stat-glow {
    position: absolute;
    bottom: -40px; right: -40px;
    width: 120px; height: 120px;
    border-radius: 50%;
    opacity: 0.12;
    pointer-events: none;
  }

  .sol-card {
    border-radius: 18px;
    border: 1.5px solid rgba(0,0,0,0.07);
    background: #fff;
    overflow: hidden;
    box-shadow: 0 4px 14px rgba(0,0,0,0.06);
    transition: all 0.28s cubic-bezier(0.16,1,0.3,1);
  }
  .sol-card:hover {
    box-shadow: 0 12px 36px rgba(99,102,241,0.14);
    transform: translateY(-3px);
  }

  .sol-card-header {
    padding: 24px;
    background: linear-gradient(135deg, #f9fafb, #f3f4f6);
  }

  .sol-job-title {
    font-size: 20px;
    font-weight: 700;
    color: #111827;
    line-height: 1.3;
    margin-bottom: 12px;
  }

  .sol-pill {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 5px 14px;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.1px;
  }
  .sol-pill-salary  { background: #ecfdf5; color: #059669; }
  .sol-pill-posts   { background: #f3f4f6; color: #4b5563; }
  .sol-pill-date    { background: #fff7ed; color: #c2410c; }

  .sol-meta {
    display: flex; flex-wrap: wrap; gap: 18px; margin-top: 10px;
    font-size: 14px; color: #4b5563;
  }

  .sol-status {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 6px 14px;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 600;
  }
  .sol-status-pending   { background: #fffbeb; color: #d97706; }
  .sol-status-accepted  { background: #ecfdf5; color: #059669; }
  .sol-status-rejected  { background: #fef2f2; color: #dc2626; }

  .sol-btn {
    display: inline-flex; align-items: center; justify-content: center;
    gap: 8px;
    padding: 10px 20px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 600;
    transition: all 0.24s;
  }
  .sol-btn-accept  { background: #10b981; color: white; }
  .sol-btn-accept:hover  { background: #059669; transform: translateY(-1px); }
  .sol-btn-reject  { background: #ef4444; color: white; }
  .sol-btn-reject:hover  { background: #dc2626; transform: translateY(-1px); }

  .sol-btn-eye {
    width: 40px; height: 40px;
    border-radius: 12px;
    border: 1.5px solid rgba(99,102,241,0.25);
    background: rgba(99,102,241,0.06);
    color: #6366f1;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.24s;
  }
  .sol-btn-eye:hover {
    background: #6366f1;
    color: white;
    border-color: #6366f1;
    transform: scale(1.1);
  }

  .sol-empty {
    padding: 100px 24px;
    text-align: center;
    border: 2px dashed rgba(99,102,241,0.2);
    border-radius: 18px;
    background: linear-gradient(135deg, rgba(99,102,241,0.03), rgba(139,92,246,0.03));
  }
  .sol-empty-icon {
    width: 64px; height: 64px;
    margin: 0 auto 20px;
    border-radius: 16px;
    background: rgba(99,102,241,0.08);
    display: flex; align-items: center; justify-content: center;
  }
`;

/* ─── Types & Helpers ────────────────────────────────────────────────────── */
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
  industry?: { industry_name?: string };
}

function fmt(n?: number) {
  if (!n) return null;
  return `₹${(n / 100000).toFixed(1)}L`;
}

function salaryStr(min?: number, max?: number) {
  const mn = fmt(min),
    mx = fmt(max);
  if (mn && mx) return `${mn} – ${mx}`;
  if (mn) return `From ${mn}`;
  if (mx) return `Up to ${mx}`;
  return null;
}

function formatDate(d?: string) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return d;
  }
}

/* ─── Stat Card Component ────────────────────────────────────────────────── */
function StatCard({
  label,
  count,
  active,
  onClick,
  icon: Icon,
  iconBg,
  countColor,
  activeClass,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  icon: any;
  iconBg: string;
  countColor: string;
  activeClass: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`sol-stat ${active ? activeClass : ""} sol-fade-up sol-delay-1`}
    >
      <div className="sol-stat-icon" style={{ background: iconBg }}>
        <Icon size={24} color="#fff" />
      </div>
      <div
        className="sol-stat-count"
        style={{ color: active ? countColor : "#111827" }}
      >
        {count}
      </div>
      <div className="sol-stat-label">{label}</div>
      <div className="sol-stat-glow" style={{ background: countColor }} />
    </button>
  );
}

/* ─── Main Received Offers Page ──────────────────────────────────────────── */
export default function ReceivedOffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>("All");

  const [currentOffer, setCurrentOffer] = useState<Offer | null>(null);
  const [viewModal, setViewModal] = useState<boolean>(false);

  const currentOfferRedirect: any = useSelector(
    (state: RootState) => state?.institutes?.offer,
  );

  useEffect(() => {
    if (currentOfferRedirect?.status) {
      setFilter(currentOfferRedirect.status);
    }
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

  const tabs = ["All", "Pending", "Accepted", "Rejected"];
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

  return (
    <>
      <style>{styles}</style>

      <div className="sol-root px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 pt-10 pb-12 w-full">
        {/* Header */}
        <div className="sol-page-header sol-fade-up flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-5">
            <div
              className="
                w-14 h-14 sm:w-16 sm:h-16 rounded-2xl 
                bg-gradient-to-br from-indigo-600 to-purple-600 
                flex items-center justify-center 
                shadow-lg ring-1 ring-indigo-400/40
              "
            >
              <MailOpen size={28} className="text-white" strokeWidth={2.2} />
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-gray-900">
                Received Offers
              </h1>
              <p className="mt-2 text-base sm:text-lg text-gray-600">
                Manage incoming job offers from industry partners
              </p>
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        {!loading && offers.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 lg:gap-6 mb-12">
            <StatCard
              label="Total"
              count={counts["All"]}
              active={filter === "All"}
              onClick={() => setFilter("All")}
              icon={Users}
              iconBg="linear-gradient(135deg,#6366f1,#8b5cf6)"
              countColor="#6366f1"
              activeClass="active-all"
            />
            <StatCard
              label="Pending"
              count={counts["Pending"]}
              active={filter === "Pending"}
              onClick={() => setFilter("Pending")}
              icon={Clock}
              iconBg="linear-gradient(135deg,#f59e0b,#fbbf24)"
              countColor="#f59e0b"
              activeClass="active-pending"
            />
            <StatCard
              label="Accepted"
              count={counts["Accepted"]}
              active={filter === "Accepted"}
              onClick={() => setFilter("Accepted")}
              icon={CheckCircle2}
              iconBg="linear-gradient(135deg,#10b981,#34d399)"
              countColor="#10b981"
              activeClass="active-accepted"
            />
            <StatCard
              label="Rejected"
              count={counts["Rejected"]}
              active={filter === "Rejected"}
              onClick={() => setFilter("Rejected")}
              icon={XCircle}
              iconBg="linear-gradient(135deg,#ef4444,#f87171)"
              countColor="#ef4444"
              activeClass="active-rejected"
            />
          </div>
        )}

        {/* Loading / Empty / Content */}
        {loading ? (
          <div className="text-center py-24">
            <Loader2 className="animate-spin mx-auto" size={40} />
            <p className="mt-6 text-lg text-gray-600">
              Loading received offers...
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="sol-empty sol-fade-up">
            <div className="sol-empty-icon">
              <Send size={40} color="#6366f1" />
            </div>
            <div className="mt-6">
              <div className="text-2xl font-semibold text-gray-800">
                No offers found
              </div>
              <p className="mt-3 text-base text-gray-600">
                {filter === "All"
                  ? "No job offers have been received yet."
                  : `No ${filter.toLowerCase()} offers at the moment.`}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {filtered.map((offer, index) => {
              const isPending = offer.status === "Pending";
              const salary = salaryStr(offer.salary_min, offer.salary_max);

              return (
                <div
                  key={offer.offer_id}
                  className={`sol-card sol-fade-up`}
                  style={{ animationDelay: `${index * 0.06}s` }}
                >
                  <div className="sol-card-header">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      <div className="flex-1 min-w-0">
                        <h2 className="sol-job-title">{offer.job_title}</h2>

                        <div className="sol-meta mt-3">
                          <div className="flex items-center gap-2">
                            <Building2 size={16} />
                            {offer.industry?.industry_name ||
                              "Industry Partner"}
                          </div>
                          <div className="flex items-center gap-2">
                            <CalendarDays size={16} />
                            Sent: {formatDate(offer.offer_date)}
                          </div>
                          {offer.last_date && (
                            <div className="flex items-center gap-2">
                              <CalendarClock size={16} />
                              Apply by: {formatDate(offer.last_date)}
                            </div>
                          )}
                          {offer.number_of_posts && (
                            <div className="flex items-center gap-2">
                              <Users2 size={16} />
                              {offer.number_of_posts} post
                              {offer.number_of_posts !== 1 ? "s" : ""}
                            </div>
                          )}
                        </div>

                        {salary && (
                          <div className="mt-4">
                            <span className="sol-pill sol-pill-salary text-base">
                              {salary}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-4 self-start lg:self-center">
                        <button
                          className="sol-btn-eye"
                          onClick={() => {
                            setCurrentOffer(offer);
                            setViewModal(true);
                          }}
                        >
                          <Eye size={20} />
                        </button>

                        <span
                          className={`sol-status sol-status-${offer.status.toLowerCase()} text-base`}
                        >
                          {offer.status === "Pending" && <Clock size={14} />}
                          {offer.status === "Accepted" && (
                            <CheckCircle2 size={14} />
                          )}
                          {offer.status === "Rejected" && <XCircle size={14} />}
                          {offer.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {offer.job_description && (
                    <div className="px-6 lg:px-8 pb-6 pt-4 text-base leading-relaxed text-gray-700 border-t">
                      {offer.job_description}
                    </div>
                  )}

                  {isPending && (
                    <div className="px-6 lg:px-8 pb-6 flex flex-col sm:flex-row gap-4">
                      <button
                        className="sol-btn sol-btn-accept flex-1 text-base"
                        onClick={() => updateStatus(offer.offer_id, "Accepted")}
                        disabled={updating === offer.offer_id}
                      >
                        {updating === offer.offer_id ? (
                          <Loader2 size={20} className="animate-spin" />
                        ) : (
                          "Accept Offer"
                        )}
                      </button>

                      <button
                        className="sol-btn sol-btn-reject flex-1 text-base"
                        onClick={() => updateStatus(offer.offer_id, "Rejected")}
                        disabled={updating === offer.offer_id}
                      >
                        {updating === offer.offer_id ? (
                          <Loader2 size={20} className="animate-spin" />
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
            if (currentOffer) {
              updateStatus(currentOffer.offer_id, "Accepted").then(() =>
                setViewModal(false),
              );
            }
          }}
          onReject={() => {
            if (currentOffer) {
              updateStatus(currentOffer.offer_id, "Rejected").then(() =>
                setViewModal(false),
              );
            }
          }}
        />
      </div>
    </>
  );
}
