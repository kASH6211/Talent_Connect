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
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

import api from "@/lib/api";
import { AppDispatch } from "@/store/store";
import { updateUiInstitute } from "@/store/institute";
import MultiSelectDropdown from "@/components/MultiSelectDropdown";

/* ─── Types ─────────────────────────────────────────────────────────────────── */
interface Option {
  label: string;
  value: number | string;
}

type EoiType = "Placement" | "Industrial Training" | "Collaboration";

export interface EoiFormState {
  isSaved: boolean;
  jobTitle: string;
  natureOfEngagement: string;
  qualIds: (number | string)[];
  streamIds: (number | string)[];
  numStudents: string;
  experience: string;
  location: string;
  isRemote: boolean;
  salaryMin: string;
  salaryMax: string;
  startDate: string;
  duration: string;
  collabTypes: string[];
  additionalDetails: string;
  // New fields
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  // Collaboration specific
  prefQualIds: (number | string)[];
  prefStreamIds: (number | string)[];
  minStudents: string;
  numInstitutes: string;
}

export const DEFAULT_FORM_STATE: EoiFormState = {
  isSaved: false,
  jobTitle: "",
  natureOfEngagement: "",
  qualIds: [],
  streamIds: [],
  numStudents: "",
  experience: "",
  location: "",
  isRemote: false,
  salaryMin: "",
  salaryMax: "",
  startDate: "",
  duration: "",
  collabTypes: [],
  additionalDetails: "",
  // New fields
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  // Collaboration specific
  prefQualIds: [],
  prefStreamIds: [],
  minStudents: "",
  numInstitutes: "",
};

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
  isSaved,
  isPartiallyFilled,
  onClick,
}: {
  value: EoiType | "";
  label: string;
  desc: string;
  selected: boolean;
  isSaved: boolean;
  isPartiallyFilled: boolean;
  onClick: () => void;
}) {
  const getBorderColor = () => {
    if (selected) return "border-primary bg-primary/10 shadow";
    if (isSaved) return "border-green-500 bg-green-500/5 shadow-sm";
    if (isPartiallyFilled) return "border-amber-500 bg-amber-500/5 shadow-sm";
    return "border-base-300 dark:border-base-700 hover:border-primary/40";
  };

  const getIcon = () => {
    if (isSaved) return <CheckCircle2 size={16} className="text-green-500" />;
    if (isPartiallyFilled) return <AlertCircle size={16} className="text-amber-500" />;
    return (
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
    );
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex-1 rounded-xl border-2 p-4 text-left transition-all duration-150 ${getBorderColor()}`}
    >
      <div className="flex items-center gap-2.5 mb-1">
        <div className="w-4 flex items-center justify-center">
          {getIcon()}
        </div>
        <span
          className={`text-sm font-bold ${selected ? "text-primary" : "text-base-content"
            }`}
        >
          {label}
        </span>
      </div>
      <p className="text-xs text-base-content/50 ml-6.5 leading-relaxed">{desc}</p>

      {/* Decorative tag */}
      {isSaved && !selected && (
        <span className="absolute top-2 right-2 text-[9px] font-bold uppercase tracking-wider text-green-600 bg-green-100 px-1.5 py-0.5 rounded">
          Saved
        </span>
      )}
      {isPartiallyFilled && !isSaved && !selected && (
        <span className="absolute top-2 right-2 text-[9px] font-bold uppercase tracking-wider text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">
          Draft
        </span>
      )}
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
  isSelectAll = false,
  searchFilters = {},
  searchSort = "student_count",
  searchTerm = "",
  totalInstitutes,
}: {
  isOpen: boolean;
  onClose: () => void;
  selectedIds: number[];
  institutesMap: Map<number, string>;
  qualOptions: Option[];
  streamOptions: Option[];
  onSent: () => void;
  prefilledQualIds?: (number | string)[];
  prefilledStreamIds?: (number | string)[];
  isSelectAll?: boolean;
  searchFilters?: any;
  searchSort?: string;
  searchTerm?: string;
  totalInstitutes?: number;
}) {
  const dispatch = useDispatch<AppDispatch>();

  const [eoiType, setEoiType] = useState<EoiType | "">("");

  const [forms, setForms] = useState<Record<EoiType, EoiFormState>>({
    "Placement": { ...DEFAULT_FORM_STATE },
    "Industrial Training": { ...DEFAULT_FORM_STATE },
    "Collaboration": { ...DEFAULT_FORM_STATE },
  });

  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [showAllInstitutes, setShowAllInstitutes] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [visible, setVisible] = useState(false);
  useEffect(() => { if (isOpen) setVisible(true); }, [isOpen]);

  // Sync prefilled ids when modal opens
  useEffect(() => {
    if (isOpen) {
      setForms((prev) => {
        const next = { ...prev };
        const types: EoiType[] = ["Placement", "Industrial Training", "Collaboration"];

        types.forEach(t => {
          // Only overwrite if form is not saved and not partially filled
          if (!prev[t].isSaved && !isPartiallyFilled(t)) {
            next[t] = {
              ...DEFAULT_FORM_STATE,
              qualIds: prefilledQualIds,
              streamIds: prefilledStreamIds
            };
          }
        });

        return next;
      });
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
    setForms({
      "Placement": { ...DEFAULT_FORM_STATE, qualIds: prefilledQualIds, streamIds: prefilledStreamIds },
      "Industrial Training": { ...DEFAULT_FORM_STATE, qualIds: prefilledQualIds, streamIds: prefilledStreamIds },
      "Collaboration": { ...DEFAULT_FORM_STATE, qualIds: prefilledQualIds, streamIds: prefilledStreamIds },
    });
    setSending(false);
    setError("");
    setShowAllInstitutes(false);
    setShowConfirm(false);
  };

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      clear();
    }
  }, [isOpen]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      dispatch(updateUiInstitute({ bulkOffer: { open: false } }));
      onClose();
    }, 220);
  };

  const handleFieldChange = (field: keyof EoiFormState, value: any) => {
    if (!eoiType) return;
    setError("");
    setForms((prev) => ({
      ...prev,
      [eoiType]: {
        ...prev[eoiType],
        [field]: value,
        isSaved: false,
      },
    }));
  };

  const toggleCollab = (opt: string) => {
    if (!eoiType) return;
    const current = forms[eoiType].collabTypes;
    handleFieldChange("collabTypes", current.includes(opt) ? current.filter((o) => o !== opt) : [...current, opt]);
  };

  const validateForm = (type: EoiType): string | null => {
    const f = forms[type];

    // Contact details are always required
    if (!f.contactName.trim()) return "Contact person name is required";
    if (!f.contactEmail.trim()) return "Contact person email is required";
    // Email regex check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(f.contactEmail.trim())) return "Please enter a valid email address";

    if (!f.contactPhone.trim()) return "Contact person phone is required";
    // Phone regex check (10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(f.contactPhone.trim())) return "Phone number must be exactly 10 digits";

    if (type === "Collaboration") {
      if (f.collabTypes.length === 0) return "Select at least one collaboration type";
      if (f.prefQualIds.length === 0) return "Preferred qualification is required";
      if (f.prefStreamIds.length === 0) return "Preferred trade/course is required";
      if (!f.minStudents.trim()) return "Minimum number of students required is mandatory";
      if (!f.numInstitutes.trim()) return "Number of institutes is required";
    } else {
      if (!f.jobTitle.trim()) return "Job Role / Title is required";
      if (type === "Placement" && !f.natureOfEngagement) return "Nature of engagement is required";
      if (f.qualIds.length === 0) return "Qualification is required";
      if (f.streamIds.length === 0) return "Course/Trade is required";
      if (!f.numStudents.trim()) return "Number of students required is mandatory";
      if (!f.experience) return "Experience required is mandatory";
      if (!f.location.trim()) return "Location is required";
      if (!f.salaryMin.trim()) return "Minimum salary/stipend is required";
      if (!f.startDate) return "Expected start date is required";

      // Conditional Duration
      const isDurationMandatory =
        f.natureOfEngagement === "Contractual employment" ||
        f.natureOfEngagement === "Apprenticeship";
      if (isDurationMandatory && !f.duration.trim()) {
        return "Duration is required for Contractual/Apprenticeship engagement";
      }
    }
    return null;
  };

  const saveCurrentTab = () => {
    if (!eoiType) return;
    const err = validateForm(eoiType);
    if (err) {
      setError(err);
      return;
    }
    setForms((prev) => ({
      ...prev,
      [eoiType]: {
        ...prev[eoiType],
        isSaved: true,
      },
    }));
    setError("");
  };

  const isPartiallyFilled = (type: EoiType) => {
    const f = forms[type];
    if (f.isSaved) return false;
    // For Collaboration
    if (type === "Collaboration") {
      return f.collabTypes.length > 0 || f.additionalDetails.trim() !== "";
    }
    // For Placement/Training
    return (
      f.jobTitle.trim() !== "" ||
      f.natureOfEngagement !== "" ||
      f.numStudents !== "" ||
      f.location !== "" ||
      f.additionalDetails.trim() !== "" ||
      (f.qualIds.length > 0 && f.qualIds.join(",") !== prefilledQualIds.join(",")) ||
      (f.streamIds.length > 0 && f.streamIds.join(",") !== prefilledStreamIds.join(","))
    );
  };

  const handleSend = () => {
    setError("");
    const types: EoiType[] = ["Placement", "Industrial Training", "Collaboration"];

    // 1. Identify Saved forms
    const savedForms = types.filter(t => forms[t].isSaved);

    // 2. Identify Drafts (filled but not saved)
    const draftForms = types.filter(t => !forms[t].isSaved && isPartiallyFilled(t));

    if (savedForms.length === 0) {
      if (draftForms.length > 0) {
        setError(`You have draft data in ${draftForms.join(", ")}. Please save at least one form to proceed.`);
      } else {
        setError("Please fill and save at least one form (Placement, Training, or Collaboration).");
      }
      return;
    }

    if (!isSelectAll && selectedIds.length === 0) {
      setError("Please select at least one institute.");
      return;
    }

    setShowConfirm(true);
  };

  const submitEOI = async () => {
    setError("");
    const types: EoiType[] = ["Placement", "Industrial Training", "Collaboration"];
    // ONLY collect forms that are explicitly saved
    const formsToSend = types.filter(t => forms[t].isSaved);

    setSending(true);
    try {
      const promises = formsToSend.map((type) => {
        const f = forms[type];
        return api.post("/job-offer/bulk", {
          institute_ids: isSelectAll ? [] : selectedIds,
          is_select_all: isSelectAll,
          district_ids: searchFilters?.district_ids?.join(","),
          qualification_ids: searchFilters?.qualification_ids?.join(","),
          stream_ids: searchFilters?.stream_ids?.join(","),
          search: searchTerm,
          eoi_type: type,
          job_title: f.jobTitle || undefined,
          nature_of_engagement: f.natureOfEngagement || undefined,
          required_qualification_ids: f.qualIds.join(",") || undefined,
          required_stream_ids: f.streamIds.join(",") || undefined,
          number_of_posts: f.numStudents ? parseInt(f.numStudents) : undefined,
          experience_required: f.experience || undefined,
          location: f.location || undefined,
          is_remote: f.isRemote,
          salary_min: f.salaryMin ? parseFloat(f.salaryMin) : undefined,
          salary_max: f.salaryMax ? parseFloat(f.salaryMax) : undefined,
          start_date: f.startDate || undefined,
          duration: f.duration || undefined,
          collaboration_types: f.collabTypes.join("|") || undefined,
          additional_details: f.additionalDetails || undefined,
          // New contact fields
          contact_name: f.contactName,
          contact_email: f.contactEmail,
          contact_phone: f.contactPhone,
          // Collaboration specific
          preferred_qualification_ids: f.prefQualIds.join(",") || undefined,
          preferred_stream_ids: f.prefStreamIds.join(",") || undefined,
          min_students_required: f.minStudents ? parseInt(f.minStudents) : undefined,
          number_of_institutes_required: f.numInstitutes ? parseInt(f.numInstitutes) : undefined,
        });
      });

      await Promise.all(promises);

      dispatch(updateUiInstitute({ bulkOffer: { open: false } }));
      onSent();
      handleClose();
    } catch {
      setError("Failed to send EOI. Please try again.");
    } finally {
      setSending(false);
    }
  };
  const PREVIEW_COUNT = 4;
  const previewIds = selectedIds.slice(0, PREVIEW_COUNT);
  const remainingCount = selectedIds.length - PREVIEW_COUNT;

  if (!mounted || !isOpen) return null;

  const isHiringOrTraining = eoiType === "Placement" || eoiType === "Industrial Training";

  // Calculate disabled qualification IDs (disable everything except ITI and Diploma for Hiring/Training)
  const disabledQualIds = isHiringOrTraining
    ? qualOptions
      .filter((q) => {
        const lbl = q.label.toLowerCase();
        return !lbl.includes("iti") && !lbl.includes("diploma");
      })
      .map((q) => q.value)
    : [];

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
                  {showConfirm ? "Confirm Submission" : "Connect with Institutes"}
                </h2>
                <p className="text-sm text-base-content/50 mt-0.5">
                  {showConfirm ? "Please review the details before final submission" : "Submit an Expression of Interest to selected institutes"}
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

          {/* Selection Summary */}
          <div className="cursor-pointer group" onClick={() => setShowAllInstitutes((v) => !v)}>
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-base-content/50">
                Send to · {isSelectAll ? `${totalInstitutes || "All matching"} institutes` : `${selectedIds.length} institute${selectedIds.length !== 1 ? "s" : ""}`}
              </p>
              <div className="flex items-center gap-1 text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                {showAllInstitutes ? "HIDE LIST" : "VIEW LIST"}
                <ChevronDown size={10} className={showAllInstitutes ? "rotate-180" : ""} />
              </div>
            </div>

            {!isSelectAll ? (
              <div className="flex flex-wrap gap-2">
                {previewIds.map((id) => (
                  <span key={id} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-base-200 dark:bg-base-800 border border-base-300 dark:border-base-700 text-xs font-medium text-base-content/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    {institutesMap.get(id) || `#${id}`}
                  </span>
                ))}
                {remainingCount > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
                    +{remainingCount} more
                  </span>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-center gap-3 group-hover:bg-primary/10 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Building2 size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-primary">
                    {totalInstitutes || "All matching"} institutes selected
                  </p>
                  <p className="text-xs text-base-content/50">Your EOI will be sent to every institute matching your current search criteria.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Confirmation Overlay (Positioned to cover entire modal) ── */}
        {showConfirm && (
          <div className="absolute inset-0 bg-base-100 dark:bg-base-900 z-[100] p-8 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
              <HelpCircle size={40} />
            </div>
            <h3 className="text-2xl font-black mb-3 text-base-content">Are you sure?</h3>
            <p className="text-base-content/60 max-w-md mx-auto leading-relaxed mb-4">
              You are about to send your <span className="font-bold text-primary">{
                (() => {
                  const types: EoiType[] = ["Placement", "Industrial Training", "Collaboration"];
                  const sendingForms = types.filter(t => forms[t].isSaved);
                  return sendingForms.join(", ");
                })()
              }</span> forms to <span className="font-bold text-primary">{isSelectAll ? (totalInstitutes || "all matching") : selectedIds.length}</span> institutes.
            </p>

            {(() => {
              const types: EoiType[] = ["Placement", "Industrial Training", "Collaboration"];
              const draftForms = types.filter(t => !forms[t].isSaved && isPartiallyFilled(t));
              if (draftForms.length > 0) {
                return (
                  <div className="bg-amber-100 border border-amber-200 rounded-xl p-4 mb-8 max-w-md">
                    <div className="flex items-center gap-2 text-amber-800 font-bold text-sm mb-1">
                      <AlertCircle size={16} /> Drafts Discard Warning
                    </div>
                    <p className="text-xs text-amber-700 font-medium">
                      The following draft forms will be <span className="font-bold uppercase">discarded</span>: {draftForms.join(", ")}.
                      Go back if you want to save them first.
                    </p>
                  </div>
                );
              }
              return <div className="mb-8" />;
            })()}

            <div className="flex items-center gap-4 w-full max-w-xs">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={sending}
                className="flex-1 h-12 rounded-xl border-2 border-base-300 dark:border-base-700 font-bold transition-all hover:bg-base-200 dark:hover:bg-base-800 disabled:opacity-50"
              >
                Go Back
              </button>
              <button
                onClick={submitEOI}
                disabled={sending}
                className="flex-1 h-12 rounded-xl bg-primary text-primary-content font-bold shadow-lg shadow-primary/25 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
              >
                {sending ? <Loader2 className="animate-spin mx-auto" size={20} /> : "Yes, Send Now"}
              </button>
            </div>
          </div>
        )}


        {showAllInstitutes && (
          <div className="mt-3 p-3 rounded-xl bg-base-200 dark:bg-base-800 border border-base-300 dark:border-base-700 max-h-48 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex flex-wrap gap-2">
              {isSelectAll ? (
                <p className="text-xs text-base-content/50 italic px-2">
                  Wait... in "Select All" mode, the full list is determined dynamically by your filters.
                </p>
              ) : (
                selectedIds.map((id) => (
                  <span key={id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-base-100 dark:bg-base-900 border border-base-300 dark:border-base-700 text-xs font-medium text-base-content/70">
                    <Building2 size={10} className="text-primary flex-shrink-0" />
                    {institutesMap.get(id) || `#${id}`}
                  </span>
                ))
              )}
            </div>
          </div>
        )}

        {/* Static Error Message */}
        {error && (
          <div className="mx-6 mt-4 flex items-center justify-between gap-2.5 bg-error/10 border border-error/25 text-error text-sm px-4 py-3 rounded-xl animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2.5">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
            <button
              onClick={() => setError("")}
              className="w-6 h-6 rounded-md hover:bg-error/10 flex items-center justify-center transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* ── Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 relative">
          {/* Confirmation Overlay moved outside to main container */}


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
                isSaved={forms["Placement"].isSaved}
                isPartiallyFilled={isPartiallyFilled("Placement")}
                onClick={() => setEoiType("Placement")}
              />
              <EoiTypeCard
                value="Industrial Training"
                label="Host for Industrial Training"
                desc="Apprenticeship, OJT, or dual system training for students"
                selected={eoiType === "Industrial Training"}
                isSaved={forms["Industrial Training"].isSaved}
                isPartiallyFilled={isPartiallyFilled("Industrial Training")}
                onClick={() => setEoiType("Industrial Training")}
              />
              <EoiTypeCard
                value="Collaboration"
                label="Collaborate with Institute"
                desc="Industrial visits, workshops, lab setup, CSR support"
                selected={eoiType === "Collaboration"}
                isSaved={forms["Collaboration"].isSaved}
                isPartiallyFilled={isPartiallyFilled("Collaboration")}
                onClick={() => setEoiType("Collaboration")}
              />
            </div>
          </section>

          {/* ── Section 2a: Hiring / Training fields ── */}
          {isHiringOrTraining && eoiType && forms[eoiType] && (
            <section className="space-y-4 animate-in fade-in duration-300">
              <p className={sectionLabelCls}>Engagement Details</p>

              {/* Job Role */}
              <div>
                <label className={fieldLabelCls}>Job Role <span className="text-error">*</span></label>
                <input type="text" value={forms[eoiType].jobTitle} onChange={(e) => handleFieldChange("jobTitle", e.target.value)}
                  placeholder="e.g. Software Engineer, CNC Operator, Welder" className={inputCls} />
              </div>

              {/* Nature of Engagement */}
              {eoiType === "Placement" && (
                <div>
                  <label className={fieldLabelCls}>Nature of Engagement <span className="text-error">*</span></label>
                  <select value={forms[eoiType].natureOfEngagement} onChange={(e) => handleFieldChange("natureOfEngagement", e.target.value)}
                    className={inputCls}>
                    <option value="">Select nature…</option>
                    {NATURE_OPTIONS.filter(o => !(eoiType === "Placement" && o === "Industrial traineeship"))
                      .map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              )}

              {/* Qualification */}
              <div>
                <label className={fieldLabelCls}>Qualification <span className="text-error">*</span></label>
                <MultiSelectDropdown label="Qualification" options={qualOptions} selected={forms[eoiType].qualIds}
                  onChange={(vals) => handleFieldChange("qualIds", vals)} placeholder="Any qualification" disabledOptions={disabledQualIds} />
              </div>

              {/* Relevant Course */}
              <div>
                <label className={fieldLabelCls}>Course / Trade <span className="text-error">*</span></label>
                <MultiSelectDropdown
                  label="Course / Trade"
                  options={streamOptions}
                  selected={streamOptions
                    .filter((opt) => {
                      const val = String(opt.value || "");
                      const ids = val.split(",").map(Number);
                      return ids.every((id) => forms[eoiType].streamIds.includes(id as any));
                    })
                    .map((opt) => opt.value)}
                  onChange={(vals) => {
                    const allIds = (vals as string[]).flatMap((v) =>
                      String(v || "").split(",").map(Number),
                    );
                    handleFieldChange("streamIds", allIds);
                  }}
                  placeholder="Any course"
                />
              </div>

              {/* Students required + Experience */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={fieldLabelCls}>Number of Students Required <span className="text-error">*</span></label>
                  <input type="text" value={forms[eoiType].numStudents}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      handleFieldChange("numStudents", val);
                    }}
                    placeholder="e.g. 10" className={inputCls} />
                </div>
                <div>
                  <label className={fieldLabelCls}>Experience Required <span className="text-error">*</span></label>
                  <select value={forms[eoiType].experience} onChange={(e) => handleFieldChange("experience", e.target.value)} className={inputCls}>
                    <option value="">Select…</option>
                    {EXPERIENCE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>

              {/* Location */}
              <div>
                <label className={fieldLabelCls}>Location of Job / Training <span className="text-error">*</span></label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40 pointer-events-none" />
                  <input type="text" value={forms[eoiType].location} onChange={(e) => handleFieldChange("location", e.target.value)}
                    placeholder="City or address" className={`${inputCls} pl-9`} />
                </div>
                <label className="flex items-center gap-2 mt-2 cursor-pointer w-fit">
                  <input type="checkbox" checked={forms[eoiType].isRemote} onChange={(e) => handleFieldChange("isRemote", e.target.checked)}
                    className="checkbox checkbox-primary checkbox-sm" />
                  <span className="text-xs font-medium text-base-content/70">Remote / Work from home option</span>
                </label>
              </div>

              {/* Salary / Stipend */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={fieldLabelCls}>
                    {eoiType === "Placement" ? "Min Salary" : "Min Stipend"} <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-base-content/50 pointer-events-none">₹</span>
                    <input type="text" value={forms[eoiType].salaryMin}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        handleFieldChange("salaryMin", val);
                      }}
                      placeholder="eg. 200000" className={`${inputCls} pl-8`} />
                  </div>
                </div>
                <div>
                  <label className={fieldLabelCls}>
                    {eoiType === "Placement" ? "Max Salary" : "Max Stipend"}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-base-content/50 pointer-events-none">₹</span>
                    <input type="text" value={forms[eoiType].salaryMax}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        handleFieldChange("salaryMax", val);
                      }}
                      placeholder="eg. 500000" className={`${inputCls} pl-8`} />
                  </div>
                </div>
                <div>
                  <label className={fieldLabelCls}>Expected Start Date <span className="text-error">*</span></label>
                  <div className="relative">
                    <input type="date" value={forms[eoiType].startDate} onChange={(e) => handleFieldChange("startDate", e.target.value)}
                      className={`${inputCls} pr-10`} />
                    <CalendarClock size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-base-content/40 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className={fieldLabelCls}>
                  Duration {(forms[eoiType].natureOfEngagement === "Contractual employment" || forms[eoiType].natureOfEngagement === "Apprenticeship") && <span className="text-error">*</span>}
                  <span className="text-[10px] text-base-content/40 ml-1">(if applicable — for internships, OJT, dual system)</span>
                </label>
                <input type="text" value={forms[eoiType].duration} onChange={(e) => handleFieldChange("duration", e.target.value)}
                  placeholder="e.g. 6 months, 1 year" className={inputCls} />
              </div>
            </section>
          )}

          {/* ── Section 2b: Collaboration fields ── */}
          {eoiType === "Collaboration" && forms[eoiType] && (
            <section className="space-y-4 animate-in fade-in duration-300">
              <p className={sectionLabelCls}>Type of Collaboration <span className="text-error">*</span></p>
              <div className="space-y-2.5">
                {COLLABORATION_OPTIONS.map((opt) => (
                  <label key={opt} className="flex items-center gap-3 cursor-pointer group p-3 rounded-xl border border-base-300 dark:border-base-700 hover:border-primary/40 hover:bg-primary/5 transition-all">
                    <input type="checkbox" checked={forms[eoiType].collabTypes.includes(opt)} onChange={() => toggleCollab(opt)}
                      className="checkbox checkbox-primary checkbox-sm" />
                    <span className="text-sm font-medium text-base-content group-hover:text-primary transition-colors">{opt}</span>
                  </label>
                ))}
              </div>

              <p className={sectionLabelCls}>Preferred Qualifications & Courses</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={fieldLabelCls}>Preferred Qualification <span className="text-error">*</span></label>
                  <MultiSelectDropdown label="Qualification" options={qualOptions} selected={forms[eoiType].prefQualIds}
                    onChange={(vals) => handleFieldChange("prefQualIds", vals)} placeholder="Select qualification" />
                </div>
                <div>
                  <label className={fieldLabelCls}>Preferred Trade/Course <span className="text-error">*</span></label>
                  <MultiSelectDropdown
                    label="Trade/Course"
                    options={streamOptions}
                    selected={streamOptions
                      .filter((opt) => {
                        const val = String(opt.value || "");
                        const ids = val.split(",").map(Number);
                        return ids.every((id) => forms[eoiType].prefStreamIds.includes(id as any));
                      })
                      .map((opt) => opt.value)}
                    onChange={(vals) => {
                      const allIds = (vals as string[]).flatMap((v) =>
                        String(v || "").split(",").map(Number),
                      );
                      handleFieldChange("prefStreamIds", allIds);
                    }}
                    placeholder="Select trade/course"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={fieldLabelCls}>Minimum number of students required <span className="text-error">*</span></label>
                  <input type="text" value={forms[eoiType].minStudents}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      handleFieldChange("minStudents", val);
                    }}
                    placeholder="e.g. 50" className={inputCls} />
                </div>
                <div>
                  <label className={fieldLabelCls}>Number of institutes <span className="text-error">*</span></label>
                  <input type="text" value={forms[eoiType].numInstitutes}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      handleFieldChange("numInstitutes", val);
                    }}
                    placeholder="e.g. 5" className={inputCls} />
                </div>
              </div>
            </section>
          )}

          {/* ── Section Contact Details ── */}
          {eoiType && forms[eoiType] && (
            <section className="space-y-4 animate-in fade-in duration-300">
              <p className={sectionLabelCls}>Contact Person Details</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className={fieldLabelCls}>Name <span className="text-error">*</span></label>
                  <input type="text" value={forms[eoiType].contactName} onChange={(e) => handleFieldChange("contactName", e.target.value)}
                    placeholder="Full Name" className={inputCls} />
                </div>
                <div>
                  <label className={fieldLabelCls}>Email <span className="text-error">*</span></label>
                  <input type="email" value={forms[eoiType].contactEmail} onChange={(e) => handleFieldChange("contactEmail", e.target.value)}
                    placeholder="email@example.com" className={inputCls} />
                </div>
                <div>
                  <label className={fieldLabelCls}>Phone <span className="text-error">*</span></label>
                  <input type="text" value={forms[eoiType].contactPhone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      if (val.length <= 10) handleFieldChange("contactPhone", val);
                    }}
                    placeholder="10-digit Phone number" className={inputCls} />
                </div>
              </div>
            </section>
          )}

          {/* ── Section 3: Additional Details ── */}
          {eoiType && forms[eoiType] && (
            <section className="animate-in fade-in duration-300">
              <p className={sectionLabelCls}>Additional Details / Requirements</p>
              <textarea value={forms[eoiType].additionalDetails} onChange={(e) => handleFieldChange("additionalDetails", e.target.value)}
                placeholder="Any other requirements, expectations, or context…"
                rows={4}
                className={`${inputCls} resize-y min-h-[90px] leading-relaxed`} />
            </section>
          )}

          {/* Tab Actions */}
          {eoiType && forms[eoiType] && !forms[eoiType].isSaved && (
            <div className="flex justify-end pt-2 animate-in fade-in duration-300">
              <button
                onClick={saveCurrentTab}
                className="px-6 py-2 bg-primary/10 text-primary font-bold rounded-lg border border-primary/20 hover:bg-primary hover:text-white transition-all shadow-sm"
              >
                Save {eoiType} Details
              </button>
            </div>
          )}
          {eoiType && forms[eoiType] && forms[eoiType].isSaved && (
            <div className="flex justify-end pt-2 items-center gap-2 text-green-600 font-semibold text-sm animate-in fade-in duration-300">
              <CheckCircle2 size={16} /> Data saved for {eoiType}. You can fill another type or click Send.
            </div>
          )}

          {/* Error - Hidden from bottom (moved to top) */}
        </div>

        {/* ── Footer ── */}
        {!showConfirm && (
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
                  <><Send size={15} /> Send EOI to {isSelectAll ? "All" : selectedIds.length}</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
