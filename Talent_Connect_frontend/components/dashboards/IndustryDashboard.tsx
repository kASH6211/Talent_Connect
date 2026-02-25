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
    accentVar: "--color-warning",
  },
  {
    label: "Students Placed",
    value: "247",
    change: "+18%",
    trend: "up" as const,
    icon: CheckCircle2,
    accentVar: "--color-success",
  },
  {
    label: "Pending Requests",
    value: "8",
    change: "−2 this week",
    trend: "down" as const,
    icon: ClipboardList,
    accentVar: "--color-destructive",
  },
  {
    label: "Conversion Rate",
    value: "78.4%",
    change: "+3.2%",
    trend: "up" as const,
    icon: TrendingUp,
    accentVar: "--color-primary",
  },
];

const quickActions = [
  {
    icon: Sparkles,
    title: "New Placement Drive",
    description: "Launch a recruitment or internship campaign",
    href: "/industry-requests/new",
    accentVar: "--color-success",
    badge: "Popular",
  },
  {
    icon: Users,
    title: "View Candidates",
    description: "Browse & filter student profiles",
    href: "/placements/candidates",
    accentVar: "--color-warning",
  },
  {
    icon: Briefcase,
    title: "Track Placements",
    description: "Monitor status & live analytics",
    href: "/placements",
    accentVar: "--color-primary",
  },
  {
    icon: GraduationCap,
    title: "Find Institutes",
    description: "Search by location & courses",
    href: "/find-institutes",
    accentVar: "--color-accent",
  },
];

const recentActivity = [
  {
    title: "NIT Trichy – Campus Drive Approved",
    time: "2h ago",
    icon: CheckCircle2,
    accentVar: "--color-success",
  },
  {
    title: "IIT Bombay – 50 Applications Received",
    time: "1 day ago",
    icon: Users,
    accentVar: "--color-warning",
  },
  {
    title: "VIT Vellore – Drive Scheduled",
    time: "3 days ago",
    icon: Calendar,
    accentVar: "--color-primary",
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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

        .ind-dash {
          font-family: 'DM Sans', sans-serif;
          background: var(--background);
          min-height: 100vh;
          padding: 24px;
          color: var(--foreground);
        }

        .ind-dash * { box-sizing: border-box; }
        .syne { font-family: 'Syne', sans-serif; }

        .ind-dash > * { position: relative; z-index: 1; }

        /* ─── Hero ─────────────────────────────── */
        .hero-card {
          position: relative;
          overflow: hidden;
          border-radius: 16px;
          padding: 32px;
          background: var(--card);
          border: 1px solid var(--border);
          margin-bottom: 24px;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 100px;
          background: rgba(245, 159, 11, 0.08);
          border: 1px solid rgba(245, 159, 11, 0.2);
          color: var(--color-warning, #F59E0B);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 16px;
        }

        .hero-icon {
          width: 52px;
          height: 52px;
          border-radius: 12px;
          background: var(--color-warning, #F59E0B);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(245, 159, 11, 0.15);
          margin-right: 16px;
          flex-shrink: 0;
        }

        .hero-title {
          font-size: clamp(22px, 3vw, 32px);
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.1;
          color: var(--card-foreground, var(--foreground));
        }

        .hero-sub {
          font-size: 13px;
          color: var(--color-warning, #F59E0B);
          font-weight: 500;
          margin-top: 4px;
          opacity: 0.85;
        }

        .hero-desc {
          margin-top: 16px;
          font-size: 14px;
          color: var(--muted-foreground);
          max-width: 500px;
          line-height: 1.6;
          font-weight: 300;
        }

        /* ─── Stats ─────────────────────────────── */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 24px;
        }

        @media (max-width: 900px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 480px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }

        .stat-card {
          background: var(--card);
          border-radius: 12px;
          padding: 20px;
          border: 1px solid var(--border);
          transition: transform 0.2s ease, border-color 0.2s ease;
          cursor: default;
          position: relative;
          overflow: hidden;
        }

        .stat-card::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--stat-accent);
          opacity: 0.7;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          border-color: var(--stat-accent);
        }

        .stat-icon-wrap {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
          background: rgba(0, 0, 0, 0.05);
        }

        .stat-icon-wrap svg { color: var(--stat-accent); }

        .stat-label {
          font-size: 10px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--muted-foreground);
          font-weight: 600;
          margin-bottom: 6px;
        }

        .stat-value {
          font-family: 'Syne', sans-serif;
          font-size: clamp(22px, 2.5vw, 28px);
          font-weight: 800;
          letter-spacing: -0.03em;
          color: var(--card-foreground, var(--foreground));
        }

        .stat-change {
          font-size: 11px;
          font-weight: 600;
          margin-top: 6px;
        }

        .stat-change.up   { color: var(--color-success, #10B981); }
        .stat-change.down { color: var(--color-destructive, #EF4444); }

        /* ─── Section label ──────────────────────── */
        .section-title {
          font-family: 'Syne', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--muted-foreground);
          margin-bottom: 12px;
          opacity: 0.6;
        }

        .divider-line {
          height: 1px;
          background: var(--border);
          margin: 0 0 20px;
          opacity: 0.5;
        }

        /* ─── Quick Actions ──────────────────────── */
        .actions-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 24px;
        }

        @media (max-width: 1000px) { .actions-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 500px)  { .actions-grid { grid-template-columns: 1fr; } }

        .action-card {
          display: flex;
          flex-direction: column;
          background: var(--card);
          border-radius: 12px;
          padding: 22px;
          border: 1px solid var(--border);
          text-decoration: none;
          color: inherit;
          position: relative;
          overflow: hidden;
          transition: transform 0.2s ease, border-color 0.2s ease;
        }

        .action-card:hover {
          transform: translateY(-3px);
          border-color: var(--action-accent);
        }

        .action-card:hover .action-arrow { transform: translateX(3px); opacity: 0.6; }

        .action-icon-wrap {
          width: 44px;
          height: 44px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
          background: rgba(0, 0, 0, 0.05);
          transition: transform 0.2s ease;
        }

        .action-icon-wrap svg { color: var(--action-accent); }

        .action-card:hover .action-icon-wrap { transform: scale(1.05); }

        .action-title {
          font-family: 'Syne', sans-serif;
          font-size: 14px;
          font-weight: 700;
          color: var(--card-foreground, var(--foreground));
          margin-bottom: 6px;
        }

        .action-desc {
          font-size: 12px;
          color: var(--muted-foreground);
          flex: 1;
          line-height: 1.5;
          font-weight: 300;
        }

        .action-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 16px;
        }

        .action-badge {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 4px 12px;
          border-radius: 100px;
          background: rgba(16, 185, 129, 0.08);
          color: var(--color-success, #10B981);
          border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .action-arrow {
          opacity: 0.25;
          transition: transform 0.2s ease, opacity 0.2s ease;
          color: var(--muted-foreground);
        }

        /* ─── Bottom grid ─────────────────────────── */
        .bottom-grid {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 14px;
        }

        @media (max-width: 1000px) { .bottom-grid { grid-template-columns: 1fr; } }

        /* Activity card */
        .activity-card {
          background: var(--card);
          border-radius: 12px;
          padding: 24px;
          border: 1px solid var(--border);
        }

        .activity-card-title {
          font-family: 'Syne', sans-serif;
          font-size: 15px;
          font-weight: 700;
          color: var(--card-foreground, var(--foreground));
          margin-bottom: 16px;
        }

        .activity-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px;
          border-radius: 10px;
          margin-bottom: 8px;
          background: rgba(0, 0, 0, 0.02);
          border: 1px solid var(--border);
          transition: background 0.2s ease, border-color 0.2s ease;
          cursor: pointer;
        }

        .activity-item:hover {
          background: rgba(0, 0, 0, 0.04);
          border-color: var(--border);
        }

        .activity-item:hover .act-arrow { transform: translateX(3px); opacity: 0.5; }

        .activity-icon {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          background: rgba(0, 0, 0, 0.05);
        }

        .activity-text {
          font-size: 13px;
          font-weight: 500;
          color: var(--card-foreground, var(--foreground));
          margin-bottom: 3px;
        }

        .activity-time {
          font-size: 11px;
          color: var(--muted-foreground);
          display: flex;
          align-items: center;
          gap: 4px;
          font-weight: 300;
        }

        .act-arrow {
          margin-left: auto;
          opacity: 0.2;
          flex-shrink: 0;
          transition: transform 0.2s ease, opacity 0.2s ease;
          color: var(--muted-foreground);
        }

        /* Success Rate Card */
        .rate-card {
          background: var(--card);
          border-radius: 12px;
          padding: 28px 24px;
          border: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          position: relative;
        }

        .rate-ring {
          position: relative;
          width: 100px;
          height: 100px;
          margin-bottom: 16px;
        }

        .rate-ring svg { width: 100%; height: 100%; transform: rotate(-90deg); }

        .rate-ring-bg {
          fill: none;
          stroke: var(--border);
          stroke-width: 6;
        }

        .rate-ring-fill {
          fill: none;
          stroke: var(--color-warning, #F59E0B);
          stroke-width: 6;
          stroke-linecap: round;
          stroke-dasharray: 272;
          stroke-dashoffset: 5;
        }

        .rate-center {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .rate-value {
          font-family: 'Syne', sans-serif;
          font-size: 28px;
          font-weight: 800;
          color: var(--color-warning, #F59E0B);
          letter-spacing: -0.03em;
          line-height: 1;
        }

        .rate-label {
          font-family: 'Syne', sans-serif;
          font-size: 14px;
          font-weight: 700;
          color: var(--card-foreground, var(--foreground));
          margin-bottom: 6px;
        }

        .rate-sublabel {
          font-size: 11px;
          color: var(--muted-foreground);
          font-weight: 300;
          line-height: 1.5;
        }

        /* ─── Animations ──────────────────────────── */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .hero-card              { animation: fadeUp 0.5s ease both; }
        .stats-grid > *         { animation: fadeUp 0.5s ease both; }
        .stats-grid > *:nth-child(1) { animation-delay: 0.08s; }
        .stats-grid > *:nth-child(2) { animation-delay: 0.14s; }
        .stats-grid > *:nth-child(3) { animation-delay: 0.20s; }
        .stats-grid > *:nth-child(4) { animation-delay: 0.26s; }
        .actions-grid > *       { animation: fadeUp 0.5s ease both; }
        .actions-grid > *:nth-child(1) { animation-delay: 0.16s; }
        .actions-grid > *:nth-child(2) { animation-delay: 0.22s; }
        .actions-grid > *:nth-child(3) { animation-delay: 0.28s; }
        .actions-grid > *:nth-child(4) { animation-delay: 0.34s; }
        .bottom-grid > *        { animation: fadeUp 0.5s ease both; animation-delay: 0.36s; }
      `}</style>

      <div className="ind-dash">
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>

          {/* ── Hero ── */}
          <div className="hero-card">
            <div className="hero-badge">
              <Factory size={10} />
              Industry Portal
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div className="hero-icon">
                <Factory size={26} color="white" />
              </div>
              <div>
                <h1 className="hero-title syne">Welcome back, {username} 👋</h1>
                <p className="hero-sub">{industryName}</p>
              </div>
            </div>
            <p className="hero-desc">
              Manage your recruitment drives, track student placements in real time, and build lasting partnerships with top institutes — all from one place.
            </p>
          </div>

          {/* ── Stats ── */}
          <div className="stats-grid">
            {statsData.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={idx}
                  className="stat-card"
                  style={{
                    "--stat-accent": `var(${stat.accentVar})`,
                  } as React.CSSProperties}
                >
                  <div className="stat-icon-wrap">
                    <Icon size={18} />
                  </div>
                  <div className="stat-label">{stat.label}</div>
                  <div className="stat-value">{stat.value}</div>
                  <div className={`stat-change ${stat.trend}`}>
                    {stat.trend === "up" ? "▲" : "▼"} {stat.change}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Quick Actions ── */}
          <div className="section-title">Quick Actions</div>
          <div className="divider-line" />
          <div className="actions-grid">
            {quickActions.map((action, idx) => {
              const Icon = action.icon;
              return (
                <Link
                  key={idx}
                  href={action.href}
                  className="action-card"
                  style={{
                    "--action-accent": `var(${action.accentVar})`,
                  } as React.CSSProperties}
                >
                  <div className="action-icon-wrap">
                    <Icon size={20} />
                  </div>
                  <div className="action-title">{action.title}</div>
                  <div className="action-desc">{action.description}</div>
                  <div className="action-footer">
                    {action.badge
                      ? <span className="action-badge">{action.badge}</span>
                      : <span />
                    }
                    <ArrowRight size={16} className="action-arrow" />
                  </div>
                </Link>
              );
            })}
          </div>

          {/* ── Overview ── */}
          <div className="section-title" style={{ marginTop: 8 }}>Overview</div>
          <div className="divider-line" />
          <div className="bottom-grid">

            <div className="activity-card">
              <div className="activity-card-title">Recent Activity</div>
              {recentActivity.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="activity-item">
                    <div
                      className="activity-icon"
                      style={{
                        background: `rgba(0, 0, 0, 0.06)`,
                      }}
                    >
                      <Icon size={16} style={{ color: `var(${item.accentVar})` }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="activity-text">{item.title}</div>
                      <div className="activity-time">
                        <Clock size={10} />
                        {item.time}
                      </div>
                    </div>
                    <ArrowRight size={14} className="act-arrow" />
                  </div>
                );
              })}
            </div>

            <div className="rate-card">
              <div className="rate-ring">
                <svg viewBox="0 0 100 100">
                  <circle className="rate-ring-bg" cx="50" cy="50" r="43" />
                  <circle className="rate-ring-fill" cx="50" cy="50" r="43" />
                </svg>
                <div className="rate-center">
                  <div className="rate-value">94%</div>
                </div>
              </div>
              <div className="rate-label">Drive Success Rate</div>
              <div className="rate-sublabel">
                Top 5% among all industry<br />partners this quarter
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}