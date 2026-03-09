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
  Mail,
  BookOpen,
  LogIn,
} from "lucide-react";
import api from "@/lib/api";
import MultiSelectDropdown, { Option } from "@/components/MultiSelectDropdown";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { setCurrentOffer, updateUiInstitute } from "@/store/institute";
import { OfferModalV2 } from "./OfferModalView";
import clsx from "clsx";
import { InstituteViewModal } from "../list/InstituteViewModal";
import InstituteCoursesModal from "./InstituteCoursesModal";
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
  contactperson: string;
  po_mobile: string;
  po_email: string;
  latitude?: string;
  longitude?: string;
  air_distance?: number;
  path_distance?: number;
}

interface Filters {
  state_ids: (number | string)[];
  district_ids: (number | string)[];
  type_ids: (number | string)[];
  ownership_ids: (number | string)[];
  qualification_ids: (number | string)[];
  stream_ids: (number | string)[];
}

const EMPTY_FILTERS: Filters = {
  state_ids: [3],
  district_ids: [],
  type_ids: [],
  ownership_ids: [],
  qualification_ids: [],
  stream_ids: [],
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

  const [districtOpts, setDistrictOpts] = useState<Option[]>([]);
  const [qualOpts, setQualOpts] = useState<Option[]>([]);
  const [streamOpts, setStreamOpts] = useState<Option[]>([]);

  const [sentSuccess, setSentSuccess] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [viewInstitute, setViewInstitute] = useState<boolean>(false);
  const [viewCourses, setViewCourses] = useState<boolean>(false);
  const [currentInstitute, setCurrentInstitute] = useState<InstituteRow | null>(
    null,
  );

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

  useEffect(() => {
    fetch("/punjab_state.geojson")
      .then((res) => res.json())
      .then((data) => setPunjabGeoJson(data))
      .catch((err) => console.error("Error loading Punjab GeoJSON:", err));
  }, []);

  useEffect(() => {
    if (sentSuccess) {
      const timer = setTimeout(() => setSentSuccess(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [sentSuccess]);

  useEffect(() => {
    const load = async () => {
      const [qual] = await Promise.all([
        api
          .get("/qualification")
          .then((r) =>
            r.data.map((q: any) => ({
              value: q.qualificationid,
              label: q.qualification,
            })),
          )
          .catch(() => []),
      ]);
      setQualOpts(qual);
      try {
        const [qualRes, distRes] = await Promise.all([
          api.get("/qualification"),
          api.get("/district?state_id=3"),
        ]);
        const qData = Array.isArray(qualRes.data)
          ? qualRes.data
          : qualRes.data?.data || [];
        const dData = Array.isArray(distRes.data)
          ? distRes.data
          : distRes.data?.data || [];

        setQualOpts(
          qData.map((q: any) => ({
            value: q.qualificationid,
            label: q.qualification,
          })),
        );
        setDistrictOpts(
          dData
            .map((d: any) => ({
              value: d.lgddistrictId ?? d.districtid,
              label: d.districtname,
            }))
            .sort((a: Option, b: Option) => a.label.localeCompare(b.label)),
        );
      } catch (err) {
        console.error("Error loading options:", err);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const loadDistricts = async () => {
      try {
        const res = await api.get(`/district?state_id=3`);
        setDistrictOpts(
          res.data
            .map((d: any) => ({ value: d.districtid, label: d.districtname }))
            .sort((a: Option, b: Option) => a.label.localeCompare(b.label)),
        );
      } catch {
        setDistrictOpts([]);
      }
    };
    loadDistricts();
  }, []);

  useEffect(() => {
    const loadStreams = async () => {
      if (filters.qualification_ids.length > 0) {
        const qId = filters.qualification_ids[0];
        const [masterRes, inUseRes] = await Promise.all([
          api.get(`/stream-branch?qualification_id=${qId}`),
          api.get("/institute-qualification-mapping/streams-in-use"),
        ]);
        const inUseIds = new Set(
          inUseRes.data.map((s: any) => s.stream_branch_Id),
        );
        const filtered = masterRes.data.filter((s: any) =>
          inUseIds.has(s.stream_branch_Id),
        );
        setStreamOpts(
          filtered.map((s: any) => ({
            value: s.stream_branch_Id,
            label: s.stream_branch_name,
          })),
        );
      } else {
        const res = await api.get(
          "/institute-qualification-mapping/streams-in-use",
        );
        setStreamOpts(
          res.data.map((s: any) => ({
            value: s.stream_branch_Id,
            label: s.stream_branch_name,
          })),
        );
        try {
          const masterStreamsMap = new Map<string, number[]>();
          if (filters.qualification_ids.length > 0) {
            const streamPromises = filters.qualification_ids.map((id: any) =>
              api.get(`/stream-branch?qualification_id=${id}`),
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
          } else {
            // If no qualification selected, we skip master fetch or handle differently?
            // The previous logic fetched from "streams-in-use" directly.
          }

          const inUseRes = await api.get(
            "/institute-qualification-mapping/streams-in-use",
          );
          const inUseIds = new Set(
            inUseRes.data.map((s: any) => s.stream_branch_Id),
          );

          if (filters.qualification_ids.length === 0) {
            // Flatten inUseRes into the map
            inUseRes.data.forEach((s: any) => {
              const ids = masterStreamsMap.get(s.stream_branch_name) || [];
              if (!ids.includes(s.stream_branch_Id))
                ids.push(s.stream_branch_Id);
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

          // Cleanup
          const validValues = new Set(finalOptions.map((s) => String(s.value)));
          setFilters((prev) => {
            const nextStreams = prev.stream_ids.filter((id) =>
              validValues.has(String(id)),
            );
            return nextStreams.length !== prev.stream_ids.length
              ? { ...prev, stream_ids: nextStreams }
              : prev;
          });
        } catch (error) {
          console.error("Failed to load cascading streams:", error);
          setStreamOpts([]);
        }
      }
      loadStreams();
    };
  }, []);

  const setFilter = (key: keyof Filters) => (vals: number[]) =>
    setFilters((f) => ({ ...f, [key]: vals }));

  const handleSearch = useCallback(async () => {
    setLoading(true);
    setSearched(true);
    setSelected(new Set());
    setSearchTerm("");
    setCurrentPage(1);

    const params = new URLSearchParams();
    if (filters.district_ids.length)
      params.set("district_ids", filters.district_ids.join(","));
    if (filters.qualification_ids.length)
      params.set("qualification_ids", filters.qualification_ids.join(","));
    if (filters.stream_ids.length)
      params.set("stream_ids", filters.stream_ids.join(","));
    params.set("sort", sort);
    params.set("order", order);

    try {
      const res = await api.get(`/institute/search?${params}`);
      let data = res.data;

      if (userLocation) {
        data = data.map((inst: InstituteRow) => {
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

      setInstitutes(data);
    } catch {
      setInstitutes([]);
    }
    setLoading(false);
  }, [filters, sort, order, userLocation]);

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
      if (data && data.length > 0) {
        setUserLocation([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
      }
    } catch (e) {
      console.warn("Geocoding failed", e);
    }
  };

  const MapClickEvent = () => {
    useMapEvents({
      click(e: any) {
        setUserLocation([e.latlng.lat, e.latlng.lng]);
      },
    });
    const map = useMap();
    useEffect(() => {
      if (userLocation) map.flyTo(userLocation, map.getZoom());
    }, [userLocation, map]);
    return null;
  };

  const toggleSelect = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const allSelected =
    institutes.length > 0 &&
    institutes.every((i) => selected.has(i.institute_id));
  const toggleAll = () =>
    setSelected(
      allSelected ? new Set() : new Set(institutes.map((i) => i.institute_id)),
    );

  const institutesMap = new Map(
    institutes.map((i) => [i.institute_id, i.institute_name]),
  );

  const filteredInstitutes = institutes.filter(
    (inst) =>
      inst.institute_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inst.district?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const sortedInstitutes = filteredInstitutes.sort((a, b) => {
    let aVal, bVal;

    if (sort === "name") {
      aVal = a.institute_name.toLowerCase();
      bVal = b.institute_name.toLowerCase();
      return aVal.localeCompare(bVal);
    } else if (sort === "name-rev") {
      aVal = a.institute_name.toLowerCase();
      bVal = b.institute_name.toLowerCase();
      return bVal.localeCompare(aVal);
    } else {
      return order === "desc"
        ? b.student_count - a.student_count
        : a.student_count - b.student_count;
    }
  });

  const totalItems = sortedInstitutes.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInstitutes = sortedInstitutes.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <div className="w-full mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-blue-600/30">
            <Building2 size={22} className="text-white" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
              Find Institutes
            </h1>
            <p className="text-sm text-slate-600 mt-0.5">
              Search | Filter | Connect
            </p>
          </div>
        </div>

        {searched && !loading && (
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-lg bg-slate-100 border border-slate-300 text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
                Found
              </p>
              <p className="text-xl font-black text-primary leading-tight">
                {institutes.length}
              </p>
            </div>
            {selected.size > 0 && (
              <div className="px-4 py-2 rounded-lg bg-green-50 border border-green-300 text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-green-700">
                  Selected
                </p>
                <p className="text-xl font-black text-green-600 leading-tight">
                  {selected.size}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filters Card */}
      <div className="rounded-lg bg-white border border-slate-200 shadow-sm p-6 mb-8">
        <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-slate-200">
          <Filter size={18} className="text-primary" />
          <h2 className="text-base font-bold text-slate-900">Filters</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
          <MultiSelectDropdown
            label="District"
            options={districtOpts}
            selected={filters.district_ids}
            onChange={setFilter("district_ids") as any}
            placeholder="All districts"
          />
          <MultiSelectDropdown
            label="Qualification"
            options={qualOpts}
            selected={filters.qualification_ids}
            onChange={setFilter("qualification_ids") as any}
            placeholder="All qualifications"
          />
          <MultiSelectDropdown
            label="Course/Trade"
            options={streamOpts}
            selected={filters.stream_ids}
            onChange={setFilter("stream_ids") as any}
            placeholder="All courses/trades"
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => setFilters(EMPTY_FILTERS)}
            disabled={loading}
            className="text-xs font-semibold text-primary hover:underline transition-all"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Results */}
      {searched && (
        <div className="space-y-4 relative pb-24 lg:pb-0">
          {!loading && institutes.length > 0 && (
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white border border-slate-200 rounded-lg px-4 py-3 shadow-sm">
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
                <p className="text-sm font-semibold text-slate-900">
                  {institutes.length} institute
                  {institutes.length !== 1 ? "s" : ""} found
                  <span className="text-slate-600 font-normal ml-1.5">
                    • click rows to select
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
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
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 "
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
          )}

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
              {/* 70/30 Layout: Table + Map */}
              <div className="flex gap-6 flex-col lg:flex-row">
                {/* Left: Table (70%) */}
                <div className="flex-1 lg:w-[70%] relative">
                  <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    {/* Desktop Table */}
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
                              Total Students
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">
                              Final Year
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {paginatedInstitutes.map((inst) => {
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
                                      onClick={(e: any) => {
                                        e.stopPropagation();
                                        toggleSelect(inst.institute_id);
                                        dispatch(
                                          updateUiInstitute({
                                            bulkOffer: { open: true },
                                          }),
                                        );
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
                      {paginatedInstitutes.map((inst) => {
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
                                onClick={(e: any) => {
                                  e.stopPropagation();
                                  toggleSelect(inst.institute_id);
                                  dispatch(
                                    updateUiInstitute({
                                      bulkOffer: { open: true },
                                    }),
                                  );
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

                  {/* Full-width Sticky Send Button in table footer area */}
                  {selected.size > 0 && (
                    <div className="sticky bottom-0 left-0 right-0 z-30 mt-4 bg-white border-t border-slate-200 shadow-lg">
                      <div className="px-4 py-4 lg:px-6">
                        <button
                          onClick={() =>
                            dispatch(
                              updateUiInstitute({ bulkOffer: { open: true } }),
                            )
                          }
                          className={clsx(
                            "group w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl",
                            "bg-primary",
                            "text-white font-medium shadow-xl",
                          )}
                        >
                          <Send
                            size={20}
                            className="group-hover:rotate-12 transition-transform duration-300"
                          />
                          <span className="text-base">
                            Send to <strong>{selected.size}</strong> institute
                            {selected.size !== 1 ? "s" : ""}
                          </span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg px-4 py-3 mt-4 shadow-sm">
                      <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="btn btn-outline btn-sm gap-1.5 text-xs disabled:opacity-40"
                      >
                        <ChevronLeft size={14} /> Previous
                      </button>

                      <span className="text-xs text-slate-600 font-medium">
                        Page {currentPage} of {totalPages}
                        <span className="hidden sm:inline">
                          {" "}
                          · {filteredInstitutes.length} institutes
                        </span>
                      </span>

                      <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="btn btn-outline btn-sm gap-1.5 text-xs disabled:opacity-40"
                      >
                        Next <ChevronRight size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Right: Map Section (30%) */}
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

      {/* Modals */}
      <OfferModalV2
        onClose={() => {}}
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
