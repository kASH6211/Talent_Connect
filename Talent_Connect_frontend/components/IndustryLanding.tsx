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
} from "lucide-react";
import api from "@/lib/api";
import MultiSelectDropdown, { Option } from "@/components/MultiSelectDropdown";

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
  state_ids: [],
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

  const [stateOpts, setStateOpts] = useState<Option[]>([]);
  const [districtOpts, setDistrictOpts] = useState<Option[]>([]);
  const [typeOpts, setTypeOpts] = useState<Option[]>([]);
  const [ownershipOpts, setOwnershipOpts] = useState<Option[]>([]);
  const [qualOpts, setQualOpts] = useState<Option[]>([]);
  const [streamOpts, setStreamOpts] = useState<Option[]>([]);

  // Load static options on mount — same logic as FindInstitutesListView
  useEffect(() => {
    const load = async () => {
      const [states, types, own, qual] = await Promise.all([
        api.get("/state").then(r => r.data.map((s: any) => ({ value: s.lgdstateid, label: s.statename })).sort((a: Option, b: Option) => a.label.localeCompare(b.label))).catch(() => []),
        api.get("/institute-type").then(r => r.data.map((t: any) => ({ value: t.institute_type_id, label: t.institute_type }))).catch(() => []),
        api.get("/institute-ownership-type").then(r => r.data.map((o: any) => ({ value: o.institute_ownership_type_id, label: o.institute_type }))).catch(() => []),
        api.get("/qualification").then(r => r.data.map((q: any) => ({ value: q.qualificationid, label: q.qualification }))).catch(() => []),
      ]);
      setStateOpts(states);
      setTypeOpts(types);
      setOwnershipOpts(own);
      setQualOpts(qual);
    };
    load();
  }, []);

  // District cascade — same as FindInstitutesListView
  useEffect(() => {
    const loadDistricts = async () => {
      if (filters.state_ids.length === 0) {
        const res = await api.get("/district");
        setDistrictOpts(
          res.data.map((d: any) => ({ value: d.districtid, label: d.districtname })).sort((a: Option, b: Option) => a.label.localeCompare(b.label))
        );
      } else {
        const results = await Promise.all(
          filters.state_ids.map(sId => api.get(`/district?state_id=${sId}`).then(r => r.data))
        );
        const merged = results.flat();
        const unique = Array.from(new Map(merged.map((d: any) => [d.districtid, d])).values());
        setDistrictOpts(unique.map((d: any) => ({ value: d.districtid, label: d.districtname })).sort((a: Option, b: Option) => a.label.localeCompare(b.label)));
      }
    };
    loadDistricts();
  }, [filters.state_ids]);

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
    (v) => v.length > 0,
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
                    Talent Connect
                  </span>
                  <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/50">
                    Industry Portal
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
            {/* Badge */}
            <div
              className="ilp-rise inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-7 text-xs font-semibold uppercase tracking-[0.1em]"
              style={{
                background: "rgba(255,255,255,0.14)",
                border: "1px solid rgba(255,255,255,0.22)",
                color: "#fff",
              }}
            >
              <Sparkles size={11} /> India's Largest Placement Network
            </div>

            {/* H1 */}
            <h1 className="ilp-rise ilp-d1 text-4xl sm:text-5xl lg:text-[64px] font-extrabold leading-[1.07] tracking-tight mb-5">
              <span className="text-white">Connect with </span>
              <span className="ilp-shine">Top Institutes</span>
              <br />
              <span className="text-white/90">Across India</span>
            </h1>

            <p className="ilp-rise ilp-d2 text-base sm:text-[17px] max-w-2xl mx-auto leading-relaxed mb-11 text-white/65">
              Search 1,200+ institutes, filter by stream, location &
              qualification, and send job offers directly to placement cells —
              all in one place.
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
              { icon: Globe2, text: "All-India Coverage" },
              { icon: Filter, text: "7 Filter Dimensions" },
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
                      Filter & connect with placement cells
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
                className="ilp-collapse"
                style={{
                  maxHeight: filtersOpen ? "700px" : "0",
                  opacity: filtersOpen ? 1 : 0,
                }}
              >
                <div
                  className="px-6 sm:px-8 py-5"
                  style={{ borderBottom: "1px solid hsl(var(--bc) / 0.06)" }}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    <MultiSelectDropdown
                      label="State"
                      options={stateOpts}
                      selected={filters.state_ids}
                      onChange={setFilter("state_ids")}
                      placeholder="Any state"
                    />
                    <MultiSelectDropdown
                      label="District"
                      options={districtOpts}
                      selected={filters.district_ids}
                      onChange={setFilter("district_ids")}
                      placeholder="Any district"
                    />
                    <MultiSelectDropdown
                      label="Institute Type"
                      options={typeOpts}
                      selected={filters.type_ids}
                      onChange={setFilter("type_ids")}
                      placeholder="Any type"
                    />
                    <MultiSelectDropdown
                      label="Ownership"
                      options={ownershipOpts}
                      selected={filters.ownership_ids}
                      onChange={setFilter("ownership_ids")}
                      placeholder="Any ownership"
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
                        {activeFilterCount} filter
                        {activeFilterCount !== 1 ? "s" : ""} active
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
                </div>
              </div>

              {/* Search button */}
              <div className="px-6 sm:px-8 py-4">
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
                    <div className="ilp-scroll grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[580px] overflow-y-auto pr-1">
                      {institutes.map((inst, idx) => (
                        <div
                          key={inst.institute_id}
                          className="ilp-card-anim"
                          style={{ animationDelay: `${idx * 35}ms` }}
                        >
                          <InstituteCard
                            inst={inst}
                            onSend={() => setLoginModal(true)}
                            index={idx}
                          />
                        </div>
                      ))}
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
                  New to Talent Connect?
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
    </>
  );
}
