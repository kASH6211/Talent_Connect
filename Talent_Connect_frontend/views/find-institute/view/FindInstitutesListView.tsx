"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Send,
  CheckSquare,
  Square,
  Loader2,
  X,
  Filter,
  MapPin,
  Users,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Building2,
  Mail,
} from "lucide-react";
import api from "@/lib/api";
import MultiSelectDropdown, { Option } from "@/components/MultiSelectDropdown";
import { useAuth } from "@/hooks/useAuth";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { setCurrentOffer, updateUiInstitute } from "@/store/institute";
import { OfferModalV2 } from "./OfferModalView";
import clsx from "clsx";
import { InstituteViewModal } from "../list/InstituteViewModal";

// ─── Types & Interfaces (UNCHANGED) ──────────────────────────────────────────
interface InstituteRow {
  institute_id: number;
  institute_name: string;
  district: string;
  type: string;
  ownership: string;
  email: string;
  mobileno: string;
  student_count: number;
  contactperson: string;
  po_mobile: string;
  po_email: string;
}

interface Filters {
  state_ids: number[];
  district_ids: number[];
  type_ids: number[];
  ownership_ids: number[];
  qualification_ids: number[];
  stream_ids: number[];
}

const EMPTY_FILTERS: Filters = {
  state_ids: [3],
  district_ids: [],
  type_ids: [],
  ownership_ids: [],
  qualification_ids: [],
  stream_ids: [],
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function FindInstitutesPage() {
  const findInstituteUi = useSelector(
    (state: RootState) => state?.institutes?.ui,
  );
  const { user, isIndustry } = useAuth();
  const dispatch = useDispatch<AppDispatch>();

  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);

  const [institutes, setInstitutes] = useState<InstituteRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const [stateOpts, setStateOpts] = useState<Option[]>([]);
  const [districtOpts, setDistrictOpts] = useState<Option[]>([]);
  const [typeOpts, setTypeOpts] = useState<Option[]>([]);
  const [ownershipOpts, setOwnershipOpts] = useState<Option[]>([]);
  const [qualOpts, setQualOpts] = useState<Option[]>([]);
  const [streamOpts, setStreamOpts] = useState<Option[]>([]);

  const [sentSuccess, setSentSuccess] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [viewInstitute, setViewInstitute] = useState<boolean>(false);
  const [currentInstitute, setCurrentInstitute] = useState<InstituteRow | null>(
    null,
  );

  //table right side fitler
  const [searchTerm, setSearchTerm] = useState("");
  const [sort, setSort] = useState<"name" | "name-rev" | "student_count">(
    "student_count",
  );
  const [order, setOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    if (sentSuccess) {
      const timer = setTimeout(() => setSentSuccess(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [sentSuccess]);

  // ─── ALL DATA LOADING LOGIC UNCHANGED ────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      const [qual] = await Promise.all([
        api
          .get("/qualification")
          .then((r) =>
            r.data.map((q: any) => ({
              value: q.qualificationid,
              label: q.qualification,
            })),
          )
          .catch(() => []),
      ]);
      setQualOpts(qual);
    };
    load();
  }, []);

  useEffect(() => {
    const loadDistricts = async () => {
      try {
        const res = await api.get(`/district?state_id=3`);
        setDistrictOpts(
          res.data
            .map((d: any) => ({ value: d.districtid, label: d.districtname }))
            .sort((a: Option, b: Option) => a.label.localeCompare(b.label)),
        );
      } catch {
        setDistrictOpts([]);
      }
    };
    loadDistricts();
  }, []);

  useEffect(() => {
    const loadStreams = async () => {
      if (filters.qualification_ids.length > 0) {
        // When qualification selected, load streams for that qualification from master
        // but only those that also exist in mapping_institute_qualification
        const qId = filters.qualification_ids[0];
        const [masterRes, inUseRes] = await Promise.all([
          api.get(`/stream-branch?qualification_id=${qId}`),
          api.get('/institute-qualification-mapping/streams-in-use'),
        ]);
        const inUseIds = new Set(inUseRes.data.map((s: any) => s.stream_branch_Id));
        const filtered = masterRes.data.filter((s: any) => inUseIds.has(s.stream_branch_Id));
        setStreamOpts(
          filtered.map((s: any) => ({ value: s.stream_branch_Id, label: s.stream_branch_name })),
        );
      } else {
        // No qualification selected: show only streams that have institute mappings
        const res = await api.get('/institute-qualification-mapping/streams-in-use');
        setStreamOpts(
          res.data.map((s: any) => ({ value: s.stream_branch_Id, label: s.stream_branch_name })),
        );
      }
    };
    loadStreams();
  }, [filters.qualification_ids]);

  const setFilter = (key: keyof Filters) => (vals: number[]) =>
    setFilters((f) => ({ ...f, [key]: vals }));

  const handleSearch = useCallback(async () => {
    setLoading(true);
    setSearched(true);
    setSelected(new Set());
    setSearchTerm(""); // Reset search
    setCurrentPage(1);

    const params = new URLSearchParams();
    if (filters.district_ids.length)
      params.set("district_ids", filters.district_ids.join(","));
    if (filters.type_ids.length)
      params.set("type_ids", filters.type_ids.join(","));
    if (filters.ownership_ids.length)
      params.set("ownership_ids", filters.ownership_ids.join(","));
    if (filters.qualification_ids.length)
      params.set("qualification_ids", filters.qualification_ids.join(","));
    if (filters.stream_ids.length)
      params.set("stream_ids", filters.stream_ids.join(","));
    params.set("sort", sort);
    params.set("order", order);
    try {
      const res = await api.get(`/institute/search?${params}`);
      setInstitutes(res.data);
    } catch {
      setInstitutes([]);
    }
    setLoading(false);
  }, [filters, sort, order]);

  const toggleSelect = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const allSelected =
    institutes.length > 0 &&
    institutes.every((i) => selected.has(i.institute_id));
  const toggleAll = () =>
    setSelected(
      allSelected ? new Set() : new Set(institutes.map((i) => i.institute_id)),
    );

  const institutesMap = new Map(
    institutes.map((i) => [i.institute_id, i.institute_name]),
  );

  // Filter & Sort institutes (add this before pagination logic)
  const filteredInstitutes = institutes.filter(
    (inst) =>
      inst.institute_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inst.district?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const sortedInstitutes = filteredInstitutes.sort((a, b) => {
    let aVal, bVal;

    if (sort === "name") {
      aVal = a.institute_name.toLowerCase();
      bVal = b.institute_name.toLowerCase();
      return aVal.localeCompare(bVal);
    } else if (sort === "name-rev") {
      aVal = a.institute_name.toLowerCase();
      bVal = b.institute_name.toLowerCase();
      return bVal.localeCompare(aVal);
    } else {
      // student_count
      return order === "desc"
        ? b.student_count - a.student_count
        : a.student_count - b.student_count;
    }
  });

  // Update pagination to use filtered/sorted data
  const totalItems = sortedInstitutes.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInstitutes = sortedInstitutes.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="w-full  mx-auto">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
            <Building2
              size={22}
              className="text-primary-content"
              strokeWidth={2}
            />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-base-content tracking-tight leading-tight">
              Find Institutes
            </h1>
            <p className="text-sm text-base-content/50 mt-0.5">
              Search | Filter | Connect
            </p>
          </div>
        </div>

        {/* Summary badges */}
        {searched && !loading && (
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-base-200 dark:bg-base-800 border border-base-300 dark:border-base-700 text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-base-content/50">
                Found
              </p>
              <p className="text-xl font-black text-primary leading-tight">
                {institutes.length}
              </p>
            </div>
            {selected.size > 0 && (
              <div className="px-4 py-2 rounded-xl bg-success/10 border border-success/25 text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-success/70">
                  Selected
                </p>
                <p className="text-xl font-black text-success leading-tight">
                  {selected.size}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Filters Card ── */}
      <div className="rounded-2xl bg-base-100 dark:bg-base-900 border border-base-300 dark:border-base-700 shadow-sm p-5 sm:p-6 mb-8">
        <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-base-200 dark:border-base-800">
          <Filter size={18} className="text-primary" />
          <h2 className="text-base font-bold text-base-content">Filters</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
          <MultiSelectDropdown
            label="District"
            options={districtOpts}
            selected={filters.district_ids}
            onChange={setFilter("district_ids")}
            placeholder="Any district"
          />
          <MultiSelectDropdown
            label="Qualification"
            options={qualOpts}
            selected={filters.qualification_ids}
            onChange={setFilter("qualification_ids")}
            placeholder="Any qualification"
          />
          <MultiSelectDropdown
            label="Stream"
            options={streamOpts}
            selected={filters.stream_ids}
            onChange={setFilter("stream_ids")}
            placeholder="Any stream"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleSearch}
            disabled={loading}
            className="btn btn-primary flex-1 gap-2 text-sm"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Search size={16} />
            )}
            {loading ? "Searching…" : "Search Institutes"}
          </button>
          <button
            onClick={() => setFilters(EMPTY_FILTERS)}
            disabled={loading}
            className="btn btn-outline text-sm px-6"
          >
            Reset
          </button>
        </div>
      </div>

      {/* ── Results ── */}
      {searched && (
        <div className="space-y-4">
          {/* Controls bar */}
          {/* Controls bar */}
          {!loading && institutes.length > 0 && (
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-base-100 dark:bg-base-900 border border-base-300 dark:border-base-700 rounded-xl px-4 py-3 shadow-sm">
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleAll}
                  className="w-8 h-8 rounded-lg border border-base-300 dark:border-base-700 bg-base-200 dark:bg-base-800 hover:border-primary hover:text-primary flex items-center justify-center text-base-content/60 transition-all"
                >
                  {allSelected ? (
                    <CheckSquare size={16} className="text-primary" />
                  ) : (
                    <Square size={16} />
                  )}
                </button>
                <p className="text-sm font-semibold text-base-content">
                  {institutes.length} institute
                  {institutes.length !== 1 ? "s" : ""} found
                  <span className="text-base-content/50 font-normal ml-1.5">
                    • click rows to select
                  </span>
                </p>
              </div>

              {/* Right: Search + Sort + Send */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Search Input - NOW WORKS */}
                <div className="relative flex-1 min-w-[200px] max-w-xs">
                  <input
                    type="text"
                    placeholder="Search institutes..."
                    className="input input-bordered input-sm w-full pl-10 pr-4 text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 pointer-events-none"
                  />
                </div>

                {/* Sort - NOW WORKS */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-base-300 dark:border-base-700 bg-base-200 dark:bg-base-800 text-xs">
                  <ArrowUpDown size={12} className="text-primary" />
                  <select
                    className="bg-transparent border-0 outline-none text-base-content/80 font-medium cursor-pointer text-xs"
                    value={sort}
                    onChange={(e) => {
                      setSort(
                        e.target.value as "name" | "name-rev" | "student_count",
                      );
                      setCurrentPage(1);
                    }}
                  >
                    <option value="student_count">Students</option>
                    <option value="name">A–Z</option>
                    <option value="name-rev">Z–A</option>
                  </select>
                </div>

                {/* Send to selected */}
                {selected.size > 0 && (
                  <button
                    onClick={() =>
                      dispatch(updateUiInstitute({ bulkOffer: { open: true } }))
                    }
                    className="btn btn-primary btn-sm gap-2 text-xs shadow-md"
                  >
                    <Send size={14} />
                    Send to {selected.size}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Table / States */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-base-content/50">
              <Loader2 size={32} className="animate-spin text-primary" />
              <p className="text-sm">Searching institutes…</p>
            </div>
          ) : institutes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 rounded-2xl border-2 border-dashed border-base-300 dark:border-base-700 bg-base-100 dark:bg-base-900 gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Search size={24} className="text-primary" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-base-content">
                  No institutes found
                </p>
                <p className="text-sm text-base-content/50 mt-1">
                  Try adjusting your filters
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="rounded-xl border border-base-300 dark:border-base-700 bg-base-100 dark:bg-base-900 shadow-sm overflow-hidden">
                {/* Desktop Table */}
                <div className="overflow-x-auto hidden md:block">
                  <table className="min-w-full divide-y divide-base-200 dark:divide-base-800">
                    <thead>
                      <tr className="bg-base-200/60 dark:bg-base-800/60">
                        <th className="px-4 py-3 w-10">
                          <button
                            onClick={toggleAll}
                            className="w-7 h-7 rounded-md border border-base-300 dark:border-base-600 bg-base-100 dark:bg-base-900 hover:border-primary flex items-center justify-center text-base-content/50 transition-all mx-auto"
                          >
                            {allSelected ? (
                              <CheckSquare size={14} className="text-primary" />
                            ) : (
                              <Square size={14} />
                            )}
                          </button>
                        </th>
                        {[
                          "Institute Name",
                          "District",
                          "Students",
                          "Placement Officer",
                          "Actions",
                        ].map((h) => (
                          <th
                            key={h}
                            className="px-4 py-3 text-left text-xs font-bold text-base-content/60 uppercase tracking-wider"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-base-200 dark:divide-base-800">
                      {paginatedInstitutes.map((inst) => {
                        const isSelected = selected.has(inst.institute_id);
                        return (
                          <tr
                            key={inst.institute_id}
                            onClick={() => toggleSelect(inst.institute_id)}
                            className={clsx(
                              "cursor-pointer transition-colors duration-150",
                              isSelected
                                ? "bg-primary/5 dark:bg-primary/10"
                                : "hover:bg-base-200/50 dark:hover:bg-base-800/50",
                            )}
                          >
                            <td className="px-4 py-3 text-center align-top">
                              {isSelected ? (
                                <CheckSquare
                                  size={16}
                                  className="text-primary mx-auto"
                                />
                              ) : (
                                <Square
                                  size={16}
                                  className="text-base-content/30 mx-auto"
                                />
                              )}
                            </td>
                            <td className="px-4 py-3 align-top">
                              <span className="text-sm font-semibold text-base-content">
                                {inst.institute_name}
                              </span>
                            </td>
                            <td className="px-4 py-3 align-top">
                              <span className="flex items-center gap-1.5 text-sm text-base-content/65">
                                <MapPin size={12} />
                                {inst.district || "—"}
                              </span>
                            </td>
                            <td className="px-4 py-3 align-top">
                              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-primary/10 text-primary text-xs font-bold">
                                <Users size={12} />
                                {inst.student_count.toLocaleString()}
                              </span>
                            </td>
                            <td className="px-4 py-3 align-top">
                              <div className="flex flex-col gap-0.5">
                                {inst.contactperson ? (
                                  <span className="text-sm font-medium text-base-content">{inst.contactperson}</span>
                                ) : (
                                  <span className="text-sm text-base-content/40">—</span>
                                )}
                                {(inst.po_email || inst.po_mobile) && (
                                  <div className="flex flex-col text-xs text-base-content/60 mt-0.5">
                                    {inst.po_email && <span>{inst.po_email}</span>}
                                    {inst.po_mobile && <span>{inst.po_mobile}</span>}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 align-top">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (inst.po_email) window.location.href = `mailto:${inst.po_email}`;
                                  }}
                                  disabled={!inst.po_email}
                                  title="Email Placement Officer"
                                  className="h-8 w-8 rounded-md bg-base-100 border border-base-300 dark:border-base-700 text-base-content/60 hover:border-primary hover:text-primary hover:bg-primary/10 flex items-center justify-center transition-all disabled:opacity-40"
                                >
                                  <Mail size={14} />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setCurrentInstitute(inst);
                                    setViewInstitute(true);
                                  }}
                                  title="View Profile"
                                  className="h-8 w-8 rounded-md bg-base-100 border border-base-300 dark:border-base-700 text-base-content/60 hover:border-primary hover:text-primary hover:bg-primary/10 flex items-center justify-center transition-all"
                                >
                                  <Eye size={14} />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    dispatch(updateUiInstitute({ bulkOffer: { open: true } }));
                                  }}
                                  className="h-8 px-3 rounded-md bg-primary/10 text-primary hover:bg-primary hover:text-primary-content text-xs font-bold flex items-center gap-1.5 transition-all"
                                >
                                  <Send size={12} />
                                  Connect
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden flex flex-col divide-y divide-base-200 dark:divide-base-800">
                  {paginatedInstitutes.map((inst) => {
                    const isSelected = selected.has(inst.institute_id);
                    return (
                      <div
                        key={inst.institute_id}
                        onClick={() => toggleSelect(inst.institute_id)}
                        className={clsx(
                          "p-4 bg-base-100 flex flex-col gap-3 cursor-pointer transition-colors",
                          isSelected ? "bg-primary/5 dark:bg-primary/10" : ""
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            {isSelected ? (
                              <CheckSquare size={16} className="text-primary" />
                            ) : (
                              <Square size={16} className="text-base-content/30" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-bold text-base-content leading-snug mb-1.5">{inst.institute_name}</h3>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-base-content/60">
                              <span className="flex items-center gap-1"><MapPin size={11} /> {inst.district || "—"}</span>
                              <span className="flex items-center gap-1 font-semibold text-primary"><Users size={11} /> {inst.student_count.toLocaleString()} Students</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1 p-2.5 rounded-lg bg-base-200/50 dark:bg-base-800/50 text-xs ml-7">
                          <span className="font-semibold text-base-content/80 uppercase tracking-wide text-[10px]">Placement Officer</span>
                          {inst.contactperson ? (
                            <div className="flex flex-col">
                              <span className="font-medium text-base-content">{inst.contactperson}</span>
                              <div className="flex flex-col gap-0.5 mt-0.5 text-[11px] text-base-content/60">
                                {inst.po_email && <span className="truncate">{inst.po_email}</span>}
                                {inst.po_mobile && <span>{inst.po_mobile}</span>}
                              </div>
                            </div>
                          ) : <span className="text-base-content/40 text-[10px]">—</span>}
                        </div>
                        <div className="flex items-center gap-2 mt-1 ml-7">
                          <button
                            onClick={(e) => { e.stopPropagation(); inst.po_email && (window.location.href = `mailto:${inst.po_email}`); }}
                            disabled={!inst.po_email}
                            className="flex-1 py-1.5 rounded bg-base-200 border border-base-300 flex items-center justify-center disabled:opacity-50 text-base-content/70 hover:border-primary hover:text-primary"
                          >
                            <Mail size={14} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setCurrentInstitute(inst); setViewInstitute(true); }}
                            className="flex-1 py-1.5 rounded bg-base-200 border border-base-300 flex items-center justify-center text-base-content/70 hover:border-primary hover:text-primary"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); dispatch(updateUiInstitute({ bulkOffer: { open: true } })); }}
                            className="flex-[2] py-1.5 rounded bg-primary text-primary-content text-xs font-bold flex items-center justify-center gap-1.5"
                          >
                            <Send size={12} /> Connect
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
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

                  <span className="text-xs text-base-content/50 font-medium">
                    Page {currentPage} of {totalPages}
                    <span className="hidden sm:inline">
                      {" "}
                      · {filteredInstitutes.length} institutes
                    </span>
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
      )}

      {/* ── Success Toast ── */}
      {sentSuccess && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-success/10 border border-success/25 text-success shadow-xl shadow-success/10 font-medium text-sm">
            <Send size={16} className="shrink-0" />
            <span className="font-semibold">Job offers sent successfully!</span>
            <button
              onClick={() => setSentSuccess(false)}
              className="ml-1 hover:opacity-70 transition-opacity"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      )}

      {/* ── Bulk Offer Modal ── */}
      <OfferModalV2
        onClose={() => { }}
        isOpen={findInstituteUi?.bulkOffer?.open ?? false}
        selectedIds={Array.from(selected)}
        institutesMap={institutesMap}
        qualOptions={qualOpts}
        streamOptions={streamOpts}
        onSent={() => {
          setSentSuccess(true);
          setSelected(new Set());
        }}
      />

      {/* //view institute modal  */}

      <InstituteViewModal
        open={viewInstitute}
        setOpen={() => setViewInstitute(false)}
        institute={currentInstitute}
      />
    </div>
  );
}
