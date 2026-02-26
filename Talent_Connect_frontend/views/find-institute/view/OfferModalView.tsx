"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useDispatch } from "react-redux";
import {
  Send,
  X,
  Loader2,
  CalendarClock,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Building2,
} from "lucide-react";

import api from "@/lib/api";
import { AppDispatch } from "@/store/store";
import { updateUiInstitute } from "@/store/institute";
import MultiSelectDropdown from "@/components/MultiSelectDropdown";

/* ─── Types ─────────────────────────────────────────────────────────────────── */
interface Option {
  label: string;
  value: number;
}

interface Filters {
  qualification_ids: number[];
  program_ids: number[];
  stream_ids: number[];
}

/* ─── Component ─────────────────────────────────────────────────────────────── */
export function OfferModalV2({
  isOpen,
  onClose,
  selectedIds,
  institutesMap,
  filters,
  qualOptions,
  programOptions,
  streamOptions,
  onSent,
}: {
  isOpen: boolean;
  onClose: () => void;
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
  const [qualIds, setQualIds] = useState<number[]>(filters.qualification_ids);
  const [programIds, setProgramIds] = useState<number[]>(filters.program_ids);
  const [streamIds, setStreamIds] = useState<number[]>(filters.stream_ids);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [showAllInstitutes, setShowAllInstitutes] = useState(false);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (isOpen) setVisible(true);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen]);

  const clear = () => {
    setJobTitle("");
    setDescription("");
    setSalaryMin("");
    setSalaryMax("");
    setLastDate("");
    setNumberOfPosts("");
    setQualIds([]);
    setProgramIds([]);
    setStreamIds([]);
    setSending(false);
    setError("");
    setShowAllInstitutes(false);
  };

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      dispatch(updateUiInstitute({ bulkOffer: { open: false } }));
      onClose();
      clear();
    }, 220);
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
      dispatch(updateUiInstitute({ bulkOffer: { open: false } }));
      onSent();
      handleClose();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Failed to send offers");
    } finally {
      setSending(false);
    }
  };

  const PREVIEW_COUNT = 4;
  const previewIds = selectedIds.slice(0, PREVIEW_COUNT);
  const remainingCount = selectedIds.length - PREVIEW_COUNT;

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-opacity duration-200 ${visible ? "opacity-100" : "opacity-0"}`}
      style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        className={`
          relative w-full max-w-2xl max-h-[92vh] flex flex-col
          bg-base-100 dark:bg-base-900
          border border-base-300 dark:border-base-700
          rounded-2xl shadow-2xl overflow-hidden
          transition-all duration-200
          ${visible ? "translate-y-0 scale-100 opacity-100" : "translate-y-4 scale-[0.98] opacity-0"}
        `}
        role="dialog"
        aria-modal="true"
        aria-labelledby="om2-title"
      >
        {/* Top accent stripe */}
        <div className="h-1 w-full bg-gradient-to-r from-primary to-secondary flex-shrink-0" />

        {/* ── Header ── */}
        <div className="flex-shrink-0 px-6 pt-5 pb-5 border-b border-base-200 dark:border-base-800">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                <Briefcase size={20} className="text-primary" />
              </div>
              <div>
                <h2
                  id="om2-title"
                  className="text-xl font-bold text-base-content leading-tight tracking-tight"
                >
                  Send Bulk Job Offer
                </h2>
                <p className="text-sm text-base-content/50 mt-0.5">
                  Dispatch to all selected institutes at once
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              aria-label="Close"
              className="w-8 h-8 rounded-lg border border-base-300 dark:border-base-700 bg-base-200 dark:bg-base-800 text-base-content/50 hover:border-error/40 hover:bg-error/10 hover:text-error flex items-center justify-center transition-all duration-200 flex-shrink-0"
            >
              <X size={15} />
            </button>
          </div>

          {/* Recipients */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-base-content/50 mb-2.5">
              Recipients · {selectedIds.length} institute
              {selectedIds.length !== 1 ? "s" : ""}
            </p>

            {/* Preview chips (always shown) */}
            <div className="flex flex-wrap gap-2">
              {previewIds.map((id) => (
                <span
                  key={id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-base-200 dark:bg-base-800 border border-base-300 dark:border-base-700 text-xs font-medium text-base-content/80"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                  {institutesMap.get(id) || `#${id}`}
                </span>
              ))}

              {/* Toggle button for remaining */}
              {remainingCount > 0 && (
                <button
                  onClick={() => setShowAllInstitutes((v) => !v)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
                >
                  {showAllInstitutes ? (
                    <>
                      <ChevronUp size={12} /> Show less
                    </>
                  ) : (
                    <>
                      <ChevronDown size={12} /> +{remainingCount} more
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Expanded list */}
            {showAllInstitutes && remainingCount > 0 && (
              <div className="mt-3 p-3 rounded-xl bg-base-200 dark:bg-base-800 border border-base-300 dark:border-base-700 max-h-40 overflow-y-auto">
                <div className="flex flex-wrap gap-2">
                  {selectedIds.slice(PREVIEW_COUNT).map((id) => (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-base-100 dark:bg-base-900 border border-base-300 dark:border-base-700 text-xs font-medium text-base-content/70"
                    >
                      <Building2
                        size={10}
                        className="text-primary flex-shrink-0"
                      />
                      {institutesMap.get(id) || `#${id}`}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Job Details */}
          <section>
            <p className="text-[10px] font-bold uppercase tracking-widest text-base-content/50 mb-3 flex items-center gap-3 after:flex-1 after:h-px after:bg-base-200 dark:after:bg-base-800 after:content-['']">
              Job Details
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-base-content/70 mb-1.5 ml-0.5">
                  Job Title <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Software Engineer, Marketing Lead"
                  className="w-full bg-base-200 dark:bg-base-800 border border-base-300 dark:border-base-700 rounded-xl px-4 py-3 text-sm text-base-content placeholder:text-base-content/30 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-base-content/70 mb-1.5 ml-0.5">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Role overview, responsibilities, skills required…"
                  rows={4}
                  className="w-full bg-base-200 dark:bg-base-800 border border-base-300 dark:border-base-700 rounded-xl px-4 py-3 text-sm text-base-content placeholder:text-base-content/30 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-y min-h-[100px] leading-relaxed"
                />
              </div>
            </div>
          </section>

          {/* Compensation & Openings */}
          <section>
            <p className="text-[10px] font-bold uppercase tracking-widest text-base-content/50 mb-3 flex items-center gap-3 after:flex-1 after:h-px after:bg-base-200 dark:after:bg-base-800 after:content-['']">
              Compensation & Openings
            </p>
            <div className="grid grid-cols-3 gap-3">
              {/* Min Salary */}
              <div>
                <label className="block text-xs font-semibold text-base-content/70 mb-1.5 ml-0.5">
                  Min Salary
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-base-content/50 pointer-events-none">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(e.target.value)}
                    placeholder="300000"
                    className="w-full bg-base-200 dark:bg-base-800 border border-base-300 dark:border-base-700 rounded-xl pl-8 pr-4 py-3 text-sm text-base-content placeholder:text-base-content/30 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>
              {/* Max Salary */}
              <div>
                <label className="block text-xs font-semibold text-base-content/70 mb-1.5 ml-0.5">
                  Max Salary
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-base-content/50 pointer-events-none">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(e.target.value)}
                    placeholder="600000"
                    className="w-full bg-base-200 dark:bg-base-800 border border-base-300 dark:border-base-700 rounded-xl pl-8 pr-4 py-3 text-sm text-base-content placeholder:text-base-content/30 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>
              {/* No. of Posts */}
              <div>
                <label className="block text-xs font-semibold text-base-content/70 mb-1.5 ml-0.5">
                  Posts
                </label>
                <input
                  type="number"
                  value={numberOfPosts}
                  onChange={(e) => setNumberOfPosts(e.target.value)}
                  placeholder="5"
                  className="w-full bg-base-200 dark:bg-base-800 border border-base-300 dark:border-base-700 rounded-xl px-4 py-3 text-sm text-base-content placeholder:text-base-content/30 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>
          </section>

          {/* Candidate Requirements */}
          <section>
            <p className="text-[10px] font-bold uppercase tracking-widest text-base-content/50 mb-3 flex items-center gap-3 after:flex-1 after:h-px after:bg-base-200 dark:after:bg-base-800 after:content-['']">
              Candidate Requirements
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-base-content/70 mb-1.5 ml-0.5">
                  Qualifications
                </label>
                <MultiSelectDropdown
                  label="Qualification"
                  options={qualOptions}
                  selected={qualIds}
                  onChange={setQualIds}
                  placeholder="Any qualification"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-base-content/70 mb-1.5 ml-0.5">
                  Programs
                </label>
                <MultiSelectDropdown
                  label="Program"
                  options={programOptions}
                  selected={programIds}
                  onChange={setProgramIds}
                  placeholder="Any program"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-base-content/70 mb-1.5 ml-0.5">
                  Streams / Branches
                </label>
                <MultiSelectDropdown
                  label="Stream"
                  options={streamOptions}
                  selected={streamIds}
                  onChange={setStreamIds}
                  placeholder="Any stream"
                />
              </div>
            </div>
          </section>

          {/* Timeline */}
          <section>
            <p className="text-[10px] font-bold uppercase tracking-widest text-base-content/50 mb-3 flex items-center gap-3 after:flex-1 after:h-px after:bg-base-200 dark:after:bg-base-800 after:content-['']">
              Timeline
            </p>
            <div>
              <label className="block text-xs font-semibold text-base-content/70 mb-1.5 ml-0.5">
                Last Date to Apply
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={lastDate}
                  onChange={(e) => setLastDate(e.target.value)}
                  className="w-full bg-base-200 dark:bg-base-800 border border-base-300 dark:border-base-700 rounded-xl px-4 py-3 pr-12 text-sm text-base-content focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <CalendarClock
                  size={15}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-base-content/40 pointer-events-none"
                />
              </div>
            </div>
          </section>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2.5 bg-error/10 border border-error/25 text-error text-sm px-4 py-3 rounded-xl">
              <X size={15} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex-shrink-0 flex items-center justify-between gap-4 px-6 py-4 border-t border-base-200 dark:border-base-800 bg-base-200/50 dark:bg-base-800/50">
          <p className="text-xs text-base-content/50 flex items-center gap-1.5 hidden sm:flex">
            <Send size={12} />
            Delivered instantly to all institutes
          </p>
          <div className="flex items-center gap-2.5 ml-auto">
            <button
              onClick={handleClose}
              disabled={sending}
              className="px-4 h-9 rounded-lg border border-base-300 dark:border-base-700 bg-base-100 dark:bg-base-900 text-sm font-medium text-base-content hover:bg-base-200 dark:hover:bg-base-800 transition-colors disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={sending}
              className="h-9 px-5 rounded-lg bg-primary hover:brightness-110 text-primary-content text-sm font-semibold flex items-center gap-2 shadow-lg shadow-primary/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {sending ? (
                <>
                  <Loader2 size={15} className="animate-spin" /> Sending…
                </>
              ) : (
                <>
                  <Send size={15} /> Send to {selectedIds.length}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
