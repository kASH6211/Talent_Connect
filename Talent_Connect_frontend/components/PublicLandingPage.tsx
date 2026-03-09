"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import MultiSelectDropdown, { Option } from "@/components/MultiSelectDropdown";
import {
  MapPin,
  BookOpen,
  Globe,
  X,
  Building2,
  Filter,
  Eye,
  LogIn,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useMapEvents, useMap } from "react-leaflet";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { updateLoginUi } from "@/store/login";
import Footer from "./landing-page/Footer";
import Pagination from "@/components/common/Pagination";
import { useAuth } from "@/lib/AuthProvider";

// Fix Leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

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
  address?: string;
  latitude?: string;
  longitude?: string;
}

interface CourseRow {
  stream_branch_Id: number;
  stream_branch_name: string;
  student_count: number;
  available_for_placement: number;
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

const PAGE_SIZE = 10;

// Debounce utility
function debounce<T extends (...args: any[]) => void>(func: T, delay: number) {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

// Map click handler
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

// View Profile Modal (unchanged)
function ViewProfileModal({
  institute,
  onClose,
  isOpen,
  onConnect,
}: {
  institute: InstituteRow | null;
  onClose: () => void;
  isOpen: boolean;
  onConnect: () => void;
}) {
  if (!isOpen || !institute) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
        {/* Header */}
        <div className="sticky top-0 bg-blue-600 text-white p-6 flex items-center justify-between border-b border-blue-700">
          <div>
            <h2 className="text-2xl font-bold">{institute.institute_name}</h2>
            <p className="text-blue-100 text-sm mt-1">
              {institute.type === "ITI" ? "ITI" : "Polytechnic"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Key Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-blue-600">
                {institute.student_count}
              </p>
              <p className="text-xs text-slate-600 mt-2 font-semibold">
                STUDENTS
              </p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-blue-600">
                {institute.final_year_student_count || 0}
              </p>
              <p className="text-xs text-slate-600 mt-2 font-semibold">
                PLACEMENT POOL
              </p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-slate-400">—</p>
              <p className="text-xs text-slate-600 mt-2 font-semibold">
                RANK (Coming Soon)
              </p>
            </div>
          </div>

          {/* Institute Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <MapPin size={20} className="text-blue-600" />
              Location
            </h3>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-slate-600 font-semibold">District</p>
                <p className="text-slate-900">{institute.district || "—"}</p>
              </div>
              <div>
                <p className="text-slate-600 font-semibold">Address</p>
                <p className="text-slate-900">
                  {institute.address || "Address not available"}
                </p>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Building2 size={20} className="text-blue-600" />
              Contact Information
            </h3>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-slate-600 font-semibold">Email</p>
                <p className="text-slate-900">{institute.email || "—"}</p>
              </div>
              <div>
                <p className="text-slate-600 font-semibold">Mobile</p>
                <p className="text-slate-900">{institute.mobileno || "—"}</p>
              </div>
            </div>
          </div>

          {/* Institute Type & Ownership */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-xs text-slate-600 font-semibold mb-2">
                SUB TYPE
              </p>
              <p className="text-slate-900 font-semibold">
                {institute.type === "ITI" ? "ITI" : "Polytechnic"}
              </p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-xs text-slate-600 font-semibold mb-2">
                OWNERSHIP
              </p>
              <p className="text-slate-900 font-semibold">
                {institute.ownership || "Government"}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 p-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              onConnect();
              onClose();
            }}
            className="flex-1 px-6 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <LogIn size={18} />
            Connect
          </button>
        </div>
      </div>
    </div>
  );
}

// Courses View Modal (unchanged)
function CoursesViewModal({
  institute,
  onClose,
  isOpen,
}: {
  institute: InstituteRow | null;
  onClose: () => void;
  isOpen: boolean;
}) {
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && institute) {
      setLoading(true);
      pub
        .get(`/institute/${institute.institute_id}/courses`)
        .then((res) => setCourses(res.data || []))
        .catch(() => setCourses([]))
        .finally(() => setLoading(false));
    }
  }, [isOpen, institute]);

  if (!isOpen || !institute) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
        {/* Header */}
        <div className="sticky top-0 bg-blue-600 text-white p-6 flex items-center justify-between border-b border-blue-700">
          <div>
            <h2 className="text-2xl font-bold">Courses Offered</h2>
            <p className="text-blue-100 text-sm mt-1">
              {institute.institute_name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
          ) : courses.length === 0 ? (
            <p className="text-center text-slate-600 py-12">
              No courses available
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200">
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">
                      Course / Trade
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-slate-900">
                      Students on Roll
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-slate-900">
                      Available for Placement
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {courses.map((course) => (
                    <tr
                      key={course.stream_branch_Id}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-6 py-4 text-sm text-slate-900 font-semibold">
                        {course.stream_branch_name}
                      </td>
                      <td className="px-6 py-4 text-center text-sm font-semibold text-blue-600">
                        {course.student_count}
                      </td>
                      <td className="px-6 py-4 text-center text-sm font-semibold text-slate-900">
                        {course.available_for_placement}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 p-6">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PublicLandingPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();

  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [institutes, setInstitutes] = useState<InstituteRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const [districtOpts, setDistrictOpts] = useState<Option[]>([]);
  const [qualOpts, setQualOpts] = useState<Option[]>([]);
  const [streamOpts, setStreamOpts] = useState<Option[]>([]);

  // Map state
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null,
  );
  const [punjabGeoJson, setPunjabGeoJson] = useState<any>(null);

  // Modal states
  const [viewProfileInstitute, setViewProfileInstitute] =
    useState<InstituteRow | null>(null);
  const [viewCoursesInstitute, setViewCoursesInstitute] =
    useState<InstituteRow | null>(null);

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

  // Load filter options - Only ITI Certificate & Diploma
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [quals] = await Promise.all([pub.get("/qualification")]);

        const filteredQuals = quals.data.filter((q: any) =>
          ["ITI Certificate", "Diploma"].includes(q.qualification),
        );

        setQualOpts(
          filteredQuals.map((q: any) => ({
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
          const streamPromises = filters.qualification_ids.map((id) =>
            pub.get(`/stream-branch?qualification_id=${id}`),
          );
          const streamResponses = await Promise.all(streamPromises);

          const masterStreamsMap = new Map<number, string>();
          streamResponses.forEach((res) => {
            res.data.forEach((s: any) => {
              masterStreamsMap.set(s.stream_branch_Id, s.stream_branch_name);
            });
          });

          const inUseRes = await pub.get(
            "/institute-qualification-mapping/streams-in-use",
          );
          const inUseIds = new Set(
            inUseRes.data.map((s: any) => s.stream_branch_Id),
          );

          masterStreamsMap.forEach((label, value) => {
            if (inUseIds.has(value)) {
              streamsToShow.push({ value, label });
            }
          });
        } else {
          const res = await pub.get(
            "/institute-qualification-mapping/streams-in-use",
          );
          streamsToShow = res.data.map((s: any) => ({
            value: s.stream_branch_Id,
            label: s.stream_branch_name,
          }));
        }

        streamsToShow.sort((a, b) => a.label.localeCompare(b.label));
        setStreamOpts(streamsToShow);

        const validIds = new Set(streamsToShow.map((s) => s.value));
        setFilters((prev) => {
          const nextStreams = prev.stream_ids.filter((id) => validIds.has(id));
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

  // Main search function
  const handleSearch = useCallback(async () => {
    setLoading(true);
    setPage(1);

    const params = new URLSearchParams();
    if (filters.state_ids.length)
      params.set("state_ids", filters.state_ids.join(","));
    if (filters.district_ids.length)
      params.set("district_ids", filters.district_ids.join(","));
    if (filters.qualification_ids.length)
      params.set("qualification_ids", filters.qualification_ids.join(","));
    if (filters.stream_ids.length)
      params.set("stream_ids", filters.stream_ids.join(","));

    params.set("sort", "student_count");
    params.set("order", "desc");

    try {
      const res = await pub.get(`/institute/search?${params}`);
      setInstitutes(res.data || []);
      setSelected(new Set());
    } catch {
      setInstitutes([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Auto-search on filter change
  useEffect(() => {
    handleSearch();
  }, [handleSearch]);

  const resetFilters = () => {
    setFilters(EMPTY_FILTERS);
    setPage(1);
    setSelected(new Set());
  };

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Connect handler – opens login modal if not authenticated
  const handleConnect = (instituteId: number) => {
    if (!user) {
      dispatch(updateLoginUi({ authPrompt: { open: true } }));
      return;
    }

    // User is logged in → proceed
    const selectedIds = selected.has(instituteId)
      ? Array.from(selected)
      : [instituteId];
    router.push(`/industry/send-offers?institutes=${selectedIds.join(",")}`);
  };

  return (
    <>
      {/* Modals */}
      <ViewProfileModal
        institute={viewProfileInstitute}
        onClose={() => setViewProfileInstitute(null)}
        isOpen={!!viewProfileInstitute}
        onConnect={() => handleConnect(viewProfileInstitute!.institute_id)}
      />
      <CoursesViewModal
        institute={viewCoursesInstitute}
        onClose={() => setViewCoursesInstitute(null)}
        isOpen={!!viewCoursesInstitute}
      />
      {/* Professional Header */}
      <div className="bg-primary text-white py-10 md:py-12 px-4 sm:px-6 lg:px-8 relative">
        {/* Subtle background pattern/gradient overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,255,255,0.12)_0%,transparent_60%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Main Title */}
          <div className="text-center pb-8 md:pb-10">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight ">
              Find Institutes
            </h2>
          </div>

          {/* Filter Bar – moved outside the dark hero for better contrast */}
          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  District
                </label>
                <MultiSelectDropdown
                  label=""
                  options={districtOpts}
                  selected={filters.district_ids}
                  onChange={(v) =>
                    setFilters((f) => ({ ...f, district_ids: v }))
                  }
                  placeholder="Select districts…"
                  buttonClassName="w-full text-base border-gray-300 focus:border-primary focus:ring-primary/30"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Qualification Level
                </label>
                <MultiSelectDropdown
                  label=""
                  options={qualOpts}
                  selected={filters.qualification_ids}
                  onChange={(v) =>
                    setFilters((f) => ({ ...f, qualification_ids: v }))
                  }
                  placeholder="Select qualifications…"
                  buttonClassName="w-full text-base border-gray-300 focus:border-primary focus:ring-primary/30"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Course / Trade
                </label>
                <MultiSelectDropdown
                  label=""
                  options={streamOpts}
                  selected={filters.stream_ids}
                  onChange={(v) => setFilters((f) => ({ ...f, stream_ids: v }))}
                  placeholder="Select courses…"
                  buttonClassName="w-full text-base border-gray-300 focus:border-primary focus:ring-primary/30"
                />
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={resetFilters}
                className="group flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 hover:text-red-700 transition-colors"
                title="Clear all filters"
              >
                <X
                  size={16}
                  className="group-hover:scale-110 transition-transform"
                />
                Reset filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 min-h-screen">
        <div className="max-w-[1400px] mx-auto">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-slate-600 font-medium">
                  Searching institutes...
                </p>
              </div>
            </div>
          ) : institutes.length === 0 ? (
            <div className="text-center py-20">
              <Building2 size={64} className="mx-auto mb-6 text-slate-300" />
              <p className="text-2xl font-semibold text-slate-900 mb-3">
                No institutes found
              </p>
              <p className="text-lg text-slate-600">
                Try adjusting your filter criteria
              </p>
            </div>
          ) : (
            <>
              <div className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-6">
                <h2 className="text-3xl font-bold text-slate-900">
                  {institutes.length} Institutes Found
                </h2>
                <p className="text-slate-600">
                  Page {page} of {totalPages}
                </p>
              </div>

              {/* Split Layout */}
              <div className="flex gap-8 flex-col lg:flex-row">
                {/* Left: Table */}
                <div className="flex-1">
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-hidden rounded-xl border border-slate-200 shadow bg-white">
                    <table className="w-full table-auto">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="w-10 px-4 py-4 text-left">
                            <input
                              type="checkbox"
                              checked={currentPageItems.every((i) =>
                                selected.has(i.institute_id),
                              )}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  const newSelected = new Set(selected);
                                  currentPageItems.forEach((i) =>
                                    newSelected.add(i.institute_id),
                                  );
                                  setSelected(newSelected);
                                } else {
                                  const newSelected = new Set(selected);
                                  currentPageItems.forEach((i) =>
                                    newSelected.delete(i.institute_id),
                                  );
                                  setSelected(newSelected);
                                }
                              }}
                              className="w-4 h-4 rounded border-slate-300 text-primary"
                            />
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                            Institute Name
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                            District
                          </th>
                          <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900">
                            Courses
                          </th>
                          <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900">
                            Students On Roll
                          </th>
                          <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900">
                            Available for Placement
                          </th>
                          <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {currentPageItems.map((inst) => (
                          <tr
                            key={inst.institute_id}
                            className="hover:bg-slate-50 transition-colors"
                          >
                            <td className="px-4 py-4">
                              <input
                                type="checkbox"
                                checked={selected.has(inst.institute_id)}
                                onChange={() => toggleSelect(inst.institute_id)}
                                className="w-4 h-4 rounded border-slate-300 text-primary"
                              />
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <Building2
                                    size={18}
                                    className="text-primary"
                                  />
                                </div>
                                <div>
                                  <div className="font-semibold text-slate-900 text-sm">
                                    {inst.institute_name}
                                  </div>
                                  {inst.email && (
                                    <div className="text-xs text-slate-500">
                                      {inst.email}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-700">
                              {inst.district || "—"}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <button
                                onClick={() => setViewCoursesInstitute(inst)}
                                className="px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary font-semibold rounded-lg transition-colors text-xs inline-flex items-center gap-1"
                              >
                                <Eye size={14} />
                                View
                              </button>
                            </td>
                            <td className="px-6 py-4 text-center font-semibold text-primary text-sm">
                              {inst.student_count}
                            </td>
                            <td className="px-6 py-4 text-center font-semibold text-slate-900 text-sm">
                              {inst.final_year_student_count ?? "—"}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => setViewProfileInstitute(inst)}
                                  className="px-3 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold rounded-lg transition-colors text-xs flex items-center gap-1"
                                >
                                  <Eye size={14} />
                                  View
                                </button>
                                <button
                                  onClick={() =>
                                    handleConnect(inst.institute_id)
                                  }
                                  className="px-3 py-2 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-colors text-xs inline-flex items-center gap-1"
                                >
                                  <LogIn size={14} />
                                  Connect
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="md:hidden space-y-4">
                    {currentPageItems.map((inst) => (
                      <div
                        key={inst.institute_id}
                        className="bg-white border border-slate-200 rounded-lg p-5 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-4 mb-4">
                          <input
                            type="checkbox"
                            checked={selected.has(inst.institute_id)}
                            onChange={() => toggleSelect(inst.institute_id)}
                            className="w-5 h-5 rounded border-slate-300 text-primary mt-1"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-900 mb-1">
                              {inst.institute_name}
                            </h3>
                            {inst.email && (
                              <p className="text-sm text-slate-600">
                                {inst.email}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                          <div>
                            <p className="text-slate-500">District</p>
                            <p className="font-medium">
                              {inst.district || "—"}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-500">Students</p>
                            <p className="font-semibold text-primary">
                              {inst.student_count}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-500">Placement Pool</p>
                            <p className="font-semibold">
                              {inst.final_year_student_count ?? "—"}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => setViewCoursesInstitute(inst)}
                            className="flex-1 px-4 py-2 bg-primary/10 text-primary text-sm font-medium rounded-lg"
                          >
                            Courses
                          </button>
                          <button
                            onClick={() => setViewProfileInstitute(inst)}
                            className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleConnect(inst.institute_id)}
                            className="flex-1 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg"
                          >
                            Connect
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 mt-10">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-3 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <ChevronLeft size={20} />
                      </button>

                      <div className="flex items-center gap-2">
                        {Array.from(
                          { length: totalPages },
                          (_, i) => i + 1,
                        ).map((p) => (
                          <button
                            key={p}
                            onClick={() => setPage(p)}
                            className={`w-10 h-10 rounded-lg font-semibold transition-colors ${
                              page === p
                                ? "bg-primary text-white"
                                : "border border-slate-300 text-slate-700 hover:bg-slate-100"
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() =>
                          setPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={page === totalPages}
                        className="p-3 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Right: Map Section */}
                <div className="lg:w-[30%] h-fit lg:sticky lg:top-20">
                  <div className="bg-white rounded-xl border border-slate-200 shadow-md overflow-hidden">
                    <div className=" h-[400px] w-[500px]">
                      <MapContainer
                        center={userLocation || [31.1471, 75.3412]}
                        zoom={userLocation ? 13 : 7}
                        scrollWheelZoom={true}
                        style={{ height: "100%", width: "100%" }}
                      >
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
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
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom Bar - Visible when institutes selected */}
      {selected.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-primary text-white py-4 px-4 sm:px-6 lg:px-8 shadow-2xl z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <p className="font-semibold">
              Connect with {selected.size} selected institute
              {selected.size !== 1 ? "s" : ""}
            </p>
            <button
              onClick={() => handleConnect(Array.from(selected)[0])}
              className="px-6 py-2.5 bg-white text-primary font-bold rounded-lg hover:bg-slate-100 transition-colors"
            >
              Connect Now
            </button>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
