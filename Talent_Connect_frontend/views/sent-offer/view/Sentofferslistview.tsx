"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Loader2,
  Send,
  ChevronDown,
  X,
  AlertCircle,
  CheckCircle2,
  Clock,
  Ban,
  CalendarDays,
  Building2,
  Eye,
  TrendingUp,
  MailCheck,
  XCircle,
} from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

/* ─── Styles ──────────────────────────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

  .sol-root { font-family: 'Outfit', sans-serif; }

  /* Page fade-in */
  @keyframes sol-fade-up {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .sol-fade-up { animation: sol-fade-up 0.4s cubic-bezier(0.16,1,0.3,1) both; }
  .sol-delay-1 { animation-delay: 0.05s; }
  .sol-delay-2 { animation-delay: 0.1s; }
  .sol-delay-3 { animation-delay: 0.15s; }
  .sol-delay-4 { animation-delay: 0.2s; }

  /* Stat Cards */
  .sol-stat {
    position: relative;
    overflow: hidden;
    border-radius: 16px;
    padding: 20px;
    border: 1.5px solid rgba(0,0,0,0.06);
    background: #fff;
    cursor: pointer;
    transition: all 0.22s cubic-bezier(0.16,1,0.3,1);
    text-align: left;
  }
  .sol-stat:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,0,0,0.1); }
  .sol-stat.active-all     { border-color: #6366f1; background: linear-gradient(135deg,#eef2ff,#e0e7ff); box-shadow: 0 8px 24px rgba(99,102,241,0.18); }
  .sol-stat.active-accepted{ border-color: #10b981; background: linear-gradient(135deg,#ecfdf5,#d1fae5); box-shadow: 0 8px 24px rgba(16,185,129,0.18); }
  .sol-stat.active-pending { border-color: #f59e0b; background: linear-gradient(135deg,#fffbeb,#fef3c7); box-shadow: 0 8px 24px rgba(245,158,11,0.18); }
  .sol-stat.active-rejected{ border-color: #ef4444; background: linear-gradient(135deg,#fef2f2,#fee2e2); box-shadow: 0 8px 24px rgba(239,68,68,0.18); }

  .sol-stat-icon {
    width: 42px; height: 42px;
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 14px;
    transition: transform 0.22s;
  }
  .sol-stat:hover .sol-stat-icon { transform: scale(1.08) rotate(-4deg); }

  .sol-stat-count {
    font-family: 'Outfit', sans-serif;
    font-size: 28px;
    font-weight: 800;
    line-height: 1;
    margin-bottom: 4px;
    letter-spacing: -0.5px;
  }
  .sol-stat-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    opacity: 0.6;
  }

  .sol-stat-glow {
    position: absolute;
    bottom: -20px; right: -20px;
    width: 80px; height: 80px;
    border-radius: 50%;
    opacity: 0.08;
    pointer-events: none;
  }

  /* Group cards */
  .sol-card {
    border-radius: 16px;
    border: 1.5px solid rgba(0,0,0,0.07);
    background: #fff;
    overflow: hidden;
    transition: all 0.22s cubic-bezier(0.16,1,0.3,1);
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  }
  .sol-card:hover {
    border-color: rgba(99,102,241,0.25);
    box-shadow: 0 8px 28px rgba(99,102,241,0.1);
    transform: translateY(-2px);
  }

  .sol-card-header {
    padding: 20px 22px;
    cursor: pointer;
    transition: background 0.15s;
    user-select: none;
  }
  .sol-card-header:hover { background: rgba(99,102,241,0.02); }

  .sol-job-icon {
    width: 44px; height: 44px;
    border-radius: 12px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 4px 12px rgba(99,102,241,0.3);
  }

  .sol-job-title {
    font-family: 'Outfit', sans-serif;
    font-size: 15px;
    font-weight: 700;
    color: #0f0e1a;
    letter-spacing: -0.2px;
    line-height: 1.3;
  }

  .sol-pill {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.2px;
  }
  .sol-pill-salary { background: #ecfdf5; color: #059669; font-family: 'JetBrains Mono', monospace; }
  .sol-pill-posts  { background: #f1f5f9; color: #64748b; }
  .sol-pill-date   { background: #fff7ed; color: #c2410c; }

  .sol-meta-item {
    display: flex; align-items: center; gap: 5px;
    font-size: 12px; color: #94a3b8;
  }

  .sol-chevron {
    width: 30px; height: 30px;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    background: #f8fafc;
    color: #94a3b8;
    transition: all 0.22s;
    flex-shrink: 0;
  }
  .sol-chevron.open { background: #eef2ff; color: #6366f1; transform: rotate(180deg); }

  /* Mini count badges in card header */
  .sol-mini-badge {
    width: 20px; height: 20px;
    border-radius: 6px;
    font-size: 10px;
    font-weight: 700;
    display: flex; align-items: center; justify-content: center;
  }

  /* Table */
  .sol-table-wrap {
    border-top: 1.5px solid rgba(0,0,0,0.05);
    overflow-x: auto;
  }

  .sol-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
  }

  .sol-table thead tr {
    background: #fafbff;
  }

  .sol-table th {
    padding: 12px 18px;
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0.7px;
    text-transform: uppercase;
    color: #94a3b8;
    text-align: left;
    white-space: nowrap;
    border-bottom: 1px solid rgba(0,0,0,0.05);
  }
  .sol-table th.center { text-align: center; }
  .sol-table th.right  { text-align: right; }

  .sol-table td {
    padding: 13px 18px;
    vertical-align: middle;
    border-bottom: 1px solid rgba(0,0,0,0.04);
    color: #334155;
  }
  .sol-table tbody tr:last-child td { border-bottom: none; }
  .sol-table tbody tr { transition: background 0.13s; }
  .sol-table tbody tr:hover { background: #fafbff; }

  .sol-inst-name {
    font-weight: 600;
    color: #1e293b;
    font-size: 13px;
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .sol-contact-line {
    display: flex; align-items: center; gap: 6px;
    font-size: 11.5px;
    color: #64748b;
    font-family: 'JetBrains Mono', monospace;
  }
  .sol-contact-dot {
    width: 5px; height: 5px;
    border-radius: 50%;
    background: #cbd5e1;
    flex-shrink: 0;
  }

  /* Status badges */
  .sol-status {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
  }
  .sol-status-accepted  { background: #ecfdf5; color: #059669; }
  .sol-status-pending   { background: #fffbeb; color: #d97706; }
  .sol-status-rejected  { background: #fef2f2; color: #dc2626; }
  .sol-status-withdrawn { background: #f8fafc; color: #64748b; }

  /* Buttons */
  .sol-btn-withdraw {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 6px 13px;
    border-radius: 8px;
    border: 1.5px solid rgba(239,68,68,0.25);
    background: rgba(239,68,68,0.04);
    color: #ef4444;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.18s;
    font-family: 'Outfit', sans-serif;
    white-space: nowrap;
  }
  .sol-btn-withdraw:hover:not(:disabled) {
    background: rgba(239,68,68,0.1);
    border-color: #ef4444;
    transform: translateY(-1px);
  }
  .sol-btn-withdraw:disabled { opacity: 0.5; cursor: not-allowed; }

  /* Eye button */
  .sol-btn-eye {
    display: inline-flex; align-items: center; justify-content: center;
    width: 32px; height: 32px;
    border-radius: 9px;
    border: 1.5px solid rgba(99,102,241,0.2);
    background: rgba(99,102,241,0.05);
    color: #6366f1;
    cursor: pointer;
    transition: all 0.18s;
    flex-shrink: 0;
  }
  .sol-btn-eye:hover {
    background: #6366f1;
    color: #fff;
    border-color: #6366f1;
    box-shadow: 0 4px 12px rgba(99,102,241,0.3);
    transform: scale(1.08);
  }

  /* Empty state */
  .sol-empty {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 64px 32px;
    gap: 16px;
    text-align: center;
    border-radius: 16px;
    border: 2px dashed rgba(99,102,241,0.15);
    background: linear-gradient(135deg, rgba(99,102,241,0.02), rgba(139,92,246,0.02));
  }

  .sol-empty-icon {
    width: 64px; height: 64px;
    border-radius: 20px;
    background: linear-gradient(135deg,#eef2ff,#e0e7ff);
    display: flex; align-items: center; justify-content: center;
  }

  /* Skeleton */
  @keyframes sol-shimmer {
    from { background-position: -400px 0; }
    to   { background-position: 400px 0; }
  }
  .sol-skeleton {
    background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
    background-size: 800px 100%;
    animation: sol-shimmer 1.4s infinite linear;
    border-radius: 12px;
  }

  /* Page header */
  .sol-page-header {
    display: flex; align-items: flex-start; justify-content: space-between;
    margin-bottom: 28px;
    gap: 16px;
    flex-wrap: wrap;
  }
  .sol-page-title {
    font-family: 'Outfit', sans-serif;
    font-size: 26px;
    font-weight: 800;
    color: #0f0e1a;
    letter-spacing: -0.5px;
    display: flex; align-items: center; gap: 10px;
    margin: 0 0 6px;
  }
  .sol-page-title-icon {
    width: 38px; height: 38px;
    border-radius: 12px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 12px rgba(99,102,241,0.3);
  }
  .sol-page-sub {
    font-size: 14px;
    color: #94a3b8;
    margin: 0;
    font-weight: 400;
  }

  /* Filter label */
  .sol-filter-label {
    font-family: 'Outfit', sans-serif;
    font-size: 13px;
    font-weight: 600;
    color: #64748b;
    margin-bottom: 12px;
    display: flex; align-items: center; gap: 6px;
  }

  @media (max-width: 640px) {
    .sol-page-title { font-size: 20px; }
    .sol-stat-count { font-size: 22px; }
    .sol-table th, .sol-table td { padding: 10px 12px; }
  }
`;

/* ─── Types ─────────────────────────────────────────────────────────────────── */
interface OfferRecord {
  offer_id: number;
  job_title: string;
  job_description?: string;
  salary_min?: number;
  salary_max?: number;
  offer_date: string;
  last_date?: string;
  number_of_posts?: number;
  status: "Pending" | "Accepted" | "Rejected" | "Withdrawn";
  institute: {
    institute_id: number;
    institute_name: string;
    emailId?: string;
    mobileno?: string;
  };
  industry: { industry_name: string };
}

interface OfferGroup {
  key: string;
  job_title: string;
  job_description?: string;
  salary_min?: number;
  salary_max?: number;
  offer_date: string;
  last_date?: string;
  number_of_posts?: number;
  rows: OfferRecord[];
  accepted: number;
  rejected: number;
  pending: number;
  withdrawn: number;
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function fmt(n?: number) {
  if (!n) return null;
  return `₹${n >= 100000 ? (n / 100000).toFixed(1) + "L" : (n / 1000).toFixed(0) + "K"}`;
}

function formatDate(d: string) {
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

function salaryStr(min?: number, max?: number) {
  const mn = fmt(min),
    mx = fmt(max);
  if (mn && mx) return `${mn} – ${mx}`;
  if (mn) return `From ${mn}`;
  if (mx) return `Up to ${mx}`;
  return null;
}

function groupOffers(offers: OfferRecord[]): OfferGroup[] {
  const map = new Map<string, OfferGroup>();
  for (const o of offers) {
    const key = `${o.job_title}__${o.offer_date}`;
    if (!map.has(key)) {
      map.set(key, {
        key,
        job_title: o.job_title,
        job_description: o.job_description,
        salary_min: o.salary_min,
        salary_max: o.salary_max,
        offer_date: o.offer_date,
        last_date: o.last_date,
        number_of_posts: o.number_of_posts,
        rows: [],
        accepted: 0,
        rejected: 0,
        pending: 0,
        withdrawn: 0,
      });
    }
    const g = map.get(key)!;
    g.rows.push(o);
    if (o.status === "Accepted") g.accepted++;
    else if (o.status === "Rejected") g.rejected++;
    else if (o.status === "Withdrawn") g.withdrawn++;
    else g.pending++;
  }
  return [...map.values()];
}

/* ─── StatusBadge ────────────────────────────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { cls: string; Icon: any }> = {
    Accepted: { cls: "sol-status-accepted", Icon: CheckCircle2 },
    Pending: { cls: "sol-status-pending", Icon: Clock },
    Rejected: { cls: "sol-status-rejected", Icon: Ban },
    Withdrawn: { cls: "sol-status-withdrawn", Icon: X },
  };
  const { cls, Icon } = cfg[status] ?? cfg["Pending"];
  return (
    <span className={`sol-status ${cls}`}>
      <Icon size={11} />
      {status}
    </span>
  );
}

/* ─── StatCard ───────────────────────────────────────────────────────────── */
function StatCard({
  label,
  count,
  onClick,
  active,
  icon: Icon,
  iconBg,
  countColor,
  activeClass,
}: {
  label: string;
  count: number;
  onClick: () => void;
  active: boolean;
  icon: any;
  iconBg: string;
  countColor: string;
  activeClass: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`sol-stat ${active ? activeClass : ""}`}
    >
      <div className="sol-stat-icon" style={{ background: iconBg }}>
        <Icon size={19} color="#fff" />
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

/* ─── OfferGroupCard ─────────────────────────────────────────────────────── */
function OfferGroupCard({
  group,
  onWithdraw,
  onEyeClick,
}: {
  group: OfferGroup;
  onWithdraw: (id: number) => void;
  onEyeClick: (row: OfferRecord) => void;
}) {
  const [open, setOpen] = useState(true);
  const [withdrawing, setWithdrawing] = useState<number | null>(null);

  const handleWithdraw = async (offerId: number) => {
    setWithdrawing(offerId);
    try {
      await api.patch(`/job-offer/${offerId}/status`, { status: "Withdrawn" });
      onWithdraw(offerId);
    } finally {
      setWithdrawing(null);
    }
  };

  const salary = salaryStr(group.salary_min, group.salary_max);

  return (
    <div className="sol-card sol-fade-up">
      {/* Header */}
      <div className="sol-card-header" onClick={() => setOpen((o) => !o)}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
          {/* Icon */}
          <div className="sol-job-icon">
            <Send size={19} color="#fff" />
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="sol-job-title" style={{ marginBottom: "8px" }}>
              {group.job_title}
            </div>

            {/* Pills */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "6px",
                marginBottom: "10px",
              }}
            >
              {salary && (
                <span className="sol-pill sol-pill-salary">{salary}</span>
              )}
              {group.number_of_posts && (
                <span className="sol-pill sol-pill-posts">
                  {group.number_of_posts} post
                  {group.number_of_posts !== 1 ? "s" : ""}
                </span>
              )}
              {group.last_date && (
                <span className="sol-pill sol-pill-date">
                  <CalendarDays size={10} />
                  Closes {formatDate(group.last_date)}
                </span>
              )}
            </div>

            {/* Meta */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "14px" }}>
              <div className="sol-meta-item">
                <CalendarDays size={12} />
                Sent {formatDate(group.offer_date)}
              </div>
              <div className="sol-meta-item">
                <Building2 size={12} />
                {group.rows.length} institute
                {group.rows.length !== 1 ? "s" : ""}
              </div>
            </div>
          </div>

          {/* Right side: mini badges + chevron */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: "10px",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "4px",
                flexWrap: "wrap",
                justifyContent: "flex-end",
              }}
            >
              {group.accepted > 0 && (
                <span
                  className="sol-mini-badge"
                  style={{ background: "#dcfce7", color: "#16a34a" }}
                >
                  {group.accepted}
                </span>
              )}
              {group.pending > 0 && (
                <span
                  className="sol-mini-badge"
                  style={{ background: "#fef9c3", color: "#ca8a04" }}
                >
                  {group.pending}
                </span>
              )}
              {group.rejected > 0 && (
                <span
                  className="sol-mini-badge"
                  style={{ background: "#fee2e2", color: "#dc2626" }}
                >
                  {group.rejected}
                </span>
              )}
              {group.withdrawn > 0 && (
                <span
                  className="sol-mini-badge"
                  style={{ background: "#f1f5f9", color: "#64748b" }}
                >
                  {group.withdrawn}
                </span>
              )}
            </div>
            <div className={`sol-chevron ${open ? "open" : ""}`}>
              <ChevronDown size={15} />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      {open && (
        <div className="sol-table-wrap">
          <table className="sol-table">
            <thead>
              <tr>
                <th>Institute</th>
                <th>Contact</th>
                <th className="center">Status</th>
                <th className="right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {group.rows.map((row) => (
                <tr key={row.offer_id}>
                  <td>
                    <div className="sol-inst-name">
                      {row.institute?.institute_name ??
                        `Institute #${row.offer_id}`}
                    </div>
                  </td>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "3px",
                      }}
                    >
                      {row.institute?.emailId && (
                        <div className="sol-contact-line">
                          <div className="sol-contact-dot" />
                          <span
                            style={{
                              maxWidth: "150px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {row.institute.emailId}
                          </span>
                        </div>
                      )}
                      {row.institute?.mobileno && (
                        <div className="sol-contact-line">
                          <div className="sol-contact-dot" />
                          {row.institute.mobileno}
                        </div>
                      )}
                      {!row.institute?.emailId && !row.institute?.mobileno && (
                        <span style={{ fontSize: "12px", color: "#cbd5e1" }}>
                          No contact
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <StatusBadge status={row.status} />
                  </td>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        gap: "8px",
                      }}
                    >
                      {/* Eye button — opens modal */}
                      {/* <button
                        className="sol-btn-eye"
                        title="View offer details"
                        onClick={() => onEyeClick(row)}
                      >
                        <Eye size={15} />
                      </button> */}

                      {/* Withdraw */}
                      {row.status === "Pending" && (
                        <button
                          className="sol-btn-withdraw"
                          onClick={() => handleWithdraw(row.offer_id)}
                          disabled={withdrawing === row.offer_id}
                        >
                          {withdrawing === row.offer_id ? (
                            <Loader2
                              size={12}
                              style={{ animation: "spin 1s linear infinite" }}
                            />
                          ) : (
                            <X size={12} />
                          )}
                          Withdraw
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────── */
export default function SentOffersListView() {
  const { isIndustry } = useAuth();
  const [offers, setOffers] = useState<OfferRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<
    "All" | "Accepted" | "Pending" | "Rejected" | "Withdrawn"
  >("All");

  // For the detail modal — pass selectedOffer to your <JobDetailModal>
  const [selectedOffer, setSelectedOffer] = useState<OfferRecord | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchOffers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/job-offer/sent");
      setOffers(res.data ?? []);
    } catch {
      setError("Failed to load sent offers.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  const handleWithdraw = (offerId: number) =>
    setOffers((prev) =>
      prev.map((o) =>
        o.offer_id === offerId ? { ...o, status: "Withdrawn" } : o,
      ),
    );

  const handleEyeClick = (row: OfferRecord) => {
    setSelectedOffer(row);
    setModalOpen(true);
  };

  const total = offers.length;
  const accepted = offers.filter((o) => o.status === "Accepted").length;
  const pending = offers.filter((o) => o.status === "Pending").length;
  const rejected = offers.filter((o) => o.status === "Rejected").length;
  const withdrawn = offers.filter((o) => o.status === "Withdrawn").length;

  const filteredOffers = offers.filter(
    (o) => filter === "All" || o.status === filter,
  );
  const groups = groupOffers(filteredOffers);

  return (
    <>
      <style>{styles}</style>

      {/* ── Place your <JobDetailModal open={modalOpen} setOpen={setModalOpen} job={selectedOffer} /> here ── */}
      {/* Example: <JobDetailModal open={modalOpen} setOpen={setModalOpen} job={selectedOffer} /> */}

      <div
        className="sol-root"
        style={{
          padding: "40px 18px 5px",
          maxWidth: "auto",
          margin: "0 auto",
        }}
      >
        {/* Page Header */}
        <div className="sol-page-header sol-fade-up">
          <div>
            <h1 className="sol-page-title">
              <div className="sol-page-title-icon">
                <MailCheck size={20} color="#fff" />
              </div>
              Sent Offers
            </h1>
            <p className="sol-page-sub">
              Track every offer you've sent and monitor institute responses.
            </p>
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: "14px",
            }}
          >
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="sol-skeleton"
                style={{ height: "130px" }}
              />
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: "#fef2f2",
              border: "1.5px solid #fecaca",
              borderRadius: "12px",
              padding: "16px 20px",
              color: "#dc2626",
              fontWeight: 500,
              fontSize: "14px",
              maxWidth: "400px",
            }}
          >
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {/* Empty (no offers at all) */}
        {!loading && !error && offers.length === 0 && (
          <div className="sol-empty">
            <div className="sol-empty-icon">
              <Send size={28} color="#6366f1" />
            </div>
            <div>
              <div
                style={{
                  fontFamily: "'Outfit',sans-serif",
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "#0f0e1a",
                  marginBottom: "6px",
                }}
              >
                No offers sent yet
              </div>
              <div style={{ fontSize: "13px", color: "#94a3b8" }}>
                Visit{" "}
                <a
                  href="/find-institutes"
                  style={{
                    color: "#6366f1",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  Find Institutes
                </a>{" "}
                to start sending offers.
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {!loading && !error && offers.length > 0 && (
          <>
            {/* Stat Cards */}
            <div
              className="sol-fade-up sol-delay-1"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5,1fr)",
                gap: "14px",
                marginBottom: "28px",
              }}
            >
              <StatCard
                label="Total Sent"
                count={total}
                onClick={() => setFilter("All")}
                active={filter === "All"}
                icon={TrendingUp}
                iconBg="linear-gradient(135deg,#6366f1,#8b5cf6)"
                countColor="#6366f1"
                activeClass="active-all"
              />
              <StatCard
                label="Accepted"
                count={accepted}
                onClick={() => setFilter("Accepted")}
                active={filter === "Accepted"}
                icon={CheckCircle2}
                iconBg="linear-gradient(135deg,#10b981,#34d399)"
                countColor="#10b981"
                activeClass="active-accepted"
              />
              <StatCard
                label="Pending"
                count={pending}
                onClick={() => setFilter("Pending")}
                active={filter === "Pending"}
                icon={Clock}
                iconBg="linear-gradient(135deg,#f59e0b,#fbbf24)"
                countColor="#f59e0b"
                activeClass="active-pending"
              />
              <StatCard
                label="Not Interested"
                count={rejected}
                onClick={() => setFilter("Rejected")}
                active={filter === "Rejected"}
                icon={Ban}
                iconBg="linear-gradient(135deg,#ef4444,#f87171)"
                countColor="#ef4444"
                activeClass="active-rejected"
              />
              <StatCard
                label="Withdraw"
                count={withdrawn}
                onClick={() => setFilter("Withdrawn")}
                active={filter === "Withdrawn"}
                icon={XCircle}
                iconBg="linear-gradient(135deg,#8b5cf6,#a78bfa)"
                countColor="#8b5cf6"
                activeClass="active-withdrawn"
              />
            </div>

            {/* Filter label */}
            {filter !== "All" && (
              <div className="sol-filter-label sol-fade-up sol-delay-2">
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "#6366f1",
                    display: "inline-block",
                  }}
                />
                Showing: {filter} offers
                <button
                  onClick={() => setFilter("All")}
                  style={{
                    marginLeft: "8px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#94a3b8",
                    fontSize: "12px",
                    padding: 0,
                  }}
                >
                  ✕ Clear
                </button>
              </div>
            )}

            {/* Offer Group Cards */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "14px" }}
            >
              {groups.length === 0 ? (
                <div className="sol-empty">
                  <div className="sol-empty-icon">
                    <Send size={26} color="#6366f1" />
                  </div>
                  <div>
                    <div
                      style={{
                        fontFamily: "'Outfit',sans-serif",
                        fontSize: "16px",
                        fontWeight: 700,
                        color: "#0f0e1a",
                        marginBottom: "4px",
                      }}
                    >
                      No {filter.toLowerCase()} offers
                    </div>
                    <div style={{ fontSize: "13px", color: "#94a3b8" }}>
                      Try selecting a different filter above.
                    </div>
                  </div>
                </div>
              ) : (
                groups.map((g, i) => (
                  <div
                    key={g.key}
                    style={{ animationDelay: `${0.1 + i * 0.05}s` }}
                  >
                    <OfferGroupCard
                      group={g}
                      onWithdraw={handleWithdraw}
                      onEyeClick={handleEyeClick}
                    />
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
