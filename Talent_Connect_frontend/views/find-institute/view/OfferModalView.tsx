"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useDispatch } from "react-redux";
import {
  Send,
  X,
  Loader2,
  CalendarClock,
  Building2,
  ChevronDown,
  ChevronUp,
  MapPin,
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

type EoiType = "Placement" | "Industrial Training" | "Collaboration" | "";

const NATURE_OPTIONS = [
  "Permanent employment",
  "Contractual employment",
  "Apprenticeship",
  "Industrial traineeship",
];

const EXPERIENCE_OPTIONS = ["Fresher", "0-1 years", "1-3 years", "More than 3 years"];

const COLLABORATION_OPTIONS = [
  "Host students for Industrial Visit",
  "Provide Faculty Training workshops",
  "Conduct Student Training workshop",
  "Set up Lab or Equipment support through CSR",
  "Any other CSR Support",
];

/* ─── Field styles ─────────────────────────────────────────────────────────── */
const inputCls =
  "w-full bg-base-200 dark:bg-base-800 border border-base-300 dark:border-base-700 rounded-xl px-4 py-3 text-sm text-base-content placeholder:text-base-content/30 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all";

const sectionLabelCls =
  "text-[10px] font-bold uppercase tracking-widest text-base-content/50 mb-3 flex items-center gap-3 after:flex-1 after:h-px after:bg-base-200 dark:after:bg-base-800 after:content-['']";

const fieldLabelCls = "block text-xs font-semibold text-base-content/70 mb-1.5 ml-0.5";

/* ─── EngagementType Selector ────────────────────────────────────────────── */
function EoiTypeCard({
  value,
  label,
  desc,
  selected,
  onClick,
}: {
  value: EoiType;
  label: string;
  desc: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-xl border-2 p-4 text-left transition-all duration-150 ${selected
          ? "border-primary bg-primary/10 shadow"
          : "border-base-300 dark:border-base-700 hover:border-primary/40"
        }`}
    >
      <div className="flex items-center gap-2.5 mb-1">
        <span
          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selected
              ? "border-primary bg-primary"
              : "border-base-400 dark:border-base-500"
            }`}
        >
          {selected && (
            <span className="w-1.5 h-1.5 rounded-full bg-white block" />
          )}
        </span>
        <span
          className={`text-sm font-bold ${selected ? "text-primary" : "text-base-content"
            }`}
        >
          {label}
        </span>
      </div>
      <p className="text-xs text-base-content/50 ml-6.5 leading-relaxed">{desc}</p>
    </button>
  );
}

/* ─── Component ─────────────────────────────────────────────────────────────── */
export function OfferModalV2({
  isOpen,
  onClose,
  selectedIds,
  institutesMap,
  qualOptions,
  streamOptions,
  onSent,
  prefilledQualIds = [],
  prefilledStreamIds = [],
}: {
  isOpen: boolean;
  onClose: () => void;
  selectedIds: number[];
  institutesMap: Map<number, string>;
  qualOptions: Option[];
  streamOptions: Option[];
  onSent: () => void;
  prefilledQualIds?: number[];
  prefilledStreamIds?: number[];
}) {
  const dispatch = useDispatch<AppDispatch>();

  // Engagement type
  const [eoiType, setEoiType] = useState<EoiType>("");

  // Fields for Placement / Industrial Training
  const [jobTitle, setJobTitle] = useState("");
  const [natureOfEngagement, setNatureOfEngagement] = useState("");
  const [qualIds, setQualIds] = useState<number[]>(prefilledQualIds);
  const [streamIds, setStreamIds] = useState<number[]>(prefilledStreamIds);
  const [numStudents, setNumStudents] = useState("");
  const [experience, setExperience] = useState("");
  const [location, setLocation] = useState("");
  const [isRemote, setIsRemote] = useState(false);
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [startDate, setStartDate] = useState("");
  const [duration, setDuration] = useState("");

  // Fields for Collaboration
  const [collabTypes, setCollabTypes] = useState<string[]>([]);

  // Common
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [showAllInstitutes, setShowAllInstitutes] = useState(false);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [visible, setVisible] = useState(false);
  useEffect(() => { if (isOpen) setVisible(true); }, [isOpen]);

  // Sync prefilled ids when modal opens
  useEffect(() => {
    if (isOpen) {
      setQualIds(prefilledQualIds);
      setStreamIds(prefilledStreamIds);
    }
  }, [isOpen, prefilledQualIds.join(","), prefilledStreamIds.join(",")]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen]);

  const clear = () => {
    setEoiType("");
    setJobTitle(""); setNatureOfEngagement(""); setQualIds([]); setStreamIds([]);
    setNumStudents(""); setExperience(""); setLocation(""); setIsRemote(false);
    setSalaryMin(""); setSalaryMax(""); setStartDate(""); setDuration("");
    setCollabTypes([]); setAdditionalDetails("");
    setSending(false); setError(""); setShowAllInstitutes(false);
  };

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      dispatch(updateUiInstitute({ bulkOffer: { open: false } }));
      onClose();
      clear();
    }, 220);
  };

  const toggleCollab = (opt: string) => {
    setCollabTypes((prev) =>
      prev.includes(opt) ? prev.filter((o) => o !== opt) : [...prev, opt]
    );
  };

  const handleSend = async () => {
    if (!eoiType) { setError("Please select a purpose of engagement"); return; }
    if (eoiType !== "Collaboration" && !jobTitle.trim()) {
      setError("Job Role / Title is required"); return;
    }
    if (eoiType === "Collaboration" && collabTypes.length === 0) {
      setError("Select at least one collaboration type"); return;
    }
    if (selectedIds.length === 0) { setError("Select at least one institute"); return; }

    setSending(true);
    try {
      await api.post("/job-offer/bulk", {
        institute_ids: selectedIds,
        eoi_type: eoiType,
        job_title: jobTitle || undefined,
        nature_of_engagement: natureOfEngagement || undefined,
        required_qualification_ids: qualIds.join(",") || undefined,
        required_stream_ids: streamIds.join(",") || undefined,
        number_of_posts: numStudents ? parseInt(numStudents) : undefined,
        experience_required: experience || undefined,
        location: location || undefined,
        is_remote: isRemote,
        salary_min: salaryMin ? parseFloat(salaryMin) : undefined,
        salary_max: salaryMax ? parseFloat(salaryMax) : undefined,
        start_date: startDate || undefined,
        duration: duration || undefined,
        collaboration_types: collabTypes.join("|") || undefined,
        additional_details: additionalDetails || undefined,
      });
      dispatch(updateUiInstitute({ bulkOffer: { open: false } }));
      onSent();
      handleClose();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Failed to send EOI");
    } finally {
      setSending(false);
    }
  };

  const PREVIEW_COUNT = 4;
  const previewIds = selectedIds.slice(0, PREVIEW_COUNT);
  const remainingCount = selectedIds.length - PREVIEW_COUNT;

  if (!mounted || !isOpen) return null;

  const isHiringOrTraining = eoiType === "Placement" || eoiType === "Industrial Training";

  return createPortal(
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-opacity duration-200 ${visible ? "opacity-100" : "opacity-0"}`}
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div
        className={`relative w-full max-w-3xl max-h-[94vh] flex flex-col bg-base-100 dark:bg-base-900 border border-base-300 dark:border-base-700 rounded-2xl shadow-2xl overflow-hidden transition-all duration-200 ${visible ? "translate-y-0 scale-100 opacity-100" : "translate-y-4 scale-[0.98] opacity-0"}`}
        role="dialog"
        aria-modal="true"
      >
        {/* Top accent */}
        <div className="h-1 w-full bg-gradient-to-r from-primary to-secondary flex-shrink-0" />

        {/* ── Header ── */}
        <div className="flex-shrink-0 px-6 pt-5 pb-5 border-b border-base-200 dark:border-base-800">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                <Send size={20} className="text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-base-content leading-tight tracking-tight">
                  Connect with Institutes
                </h2>
                <p className="text-sm text-base-content/50 mt-0.5">
                  Submit an Expression of Interest to selected institutes
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-lg border border-base-300 dark:border-base-700 bg-base-200 dark:bg-base-800 text-base-content/50 hover:border-error/40 hover:bg-error/10 hover:text-error flex items-center justify-center transition-all flex-shrink-0"
            >
              <X size={15} />
            </button>
          </div>

          {/* Send to */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-base-content/50 mb-2.5">
              Send to · {selectedIds.length} institute{selectedIds.length !== 1 ? "s" : ""}
            </p>
            <div className="flex flex-wrap gap-2">
              {previewIds.map((id) => (
                <span key={id} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-base-200 dark:bg-base-800 border border-base-300 dark:border-base-700 text-xs font-medium text-base-content/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                  {institutesMap.get(id) || `#${id}`}
                </span>
              ))}
              {remainingCount > 0 && (
                <button
                  onClick={() => setShowAllInstitutes((v) => !v)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
                >
                  {showAllInstitutes ? <><ChevronUp size={12} /> Show less</> : <><ChevronDown size={12} /> +{remainingCount} more</>}
                </button>
              )}
            </div>
            {showAllInstitutes && remainingCount > 0 && (
              <div className="mt-3 p-3 rounded-xl bg-base-200 dark:bg-base-800 border border-base-300 dark:border-base-700 max-h-36 overflow-y-auto">
                <div className="flex flex-wrap gap-2">
                  {selectedIds.slice(PREVIEW_COUNT).map((id) => (
                    <span key={id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-base-100 dark:bg-base-900 border border-base-300 dark:border-base-700 text-xs font-medium text-base-content/70">
                      <Building2 size={10} className="text-primary flex-shrink-0" />
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

          {/* ── Section 1: Purpose of Engagement ── */}
          <section>
            <p className={sectionLabelCls}>
              Purpose of Engagement <span className="text-error">*</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <EoiTypeCard
                value="Placement"
                label="Hire Students"
                desc="Placement drive / recruitment for permanent or contract roles"
                selected={eoiType === "Placement"}
                onClick={() => setEoiType("Placement")}
              />
              <EoiTypeCard
                value="Industrial Training"
                label="Host for Industrial Training"
                desc="Apprenticeship, OJT, or dual system training for students"
                selected={eoiType === "Industrial Training"}
                onClick={() => setEoiType("Industrial Training")}
              />
              <EoiTypeCard
                value="Collaboration"
                label="Collaborate with Institute"
                desc="Industrial visits, workshops, lab setup, CSR support"
                selected={eoiType === "Collaboration"}
                onClick={() => setEoiType("Collaboration")}
              />
            </div>
          </section>

          {/* ── Section 2a: Hiring / Training fields ── */}
          {isHiringOrTraining && (
            <section className="space-y-4">
              <p className={sectionLabelCls}>Engagement Details</p>

              {/* Job Role */}
              <div>
                <label className={fieldLabelCls}>Job Role <span className="text-error">*</span></label>
                <input type="text" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Software Engineer, CNC Operator, Welder" className={inputCls} />
              </div>

              {/* Nature of Engagement */}
              <div>
                <label className={fieldLabelCls}>Nature of Engagement</label>
                <select value={natureOfEngagement} onChange={(e) => setNatureOfEngagement(e.target.value)}
                  className={inputCls}>
                  <option value="">Select nature…</option>
                  {NATURE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>

              {/* Qualification */}
              <div>
                <label className={fieldLabelCls}>Qualification</label>
                <MultiSelectDropdown label="Qualification" options={qualOptions} selected={qualIds}
                  onChange={setQualIds} placeholder="Any qualification" />
              </div>

              {/* Relevant Course / Stream */}
              <div>
                <label className={fieldLabelCls}>Relevant Course / Stream</label>
                <MultiSelectDropdown label="Stream" options={streamOptions} selected={streamIds}
                  onChange={setStreamIds} placeholder="Any stream / branch" />
              </div>

              {/* Students required + Experience */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={fieldLabelCls}>Number of Students Required</label>
                  <input type="number" value={numStudents} onChange={(e) => setNumStudents(e.target.value)}
                    placeholder="e.g. 10" className={inputCls} />
                </div>
                <div>
                  <label className={fieldLabelCls}>Experience Required</label>
                  <select value={experience} onChange={(e) => setExperience(e.target.value)} className={inputCls}>
                    <option value="">Select…</option>
                    {EXPERIENCE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>

              {/* Location */}
              <div>
                <label className={fieldLabelCls}>Location of Job / Training</label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40 pointer-events-none" />
                  <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
                    placeholder="City or address" className={`${inputCls} pl-9`} />
                </div>
                <label className="flex items-center gap-2 mt-2 cursor-pointer w-fit">
                  <input type="checkbox" checked={isRemote} onChange={(e) => setIsRemote(e.target.checked)}
                    className="checkbox checkbox-primary checkbox-sm" />
                  <span className="text-xs font-medium text-base-content/70">Remote / Work from home option</span>
                </label>
              </div>

              {/* Salary / Stipend */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={fieldLabelCls}>Min Salary / Stipend</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-base-content/50 pointer-events-none">₹</span>
                    <input type="number" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)}
                      placeholder="eg. 200000" className={`${inputCls} pl-8`} />
                  </div>
                </div>
                <div>
                  <label className={fieldLabelCls}>Max Salary / Stipend</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-base-content/50 pointer-events-none">₹</span>
                    <input type="number" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)}
                      placeholder="eg. 500000" className={`${inputCls} pl-8`} />
                  </div>
                </div>
                <div>
                  <label className={fieldLabelCls}>Expected Start Date</label>
                  <div className="relative">
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                      className={`${inputCls} pr-10`} />
                    <CalendarClock size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-base-content/40 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className={fieldLabelCls}>Duration (if applicable — for internships, OJT, dual system)</label>
                <input type="text" value={duration} onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g. 6 months, 1 year" className={inputCls} />
              </div>
            </section>
          )}

          {/* ── Section 2b: Collaboration fields ── */}
          {eoiType === "Collaboration" && (
            <section className="space-y-4">
              <p className={sectionLabelCls}>Type of Collaboration <span className="text-error">*</span></p>
              <div className="space-y-2.5">
                {COLLABORATION_OPTIONS.map((opt) => (
                  <label key={opt} className="flex items-center gap-3 cursor-pointer group p-3 rounded-xl border border-base-300 dark:border-base-700 hover:border-primary/40 hover:bg-primary/5 transition-all">
                    <input type="checkbox" checked={collabTypes.includes(opt)} onChange={() => toggleCollab(opt)}
                      className="checkbox checkbox-primary checkbox-sm" />
                    <span className="text-sm font-medium text-base-content group-hover:text-primary transition-colors">{opt}</span>
                  </label>
                ))}
              </div>
            </section>
          )}

          {/* ── Section 3: Additional Details ── */}
          {eoiType && (
            <section>
              <p className={sectionLabelCls}>Additional Details / Requirements</p>
              <textarea value={additionalDetails} onChange={(e) => setAdditionalDetails(e.target.value)}
                placeholder="Any other requirements, expectations, or context…"
                rows={4}
                className={`${inputCls} resize-y min-h-[90px] leading-relaxed`} />
            </section>
          )}

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
            <Send size={12} /> EOI delivered instantly to selected institutes
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
              disabled={sending || !eoiType}
              className="h-9 px-5 rounded-lg bg-primary hover:brightness-110 text-primary-content text-sm font-semibold flex items-center gap-2 shadow-lg shadow-primary/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {sending ? (
                <><Loader2 size={15} className="animate-spin" /> Sending…</>
              ) : (
                <><Send size={15} /> Send EOI to {selectedIds.length}</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
