"use client";

import { useState, useMemo, FC } from "react";

/* ─────────────────────────────────────────
   HUNAR BRAND TOKENS
───────────────────────────────────────── */
const C = {
  primary: "#2141a4",
  primaryLight: "#2141a412",
  primaryMid: "#2141a428",
  primaryDark: "#172d7a",
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
  shadow: "0 1px 4px rgba(33,65,164,.08)",
} as const;

const PX = "10px"; // consistent horizontal padding // consistent horizontal padding

/* ─────────────────────────────────────────
   TYPES
───────────────────────────────────────── */
type ViewMode = "institute" | "skill" | "type";
type PartnershipStatus = "active" | "pending" | "completed" | "paused";
type PartnershipType = "Placement" | "Apprenticeship" | "Training" | "MoU" | "CSR";

interface Stage {
  label: string;
  done: boolean;
  date?: string;
}

interface Message {
  id: number;
  sender: "you" | "institute";
  text: string;
  time: string;
}

interface Partnership {
  id: number;
  instituteId: number;
  type: PartnershipType;
  status: PartnershipStatus;
  jobRole: string;
  skill: string;
  branch: string;
  startDate: string;
  students: number;
  stages: Stage[];
  messages: Message[];
}

interface Institute {
  id: number;
  name: string;
  district: string;
  region: string;
  courses: string[];
  studentsOnRoll: number;
  available: number;
  saved: boolean;
  partnerships: Partnership[];
  logoInitials: string;
  logoColor: string;
}

/* ─────────────────────────────────────────
   DATA
───────────────────────────────────────── */
const LOGO_COLORS = ["#2141a4", "#0d9488", "#7c3aed", "#b45309", "#1d4ed8", "#be185d", "#15803d"];

const RAW_INSTITUTES: Omit<Institute, "logoInitials" | "logoColor">[] = [
  {
    id: 1, name: "Government I.T.I. Ludhiana", district: "Ludhiana", region: "Punjab",
    courses: ["Electrician", "Fitter", "Welder"], studentsOnRoll: 1141, available: 734, saved: false,
    partnerships: [
      {
        id: 101, instituteId: 1, type: "Placement", status: "active", jobRole: "Electrician", skill: "Wiring & Installation", branch: "Electrical", startDate: "2025-08-01", students: 30,
        stages: [{ label: "Application", done: true, date: "Aug 1" }, { label: "MoU Signing", done: true, date: "Aug 15" }, { label: "Training", done: true, date: "Sep 1" }, { label: "Placement", done: false }],
        messages: [{ id: 1, sender: "institute", text: "We are ready to onboard 30 students next month.", time: "10:30 AM" }, { id: 2, sender: "you", text: "Great, we will share the schedule by Friday.", time: "11:00 AM" }]
      },
      {
        id: 102, instituteId: 1, type: "Apprenticeship", status: "pending", jobRole: "Fitter", skill: "CNC Operation", branch: "Mechanical", startDate: "2025-11-01", students: 15,
        stages: [{ label: "Application", done: true, date: "Nov 1" }, { label: "MoU Signing", done: false }, { label: "Training", done: false }, { label: "Placement", done: false }],
        messages: [{ id: 3, sender: "you", text: "Please send the updated MoU draft.", time: "9:00 AM" }]
      },
    ],
  },
  {
    id: 2, name: "Government I.T.I. Patiala", district: "Patiala", region: "Punjab",
    courses: ["Mechanic", "Plumber", "Carpenter"], studentsOnRoll: 1023, available: 736, saved: true,
    partnerships: [
      {
        id: 201, instituteId: 2, type: "Training", status: "active", jobRole: "Plumber", skill: "Pipe Fitting", branch: "Civil", startDate: "2025-09-01", students: 20,
        stages: [{ label: "Application", done: true, date: "Sep 1" }, { label: "MoU Signing", done: true, date: "Sep 10" }, { label: "Training", done: false }, { label: "Placement", done: false }],
        messages: [{ id: 4, sender: "institute", text: "Training hall is ready. When do we start?", time: "2:00 PM" }]
      },
    ],
  },
  {
    id: 3, name: "Government Polytechnic College, Bathinda", district: "Bathinda", region: "Punjab",
    courses: ["Civil Engg", "Mechanical Engg", "CS"], studentsOnRoll: 778, available: 189, saved: false,
    partnerships: [
      {
        id: 301, instituteId: 3, type: "MoU", status: "completed", jobRole: "Software Tester", skill: "QA & Automation", branch: "IT", startDate: "2024-06-01", students: 25,
        stages: [{ label: "Application", done: true, date: "Jun 1" }, { label: "MoU Signing", done: true, date: "Jun 15" }, { label: "Training", done: true, date: "Jul 1" }, { label: "Placement", done: true, date: "Sep 1" }],
        messages: [{ id: 5, sender: "you", text: "Congratulations on completing the batch!", time: "5:00 PM" }, { id: 6, sender: "institute", text: "Thank you. Looking forward to the next one.", time: "5:30 PM" }]
      },
    ],
  },
  {
    id: 4, name: "Government I.T.I. Pathankot", district: "Pathankot", region: "Punjab",
    courses: ["Electrician", "Plumber", "Welder"], studentsOnRoll: 747, available: 492, saved: true,
    partnerships: [
      {
        id: 401, instituteId: 4, type: "CSR", status: "paused", jobRole: "Welder", skill: "Arc Welding", branch: "Mechanical", startDate: "2025-07-01", students: 12,
        stages: [{ label: "Application", done: true, date: "Jul 1" }, { label: "MoU Signing", done: true, date: "Jul 20" }, { label: "Training", done: false }, { label: "Placement", done: false }],
        messages: [{ id: 7, sender: "institute", text: "We are pausing due to infrastructure work. Will resume in Jan.", time: "3:00 PM" }]
      },
    ],
  },
  {
    id: 5, name: "Government I.T.I. Gurdaspur", district: "Gurdaspur", region: "Punjab",
    courses: ["Fitter", "Electrician", "Mechanic"], studentsOnRoll: 730, available: 475, saved: false,
    partnerships: [],
  },
  {
    id: 6, name: "Pacific Study Centre", district: "Amritsar", region: "Punjab",
    courses: ["Engineering", "Design", "Management"], studentsOnRoll: 620, available: 310, saved: true,
    partnerships: [
      {
        id: 601, instituteId: 6, type: "Placement", status: "active", jobRole: "Product Designer", skill: "UI/UX Design", branch: "Design", startDate: "2025-10-01", students: 18,
        stages: [{ label: "Application", done: true, date: "Oct 1" }, { label: "MoU Signing", done: true, date: "Oct 12" }, { label: "Training", done: true, date: "Nov 1" }, { label: "Placement", done: false }],
        messages: [{ id: 8, sender: "you", text: "Can we schedule a design challenge for shortlisting?", time: "11:30 AM" }, { id: 9, sender: "institute", text: "Yes, how about the 15th?", time: "12:00 PM" }]
      },
    ],
  },
];

const INSTITUTES: Institute[] = RAW_INSTITUTES.map((inst, i) => ({
  ...inst,
  logoInitials: inst.name.split(" ").filter(w => w.length > 2).slice(0, 2).map(w => w[0]).join("").toUpperCase(),
  logoColor: LOGO_COLORS[i % LOGO_COLORS.length],
}));

const ALL_PARTNERSHIPS = INSTITUTES.flatMap(i => i.partnerships);

const STATUS_CFG: Record<PartnershipStatus, { label: string; bg: string; color: string; dot: string }> = {
  active: { label: "Active", bg: C.successLight, color: C.success, dot: C.success },
  pending: { label: "Pending", bg: C.warningLight, color: "#92400e", dot: C.warning },
  completed: { label: "Completed", bg: C.primaryLight, color: C.primary, dot: C.primary },
  paused: { label: "Paused", bg: "#f3f4f6", color: C.contentMuted, dot: C.contentFaint },
};

const TYPE_COLORS: Record<PartnershipType, string> = {
  Placement: "#2141a4",
  Apprenticeship: "#7c3aed",
  Training: "#0d9488",
  MoU: "#b45309",
  CSR: "#be185d",
};

/* ─────────────────────────────────────────
   PRIMITIVES
───────────────────────────────────────── */
const Chip: FC<{ children: React.ReactNode; bg?: string; color?: string; border?: string; size?: "sm" | "xs" }> = ({ children, bg, color, border, size = "sm" }) => (
  <span style={{ display: "inline-flex", alignItems: "center", padding: size === "xs" ? "1px 7px" : "2px 9px", borderRadius: 20, fontSize: size === "xs" ? 10 : 11, fontWeight: 600, letterSpacing: ".2px", background: bg ?? C.base200, color: color ?? C.contentMuted, border: "1px solid " + (border ?? C.border) }}>
    {children}
  </span>
);

const Btn: FC<{ children: React.ReactNode; onClick?: () => void; variant?: "primary" | "secondary" | "ghost" | "outline"; size?: "sm" | "xs"; full?: boolean }> = ({ children, onClick, variant = "primary", size = "sm", full }) => {
  const styles = {
    primary: { background: C.primary, color: C.white, border: "none" },
    secondary: { background: C.secondary, color: "#000", border: "none" },
    ghost: { background: "none", color: C.contentMuted, border: "none" },
    outline: { background: "none", color: C.primary, border: "1px solid " + C.primary + "50" },
  };
  return (
    <button onClick={onClick} style={{ ...styles[variant], cursor: "pointer", borderRadius: 8, padding: size === "xs" ? "4px 10px" : "6px 14px", fontSize: size === "xs" ? 11 : 12, fontWeight: 600, fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 5, width: full ? "100%" : undefined, justifyContent: full ? "center" : undefined, transition: "opacity .15s" }}
      onMouseEnter={e => { e.currentTarget.style.opacity = ".85"; }}
      onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}>
      {children}
    </button>
  );
};

/* ─────────────────────────────────────────
   LOGO AVATAR
───────────────────────────────────────── */
const Avatar: FC<{ inst: Institute; size?: number }> = ({ inst, size = 36 }) => (
  <div style={{ width: size, height: size, borderRadius: 9, background: inst.logoColor + "18", border: "1px solid " + inst.logoColor + "30", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size < 32 ? 10 : 12, fontWeight: 800, color: inst.logoColor, flexShrink: 0, letterSpacing: "-.5px" }}>
    {inst.logoInitials}
  </div>
);

/* ─────────────────────────────────────────
   STATUS BADGE
───────────────────────────────────────── */
const StatusBadge: FC<{ status: PartnershipStatus }> = ({ status }) => {
  const cfg = STATUS_CFG[status];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: cfg.bg, color: cfg.color }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: cfg.dot, display: "inline-block" }} />
      {cfg.label}
    </span>
  );
};

/* ─────────────────────────────────────────
   STAGE PROGRESS BAR
───────────────────────────────────────── */
const StageBar: FC<{ stages: Stage[] }> = ({ stages }) => {
  const done = stages.filter(s => s.done).length;
  return (
    <div>
      <div style={{ display: "flex", gap: 3, marginBottom: 5 }}>
        {stages.map((s, i) => (
          <div key={i} style={{ flex: 1, height: 4, borderRadius: 4, background: s.done ? C.primary : C.border }} />
        ))}
      </div>
      <div style={{ fontSize: 10, color: C.contentFaint }}>{done}/{stages.length} stages complete</div>
    </div>
  );
};

/* ─────────────────────────────────────────
   INSTITUTE CARD (by institute view)
───────────────────────────────────────── */
const InstituteCard: FC<{ inst: Institute; onClick: () => void; onSave: () => void }> = ({ inst, onClick, onSave }) => {
  const activeCount = inst.partnerships.filter(p => p.status === "active").length;

  return (
    <div onClick={onClick} style={{ background: C.white, border: "1px solid " + C.border, borderRadius: 12, padding: "14px", cursor: "pointer", transition: "box-shadow .15s, border-color .15s" }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(33,65,164,.12)"; (e.currentTarget as HTMLElement).style.borderColor = C.primary + "40"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; (e.currentTarget as HTMLElement).style.borderColor = C.border; }}>

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar inst={inst} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.baseContent, lineHeight: 1.3 }}>{inst.name}</div>
            <div style={{ fontSize: 11, color: C.contentMuted, marginTop: 1 }}>{inst.district} · {inst.region}</div>
          </div>
        </div>
        <button onClick={e => { e.stopPropagation(); onSave(); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: inst.saved ? C.secondary : C.contentFaint }}
          title={inst.saved ? "Unsave" : "Save"}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill={inst.saved ? C.secondary : "none"} stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" /></svg>
        </button>
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
        {inst.courses.slice(0, 3).map(c => <Chip key={c} size="xs">{c}</Chip>)}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 10 }}>
        {[
          ["On Roll", inst.studentsOnRoll.toLocaleString()],
          ["Available", inst.available.toLocaleString()],
          ["Projects", inst.partnerships.length],
        ].map(([label, val]) => (
          <div key={label as string} style={{ background: C.base200, borderRadius: 8, padding: "6px 8px" }}>
            <div style={{ fontSize: 10, color: C.contentFaint, fontWeight: 600, letterSpacing: ".4px" }}>{label}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.baseContent }}>{val}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {activeCount > 0
          ? <span style={{ fontSize: 11, color: C.success, fontWeight: 600 }}>● {activeCount} active project{activeCount > 1 ? "s" : ""}</span>
          : <span style={{ fontSize: 11, color: C.contentFaint }}>No active projects</span>}
        <Btn variant="outline" size="xs">View Details →</Btn>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   PARTNERSHIP ROW (skill / type views)
───────────────────────────────────────── */
const PartnershipRow: FC<{ p: Partnership; inst: Institute; onClick: () => void }> = ({ p, inst, onClick }) => (
  <div onClick={onClick} style={{ background: C.white, border: "1px solid " + C.border, borderRadius: 10, padding: "12px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, transition: "box-shadow .15s, border-color .15s" }}
    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = C.shadow; (e.currentTarget as HTMLElement).style.borderColor = C.primary + "30"; }}
    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; (e.currentTarget as HTMLElement).style.borderColor = C.border; }}>

    <Avatar inst={inst} size={32} />

    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: C.baseContent, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.jobRole}</span>
        <Chip size="xs" bg={TYPE_COLORS[p.type] + "15"} color={TYPE_COLORS[p.type]} border={TYPE_COLORS[p.type] + "30"}>{p.type}</Chip>
      </div>
      <div style={{ fontSize: 11, color: C.contentMuted, marginBottom: 4 }}>{inst.name} · {p.skill}</div>
      <StageBar stages={p.stages} />
    </div>

    <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5 }}>
      <StatusBadge status={p.status} />
      <span style={{ fontSize: 10, color: C.contentFaint }}>{p.students} students</span>
    </div>
  </div>
);

/* ─────────────────────────────────────────
   DETAIL PANEL
───────────────────────────────────────── */
const DetailPanel: FC<{ inst: Institute; partnership?: Partnership; onClose: () => void; onNewApplication: () => void }> = ({ inst, partnership: initP, onClose, onNewApplication }) => {
  const [activeP, setActiveP] = useState<Partnership | undefined>(initP ?? inst.partnerships[0]);
  const [msgText, setMsgText] = useState("");
  const [messages, setMessages] = useState<Message[]>(activeP?.messages ?? []);
  const [showNewApp, setShowNewApp] = useState(false);

  const sendMsg = () => {
    if (!msgText.trim()) return;
    setMessages(prev => [...prev, { id: Date.now(), sender: "you", text: msgText.trim(), time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
    setMsgText("");
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: C.base100 }}>
      {/* Header */}
      <div style={{ background: C.white, borderBottom: "1px solid " + C.border, padding: "8px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.contentMuted, display: "flex", padding: 4, borderRadius: 6 }}
            onMouseEnter={e => { e.currentTarget.style.background = C.primaryLight; e.currentTarget.style.color = C.primary; }}
            onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = C.contentMuted; }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
          </button>
          <Avatar inst={inst} size={30} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.baseContent }}>{inst.name}</div>
            <div style={{ fontSize: 10, color: C.contentMuted }}>{inst.district} · {inst.region}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <Btn variant="outline" size="xs" onClick={() => setShowNewApp(true)}>+ New Application</Btn>
        </div>
      </div>

      {/* New Application Modal */}
      {showNewApp && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.3)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setShowNewApp(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: C.white, borderRadius: 14, padding: 24, width: 380, maxWidth: "90vw", boxShadow: "0 8px 32px rgba(0,0,0,.15)" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.baseContent, marginBottom: 4 }}>New Application to {inst.name}</div>
            <div style={{ fontSize: 12, color: C.contentMuted, marginBottom: 16 }}>Initiate a new partnership project with this institute.</div>
            {[["Partnership Type", ["Placement", "Apprenticeship", "Training", "MoU", "CSR"]], ["Job Role / Skill", null], ["No. of Students", null], ["Branch / Trade", null]].map(([label, opts]) => (
              <div key={label as string} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.contentMuted, marginBottom: 4 }}>{label as string}</div>
                {opts ? (
                  <select style={{ width: "100%", background: C.base200, border: "1px solid " + C.border, borderRadius: 8, padding: "7px 10px", fontSize: 13, outline: "none", fontFamily: "inherit", color: C.baseContent }}>
                    {(opts as string[]).map(o => <option key={o}>{o}</option>)}
                  </select>
                ) : (
                  <input style={{ width: "100%", background: C.base200, border: "1px solid " + C.border, borderRadius: 8, padding: "7px 10px", fontSize: 13, outline: "none", fontFamily: "inherit", color: C.baseContent }} placeholder={label === "No. of Students" ? "e.g. 25" : "Enter details…"} />
                )}
              </div>
            ))}
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <Btn variant="primary" full onClick={() => setShowNewApp(false)}>Submit Application</Btn>
              <Btn variant="ghost" full onClick={() => setShowNewApp(false)}>Cancel</Btn>
            </div>
          </div>
        </div>
      )}

      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {/* Partnership selector tabs */}
        {inst.partnerships.length > 0 && (
          <div style={{ background: C.white, borderBottom: "1px solid " + C.border, padding: "5px 14px", display: "flex", gap: 4, overflowX: "auto" }}>
            {inst.partnerships.map(p => (
              <button key={p.id} onClick={() => { setActiveP(p); setMessages(p.messages); }}
                style={{ padding: "4px 12px", borderRadius: 20, border: "none", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", transition: "all .15s", background: activeP?.id === p.id ? C.primary : "none", color: activeP?.id === p.id ? C.white : C.contentMuted }}>
                {p.type} · {p.jobRole}
              </button>
            ))}
          </div>
        )}

        <div style={{ flex: 1, overflowY: "auto", padding: "10px 14px", display: "flex", flexDirection: "column", gap: 10 }}>

          {/* No partnerships */}
          {inst.partnerships.length === 0 && (
            <div style={{ background: C.white, border: "1px solid " + C.border, borderRadius: 12, padding: 24, textAlign: "center" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.contentMuted, marginBottom: 8 }}>No active partnerships yet</div>
              <div style={{ fontSize: 12, color: C.contentFaint, marginBottom: 16 }}>Send an application to initiate a new partnership with this institute.</div>
              <Btn variant="primary" onClick={() => setShowNewApp(true)}>+ Send Application</Btn>
            </div>
          )}

          {/* Active partnership detail */}
          {activeP && (
            <>
              {/* Overview */}
              <div style={{ background: C.white, border: "1px solid " + C.border, borderRadius: 12, padding: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.baseContent }}>{activeP.jobRole}</div>
                    <div style={{ fontSize: 11, color: C.contentMuted, marginTop: 2 }}>{activeP.skill} · {activeP.branch}</div>
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <Chip size="xs" bg={TYPE_COLORS[activeP.type] + "15"} color={TYPE_COLORS[activeP.type]} border={TYPE_COLORS[activeP.type] + "30"}>{activeP.type}</Chip>
                    <StatusBadge status={activeP.status} />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
                  {[["Students", activeP.students], ["Start Date", activeP.startDate], ["Branch", activeP.branch]].map(([l, v]) => (
                    <div key={l as string} style={{ background: C.base200, borderRadius: 8, padding: "7px 9px" }}>
                      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".5px", color: C.contentFaint, textTransform: "uppercase", marginBottom: 2 }}>{l}</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.baseContent }}>{v}</div>
                    </div>
                  ))}
                </div>

                {/* Stage pipeline */}
                <div style={{ fontSize: 11, fontWeight: 700, color: C.contentMuted, letterSpacing: ".4px", textTransform: "uppercase", marginBottom: 8 }}>Partnership Stages</div>
                <div style={{ display: "flex", gap: 0 }}>
                  {activeP.stages.map((s, i) => (
                    <div key={i} style={{ flex: 1, position: "relative" }}>
                      {/* connector line */}
                      {i < activeP.stages.length - 1 && (
                        <div style={{ position: "absolute", top: 12, left: "50%", width: "100%", height: 2, background: activeP.stages[i + 1].done ? C.primary : C.border, zIndex: 0 }} />
                      )}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, position: "relative", zIndex: 1 }}>
                        <div style={{ width: 24, height: 24, borderRadius: "50%", background: s.done ? C.primary : C.white, border: "2px solid " + (s.done ? C.primary : C.border), display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {s.done && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>}
                        </div>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: 10, fontWeight: 600, color: s.done ? C.primary : C.contentMuted }}>{s.label}</div>
                          {s.date && <div style={{ fontSize: 9, color: C.contentFaint }}>{s.date}</div>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Conversation */}
              <div style={{ background: C.white, border: "1px solid " + C.border, borderRadius: 12, padding: "12px 14px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.contentMuted, letterSpacing: ".4px", textTransform: "uppercase", marginBottom: 10 }}>Conversation</div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10, maxHeight: 180, overflowY: "auto" }}>
                  {messages.length === 0 && <div style={{ fontSize: 12, color: C.contentFaint, textAlign: "center", padding: "16px 0" }}>No messages yet</div>}
                  {messages.map(m => (
                    <div key={m.id} style={{ display: "flex", flexDirection: m.sender === "you" ? "row-reverse" : "row", gap: 8, alignItems: "flex-end" }}>
                      <div style={{ maxWidth: "75%", background: m.sender === "you" ? C.primary : C.base200, color: m.sender === "you" ? C.white : C.baseContent, borderRadius: m.sender === "you" ? "12px 12px 2px 12px" : "12px 12px 12px 2px", padding: "8px 11px", fontSize: 12, lineHeight: 1.5 }}>
                        {m.text}
                        <div style={{ fontSize: 9, opacity: .6, marginTop: 3, textAlign: "right" }}>{m.time}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", gap: 7 }}>
                  <input value={msgText} onChange={e => setMsgText(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") sendMsg(); }}
                    placeholder="Send a message or query…"
                    style={{ flex: 1, background: C.base200, border: "1px solid " + C.border, borderRadius: 8, padding: "7px 11px", fontSize: 12, outline: "none", fontFamily: "inherit", color: C.baseContent, transition: "border-color .15s" }}
                    onFocus={e => { e.currentTarget.style.borderColor = C.primary; }}
                    onBlur={e => { e.currentTarget.style.borderColor = C.border; }}
                  />
                  <button onClick={sendMsg} style={{ background: C.primary, border: "none", borderRadius: 8, padding: "0 12px", cursor: "pointer", color: C.white, display: "flex", alignItems: "center" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" /></svg>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   SAVED INSTITUTES PANEL
───────────────────────────────────────── */
const SavedPanel: FC<{ institutes: Institute[]; onSelect: (inst: Institute) => void; onUnsave: (id: number) => void }> = ({ institutes, onSelect, onUnsave }) => {
  const saved = institutes.filter(i => i.saved);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {saved.length === 0 && (
        <div style={{ background: C.white, border: "1px solid " + C.border, borderRadius: 12, padding: 32, textAlign: "center" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.contentMuted, marginBottom: 6 }}>No saved institutes</div>
          <div style={{ fontSize: 12, color: C.contentFaint }}>Bookmark institutes from other views to save them here.</div>
        </div>
      )}
      {saved.map(inst => (
        <div key={inst.id} style={{ background: C.white, border: "1px solid " + C.border, borderRadius: 10, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar inst={inst} size={32} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.baseContent, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{inst.name}</div>
            <div style={{ fontSize: 11, color: C.contentMuted }}>{inst.district} · {inst.partnerships.length} project{inst.partnerships.length !== 1 ? "s" : ""}</div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <Btn variant="outline" size="xs" onClick={() => onSelect(inst)}>View</Btn>
            <Btn variant="primary" size="xs" onClick={() => onSelect(inst)}>+ Apply</Btn>
            <button onClick={() => onUnsave(inst.id)} style={{ background: "none", border: "none", cursor: "pointer", color: C.secondary, padding: 4 }} title="Unsave">
              <svg width="13" height="13" viewBox="0 0 24 24" fill={C.secondary} stroke="none"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" /></svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

/* ─────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────── */
type MainTab = "partners" | "saved";

const PartnerInstitutes: FC = () => {
  const [institutes, setInstitutes] = useState<Institute[]>(INSTITUTES);
  const [viewMode, setViewMode] = useState<ViewMode>("institute");
  const [mainTab, setMainTab] = useState<MainTab>("partners");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterType, setFilterType] = useState("All");
  const [filterBranch, setFilterBranch] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState<{ inst: Institute; partnership?: Partnership } | null>(null);

  const toggleSave = (id: number) => setInstitutes(prev => prev.map(i => i.id === id ? { ...i, saved: !i.saved } : i));

  // Filtered institutes
  const filteredInstitutes = useMemo(() => {
    return institutes.filter(inst => {
      const q = search.toLowerCase();
      if (q && !inst.name.toLowerCase().includes(q) && !inst.district.toLowerCase().includes(q)) return false;
      // Check partnerships match type/status filters
      if (filterStatus !== "All" || filterType !== "All" || filterBranch !== "All") {
        if (inst.partnerships.length === 0) return false;
        const matched = inst.partnerships.some(p =>
          (filterStatus === "All" || p.status === filterStatus) &&
          (filterType === "All" || p.type === filterType) &&
          (filterBranch === "All" || p.branch === filterBranch)
        );
        if (!matched) return false;
      }
      return true;
    });
  }, [institutes, search, filterStatus, filterType, filterBranch]);

  // Filtered partnerships
  const filteredPartnerships = useMemo(() => {
    return ALL_PARTNERSHIPS.filter(p => {
      const inst = institutes.find(i => i.id === p.instituteId);
      if (!inst) return false;
      const q = search.toLowerCase();
      if (q && !inst.name.toLowerCase().includes(q) && !p.jobRole.toLowerCase().includes(q) && !p.skill.toLowerCase().includes(q)) return false;
      if (filterStatus !== "All" && p.status !== filterStatus) return false;
      if (filterType !== "All" && p.type !== filterType) return false;
      if (filterBranch !== "All" && p.branch !== filterBranch) return false;
      return true;
    });
  }, [institutes, search, filterStatus, filterType, filterBranch]);

  // Group by skill or type for those views
  const grouped = useMemo(() => {
    const key = viewMode === "skill" ? "skill" : "type";
    const map: Record<string, { partnerships: Partnership[]; institutes: Institute[] }> = {};
    filteredPartnerships.forEach(p => {
      const k = p[key];
      if (!map[k]) map[k] = { partnerships: [], institutes: [] };
      map[k].partnerships.push(p);
      const inst = institutes.find(i => i.id === p.instituteId)!;
      if (!map[k].institutes.find(i => i.id === inst.id)) map[k].institutes.push(inst);
    });
    return map;
  }, [filteredPartnerships, viewMode, institutes]);

  const getInst = (id: number) => institutes.find(i => i.id === id)!;

  const filtersActive = filterStatus !== "All" || filterType !== "All" || filterBranch !== "All";

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, height: "100%", overflow: "hidden", fontFamily: "'Poppins','Segoe UI',sans-serif", background: C.base100, color: C.baseContent }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#d1d5db;border-radius:9999px}::-webkit-scrollbar-thumb:hover{background:#2141a440}
      `}</style>

      {/* ── BODY ── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* LIST PANEL */}
        <div style={{ width: selected ? 380 : "100%", maxWidth: selected ? 380 : "none", display: "flex", flexDirection: "column", overflow: "hidden", borderRight: "1px solid " + C.border, flexShrink: 0, transition: "width .2s", background: C.white }}>

          {/* ── PAGE HEADER ── */}
          <div style={{ background: C.white, borderBottom: "1px solid " + C.border, padding: "10px 14px 0", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: C.primary, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>
                </div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: C.baseContent, letterSpacing: "-.4px", lineHeight: 1.15 }}>Partner Institutes</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ background: C.primaryLight, color: C.primary, fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 10, border: "1px solid " + C.primary + "20" }}>
                  {institutes.filter(i => i.partnerships.length > 0).length} partners
                </span>
                <button onClick={() => setShowFilters(v => !v)} title="Filters"
                  style={{ background: showFilters ? C.primaryLight : C.base200, border: "1px solid " + (showFilters ? C.primary + "40" : C.border), cursor: "pointer", color: showFilters ? C.primary : C.contentMuted, padding: "5px 8px", borderRadius: 7, display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, fontFamily: "inherit" }}
                  onMouseEnter={e => { e.currentTarget.style.background = C.primaryLight; e.currentTarget.style.color = C.primary; }}
                  onMouseLeave={e => { e.currentTarget.style.background = showFilters ? C.primaryLight : C.base200; e.currentTarget.style.color = showFilters ? C.primary : C.contentMuted; }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 3H2l8 9.46V19l4 2v-7.54L22 3z" /></svg>
                  Filters
                </button>
              </div>
            </div>
            {/* Main tabs */}
            <div style={{ display: "flex", gap: 0 }}>
              {(["partners", "saved"] as const).map(tab => (
                <button key={tab} onClick={() => setMainTab(tab)}
                  style={{ padding: "6px 14px", border: "none", borderBottom: mainTab === tab ? "2px solid " + C.primary : "2px solid transparent", background: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", color: mainTab === tab ? C.primary : C.contentMuted, fontFamily: "inherit", transition: "color .15s" }}>
                  {tab === "partners" ? "All Partners" : "Saved Institutes"}
                </button>
              ))}
            </div>
          </div>

          {mainTab === "partners" && (
            <>
              {/* Search */}
              <div style={{ padding: "8px 14px", borderBottom: "1px solid " + C.border, background: C.white }}>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: C.contentFaint, pointerEvents: "none" }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
                  </span>
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search institutes, job roles, skills…"
                    style={{ width: "100%", background: C.base200, border: "1px solid " + C.border, borderRadius: 8, padding: "6px 26px 6px 28px", color: C.baseContent, fontSize: 12, outline: "none", fontFamily: "inherit", transition: "border-color .15s" }}
                    onFocus={e => { e.currentTarget.style.borderColor = C.primary; }}
                    onBlur={e => { e.currentTarget.style.borderColor = C.border; }}
                  />
                  {search && <button onClick={() => setSearch("")} style={{ position: "absolute", right: 7, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: C.contentFaint, display: "flex" }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12" /></svg>
                  </button>}
                </div>
              </div>

              {/* View mode + filters */}
              <div style={{ background: C.white, borderBottom: "1px solid " + C.border, padding: "5px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                {/* View toggle */}
                <div style={{ display: "flex", gap: 2, background: C.base200, borderRadius: 8, padding: 2 }}>
                  {([["institute", "By Institute"], ["skill", "By Skill"], ["type", "By Type"]] as const).map(([mode, label]) => (
                    <button key={mode} onClick={() => setViewMode(mode)}
                      style={{ padding: "3px 10px", borderRadius: 6, border: "none", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", background: viewMode === mode ? C.white : "none", color: viewMode === mode ? C.primary : C.contentMuted, boxShadow: viewMode === mode ? C.shadow : "none", transition: "all .15s" }}>
                      {label}
                    </button>
                  ))}
                </div>
                {/* count */}
                <span style={{ fontSize: 10, color: C.contentFaint, fontWeight: 600, whiteSpace: "nowrap" }}>
                  {viewMode === "institute" ? filteredInstitutes.length + " institutes" : filteredPartnerships.length + " projects"}
                </span>
              </div>

              {/* Filter panel */}
              {showFilters && (
                <div style={{ padding: "7px 14px", borderBottom: "1px solid " + C.border, background: C.base200, display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {[
                    { label: "Status", value: filterStatus, setValue: setFilterStatus, opts: ["All", "active", "pending", "completed", "paused"] },
                    { label: "Type", value: filterType, setValue: setFilterType, opts: ["All", "Placement", "Apprenticeship", "Training", "MoU", "CSR"] },
                    { label: "Branch", value: filterBranch, setValue: setFilterBranch, opts: ["All", "Electrical", "Mechanical", "Civil", "IT", "Design"] },
                  ].map(({ label, value, setValue, opts }) => (
                    <select key={label} value={value} onChange={e => setValue(e.target.value)}
                      style={{ background: C.white, border: "1px solid " + C.border, color: C.baseContent, padding: "4px 8px", borderRadius: 7, fontSize: 11, outline: "none", cursor: "pointer", fontFamily: "inherit" }}>
                      {opts.map(o => <option key={o} value={o}>{label}: {o}</option>)}
                    </select>
                  ))}
                  {filtersActive && (
                    <button onClick={() => { setFilterStatus("All"); setFilterType("All"); setFilterBranch("All"); }}
                      style={{ fontSize: 11, color: C.error, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>
                      Clear
                    </button>
                  )}
                </div>
              )}
            </>
          )}

          {/* LIST CONTENT */}
          <div style={{ flex: 1, overflowY: "auto", padding: "8px 14px", background: C.base100 }}>

            {/* SAVED TAB */}
            {mainTab === "saved" && (
              <SavedPanel institutes={institutes} onSelect={inst => setSelected({ inst })} onUnsave={toggleSave} />
            )}

            {/* PARTNERS — BY INSTITUTE */}
            {mainTab === "partners" && viewMode === "institute" && (
              <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr" : "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
                {filteredInstitutes.map(inst => (
                  <InstituteCard key={inst.id} inst={inst} onClick={() => setSelected({ inst })} onSave={() => toggleSave(inst.id)} />
                ))}
                {filteredInstitutes.length === 0 && (
                  <div style={{ gridColumn: "1/-1", padding: 40, textAlign: "center", color: C.contentFaint }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>No institutes found</div>
                    <div style={{ fontSize: 12 }}>Try adjusting filters or search</div>
                  </div>
                )}
              </div>
            )}

            {/* PARTNERS — BY SKILL or BY TYPE */}
            {mainTab === "partners" && (viewMode === "skill" || viewMode === "type") && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {Object.entries(grouped).length === 0 && (
                  <div style={{ padding: 40, textAlign: "center", color: C.contentFaint }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>No partnerships found</div>
                    <div style={{ fontSize: 12 }}>Try adjusting filters or search</div>
                  </div>
                )}
                {Object.entries(grouped).map(([groupKey, { partnerships, institutes: groupInsts }]) => (
                  <div key={groupKey}>
                    {/* Group header */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: C.baseContent }}>{groupKey}</div>
                      <div style={{ height: 1, flex: 1, background: C.border }} />
                      <span style={{ fontSize: 10, color: C.contentFaint, fontWeight: 600 }}>{partnerships.length} project{partnerships.length !== 1 ? "s" : ""}</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {partnerships.map(p => {
                        const inst = getInst(p.instituteId);
                        return <PartnershipRow key={p.id} p={p} inst={inst} onClick={() => setSelected({ inst, partnership: p })} />;
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* DETAIL PANEL */}
        {selected ? (
          <DetailPanel
            inst={selected.inst}
            partnership={selected.partnership}
            onClose={() => setSelected(null)}
            onNewApplication={() => { }}
          />
        ) : (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: C.contentFaint, background: C.base100, gap: 8 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: C.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", color: C.primary }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
              </svg>
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.contentMuted }}>Select an institute or project</div>
            <div style={{ fontSize: 11, textAlign: "center", maxWidth: 200, lineHeight: 1.6, color: C.contentFaint }}>
              Click any card to view partnership details and conversations.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PartnerInstitutes;