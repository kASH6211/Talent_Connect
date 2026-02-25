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

/* ─── Global Styles (same beautiful design language as Sent Offers) ─────── */
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
    padding: 20px 24px;
    border: 1.5px solid rgba(0,0,0,0.06);
    background: #fff;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.16,1,0.3,1);
    text-align: center;
  }
  .sol-stat:hover {
    transform: translateY(-4px);
    box-shadow: 0 14px 36px rgba(0,0,0,0.12);
  }
  .sol-stat.active-all      { border-color: #6366f1; background: linear-gradient(135deg,#eef2ff,#e0e7ff); box-shadow: 0 10px 28px rgba(99,102,241,0.22); }
  .sol-stat.active-pending  { border-color: #f59e0b; background: linear-gradient(135deg,#fffbeb,#fef3c7); box-shadow: 0 10px 28px rgba(245,158,11,0.22); }
  .sol-stat.active-accepted { border-color: #10b981; background: linear-gradient(135deg,#ecfdf5,#d1fae5); box-shadow: 0 10px 28px rgba(16,185,129,0.22); }
  .sol-stat.active-rejected { border-color: #ef4444; background: linear-gradient(135deg,#fef2f2,#fee2e2); box-shadow: 0 10px 28px rgba(239,68,68,0.22); }

  .sol-stat-icon {
    width: 48px; height: 48px;
    border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 12px;
    transition: transform 0.25s;
  }
  .sol-stat:hover .sol-stat-icon { transform: scale(1.1) rotate(4deg); }

  .sol-stat-count {
    font-size: 32px;
    font-weight: 800;
    line-height: 1;
    margin-bottom: 4px;
    letter-spacing: -0.6px;
  }
  .sol-stat-label {
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.9px;
    text-transform: uppercase;
    opacity: 0.65;
  }

  .sol-stat-glow {
    position: absolute;
    bottom: -30px; right: -30px;
    width: 100px; height: 100px;
    border-radius: 50%;
    opacity: 0.09;
    pointer-events: none;
  }

  .sol-card {
    border-radius: 16px;
    border: 1.5px solid rgba(0,0,0,0.07);
    background: #fff;
    overflow: hidden;
    box-shadow: 0 3px 10px rgba(0,0,0,0.05);
    transition: all 0.24s cubic-bezier(0.16,1,0.3,1);
  }
  .sol-card:hover {
    box-shadow: 0 10px 32px rgba(99,102,241,0.12);
    transform: translateY(-2px);
  }

  .sol-card-header {
    padding: 20px 24px;
    background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  }

  .sol-job-title {
    font-size: 17px;
    font-weight: 700;
    color: #0f0e1a;
    line-height: 1.3;
    margin-bottom: 10px;
  }

  .sol-pill {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.1px;
  }
  .sol-pill-salary  { background: #ecfdf5; color: #059669; }
  .sol-pill-posts   { background: #f1f5f9; color: #64748b; }
  .sol-pill-date    { background: #fff7ed; color: #c2410c; }

  .sol-meta {
    display: flex; flex-wrap: wrap; gap: 16px; margin-top: 8px;
    font-size: 13px; color: #64748b;
  }

  .sol-status {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 5px 12px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
  }
  .sol-status-pending   { background: #fffbeb; color: #d97706; }
  .sol-status-accepted  { background: #ecfdf5; color: #059669; }
  .sol-status-rejected  { background: #fef2f2; color: #dc2626; }

  .sol-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 16px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 600;
    transition: all 0.2s;
  }
  .sol-btn-accept  { background: #10b981; color: white; }
  .sol-btn-accept:hover  { background: #059669; }
  .sol-btn-reject  { background: #ef4444; color: white; }
  .sol-btn-reject:hover  { background: #dc2626; }

  .sol-btn-eye {
    width: 36px; height: 36px;
    border-radius: 10px;
    border: 1.5px solid rgba(99,102,241,0.2);
    background: rgba(99,102,241,0.04);
    color: #6366f1;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.2s;
  }
  .sol-btn-eye:hover {
    background: #6366f1;
    color: white;
    border-color: #6366f1;
    transform: scale(1.08);
  }

  .sol-empty {
    padding: 80px 24px;
    text-align: center;
    border: 2px dashed rgba(99,102,241,0.18);
    border-radius: 16px;
    background: linear-gradient(135deg, rgba(99,102,241,0.02), rgba(139,92,246,0.02));
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
        <Icon size={22} color="#fff" />
      </div>
      <div
        className="sol-stat-count"
        style={{ color: active ? countColor : "#0f0e1a" }}
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

      <div className="sol-root px-[18px] pt-10 pb-5 mx-auto w-full max-w-7xl lg:max-w-screen-2xl">
        {/* Header */}
        <div className="sol-page-header sol-fade-up flex flex-col sm:flex-row items-center justify-between gap-6 mb-10 lg:mb-12">
          <div className="flex items-center gap-4">
            <div
              className="
        w-12 h-12 rounded-xl 
        bg-gradient-to-br from-indigo-600 to-purple-600 
        flex items-center justify-center 
        shadow-md ring-1 ring-indigo-400/30
      "
            >
              <MailOpen size={24} className="text-white" strokeWidth={2} />
            </div>

            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
                Received Offers
              </h1>
              <p className="mt-1 text-gray-600 dark:text-gray-400">
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
          <div className="text-center py-20">
            <Loader2 className="animate-spin mx-auto" size={36} />
            <p className="mt-4 text-gray-500">Loading received offers...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="sol-empty sol-fade-up">
            <div className="sol-empty-icon">
              <Send size={32} color="#6366f1" />
            </div>
            <div className="mt-5">
              <div className="text-xl font-semibold text-gray-800">
                No offers found
              </div>
              <p className="mt-2 text-gray-500">
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
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h2 className="sol-job-title">{offer.job_title}</h2>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1.5">
                          <Building2 size={15} />
                          {offer.industry?.industry_name || "Industry Partner"}
                        </div>

                        <div className="sol-meta">
                          <div className="flex items-center gap-1.5">
                            <CalendarDays size={14} />
                            Sent: {formatDate(offer.offer_date)}
                          </div>
                          {offer.last_date && (
                            <div className="flex items-center gap-1.5">
                              <CalendarClock size={14} />
                              Apply by: {formatDate(offer.last_date)}
                            </div>
                          )}
                          {offer.number_of_posts && (
                            <div className="flex items-center gap-1.5">
                              <Users2 size={14} />
                              {offer.number_of_posts} post
                              {offer.number_of_posts !== 1 ? "s" : ""}
                            </div>
                          )}
                        </div>

                        {salary && (
                          <div className="mt-3">
                            <span className="sol-pill sol-pill-salary">
                              {salary}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3 self-start sm:self-center">
                        <button
                          className="sol-btn-eye"
                          onClick={() => {
                            setCurrentOffer(offer);
                            setViewModal(true);
                          }}
                        >
                          <Eye size={18} />
                        </button>

                        <span
                          className={`sol-status sol-status-${offer.status.toLowerCase()}`}
                        >
                          {offer.status === "Pending" && <Clock size={13} />}
                          {offer.status === "Accepted" && (
                            <CheckCircle2 size={13} />
                          )}
                          {offer.status === "Rejected" && <XCircle size={13} />}
                          {offer.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {offer.job_description && (
                    <div className="px-6 pb-5 pt-3 text-sm text-gray-600 border-t">
                      {offer.job_description}
                    </div>
                  )}

                  {isPending && (
                    <div className="px-6 pb-6 flex gap-4">
                      <button
                        className="sol-btn sol-btn-accept flex-1"
                        onClick={() => updateStatus(offer.offer_id, "Accepted")}
                        disabled={updating === offer.offer_id}
                      >
                        {updating === offer.offer_id ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          "Accept Offer"
                        )}
                      </button>

                      <button
                        className="sol-btn sol-btn-reject flex-1"
                        onClick={() => updateStatus(offer.offer_id, "Rejected")}
                        disabled={updating === offer.offer_id}
                      >
                        {updating === offer.offer_id ? (
                          <Loader2 size={18} className="animate-spin" />
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
