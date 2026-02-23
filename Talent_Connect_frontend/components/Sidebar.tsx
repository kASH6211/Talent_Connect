'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard, University, Building2, Users, Briefcase,
    GraduationCap, Factory, ChevronDown, ChevronRight,
    Settings, ClipboardList, LogOut, UserCircle, Search, Inbox, Send
} from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from '@/components2/ThemeToggle';

// ── Nav definitions per role ───────────────────────────────────────────────

const adminNav = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
    {
        icon: Settings, label: 'Master Data', children: [
            { label: 'Boards / Universities', href: '/masters/boards' },
            { label: 'States', href: '/masters/states' },
            { label: 'Districts', href: '/masters/districts' },
            { label: 'Qualifications', href: '/masters/qualifications' },
            { label: 'Programs', href: '/masters/programs' },
            { label: 'Stream & Branches', href: '/masters/stream-branches' },
            { label: 'Job Roles', href: '/masters/job-roles' },
            { label: 'Institute Types', href: '/masters/institute-types' },
            { label: 'Institute Sub Types', href: '/masters/institute-sub-types' },
            { label: 'Institute Ownership', href: '/masters/institute-ownership-types' },
            { label: 'Affiliations', href: '/masters/affiliations' },
            { label: 'Regulatory Bodies', href: '/masters/regulatory' },
            { label: 'Training Types', href: '/masters/training-types' },
            { label: 'Institute Enrollment', href: '/masters/institute-enrollments' },
            { label: 'Legal Entity Types', href: '/masters/legal-entities' },
            { label: 'Industry Sectors', href: '/masters/industry-sectors' },
            { label: 'Industry Scale', href: '/masters/industry-scales' },
            { label: 'Identifier Types', href: '/masters/identifier-types' },
            { label: 'Request Types', href: '/masters/request-types' },
            { label: 'Request Statuses', href: '/masters/request-statuses' },
        ]
    },
    { icon: University, label: 'Institutes', href: '/institutes' },
    { icon: Factory, label: 'Industries', href: '/industries' },
    { icon: Users, label: 'Students', href: '/students' },
    { icon: Briefcase, label: 'Placements', href: '/placements' },
    {
        icon: ClipboardList, label: 'Mappings', children: [
            { label: 'Program ↔ Qualification', href: '/mappings/program-qualification' },
            { label: 'Institute ↔ Program', href: '/mappings/institute-program' },
            { label: 'Job Role ↔ Program', href: '/mappings/job-role-program' },
        ]
    },
    { icon: Briefcase, label: 'Industry Requests', href: '/industry-requests' },
];

const instituteNav = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
    { icon: Users, label: 'Students', href: '/students' },
    { icon: Briefcase, label: 'Placements', href: '/placements' },
    { icon: ClipboardList, label: 'Industry Requests', href: '/industry-requests' },
    { icon: Inbox, label: 'Received Offers', href: '/received-offers' },
];

const industryNav = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
    { icon: Search, label: 'Find Institutes', href: '/find-institutes' },
    { icon: Send, label: 'Sent Offers', href: '/sent-offers' },
    { icon: Briefcase, label: 'Placements', href: '/placements' },
    { icon: ClipboardList, label: 'Industry Requests', href: '/industry-requests' },
];

const roleBadge: Record<string, { label: string; cls: string }> = {
    admin: { label: 'Admin', cls: 'badge badge-primary badge-sm' },
    institute: { label: 'Institute', cls: 'badge badge-success badge-sm' },
    industry: { label: 'Industry', cls: 'badge badge-secondary badge-sm' },
};

// ── Sub-components ─────────────────────────────────────────────────────────

function NavLink({ href, label, icon: Icon }: { href: string; label: string; icon?: any }) {
    const pathname = usePathname();
    const active = pathname === href;
    return (
        <Link href={href}
            className={clsx(
                'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                active
                    ? 'bg-primary text-primary-content shadow-md'
                    : 'text-base-content/70 hover:bg-base-300 hover:text-base-content'
            )}
        >
            {Icon && <Icon size={16} />}
            {label}
        </Link>
    );
}

function NavGroup({ item }: { item: any }) {
    const pathname = usePathname();
    const isOpen = item.children?.some((c: any) => pathname.startsWith(c.href));
    const [open, setOpen] = useState(isOpen ?? false);
    const Icon = item.icon;
    return (
        <div>
            <button onClick={() => setOpen(!open)}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-base-content/70 hover:bg-base-300 hover:text-base-content transition-all duration-200"
            >
                {Icon && <Icon size={16} />}
                <span className="flex-1 text-left">{item.label}</span>
                {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            {open && (
                <div className="ml-7 mt-1 flex flex-col gap-0.5 border-l border-base-300 pl-3">
                    {item.children.map((c: any) => (
                        <NavLink key={c.href} href={c.href} label={c.label} />
                    ))}
                </div>
            )}
        </div>
    );
}

// ── Main Sidebar ───────────────────────────────────────────────────────────

export default function Sidebar() {
    const { user, role, logout, loading } = useAuth();

    const navItems =
        role === 'institute' ? instituteNav :
            role === 'industry' ? industryNav :
                adminNav;

    const badge = role ? (roleBadge[role] ?? roleBadge['admin']) : roleBadge['admin'];

    return (
        <aside className="fixed left-0 top-0 h-screen w-[260px] bg-base-200 border-r border-base-300 flex flex-col overflow-y-auto z-50">
            {/* Logo */}
            <div className="px-5 py-5 border-b border-base-300">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                        <GraduationCap size={20} className="text-primary-content" />
                    </div>
                    <div>
                        <div className="text-sm font-bold text-base-content">Talent Connect</div>
                        <div className="text-[10px] text-base-content/50 mt-0.5">Placement Portal</div>
                    </div>
                </div>
            </div>

            {/* User info */}
            {!loading && user && (
                <div className="px-4 py-3 border-b border-base-300 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-base-300 flex items-center justify-center flex-shrink-0">
                        <UserCircle size={18} className="text-base-content/60" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-base-content truncate">{user.username}</div>
                        <span className={clsx('inline-block mt-0.5', badge.cls)}>
                            {badge.label}
                        </span>
                    </div>
                    <ThemeToggle />
                </div>
            )}

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
                {navItems.map((item: any) =>
                    item.children
                        ? <NavGroup key={item.label} item={item} />
                        : <NavLink key={item.href} href={item.href!} label={item.label} icon={item.icon} />
                )}
            </nav>

            {/* Logout */}
            <div className="px-3 pb-4 border-t border-base-300 pt-3">
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-base-content/60 hover:bg-error/10 hover:text-error transition-all duration-200"
                >
                    <LogOut size={16} />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
