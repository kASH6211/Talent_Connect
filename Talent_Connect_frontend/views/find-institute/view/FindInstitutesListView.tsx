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
}

interface Filters {
  state_ids: number[];
  district_ids: number[];
  type_ids: number[];
  ownership_ids: number[];
  qualification_ids: number[];
  program_ids: number[];
  stream_ids: number[];
}

const EMPTY_FILTERS: Filters = {
  state_ids: [],
  district_ids: [],
  type_ids: [],
  ownership_ids: [],
  qualification_ids: [],
  program_ids: [],
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
  const [programOpts, setProgramOpts] = useState<Option[]>([]);
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
      const [states, types, own, qual] = await Promise.all([
        api
          .get("/state")
          .then((r) =>
            r.data
              .map((s: any) => ({ value: s.lgdstateid, label: s.statename }))
              .sort((a: Option, b: Option) => a.label.localeCompare(b.label)),
          )
          .catch(() => []),
        api
          .get("/institute-type")
          .then((r) =>
            r.data.map((t: any) => ({
              value: t.institute_type_id,
              label: t.institute_type,
            })),
          )
          .catch(() => []),
        api
          .get("/institute-ownership-type")
          .then((r) =>
            r.data.map((o: any) => ({
              value: o.institute_ownership_type_id,
              label: o.institute_type,
            })),
          )
          .catch(() => []),
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
      setStateOpts(states);
      setTypeOpts(types);
      setOwnershipOpts(own);
      setQualOpts(qual);
    };
    load();
  }, []);

  useEffect(() => {
    const loadDistricts = async () => {
      if (filters.state_ids.length === 0) {
        const res = await api.get("/district");
        setDistrictOpts(
          res.data
            .map((d: any) => ({ value: d.districtid, label: d.districtname }))
            .sort((a: Option, b: Option) => a.label.localeCompare(b.label)),
        );
      } else {
        const results = await Promise.all(
          filters.state_ids.map((sId) =>
            api.get(`/district?state_id=${sId}`).then((r) => r.data),
          ),
        );
        const merged = results.flat();
        const unique = Array.from(
          new Map(merged.map((d: any) => [d.districtid, d])).values(),
        );
        setDistrictOpts(
          unique
            .map((d: any) => ({ value: d.districtid, label: d.districtname }))
            .sort((a: Option, b: Option) => a.label.localeCompare(b.label)),
        );
        setFilters((f) => ({ ...f, district_ids: [] }));
      }
    };
    loadDistricts();
  }, [filters.state_ids]);

  useEffect(() => {
    const loadPrograms = async () => {
      if (filters.qualification_ids.length > 0) {
        const qId = filters.qualification_ids[0];
        const res = await api.get(
          `/program-qualification-mapping?qualification_id=${qId}`,
        );
        const progs = res.data.map((m: any) => ({
          value: m.program.programId,
          label: m.program.program_name,
        }));
        const unique = Array.from(
          new Map(progs.map((p: any) => [p.value, p])).values(),
        );
        setProgramOpts(unique as Option[]);
      } else {
        const res = await api.get("/program");
        setProgramOpts(
          res.data.map((p: any) => ({
            value: p.programId,
            label: p.program_name,
          })),
        );
      }
    };
    loadPrograms();
  }, [filters.qualification_ids]);

  useEffect(() => {
    const loadStreams = async () => {
      if (filters.program_ids.length > 0) {
        const pId = filters.program_ids[0];
        const res = await api.get(`/stream-branch?program_id=${pId}`);
        setStreamOpts(
          res.data.map((s: any) => ({
            value: s.stream_branch_Id,
            label: s.stream_branch_name,
          })),
        );
      } else {
        const res = await api.get("/stream-branch");
        setStreamOpts(
          res.data.map((s: any) => ({
            value: s.stream_branch_Id,
            label: s.stream_branch_name,
          })),
        );
      }
    };
    loadStreams();
  }, [filters.program_ids]);

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
    if (filters.program_ids.length)
      params.set("program_ids", filters.program_ids.join(","));
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
              Discover institutes and send job offers directly to placement
              cells
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

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 mb-5">
          <MultiSelectDropdown
            label="State"
            options={stateOpts}
            selected={filters.state_ids}
            onChange={setFilter("state_ids")}
            placeholder="Any state"
          />
          <MultiSelectDropdown
            label="District"
            options={districtOpts}
            selected={filters.district_ids}
            onChange={setFilter("district_ids")}
            placeholder="Any district"
          />
          <MultiSelectDropdown
            label="Institute Type"
            options={typeOpts}
            selected={filters.type_ids}
            onChange={setFilter("type_ids")}
            placeholder="Any type"
          />
          <MultiSelectDropdown
            label="Ownership"
            options={ownershipOpts}
            selected={filters.ownership_ids}
            onChange={setFilter("ownership_ids")}
            placeholder="Any ownership"
          />
          <MultiSelectDropdown
            label="Qualification"
            options={qualOpts}
            selected={filters.qualification_ids}
            onChange={setFilter("qualification_ids")}
            placeholder="Any qualification"
          />
          <MultiSelectDropdown
            label="Program"
            options={programOpts}
            selected={filters.program_ids}
            onChange={setFilter("program_ids")}
            placeholder="Any program"
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
              <div className="overflow-x-auto rounded-xl border border-base-300 dark:border-base-700 bg-base-100 dark:bg-base-900 shadow-sm">
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
                        "Type",
                        "Ownership",
                        "Students",
                        "",
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
                      console.log("inst>>>", inst);
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
                          <td className="px-4 py-3 text-center">
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
                          <td className="px-4 py-3">
                            <span className="text-sm font-semibold text-base-content">
                              {inst.institute_name}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="flex items-center gap-1.5 text-sm text-base-content/65">
                              <MapPin size={12} />
                              {inst.district || "—"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-base-content/65">
                            {inst.type || "—"}
                          </td>
                          <td className="px-4 py-3 text-sm text-base-content/65">
                            {inst.ownership || "—"}
                          </td>
                          <td className="px-4 py-3">
                            <span className="flex items-center gap-1.5 text-sm text-base-content/65">
                              <Users size={12} />
                              {inst.student_count.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setCurrentInstitute(inst);
                                setViewInstitute(true);
                              }}
                              title="View / Send Offer"
                              className="w-7 h-7 rounded-md border border-base-300 dark:border-base-700 bg-base-200 dark:bg-base-800 text-base-content/50 hover:border-primary hover:bg-primary hover:text-primary-content flex items-center justify-center transition-all duration-200 mx-auto"
                            >
                              <Eye size={13} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
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
        onClose={() => {}}
        isOpen={findInstituteUi?.bulkOffer?.open ?? false}
        selectedIds={Array.from(selected)}
        institutesMap={institutesMap}
        filters={filters}
        qualOptions={qualOpts}
        programOptions={programOpts}
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
