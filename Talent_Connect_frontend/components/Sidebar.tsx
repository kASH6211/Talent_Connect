"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  University,
  Users,
  Briefcase,
  GraduationCap,
  Factory,
  ChevronDown,
  Settings,
  ClipboardList,
  LogOut,
  UserCircle,
  Search,
  Inbox,
  Send,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { useState } from "react";
import { clsx } from "clsx";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components2/ThemeToggle";

// ── Nav definitions per role ───────────────────────────────────────────────

const adminNav = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  {
    icon: Settings,
    label: "Master Data",
    children: [
      { label: "Boards / Universities", href: "/masters/boards" },
      { label: "States", href: "/masters/states" },
      { label: "Districts", href: "/masters/districts" },
      { label: "Qualifications", href: "/masters/qualifications" },
      { label: "Programs", href: "/masters/programs" },
      { label: "Stream & Branches", href: "/masters/stream-branches" },
      { label: "Job Roles", href: "/masters/job-roles" },
      { label: "Institute Types", href: "/masters/institute-types" },
      { label: "Institute Sub Types", href: "/masters/institute-sub-types" },
      {
        label: "Institute Ownership",
        href: "/masters/institute-ownership-types",
      },
      { label: "Affiliations", href: "/masters/affiliations" },
      { label: "Regulatory Bodies", href: "/masters/regulatory" },
      { label: "Training Types", href: "/masters/training-types" },
      { label: "Institute Enrollment", href: "/masters/institute-enrollments" },
      { label: "Legal Entity Types", href: "/masters/legal-entities" },
      { label: "Industry Sectors", href: "/masters/industry-sectors" },
      { label: "Industry Scale", href: "/masters/industry-scales" },
      { label: "Identifier Types", href: "/masters/identifier-types" },
      { label: "Request Types", href: "/masters/request-types" },
      { label: "Request Statuses", href: "/masters/request-statuses" },
    ],
  },
  { icon: University, label: "Institutes", href: "/institutes" },
  { icon: Factory, label: "Industries", href: "/industries" },
  { icon: Users, label: "Students", href: "/students" },
  { icon: Briefcase, label: "Placements", href: "/placements" },
  {
    icon: ClipboardList,
    label: "Mappings",
    children: [
      {
        label: "Program ↔ Qualification",
        href: "/mappings/program-qualification",
      },
      { label: "Institute ↔ Program", href: "/mappings/institute-program" },
      { label: "Job Role ↔ Program", href: "/mappings/job-role-program" },
    ],
  },
  { icon: Briefcase, label: "Industry Requests", href: "/industry-requests" },
];

const instituteNav = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Users, label: "Students", href: "/students" },
  { icon: Briefcase, label: "Placements", href: "/placements" },
  {
    icon: ClipboardList,
    label: "Industry Requests",
    href: "/industry-requests",
  },
  { icon: Inbox, label: "Received Offers", href: "/received-offers" },
];

const industryNav = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Search, label: "Find Institutes", href: "/find-institutes" },
  { icon: Send, label: "Sent Offers", href: "/sent-offers" },
  { icon: Briefcase, label: "Placements", href: "/placements" },
  {
    icon: ClipboardList,
    label: "Industry Requests",
    href: "/industry-requests",
  },
];

const roleBadge: Record<string, { label: string; color: string }> = {
  admin: { label: "Admin", color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" },
  institute: { label: "Institute", color: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300" },
  industry: { label: "Industry", color: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300" },
};

// Individual Link
function NavLink({ href, label, icon: Icon, collapsed }: any) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      className={clsx(
        "group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative",
        active
          ? "bg-blue-600 text-white font-medium shadow-md"
          : "text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700",
        collapsed ? "justify-center p-2.5" : "justify-start",
      )}
      title={collapsed ? label : undefined}
    >
      {Icon && (
        <Icon
          size={collapsed ? 20 : 18}
          className={clsx(
            "flex-shrink-0 transition-transform duration-200",
            active && "group-hover:scale-105",
          )}
        />
      )}
      {!collapsed && <span className="flex-1 text-sm font-medium">{label}</span>}
      {active && !collapsed && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-white opacity-60" />
      )}
    </Link>
  );
}

// Group with Children
function NavGroup({ item, collapsed }: any) {
  const pathname = usePathname();
  const isOpen = item.children?.some((c: any) => pathname.startsWith(c.href));
  const [open, setOpen] = useState(isOpen ?? false);
  const Icon = item.icon;

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={clsx(
          "group flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-all duration-200 relative",
          open
            ? "bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-medium"
            : "text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700",
          collapsed ? "justify-center p-2.5" : "justify-start",
        )}
        title={collapsed ? item.label : undefined}
      >
        {Icon && <Icon size={collapsed ? 20 : 18} className="flex-shrink-0" />}
        {!collapsed && (
          <>
            <span className="flex-1 text-sm font-medium">{item.label}</span>
            <ChevronDown
              size={16}
              className={clsx(
                "transition-transform duration-300",
                open ? "rotate-180" : "",
              )}
            />
          </>
        )}
      </button>

      {!collapsed && (
        <div
          className={clsx(
            "ml-4 mt-1 flex flex-col gap-1 overflow-hidden transition-all duration-300",
            open ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
          )}
        >
          {item.children?.map((c: any) => (
            <NavLink
              key={c.href}
              href={c.href}
              label={c.label}
              collapsed={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Sidebar Component
export default function Sidebar({ collapsed, setCollapsed }: any) {
  const { user, role, logout, loading } = useAuth();
  const navItems =
    role === "institute"
      ? instituteNav
      : role === "industry"
        ? industryNav
        : adminNav;
  const badge = role
    ? (roleBadge[role] ?? roleBadge["admin"])
    : roleBadge["admin"];

  return (
    <>
      {collapsed && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setCollapsed(false)}
        />
      )}

      <aside
        className={clsx(
          "fixed top-0 left-0 h-screen flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-lg z-50 transition-all duration-300",
          collapsed ? "w-20" : "w-72 lg:w-64",
        )}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md">
              <GraduationCap size={20} className="text-white" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-base font-bold text-slate-900 dark:text-white">
                  Talent Connect
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Portal
                </span>
              </div>
            )}
          </div>
        </div>

        {/* User Profile */}
        {!loading && user && (
          <div
            className={clsx(
              "flex items-center gap-3 p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 transition-all",
              collapsed ? "justify-center" : "",
            )}
          >
            <div className="w-9 h-9 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
              <UserCircle size={18} className="text-slate-600 dark:text-slate-400" />
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                  {user.username}
                </div>
                <div className={clsx("text-xs font-medium px-2 py-1 rounded mt-1 w-fit", badge.color)}>
                  {badge.label}
                </div>
              </div>
            )}
            {!collapsed && <ThemeToggle />}
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {navItems.map((item: any) =>
            item.children ? (
              <NavGroup key={item.label} item={item} collapsed={collapsed} />
            ) : (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                collapsed={collapsed}
              />
            ),
          )}
        </nav>

        {/* Bottom Controls */}
        <div className="p-2 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-2">
          <button
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            className="group w-full h-10 rounded-lg flex items-center justify-center transition-all duration-200 
               bg-slate-200 dark:bg-slate-700 
               hover:bg-slate-300 dark:hover:bg-slate-600
               border border-slate-300 dark:border-slate-600"
          >
            {collapsed ? (
              <ChevronRight size={20} className="text-slate-700 dark:text-slate-300" />
            ) : (
              <ChevronLeft size={20} className="text-slate-700 dark:text-slate-300" />
            )}
          </button>

          <button
            onClick={logout}
            className="group w-full flex items-center justify-center lg:justify-start gap-3 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300 transition-all duration-200 font-medium"
          >
            {collapsed ? (
              <LogOut size={18} />
            ) : (
              <>
                <LogOut size={18} />
                <span className="text-sm">Sign Out</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}