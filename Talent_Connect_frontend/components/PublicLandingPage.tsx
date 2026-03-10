"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Send,
  CheckSquare,
  Square,
  Loader2,
  X,
  Filter,
  MapPin,
  Users,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Building2,
  BookOpen,
  LogIn,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import api from "@/lib/api";
import MultiSelectDropdown, { Option } from "@/components/MultiSelectDropdown";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { updateUiInstitute } from "@/store/institute";
import clsx from "clsx";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

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
import { useMapEvents, useMap } from "react-leaflet";

import L from "leaflet";
import { useAuth } from "@/lib/AuthProvider";
import { OfferModalV2 } from "@/views/find-institute/view/OfferModalView";
import { InstituteViewModal } from "@/views/find-institute/list/InstituteViewModal";
import InstituteCoursesModal from "@/views/find-institute/view/InstituteCoursesModal";
import { updateLoginUi } from "@/store/login";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function calculateAirDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

interface InstituteRow {
  institute_id: number;
  institute_name: string;
  district: string;
  type: string;
  ownership: string;
  email: string;
  mobileno: string;
  student_count: number;
  final_year_student_count?: number;
  latitude?: string;
  longitude?: string;
  air_distance?: number;
}

interface Filters {
  state_ids: number[];
  district_ids: number[];
  type_ids: number[];
  ownership_ids: number[];
  qualification_ids: number[];
  stream_ids: number[];
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

export default function FindInstitutesPage() {
  const findInstituteUi = useSelector(
    (state: RootState) => state?.institutes?.ui,
  );
  const { user } = useAuth();
  const dispatch = useDispatch<AppDispatch>();

  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [institutes, setInstitutes] = useState<InstituteRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [isSelectAll, setIsSelectAll] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);


  const [districtOpts, setDistrictOpts] = useState<Option[]>([]);
  const [qualOpts, setQualOpts] = useState<Option[]>([]);
  const [streamOpts, setStreamOpts] = useState<Option[]>([]);

  const [sentSuccess, setSentSuccess] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number | "all">(10);
  const [total, setTotal] = useState(0);

  const [viewInstitute, setViewInstitute] = useState<boolean>(false);
  const [viewCourses, setViewCourses] = useState<boolean>(false);
  const [currentInstitute, setCurrentInstitute] = useState<InstituteRow | null>(
    null,
  );

  const searchParams = useSearchParams();
  const initialType = searchParams.get("type");

  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null,
  );
  const [searchGeoTerm, setSearchGeoTerm] = useState("");
  const [punjabGeoJson, setPunjabGeoJson] = useState<any>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [sort, setSort] = useState<"name" | "name-rev" | "student_count">(
    "student_count",
  );
  const [order, setOrder] = useState<"asc" | "desc">("desc");

  // Load qualifications & districts
  useEffect(() => {
    const load = async () => {
      try {
        const [qual, dist, typesRes] = await Promise.all([
          api.get("/qualification"),
          api.get("/district?state_id=3"),
          api.get("/institute-type"),
        ]);

        const qData = Array.isArray(qual.data) ? qual.data : (qual.data?.data || []);
        const dData = Array.isArray(dist.data) ? dist.data : (dist.data?.data || []);
        const tData = Array.isArray(typesRes.data) ? typesRes.data : (typesRes.data?.data || []);

        setQualOpts(
          qData.map((q: any) => ({
            value: q.qualificationid,
            label: q.qualification,
          }))
        );

        setDistrictOpts(
          dData
            .map((d: any) => ({
              value: d.lgddistrictId ?? d.districtid,
              label: d.districtname,
            }))
            .sort((a: any, b: any) => a.label.localeCompare(b.label))
        );

        // Handle initial type from URL
        if (initialType) {
          const typeMatch = tData.find(
            (t: any) => t.institute_type?.toLowerCase() === initialType.toLowerCase()
          );
          if (typeMatch) {
            setFilters(f => ({ ...f, type_ids: [typeMatch.institute_type_id] }));
          }
        }
      } catch (err) {
        console.error("Failed to load options:", err);
      }
    };
    load();
  }, [initialType]);

  // Load streams
  useEffect(() => {
    const loadStreams = async () => {
      try {
        let streams: any[] = [];

        if (filters.qualification_ids.length > 0) {
          const promises = filters.qualification_ids.map((id) =>
            api.get(`/stream-branch?qualification_id=${id}`),
          );
          const responses = await Promise.all(promises);
          streams = responses.flatMap((r) => Array.isArray(r.data) ? r.data : (r.data?.data || []));
        } else {
          const res = await api.get(
            "/institute-qualification-mapping/streams-in-use",
          );
          streams = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        }

        const grouped = streams.reduce((acc: any, s: any) => {
          const name = s.stream_branch_name;
          if (!acc[name]) acc[name] = [];
          acc[name].push(s.stream_branch_Id);
          return acc;
        }, {});

        setStreamOpts(
          Object.entries(grouped)
            .map(([name, ids]: [string, any]) => ({
              value: ids.sort((a: number, b: number) => a - b).join(","),
              label: name,
            }))
            .sort((a, b) => a.label.localeCompare(b.label)),
        );
      } catch {
        setStreamOpts([]);
      }
    };
    loadStreams();
  }, [filters.qualification_ids]);

  const setFilter = (key: keyof Filters) => (vals: number[]) =>
    setFilters((f) => ({ ...f, [key]: vals }));

  const handleSearch = useCallback(async () => {
    setLoading(true);
    setSearched(true);
    setSelected(new Set());
    setIsSelectAll(false);

    const params = new URLSearchParams();
    if (filters.district_ids.length)
      params.set("district_ids", filters.district_ids.join(","));
    if (filters.qualification_ids.length)
      params.set("qualification_ids", filters.qualification_ids.join(","));
    if (filters.stream_ids.length)
      params.set("stream_ids", filters.stream_ids.join(","));
    if (filters.type_ids.length)
      params.set("type_ids", filters.type_ids.join(","));
    if (filters.min_enrollment !== undefined)
      params.set("min_enrollment", filters.min_enrollment.toString());
    if (filters.min_placement !== undefined)
      params.set("min_placement", filters.min_placement.toString());
    if (searchTerm.trim()) params.set("search", searchTerm.trim());
    params.set("sort", sort);
    params.set("order", order);
    params.set("page", currentPage.toString());
    params.set(
      "limit",
      itemsPerPage === "all" ? "1000" : itemsPerPage.toString(),
    );

    try {
      const res = await api.get(`/institute/search?${params}`);

      let fetched: InstituteRow[] = [];
      if (Array.isArray(res.data)) {
        fetched = res.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        fetched = res.data.data;
      } else if (res.data?.institutes && Array.isArray(res.data.institutes)) {
        fetched = res.data.institutes;
      }

      const totalCount = res.data?.total || fetched.length || 0;

      if (userLocation && fetched.length > 0) {
        fetched = fetched.map((inst) => {
          if (inst.latitude && inst.longitude) {
            const air = calculateAirDistance(
              userLocation[0],
              userLocation[1],
              parseFloat(inst.latitude),
              parseFloat(inst.longitude),
            );
            return { ...inst, air_distance: air };
          }
          return inst;
        });
      }

      setInstitutes(fetched);
      setTotal(totalCount);
    } catch (err) {
      console.error("Search failed:", err);
      setInstitutes([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [
    filters,
    sort,
    order,
    userLocation,
    currentPage,
    itemsPerPage,
    searchTerm,
  ]);

  useEffect(() => {
    handleSearch();
  }, [handleSearch]);

  useEffect(() => {
    if (!userLocation || institutes.length === 0) return;

    setInstitutes((prev) =>
      prev.map((inst) => {
        if (inst.latitude && inst.longitude) {
          const air = calculateAirDistance(
            userLocation[0],
            userLocation[1],
            parseFloat(inst.latitude),
            parseFloat(inst.longitude),
          );
          return { ...inst, air_distance: air };
        }
        return inst;
      }),
    );
  }, [userLocation]);

  const handleGeoSearch = async () => {
    if (!searchGeoTerm.trim()) return;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchGeoTerm)}`,
      );
      const data = await res.json();
      if (data?.[0]) {
        setUserLocation([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
      }
    } catch (e) {
      console.warn("Geocoding failed", e);
    }
  };

  const MapClickEvent = () => {
    useMapEvents({
      click(e) {
        setUserLocation([e.latlng.lat, e.latlng.lng]);
      },
    });
    const map = useMap();
    useEffect(() => {
      if (userLocation) map.flyTo(userLocation, map.getZoom());
    }, [userLocation]);
    return null;
  };

  const allSelected =
    isSelectAll || (Array.isArray(institutes) &&
      institutes.length > 0 &&
      institutes.every((i) => selected.has(i.institute_id)));

  const toggleSelect = (id: number) => {
    setIsSelectAll(false);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (allSelected) {
      setIsSelectAll(false);
      setSelected(new Set());
    } else {
      setIsSelectAll(true);
      setSelected(
        new Set(
          (Array.isArray(institutes) ? institutes : []).map(
            (i) => i.institute_id,
          ),
        ),
      );
    }
  };

  const institutesMap = new Map(
    institutes.map((i) => [i.institute_id, i.institute_name]),
  );

  const currentLimit = itemsPerPage === "all" ? total || 1000 : itemsPerPage;
  const totalPages = Math.ceil(total / currentLimit) || 1;

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const resetFilters = () => {
    setFilters(EMPTY_FILTERS);
    setCurrentPage(1);
  };

  return (
    <div className="w-full mx-auto">
      {/* Header - unchanged */}
      <div className="bg-primary text-white pt-8 pb-10 px-4 lg:px-8 relative overflow-visible border-b border-white/5">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <div className="flex flex-col items-center gap-2 mb-6">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white m-0 p-0">
              Explore Institutes in Punjab
            </h1>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-4 shadow-xl overflow-visible">
            <div className="flex flex-col md:flex-row gap-4 items-end justify-between">
              
              <div className="flex-1 w-full space-y-1.5 text-left">
                <label className="text-xs font-bold text-white ml-1 tracking-wide">
                  District / Location
                </label>
                <MultiSelectDropdown
                  label=""
                  options={districtOpts}
                  selected={filters.district_ids}
                  onChange={(values) => {
                    setFilter("district_ids")(values as number[]);
                    setCurrentPage(1);
                  }}
                  placeholder="All Locations"
                  buttonClassName="bg-white/10 border-white/20 text-white placeholder:text-white/60 h-10 rounded-xl hover:bg-white/20 transition-all text-xs focus:ring-1 focus:ring-white/30"
                />
              </div>

              <div className="flex-1 w-full space-y-1.5 text-left">
                <label className="text-xs font-bold text-white ml-1 tracking-wide">
                  Qualification
                </label>
                <MultiSelectDropdown
                  label=""
                  options={qualOpts}
                  selected={filters.qualification_ids}
                  onChange={(values) => {
                    setFilter("qualification_ids")(values as number[]);
                    setCurrentPage(1);
                  }}
                  placeholder="All Qualifications"
                  buttonClassName="bg-white/10 border-white/20 text-white placeholder:text-white/60 h-10 rounded-xl hover:bg-white/20 transition-all text-xs focus:ring-1 focus:ring-white/30"
                />
              </div>

              <div className="flex-1 w-full space-y-1.5 text-left">
                <label className="text-xs font-bold text-white ml-1 tracking-wide">
                  Specialization
                </label>
                <MultiSelectDropdown
                  label=""
                  options={streamOpts}
                  selected={streamOpts
                    .filter((opt) => {
                      const val = String(opt.value || "");
                      const ids = val.split(",").map(Number);
                      return ids.every((id) => filters.stream_ids.includes(id));
                    })
                    .map((opt) => opt.value)}
                  onChange={(values) => {
                    const allIds = (values as string[]).flatMap((v) =>
                      String(v || "").split(",").map(Number),
                    );
                    setFilter("stream_ids")(allIds);
                    setCurrentPage(1);
                  }}
                  placeholder="All Specializations"
                  buttonClassName="bg-white/10 border-white/20 text-white placeholder:text-white/60 h-10 rounded-xl hover:bg-white/20 transition-all text-xs focus:ring-1 focus:ring-white/30"
                />
              </div>
              
              <div className="flex md:flex-col items-center justify-between w-full md:w-auto h-full min-h-[40px] gap-2">
                 <button
                   onClick={resetFilters}
                   className="text-white hover:bg-white/20 px-3 py-2 rounded-lg transition-colors text-xs font-bold flex items-center justify-center gap-2 whitespace-nowrap h-10 border border-white/10"
                 >
                   <X size={14} /> Reset
                 </button>
                 <div className="text-[11px] font-semibold text-white/80 whitespace-nowrap hidden md:block mt-1">
                   {loading ? "Searching..." : `${total} found`}
                 </div>
                 {/* Mobile version count inline */}
                 <div className="text-[11px] font-semibold text-white/80 whitespace-nowrap md:hidden">
                    {loading ? "Searching..." : `${total} found`}
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results section */}
      {searched && (
        <div className="space-y-4 relative pb-24 lg:pb-0">
          <div className=" m-2 flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white border border-slate-200 rounded-lg px-4 py-3 shadow-sm">
            <div className="flex items-center gap-3">
              <button
                onClick={toggleAll}
                className="w-8 h-8 rounded-lg border border-slate-300 bg-slate-50 flex items-center justify-center text-slate-600 transition-all"
              >
                {allSelected ? (
                  <CheckSquare size={16} className="text-primary" />
                ) : (
                  <Square size={16} />
                )}
              </button>
              <div className="flex flex-col">
                <p className="text-sm font-semibold text-slate-900">
                  {total} institute{total !== 1 ? "s" : ""} found
                  <span className="text-slate-600 font-normal ml-1.5 hidden sm:inline">
                    • click rows to select
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-xs text-slate-600 font-medium">
                <span>Show:</span>
                <select
                  className="bg-transparent border-0 outline-none text-slate-900 font-bold cursor-pointer"
                  value={itemsPerPage}
                  onChange={(e) => {
                    const val = e.target.value;
                    setItemsPerPage(val === "all" ? "all" : Number(val));
                    setCurrentPage(1);
                  }}
                >
                  {[5, 10, 20, 25, 50, 100].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                  <option value="all">All</option>
                </select>
              </div>

              <div className="relative flex-1 min-w-[240px] max-w-sm group">
                <input
                  type="text"
                  placeholder="Search institutes..."
                  className="input input-bordered w-full pl-11 pr-5 text-sm border-slate-300 focus:ring-2 focus:ring-blue-100"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-xs">
                <ArrowUpDown size={12} className="text-primary" />
                <select
                  className="bg-transparent border-0 outline-none text-slate-900 font-medium cursor-pointer text-xs"
                  value={sort}
                  onChange={(e) => {
                    setSort(
                      e.target.value as "name" | "name-rev" | "student_count",
                    );
                    setCurrentPage(1);
                  }}
                >
                  <option value="student_count">Students</option>
                  <option value="name">A–Z</option>
                  <option value="name-rev">Z–A</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-600">
              <Loader2 size={32} className="animate-spin text-primary" />
              <p className="text-sm">Searching institutes…</p>
            </div>
          ) : institutes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 gap-4">
              <div className="w-14 h-14 rounded-lg bg-blue-50 flex items-center justify-center">
                <Search size={24} className="text-primary" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-slate-900">
                  No institutes found
                </p>
                <p className="text-sm text-slate-600 mt-1">
                  Try adjusting your filters
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex gap-6 flex-col lg:flex-row m-2">
                <div className="flex-1 lg:w-[70%] relative">
                  <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="overflow-x-auto hidden md:block">
                      <table className="min-w-full divide-y divide-slate-200">
                        <thead>
                          <tr className="bg-slate-50">
                            <th className="px-4 py-3 w-10">
                              <button
                                onClick={toggleAll}
                                className="w-7 h-7 rounded-md border border-slate-300 bg-white flex items-center justify-center text-slate-600 transition-all mx-auto"
                              >
                                {allSelected ? (
                                  <CheckSquare
                                    size={14}
                                    className="text-blue-600"
                                  />
                                ) : (
                                  <Square size={14} />
                                )}
                              </button>
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                              Institute Name
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                              District
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                              Courses
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">
                              Students on roll
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">
                              Students Available for placement
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {institutes.map((inst) => {
                            const isSelected = selected.has(inst.institute_id);
                            return (
                              <tr
                                key={inst.institute_id}
                                className={clsx(
                                  "transition-colors cursor-pointer",
                                  isSelected
                                    ? "bg-blue-50"
                                    : "hover:bg-slate-50",
                                )}
                              >
                                <td className="px-4 py-3 text-center">
                                  <button
                                    onClick={() =>
                                      toggleSelect(inst.institute_id)
                                    }
                                    className="w-5 h-5 rounded-md border border-slate-300 flex items-center justify-center mx-auto transition-all"
                                  >
                                    {isSelected ? (
                                      <CheckSquare
                                        size={14}
                                        className="text-blue-600"
                                      />
                                    ) : (
                                      <Square size={14} />
                                    )}
                                  </button>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="text-sm font-semibold text-slate-900">
                                    {inst.institute_name}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="flex items-center gap-1.5 text-sm text-slate-700">
                                    <MapPin
                                      size={12}
                                      className="text-slate-500"
                                    />
                                    {inst.district || "—"}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setCurrentInstitute(inst);
                                      setViewCourses(true);
                                    }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 hover:text-blue-800 transition-all text-xs font-semibold"
                                  >
                                    <BookOpen size={14} /> View
                                  </button>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-50 text-primary text-xs font-bold">
                                    <Users size={12} />
                                    {inst.student_count.toLocaleString()}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-bold">
                                    <Users size={12} />
                                    {inst.final_year_student_count?.toLocaleString() ||
                                      "0"}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentInstitute(inst);
                                        setViewInstitute(true);
                                      }}
                                      title="View Profile"
                                      className="h-8 w-8 rounded-md bg-slate-100 border border-slate-300 text-slate-700 hover:bg-blue-50 flex items-center justify-center transition-all"
                                    >
                                      <Eye size={14} />
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (!selected.has(inst.institute_id)) {
                                          toggleSelect(inst.institute_id);
                                        }
                                        setShowLoginPrompt(true);
                                      }}
                                      className="px-3 py-2 rounded-md bg-primary text-white text-xs font-bold flex items-center gap-1.5 transition-all"
                                    >
                                      <LogIn size={14} />
                                      Connect
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden flex flex-col divide-y divide-slate-200">
                      {institutes.map((inst) => {
                        const isSelected = selected.has(inst.institute_id);
                        return (
                          <div
                            key={inst.institute_id}
                            className={clsx(
                              "p-4 transition-colors",
                              isSelected ? "bg-blue-50" : "",
                            )}
                          >
                            <div className="flex items-start gap-3 mb-3">
                              <button
                                onClick={() => toggleSelect(inst.institute_id)}
                                className="mt-1"
                              >
                                {isSelected ? (
                                  <CheckSquare
                                    size={16}
                                    className="text-blue-600"
                                  />
                                ) : (
                                  <Square
                                    size={16}
                                    className="text-slate-400"
                                  />
                                )}
                              </button>
                              <div className="flex-1">
                                <h3 className="text-sm font-bold text-slate-900 mb-1">
                                  {inst.institute_name}
                                </h3>
                                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mb-3">
                                  <span className="flex items-center gap-1">
                                    <MapPin size={11} /> {inst.district || "—"}
                                  </span>
                                  <span className="font-semibold text-primary">
                                    <Users size={11} className="inline mr-1" />
                                    {inst.student_count.toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 ml-7 flex-wrap">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCurrentInstitute(inst);
                                  setViewCourses(true);
                                }}
                                className="flex-1 py-2 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-blue-100"
                              >
                                <BookOpen size={12} /> View Courses
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCurrentInstitute(inst);
                                  setViewInstitute(true);
                                }}
                                className="flex-[0.5] py-2 rounded-md bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold flex items-center justify-center hover:bg-slate-200"
                              >
                                <Eye size={12} />
                              </button>
                              <button
                                onClick={() => {
                                  if (!selected.has(inst.institute_id)) {
                                    toggleSelect(inst.institute_id);
                                  }
                                  setShowLoginPrompt(true);
                                }}
                                className="flex-1 py-2 rounded-md bg-primary text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-blue-700"
                              >
                                <LogIn size={12} /> Connect
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sticky Send Button */}
                  {(selected.size > 0 || isSelectAll) && (
                    <div className="sticky bottom-0 left-0 right-0 z-30 mt-4 bg-white border-t border-slate-200 shadow-lg">
                      <div className="px-4 py-4 lg:px-6">
                        <button
                          onClick={() => setShowLoginPrompt(true)}
                          className={clsx(
                            "group w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl",
                            "bg-gradient-to-r from-primary via-blue-600 to-indigo-600",
                            "text-white font-semibold shadow-xl",
                            "hover:shadow-2xl hover:scale-[1.02] active:scale-95",
                            "transition-all duration-250 border border-blue-500/30",
                          )}
                        >
                          <Send
                            size={20}
                            className="group-hover:rotate-12 transition-transform duration-300"
                          />
                          <span className="text-base">
                            Send to <strong>{isSelectAll ? total : selected.size}</strong> institute
                            {(isSelectAll ? total : selected.size) !== 1 ? "s" : ""}
                          </span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg px-4 py-3 mt-4 shadow-sm">
                      <button
                        onClick={() => goToPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="btn btn-outline btn-sm gap-1.5 text-xs disabled:opacity-40"
                      >
                        <ChevronLeft size={14} /> Previous
                      </button>

                      <span className="text-xs text-slate-600 font-medium">
                        Page {currentPage} of {totalPages}
                        <span className="hidden sm:inline">
                          {" "}
                          · {total} institutes
                        </span>
                      </span>

                      <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                        className="btn btn-outline btn-sm gap-1.5 text-xs disabled:opacity-40"
                      >
                        Next <ChevronRight size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Map Section */}
                <div className="lg:w-[30%] h-fit lg:sticky lg:top-4">
                  <div className="flex flex-col gap-3 bg-white rounded-lg border border-slate-200 shadow-sm p-4">
                    <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                      <MapPin size={16} className="text-primary" /> Institutes
                      Near You
                    </h3>

                    <div className="flex flex-col gap-2">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search location..."
                          className="input input-sm input-bordered w-full pl-9 pr-3 border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                          value={searchGeoTerm}
                          onChange={(e) => setSearchGeoTerm(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleGeoSearch()
                          }
                        />
                        <Search
                          size={14}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={handleGeoSearch}
                          className="flex-1 px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg transition-all"
                        >
                          Search
                        </button>
                        <button
                          onClick={() => {
                            setUserLocation(null);
                            setSearchGeoTerm("");
                          }}
                          className="px-3 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold rounded-lg transition-all"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="w-full h-[350px] rounded-lg overflow-hidden border border-slate-200 shadow-inner bg-slate-100">
                      <MapContainer
                        center={userLocation || [31.1471, 75.3412]}
                        zoom={userLocation ? 14 : 7}
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
                              fillOpacity: 0.1,
                            })}
                          />
                        )}
                        {userLocation && <Marker position={userLocation} />}
                        <MapClickEvent />
                      </MapContainer>
                    </div>

                    <p className="text-xs text-slate-600 text-center italic">
                      {!userLocation
                        ? "Click on map or search location"
                        : "✓ Location marked"}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Success Toast */}
      {sentSuccess && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="flex items-center gap-3 px-5 py-3.5 rounded-lg bg-green-50 border border-green-300 text-green-700 shadow-lg font-medium text-sm">
            <Send size={16} className="shrink-0" />
            <span className="font-semibold">Job offers sent successfully!</span>
            <button onClick={() => setSentSuccess(false)}>
              <X size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogIn size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Login Required</h3>
              <p className="text-sm text-slate-600 mb-6">
                Please login or create an account to connect with institutes and send job offers.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLoginPrompt(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowLoginPrompt(false);
                    dispatch(updateLoginUi({ roleSelectModal: { open: true } }));
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
                >
                  Login
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <OfferModalV2
        onClose={() => { }}
        isOpen={findInstituteUi?.bulkOffer?.open ?? false}
        selectedIds={Array.from(selected)}
        institutesMap={institutesMap}
        qualOptions={qualOpts}
        streamOptions={streamOpts}
        prefilledQualIds={filters.qualification_ids}
        prefilledStreamIds={filters.stream_ids}
        onSent={() => {
          setSentSuccess(true);
          setSelected(new Set());
        }}
      />

      <InstituteViewModal
        open={viewInstitute}
        setOpen={() => setViewInstitute(false)}
        institute={currentInstitute}
      />

      <InstituteCoursesModal
        open={viewCourses}
        setOpen={setViewCourses}
        instituteId={currentInstitute?.institute_id ?? null}
        instituteName={currentInstitute?.institute_name ?? ""}
        filters={filters}
      />
    </div>
  );
}
