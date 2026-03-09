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
  state_ids: (number | string)[];
  district_ids: (number | string)[];
  type_ids: (number | string)[];
  ownership_ids: (number | string)[];
  qualification_ids: (number | string)[];
  stream_ids: (number | string)[];
  min_enrollment?: number;
  min_placement?: number;
}

const EMPTY_FILTERS: Filters = {
  state_ids: [3],
  district_ids: [],
  type_ids: [],
  ownership_ids: [],
  qualification_ids: [],
  stream_ids: [],
  min_enrollment: undefined,
  min_placement: undefined,
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

        const getRowData = (res: any) => {
          if (Array.isArray(res)) return res;
          if (Array.isArray(res?.data)) return res.data;
          return [];
        };

        setTypeOpts(
          getRowData(types.data).map((t: any) => ({
            value: t.institute_type_id,
            label: t.institute_type,
          })),
        );

        setOwnershipOpts(
          getRowData(ownerships.data).map((o: any) => ({
            value: o.institute_ownership_type_id,
            label: o.institute_type,
          })),
        );

        setQualOpts(
          getRowData(quals.data).map((q: any) => ({
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
        const masterStreamsMap = new Map<string, number[]>();

        if (filters.qualification_ids.length > 0) {
          const streamPromises = filters.qualification_ids.map((id) =>
            pub.get(`/stream-branch?qualification_id=${id}`),
          );
          const streamResponses = await Promise.all(streamPromises);

          streamResponses.forEach((res) => {
            res.data.forEach((s: any) => {
              const ids = masterStreamsMap.get(s.stream_branch_name) || [];
              if (!ids.includes(s.stream_branch_Id))
                ids.push(s.stream_branch_Id);
              masterStreamsMap.set(s.stream_branch_name, ids);
            });
          });
        }

        const inUseRes = await pub.get(
          "/institute-qualification-mapping/streams-in-use",
        );
        const inUseIds = new Set(
          inUseRes.data.map((s: any) => s.stream_branch_Id),
        );

        if (filters.qualification_ids.length === 0) {
          inUseRes.data.forEach((s: any) => {
            const ids = masterStreamsMap.get(s.stream_branch_name) || [];
            if (!ids.includes(s.stream_branch_Id)) ids.push(s.stream_branch_Id);
            masterStreamsMap.set(s.stream_branch_name, ids);
          });
        }

        const sortedNames = Array.from(masterStreamsMap.keys()).sort();
        const finalOptions: Option[] = [];

        sortedNames.forEach((name) => {
          const ids = masterStreamsMap.get(name)!;
          const validIdsInPortal = ids.filter((id) => inUseIds.has(id));
          if (validIdsInPortal.length > 0) {
            const groupedValue =
              validIdsInPortal.length === 1
                ? validIdsInPortal[0]
                : validIdsInPortal.join(",");
            finalOptions.push({ value: groupedValue, label: name });
          }
        });

        setStreamOpts(finalOptions);

        const validValues = new Set(finalOptions.map((s) => String(s.value)));
        setFilters((prev) => {
          const nextStreams = prev.stream_ids.filter((id) =>
            validValues.has(String(id)),
          );
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
            value: d.lgddistrictId ?? d.districtid,
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

  const handleSearch = useCallback(
    async (targetPage = 1, targetLimit = limit) => {
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
      if (filters.min_enrollment)
        params.set("min_enrollment", String(filters.min_enrollment));
      if (filters.min_placement)
        params.set("min_placement", String(filters.min_placement));

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
    },
    [filters, limit],
  );

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
      {/* Header & Search Section - Centered & Compact */}
      <div className="bg-primary text-white pt-10 pb-16 px-4 lg:px-8 relative overflow-visible border-b border-white/5">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <div className="flex flex-col items-center gap-4 mb-10">

            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
              Find Institutes
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl">
              Search and connect with educational institutes across Punjab. Filter by location, qualification, and specialization.
            </p>
          </div>

          {/* Compact Filter Section */}
          <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-2xl overflow-visible">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 ml-1">
                  District / Location
                </label>
                <MultiSelectDropdown
                  label=""
                  options={districtOpts}
                  selected={filters.district_ids}
                  onChange={(v) => {
                    setFilters((f) => ({ ...f, district_ids: v }));
                    setPage(1);
                  }}
                  placeholder="All Locations"
                  buttonClassName="bg-white/10 border-white/10 text-white placeholder:text-white/40 h-11 rounded-xl hover:bg-white/20 transition-all text-xs"
                />
              </div>
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 ml-1">
                  Qualification
                </label>
                <MultiSelectDropdown
                  label=""
                  options={qualOpts}
                  selected={filters.qualification_ids}
                  onChange={(v) => {
                    setFilters((f) => ({ ...f, qualification_ids: v }));
                    setPage(1);
                  }}
                  placeholder="All Qualifications"
                  buttonClassName="bg-white/10 border-white/10 text-white placeholder:text-white/40 h-11 rounded-xl hover:bg-white/20 transition-all text-xs"
                />
              </div>
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 ml-1">
                  Specialization
                </label>
                <MultiSelectDropdown
                  label=""
                  options={streamOpts}
                  selected={filters.stream_ids}
                  onChange={(v) => {
                    setFilters((f) => ({ ...f, stream_ids: v }));
                    setPage(1);
                  }}
                  placeholder="All Specializations"
                  buttonClassName="bg-white/10 border-white/10 text-white placeholder:text-white/40 h-11 rounded-xl hover:bg-white/20 transition-all text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-white/5">
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 ml-1">
                  Min Total Enrollment
                </label>
                <input
                  type="number"
                  placeholder="e.g. 100"
                  className="w-full h-11 px-4 bg-white/10 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/20 transition-all text-white text-xs font-medium placeholder:text-white/40"
                  value={filters.min_enrollment || ""}
                  onChange={(e) => {
                    setFilters((f) => ({ ...f, min_enrollment: e.target.value ? Number(e.target.value) : undefined }));
                    setPage(1);
                  }}
                />
              </div>
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 ml-1">
                  Min Placement Pool
                </label>
                <input
                  type="number"
                  placeholder="e.g. 50"
                  className="w-full h-11 px-4 bg-white/10 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/20 transition-all text-white text-xs font-medium placeholder:text-white/40"
                  value={filters.min_placement || ""}
                  onChange={(e) => {
                    setFilters((f) => ({ ...f, min_placement: e.target.value ? Number(e.target.value) : undefined }));
                    setPage(1);
                  }}
                />
              </div>
            </div>

            <div className="flex justify-between items-center mt-6 pt-5 border-t border-white/5">
              <button
                onClick={resetFilters}
                className="text-[10px] font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-widest flex items-center gap-2"
              >
                <X size={14} />
                Reset Filters
              </button>
              <div className="text-[10px] font-medium text-slate-500 italic">
                {loading ? "Searching..." : `Showing ${total} institutes`}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="bg-slate-50 min-h-screen py-12 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {searched && institutes.length > 0 && (
            <div className="flex flex-col xl:flex-row gap-8 items-start">
              {/* Table View */}
              <div className="w-full xl:w-[75%] space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">
                            Institute Name
                          </th>
                          <th className="px-6 py-4 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">
                            Total Enrollment
                          </th>
                          <th className="px-6 py-4 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">
                            Placement Pool
                          </th>
                          <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {institutes.map((inst) => (
                          <tr key={inst.institute_id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-5">
                              <div className="max-w-xs sm:max-w-sm lg:max-w-md">
                                <h4 className="text-sm font-semibold text-slate-800 leading-snug line-clamp-2">
                                  {inst.institute_name}
                                </h4>
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1 font-medium">
                                  <MapPin size={10} />
                                  {inst.district || "N/A"}
                                  <span className="mx-1">•</span>
                                  {inst.type || "Institute"}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-5 text-center">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/5 text-primary text-[11px] font-bold whitespace-nowrap">
                                <Users size={12} />
                                {inst.student_count.toLocaleString()}
                              </span>
                            </td>
                            <td className="px-6 py-5 text-center">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary/10 text-secondary-focus text-[11px] font-bold whitespace-nowrap">
                                <Users size={12} />
                                {inst.final_year_student_count?.toLocaleString() || "0"}
                              </span>
                            </td>
                            <td className="px-6 py-5 text-right">
                              <button
                                onClick={() =>
                                  dispatch(updateLoginUi({ authPrompt: { open: true } }))
                                }
                                className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-focus text-white text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all active:scale-95 shadow-md shadow-primary/10 whitespace-nowrap"
                              >
                                <LogIn size={13} />
                                Connect
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <Pagination
                  total={total}
                  page={page}
                  limit={limit}
                  onPageChange={(p) => handleSearch(p, limit)}
                  onLimitChange={(l) => handleSearch(1, l)}
                />
              </div>

              {/* Map Column */}
              <div className="w-full xl:w-[25%] space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <MapPin size={18} />
                    </div>
                    <h3 className="text-sm font-bold text-slate-800">Map View</h3>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search area..."
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-xs font-medium"
                        value={searchGeoTerm}
                        onChange={(e) => setSearchGeoTerm(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleGeoSearch()}
                      />
                      <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>

                  <div className="w-full h-[400px] rounded-xl border border-slate-100 overflow-hidden relative">
                    <MapContainer
                      center={userLocation || [31.1471, 75.3412]}
                      zoom={userLocation ? 13 : 7}
                      scrollWheelZoom={true}
                      style={{ height: "100%", width: "100%" }}
                    >
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      {punjabGeoJson && (
                        <GeoJSON
                          data={punjabGeoJson}
                          style={() => ({
                            color: "var(--primary)",
                            weight: 2,
                            fillColor: "var(--primary)",
                            fillOpacity: 0.05,
                          })}
                        />
                      )}
                      {userLocation && <Marker position={userLocation} />}
                      <MapClickEvent setUserLocation={setUserLocation} />
                    </MapContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!searched && !loading && (
            <div className="text-center py-24 bg-white rounded-3xl border border-slate-100 border-dashed">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-300">
                <Filter size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Ready to search?</h3>
              <p className="text-sm text-slate-400">Use the filters above to find institutes in Punjab.</p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin" />
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Searching Database...</p>
            </div>
          )}
        </div>
      </div>


      <Footer />
    </>
  );
}
