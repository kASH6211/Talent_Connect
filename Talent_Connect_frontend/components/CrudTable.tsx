"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAll, deleteOne } from "@/lib/api";
import api from "@/lib/api";
import {
  Pencil,
  Trash2,
  Plus,
  Search,
  RefreshCw,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import clsx from "clsx";
import SpinnerFallback from "./Spinner";
import { openConfirm } from "@/store/common/confirmSlice";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";

// ── Detect mobile reliably (SSR-safe)
function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const check = () => setIsMobile(window.innerWidth < 1024);
    check();

    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return isMobile;
}

export interface ColumnDef {
  key: string;
  label: string;
  render?: (val: any, row: any) => React.ReactNode;
}

interface CrudTableProps {
  title: string;
  icon?: any;
  apiPath: string;
  queryKey: string;
  columns: ColumnDef[];
  primaryKey: string;
  onAdd: () => void;
  onEdit: (row: any) => void;
  pagination?: boolean;
  extraActions?: React.ReactNode;
}

export default function CrudTable({
  title,
  icon,
  apiPath,
  queryKey,
  columns,
  primaryKey,
  onAdd,
  onEdit,
  pagination = true,
  extraActions,
}: CrudTableProps) {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;
  const isMobile = useIsMobile();
  const dispatch = useDispatch<AppDispatch>();

  // Debounce search input (300ms) and reset page on new search
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Go back to page 1 when search changes
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading, isFetching, isError, refetch } = useQuery<any>({
    queryKey: [queryKey, page, debouncedSearch],
    queryFn: async () => {
      const params: any = pagination ? { page, limit } : {};
      if (debouncedSearch) params.search = debouncedSearch;
      const res = await api.get(apiPath, { params });
      return res.data;
    },
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    placeholderData: (prev: any) => prev,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteOne(apiPath, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [queryKey] }),
  });

  const rows: any[] = Array.isArray(data) ? data : data?.data || [];
  const totalCount =
    pagination && !Array.isArray(data) ? data?.total || 0 : rows.length;
  const totalPages = Math.ceil(totalCount / limit);

  // When server-side search is active, use rows as-is (already filtered by backend)
  // When no pagination or plain array, do client-side filter as fallback
  const filtered = (!pagination || Array.isArray(data)) && debouncedSearch
    ? rows.filter((r) =>
      columns.some((c) =>
        String(r[c.key] ?? "")
          .toLowerCase()
          .includes(debouncedSearch.toLowerCase()),
      ),
    )
    : rows;

  // ── Single row card for mobile ──
  const RowCard = ({ row }: { row: any }) => {
    const [expanded, setExpanded] = useState(false);

    return (
      <div className="card bg-base-100 shadow-sm border border-base-200/70 rounded-2xl overflow-hidden transition-all duration-200 hover:shadow">
        {/* Header / Summary */}
        <div
          className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-base-200/40 active:bg-base-200/60 transition-colors"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex-1 min-w-0 pr-4">
            <div className="font-semibold text-base-content leading-tight truncate">
              {row[columns[1]?.key] || row[primaryKey] || "—"}
            </div>
            <div className="text-xs text-base-content/60 mt-0.5 flex items-center gap-1.5">
              <span>ID: {row[primaryKey]}</span>
              <span>•</span>
              {row.is_active === "Y" ? (
                <span className="text-green-700 font-medium">Active</span>
              ) : (
                <span className="text-red-700 font-medium">Inactive</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(row);
              }}
              className="btn btn-ghost btn-sm btn-circle hover:bg-primary/10 hover:text-primary"
            >
              <Pencil size={15} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm("Deactivate this record?"))
                  deleteMutation.mutate(row[primaryKey]);
              }}
              className="btn btn-ghost btn-sm btn-circle hover:bg-error/10 hover:text-error"
            >
              <Trash2 size={15} />
            </button>
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </div>

        {/* Expanded details */}
        {expanded && (
          <div className="px-5 pb-5 pt-1 border-t border-base-200/70 bg-base-200/20">
            <div className="grid grid-cols-1 gap-3.5 text-sm">
              {columns.map((col) => {
                if (col.key === primaryKey || col.key === columns[1]?.key)
                  return null;
                const value = col.render
                  ? col.render(row[col.key], row)
                  : (row[col.key] ?? "—");
                return (
                  <div
                    key={col.key}
                    className="flex justify-between items-baseline gap-3"
                  >
                    <span className="text-base-content/70 font-medium">
                      {col.label}
                    </span>
                    <span className="font-medium text-right text-base-content break-words">
                      {value}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  const handleDelete = (row: any) => {
    dispatch(
      openConfirm({
        message: "Are you sure you want to delete this record?",
        onConfirm: () => {
          deleteMutation.mutate(row[primaryKey]);
        },
      }),
    );
  };

  return (
    <div className="space-y-6">
      {/* Background-refetch indicator */}
      {isFetching && !isLoading && (
        // <div className="h-0.5 w-full bg-base-300 rounded-full overflow-hidden">
        //   <div
        //     className="h-full bg-primary animate-pulse"
        //     style={{ width: "indeterminate" }}
        //   />
        // </div>
        <SpinnerFallback />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
        <div className="flex items-center gap-4">
          {icon && <div className="text-primary opacity-90">{icon}</div>}
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-base-content">
              {title}
            </h2>
            {totalCount !== undefined && (
              <p className="text-sm text-base-content/60 mt-0.5 font-medium">
                {totalCount.toLocaleString()} records
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => refetch()}
            className="btn btn-ghost btn-sm btn-circle hover:bg-base-200"
            title="Refresh table"
          >
            <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} />
          </button>
          {extraActions}
          <button
            onClick={onAdd}
            className="btn btn-primary btn-sm gap-2 shadow-sm"
          >
            <Plus size={16} /> Add New
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40 pointer-events-none"
        />
        <input
          className="input input-bordered w-full pl-10 pr-4 rounded-xl text-sm shadow-sm focus:ring-1 focus:ring-primary/40 transition-all"
          placeholder={`Search ${title.toLowerCase()}…`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Main Content */}
      <div className="bg-base-100 border border-base-200/70 rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          // <div className="flex items-center justify-center py-24 text-base-content/40 gap-3">
          //   <span className="loading loading-spinner loading-lg" />
          //   <span className="text-sm font-medium">Loading records...</span>
          // </div>
          <SpinnerFallback />
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20 text-error gap-3">
            <AlertCircle size={28} />
            <span className="text-sm font-medium">Failed to load data</span>
            <button
              onClick={() => refetch()}
              className="btn btn-outline btn-sm mt-2"
            >
              Try again
            </button>
          </div>
        ) : (
          <>
            {/* Mobile: Card view */}
            {isMobile ? (
              <div className="divide-y divide-base-200/60">
                {filtered.length === 0 ? (
                  <div className="text-center py-16 text-base-content/40 text-sm font-medium">
                    No records found
                  </div>
                ) : (
                  filtered.map((row, i) => (
                    <RowCard key={row[primaryKey] ?? i} row={row} />
                  ))
                )}
              </div>
            ) : (
              /* Desktop: Table view – improved styling */
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full text-sm">
                  <thead>
                    <tr className="bg-base-200/60 border-b border-base-200">
                      {columns.map((c) => (
                        <th
                          key={c.key}
                          className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-base-content/70"
                        >
                          {c.label}
                        </th>
                      ))}
                      <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-base-content/70">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-base-200/50">
                    {filtered.length === 0 ? (
                      <tr>
                        <td
                          colSpan={columns.length + 1}
                          className="text-center py-16 text-base-content/50 text-sm font-medium"
                        >
                          No records found
                        </td>
                      </tr>
                    ) : (
                      filtered.map((row, i) => (
                        <tr
                          key={row[primaryKey] ?? i}
                          className="group hover:bg-base-100/70 transition-colors duration-150"
                        >
                          {columns.map((c) => (
                            <td
                              key={c.key}
                              className="px-5 py-3.5 whitespace-nowrap text-base-content/90"
                            >
                              {c.render ? (
                                c.render(row[c.key], row)
                              ) : c.key === "is_active" ? (
                                <span
                                  className={clsx(
                                    "inline-flex items-center px-3 py-1 text-xs font-medium tracking-tight rounded-xl min-w-[72px] h-6 justify-center",
                                    row[c.key] === "Y"
                                      ? "bg-green-100/70 text-green-800"
                                      : "bg-red-100/70 text-red-800",
                                  )}
                                >
                                  {row[c.key] === "Y" ? "Active" : "Inactive"}
                                </span>
                              ) : (
                                <span className="truncate max-w-[280px] inline-block align-middle">
                                  {String(row[c.key] ?? "—")}
                                </span>
                              )}
                            </td>
                          ))}
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => onEdit(row)}
                                className={clsx(
                                  "relative inline-flex items-center justify-center w-8 h-8 rounded-lg",
                                  "text-base-content/70 hover:text-primary hover:bg-primary/8",
                                  "transition-all duration-200 active:scale-95",
                                )}
                                title="Edit"
                              >
                                <Pencil size={16} strokeWidth={2.3} />
                              </button>

                              <button
                                onClick={() => {
                                  handleDelete(row);
                                }}
                                className={clsx(
                                  "relative inline-flex items-center justify-center w-8 h-8 rounded-lg",
                                  "text-base-content/70 hover:text-error hover:bg-error/8",
                                  "transition-all duration-200 active:scale-95",
                                )}
                                title="Deactivate"
                              >
                                <Trash2 size={16} strokeWidth={2.3} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {pagination && totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-3.5 border-t border-base-200 bg-base-200/40 text-sm">
                <div className="text-base-content/60 font-medium">
                  Page <strong>{page}</strong> of {totalPages}
                </div>
                <div className="join rounded-lg overflow-hidden shadow-sm">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="join-item btn btn-sm border-base-300 bg-base-100 hover:bg-base-200 disabled:opacity-50"
                  >
                    « Prev
                  </button>
                  <button className="join-item btn btn-sm border-base-300 bg-primary/10 text-primary font-semibold pointer-events-none">
                    {page}
                  </button>
                  <button
                    onClick={() =>
                      setPage((p) => (totalPages && p < totalPages ? p + 1 : p))
                    }
                    disabled={page >= totalPages}
                    className="join-item btn btn-sm border-base-300 bg-base-100 hover:bg-base-200 disabled:opacity-50"
                  >
                    Next »
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
