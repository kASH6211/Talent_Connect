"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useDispatch } from "react-redux";
import { Send, X, Loader2, CalendarClock, Briefcase } from "lucide-react";

import api from "@/lib/api"; // adjust path
import { AppDispatch } from "@/store/store";
import { updateUiInstitute } from "@/store/institute";
import MultiSelectDropdown from "@/components/MultiSelectDropdown";

/* ─────────────────────────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────────────────────────── */
interface Option {
  label: string;
  value: number;
}

interface Filters {
  qualification_ids: number[];
  program_ids: number[];
  stream_ids: number[];
}

/* ─────────────────────────────────────────────────────────────────────────────
   Component
───────────────────────────────────────────────────────────────────────────── */
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

  if (!mounted || !isOpen) return null;

  return createPortal(
    <>
      <style>{`
        /* ── Imports ── */
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

        /* ── Tokens ── */
        .om2-root {
          --om-primary:       var(--color-primary,       #2563eb);
          --om-primary-light: var(--color-primary-light, #eff6ff);
          --om-primary-mid:   var(--color-primary-mid,   #bfdbfe);
          --om-accent:        var(--color-accent,        #0ea5e9);
          --om-danger:        var(--color-danger,        #ef4444);
          --om-surface:       var(--color-surface,       #ffffff);
          --om-surface-2:     var(--color-surface-2,     #f8fafc);
          --om-border:        var(--color-border,        #e2e8f0);
          --om-text:          var(--color-text,          #0f172a);
          --om-text-muted:    var(--color-text-muted,    #475569);
          --om-text-subtle:   var(--color-text-subtle,   #64748b);
          --om-radius:        var(--radius,              12px);
          --om-shadow:        0 24px 80px rgba(15,23,42,0.14), 0 4px 20px rgba(15,23,42,0.08);

          font-family: 'DM Sans', sans-serif;
          box-sizing: border-box;
        }
        .om2-root *, .om2-root *::before, .om2-root *::after { box-sizing: inherit; }

        /* ── Backdrop ── */
        @keyframes om2-fade-in  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes om2-fade-out { from { opacity: 1; } to { opacity: 0; } }
        @keyframes om2-slide-in {
          from { opacity: 0; transform: translateY(16px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
        @keyframes om2-slide-out {
          from { opacity: 1; transform: translateY(0)   scale(1);    }
          to   { opacity: 0; transform: translateY(12px) scale(0.98); }
        }

        .om2-backdrop {
          position: fixed; inset: 0; z-index: 9999;
          background: rgba(15,23,42,0.35);
          backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          padding: 16px;
        }
        .om2-backdrop[data-open="true"]  { animation: om2-fade-in  0.18s ease both; }
        .om2-backdrop[data-open="false"] { animation: om2-fade-out 0.18s ease both; }

        /* ── Panel ── */
        .om2-panel {
          background: var(--om-surface);
          border-radius: 20px;
          box-shadow: var(--om-shadow);
          width: 100%; max-width: 760px;          /* ← even wider */
          max-height: 92vh;
          display: flex; flex-direction: column;
          border: 1px solid var(--om-border);
          overflow: hidden;
          position: relative;
        }
        .om2-panel[data-open="true"]  { animation: om2-slide-in 0.22s cubic-bezier(0.16,1,0.3,1) both; }
        .om2-panel[data-open="false"] { animation: om2-slide-out 0.18s ease both; }

        /* Decorative top stripe */
        .om2-stripe {
          height: 4px;
          background: linear-gradient(90deg, var(--om-primary) 0%, var(--om-accent) 100%);
          flex-shrink: 0;
        }

        /* ── Header ── */
        .om2-header {
          padding: 26px 30px 22px;
          border-bottom: 1px solid var(--om-border);
          flex-shrink: 0;
        }
        .om2-hrow {
          display: flex; align-items: center;
          justify-content: space-between; gap: 18px;
          margin-bottom: 18px;
        }
        .om2-hleft { display: flex; align-items: center; gap: 18px; }

        .om2-icon {
          width: 52px; height: 52px;
          border-radius: 14px;
          background: var(--om-primary-light);
          border: 1px solid var(--om-primary-mid);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        .om2-title {
          // font-family: 'Instrument Serif', serif;
          font-size: 26px;                    /* bigger & bolder */
          font-weight: 600;
          color: var(--om-text);
          margin: 0 0 4px;
          line-height: 1.2;
          letter-spacing: -0.4px;
        }
        .om2-subtitle {
          font-size: 15px;                    /* medium & clear */
          color: var(--om-text-muted);
          margin: 0;
          font-weight: 500;
        }

        .om2-xbtn {
          width: 40px; height: 40px;
          border-radius: 10px;
          border: 1px solid var(--om-border);
          background: transparent;
          color: var(--om-text-muted);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; flex-shrink: 0;
          transition: all 0.15s;
        }
        .om2-xbtn:hover {
          background: #fef2f2;
          border-color: #fecaca;
          color: var(--om-danger);
        }

        /* Recipients row */
        .om2-recip-label {
          font-size: 12px; font-weight: 700; letter-spacing: 1.2px;
          text-transform: uppercase; color: var(--om-text-muted);
          margin-bottom: 12px;
        }
        .om2-chips { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }

        .om2-count-badge {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 6px 14px 6px 6px;
          border-radius: 24px;
          background: var(--om-primary-light);
          border: 1px solid var(--om-primary-mid);
          font-size: 14px; font-weight: 600; color: var(--om-primary);
        }
        .om2-count-num {
          width: 26px; height: 26px;
          border-radius: 8px;
          background: var(--om-primary);
          color: #fff;
          font-size: 13px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
        }

        .om2-chip {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 5px 14px;
          border-radius: 10px;
          background: var(--om-surface-2);
          border: 1px solid var(--om-border);
          font-size: 14px; color: var(--om-text-muted);
          font-weight: 500;
        }
        .om2-chip-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: var(--om-primary); flex-shrink: 0;
        }
        .om2-chip-more { color: var(--om-text-muted); font-style: italic; }

        /* ── Body ── */
        .om2-body {
          flex: 1; overflow-y: auto; padding: 30px 32px;
          scrollbar-width: thin;
          scrollbar-color: var(--om-border) transparent;
        }
        .om2-body::-webkit-scrollbar { width: 6px; }
        .om2-body::-webkit-scrollbar-thumb { background: var(--om-border); border-radius: 6px; }

        /* Section */
        .om2-sec { margin-bottom: 32px; }
        .om2-sec-title {
          font-size: 13px; font-weight: 700; letter-spacing: 1.3px;
          text-transform: uppercase; color: var(--om-text-muted);
          margin-bottom: 18px;
          display: flex; align-items: center; gap: 12px;
        }
        .om2-sec-title::after {
          content: ''; flex: 1; height: 1px; background: var(--om-border);
        }

        /* Field */
        .om2-field { margin-bottom: 20px; }
        .om2-lbl {
          display: block;
          font-size: 14px; font-weight: 600;        /* darker & medium */
          color: var(--om-text);
          margin-bottom: 8px;
        }
        .om2-req { color: var(--om-danger); margin-left: 3px; }

        .om2-inp, .om2-ta {
          width: 100%;
          background: var(--om-surface);
          border: 1px solid var(--om-border);
          border-radius: 12px;
          padding: 13px 18px;
          font-size: 15px;                          /* readable medium size */
          font-family: 'DM Sans', sans-serif;
          color: var(--om-text);
          outline: none;
          transition: border-color 0.16s, box-shadow 0.16s, background 0.16s;
        }
        .om2-inp::placeholder, .om2-ta::placeholder { 
          color: #9ca3af; 
          font-size: 15px; 
        }
        .om2-inp:hover:not(:focus), .om2-ta:hover:not(:focus) {
          border-color: #cbd5e1;
        }
        .om2-inp:focus, .om2-ta:focus {
          border-color: var(--om-primary);
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--om-primary) 16%, transparent);
          background: white;
        }
        .om2-ta { resize: vertical; min-height: 110px; line-height: 1.6; }
        .om2-inp[type="number"] { -moz-appearance: textfield; }
        .om2-inp[type="number"]::-webkit-inner-spin-button,
        .om2-inp[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; }
        .om2-inp[type="date"]::-webkit-calendar-picker-indicator {
          cursor: pointer; opacity: 0.6;
        }

        /* Prefix wrapper */
        .om2-pfx-wrap { position: relative; }
        .om2-pfx {
          position: absolute; left: 16px; top: 50%; transform: translateY(-50%);
          font-size: 15px; font-weight: 600; color: var(--om-text-muted);
          pointer-events: none;
        }
        .om2-pfx-wrap .om2-inp { padding-left: 38px; }

        /* 3-col grid */
        .om2-g3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }

        /* Date */
        .om2-date-wrap { position: relative; }
        .om2-date-icon {
          position: absolute; right: 16px; top: 50%; transform: translateY(-50%);
          color: var(--om-text-muted); pointer-events: none;
        }
        .om2-date-wrap .om2-inp { padding-right: 48px; }

        /* Error */
        .om2-err {
          display: flex; align-items: center; gap: 12px;
          padding: 14px 18px;
          border-radius: 12px;
          background: #fef2f2; border: 1px solid #fecaca;
          color: #b91c1c; font-size: 15px;
          margin-bottom: 24px;
        }
        .om2-err-ic {
          width: 26px; height: 26px; border-radius: 50%;
          background: #fee2e2;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        /* ── Footer ── */
        .om2-footer {
          padding: 20px 30px;
          border-top: 1px solid var(--om-border);
          background: var(--om-surface-2);
          display: flex; align-items: center; justify-content: space-between;
          gap: 16px; flex-shrink: 0; flex-wrap: wrap;
        }
        .om2-note {
          font-size: 14px; color: var(--om-text-muted);
          display: flex; align-items: center; gap: 10px;
        }
        .om2-actions { display: flex; align-items: center; gap: 14px; }

        .om2-cancel {
          padding: 11px 22px;
          border-radius: 10px;
          border: 1px solid var(--om-border);
          background: var(--om-surface);
          color: var(--om-text);
          font-size: 15px; font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all 0.15s;
        }
        .om2-cancel:hover:not(:disabled) {
          background: var(--om-surface-2);
          border-color: #cbd5e1;
        }
        .om2-cancel:disabled { opacity: 0.4; cursor: not-allowed; }

        .om2-send {
          display: flex; align-items: center; gap: 10px;
          padding: 12px 26px;
          border-radius: 12px; border: none;
          background: var(--om-primary);
          color: #fff;
          font-size: 15px; font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all 0.15s;
          box-shadow: 0 4px 16px color-mix(in srgb, var(--om-primary) 40%, transparent);
        }
        .om2-send:hover:not(:disabled) {
          opacity: 0.92; transform: translateY(-1.5px);
          box-shadow: 0 8px 24px color-mix(in srgb, var(--om-primary) 45%, transparent);
        }
        .om2-send:active:not(:disabled) { transform: translateY(0); }
        .om2-send:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }

        @keyframes om2-spin { to { transform: rotate(360deg); } }
        .om2-spin { animation: om2-spin 0.75s linear infinite; }

        /* ── Responsive ── */
        @media (max-width: 520px) {
          .om2-panel { border-radius: 16px; }
          .om2-header, .om2-body, .om2-footer { padding-left: 20px; padding-right: 20px; }
          .om2-g3 { grid-template-columns: 1fr 1fr; }
          .om2-g3 .om2-field:last-child { grid-column: span 2; }
          .om2-title { font-size: 22px; }
        }
      `}</style>

      <div
        className="om2-root om2-backdrop"
        data-open={String(visible)}
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) handleClose();
        }}
      >
        <div
          className="om2-panel"
          data-open={String(visible)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="om2-title"
        >
          <div className="om2-stripe" />

          <div className="om2-header">
            <div className="om2-hrow">
              <div className="om2-hleft">
                <div className="om2-icon">
                  <Briefcase size={24} color="var(--om-primary)" />
                </div>
                <div>
                  <h2 className="om2-title" id="om2-title">
                    Send Bulk Job Offer
                  </h2>
                  <p className="om2-subtitle">
                    Dispatch to all selected institutes at once
                  </p>
                </div>
              </div>
              <button
                className="om2-xbtn"
                onClick={handleClose}
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            <div className="om2-recip-label">Recipients</div>
            <div className="om2-chips">
              <span className="om2-count-badge">
                <span className="om2-count-num">{selectedIds.length}</span>
                institute{selectedIds.length !== 1 ? "s" : ""}
              </span>
              {selectedIds.slice(0, 5).map((id) => (
                <span key={id} className="om2-chip">
                  <span className="om2-chip-dot" />
                  {institutesMap.get(id) || `#${id}`}
                </span>
              ))}
              {selectedIds.length > 5 && (
                <span className="om2-chip om2-chip-more">
                  +{selectedIds.length - 5} more
                </span>
              )}
            </div>
          </div>

          <div className="om2-body">
            <div className="om2-sec">
              <div className="om2-sec-title">Job Details</div>

              <div className="om2-field">
                <label className="om2-lbl">
                  Job Title<span className="om2-req">*</span>
                </label>
                <input
                  type="text"
                  className="om2-inp"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Software Engineer, Marketing Lead"
                />
              </div>

              <div className="om2-field">
                <label className="om2-lbl">Description</label>
                <textarea
                  className="om2-ta"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Role overview, responsibilities, skills required..."
                />
              </div>
            </div>

            <div className="om2-sec">
              <div className="om2-sec-title">Compensation & Openings</div>
              <div className="om2-g3">
                <div className="om2-field">
                  <label className="om2-lbl">Min Salary</label>
                  <div className="om2-pfx-wrap">
                    <span className="om2-pfx">₹</span>
                    <input
                      type="number"
                      className="om2-inp"
                      value={salaryMin}
                      onChange={(e) => setSalaryMin(e.target.value)}
                      placeholder="300000"
                    />
                  </div>
                </div>
                <div className="om2-field">
                  <label className="om2-lbl">Max Salary</label>
                  <div className="om2-pfx-wrap">
                    <span className="om2-pfx">₹</span>
                    <input
                      type="number"
                      className="om2-inp"
                      value={salaryMax}
                      onChange={(e) => setSalaryMax(e.target.value)}
                      placeholder="600000"
                    />
                  </div>
                </div>
                <div className="om2-field">
                  <label className="om2-lbl">No. of Posts</label>
                  <input
                    type="number"
                    className="om2-inp"
                    value={numberOfPosts}
                    onChange={(e) => setNumberOfPosts(e.target.value)}
                    placeholder="5"
                  />
                </div>
              </div>
            </div>

            <div className="om2-sec">
              <div className="om2-sec-title">Candidate Requirements</div>

              <div className="om2-field">
                <label className="om2-lbl">Qualifications</label>
                <MultiSelectDropdown
                  label="Qualification"
                  options={qualOptions}
                  selected={qualIds}
                  onChange={setQualIds}
                  placeholder="Any qualification"
                />
              </div>
              <div className="om2-field">
                <label className="om2-lbl">Programs</label>
                <MultiSelectDropdown
                  label="Program"
                  options={programOptions}
                  selected={programIds}
                  onChange={setProgramIds}
                  placeholder="Any program"
                />
              </div>
              <div className="om2-field">
                <label className="om2-lbl">Streams / Branches</label>
                <MultiSelectDropdown
                  label="Stream"
                  options={streamOptions}
                  selected={streamIds}
                  onChange={setStreamIds}
                  placeholder="Any stream"
                />
              </div>
            </div>

            <div className="om2-sec">
              <div className="om2-sec-title">Timeline</div>
              <div className="om2-field">
                <label className="om2-lbl">Last Date to Apply</label>
                <div className="om2-date-wrap">
                  <input
                    type="date"
                    className="om2-inp"
                    value={lastDate}
                    onChange={(e) => setLastDate(e.target.value)}
                  />
                  <CalendarClock size={16} className="om2-date-icon" />
                </div>
              </div>
            </div>

            {error && (
              <div className="om2-err">
                <div className="om2-err-ic">
                  <X size={13} color="#b91c1c" />
                </div>
                {error}
              </div>
            )}
          </div>

          <div className="om2-footer">
            <div className="om2-note">
              <Send size={13} />
              Delivered instantly to all institutes
            </div>
            <div className="om2-actions">
              <button
                className="om2-cancel"
                onClick={handleClose}
                disabled={sending}
              >
                Cancel
              </button>
              <button
                className="om2-send"
                onClick={handleSend}
                disabled={sending}
              >
                {sending ? (
                  <>
                    <Loader2 size={16} className="om2-spin" /> Sending...
                  </>
                ) : (
                  <>
                    <Send size={16} /> Send to {selectedIds.length} institute
                    {selectedIds.length !== 1 ? "s" : ""}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}
