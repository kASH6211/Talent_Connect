"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import MultiSelectDropdown, { Option } from "@/components/MultiSelectDropdown";
import {
  Search,
  Filter,
  MapPin,
  Users,
  Building2,
  LogIn,
  X,
  ChevronLeft,
  ChevronRight,
  Shield,
  Globe,
  BookOpen,
  AlertCircle,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useMapEvents, useMap } from "react-leaflet";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { updateLoginUi } from "@/store/login";
import RoleSelectModal from "./landing-page/RoleSelectModal";
import Footer from "./landing-page/Footer";
import Pagination from "@/components/common/Pagination";

// Fix Leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Dynamic imports for Leaflet components
const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false },
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false },
);
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), {
  ssr: false,
});
const GeoJSON = dynamic(() => import("react-leaflet").then((m) => m.GeoJSON), {
  ssr: false,
});

const BASE =
  (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001") + "/api";
const pub = axios.create({ baseURL: BASE });

interface InstituteRow {
  institute_id: number;
  institute_name: string;
  district_id: number;
  district?: string;
  type_id?: number;
  type?: string;
  ownership_id?: number;
  ownership?: string;
  email?: string;
  mobileno?: string;
  student_count: number;
  final_year_student_count?: number;
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

const PAGE_SIZE = 5;

// Map click handler component
function MapClickEvent({
  setUserLocation,
}: {
  setUserLocation: (loc: [number, number]) => void;
}) {
  const map = useMap();
  useMapEvents({
    click(e: any) {
      setUserLocation([e.latlng.lat, e.latlng.lng]);
      map.flyTo(e.latlng, 14);
    },
  });
  return null;
}

// (Standalone LoginPromptModal has been moved to components/common/LoginPromptModal.tsx)

// ... (rest of your PublicLandingPage component remains exactly the same)

export default function PublicLandingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const roleModal = useSelector((state: RootState) => state?.login?.ui);

  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [institutes, setInstitutes] = useState<InstituteRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  const [districtOpts, setDistrictOpts] = useState<Option[]>([]);
  const [typeOpts, setTypeOpts] = useState<Option[]>([]);
  const [ownershipOpts, setOwnershipOpts] = useState<Option[]>([]);
  const [qualOpts, setQualOpts] = useState<Option[]>([]);
  const [streamOpts, setStreamOpts] = useState<Option[]>([]);

  // Map state
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null,
  );
  const [searchGeoTerm, setSearchGeoTerm] = useState("");
  const [punjabGeoJson, setPunjabGeoJson] = useState<any>(null);
  const [mapSearchLoading, setMapSearchLoading] = useState(false);
  const [mapSearchError, setMapSearchError] = useState("");
  const [mapSearchSuccess, setMapSearchSuccess] = useState(false);

  // Load Punjab GeoJSON
  useEffect(() => {
    fetch("/punjab_state.geojson")
      .then((res) => res.json())
      .then((data) => setPunjabGeoJson(data))
      .catch((err) => console.error("Error loading Punjab GeoJSON:", err));
  }, []);

  // Load filter options (Static ones)
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [types, ownerships, quals] = await Promise.all([
          pub.get("/institute-type"),
          pub.get("/institute-ownership-type"),
          pub.get("/qualification"),
        ]);

        setTypeOpts(
          types.data.map((t: any) => ({
            value: t.institute_type_id,
            label: t.institute_type,
          })),
        );

        setOwnershipOpts(
          ownerships.data.map((o: any) => ({
            value: o.institute_ownership_type_id,
            label: o.institute_type,
          })),
        );

        setQualOpts(
          quals.data.map((q: any) => ({
            value: q.qualificationid,
            label: q.qualification,
          })),
        );
      } catch (error) {
        console.error("Failed to load filters:", error);
      }
    };

    loadFilters();
  }, []);

  // Cascading Streams Filter
  useEffect(() => {
    const loadStreams = async () => {
      try {
        let streamsToShow: Option[] = [];

        if (filters.qualification_ids.length > 0) {
          // 1. Fetch streams for each selected qualification in parallel
          const streamPromises = filters.qualification_ids.map(id =>
            pub.get(`/stream-branch?qualification_id=${id}`)
          );
          const streamResponses = await Promise.all(streamPromises);

          // 2. Merge and de-duplicate master streams
          const masterStreamsMap = new Map<number, string>();
          streamResponses.forEach(res => {
            res.data.forEach((s: any) => {
              masterStreamsMap.set(s.stream_branch_Id, s.stream_branch_name);
            });
          });

          // 3. Fetch streams currently being offered by institutes
          const inUseRes = await pub.get("/institute-qualification-mapping/streams-in-use");
          const inUseIds = new Set(inUseRes.data.map((s: any) => s.stream_branch_Id));

          // 4. Intersect
          masterStreamsMap.forEach((label, value) => {
            if (inUseIds.has(value)) {
              streamsToShow.push({ value, label });
            }
          });
        } else {
          // No qualification selected: show all active streams in the portal
          const res = await pub.get("/institute-qualification-mapping/streams-in-use");
          streamsToShow = res.data.map((s: any) => ({
            value: s.stream_branch_Id,
            label: s.stream_branch_name,
          }));
        }

        // Sort alphabetically
        streamsToShow.sort((a, b) => a.label.localeCompare(b.label));
        setStreamOpts(streamsToShow);

        // 5. Cleanup selected streams that are no longer valid
        const validIds = new Set(streamsToShow.map(s => s.value));
        setFilters(prev => {
          const nextStreams = prev.stream_ids.filter(id => validIds.has(id));
          if (nextStreams.length !== prev.stream_ids.length) {
            return { ...prev, stream_ids: nextStreams };
          }
          return prev;
        });

      } catch (error) {
        console.error("Failed to load cascading streams:", error);
        setStreamOpts([]);
      }
    };

    loadStreams();
  }, [filters.qualification_ids]);

  // Districts cascade
  useEffect(() => {
    if (filters.state_ids.length === 0) {
      setDistrictOpts([]);
      return;
    }
    pub
      .get(`/district?state_id=${filters.state_ids[0]}`)
      .then((r) =>
        setDistrictOpts(
          r.data.map((d: any) => ({
            value: d.districtid ?? d.lgddistrictId,
            label: d.districtname,
          })),
        ),
      )
      .catch((error) => console.error("Failed to load districts:", error));
  }, [filters.state_ids]);

  // Handle initial type filter from URL
  useEffect(() => {
    const typeParam = searchParams?.get("type");
    if (typeParam && typeOpts.length > 0) {
      const match = typeOpts.find(
        (t) => t.label.toLowerCase() === typeParam.toLowerCase(),
      );
      if (match) {
        setFilters((prev) => ({ ...prev, type_ids: [match.value] }));
      }
    }
  }, [typeOpts, searchParams]);

  const handleSearch = useCallback(async (targetPage = 1, targetLimit = limit) => {
    setLoading(true);
    setSearched(true);
    setPage(targetPage);
    setLimit(targetLimit);

    const params = new URLSearchParams();
    if (filters.state_ids.length)
      params.set("state_ids", filters.state_ids.join(","));
    if (filters.district_ids.length)
      params.set("district_ids", filters.district_ids.join(","));
    if (filters.type_ids.length)
      params.set("type_ids", filters.type_ids.join(","));
    if (filters.ownership_ids.length)
      params.set("ownership_ids", filters.ownership_ids.join(","));
    if (filters.qualification_ids.length)
      params.set("qualification_ids", filters.qualification_ids.join(","));
    if (filters.stream_ids.length)
      params.set("stream_ids", filters.stream_ids.join(","));

    params.set("page", targetPage.toString());
    params.set("limit", targetLimit.toString());
    params.set("sort", "student_count");
    params.set("order", "desc");

    try {
      const res = await pub.get(`/institute/search?${params}`);
      setInstitutes(res.data?.data || []);
      setTotal(res.data?.total || 0);
    } catch {
      setInstitutes([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [filters, limit]);

  // Auto-search on mount
  useEffect(() => {
    handleSearch(1, limit);
  }, [handleSearch]);

  const resetFilters = () => {
    setFilters(EMPTY_FILTERS);
    setPage(1);
  };

  // Handle Geocoding Search with better error handling
  const handleGeoSearch = async () => {
    const term = searchGeoTerm.trim();
    if (!term) {
      setMapSearchError("Please enter a city, area, or pincode");
      return;
    }

    setMapSearchLoading(true);
    setMapSearchError("");
    setMapSearchSuccess(false);

    try {
      // Add Punjab context to search for better results
      const searchQuery = `${term}, Punjab, India`;
      const encodedQuery = encodeURIComponent(searchQuery);

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&limit=1`,
        {
          headers: {
            Accept: "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Search service temporarily unavailable");
      }

      const data = await response.json();

      if (!data || data.length === 0) {
        setMapSearchError(
          `No location found for "${term}". Try a different city or area.`,
        );
        setMapSearchLoading(false);
        return;
      }

      const result = data[0];
      const lat = parseFloat(result.lat);
      const lon = parseFloat(result.lon);

      // Validate coordinates are within Punjab bounds
      if (lat < 29 || lat > 33 || lon < 73 || lon > 77) {
        setMapSearchError(
          "Location is outside Punjab. Please search for places in Punjab.",
        );
        setMapSearchLoading(false);
        return;
      }

      setUserLocation([lat, lon]);
      setMapSearchSuccess(true);

      // Clear success message after 3 seconds
      setTimeout(() => setMapSearchSuccess(false), 3000);
    } catch (error) {
      console.error("Geocoding error:", error);
      setMapSearchError(
        "Unable to search location. Please try again or click on the map.",
      );
    } finally {
      setMapSearchLoading(false);
    }
  };

  return (
    <>

      {/* Header & Search Section - Edge-to-Edge */}
      <div className="bg-primary text-primary-content pt-12 pb-24 px-4 lg:px-8 relative overflow-visible">
        {/* Subtle background gradients for depth */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 blur-[100px] pointer-events-none" />
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-secondary/10 rounded-full -translate-y-1/2 -translate-x-1/4 blur-[80px] pointer-events-none" />

        <div className="relative z-10 w-full px-2">
          <div className="flex items-center gap-6 mb-12">
            <div className="bg-white/10 p-3.5 rounded-2xl backdrop-blur-md border border-white/20 shadow-inner">
              <Building2 size={32} className="text-secondary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-none text-white uppercase">
              Discover <span className="text-secondary">Institutes</span>
            </h1>
          </div>

          {/* Ultra-Wide Search Box with Overflow Visible */}
          <div className="bg-white/5 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 shadow-[0_25px_80px_-15px_rgba(0,0,0,0.3)] p-8 overflow-visible">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10 overflow-visible">
              <div className="space-y-3 overflow-visible">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/50 ml-1">
                  <MapPin size={12} className="text-secondary" />
                  District / Location
                </label>
                <MultiSelectDropdown
                  label=""
                  options={districtOpts}
                  selected={filters.district_ids}
                  onChange={(v) => setFilters((f) => ({ ...f, district_ids: v }))}
                  placeholder="All Locations"
                  buttonClassName="bg-white/10 border-white/10 text-white placeholder:text-white/30 h-14 rounded-2xl hover:bg-white/20 active:bg-white/15 transition-all shadow-none"
                />
              </div>
              <div className="space-y-3 overflow-visible">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/50 ml-1">
                  <BookOpen size={12} className="text-secondary" />
                  Institute Level
                </label>
                <MultiSelectDropdown
                  label=""
                  options={qualOpts}
                  selected={filters.qualification_ids}
                  onChange={(v) =>
                    setFilters((f) => ({ ...f, qualification_ids: v }))
                  }
                  placeholder="All Qualifications"
                  buttonClassName="bg-white/10 border-white/10 text-white placeholder:text-white/30 h-14 rounded-2xl hover:bg-white/20 active:bg-white/15 transition-all shadow-none"
                />
              </div>
              <div className="space-y-3 overflow-visible">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/50 ml-1">
                  <Globe size={12} className="text-secondary" />
                  Specialization
                </label>
                <MultiSelectDropdown
                  label=""
                  options={streamOpts}
                  selected={filters.stream_ids}
                  onChange={(v) => setFilters((f) => ({ ...f, stream_ids: v }))}
                  placeholder="All Specializations"
                  buttonClassName="bg-white/10 border-white/10 text-white placeholder:text-white/30 h-14 rounded-2xl hover:bg-white/20 active:bg-white/15 transition-all shadow-none"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center border-t border-white/5 pt-8">
              <p className="text-xs text-white/40 font-medium">
                Refine results by selecting multiple criteria above
              </p>
              <div className="flex gap-4 w-full sm:w-auto">
                <button
                  onClick={resetFilters}
                  className="flex-1 sm:flex-none px-8 py-4 border border-white/10 text-white/80 hover:text-white hover:bg-white/5 font-bold rounded-2xl transition-all flex items-center justify-center gap-3 text-xs uppercase tracking-widest active:scale-95"
                >
                  <X size={18} />
                  Reset
                </button>

                <button
                  onClick={() => handleSearch()}
                  disabled={loading}
                  className="flex-[2] sm:flex-none px-12 py-4 bg-secondary hover:bg-yellow-500 text-white font-black rounded-2xl transition-all flex items-center justify-center gap-4 disabled:opacity-50 text-xs uppercase tracking-widest shadow-2xl shadow-secondary/30 hover:shadow-secondary/50 hover:-translate-y-1 active:translate-y-0 active:scale-95"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Search size={18} />
                      Perform Search
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section - Full Width, No Constraints */}
      <div className="bg-[#f8faff] py-12 px-2 lg:px-4">
        <div className="w-full">
          {loading && (
            <div className="flex justify-center items-center py-16 sm:py-20">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                <p className="text-base-content/70 font-medium text-sm sm:text-base">
                  Searching institutes...
                </p>
              </div>
            </div>
          )}

          {!searched && !loading && (
            <div className="text-center py-16 sm:py-20">
              <Filter
                size={40}
                className="sm:w-12 sm:h-12 mx-auto mb-4 text-base-content/40"
              />
              <p className="text-lg sm:text-xl text-base-content/70 font-medium px-4">
                Use the filters above to search for institutes
              </p>
            </div>
          )}

          {searched && !loading && institutes.length === 0 && (
            <div className="text-center py-16 sm:py-20">
              <Building2
                size={40}
                className="sm:w-12 sm:h-12 mx-auto mb-4 text-base-content/40"
              />
              <p className="text-lg sm:text-xl font-semibold text-base-content mb-2">
                No institutes found
              </p>
              <p className="text-base-content/70 text-sm sm:text-base px-4">
                Try adjusting your filter criteria
              </p>
            </div>
          )}

          {searched && !loading && institutes.length > 0 && (
            <div className="pb-20">
              <div className="mb-10 flex flex-col sm:flex-row justify-between items-end gap-6 border-b border-slate-100 pb-8">
                <div>
                  <h2 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight leading-none mb-2">
                    {total} <span className="text-primary/40">Institutes Found</span>
                  </h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">
                    Showing Page {page} of {Math.ceil(total / limit)} Results
                  </p>
                </div>
              </div>

              {/* Split Layout Container for Table and Map (Ultra Wide) */}
              <div className="flex flex-col xl:flex-row gap-8 items-start">

                {/* Left Side: Master Table View (78% Width) */}
                <div className="w-full xl:w-[78%]">
                  <div className="hidden md:block bg-white rounded-[2.5rem] border border-slate-200 shadow-[0_15px_50px_-15px_rgba(0,0,0,0.05)] overflow-hidden">
                    <table className="w-full table-auto">
                      <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                          <th className="pl-10 pr-6 py-8 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Institute Details</th>
                          <th className="px-6 py-8 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Location</th>
                          <th className="px-6 py-8 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Category</th>
                          <th className="px-6 py-8 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Trainees</th>
                          <th className="px-6 py-8 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Placement Pool</th>
                          <th className="pl-6 pr-10 py-8 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Connectivity</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {institutes.map((inst) => (
                          <tr key={inst.institute_id} className="hover:bg-primary/[0.02] transition-colors group">
                            <td className="pl-10 pr-6 py-7">
                              <div className="flex items-center gap-5">
                                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 group-hover:scale-110 transition-all duration-500 shadow-sm">
                                  <Building2 size={24} className="text-slate-400 group-hover:text-primary transition-colors" />
                                </div>
                                <div className="min-w-0">
                                  <h4 className="font-black text-slate-800 text-sm tracking-tight mb-1 group-hover:text-primary transition-colors">{inst.institute_name}</h4>
                                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                                    <div className="w-1 h-1 rounded-full bg-slate-300" />
                                    {inst.email || "Verification Pending"}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-7 font-bold text-xs text-slate-500">
                              <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-secondary shadow-[0_0_8px_rgba(242,166,44,0.5)]" />
                                {inst.district || "N/A"}
                              </div>
                            </td>
                            <td className="px-6 py-7">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100/50 px-3 py-1.5 rounded-lg border border-slate-100">
                                {inst.type || "Professional"}
                              </span>
                            </td>
                            <td className="px-6 py-7 text-center">
                              <div className="inline-flex flex-col">
                                <span className="text-base font-black text-primary leading-none mb-1">{inst.student_count}</span>
                                <span className="text-[8px] font-bold text-slate-300 uppercase tracking-tighter">Total Students</span>
                              </div>
                            </td>
                            <td className="px-6 py-7 text-center">
                              <div className="inline-flex flex-col">
                                <span className="text-base font-black text-slate-800 leading-none mb-1">{inst.final_year_student_count ?? "0"}</span>
                                <span className="text-[8px] font-bold text-slate-300 uppercase tracking-tighter">Final Year</span>
                              </div>
                            </td>
                            <td className="pl-6 pr-10 py-7 text-right">
                              <button
                                onClick={() => dispatch(updateLoginUi({ authPrompt: { open: true } }))}
                                className="px-6 py-3 bg-white border-2 border-primary/10 text-primary hover:bg-primary hover:text-white hover:border-primary font-black rounded-xl transition-all duration-500 inline-flex items-center gap-2 text-[10px] uppercase tracking-widest shadow-sm hover:shadow-primary/30 active:scale-95 group/btn"
                              >
                                <LogIn size={14} className="group-hover/btn:-translate-x-1 transition-transform" />
                                Contact
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <Pagination
                    total={total}
                    page={page}
                    limit={limit}
                    onPageChange={(p) => handleSearch(p, limit)}
                    onLimitChange={(l) => handleSearch(1, l)}
                  />
                </div>

                {/* Right Side: Visual Map Intelligence (22% Width) */}
                <div className="w-full xl:w-[22%] sticky top-8">
                  <div className="bg-white rounded-[3rem] border border-slate-200 shadow-[0_25px_60px_rgba(0,0,0,0.06)] p-10 group overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none" />

                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary shadow-inner">
                        <MapPin size={24} />
                      </div>
                      <div>
                        <h3 className="text-base font-black text-slate-800 tracking-tight leading-none mb-1">Spatial View</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Punjab Intelligence</p>
                      </div>
                    </div>

                    <div className="space-y-5 mb-8">
                      <div className="relative group/search">
                        <input
                          type="text"
                          placeholder="District / Area..."
                          className="w-full pl-12 pr-4 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/40 focus:bg-white transition-all text-xs font-black text-slate-700 placeholder:text-slate-300"
                          value={searchGeoTerm}
                          onChange={(e) => setSearchGeoTerm(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleGeoSearch()}
                        />
                        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-200 group-focus-within/search:text-primary transition-colors" />
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={handleGeoSearch}
                          disabled={mapSearchLoading}
                          className="px-6 py-5 bg-slate-800 hover:bg-black disabled:bg-slate-200 text-white font-black rounded-2xl transition-all text-[10px] uppercase tracking-[0.2em] flex-1 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-95"
                        >
                          {mapSearchLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Verify Location"}
                        </button>
                        <button
                          onClick={() => setUserLocation(null)}
                          className="p-5 bg-slate-50 border border-slate-100 text-slate-400 hover:text-red-500 hover:bg-red-50 hover:border-red-100 rounded-2xl transition-all shadow-sm active:scale-90"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    </div>

                    <div className="w-full h-[600px] rounded-[2.5rem] border-4 border-slate-50 overflow-hidden shadow-inner bg-slate-100 relative group/map">
                      <MapContainer
                        center={userLocation || [31.1471, 75.3412]}
                        zoom={userLocation ? 13 : 7}
                        scrollWheelZoom={true}
                        style={{ height: "100%", width: "100%" }}
                        className="grayscale-[0.2] hover:grayscale-0 transition-all duration-700"
                      >
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {punjabGeoJson && (
                          <GeoJSON
                            data={punjabGeoJson}
                            style={() => ({
                              color: "#1e40af",
                              weight: 3,
                              fillColor: "#1e40af",
                              fillOpacity: 0.1,
                            })}
                          />
                        )}
                        {userLocation && <Marker position={userLocation} />}
                        <MapClickEvent setUserLocation={setUserLocation} />
                      </MapContainer>

                      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[400] bg-white/90 backdrop-blur-md px-5 py-2.5 rounded-full border border-white shadow-xl pointer-events-none transition-transform group-hover/map:-translate-y-2">
                        <span className="text-[9px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                          Geo-Spatial Context Active
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Info Section - Ultra Wide */}
      <div className="bg-white border-t border-slate-100 py-24 px-4 lg:px-8">
        <div className="w-full">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-16">
            {/* Item 1 */}
            <div className="flex items-start gap-8 border-l-4 border-primary pl-10 py-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center flex-shrink-0 text-primary shadow-inner">
                <Shield size={32} />
              </div>
              <div>
                <h3 className="font-black text-slate-800 text-lg mb-2 tracking-tight">
                  Verified Data
                </h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] leading-loose">
                  Government Validated <br /> 100% Authenticity
                </p>
              </div>
            </div>

            {/* Item 2 */}
            <div className="flex items-start gap-8 border-l-4 border-secondary pl-10 py-4">
              <div className="w-16 h-16 rounded-2xl bg-secondary/5 flex items-center justify-center flex-shrink-0 text-secondary shadow-inner">
                <BookOpen size={32} />
              </div>
              <div>
                <h3 className="font-black text-slate-800 text-lg mb-2 tracking-tight">
                  Deep Catalog
                </h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] leading-loose">
                  500+ Specializations <br /> Across Punjab
                </p>
              </div>
            </div>

            {/* Item 3 */}
            <div className="flex items-start gap-8 border-l-4 border-slate-800 pl-10 py-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-800/5 flex items-center justify-center flex-shrink-0 text-slate-800 shadow-inner">
                <Globe size={32} />
              </div>
              <div>
                <h3 className="font-black text-slate-800 text-lg mb-2 tracking-tight">
                  Direct Access
                </h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] leading-loose">
                  FastTrack Integration <br /> Instant Verification
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
