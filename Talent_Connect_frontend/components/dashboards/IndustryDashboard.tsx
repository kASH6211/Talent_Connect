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
    <div className="min-h-screen bg-base-200/30">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-6 lg:py-10 mx-auto">
        {/* Hero Section */}
        <div className="relative overflow-hidden p-6 lg:p-8 rounded-2xl bg-base-100 border border-base-200 shadow-xl mb-10">
          {/* Subtle accent orb */}
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex items-center justify-between gap-6">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md flex-shrink-0">
                <Factory size={26} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-base-content">
                  Welcome, {username} 👋
                </h1>
                <p className="text-primary font-medium text-base lg:text-lg mt-1">
                  Industry Dashboard · {industryName}
                </p>
              </div>
            </div>
          </div>

          <p className="mt-5 text-base-content/70 max-w-3xl text-base lg:text-lg">
            Manage drives, track placements, and collaborate with institutes
            seamlessly.
          </p>
        </div>

        {/* Stats Grid */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:gap-6 mb-10">
          {statsData.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="relative bg-base-100 rounded-2xl p-5 lg:p-6 border border-base-200 shadow-md hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 group overflow-hidden flex items-center justify-between gap-4"
              >
                {/* Hover glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none" />

                <div className="flex-1 min-w-0">
                  <p className="text-sm text-base-content/70 mb-1">
                    {stat.label}
                  </p>
                  <p className="text-2xl lg:text-3xl font-bold text-base-content">
                    {stat.value}
                  </p>
                  <p
                    className={`text-sm font-medium mt-1 ${
                      stat.trend === "up" ? "text-success" : "text-error"
                    }`}
                  >
                    {stat.change}
                  </p>
                </div>

                <div
                  className={`w-14 h-14 lg:w-16 lg:h-16 flex items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient} shadow-md flex-shrink-0 group-hover:scale-105 transition-transform`}
                >
                  <Icon size={24} className="text-white" />
                </div>
              </div>
            );
          })}
        </section>

        {/* Quick Actions */}
        <section className="mb-10">
          <h2 className="text-2xl lg:text-3xl font-bold text-base-content mb-6 flex items-center gap-3">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
            {quickActions.map((action, idx) => {
              const Icon = action.icon;
              return (
                <Link
                  key={idx}
                  href={action.href}
                  className="group relative bg-base-100 rounded-2xl p-6 lg:p-7 border border-base-200 shadow-md hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full"
                >
                  <div className="flex items-center justify-between mb-5">
                    <div
                      className={`w-12 h-12 lg:w-14 lg:h-14 flex items-center justify-center rounded-xl bg-gradient-to-br ${action.gradient} shadow-md group-hover:scale-105 transition-transform`}
                    >
                      <Icon size={24} className="text-white" />
                    </div>
                    {action.badge && (
                      <span className="inline-block bg-success/10 text-success text-xs lg:text-sm px-3 py-1 rounded-full font-medium">
                        {action.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="font-semibold text-base lg:text-lg text-base-content group-hover:text-primary transition-colors mb-2">
                    {action.title}
                  </h3>
                  <p className="text-sm lg:text-base text-base-content/70 flex-1">
                    {action.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Bottom Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-base-100 rounded-2xl p-6 lg:p-8 border border-base-200 shadow-xl">
            <h3 className="text-xl lg:text-2xl font-bold text-base-content mb-6 flex items-center gap-3">
              Recent Activity
            </h3>
            <div className="space-y-4">
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
                  className="flex items-center gap-4 p-4 lg:p-5 rounded-xl hover:bg-base-200/50 transition-all border border-base-200/30 group"
                >
                  <div className="w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors flex-shrink-0">
                    <activity.icon size={20} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-base-content truncate text-base lg:text-lg">
                      {activity.title}
                    </p>
                    <p className="text-sm lg:text-base text-base-content/60 flex items-center gap-1.5 mt-1">
                      <Clock size={14} />
                      {activity.time}
                    </p>
                  </div>
                  <ArrowRight
                    size={18}
                    className="text-base-content/40 group-hover:translate-x-1 transition-transform"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Hiring Stat Card */}
          <div className="bg-gradient-to-br from-warning/5 to-warning/3 rounded-2xl p-6 lg:p-8 border border-warning/20 shadow-xl flex flex-col items-center justify-center text-center">
            <Award size={40} className="text-warning mb-4" />
            <p className="text-5xl lg:text-6xl font-bold text-warning">94%</p>
            <p className="text-lg lg:text-xl text-base-content/70 mt-3">
              Drive Success Rate
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
