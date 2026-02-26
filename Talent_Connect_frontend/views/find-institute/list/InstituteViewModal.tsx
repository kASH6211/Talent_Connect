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
  type?: string;
  ownership?: string;
  student_count?: number;
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

  /* ── Location string ── */
  const locationParts = [
    institute.district,
    institute.state,
    institute.pincode,
  ].filter(Boolean);
  const location = locationParts.length ? locationParts.join(", ") : null;

  return createPortal(
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-opacity duration-200 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
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
        <div className="relative px-6 pt-6 pb-5 border-b border-base-200 dark:border-base-800 overflow-hidden">
          {/* Subtle background blob */}
          <div className="absolute -top-8 -right-8 w-40 h-40 bg-primary/6 rounded-full blur-2xl pointer-events-none" />

          {/* Close */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-lg border border-base-300 dark:border-base-700 bg-base-200 dark:bg-base-800 text-base-content/50 hover:border-error/40 hover:bg-error/10 hover:text-error flex items-center justify-center transition-all duration-200 z-10"
            aria-label="Close"
          >
            <X size={14} />
          </button>

          <div className="flex items-start gap-4 relative">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/25 flex-shrink-0 select-none">
              <span className="text-xl font-black text-white tracking-tight">
                {initials}
              </span>
            </div>

            <div className="flex-1 min-w-0 pt-0.5">
              <h2 className="text-lg font-bold text-base-content leading-tight pr-8">
                {institute.institute_name}
              </h2>

              {/* Badges row */}
              <div className="flex flex-wrap gap-2 mt-2.5">
                {institute.type && (
                  <Badge label={institute.type} color="primary" />
                )}
                {institute.ownership && (
                  <Badge label={institute.ownership} color="secondary" />
                )}
                {institute.naac_grade && (
                  <Badge
                    label={`NAAC ${institute.naac_grade}`}
                    color="success"
                  />
                )}
                {institute.affiliation && (
                  <Badge label={institute.affiliation} color="warning" />
                )}
              </div>
            </div>
          </div>

          {/* Student count pill + ID */}
          <div className="flex items-center gap-3 mt-4">
            {institute.student_count !== undefined &&
              institute.student_count !== null && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-base-200 dark:bg-base-800 border border-base-300 dark:border-base-700">
                  <Users size={13} className="text-primary" />
                  <span className="text-xs font-bold text-base-content/80">
                    {institute.student_count.toLocaleString()} students
                  </span>
                </div>
              )}
            {institute.established_year && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-base-200 dark:bg-base-800 border border-base-300 dark:border-base-700">
                <Landmark size={13} className="text-secondary" />
                <span className="text-xs font-bold text-base-content/80">
                  Est. {institute.established_year}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-base-200 dark:bg-base-800 border border-base-300 dark:border-base-700 ml-auto">
              <Hash size={12} className="text-base-content/40" />
              <span className="text-xs font-mono text-base-content/50">
                {institute.institute_id}
              </span>
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="px-6 py-2 flex-1 overflow-y-auto">
          {/* Contact section */}
          <div className="pt-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-base-content/40 py-2">
              Contact
            </p>
            <InfoRow
              icon={Mail}
              label="Email"
              value={institute.email}
              href={emailHref}
              mono
            />
            <InfoRow
              icon={Phone}
              label="Mobile"
              value={institute.mobileno}
              href={phoneHref}
              mono
            />
          </div>

          {/* Location section */}
          {(location || institute.address) && (
            <div className="pt-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-base-content/40 py-2">
                Location
              </p>
              <InfoRow
                icon={MapPin}
                label="District / State"
                value={location}
              />
              <InfoRow
                icon={Building2}
                label="Address"
                value={institute.address}
              />
            </div>
          )}

          {/* Details section */}
          {(institute.website ||
            institute.affiliation ||
            institute.naac_grade) && (
            <div className="pt-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-base-content/40 py-2">
                Details
              </p>
              <InfoRow
                icon={ExternalLink}
                label="Website"
                value={institute.website}
                href={websiteHref}
              />
              <InfoRow
                icon={ShieldCheck}
                label="NAAC Grade"
                value={institute.naac_grade}
              />
              <InfoRow
                icon={GraduationCap}
                label="Affiliated To"
                value={institute.affiliation}
              />
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-base-200 dark:border-base-800 bg-base-200/40 dark:bg-base-800/40 flex-shrink-0">
          <button
            onClick={handleClose}
            className="px-4 h-9 rounded-lg border border-base-300 dark:border-base-700 bg-base-100 dark:bg-base-900 text-sm font-medium text-base-content hover:bg-base-200 dark:hover:bg-base-800 transition-colors"
          >
            Close
          </button>

          {onSendOffer && (
            <button
              onClick={() => {
                onSendOffer(institute);
                handleClose();
              }}
              className="h-9 px-5 rounded-lg bg-primary hover:brightness-110 text-primary-content text-sm font-semibold flex items-center gap-2 shadow-md shadow-primary/25 transition-all"
            >
              <Send size={14} />
              Send Job Offer
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
