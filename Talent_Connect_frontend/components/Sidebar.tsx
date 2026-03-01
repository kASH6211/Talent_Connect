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
  Mail,
} from "lucide-react";
import { useState } from "react";
import { clsx } from "clsx";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components2/ThemeToggle";

// ── Nav definitions per role (unchanged) ───────────────────────────────────
const adminNav = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
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
      { label: "Program ↔ Qualification", href: "/mappings/program-qualification" },
      { label: "Institute Qualification", href: "/mappings/institute-qualification" },
      { label: "Job Role ↔ Program", href: "/mappings/job-role-program" },
      { label: "Qualification ↔ Stream/Branch", href: "/mappings/stream-branch-qualification" },
    ],
  },
  { icon: Briefcase, label: "Industry Requests", href: "/industry-requests" },
  { icon: Mail, label: "All Requestes", href: "/all-requests" },
];

const instituteNav = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/institute/dashboard" },
  { icon: Users, label: "Students", href: "/students" },
  { icon: Briefcase, label: "Placements", href: "/placements" },
  {
    icon: ClipboardList,
    label: "Mappings",
    children: [
      { label: "Institute Qualification", href: "/mappings/institute-qualification" },
      { label: "Qualification ↔ Stream/Branch", href: "/mappings/stream-branch-qualification" },
    ],
  },
  {
    icon: ClipboardList,
    label: "Industry Requests",
    href: "/industry-requests",
  },
  { icon: Inbox, label: "Received Offers", href: "/received-offers" },
  { icon: UserCircle, label: "My Profile", href: "/institute/profile" },
];

const industryNav = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/industry/dashboard" },
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
  admin: {
    label: "Admin",
    color:
      "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800",
  },
  institute: {
    label: "Institute",
    color:
      "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800",
  },
  industry: {
    label: "Industry",
    color:
      "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800",
  },
};

// ── Individual Link ────────────────────────────────────────────────────────
function NavLink({ href, label, icon: Icon, collapsed }: any) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      className={clsx(
        "group flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 relative",
        active
          ? "bg-primary text-primary-content font-medium shadow-md"
          : "text-base-content/80 dark:text-base-content/70 hover:bg-base-200 dark:hover:bg-base-800",
        collapsed ? "justify-center p-3" : "justify-start",
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
      {!collapsed && (
        <span className="flex-1 text-sm font-medium">{label}</span>
      )}
      {active && !collapsed && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-primary/60" />
      )}
    </Link>
  );
}

// ── Group with Children ────────────────────────────────────────────────────
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
          "group flex items-center gap-3 w-full px-3 py-3 rounded-lg transition-all duration-200 relative",
          open
            ? "bg-base-200 dark:bg-base-800 text-base-content font-medium"
            : "text-base-content/80 dark:text-base-content/70 hover:bg-base-200 dark:hover:bg-base-800",
          collapsed ? "justify-center p-3" : "justify-start",
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
            "ml-4 mt-2 flex flex-col gap-2",
            open ? "block" : "hidden", // ← no height tricks
            "transition-opacity duration-300",
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

// ── Sidebar Component ──────────────────────────────────────────────────────
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
          className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setCollapsed(false)}
        />
      )}

      <aside
        className={clsx(
          "fixed top-0 left-0 h-screen flex flex-col",
          "bg-base-100 dark:bg-base-900",
          "border-r border-base-200 dark:border-base-800",
          "shadow-lg z-50 transition-all duration-300",
          collapsed ? "w-20" : "w-72 lg:w-64",
        )}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-between p-4 border-b border-base-200 dark:border-base-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-md">
              <GraduationCap size={20} className="text-primary-content" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-sm font-bold text-base-content leading-tight">
                  HUNAR Punjab
                </span>
                <span className="text-[9px] text-base-content/60 leading-tight pr-2">
                  Hub for Upskilling, Networking & Access to Rozgar
                </span>
              </div>
            )}
          </div>
        </div>

        {/* User Profile */}
        {!loading && user && (
          <div
            className={clsx(
              "flex items-center gap-3 p-3 border-b border-base-200 dark:border-base-800",
              "bg-base-50 dark:bg-base-950/50 transition-all",
              collapsed ? "justify-center" : "",
            )}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-base-300 to-base-200 dark:from-base-700 dark:to-base-800 flex items-center justify-center shadow-md flex-shrink-0">
              <UserCircle size={18} className="text-base-content/70" />
            </div>

            {!collapsed && (
              <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                <div className="text-sm font-semibold text-base-content truncate">
                  {user.username}
                </div>

                {/* Smaller, Attractive Badge */}
                <div
                  className={clsx(
                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide shadow-sm transition-all duration-300",
                    "bg-gradient-to-r from-[#7976ff] to-indigo-600 text-white",
                    "hover:from-indigo-600 hover:to-[#7976ff] hover:shadow-md hover:shadow-[#7976ff]/30 hover:scale-105",
                    "border border-[#7976ff]/30",
                  )}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white/90 animate-pulse" />
                  {badge.label}
                </div>
              </div>
            )}

            {!collapsed && <ThemeToggle />}
          </div>
        )}

        {/* Navigation - Increased spacing */}
        <nav className="flex-1 px-2 py-6 space-y-2.5 overflow-y-auto scrollbar-thin scrollbar-thumb-base-300 dark:scrollbar-thumb-base-700 scrollbar-track-transparent">
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
        <div className="p-2 border-t border-base-200 dark:border-base-800 bg-base-50 dark:bg-base-950/50 space-y-2">
          {/* Collapse/Expand Button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            className={clsx(
              "group relative w-full h-10 rounded-lg flex items-center justify-center transition-all duration-200",
              "bg-base-200 dark:bg-base-800",
              "hover:bg-base-300 dark:hover:bg-base-700",
              "border border-base-300 dark:border-base-700",
            )}
          >
            <div className="relative flex items-center justify-center">
              {/* Background Circle */}
              <div className="absolute w-9 h-9 rounded-full bg-primary/15 group-hover:bg-primary/25 transition-all duration-300" />
              {/* Arrow Icon */}
              {collapsed ? (
                <ChevronRight
                  size={26}
                  strokeWidth={3}
                  className="relative text-primary transition-transform duration-300 group-hover:translate-x-1"
                />
              ) : (
                <ChevronLeft
                  size={26}
                  strokeWidth={3}
                  className="relative text-primary transition-transform duration-300 group-hover:-translate-x-1"
                />
              )}
            </div>
          </button>

          {/* Logout Button */}
          <button
            onClick={logout}
            className={clsx(
              "group w-full flex items-center justify-center lg:justify-start gap-3 px-3 py-2.5 rounded-lg",
              "text-base-content/80 dark:text-base-content/70",
              "hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 dark:hover:text-red-300",
              "transition-all duration-200 font-medium",
            )}
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
