"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Send,
  SortAsc,
  SortDesc,
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
  ChevronDown,
  ArrowUpDown,
} from "lucide-react";
import api from "@/lib/api";
import MultiSelectDropdown, { Option } from "@/components/MultiSelectDropdown";
import CommonModal from "@/components2/common/CommonModal";
import { CommonInputField } from "@/components2/forms/CommonInputField";
import { useAuth } from "@/hooks/useAuth";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { updateUiInstitute } from "@/store/institute";
import App from "next/app";

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

// ─── OfferModal (Compact Design) ─────────────────────────────────────────────
function OfferModal({
  isOpen,
  selectedIds,
  institutesMap,
  filters,
  qualOptions,
  programOptions,
  streamOptions,
  onSent,
}: {
  isOpen: boolean;
  selectedIds: number[];
  institutesMap: Map<number, string>;
  filters: Filters;
  qualOptions: Option[];
  programOptions: Option[];
  streamOptions: Option[];
  onSent: () => void;
}) {
  const dispatch = useDispatch<AppDispatch>();

  const [jobTitle, setJobTitle] = useState("");
  const [description, setDescription] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [lastDate, setLastDate] = useState("");
  const [numberOfPosts, setNumberOfPosts] = useState("");
  const [qualIds, setQualIds] = useState<number[] | []>(
    filters.qualification_ids,
  );
  const [programIds, setProgramIds] = useState<number[] | []>(
    filters.program_ids,
  );
  const [streamIds, setStreamIds] = useState<number[]>(filters.stream_ids);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const handleClose = () => {
    dispatch(updateUiInstitute({ bulkOffer: { open: false } }));
    setClear();
  };

  const setClear = () => {
    setJobTitle("");
    setDescription("");
    setSalaryMin("");
    setSalaryMax("");
    setLastDate("");
    setQualIds([]);
    setProgramIds([]);
    setSending(false);
    setError("");
  };

  const handleSend = async () => {
    if (!jobTitle.trim()) {
      setError("Job title is required");
      return;
    }
    if (selectedIds.length === 0) {
      setError("Select at least one institute");
      return;
    }
    setSending(true);
    try {
      await api
        .post("/job-offer/bulk", {
          institute_ids: selectedIds,
          job_title: jobTitle,
          job_description: description,
          required_qualification_ids: qualIds.join(","),
          required_program_ids: programIds.join(","),
          required_stream_ids: streamIds.join(","),
          salary_min: salaryMin ? parseFloat(salaryMin) : undefined,
          salary_max: salaryMax ? parseFloat(salaryMax) : undefined,
          last_date: lastDate || undefined,
          number_of_posts: numberOfPosts ? parseInt(numberOfPosts) : undefined,
        })
        .then(() => {
          dispatch(updateUiInstitute({ bulkOffer: { open: false } }));
          setClear();
        });
      onSent();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Failed to send offers");
    } finally {
      setSending(false);
    }
  };

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Send Job Offer"
      size="lg"
    >
      <div className="space-y-4 p-2">
        {/* Selected Institutes Preview */}
        <div className="p-4 bg-base-50/50 rounded-xl border border-base-200">
          <div className="flex items-center gap-2 mb-2 text-sm text-base-content/70">
            <Send size={14} className="text-primary" />
            <span>
              Sending to{" "}
              <span className="font-semibold text-primary">
                {selectedIds.length}
              </span>{" "}
              institute{selectedIds.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-16 overflow-y-auto p-1">
            {selectedIds.map((id) => (
              <span
                key={id}
                className="badge badge-primary badge-outline text-xs px-2 py-0.5 truncate max-w-28"
              >
                {institutesMap.get(id)}
              </span>
            ))}
          </div>
        </div>

        {/* Job Details */}
        <CommonInputField
          label="Job Title *"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          placeholder="e.g. Software Engineer"
        />

        <div className="space-y-2">
          <label className="label">
            <span className="label-text font-medium">Job Description</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Role overview, responsibilities..."
            className="textarea textarea-bordered w-full rounded-xl resize-vertical text-sm"
          />
        </div>

        {/* Salary Range */}
        <div className="grid grid-cols-2 gap-3">
          <CommonInputField
            label="Min Salary (₹)"
            type="number"
            value={salaryMin}
            onChange={(e) => setSalaryMin(e.target.value)}
            placeholder="3L"
          />
          <CommonInputField
            label="Max Salary (₹)"
            type="number"
            value={salaryMax}
            onChange={(e) => setSalaryMax(e.target.value)}
            placeholder="6L"
          />
        </div>

        <CommonInputField
          label="Number of Posts"
          type="number"
          value={numberOfPosts}
          onChange={(e) => setNumberOfPosts(e.target.value)}
          placeholder="5"
        />

        {/* Requirements */}
        <div className="space-y-2">
          <MultiSelectDropdown
            label="Qualifications"
            options={qualOptions}
            selected={qualIds}
            onChange={setQualIds}
            placeholder="Any qualification"
          />
          <MultiSelectDropdown
            label="Programs"
            options={programOptions}
            selected={programIds}
            onChange={setProgramIds}
            placeholder="Any program"
          />
          <MultiSelectDropdown
            label="Streams/Branches"
            options={streamOptions}
            selected={streamIds}
            onChange={setStreamIds}
            placeholder="Any stream"
          />
        </div>

        <div className="space-y-2">
          <label className="label">
            <span className="label-text font-medium">Last Date</span>
          </label>
          <input
            type="date"
            value={lastDate}
            onChange={(e) => setLastDate(e.target.value)}
            className="input input-bordered w-full rounded-xl text-sm"
          />
        </div>

        {error && (
          <div className="alert alert-error text-sm shadow-md">
            <X size={14} />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-base-200">
          <button
            onClick={handleClose}
            className="btn btn-ghost btn-sm px-4 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={sending}
            className="btn btn-primary btn-sm gap-1.5 px-6 text-sm"
          >
            {sending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Send size={14} />
            )}
            {sending ? "Sending..." : `Send to ${selectedIds.length}`}
          </button>
        </div>
      </div>
    </CommonModal>
  );
}

// ─── Compact InstituteCard ───────────────────────────────────────────────────
function InstituteCard({ institute, isSelected, onToggle }: any) {
  return (
    <div
      onClick={() => onToggle(institute.institute_id)}
      className={`group rounded-xl bg-base-100 border-2 p-4 hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-[1.02] ${
        isSelected
          ? "border-primary/40 bg-primary/3 shadow-md ring-1 ring-primary/20"
          : "border-base-200 hover:border-primary/20"
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
              isSelected
                ? "bg-primary text-primary-content shadow-md"
                : "bg-base-200 group-hover:bg-primary/10"
            }`}
          >
            {isSelected ? (
              <CheckSquare size={16} />
            ) : (
              <Square
                size={16}
                className="opacity-60 group-hover:opacity-100"
              />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-sm text-base-content group-hover:text-primary truncate">
              {institute.institute_name}
            </h3>
            <p className="text-xs text-base-content/60 mt-0.5 flex items-center gap-1">
              <MapPin size={12} />
              {institute.district || "—"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-base-content/50">
          <Users size={12} />
          <span className="font-medium bg-base-100 px-1.5 py-0.5 rounded text-xs">
            {institute.student_count.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs mb-2">
        <div className="flex items-center gap-1.5 text-base-content/60">
          <Building2 size={11} />
          <span className="truncate">{institute.type || "—"}</span>
        </div>
        <div className="flex items-center gap-1.5 text-base-content/60">
          <Landmark size={11} />
          <span className="truncate">{institute.ownership || "—"}</span>
        </div>
      </div>

      <div className="pt-2 mt-2 border-t border-base-200">
        <div className="flex items-center gap-1.5 text-xs text-base-content/40">
          <GraduationCap size={11} />
          <span>ID: #{institute.institute_id}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component (ULTRA-MINIMAL SPACING) ───────────────────────────────────
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

  const [showModal, setShowModal] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  // ─── ALL LOGIC UNCHANGED (useEffect hooks, handlers, etc.) ─────────────────
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
    <div className="p-2 sm:p-3 lg:p-4">
      <div className="w-full">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-base-content flex items-center gap-2 mb-1">
                <Filter size={24} className="text-primary" />
                Find Institutes
              </h1>
              <p className="text-base-content/60 text-sm sm:text-base max-w-xl">
                Discover institutes and send job offers directly to placement
                cells
              </p>
            </div>
            {searched && (
              <div className="stats bg-base-50 shadow-md stats-horizontal">
                <div className="stat place-items-center">
                  <div className="stat-title text-xs">Total Found</div>
                  <div className="stat-value text-primary text-sm">
                    {institutes.length}
                  </div>
                </div>
                {selected.size > 0 && (
                  <div className="stat place-items-center">
                    <div className="stat-title text-xs">Selected</div>
                    <div className="stat-value text-success text-sm">
                      {selected.size}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Filters Card */}
        <div className="rounded-xl bg-gradient-to-br from-base-100 to-base-200 border border-base-300 shadow-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-base-200">
            <Filter size={20} className="text-primary" />
            <h2 className="text-lg font-bold text-base-content">Filters</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mb-4">
            <MultiSelectDropdown
              label="State"
              options={stateOpts}
              selected={filters.state_ids}
              onChange={setFilter("state_ids")}
            />
            <MultiSelectDropdown
              label="District"
              options={districtOpts}
              selected={filters.district_ids}
              onChange={setFilter("district_ids")}
            />
            <MultiSelectDropdown
              label="Institute Type"
              options={typeOpts}
              selected={filters.type_ids}
              onChange={setFilter("type_ids")}
            />
            <MultiSelectDropdown
              label="Ownership"
              options={ownershipOpts}
              selected={filters.ownership_ids}
              onChange={setFilter("ownership_ids")}
            />
            <MultiSelectDropdown
              label="Qualification"
              options={qualOpts}
              selected={filters.qualification_ids}
              onChange={setFilter("qualification_ids")}
            />
            <MultiSelectDropdown
              label="Program"
              options={programOpts}
              selected={filters.program_ids}
              onChange={setFilter("program_ids")}
            />
            <MultiSelectDropdown
              label="Stream"
              options={streamOpts}
              selected={filters.stream_ids}
              onChange={setFilter("stream_ids")}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-base-200">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="btn btn-primary flex-1 gap-2 text-sm shadow-md hover:shadow-lg"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Search size={16} />
              )}
              {loading ? "Searching..." : "Search"}
            </button>
            <button
              onClick={() => setFilters(EMPTY_FILTERS)}
              disabled={loading}
              className="btn btn-outline px-4 text-sm shadow-md hover:shadow-lg"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Results */}
        {searched && (
          <div className="space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* LEFT SIDE */}
              <div className="flex items-start sm:items-center gap-4 flex-wrap">
                {/* Select All */}
                <button
                  onClick={toggleAll}
                  className="btn btn-circle btn-outline btn-sm"
                >
                  {allSelected ? (
                    <CheckSquare size={16} className="text-primary" />
                  ) : (
                    <Square size={16} />
                  )}
                </button>

                {/* Results Count */}
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-base-content">
                    {institutes.length} institute
                    {institutes.length !== 1 ? "s" : ""} found
                  </h3>
                  <p className="text-xs text-base-content/60">
                    Click cards to select
                  </p>
                </div>
              </div>

              {/* RIGHT SIDE */}
              <div className="flex items-center gap-3 flex-wrap">
                {/* Nearby */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-base-100 rounded-lg border text-xs shadow-sm hover:shadow-md transition">
                  <MapPin size={14} />
                  <select className="bg-transparent border-0 outline-none text-base-content/90 font-medium cursor-pointer text-xs">
                    <option value="all">All Areas</option>
                    <option value="nearby">Nearby</option>
                    <option value="50km">50km</option>
                    <option value="100km">100km</option>
                  </select>
                </div>

                {/* Sort */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-base-100 rounded-lg border text-xs shadow-sm hover:shadow-md transition">
                  <ArrowUpDown size={14} className="rotate-90" />
                  <select className="bg-transparent border-0 outline-none text-base-content/90 font-medium cursor-pointer text-xs">
                    <option value="name">A-Z</option>
                    <option value="name-rev">Z-A</option>
                    <option value="rating">Rating</option>
                    <option value="students">Students</option>
                  </select>
                </div>

                {/* Filter */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-base-100 rounded-lg border text-xs shadow-sm hover:shadow-md transition cursor-pointer">
                  <Filter size={14} />
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
                    className="btn btn-primary btn-sm gap-2 shadow-md hover:shadow-lg"
                  >
                    <Send size={16} />
                    Send to {selected.size}
                  </button>
                )}
              </div>
            </div>

            {/* Existing loading / empty / grid logic remains unchanged below */}

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-base-content/40">
                <div className="w-14 h-14 rounded-lg bg-base-200 flex items-center justify-center animate-pulse">
                  <Search size={24} className="opacity-50" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold">
                    Searching institutes...
                  </p>
                </div>
              </div>
            ) : institutes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-base-content/40 text-center rounded-lg border-2 border-dashed border-base-200 bg-base-50">
                <div className="w-16 h-16 rounded-lg bg-base-200 flex items-center justify-center">
                  <Search size={28} className="opacity-40" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1">
                    No institutes found
                  </h3>
                  <p className="text-sm">Try adjusting your filters</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {institutes.map((inst) => {
                  const isSelected = selected.has(inst.institute_id);
                  return (
                    <InstituteCard
                      key={inst.institute_id}
                      institute={inst}
                      isSelected={isSelected}
                      onToggle={toggleSelect}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Success Toast */}
        {sentSuccess && (
          <div className="fixed bottom-4 right-4 z-50">
            <div
              className="flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg max-w-sm 
                    bg-gradient-to-r from-green-600 to-green-500 
                    text-white font-medium text-sm border-none"
            >
              <Send size={16} className="text-white" />
              <span>Job offers sent successfully!</span>
            </div>
          </div>
        )}

        <OfferModal
          isOpen={findInstituteUi?.bulkOffer?.open}
          selectedIds={Array.from(selected)}
          institutesMap={institutesMap}
          filters={filters}
          qualOptions={qualOpts}
          programOptions={programOpts}
          streamOptions={streamOpts}
          //   onClose={() => setShowModal(false)}
          onSent={() => {
            setShowModal(false);
            setSentSuccess(true);
            setSelected(new Set());
          }}
        />
      </div>
    </div>
  );
}
