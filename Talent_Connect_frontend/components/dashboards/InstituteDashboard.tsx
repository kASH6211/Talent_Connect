'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    Users, Briefcase, ClipboardList, Building2, ArrowRight,
    CheckCircle2, XCircle, Clock, Send, TrendingUp, Inbox
} from 'lucide-react';
import api from '@/lib/api';

interface Offer {
    offer_id: number;
    job_title: string;
    salary_min?: number;
    salary_max?: number;
    offer_date?: string;
    last_date?: string;
    status: string;
    industry?: { industry_name?: string };
}

const statusConfig: Record<string, { badge: string; icon: any; label: string }> = {
    Pending: { badge: 'badge-warning', icon: Clock, label: 'Pending' },
    Accepted: { badge: 'badge-success', icon: CheckCircle2, label: 'Accepted' },
    Rejected: { badge: 'badge-error', icon: XCircle, label: 'Rejected' },
    Withdrawn: { badge: 'badge-neutral', icon: XCircle, label: 'Withdrawn' },
};

const fmt = (n?: number) => n ? `₹${(n / 100000).toFixed(1)}L` : null;
const salaryStr = (min?: number, max?: number) => {
    const mn = fmt(min); const mx = fmt(max);
    if (mn && mx) return `${mn} – ${mx}`;
    if (mn) return `From ${mn}`; if (mx) return `Up to ${mx}`;
    return null;
};

interface Stats {
    students: number;
    placements: number;
    pendingRequests: number;
    receivedOffers: number;
    pendingOffers: number;
    acceptedOffers: number;
}

export default function InstituteDashboard({ username, instituteName }: { username: string; instituteName?: string }) {
    const [stats, setStats] = useState<Stats | null>(null);
    const [recentOffers, setRecentOffers] = useState<Offer[]>([]);
    const [loadingStats, setLoadingStats] = useState(true);
    const [loadingOffers, setLoadingOffers] = useState(true);

    useEffect(() => {
        // Fetch stats in parallel
        Promise.all([
            api.get('/student').catch(() => ({ data: [] })),
            api.get('/student-placement').catch(() => ({ data: [] })),
            api.get('/industry-request').catch(() => ({ data: [] })),
            api.get('/job-offer/received').catch(() => ({ data: [] })),
        ]).then(([studRes, placRes, reqRes, offerRes]) => {
            const students = Array.isArray(studRes.data) ? studRes.data.length
                : (studRes.data?.total ?? studRes.data?.data?.length ?? 0);
            const placements = Array.isArray(placRes.data) ? placRes.data.length : 0;
            const allRequests = Array.isArray(reqRes.data) ? reqRes.data : [];
            const pendingRequests = allRequests.filter((r: any) =>
                r.status?.toLowerCase() === 'pending' || !r.status).length;
            const offers: Offer[] = Array.isArray(offerRes.data) ? offerRes.data : [];
            setStats({
                students,
                placements,
                pendingRequests,
                receivedOffers: offers.length,
                pendingOffers: offers.filter(o => o.status === 'Pending').length,
                acceptedOffers: offers.filter(o => o.status === 'Accepted').length,
            });
            setRecentOffers(offers.slice(0, 5));
        }).finally(() => {
            setLoadingStats(false);
            setLoadingOffers(false);
        });
    }, []);

    const statCards = [
        {
            label: 'My Students', value: stats?.students, icon: Users,
            color: 'from-success to-success/70', note: 'enrolled students', href: '/students'
        },
        {
            label: 'Placements', value: stats?.placements, icon: TrendingUp,
            color: 'from-primary to-primary/70', note: 'placed students', href: '/placements'
        },
        {
            label: 'Industry Requests', value: stats?.pendingRequests, icon: ClipboardList,
            color: 'from-warning to-warning/70', note: 'pending requests', href: '/industry-requests'
        },
        {
            label: 'Received Offers', value: stats?.receivedOffers, icon: Inbox,
            color: 'from-secondary to-secondary/70', note: 'job offers received', href: '/received-offers'
        },
    ];

    const actions = [
        { icon: Users, label: 'View My Students', description: 'Browse students enrolled at your institute', href: '/students', color: 'from-success to-success/70' },
        { icon: Briefcase, label: 'View Placements', description: 'Track placement records for your students', href: '/placements', color: 'from-primary to-primary/70' },
        { icon: ClipboardList, label: 'Industry Requests', description: 'Manage campus placement & internship requests', href: '/industry-requests', color: 'from-warning to-warning/70' },
        { icon: Send, label: 'Received Offers', description: 'Accept or reject job offers from industries', href: '/received-offers', color: 'from-secondary to-secondary/70' },
    ];

    return (
        <div className="space-y-8">
            {/* Hero */}
            <div className="relative overflow-hidden p-7 rounded-2xl bg-gradient-to-br from-success/10 via-base-200 to-base-200 border border-success/20">
                <div className="absolute top-0 right-0 w-64 h-64 bg-success/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-success to-success/70 flex items-center justify-center shadow-xl">
                        <Building2 size={28} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-base-content">Welcome, {username} 👋</h1>
                        <p className="text-success/80 text-sm mt-0.5">
                            Institute Portal · {instituteName ?? 'Institute Account'}
                        </p>
                    </div>
                </div>
                <p className="mt-4 text-base-content/60 text-sm leading-relaxed max-w-2xl">
                    Manage your students, track placement outcomes, and handle industry collaboration requests from this portal.
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

            {/* Offer Breakdown Mini Strip */}
            {stats && stats.receivedOffers > 0 && (
                <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-warning/10 border border-warning/20 text-sm">
                        <Clock size={13} className="text-warning" />
                        <span className="font-semibold text-warning">{stats.pendingOffers}</span>
                        <span className="text-base-content/50">pending offer{stats.pendingOffers !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20 text-sm">
                        <CheckCircle2 size={13} className="text-success" />
                        <span className="font-semibold text-success">{stats.acceptedOffers}</span>
                        <span className="text-base-content/50">accepted offer{stats.acceptedOffers !== 1 ? 's' : ''}</span>
                    </div>
                </div>
            )}

            {/* Recent Received Offers */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xs font-semibold text-base-content/50 uppercase tracking-widest">Recent Received Offers</h2>
                    <Link href="/received-offers" className="text-xs text-primary hover:underline flex items-center gap-1">
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
                        <div className="w-12 h-12 rounded-2xl bg-base-300 border border-base-300 flex items-center justify-center">
                            <Send size={22} className="text-base-content/30" />
                        </div>
                        <p className="text-sm">No job offers received yet.</p>
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
                                                <StatusIcon size={9} />{sc.label}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 mt-0.5 text-xs text-base-content/50">
                                            <Building2 size={11} />
                                            <span>{offer.industry?.industry_name ?? 'Industry'}</span>
                                            {offer.offer_date && <span className="text-base-content/30">· {offer.offer_date}</span>}
                                        </div>
                                    </div>
                                    <div className="flex-shrink-0 text-right">
                                        {salary && (
                                            <div className="text-sm font-semibold text-success">{salary}</div>
                                        )}
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
                        <Link key={a.href} href={a.href}
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
                <span className="text-base-content/70 font-medium">Note:</span> You are viewing data scoped to your institute.
                Contact your administrator if you need access to other modules.
            </div>
        </div>
    );
}
