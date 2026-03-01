"use client";

import Link from "next/link";
import { Factory, Send } from "lucide-react";
import Sentofferslistview from "@/views/sent-offer/view/Sentofferslistview";


// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function IndustryDashboard({
  username,
  industryName = "Leading Tech Corp",
}: {
  username: string;
  industryName?: string;
}) {
  return (
    <div className="w-full mx-auto">
      {/* ── Hero ── */}
      <div className="relative overflow-hidden rounded-2xl bg-base-100 dark:bg-base-900 border border-base-300 dark:border-base-700 shadow-sm p-6 sm:p-7 mb-8">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-primary/8 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 flex-shrink-0">
              <Factory
                size={22}
                className="text-primary-content"
                strokeWidth={2}
              />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-base-content tracking-tight leading-tight">
                Welcome, {username} 👋
              </h1>
              <p className="text-sm text-primary font-semibold mt-0.5">
                Industry Dashboard · {industryName}
              </p>
            </div>
          </div>
          <Link
            href="/find-institutes"
            className={`
                  inline-flex items-center gap-2.5 px-6 py-3 rounded-full
                  border-2 border-primary text-primary font-semibold text-sm
                  hover:bg-primary hover:text-primary-content
                  hover:shadow-[0_0_20px_rgba(var(--p),0.4)]
                  transition-all duration-300 ease-in-out
                  active:scale-95
                `}
          >
            <Send
              size={17}
              className="group-hover:scale-110 transition-transform"
            />
            Find Institutes • Send Offer
          </Link>
        </div>
        <p className="mt-4 text-sm text-base-content/50 max-w-2xl">
          Manage drives, track placements, and collaborate with institutes
          seamlessly.
        </p>
      </div>

      {/* ── Sent Offers View ── */}
      <div className="mt-8">
        <Sentofferslistview />
      </div>
    </div>
  );
}
