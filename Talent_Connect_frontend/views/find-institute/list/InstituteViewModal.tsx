"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  Building2,
  Users,
  Landmark,
  ShieldCheck,
  Hash,
  ExternalLink,
  Send,
} from "lucide-react";

/* ─── Types ─────────────────────────────────────────────────────────────────── */
export interface Institute {
  institute_id: number;
  institute_name: string;
  email?: string;
  mobileno?: string;
  district?: string;
  state?: string;
  pincode?: string;
  address?: string;
  google_map_link?: string;
  type?: string;
  ownership?: string;
  student_count?: number;
  course_count?: number;
  established_year?: number;
  website?: string;
  affiliation?: string;
  naac_grade?: string;
}

interface InstituteViewModalProps {
  open: boolean;
  setOpen: (val: boolean) => void;
  institute: Institute | null;
  /** Optional: callback to trigger "Send Offer" from this modal */
  onSendOffer?: (institute: Institute) => void;
}

/* ─── Helper ─────────────────────────────────────────────────────────────────── */
function InfoRow({
  icon: Icon,
  label,
  value,
  href,
  mono,
}: {
  icon: any;
  label: string;
  value?: string | number | null;
  href?: string;
  mono?: boolean;
}) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-base-200 dark:border-base-800 last:border-0 group">
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon size={15} className="text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-base-content/40 mb-0.5">
          {label}
        </p>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-sm font-medium text-primary hover:underline flex items-center gap-1 ${mono ? "font-mono" : ""}`}
          >
            {String(value)}
            <ExternalLink size={11} className="opacity-60" />
          </a>
        ) : (
          <p
            className={`text-sm font-semibold text-base-content ${mono ? "font-mono" : ""}`}
          >
            {String(value)}
          </p>
        )}
      </div>
    </div>
  );
}

function Badge({
  label,
  color,
}: {
  label: string;
  color: "primary" | "success" | "warning" | "secondary" | "accent";
}) {
  const colorMap = {
    primary: "bg-primary/10 text-primary border-primary/20",
    success: "bg-success/10 text-success border-success/20",
    warning: "bg-warning/10 text-warning border-warning/20",
    secondary: "bg-secondary/10 text-secondary border-secondary/20",
    accent: "bg-accent/10 text-accent border-accent/20",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${colorMap[color]}`}
    >
      {label}
    </span>
  );
}

/* ─── Modal ──────────────────────────────────────────────────────────────────── */
export function InstituteViewModal({
  open,
  setOpen,
  institute,
  onSendOffer,
}: InstituteViewModalProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    if (open) setVisible(true);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => setOpen(false), 200);
  };

  if (!mounted || !open || !institute) return null;

  /* ── Derive avatar initials ── */
  const initials = institute.institute_name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  /* ── Contact href helpers ── */
  const emailHref = institute.email ? `mailto:${institute.email}` : undefined;
  const phoneHref = institute.mobileno
    ? `tel:${institute.mobileno}`
    : undefined;
  const websiteHref = institute.website
    ? institute.website.startsWith("http")
      ? institute.website
      : `https://${institute.website}`
    : undefined;

  /* ── Map link helper ── */
  const mapHref = institute.google_map_link
    ? institute.google_map_link.startsWith("http")
      ? institute.google_map_link
      : `https://${institute.google_map_link}`
    : undefined;

  /* ── Location string ── */
  const locationParts = [
    institute.district,
    institute.state,
    institute.pincode,
  ].filter(Boolean);
  const location = locationParts.length ? locationParts.join(", ") : null;

  return createPortal(
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-opacity duration-200 ${visible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)" }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        className={`
          relative w-full max-w-lg flex flex-col
          bg-base-100 dark:bg-base-900
          border border-base-300 dark:border-base-700
          rounded-2xl shadow-2xl overflow-hidden
          transition-all duration-200
          ${visible ? "translate-y-0 scale-100 opacity-100" : "translate-y-5 scale-[0.97] opacity-0"}
        `}
        role="dialog"
        aria-modal="true"
      >
        {/* ── Top accent bar ── */}
        <div className="h-1 w-full bg-gradient-to-r from-primary via-secondary to-accent flex-shrink-0" />

        {/* ── Header ── */}
        <div className="relative px-6 pt-6 pb-4 border-b border-base-200 dark:border-base-800 bg-base-100 dark:bg-base-900">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-lg border border-base-300 dark:border-base-700 bg-base-200 dark:bg-base-800 text-base-content/50 hover:border-error/40 hover:bg-error/10 hover:text-error flex items-center justify-center transition-all duration-200 z-10"
            aria-label="Close"
          >
            <X size={14} />
          </button>

          <h2 className="text-xl font-bold text-base-content pr-8 mb-2.5">
            {institute.institute_name}
          </h2>
          <div className="flex flex-wrap gap-2">
            {institute.type && <Badge label={institute.type} color="primary" />}
            {institute.ownership && <Badge label={institute.ownership} color="primary" />}
          </div>
        </div>

        {/* ── Body ── */}
        <div className="px-6 py-6 flex-1 overflow-y-auto bg-base-200/30 dark:bg-base-900">

          {/* Stats Row */}
          <div className="flex gap-3 mb-7">
            <div className="flex-1 bg-base-100 dark:bg-base-900 border border-base-300 dark:border-base-800 shadow-sm rounded-xl p-3 text-center">
              <p className="text-[11px] font-bold text-base-content/50 uppercase tracking-wider mb-1">Students</p>
              <p className="text-lg font-black text-base-content">{institute.student_count?.toLocaleString() || 'N/A'}</p>
            </div>
            <div className="flex-1 bg-base-100 dark:bg-base-900 border border-base-300 dark:border-base-800 shadow-sm rounded-xl p-3 text-center">
              <p className="text-[11px] font-bold text-base-content/50 uppercase tracking-wider mb-1">Courses</p>
              <p className="text-lg font-black text-base-content">{institute.course_count || '0'}</p>
            </div>
            <div className="flex-1 bg-base-100 dark:bg-base-900 border border-base-300 dark:border-base-800 shadow-sm rounded-xl p-3 text-center">
              <p className="text-[11px] font-bold text-base-content/50 uppercase tracking-wider mb-1">Rank</p>
              <p className="text-lg font-black text-base-content">Coming Soon</p>
            </div>
          </div>



          {/* Location */}
          <div>
            <h3 className="text-sm font-bold text-base-content/60 mb-3.5">Location</h3>
            <div className="flex gap-4 items-stretch">
              <div className="flex-1 space-y-3.5">
                <div className="flex items-start">
                  <span className="text-sm font-bold text-base-content/60 w-24 pt-1.5">District</span>
                  <div className="flex-1 bg-base-100 dark:bg-base-900 shadow-inner border border-base-300 dark:border-base-800 rounded-lg px-3 py-2 text-sm font-medium min-h-[38px] text-base-content/90">
                    {institute.district || 'N/A'}
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-sm font-bold text-base-content/60 w-24 pt-1.5">Address</span>
                  <div className="flex-1 bg-base-100 dark:bg-base-900 shadow-inner border border-base-300 dark:border-base-800 rounded-lg px-3 py-2 text-sm font-medium min-h-[58px] text-base-content/90">
                    {institute.address || 'N/A'}
                  </div>
                </div>
              </div>

              <a
                href={mapHref}
                target="_blank"
                rel="noopener noreferrer"
                role="button"
                className={`flex flex-col items-center justify-center gap-2 w-28 rounded-xl border-2 transition-all shadow-sm group relative ${mapHref
                  ? "border-base-300 dark:border-base-800 bg-base-100 dark:bg-base-900 hover:border-primary/50 text-base-content/70 hover:text-primary cursor-pointer"
                  : "border-base-200 dark:border-base-800 bg-base-200/50 dark:bg-base-800/50 text-base-content/30 cursor-not-allowed pointer-events-none"
                  }`}
                title={!mapHref ? "Location link not available" : ""}
                onMouseDown={(e) => {
                  if (!mapHref) e.preventDefault();
                }}
              >
                <MapPin size={24} className="mb-1" />
                <span className="text-[11px] font-bold text-center leading-tight">Map<br />Location</span>

                {!mapHref && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Location link not available
                  </div>
                )}
              </a>
            </div>
          </div>

        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-base-200 dark:border-base-800 bg-base-200/40 dark:bg-base-800/40 flex-shrink-0">
          <button
            onClick={handleClose}
            className="px-5 h-10 rounded-xl border border-base-300 dark:border-base-700 bg-base-100 dark:bg-base-900 text-sm font-bold text-base-content hover:bg-base-200 dark:hover:bg-base-800 transition-colors shadow-sm"
          >
            Close
          </button>

          <button
            onClick={() => { }}
            className="h-10 px-6 rounded-xl bg-primary text-base-100 text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-opacity shadow-md"
          >
            Coming soon
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
