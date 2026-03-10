"use client";

import { useState, useEffect } from "react";
import {
    Users,
    Building2,
    Factory,
    Send,
    MessageSquare,
    CheckCircle2,
    XCircle,
    PlayCircle,
    Clock,
    ChevronRight,
    TrendingUp
} from "lucide-react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import clsx from "clsx";

interface Stats {
    totalEOI: number;
    discussed: number;
    accepted: number;
    rejected: number;
    initiated: number;
    pending: number;
    completed: number;
    totalInstitutes: number;
    totalIndustries: number;
    totalStudentsOnRoll: number;
    studentsAvailableForPlacement: number;
}

export default function DeptAdminDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await api.get("/dashboard/stats");
                setStats(res.data);
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    const StatTile = ({
        label,
        value,
        icon: Icon,
        colorClass,
        onClick
    }: {
        label: string;
        value: number;
        icon: any;
        colorClass: string;
        onClick?: () => void
    }) => (
        <div
            onClick={onClick}
            className={clsx(
                "relative overflow-hidden rounded-2xl p-6 border border-slate-200 bg-white cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group",
                onClick && "active:scale-95"
            )}
        >
            <div className="flex items-center justify-between mb-4">
                <div className={clsx("p-3 rounded-xl", colorClass)}>
                    <Icon size={24} className="text-current" />
                </div>
                <div className="flex items-center gap-1 text-slate-400 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    View Details <ChevronRight size={14} />
                </div>
            </div>
            <div>
                <h3 className="text-3xl font-bold text-slate-900 mb-1">
                    {loading ? "..." : value.toLocaleString()}
                </h3>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                    {label}
                </p>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                <Icon size={120} />
            </div>
        </div>
    );

    if (loading && !stats) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Department Dashboard</h1>
                <p className="text-slate-500 mt-1">Real-time placement and interaction statistics across Punjab.</p>
            </div>

            {/* Main Stats (EOI Statuses) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatTile
                    label="Total EOI"
                    value={stats?.totalEOI || 0}
                    icon={Send}
                    colorClass="bg-blue-50 text-blue-600"
                    onClick={() => router.push("/all-requests")}
                />
                <StatTile
                    label="Discussed"
                    value={stats?.discussed || 0}
                    icon={MessageSquare}
                    colorClass="bg-amber-50 text-amber-600"
                    onClick={() => router.push("/all-requests?status=Discussed")}
                />
                <StatTile
                    label="Accepted"
                    value={stats?.accepted || 0}
                    icon={CheckCircle2}
                    colorClass="bg-emerald-50 text-emerald-600"
                    onClick={() => router.push("/all-requests?status=Accepted")}
                />
                <StatTile
                    label="Rejected"
                    value={stats?.rejected || 0}
                    icon={XCircle}
                    colorClass="bg-rose-50 text-rose-600"
                    onClick={() => router.push("/all-requests?status=Rejected")}
                />
                <StatTile
                    label="Initiated"
                    value={stats?.initiated || 0}
                    icon={PlayCircle}
                    colorClass="bg-indigo-50 text-indigo-600"
                    onClick={() => router.push("/all-requests?status=Initiated")}
                />
                <StatTile
                    label="Pending"
                    value={stats?.pending || 0}
                    icon={Clock}
                    colorClass="bg-slate-50 text-slate-600"
                    onClick={() => router.push("/all-requests?status=Sent")}
                />
                <StatTile
                    label="Completed"
                    value={stats?.completed || 0}
                    icon={CheckCircle2}
                    colorClass="bg-cyan-50 text-cyan-600"
                    onClick={() => router.push("/all-requests?status=Completed")}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Entity Counts */}
                <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-slate-900">Entity Overview</h2>
                        <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                            <TrendingUp size={18} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div
                            onClick={() => router.push("/find-institutes")}
                            className="p-5 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors group"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <Building2 size={20} className="text-primary" />
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Institutes</span>
                            </div>
                            <div className="text-2xl font-bold text-slate-900">{stats?.totalInstitutes.toLocaleString()}</div>
                        </div>
                        <div
                            onClick={() => router.push("/industries")}
                            className="p-5 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors group"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <Factory size={20} className="text-secondary" />
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Industries</span>
                            </div>
                            <div className="text-2xl font-bold text-slate-900">{stats?.totalIndustries.toLocaleString()}</div>
                        </div>
                    </div>
                </div>

                {/* Student Statistics */}
                <div className="bg-primary/5 rounded-2xl p-8 border border-primary/10 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-slate-900">Student Statistics</h2>
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <Users size={18} />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div
                            onClick={() => router.push("/students")}
                            className="p-6 rounded-xl bg-white border border-primary/10 shadow-sm cursor-pointer hover:shadow-md transition-all"
                        >
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Students on Roll</p>
                            <div className="text-3xl font-black text-primary">{stats?.totalStudentsOnRoll.toLocaleString()}</div>
                        </div>
                        <div
                            onClick={() => router.push("/students?available=true")}
                            className="p-6 rounded-xl bg-white border border-secondary/10 shadow-sm cursor-pointer hover:shadow-md transition-all"
                        >
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Available for Placement</p>
                            <div className="text-3xl font-black text-secondary">{stats?.studentsAvailableForPlacement.toLocaleString()}</div>
                            <p className="text-[10px] text-slate-400 mt-2 font-medium italic">* Final year students only</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
