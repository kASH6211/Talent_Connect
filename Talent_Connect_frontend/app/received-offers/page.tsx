'use client';

import { useEffect, useState } from 'react';
import {
    Loader2, CheckCircle2, XCircle, Clock, Building2,
    Send, CalendarDays, CalendarClock, FileText, Users2,
    Banknote, BadgeCheck, MailOpen
} from 'lucide-react';
import api from '@/lib/api';

interface Offer {
    offer_id: number;
    job_title: string;
    job_description?: string;
    salary_min?: number;
    salary_max?: number;
    offer_date?: string;
    last_date?: string;
    number_of_posts?: number;
    status: string;
    required_qualification_ids?: string;
    required_program_ids?: string;
    required_stream_ids?: string;
    industry?: { industry_name?: string; email?: string };
}

const statusConfig: Record<string, { badge: string; icon: any; label: string; ring: string }> = {
    Pending: { badge: 'badge-warning', icon: Clock, label: 'Pending', ring: 'border-warning/30' },
    Accepted: { badge: 'badge-success', icon: CheckCircle2, label: 'Accepted', ring: 'border-success/30' },
    Rejected: { badge: 'badge-error', icon: XCircle, label: 'Rejected', ring: 'border-error/20' },
    Withdrawn: { badge: 'badge-neutral', icon: XCircle, label: 'Withdrawn', ring: 'border-base-300' },
};

export default function ReceivedOffersPage() {
    const [offers, setOffers] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<number | null>(null);
    const [filter, setFilter] = useState<string>('All');

    const load = async () => {
        setLoading(true);
        try {
            const res = await api.get('/job-offer/received');
            setOffers(res.data);
        } catch { setOffers([]); }
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const updateStatus = async (offer_id: number, status: string) => {
        setUpdating(offer_id);
        try {
            await api.patch(`/job-offer/${offer_id}/status`, { status });
            setOffers(prev => prev.map(o => o.offer_id === offer_id ? { ...o, status } : o));
        } catch { }
        setUpdating(null);
    };

    const fmt = (n?: number) => n ? `₹${(n / 100000).toFixed(1)}L` : null;
    const salaryStr = (min?: number, max?: number) => {
        const mn = fmt(min); const mx = fmt(max);
        if (mn && mx) return `${mn} – ${mx} per annum`;
        if (mn) return `From ${mn} per annum`;
        if (mx) return `Up to ${mx} per annum`;
        return null;
    };

    const formatDate = (d?: string) => {
        if (!d) return null;
        try {
            return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
        } catch { return d; }
    };

    const tabs = ['All', 'Pending', 'Accepted', 'Rejected', 'Withdrawn'];
    const counts = tabs.reduce((acc, t) => ({
        ...acc,
        [t]: t === 'All' ? offers.length : offers.filter(o => o.status === t).length
    }), {} as Record<string, number>);

    const filtered = filter === 'All' ? offers : offers.filter(o => o.status === filter);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-base-content flex items-center gap-2">
                        <MailOpen size={22} className="text-primary" />
                        Received Job Offers
                    </h1>
                    <p className="text-base-content/50 text-sm mt-1">
                        Job offers sent to your institute by industry partners.
                    </p>
                </div>
                {!loading && offers.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                        {[
                            { s: 'Pending', cls: 'badge-warning' },
                            { s: 'Accepted', cls: 'badge-success' },
                            { s: 'Rejected', cls: 'badge-error' },
                        ].map(({ s, cls }) => counts[s] > 0 && (
                            <span key={s} className={`badge ${cls} badge-sm`}>{counts[s]} {s}</span>
                        ))}
                    </div>
                )}
            </div>

            {/* Filter Tabs */}
            {!loading && offers.length > 0 && (
                <div className="flex gap-2 flex-wrap border-b border-base-300 pb-3">
                    {tabs.map(t => (
                        <button
                            key={t}
                            onClick={() => setFilter(t)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === t
                                    ? 'bg-primary text-primary-content'
                                    : 'bg-base-200 text-base-content/60 hover:bg-base-300'
                                }`}
                        >
                            {t}
                            {counts[t] > 0 && (
                                <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${filter === t ? 'bg-primary-content/20' : 'bg-base-300'
                                    }`}>
                                    {counts[t]}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            )}

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-48 rounded-2xl bg-base-200 border border-base-300 animate-pulse" />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4 text-base-content/40">
                    <div className="w-16 h-16 rounded-2xl bg-base-200 border border-base-300 flex items-center justify-center">
                        <Send size={28} className="text-base-content/30" />
                    </div>
                    <p className="text-sm">
                        {filter === 'All' ? 'No job offers received yet.' : `No ${filter.toLowerCase()} offers.`}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map(offer => {
                        const sc = statusConfig[offer.status] ?? statusConfig['Pending'];
                        const StatusIcon = sc.icon;
                        const salary = salaryStr(offer.salary_min, offer.salary_max);
                        const isPending = offer.status === 'Pending';

                        return (
                            <div key={offer.offer_id}
                                className={`rounded-2xl bg-base-200 border ${sc.ring} border transition-colors hover:shadow-md`}>

                                {/* Card Header */}
                                <div className="p-5 pb-4">
                                    <div className="flex items-start justify-between gap-4 flex-wrap">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <h2 className="text-lg font-bold text-base-content">{offer.job_title}</h2>
                                                <span className={`badge ${sc.badge} gap-1.5`}>
                                                    <StatusIcon size={10} /> {sc.label}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-1.5 text-sm text-base-content/50">
                                                <Building2 size={13} />
                                                <span className="font-medium">{offer.industry?.industry_name ?? 'Industry'}</span>
                                                {offer.industry?.email && (
                                                    <span className="text-base-content/30">· {offer.industry.email}</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Offer ID badge */}
                                        <span className="text-xs text-base-content/30 bg-base-300 px-2.5 py-1 rounded-full">
                                            Offer #{offer.offer_id}
                                        </span>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="border-t border-base-300 mx-5" />

                                {/* Detail Grid */}
                                <div className="px-5 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4">

                                    {/* Offer Date */}
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-1.5 text-xs text-base-content/40">
                                            <CalendarDays size={11} /> Offer Date
                                        </div>
                                        <div className="text-sm font-semibold text-base-content">
                                            {formatDate(offer.offer_date) ?? <span className="text-base-content/30 font-normal">—</span>}
                                        </div>
                                    </div>

                                    {/* Apply By */}
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-1.5 text-xs text-base-content/40">
                                            <CalendarClock size={11} /> Apply By
                                        </div>
                                        <div className={`text-sm font-semibold ${offer.last_date ? 'text-warning' : 'text-base-content/30 font-normal'}`}>
                                            {formatDate(offer.last_date) ?? '—'}
                                        </div>
                                    </div>

                                    {/* Number of Posts */}
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-1.5 text-xs text-base-content/40">
                                            <Users2 size={11} /> No. of Posts
                                        </div>
                                        <div className="text-sm font-semibold text-base-content">
                                            {offer.number_of_posts
                                                ? <span>{offer.number_of_posts} {offer.number_of_posts === 1 ? 'post' : 'posts'}</span>
                                                : <span className="text-base-content/30 font-normal">—</span>}
                                        </div>
                                    </div>

                                    {/* Salary */}
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-1.5 text-xs text-base-content/40">
                                            <Banknote size={11} /> Salary
                                        </div>
                                        <div className={`text-sm font-semibold ${salary ? 'text-success' : 'text-base-content/30 font-normal'}`}>
                                            {salary ?? '—'}
                                        </div>
                                    </div>
                                </div>

                                {/* Job Description */}
                                {offer.job_description && (
                                    <>
                                        <div className="border-t border-base-300 mx-5" />
                                        <div className="px-5 py-4">
                                            <div className="flex items-center gap-1.5 text-xs text-base-content/40 mb-2">
                                                <FileText size={11} /> Job Description
                                            </div>
                                            <p className="text-sm text-base-content/70 leading-relaxed whitespace-pre-wrap">
                                                {offer.job_description}
                                            </p>
                                        </div>
                                    </>
                                )}

                                {/* Requirements chips */}
                                {(offer.required_qualification_ids || offer.required_program_ids || offer.required_stream_ids) && (
                                    <>
                                        <div className="border-t border-base-300 mx-5" />
                                        <div className="px-5 py-3 flex flex-wrap gap-2">
                                            {offer.required_qualification_ids && (
                                                <span className="badge badge-outline badge-sm gap-1">
                                                    <BadgeCheck size={9} /> Qualifications specified
                                                </span>
                                            )}
                                            {offer.required_program_ids && (
                                                <span className="badge badge-outline badge-sm gap-1">
                                                    <BadgeCheck size={9} /> Programs specified
                                                </span>
                                            )}
                                            {offer.required_stream_ids && (
                                                <span className="badge badge-outline badge-sm gap-1">
                                                    <BadgeCheck size={9} /> Streams specified
                                                </span>
                                            )}
                                        </div>
                                    </>
                                )}

                                {/* Action buttons */}
                                {isPending && (
                                    <>
                                        <div className="border-t border-base-300 mx-5" />
                                        <div className="px-5 py-4 flex items-center gap-3">
                                            <button
                                                onClick={() => updateStatus(offer.offer_id, 'Accepted')}
                                                disabled={updating === offer.offer_id}
                                                className="btn btn-success btn-sm gap-2">
                                                {updating === offer.offer_id
                                                    ? <Loader2 size={13} className="animate-spin" />
                                                    : <CheckCircle2 size={13} />}
                                                Accept Offer
                                            </button>
                                            <button
                                                onClick={() => updateStatus(offer.offer_id, 'Rejected')}
                                                disabled={updating === offer.offer_id}
                                                className="btn btn-outline btn-error btn-sm gap-2">
                                                {updating === offer.offer_id
                                                    ? <Loader2 size={13} className="animate-spin" />
                                                    : <XCircle size={13} />}
                                                Reject Offer
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
