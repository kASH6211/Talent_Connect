'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2, Send, ChevronDown, ChevronRight, X, AlertCircle, CheckCircle2, Clock, Ban } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

// ─── Types ────────────────────────────────────────────────────────────────────

interface OfferRecord {
    offer_id: number;
    job_title: string;
    job_description?: string;
    salary_min?: number;
    salary_max?: number;
    offer_date: string;
    last_date?: string;
    status: 'Pending' | 'Accepted' | 'Rejected' | 'Withdrawn';
    institute: {
        institute_id: number;
        institute_name: string;
        emailId?: string;
        mobileno?: string;
    };
    industry: { industry_name: string };
}

interface OfferGroup {
    key: string;
    job_title: string;
    job_description?: string;
    salary_min?: number;
    salary_max?: number;
    offer_date: string;
    last_date?: string;
    rows: OfferRecord[];
    accepted: number;
    rejected: number;
    pending: number;
    withdrawn: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<string, string> = {
    Accepted: 'badge-success',
    Pending: 'badge-warning',
    Rejected: 'badge-error',
    Withdrawn: 'badge-neutral',
};

const STATUS_ICON: Record<string, any> = {
    Accepted: CheckCircle2,
    Pending: Clock,
    Rejected: Ban,
    Withdrawn: X,
};

function StatusBadge({ status }: { status: string }) {
    const cls = STATUS_BADGE[status] ?? 'badge-warning';
    const Icon = STATUS_ICON[status] ?? Clock;
    return (
        <span className={`badge ${cls} gap-1.5`}>
            <Icon size={10} /> {status}
        </span>
    );
}

function fmt(n?: number) {
    if (!n) return '—';
    return '₹' + (n >= 100000 ? (n / 100000).toFixed(1) + 'L' : (n / 1000).toFixed(0) + 'K');
}

function groupOffers(offers: OfferRecord[]): OfferGroup[] {
    const map = new Map<string, OfferGroup>();
    for (const o of offers) {
        const key = `${o.job_title}__${o.offer_date}`;
        if (!map.has(key)) {
            map.set(key, {
                key, job_title: o.job_title,
                job_description: o.job_description,
                salary_min: o.salary_min, salary_max: o.salary_max,
                offer_date: o.offer_date, last_date: o.last_date,
                rows: [], accepted: 0, rejected: 0, pending: 0, withdrawn: 0,
            });
        }
        const g = map.get(key)!;
        g.rows.push(o);
        if (o.status === 'Accepted') g.accepted++;
        else if (o.status === 'Rejected') g.rejected++;
        else if (o.status === 'Withdrawn') g.withdrawn++;
        else g.pending++;
    }
    return [...map.values()];
}

// ─── Stat Button ─────────────────────────────────────────────────────────────

function StatCard({ label, count, badgeCls, onClick, active }: {
    label: string; count: number; badgeCls: string; onClick: () => void; active: boolean;
}) {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center justify-center px-5 py-4 rounded-xl border transition-all duration-200
                bg-base-200 hover:bg-base-300 hover:scale-[1.02]
                ${active ? 'border-primary ring-2 ring-primary/30 shadow-lg scale-[1.02]' : 'border-base-300 opacity-80 hover:opacity-100'}`}
        >
            <span className={`badge ${badgeCls} badge-lg rounded-lg font-bold text-lg mb-1`}>{count}</span>
            <span className="text-xs font-medium text-base-content/60">{label}</span>
        </button>
    );
}

// ─── Offer Group Card ─────────────────────────────────────────────────────────

function OfferGroupCard({ group, onWithdraw }: { group: OfferGroup; onWithdraw: (id: number) => void }) {
    const [open, setOpen] = useState(true);
    const [withdrawing, setWithdrawing] = useState<number | null>(null);

    const handleWithdraw = async (offerId: number) => {
        setWithdrawing(offerId);
        try {
            await api.patch(`/job-offer/${offerId}/status`, { status: 'Withdrawn' });
            onWithdraw(offerId);
        } finally {
            setWithdrawing(null);
        }
    };

    const salary = (group.salary_min || group.salary_max)
        ? `${fmt(group.salary_min)} – ${fmt(group.salary_max)} / yr`
        : null;

    return (
        <div className="rounded-2xl bg-base-200 border border-base-300 overflow-hidden hover:border-primary/20 transition-colors">
            {/* Card header — click to expand/collapse */}
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-start gap-4 px-5 py-4 hover:bg-base-300/50 transition-colors text-left"
            >
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <Send size={14} className="text-primary flex-shrink-0" />
                        <h3 className="font-semibold text-base-content truncate">{group.job_title}</h3>
                        {salary && (
                            <span className="badge badge-ghost badge-sm font-mono flex-shrink-0">{salary}</span>
                        )}
                    </div>
                    <p className="text-xs text-base-content/40 mt-1">
                        Sent {group.offer_date}
                        {group.last_date && <span> · Apply by: <span className="text-warning">{group.last_date}</span></span>}
                        {' '}· <span className="text-base-content/60">{group.rows.length} institute{group.rows.length !== 1 ? 's' : ''}</span>
                    </p>
                    {group.job_description && (
                        <p className="text-xs text-base-content/40 mt-1 line-clamp-1">{group.job_description}</p>
                    )}
                </div>

                {/* Mini status pills */}
                <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                    {group.accepted > 0 && <span className="badge badge-success badge-sm">{group.accepted} Accepted</span>}
                    {group.pending > 0 && <span className="badge badge-warning badge-sm">{group.pending} Pending</span>}
                    {group.rejected > 0 && <span className="badge badge-error badge-sm">{group.rejected} Rejected</span>}
                    {group.withdrawn > 0 && <span className="badge badge-neutral badge-sm">{group.withdrawn} Withdrawn</span>}
                    {open
                        ? <ChevronDown size={16} className="text-base-content/30 ml-1" />
                        : <ChevronRight size={16} className="text-base-content/30 ml-1" />}
                </div>
            </button>

            {/* Per-institute rows */}
            {open && (
                <div className="border-t border-base-300">
                    <table className="table table-zebra w-full text-sm">
                        <thead className="text-xs uppercase tracking-wider">
                            <tr>
                                <th>Institute</th>
                                <th>Contact Info</th>
                                <th>Status</th>
                                <th className="text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {group.rows.map(row => (
                                <tr key={row.offer_id}>
                                    <td className="font-medium text-base-content">
                                        {row.institute?.institute_name ?? `Institute #${row.offer_id}`}
                                    </td>
                                    <td>
                                        <div className="flex flex-col gap-0.5">
                                            {row.institute?.emailId && (
                                                <span className="text-[10px] text-base-content/60 lowercase">{row.institute.emailId}</span>
                                            )}
                                            {row.institute?.mobileno && (
                                                <span className="text-[10px] text-base-content/60">{row.institute.mobileno}</span>
                                            )}
                                            {!row.institute?.emailId && !row.institute?.mobileno && (
                                                <span className="text-[10px] text-base-content/30 italic">No contact info</span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <StatusBadge status={row.status} />
                                    </td>
                                    <td className="text-right">
                                        {row.status === 'Pending' && (
                                            <button
                                                onClick={() => handleWithdraw(row.offer_id)}
                                                disabled={withdrawing === row.offer_id}
                                                className="btn btn-outline btn-error btn-xs gap-1.5"
                                            >
                                                {withdrawing === row.offer_id
                                                    ? <Loader2 size={11} className="animate-spin" />
                                                    : <X size={11} />}
                                                Withdraw
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SentOffersPage() {
    const { isIndustry } = useAuth();
    const [offers, setOffers] = useState<OfferRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState<'All' | 'Accepted' | 'Pending' | 'Rejected'>('All');

    const fetchOffers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/job-offer/sent');
            setOffers(res.data ?? []);
        } catch {
            setError('Failed to load sent offers.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchOffers(); }, [fetchOffers]);

    const handleWithdraw = (offerId: number) => {
        setOffers(prev => prev.map(o => o.offer_id === offerId ? { ...o, status: 'Withdrawn' } : o));
    };

    const total = offers.length;
    const accepted = offers.filter(o => o.status === 'Accepted').length;
    const pending = offers.filter(o => o.status === 'Pending').length;
    const rejected = offers.filter(o => o.status === 'Rejected').length;

    const filteredOffers = offers.filter(o => filter === 'All' || o.status === filter);
    const groups = groupOffers(filteredOffers);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-base-content">Sent Job Offers</h1>
                <p className="text-base-content/50 text-sm mt-1">Track responses from institutes for every offer you&apos;ve sent.</p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-24 text-base-content/40">
                    <Loader2 className="animate-spin mr-2" size={22} /> Loading offers…
                </div>
            ) : error ? (
                <div className="alert alert-error text-sm">
                    <AlertCircle size={16} /> {error}
                </div>
            ) : offers.length === 0 ? (
                <div className="py-24 text-center text-base-content/40 text-sm">
                    <div className="w-16 h-16 rounded-2xl bg-base-200 border border-base-300 flex items-center justify-center mx-auto mb-4">
                        <Send size={28} className="text-base-content/30" />
                    </div>
                    No offers sent yet. Use{' '}
                    <a href="/find-institutes" className="text-primary underline underline-offset-2">Find Institutes</a>{' '}
                    to get started.
                </div>
            ) : (
                <>
                    {/* Summary stat cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <StatCard label="Total Sent" count={total} badgeCls="badge-neutral" onClick={() => setFilter('All')} active={filter === 'All'} />
                        <StatCard label="Accepted" count={accepted} badgeCls="badge-success" onClick={() => setFilter('Accepted')} active={filter === 'Accepted'} />
                        <StatCard label="Pending" count={pending} badgeCls="badge-warning" onClick={() => setFilter('Pending')} active={filter === 'Pending'} />
                        <StatCard label="Not Interested" count={rejected} badgeCls="badge-error" onClick={() => setFilter('Rejected')} active={filter === 'Rejected'} />
                    </div>

                    {/* Per-batch offer cards */}
                    <div className="space-y-4">
                        {groups.length === 0 ? (
                            <div className="text-center py-12 text-base-content/40 text-sm">
                                No {filter !== 'All' ? filter.toLowerCase() : ''} offers found.
                            </div>
                        ) : (
                            groups.map(g => (
                                <OfferGroupCard key={g.key} group={g} onWithdraw={handleWithdraw} />
                            ))
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
