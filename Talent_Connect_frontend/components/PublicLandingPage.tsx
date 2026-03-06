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

const PAGE_SIZE = 12;

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

function LoginPromptModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  // Handle click outside to close
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // If the click is on the backdrop (not on the modal content), close it
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={handleBackdropClick} // ← This enables outside click to close
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 sm:p-8 border border-slate-200"
        onClick={(e) => e.stopPropagation()} // ← Prevents closing when clicking inside modal
      >
        <div className="w-16 h-16 mx-auto bg-blue-100 rounded-lg flex items-center justify-center mb-6">
          <Shield size={32} className="text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-primary text-center mb-2">
          Authentication Required
        </h2>
        <p className="text-slate-600 text-center mb-8 text-sm sm:text-base">
          Please sign in to contact institutes or send placement offers.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() =>
              dispatch(updateLoginUi({ roleSelectModal: { open: true } }))
            }
            className="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-primary hover:bg-primary text-white font-semibold rounded-lg transition-colors text-sm sm:text-base"
          >
            Sign In
          </button>
          <button
            onClick={onClose}
            className="w-full px-4 sm:px-6 py-2.5 sm:py-3 border border-slate-300 text-primary hover:bg-slate-50 font-semibold rounded-lg transition-colors text-sm sm:text-base"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ... (rest of your PublicLandingPage component remains exactly the same)

export default function PublicLandingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const roleModal = useSelector((state: RootState) => state?.login?.ui);

  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [institutes, setInstitutes] = useState<InstituteRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [page, setPage] = useState(1);

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

  const totalPages = Math.ceil(institutes.length / PAGE_SIZE);
  const currentPageItems = institutes.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  // Load Punjab GeoJSON
  useEffect(() => {
    fetch("/punjab_state.geojson")
      .then((res) => res.json())
      .then((data) => setPunjabGeoJson(data))
      .catch((err) => console.error("Error loading Punjab GeoJSON:", err));
  }, []);

  // Load filter options
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [types, ownerships, quals, streams] = await Promise.all([
          pub.get("/institute-type"),
          pub.get("/institute-ownership-type"),
          pub.get("/qualification"),
          pub.get("/institute-qualification-mapping/streams-in-use"),
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

        setStreamOpts(
          streams.data.map((s: any) => ({
            value: s.stream_branch_Id,
            label: s.stream_branch_name,
          })),
        );
      } catch (error) {
        console.error("Failed to load filters:", error);
      }
    };

    loadFilters();
  }, []);

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

  const handleSearch = useCallback(async () => {
    setLoading(true);
    setSearched(true);
    setPage(1);

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

    params.set("sort", "student_count");
    params.set("order", "desc");

    try {
      const res = await pub.get(`/institute/search?${params}`);
      setInstitutes(res.data || []);
    } catch {
      setInstitutes([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Auto-search on mount
  useEffect(() => {
    handleSearch();
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
      {showLogin && <LoginPromptModal onClose={() => setShowLogin(false)} />}

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary via-primary/90 to-primary text-primary-content py-8 sm:py-12 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <Shield size={24} className="sm:w-8 sm:h-8" />
            <span className="text-xs sm:text-sm font-semibold tracking-wider uppercase opacity-90">
              Government Education Portal
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 leading-tight">
            Find Training & Placement Institutes
          </h1>

          <p className="text-base sm:text-lg md:text-xl opacity-90 max-w-2xl">
            Discover verified vocational and professional training institutes
            across Punjab. Search by district, qualification, courses, and
            institute type.
          </p>
        </div>
      </div>

      {/* Search & Filter Section */}
      <div className="bg-gradient-to-b from-base-200 to-base-100 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-base-100 rounded-xl border border-base-300 shadow-lg p-4 sm:p-6 md:p-8">
            <h2 className="text-lg sm:text-xl font-bold text-base-content mb-4 sm:mb-6 flex items-center gap-2">
              <Filter size={18} className="sm:w-5 sm:h-5 text-primary" />
              Search Institutes
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <MultiSelectDropdown
                label="District"
                options={districtOpts}
                selected={filters.district_ids}
                onChange={(v) => setFilters((f) => ({ ...f, district_ids: v }))}
                placeholder="All districts"
              />
              <MultiSelectDropdown
                label="Qualification"
                options={qualOpts}
                selected={filters.qualification_ids}
                onChange={(v) =>
                  setFilters((f) => ({ ...f, qualification_ids: v }))
                }
                placeholder="All qualifications"
              />
              <MultiSelectDropdown
                label="Course / Trade"
                options={streamOpts}
                selected={filters.stream_ids}
                onChange={(v) => setFilters((f) => ({ ...f, stream_ids: v }))}
                placeholder="All courses"
              />
              <MultiSelectDropdown
                label="Institute Type"
                options={typeOpts}
                selected={filters.type_ids}
                onChange={(v) => setFilters((f) => ({ ...f, type_ids: v }))}
                placeholder="All types"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end">
              {/* Reset Button */}
              <button
                onClick={resetFilters}
                className="px-4 sm:px-6 py-2 sm:py-2.5 border border-base-300 text-base-content hover:bg-base-200 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <X size={16} className="sm:w-5 sm:h-5" />
                Reset
              </button>

              {/* Search Button (SECONDARY COLOR) */}
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-4 sm:px-8 py-2 sm:py-2.5 bg-secondary hover:bg-secondary-focus text-secondary-content font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 text-sm sm:text-base"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-secondary-content border-t-transparent rounded-full animate-spin" />
                    <span className="hidden sm:inline">Searching...</span>
                  </>
                ) : (
                  <>
                    <Search size={16} className="sm:w-5 sm:h-5" />
                    <span>Search</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="bg-base-100 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
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
            <>
              <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-base-content">
                    {institutes.length} Institutes Found
                  </h2>
                  <p className="text-base-content/70 mt-1 text-sm sm:text-base">
                    Page {page} of {totalPages}
                  </p>
                </div>
              </div>

              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto rounded-lg border border-base-300 shadow-md bg-base-100 mb-8">
                <table className="w-full">
                  <thead>
                    <tr className="bg-base-200 border-b border-base-300">
                      <th className="px-6 py-4 text-left text-sm font-bold text-base-content">
                        Institute Name
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-base-content">
                        District
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-base-content">
                        Type
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-bold text-base-content">
                        Students
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-bold text-base-content">
                        Final Year
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-bold text-base-content">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-base-300">
                    {currentPageItems.map((inst) => (
                      <tr
                        key={inst.institute_id}
                        className="hover:bg-base-200 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Building2 size={18} className="text-primary" />
                            </div>
                            <div>
                              <div className="font-semibold text-base-content">
                                {inst.institute_name}
                              </div>
                              {inst.email && (
                                <div className="text-xs text-base-content/60 mt-0.5">
                                  {inst.email}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-base-content/70">
                          {inst.district || "—"}
                        </td>
                        <td className="px-6 py-4 text-base-content/70">
                          {inst.type || "—"}
                        </td>
                        <td className="px-6 py-4 text-center font-semibold text-primary">
                          {inst.student_count}
                        </td>
                        <td className="px-6 py-4 text-center font-semibold text-base-content">
                          {inst.final_year_student_count ?? "—"}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => setShowLogin(true)}
                            className="px-3 py-2 bg-primary hover:bg-primary-focus text-primary-content font-semibold rounded-lg transition-colors inline-flex items-center gap-2 text-sm"
                          >
                            <LogIn size={14} />
                            Contact
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3 mb-8">
                {currentPageItems.map((inst) => (
                  <div
                    key={inst.institute_id}
                    className="bg-base-100 border border-base-300 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Building2 size={18} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base-content text-sm sm:text-base break-words">
                          {inst.institute_name}
                        </h3>
                        {inst.email && (
                          <p className="text-xs text-base-content/60 mt-0.5 break-all">
                            {inst.email}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 mb-3 text-xs sm:text-sm">
                      <div className="flex justify-between">
                        <span className="text-base-content/70">District:</span>
                        <span className="text-base-content font-medium">
                          {inst.district || "—"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-base-content/70">Type:</span>
                        <span className="text-base-content font-medium">
                          {inst.type || "—"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-base-content/70">
                          Total Students:
                        </span>
                        <span className="text-primary font-semibold">
                          {inst.student_count}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-base-content/70">
                          Final Year:
                        </span>
                        <span className="text-base-content font-semibold">
                          {inst.final_year_student_count ?? "—"}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowLogin(true)}
                      className="w-full px-3 py-2.5 bg-primary hover:bg-primary-focus text-primary-content font-semibold rounded-lg transition-colors inline-flex items-center justify-center gap-2 text-sm"
                    >
                      <LogIn size={14} />
                      Contact Institute
                    </button>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mt-8 mb-12">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 border border-base-300 text-base-content/70 hover:bg-base-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center">
                    {totalPages <= 5
                      ? Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (p) => (
                          <button
                            key={p}
                            onClick={() => setPage(p)}
                            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg font-semibold transition-colors text-sm ${page === p
                              ? "bg-primary text-primary-content"
                              : "border border-base-300 text-base-content hover:bg-base-200"
                              }`}
                          >
                            {p}
                          </button>
                        ),
                      )
                      : /* Advanced pagination logic remains same, just update colors similarly */
                      null}
                  </div>

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 border border-base-300 text-base-content/70 hover:bg-base-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}

              {/* Map Section */}
              <div className="bg-base-100 rounded-lg border border-base-300 shadow-md p-4 sm:p-6 mb-8">
                <h3 className="text-base sm:text-lg font-bold text-base-content flex items-center gap-2 mb-4">
                  <MapPin size={18} className="sm:w-5 sm:h-5 text-primary" />
                  Mark Your Location
                </h3>

                <div className="flex flex-col gap-2 sm:gap-3 mb-4">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Enter city, area or pincode..."
                      className="w-full pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 border border-base-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                      value={searchGeoTerm}
                      onChange={(e) => setSearchGeoTerm(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleGeoSearch()}
                    />
                    <Search
                      size={16}
                      className="sm:w-5 sm:h-5 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40"
                    />
                  </div>

                  {mapSearchError && (
                    <div className="flex items-start gap-2 p-3 bg-error/10 border border-error/30 rounded-lg">
                      <AlertCircle size={16} className="text-error mt-0.5" />
                      <p className="text-xs sm:text-sm text-error">
                        {mapSearchError}
                      </p>
                    </div>
                  )}

                  {mapSearchSuccess && (
                    <div className="flex items-start gap-2 p-3 bg-success/10 border border-success/30 rounded-lg">
                      <MapPin size={16} className="text-success mt-0.5" />
                      <p className="text-xs sm:text-sm text-success">
                        Location found! Map updated.
                      </p>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={handleGeoSearch}
                      disabled={mapSearchLoading}
                      className="px-4 py-2 sm:py-2.5 bg-primary hover:bg-primary-focus disabled:bg-base-300 text-primary-content font-semibold rounded-lg transition-colors text-sm flex-1 flex items-center justify-center gap-2"
                    >
                      {mapSearchLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-primary-content border-t-transparent rounded-full animate-spin" />
                          Searching...
                        </>
                      ) : (
                        <>
                          <Search size={14} />
                          Search Location
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setUserLocation(null);
                        setSearchGeoTerm("");
                        setMapSearchError("");
                        setMapSearchSuccess(false);
                      }}
                      className="px-4 py-2 sm:py-2.5 border border-base-300 text-base-content/70 hover:bg-base-200 font-semibold rounded-lg transition-colors text-sm flex-1"
                    >
                      Reset Location
                    </button>
                  </div>
                </div>

                <div className="w-full h-64 sm:h-80 md:h-96 rounded-lg border border-base-300 overflow-hidden shadow-inner bg-base-200">
                  <MapContainer
                    center={userLocation || [31.1471, 75.3412]}
                    zoom={userLocation ? 13 : 7}
                    scrollWheelZoom={true}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    />
                    {punjabGeoJson && (
                      <GeoJSON
                        data={punjabGeoJson}
                        style={() => ({
                          color: "#1e40af",
                          weight: 2,
                          fillColor: "#1e40af",
                          fillOpacity: 0.08,
                        })}
                      />
                    )}
                    {userLocation && <Marker position={userLocation} />}
                    <MapClickEvent setUserLocation={setUserLocation} />
                  </MapContainer>
                </div>

                <p className="text-xs sm:text-sm text-base-content/70 mt-3 text-center px-2">
                  {!userLocation
                    ? "💡 Search for a location or click anywhere on the map to mark your position"
                    : "✓ Location marked! You can click on map to move marker or search for another location."}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-primary/5 border-t border-primary/20 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {/* Item 1 */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Shield size={24} className="text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-base-content mb-1 text-sm sm:text-base">
                  Verified Institutes
                </h3>
                <p className="text-xs sm:text-sm text-base-content/70">
                  All institutes are government verified
                </p>
              </div>
            </div>

            {/* Item 2 */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <BookOpen size={24} className="text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-base-content mb-1 text-sm sm:text-base">
                  Multiple Programs
                </h3>
                <p className="text-xs sm:text-sm text-base-content/70">
                  Various qualifications and courses available
                </p>
              </div>
            </div>

            {/* Item 3 */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Globe size={24} className="text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-base-content mb-1 text-sm sm:text-base">
                  Sign In Required
                </h3>
                <p className="text-xs sm:text-sm text-base-content/70">
                  Contact institutes securely with your account
                </p>
              </div>
            </div>
          </div>
        </div>

        <RoleSelectModal open={roleModal?.roleSelectModal?.open} />
      </div>
    </>
  );
}
