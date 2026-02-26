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
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { setCurrentIndustry } from "@/store/industry";

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

  /* Stat Cards - Icon on RIGHT, text on LEFT */
  .sol-stat {
    position: relative;
    overflow: hidden;
    border-radius: 16px;
    padding: 24px 28px;
    border: 1.5px solid rgba(0,0,0,0.06);
    background: #fff;
    cursor: pointer;
    transition: all 0.26s cubic-bezier(0.16,1,0.3,1);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }
  .sol-stat:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.12); }
  .sol-stat.active-all     { border-color: #6366f1; background: linear-gradient(135deg,#eef2ff,#e0e7ff); box-shadow: 0 10px 32px rgba(99,102,241,0.22); }
  .sol-stat.active-accepted{ border-color: #10b981; background: linear-gradient(135deg,#ecfdf5,#d1fae5); box-shadow: 0 10px 32px rgba(16,185,129,0.22); }
  .sol-stat.active-pending { border-color: #f59e0b; background: linear-gradient(135deg,#fffbeb,#fef3c7); box-shadow: 0 10px 32px rgba(245,158,11,0.22); }
  .sol-stat.active-rejected{ border-color: #ef4444; background: linear-gradient(135deg,#fef2f2,#fee2e2); box-shadow: 0 10px 32px rgba(239,68,68,0.22); }
.sol-stat.active-withdrawn {
  border-color: #8b5cf6;
  background: linear-gradient(135deg, #f3e8ff, #e9d5ff);
  box-shadow: 0 10px 32px rgba(139, 92, 246, 0.22);
}
  .sol-stat-content {
    flex: 1;
    text-align: left;
  }

  .sol-stat-count {
    font-family: 'Outfit', sans-serif;
    font-size: 36px;
    font-weight: 800;
    line-height: 1;
    margin-bottom: 4px;
    letter-spacing: -1px;
  }
  .sol-stat-label {
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.9px;
    text-transform: uppercase;
    opacity: 0.75;
  }

  .sol-stat-icon {
    width: 56px;
    height: 56px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: transform 0.26s;
  }
  .sol-stat:hover .sol-stat-icon { transform: scale(1.12) rotate(6deg); }

  .sol-stat-glow {
    position: absolute;
    bottom: -30px;
    right: -30px;
    width: 100px;
    height: 100px;
    border-radius: 50%;
    opacity: 0.1;
    pointer-events: none;
  }

  /* Accordion cards - Made bigger and more spacious */
  .sol-card {
    border-radius: 20px;
    border: 1.5px solid rgba(0,0,0,0.07);
    background: #fff;
    overflow: hidden;
    transition: all 0.26s cubic-bezier(0.16,1,0.3,1);
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  }
  .sol-card:hover {
    border-color: rgba(99,102,241,0.3);
    box-shadow: 0 12px 36px rgba(99,102,241,0.12);
    transform: translateY(-3px);
  }

  .sol-card-header {
    padding: 28px 32px;
    cursor: pointer;
    transition: background 0.2s;
    user-select: none;
  }
  .sol-card-header:hover { background: rgba(99,102,241,0.04); }

  .sol-job-icon {
    width: 56px;
    height: 56px;
    border-radius: 16px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 6px 16px rgba(99,102,241,0.35);
  }

  .sol-job-title {
    font-family: 'Outfit', sans-serif;
    font-size: 18px;
    font-weight: 700;
    color: #0f0e1a;
    letter-spacing: -0.3px;
    line-height: 1.3;
    margin-bottom: 12px;
  }

  .sol-pill {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 5px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.1px;
  }
  .sol-pill-salary { background: #ecfdf5; color: #059669; font-family: 'JetBrains Mono', monospace; }
  .sol-pill-posts  { background: #f1f5f9; color: #64748b; }
  .sol-pill-date   { background: #fff7ed; color: #c2410c; }

  .sol-meta-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: #64748b;
  }

  .sol-chevron {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8fafc;
    color: #94a3b8;
    transition: all 0.24s;
    flex-shrink: 0;
  }
  .sol-chevron.open { background: #eef2ff; color: #6366f1; transform: rotate(180deg); }

  /* Mini badges - bigger */
  .sol-mini-badge {
    width: 24px;
    height: 24px;
    border-radius: 8px;
    font-size: 11px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Table - bigger rows and padding */
  .sol-table-wrap {
    border-top: 1.5px solid rgba(0,0,0,0.05);
    overflow-x: auto;
  }

  .sol-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
  }

  .sol-table thead tr {
    background: #fafbff;
  }

  .sol-table th {
    padding: 16px 24px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    color: #94a3b8;
    text-align: left;
    white-space: nowrap;
    border-bottom: 1px solid rgba(0,0,0,0.05);
  }
  .sol-table th.center { text-align: center; }
  .sol-table th.right  { text-align: right; }

  .sol-table td {
    padding: 18px 24px;
    vertical-align: middle;
    border-bottom: 1px solid rgba(0,0,0,0.04);
    color: #334155;
  }
  .sol-table tbody tr:last-child td { border-bottom: none; }
  .sol-table tbody tr { transition: background 0.14s; }
  .sol-table tbody tr:hover { background: #fafbff; }

  .sol-inst-name {
    font-weight: 600;
    color: #1e293b;
    font-size: 15px;
    max-width: 240px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .sol-contact-line {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 13px;
    color: #64748b;
    font-family: 'JetBrains Mono', monospace;
  }
  .sol-contact-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #cbd5e1;
    flex-shrink: 0;
  }

  /* Status badges - slightly bigger */
  .sol-status {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
  }
  .sol-status-accepted  { background: #ecfdf5; color: #059669; }
  .sol-status-pending   { background: #fffbeb; color: #d97706; }
  .sol-status-rejected  { background: #fef2f2; color: #dc2626; }
  .sol-status-withdrawn { background: #f8fafc; color: #64748b; }

  /* Buttons - sharper */
  .sol-btn-withdraw {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border-radius: 10px;
    border: 1.5px solid rgba(239,68,68,0.3);
    background: rgba(239,68,68,0.06);
    color: #ef4444;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'Outfit', sans-serif;
    white-space: nowrap;
  }
  .sol-btn-withdraw:hover:not(:disabled) {
    background: rgba(239,68,68,0.12);
    border-color: #ef4444;
    transform: translateY(-1px);
  }
  .sol-btn-withdraw:disabled { opacity: 0.5; cursor: not-allowed; }

  .sol-btn-eye {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    border-radius: 10px;
    border: 1.5px solid rgba(99,102,241,0.25);
    background: rgba(99,102,241,0.06);
    color: #6366f1;
    cursor: pointer;
    transition: all 0.2s;
    flex-shrink: 0;
  }
  .sol-btn-eye:hover {
    background: #6366f1;
    color: #fff;
    border-color: #6366f1;
    box-shadow: 0 6px 16px rgba(99,102,241,0.35);
    transform: scale(1.1);
  }

  /* Empty state */
  .sol-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 32px;
    gap: 20px;
    text-align: center;
    border-radius: 20px;
    border: 2px dashed rgba(99,102,241,0.18);
    background: linear-gradient(135deg, rgba(99,102,241,0.03), rgba(139,92,246,0.03));
  }

  .sol-empty-icon {
    width: 80px;
    height: 80px;
    border-radius: 24px;
    background: linear-gradient(135deg,#eef2ff,#e0e7ff);
    display: flex;
    align-items: center;
    justify-content: center;
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
    border-radius: 16px;
  }

  /* Page header */
  .sol-page-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 32px;
    gap: 20px;
    flex-wrap: wrap;
  }
  .sol-page-title {
    font-family: 'Outfit', sans-serif;
    font-size: 28px;
    font-weight: 800;
    color: #0f0e1a;
    letter-spacing: -0.6px;
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 0 0 8px;
  }
  .sol-page-title-icon {
    width: 44px;
    height: 44px;
    border-radius: 14px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 6px 16px rgba(99,102,241,0.35);
  }
  .sol-page-sub {
    font-size: 15px;
    color: #94a3b8;
    margin: 0;
    font-weight: 400;
  }

  /* Filter label */
  .sol-filter-label {
    font-family: 'Outfit', sans-serif;
    font-size: 14px;
    font-weight: 600;
    color: #64748b;
    margin-bottom: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* Pagination Styles */
  .sol-pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin-top: 32px;
    padding: 24px 0;
  }
  .sol-pagination-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: 12px;
    border: 1.5px solid rgba(0,0,0,0.08);
    background: #fff;
    color: #64748b;
    cursor: pointer;
    transition: all 0.2s;
    flex-shrink: 0;
  }
  .sol-pagination-btn:hover:not(:disabled) {
    background: #6366f1;
    color: #fff;
    border-color: #6366f1;
    transform: translateY(-1px);
  }
  .sol-pagination-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
  .sol-pagination-info {
    font-size: 14px;
    color: #64748b;
    font-weight: 500;
    min-width: 100px;
    text-align: center;
  }
  .sol-pagination-numbers {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .sol-page-num {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    border: 2px solid transparent;
  }
  .sol-page-num:hover { background: rgba(99,102,241,0.08); }
  .sol-page-num.active {
    background: #6366f1;
    color: #fff;
    box-shadow: 0 4px 12px rgba(99,102,241,0.3);
  }

  @media (max-width: 640px) {
    .sol-page-title { font-size: 24px; }
    .sol-stat-count { font-size: 28px; }
    .sol-table th, .sol-table td { padding: 12px 16px; }
    .sol-pagination { flex-wrap: wrap; gap: 8px; }
  }
`;

/* ─── Types & Helpers (unchanged) ───────────────────────────────────────── */
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
      <Icon size={13} />
      {status}
    </span>
  );
}

/* ─── StatCard - Icon on RIGHT, text on LEFT ─────────────────────────────── */
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
      <div className="sol-stat-content">
        <div
          className="sol-stat-count"
          style={{ color: active ? countColor : "#0f0e1a" }}
        >
          {count}
        </div>
        <div className="sol-stat-label">{label}</div>
      </div>
      <div className="sol-stat-icon" style={{ background: iconBg }}>
        <Icon size={24} color="#fff" />
      </div>
      <div className="sol-stat-glow" style={{ background: countColor }} />
    </button>
  );
}

/* ─── OfferGroupCard - Bigger & more spacious ────────────────────────────── */
function OfferGroupCard({
  group,
  onWithdraw,
  onEyeClick,
}: {
  group: OfferGroup;
  onWithdraw: (id: number) => void;
  onEyeClick: (row: OfferRecord) => void;
}) {
  const [open, setOpen] = useState<boolean>(false);
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
      {/* Header - bigger padding & font */}
      <div className="sol-card-header" onClick={() => setOpen((o) => !o)}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "20px" }}>
          {/* Icon */}
          <div className="sol-job-icon">
            <Send size={24} color="#fff" />
          </div>

          {/* Info - more space */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="sol-job-title" style={{ marginBottom: "12px" }}>
              {group.job_title}
            </div>

            {/* Pills - bigger */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
                marginBottom: "16px",
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
                  <CalendarDays size={12} />
                  Closes {formatDate(group.last_date)}
                </span>
              )}
            </div>

            {/* Meta - bigger text */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
              <div className="sol-meta-item">
                <CalendarDays size={14} />
                Sent {formatDate(group.offer_date)}
              </div>
              <div className="sol-meta-item">
                <Building2 size={14} />
                {group.rows.length} institute
                {group.rows.length !== 1 ? "s" : ""}
              </div>
            </div>
          </div>

          {/* Right side - bigger chevron & badges */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: "12px",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "6px",
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
              <ChevronDown size={18} />
            </div>
          </div>
        </div>
      </div>

      {/* Table - bigger rows */}
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
                        gap: "6px",
                      }}
                    >
                      {row.institute?.emailId && (
                        <div className="sol-contact-line">
                          <div className="sol-contact-dot" />
                          <span
                            style={{
                              maxWidth: "180px",
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
                        <span style={{ fontSize: "13px", color: "#cbd5e1" }}>
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
                        gap: "12px",
                      }}
                    >
                      {row.status === "Pending" && (
                        <button
                          className="sol-btn-withdraw"
                          onClick={() => handleWithdraw(row.offer_id)}
                          disabled={withdrawing === row.offer_id}
                        >
                          {withdrawing === row.offer_id ? (
                            <Loader2
                              size={14}
                              style={{ animation: "spin 1s linear infinite" }}
                            />
                          ) : (
                            <X size={14} />
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

const getStatus = (status: string) => {
  switch (status) {
    case "Total Sent":
      return "All";
    case "Pending":
      return "Pending";
    case "Accepted":
      return "Accepted";
    case "Withdrawn":
      return "Withdrawn";
    case "Not Interested":
      return "Rejected";

    default:
      return "All";
  }
};

/* ─── Pagination Component ───────────────────────────────────────────────── */
function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const maxVisiblePages = 5;
  const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="sol-pagination">
      <button
        className="sol-pagination-btn"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft size={18} />
      </button>

      <div className="sol-pagination-info">
        Page {currentPage} of {totalPages}
      </div>

      <div className="sol-pagination-numbers">
        {pages.map((pageNum) => (
          <button
            key={pageNum}
            className={`sol-page-num ${currentPage === pageNum ? "active" : ""}`}
            onClick={() => onPageChange(pageNum)}
          >
            {pageNum}
          </button>
        ))}
      </div>

      <button
        className="sol-pagination-btn"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight size={18} />
      </button>
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

  const [searchTerm, setSearchTerm] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const CARDS_PER_PAGE = 5;

  const currentIndustry: any = useSelector(
    (state: RootState) => state?.industries?.currentIndustry,
  );

  const [selectedOffer, setSelectedOffer] = useState<OfferRecord | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (currentIndustry?.label) {
      setFilter(getStatus(currentIndustry?.label));
    }

    return () => {
      setFilter("All");
    };
  }, [currentIndustry]);

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

  // Reset to first page when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchTerm]);

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

  const filteredOffers = offers.filter((o) => {
    const matchesFilter = filter === "All" || o.status === filter;
    const matchesSearch =
      o.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.institute.institute_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const groups = groupOffers(filteredOffers);

  // Pagination logic
  const totalPages = Math.ceil(groups.length / CARDS_PER_PAGE);
  const startIndex = (currentPage - 1) * CARDS_PER_PAGE;
  const endIndex = startIndex + CARDS_PER_PAGE;
  const paginatedGroups = groups.slice(startIndex, endIndex);

  const handleSearch = () => {
    // console.log("Search for:", searchTerm);
  };

  return (
    <>
      <style>{styles}</style>

      <div
        className="sol-root"
        style={{
          padding: "40px 18px 5px",
          maxWidth: "auto",
          margin: "0 auto",
        }}
      >
        {/* Page Header */}
        <div className="sol-page-header sol-fade-up flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="sol-page-title flex items-center gap-2">
              <div className="sol-page-title-icon">
                <MailCheck size={20} color="#fff" />
              </div>
              Sent Offers
            </h1>
            <p className="sol-page-sub">
              Track every offer you've sent and monitor institute responses.
            </p>
          </div>

          {/* Search Field */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search offers..."
              className="input input-bordered w-full pr-10 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              onClick={handleSearch}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 btn btn-primary btn-sm px-3"
            >
              <Search size={16} />
            </button>
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

        {/* Empty */}
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
            {/* Stat Cards - Icon on RIGHT */}
            <div
              className="sol-fade-up sol-delay-1"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "16px",
                marginBottom: "32px",
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

            {/* Offer Group Cards - Paginated */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "18px" }}
            >
              {paginatedGroups.length === 0 ? (
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
                      No {filter.toLowerCase()} offers
                    </div>
                    <div style={{ fontSize: "13px", color: "#94a3b8" }}>
                      Try selecting a different filter above.
                    </div>
                  </div>
                </div>
              ) : (
                paginatedGroups.map((g, i) => (
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

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        )}
      </div>
    </>
  );
}
