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
} from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import clsx from "clsx";

// ─── Types ───────────────────────────────────────────────────────────────────
interface RequestRow {
  request_id: number;
  institute_name: string;
  district: string;
  request_date: string;
  status: "Pending" | "Accepted" | "Rejected";
  job_title?: string;
  message?: string;
}

const EMPTY_FILTERS = {
  status: "All" as "All" | "Pending" | "Accepted" | "Rejected",
};

// ─── Main Component ──────────────────────────────────────────────────────────
export default function AllRequestsPage() {
  const { user, isIndustry } = useAuth();

  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [viewRequest, setViewRequest] = useState<RequestRow | null>(null);

  // Fetch all requests for the industry
  const fetchRequests = useCallback(async () => {
    if (!isIndustry) return;

    setLoading(true);
    setError("");
    try {
      const res = await api.get("/industry-requests/all"); // ← adjust endpoint
      setRequests(res.data ?? []);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load requests");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [isIndustry]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Filter + Search + Pagination logic
  const filteredRequests = requests.filter((req) => {
    const matchesStatus =
      filters.status === "All" || req.status === filters.status;
    const matchesSearch =
      req.institute_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.district?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.job_title?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalItems = filteredRequests.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRequests = filteredRequests.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const resetFilters = () => {
    setFilters(EMPTY_FILTERS);
    setSearchTerm("");
    setCurrentPage(1);
  };

  // ─── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div className="w-full mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
            <Briefcase
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
              View and manage all placement requests sent to your industry
            </p>
          </div>
        </div>

        {/* Summary badges */}
        {searched && !loading && requests.length > 0 && (
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-base-200 dark:bg-base-800 border border-base-300 dark:border-base-700 text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-base-content/50">
                Total
              </p>
              <p className="text-xl font-black text-primary leading-tight">
                {requests.length}
              </p>
            </div>
            <div className="px-4 py-2 rounded-xl bg-success/10 border border-success/25 text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-success/70">
                Accepted
              </p>
              <p className="text-xl font-black text-success leading-tight">
                {requests.filter((r) => r.status === "Accepted").length}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Filters Card */}
      <div className="rounded-2xl bg-base-100 dark:bg-base-900 border border-base-300 dark:border-base-700 shadow-sm p-5 sm:p-6 mb-8">
        <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-base-200 dark:border-base-800">
          <Filter size={18} className="text-primary" />
          <h2 className="text-base font-bold text-base-content">Filters</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          {/* Status Filter */}
          <div>
            <label className="block text-xs font-semibold text-base-content/70 mb-1.5 ml-1 tracking-wide uppercase">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => {
                setFilters({ ...filters, status: e.target.value as any });
                setCurrentPage(1);
              }}
              className="w-full bg-base-200 dark:bg-base-800 border border-base-300 dark:border-base-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="All">All Requests</option>
              <option value="Pending">Pending</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Search Input */}
          <div className="lg:col-span-3">
            <label className="block text-xs font-semibold text-base-content/70 mb-1.5 ml-1 tracking-wide uppercase">
              Search
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by institute, district, job title..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-base-200 dark:bg-base-800 border border-base-300 dark:border-base-700 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 pointer-events-none"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={resetFilters}
            className="btn btn-outline flex-1 sm:flex-none text-sm px-6"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {/* Controls bar */}
        {!loading && requests.length > 0 && (
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-base-100 dark:bg-base-900 border border-base-300 dark:border-base-700 rounded-xl px-4 py-3 shadow-sm">
            <p className="text-sm font-semibold text-base-content">
              {requests.length} request{requests.length !== 1 ? "s" : ""} found
            </p>

            <div className="flex items-center gap-3">
              <span className="text-xs text-base-content/60">
                Page {currentPage} of {totalPages}
              </span>
            </div>
          </div>
        )}

        {/* Table / States */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-base-content/50">
            <Loader2 size={32} className="animate-spin text-primary" />
            <p className="text-sm">Loading requests…</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 rounded-2xl border-2 border-dashed border-base-300 dark:border-base-700 bg-base-100 dark:bg-base-900 gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Briefcase size={24} className="text-primary" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-base-content">
                No requests found
              </p>
              <p className="text-sm text-base-content/50 mt-1">
                You haven't received any placement requests yet
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-xl border border-base-300 dark:border-base-700 bg-base-100 dark:bg-base-900 shadow-sm">
              <table className="min-w-full divide-y divide-base-200 dark:divide-base-800">
                <thead>
                  <tr className="bg-base-200/60 dark:bg-base-800/60">
                    <th className="px-4 py-3 text-left text-xs font-bold text-base-content/60 uppercase tracking-wider">
                      Institute
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-base-content/60 uppercase tracking-wider">
                      District
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-base-content/60 uppercase tracking-wider">
                      Job Title
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-base-content/60 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-base-content/60 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-base-content/60 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-base-200 dark:divide-base-800">
                  {paginatedRequests.map((req) => (
                    <tr
                      key={req.request_id}
                      className="hover:bg-base-200/50 dark:hover:bg-base-800/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Building2 size={16} className="text-primary/70" />
                          <span className="text-sm font-medium text-base-content">
                            {req.institute_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-base-content/70">
                        {req.district || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-base-content/70">
                        {req.job_title || "General Placement"}
                      </td>
                      <td className="px-4 py-3 text-sm text-base-content/70">
                        {new Date(req.request_date).toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={clsx(
                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium",
                            req.status === "Accepted" &&
                              "bg-success/10 text-success",
                            req.status === "Rejected" &&
                              "bg-error/10 text-error",
                            req.status === "Pending" &&
                              "bg-warning/10 text-warning",
                          )}
                        >
                          {req.status === "Accepted" && (
                            <CheckCircle2 size={14} />
                          )}
                          {req.status === "Rejected" && <XCircle size={14} />}
                          {req.status === "Pending" && <Clock size={14} />}
                          {req.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setViewRequest(req)}
                          title="View Request Details"
                          className="w-8 h-8 rounded-lg border border-base-300 dark:border-base-700 bg-base-200 dark:bg-base-800 hover:border-primary hover:text-primary flex items-center justify-center transition-all mx-auto"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between bg-base-100 dark:bg-base-900 border border-base-300 dark:border-base-700 rounded-xl px-4 py-3 shadow-sm">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="btn btn-outline btn-sm gap-1.5 text-xs disabled:opacity-40"
                >
                  <ChevronLeft size={14} /> Previous
                </button>

                <span className="text-xs text-base-content/60 font-medium">
                  Page {currentPage} of {totalPages} • {totalItems} requests
                </span>

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="btn btn-outline btn-sm gap-1.5 text-xs disabled:opacity-40"
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* View Request Modal (placeholder – customize as needed) */}
      {viewRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-base-100 dark:bg-base-900 rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto border border-base-300 dark:border-base-700 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-base-content">
                Request Details
              </h2>
              <button onClick={() => setViewRequest(null)}>
                <X
                  size={24}
                  className="text-base-content/60 hover:text-error"
                />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-base-content/60">Institute</p>
                <p className="font-medium">{viewRequest.institute_name}</p>
              </div>
              <div>
                <p className="text-xs text-base-content/60">District</p>
                <p className="font-medium">{viewRequest.district || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-base-content/60">Job Title</p>
                <p className="font-medium">
                  {viewRequest.job_title || "General Placement"}
                </p>
              </div>
              <div>
                <p className="text-xs text-base-content/60">Status</p>
                <span
                  className={clsx(
                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium",
                    viewRequest.status === "Accepted" &&
                      "bg-success/10 text-success",
                    viewRequest.status === "Rejected" &&
                      "bg-error/10 text-error",
                    viewRequest.status === "Pending" &&
                      "bg-warning/10 text-warning",
                  )}
                >
                  {viewRequest.status}
                </span>
              </div>
              {viewRequest.message && (
                <div>
                  <p className="text-xs text-base-content/60">Message</p>
                  <p className="text-sm text-base-content/80 mt-1">
                    {viewRequest.message}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
