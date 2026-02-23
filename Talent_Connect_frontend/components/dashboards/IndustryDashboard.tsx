'use client';

import Link from 'next/link';
import { Briefcase, ClipboardList, Factory, ArrowRight, CheckCircle2 } from 'lucide-react';

const actions = [
    {
        icon: Briefcase,
        label: 'View Placements',
        description: 'See all placement records for your company',
        href: '/placements',
        color: 'from-primary to-primary/70',
    },
    {
        icon: ClipboardList,
        label: 'My Requests',
        description: 'View and manage your campus / internship requests',
        href: '/industry-requests',
        color: 'from-secondary to-secondary/70',
    },
    {
        icon: CheckCircle2,
        label: 'Submit New Request',
        description: 'Post a new campus placement or internship drive',
        href: '/industry-requests',
        color: 'from-success to-success/70',
    },
];

export default function IndustryDashboard({ username, industryName }: { username: string; industryName?: string }) {
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

            {/* Summary Cards */}
            <div>
                <h2 className="text-xs font-semibold text-base-content/50 uppercase tracking-widest mb-4">Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { label: 'Active Placements', icon: Briefcase, color: 'from-primary to-primary/70', note: 'students placed' },
                        { label: 'Open Requests', icon: ClipboardList, color: 'from-secondary to-secondary/70', note: 'pending approval' },
                        { label: 'Completed Drives', icon: CheckCircle2, color: 'from-success to-success/70', note: 'completed requests' },
                    ].map(c => (
                        <div key={c.label} className="p-5 rounded-xl border border-base-300 bg-base-200">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center mb-3 shadow-lg`}>
                                <c.icon size={20} className="text-white" />
                            </div>
                            <div className="text-2xl font-bold text-base-content">—</div>
                            <div className="text-xs text-base-content/40 mt-1">{c.note}</div>
                            <div className="text-sm font-medium text-base-content/70 mt-0.5">{c.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Action Cards */}
            <div>
                <h2 className="text-xs font-semibold text-base-content/50 uppercase tracking-widest mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {actions.map(a => (
                        <Link key={`${a.href}-${a.label}`} href={a.href}
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
