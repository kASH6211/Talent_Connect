"use client";

import Link from "next/link";
import {
  Briefcase,
  ClipboardList,
  Factory,
  ArrowRight,
  CheckCircle2,
  Users,
  GraduationCap,
  TrendingUp,
  Calendar,
  Award,
  Sparkles,
  Clock,
} from "lucide-react";

const statsData = [
  {
    label: "Active Drives",
    value: "12",
    change: "+24%",
    trend: "up" as const,
    icon: Calendar,
    gradient: "from-primary to-primary/70",
  },
  {
    label: "Students Placed",
    value: "247",
    change: "+18%",
    trend: "up" as const,
    icon: CheckCircle2,
    gradient: "from-success to-success/70",
  },
  {
    label: "Pending Requests",
    value: "8",
    change: "-2",
    trend: "down" as const,
    icon: ClipboardList,
    gradient: "from-warning to-warning/70",
  },
  {
    label: "Conversion Rate",
    value: "78.4%",
    change: "+3.2%",
    trend: "up" as const,
    icon: TrendingUp,
    gradient: "from-info to-info/70",
  },
];

const quickActions = [
  {
    icon: Sparkles,
    title: "New Placement Drive",
    description: "Launch recruitment or internship drive",
    href: "/industry-requests/new",
    gradient: "from-success to-success/70",
    badge: "Popular",
  },
  {
    icon: Users,
    title: "View Candidates",
    description: "Browse student profiles",
    href: "/placements/candidates",
    gradient: "from-primary to-primary/70",
  },
  {
    icon: Briefcase,
    title: "Track Placements",
    description: "Monitor status & analytics",
    href: "/placements",
    gradient: "from-secondary to-secondary/70",
  },
  {
    icon: GraduationCap,
    title: "Find Institutes",
    description: "Search by location & courses",
    href: "/find-institutes",
    gradient: "from-accent to-accent/70",
  },
];

export default function IndustryDashboard({
  username,
  industryName = "Leading Tech Corp",
}: {
  username: string;
  industryName?: string;
}) {
  return (
    <div className="p-2 sm:p-3 lg:p-4">
      <div className="w-full space-y-4">
        {/* Hero Section - Compact */}
        <div className="relative overflow-hidden p-4 rounded-xl bg-gradient-to-br from-primary/5 via-base-100 to-base-100 border border-primary/20 shadow-sm">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/3 rounded-full -translate-y-1/2 translate-x-1/2" />

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-md">
              <Factory size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-base-content">
                Welcome, {username} 👋
              </h1>
              <p className="text-primary text-xs sm:text-sm">
                Industry Dashboard · {industryName}
              </p>
            </div>
          </div>

          <p className="mt-2 text-sm text-base-content/70 max-w-lg">
            Manage drives, track placements, and collaborate with institutes
          </p>
        </div>

        {/* Stats Grid - Compact */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {statsData.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="bg-base-100 rounded-lg p-3 shadow-sm hover:shadow-md transition-all border border-base-200/50 h-full flex flex-col justify-between"
              >
                <div
                  className={`w-10 h-10 flex items-center justify-center rounded-lg bg-gradient-to-br ${stat.gradient} mb-2`}
                >
                  <Icon size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-xs text-base-content/70 mb-1">
                    {stat.label}
                  </p>
                  <p className="text-lg sm:text-xl font-bold">{stat.value}</p>
                  <p
                    className={`text-xs font-medium mt-0.5 ${
                      stat.trend === "up" ? "text-success" : "text-error"
                    }`}
                  >
                    {stat.change}
                  </p>
                </div>
              </div>
            );
          })}
        </section>

        {/* Quick Actions - Compact */}
        <section>
          <h2 className="text-lg font-bold text-base-content mb-3 flex items-center gap-2">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            {quickActions.map((action, idx) => {
              const Icon = action.icon;
              return (
                <Link
                  key={idx}
                  href={action.href}
                  className="group bg-base-100 rounded-lg p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all border border-base-200/50 h-full flex flex-col"
                >
                  <div
                    className={`w-10 h-10 flex items-center justify-center mb-3 rounded-lg bg-gradient-to-br ${action.gradient} group-hover:scale-105 transition-transform`}
                  >
                    <Icon size={18} className="text-white" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-xs text-base-content/70 mb-2 flex-1">
                    {action.description}
                  </p>
                  {action.badge && (
                    <span className="inline-block bg-success text-white text-xs px-2 py-0.5 rounded-full">
                      {action.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </section>

        {/* Bottom Section - Compact */}
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-3">
          {/* Recent Activity - Compact */}
          <div className="xl:col-span-2 bg-base-100 rounded-lg p-4 shadow-sm border border-base-200/50">
            <h3 className="font-semibold text-base mb-3">Recent Activity</h3>
            <div className="space-y-2">
              {[
                {
                  title: "NIT Trichy - Campus Drive Approved",
                  time: "2h ago",
                  icon: CheckCircle2,
                },
                {
                  title: "IIT Bombay - 50 Applications Received",
                  time: "1 day ago",
                  icon: Users,
                },
                {
                  title: "VIT Vellore - Drive Scheduled",
                  time: "3 days ago",
                  icon: Calendar,
                },
              ].map((activity, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 p-3 rounded-lg hover:bg-base-50 transition-all border border-base-200/30 group"
                >
                  <div className="w-9 h-9 flex items-center justify-center bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                    <activity.icon size={16} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {activity.title}
                    </p>
                    <p className="text-xs text-base-content/60 flex items-center gap-1 mt-0.5">
                      <Clock size={10} /> {activity.time}
                    </p>
                  </div>
                  <ArrowRight
                    size={14}
                    className="text-base-content/40 group-hover:translate-x-1 transition-transform"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Hiring Stat Card - Compact */}
          <div className="bg-gradient-to-br from-warning/5 to-warning/3 rounded-lg p-4 shadow-sm border border-warning/20 flex flex-col items-center justify-center text-center">
            <Award size={24} className="text-warning mb-2" />
            <p className="text-2xl sm:text-3xl font-bold text-warning">94%</p>
            <p className="text-xs sm:text-sm text-base-content/70 mt-1">
              Drive Success Rate
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
