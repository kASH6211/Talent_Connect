'use client';

import { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, XCircle, Clock, Building2, Send } from 'lucide-react';
import api from '@/lib/api';

interface Offer {
    offer_id: number;
    job_title: string;
    job_description?: string;
    salary_min?: number;
    salary_max?: number;
    offer_date?: string;
    last_date?: string;
    status: string;
    required_qualification_ids?: string;
    required_program_ids?: string;
    required_stream_ids?: string;
    industry?: { industry_name?: string; email?: string };
}

const statusConfig: Record<string, { badge: string; icon: any; label: string }> = {
    Pending: { badge: 'badge-warning', icon: Clock, label: 'Pending' },
    Accepted: { badge: 'badge-success', icon: CheckCircle2, label: 'Accepted' },
    Rejected: { badge: 'badge-error', icon: XCircle, label: 'Rejected' },
    Withdrawn: { badge: 'badge-neutral', icon: XCircle, label: 'Withdrawn' },
};

export default function ReceivedOffersPage() {
    const [offers, setOffers] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<number | null>(null);

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
        if (mn && mx) return `${mn} – ${mx}`;
        if (mn) return `From ${mn}`; if (mx) return `Up to ${mx}`;
        return null;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-base-content">Received Job Offers</h1>
                <p className="text-base-content/50 text-sm mt-1">Job offers sent to your institute by industry partners.</p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-24 text-base-content/40">
                    <Loader2 className="animate-spin mr-2" size={20} /> Loading offers…
                </div>
            ) : offers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4 text-base-content/40">
                    <div className="w-16 h-16 rounded-2xl bg-base-200 border border-base-300 flex items-center justify-center">
                        <Send size={28} className="text-base-content/30" />
                    </div>
                    <p className="text-sm">No job offers received yet.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {offers.map(offer => {
                        const sc = statusConfig[offer.status] ?? statusConfig['Pending'];
                        const StatusIcon = sc.icon;
                        const salary = salaryStr(offer.salary_min, offer.salary_max);
                        const isPending = offer.status === 'Pending';

                        return (
                            <div key={offer.offer_id} className="p-5 rounded-2xl bg-base-200 border border-base-300 space-y-3 hover:border-primary/20 transition-colors">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <h2 className="text-base font-bold text-base-content">{offer.job_title}</h2>
                                            <span className={`badge ${sc.badge} gap-1.5`}>
                                                <StatusIcon size={10} /> {sc.label}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1 text-sm text-base-content/50">
                                            <Building2 size={13} />
                                            <span>{offer.industry?.industry_name ?? 'Industry'}</span>
                                            {offer.industry?.email && <span className="text-base-content/30">· {offer.industry.email}</span>}
                                        </div>
                                    </div>

                                    {/* Salary */}
                                    {salary && (
                                        <div className="flex-shrink-0 text-right">
                                            <div className="text-xs text-base-content/40">Salary</div>
                                            <div className="text-sm font-semibold text-success">{salary}</div>
                                        </div>
                                    )}
                                </div>

                                {offer.job_description && (
                                    <p className="text-sm text-base-content/60 leading-relaxed">{offer.job_description}</p>
                                )}

                                <div className="flex items-center gap-6 text-xs text-base-content/40">
                                    {offer.offer_date && <span>Offered: <span className="text-base-content/60">{offer.offer_date}</span></span>}
                                    {offer.last_date && <span>Apply by: <span className="text-warning font-medium">{offer.last_date}</span></span>}
                                </div>

                                {/* Action buttons for pending offers */}
                                {isPending && (
                                    <div className="flex items-center gap-3 pt-1">
                                        <button
                                            onClick={() => updateStatus(offer.offer_id, 'Accepted')}
                                            disabled={updating === offer.offer_id}
                                            className="btn btn-success btn-sm gap-2">
                                            {updating === offer.offer_id ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                                            Accept
                                        </button>
                                        <button
                                            onClick={() => updateStatus(offer.offer_id, 'Rejected')}
                                            disabled={updating === offer.offer_id}
                                            className="btn btn-outline btn-error btn-sm gap-2">
                                            {updating === offer.offer_id ? <Loader2 size={13} className="animate-spin" /> : <XCircle size={13} />}
                                            Reject
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
