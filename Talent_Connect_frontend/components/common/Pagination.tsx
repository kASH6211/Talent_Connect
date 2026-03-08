"use client";

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useMemo } from "react";

interface PaginationProps {
    total: number;
    page: number;
    limit: number;
    onPageChange: (page: number) => void;
    onLimitChange?: (limit: number) => void;
    pageSizeOptions?: number[];
    className?: string;
}

export default function Pagination({
    total,
    page,
    limit,
    onPageChange,
    onLimitChange,
    pageSizeOptions = [10, 20, 25, 50, 100],
    className = "",
}: PaginationProps) {
    const totalPages = Math.ceil(total / limit);

    const pages = useMemo(() => {
        const items: (number | string)[] = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) items.push(i);
        } else {
            if (page <= 3) {
                items.push(1, 2, 3, 4, "...", totalPages);
            } else if (page >= totalPages - 2) {
                items.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                items.push(1, "...", page - 1, page, page + 1, "...", totalPages);
            }
        }
        return items;
    }, [page, totalPages]);

    if (total === 0) return null;

    return (
        <div className={`flex flex-col sm:flex-row items-center justify-between gap-6 py-8 ${className}`}>
            {/* Records per page selector */}
            {onLimitChange && (
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        Rows per page
                    </span>
                    <div className="relative group">
                        <select
                            value={limit}
                            onChange={(e) => onLimitChange(Number(e.target.value))}
                            className="appearance-none bg-white/40 backdrop-blur-md border border-slate-200/50 text-slate-700 text-xs font-bold px-4 py-2 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 hover:border-slate-300 transition-all cursor-pointer shadow-sm"
                        >
                            {pageSizeOptions.map((opt) => (
                                <option key={opt} value={opt}>
                                    {opt === 5000 ? "All" : opt}
                                </option>
                            ))}
                            {!pageSizeOptions.includes(5000) && (
                                <option value={5000}>All</option>
                            )}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-slate-600 transition-colors">
                            <ChevronLeft className="-rotate-90" size={12} />
                        </div>
                    </div>
                </div>
            )}

            {/* Pagination Controls */}
            <div className="flex items-center gap-2">
                {/* First/Previous */}
                <div className="flex items-center gap-1 mr-2">
                    <button
                        onClick={() => onPageChange(1)}
                        disabled={page === 1}
                        className="p-2 text-slate-400 hover:text-primary disabled:opacity-30 disabled:hover:text-slate-400 transition-colors rounded-lg hover:bg-slate-100/50"
                        title="First Page"
                    >
                        <ChevronsLeft size={18} />
                    </button>
                    <button
                        onClick={() => onPageChange(page - 1)}
                        disabled={page === 1}
                        className="p-2 text-slate-400 hover:text-primary disabled:opacity-30 disabled:hover:text-slate-400 transition-colors rounded-lg hover:bg-slate-100/50"
                        title="Previous Page"
                    >
                        <ChevronLeft size={18} />
                    </button>
                </div>

                {/* Page Numbers */}
                <div className="flex items-center gap-1.5">
                    {pages.map((p, i) => (
                        <button
                            key={i}
                            onClick={() => typeof p === "number" && onPageChange(p)}
                            disabled={p === page || typeof p === "string"}
                            className={`
                min-w-[40px] h-[40px] flex items-center justify-center rounded-xl text-xs font-bold transition-all
                ${p === page
                                    ? "bg-primary text-white shadow-lg shadow-primary/20 scale-110 z-10"
                                    : p === "..."
                                        ? "text-slate-300 cursor-default"
                                        : "text-slate-600 hover:bg-white hover:text-primary hover:shadow-md active:scale-95"
                                }
              `}
                        >
                            {p}
                        </button>
                    ))}
                </div>

                {/* Next/Last */}
                <div className="flex items-center gap-1 ml-2">
                    <button
                        onClick={() => onPageChange(page + 1)}
                        disabled={page === totalPages}
                        className="p-2 text-slate-400 hover:text-primary disabled:opacity-30 disabled:hover:text-slate-400 transition-colors rounded-lg hover:bg-slate-100/50"
                        title="Next Page"
                    >
                        <ChevronRight size={18} />
                    </button>
                    <button
                        onClick={() => onPageChange(totalPages)}
                        disabled={page === totalPages}
                        className="p-2 text-slate-400 hover:text-primary disabled:opacity-30 disabled:hover:text-slate-400 transition-colors rounded-lg hover:bg-slate-100/50"
                        title="Last Page"
                    >
                        <ChevronsRight size={18} />
                    </button>
                </div>
            </div>

            {/* Results Summary */}
            <div className="hidden lg:block">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Showing <span className="text-slate-700">{Math.min((page - 1) * limit + 1, total)}</span> to{" "}
                    <span className="text-slate-700">{Math.min(page * limit, total)}</span> of{" "}
                    <span className="text-slate-700">{total}</span> records
                </p>
            </div>
        </div>
    );
}
