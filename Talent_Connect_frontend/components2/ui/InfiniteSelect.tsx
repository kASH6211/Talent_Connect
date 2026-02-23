"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";

interface InfiniteSelectProps<T> {
  data: T[];
  labelField: keyof T;
  valueField: keyof T;
  placeholder?: string;
  onChange: (value: T | T[]) => void;
  pageSize?: number;
  mode?: "single" | "multiple";
  value?: T | T[] | null;
}

export default function InfiniteSelect<T>({
  data,
  labelField,
  valueField,
  placeholder = "Select option",
  onChange,
  pageSize = 20,
  mode = "single",
  value,
}: InfiniteSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const [visibleItems, setVisibleItems] = useState(pageSize);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  /* ---------------- Filter ---------------- */
  const filteredData = data.filter((item) =>
    String(item[labelField]).toLowerCase().includes(search.toLowerCase())
  );

  const displayedItems = filteredData.slice(0, visibleItems);

  /* ---------------- Selected Check ---------------- */
  const isSelected = (item: T) => {
    if (mode === "single") {
      return value && (value as T)[valueField] === item[valueField];
    } else {
      return (
        Array.isArray(value) &&
        value.some((v) => v[valueField] === item[valueField])
      );
    }
  };

  /* ---------------- Select Handler ---------------- */
  const handleSelect = (item: T) => {
    if (mode === "single") {
      onChange(item);
      setOpen(false);
    } else {
      let updated: T[] = Array.isArray(value) ? [...value] : [];

      if (isSelected(item)) {
        updated = updated.filter(
          (v) => v[valueField] !== item[valueField]
        );
      } else {
        updated.push(item);
      }

      onChange(updated);
    }
  };

  /* ---------------- Infinite Scroll ---------------- */
  const handleScroll = () => {
    if (!dropdownRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } =
      dropdownRef.current;

    if (scrollTop + clientHeight >= scrollHeight - 10) {
      setVisibleItems((prev) => prev + pageSize);
    }
  };

  /* ---------------- Reset on Search ---------------- */
  useEffect(() => {
    setVisibleItems(pageSize);
  }, [search, pageSize]);

  /* ---------------- Close on Outside Click ---------------- */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      {/* ---------------- Trigger ---------------- */}
      <div
        onClick={() => setOpen((prev) => !prev)}
        className="min-h-[44px] w-full border border-base-300 rounded-lg px-3 py-2 
        flex flex-wrap items-center gap-2 cursor-pointer
        bg-base-100 hover:border-primary transition-colors"
      >
        {mode === "multiple" && Array.isArray(value) && value.length > 0 ? (
          value.map((v, i) => (
            <span
              key={i}
              className="badge badge-primary badge-sm gap-1"
            >
              {String(v[labelField])}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const updated = (value as T[]).filter(
                    (item) => item[valueField] !== v[valueField]
                  );
                  onChange(updated);
                }}
                className="hover:text-error"
              >
                <X size={12} />
              </button>
            </span>
          ))
        ) : mode === "single" && value ? (
          String((value as T)[labelField])
        ) : (
          <span className="text-base-content/50">
            {placeholder}
          </span>
        )}

        <ChevronDown
          size={16}
          className={`ml-auto transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </div>

      {/* ---------------- Dropdown ---------------- */}
      {open && (
        <div
          className="absolute z-[9999] mt-2 w-full bg-base-100 
          border border-base-300 rounded-xl shadow-xl"
        >
          {/* Search */}
          <div className="p-3 border-b border-base-200">
            <label className="input input-sm input-bordered flex items-center gap-2 bg-base-100">
              <Search size={14} className="opacity-60" />
              <input
                type="text"
                className="grow bg-base-100 text-base-content"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
          </div>

          {/* List */}
          <div
            ref={dropdownRef}
            onScroll={handleScroll}
            className="max-h-60 overflow-y-auto"
          >
            {displayedItems.length === 0 ? (
              <div className="p-4 text-sm text-base-content/60 text-center">
                No results found
              </div>
            ) : (
              displayedItems.map((item, index) => (
                <div
                  key={index}
                  onClick={() => handleSelect(item)}
                  className={`px-4 py-2 cursor-pointer transition-colors flex justify-between items-center
                  ${
                    isSelected(item)
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-base-200"
                  }`}
                >
                  {String(item[labelField])}

                  {isSelected(item) && (
                    <span className="text-xs">✓</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
