"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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
  ChevronDown,
  Eye,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
} from "lucide-react";
import api from "@/lib/api";
import MultiSelectDropdown, { Option } from "@/components/MultiSelectDropdown";
import CommonModal from "@/components2/common/CommonModal";
import { CommonInputField } from "@/components2/forms/CommonInputField";
import { useAuth } from "@/hooks/useAuth";

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

// ─── OfferModal (Improved Design) ─────────────────────────────────────────────
function OfferModal({
  isOpen,
  selectedIds,
  institutesMap,
  filters,
  qualOptions,
  programOptions,
  streamOptions,
  onClose,
  onSent,
}: {
  isOpen: boolean;
  selectedIds: number[];
  institutesMap: Map<number, string>;
  filters: Filters;
  qualOptions: Option[];
  programOptions: Option[];
  streamOptions: Option[];
  onClose: () => void;
  onSent: () => void;
}) {
  const [jobTitle, setJobTitle] = useState("");
  const [description, setDescription] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [lastDate, setLastDate] = useState("");
  const [numberOfPosts, setNumberOfPosts] = useState("");
  const [qualIds, setQualIds] = useState<number[]>(filters.qualification_ids);
  const [programIds, setProgramIds] = useState<number[]>(filters.program_ids);
  const [streamIds, setStreamIds] = useState<number[]>(filters.stream_ids);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

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
      await api.post("/job-offer/bulk", {
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
      });
      onSent();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Failed to send offers");
    } finally {
      setSending(false);
    }
  };

  return (
    <CommonModal isOpen={isOpen} onClose={onClose} title="Send Job Offer" size="lg">
      <div className="space-y-5 p-4">
        {/* Selected Institutes Preview */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3 text-sm">
            <Send size={16} className="text-blue-600 dark:text-blue-400" />
            <span className="font-semibold text-slate-900 dark:text-white">
              Sending to <span className="text-blue-600 dark:text-blue-400">{selectedIds.length}</span> institute{selectedIds.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto">
            {selectedIds.map((id) => (
              <span key={id} className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-medium px-3 py-1.5 rounded-lg">
                {institutesMap.get(id)}
              </span>
            ))}
          </div>
        </div>

        {/* Job Title */}
        <CommonInputField
          label="Job Title *"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          placeholder="e.g. Software Engineer"
        />

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Job Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Role overview, responsibilities..."
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

        {/* Last Date */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Application Deadline
          </label>
          <input
            type="date"
            value={lastDate}
            onChange={(e) => setLastDate(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Requirements */}
        <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-700">
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

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start gap-2 text-sm">
            <X size={16} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <span className="text-red-700 dark:text-red-300">{error}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={sending}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {sending ? "Sending..." : `Send to ${selectedIds.length}`}
          </button>
        </div>
      </div>
    </CommonModal>
  );
}

// ─── Institute Detail View Modal ──────────────────────────────────────────────
function InstituteDetailModal({
  isOpen,
  institute,
  onClose,
}: {
  isOpen: boolean;
  institute: InstituteRow | null;
  onClose: () => void;
}) {
  if (!institute) return null;

  return (
    <CommonModal isOpen={isOpen} onClose={onClose} title="Institute Details" size="md">
      <div className="space-y-4 p-4">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
            {institute.institute_name}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
            <GraduationCap size={14} />
            ID: #{institute.institute_id}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1 block">
              <MapPin size={12} className="inline mr-1" />
              Location
            </label>
            <p className="text-sm font-medium text-slate-900 dark:text-white">{institute.district || "—"}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1 block">
                <Building2 size={12} className="inline mr-1" />
                Type
              </label>
              <p className="text-sm font-medium text-slate-900 dark:text-white">{institute.type || "—"}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1 block">
                <Landmark size={12} className="inline mr-1" />
                Ownership
              </label>
              <p className="text-sm font-medium text-slate-900 dark:text-white">{institute.ownership || "—"}</p>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1 block">
              <Users size={12} className="inline mr-1" />
              Student Count
            </label>
            <p className="text-sm font-medium text-slate-900 dark:text-white">{institute.student_count.toLocaleString()}</p>
          </div>

          <hr className="border-slate-200 dark:border-slate-700" />

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1 block">
              <Mail size={12} className="inline mr-1" />
              Email
            </label>
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400 break-all">{institute.email || "—"}</p>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1 block">
              <Phone size={12} className="inline mr-1" />
              Phone
            </label>
            <p className="text-sm font-medium text-slate-900 dark:text-white">{institute.mobileno || "—"}</p>
          </div>
        </div>
      </div>
    </CommonModal>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function FindInstitutesPage() {
  const { user, isIndustry } = useAuth();

  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [sort, setSort] = useState<"name" | "student_count">("student_count");
  const [order, setOrder] = useState<"asc" | "desc">("desc");

  const [institutes, setInstitutes] = useState<InstituteRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedInstitute, setSelectedInstitute] = useState<InstituteRow | null>(null);
  const [sentSuccess, setSentSuccess] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const totalPages = Math.ceil(institutes.length / pageSize);

  const paginatedInstitutes = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return institutes.slice(start, start + pageSize);
  }, [institutes, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [institutes]);

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
    paginatedInstitutes.length > 0 &&
    paginatedInstitutes.every((i: any) => selected.has(i.institute_id));

  const toggleAll = () => {
    if (allSelected) {
      const newSet = new Set(selected);
      paginatedInstitutes.forEach((i: any) => newSet.delete(i.institute_id));
      setSelected(newSet);
    } else {
      const newSet = new Set(selected);
      paginatedInstitutes.forEach((i: any) => newSet.add(i.institute_id));
      setSelected(newSet);
    }
  };

  const institutesMap = new Map(
    institutes.map((i) => [i.institute_id, i.institute_name])
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-blue-600 dark:bg-blue-500 flex items-center justify-center">
                <Filter size={20} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Find Institutes
              </h1>
            </div>
            <p className="text-slate-600 dark:text-slate-400 ml-13">
              Search and send bulk job offers to institutes
            </p>
          </div>

          {selected.size > 0 && (
            <button
              onClick={() => setShowOfferModal(true)}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors shadow-md hover:shadow-lg"
            >
              <Send size={16} />
              Send to {selected.size}
            </button>
          )}
        </div>

        {/* Search Button */}
        <div className="mb-6">
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50 shadow-md"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Search size={16} />
            )}
            {loading ? "Searching..." : "Search Institutes"}
          </button>
        </div>

        {/* Results Section */}
        {searched && (
          <>
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 size={40} className="animate-spin text-blue-600" />
              </div>
            ) : institutes.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center">
                <Building2 size={48} className="text-slate-400 dark:text-slate-600 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                  No institutes found
                </p>
                <p className="text-slate-600 dark:text-slate-400">
                  Try adjusting your filters and search again
                </p>
              </div>
            ) : (
              <>
                {/* Table */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-md overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-100 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                        <tr>
                          <th className="px-6 py-4 text-left">
                            <button
                              onClick={toggleAll}
                              className="text-slate-700 dark:text-slate-300 hover:text-blue-600 transition-colors"
                              title={allSelected ? "Deselect all" : "Select all"}
                            >
                              {allSelected ? (
                                <CheckSquare size={18} />
                              ) : (
                                <Square size={18} />
                              )}
                            </button>
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">
                            Institute Name
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">
                            District
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">
                            Type
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">
                            Ownership
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">
                            Students
                          </th>
                          <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900 dark:text-white">
                            Action
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {paginatedInstitutes.map((inst: any) => {
                          const isSelected = selected.has(inst.institute_id);

                          return (
                            <tr
                              key={inst.institute_id}
                              className={`transition-colors ${
                                isSelected
                                  ? "bg-blue-50 dark:bg-blue-900/20"
                                  : "hover:bg-slate-50 dark:hover:bg-slate-700/50"
                              }`}
                            >
                              <td className="px-6 py-4">
                                <button
                                  onClick={() => toggleSelect(inst.institute_id)}
                                  className="text-slate-700 dark:text-slate-300 hover:text-blue-600 transition-colors"
                                >
                                  {isSelected ? (
                                    <CheckSquare size={18} className="text-blue-600" />
                                  ) : (
                                    <Square size={18} />
                                  )}
                                </button>
                              </td>

                              <td className="px-6 py-4">
                                <p className="font-semibold text-slate-900 dark:text-white">
                                  {inst.institute_name}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                  ID: {inst.institute_id}
                                </p>
                              </td>

                              <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                                {inst.district || "—"}
                              </td>

                              <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                                {inst.type || "—"}
                              </td>

                              <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                                {inst.ownership || "—"}
                              </td>

                              <td className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">
                                {inst.student_count.toLocaleString()}
                              </td>

                              <td className="px-6 py-4 text-center">
                                <button
                                  onClick={() => {
                                    setSelectedInstitute(inst);
                                    setShowDetailModal(true);
                                  }}
                                  className="p-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors inline-flex"
                                  title="View details"
                                >
                                  <Eye size={18} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Pagination */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Showing <span className="font-semibold">{(currentPage - 1) * pageSize + 1}</span> to{" "}
                    <span className="font-semibold">
                      {Math.min(currentPage * pageSize, institutes.length)}
                    </span>{" "}
                    of <span className="font-semibold">{institutes.length}</span> institutes
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => p - 1)}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Previous page"
                    >
                      <ChevronLeft size={18} className="text-slate-600 dark:text-slate-400" />
                    </button>

                    <span className="px-3 py-1 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-lg">
                      Page {currentPage} of {totalPages}
                    </span>

                    <button
                      onClick={() => setCurrentPage((p) => p + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Next page"
                    >
                      <ChevronRight size={18} className="text-slate-600 dark:text-slate-400" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* Success Toast */}
        {sentSuccess && (
          <div className="fixed bottom-6 right-6 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4">
            <CheckSquare size={18} />
            <span className="font-medium">Job offers sent successfully!</span>
            <button
              onClick={() => setSentSuccess(false)}
              className="ml-2 hover:opacity-80"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Modals */}
        <OfferModal
          isOpen={showOfferModal}
          selectedIds={Array.from(selected)}
          institutesMap={institutesMap}
          filters={filters}
          qualOptions={[]}
          programOptions={[]}
          streamOptions={[]}
          onClose={() => setShowOfferModal(false)}
          onSent={() => {
            setShowOfferModal(false);
            setSentSuccess(true);
            setSelected(new Set());
          }}
        />

        <InstituteDetailModal
          isOpen={showDetailModal}
          institute={selectedInstitute}
          onClose={() => setShowDetailModal(false)}
        />
      </div>
    </div>
  );
}