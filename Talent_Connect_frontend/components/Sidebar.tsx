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
  X,
  AppWindow,
  Building,
  UserPen,
  Lock,
} from "lucide-react";
import { useState, useEffect } from "react";
import { clsx } from "clsx";
import api from "@/lib/api";
import { useAuth } from "@/lib/AuthProvider";
import ChangePasswordModal from "./common/ChangePasswordModal";
import { globalNotify } from "@/lib/notification";



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
      { label: "Courses", href: "/masters/stream-branches" },
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
      { label: "Sessions", href: "/masters/sessions" },
      { label: "NSQF Levels", href: "/masters/nsqf" },
      { label: "Course Durations", href: "/masters/course-durations" },
    ],
  },
  { icon: University, label: "Institutes", href: "/institutes" },
  { icon: Users, label: "Student Counts", href: "/masters/student-counts" },
  { icon: Factory, label: "Industries", href: "/industries" },
  { icon: Users, label: "Students", href: "/students" },
  { icon: Briefcase, label: "Placements", href: "/placements" },
  {
    icon: ClipboardList,
    label: "Mappings",
    children: [
      {
        label: "Institute ↔ Qualification",
        href: "/mappings/institute-qualification",
      },
      {
        label: "Job Role ↔ Qualification",
        href: "/mappings/job-role-qualification",
      },
      {
        label: "Qualification ↔ Course",
        href: "/mappings/stream-branch-qualification",
      },
    ],
  },
  { icon: Briefcase, label: "Industry Requests", href: "/industry-requests" },
  { icon: Mail, label: "All Requests", href: "/all-requests" },
  { icon: Users, label: "User Management", href: "/admin/users" },
];

const instituteNav = [
  // { icon: LayoutDashboard, label: "Dashboard", href: "/institute/dashboard" },
  { icon: Inbox, label: "Inbox", href: "/institute/inbox" },
  { icon: LayoutDashboard, label: "Explore Industries", href: "/institute/explore-industry" },
  { icon: AppWindow, label: "Application Tracker", href: "/institute/application" },
  { icon: Briefcase, label: "Industry Partners", href: "/institute/Partnership" },
  { icon: Users, label: "Students", href: "/institute/student" },
  { icon: GraduationCap, label: "Alumni", href: "/institute/alumini" },
  { icon: LayoutDashboard, label: "Faculty", href: "/institute/faculty" },
  // { icon: Inbox, label: "Received EOI", href: "/received-offers" },
  // {
  //   icon: ClipboardList,
  //   label: "Mappings",
  //   children: [
  //     {
  //       label: "Institute ↔ Qualification",
  //       href: "/mappings/institute-qualification",
  //     },
  //     {
  //       label: "Qualification ↔ Course",
  //       href: "/mappings/stream-branch-qualification",
  //     },
  //   ],
  // },
  // { icon: Users, label: "Student Counts", href: "/masters/student-counts" },
  { icon: UserCircle, label: "My Profile", href: "/institute/profile" },
];

const industryNav = [
  { icon: AppWindow, label: "Application Tracker", href: "/sent-offers" },
  { icon: Search, label: "Explore Institutes", href: "/find-institutes" },
  { icon: Inbox, label: 'Inbox', href: '/industry/inbox' },
  // { icon: LayoutDashboard, label: "Dashboard", href: "/industry/dashboard" },
  { icon: Building, label: "Partner Institutes", href: "/industry/institutes" },
  { icon: UserPen, label: "Profile", href: "/industry/profile" },
];

const deptAdminNav = [
  { icon: LayoutDashboard, label: "State Overview", href: "/dept-admin/state-overview" },
  { icon: Building, label: "Industry Partnerships", href: "/dept-admin/industry-partnership" },
  { icon: Mail, label: "Application Tracker", href: "/all-requests" },
  { icon: Factory, label: "Explore Industries", href: "/dept-admin/explore-industry" },
  { icon: Search, label: "Institutes", href: "/find-institutes" },
  { icon: UserCircle, label: "Profile", href: "/dept-admin/profile" },
];

function NavLink({ href, label, icon: Icon, collapsed }: any) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      className={clsx(
        "group flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 relative select-none",
        active
          ? "bg-primary text-primary-content font-semibold shadow-md"
          : "text-base-content/80 dark:text-base-content/70 hover:bg-base-200 dark:hover:bg-base-800",
        collapsed ? "justify-center p-3" : "justify-start",
      )}
      title={collapsed ? label : undefined}
      tabIndex={0}
    >
      {Icon && (
        <Icon
          size={collapsed ? 20 : 18}
          className={clsx(
            "flex-shrink-0 transition-transform duration-200",
            active && "group-hover:scale-105",
          )}
          aria-hidden="true"
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

function NavGroup({ item, collapsed }: any) {
  const pathname = usePathname();
  const isOpen = item.children?.some((c: any) => pathname.startsWith(c.href));
  const [open, setOpen] = useState(isOpen ?? false);

  useEffect(() => {
    if (item.forceOpen) {
      setOpen(true);
    }
  }, [item.forceOpen]);

  const Icon = item.icon;

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={clsx(
          "group flex items-center gap-3 w-full px-3 py-3 rounded-lg transition-all duration-200 relative select-none",
          open
            ? "bg-base-200 dark:bg-base-800 text-base-content font-semibold"
            : "text-base-content/80 dark:text-base-content/70 hover:bg-base-200 dark:hover:bg-base-800",
          collapsed ? "justify-center p-3" : "justify-start",
        )}
        title={collapsed ? item.label : undefined}
        aria-expanded={open}
        aria-controls={`${item.label.replace(/\s+/g, "-").toLowerCase()}-submenu`}
      >
        {Icon && (
          <Icon
            size={collapsed ? 20 : 18}
            className="flex-shrink-0"
            aria-hidden="true"
          />
        )}
        {!collapsed && (
          <>
            <span className="flex-1 text-sm font-medium">{item.label}</span>
            <ChevronDown
              size={16}
              className={clsx(
                "transition-transform duration-300",
                open ? "rotate-180" : "",
              )}
              aria-hidden="true"
            />
          </>
        )}
      </button>

      {!collapsed && (
        <div
          id={`${item.label.replace(/\s+/g, "-").toLowerCase()}-submenu`}
          className={clsx(
            "ml-4 mt-2 flex flex-col gap-2",
            open ? "block" : "hidden",
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

export default function Sidebar({
  collapsed,
  setCollapsed,
  mobileSidebarOpen,
  setMobileSidebarOpen,
  isMobile,
}: any) {
  const { user, role, logout, loading } = useAuth();
  const [orgName, setOrgName] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (user?.institute_id && role === "institute") {
      api
        .get(`/institute/${user.institute_id}`)
        .then((res) => setOrgName(res.data?.institute_name))
        .catch(console.error);
    } else if (user?.industry_id && role === "industry") {
      api
        .get(`/industry/${user.industry_id}`)
        .then((res) => setOrgName(res.data?.industry_name))
        .catch(console.error);
    }
  }, [user, role]);

  const rawNavItems =
    role === "institute"
      ? instituteNav
      : role === "industry"
        ? industryNav
        : role === "dept_admin"
          ? deptAdminNav
          : adminNav;

  const filterNavItems = (items: any[], term: string): any[] => {
    if (!term) return items;
    const lowerTerm = term.toLowerCase();

    return items
      .map((item) => {
        const matchesLabel = item.label.toLowerCase().includes(lowerTerm);
        if (item.children) {
          const filteredChildren = filterNavItems(item.children, term);
          if (filteredChildren.length > 0 || matchesLabel) {
            return {
              ...item,
              children: filteredChildren,
              forceOpen: filteredChildren.length > 0,
            };
          }
        } else if (matchesLabel) {
          return item;
        }
        return null;
      })
      .filter(Boolean);
  };

  const navItems = filterNavItems(rawNavItems, searchTerm);

  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  // Simple role display (plain text)
  const roleDisplay =
    {
      admin: "Administrator",
      institute: "Institute ",
      industry: "Industry Partner",
      dept_admin: "Department ",
    }[role || ""] || "User";
  console.log("orgName >>", orgName)
  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <aside
        className={clsx(
          "flex flex-col h-full",
          "bg-base-100 dark:bg-base-900",
          "border-r border-base-200 dark:border-base-800",
          "shadow-lg z-50 transition-all duration-300",
          isMobile
            ? mobileSidebarOpen
              ? "fixed top-0 left-0 translate-x-0 w-72"
              : "fixed top-0 left-0 -translate-x-full w-72"
            : collapsed
              ? "w-20"
              : "w-72 lg:w-64",
        )}
      >

        {/* Mobile Close Button */}
        {isMobile && (
          <div className="flex items-center justify-end p-3 border-b border-base-200 dark:border-base-800 lg:hidden">
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-base-200 dark:bg-base-800 hover:bg-base-300 dark:hover:bg-base-700 transition"
            >
              <X size={18} />
            </button>
          </div>
        )}
        {/* User Info Section */}
        {!loading && user && (
          <div
            className={clsx(
              "px-4 py-5 border-b border-base-200 dark:border-base-800",
              "transition-all duration-300",
              collapsed && "hidden",
            )}
          >
            <div className="flex items-start gap-3.5">
              {/* Avatar / Icon */}
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center ring-1 ring-base-300 dark:ring-base-700 shadow-sm overflow-hidden">
                  {user.profile_picture ? (
                    <img
                      src={user.profile_picture}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserCircle
                      size={28}
                      className="text-primary/70"
                      strokeWidth={1.8}
                    />
                  )}
                </div>
                {/* Optional online indicator - remove if not needed */}
                {/* <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-base-100 dark:border-base-900" /> */}
              </div>

              {/* Text content */}
              <div className="flex-1 min-w-0 space-y-1.5">
                {/* Organization / Institute / Company Name */}
                <p
                  className="text-[15px] font-semibold text-base-content tracking-tight truncate"
                  title={orgName || "Your Organization"}
                >
                  {orgName || "Your Organization"}
                </p>

                {/* Username */}
                {user.username && (
                  <p
                    className="text-xs text-base-content/60 font-medium truncate leading-tight"
                    title={user.username}
                  >
                    @{user.username}
                  </p>
                )}

                {/* Role in subtle grey pill/box */}
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-base-200/70 dark:bg-base-800/60 text-base-content/70 border border-base-300/50 dark:border-base-700/50 mt-1">
                  {roleDisplay}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search Section */}
        <div className="p-4 border-b border-base-200 dark:border-base-800">
          <div
            className={clsx(
              "relative flex items-center transition-all duration-300",
              collapsed ? "w-10 h-10 mx-auto justify-center" : "w-full h-11",
            )}
          >
            <div
              className={clsx(
                "transition-colors duration-300 z-10",
                collapsed ? "" : "absolute left-3.5 top-1/2 -translate-y-1/2",
                searchTerm ? "text-primary" : "text-base-content/40",
              )}
            >
              <Search size={18} />

            </div>
            {!collapsed && (
              <input
                type="text"
                placeholder="Search menu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={clsx(
                  "w-full h-full pl-11 pr-10 rounded-xl text-[13px] transition-all duration-300 font-medium",
                  "bg-base-200/50 dark:bg-base-800/50 border-transparent",
                  "focus:bg-white dark:focus:bg-base-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none",
                  "placeholder:text-base-content/30",
                )}
              />
            )}
            {searchTerm && !collapsed && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-base-content/30 hover:text-base-content/60 transition-colors p-1"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
        {/* Navigation */}
        <nav className="flex-1 px-2 py-6 space-y-2.5 overflow-y-auto scrollbar-thin scrollbar-thumb-base-300 dark:scrollbar-thumb-base-700 scrollbar-track-transparent">
          {navItems.length > 0 ? (
            navItems.map((item: any) =>
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
            )
          ) : (
            <div
              className={clsx(
                "flex flex-col items-center justify-center py-10 px-4 text-center animate-in fade-in slide-in-from-top-2 duration-300",
                collapsed ? "opacity-0" : "opacity-100",
              )}
            >
              <div className="w-12 h-12 rounded-2xl bg-base-200 dark:bg-base-800 flex items-center justify-center mb-3 text-base-content/20">
                <Search size={24} />
              </div>
              {!collapsed && (
                <>
                  <p className="text-xs font-bold text-base-content/50 uppercase tracking-wider">
                    No matches
                  </p>
                  <p className="text-[10px] text-base-content/30 mt-1 uppercase tracking-widest">
                    Check spelling
                  </p>
                </>
              )}
            </div>
          )}
        </nav>

        {/* Bottom Controls */}
        <div className="p-2 border-t border-base-200 dark:border-base-800 bg-base-50 dark:bg-base-950/50 space-y-2">
          {/* {!collapsed && (
            <div className={clsx("grid gap-2", role !== "industry" ? "grid-cols-2" : "grid-cols-1")}>
              {role !== "industry" && (
                <button
                  onClick={() => setIsChangePasswordOpen(true)}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-white dark:bg-base-900 border border-base-200 dark:border-base-800 hover:bg-primary/5 hover:border-primary/30 transition-all text-[11px] font-bold uppercase tracking-wider text-base-content/70"
                  title="Change Password"
                >
                  <Lock size={14} className="text-primary" />
                  Password
                </button>
              )}
              <button
                onClick={logout}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/20 transition-all text-[11px] font-bold uppercase tracking-wider text-red-600"
                title="Log out"
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          )} */}

          {/* {collapsed && (
            <>
              {role !== "industry" && (
                <button
                  onClick={() => setIsChangePasswordOpen(true)}
                  className="w-full h-10 flex items-center justify-center rounded-lg bg-white dark:bg-base-900 border border-base-200 dark:border-base-800 hover:bg-primary/5 hover:border-primary/30 transition-all"
                  title="Change Password"
                >
                  <Lock size={18} className="text-primary" />
                </button>
              )}
              <button
                onClick={logout}
                className="w-full h-10 flex items-center justify-center rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/20 transition-all"
                title="Log out"
              >
                <LogOut size={18} className="text-red-500" />
              </button>
            </>
          )} */}

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
              <div className="absolute w-9 h-9 rounded-full bg-primary/15 group-hover:bg-primary/25 transition-all duration-300" />
              {collapsed ? (
                <ChevronRight
                  size={26}
                  strokeWidth={3}
                  className="relative text-primary transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              ) : (
                <ChevronLeft
                  size={26}
                  strokeWidth={3}
                  className="relative text-primary transition-transform duration-300 group-hover:-translate-x-1"
                  aria-hidden="true"
                />
              )}
            </div>
          </button>
        </div>
        <ChangePasswordModal
          isOpen={isChangePasswordOpen}
          onClose={() => setIsChangePasswordOpen(false)}
        />
      </aside>
    </>
  );
}
