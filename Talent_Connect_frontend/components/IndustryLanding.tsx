"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Search,
  Send,
  Filter,
  MapPin,
  Users,
  Building2,
  X,
  LogIn,
  Loader2,
  Sparkles,
  TrendingUp,
  Award,
  ChevronDown,
  ArrowRight,
  Zap,
  Globe2,
  ShieldCheck,
  Mail,
  Eye,
} from "lucide-react";
import api from "@/lib/api";
import MultiSelectDropdown, { Option } from "@/components/MultiSelectDropdown";
import { InstituteViewModal } from "@/views/find-institute/list/InstituteViewModal";

/* ─── Brand color ────────────────────────────────────────────────── */
const P = "#605dff";
const P_DARK = "#4240cc";
const P_ALPHA = (a: number) => `rgba(96,93,255,${a})`;

/* ─── Types ──────────────────────────────────────────────────────── */
interface InstituteRow {
  institute_id: number;
  institute_name: string;
  district: string;
  type: string;
  ownership: string;
  student_count: number;
  contactperson: string;
  po_mobile: string;
  po_email: string;
}
interface Filters {
  state_ids: number[];
  district_ids: number[];
  type_ids: number[];
  ownership_ids: number[];
  qualification_ids: number[];
  stream_ids: number[];
}
const EMPTY_FILTERS: Filters = {
  state_ids: [3],
  district_ids: [],
  type_ids: [],
  ownership_ids: [],
  qualification_ids: [],
  stream_ids: [],
};
const AVATAR_STOPS: [string, string][] = [
  ["#605dff", "#3d3bcc"],
  ["#0891b2", "#0e7490"],
  ["#059669", "#047857"],
  ["#e11d48", "#9f1239"],
  ["#d97706", "#b45309"],
  ["#7c3aed", "#5b21b6"],
];

/* ════════════════════════════════════
   CSS (scoped with .ilp prefix)
════════════════════════════════════ */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  .ilp * { font-family: 'Plus Jakarta Sans', sans-serif; }

  /* animations */
  @keyframes ilp-rise {
    from { opacity:0; transform:translateY(22px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes ilp-blob {
    0%,100% { border-radius: 60% 40% 55% 45% / 55% 45% 60% 40%; }
    33%     { border-radius: 45% 55% 40% 60% / 60% 40% 55% 45%; }
    66%     { border-radius: 55% 45% 60% 40% / 40% 60% 45% 55%; }
  }
  @keyframes ilp-float {
    0%,100% { transform: translateY(0px); }
    50%     { transform: translateY(-14px); }
  }
  @keyframes ilp-dot-pulse {
    0%,100% { opacity:1; transform:scale(1); }
    50%     { opacity:.35; transform:scale(.65); }
  }
  @keyframes ilp-shimmer {
    0%   { background-position: -400% center; }
    100% { background-position:  400% center; }
  }
  @keyframes ilp-card-in {
    from { opacity:0; transform:translateY(16px); }
    to   { opacity:1; transform:translateY(0); }
  }

  .ilp-rise    { animation: ilp-rise 0.55s cubic-bezier(.22,1,.36,1) both; }
  .ilp-d1      { animation-delay:.07s; }
  .ilp-d2      { animation-delay:.14s; }
  .ilp-d3      { animation-delay:.22s; }
  .ilp-d4      { animation-delay:.30s; }
  .ilp-d5      { animation-delay:.38s; }

  .ilp-dot-live  { animation: ilp-dot-pulse 2s ease-in-out infinite; }
  .ilp-card-anim { animation: ilp-card-in .38s cubic-bezier(.22,1,.36,1) both; }

  /* shimmer headline */
  .ilp-shine {
    background: linear-gradient(100deg, #fff 5%, #c7c5ff 38%, #a09eff 55%, #fff 82%);
    background-size: 400% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: ilp-shimmer 5s linear infinite;
  }

  /* morphing blob */
  .ilp-blob {
    border-radius: 60% 40% 55% 45% / 55% 45% 60% 40%;
    animation: ilp-blob 14s ease-in-out infinite;
    pointer-events: none;
    position: absolute;
  }
  .ilp-blob2 {
    border-radius: 45% 55% 60% 40% / 60% 40% 50% 50%;
    animation: ilp-blob 18s ease-in-out infinite reverse;
    pointer-events: none;
    position: absolute;
  }
  .ilp-blob3 {
    border-radius: 70% 30% 40% 60% / 40% 60% 35% 65%;
    animation: ilp-blob 22s ease-in-out infinite;
    pointer-events: none;
    position: absolute;
  }

  /* floating card */
  .ilp-float { animation: ilp-float 5s ease-in-out infinite; }
  .ilp-float2 { animation: ilp-float 7s ease-in-out infinite; animation-delay:1.5s; }

  /* filter collapse */
  .ilp-collapse {
    overflow: hidden;
    transition: max-height .32s cubic-bezier(.4,0,.2,1), opacity .22s ease;
  }

  /* scrollbar */
  .ilp-scroll::-webkit-scrollbar { width:3px; }
  .ilp-scroll::-webkit-scrollbar-track { background:transparent; }
  .ilp-scroll::-webkit-scrollbar-thumb { background:${P_ALPHA(0.25)}; border-radius:4px; }

  /* hover states */
  .ilp-stat  { transition: transform .18s ease, box-shadow .18s ease; cursor:default; }
  .ilp-stat:hover { transform:translateY(-3px); }

  .ilp-btn-white {
    transition: transform .15s ease, box-shadow .15s ease;
  }
  .ilp-btn-white:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(0,0,0,0.25) !important;
  }
  .ilp-btn-white:active { transform:translateY(0); }

  .ilp-btn-ghost {
    transition: all .15s ease;
  }
  .ilp-btn-ghost:hover {
    background: rgba(255,255,255,.18) !important;
    transform: translateY(-1px);
  }

  .ilp-btn-p {
    transition: transform .15s ease, box-shadow .15s ease, opacity .15s ease;
  }
  .ilp-btn-p:not(:disabled):hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 28px ${P_ALPHA(0.45)} !important;
    opacity: .93;
  }
  .ilp-btn-p:not(:disabled):active { transform:translateY(0); }

  .ilp-nav-btn {
    transition: all .15s ease;
  }
  .ilp-nav-btn:hover {
    background: rgba(255,255,255,.18) !important;
    transform: translateY(-1px);
  }

  .ilp-inst-card {
    transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease;
  }
  .ilp-inst-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 32px ${P_ALPHA(0.12)};
    border-color: ${P_ALPHA(0.2)} !important;
  }

  .ilp-offer-btn {
    transition: background .15s ease, color .15s ease,
                border-color .15s ease, box-shadow .15s ease;
  }
  .ilp-offer-btn:hover {
    background: ${P} !important;
    color: #fff !important;
    border-color: ${P} !important;
    box-shadow: 0 4px 16px ${P_ALPHA(0.4)};
  }

  .ilp-chip {
    transition: all .15s ease;
  }
  .ilp-chip:hover {
    background: ${P_ALPHA(0.15)} !important;
    transform: translateY(-1px);
  }
`;

/* ════════════════════════════════════
   LOGIN MODAL
════════════════════════════════════ */
function LoginModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4
        transition-all duration-300
        ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(18px)" }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`relative w-full max-w-[380px] rounded-2xl overflow-hidden shadow-2xl
          transition-all duration-300
          ${open ? "scale-100 translate-y-0" : "scale-95 translate-y-5"}`}
        style={{
          background: "hsl(var(--b1))",
          border: `1px solid ${P_ALPHA(0.22)}`,
        }}
      >
        {/* Accent bar */}
        <div className="h-[3px] w-full" style={{ background: P }} />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center opacity-35 hover:opacity-75 transition-opacity"
          style={{ background: "hsl(var(--bc) / 0.08)" }}
        >
          <X size={14} style={{ color: "hsl(var(--bc))" }} />
        </button>

        <div className="px-8 py-8 text-center">
          {/* Icon with glow */}
          <div className="relative w-16 h-16 mx-auto mb-5">
            <div
              className="absolute inset-0 rounded-2xl blur-md opacity-40"
              style={{ background: P }}
            />
            <div
              className="relative w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: P }}
            >
              <LogIn size={26} color="#fff" strokeWidth={2} />
            </div>
          </div>

          <h2
            className="text-xl font-bold mb-2"
            style={{ color: "hsl(var(--bc))" }}
          >
            Login Required
          </h2>
          <p
            className="text-sm leading-relaxed mb-7"
            style={{ color: "hsl(var(--bc) / 0.5)" }}
          >
            Sign in as an{" "}
            <span style={{ color: "hsl(var(--bc) / 0.85)", fontWeight: 600 }}>
              Industry Partner
            </span>{" "}
            to send job offers to placement cells.
          </p>

          <button
            onClick={() => router.push("/login")}
            className="ilp-btn-p w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 mb-3"
            style={{
              background: P,
              color: "#fff",
              boxShadow: `0 6px 20px ${P_ALPHA(0.35)}`,
            }}
          >
            <LogIn size={16} /> Sign In to Continue
          </button>
          <button
            onClick={onClose}
            className="w-full py-2 text-sm font-medium opacity-35 hover:opacity-65 transition-opacity"
            style={{ color: "hsl(var(--bc))" }}
          >
            Continue browsing
          </button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════
   INSTITUTE CARD
════════════════════════════════════ */
function InstituteCard({
  inst,
  onSend,
  index,
}: {
  inst: InstituteRow;
  onSend: () => void;
  index: number;
}) {
  const initials = inst.institute_name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const [from, to] = AVATAR_STOPS[index % AVATAR_STOPS.length];

  return (
    <div
      className="ilp-inst-card rounded-xl p-4"
      style={{
        background: "hsl(var(--b1))",
        border: "1px solid hsl(var(--bc) / 0.08)",
      }}
    >
      <div className="flex gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-[11px] flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h3
            className="font-semibold text-sm leading-snug line-clamp-2 mb-1.5"
            style={{ color: "hsl(var(--bc))" }}
          >
            {inst.institute_name}
          </h3>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5">
            {inst.district && (
              <span
                className="flex items-center gap-1 text-[11px]"
                style={{ color: "hsl(var(--bc) / 0.42)" }}
              >
                <MapPin size={9} />
                {inst.district}
              </span>
            )}
            {inst.type && (
              <span
                className="flex items-center gap-1 text-[11px]"
                style={{ color: "hsl(var(--bc) / 0.42)" }}
              >
                <Building2 size={9} />
                {inst.type}
              </span>
            )}
            {inst.student_count > 0 && (
              <span
                className="flex items-center gap-1 text-[11px]"
                style={{ color: "hsl(var(--bc) / 0.42)" }}
              >
                <Users size={9} />
                {inst.student_count.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={onSend}
        className="ilp-offer-btn mt-3 w-full py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5"
        style={{
          background: P_ALPHA(0.08),
          color: P,
          border: `1px solid ${P_ALPHA(0.18)}`,
        }}
      >
        <Send size={11} />
        Send Job Offer
        <ArrowRight size={10} className="opacity-60" />
      </button>
    </div>
  );
}

/* ════════════════════════════════════
   MAIN PAGE
════════════════════════════════════ */
export default function IndustryLandingPage() {
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [institutes, setInstitutes] = useState<InstituteRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [loginModal, setLoginModal] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [viewInstitute, setViewInstitute] = useState(false);
  const [currentInstitute, setCurrentInstitute] = useState<InstituteRow | null>(null);

  const [districtOpts, setDistrictOpts] = useState<Option[]>([]);
  const [qualOpts, setQualOpts] = useState<Option[]>([]);
  const [streamOpts, setStreamOpts] = useState<Option[]>([]);

  // Load static options on mount — same logic as FindInstitutesListView
  useEffect(() => {
    const load = async () => {
      const [qual] = await Promise.all([
        api.get("/qualification").then(r => r.data.map((q: any) => ({ value: q.qualificationid, label: q.qualification }))).catch(() => []),
      ]);
      setQualOpts(qual);
    };
    load();
  }, []);

  // District cascade — fetch for Punjab (state_id=3)
  useEffect(() => {
    const loadDistricts = async () => {
      try {
        const res = await api.get(`/district?state_id=3`);
        setDistrictOpts(
          res.data.map((d: any) => ({ value: d.districtid, label: d.districtname })).sort((a: Option, b: Option) => a.label.localeCompare(b.label))
        );
      } catch {
        setDistrictOpts([]);
      }
    };
    loadDistricts();
  }, []);

  // Stream cascade — same as FindInstitutesListView
  useEffect(() => {
    const loadStreams = async () => {
      if (filters.qualification_ids.length > 0) {
        const qId = filters.qualification_ids[0];
        const [masterRes, inUseRes] = await Promise.all([
          api.get(`/stream-branch?qualification_id=${qId}`),
          api.get('/institute-qualification-mapping/streams-in-use'),
        ]);
        const inUseIds = new Set(inUseRes.data.map((s: any) => s.stream_branch_Id));
        const filtered = masterRes.data.filter((s: any) => inUseIds.has(s.stream_branch_Id));
        setStreamOpts(filtered.map((s: any) => ({ value: s.stream_branch_Id, label: s.stream_branch_name })));
      } else {
        const res = await api.get('/institute-qualification-mapping/streams-in-use');
        setStreamOpts(res.data.map((s: any) => ({ value: s.stream_branch_Id, label: s.stream_branch_name })));
      }
    };
    loadStreams();
  }, [filters.qualification_ids]);

  const setFilter = (key: keyof Filters) => (vals: number[]) =>
    setFilters((f) => ({ ...f, [key]: vals }));

  const handleSearch = useCallback(async () => {
    setLoading(true);
    setSearched(true);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if ((v as number[]).length) params.set(k, (v as number[]).join(","));
    });
    try {
      const res = await api.get(`/institute/search?${params}`);
      setInstitutes(res.data ?? []);
    } catch {
      setInstitutes([]);
    }
    setLoading(false);
  }, [filters]);

  const activeFilterCount = Object.values(filters).filter(
    (v, i) => Object.keys(filters)[i] !== 'state_ids' && Array.isArray(v) && v.length > 0,
  ).length;

  return (
    <>
      <style>{STYLES}</style>
      <LoginModal open={loginModal} onClose={() => setLoginModal(false)} />

      <div
        className="ilp min-h-screen"
        style={{ background: "hsl(var(--b1))" }}
      >
        {/* ══════════════════════════════════════════════════════
            HERO — solid #605dff with morphing blobs & wave
        ══════════════════════════════════════════════════════ */}
        <div
          className="relative w-full overflow-hidden"
          style={{ background: P }}
        >
          {/* ── Morphing blob decorations ── */}
          <div
            className="ilp-blob"
            style={{
              width: 560,
              height: 560,
              top: -200,
              right: -140,
              background: "rgba(255,255,255,0.07)",
              animationDuration: "18s",
            }}
          />
          <div
            className="ilp-blob2"
            style={{
              width: 380,
              height: 380,
              bottom: -160,
              left: -80,
              background: "rgba(255,255,255,0.055)",
              animationDuration: "14s",
            }}
          />
          <div
            className="ilp-blob3"
            style={{
              width: 220,
              height: 220,
              top: "28%",
              left: "44%",
              background: "rgba(255,255,255,0.045)",
              animationDuration: "20s",
            }}
          />

          {/* Glow orbs */}
          <div
            className="absolute pointer-events-none"
            style={{
              width: 700,
              height: 700,
              top: -300,
              left: -200,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(255,255,255,0.1), transparent 65%)",
              filter: "blur(10px)",
            }}
          />
          <div
            className="absolute pointer-events-none"
            style={{
              width: 500,
              height: 500,
              bottom: -180,
              right: -100,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${P_DARK}88, transparent 65%)`,
              filter: "blur(10px)",
            }}
          />

          {/* Fine dot grid */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(rgba(255,255,255,0.13) 1px, transparent 1px)",
              backgroundSize: "22px 22px",
            }}
          />

          {/* ── Navbar ── */}
          <header
            className="relative z-10 w-full"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.13)" }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "rgba(255,255,255,0.18)",
                    border: "1px solid rgba(255,255,255,0.25)",
                  }}
                >
                  <GraduationCap size={16} color="#fff" strokeWidth={2.5} />
                </div>
                <div>
                  <span className="font-bold text-[15px] leading-none block text-white">
                    HUNAR Punjab
                  </span>
                  <span className="text-[9px] font-semibold uppercase tracking-[0.05em] text-white/50">
                    Hub for Upskilling, Networking & Access to Rozgar
                  </span>
                </div>
              </div>

              {/* Login */}
              <button
                onClick={() => router.push("/login")}
                className="ilp-nav-btn flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm text-white"
                style={{
                  background: "rgba(255,255,255,0.13)",
                  border: "1px solid rgba(255,255,255,0.22)",
                }}
              >
                <LogIn size={14} strokeWidth={2.5} />
                Industry Login
                <span
                  className="ilp-dot-live w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{
                    background: "#4ade80",
                    boxShadow: "0 0 6px #4ade80",
                  }}
                />
              </button>
            </div>
          </header>

          {/* ── Hero content ── */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32 text-center">
            {/* H1 */}
            <h1 className="ilp-rise ilp-d1 text-4xl sm:text-5xl lg:text-[64px] font-extrabold leading-[1.07] tracking-tight mb-5">
              <span className="text-white">Connect with </span>
              <span className="ilp-shine">Top Institutes</span>
              <br />
              <span className="text-white/90">across Punjab</span>
            </h1>

            <p className="ilp-rise ilp-d2 text-base sm:text-[17px] max-w-2xl mx-auto leading-relaxed mb-11 text-white/65">
              Search institutes by location and course offerings - connect directly with their placement teams to meet your workforce requirements.
            </p>

            {/* CTA row */}
            <div className="ilp-rise ilp-d3 flex flex-wrap items-center justify-center gap-3 mb-16">
              <button
                onClick={() =>
                  searchRef.current?.scrollIntoView({ behavior: "smooth" })
                }
                className="ilp-btn-white flex items-center gap-2 px-7 py-3 rounded-xl font-bold text-sm"
                style={{
                  background: "#fff",
                  color: P,
                  boxShadow: "0 4px 18px rgba(0,0,0,0.22)",
                }}
              >
                <Search size={15} /> Start Searching <ArrowRight size={14} />
              </button>
              <button
                onClick={() => router.push("/login")}
                className="ilp-btn-ghost flex items-center gap-2 px-7 py-3 rounded-xl font-bold text-sm text-white"
                style={{
                  background: "rgba(255,255,255,0.11)",
                  border: "1px solid rgba(255,255,255,0.24)",
                }}
              >
                <LogIn size={14} /> Partner Login
              </button>
            </div>

            {/* Stats */}
            <div className="ilp-rise ilp-d4 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
              {[
                { value: "1,200+", label: "Institutes", icon: Building2 },
                { value: "85,000+", label: "Students", icon: Users },
                { value: "340+", label: "Companies", icon: TrendingUp },
                { value: "92%", label: "Placement Rate", icon: Award },
              ].map(({ value, label, icon: Icon }) => (
                <div
                  key={label}
                  className="ilp-stat text-center px-4 py-5 rounded-2xl"
                  style={{
                    background: "rgba(255,255,255,0.12)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <Icon
                    size={16}
                    color="rgba(255,255,255,0.7)"
                    className="mx-auto mb-2"
                  />
                  <p className="text-[23px] font-extrabold text-white">
                    {value}
                  </p>
                  <p className="text-[10px] font-semibold uppercase tracking-widest mt-0.5 text-white/50">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Curved SVG wave — fills from hero color (#605dff) into page bg ── */}
          <div
            className="relative z-10 w-full"
            style={{ marginBottom: "-2px" }}
          >
            <svg
              viewBox="0 0 1440 90"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full block"
              preserveAspectRatio="none"
              style={{ display: "block" }}
            >
              {/* Two layered paths for depth */}
              <path
                d="M0,50 C200,90 400,20 600,55 C800,90 1100,15 1440,50 L1440,90 L0,90 Z"
                fill="hsl(var(--b1))"
                opacity="0.4"
              />
              <path
                d="M0,65 C300,20 600,85 900,40 C1100,10 1300,60 1440,45 L1440,90 L0,90 Z"
                fill="hsl(var(--b1))"
              />
            </svg>
          </div>
        </div>

        {/* ── Feature chips (float below wave, still on page bg) ── */}
        <div className="w-full" style={{ background: "hsl(var(--b1))" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8 flex flex-wrap justify-center gap-2.5">
            {[
              { icon: Filter, text: "Multi filter dimensions" },
              { icon: Zap, text: "Instant Matching" },
              { icon: ShieldCheck, text: "Verified Institutes" },
            ].map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="ilp-chip flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold"
                style={{
                  background: P_ALPHA(0.08),
                  color: P,
                  border: `1px solid ${P_ALPHA(0.18)}`,
                }}
              >
                <Icon size={12} /> {text}
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            SEARCH CARD
        ══════════════════════════════════════════════════════ */}
        <div className="w-full pb-14" style={{ background: "hsl(var(--b1))" }}>
          <div
            ref={searchRef}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          >
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: "hsl(var(--b2))",
                border: "1px solid hsl(var(--bc) / 0.08)",
                boxShadow: `0 4px 32px rgba(0,0,0,0.06), 0 0 0 1px ${P_ALPHA(0.1)}`,
              }}
            >
              {/* Card header — left color bar + icon */}
              <div
                className="relative flex items-center justify-between px-6 sm:px-8 py-4"
                style={{ borderBottom: "1px solid hsl(var(--bc) / 0.07)" }}
              >
                {/* Colored left bar */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r-full"
                  style={{ background: P }}
                />

                <div className="flex items-center gap-3 pl-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: P }}
                  >
                    <Search size={14} color="#fff" />
                  </div>
                  <div>
                    <h2
                      className="font-bold text-[15px] leading-tight"
                      style={{ color: "hsl(var(--bc))" }}
                    >
                      Find Institutes
                    </h2>
                    <p
                      className="text-xs"
                      style={{ color: "hsl(var(--bc) / 0.38)" }}
                    >
                      Search | Filter | Connect
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setFiltersOpen((v) => !v)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150"
                  style={
                    filtersOpen
                      ? {
                        background: P_ALPHA(0.09),
                        color: P,
                        border: `1px solid ${P_ALPHA(0.25)}`,
                      }
                      : {
                        background: "hsl(var(--bc) / 0.05)",
                        color: "hsl(var(--bc) / 0.45)",
                        border: "1px solid hsl(var(--bc) / 0.09)",
                      }
                  }
                >
                  <Filter size={11} />
                  {filtersOpen ? "Hide Filters" : "Show Filters"}
                  {activeFilterCount > 0 && !filtersOpen && (
                    <span
                      className="w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center"
                      style={{ background: P, color: "#fff" }}
                    >
                      {activeFilterCount}
                    </span>
                  )}
                  <ChevronDown
                    size={11}
                    style={{
                      transform: filtersOpen
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                      transition: "transform .2s",
                    }}
                  />
                </button>
              </div>

              {/* Filters */}
              <div
                className="transition-all duration-300 relative z-20"
                style={{
                  maxHeight: filtersOpen ? "700px" : "0",
                  opacity: filtersOpen ? 1 : 0,
                  overflow: filtersOpen ? "visible" : "hidden",
                }}
              >
                <div
                  className="px-6 sm:px-8 py-5"
                  style={{ borderBottom: "1px solid hsl(var(--bc) / 0.06)" }}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <MultiSelectDropdown
                      label="District"
                      options={districtOpts}
                      selected={filters.district_ids}
                      onChange={setFilter("district_ids")}
                      placeholder="Any district"
                    />
                    <MultiSelectDropdown
                      label="Qualification"
                      options={qualOpts}
                      selected={filters.qualification_ids}
                      onChange={setFilter("qualification_ids")}
                      placeholder="Any qualification"
                    />
                    <MultiSelectDropdown
                      label="Stream / Branch"
                      options={streamOpts}
                      selected={filters.stream_ids}
                      onChange={setFilter("stream_ids")}
                      placeholder="Any stream"
                    />
                  </div>

                  {activeFilterCount > 0 && (
                    <div className="mt-4 flex items-center gap-3">
                      <span
                        className="text-xs"
                        style={{ color: "hsl(var(--bc) / 0.33)" }}
                      >
                        {activeFilterCount} filter{activeFilterCount !== 1 ? "s" : ""} active
                      </span>
                      <button
                        onClick={() => setFilters(EMPTY_FILTERS)}
                        className="text-xs font-semibold flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity"
                        style={{ color: "#ef4444" }}
                      >
                        <X size={10} /> Clear all
                      </button>
                    </div>
                  )}
                  {/* Always show reset button explicitly as requested */}
                  {activeFilterCount === 0 && (
                    <div className="mt-4 flex items-center justify-end">
                      <button
                        onClick={() => setFilters(EMPTY_FILTERS)}
                        className="text-xs font-semibold flex items-center gap-1 opacity-40 hover:opacity-100 transition-opacity"
                        style={{ color: "hsl(var(--bc))" }}
                      >
                        Reset filters
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Search button */}
              <div className="px-6 sm:px-8 py-4 relative z-10">
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="ilp-btn-p w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: P,
                    color: "#fff",
                    boxShadow: `0 4px 18px ${P_ALPHA(0.3)}`,
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={17} className="animate-spin" /> Searching…
                    </>
                  ) : (
                    <>
                      <Search size={17} /> Search All Institutes{" "}
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </div>

              {/* Loading */}
              {searched && loading && (
                <div
                  className="px-6 sm:px-8 pb-10 pt-4 flex items-center justify-center gap-2.5"
                  style={{
                    borderTop: "1px solid hsl(var(--bc) / 0.06)",
                    color: "hsl(var(--bc) / 0.33)",
                  }}
                >
                  <Loader2
                    size={17}
                    className="animate-spin"
                    style={{ color: P }}
                  />
                  <span className="text-sm">Finding matching institutes…</span>
                </div>
              )}

              {/* Results */}
              {searched && !loading && (
                <div
                  className="px-6 sm:px-8 pb-8"
                  style={{ borderTop: "1px solid hsl(var(--bc) / 0.06)" }}
                >
                  <div className="flex items-center justify-between pt-5 mb-4">
                    <p
                      className="text-sm"
                      style={{ color: "hsl(var(--bc) / 0.45)" }}
                    >
                      <span
                        className="font-bold text-base"
                        style={{ color: "hsl(var(--bc))" }}
                      >
                        {institutes.length}
                      </span>{" "}
                      institutes found
                    </p>
                    {institutes.length > 0 && (
                      <span
                        className="text-xs"
                        style={{ color: "hsl(var(--bc) / 0.28)" }}
                      >
                        Click "Send Job Offer" to connect
                      </span>
                    )}
                  </div>

                  {institutes.length === 0 ? (
                    <div className="text-center py-16">
                      <div
                        className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center"
                        style={{
                          background: P_ALPHA(0.08),
                          border: `1px solid ${P_ALPHA(0.18)}`,
                        }}
                      >
                        <Building2 size={20} style={{ color: P_ALPHA(0.5) }} />
                      </div>
                      <p
                        className="font-semibold text-sm mb-1"
                        style={{ color: "hsl(var(--bc) / 0.55)" }}
                      >
                        No institutes found
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: "hsl(var(--bc) / 0.28)" }}
                      >
                        Try adjusting or clearing your filters
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-base-300 dark:border-base-700 bg-base-100 dark:bg-base-900 shadow-sm shadow-base-300">
                      {/* Desktop Table */}
                      <table className="min-w-full divide-y divide-base-200 dark:divide-base-800 hidden md:table">
                        <thead>
                          <tr className="bg-base-200/60 dark:bg-base-800/60">
                            {[
                              "Institute Name",
                              "District",
                              "Students",
                              "Placement Officer",
                              "Actions",
                            ].map((h) => (
                              <th
                                key={h}
                                className="px-4 py-3 text-left text-xs font-bold text-base-content/60 uppercase tracking-wider"
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-base-200 dark:divide-base-800">
                          {institutes.map((inst, idx) => (
                            <tr key={inst.institute_id} className="transition-colors duration-150 hover:bg-base-200/50 dark:hover:bg-base-800/50">
                              <td className="px-4 py-3 align-top">
                                <span className="text-sm font-semibold text-base-content block">
                                  {inst.institute_name}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-base-content/65 align-top">
                                {inst.district || "—"}
                              </td>
                              <td className="px-4 py-3 align-top">
                                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-primary/10 text-primary text-xs font-bold">
                                  <Users size={12} />
                                  {inst.student_count.toLocaleString()}
                                </span>
                              </td>
                              <td className="px-4 py-3 align-top">
                                {inst.contactperson ? (
                                  <div>
                                    <div className="text-sm font-medium text-base-content">{inst.contactperson}</div>
                                  </div>
                                ) : (
                                  <span className="text-sm text-base-content/40">—</span>
                                )}
                              </td>
                              <td className="px-4 py-3 align-top">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (inst.po_email) window.location.href = `mailto:${inst.po_email}`;
                                    }}
                                    disabled={!inst.po_email}
                                    title="Email Placement Officer"
                                    className="h-8 w-8 rounded-md bg-base-200 text-base-content/60 hover:text-primary hover:bg-primary/10 flex items-center justify-center transition-all disabled:opacity-40"
                                  >
                                    <Mail size={14} />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setCurrentInstitute(inst);
                                      setViewInstitute(true);
                                    }}
                                    title="View Profile"
                                    className="h-8 w-8 rounded-md bg-base-200 text-base-content/60 hover:text-primary hover:bg-primary/10 flex items-center justify-center transition-all"
                                  >
                                    <Eye size={14} />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setLoginModal(true);
                                    }}
                                    className="h-8 px-3 rounded-md bg-primary/10 text-primary hover:bg-primary hover:text-primary-content text-xs font-bold flex items-center gap-1.5 transition-all"
                                  >
                                    <Send size={12} />
                                    Connect
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {/* Mobile Cards */}
                      <div className="md:hidden flex flex-col divide-y divide-base-200 dark:divide-base-800">
                        {institutes.map((inst, idx) => (
                          <div key={inst.institute_id} className="p-4 bg-base-100 flex flex-col gap-3 ilp-card-anim" style={{ animationDelay: `${idx * 35}ms` }}>
                            <div>
                              <h3 className="text-sm font-bold text-base-content leading-snug mb-1.5">{inst.institute_name}</h3>
                              <div className="flex flex-wrap items-center gap-3 text-xs text-base-content/60">
                                <span className="flex items-center gap-1"><MapPin size={11} /> {inst.district || "—"}</span>
                                <span className="flex items-center gap-1 font-semibold text-primary"><Users size={11} /> {inst.student_count.toLocaleString()} Students</span>
                              </div>
                            </div>
                            <div className="flex flex-col gap-1 p-2.5 rounded-lg bg-base-200/50 dark:bg-base-800/50 text-xs">
                              <span className="font-semibold text-base-content/80 uppercase tracking-wide text-[10px]">Placement Officer</span>
                              {inst.contactperson ? (
                                <span className="font-medium text-base-content">{inst.contactperson}</span>
                              ) : <span className="text-base-content/40 text-[10px]">—</span>}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <button
                                onClick={() => inst.po_email && (window.location.href = `mailto:${inst.po_email}`)}
                                disabled={!inst.po_email}
                                className="flex-1 py-1.5 rounded bg-base-200 flex items-center justify-center disabled:opacity-50 text-base-content/70 hover:text-primary"
                              >
                                <Mail size={14} />
                              </button>
                              <button
                                onClick={() => { setCurrentInstitute(inst); setViewInstitute(true); }}
                                className="flex-1 py-1.5 rounded bg-base-200 flex items-center justify-center text-base-content/70 hover:text-primary"
                              >
                                <Eye size={14} />
                              </button>
                              <button
                                onClick={() => setLoginModal(true)}
                                className="flex-[2] py-1.5 rounded bg-primary text-primary-content text-xs font-bold flex items-center justify-center gap-1.5"
                              >
                                <Send size={12} /> Connect
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Pre-search hint */}
              {!searched && (
                <div
                  className="px-6 sm:px-8 pb-5 pt-1 text-center text-xs"
                  style={{ color: "hsl(var(--bc) / 0.2)" }}
                >
                  Select filters above then hit Search to discover institutes
                </div>
              )}
            </div>

            {/* ── CTA banner below card ── */}
            <div
              className="mt-4 rounded-2xl px-6 py-4 flex flex-wrap items-center justify-between gap-3"
              style={{
                background: P_ALPHA(0.07),
                border: `1px solid ${P_ALPHA(0.16)}`,
              }}
            >
              <div className="flex items-center gap-3 flex-wrap">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: P }}
                >
                  <Sparkles size={13} color="#fff" />
                </div>
                <span className="text-sm font-semibold" style={{ color: P }}>
                  New to HUNAR Punjab?
                </span>
                <span
                  className="text-sm"
                  style={{ color: "hsl(var(--bc) / 0.5)" }}
                >
                  Register as an Industry Partner to unlock direct placement
                  offers.
                </span>
              </div>
              <button
                onClick={() => router.push("/login")}
                className="ilp-btn-p flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold"
                style={{ background: P, color: "#fff" }}
              >
                Get Started <ArrowRight size={12} />
              </button>
            </div>
          </div>
        </div>

        {/* ══════════ FOOTER ══════════ */}
        <footer
          className="w-full py-7 text-center text-sm"
          style={{
            borderTop: "1px solid hsl(var(--bc) / 0.07)",
            color: "hsl(var(--bc) / 0.33)",
          }}
        >
          Already have an account?{" "}
          <button
            onClick={() => router.push("/login")}
            className="font-semibold hover:opacity-75 transition-opacity"
            style={{ color: P }}
          >
            Sign in as Industry Partner →
          </button>
        </footer>
      </div>
      <InstituteViewModal
        open={viewInstitute}
        setOpen={setViewInstitute}
        institute={currentInstitute}
      />
    </>
  );
}
