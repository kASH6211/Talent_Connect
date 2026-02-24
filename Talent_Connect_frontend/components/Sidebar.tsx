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
  Menu,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { useState } from "react";
import { clsx } from "clsx";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components2/ThemeToggle";

// Navigation Definitions
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

const roleBadge: Record<string, { label: string; cls: string }> = {
  admin: { label: "Admin", cls: "badge badge-primary badge-xs" },
  institute: { label: "Institute", cls: "badge badge-success badge-xs" },
  industry: { label: "Industry", cls: "badge badge-secondary badge-xs" },
};

// Individual Link
function NavLink({ href, label, icon: Icon, collapsed }: any) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      className={clsx(
        "group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 relative",
        active
          ? "bg-gradient-to-r from-primary/80 to-secondary/80 shadow-lg text-primary-content font-semibold"
          : "text-base-content/70 hover:bg-base-200 hover:shadow-md",
        collapsed ? "justify-center p-3" : "justify-start",
      )}
      title={collapsed ? label : undefined}
    >
      {Icon && (
        <Icon
          size={collapsed ? 22 : 20}
          className={clsx(
            "flex-shrink-0 transition-transform duration-300",
            active && "drop-shadow-lg group-hover:scale-110",
          )}
        />
      )}
      {!collapsed && <span className="flex-1 text-sm">{label}</span>}
      {active && !collapsed && (
        <div className="absolute left-0 top-0 h-full w-1 rounded-r-full bg-gradient-to-b from-primary to-secondary" />
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
          "group flex items-center gap-3 w-full px-3 py-3 rounded-xl transition-all duration-300 relative",
          open
            ? "bg-base-200 shadow-md text-base-content font-medium"
            : "text-base-content/70 hover:bg-base-200 hover:shadow-md",
          collapsed ? "justify-center p-3" : "justify-start",
        )}
        title={collapsed ? item.label : undefined}
      >
        {Icon && <Icon size={collapsed ? 22 : 20} className="flex-shrink-0" />}
        {!collapsed && (
          <>
            <span className="flex-1 text-sm">{item.label}</span>
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
            "ml-6 mt-1 flex flex-col gap-1 overflow-hidden transition-all duration-500",
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
          "fixed top-0 left-0 h-screen flex flex-col bg-gradient-to-b from-base-100/95 via-base-200/90 to-base-300/80 border-r border-base-300/60 shadow-2xl z-50 transition-all duration-500",
          collapsed ? "w-20" : "w-72 lg:w-64",
        )}
      >
        {/* Logo & Collapse Toggle */}
        <div className="flex items-center justify-between p-4 border-b border-base-300/40 relative">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-lg border border-primary/30 group">
              <GraduationCap
                size={22}
                className="text-primary-content drop-shadow-lg"
              />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-lg font-bold bg-gradient-to-r from-base-content via-primary to-secondary bg-clip-text text-transparent">
                  Talent Connect
                </span>
                <span className="text-xs text-base-content/60">
                  Placement Portal
                </span>
              </div>
            )}
          </div>
          {/* <button
            onClick={() => setCollapsed(!collapsed)}
            className={clsx(
              "p-2.5 rounded-xl shadow-md hover:scale-105 transition-transform bg-base-200/80",
              collapsed && "absolute right-2 top-1/2 -translate-y-1/2",
            )}
          >
            <Menu size={20} />
          </button> */}
        </div>

        {/* User Profile */}
        {!loading && user && (
          <div
            className={clsx(
              "flex items-center gap-3 p-3 border-b border-base-300/30 bg-base-100/80 backdrop-blur-sm transition-transform hover:scale-[1.02]",
              collapsed ? "justify-center" : "",
            )}
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-primary/40 flex items-center justify-center shadow-lg">
              <UserCircle size={20} className="text-primary" />
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <span className="text-sm font-semibold truncate">
                  {user.username}
                </span>
                <span className={clsx("inline-block mt-1", badge.cls)}>
                  {badge.label}
                </span>
              </div>
            )}
            {!collapsed && <ThemeToggle />}
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-2 py-6 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-base-300/50 scrollbar-track-base-200/50">
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
        <div
          className={`p-2 border-t border-base-300/40 dark:border-base-200/40 bg-base-100/80 dark:bg-base-200/80 backdrop-blur-sm   ${collapsed ? "overflow-hidden " : ""} `}
        >
          <button
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            className="group w-full h-12 rounded-xl flex items-center justify-center transition-all duration-300 
               bg-base-200/70 dark:bg-base-100/70 
               hover:bg-primary/10 dark:hover:bg-primary/20
               border border-base-300/40 dark:border-base-200/40
               hover:border-primary/40"
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
          {/* </div> */}

          <button
            onClick={logout}
            className="group w-full flex items-center justify-center lg:justify-start gap-3 p-3 rounded-xl text-base-content/70 hover:bg-gradient-to-r hover:from-error/10 hover:to-error/20 hover:text-error transition-all duration-300 overflow-hidden"
          >
            {collapsed ? (
              <LogOut size={20} />
            ) : (
              <>
                <LogOut size={18} /> <span>Sign Out</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
