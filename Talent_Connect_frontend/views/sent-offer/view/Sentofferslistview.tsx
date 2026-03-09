"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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
  ArrowDownToLine,
} from "lucide-react";
import api from "@/lib/api";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { setCurrentIndustry } from "@/store/industry";
import { useAuth } from "@/lib/AuthProvider";
import dynamic from "next/dynamic";
import Pagination from "@/components/common/Pagination";
import clsx from "clsx";
import "leaflet/dist/leaflet.css";
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
  .sol-stat.active-discussed { border-color: #f59e0b; background: linear-gradient(135deg,#fffbeb,#fef3c7); box-shadow: 0 10px 32px rgba(245,158,11,0.22); }
  .sol-stat.active-accepted{ border-color: #10b981; background: linear-gradient(135deg,#ecfdf5,#d1fae5); box-shadow: 0 10px 32px rgba(16,185,129,0.22); }
  .sol-stat.active-rejected{ border-color: #ef4444; background: linear-gradient(135deg,#fef2f2,#fee2e2); box-shadow: 0 10px 32px rgba(239,68,68,0.22); }
  .sol-stat.active-project  { border-color: #8b5cf6; background: linear-gradient(135deg,#f3e8ff,#e9d5ff); box-shadow: 0 10px 32px rgba(139,92,246,0.22); }
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
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 700;
  }

  /* View Details Button */
  .sol-btn-eye {
    background: #f8fafc;
    padding: 8px 10px;
    border-radius: 8px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 600;
    border: 1px solid #e2e8f0;
    color: #475569;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
    white-space: nowrap;
    cursor: pointer;
  }
  .sol-btn-text {
    display: inline-block;
    max-width: 0;
    opacity: 0;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    transform: translateX(-5px);
    overflow: hidden;
  }
  .sol-btn-eye:hover {
    padding: 8px 14px;
    background: #eef2ff;
    color: #4f46e5;
    border-color: #c7d2fe;
    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.15);
  }
  .sol-btn-eye:hover .sol-btn-text {
    max-width: 100px;
    opacity: 1;
    transform: translateX(0);
    margin-left: 6px;
  }
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
  .sol-status-sent      { background: #eff6ff; color: #2563eb; }
  .sol-status-discussed { background: #fffbeb; color: #d97706; }
  .sol-status-accepted  { background: #ecfdf5; color: #059669; }
  .sol-status-pending   { background: #eff6ff; color: #2563eb; }
  .sol-status-rejected  { background: #fef2f2; color: #dc2626; }
  .sol-status-project   { background: #f3e8ff; color: #7c3aed; }
  .sol-status-completed { background: #f0fdf4; color: #15803d; }
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
  batch_id?: string;
  eoi_type?: string;
  job_title?: string;
  job_description?: string;
  salary_min?: number;
  salary_max?: number;
  offer_date: string;
  last_date?: string;
  number_of_posts?: number;
  nature_of_engagement?: string;
  collaboration_types?: string;
  additional_details?: string;
  status:
  | "Sent"
  | "Discussed"
  | "Accepted"
  | "Rejected"
  | "Project initiated"
  | "Project completed"
  | "Withdrawn"
  | "Pending";
  institute: {
    institute_id: number;
    institute_name: string;
    emailId?: string;
    mobileno?: string;
    district?: { districtname?: string };
  };
  industry: { industry_name: string };
}

interface OfferGroup {
  key: string;
  eoi_type: string;
  job_title?: string;
  salary_min?: number;
  salary_max?: number;
  offer_date: string;
  last_date?: string;
  number_of_posts?: number;
  collaboration_types?: string;
  rows: OfferRecord[];
  sent: number;
  discussed: number;
  accepted: number;
  rejected: number;
  projectInitiated: number;
  projectCompleted: number;
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
    // Group by exact bulk-send batch ID, fallback to offer_id for older entries
    const key = o.batch_id || o.offer_id.toString();
    if (!map.has(key)) {
      map.set(key, {
        key,
        eoi_type: o.eoi_type ?? "EOI",
        job_title: o.job_title,
        salary_min: o.salary_min,
        salary_max: o.salary_max,
        offer_date: o.offer_date,
        last_date: o.last_date,
        number_of_posts: o.number_of_posts,
        collaboration_types: o.collaboration_types,
        rows: [],
        sent: 0,
        discussed: 0,
        accepted: 0,
        rejected: 0,
        projectInitiated: 0,
        projectCompleted: 0,
        withdrawn: 0,
      });
    }
    const g = map.get(key)!;
    g.rows.push(o);
    const s = o.status;
    if (s === "Sent" || s === "Pending") g.sent++;
    else if (s === "Discussed") g.discussed++;
    else if (s === "Accepted") g.accepted++;
    else if (s === "Rejected") g.rejected++;
    else if (s === "Project initiated") g.projectInitiated++;
    else if (s === "Project completed") g.projectCompleted++;
    else if (s === "Withdrawn") g.withdrawn++;
  }
  return [...map.values()];
}

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { cls: string; Icon: any }> = {
    Sent: { cls: "sol-status-sent", Icon: Send },
    Pending: { cls: "sol-status-sent", Icon: Clock },
    Discussed: { cls: "sol-status-discussed", Icon: AlertCircle },
    Accepted: { cls: "sol-status-accepted", Icon: CheckCircle2 },
    Rejected: { cls: "sol-status-rejected", Icon: Ban },
    "Project initiated": { cls: "sol-status-project", Icon: TrendingUp },
    "Project completed": { cls: "sol-status-completed", Icon: MailCheck },
    Withdrawn: { cls: "sol-status-withdrawn", Icon: X },
  };
  const { cls, Icon } = cfg[status] ?? cfg["Sent"];
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
}: {
  label: string;
  count: number;
  onClick: () => void;
  active: boolean;
  icon: any;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "flex flex-col items-center justify-center p-6 rounded-lg border text-center",
        "card-custom",
        "transition-all duration-200 ease-in-out",
        "hover:shadow-md",
        "focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2",
        active && "border-primary bg-primary/10 text-primary font-semibold",
      )}
    >
      <Icon
        size={32}
        className={clsx(
          "mb-3 opacity-90 transition-colors",
          active ? "text-primary" : "text-base-content/70",
        )}
      />
      <div
        className={clsx(
          "text-2xl font-bold mb-1",
          active ? "text-primary" : "text-base-content",
        )}
      >
        {count.toLocaleString()}
      </div>
      <div className="text-xs font-medium uppercase tracking-wider text-base-content/60">
        {label}
      </div>
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
  onEyeClick: (group: OfferGroup) => void;
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
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm transition-all hover:shadow-md">
      {/* Header */}
      <div
        className="flex p-5 cursor-pointer"
        onClick={() => setOpen((o) => !o)}
      >
        {/* Left: Icon */}
        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-primary rounded-md text-white">
          <Send size={24} />
        </div>

        {/* Middle: Info */}
        <div className="flex-1 ml-4 min-w-0">
          {/* EOI Type Badge */}
          {group.eoi_type && (
            <span
              className={clsx(
                "inline-block text-xs font-semibold rounded-md px-3 py-1 mb-1",
                group.eoi_type === "Placement"
                  ? "bg-blue-100 text-blue-700"
                  : group.eoi_type === "Industrial Training"
                    ? "bg-gray-100 text-gray-800"
                    : "bg-purple-100 text-purple-700",
              )}
            >
              {group.eoi_type === "Placement"
                ? "🎓 Hire Students"
                : group.eoi_type === "Industrial Training"
                  ? "🏭 Industrial Training"
                  : "🤝 Collaboration"}
            </span>
          )}

          {/* Job Title */}
          <div className="text-lg font-semibold text-gray-800 truncate">
            {group.job_title || "—"}
          </div>

          {/* Pills */}
          <div className="flex flex-wrap gap-2 mt-2">
            {group.eoi_type === "Collaboration" ? (
              group.collaboration_types?.split("|").map((type, i) => (
                <span
                  key={i}
                  className="text-xs font-medium px-2 py-1 rounded-md bg-purple-100 text-primary"
                >
                  {type}
                </span>
              ))
            ) : (
              <>
                {salary && (
                  <span className="text-xs font-medium px-2 py-1 rounded-md bg-gray-100 text-gray-800">
                    {salary}
                  </span>
                )}
                {group.number_of_posts && (
                  <span className="text-xs font-medium px-2 py-1 rounded-md bg-gray-100 text-gray-800">
                    {group.number_of_posts} post
                    {group.number_of_posts !== 1 ? "s" : ""}
                  </span>
                )}
              </>
            )}
            {group.last_date && (
              <span className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md bg-yellow-100 text-yellow-800">
                <CalendarDays size={12} /> Closes {formatDate(group.last_date)}
              </span>
            )}
          </div>

          {/* Meta */}
          <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <CalendarDays size={14} /> Sent {formatDate(group.offer_date)}
            </div>
            <div className="flex items-center gap-1">
              <Building2 size={14} /> {group.rows.length} institute
              {group.rows.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>

        {/* Right: Badges + Actions */}
        <div className="flex flex-col items-end gap-3 flex-shrink-0 ml-4">
          <div className="flex flex-wrap gap-1">
            {group.sent > 0 && (
              <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
                {group.sent}
              </span>
            )}
            {group.discussed > 0 && (
              <span className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-800">
                {group.discussed}
              </span>
            )}
            {group.accepted > 0 && (
              <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800">
                {group.accepted}
              </span>
            )}
            {group.rejected > 0 && (
              <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-700">
                {group.rejected}
              </span>
            )}
            {group.projectInitiated > 0 && (
              <span className="px-2 py-1 text-xs rounded bg-purple-100 text-purple-700">
                {group.projectInitiated}
              </span>
            )}
            {group.projectCompleted > 0 && (
              <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700">
                {group.projectCompleted}
              </span>
            )}
            {group.withdrawn > 0 && (
              <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-600">
                {group.withdrawn}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 mt-1">
            <button
              className="flex items-center gap-1 text-sm text-blue-600 hover:bg-blue-50 px-2 py-1 rounded"
              onClick={(e) => {
                e.stopPropagation();
                onEyeClick(group);
              }}
              title="View EOI Details"
            >
              <Eye size={16} /> View Details
            </button>
            <ChevronDown
              size={18}
              className={clsx("transition-transform", open && "rotate-180")}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      {open && (
        <div className="overflow-x-auto border-t border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Institute
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  District
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Contact
                </th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {group.rows.map((row) => (
                <tr key={row.offer_id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-700 truncate">
                    {row.institute?.institute_name ??
                      `Institute #${row.offer_id}`}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {row.institute?.district?.districtname || "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <div className="flex flex-col gap-1">
                      {row.institute?.emailId && (
                        <span className="truncate">
                          {row.institute.emailId}
                        </span>
                      )}
                      {row.institute?.mobileno && (
                        <span>{row.institute.mobileno}</span>
                      )}
                      {!row.institute?.emailId && !row.institute?.mobileno && (
                        <span className="text-gray-400">No contact</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                      title="View Institute Details"
                      onClick={(e) => {
                        e.stopPropagation();
                        const customEvent = new CustomEvent(
                          "openInstituteModal",
                          {
                            detail: row.institute,
                          },
                        );
                        window.dispatchEvent(customEvent);
                      }}
                    >
                      <Eye size={16} /> View
                    </button>
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
// (redundant local Pagination removed)

/* ─── Main Component ─────────────────────────────────────────────────────── */
export default function SentOffersListView() {
  const { user } = useAuth();
  const [offers, setOffers] = useState<OfferRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<string>("All");
  const [eoiTypeFilter, setEoiTypeFilter] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const currentIndustry: any = useSelector(
    (state: RootState) => state?.industries?.currentIndustry,
  );
  const [selectedOffer, setSelectedOffer] = useState<OfferGroup | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedInstituteForModal, setSelectedInstituteForModal] =
    useState<any>(null);

  useEffect(() => {
    const handleOpenModal = (e: any) => setSelectedInstituteForModal(e.detail);
    window.addEventListener("openInstituteModal", handleOpenModal);
    return () =>
      window.removeEventListener("openInstituteModal", handleOpenModal);
  }, []);

  useEffect(() => {
    return () => {
      setFilter("All");
    };
  }, [currentIndustry]);

  const fetchOffers = useCallback(
    async (page = currentPage, currentLimit = limit) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("page", page.toString());
        params.set("limit", currentLimit.toString());
        if (searchTerm) params.set("search", searchTerm);
        // Backend doesn't support full filtering yet, so we'll still do some client-side,
        // but we need to handle the new response format.
        const res = await api.get(`/job-offer/sent?${params}`);

        let data = Array.isArray(res.data) ? res.data : res.data?.data || [];
        if (!Array.isArray(data)) data = [];

        setOffers(data);
        setTotalRecords(res.data?.total || data.length);
      } catch {
        setError("Failed to load sent offers.");
      } finally {
        setLoading(false);
      }
    },
    [searchTerm, currentPage, limit],
  );

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

  const handleEyeClick = (group: OfferGroup) => {
    setSelectedOffer(group);
    setModalOpen(true);
  };

  const now = useMemo(() => Date.now(), []);
  const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

  // 1. Filter by EOI Type first
  const baseOffers = offers.filter((o) => {
    return (
      eoiTypeFilter === "All" ||
      (eoiTypeFilter === "Placement" && o.eoi_type === "Placement") ||
      (eoiTypeFilter === "Training" && o.eoi_type === "Industrial Training") ||
      (eoiTypeFilter === "Collaboration" && o.eoi_type === "Collaboration")
    );
  });

  const total = baseOffers.length;
  const discussed = baseOffers.filter((o) => o.status === "Discussed").length;
  const accepted = baseOffers.filter((o) => o.status === "Accepted").length;
  const pendingDiscuss = baseOffers.filter((o) => {
    if (o.status !== "Sent" && o.status !== "Pending") return false;
    const sentAgo = now - new Date(o.offer_date).getTime();
    return sentAgo > TWO_DAYS_MS;
  }).length;
  const pendingAccept = baseOffers.filter((o) => {
    // Offered back in 'Discussed' state for > 7 days
    return o.status === "Discussed";
  }).length;

  const filteredOffers = baseOffers.filter((o) => {
    const s = o.status;
    const matchesFilter =
      filter === "All" ||
      (filter === "Discussed" && s === "Discussed") ||
      (filter === "Accepted" && s === "Accepted") ||
      (filter === "PendingDiscuss" &&
        (s === "Sent" || s === "Pending") &&
        now - new Date(o.offer_date).getTime() > TWO_DAYS_MS) ||
      (filter === "PendingAccept" && s === "Discussed") ||
      s === filter;
    const instName = o.institute?.institute_name ?? "";
    const matchesSearch =
      (o.job_title ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      instName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.eoi_type ?? "").toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const groups = useMemo(() => groupOffers(filteredOffers), [filteredOffers]);

  const onPageChange = (p: number) => {
    setCurrentPage(p);
    fetchOffers(p, limit);
  };

  const onLimitChange = (l: number) => {
    setLimit(l);
    setCurrentPage(1);
    fetchOffers(1, l);
  };

  const handleSearch = () => {
    // console.log("Search for:", searchTerm);
  };

  return (
    <>
      <style>{styles}</style>

      <div
        className="sol-root"
        style={{
          maxWidth: "auto",
          margin: "0 auto",
        }}
      >
        {/* Page Header */}
        <div className="sol-page-header sol-fade-up flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Title & Subtitle */}
          <div>
            <h1 className="sol-page-title flex items-center gap-2 text-gray-900 font-semibold text-xl">
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-primary rounded-md text-white">
                <MailCheck size={20} />
              </div>
              Sent EOI
            </h1>
            <p className="sol-page-sub text-gray-600 mt-1 text-sm">
              Track every Expression of Interest you've sent to institutes.
            </p>
          </div>

          {/* Filter & Search */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mt-3 sm:mt-0">
            {/* EOI Type Dropdown */}
            <select
              className="select select-bordered select-sm w-full sm:w-auto font-medium"
              value={eoiTypeFilter}
              onChange={(e) => setEoiTypeFilter(e.target.value)}
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              <option value="All">All EOI Types</option>
              <option value="Placement">🎓 Hiring</option>
              <option value="Training">🏭 Training</option>
              <option value="Collaboration">🤝 Collaboration</option>
            </select>

            {/* Search Input */}
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
                className="absolute right-1 top-1/2 transform -translate-y-1/2 btn btn-primary btn-sm flex items-center justify-center px-3"
              >
                <Search size={16} />
              </button>
            </div>
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
            {/* Stat Cards - Clean & Professional */}
            <div className="sol-fade-up sol-delay-1 grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
              {/* Total Sent - Active/Filterable */}
              <button
                onClick={() => setFilter("All")}
                className={clsx(
                  "group relative",
                  "bg-white border rounded-xl shadow-sm",
                  "p-7 transition-all duration-200 ease-out",
                  "hover:shadow-md hover:-translate-y-0.5 hover:border-indigo-200/70",
                  filter === "All"
                    ? "border-indigo-300/60 bg-indigo-50/30 shadow-indigo-100/40"
                    : "border-gray-200/80",
                )}
              >
                <div className="flex items-center gap-5">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div
                      className={clsx(
                        "w-14 h-14 rounded-xl flex items-center justify-center",
                        filter === "All"
                          ? "bg-indigo-100 text-indigo-600"
                          : "bg-gray-100 text-gray-500",
                      )}
                    >
                      <TrendingUp size={28} strokeWidth={2} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                      Total EOI Sent
                    </div>
                    <div className="mt-1.5 text-3xl font-bold text-gray-900 tracking-tight">
                      {total.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Active indicator */}
                {filter === "All" && (
                  <div className="absolute top-5 right-5">
                    <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100/80 text-indigo-700 border border-indigo-200/60">
                      Viewing
                    </span>
                  </div>
                )}

                {/* Hover arrow */}
                <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <ChevronRight size={20} className="text-indigo-400" />
                </div>
              </button>

              {/* Received Responses - Disabled/Coming Soon */}
              <div
                className={clsx(
                  "relative",
                  "bg-white border border-gray-200/70 rounded-xl shadow-sm",
                  "p-7 opacity-80 cursor-not-allowed",
                  "flex items-center gap-5",
                )}
              >
                <div className="flex items-center gap-5 flex-1">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                      <ArrowDownToLine size={28} strokeWidth={2} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                      Received Responses
                    </div>
                    <div className="mt-1.5 text-3xl font-bold text-gray-400 tracking-tight">
                      {discussed.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Coming Soon badge - subtle & professional */}
                <div className="absolute top-5 right-5">
                  <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
                    Coming Soon
                  </span>
                </div>
              </div>
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
              {groups.length === 0 ? (
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
                <div className="flex flex-col gap-6">
                  {groups.map((g, i) => (
                    <div
                      key={g.key}
                      style={{ animationDelay: `${0.1 + i * 0.05}s` }}
                    >
                      <OfferGroupCard
                        group={g}
                        onWithdraw={handleWithdraw}
                        onEyeClick={(g) => {
                          setSelectedOffer(g);
                          setModalOpen(true);
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Global Pagination */}
            <div className="mt-12">
              <Pagination
                total={totalRecords}
                page={currentPage}
                limit={limit}
                onPageChange={onPageChange}
                onLimitChange={onLimitChange}
              />
            </div>
          </>
        )}
      </div>

      {/* View Details Modal for Sent EOI Header */}
      {modalOpen && selectedOffer && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6 opacity-100 transition-opacity">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur z-10 p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl font-bold text-gray-900 leading-none">
                    EOI Details
                  </h2>
                  <span
                    style={{
                      fontSize: "12px",
                      background: "#eef2ff",
                      color: "#6366f1",
                      borderRadius: "6px",
                      padding: "3px 10px",
                      fontWeight: 700,
                    }}
                  >
                    {selectedOffer.eoi_type === "Placement"
                      ? "🎓 Hire Students"
                      : selectedOffer.eoi_type === "Industrial Training"
                        ? "🏭 Industrial Training"
                        : "🤝 Collaboration"}
                  </span>
                </div>
                <div className="text-sm text-gray-500 font-medium">
                  To: {selectedOffer.rows.length} Institute(s) targeted
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6 overflow-y-auto">
              {/* Top Row Grid */}
              <div className="grid grid-cols-2 gap-4">
                {selectedOffer.job_title && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">
                      Role/Title
                    </div>
                    <div className="font-semibold text-gray-900">
                      {selectedOffer.job_title}
                    </div>
                  </div>
                )}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">
                    Total Sent
                  </div>
                  <div className="font-semibold text-gray-900">
                    {selectedOffer.rows.length}
                  </div>
                </div>
              </div>

              {/* General Details Grid */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 font-semibold text-gray-700 text-sm">
                  Requirements & Details
                </div>
                <div className="divide-y divide-gray-100">
                  {selectedOffer.rows[0]?.nature_of_engagement && (
                    <div className="flex items-center p-3 text-sm">
                      <div className="w-1/3 text-gray-500 font-medium tracking-wide text-xs uppercase">
                        Nature of Engagement
                      </div>
                      <div className="w-2/3 text-gray-900 font-medium">
                        {selectedOffer.rows[0].nature_of_engagement}
                      </div>
                    </div>
                  )}
                  {selectedOffer.number_of_posts && (
                    <div className="flex items-center p-3 text-sm">
                      <div className="w-1/3 text-gray-500 font-medium tracking-wide text-xs uppercase">
                        No. of Openings
                      </div>
                      <div className="w-2/3 text-gray-900 font-medium">
                        {selectedOffer.number_of_posts}
                      </div>
                    </div>
                  )}
                  {(selectedOffer.salary_min || selectedOffer.salary_max) && (
                    <div className="flex items-center p-3 text-sm">
                      <div className="w-1/3 text-gray-500 font-medium tracking-wide text-xs uppercase">
                        Compensation
                      </div>
                      <div className="w-2/3 text-gray-900 font-medium">
                        {salaryStr(
                          selectedOffer.salary_min,
                          selectedOffer.salary_max,
                        )}
                      </div>
                    </div>
                  )}
                  {selectedOffer.offer_date && (
                    <div className="flex items-center p-3 text-sm">
                      <div className="w-1/3 text-gray-500 font-medium tracking-wide text-xs uppercase">
                        Sent Date
                      </div>
                      <div className="w-2/3 text-gray-900 font-medium">
                        {formatDate(selectedOffer.offer_date)}
                      </div>
                    </div>
                  )}
                  {selectedOffer.last_date && (
                    <div className="flex items-center p-3 text-sm">
                      <div className="w-1/3 text-gray-500 font-medium tracking-wide text-xs uppercase">
                        Closing Date
                      </div>
                      <div className="w-2/3 text-gray-900 font-medium">
                        {formatDate(selectedOffer.last_date)}
                      </div>
                    </div>
                  )}
                  {selectedOffer.collaboration_types && (
                    <div className="flex items-start p-3 text-sm">
                      <div className="w-1/3 text-gray-500 font-medium tracking-wide text-xs uppercase pt-1">
                        Collaboration Types
                      </div>
                      <div className="w-2/3 text-gray-900 font-medium flex flex-wrap gap-2">
                        {selectedOffer.collaboration_types
                          .split("|")
                          .map((t, i) => (
                            <span
                              key={i}
                              className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold"
                            >
                              {t}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Details */}
              {(selectedOffer.rows[0]?.job_description ||
                selectedOffer.rows[0]?.additional_details) && (
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 font-semibold text-gray-700 text-sm">
                      Additional Information
                    </div>
                    <div className="p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {selectedOffer.rows[0]?.job_description ||
                        selectedOffer.rows[0]?.additional_details}
                    </div>
                  </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end rounded-b-2xl">
              <button
                onClick={() => setModalOpen(false)}
                className="px-6 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Institute Details Modal */}
      {selectedInstituteForModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4 sm:p-6 opacity-100 transition-opacity">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur z-10 p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 leading-none mb-2">
                  {selectedInstituteForModal.institute_name ||
                    "Institute Details"}
                </h2>
                <div className="text-sm text-gray-500 font-medium">
                  {selectedInstituteForModal.district?.districtname ||
                    "Unknown District"}
                </div>
              </div>
              <button
                onClick={() => setSelectedInstituteForModal(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
              >
                <X size={20} />
              </button>
            </div>
            {/* Body */}
            <div className="p-6 overflow-y-auto">
              <div className="space-y-4">
                <div className="flex border-b border-gray-100 pb-3">
                  <div className="w-1/3 text-gray-500 text-sm font-semibold uppercase tracking-wider text-xs">
                    Email
                  </div>
                  <div className="w-2/3 text-sm font-medium text-gray-900">
                    {selectedInstituteForModal.emailId || "N/A"}
                  </div>
                </div>
                <div className="flex border-b border-gray-100 pb-3">
                  <div className="w-1/3 text-gray-500 text-sm font-semibold uppercase tracking-wider text-xs">
                    Phone
                  </div>
                  <div className="w-2/3 text-sm font-medium text-gray-900">
                    {selectedInstituteForModal.mobileno ||
                      selectedInstituteForModal.phone ||
                      "N/A"}
                  </div>
                </div>
                <div className="flex border-b border-gray-100 pb-3">
                  <div className="w-1/3 text-gray-500 text-sm font-semibold uppercase tracking-wider text-xs">
                    Address
                  </div>
                  <div className="w-2/3 text-sm font-medium text-gray-900 whitespace-pre-wrap">
                    {selectedInstituteForModal.address || "N/A"}
                  </div>
                </div>
                <div className="flex border-b border-gray-100 pb-3">
                  <div className="w-1/3 text-gray-500 text-sm font-semibold uppercase tracking-wider text-xs">
                    Contact Person
                  </div>
                  <div className="w-2/3 text-sm font-medium text-gray-900">
                    {selectedInstituteForModal.contactperson || "N/A"}
                  </div>
                </div>
                <div className="flex pb-3">
                  <div className="w-1/3 text-gray-500 text-sm font-semibold uppercase tracking-wider text-xs">
                    Designation
                  </div>
                  <div className="w-2/3 text-sm font-medium text-gray-900">
                    {selectedInstituteForModal.designation || "N/A"}
                  </div>
                </div>
              </div>
            </div>
            {/* Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button
                onClick={() => setSelectedInstituteForModal(null)}
                className="px-6 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
