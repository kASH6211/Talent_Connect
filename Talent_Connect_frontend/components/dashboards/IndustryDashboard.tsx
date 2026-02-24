'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    Briefcase, ClipboardList, Factory, ArrowRight, CheckCircle2,
    Send, Clock, XCircle, Building2, Search, TrendingUp, Inbox
} from 'lucide-react';
import api from '@/lib/api';

interface SentOffer {
    offer_id: number;
    job_title: string;
    offer_date?: string;
    last_date?: string;
    status: string;
    salary_min?: number;
    salary_max?: number;
    institute?: { institute_name?: string };
}

const statusConfig: Record<string, { badge: string; icon: any }> = {
    Pending: { badge: 'badge-warning', icon: Clock },
    Accepted: { badge: 'badge-success', icon: CheckCircle2 },
    Rejected: { badge: 'badge-error', icon: XCircle },
    Withdrawn: { badge: 'badge-neutral', icon: XCircle },
};

const fmt = (n?: number) =>
    n ? `₹${(n / 100000).toFixed(1)}L` : null;

const salaryStr = (min?: number, max?: number) => {
    const mn = fmt(min); const mx = fmt(max);
    if (mn && mx) return `${mn} – ${mx}`;
    if (mn) return `From ${mn}`; if (mx) return `Up to ${mx}`;
    return null;
};

interface Stats {
    totalSent: number;
    accepted: number;
    pending: number;
    rejected: number;
    openRequests: number;
    totalInstitutesReached: number;
}

const actions = [
    { icon: Search, label: 'Find Institutes', description: 'Search institutes and send job offers', href: '/find-institutes', color: 'from-primary to-primary/70' },
    { icon: Send, label: 'Sent Offers', description: 'Track responses for all your sent offers', href: '/sent-offers', color: 'from-secondary to-secondary/70' },
    { icon: ClipboardList, label: 'My Requests', description: 'View and manage your campus / internship requests', href: '/industry-requests', color: 'from-warning to-warning/70' },
    { icon: CheckCircle2, label: 'Placements', description: 'See all placement records for your company', href: '/placements', color: 'from-success to-success/70' },
];

export default function IndustryDashboard({ username, industryName }: { username: string; industryName?: string }) {
    const [stats, setStats] = useState<Stats | null>(null);
    const [recentOffers, setRecentOffers] = useState<SentOffer[]>([]);
    const [loadingStats, setLoadingStats] = useState(true);
    const [loadingOffers, setLoadingOffers] = useState(true);

    useEffect(() => {
        Promise.all([
            api.get('/job-offer/sent').catch(() => ({ data: [] })),
            api.get('/industry-request').catch(() => ({ data: [] })),
        ]).then(([sentRes, reqRes]) => {
            const offers: SentOffer[] = Array.isArray(sentRes.data) ? sentRes.data : [];
            const requests: any[] = Array.isArray(reqRes.data) ? reqRes.data : [];

            const accepted = offers.filter(o => o.status === 'Accepted').length;
            const pending = offers.filter(o => o.status === 'Pending').length;
            const rejected = offers.filter(o => o.status === 'Rejected').length;

            const uniqueInstitutes = new Set(offers.map(o => o.institute?.institute_name).filter(Boolean)).size;

            setStats({
                totalSent: offers.length,
                accepted,
                pending,
                rejected,
                openRequests: requests.length,
                totalInstitutesReached: uniqueInstitutes,
            });

            // Show 5 most recent unique job titles
            const seen = new Set<string>();
            const recent: SentOffer[] = [];
            for (const o of offers) {
                if (!seen.has(o.job_title)) { seen.add(o.job_title); recent.push(o); }
                if (recent.length >= 5) break;
            }
            setRecentOffers(recent);
        }).finally(() => {
            setLoadingStats(false);
            setLoadingOffers(false);
        });
    }, []);

    const statCards = [
        {
            label: 'Offers Sent', value: stats?.totalSent, icon: Send,
            color: 'from-primary to-primary/70', note: 'total job offers', href: '/sent-offers',
        },
        {
            label: 'Accepted', value: stats?.accepted, icon: CheckCircle2,
            color: 'from-success to-success/70', note: 'institutes accepted', href: '/sent-offers',
        },
        {
            label: 'Pending', value: stats?.pending, icon: Clock,
            color: 'from-warning to-warning/70', note: 'awaiting response', href: '/sent-offers',
        },
        {
            label: 'Institutes Reached', value: stats?.totalInstitutesReached, icon: Building2,
            color: 'from-secondary to-secondary/70', note: 'unique institutes', href: '/find-institutes',
        },
    ];

    return (
        <div className="space-y-8">
            {/* Hero */}
            <div className="relative overflow-hidden p-7 rounded-2xl bg-gradient-to-br from-secondary/10 via-base-200 to-base-200 border border-secondary/20">
                <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary to-primary flex items-center justify-center shadow-xl">
                        <Factory size={28} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-base-content">Welcome, {username} 👋</h1>
                        <p className="text-secondary/80 text-sm mt-0.5">
                            Industry Portal · {industryName ?? 'Company Account'}
                        </p>
                    </div>
                </div>
                <p className="mt-4 text-base-content/60 text-sm leading-relaxed max-w-2xl">
                    Post placement drives, manage internship requests, and track your hiring activity across institutes.
                </p>
            </div>

            {/* Stats Cards */}
            <div>
                <h2 className="text-xs font-semibold text-base-content/50 uppercase tracking-widest mb-4">Overview</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {statCards.map(c => (
                        <Link key={c.label} href={c.href}
                            className="p-5 rounded-xl border border-base-300 bg-base-200 hover:border-primary/30 hover:bg-base-300 transition-all group">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center mb-3 shadow-lg`}>
                                <c.icon size={20} className="text-white" />
                            </div>
                            {loadingStats ? (
                                <div className="h-8 w-12 rounded-md bg-base-300 animate-pulse mb-1" />
                            ) : (
                                <div className="text-2xl font-bold text-base-content">
                                    {c.value !== undefined ? c.value : '—'}
                                </div>
                            )}
                            <div className="text-xs text-base-content/40 mt-0.5">{c.note}</div>
                            <div className="text-sm font-medium text-base-content/70 mt-0.5 group-hover:text-primary transition-colors">{c.label}</div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Offer Acceptance Strip */}
            {stats && stats.totalSent > 0 && (
                <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20 text-sm">
                        <CheckCircle2 size={13} className="text-success" />
                        <span className="font-semibold text-success">{stats.accepted}</span>
                        <span className="text-base-content/50">accepted</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-warning/10 border border-warning/20 text-sm">
                        <Clock size={13} className="text-warning" />
                        <span className="font-semibold text-warning">{stats.pending}</span>
                        <span className="text-base-content/50">pending</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-error/10 border border-error/20 text-sm">
                        <XCircle size={13} className="text-error" />
                        <span className="font-semibold text-error">{stats.rejected}</span>
                        <span className="text-base-content/50">rejected</span>
                    </div>
                    {stats.openRequests > 0 && (
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-base-300 border border-base-300 text-sm">
                            <ClipboardList size={13} className="text-base-content/60" />
                            <span className="font-semibold text-base-content">{stats.openRequests}</span>
                            <span className="text-base-content/50">open request{stats.openRequests !== 1 ? 's' : ''}</span>
                        </div>
                    )}
                </div>
            )}

            {/* Recent Sent Offers Preview */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xs font-semibold text-base-content/50 uppercase tracking-widest">Recent Sent Offers</h2>
                    <Link href="/sent-offers" className="text-xs text-primary hover:underline flex items-center gap-1">
                        View all <ArrowRight size={11} />
                    </Link>
                </div>

                {loadingOffers ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-16 rounded-xl bg-base-200 border border-base-300 animate-pulse" />
                        ))}
                    </div>
                ) : recentOffers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3 text-base-content/40 rounded-xl border border-base-300 bg-base-200">
                        <div className="w-12 h-12 rounded-2xl bg-base-300 flex items-center justify-center">
                            <Send size={22} className="text-base-content/30" />
                        </div>
                        <p className="text-sm">No offers sent yet.</p>
                        <Link href="/find-institutes" className="btn btn-primary btn-sm gap-2">
                            <Search size={13} /> Find Institutes
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {recentOffers.map(offer => {
                            const sc = statusConfig[offer.status] ?? statusConfig['Pending'];
                            const StatusIcon = sc.icon;
                            const salary = salaryStr(offer.salary_min, offer.salary_max);
                            return (
                                <div key={offer.offer_id}
                                    className="flex items-center gap-4 p-4 rounded-xl bg-base-200 border border-base-300 hover:border-primary/20 transition-colors">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-sm font-semibold text-base-content truncate">{offer.job_title}</span>
                                            <span className={`badge ${sc.badge} badge-sm gap-1`}>
                                                <StatusIcon size={9} />{offer.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 mt-0.5 text-xs text-base-content/50">
                                            <Building2 size={11} />
                                            <span>{offer.institute?.institute_name ?? 'Institute'}</span>
                                            {offer.offer_date && <span className="text-base-content/30">· {offer.offer_date}</span>}
                                        </div>
                                    </div>
                                    <div className="flex-shrink-0 text-right">
                                        {salary && <div className="text-sm font-semibold text-success">{salary}</div>}
                                        {offer.last_date && (
                                            <div className="text-xs text-base-content/40">Due: <span className="text-warning">{offer.last_date}</span></div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-xs font-semibold text-base-content/50 uppercase tracking-widest mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {actions.map(a => (
                        <Link key={a.href + a.label} href={a.href}
                            className="p-5 rounded-xl border border-base-300 bg-base-200 hover:border-primary/30 hover:bg-base-300 hover:scale-[1.02] transition-all group">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${a.color} flex items-center justify-center mb-3 shadow-lg`}>
                                <a.icon size={20} className="text-white" />
                            </div>
                            <div className="text-sm font-semibold text-base-content">{a.label}</div>
                            <p className="text-xs text-base-content/50 mt-1 leading-relaxed">{a.description}</p>
                            <div className="mt-3 flex items-center gap-1 text-xs text-base-content/30 group-hover:text-primary transition-colors">
                                Open <ArrowRight size={12} />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Info box */}
            <div className="p-4 rounded-xl bg-base-200 border border-base-300 text-sm text-base-content/50">
                <span className="text-base-content/70 font-medium">Note:</span> You are viewing data scoped to your company.
                Contact your administrator for any additional access.
            </div>
        </div>
    );
}
