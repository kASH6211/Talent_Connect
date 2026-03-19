"use client";

import { useState, FC } from "react";

/* ─────────────────────────────────────────
   HUNAR BRAND TOKENS
───────────────────────────────────────── */
const C = {
  primary: "#2141a4",
  primaryLight: "#2141a412",
  primaryMid: "#2141a428",
  secondary: "#fac015",
  accent: "#f98c1f",
  base100: "#eaeced",
  base200: "#f4f6f9",
  baseContent: "#111827",
  contentMuted: "#6b7280",
  contentFaint: "#9ca3af",
  white: "#ffffff",
  error: "#dc2626",
  errorLight: "#dc262612",
  success: "#16a34a",
  successLight: "#16a34a12",
  warning: "#facc15",
  warningLight: "#facc1515",
  border: "#e5e7eb",
  shadow: "0 1px 6px rgba(33,65,164,.09)",
} as const;

/* ─────────────────────────────────────────
   TYPES
───────────────────────────────────────── */
type MSMECategory = "Micro" | "Small" | "Medium" | "Large";
type ExperienceLevel = "Fresher" | "1–2 Years" | "2–5 Years" | "5+ Years";

interface TalentRequirement {
  id: string;
  jobTitle: string;
  skill: string;
  qualification: string;
  experience: ExperienceLevel;
  openings: number;
  sourceVacancy: string;
}

interface IndustrialUnit {
  id: string;
  name: string;
  address: string;
  district: string;
  state: string;
  pincode: string;
  lat: string;
  lng: string;
  isPrimary: boolean;
}

interface IndustryProfile {
  companyName: string;
  registrationNo: string;
  gstin: string;
  website: string;
  email: string;
  phone: string;
  sector: string;
  subSector: string;
  msmeCategory: MSMECategory;
  msmeUdyamNo: string;
  employeeCount: string;
  annualTurnover: string;
  about: string;
  units: IndustrialUnit[];
  talentRequirements: TalentRequirement[];
}

/* ─────────────────────────────────────────
   INITIAL DATA
───────────────────────────────────────── */
const INITIAL_PROFILE: IndustryProfile = {
  companyName: "TechNova Solutions Punjab",
  registrationNo: "CIN-U72900PB2018PTC047382",
  gstin: "03AABCT1234M1Z5",
  website: "www.technovasolutions.in",
  email: "hr@technovasolutions.in",
  phone: "+91 98765 43210",
  sector: "Information Technology",
  subSector: "Software Development & IT Services",
  msmeCategory: "Small",
  msmeUdyamNo: "UDYAM-PB-03-0012345",
  employeeCount: "51–200",
  annualTurnover: "₹5–10 Crore",
  about: "TechNova Solutions is a Punjab-based software and digital transformation company providing IT services, enterprise software, and skilled workforce solutions across North India.",
  units: [
    { id: "u1", name: "Head Office – Mohali", address: "Plot 42-B, Phase 8, Industrial Area", district: "SAS Nagar (Mohali)", state: "Punjab", pincode: "160071", lat: "30.7046", lng: "76.7179", isPrimary: true },
    { id: "u2", name: "Development Centre – Ludhiana", address: "SCO 15, Ferozepur Road", district: "Ludhiana", state: "Punjab", pincode: "141001", lat: "30.9010", lng: "75.8573", isPrimary: false },
  ],
  talentRequirements: [
    { id: "t1", jobTitle: "Junior Software Developer", skill: "React.js / Node.js", qualification: "B.Tech / BCA", experience: "Fresher", openings: 10, sourceVacancy: "JD-2026-001" },
    { id: "t2", jobTitle: "QA Test Engineer", skill: "Manual & Automation Testing", qualification: "B.Tech / Diploma", experience: "1–2 Years", openings: 5, sourceVacancy: "JD-2026-002" },
    { id: "t3", jobTitle: "IT Support Technician", skill: "Hardware & Networking", qualification: "ITI / Diploma", experience: "Fresher", openings: 8, sourceVacancy: "JD-2026-003" },
  ],
};

const SECTORS = ["Information Technology", "Manufacturing", "Healthcare", "Construction", "Agriculture", "Retail & Commerce", "Education", "Logistics & Transport", "Hospitality", "Finance & Banking"];
const MSME_CATEGORIES: MSMECategory[] = ["Micro", "Small", "Medium", "Large"];
const EXPERIENCE_LEVELS: ExperienceLevel[] = ["Fresher", "1–2 Years", "2–5 Years", "5+ Years"];
const EMPLOYEE_COUNTS = ["1–10", "11–50", "51–200", "201–500", "501–1000", "1000+"];
const TURNOVER_OPTIONS = ["< ₹1 Crore", "₹1–5 Crore", "₹5–10 Crore", "₹10–50 Crore", "₹50–100 Crore", "> ₹100 Crore"];
const QUALIFICATIONS = ["ITI", "Diploma", "10th Pass", "12th Pass", "B.Tech / BCA", "BCA / MCA", "B.Com / MBA", "Any Graduate", "Postgraduate"];

const MSME_COLORS: Record<MSMECategory, { bg: string; color: string; border: string }> = {
  Micro: { bg: "#f0fdf4", color: "#15803d", border: "#86efac" },
  Small: { bg: "#eff6ff", color: "#1d4ed8", border: "#93c5fd" },
  Medium: { bg: "#fff7ed", color: "#c2410c", border: "#fdba74" },
  Large: { bg: "#fdf4ff", color: "#7e22ce", border: "#d8b4fe" },
};

/* ─────────────────────────────────────────
   PRIMITIVES
───────────────────────────────────────── */
const Label: FC<{ children: React.ReactNode; required?: boolean }> = ({ children, required }) => (
  <div style={{ fontSize: 11, fontWeight: 700, color: C.contentMuted, letterSpacing: ".5px", textTransform: "uppercase", marginBottom: 5 }}>
    {children}{required && <span style={{ color: C.error, marginLeft: 2 }}>*</span>}
  </div>
);

const Field: FC<{
  label: string; required?: boolean; children: React.ReactNode; half?: boolean;
}> = ({ label, required, children, half }) => (
  <div style={{ flex: half ? "0 0 calc(50% - 6px)" : "1 1 100%", minWidth: 0 }}>
    <Label required={required}>{label}</Label>
    {children}
  </div>
);

const inputStyle: React.CSSProperties = {
  width: "100%", background: C.base200, border: "1px solid " + C.border,
  borderRadius: 8, padding: "8px 11px", fontSize: 13, color: C.baseContent,
  outline: "none", fontFamily: "inherit", transition: "border-color .15s",
};

const Input: FC<{
  value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; disabled?: boolean;
}> = ({ value, onChange, placeholder, type = "text", disabled }) => (
  <input type={type} value={value} onChange={e => onChange(e.target.value)}
    placeholder={placeholder} disabled={disabled}
    style={{ ...inputStyle, background: disabled ? C.base100 : C.base200, color: disabled ? C.contentMuted : C.baseContent }}
    onFocus={e => { if (!disabled) e.currentTarget.style.borderColor = C.primary; }}
    onBlur={e => { e.currentTarget.style.borderColor = C.border; }}
  />
);

const Select: FC<{ value: string; onChange: (v: string) => void; options: string[]; placeholder?: string }> = ({ value, onChange, options, placeholder }) => (
  <select value={value} onChange={e => onChange(e.target.value)}
    style={{ ...inputStyle, cursor: "pointer" }}
    onFocus={e => { e.currentTarget.style.borderColor = C.primary; }}
    onBlur={e => { e.currentTarget.style.borderColor = C.border; }}>
    {placeholder && <option value="">{placeholder}</option>}
    {options.map(o => <option key={o} value={o}>{o}</option>)}
  </select>
);

const Textarea: FC<{ value: string; onChange: (v: string) => void; rows?: number; placeholder?: string }> = ({ value, onChange, rows = 3, placeholder }) => (
  <textarea value={value} onChange={e => onChange(e.target.value)} rows={rows}
    placeholder={placeholder}
    style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
    onFocus={e => { e.currentTarget.style.borderColor = C.primary; }}
    onBlur={e => { e.currentTarget.style.borderColor = C.border; }}
  />
);

const SectionCard: FC<{ children: React.ReactNode; noPad?: boolean }> = ({ children, noPad }) => (
  <div style={{ background: C.white, border: "1px solid " + C.border, borderRadius: 12, padding: noPad ? 0 : "18px 20px", overflow: "hidden" }}>
    {children}
  </div>
);

const SectionTitle: FC<{ icon: React.ReactNode; title: string; subtitle?: string; action?: React.ReactNode }> = ({ icon, title, subtitle, action }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 34, height: 34, borderRadius: 9, background: C.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", color: C.primary, flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.baseContent }}>{title}</div>
        {subtitle && <div style={{ fontSize: 11, color: C.contentMuted, marginTop: 1 }}>{subtitle}</div>}
      </div>
    </div>
    {action}
  </div>
);

const Btn: FC<{ children: React.ReactNode; onClick?: () => void; variant?: "primary" | "outline" | "ghost" | "danger"; size?: "sm" | "xs"; full?: boolean; type?: "button" | "submit" }> = ({ children, onClick, variant = "primary", size = "sm", full, type = "button" }) => {
  const v = {
    primary: { background: C.primary, color: C.white, border: "none" },
    outline: { background: "none", color: C.primary, border: "1px solid " + C.primary + "50" },
    ghost: { background: C.base200, color: C.contentMuted, border: "1px solid " + C.border },
    danger: { background: C.errorLight, color: C.error, border: "1px solid " + C.error + "40" },
  }[variant];
  return (
    <button type={type} onClick={onClick} style={{ ...v, cursor: "pointer", borderRadius: 8, padding: size === "xs" ? "4px 10px" : "7px 16px", fontSize: size === "xs" ? 11 : 12, fontWeight: 600, fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 5, width: full ? "100%" : undefined, justifyContent: full ? "center" : undefined, transition: "opacity .15s, transform .1s" }}
      onMouseEnter={e => { e.currentTarget.style.opacity = ".85"; }}
      onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}>
      {children}
    </button>
  );
};

/* ─────────────────────────────────────────
   UNIT CARD
───────────────────────────────────────── */
const UnitCard: FC<{
  unit: IndustrialUnit;
  onEdit: () => void;
  onDelete: () => void;
  onSetPrimary: () => void;
  onExplore: () => void;
}> = ({ unit, onEdit, onDelete, onSetPrimary, onExplore }) => (
  <div style={{ background: unit.isPrimary ? C.primaryLight : C.base200, border: "1px solid " + (unit.isPrimary ? C.primary + "30" : C.border), borderRadius: 10, padding: "12px 14px" }}>
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: unit.isPrimary ? C.primary : C.white, border: "1px solid " + C.border, display: "flex", alignItems: "center", justifyContent: "center", color: unit.isPrimary ? C.white : C.primary, flexShrink: 0 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.baseContent }}>{unit.name}</div>
          {unit.isPrimary && (
            <span style={{ fontSize: 10, fontWeight: 700, color: C.primary, background: C.primaryMid, padding: "1px 7px", borderRadius: 10 }}>Primary Unit</span>
          )}
        </div>
      </div>
      <div style={{ display: "flex", gap: 4 }}>
        <Btn variant="ghost" size="xs" onClick={onEdit}>Edit</Btn>
        {!unit.isPrimary && <Btn variant="ghost" size="xs" onClick={onSetPrimary}>Set Primary</Btn>}
        {!unit.isPrimary && <Btn variant="danger" size="xs" onClick={onDelete}>Remove</Btn>}
      </div>
    </div>

    <div style={{ fontSize: 12, color: C.contentMuted, lineHeight: 1.6, marginBottom: 10 }}>
      {unit.address}, {unit.district}, {unit.state} – {unit.pincode}
    </div>

    {unit.lat && unit.lng && (
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.contentFaint} strokeWidth="2"><circle cx="12" cy="10" r="3" /><path d="M12 2C8.13 2 5 5.13 5 10c0 5.25 7 12 7 12s7-6.75 7-12c0-4.87-3.13-8-7-8z" /></svg>
        <span style={{ fontSize: 11, color: C.contentFaint, fontFamily: "monospace" }}>{unit.lat}, {unit.lng}</span>
      </div>
    )}

    <button onClick={onExplore} style={{ display: "flex", alignItems: "center", gap: 6, background: C.primary, color: C.white, border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "opacity .15s" }}
      onMouseEnter={e => { e.currentTarget.style.opacity = ".85"; }}
      onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
      Explore Institutes Near This Unit
    </button>
  </div>
);

/* ─────────────────────────────────────────
   TALENT REQUIREMENT ROW
───────────────────────────────────────── */
const TalentRow: FC<{
  req: TalentRequirement;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ req, onEdit, onDelete }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: "1px solid " + C.border, background: C.white }}>
    <div style={{ width: 36, height: 36, borderRadius: 9, background: C.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", color: C.primary, flexShrink: 0, fontSize: 13, fontWeight: 800 }}>
      {req.openings}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.baseContent, marginBottom: 2 }}>{req.jobTitle}</div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {[req.skill, req.qualification, req.experience].map(tag => (
          <span key={tag} style={{ fontSize: 10, fontWeight: 600, color: C.contentMuted, background: C.base200, border: "1px solid " + C.border, padding: "1px 7px", borderRadius: 10 }}>{tag}</span>
        ))}
        <span style={{ fontSize: 10, fontWeight: 600, color: C.contentFaint }}>Ref: {req.sourceVacancy}</span>
      </div>
    </div>
    <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
      <Btn variant="ghost" size="xs" onClick={onEdit}>Edit</Btn>
      <Btn variant="danger" size="xs" onClick={onDelete}>Remove</Btn>
    </div>
  </div>
);

/* ─────────────────────────────────────────
   UNIT FORM MODAL
───────────────────────────────────────── */
const UnitModal: FC<{
  unit: Partial<IndustrialUnit>;
  onChange: (u: Partial<IndustrialUnit>) => void;
  onSave: () => void;
  onClose: () => void;
  isNew: boolean;
}> = ({ unit, onChange, onSave, onClose, isNew }) => {
  const f = (key: keyof IndustrialUnit) => (v: string) => onChange({ ...unit, [key]: v });

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.35)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: C.white, borderRadius: 14, padding: 24, width: 500, maxWidth: "100%", boxShadow: "0 12px 40px rgba(0,0,0,.18)", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: C.baseContent, marginBottom: 4 }}>{isNew ? "Add Industrial Unit" : "Edit Unit"}</div>
        <div style={{ fontSize: 12, color: C.contentMuted, marginBottom: 18 }}>Save the location of your industrial unit to explore nearby institutes.</div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Field label="Unit Name" required>
            <Input value={unit.name ?? ""} onChange={f("name")} placeholder="e.g. Head Office – Mohali" />
          </Field>
          <Field label="Full Address" required>
            <Textarea value={unit.address ?? ""} onChange={f("address")} rows={2} placeholder="Plot / SCO / Door No, Street, Area" />
          </Field>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Field label="District" required half>
              <Input value={unit.district ?? ""} onChange={f("district")} placeholder="e.g. Ludhiana" />
            </Field>
            <Field label="State" required half>
              <Input value={unit.state ?? ""} onChange={f("state")} placeholder="e.g. Punjab" />
            </Field>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Field label="Pincode" half>
              <Input value={unit.pincode ?? ""} onChange={f("pincode")} placeholder="e.g. 160071" />
            </Field>
          </div>

          {/* Coordinates */}
          <div style={{ background: C.base200, borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.baseContent, marginBottom: 10 }}>
              📍 GPS Coordinates <span style={{ fontSize: 11, color: C.contentMuted, fontWeight: 400 }}>(used to find nearby institutes)</span>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <Field label="Latitude" half>
                <Input value={unit.lat ?? ""} onChange={f("lat")} placeholder="e.g. 30.7046" />
              </Field>
              <Field label="Longitude" half>
                <Input value={unit.lng ?? ""} onChange={f("lng")} placeholder="e.g. 76.7179" />
              </Field>
            </div>
            <div style={{ marginTop: 8 }}>
              <a href="https://maps.google.com" target="_blank" rel="noreferrer" style={{ fontSize: 11, color: C.primary, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                Get coordinates from Google Maps
              </a>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
          <Btn variant="primary" full onClick={onSave}>{isNew ? "Add Unit" : "Save Changes"}</Btn>
          <Btn variant="ghost" full onClick={onClose}>Cancel</Btn>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   TALENT FORM MODAL
───────────────────────────────────────── */
const TalentModal: FC<{
  req: Partial<TalentRequirement>;
  onChange: (r: Partial<TalentRequirement>) => void;
  onSave: () => void;
  onClose: () => void;
  isNew: boolean;
}> = ({ req, onChange, onSave, onClose, isNew }) => {
  const f = (key: keyof TalentRequirement) => (v: string) => onChange({ ...req, [key]: v });

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.35)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: C.white, borderRadius: 14, padding: 24, width: 520, maxWidth: "100%", boxShadow: "0 12px 40px rgba(0,0,0,.18)", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: C.baseContent, marginBottom: 4 }}>{isNew ? "Add Talent Requirement" : "Edit Requirement"}</div>
        <div style={{ fontSize: 12, color: C.contentMuted, marginBottom: 18 }}>Based on open job vacancies — institutes will be matched to this need.</div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Field label="Job Title / Role" required>
            <Input value={req.jobTitle ?? ""} onChange={f("jobTitle")} placeholder="e.g. Junior Software Developer" />
          </Field>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Field label="Primary Skill" required half>
              <Input value={req.skill ?? ""} onChange={f("skill")} placeholder="e.g. React.js / Node.js" />
            </Field>
            <Field label="Min. Qualification" required half>
              <Select value={req.qualification ?? ""} onChange={f("qualification")} options={QUALIFICATIONS} placeholder="Select qualification" />
            </Field>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Field label="Work Experience" required half>
              <Select value={req.experience ?? ""} onChange={f("experience")} options={EXPERIENCE_LEVELS} placeholder="Select level" />
            </Field>
            <Field label="No. of Openings" required half>
              <Input value={req.openings?.toString() ?? ""} onChange={v => onChange({ ...req, openings: parseInt(v) || 0 })} placeholder="e.g. 10" type="number" />
            </Field>
          </div>

          <Field label="Source Vacancy Reference">
            <Input value={req.sourceVacancy ?? ""} onChange={f("sourceVacancy")} placeholder="e.g. JD-2026-001 or leave blank" />
          </Field>

          <div style={{ background: C.warningLight, border: "1px solid " + C.warning + "60", borderRadius: 9, padding: "10px 12px", display: "flex", gap: 8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill={C.warning} style={{ flexShrink: 0, marginTop: 1 }}><path d="M12 2L1 21h22L12 2zm-1 8h2v5h-2zm0 6h2v2h-2z" /></svg>
            <div style={{ fontSize: 11, color: "#92400e", lineHeight: 1.6 }}>
              Talent requirements are used to match you with institutes offering relevant courses and available students. Keep them aligned with your current open vacancies.
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
          <Btn variant="primary" full onClick={onSave}>{isNew ? "Add Requirement" : "Save Changes"}</Btn>
          <Btn variant="ghost" full onClick={onClose}>Cancel</Btn>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   TOAST
───────────────────────────────────────── */
const Toast: FC<{ msg: string; onClose: () => void }> = ({ msg, onClose }) => (
  <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 300, background: C.success, color: C.white, padding: "11px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 10, boxShadow: "0 4px 20px rgba(22,163,74,.3)", fontFamily: "'Poppins',sans-serif" }}>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>
    {msg}
    <button onClick={onClose} style={{ background: "none", border: "none", color: C.white, cursor: "pointer", padding: 0, marginLeft: 4, display: "flex" }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12" /></svg>
    </button>
  </div>
);

/* ─────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────── */
type ActiveTab = "overview" | "units" | "talent";

const IndustryProfile: FC = () => {
  const [profile, setProfile] = useState<IndustryProfile>(INITIAL_PROFILE);
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const [editingOverview, setEditingOverview] = useState(false);
  const [draftProfile, setDraftProfile] = useState<IndustryProfile>(INITIAL_PROFILE);
  const [toast, setToast] = useState<string | null>(null);

  // Unit modal state
  const [unitModal, setUnitModal] = useState<{ open: boolean; isNew: boolean; draft: Partial<IndustrialUnit> }>({ open: false, isNew: true, draft: {} });

  // Talent modal state
  const [talentModal, setTalentModal] = useState<{ open: boolean; isNew: boolean; draft: Partial<TalentRequirement> }>({ open: false, isNew: true, draft: {} });

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3500); };

  const p = (key: keyof IndustryProfile) => (v: string) => setDraftProfile(prev => ({ ...prev, [key]: v }));

  const saveOverview = () => { setProfile(draftProfile); setEditingOverview(false); showToast("Profile updated successfully"); };
  const cancelOverview = () => { setDraftProfile(profile); setEditingOverview(false); };

  // Unit operations
  const openAddUnit = () => setUnitModal({ open: true, isNew: true, draft: { state: "Punjab", isPrimary: false } });
  const openEditUnit = (unit: IndustrialUnit) => setUnitModal({ open: true, isNew: false, draft: { ...unit } });
  const saveUnit = () => {
    const u = unitModal.draft;
    if (!u.name || !u.address || !u.district) return;
    const newUnit: IndustrialUnit = { id: u.id ?? "u" + Date.now(), name: u.name!, address: u.address!, district: u.district!, state: u.state ?? "Punjab", pincode: u.pincode ?? "", lat: u.lat ?? "", lng: u.lng ?? "", isPrimary: u.isPrimary ?? false };
    setProfile(prev => ({
      ...prev,
      units: unitModal.isNew ? [...prev.units, newUnit] : prev.units.map(x => x.id === newUnit.id ? newUnit : x),
    }));
    setUnitModal({ open: false, isNew: true, draft: {} });
    showToast(unitModal.isNew ? "Unit added" : "Unit updated");
  };
  const deleteUnit = (id: string) => { setProfile(prev => ({ ...prev, units: prev.units.filter(u => u.id !== id) })); showToast("Unit removed"); };
  const setPrimaryUnit = (id: string) => { setProfile(prev => ({ ...prev, units: prev.units.map(u => ({ ...u, isPrimary: u.id === id })) })); showToast("Primary unit updated"); };

  // Talent operations
  const openAddTalent = () => setTalentModal({ open: true, isNew: true, draft: { experience: "Fresher", openings: 1 } });
  const openEditTalent = (req: TalentRequirement) => setTalentModal({ open: true, isNew: false, draft: { ...req } });
  const saveTalent = () => {
    const r = talentModal.draft;
    if (!r.jobTitle || !r.skill) return;
    const newReq: TalentRequirement = { id: r.id ?? "t" + Date.now(), jobTitle: r.jobTitle!, skill: r.skill!, qualification: r.qualification ?? "Any Graduate", experience: (r.experience ?? "Fresher") as ExperienceLevel, openings: r.openings ?? 1, sourceVacancy: r.sourceVacancy ?? "" };
    setProfile(prev => ({
      ...prev,
      talentRequirements: talentModal.isNew ? [...prev.talentRequirements, newReq] : prev.talentRequirements.map(x => x.id === newReq.id ? newReq : x),
    }));
    setTalentModal({ open: false, isNew: true, draft: {} });
    showToast(talentModal.isNew ? "Talent requirement added" : "Requirement updated");
  };
  const deleteTalent = (id: string) => { setProfile(prev => ({ ...prev, talentRequirements: prev.talentRequirements.filter(r => r.id !== id) })); showToast("Requirement removed"); };

  const msme = MSME_COLORS[profile.msmeCategory];
  const totalOpenings = profile.talentRequirements.reduce((s, r) => s + r.openings, 0);

  const TABS: { id: ActiveTab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: "overview", label: "Company Profile", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" /></svg> },
    { id: "units", label: "Industrial Units", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>, count: profile.units.length },
    { id: "talent", label: "Talent Requirements", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>, count: profile.talentRequirements.length },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, height: "100%", overflow: "hidden", fontFamily: "'Poppins','Segoe UI',sans-serif", background: C.base100, color: C.baseContent }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#d1d5db;border-radius:9999px}::-webkit-scrollbar-thumb:hover{background:#2141a440}
      `}</style>

      {/* ── PAGE HEADER ── */}
      <div style={{ background: C.white, borderBottom: "1px solid " + C.border, padding: "10px 20px 0", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Company avatar */}
            <div style={{ width: 46, height: 46, borderRadius: 12, background: C.primary, display: "flex", alignItems: "center", justifyContent: "center", color: C.white, fontSize: 16, fontWeight: 800, flexShrink: 0, letterSpacing: "-.5px" }}>
              {profile.companyName.split(" ").filter(w => w.length > 1).slice(0, 2).map(w => w[0]).join("").toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: C.baseContent, letterSpacing: "-.4px", lineHeight: 1.15 }}>{profile.companyName}</div>
              <div style={{ fontSize: 12, color: C.contentMuted, marginTop: 1 }}>{profile.sector} · {profile.subSector}</div>
            </div>
            <span style={{ background: msme.bg, color: msme.color, border: "1px solid " + msme.border, fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 10, marginLeft: 4 }}>
              {profile.msmeCategory} Enterprise
            </span>
          </div>

          {activeTab === "overview" && (
            editingOverview ? (
              <div style={{ display: "flex", gap: 7 }}>
                <Btn variant="primary" onClick={saveOverview}>Save Profile</Btn>
                <Btn variant="ghost" onClick={cancelOverview}>Cancel</Btn>
              </div>
            ) : (
              <Btn variant="outline" onClick={() => { setDraftProfile(profile); setEditingOverview(true); }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                Edit Profile
              </Btn>
            )
          )}

          {activeTab === "units" && (
            <Btn variant="primary" onClick={openAddUnit}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14" /></svg>
              Add Unit
            </Btn>
          )}

          {activeTab === "talent" && (
            <Btn variant="primary" onClick={openAddTalent}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14" /></svg>
              Add Requirement
            </Btn>
          )}
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 0 }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{ padding: "7px 16px", border: "none", borderBottom: activeTab === tab.id ? "2px solid " + C.primary : "2px solid transparent", background: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", color: activeTab === tab.id ? C.primary : C.contentMuted, fontFamily: "inherit", transition: "color .15s", display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
              <span style={{ color: activeTab === tab.id ? C.primary : C.contentFaint }}>{tab.icon}</span>
              {tab.label}
              {tab.count !== undefined && (
                <span style={{ background: activeTab === tab.id ? C.primaryLight : C.base200, color: activeTab === tab.id ? C.primary : C.contentFaint, fontSize: 10, fontWeight: 700, padding: "0px 6px", borderRadius: 9 }}>{tab.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── TAB CONTENT ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>

        {/* ─── OVERVIEW TAB ─── */}
        {activeTab === "overview" && (
          <>
            {/* Summary chips */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[
                { label: "Employees", value: profile.employeeCount, icon: "👥" },
                { label: "Turnover", value: profile.annualTurnover, icon: "📊" },
                { label: "MSME No.", value: profile.msmeUdyamNo, icon: "🏷️" },
                { label: "GSTIN", value: profile.gstin, icon: "📋" },
              ].map(item => (
                <div key={item.label} style={{ background: C.white, border: "1px solid " + C.border, borderRadius: 10, padding: "8px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 14 }}>{item.icon}</span>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: C.contentFaint, letterSpacing: ".4px", textTransform: "uppercase" }}>{item.label}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.baseContent }}>{item.value || "—"}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* About */}
            <SectionCard>
              <SectionTitle icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>} title="About the Company" />
              {editingOverview
                ? <Textarea value={draftProfile.about} onChange={p("about")} rows={4} placeholder="Describe your company, industry, and what you do…" />
                : <p style={{ fontSize: 13, color: C.contentMuted, lineHeight: 1.75 }}>{profile.about || "No description added yet."}</p>}
            </SectionCard>

            {/* Company Info */}
            <SectionCard>
              <SectionTitle icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" /></svg>} title="Company Information" subtitle="Legal & registration details" />
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                {editingOverview ? (
                  <>
                    <Field label="Company Name" required half><Input value={draftProfile.companyName} onChange={p("companyName")} /></Field>
                    <Field label="Registration No." half><Input value={draftProfile.registrationNo} onChange={p("registrationNo")} /></Field>
                    <Field label="GSTIN" half><Input value={draftProfile.gstin} onChange={p("gstin")} /></Field>
                    <Field label="Website" half><Input value={draftProfile.website} onChange={p("website")} placeholder="www.example.com" /></Field>
                    <Field label="Email" half><Input value={draftProfile.email} onChange={p("email")} type="email" /></Field>
                    <Field label="Phone" half><Input value={draftProfile.phone} onChange={p("phone")} /></Field>
                  </>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10, width: "100%" }}>
                    {[["Company Name", profile.companyName], ["Registration No.", profile.registrationNo], ["GSTIN", profile.gstin], ["Website", profile.website], ["Email", profile.email], ["Phone", profile.phone]].map(([l, v]) => (
                      <div key={l}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: C.contentFaint, letterSpacing: ".5px", textTransform: "uppercase", marginBottom: 3 }}>{l}</div>
                        <div style={{ fontSize: 13, color: C.baseContent, fontWeight: 500 }}>{v || "—"}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </SectionCard>

            {/* Sector & MSME */}
            <SectionCard>
              <SectionTitle icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>} title="Sector & MSME Details" subtitle="Industry classification" />
              {editingOverview ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                  <Field label="Associated Sector" required half>
                    <Select value={draftProfile.sector} onChange={p("sector")} options={SECTORS} />
                  </Field>
                  <Field label="Sub-Sector / Specialisation" half>
                    <Input value={draftProfile.subSector} onChange={p("subSector")} placeholder="e.g. Software Development" />
                  </Field>
                  <Field label="MSME Category" required half>
                    <Select value={draftProfile.msmeCategory} onChange={v => setDraftProfile(d => ({ ...d, msmeCategory: v as MSMECategory }))} options={MSME_CATEGORIES} />
                  </Field>
                  <Field label="MSME Udyam Number" half>
                    <Input value={draftProfile.msmeUdyamNo} onChange={p("msmeUdyamNo")} placeholder="UDYAM-PB-…" />
                  </Field>
                  <Field label="Employee Count" half>
                    <Select value={draftProfile.employeeCount} onChange={p("employeeCount")} options={EMPLOYEE_COUNTS} />
                  </Field>
                  <Field label="Annual Turnover" half>
                    <Select value={draftProfile.annualTurnover} onChange={p("annualTurnover")} options={TURNOVER_OPTIONS} />
                  </Field>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
                  {[["Sector", profile.sector], ["Sub-Sector", profile.subSector], ["MSME Category", profile.msmeCategory], ["Udyam No.", profile.msmeUdyamNo], ["Employees", profile.employeeCount], ["Turnover", profile.annualTurnover]].map(([l, v]) => (
                    <div key={l}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: C.contentFaint, letterSpacing: ".5px", textTransform: "uppercase", marginBottom: 3 }}>{l}</div>
                      <div style={{ fontSize: 13, color: C.baseContent, fontWeight: 500 }}>{v || "—"}</div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </>
        )}

        {/* ─── UNITS TAB ─── */}
        {activeTab === "units" && (
          <>
            <div style={{ background: C.primaryLight, border: "1px solid " + C.primary + "20", borderRadius: 10, padding: "12px 16px", display: "flex", gap: 10 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill={C.primary} style={{ flexShrink: 0, marginTop: 1 }}><path d="M12 2C8.13 2 5 5.13 5 10c0 5.25 7 12 7 12s7-6.75 7-12c0-4.87-3.13-8-7-8zm0 10.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 7.5 12 7.5s2.5 1.12 2.5 2.5S13.38 12.5 12 12.5z" /></svg>
              <div style={{ fontSize: 12, color: C.primary, lineHeight: 1.6 }}>
                <strong>Location-based Institute Discovery:</strong> Add the GPS coordinates of each unit to enable exploring nearby institutes. Institutes will be ranked by distance from the selected unit.
              </div>
            </div>

            {profile.units.length === 0 ? (
              <SectionCard>
                <div style={{ padding: 32, textAlign: "center" }}>
                  <div style={{ width: 50, height: 50, borderRadius: 14, background: C.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", color: C.primary, margin: "0 auto 12px" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.contentMuted, marginBottom: 6 }}>No industrial units added</div>
                  <div style={{ fontSize: 12, color: C.contentFaint, marginBottom: 16 }}>Add your facility locations to discover nearby institutes.</div>
                  <Btn variant="primary" onClick={openAddUnit}>+ Add First Unit</Btn>
                </div>
              </SectionCard>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 10 }}>
                {profile.units.map(unit => (
                  <UnitCard key={unit.id} unit={unit}
                    onEdit={() => openEditUnit(unit)}
                    onDelete={() => deleteUnit(unit.id)}
                    onSetPrimary={() => setPrimaryUnit(unit.id)}
                    onExplore={() => showToast("Opening institute explorer for " + unit.name + "…")}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* ─── TALENT TAB ─── */}
        {activeTab === "talent" && (
          <>
            {/* Summary bar */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[
                { label: "Total Roles", value: profile.talentRequirements.length, color: C.primary },
                { label: "Total Openings", value: totalOpenings, color: C.success },
              ].map(item => (
                <div key={item.label} style={{ background: C.white, border: "1px solid " + C.border, borderRadius: 10, padding: "10px 18px", textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: item.color }}>{item.value}</div>
                  <div style={{ fontSize: 11, color: C.contentMuted, fontWeight: 600 }}>{item.label}</div>
                </div>
              ))}
              <div style={{ background: C.warningLight, border: "1px solid " + C.warning + "50", borderRadius: 10, padding: "10px 16px", display: "flex", alignItems: "center", gap: 8 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill={C.warning}><path d="M12 2L1 21h22L12 2zm-1 8h2v5h-2zm0 6h2v2h-2z" /></svg>
                <span style={{ fontSize: 11, color: "#92400e", fontWeight: 600 }}>Sync with your open job vacancies to keep this updated</span>
              </div>
            </div>

            {/* Requirements list */}
            <SectionCard noPad>
              <div style={{ padding: "14px 16px", borderBottom: "1px solid " + C.border, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.baseContent }}>Talent Requirements</div>
                  <div style={{ fontSize: 11, color: C.contentMuted, marginTop: 1 }}>Based on open job vacancies — used for institute matching</div>
                </div>
              </div>

              {profile.talentRequirements.length === 0 ? (
                <div style={{ padding: 32, textAlign: "center" }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.contentMuted, marginBottom: 6 }}>No talent requirements added</div>
                  <div style={{ fontSize: 12, color: C.contentFaint, marginBottom: 16 }}>Add requirements from your open job vacancies.</div>
                  <Btn variant="primary" onClick={openAddTalent}>+ Add Requirement</Btn>
                </div>
              ) : (
                profile.talentRequirements.map(req => (
                  <TalentRow key={req.id} req={req}
                    onEdit={() => openEditTalent(req)}
                    onDelete={() => deleteTalent(req.id)}
                  />
                ))
              )}
            </SectionCard>

            {/* Guide */}
            <SectionCard>
              <SectionTitle icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></svg>} title="How Talent Matching Works" />
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  ["1", "Add your open job requirements with skill, qualification & experience details."],
                  ["2", "The system matches you with institutes offering relevant courses."],
                  ["3", "Send partnership applications to matched institutes directly from Explore Institutes."],
                ].map(([num, text]) => (
                  <div key={num} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div style={{ width: 22, height: 22, borderRadius: "50%", background: C.primary, color: C.white, fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{num}</div>
                    <div style={{ fontSize: 12, color: C.contentMuted, lineHeight: 1.65, paddingTop: 2 }}>{text}</div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </>
        )}
      </div>

      {/* ── MODALS ── */}
      {unitModal.open && (
        <UnitModal unit={unitModal.draft} onChange={d => setUnitModal(m => ({ ...m, draft: d }))}
          onSave={saveUnit} onClose={() => setUnitModal(m => ({ ...m, open: false }))} isNew={unitModal.isNew} />
      )}
      {talentModal.open && (
        <TalentModal req={talentModal.draft} onChange={d => setTalentModal(m => ({ ...m, draft: d }))}
          onSave={saveTalent} onClose={() => setTalentModal(m => ({ ...m, open: false }))} isNew={talentModal.isNew} />
      )}

      {/* ── TOAST ── */}
      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
    </div>
  );
};

export default IndustryProfile;