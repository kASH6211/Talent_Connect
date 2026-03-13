"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Loader2,
  X,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Building2,
  Briefcase,
  Eye,
  Send,
  TrendingUp,
  IndianRupee,
  CalendarDays,
  Users,
  Building,
  ChevronDown,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/lib/AuthProvider";
import clsx from "clsx";
import * as XLSX from "xlsx";

// ─── Types ───────────────────────────────────────────────────────────────────
interface OfferRow {
  offer_id: number;
  job_title: string;
  job_description?: string;
  industry_id?: number;
  batch_id?: string;
  salary_min?: number;
  salary_max?: number;
  nature_of_engagement?: string;
  experience_required?: string;
  location?: string;
  is_remote?: boolean;
  offer_date?: string;
  start_date?: string;
  last_date?: string;
  duration?: string;
  collaboration_types?: string;
  additional_details?: string;
  updated_date?: string;
  discussed_date?: string;
  status: string;
  eoi_type: string;
  number_of_posts?: number;
  required_qualification_ids?: string;
  institute?: {
    institute_name: string;
    district?: { districtname: string };
    lgddistrictId?: number;
    institute_type_id?: number;
    institute_sub_type_id?: number;
    address?: string;
    districtname?: string;
  };
  industry?: { industry_name: string };
}

const ITEMS_PER_PAGE = 10;

// ─── Helpers ─────────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const s = (status ?? "").toLowerCase();
  const getColors = () => {
    switch (s) {
      case "accepted":
      case "approved":
        return "bg-success/10 text-success border-success/20";
      case "rejected":
      case "cancelled":
        return "bg-error/10 text-error border-error/20";
      case "pending":
      case "submitted":
      case "under review":
      case "draft":
      case "sent":
        return "bg-warning/10 text-warning border-warning/20";
      case "withdrawn":
        return "bg-base-300 text-base-content/60 border-base-400";
      case "initiated":
      case "project initiated":
        return "bg-primary/10 text-primary border-primary/20";
      case "completed":
      case "project completed":
      case "discussed":
        return "bg-info/10 text-info border-info/20";
      default:
        return "bg-base-200 text-base-content/70 border-base-300";
    }
  };

  const getIcon = () => {
    if (["accepted", "approved", "completed", "project completed"].includes(s))
      return <CheckCircle2 size={13} />;
    if (["rejected", "cancelled", "withdrawn"].includes(s))
      return <XCircle size={13} />;
    if (["pending", "submitted", "under review", "draft"].includes(s))
      return <Clock size={13} />;
    return null;
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap border capitalize",
        getColors()
      )}
    >
      {getIcon()}
      {status}
    </span>
  );
}

function fmt(date?: string) {
  if (!date) return "—";
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return date; // fallback to raw string if invalid
    return d.toLocaleDateString("en-IN", {
      timeZone: "UTC",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch (e) {
    return date;
  }
}

function salary(min?: number, max?: number) {
  if (!min && !max) return "—";
  const f = (n: number) =>
    n >= 100000 ? `${(n / 100000).toFixed(1)}L` : `${(n / 1000).toFixed(0)}K`;
  if (min && max) return `${f(min)} – ${f(max)}`;
  return min ? f(min) : f(max!);
}

function getDistrictName(row: any): string {
  const d = row?.institute?.district || row?.district;
  if (!d) return "—";
  if (typeof d === "object") return d.districtname || d.district_name || "—";
  return String(d);
}

// ─── Generic Pagination hook ─────────────────────────────────────────────────
function usePagination<T>(items: T[], perPage = ITEMS_PER_PAGE) {
  const [page, setPage] = useState(1);
  useEffect(() => setPage(1), [items.length]);
  const totalPages = Math.max(1, Math.ceil(items.length / perPage));
  const slice = items.slice((page - 1) * perPage, page * perPage);
  return { page, setPage, totalPages, slice, total: items.length };
}

// ─── Pagination Controls ──────────────────────────────────────────────────────
function PaginationBar({
  page,
  totalPages,
  total,
  onPage,
  label,
}: {
  page: number;
  totalPages: number;
  total: number;
  onPage: (p: number) => void;
  label: string;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between bg-base-100 dark:bg-base-900 border border-base-300 dark:border-base-700 rounded-xl px-4 py-3 shadow-sm">
      <button
        onClick={() => onPage(page - 1)}
        disabled={page === 1}
        className="btn btn-outline btn-sm gap-1.5 text-xs disabled:opacity-40"
      >
        <ChevronLeft size={14} /> Previous
      </button>
      <span className="text-xs text-base-content/60 font-medium">
        Page {page} of {totalPages} &bull; {total} {label}
      </span>
      <button
        onClick={() => onPage(page + 1)}
        disabled={page === totalPages}
        className="btn btn-outline btn-sm gap-1.5 text-xs disabled:opacity-40"
      >
        Next <ChevronRight size={14} />
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AllRequestsPage() {
  const { role, user } = useAuth();

  // ── Data state ──
  const [offers, setOffers] = useState<OfferRow[]>([]);
  const [loadingOff, setLoadingOff] = useState(false);
  const [errorOff, setErrorOff] = useState("");

  // ── Tab & Filter ──
  const [selectedEoiType, setSelectedEoiType] = useState<string>("All");

  // ── Filters ──
  const [offSearch, setOffSearch] = useState("");
  // start with no active tile; empty string treated as "all"
  const [offStatus, setOffStatus] = useState("");
  const [offDateStart, setOffDateStart] = useState("");
  const [offDateEnd, setOffDateEnd] = useState("");
  const [lastDateStart, setLastDateStart] = useState("");
  const [lastDateEnd, setLastDateEnd] = useState("");
  const [selectedDistrictId, setSelectedDistrictId] = useState("");
  const [selectedInstTypeId, setSelectedInstTypeId] = useState("");
  const [districts, setDistricts] = useState<any[]>([]);
  const [instTypes, setInstTypes] = useState<any[]>([]);

  // ── View modal ──
  const [viewOffer, setViewOffer] = useState<OfferRow | null>(null);

  const searchParams = useSearchParams();

  useEffect(() => {
    let statusParam = searchParams.get("status");
    if (statusParam) {
      const low = statusParam.toLowerCase();
      if (low === "all") {
        statusParam = ""; // map explicit "all" to empty
      }
      if (low === "project completed") statusParam = "Completed";
      if (low === "project initiated") statusParam = "Initiated";
      setOffStatus(statusParam);
    }
  }, [searchParams]);

  // ── Fetch ──
  const fetchOffers = useCallback(async () => {
    setLoadingOff(true);
    setErrorOff("");
    try {
      const res = await api.get("/job-offer");
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setOffers(data);
    } catch (e: any) {
      setErrorOff(e?.response?.data?.message || "Failed to load offers");
    } finally {
      setLoadingOff(false);
    }
  }, []);

  useEffect(() => {
    fetchOffers();
    if (role === "dept_admin") {
      api.get("/district")
        .then((res) => setDistricts(Array.isArray(res.data) ? res.data : res.data?.data || []))
        .catch(console.error);
      api.get("/institute-sub-type")
        .then((res) => setInstTypes(Array.isArray(res.data) ? res.data : res.data?.data || []))
        .catch(console.error);
    }
  }, [fetchOffers, role]);

  const filteredOffers = offers.filter((o) => {
    const name = o.institute?.institute_name ?? "";
    const districtName = getDistrictName(o);
    const title = o.job_title ?? "";
    const industryName = o.industry?.industry_name ?? "";
    const status = o.status ?? "";
    const eoiType = o.eoi_type ?? "Placement";

    const searchLow = offSearch.toLowerCase();
    const matchSearch =
      !offSearch ||
      name.toLowerCase().includes(searchLow) ||
      districtName.toLowerCase().includes(searchLow) ||
      title.toLowerCase().includes(searchLow) ||
      industryName.toLowerCase().includes(searchLow);

    const matchDistrict = !selectedDistrictId || o.institute?.lgddistrictId === Number(selectedDistrictId);
    const matchInstType = !selectedInstTypeId || o.institute?.institute_sub_type_id === Number(selectedInstTypeId);

    const matchStatus = (() => {
      if (!offStatus || offStatus === "All") return true;
      let s = status.toLowerCase();
      let target = offStatus.toLowerCase();

      // Normalization
      if (s === "project completed") s = "completed";
      if (s === "project initiated") s = "initiated";
      if (target === "project completed") target = "completed";
      if (target === "project initiated") target = "initiated";

      const now = Date.now();
      const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;
      const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

      const isResponsePending = (s === "sent" || s === "pending") && o.offer_date && (now - new Date(o.offer_date).getTime() > TWO_DAYS_MS);
      const isDecisionPending = s === "discussed" && (o.discussed_date || o.offer_date) && (now - new Date(o.discussed_date || o.offer_date || "").getTime() > SEVEN_DAYS_MS);

      if (target === "pending") return !!isResponsePending;
      if (target === "pending_acceptance") return !!isDecisionPending;
      if (target === "discussed") return s === "discussed" && !isDecisionPending;

      return s === target;
    })();

    const matchEoiType =
      selectedEoiType === "All" ||
      eoiType.toLowerCase() === selectedEoiType.toLowerCase();

    let matchDate = true;
    if (offDateStart || offDateEnd) {
      const offerDate = o.offer_date ? new Date(o.offer_date).getTime() : 0;
      const filterStart = offDateStart ? new Date(offDateStart).getTime() : 0;
      const filterEnd = offDateEnd ? new Date(offDateEnd).getTime() : Infinity;

      if (offerDate && filterStart && offerDate < filterStart)
        matchDate = false;
      if (offerDate && filterEnd && offerDate > filterEnd) matchDate = false;
    }

    let matchLastDate = true;
    if (lastDateStart || lastDateEnd) {
      const lastDate = o.last_date ? new Date(o.last_date).getTime() : 0;
      const filterLStart = lastDateStart
        ? new Date(lastDateStart).getTime()
        : 0;
      const filterLEnd = lastDateEnd
        ? new Date(lastDateEnd).getTime()
        : Infinity;

      if (lastDate && filterLStart && lastDate < filterLStart)
        matchLastDate = false;
      if (lastDate && filterLEnd && lastDate > filterLEnd)
        matchLastDate = false;
    }

    return matchSearch && matchStatus && matchDate && matchLastDate && matchEoiType && matchDistrict && matchInstType;
  });

  const groupedIndustries = role === "dept_admin" ? (() => {
    const industryGroups: Record<number, { industry_name: string; batches: Record<string, OfferRow[]> }> = {};

    filteredOffers.forEach((o) => {
      const indId = o.industry_id || 0;
      const indName = o.industry?.industry_name || "Unknown Industry";
      const batchId = o.batch_id || `fallback-${o.industry_id}-${o.job_title}-${o.offer_date}`;

      if (!industryGroups[indId]) {
        industryGroups[indId] = { industry_name: indName, batches: {} };
      }
      if (!industryGroups[indId].batches[batchId]) {
        industryGroups[indId].batches[batchId] = [];
      }
      industryGroups[indId].batches[batchId].push(o);
    });

    return Object.entries(industryGroups).map(([id, group]) => ({
      industry_id: Number(id),
      industry_name: group.industry_name,
      requests: Object.entries(group.batches).map(([bid, offers]) => ({
        batch_id: bid,
        offers,
        mainOffer: offers[0],
      })),
    }));
  })() : [];


  // ── Pagination ──
  const offPag = usePagination(filteredOffers);

  // ── Stats ──
  const getStatusCount = (target: string) => {
    return offers.filter(o => {
      const matchType = selectedEoiType === "All" || (o.eoi_type ?? "Placement").toLowerCase() === selectedEoiType.toLowerCase();
      if (!matchType) return false;

      let s = (o.status ?? "").toLowerCase();
      let t = target.toLowerCase();

      if (t === "all") return true;

      // Normalization
      if (s === "project completed") s = "completed";
      if (s === "project initiated") s = "initiated";
      if (t === "project completed") t = "completed";
      if (t === "project initiated") t = "initiated";

      const now = Date.now();
      const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;
      const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

      const isResponsePending = (s === "sent" || s === "pending") && o.offer_date && (now - new Date(o.offer_date).getTime() > TWO_DAYS_MS);
      const isDecisionPending = s === "discussed" && (o.discussed_date || o.offer_date) && (now - new Date(o.discussed_date || o.offer_date || "").getTime() > SEVEN_DAYS_MS);

      if (t === "pending") return !!isResponsePending;
      if (t === "pending_acceptance") return !!isDecisionPending;
      if (t === "discussed") return s === "discussed" && !isDecisionPending;

      return s === t;
    }).length;
  };

  const statusTiles = [
    // avoid secondary/yellow colours; keep everything primary/info/success/error
    // ...(role === "dept_admin" ? [{ type: "All", label: "All Applications", icon: Send, color: "primary" }] : []),
    { type: "All", label: "Received", icon: Send, color: "primary" },
    { type: "Pending", label: "Response Pending", icon: Clock, color: "primary" },
    { type: "Discussed", label: " Under Process", icon: Users, color: "info" },
    { type: "Pending_Acceptance", label: "Decision Pending", icon: Clock, color: "primary" },
    { type: "Accepted", label: "Accepted", icon: CheckCircle2, color: "success" },
    { type: "Rejected", label: "Rejected", icon: XCircle, color: "error" },
    { type: "Initiated", label: "Project Initiated", icon: TrendingUp, color: "primary" },
    { type: "Completed", label: "Project Completed", icon: CheckCircle2, color: "success" },
  ];


  const downloadExcel = (wb: XLSX.WorkBook, filename: string) => {
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const dataBlob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  const exportToExcel = () => {
    if (!filteredOffers.length) return;
    const titleKey = selectedEoiType === "Industrial Training" ? "Training Program" : selectedEoiType === "Collaboration" ? "Collaboration Title" : "Job Title";
    const salaryKey = selectedEoiType === "Industrial Training" ? "Stipend Range (₹)" : selectedEoiType === "Collaboration" ? "Funding/Budget (₹)" : "Salary Range (₹)";
    const postsKey = selectedEoiType === "Industrial Training" ? "Slots" : selectedEoiType === "Collaboration" ? "Capacity" : "Posts";

    const data = filteredOffers.map((o) => ({
      Institute: o.institute?.institute_name || "—",
      District: getDistrictName(o),
      [titleKey]: o.job_title || "—",
      [salaryKey]: salary(o.salary_min, o.salary_max),
      [postsKey]: o.number_of_posts || "—",
      "Offer Date": o.offer_date
        ? new Date(o.offer_date).toLocaleDateString("en-IN")
        : "—",
      "Last Date": o.last_date
        ? new Date(o.last_date).toLocaleDateString("en-IN")
        : "—",
      Status: o.status || "—",
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "EOI Sent");
    downloadExcel(wb, "EOI_Sent.xlsx");
  };



  console.log("viewOffer >>>", viewOffer);

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className="w-full mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
            <Send
              size={22}
              className="text-primary-content"
              strokeWidth={2}
            />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-base-content tracking-tight leading-tight">
              {/* {role === "dept_admin" ? "Applications" : "EOI"} {role === "dept_admin" ? "Received" : "Sent"} */}
              Application Tracker
            </h1>
            <p className="text-sm text-base-content/50 mt-0.5">
              Track and manage all {role === "dept_admin" ? "applications" : "expressions of interest"} {role === "dept_admin" ? "received from industries" : "sent to institutes"}
            </p>
          </div>
        </div>
      </div>

      {/* Dashboard Tiles (EOI Types for others, Status for Dept Admin) */}
      <div className={clsx(
        "grid gap-4",
        role === "dept_admin" ? "grid-cols-2 md:grid-cols-4" : "grid-cols-2 lg:grid-cols-4"
      )}>
        {role === "dept_admin" ? (
          statusTiles.map((tile) => (
            <button
              key={tile.type}
              onClick={() => {
                setOffStatus(offStatus === tile.type ? "" : tile.type);
                offPag.setPage(1);
              }}
              className={clsx(
                "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 text-center group hover:shadow-md hover:scale-[1.02] focus:outline-none focus:ring-0 active:scale-[0.98]",
                offStatus === tile.type
                  ? `border-${tile.color} bg-${tile.color}/5`
                  : "border-base-300 dark:border-base-700 bg-base-100 dark:bg-base-900 hover:border-base-400"
              )}
            >
              <div className={clsx(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
                `bg-${tile.color}/10 text-${tile.color}`
              )}>
                <tile.icon size={20} />
              </div>
              <div className="flex flex-col items-center gap-1">
                <h3 className="font-bold text-base-content text-base">{tile.label}</h3>
                <span className={clsx(
                  "px-2.5 py-1 rounded-lg text-xl font-black",
                  `bg-${tile.color}/10 text-${tile.color}`
                )}>
                  {getStatusCount(tile.type)}
                </span>
              </div>
            </button>
          ))
        ) : (
          [
            {
              type: "All",
              label: "All EOIs",
              desc: "View all categories",
              icon: Send,
              color: "primary", // avoid secondary
              count: offers.length,
            },
            {
              type: "Placement",
              label: "Hire Student",
              desc: "For full-time placements",
              icon: Users,
              color: "primary",
              count: offers.filter((o) => (o.eoi_type ?? "Placement") === "Placement").length,
            },
            {
              type: "Industrial Training",
              label: "Host for Training",
              desc: "6-month industrial training",
              icon: Building2,
              color: "info",
              count: offers.filter((o) => o.eoi_type === "Industrial Training").length,
            },
            {
              type: "Collaboration",
              label: "Collaborate",
              desc: "Partnerships & MoUs",
              icon: Briefcase,
              color: "success",
              count: offers.filter((o) => o.eoi_type === "Collaboration").length,
            },
          ].map((tile) => (
            <button
              key={tile.type}
              onClick={() => {
                setSelectedEoiType(selectedEoiType === tile.type ? "All" : tile.type);
                offPag.setPage(1);
              }}
              className={clsx(
                "p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 text-center group",
                selectedEoiType === tile.type
                  ? `border-${tile.color} bg-${tile.color}/5`
                  : "border-base-300 dark:border-base-700 bg-base-100 dark:bg-base-900 hover:border-base-400"
              )}
            >
              <div className={clsx(
                "w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
                `bg-${tile.color}/10 text-${tile.color}`
              )}>
                <tile.icon size={24} />
              </div>
              <div className="flex flex-col items-center gap-1">
                <h3 className="font-bold text-base-content">{tile.label}</h3>
                <span className={clsx(
                  "px-2 py-0.5 rounded-full text-sm font-black",
                  `bg-${tile.color}/10 text-${tile.color}`
                )}>
                  {tile.count}
                </span>
                <p className="text-xs text-base-content/50 mt-1">{tile.desc}</p>
              </div>
            </button>
          ))
        )}
      </div>



      {/* ── TAB: Industry Offers ───────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="rounded-2xl bg-base-100 dark:bg-base-900 border border-base-300 dark:border-base-700 shadow-sm p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-info" />
              <h2 className="text-sm font-bold text-base-content">
                Filters & Export
              </h2>
            </div>
            <button
              onClick={exportToExcel}
              disabled={filteredOffers.length === 0}
              className={clsx(
                "btn btn-sm gap-2 transition-colors duration-200",
                "btn-primary hover:brightness-110",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "shadow-sm hover:shadow-md"
              )}
            >
              <TrendingUp size={14} />
              Export to Excel
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {/* Row 1: Primary Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-base-content/60 mb-1.5 uppercase tracking-wide">
                  Application Type
                </label>
                <select
                  value={selectedEoiType}
                  onChange={(e) => {
                    setSelectedEoiType(e.target.value);
                    offPag.setPage(1);
                  }}
                  className="w-full bg-base-200 dark:bg-base-800 border border-base-300 dark:border-base-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-info"
                >
                  <option value="All">All</option>
                  <option value="Placement">Hiring</option>
                  <option value="Industrial Training">Industrial Training</option>
                  <option value="Collaboration">Collaboration</option>
                </select>
              </div>

              {role === "dept_admin" && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-base-content/60 mb-1.5 uppercase tracking-wide">
                      Institute Type
                    </label>
                    <select
                      value={selectedInstTypeId}
                      onChange={(e) => {
                        setSelectedInstTypeId(e.target.value);
                        offPag.setPage(1);
                      }}
                      className="w-full bg-base-200 dark:bg-base-800 border border-base-300 dark:border-base-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-info"
                    >
                      <option value="">All Institute Types</option>
                      {instTypes.map((t) => (
                        <option key={t.institute_sub_type_id} value={t.institute_sub_type_id}>
                          {t.institute_sub_type}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-base-content/60 mb-1.5 uppercase tracking-wide">
                      District
                    </label>
                    <select
                      value={selectedDistrictId}
                      onChange={(e) => {
                        setSelectedDistrictId(e.target.value);
                        offPag.setPage(1);
                      }}
                      className="w-full bg-base-200 dark:bg-base-800 border border-base-300 dark:border-base-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-info"
                    >
                      <option value="">All Districts</option>
                      {districts.map((d) => (
                        <option key={d.lgddistrictId} value={d.lgddistrictId}>
                          {d.districtname}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div className={clsx(role === "dept_admin" ? "col-span-1" : "col-span-1 sm:col-span-3 lg:col-span-1")}>
                <label className="block text-xs font-semibold text-base-content/60 mb-1.5 uppercase tracking-wide">
                  Search
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search industry, institute, title…"
                    value={offSearch}
                    onChange={(e) => {
                      setOffSearch(e.target.value);
                      offPag.setPage(1);
                    }}
                    className="w-full bg-base-200 dark:bg-base-800 border border-base-300 dark:border-base-700 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-info"
                  />
                  <Search
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 pointer-events-none"
                  />
                  {offSearch && (
                    <button
                      onClick={() => setOffSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-error"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Row 2: Dates & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {role !== "dept_admin" && (
                <div>
                  <label className="block text-xs font-semibold text-base-content/60 mb-1.5 uppercase tracking-wide">
                    Status
                  </label>
                  <select
                    value={offStatus}
                    onChange={(e) => {
                      setOffStatus(e.target.value);
                      offPag.setPage(1);
                    }}
                    className="w-full bg-base-200 dark:bg-base-800 border border-base-300 dark:border-base-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-info"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Sent">Received</option>
                    <option value="Pending">Pending for Discussion (+2 days)</option>
                    <option value="Pending_Acceptance">Pending for Acceptance (+7 days)</option>
                    <option value="Discussed">Discussed</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Initiated">Initiated</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              )}
              <div className={clsx(role === "dept_admin" ? "md:col-span-1" : "")}>
                <label className="block text-xs font-semibold text-base-content/60 mb-1.5 uppercase tracking-wide">
                  Date (From)
                </label>
                <input
                  type="date"
                  value={offDateStart}
                  onChange={(e) => {
                    setOffDateStart(e.target.value);
                    offPag.setPage(1);
                  }}
                  className="w-full bg-base-200 dark:bg-base-800 border border-base-300 dark:border-base-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-info"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-base-content/60 mb-1.5 uppercase tracking-wide">
                  Date (To)
                </label>
                <input
                  type="date"
                  value={offDateEnd}
                  onChange={(e) => {
                    setOffDateEnd(e.target.value);
                    offPag.setPage(1);
                  }}
                  className="w-full bg-base-200 dark:bg-base-800 border border-base-300 dark:border-base-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-info"
                />
              </div>
            </div>
          </div>

          {(offSearch ||
            offStatus !== "All" ||
            offDateStart ||
            offDateEnd ||
            selectedDistrictId ||
            selectedInstTypeId ||
            lastDateStart ||
            lastDateEnd) && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    setOffSearch("");
                    setOffStatus("");
                    setOffDateStart("");
                    setOffDateEnd("");
                    setLastDateStart("");
                    setLastDateEnd("");
                    setSelectedDistrictId("");
                    setSelectedInstTypeId("");
                    offPag.setPage(1);
                  }}
                  className="btn btn-outline btn-sm text-xs"
                >
                  <X size={14} className="mr-1" />
                  Reset Filters
                </button>
              </div>
            )}
        </div>

        {loadingOff ? (
          <LoadingState label="offers" />
        ) : errorOff ? (
          <ErrorState msg={errorOff} onRetry={fetchOffers} />
        ) : filteredOffers.length === 0 ? (
          <EmptyState
            icon={<Send size={24} className="text-info" />}
            title={`No ${role === "dept_admin" ? "applications" : "offers"} found`}
            sub={`No ${role === "dept_admin" ? "applications" : "industry offers"} match your filters`}
          />
        ) : role === "dept_admin" ? (
          <div className="space-y-10">
            {groupedIndustries.map((ind) => (
              <div key={ind.industry_id} className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex items-center gap-4 px-2">
                  <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary shadow-sm">
                    <Building size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-base-content tracking-tight">
                      {ind.industry_name}
                    </h2>
                    <p className="text-xs text-base-content/40 font-medium uppercase tracking-wider">
                      {ind.requests.length} Active Requests
                    </p>
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-r from-base-300 to-transparent dark:from-base-700 ml-4" />
                </div>
                <div className="space-y-4 pl-0 md:pl-4">
                  {ind.requests.map((req) => (
                    <RequestAccordion
                      key={req.batch_id}
                      industryRequest={req}
                      setViewOffer={setViewOffer}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="text-sm text-base-content/60 px-1">
              Showing {offPag.slice.length} of {offPag.total} offers
            </div>
            <div className="overflow-x-auto rounded-xl border border-base-300 dark:border-base-700 bg-base-100 dark:bg-base-900 shadow-sm">
              <table className="min-w-full divide-y divide-base-200 dark:divide-base-800">
                <thead>
                  <tr className="bg-base-200/60 dark:bg-base-800/60">
                    <Th>Institute</Th>
                    <Th>
                      {role === "dept_admin"
                        ? "EOI Title"
                        : selectedEoiType === "Industrial Training"
                          ? "Training Program"
                          : selectedEoiType === "Collaboration"
                            ? "Collaboration Title"
                            : "Job Title"}
                    </Th>
                    <Th>
                      {role === "dept_admin"
                        ? "Remuneration"
                        : selectedEoiType === "Industrial Training"
                          ? "Stipend Range"
                          : selectedEoiType === "Collaboration"
                            ? "Funding/Budget"
                            : "Salary Range"}
                    </Th>
                    <Th>
                      {role === "dept_admin"
                        ? "Openings"
                        : selectedEoiType === "Industrial Training"
                          ? "Slots"
                          : selectedEoiType === "Collaboration"
                            ? "Capacity"
                            : "Posts"}
                    </Th>
                    <Th>{role === "dept_admin" ? "Date Received" : "Offer Date"}</Th>
                    {role !== "dept_admin" && <Th>Last Date</Th>}
                    <Th center>Status</Th>
                    <Th right>Actions</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-base-200 dark:divide-base-800">
                  {offPag.slice.map((o) => (
                    <tr
                      key={o.offer_id}
                      className="hover:bg-base-200/40 dark:hover:bg-base-800/40 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Building2
                            size={15}
                            className="text-info/70 flex-shrink-0"
                          />
                          <div>
                            <p className="text-sm font-medium text-base-content">
                              {o.institute?.institute_name ?? "—"}
                            </p>
                            {getDistrictName(o) !== "—" && (
                              <p className="text-xs text-base-content/50">
                                {getDistrictName(o)}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-base-content max-w-[180px] truncate">
                          {o.job_title}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-sm text-base-content/70">
                          {selectedEoiType === "Collaboration" ? (
                            <IndianRupee size={13} className="flex-shrink-0" />
                          ) : (
                            <IndianRupee size={13} className="flex-shrink-0" />
                          )}
                          {salary(o.salary_min, o.salary_max)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-sm text-base-content/70">
                          <Users size={13} className="flex-shrink-0" />
                          {o.number_of_posts ?? "—"}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-base-content/70">
                        {fmt(o.offer_date)}
                      </td>
                      {role !== "dept_admin" && (
                        <td className="px-4 py-3 text-sm text-base-content/70">
                          <div className="flex items-center gap-1">
                            <CalendarDays
                              size={13}
                              className="flex-shrink-0 text-warning/70"
                            />
                            {fmt(o.last_date)}
                          </div>
                        </td>
                      )}
                      <td className="px-4 py-3 text-center">
                        <StatusBadge status={o.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setViewOffer(o)}
                          className="w-8 h-8 rounded-lg border border-base-300 dark:border-base-700 bg-base-200 dark:bg-base-800 hover:border-info hover:text-info flex items-center justify-center transition-all mx-auto"
                        >
                          <Eye size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <PaginationBar
              page={offPag.page}
              totalPages={offPag.totalPages}
              total={offPag.total}
              onPage={offPag.setPage}
              label="offers"
            />
          </>
        )}
      </div>

      {/* ── Offer Detail Modal ─────────────────────────────────────────────── */}
      {viewOffer && (
        <Modal title={`${role === "dept_admin" ? "Application" : "EOI"} Details`} onClose={() => setViewOffer(null)}>
          <div className="space-y-6">
            <section className="space-y-3">
              <h3 className="text-xs font-bold text-primary uppercase tracking-widest">Institute Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-base-200/40 dark:bg-base-800/40 p-4 rounded-xl border border-base-300 dark:border-base-700">
                <DetailRow label="Institute" value={viewOffer.institute?.institute_name ?? "—"} />
                <DetailRow label="District" value={viewOffer.institute?.district?.districtname ?? "—"} />
                <div className="sm:col-span-2">
                  <DetailRow label="Address" value={viewOffer.institute?.address ?? "—"} />
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-xs font-bold text-primary uppercase tracking-widest">Industry Request Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-base-200/40 dark:bg-base-800/40 p-4 rounded-xl border border-base-300 dark:border-base-700">
                <DetailRow label="Industry" value={viewOffer.industry?.industry_name ?? "—"} />
                <DetailRow
                  label={viewOffer.eoi_type === "Industrial Training" ? "Training Program" : viewOffer.eoi_type === "Collaboration" ? "Collaboration Title" : "Job Title"}
                  value={viewOffer.job_title}
                />
                <DetailRow label="Application Type" value={viewOffer.eoi_type} />
                <DetailRow label="Partnership Type" value={viewOffer.nature_of_engagement || "—"} />
                <DetailRow
                  label={viewOffer.eoi_type === "Industrial Training" ? "Stipend Range" : viewOffer.eoi_type === "Collaboration" ? "Funding/Budget" : "Salary Range"}
                  value={salary(viewOffer.salary_min, viewOffer.salary_max)}
                />
                <DetailRow
                  label={viewOffer.eoi_type === "Industrial Training" ? "Slots" : viewOffer.eoi_type === "Collaboration" ? "Capacity" : "Number of Posts"}
                  value={viewOffer.number_of_posts?.toString() ?? "—"}
                />
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-xs font-bold text-primary uppercase tracking-widest">Requirements & Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-base-200/40 dark:bg-base-800/40 p-4 rounded-xl border border-base-300 dark:border-base-700">
                <DetailRow label="Experience" value={viewOffer.experience_required || "—"} />
                <DetailRow label="Location" value={`${viewOffer.location || "—"} ${viewOffer.is_remote ? "(Remote)" : ""}`} />
                <DetailRow label="Duration" value={viewOffer.duration || "—"} />
                <DetailRow label="Start Date" value={fmt(viewOffer.start_date)} />
                {viewOffer.collaboration_types && (
                  <div className="sm:col-span-2">
                    <DetailRow label="Collaboration Types" value={viewOffer.collaboration_types} />
                  </div>
                )}
                {viewOffer.job_description && (
                  <div className="sm:col-span-2">
                    <DetailRow label="Description" value={viewOffer.job_description} />
                  </div>
                )}
                {viewOffer.additional_details && (
                  <div className="sm:col-span-2">
                    <DetailRow label="Additional Details" value={viewOffer.additional_details} />
                  </div>
                )}
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-xs font-bold text-primary uppercase tracking-widest">Status Tracking</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-base-200/40 dark:bg-base-800/40 p-4 rounded-xl border border-base-300 dark:border-base-700 items-end">
                <div>
                  <p className="text-xs text-base-content/60 mb-1.5 uppercase tracking-wide">Current Status</p>
                  <StatusBadge status={viewOffer.status} />
                </div>
                <DetailRow label="Sent On" value={fmt(viewOffer.offer_date)} />
                <DetailRow label="Last Updated" value={fmt(viewOffer.updated_date || viewOffer.offer_date)} />
                <DetailRow label="Deadline" value={fmt(viewOffer.last_date)} />
              </div>
            </section>
          </div>
        </Modal>
      )}

    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function RequestAccordion({
  industryRequest,
  setViewOffer,
}: {
  industryRequest: any;
  setViewOffer: (o: any) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { mainOffer, offers } = industryRequest;

  return (
    <div className={clsx(
      "border transition-all duration-300 rounded-2xl overflow-hidden",
      isOpen
        ? "border-primary/30 ring-4 ring-primary/5 bg-base-100 dark:bg-base-900 shadow-xl"
        : "border-base-300 dark:border-base-700 bg-base-100/50 dark:bg-base-900/50 hover:bg-base-100 dark:hover:bg-base-900 shadow-sm"
    )}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 transition-colors group"
      >
        <div className="flex items-center gap-5">
          <div className={clsx(
            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500",
            isOpen ? "bg-primary text-primary-content rotate-3 shadow-lg" : "bg-base-200 dark:bg-base-800 text-base-content/40 group-hover:text-primary group-hover:bg-primary/10"
          )}>
            <Briefcase size={22} />
          </div>
          <div className="text-left space-y-1">
            <h3 className="font-bold text-base-content text-lg group-hover:text-primary transition-colors">
              {mainOffer.job_title}
            </h3>
            <div className="flex items-center gap-3 text-xs text-base-content/50 font-medium">
              <span className="flex items-center gap-1">
                <CalendarDays size={12} />
                {fmt(mainOffer.offer_date)}
              </span>
              <span className="w-1 h-1 rounded-full bg-base-content/20" />
              <span className="flex items-center gap-1">
                <Building2 size={12} />
                {offers.length} Institutes
              </span>
            </div>
          </div>
        </div>
        <div className={clsx(
          "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
          isOpen ? "bg-primary/10 text-primary rotate-180" : "bg-base-200 dark:bg-base-800 text-base-content/30"
        )}>
          <ChevronDown size={20} />
        </div>
      </button>

      <div className="px-6 pb-5 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-base-200/50 dark:bg-base-800/50 rounded-2xl border border-base-300 dark:border-base-700 shadow-inner mt-2">
          <DetailRow label="Application Type" value={mainOffer.eoi_type} />
          <DetailRow label="Students / Posts" value={mainOffer.number_of_posts?.toString() || "—"} />
          <DetailRow label="Remuneration" value={salary(mainOffer.salary_min, mainOffer.salary_max)} />
          <DetailRow label="Partnership Type" value={mainOffer.nature_of_engagement || "—"} />
        </div>

        {isOpen && (
          <div className="overflow-x-auto rounded-2xl border border-base-300 dark:border-base-700 bg-base-100 dark:bg-base-900 shadow-inner animate-in fade-in slide-in-from-top-4 duration-300">
            <table className="min-w-full divide-y divide-base-200 dark:divide-base-800">
              <thead className="bg-base-200/30 dark:bg-base-800/30">
                <tr>
                  <Th>Institute</Th>
                  <Th center>Application Type</Th>
                  <Th center>Current Status</Th>
                  <Th center>Last Updated On</Th>
                  <Th right>Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-base-200 dark:divide-base-800">
                {offers.map((o: any) => (
                  <tr key={o.offer_id} className="hover:bg-primary/5 transition-colors group/row">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-info/10 flex items-center justify-center text-info shadow-sm">
                          <Building2 size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-base-content leading-tight">
                            {o.institute?.institute_name}
                          </p>
                          <p className="text-xs text-base-content/50 mt-0.5">
                            {getDistrictName(o)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="px-2.5 py-1 rounded-lg bg-base-200 dark:bg-base-800 text-[10px] font-bold text-base-content/70 uppercase tracking-wider">
                        {o.eoi_type}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="px-4 py-4 text-center text-sm font-medium text-base-content/60">
                      {fmt(o.updated_date || o.offer_date)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => setViewOffer(o)}
                        className="w-9 h-9 rounded-xl bg-base-200 dark:bg-base-800 hover:bg-primary hover:text-primary-content flex items-center justify-center transition-all ml-auto shadow-sm"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Th({
  children,
  center,
  right,
}: {
  children: React.ReactNode;
  center?: boolean;
  right?: boolean;
}) {
  return (
    <th
      className={clsx(
        "px-4 py-3 text-xs font-bold text-base-content/60 uppercase tracking-wider",
        center ? "text-center" : right ? "text-right" : "text-left",
      )}
    >
      {children}
    </th>
  );
}

function LoadingState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-base-content/50">
      <Loader2 size={30} className="animate-spin text-primary" />
      <p className="text-sm">Loading {label}…</p>
    </div>
  );
}

function ErrorState({ msg, onRetry }: { msg: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 rounded-2xl border-2 border-dashed border-error/30 bg-error/5 gap-3">
      <XCircle size={28} className="text-error" />
      <p className="text-sm font-medium text-error">{msg}</p>
      <button onClick={onRetry} className="btn btn-outline btn-sm btn-error">
        Retry
      </button>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  sub,
}: {
  icon: React.ReactNode;
  title: string;
  sub: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 rounded-2xl border-2 border-dashed border-base-300 dark:border-base-700 bg-base-100 dark:bg-base-900 gap-3">
      <div className="w-14 h-14 rounded-2xl bg-base-200 dark:bg-base-800 flex items-center justify-center">
        {icon}
      </div>
      <div className="text-center">
        <p className="font-semibold text-base-content">{title}</p>
        <p className="text-sm text-base-content/50 mt-1">{sub}</p>
      </div>
    </div>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-base-100 dark:bg-base-900 rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col border border-base-300 dark:border-base-700 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-base-300 dark:border-base-700 shrink-0 bg-base-100 dark:bg-base-900">
          <h2 className="text-lg font-bold text-base-content">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-base-200 dark:bg-base-800 flex items-center justify-center hover:bg-error/10 hover:text-error transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto space-y-4">{children}</div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-base-content/60 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-base-content">{value}</p>
    </div>
  );
}
