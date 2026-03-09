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
} from "lucide-react";
import api from "@/lib/api";
import MultiSelectDropdown, { Option } from "@/components/MultiSelectDropdown";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { updateUiInstitute } from "@/store/institute";
import { OfferModalV2 } from "./OfferModalView";
import clsx from "clsx";
import { InstituteViewModal } from "../list/InstituteViewModal";
import InstituteCoursesModal from "./InstituteCoursesModal";
import dynamic from "next/dynamic";
import Pagination from "@/components/common/Pagination";
import { globalNotify } from "@/lib/notification";
import "leaflet/dist/leaflet.css";

// Dynamically load UI elements to avoid SSR issues with Leaflet
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

// Fix Leaflet marker missing images in Next.js
if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

// Helper for 'in air' distance (Haversine formula in km)
function calculateAirDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) {
  const R = 6371; // km
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

// ─── Types & Interfaces ──────────────────────────────────────────────────────
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

// ─── Main Component ──────────────────────────────────────────────────────────
export default function FindInstitutesPage() {
  const findInstituteUi = useSelector((state: RootState) => state?.institutes?.ui);
  const dispatch = useDispatch<AppDispatch>();

  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [institutes, setInstitutes] = useState<InstituteRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const [districtOpts, setDistrictOpts] = useState<Option[]>([]);
  const [qualOpts, setQualOpts] = useState<Option[]>([]);
  const [streamOpts, setStreamOpts] = useState<Option[]>([]);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [selectAllPages, setSelectAllPages] = useState(false);

  const [viewInstitute, setViewInstitute] = useState<boolean>(false);
  const [viewCourses, setViewCourses] = useState<boolean>(false);
  const [currentInstitute, setCurrentInstitute] = useState<InstituteRow | null>(null);

  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [searchGeoTerm, setSearchGeoTerm] = useState("");
  const [punjabGeoJson, setPunjabGeoJson] = useState<any>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [sort, setSort] = useState<"name" | "name-rev" | "student_count">("student_count");

  useEffect(() => {
    fetch("/punjab_state.geojson")
      .then((res) => res.json())
      .then((data) => setPunjabGeoJson(data))
      .catch((err) => console.error("Error loading Punjab GeoJSON:", err));
  }, []);

  // Load basic options
  useEffect(() => {
    const load = async () => {
      try {
        const [qualRes, distRes] = await Promise.all([
          api.get("/qualification"),
          api.get("/district?state_id=3"),
        ]);
        const qData = Array.isArray(qualRes.data) ? qualRes.data : qualRes.data?.data || [];
        const dData = Array.isArray(distRes.data) ? distRes.data : distRes.data?.data || [];

        setQualOpts(qData.map((q: any) => ({ value: q.qualificationid, label: q.qualification })));
        setDistrictOpts(dData.map((d: any) => ({ value: d.lgddistrictId ?? d.districtid, label: d.districtname }))
          .sort((a: Option, b: Option) => a.label.localeCompare(b.label)));
      } catch (err) {
        console.error("Error loading options:", err);
      }
    };
    load();
  }, []);

  // Cascading Streams
  useEffect(() => {
    const loadStreams = async () => {
      try {
        const masterStreamsMap = new Map<string, number[]>();
        if (filters.qualification_ids.length > 0) {
          const streamPromises = filters.qualification_ids.map(id => api.get(`/stream-branch?qualification_id=${id}`));
          const streamResponses = await Promise.all(streamPromises);
          streamResponses.forEach(res => {
            res.data.forEach((s: any) => {
              const ids = masterStreamsMap.get(s.stream_branch_name) || [];
              if (!ids.includes(s.stream_branch_Id)) ids.push(s.stream_branch_Id);
              masterStreamsMap.set(s.stream_branch_name, ids);
            });
          });
        } else {
          // If no qualification selected, we skip master fetch or handle differently?
          // The previous logic fetched from "streams-in-use" directly.
        }

        const inUseRes = await api.get("/institute-qualification-mapping/streams-in-use");
        const inUseIds = new Set(inUseRes.data.map((s: any) => s.stream_branch_Id));

        if (filters.qualification_ids.length === 0) {
          // Flatten inUseRes into the map
          inUseRes.data.forEach((s: any) => {
            const ids = masterStreamsMap.get(s.stream_branch_name) || [];
            if (!ids.includes(s.stream_branch_Id)) ids.push(s.stream_branch_Id);
            masterStreamsMap.set(s.stream_branch_name, ids);
          });
        }

        const sortedNames = Array.from(masterStreamsMap.keys()).sort();
        const finalOptions: Option[] = [];

        sortedNames.forEach(name => {
          const ids = masterStreamsMap.get(name)!;
          const validIdsInPortal = ids.filter(id => inUseIds.has(id));
          if (validIdsInPortal.length > 0) {
            const groupedValue = validIdsInPortal.length === 1 ? validIdsInPortal[0] : validIdsInPortal.join(",");
            finalOptions.push({ value: groupedValue, label: name });
          }
        });

        setStreamOpts(finalOptions);

        // Cleanup
        const validValues = new Set(finalOptions.map(s => String(s.value)));
        setFilters(prev => {
          const nextStreams = prev.stream_ids.filter(id => validValues.has(String(id)));
          return nextStreams.length !== prev.stream_ids.length ? { ...prev, stream_ids: nextStreams } : prev;
        });
      } catch (error) {
        console.error("Failed to load cascading streams:", error);
        setStreamOpts([]);
      }
    };
    loadStreams();
  }, [filters.qualification_ids]);

  const setFilter = (key: keyof Filters) => (vals: number[]) =>
    setFilters((f) => ({ ...f, [key]: vals }));

  const handleSearch = useCallback(async (targetPage = 1, targetLimit = limit) => {
    setLoading(true);
    setSearched(true);
    setPage(targetPage);
    setLimit(targetLimit);

    const params = new URLSearchParams();
    if (filters.district_ids.length) params.set("district_ids", filters.district_ids.join(","));
    if (filters.qualification_ids.length) params.set("qualification_ids", filters.qualification_ids.join(","));
    if (filters.stream_ids.length) params.set("stream_ids", filters.stream_ids.join(","));

    params.set("page", targetPage.toString());
    params.set("limit", targetLimit.toString());
    params.set("sort", sort);
    params.set("order", sort === "name-rev" ? "desc" : sort === "name" ? "asc" : "desc");

    try {
      const res = await api.get(`/institute/search?${params}`);
      let data = res.data?.data || [];
      const totalCount = res.data?.total || 0;

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
      setTotal(totalCount);
    } catch {
      setInstitutes([]);
      setTotal(0);
    }
    setLoading(false);
  }, [filters, sort, userLocation, limit]);

  useEffect(() => {
    handleSearch();
  }, [handleSearch]);

  const handleGeoSearch = async () => {
    if (!searchGeoTerm.trim()) return;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchGeoTerm)}`);
      const data = await res.json();
      if (data && data.length > 0) setUserLocation([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
    } catch (e) { console.warn("Geocoding failed", e); }
  };

  const MapClickEvent = () => {
    useMapEvents({ click(e: any) { setUserLocation([e.latlng.lat, e.latlng.lng]); } });
    const map = useMap();
    useEffect(() => { if (userLocation) map.flyTo(userLocation, map.getZoom()); }, [userLocation, map]);
    return null;
  };

  const toggleSelect = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        setSelectAllPages(false);
      } else {
        next.add(id);
      }
      return next;
    });

  const allSelected = institutes.length > 0 && institutes.every((i) => selected.has(i.institute_id));
  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
      setSelectAllPages(false);
    } else {
      setSelected(new Set(institutes.map((i) => i.institute_id)));
    }
  };

  const institutesMap = new Map(institutes.map((i) => [i.institute_id, i.institute_name]));

  const filteredInstitutes = institutes.filter(
    (inst) =>
      inst.institute_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inst.district?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="w-full mx-auto pb-20">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
            <Building2 size={22} className="text-primary-content" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-base-content tracking-tight leading-tight">Find Institutes</h1>
            <p className="text-sm text-base-content/50 mt-0.5">Search | Filter | Connect</p>
          </div>
        </div>

        {searched && !loading && (
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-base-200 dark:bg-base-800 border border-base-300 dark:border-base-700 text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-base-content/50">Found</p>
              <p className="text-xl font-black text-primary leading-tight">{total}</p>
            </div>
            {(selected.size > 0 || selectAllPages) && (
              <div className="px-4 py-2 rounded-xl bg-success/10 border border-success/25 text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-success/70">Selected</p>
                <p className="text-xl font-black text-success leading-tight">{selectAllPages ? total : selected.size}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Filters ── */}
      <div className="rounded-2xl bg-base-100 dark:bg-base-900 border border-base-300 dark:border-base-700 shadow-sm p-5 sm:p-6 mb-8">
        <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-base-200 dark:border-base-800">
          <Filter size={18} className="text-primary" />
          <h2 className="text-base font-bold text-base-content">Filters</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
          <MultiSelectDropdown label="District" options={districtOpts} selected={filters.district_ids} onChange={setFilter("district_ids")} placeholder="All districts" />
          <MultiSelectDropdown label="Qualification" options={qualOpts} selected={filters.qualification_ids} onChange={setFilter("qualification_ids")} placeholder="All qualifications" />
          <MultiSelectDropdown label="Course/Trade" options={streamOpts} selected={filters.stream_ids} onChange={setFilter("stream_ids")} placeholder="All courses/trades" />
        </div>
        <div className="flex justify-end mt-4">
          <button onClick={() => setFilters(EMPTY_FILTERS)} disabled={loading} className="btn btn-outline text-sm px-6">Reset Filters</button>
        </div>
      </div>

      {/* ── Results ── */}
      {searched && (
        <div className="space-y-4">
          {!loading && institutes.length > 0 && (
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-base-100 dark:bg-base-900 border border-base-300 dark:border-base-700 rounded-xl px-4 py-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Users size={16} />
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-base-content">{total} institute{total !== 1 ? "s" : ""} found</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative flex-1 min-w-[240px] max-w-sm group">
                  <input type="text" placeholder="Search current results..." className="input input-bordered w-full pl-11 pr-5 text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/50" />
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-base-300 bg-base-200 text-xs text-base-content">
                  <ArrowUpDown size={12} className="text-primary" />
                  <select className="bg-transparent border-0 outline-none font-medium cursor-pointer text-xs" value={sort} onChange={(e) => setSort(e.target.value as any)}>
                    <option value="student_count">Students</option>
                    <option value="name">A–Z</option>
                    <option value="name-rev">Z–A</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Selection Banner */}
          {allSelected && total > institutes.length && !selectAllPages && (
            <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 text-center text-sm font-medium text-primary animate-in fade-in slide-in-from-top-2">
              All {institutes.length} institutes on this page are selected.{" "}
              <button
                onClick={() => setSelectAllPages(true)}
                className="font-bold underline hover:text-primary-focus ml-1"
              >
                Select all {total} institutes in this search
              </button>
            </div>
          )}
          {selectAllPages && (
            <div className="bg-success/10 border border-success/20 rounded-xl p-3 text-center text-sm font-medium text-success animate-in fade-in slide-in-from-top-2">
              All {total} institutes in this search are selected.{" "}
              <button
                onClick={() => { setSelectAllPages(false); setSelected(new Set()); }}
                className="font-bold underline hover:text-success-focus ml-1"
              >
                Clear selection
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-base-content/50">
              <Loader2 size={32} className="animate-spin text-primary" />
              <p className="text-sm">Searching institutes…</p>
            </div>
          ) : institutes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 rounded-2xl border-2 border-dashed border-base-300 bg-base-100 gap-4">
              <Search size={24} className="text-primary" />
              <p className="font-semibold text-base-content">No institutes found</p>
            </div>
          ) : (
            <>
              <div className="rounded-xl border border-base-300 bg-base-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto hidden md:block">
                  <table className="min-w-full divide-y divide-base-200">
                    <thead>
                      <tr className="bg-base-200/60">
                        <th className="px-4 py-3 min-w-[120px]">
                          <div className="flex items-center gap-2 ml-1">
                            <button onClick={toggleAll} className="w-6 h-6 rounded border border-base-300 dark:border-base-700 bg-base-100 dark:bg-base-900 hover:border-primary hover:text-primary flex items-center justify-center text-base-content/60 transition-all">
                              {allSelected ? <CheckSquare size={14} className="text-primary" /> : <Square size={14} />}
                            </button>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-base-content/40 cursor-pointer" onClick={toggleAll}>Select All</span>
                          </div>
                        </th>
                        {["Institute Name", "District", "Courses", "Total Enrolled", "Final Year", "Actions"].map((h) => (
                          <th key={h} className={clsx("px-4 py-3 text-left text-xs font-bold text-base-content/60 uppercase tracking-wider", h === "Actions" && "text-center")}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-base-200">
                      {filteredInstitutes.map((inst) => (
                        <tr key={inst.institute_id} onClick={() => toggleSelect(inst.institute_id)} className={clsx("cursor-pointer transition-colors", selected.has(inst.institute_id) ? "bg-primary/5" : "hover:bg-base-200/50")}>
                          <td className="px-4 py-3 text-center">
                            {selected.has(inst.institute_id) ? <CheckSquare size={16} className="text-primary mx-auto" /> : <Square size={16} className="text-base-content/30 mx-auto" />}
                          </td>
                          <td className="px-4 py-3 font-semibold text-sm text-base-content">{inst.institute_name}</td>
                          <td className="px-4 py-3 text-sm text-base-content/65"><MapPin size={12} className="inline mr-1" />{inst.district || "—"}</td>
                          <td className="px-4 py-3">
                            <button onClick={(e) => { e.stopPropagation(); setCurrentInstitute(inst); setViewCourses(true); }} className="btn btn-xs btn-ghost gap-1 text-base-content"><BookOpen size={12} /> View</button>
                          </td>
                          <td className="px-4 py-3 font-bold text-primary">{inst.student_count.toLocaleString()}</td>
                          <td className="px-4 py-3 font-bold text-secondary">{inst.final_year_student_count?.toLocaleString() || "0"}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-2">
                              <button onClick={(e) => { e.stopPropagation(); setCurrentInstitute(inst); setViewInstitute(true); }} className="btn btn-xs btn-circle btn-ghost text-base-content" title="View Details">
                                <Eye size={14} />
                              </button>
                              <div className="w-px h-4 bg-base-300 mx-1" />
                              <button
                                onClick={(e) => { e.stopPropagation(); toggleSelect(inst.institute_id); }}
                                className={clsx(
                                  "btn btn-xs gap-1 font-bold transition-all",
                                  selected.has(inst.institute_id) || selectAllPages
                                    ? "bg-success/10 text-success border border-success/30 hover:bg-success/20 px-4"
                                    : "btn-outline btn-primary hover:px-4"
                                )}
                              >
                                <Send size={12} />
                                {selected.has(inst.institute_id) || selectAllPages ? "Selected" : "Connect"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Mobile Cards */}
                <div className="md:hidden flex flex-col divide-y divide-base-200">
                  {filteredInstitutes.map((inst) => (
                    <div key={inst.institute_id} onClick={() => toggleSelect(inst.institute_id)} className={clsx("p-4 transition-colors", selected.has(inst.institute_id) ? "bg-primary/5" : "")}>
                      <div className="flex items-start gap-3">
                        {selected.has(inst.institute_id) ? <CheckSquare size={16} className="text-primary mt-0.5" /> : <Square size={16} className="text-base-content/30 mt-0.5" />}
                        <div className="flex-1">
                          <h3 className="text-sm font-bold">{inst.institute_name}</h3>
                          <p className="text-xs text-base-content/60 mt-1 flex items-center gap-3">
                            <span><MapPin size={11} className="inline" /> {inst.district}</span>
                            <span className="font-semibold text-primary">{inst.student_count} Enrolled</span>
                          </p>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleSelect(inst.institute_id); }}
                          className={clsx(
                            "btn btn-xs font-bold",
                            selected.has(inst.institute_id) ? "bg-success/10 text-success border border-success/30" : "btn-primary btn-outline"
                          )}
                        >
                          {selected.has(inst.institute_id) ? "Selected" : "Connect"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Pagination
                total={total}
                page={page}
                limit={limit}
                onPageChange={(p) => handleSearch(p, limit)}
                onLimitChange={(l) => handleSearch(1, l)}
              />
            </>
          )}

          {/* Map */}
          <div className="bg-base-100 p-6 rounded-2xl shadow-sm border border-base-300 mt-8">
            <h3 className="font-bold text-base-content flex items-center gap-2 mb-4"><MapPin size={18} className="text-secondary" /> Visual Distance Intelligence</h3>
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <input type="text" placeholder="Enter location..." className="input input-bordered flex-1" value={searchGeoTerm} onChange={(e) => setSearchGeoTerm(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleGeoSearch()} />
              <button onClick={handleGeoSearch} className="btn btn-secondary px-6">Search Map</button>
              <button onClick={() => { setUserLocation(null); setSearchGeoTerm(""); }} className="btn btn-outline">Reset</button>
            </div>
            <div className="w-full h-[400px] rounded-xl overflow-hidden border border-base-200">
              <MapContainer center={userLocation || [31.1471, 75.3412]} zoom={userLocation ? 14 : 7} style={{ height: "100%", width: "100%" }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {punjabGeoJson && <GeoJSON data={punjabGeoJson} style={() => ({ color: "#6366f1", weight: 2, fillOpacity: 0.1 })} />}
                {userLocation && <Marker position={userLocation} />}
                <MapClickEvent />
              </MapContainer>
            </div>
          </div>
        </div>
      )}

      {/* Modals & Portals */}

      {(selected.size > 0 || selectAllPages) && (
        <div className="fixed bottom-10 right-10 z-[100] animate-in slide-in-from-bottom-5">
          <button
            onClick={() => dispatch(updateUiInstitute({ bulkOffer: { open: true } }))}
            className="btn btn-primary btn-lg rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.2)] gap-4 px-10 border-4 border-base-100 hover:scale-105 active:scale-95 transition-all text-sm font-black uppercase tracking-widest"
          >
            <div className="flex flex-col items-start leading-none gap-1">
              <span className="text-[10px] opacity-70">Bulk Connection</span>
              <span>{selectAllPages ? total : selected.size} Institute{(selectAllPages ? total : selected.size) !== 1 ? "s" : ""} selected</span>
            </div>
            <div className="w-px h-8 bg-white/20 ml-2" />
            <div className="flex items-center gap-2">
              <Send size={18} />
              <span>Send EOI</span>
            </div>
          </button>
        </div>
      )}

      <OfferModalV2
        isOpen={findInstituteUi?.bulkOffer?.open ?? false}
        onClose={() => dispatch(updateUiInstitute({ bulkOffer: { open: false } }))}
        selectedIds={selectAllPages ? [] : Array.from(selected)}
        isSelectAll={selectAllPages}
        searchFilters={filters}
        searchSort={sort}
        institutesMap={institutesMap}
        qualOptions={qualOpts}
        streamOptions={streamOpts}
        prefilledQualIds={filters.qualification_ids}
        prefilledStreamIds={filters.stream_ids}
        onSent={() => { globalNotify("EOIs sent successfully!", "success"); setSelected(new Set()); }}
      />

      <InstituteViewModal open={viewInstitute} setOpen={setViewInstitute} institute={currentInstitute} />
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
