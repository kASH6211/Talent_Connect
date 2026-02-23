"use client";

import Pagination from "rc-pagination";
import "rc-pagination/assets/index.css";

interface AppPaginationProps {
    currentPage: number;
    total: number; // total records
    pageSize: number;
    onPageChange: (page: number, pageSize: number) => void;
    onPageSizeChange?: (size: number) => void;
    showSizeChanger?: boolean;
    pageSizeOptions?: number[];
}

export default function AppPagination({
    currentPage,
    total,
    pageSize,
    onPageChange,
    onPageSizeChange,
    showSizeChanger = true,
    pageSizeOptions = [5, 10, 20, 50],
}: AppPaginationProps) {
    return (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-6">

            {/* Page Size Selector */}
            {showSizeChanger && onPageSizeChange && (
                <div className="flex items-center gap-2">
                    <span className="text-sm w-[250px]">Rows per page:</span>
                    <select
                        className="select select-sm select-bordered"
                        value={pageSize}
                        onChange={(e) => onPageSizeChange(Number(e.target.value))}
                    >
                        {pageSizeOptions.map((size) => (
                            <option key={size} value={size}>
                                {size}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* rc-pagination */}
            <div className="daisy-pagination">
                <Pagination
                    current={currentPage}
                    total={total}
                    pageSize={pageSize}
                    onChange={onPageChange}
                    showLessItems
                    showTitle={false}
                />
            </div>
        </div>
    );
}
