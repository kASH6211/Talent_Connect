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
} from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import clsx from "clsx";
import * as XLSX from "xlsx";

// ─── Types ───────────────────────────────────────────────────────────────────
interface RequestRow {
  industry_request_id: number;
  institute?: { institute_name: string; district?: string };
  requestType?: { request_type_name: string };
  requestStatus?: { status_name: string };
  request_date?: string;
  expiry_date?: string;
  vacancies?: number;
  remarks?: string;
  // flat fallbacks
  institute_name?: string;
  district?: string;
  status?: string;
  job_title?: string;
  request_id?: number;
}

interface OfferRow {
  offer_id: number;
  job_title: string;
  job_description?: string;
  salary_min?: number;
  salary_max?: number;
  offer_date?: string;
  last_date?: string;
  number_of_posts?: number;
  status: string;
  institute?: {
    institute_name: string;
    district?: { districtname: string };
    address?: string;
    districtname?: string;
  };
  industry?: { industry_name: string };
}

type TabId = "offers" | "accepted";

const ITEMS_PER_PAGE = 10;

// ─── Helpers ─────────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const s = (status ?? "").toLowerCase();
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap",
        s === "accepted" && "bg-success/10 text-success",
        s === "rejected" && "bg-error/10 text-error",
        s === "pending" && "bg-warning/10 text-warning",
        s === "withdrawn" && "bg-base-300 text-base-content/60",
        !["accepted", "rejected", "pending", "withdrawn"].includes(s) &&
          "bg-info/10 text-info",
      )}
    >
      {s === "accepted" && <CheckCircle2 size={13} />}
      {s === "rejected" && <XCircle size={13} />}
      {s === "pending" && <Clock size={13} />}
      {s === "withdrawn" && <XCircle size={13} />}
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
    n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${(n / 1000).toFixed(0)}K`;
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
  const { isIndustry } = useAuth();

  // ── Data state ──
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [offers, setOffers] = useState<OfferRow[]>([]);
  const [loadingReq, setLoadingReq] = useState(false);
  const [loadingOff, setLoadingOff] = useState(false);
  const [errorReq, setErrorReq] = useState("");
  const [errorOff, setErrorOff] = useState("");

  // ── Tab ──
  const [activeTab, setActiveTab] = useState<TabId>("offers");

  // ── Filters (per tab) ──
  const [reqSearch, setReqSearch] = useState("");
  const [reqStatus, setReqStatus] = useState("All");
  const [offSearch, setOffSearch] = useState("");
  const [offStatus, setOffStatus] = useState("All");
  const [offDateStart, setOffDateStart] = useState("");
  const [offDateEnd, setOffDateEnd] = useState("");
  const [lastDateStart, setLastDateStart] = useState("");
  const [lastDateEnd, setLastDateEnd] = useState("");
  const [accSearch, setAccSearch] = useState("");

  // ── View modal ──
  const [viewOffer, setViewOffer] = useState<OfferRow | null>(null);
  const [viewReq, setViewReq] = useState<RequestRow | null>(null);

  // ── Fetch ──
  const fetchRequests = useCallback(async () => {
    setLoadingReq(true);
    setErrorReq("");
    try {
      const res = await api.get("/industry-request");
      setRequests(res.data ?? []);
    } catch (e: any) {
      setErrorReq(e?.response?.data?.message || "Failed to load requests");
    } finally {
      setLoadingReq(false);
    }
  }, []);

  const fetchOffers = useCallback(async () => {
    setLoadingOff(true);
    setErrorOff("");
    try {
      const res = await api.get("/job-offer");
      setOffers(res.data ?? []);
    } catch (e: any) {
      setErrorOff(e?.response?.data?.message || "Failed to load offers");
    } finally {
      setLoadingOff(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
    fetchOffers();
  }, [fetchRequests, fetchOffers]);

  // ── Derived filtered lists ──
  const filteredRequests = requests.filter((r) => {
    const name = r.institute?.institute_name ?? r.institute_name ?? "";
    const districtName = getDistrictName(r);
    const type = r.requestType?.request_type_name ?? r.job_title ?? "";
    const status = r.requestStatus?.status_name ?? r.status ?? "";

    const searchLow = reqSearch.toLowerCase();
    const matchSearch =
      !reqSearch ||
      name.toLowerCase().includes(searchLow) ||
      districtName.toLowerCase().includes(searchLow) ||
      type.toLowerCase().includes(searchLow);

    const matchStatus =
      reqStatus === "All" || status.toLowerCase() === reqStatus.toLowerCase();

    return matchSearch && matchStatus;
  });

  const filteredOffers = offers.filter((o) => {
    const name = o.institute?.institute_name ?? "";
    const districtName = getDistrictName(o);
    const title = o.job_title ?? "";
    const status = o.status ?? "";

    const searchLow = offSearch.toLowerCase();
    const matchSearch =
      !offSearch ||
      name.toLowerCase().includes(searchLow) ||
      districtName.toLowerCase().includes(searchLow) ||
      title.toLowerCase().includes(searchLow);

    const matchStatus =
      offStatus === "All" || status.toLowerCase() === offStatus.toLowerCase();

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

    return matchSearch && matchStatus && matchDate && matchLastDate;
  });

  const acceptedOffers = offers.filter((o) => {
    const status = o.status ?? "";
    if (status.toLowerCase() !== "accepted") return false;

    const searchLow = accSearch.toLowerCase();
    if (!searchLow) return true;

    const name = o.institute?.institute_name ?? "";
    const title = o.job_title ?? "";

    return (
      name.toLowerCase().includes(searchLow) ||
      title.toLowerCase().includes(searchLow)
    );
  });

  // ── Pagination ──
  const reqPag = usePagination(filteredRequests);
  const offPag = usePagination(filteredOffers);
  const accPag = usePagination(acceptedOffers);

  // ── Stats ──
  const stats = [
    // {
    //   label: "Placement Requests",
    //   value: requests.length,
    //   color: "text-primary",
    //   bg: "bg-primary/10",
    // },
    {
      label: "Offers Sent",
      value: offers.length,
      color: "text-info",
      bg: "bg-info/10",
    },
    {
      label: "Accepted Offers",
      value: offers.filter((o) => o.status.toLowerCase() === "accepted").length,
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      label: "Pending Offers",
      value: offers.filter((o) => o.status.toLowerCase() === "pending").length,
      color: "text-warning",
      bg: "bg-warning/10",
    },
  ];

  const tabs: { id: TabId; label: string; icon: any; count: number }[] = [
    // {
    //   id: "requests",
    //   label: "Placement Requests",
    //   icon: Briefcase,
    //   count: requests.length,
    // },
    {
      id: "offers",
      label: "Industry Offers",
      icon: Send,
      count: offers.length,
    },
    {
      id: "accepted",
      label: "Accepted Offers",
      icon: CheckCircle2,
      count: offers.filter((o) => o.status.toLowerCase() === "accepted").length,
    },
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
    const data = filteredOffers.map((o) => ({
      Institute: o.institute?.institute_name || "—",
      District: getDistrictName(o),
      "Job Title": o.job_title || "—",
      "Salary Min (₹)": o.salary_min || "—",
      "Salary Max (₹)": o.salary_max || "—",
      Posts: o.number_of_posts || "—",
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
    XLSX.utils.book_append_sheet(wb, ws, "Industry Offers");
    downloadExcel(wb, "Industry_Offers.xlsx");
  };

  const exportRequestsToExcel = () => {
    if (!filteredRequests.length) return;
    const data = filteredRequests.map((r) => ({
      Institute: r.institute?.institute_name || r.institute_name || "—",
      District: getDistrictName(r),
      "Request Type":
        r.requestType?.request_type_name || r.job_title || "General",
      "Request Date": r.request_date
        ? new Date(r.request_date).toLocaleDateString("en-IN")
        : "—",
      "Expiry Date": r.expiry_date
        ? new Date(r.expiry_date).toLocaleDateString("en-IN")
        : "—",
      Vacancies: r.vacancies || "—",
      Status: r.requestStatus?.status_name || r.status || "Pending",
      Remarks: r.remarks || "—",
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Placement Requests");
    downloadExcel(wb, "Placement_Requests.xlsx");
  };

  const exportAcceptedToExcel = () => {
    if (!acceptedOffers.length) return;
    const data = acceptedOffers.map((o) => ({
      Institute: o.institute?.institute_name || "—",
      District: getDistrictName(o),
      "Job Title": o.job_title || "—",
      "Salary Min (₹)": o.salary_min || "—",
      "Salary Max (₹)": o.salary_max || "—",
      Posts: o.number_of_posts || "—",
      "Offer Date": o.offer_date
        ? new Date(o.offer_date).toLocaleDateString("en-IN")
        : "—",
      "Last Date": o.last_date
        ? new Date(o.last_date).toLocaleDateString("en-IN")
        : "—",
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Accepted Offers");
    downloadExcel(wb, "Accepted_Offers.xlsx");
  };

  console.log("viewOffer >>>", viewOffer);

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className="w-full mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
            <TrendingUp
              size={22}
              className="text-primary-content"
              strokeWidth={2}
            />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-base-content tracking-tight leading-tight">
              All Requests
            </h1>
            <p className="text-sm text-base-content/50 mt-0.5">
              Manage placement requests and industry offers
            </p>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl bg-base-100 dark:bg-base-900 border border-base-300 dark:border-base-700 shadow-sm p-4 flex items-center gap-3"
          >
            <div
              className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}
            >
              <span className={`text-lg font-black ${s.color}`}>{s.value}</span>
            </div>
            <p className="text-xs font-semibold text-base-content/60 leading-tight">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-base-200 dark:bg-base-800 rounded-xl p-1">
        {tabs.map(({ id, label, icon: Icon, count }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={clsx(
              "flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all",
              activeTab === id
                ? "bg-base-100 dark:bg-base-900 text-base-content shadow-sm"
                : "text-base-content/50 hover:text-base-content/80",
            )}
          >
            <Icon size={16} />
            <span className="hidden sm:inline">{label}</span>
            <span
              className={clsx(
                "text-xs px-2 py-0.5 rounded-full font-bold",
                activeTab === id
                  ? "bg-primary/10 text-primary"
                  : "bg-base-300 dark:bg-base-700 text-base-content/50",
              )}
            >
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* ── TAB: Placement Requests ─────────────────────────────────────────── */}
      {/* {activeTab === "requests" && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-base-100 dark:bg-base-900 border border-base-300 dark:border-base-700 shadow-sm p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-primary" />
                <h2 className="text-sm font-bold text-base-content">
                  Filters & Export
                </h2>
              </div>
              <button
                onClick={exportRequestsToExcel}
                disabled={filteredRequests.length === 0}
                className="btn btn-sm btn-primary text-primary-content gap-2 disabled:opacity-50"
              >
                <TrendingUp size={14} />
                Export to Excel
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-base-content/60 mb-1.5 uppercase tracking-wide">
                  Status
                </label>
                <select
                  value={reqStatus}
                  onChange={(e) => {
                    setReqStatus(e.target.value);
                    reqPag.setPage(1);
                  }}
                  className="w-full bg-base-200 dark:bg-base-800 border border-base-300 dark:border-base-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
                >
                  <option value="All">All</option>
                  <option value="Pending">Pending</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-base-content/60 mb-1.5 uppercase tracking-wide">
                  Search
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search institute, district, request type…"
                    value={reqSearch}
                    onChange={(e) => {
                      setReqSearch(e.target.value);
                      reqPag.setPage(1);
                    }}
                    className="w-full bg-base-200 dark:bg-base-800 border border-base-300 dark:border-base-700 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                  />
                  <Search
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 pointer-events-none"
                  />
                  {reqSearch && (
                    <button
                      onClick={() => setReqSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-error"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
            {(reqSearch || reqStatus !== "All") && (
              <button
                onClick={() => {
                  setReqSearch("");
                  setReqStatus("All");
                  reqPag.setPage(1);
                }}
                className="mt-3 btn btn-outline btn-sm text-xs"
              >
                Reset Filters
              </button>
            )}
          </div>

          {loadingReq ? (
            <LoadingState label="requests" />
          ) : errorReq ? (
            <ErrorState msg={errorReq} onRetry={fetchRequests} />
          ) : filteredRequests.length === 0 ? (
            <EmptyState
              icon={<Briefcase size={24} className="text-primary" />}
              title="No requests found"
              sub="No placement requests match your filters"
            />
          ) : (
            <>
              <div className="text-sm text-base-content/60 px-1">
                Showing {reqPag.slice.length} of {reqPag.total} requests
              </div>
              <div className="overflow-x-auto rounded-xl border border-base-300 dark:border-base-700 bg-base-100 dark:bg-base-900 shadow-sm">
                <table className="min-w-full divide-y divide-base-200 dark:divide-base-800">
                  <thead>
                    <tr className="bg-base-200/60 dark:bg-base-800/60">
                      <Th>Institute</Th>
                      <Th>District</Th>
                      <Th>Request Type</Th>
                      <Th>Date</Th>
                      <Th>Vacancies</Th>
                      <Th center>Status</Th>
                      <Th right>Actions</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-base-200 dark:divide-base-800">
                    {reqPag.slice.map((r) => {
                      const name =
                        r.institute?.institute_name ?? r.institute_name ?? "—";
                      const dist = getDistrictName(r);
                      const type =
                        r.requestType?.request_type_name ??
                        r.job_title ??
                        "General";
                      const status =
                        r.requestStatus?.status_name ?? r.status ?? "Pending";
                      return (
                        <tr
                          key={r.industry_request_id ?? r.request_id}
                          className="hover:bg-base-200/40 dark:hover:bg-base-800/40 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Building2
                                size={15}
                                className="text-primary/70 flex-shrink-0"
                              />
                              <span className="text-sm font-medium text-base-content">
                                {name}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-base-content/70">
                            {dist}
                          </td>
                          <td className="px-4 py-3 text-sm text-base-content/70">
                            {type}
                          </td>
                          <td className="px-4 py-3 text-sm text-base-content/70">
                            {fmt(r.request_date)}
                          </td>
                          <td className="px-4 py-3 text-sm text-base-content/70">
                            {r.vacancies ?? "—"}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <StatusBadge status={status} />
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => setViewReq(r)}
                              className="w-8 h-8 rounded-lg border border-base-300 dark:border-base-700 bg-base-200 dark:bg-base-800 hover:border-primary hover:text-primary flex items-center justify-center transition-all mx-auto"
                            >
                              <Eye size={15} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <PaginationBar
                page={reqPag.page}
                totalPages={reqPag.totalPages}
                total={reqPag.total}
                onPage={reqPag.setPage}
                label="requests"
              />
            </>
          )}
        </div>
      )} */}

      {/* ── TAB: Industry Offers ───────────────────────────────────────────── */}
      {activeTab === "offers" && (
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
                className="btn btn-sm btn-info text-info-content gap-2 disabled:opacity-50"
              >
                <TrendingUp size={14} />
                Export to Excel
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {/* Row 1: Status and Search */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
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
                    <option value="All">All</option>
                    <option value="Pending">Pending</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Withdrawn">Withdrawn</option>
                  </select>
                </div>
                <div className="sm:col-span-1 md:col-span-2">
                  <label className="block text-xs font-semibold text-base-content/60 mb-1.5 uppercase tracking-wide">
                    Search
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search institute, job title…"
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

              {/* Row 2: Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-base-content/60 mb-1.5 uppercase tracking-wide">
                    Offer Date (From)
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
                    Offer Date (To)
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
                <div>
                  <label className="block text-xs font-semibold text-base-content/60 mb-1.5 uppercase tracking-wide">
                    Last Date (From)
                  </label>
                  <input
                    type="date"
                    value={lastDateStart}
                    onChange={(e) => {
                      setLastDateStart(e.target.value);
                      offPag.setPage(1);
                    }}
                    className="w-full bg-base-200 dark:bg-base-800 border border-base-300 dark:border-base-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-info"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-base-content/60 mb-1.5 uppercase tracking-wide">
                    Last Date (To)
                  </label>
                  <input
                    type="date"
                    value={lastDateEnd}
                    onChange={(e) => {
                      setLastDateEnd(e.target.value);
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
              lastDateStart ||
              lastDateEnd) && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    setOffSearch("");
                    setOffStatus("All");
                    setOffDateStart("");
                    setOffDateEnd("");
                    setLastDateStart("");
                    setLastDateEnd("");
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
              title="No offers found"
              sub="No industry offers match your filters"
            />
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
                      <Th>Job Title</Th>
                      <Th>Salary Range</Th>
                      <Th>Posts</Th>
                      <Th>Offer Date</Th>
                      <Th>Last Date</Th>
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
                            <IndianRupee size={13} className="flex-shrink-0" />
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
                        <td className="px-4 py-3 text-sm text-base-content/70">
                          <div className="flex items-center gap-1">
                            <CalendarDays
                              size={13}
                              className="flex-shrink-0 text-warning/70"
                            />
                            {fmt(o.last_date)}
                          </div>
                        </td>
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
      )}

      {/* ── TAB: Accepted Offers ───────────────────────────────────────────── */}
      {activeTab === "accepted" && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="rounded-2xl bg-base-100 dark:bg-base-900 border border-base-300 dark:border-base-700 shadow-sm p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-success" />
                <h2 className="text-sm font-bold text-base-content">
                  Search & Export
                </h2>
              </div>
              <button
                onClick={exportAcceptedToExcel}
                disabled={acceptedOffers.length === 0}
                className="btn btn-sm btn-success text-success-content gap-2 disabled:opacity-50"
              >
                <TrendingUp size={14} />
                Export to Excel
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search institute or job title…"
                value={accSearch}
                onChange={(e) => {
                  setAccSearch(e.target.value);
                  accPag.setPage(1);
                }}
                className="w-full bg-base-200 dark:bg-base-800 border border-base-300 dark:border-base-700 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-success"
              />
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 pointer-events-none"
              />
              {accSearch && (
                <button
                  onClick={() => setAccSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-error"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {loadingOff ? (
            <LoadingState label="accepted offers" />
          ) : acceptedOffers.length === 0 ? (
            <EmptyState
              icon={<CheckCircle2 size={24} className="text-success" />}
              title="No accepted offers"
              sub="No accepted offers found yet"
            />
          ) : (
            <>
              <div className="text-sm text-base-content/60 px-1">
                Showing {accPag.slice.length} of {accPag.total} accepted offers
              </div>
              <div className="overflow-x-auto rounded-xl border border-base-300 dark:border-base-700 bg-base-100 dark:bg-base-900 shadow-sm">
                <table className="min-w-full divide-y divide-base-200 dark:divide-base-800">
                  <thead>
                    <tr className="bg-success/5">
                      <Th>Institute</Th>
                      <Th>Job Title</Th>
                      <Th>Salary Range</Th>
                      <Th>Posts</Th>
                      <Th>Offer Date</Th>
                      <Th>Last Date</Th>
                      <Th right>Actions</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-base-200 dark:divide-base-800">
                    {accPag.slice.map((o) => (
                      <tr
                        key={o.offer_id}
                        className="hover:bg-success/5 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                              <Building2 size={14} className="text-success" />
                            </div>
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
                          <p className="text-sm font-semibold text-base-content">
                            {o.job_title}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-sm text-success font-medium">
                            <IndianRupee size={13} />
                            {salary(o.salary_min, o.salary_max)}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-sm text-base-content/70">
                            <Users size={13} />
                            {o.number_of_posts ?? "—"}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-base-content/70">
                          {fmt(o.offer_date)}
                        </td>
                        <td className="px-4 py-3 text-sm text-base-content/70">
                          {fmt(o.last_date)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => setViewOffer(o)}
                            className="w-8 h-8 rounded-lg border border-success/30 bg-success/10 hover:bg-success/20 text-success flex items-center justify-center transition-all mx-auto"
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
                page={accPag.page}
                totalPages={accPag.totalPages}
                total={accPag.total}
                onPage={accPag.setPage}
                label="accepted offers"
              />
            </>
          )}
        </div>
      )}

      {/* ── Offer Detail Modal ─────────────────────────────────────────────── */}
      {viewOffer && (
        <Modal title="Offer Details" onClose={() => setViewOffer(null)}>
          <DetailRow
            label="Institute"
            value={viewOffer.institute?.address ?? "—"}
          />
          <DetailRow
            label="District"
            value={viewOffer.institute?.district?.districtname ?? "—"}
          />
          <DetailRow label="Job Title" value={viewOffer.job_title} />
          {viewOffer.job_description && (
            <DetailRow label="Description" value={viewOffer.job_description} />
          )}
          <DetailRow
            label="Salary Range"
            value={salary(viewOffer.salary_min, viewOffer.salary_max)}
          />
          <DetailRow
            label="Number of Posts"
            value={viewOffer.number_of_posts?.toString() ?? "—"}
          />
          <DetailRow label="Offer Date" value={fmt(viewOffer.offer_date)} />
          <DetailRow label="Last Date" value={fmt(viewOffer.last_date)} />
          <div>
            <p className="text-xs text-base-content/60 mb-1">Status</p>
            <StatusBadge status={viewOffer.status} />
          </div>
        </Modal>
      )}

      {/* ── Request Detail Modal ───────────────────────────────────────────── */}
      {viewReq && (
        <Modal title="Request Details" onClose={() => setViewReq(null)}>
          <DetailRow
            label="Institute"
            value={
              viewReq.institute?.institute_name ?? viewReq.institute_name ?? "—"
            }
          />
          <DetailRow
            label="District"
            value={viewReq.institute?.district ?? viewReq.district ?? "—"}
          />
          <DetailRow
            label="Request Type"
            value={
              viewReq.requestType?.request_type_name ?? viewReq.job_title ?? "—"
            }
          />
          <DetailRow label="Request Date" value={fmt(viewReq.request_date)} />
          <DetailRow label="Expiry Date" value={fmt(viewReq.expiry_date)} />
          <DetailRow
            label="Vacancies"
            value={viewReq.vacancies?.toString() ?? "—"}
          />
          {viewReq.remarks && (
            <DetailRow label="Remarks" value={viewReq.remarks} />
          )}
          <div>
            <p className="text-xs text-base-content/60 mb-1">Status</p>
            <StatusBadge
              status={
                viewReq.requestStatus?.status_name ??
                viewReq.status ??
                "Pending"
              }
            />
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
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
      <div className="bg-base-100 dark:bg-base-900 rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto border border-base-300 dark:border-base-700 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-base-content">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-base-200 dark:bg-base-800 flex items-center justify-center hover:bg-error/10 hover:text-error transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="space-y-4">{children}</div>
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
