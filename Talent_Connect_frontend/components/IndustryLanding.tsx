"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
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
  Mail,
  Eye,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe2,
  ArrowUpDown,
} from "lucide-react";
import api from "@/lib/api";
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// Dynamically load UI elements to avoid SSR issues with Leaflet
const MapContainer = dynamic(() => import('react-leaflet').then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((m) => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((m) => m.Marker), { ssr: false });
import { useMapEvents, useMap } from 'react-leaflet';

import L from 'leaflet';
// Fix Leaflet marker missing images in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Helper for 'in air' distance (Haversine formula in km)
function calculateAirDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Helper for 'in path' distance using OSRM
async function calculatePathDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  try {
    const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=false`);
    const data = await res.json();
    if (data.routes && data.routes.length > 0) {
      return data.routes[0].distance / 1000; // convert meters to km
    }
    return null;
  } catch (e) {
    console.warn("OSRM error:", e);
    return null;
  }
}

import MultiSelectDropdown, { Option } from "@/components/MultiSelectDropdown";
import { InstituteViewModal } from "@/views/find-institute/list/InstituteViewModal";
import InstituteCoursesModal from "@/views/find-institute/view/InstituteCoursesModal";

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
  final_year_student_count?: number;
  contactperson: string;
  po_mobile: string;
  po_email: string;
  latitude?: string;
  longitude?: string;
  air_distance?: number;
  path_distance?: number;
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
            to collaborate with institute.
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
  const [sort, setSort] = useState<"name" | "name-rev" | "student_count">("student_count");
  const [loginModal, setLoginModal] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [viewInstitute, setViewInstitute] = useState(false);
  const [viewCourses, setViewCourses] = useState(false);
  const [currentInstitute, setCurrentInstitute] = useState<InstituteRow | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Map state
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [searchGeoTerm, setSearchGeoTerm] = useState("");

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
    setCurrentPage(1);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if ((v as number[]).length) params.set(k, (v as number[]).join(","));
    });
    try {
      const res = await api.get(`/institute/search?${params}`);
      let data = res.data ?? [];

      if (userLocation) {
        data = data.map((inst: InstituteRow) => {
          if (inst.latitude && inst.longitude) {
            const air = calculateAirDistance(userLocation[0], userLocation[1], parseFloat(inst.latitude), parseFloat(inst.longitude));
            return { ...inst, air_distance: air };
          }
          return inst;
        });
      }

      setInstitutes(data);
    } catch {
      setInstitutes([]);
    }
    setLoading(false);
  }, [filters, userLocation]);

  useEffect(() => {
    handleSearch();
  }, [handleSearch]);

  // Effect to recalculate Air Distances dynamically if userLocation changes
  useEffect(() => {
    if (!userLocation || institutes.length === 0) return;
    setInstitutes(prev => prev.map(inst => {
      if (inst.latitude && inst.longitude) {
        const air = calculateAirDistance(userLocation[0], userLocation[1], parseFloat(inst.latitude), parseFloat(inst.longitude));
        return { ...inst, air_distance: air };
      }
      return inst;
    }));
  }, [userLocation]);

  // Handle Geocoding Search (Nominatim)
  const handleGeoSearch = async () => {
    if (!searchGeoTerm.trim()) return;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchGeoTerm)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        setUserLocation([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
      }
    } catch (e) {
      console.warn("Geocoding failed", e);
    }
  };

  // Leaflet Component Hook
  const MapClickEvent = () => {
    useMapEvents({
      click(e: any) {
        setUserLocation([e.latlng.lat, e.latlng.lng]);
      }
    });
    const map = useMap();
    useEffect(() => {
      if (userLocation) map.flyTo(userLocation, map.getZoom());
    }, [userLocation, map]);
    return null;
  };

  const activeFilterCount = Object.values(filters).filter(
    (v, i) => Object.keys(filters)[i] !== 'state_ids' && Array.isArray(v) && v.length > 0,
  ).length;

  const filteredInstitutes = useMemo(() => {
    let list = [...institutes];

    // sort
    if (sort === "name") {
      list.sort((a, b) => a.institute_name.localeCompare(b.institute_name));
    } else if (sort === "name-rev") {
      list.sort((a, b) => b.institute_name.localeCompare(a.institute_name));
    } else if (sort === "student_count") {
      list.sort((a, b) => (b.student_count || 0) - (a.student_count || 0));
    }
    return list;
  }, [institutes, sort]);

  const PAGE_SIZE = 10;
  const totalPages = Math.ceil(filteredInstitutes.length / PAGE_SIZE);
  const pagedInstitutes = filteredInstitutes.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <>
      <style>{STYLES}</style>
      <LoginModal open={loginModal} onClose={() => setLoginModal(false)} />

      <div
        className="ilp min-h-screen flex flex-col"
        style={{ background: "hsl(var(--b1))" }}
      >
        {/* ══════════════════════════════════════════════════════
            TOP HEADER
        ══════════════════════════════════════════════════════ */}
        <header className="w-full bg-base-100 dark:bg-base-900 border-b border-base-200 dark:border-base-800 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => router.push("/")}
                style={{ background: P }}
              >
                <GraduationCap size={20} className="text-primary-content" />
              </div>
              <div className="flex flex-col cursor-pointer" onClick={() => router.push("/")}>
                <span className="text-sm font-bold text-base-content leading-tight">
                  HUNAR Punjab
                </span>
                <span className="text-[9px] text-base-content/60 leading-tight hidden sm:block">
                  Hub for Upskilling, Networking & Access to Rozgar
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/login")}
                className="btn btn-sm text-primary-content border-none shadow-md hover:-translate-y-0.5 transition-transform"
                style={{ background: P_DARK }}
              >
                <LogIn size={14} /> Login
              </button>
            </div>
          </div>
        </header>

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
                      placeholder="All districts"
                    />
                    <MultiSelectDropdown
                      label="Qualification"
                      options={qualOpts}
                      selected={filters.qualification_ids}
                      onChange={setFilter("qualification_ids")}
                      placeholder="All qualifications"
                    />
                    <MultiSelectDropdown
                      label="Course/Trade"
                      options={streamOpts}
                      selected={filters.stream_ids}
                      onChange={setFilter("stream_ids")}
                      placeholder="All courses/trades"
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
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-5 mb-4 gap-4">
                    <p
                      className="text-sm"
                      style={{ color: "hsl(var(--bc) / 0.45)" }}
                    >
                      <span
                        className="font-bold text-base"
                        style={{ color: "hsl(var(--bc))" }}
                      >
                        {filteredInstitutes.length}
                      </span>{" "}
                      institutes found
                    </p>

                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-base-300 dark:border-base-700 bg-base-200/50 dark:bg-base-900/50 text-xs self-start sm:self-auto">
                      <ArrowUpDown size={12} style={{ color: P }} />
                      <select
                        className="bg-transparent border-0 outline-none font-medium cursor-pointer text-xs"
                        style={{ color: "hsl(var(--bc) / 0.8)" }}
                        value={sort}
                        onChange={(e) => {
                          setSort(
                            e.target.value as "name" | "name-rev" | "student_count",
                          );
                          setCurrentPage(1);
                        }}
                      >
                        <option value="student_count" style={{ color: "var(--fallback-bc,oklch(var(--bc)/1))", background: "var(--fallback-b1,oklch(var(--b1)/1))" }}>Students</option>
                        <option value="name" style={{ color: "var(--fallback-bc,oklch(var(--bc)/1))", background: "var(--fallback-b1,oklch(var(--b1)/1))" }}>A–Z</option>
                        <option value="name-rev" style={{ color: "var(--fallback-bc,oklch(var(--bc)/1))", background: "var(--fallback-b1,oklch(var(--b1)/1))" }}>Z–A</option>
                      </select>
                    </div>
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
                              "Courses",
                              "Total Enrolled Students",
                              "Final Year Students",
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
                          {pagedInstitutes.map((inst, idx) => (
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
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setCurrentInstitute(inst);
                                    setViewCourses(true);
                                  }}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-base-200 border border-base-300 dark:border-base-700 hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all text-xs font-semibold text-base-content/70"
                                >
                                  <BookOpen size={14} /> View
                                </button>
                              </td>
                              <td className="px-4 py-3 align-top">
                                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-primary/10 text-primary text-xs font-bold">
                                  <Users size={12} />
                                  {inst.student_count.toLocaleString()}
                                </span>
                              </td>
                              <td className="px-4 py-3 align-top">
                                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-secondary/10 text-secondary text-xs font-bold">
                                  <Users size={12} />
                                  {inst.final_year_student_count?.toLocaleString() || '0'}
                                </span>
                              </td>
                              <td className="px-4 py-3 align-top">
                                <div className="flex items-center gap-2">

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
                        {pagedInstitutes.map((inst, idx) => (
                          <div key={inst.institute_id} className="p-4 bg-base-100 flex flex-col gap-3 ilp-card-anim" style={{ animationDelay: `${idx * 35}ms` }}>
                            <div>
                              <h3 className="text-sm font-bold text-base-content leading-snug mb-1.5">{inst.institute_name}</h3>
                              <div className="flex flex-wrap items-center gap-3 text-xs text-base-content/60">
                                <span className="flex items-center gap-1"><MapPin size={11} /> {inst.district || "—"}</span>
                                <span className="flex items-center gap-1 font-semibold text-primary"><Users size={11} /> {inst.student_count.toLocaleString()} Total Enrolled</span>
                                <span className="flex items-center gap-1 font-semibold text-secondary"><Users size={11} /> {inst.final_year_student_count?.toLocaleString() || '0'} Final Year</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <button
                                onClick={() => { setCurrentInstitute(inst); setViewCourses(true); }}
                                className="flex-[1.5] py-1.5 rounded bg-base-200 border border-base-300 flex items-center justify-center text-xs font-bold gap-1.5 text-base-content/80 hover:border-primary hover:text-primary transition-all"
                              >
                                <BookOpen size={14} /> View Courses
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

                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-between bg-base-100 dark:bg-base-900 border-t border-base-300 dark:border-base-700 px-4 py-3">
                          <button
                            onClick={() => setCurrentPage(prev => prev - 1)}
                            disabled={currentPage === 1}
                            className="btn btn-outline btn-sm gap-1.5 text-xs disabled:opacity-40"
                          >
                            <ChevronLeft size={14} /> Previous
                          </button>

                          <span className="text-xs font-medium text-base-content/60">
                            Page {currentPage} of {totalPages}
                            <span className="hidden sm:inline">
                              {" "}
                              · {institutes.length} institutes
                            </span>
                          </span>

                          <button
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            disabled={currentPage === totalPages}
                            className="btn btn-outline btn-sm gap-1.5 text-xs disabled:opacity-40"
                          >
                            Next <ChevronRight size={14} />
                          </button>
                        </div>
                      )}
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
              {/* Interactive Map Section (Moved to Bottom) */}
              <div className="flex flex-col gap-3 p-5 sm:p-8"
                style={{
                  borderTop: "1px solid hsl(var(--bc) / 0.08)",
                }}>
                <h3 className="font-semibold text-base-content flex items-center gap-2">
                  <MapPin size={16} className="text-secondary" /> Mark Your Location for Distances
                </h3>
                <div className="flex flex-col sm:flex-row gap-3 items-end">
                  <div className="flex-1 w-full relative">
                    <input
                      type="text"
                      placeholder="Format: 'Sector 5, Kolkata'..."
                      className="input input-sm border-base-300 w-full pl-9 pr-3"
                      style={{ background: "hsl(var(--b1))" }}
                      value={searchGeoTerm}
                      onChange={(e) => setSearchGeoTerm(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleGeoSearch()}
                    />
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 pointer-events-none" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleGeoSearch} className="btn btn-sm btn-secondary shadow-sm">
                      Search Map
                    </button>
                    <button onClick={() => { setUserLocation(null); setSearchGeoTerm(""); }} className="btn btn-sm btn-outline shadow-sm text-base-content/60 border-base-300 hover:bg-base-100 bg-transparent">
                      Reset
                    </button>
                  </div>
                </div>

                {/* Map Container */}
                <div className="w-full h-[300px] sm:h-[400px] mt-2 rounded-xl overflow-hidden border border-base-200 shadow-inner z-0 relative">
                  <MapContainer
                    center={userLocation || [20.5937, 78.9629]}
                    zoom={userLocation ? 14 : 4}
                    scrollWheelZoom={true}
                    style={{ height: '100%', width: '100%' }}
                    className="z-0"
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    />
                    {userLocation && <Marker position={userLocation} />}
                    <MapClickEvent />
                  </MapContainer>
                </div>

                {!userLocation ? (
                  <p className="text-xs text-base-content/50 italic text-center">Search for your city or click on the map to place a pin and calculate distances.</p>
                ) : (
                  <div className="flex flex-col gap-0.5 items-center">
                    <p className="text-sm font-semibold text-secondary text-center">Location marked! See calculated distances.</p>
                    <p className="text-xs text-secondary/70">Air distance (Haversine) and Path distance (OSRM Route)</p>
                  </div>
                )}
              </div>

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
                  Register as an Industry Partner to Collaborate with institutes
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

      </div>
      <InstituteViewModal
        open={viewInstitute}
        setOpen={setViewInstitute}
        institute={currentInstitute}
      />
      <InstituteCoursesModal
        open={viewCourses}
        setOpen={setViewCourses}
        instituteId={currentInstitute?.institute_id ?? null}
        instituteName={currentInstitute?.institute_name ?? ""}
        filters={filters}
      />
    </>
  );
}
