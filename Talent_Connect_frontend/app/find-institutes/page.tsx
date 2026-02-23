'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Send, SortAsc, SortDesc, CheckSquare, Square, Loader2, X } from 'lucide-react';
import api from '@/lib/api';
import MultiSelectDropdown, { Option } from '@/components/MultiSelectDropdown';
import CommonModal from '@/components2/common/CommonModal';
import { CommonInputField } from '@/components2/forms/CommonInputField';
import { useAuth } from '@/hooks/useAuth';

// ─── Types ────────────────────────────────────────────────────────────────────

interface InstituteRow {
    institute_id: number;
    institute_name: string;
    district: string;
    type: string;
    ownership: string;
    email: string;
    mobileno: string;
    student_count: number;
}

interface Filters {
    state_ids: number[];
    district_ids: number[];
    type_ids: number[];
    ownership_ids: number[];
    qualification_ids: number[];
    program_ids: number[];
    stream_ids: number[];
}

const EMPTY_FILTERS: Filters = {
    state_ids: [], district_ids: [], type_ids: [], ownership_ids: [],
    qualification_ids: [], program_ids: [], stream_ids: [],
};

// ─── Offer Modal ─────────────────────────────────────────────────────────────

function OfferModal({
    isOpen, selectedIds, institutesMap, filters, qualOptions, programOptions, streamOptions,
    onClose, onSent
}: {
    isOpen: boolean;
    selectedIds: number[];
    institutesMap: Map<number, string>;
    filters: Filters;
    qualOptions: Option[];
    programOptions: Option[];
    streamOptions: Option[];
    onClose: () => void;
    onSent: () => void;
}) {
    const [jobTitle, setJobTitle] = useState('');
    const [description, setDescription] = useState('');
    const [salaryMin, setSalaryMin] = useState('');
    const [salaryMax, setSalaryMax] = useState('');
    const [lastDate, setLastDate] = useState('');
    const [qualIds, setQualIds] = useState<number[]>(filters.qualification_ids);
    const [programIds, setProgramIds] = useState<number[]>(filters.program_ids);
    const [streamIds, setStreamIds] = useState<number[]>(filters.stream_ids);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');

    const handleSend = async () => {
        if (!jobTitle.trim()) { setError('Job title is required'); return; }
        if (selectedIds.length === 0) { setError('Select at least one institute'); return; }
        setSending(true);
        try {
            await api.post('/job-offer/bulk', {
                institute_ids: selectedIds,
                job_title: jobTitle,
                job_description: description,
                required_qualification_ids: qualIds.join(','),
                required_program_ids: programIds.join(','),
                required_stream_ids: streamIds.join(','),
                salary_min: salaryMin ? parseFloat(salaryMin) : undefined,
                salary_max: salaryMax ? parseFloat(salaryMax) : undefined,
                last_date: lastDate || undefined,
            });
            onSent();
        } catch (e: any) {
            setError(e?.response?.data?.message ?? 'Failed to send offers');
        } finally {
            setSending(false);
        }
    };

    return (
        <CommonModal isOpen={isOpen} onClose={onClose} title="Send Job Offer" size="lg">
            <div className="space-y-5">
                {/* Sub-header */}
                <p className="text-sm text-base-content/60">
                    Sending to <span className="text-primary font-semibold">{selectedIds.length}</span>&nbsp;
                    institute{selectedIds.length !== 1 ? 's' : ''}
                </p>

                {/* Selected institute chips */}
                <div className="flex flex-wrap gap-2">
                    {selectedIds.map(id => (
                        <span key={id} className="badge badge-primary badge-outline badge-sm">
                            {institutesMap.get(id)}
                        </span>
                    ))}
                </div>

                {/* Job Title */}
                <CommonInputField
                    label="Job Title *"
                    value={jobTitle}
                    onChange={e => setJobTitle(e.target.value)}
                    placeholder="e.g. Software Engineer – Campus 2025"
                />

                {/* Description */}
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-base-content/90">Job Description</label>
                    <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        rows={3}
                        placeholder="Role overview, responsibilities, perks…"
                        className="textarea textarea-bordered w-full rounded-2xl text-sm"
                    />
                </div>

                {/* Salary Range */}
                <div className="grid grid-cols-2 gap-4">
                    <CommonInputField
                        label="Salary Min (₹/yr)"
                        type="number"
                        value={salaryMin}
                        onChange={e => setSalaryMin(e.target.value)}
                        placeholder="e.g. 300000"
                    />
                    <CommonInputField
                        label="Salary Max (₹/yr)"
                        type="number"
                        value={salaryMax}
                        onChange={e => setSalaryMax(e.target.value)}
                        placeholder="e.g. 600000"
                    />
                </div>

                {/* Filter selections */}
                <div className="grid grid-cols-1 gap-3">
                    <MultiSelectDropdown label="Required Qualifications" options={qualOptions}
                        selected={qualIds} onChange={setQualIds}
                        placeholder="Any qualification (from filter)" />
                    <MultiSelectDropdown label="Required Programs" options={programOptions}
                        selected={programIds} onChange={setProgramIds}
                        placeholder="Any program (from filter)" />
                    <MultiSelectDropdown label="Required Streams / Branches" options={streamOptions}
                        selected={streamIds} onChange={setStreamIds}
                        placeholder="Any stream (from filter)" />
                </div>

                {/* Last Date */}
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-base-content/90">Last Date to Apply</label>
                    <input
                        type="date"
                        value={lastDate}
                        onChange={e => setLastDate(e.target.value)}
                        className="input input-bordered rounded-xl text-sm"
                    />
                </div>

                {error && (
                    <div className="alert alert-error text-sm py-2">
                        <X size={14} /> {error}
                    </div>
                )}

                {/* Footer actions */}
                <div className="flex items-center justify-end gap-3 pt-2">
                    <button onClick={onClose} className="btn btn-ghost btn-sm">Cancel</button>
                    <button onClick={handleSend} disabled={sending} className="btn btn-primary btn-sm gap-2">
                        {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                        {sending ? 'Sending…' : `Send to ${selectedIds.length} Institute${selectedIds.length !== 1 ? 's' : ''}`}
                    </button>
                </div>
            </div>
        </CommonModal>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function FindInstitutesPage() {
    const { user, isIndustry } = useAuth();

    const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
    const [sort, setSort] = useState<'name' | 'student_count'>('student_count');
    const [order, setOrder] = useState<'asc' | 'desc'>('desc');

    const [institutes, setInstitutes] = useState<InstituteRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [selected, setSelected] = useState<Set<number>>(new Set());

    const [stateOpts, setStateOpts] = useState<Option[]>([]);
    const [districtOpts, setDistrictOpts] = useState<Option[]>([]);
    const [typeOpts, setTypeOpts] = useState<Option[]>([]);
    const [ownershipOpts, setOwnershipOpts] = useState<Option[]>([]);
    const [qualOpts, setQualOpts] = useState<Option[]>([]);
    const [programOpts, setProgramOpts] = useState<Option[]>([]);
    const [streamOpts, setStreamOpts] = useState<Option[]>([]);

    const [showModal, setShowModal] = useState(false);
    const [sentSuccess, setSentSuccess] = useState(false);

    useEffect(() => {
        const load = async () => {
            const [states, types, own, qual] = await Promise.all([
                api.get('/state').then(r => r.data.map((s: any) => ({ value: s.lgdstateid, label: s.statename })).sort((a: Option, b: Option) => a.label.localeCompare(b.label))).catch(() => []),
                api.get('/institute-type').then(r => r.data.map((t: any) => ({ value: t.institute_type_id, label: t.institute_type }))).catch(() => []),
                api.get('/institute-ownership-type').then(r => r.data.map((o: any) => ({ value: o.institute_ownership_type_id, label: o.institute_type }))).catch(() => []),
                api.get('/qualification').then(r => r.data.map((q: any) => ({ value: q.qualificationid, label: q.qualification }))).catch(() => []),
            ]);
            setStateOpts(states); setTypeOpts(types); setOwnershipOpts(own); setQualOpts(qual);
        };
        load();
    }, []);

    useEffect(() => {
        const loadDistricts = async () => {
            if (filters.state_ids.length === 0) {
                const res = await api.get('/district');
                setDistrictOpts(res.data.map((d: any) => ({ value: d.districtid, label: d.districtname })).sort((a: Option, b: Option) => a.label.localeCompare(b.label)));
            } else {
                const results = await Promise.all(filters.state_ids.map(sId => api.get(`/district?state_id=${sId}`).then(r => r.data)));
                const merged = results.flat();
                const unique = Array.from(new Map(merged.map((d: any) => [d.districtid, d])).values());
                setDistrictOpts(unique.map((d: any) => ({ value: d.districtid, label: d.districtname })).sort((a: Option, b: Option) => a.label.localeCompare(b.label)));
                setFilters(f => ({ ...f, district_ids: [] }));
            }
        };
        loadDistricts();
    }, [filters.state_ids]);

    useEffect(() => {
        const loadPrograms = async () => {
            if (filters.qualification_ids.length > 0) {
                const qId = filters.qualification_ids[0];
                const res = await api.get(`/program-qualification-mapping?qualification_id=${qId}`);
                const progs = res.data.map((m: any) => ({ value: m.program.programId, label: m.program.program_name }));
                const unique = Array.from(new Map(progs.map((p: any) => [p.value, p])).values());
                setProgramOpts(unique as Option[]);
            } else {
                const res = await api.get('/program');
                setProgramOpts(res.data.map((p: any) => ({ value: p.programId, label: p.program_name })));
            }
        };
        loadPrograms();
    }, [filters.qualification_ids]);

    useEffect(() => {
        const loadStreams = async () => {
            if (filters.program_ids.length > 0) {
                const pId = filters.program_ids[0];
                const res = await api.get(`/stream-branch?program_id=${pId}`);
                setStreamOpts(res.data.map((s: any) => ({ value: s.stream_branch_Id, label: s.stream_branch_name })));
            } else {
                const res = await api.get('/stream-branch');
                setStreamOpts(res.data.map((s: any) => ({ value: s.stream_branch_Id, label: s.stream_branch_name })));
            }
        };
        loadStreams();
    }, [filters.program_ids]);

    const setFilter = (key: keyof Filters) => (vals: number[]) => setFilters(f => ({ ...f, [key]: vals }));

    const handleSearch = useCallback(async () => {
        setLoading(true); setSearched(true); setSelected(new Set());
        const params = new URLSearchParams();
        if (filters.district_ids.length) params.set('district_ids', filters.district_ids.join(','));
        if (filters.type_ids.length) params.set('type_ids', filters.type_ids.join(','));
        if (filters.ownership_ids.length) params.set('ownership_ids', filters.ownership_ids.join(','));
        if (filters.qualification_ids.length) params.set('qualification_ids', filters.qualification_ids.join(','));
        if (filters.program_ids.length) params.set('program_ids', filters.program_ids.join(','));
        if (filters.stream_ids.length) params.set('stream_ids', filters.stream_ids.join(','));
        params.set('sort', sort); params.set('order', order);
        try {
            const res = await api.get(`/institute/search?${params}`);
            setInstitutes(res.data);
        } catch { setInstitutes([]); }
        setLoading(false);
    }, [filters, sort, order]);

    const toggleSelect = (id: number) => setSelected(prev => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
    });
    const allSelected = institutes.length > 0 && institutes.every(i => selected.has(i.institute_id));
    const toggleAll = () => setSelected(allSelected ? new Set() : new Set(institutes.map(i => i.institute_id)));

    const toggleSort = (col: 'name' | 'student_count') => {
        if (sort === col) setOrder(o => o === 'asc' ? 'desc' : 'asc');
        else { setSort(col); setOrder(col === 'student_count' ? 'desc' : 'asc'); }
    };

    const institutesMap = new Map(institutes.map(i => [i.institute_id, i.institute_name]));

    const SortIcon = ({ col }: { col: string }) => {
        if (sort !== col) return null;
        return order === 'asc' ? <SortAsc size={12} className="text-primary" /> : <SortDesc size={12} className="text-primary" />;
    };

    return (
        <div className="space-y-6">
            {/* Page header */}
            <div>
                <h1 className="text-2xl font-bold text-base-content">Find Institutes</h1>
                <p className="text-base-content/50 text-sm mt-1">Filter institutes and send job offers directly to their placement cells.</p>
            </div>

            {/* Filter card */}
            <div className="p-5 rounded-2xl bg-base-200 border border-base-300 space-y-4">
                <div className="text-xs font-semibold text-base-content/50 uppercase tracking-widest">Filters</div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <MultiSelectDropdown label="State" options={stateOpts} selected={filters.state_ids} onChange={setFilter('state_ids')} />
                    <MultiSelectDropdown label="District" options={districtOpts} selected={filters.district_ids} onChange={setFilter('district_ids')} />
                    <MultiSelectDropdown label="Institute Type" options={typeOpts} selected={filters.type_ids} onChange={setFilter('type_ids')} />
                    <MultiSelectDropdown label="Ownership Type (Legal Entity)" options={ownershipOpts} selected={filters.ownership_ids} onChange={setFilter('ownership_ids')} />
                    <MultiSelectDropdown label="Qualification" options={qualOpts} selected={filters.qualification_ids} onChange={setFilter('qualification_ids')} />
                    <MultiSelectDropdown label="Program" options={programOpts} selected={filters.program_ids} onChange={setFilter('program_ids')} />
                    <MultiSelectDropdown label="Stream / Branch" options={streamOpts} selected={filters.stream_ids} onChange={setFilter('stream_ids')} />
                </div>
                <div className="flex items-center gap-3 pt-2">
                    <button onClick={handleSearch} disabled={loading} className="btn btn-primary btn-sm gap-2">
                        {loading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
                        {loading ? 'Searching…' : 'Search Institutes'}
                    </button>
                    <button onClick={() => setFilters(EMPTY_FILTERS)} className="btn btn-ghost btn-sm text-base-content/50">
                        Reset filters
                    </button>
                </div>
            </div>

            {/* Results */}
            {searched && (
                <div className="rounded-2xl bg-base-200 border border-base-300 overflow-hidden">
                    {/* Table header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-base-300">
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-base-content">
                                {institutes.length} institute{institutes.length !== 1 ? 's' : ''} found
                            </span>
                            {selected.size > 0 && (
                                <span className="badge badge-primary badge-sm">
                                    {selected.size} selected
                                </span>
                            )}
                        </div>
                        {selected.size > 0 && (
                            <button onClick={() => setShowModal(true)} className="btn btn-primary btn-sm gap-2">
                                <Send size={14} /> Send Job Offer
                            </button>
                        )}
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-16 text-base-content/40">
                            <Loader2 className="animate-spin mr-2" size={20} /> Searching…
                        </div>
                    ) : institutes.length === 0 ? (
                        <div className="py-16 text-center text-base-content/40 text-sm">
                            No institutes match the selected filters.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="table table-zebra w-full text-sm">
                                <thead className="text-xs uppercase tracking-wider">
                                    <tr>
                                        <th className="w-10">
                                            <button onClick={toggleAll} className="text-base-content/50 hover:text-primary transition-colors">
                                                {allSelected ? <CheckSquare size={16} className="text-primary" /> : <Square size={16} />}
                                            </button>
                                        </th>
                                        <th>
                                            <button onClick={() => toggleSort('name')} className="flex items-center gap-1.5 hover:text-primary transition-colors">
                                                Institute Name <SortIcon col="name" />
                                            </button>
                                        </th>
                                        <th>District</th>
                                        <th>Type</th>
                                        <th>Ownership</th>
                                        <th className="text-right">
                                            <button onClick={() => toggleSort('student_count')} className="flex items-center gap-1.5 hover:text-primary transition-colors ml-auto">
                                                Students <SortIcon col="student_count" />
                                            </button>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {institutes.map(inst => {
                                        const isSelected = selected.has(inst.institute_id);
                                        return (
                                            <tr key={inst.institute_id}
                                                onClick={() => toggleSelect(inst.institute_id)}
                                                className={`cursor-pointer transition-colors ${isSelected ? 'bg-primary/10' : ''}`}>
                                                <td className="text-center">
                                                    {isSelected
                                                        ? <CheckSquare size={16} className="text-primary mx-auto" />
                                                        : <Square size={16} className="text-base-content/30 mx-auto" />}
                                                </td>
                                                <td className="font-medium text-base-content">{inst.institute_name}</td>
                                                <td className="text-base-content/60">{inst.district || '—'}</td>
                                                <td className="text-base-content/60">{inst.type || '—'}</td>
                                                <td className="text-base-content/60">{inst.ownership || '—'}</td>
                                                <td className="text-right">
                                                    <span className="badge badge-success badge-sm font-semibold">
                                                        {inst.student_count}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Success toast */}
            {sentSuccess && (
                <div className="toast toast-end toast-bottom">
                    <div className="alert alert-success">
                        <span>✅ Job offers sent successfully!</span>
                        <button onClick={() => setSentSuccess(false)} className="btn btn-ghost btn-xs"><X size={14} /></button>
                    </div>
                </div>
            )}

            {/* Offer Modal */}
            <OfferModal
                isOpen={showModal}
                selectedIds={Array.from(selected)}
                institutesMap={institutesMap}
                filters={filters}
                qualOptions={qualOpts}
                programOptions={programOpts}
                streamOptions={streamOpts}
                onClose={() => setShowModal(false)}
                onSent={() => { setShowModal(false); setSentSuccess(true); setSelected(new Set()); }}
            />
        </div>
    );
}
