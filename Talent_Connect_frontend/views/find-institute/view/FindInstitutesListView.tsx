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
  Building2,
  GraduationCap,
  Landmark,
  ArrowUpDown,
} from "lucide-react";
import api from "@/lib/api";
import MultiSelectDropdown, { Option } from "@/components/MultiSelectDropdown";
import { useAuth } from "@/hooks/useAuth";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { updateUiInstitute } from "@/store/institute";
import { OfferModalV2 } from "./OfferModalView";

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

// ─── Redesigned Compact InstituteCard ────────────────────────────────────────
function InstituteCard({ institute, isSelected, onToggle }: any) {
  return (
    <div
      onClick={() => onToggle(institute.institute_id)}
      className={`group relative rounded-2xl bg-base-100 border border-base-200 p-5 
        hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 
        transition-all duration-300 cursor-pointer overflow-hidden
        ${
          isSelected
            ? "border-primary/60 bg-primary/5 ring-2 ring-primary/30 shadow-lg"
            : "hover:scale-[1.015]"
        }`}
    >
      <div className="relative flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all shadow-sm ${
              isSelected
                ? "bg-primary text-primary-content shadow-md"
                : "bg-base-200 group-hover:bg-primary/10"
            }`}
          >
            {isSelected ? (
              <CheckSquare size={20} />
            ) : (
              <Square
                size={20}
                className="opacity-70 group-hover:opacity-100"
              />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-base lg:text-lg text-base-content group-hover:text-primary truncate leading-tight">
              {institute.institute_name}
            </h3>
            <p className="text-sm text-base-content/70 mt-1 flex items-center gap-1.5">
              <MapPin size={14} className="opacity-80" />
              {institute.district || "—"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm font-medium text-base-content/70 bg-base-200/60 px-3 py-1.5 rounded-lg">
          <Users size={14} />
          <span>{institute.student_count.toLocaleString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm text-base-content/70">
        <div className="flex items-center gap-2">
          <Building2 size={14} />
          <span className="truncate">{institute.type || "—"}</span>
        </div>
        <div className="flex items-center gap-2">
          <Landmark size={14} />
          <span className="truncate">{institute.ownership || "—"}</span>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-base-200 text-xs text-base-content/50 flex items-center gap-2">
        <GraduationCap size={14} />
        <span>ID: #{institute.institute_id}</span>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function FindInstitutesPage() {
  const findInstituteUi = useSelector(
    (state: RootState) => state?.institutes?.ui,
  );

  const { user, isIndustry } = useAuth();
  const dispatch = useDispatch<AppDispatch>();

  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [sort, setSort] = useState<"name" | "student_count">("student_count");
  const [order, setOrder] = useState<"asc" | "desc">("desc");

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

  //toast timeout
  useEffect(() => {
    if (sentSuccess) {
      const timer = setTimeout(() => {
        setSentSuccess(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [sentSuccess]);

  // ─── ALL LOGIC REMAINS 100% UNCHANGED ─────────────────────────────────────
  // (your useEffect hooks, handleSearch, toggleSelect, etc. are untouched)

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

  // ─── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-base-200">
      <div className="w-full px-3 sm:px-5 lg:px-8 xl:px-10 py-6 lg:py-10 mx-auto">
        {/* Header + Filters (always visible) */}
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-base-content flex items-center gap-3">
                <Filter size={32} className="text-primary" />
                Find Institutes
              </h1>
              <p className="text-base-content/70 mt-3 max-w-3xl text-lg">
                Discover institutes and send job offers directly to placement
                cells
              </p>
            </div>

            {searched && (
              <div className="flex flex-wrap gap-5">
                <div className="px-6 py-4 bg-base-100 border border-base-300 rounded-2xl shadow-sm text-center min-w-[140px]">
                  <div className="text-sm text-base-content/70">Found</div>
                  <div className="text-3xl font-bold text-primary mt-1">
                    {institutes.length}
                  </div>
                </div>
                {selected.size > 0 && (
                  <div className="px-6 py-4 bg-base-100 border border-base-300 rounded-2xl shadow-sm text-center min-w-[140px]">
                    <div className="text-sm text-base-content/70">Selected</div>
                    <div className="text-3xl font-bold text-success mt-1">
                      {selected.size}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Filters Card – always visible */}
          <div className="rounded-2xl bg-base-100 border border-base-200 shadow-xl p-6 lg:p-8">
            <div className="flex items-center gap-3 mb-8 pb-5 border-b border-base-200">
              <Filter size={24} className="text-primary" />
              <h2 className="text-2xl font-bold text-base-content">Filters</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 mb-8">
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

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="flex-1 btn btn-primary gap-3 text-base shadow-lg hover:shadow-xl transition-all"
              >
                {loading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Search size={20} />
                )}
                {loading ? "Searching..." : "Search Institutes"}
              </button>

              <button
                onClick={() => setFilters(EMPTY_FILTERS)}
                disabled={loading}
                className="btn btn-outline px-8 text-base shadow-md hover:shadow-lg transition-all"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Results Section – appears below filters when searched */}
        {searched && (
          <div className="mt-10 space-y-8">
            {/* Controls Bar – now includes Nearby, Sort, Filter + Send */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-base-100 border border-base-200 rounded-2xl p-5 shadow-md">
              {/* LEFT SIDE */}
              <div className="flex items-center gap-5 flex-wrap">
                <button
                  onClick={toggleAll}
                  className="btn btn-circle btn-outline border-primary text-primary hover:bg-primary/10"
                >
                  {allSelected ? (
                    <CheckSquare size={20} />
                  ) : (
                    <Square size={20} />
                  )}
                </button>

                <div>
                  <h3 className="text-2xl font-bold text-base-content">
                    {institutes.length} institute
                    {institutes.length !== 1 ? "s" : ""} found
                  </h3>
                  <p className="text-base-content/70 mt-1">
                    Click cards to select for bulk offer
                  </p>
                </div>
              </div>

              {/* RIGHT SIDE – restored Nearby, Sort, Filter + Send */}
              <div className="flex items-center gap-3 flex-wrap">
                {/* Nearby */}
                <div className="flex items-center gap-2 px-4 py-2 bg-base-100 rounded-lg border border-base-300 text-xs shadow-sm hover:shadow-md transition">
                  <MapPin size={14} className="text-primary" />
                  <select className="bg-transparent border-0 outline-none text-base-content/90 font-medium cursor-pointer text-xs">
                    <option value="all">All Areas</option>
                    <option value="nearby">Nearby</option>
                    <option value="50km">50km</option>
                    <option value="100km">100km</option>
                  </select>
                </div>

                {/* Sort */}
                <div className="flex items-center gap-2 px-4 py-2 bg-base-100 rounded-lg border border-base-300 text-xs shadow-sm hover:shadow-md transition">
                  <ArrowUpDown size={14} className="text-primary" />
                  <select className="bg-transparent border-0 outline-none text-base-content/90 font-medium cursor-pointer text-xs">
                    <option value="name">A-Z</option>
                    <option value="name-rev">Z-A</option>
                    <option value="rating">Rating</option>
                    <option value="students">Students</option>
                  </select>
                </div>

                {/* Filter */}
                <div className="flex items-center gap-2 px-4 py-2 bg-base-100 rounded-lg border border-base-300 text-xs shadow-sm hover:shadow-md transition cursor-pointer">
                  <Filter size={14} className="text-primary" />
                  <span className="text-base-content/90 font-medium text-xs">
                    Filter
                  </span>
                </div>

                {/* Send Button */}
                {selected.size > 0 && (
                  <button
                    onClick={() =>
                      dispatch(updateUiInstitute({ bulkOffer: { open: true } }))
                    }
                    className="btn btn-primary gap-3 shadow-lg hover:shadow-xl transition-all text-base"
                  >
                    <Send size={18} />
                    Send to {selected.size}
                  </button>
                )}
              </div>
            </div>

            {/* Results Content */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-5 text-base-content/50">
                <Loader2 size={40} className="animate-spin" />
                <p className="text-xl font-medium">Searching institutes...</p>
              </div>
            ) : institutes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-5 text-base-content/50 text-center bg-base-100 border border-base-200 rounded-2xl shadow-md">
                <Search size={64} className="opacity-40" />
                <div>
                  <h3 className="text-3xl font-bold text-base-content mb-3">
                    No institutes found
                  </h3>
                  <p className="text-lg">Try adjusting your filters</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {institutes.map((inst) => (
                  <InstituteCard
                    key={inst.institute_id}
                    institute={inst}
                    isSelected={selected.has(inst.institute_id)}
                    onToggle={toggleSelect}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Success Toast */}
        {sentSuccess && (
          <div className="fixed bottom-6 right-6 z-50 animate-slide-up-fade">
            <div
              className="
        flex items-center gap-4 
        px-6 py-4 rounded-2xl 
        bg-emerald-50 text-emerald-900 
        border border-emerald-200/80 
        shadow-2xl shadow-emerald-900/10 
        font-medium text-base lg:text-lg
        transition-all duration-300
      "
            >
              {/* Icon with subtle pulse */}
              <div className="relative">
                <Send
                  size={22}
                  className="text-emerald-600 animate-pulse-slow"
                  strokeWidth={2.2}
                />
                <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping-slow" />
              </div>

              <span className="font-semibold">
                Job offers sent successfully!
              </span>

              {/* Optional close button */}
              <button
                onClick={() => setSentSuccess(false)}
                className="ml-auto text-emerald-700 hover:text-emerald-900 transition-colors"
              >
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        )}

        {/* Bulk Offer Modal */}
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
      </div>
    </div>
  );
}
