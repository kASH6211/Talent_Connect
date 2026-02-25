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
  CalendarClock,
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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

        .om-root * { box-sizing: border-box; }
        .om-root { font-family: 'DM Sans', sans-serif; }

        @keyframes om-panel-in {
          from { opacity: 0; transform: translateY(24px) scale(0.975); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* Outer wrapper – fills CommonModal's content area */
        .om-shell {
          position: relative;
          background: #0c0a1d;
          border-radius: 20px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          max-height: 90vh;
          animation: om-panel-in 0.35s cubic-bezier(0.16,1,0.3,1) both;
        }

        /* Ambient orbs */
        .om-orb {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          filter: blur(70px);
        }
        .om-orb-1 { width: 260px; height: 260px; top: -100px; right: -80px; background: rgba(124,58,237,0.22); }
        .om-orb-2 { width: 180px; height: 180px; bottom: 0; left: -60px; background: rgba(79,70,229,0.18); }

        /* Top accent line */
        .om-accent-bar {
          height: 2px;
          background: linear-gradient(90deg,transparent,#8b5cf6 30%,#a78bfa 55%,#8b5cf6 75%,transparent);
          flex-shrink: 0;
        }

        /* ─── Header ─────────────────────────────────────────── */
        .om-header {
          padding: 26px 30px 22px;
          border-bottom: 1px solid rgba(255,255,255,0.055);
          flex-shrink: 0;
          position: relative;
          z-index: 1;
        }
        .om-header-row {
          display: flex; align-items: flex-start; justify-content: space-between; gap: 14px;
          margin-bottom: 18px;
        }
        .om-hd-left { display: flex; align-items: center; gap: 14px; }
        .om-icon-box {
          width: 46px; height: 46px;
          border-radius: 13px;
          background: linear-gradient(140deg,#7c3aed 0%,#4f46e5 100%);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 6px 22px rgba(124,58,237,0.45);
        }
        .om-title {
          font-family: 'Syne', sans-serif;
          font-size: 19px;
          font-weight: 700;
          color: #ede9fe;
          letter-spacing: -0.25px;
          margin: 0 0 2px;
          line-height: 1.2;
        }
        .om-subtitle {
          font-size: 12.5px;
          color: rgba(255,255,255,0.32);
          margin: 0;
        }
        .om-x-btn {
          width: 34px; height: 34px;
          border-radius: 9px;
          border: 1px solid rgba(255,255,255,0.09);
          background: rgba(255,255,255,0.03);
          color: rgba(255,255,255,0.38);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: all 0.17s;
          flex-shrink: 0;
        }
        .om-x-btn:hover {
          background: rgba(239,68,68,0.12);
          border-color: rgba(239,68,68,0.28);
          color: #f87171;
        }

        /* Institute chips */
        .om-chips-heading {
          font-size: 10px; font-weight: 700; letter-spacing: 1.1px;
          text-transform: uppercase; color: rgba(255,255,255,0.25);
          margin-bottom: 9px;
        }
        .om-chips-row { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
        .om-badge-count {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 4px 11px 4px 5px;
          border-radius: 20px;
          background: rgba(139,92,246,0.12);
          border: 1px solid rgba(139,92,246,0.22);
          color: #c4b5fd;
          font-size: 12px; font-weight: 600;
        }
        .om-badge-count-num {
          width: 22px; height: 22px;
          border-radius: 6px;
          background: linear-gradient(135deg,#7c3aed,#6366f1);
          color: #fff; font-size: 11px; font-weight: 800;
          display: flex; align-items: center; justify-content: center;
        }
        .om-chip {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 10px;
          border-radius: 7px;
          background: rgba(139,92,246,0.08);
          border: 1px solid rgba(139,92,246,0.18);
          font-size: 11.5px; font-weight: 500; color: #a78bfa;
        }
        .om-chip-dot { width: 4px; height: 4px; border-radius: 50%; background: #8b5cf6; flex-shrink: 0; }
        .om-chip-more {
          background: rgba(255,255,255,0.04);
          border-color: rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.28);
        }

        /* ─── Body ───────────────────────────────────────────── */
        .om-body {
          flex: 1; overflow-y: auto; padding: 26px 30px;
          position: relative; z-index: 1;
          scrollbar-width: thin;
          scrollbar-color: rgba(139,92,246,0.28) transparent;
        }
        .om-body::-webkit-scrollbar { width: 4px; }
        .om-body::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.28); border-radius: 4px; }

        /* Section */
        .om-sec { margin-bottom: 26px; }
        .om-sec-label {
          font-size: 10px; font-weight: 700; letter-spacing: 1.1px;
          text-transform: uppercase; color: rgba(255,255,255,0.22);
          margin-bottom: 14px;
          display: flex; align-items: center; gap: 10px;
        }
        .om-sec-label::after {
          content: ''; flex: 1; height: 1px; background: rgba(255,255,255,0.055);
        }

        /* Fields */
        .om-field { margin-bottom: 16px; }
        .om-lbl {
          display: block;
          font-size: 11.5px; font-weight: 500;
          color: rgba(255,255,255,0.42);
          margin-bottom: 7px; letter-spacing: 0.15px;
        }
        .om-lbl-req { color: #f87171; margin-left: 2px; }

        .om-inp, .om-ta {
          width: 100%;
          background: rgba(255,255,255,0.035);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 11px;
          padding: 11px 15px;
          font-size: 13.5px;
          font-family: 'DM Sans', sans-serif;
          color: #f5f3ff;
          outline: none;
          transition: border-color 0.18s, background 0.18s, box-shadow 0.18s;
        }
        .om-inp::placeholder, .om-ta::placeholder { color: rgba(255,255,255,0.18); }
        .om-inp:focus, .om-ta:focus {
          border-color: rgba(139,92,246,0.5);
          background: rgba(139,92,246,0.07);
          box-shadow: 0 0 0 3px rgba(139,92,246,0.1);
        }
        .om-inp:hover:not(:focus), .om-ta:hover:not(:focus) {
          border-color: rgba(255,255,255,0.13);
        }
        .om-ta { resize: vertical; min-height: 88px; line-height: 1.6; }

        .om-inp[type="number"]::-webkit-inner-spin-button,
        .om-inp[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; }
        .om-inp[type="number"] { -moz-appearance: textfield; }

        .om-inp[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(0.6) sepia(1) saturate(4) hue-rotate(220deg);
          cursor: pointer; opacity: 0.5;
        }

        /* Prefix wrapper */
        .om-inp-wrap { position: relative; }
        .om-inp-pfx {
          position: absolute; left: 13px; top: 50%;
          transform: translateY(-50%);
          font-size: 13px; font-weight: 600;
          color: rgba(255,255,255,0.22); pointer-events: none;
        }
        .om-inp-wrap .om-inp { padding-left: 26px; }

        /* 3-col grid */
        .om-g3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 13px; }
        @media (max-width: 520px) {
          .om-g3 { grid-template-columns: 1fr 1fr; }
          .om-g3 .om-field:last-child { grid-column: span 2; }
          .om-header { padding: 20px 18px 16px; }
          .om-body { padding: 20px 18px; }
          .om-footer { padding: 15px 18px; }
        }

        /* Date row */
        .om-date-wrap { position: relative; }
        .om-date-icon {
          position: absolute; right: 13px; top: 50%;
          transform: translateY(-50%);
          color: rgba(255,255,255,0.2); pointer-events: none;
        }

        /* Error */
        .om-err {
          display: flex; align-items: center; gap: 10px;
          padding: 11px 15px;
          border-radius: 10px;
          background: rgba(239,68,68,0.09);
          border: 1px solid rgba(239,68,68,0.2);
          color: #fca5a5; font-size: 13px;
          margin-bottom: 18px;
        }
        .om-err-ic {
          width: 20px; height: 20px; border-radius: 50%;
          background: rgba(239,68,68,0.18);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        /* ─── Footer ─────────────────────────────────────────── */
        .om-footer {
          padding: 18px 30px;
          border-top: 1px solid rgba(255,255,255,0.055);
          display: flex; align-items: center; justify-content: space-between; gap: 12px;
          flex-shrink: 0;
          background: rgba(0,0,0,0.18);
          position: relative; z-index: 1;
          flex-wrap: wrap;
        }
        .om-footer-note {
          font-size: 11.5px; color: rgba(255,255,255,0.2);
          display: flex; align-items: center; gap: 6px;
        }
        .om-footer-actions { display: flex; align-items: center; gap: 10px; }

        .om-cancel {
          padding: 10px 20px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.09);
          background: transparent;
          color: rgba(255,255,255,0.4);
          font-size: 13.5px; font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer; transition: all 0.17s;
        }
        .om-cancel:hover:not(:disabled) {
          background: rgba(255,255,255,0.05);
          border-color: rgba(255,255,255,0.16);
          color: rgba(255,255,255,0.65);
        }
        .om-cancel:disabled { opacity: 0.35; cursor: not-allowed; }

        .om-send {
          display: flex; align-items: center; gap: 8px;
          padding: 11px 22px;
          border-radius: 11px; border: none;
          background: linear-gradient(135deg,#7c3aed 0%,#5b48e8 100%);
          color: #fff;
          font-size: 13.5px; font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer; transition: all 0.2s;
          box-shadow: 0 5px 18px rgba(124,58,237,0.42);
          position: relative; overflow: hidden;
        }
        .om-send::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg,rgba(255,255,255,0.13),transparent);
          opacity: 0; transition: opacity 0.17s;
        }
        .om-send:hover:not(:disabled)::after { opacity: 1; }
        .om-send:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 9px 26px rgba(124,58,237,0.52); }
        .om-send:active:not(:disabled) { transform: translateY(0); }
        .om-send:disabled { opacity: 0.55; cursor: not-allowed; transform: none; box-shadow: none; }

        @keyframes om-spin { to { transform: rotate(360deg); } }
        .om-spin { animation: om-spin 0.75s linear infinite; }
      `}</style>

      <CommonModal isOpen={isOpen} onClose={handleClose} title="" size="lg">
        <div className="om-root">
          <div className="om-shell">
            <div className="om-accent-bar" />
            <div className="om-orb om-orb-1" />
            <div className="om-orb om-orb-2" />

            {/* ── Header ── */}
            <div className="om-header">
              <div className="om-header-row">
                <div className="om-hd-left">
                  <div className="om-icon-box">
                    <Send size={19} color="#fff" />
                  </div>
                  <div>
                    <h2 className="om-title">Send Bulk Job Offer</h2>
                    <p className="om-subtitle">
                      Dispatch to all selected institutes at once
                    </p>
                  </div>
                </div>
                <button
                  className="om-x-btn"
                  onClick={handleClose}
                  aria-label="Close"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Institute chips */}
              <div className="om-chips-heading">Recipients</div>
              <div className="om-chips-row">
                <span className="om-badge-count">
                  <span className="om-badge-count-num">
                    {selectedIds.length}
                  </span>
                  institute{selectedIds.length !== 1 ? "s" : ""}
                </span>
                {selectedIds.slice(0, 5).map((id) => (
                  <span key={id} className="om-chip">
                    <span className="om-chip-dot" />
                    {institutesMap.get(id) || `Institute #${id}`}
                  </span>
                ))}
                {selectedIds.length > 5 && (
                  <span className={`om-chip om-chip-more`}>
                    +{selectedIds.length - 5} more
                  </span>
                )}
              </div>
            </div>

            {/* ── Body ── */}
            <div className="om-body">
              {/* Job Details */}
              <div className="om-sec">
                <div className="om-sec-label">Job Details</div>

                <div className="om-field">
                  <label className="om-lbl">
                    Job Title<span className="om-lbl-req">*</span>
                  </label>
                  <input
                    type="text"
                    className="om-inp"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Software Engineer, Marketing Lead"
                  />
                </div>

                <div className="om-field">
                  <label className="om-lbl">Description</label>
                  <textarea
                    className="om-ta"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Role overview, responsibilities, skills required..."
                  />
                </div>
              </div>

              {/* Compensation */}
              <div className="om-sec">
                <div className="om-sec-label">Compensation &amp; Openings</div>
                <div className="om-g3">
                  <div className="om-field">
                    <label className="om-lbl">Min Salary</label>
                    <div className="om-inp-wrap">
                      <span className="om-inp-pfx">₹</span>
                      <input
                        type="number"
                        className="om-inp"
                        value={salaryMin}
                        onChange={(e) => setSalaryMin(e.target.value)}
                        placeholder="300000"
                      />
                    </div>
                  </div>
                  <div className="om-field">
                    <label className="om-lbl">Max Salary</label>
                    <div className="om-inp-wrap">
                      <span className="om-inp-pfx">₹</span>
                      <input
                        type="number"
                        className="om-inp"
                        value={salaryMax}
                        onChange={(e) => setSalaryMax(e.target.value)}
                        placeholder="600000"
                      />
                    </div>
                  </div>
                  <div className="om-field">
                    <label className="om-lbl">No. of Posts</label>
                    <input
                      type="number"
                      className="om-inp"
                      value={numberOfPosts}
                      onChange={(e) => setNumberOfPosts(e.target.value)}
                      placeholder="5"
                    />
                  </div>
                </div>
              </div>

              {/* Requirements */}
              <div className="om-sec">
                <div className="om-sec-label">Candidate Requirements</div>

                <div className="om-field">
                  <label className="om-lbl">Qualifications</label>
                  <MultiSelectDropdown
                    label="Qualification"
                    options={qualOptions}
                    selected={qualIds}
                    onChange={setQualIds}
                    placeholder="Any qualification"
                  />
                </div>

                <div className="om-field">
                  <label className="om-lbl">Programs</label>
                  <MultiSelectDropdown
                    label="Program"
                    options={programOptions}
                    selected={programIds}
                    onChange={setProgramIds}
                    placeholder="Any program"
                  />
                </div>

                <div className="om-field">
                  <label className="om-lbl">Streams / Branches</label>
                  <MultiSelectDropdown
                    label="Stream"
                    options={streamOptions}
                    selected={streamIds}
                    onChange={setStreamIds}
                    placeholder="Any stream"
                  />
                </div>
              </div>

              {/* Timeline */}
              <div className="om-sec">
                <div className="om-sec-label">Timeline</div>
                <div className="om-field" style={{ maxWidth: "260px" }}>
                  <label className="om-lbl">Last Date to Apply</label>
                  <div className="om-date-wrap">
                    <input
                      type="date"
                      className="om-inp"
                      value={lastDate}
                      onChange={(e) => setLastDate(e.target.value)}
                      style={{ paddingRight: "42px" }}
                    />
                    <CalendarClock size={15} className="om-date-icon" />
                  </div>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="om-err">
                  <div className="om-err-ic">
                    <X size={11} color="#f87171" />
                  </div>
                  {error}
                </div>
              )}
            </div>

            {/* ── Footer ── */}
            <div className="om-footer">
              <div className="om-footer-note">
                <Send size={11} />
                Delivered instantly to all institutes
              </div>
              <div className="om-footer-actions">
                <button
                  className="om-cancel"
                  onClick={handleClose}
                  disabled={sending}
                >
                  Cancel
                </button>
                <button
                  className="om-send"
                  onClick={handleSend}
                  disabled={sending}
                >
                  {sending ? (
                    <>
                      <Loader2 size={14} className="om-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      Send to {selectedIds.length} institute
                      {selectedIds.length !== 1 ? "s" : ""}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </CommonModal>
    </>
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

        <OfferModalV2
          onClose={() => console.log("close")}
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
