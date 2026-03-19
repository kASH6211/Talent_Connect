"use client";

import { useState, useMemo, FC, MouseEvent } from "react";

/* ─────────────────────────────────────────
   HUNAR BRAND TOKENS
───────────────────────────────────────── */
const C = {
  primary: "#2141a4",
  primaryLight: "#2141a412",
  primaryMid: "#2141a428",
  primaryContent: "#ffffff",
  secondary: "#fac015",
  secondaryLight: "#fac01520",
  accent: "#f98c1f",
  accentLight: "#f98c1f18",
  base100: "#eaeced",
  base200: "#f4f6f9",
  base300: "#e5e7eb",
  baseContent: "#111827",
  contentMuted: "#6b7280",
  contentFaint: "#9ca3af",
  white: "#ffffff",
  success: "#16a34a",
  successLight: "#16a34a15",
  error: "#dc2626",
  errorLight: "#dc262615",
  warning: "#facc15",
  warningLight: "#facc1518",
  info: "#2563eb",
  infoLight: "#2563eb12",
  border: "#e5e7eb",
  whatsapp: "#25d366",
  whatsappLight: "#25d36615",
  purple: "#7c3aed",
  purpleLight: "#7c3aed12",
} as const;

/* ─────────────────────────────────────────
   TYPES
───────────────────────────────────────── */
type Priority = "high" | "medium" | "low";
type ChannelType = "system" | "whatsapp" | "message" | "partnership";
type PartnershipTier = "Tier-1" | "Tier-2" | "Tier-3";
type SortKey = "date" | "priority" | "region";

interface Notification {
  id: number;
  type: ChannelType;
  priority: Priority;
  read: boolean;
  pinned: boolean;
  title: string;
  body: string;
  institute: string;
  course: string;
  region: string;
  branch: string;
  partnershipType: PartnershipTier;
  date: string;
  channel: ChannelType;
  actionRequired: boolean;
  action: string | null;
}

interface TypeCfg { bg: string; border: string; text: string; }

/* ─────────────────────────────────────────
   DATA
───────────────────────────────────────── */
const SAMPLE_NOTIFICATIONS: Notification[] = [
  { id: 1, type: "partnership", priority: "high", read: false, pinned: true, title: "New Partnership Request", body: "Oxford International College has submitted a Tier-1 partnership application pending your review.", institute: "Oxford International College", course: "Business Administration", region: "UK", branch: "Commerce", partnershipType: "Tier-1", date: "2026-03-19T09:14:00", channel: "system", actionRequired: true, action: "Review Application" },
  { id: 2, type: "whatsapp", priority: "medium", read: false, pinned: false, title: "WhatsApp Alert", body: "Meridian Tech Institute has not completed their onboarding documents. 3 days overdue.", institute: "Meridian Tech Institute", course: "Computer Science", region: "UAE", branch: "Technology", partnershipType: "Tier-2", date: "2026-03-19T08:45:00", channel: "whatsapp", actionRequired: true, action: "Send Reminder" },
  { id: 3, type: "message", priority: "low", read: true, pinned: false, title: "Conversation Update", body: "Sarah Johnson from Bright Horizons Academy replied to your onboarding query.", institute: "Bright Horizons Academy", course: "Medicine", region: "Australia", branch: "Healthcare", partnershipType: "Tier-3", date: "2026-03-18T16:30:00", channel: "message", actionRequired: false, action: null },
  { id: 4, type: "system", priority: "high", read: false, pinned: true, title: "Task Deadline Alert", body: "Commission payout for Q1 2026 is pending approval. Deadline: Today 6:00 PM.", institute: "Global Education Hub", course: "MBA", region: "Canada", branch: "Commerce", partnershipType: "Tier-1", date: "2026-03-19T07:00:00", channel: "system", actionRequired: true, action: "Approve Now" },
  { id: 5, type: "partnership", priority: "medium", read: true, pinned: false, title: "Stage Progression", body: "Eastwood Language School has moved to Stage 3: Contract Signing.", institute: "Eastwood Language School", course: "Language Studies", region: "Germany", branch: "Arts & Humanities", partnershipType: "Tier-2", date: "2026-03-18T11:00:00", channel: "system", actionRequired: false, action: null },
  { id: 6, type: "whatsapp", priority: "high", read: false, pinned: false, title: "WhatsApp Alert", body: "Summit Business School needs to upload accreditation docs before partner portal access.", institute: "Summit Business School", course: "Finance", region: "India", branch: "Commerce", partnershipType: "Tier-3", date: "2026-03-17T14:20:00", channel: "whatsapp", actionRequired: true, action: "Follow Up" },
  { id: 7, type: "message", priority: "low", read: true, pinned: false, title: "New Message", body: "Enrollment confirmation received from Pacific Study Centre for 12 students.", institute: "Pacific Study Centre", course: "Engineering", region: "USA", branch: "Technology", partnershipType: "Tier-1", date: "2026-03-17T10:10:00", channel: "message", actionRequired: false, action: null },
  { id: 8, type: "system", priority: "medium", read: false, pinned: false, title: "Profile Incomplete", body: "Nordic Learning Institute has 2 pending documents to complete their profile.", institute: "Nordic Learning Institute", course: "Design", region: "Sweden", branch: "Arts & Humanities", partnershipType: "Tier-2", date: "2026-03-16T09:00:00", channel: "system", actionRequired: true, action: "Review Docs" },
];

const REGIONS: string[] = ["All Regions", "India", "UK", "UAE", "Australia", "Canada", "Germany", "USA", "Sweden"];
const BRANCHES: string[] = ["All Branches", "Commerce", "Technology", "Healthcare", "Arts & Humanities"];
const PARTNERSHIP_TYPES: string[] = ["All Types", "Tier-1", "Tier-2", "Tier-3"];
const CHANNELS: string[] = ["All", "system", "whatsapp", "message", "partnership"];

const TYPE_CFG: Record<ChannelType, TypeCfg> = {
  system: { bg: C.infoLight, border: C.info, text: C.info },
  whatsapp: { bg: C.whatsappLight, border: C.whatsapp, text: C.whatsapp },
  message: { bg: C.purpleLight, border: C.purple, text: C.purple },
  partnership: { bg: C.secondaryLight, border: C.secondary, text: C.accent },
};

const PRIORITY_COLOR: Record<Priority, string> = {
  high: C.error, medium: C.accent, low: C.contentFaint,
};

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "Just now";
  if (m < 60) return m + "m ago";
  const h = Math.floor(m / 60);
  if (h < 24) return h + "h ago";
  return Math.floor(h / 24) + "d ago";
}
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/* ─────────────────────────────────────────
   ICONS
───────────────────────────────────────── */
const IcoSystem: FC = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 20V10M12 20V4M6 20v-6" /></svg>;
const IcoWhatsapp: FC = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" /><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.115 1.524 5.843L.057 23.107a.5.5 0 00.611.64l5.443-1.427A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.923 0-3.73-.49-5.31-1.349l-.38-.214-3.938 1.032 1.049-3.827-.234-.392A9.959 9.959 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" /></svg>;
const IcoMessage: FC = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>;
const IcoPartnership: FC = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>;

const TYPE_ICON: Record<ChannelType, FC> = {
  system: IcoSystem, whatsapp: IcoWhatsapp, message: IcoMessage, partnership: IcoPartnership,
};
const TypeIcon: FC<{ type: ChannelType }> = ({ type }) => {
  const Cmp = TYPE_ICON[type] ?? IcoMessage;
  return <Cmp />;
};

/* ─────────────────────────────────────────
   PRIMITIVES
───────────────────────────────────────── */
const Chip: FC<{ children: React.ReactNode; bg?: string; color?: string; border?: string }> = ({ children, bg, color, border }) => (
  <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 9px", borderRadius: 20, fontSize: 11, fontWeight: 600, letterSpacing: ".3px", background: bg ?? C.base200, color: color ?? C.contentMuted, border: "1px solid " + (border ?? C.border) }}>
    {children}
  </span>
);

const IconBtn: FC<{ onClick?: (e: MouseEvent<HTMLButtonElement>) => void; title?: string; children: React.ReactNode; isActive?: boolean }> = ({ onClick, title, children, isActive = false }) => (
  <button onClick={onClick} title={title}
    style={{ background: isActive ? C.primaryLight : "none", color: isActive ? C.primary : C.contentMuted, border: "none", cursor: "pointer", padding: 6, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", transition: "color .15s, background .15s" }}
    onMouseEnter={e => { e.currentTarget.style.background = C.primaryLight; e.currentTarget.style.color = C.primary; }}
    onMouseLeave={e => { e.currentTarget.style.background = isActive ? C.primaryLight : "none"; e.currentTarget.style.color = isActive ? C.primary : C.contentMuted; }}>
    {children}
  </button>
);

const SelInput: FC<{ value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; children: React.ReactNode }> = ({ value, onChange, children }) => (
  <select value={value} onChange={onChange}
    style={{ background: C.white, border: "1px solid " + C.border, color: C.baseContent, padding: "5px 10px", borderRadius: 8, fontSize: 12, outline: "none", cursor: "pointer", fontFamily: "inherit" }}>
    {children}
  </select>
);

/* ─────────────────────────────────────────
   NOTIFICATION ROW
───────────────────────────────────────── */
const NotifRow: FC<{ n: Notification; isActive: boolean; onClick: (n: Notification) => void }> = ({ n, isActive, onClick }) => {
  const cfg = TYPE_CFG[n.type] ?? TYPE_CFG.message;
  const [hovered, setHovered] = useState(false);
  const rowBg = isActive ? C.primaryLight : hovered ? C.base200 : n.read ? C.white : "#eef2ff";

  return (
    <div onClick={() => onClick(n)} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ padding: "11px 14px", display: "flex", gap: 11, borderBottom: "1px solid " + C.border, borderLeft: "3px solid " + (isActive ? C.primary : hovered ? C.primaryMid : "transparent"), background: rowBg, cursor: "pointer", transition: "background .12s, border-color .12s" }}>

      {/* Icon */}
      <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, paddingTop: 1 }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: cfg.bg, border: "1px solid " + cfg.border + "30", display: "flex", alignItems: "center", justifyContent: "center", color: cfg.text }}>
          <TypeIcon type={n.type} />
        </div>
        {n.pinned && <div style={{ width: 5, height: 5, borderRadius: "50%", background: C.secondary }} />}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
            {!n.read && <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.primary, flexShrink: 0 }} />}
            <span style={{ fontSize: 13, fontWeight: n.read ? 500 : 700, color: n.read ? C.contentMuted : C.baseContent, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {n.title}
            </span>
          </div>
          <div style={{ display: "flex", gap: 5, alignItems: "center", flexShrink: 0, marginLeft: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: PRIORITY_COLOR[n.priority] }} />
            <span style={{ fontSize: 10, color: C.contentFaint, fontFamily: "monospace", whiteSpace: "nowrap" }}>{timeAgo(n.date)}</span>
          </div>
        </div>

        <div style={{ fontSize: 12, color: C.contentMuted, lineHeight: 1.5, marginBottom: 7, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
          {n.body}
        </div>

        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          <Chip>{n.region}</Chip>
          <Chip bg={cfg.bg} color={cfg.text} border={cfg.border + "50"}>{n.partnershipType}</Chip>
          {n.actionRequired && <Chip bg={C.warningLight} color={C.accent} border={C.accent + "40"}>Action needed</Chip>}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   DETAIL PANEL
───────────────────────────────────────── */
const DetailPanel: FC<{ active: Notification; onClose: () => void; onTogglePin: (id: number) => void }> = ({ active, onClose, onTogglePin }) => {
  const cfg = TYPE_CFG[active.type] ?? TYPE_CFG.message;
  const [reply, setReply] = useState<string>("");
  const channelLabel = active.channel === "whatsapp" ? "WhatsApp" : cap(active.channel);

  const metaRows: [string, string][] = [
    ["Institute", active.institute],
    ["Course", active.course],
    ["Region", active.region],
    ["Branch", active.branch],
    ["Partnership Type", active.partnershipType],
    ["Status", active.read ? "Read" : "Unread"],
  ];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: C.base100 }}>

      {/* Detail header */}
      <div style={{ padding: "10px 16px", borderBottom: "1px solid " + C.border, display: "flex", alignItems: "center", justifyContent: "space-between", background: C.white }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <IconBtn onClick={onClose} title="Back">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
          </IconBtn>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: cfg.bg, border: "1px solid " + cfg.border + "30", display: "flex", alignItems: "center", justifyContent: "center", color: cfg.text }}>
            <TypeIcon type={active.type} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.baseContent }}>{active.title}</div>
            <div style={{ fontSize: 11, color: C.contentMuted }}>{active.institute}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 2 }}>
          <IconBtn onClick={() => onTogglePin(active.id)} title={active.pinned ? "Unpin" : "Pin"} isActive={active.pinned}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill={active.pinned ? C.secondary : "none"} stroke={active.pinned ? C.secondary : "currentColor"} strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
          </IconBtn>
          <IconBtn title="Share"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" /></svg></IconBtn>
          <IconBtn title="More options"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg></IconBtn>
        </div>
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>

        {/* Message card */}
        <div style={{ background: C.white, border: "1px solid " + C.border, borderRadius: 12, padding: "14px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
            <div style={{ display: "flex", gap: 7 }}>
              <Chip bg={cfg.bg} color={cfg.text} border={cfg.border + "50"}>{channelLabel}</Chip>
              <Chip bg={PRIORITY_COLOR[active.priority] + "18"} color={PRIORITY_COLOR[active.priority]} border={PRIORITY_COLOR[active.priority] + "40"}>{cap(active.priority)} priority</Chip>
            </div>
            <span style={{ fontSize: 11, color: C.contentFaint, fontFamily: "monospace" }}>{new Date(active.date).toLocaleString()}</span>
          </div>
          <p style={{ fontSize: 13, color: C.baseContent, lineHeight: 1.75 }}>{active.body}</p>
        </div>

        {/* Metadata grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
          {metaRows.map(([label, value]) => (
            <div key={label} style={{ background: C.white, border: "1px solid " + C.border, borderRadius: 9, padding: "8px 12px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".6px", color: C.contentFaint, textTransform: "uppercase", marginBottom: 2 }}>{label}</div>
              <div style={{ fontSize: 12, color: C.baseContent, fontWeight: 500 }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Action required */}
        {active.actionRequired && active.action && (
          <div style={{ background: C.warningLight, border: "1px solid " + C.warning + "50", borderRadius: 12, padding: "12px 14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 7 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill={C.warning}><path d="M12 2L1 21h22L12 2zm-1 8h2v5h-2zm0 6h2v2h-2z" /></svg>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.accent, letterSpacing: ".4px" }}>ACTION REQUIRED</span>
            </div>
            <p style={{ fontSize: 12, color: C.baseContent, marginBottom: 10, lineHeight: 1.6 }}>This notification requires your immediate attention.</p>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
              <button style={{ background: C.secondary, color: C.white, border: "none", borderRadius: 8, padding: "7px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "opacity .15s" }}
                onMouseEnter={e => { e.currentTarget.style.opacity = ".85"; }} onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}>
                {active.action}
              </button>
              <button style={{ background: C.base200, color: C.contentMuted, border: "1px solid " + C.border, borderRadius: 8, padding: "7px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Delegate</button>
              <button style={{ background: "none", color: C.accent, border: "1px solid " + C.accent + "50", borderRadius: 8, padding: "7px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Snooze</button>
            </div>
          </div>
        )}

        {/* Reply */}
        <div style={{ background: C.white, border: "1px solid " + C.border, borderRadius: 12, padding: "12px 14px" }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".6px", color: C.contentFaint, textTransform: "uppercase", marginBottom: 8 }}>Reply</div>
          <textarea value={reply} onChange={e => setReply(e.target.value)} placeholder="Type your response…"
            style={{ width: "100%", background: C.base200, border: "1px solid " + C.border, borderRadius: 8, padding: "9px 11px", color: C.baseContent, fontSize: 12, outline: "none", fontFamily: "inherit", resize: "none", height: 80, lineHeight: 1.6, transition: "border-color .15s" }}
            onFocus={e => { e.currentTarget.style.borderColor = C.primary; }}
            onBlur={e => { e.currentTarget.style.borderColor = C.border; }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
            <div style={{ display: "flex", gap: 2 }}>
              {(["📎", "🖼️", "📋"] as const).map(em => <IconBtn key={em}><span style={{ fontSize: 13 }}>{em}</span></IconBtn>)}
            </div>
            <button style={{ background: C.primary, color: C.white, border: "none", borderRadius: 8, padding: "7px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 5, transition: "opacity .15s" }}
              onMouseEnter={e => { e.currentTarget.style.opacity = ".88"; }} onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}>
              Send Reply
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────── */
const InboxComponent: FC = () => {
  const [search, setSearch] = useState<string>("");
  const [selectedRegion, setSelectedRegion] = useState<string>("All Regions");
  const [selectedBranch, setSelectedBranch] = useState<string>("All Branches");
  const [selectedType, setSelectedType] = useState<string>("All Types");
  const [selectedChannel, setSelectedChannel] = useState<string>("All");
  const [sortBy, setSortBy] = useState<SortKey>("date");
  const [filterUnread, setFilterUnread] = useState<boolean>(false);
  const [filterAction, setFilterAction] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<Notification[]>(SAMPLE_NOTIFICATIONS);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  const filtered = useMemo<Notification[]>(() => {
    const q = search.toLowerCase();
    const RANK: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
    return notifications
      .filter(n => {
        if (q && ![n.title, n.body, n.institute, n.course, n.region].join(" ").toLowerCase().includes(q)) return false;
        if (selectedRegion !== "All Regions" && n.region !== selectedRegion) return false;
        if (selectedBranch !== "All Branches" && n.branch !== selectedBranch) return false;
        if (selectedType !== "All Types" && n.partnershipType !== selectedType) return false;
        if (selectedChannel !== "All" && n.channel !== selectedChannel) return false;
        if (filterUnread && n.read) return false;
        if (filterAction && !n.actionRequired) return false;
        return true;
      })
      .sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        if (sortBy === "priority") return RANK[a.priority] - RANK[b.priority];
        if (sortBy === "region") return a.region.localeCompare(b.region);
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
  }, [notifications, search, selectedRegion, selectedBranch, selectedType, selectedChannel, sortBy, filterUnread, filterAction]);

  const unreadCount = notifications.filter(n => !n.read).length;
  const actionCount = notifications.filter(n => n.actionRequired).length;
  const active = notifications.find(n => n.id === activeId) ?? null;

  const markRead = (id: number) => setNotifications(p => p.map(n => n.id === id ? { ...n, read: true } : n));
  const togglePin = (id: number) => setNotifications(p => p.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n));
  const markAllRead = () => setNotifications(p => p.map(n => ({ ...n, read: true })));
  const clearFilters = () => { setSelectedRegion("All Regions"); setSelectedBranch("All Branches"); setSelectedType("All Types"); setFilterUnread(false); setFilterAction(false); };
  const handleOpen = (n: Notification) => { setActiveId(n.id); if (!n.read) markRead(n.id); };

  const filtersActive = selectedRegion !== "All Regions" || selectedBranch !== "All Branches" || selectedType !== "All Types" || filterUnread || filterAction;

  const togglePills = [
    { label: "Unread only", on: filterUnread, toggle: () => setFilterUnread(v => !v), color: C.primary },
    { label: "Action required", on: filterAction, toggle: () => setFilterAction(v => !v), color: C.accent },
  ] as const;

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, height: "100%", overflow: "hidden", fontFamily: "'Poppins','Segoe UI',sans-serif", background: C.base100, color: C.baseContent }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:#d1d5db;border-radius:9999px}
        ::-webkit-scrollbar-thumb:hover{background:#2141a440}
      `}</style>

      {/* ── BODY ── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* LIST PANEL */}
        <div style={{ width: active ? 380 : "100%", maxWidth: active ? 380 : "none", borderRight: "1px solid " + C.border, display: "flex", flexDirection: "column", overflow: "hidden", background: C.white, flexShrink: 0, transition: "width .2s" }}>

          {/* ── PAGE HEADER — matches reference Explore Institutes style ── */}
          <div style={{ background: C.white, borderBottom: "1px solid " + C.border, padding: "10px 14px 0", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              {/* Left: icon + title + badges */}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: C.primary, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                    <path d="M22 12h-6l-2 3h-4l-2-3H2" />
                    <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" />
                  </svg>
                </div>
                <div>
                  {/* Title: 22px — visible but not oversized */}
                  <div style={{ fontSize: 22, fontWeight: 700, color: C.baseContent, letterSpacing: "-.4px", lineHeight: 1.15 }}>Inbox</div>
                </div>
                {/* Badges sit next to the title */}
                <div style={{ display: "flex", gap: 6, marginLeft: 2 }}>
                  {unreadCount > 0 && (
                    <span style={{ background: C.primaryLight, color: C.primary, fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 10, border: "1px solid " + C.primary + "20" }}>
                      {unreadCount} unread
                    </span>
                  )}
                  {actionCount > 0 && (
                    <span style={{ background: "#fef3c7", color: "#92400e", fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 10, border: "1px solid " + C.warning + "60" }}>
                      {actionCount} actions
                    </span>
                  )}
                </div>
              </div>

              {/* Right: action buttons */}
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                {/* Mark all read */}
                <button onClick={markAllRead} title="Mark all as read"
                  style={{ background: C.base200, border: "1px solid " + C.border, cursor: "pointer", color: C.contentMuted, padding: "5px 10px", borderRadius: 7, display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, fontFamily: "inherit", transition: "all .15s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = C.primaryLight; e.currentTarget.style.color = C.primary; e.currentTarget.style.borderColor = C.primary + "40"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = C.base200; e.currentTarget.style.color = C.contentMuted; e.currentTarget.style.borderColor = C.border; }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                  <span>Mark read</span>
                </button>
                {/* Filters */}
                <button onClick={() => setShowFilters(v => !v)} title="Toggle filters"
                  style={{ background: showFilters ? C.primaryLight : C.base200, border: "1px solid " + (showFilters ? C.primary + "40" : C.border), cursor: "pointer", color: showFilters ? C.primary : C.contentMuted, padding: "5px 10px", borderRadius: 7, display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, fontFamily: "inherit", transition: "all .15s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = C.primaryLight; e.currentTarget.style.color = C.primary; }}
                  onMouseLeave={e => { e.currentTarget.style.background = showFilters ? C.primaryLight : C.base200; e.currentTarget.style.color = showFilters ? C.primary : C.contentMuted; }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 3H2l8 9.46V19l4 2v-7.54L22 3z" /></svg>
                  <span>Filters</span>
                </button>
              </div>
            </div>

            {/* Channel tabs — sit on the bottom edge of the header */}
            <div style={{ display: "flex", gap: 2, overflowX: "auto" }}>
              {CHANNELS.map(ch => {
                const isSel = selectedChannel === ch;
                const label = ch === "All" ? "All" : ch === "whatsapp" ? "WhatsApp" : cap(ch);
                return (
                  <button key={ch} onClick={() => setSelectedChannel(ch)}
                    style={{ padding: "5px 13px", borderRadius: "0", border: "none", borderBottom: isSel ? "2px solid " + C.primary : "2px solid transparent", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all .15s", background: "none", color: isSel ? C.primary : C.contentMuted, whiteSpace: "nowrap" }}>
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search */}
          <div style={{ padding: "8px 14px", borderBottom: "1px solid " + C.border, background: C.white }}>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: C.contentFaint, pointerEvents: "none" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
              </span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search institute, course, region…"
                style={{ width: "100%", background: C.base200, border: "1px solid " + C.border, borderRadius: 8, padding: "7px 28px 7px 30px", color: C.baseContent, fontSize: 12, outline: "none", fontFamily: "inherit", transition: "border-color .15s" }}
                onFocus={e => { e.currentTarget.style.borderColor = C.primary; }}
                onBlur={e => { e.currentTarget.style.borderColor = C.border; }}
              />
              {search && (
                <button onClick={() => setSearch("")} style={{ position: "absolute", right: 7, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: C.contentFaint, display: "flex" }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
              )}
            </div>
          </div>

          {/* Filters panel */}
          {showFilters && (
            <div style={{ padding: "8px 14px", borderBottom: "1px solid " + C.border, background: C.base200, display: "flex", flexWrap: "wrap", gap: 6 }}>
              <SelInput value={selectedRegion} onChange={e => setSelectedRegion(e.target.value)}>{REGIONS.map(r => <option key={r}>{r}</option>)}</SelInput>
              <SelInput value={selectedBranch} onChange={e => setSelectedBranch(e.target.value)}>{BRANCHES.map(b => <option key={b}>{b}</option>)}</SelInput>
              <SelInput value={selectedType} onChange={e => setSelectedType(e.target.value)}>{PARTNERSHIP_TYPES.map(t => <option key={t}>{t}</option>)}</SelInput>
              <SelInput value={sortBy} onChange={e => setSortBy(e.target.value as SortKey)}>
                <option value="date">Sort: Date</option>
                <option value="priority">Sort: Priority</option>
                <option value="region">Sort: Region</option>
              </SelInput>
              {togglePills.map(item => (
                <button key={item.label} onClick={item.toggle}
                  style={{ padding: "4px 11px", borderRadius: 20, border: "1px solid " + (item.on ? item.color : C.border), color: item.on ? item.color : C.contentMuted, fontSize: 11, fontWeight: 600, cursor: "pointer", background: item.on ? item.color + "15" : "none", fontFamily: "inherit", transition: "all .15s" }}>
                  {item.label}
                </button>
              ))}
            </div>
          )}

          {/* Count bar */}
          <div style={{ padding: "4px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid " + C.border, background: C.base200 }}>
            <span style={{ fontSize: 10, color: C.contentFaint, fontWeight: 600, letterSpacing: ".4px" }}>
              {filtered.length} NOTIFICATION{filtered.length !== 1 ? "S" : ""}
            </span>
            {filtersActive && (
              <button onClick={clearFilters} style={{ fontSize: 11, color: C.error, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 3, fontFamily: "inherit", fontWeight: 600 }}>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12" /></svg>
                Clear
              </button>
            )}
          </div>

          {/* Notification list */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {filtered.length === 0 ? (
              <div style={{ padding: 48, textAlign: "center", color: C.contentFaint }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ display: "block", margin: "0 auto 10px" }}>
                  <path d="M22 12h-6l-2 3h-4l-2-3H2" /><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" />
                </svg>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.contentMuted, marginBottom: 4 }}>No notifications found</div>
                <div style={{ fontSize: 12 }}>Try adjusting your filters or search</div>
              </div>
            ) : (
              filtered.map(n => <NotifRow key={n.id} n={n} isActive={activeId === n.id} onClick={handleOpen} />)
            )}
          </div>
        </div>

        {/* DETAIL / EMPTY STATE */}
        {active ? (
          <DetailPanel active={active} onClose={() => setActiveId(null)} onTogglePin={togglePin} />
        ) : (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: C.contentFaint, background: C.base100, gap: 8 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: C.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", color: C.primary }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 12h-6l-2 3h-4l-2-3H2" /><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" />
              </svg>
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.contentMuted }}>Select a notification</div>
            <div style={{ fontSize: 12, textAlign: "center", maxWidth: 220, lineHeight: 1.6 }}>
              Click any item on the left to view details and respond.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InboxComponent;