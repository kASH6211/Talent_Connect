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
  const [page, setPage] = useState(1);
  const limit = 10;
  const isMobile = useIsMobile();

  const { data, isLoading, isFetching, isError, refetch } = useQuery<any>({
    queryKey: [queryKey, page],
    queryFn: async () => {
      const params = pagination ? { page, limit } : {};
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
  const totalCount = pagination ? data?.total || 0 : rows.length;
  const totalPages = Math.ceil(totalCount / limit);

  const filtered = search
    ? rows.filter((r) =>
        columns.some((c) =>
          String(r[c.key] ?? "")
            .toLowerCase()
            .includes(search.toLowerCase()),
        ),
      )
    : rows;

  // ── Single row card for mobile ──
  const RowCard = ({ row }: { row: any }) => {
    const [expanded, setExpanded] = useState(false);

    return (
      <div className="card bg-base-100 shadow-sm border border-base-200 rounded-xl overflow-hidden">
        {/* Header / Summary */}
        <div
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-base-200/50"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex-1 min-w-0">
            <div className="font-medium text-base-content truncate">
              {row[columns[1]?.key] || row[primaryKey] || "—"}
            </div>
            <div className="text-sm text-base-content/60">
              ID: {row[primaryKey]} •{" "}
              {row.is_active === "Y" ? "Active" : "Inactive"}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(row);
              }}
              className="btn btn-ghost btn-xs btn-circle"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm("Deactivate this record?"))
                  deleteMutation.mutate(row[primaryKey]);
              }}
              className="btn btn-ghost btn-xs btn-circle text-error"
            >
              <Trash2 size={14} />
            </button>
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>

        {/* Expanded details */}
        {expanded && (
          <div className="p-4 pt-0 border-t border-base-200 bg-base-200/30">
            <div className="grid grid-cols-1 gap-3 text-sm">
              {columns.map((col) => {
                if (col.key === primaryKey || col.key === columns[1]?.key)
                  return null;
                const value = col.render
                  ? col.render(row[col.key], row)
                  : (row[col.key] ?? "—");
                return (
                  <div key={col.key} className="flex justify-between">
                    <span className="text-base-content/70">{col.label}:</span>
                    <span className="font-medium text-right">{value}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* Background-refetch indicator */}
      {isFetching && !isLoading && (
        <div className="h-0.5 w-full bg-base-300 rounded overflow-hidden">
          <div
            className="h-full bg-primary animate-pulse"
            style={{ width: "60%" }}
          />
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          {icon && <div className="text-primary">{icon}</div>}
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
            {totalCount !== undefined && (
              <p className="text-gray-500 text-sm mt-0.5">
                {totalCount} records total
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => refetch()}
            className="btn btn-ghost btn-sm btn-square"
            title="Refresh"
          >
            <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} />
          </button>
          {extraActions}
          <button onClick={onAdd} className="btn btn-primary btn-sm gap-2">
            <Plus size={16} /> Add New
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/30"
        />
        <input
          className="input input-bordered w-full pl-9 rounded-xl text-sm"
          placeholder={`Search ${title.toLowerCase()}…`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Main Content */}
      <div className="bg-base-200 border border-base-300 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-base-content/40">
            <span className="loading loading-spinner loading-md mr-2" />{" "}
            Loading…
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center py-20 text-error gap-2">
            <AlertCircle size={20} /> Failed to load. Is the API running?
          </div>
        ) : (
          <>
            {/* Mobile: Card view */}
            {isMobile ? (
              <div className="space-y-4 p-4">
                {filtered.length === 0 ? (
                  <div className="text-center py-12 text-base-content/30">
                    No records found
                  </div>
                ) : (
                  filtered.map((row, i) => (
                    <RowCard key={row[primaryKey] ?? i} row={row} />
                  ))
                )}
              </div>
            ) : (
              /* Desktop: Table view */
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full text-sm">
                  <thead className="text-xs uppercase tracking-wider">
                    <tr>
                      {columns.map((c) => (
                        <th key={c.key}>{c.label}</th>
                      ))}
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td
                          colSpan={columns.length + 1}
                          className="text-center py-12 text-base-content/30"
                        >
                          No records found
                        </td>
                      </tr>
                    ) : (
                      filtered.map((row, i) => (
                        <tr key={row[primaryKey] ?? i} className="group hover">
                          {columns.map((c) => (
                            <td key={c.key} className="text-base-content/80">
                              {c.render ? (
                                c.render(row[c.key], row)
                              ) : c.key === "is_active" ? (
                                <span
                                  className={clsx(
                                    "badge badge-sm font-medium px-3 py-1.5 text-xs shadow-sm",
                                    row[c.key] === "Y"
                                      ? "bg-green-100 text-green-800 border border-green-300"
                                      : "bg-red-100 text-red-800 border border-red-300",
                                  )}
                                >
                                  {row[c.key] === "Y" ? "Active" : "Inactive"}
                                </span>
                              ) : (
                                <span className="truncate max-w-[250px] block">
                                  {String(row[c.key] ?? "—")}
                                </span>
                              )}
                            </td>
                          ))}
                          <td className="text-right">
                            <div className="flex items-center justify-end gap-2 transition-opacity">
                              <button
                                onClick={() => onEdit(row)}
                                className="btn btn-ghost btn-xs btn-square hover:btn-primary"
                                title="Edit"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm("Deactivate this record?"))
                                    deleteMutation.mutate(row[primaryKey]);
                                }}
                                className="btn btn-ghost btn-xs btn-square hover:btn-error"
                                title="Delete"
                              >
                                <Trash2 size={14} />
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

            {/* Pagination (only if enabled) */}
            {pagination && totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-base-300 bg-base-300/30">
                <div className="text-xs text-base-content/40">
                  Page {page} of {totalPages}
                </div>
                <div className="join">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="join-item btn btn-sm"
                  >
                    «
                  </button>
                  <button className="join-item btn btn-sm btn-active">
                    {page}
                  </button>
                  <button
                    onClick={() =>
                      setPage((p) => (totalPages && p < totalPages ? p + 1 : p))
                    }
                    disabled={page >= totalPages}
                    className="join-item btn btn-sm"
                  >
                    »
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
