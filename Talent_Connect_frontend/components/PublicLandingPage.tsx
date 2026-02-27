'use client';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import MultiSelectDropdown, { Option } from '@/components/MultiSelectDropdown';
import { Search, Filter, MapPin, Users, Building2, LogIn, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// No-auth axios instance for public endpoints
const pub = axios.create({ baseURL: BASE });

type Option2 = Option;

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
}

interface Filters {
    state_ids: number[];
    district_ids: number[];
    type_ids: number[];
    ownership_ids: number[];
    qualification_ids: number[];
    stream_ids: number[];
}

const EMPTY: Filters = { state_ids: [], district_ids: [], type_ids: [], ownership_ids: [], qualification_ids: [], stream_ids: [] };
const PAGE_SIZE = 12;

function LoginPromptModal({ onClose }: { onClose: () => void }) {
    const router = useRouter();
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-base-100 rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center space-y-5">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <LogIn size={32} className="text-primary" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-base-content">Login Required</h2>
                    <p className="text-sm text-base-content/60 mt-2">Please log in to contact institutes or send job offers.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={onClose} className="btn btn-ghost flex-1">Cancel</button>
                    <button onClick={() => router.push('/login')} className="btn btn-primary flex-1 gap-2">
                        <LogIn size={16} /> Log In
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function PublicLandingPage() {
    const [filters, setFilters] = useState<Filters>(EMPTY);
    const [institutes, setInstitutes] = useState<InstituteRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const [stateOpts, setStateOpts] = useState<Option2[]>([]);
    const [districtOpts, setDistrictOpts] = useState<Option2[]>([]);
    const [typeOpts, setTypeOpts] = useState<Option2[]>([]);
    const [ownershipOpts, setOwnershipOpts] = useState<Option2[]>([]);
    const [qualOpts, setQualOpts] = useState<Option2[]>([]);
    const [streamOpts, setStreamOpts] = useState<Option2[]>([]);

    // Load static filter options on mount
    useEffect(() => {
        pub.get('/state').then(r => setStateOpts(r.data.map((s: any) => ({ value: s.lgdstateid ?? s.stateid, label: s.statename }))));
        pub.get('/institute-type').then(r => setTypeOpts(r.data.map((t: any) => ({ value: t.institute_type_id, label: t.institute_type }))));
        pub.get('/institute-ownership-type').then(r => setOwnershipOpts(r.data.map((o: any) => ({ value: o.institute_ownership_type_id, label: o.institute_type }))));
        pub.get('/qualification').then(r => setQualOpts(r.data.map((q: any) => ({ value: q.qualificationid, label: q.qualification_name }))));
        pub.get('/institute-qualification-mapping/streams-in-use').then(r =>
            setStreamOpts(r.data.map((s: any) => ({ value: s.stream_branch_Id, label: s.stream_branch_name })))
        );
    }, []);

    // Load districts when state changes
    useEffect(() => {
        if (!filters.state_ids.length) { setDistrictOpts([]); return; }
        pub.get(`/district?state_id=${filters.state_ids[0]}`).then(r =>
            setDistrictOpts(r.data.map((d: any) => ({ value: d.districtid ?? d.lgddistrictId, label: d.districtname })))
        );
    }, [filters.state_ids]);

    // Cascade streams when qualification changes
    useEffect(() => {
        if (filters.qualification_ids.length > 0) {
            const qId = filters.qualification_ids[0];
            Promise.all([
                pub.get(`/stream-branch?qualification_id=${qId}`),
                pub.get('/institute-qualification-mapping/streams-in-use'),
            ]).then(([masterRes, inUseRes]) => {
                const inUseIds = new Set(inUseRes.data.map((s: any) => s.stream_branch_Id));
                const filtered = masterRes.data.filter((s: any) => inUseIds.has(s.stream_branch_Id));
                setStreamOpts(filtered.map((s: any) => ({ value: s.stream_branch_Id, label: s.stream_branch_name })));
            });
        } else {
            pub.get('/institute-qualification-mapping/streams-in-use').then(r =>
                setStreamOpts(r.data.map((s: any) => ({ value: s.stream_branch_Id, label: s.stream_branch_name })))
            );
        }
    }, [filters.qualification_ids]);

    const setFilter = (key: keyof Filters) => (vals: number[]) =>
        setFilters(f => ({ ...f, [key]: vals }));

    const handleSearch = useCallback(async () => {
        setLoading(true); setSearched(true); setCurrentPage(1);
        const params = new URLSearchParams();
        if (filters.state_ids.length) params.set('state_ids', filters.state_ids.join(','));
        if (filters.district_ids.length) params.set('district_ids', filters.district_ids.join(','));
        if (filters.type_ids.length) params.set('type_ids', filters.type_ids.join(','));
        if (filters.ownership_ids.length) params.set('ownership_ids', filters.ownership_ids.join(','));
        if (filters.qualification_ids.length) params.set('qualification_ids', filters.qualification_ids.join(','));
        if (filters.stream_ids.length) params.set('stream_ids', filters.stream_ids.join(','));
        params.set('sort', 'student_count'); params.set('order', 'desc');
        try {
            const r = await pub.get(`/institute/search?${params}`);
            setInstitutes(r.data);
        } catch { setInstitutes([]); }
        setLoading(false);
    }, [filters]);

    const reset = () => { setFilters(EMPTY); setInstitutes([]); setSearched(false); };

    const totalPages = Math.ceil(institutes.length / PAGE_SIZE);
    const paged = institutes.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    return (
        <div className="min-h-screen bg-base-200">
            {showLoginPrompt && <LoginPromptModal onClose={() => setShowLoginPrompt(false)} />}

            {/* Hero / Search Panel */}
            <div className="bg-gradient-to-br from-primary/90 to-primary text-primary-content py-12 px-4">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">Find Institutes</h1>
                        <p className="text-primary-content/70 text-sm md:text-base">Search institutes by location, qualification, stream, type and more</p>
                    </div>

                    {/* Filters */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 md:p-6 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            <MultiSelectDropdown label="State" options={stateOpts} selected={filters.state_ids} onChange={vals => { setFilter('state_ids')(vals); setFilter('district_ids')([]); }} placeholder="Any state" />
                            <MultiSelectDropdown label="District" options={districtOpts} selected={filters.district_ids} onChange={setFilter('district_ids')} placeholder={filters.state_ids.length ? 'Any district' : 'Select state first'} />
                            <MultiSelectDropdown label="Qualification" options={qualOpts} selected={filters.qualification_ids} onChange={setFilter('qualification_ids')} placeholder="Any qualification" />
                            <MultiSelectDropdown label="Stream / Branch" options={streamOpts} selected={filters.stream_ids} onChange={setFilter('stream_ids')} placeholder="Any stream" />
                            <MultiSelectDropdown label="Institute Type" options={typeOpts} selected={filters.type_ids} onChange={setFilter('type_ids')} placeholder="Any type" />
                            <MultiSelectDropdown label="Ownership" options={ownershipOpts} selected={filters.ownership_ids} onChange={setFilter('ownership_ids')} placeholder="Any ownership" />
                        </div>

                        <div className="flex gap-3 justify-end">
                            <button onClick={reset} className="btn btn-ghost btn-sm text-primary-content/80 gap-1.5">
                                <X size={14} /> Reset
                            </button>
                            <button onClick={handleSearch} disabled={loading} className="btn btn-white btn-sm text-primary font-semibold gap-2 shadow-lg">
                                {loading ? <span className="loading loading-spinner loading-xs" /> : <Search size={16} />}
                                Search Institutes
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Results */}
            <div className="max-w-5xl mx-auto px-4 py-8">
                {!searched && !loading && (
                    <div className="text-center text-base-content/40 py-16 space-y-3">
                        <Filter size={48} className="mx-auto opacity-30" />
                        <p className="text-lg font-medium">Use the filters above to search institutes</p>
                        <p className="text-sm">No login required to search</p>
                    </div>
                )}

                {loading && (
                    <div className="flex items-center justify-center py-16 gap-3 text-base-content/50">
                        <span className="loading loading-spinner loading-md" /> Searching institutes…
                    </div>
                )}

                {searched && !loading && institutes.length === 0 && (
                    <div className="text-center text-base-content/40 py-16">
                        <Building2 size={48} className="mx-auto opacity-30 mb-3" />
                        <p className="font-medium">No institutes found</p>
                        <p className="text-sm mt-1">Try adjusting your filters</p>
                    </div>
                )}

                {searched && !loading && institutes.length > 0 && (
                    <>
                        <div className="flex items-center justify-between mb-5">
                            <p className="text-sm text-base-content/60">
                                Found <span className="font-semibold text-base-content">{institutes.length}</span> institutes
                                {totalPages > 1 && ` · Page ${currentPage} of ${totalPages}`}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {paged.map(inst => (
                                <div key={inst.institute_id}
                                    className="bg-base-100 rounded-2xl border border-base-200 dark:border-base-700 p-5 shadow-sm hover:shadow-md transition-all space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <Building2 size={20} className="text-primary" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-semibold text-sm text-base-content leading-snug line-clamp-2">{inst.institute_name}</h3>
                                            {inst.email && <p className="text-xs text-base-content/50 mt-0.5 truncate">{inst.email}</p>}
                                        </div>
                                    </div>

                                    <div className="space-y-1.5 text-xs text-base-content/60">
                                        {(inst.district || inst.district_id) && (
                                            <div className="flex items-center gap-1.5">
                                                <MapPin size={12} className="flex-shrink-0" />
                                                <span>{inst.district || `District #${inst.district_id}`}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1.5">
                                            <Users size={12} className="flex-shrink-0" />
                                            <span>{inst.student_count ?? 0} students</span>
                                        </div>
                                        {inst.mobileno && <p>📞 {inst.mobileno}</p>}
                                    </div>

                                    <button onClick={() => setShowLoginPrompt(true)}
                                        className="btn btn-primary btn-sm w-full gap-1.5 mt-1">
                                        <LogIn size={14} /> Contact / Send Offer
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-3 mt-8">
                                <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}
                                    className="btn btn-ghost btn-sm gap-1"><ChevronLeft size={16} /> Prev</button>
                                <span className="text-sm text-base-content/60">{currentPage} / {totalPages}</span>
                                <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}
                                    className="btn btn-ghost btn-sm gap-1">Next <ChevronRight size={16} /></button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
