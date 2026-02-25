// "use client";

// import { useState, useEffect, useCallback } from "react";
// import {
//   Loader2,
//   Send,
//   ChevronDown,
//   ChevronRight,
//   X,
//   AlertCircle,
//   CheckCircle2,
//   Clock,
//   Ban,
//   Users,
//   CalendarDays,
//   Banknote,
//   FileText,
//   Building2,
// } from "lucide-react";
// import api from "@/lib/api";
// import { useAuth } from "@/hooks/useAuth";

// // ─── Types & Helpers (unchanged) ─────────────────────────────────────────────
// interface OfferRecord {
//   offer_id: number;
//   job_title: string;
//   job_description?: string;
//   salary_min?: number;
//   salary_max?: number;
//   offer_date: string;
//   last_date?: string;
//   number_of_posts?: number;
//   status: "Pending" | "Accepted" | "Rejected" | "Withdrawn";
//   institute: {
//     institute_id: number;
//     institute_name: string;
//     emailId?: string;
//     mobileno?: string;
//   };
//   industry: { industry_name: string };
// }

// interface OfferGroup {
//   key: string;
//   job_title: string;
//   job_description?: string;
//   salary_min?: number;
//   salary_max?: number;
//   offer_date: string;
//   last_date?: string;
//   number_of_posts?: number;
//   rows: OfferRecord[];
//   accepted: number;
//   rejected: number;
//   pending: number;
//   withdrawn: number;
// }

// const STATUS_BADGE: Record<string, string> = {
//   Accepted: "badge-success",
//   Pending: "badge-warning",
//   Rejected: "badge-error",
//   Withdrawn: "badge-neutral",
// };

// const STATUS_ICON: Record<string, any> = {
//   Accepted: CheckCircle2,
//   Pending: Clock,
//   Rejected: Ban,
//   Withdrawn: X,
// };

// function StatusBadge({ status }: { status: string }) {
//   const cls = STATUS_BADGE[status] ?? "badge-warning";
//   const Icon = STATUS_ICON[status] ?? Clock;
//   return (
//     <span className={`badge ${cls} gap-1.5 px-2 py-0.5 text-xs font-medium`}>
//       <Icon size={11} />
//       {status}
//     </span>
//   );
// }

// function fmt(n?: number) {
//   if (!n) return null;
//   return `₹${n >= 100000 ? (n / 100000).toFixed(1) + "L" : (n / 1000).toFixed(0) + "K"}`;
// }

// function formatDate(d: string) {
//   try {
//     return new Date(d).toLocaleDateString("en-IN", {
//       day: "2-digit",
//       month: "short",
//       year: "numeric",
//     });
//   } catch {
//     return d;
//   }
// }

// function salaryStr(min?: number, max?: number) {
//   const mn = fmt(min);
//   const mx = fmt(max);
//   if (mn && mx) return `${mn} – ${mx}`;
//   if (mn) return `From ${mn}`;
//   if (mx) return `Up to ${mx}`;
//   return null;
// }

// function groupOffers(offers: OfferRecord[]): OfferGroup[] {
//   const map = new Map<string, OfferGroup>();
//   for (const o of offers) {
//     const key = `${o.job_title}__${o.offer_date}`;
//     if (!map.has(key)) {
//       map.set(key, {
//         key,
//         job_title: o.job_title,
//         job_description: o.job_description,
//         salary_min: o.salary_min,
//         salary_max: o.salary_max,
//         offer_date: o.offer_date,
//         last_date: o.last_date,
//         number_of_posts: o.number_of_posts,
//         rows: [],
//         accepted: 0,
//         rejected: 0,
//         pending: 0,
//         withdrawn: 0,
//       });
//     }
//     const g = map.get(key)!;
//     g.rows.push(o);
//     if (o.status === "Accepted") g.accepted++;
//     else if (o.status === "Rejected") g.rejected++;
//     else if (o.status === "Withdrawn") g.withdrawn++;
//     else g.pending++;
//   }
//   return [...map.values()];
// }

// // ─── Stat Card ─────────────────────────────────────────────────────────────
// function StatCard({
//   label,
//   count,
//   onClick,
//   active,
//   icon: Icon,
// }: {
//   label: string;
//   count: number;
//   onClick: () => void;
//   active: boolean;
//   icon: any;
// }) {
//   return (
//     <button
//       onClick={onClick}
//       className={`group rounded-xl p-4 border transition-all duration-200 hover:shadow-lg hover:scale-[1.02] flex flex-col items-center gap-2 text-center ${
//         active
//           ? "border-primary bg-primary/5 shadow-lg ring-1 ring-primary/30"
//           : "border-base-200 bg-base-100 hover:border-primary/20 hover:bg-base-50"
//       }`}
//     >
//       <div
//         className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${
//           active
//             ? "bg-primary shadow-md"
//             : "bg-base-200 group-hover:bg-primary/10"
//         }`}
//       >
//         <Icon
//           size={20}
//           className={`${
//             active
//               ? "text-primary-content"
//               : "text-base-content/70 group-hover:text-primary"
//           }`}
//         />
//       </div>
//       <div className="space-y-0.5">
//         <div
//           className={`text-xl font-bold ${active ? "text-primary" : "text-base-content"}`}
//         >
//           {count}
//         </div>
//         <div className="text-xs font-medium text-base-content/70 uppercase tracking-wide">
//           {label}
//         </div>
//       </div>
//     </button>
//   );
// }

// // ─── Offer Group Card ───────────────────────────────────────────────────────
// function OfferGroupCard({
//   group,
//   onWithdraw,
// }: {
//   group: OfferGroup;
//   onWithdraw: (id: number) => void;
// }) {
//   const [open, setOpen] = useState(true);
//   const [withdrawing, setWithdrawing] = useState<number | null>(null);

//   const handleWithdraw = async (offerId: number) => {
//     setWithdrawing(offerId);
//     try {
//       await api.patch(`/job-offer/${offerId}/status`, { status: "Withdrawn" });
//       onWithdraw(offerId);
//     } finally {
//       setWithdrawing(null);
//     }
//   };

//   const salary = salaryStr(group.salary_min, group.salary_max);

//   return (
//     <div className="rounded-xl bg-base-100 border border-base-200 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-200 overflow-hidden">
//       {/* Header */}
//       <button
//         onClick={() => setOpen((o) => !o)}
//         className="w-full p-4 hover:bg-base-50 transition-colors text-left"
//       >
//         <div className="flex items-start justify-between gap-3">
//           <div className="flex-1 min-w-0 space-y-2">
//             <div className="flex items-start gap-3">
//               <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary/70 rounded-lg flex items-center justify-center shadow flex-shrink-0">
//                 <Send size={18} className="text-primary-content" />
//               </div>
//               <div className="min-w-0 flex-1">
//                 <h3 className="font-semibold text-base-content text-sm line-clamp-2 hover:text-primary">
//                   {group.job_title}
//                 </h3>
//                 <div className="flex flex-wrap gap-1.5 mt-1.5">
//                   {salary && (
//                     <span className="badge badge-success text-xs px-2 py-0.5 font-mono">
//                       {salary}
//                     </span>
//                   )}
//                   {group.number_of_posts && (
//                     <span className="badge badge-outline text-xs px-2 py-0.5">
//                       {group.number_of_posts} post
//                       {group.number_of_posts !== 1 ? "s" : ""}
//                     </span>
//                   )}
//                 </div>
//               </div>
//             </div>
//             <div className="flex items-center gap-3 text-xs text-base-content/60 flex-wrap">
//               <div className="flex items-center gap-1">
//                 <CalendarDays size={12} />
//                 {formatDate(group.offer_date)}
//               </div>
//               {group.last_date && (
//                 <div className="flex items-center gap-1 bg-warning/10 px-2 py-0.5 rounded-md text-warning text-xs font-medium">
//                   <CalendarDays size={11} />
//                   {formatDate(group.last_date)}
//                 </div>
//               )}
//               <div className="flex items-center gap-1">
//                 <Building2 size={12} />
//                 {group.rows.length} institute
//                 {group.rows.length !== 1 ? "s" : ""}
//               </div>
//             </div>
//           </div>

//           <div className="flex flex-col items-end gap-2 flex-shrink-0 ml-2">
//             <div className="flex items-center gap-1 flex-wrap">
//               {group.accepted > 0 && (
//                 <span className="badge badge-success text-xs px-1.5 py-0.5">
//                   {group.accepted}
//                 </span>
//               )}
//               {group.pending > 0 && (
//                 <span className="badge badge-warning text-xs px-1.5 py-0.5">
//                   {group.pending}
//                 </span>
//               )}
//               {group.rejected > 0 && (
//                 <span className="badge badge-error text-xs px-1.5 py-0.5">
//                   {group.rejected}
//                 </span>
//               )}
//               {group.withdrawn > 0 && (
//                 <span className="badge badge-neutral text-xs px-1.5 py-0.5">
//                   {group.withdrawn}
//                 </span>
//               )}
//             </div>
//             <div
//               className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
//                 open
//                   ? "bg-primary/10 text-primary rotate-180"
//                   : "bg-base-200 text-base-content/40 hover:bg-primary/10 hover:text-primary"
//               }`}
//             >
//               {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
//             </div>
//           </div>
//         </div>
//       </button>

//       {/* Table */}
//       {open && (
//         <div className="border-t border-base-200">
//           <div className="overflow-x-auto">
//             <table className="table w-full text-xs">
//               <thead>
//                 <tr className="bg-base-50">
//                   <th className="font-semibold text-base-content/80 py-3 px-4">
//                     Institute
//                   </th>
//                   <th className="font-semibold text-base-content/80 py-3 px-4">
//                     Contact
//                   </th>
//                   <th className="font-semibold text-base-content/80 py-3 px-4 text-center">
//                     Status
//                   </th>
//                   <th className="font-semibold text-base-content/80 py-3 px-4 text-right">
//                     Action
//                   </th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {group.rows.map((row) => (
//                   <tr
//                     key={row.offer_id}
//                     className="hover:bg-base-50 border-b border-base-200/30 last:border-b-0"
//                   >
//                     <td className="font-medium text-base-content py-3 px-4 max-w-xs truncate">
//                       {row.institute?.institute_name ??
//                         `Institute #${row.offer_id}`}
//                     </td>
//                     <td className="py-3 px-4">
//                       <div className="space-y-0.5 text-xs">
//                         {row.institute?.emailId && (
//                           <div className="flex items-center gap-1.5 text-base-content/70">
//                             <div className="w-1.5 h-1.5 bg-base-400 rounded-full" />
//                             <span className="lowercase font-mono truncate max-w-32">
//                               {row.institute.emailId}
//                             </span>
//                           </div>
//                         )}
//                         {row.institute?.mobileno && (
//                           <div className="flex items-center gap-1.5 text-base-content/70">
//                             <div className="w-1.5 h-1.5 bg-base-400 rounded-full" />
//                             <span className="truncate">
//                               {row.institute.mobileno}
//                             </span>
//                           </div>
//                         )}
//                         {!row.institute?.emailId &&
//                           !row.institute?.mobileno && (
//                             <span className="text-base-content/40">
//                               No contact
//                             </span>
//                           )}
//                       </div>
//                     </td>
//                     <td className="text-center py-3 px-4">
//                       <StatusBadge status={row.status} />
//                     </td>
//                     <td className="py-3 px-4 text-right">
//                       {row.status === "Pending" && (
//                         <button
//                           onClick={() => handleWithdraw(row.offer_id)}
//                           disabled={withdrawing === row.offer_id}
//                           className="btn btn-outline btn-error btn-xs gap-1 px-3 py-1 text-xs"
//                         >
//                           {withdrawing === row.offer_id ? (
//                             <Loader2 size={12} className="animate-spin" />
//                           ) : (
//                             <X size={12} />
//                           )}
//                           Withdraw
//                         </button>
//                       )}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// // ─── Main Component ──────────────────────────────────────────────────────────
// export default function SentOffersPage() {
//   const { isIndustry } = useAuth();
//   const [offers, setOffers] = useState<OfferRecord[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [filter, setFilter] = useState<
//     "All" | "Accepted" | "Pending" | "Rejected"
//   >("All");

//   const fetchOffers = useCallback(async () => {
//     setLoading(true);
//     try {
//       const res = await api.get("/job-offer/sent");
//       setOffers(res.data ?? []);
//     } catch {
//       setError("Failed to load sent offers.");
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchOffers();
//   }, [fetchOffers]);

//   const handleWithdraw = (offerId: number) => {
//     setOffers((prev) =>
//       prev.map((o) =>
//         o.offer_id === offerId ? { ...o, status: "Withdrawn" } : o,
//       ),
//     );
//   };

//   const total = offers.length;
//   const accepted = offers.filter((o) => o.status === "Accepted").length;
//   const pending = offers.filter((o) => o.status === "Pending").length;
//   const rejected = offers.filter((o) => o.status === "Rejected").length;

//   const filteredOffers = offers.filter(
//     (o) => filter === "All" || o.status === filter,
//   );
//   const groups = groupOffers(filteredOffers);

//   return (
//     <div className="p-2 sm:p-3 lg:p-4">
//       {" "}
//       {/* Ultra-minimal padding */}
//       <div className="w-full">
//         {" "}
//         {/* Full screen width */}
//         {/* Header */}
//         <div className="mb-8">
//           <h1 className="text-2xl sm:text-3xl font-bold text-base-content flex items-center gap-2 mb-2">
//             <Send size={26} className="text-primary" />
//             Sent Job Offers
//           </h1>
//           <p className="text-base-content/60 text-base sm:text-lg max-w-2xl">
//             Track responses from institutes for every offer you've sent.
//           </p>
//         </div>
//         {loading ? (
//           <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
//             {[1, 2, 3, 4].map((i) => (
//               <div
//                 key={i}
//                 className="h-32 sm:h-28 rounded-xl bg-base-200 animate-pulse border"
//               />
//             ))}
//           </div>
//         ) : error ? (
//           <div className="alert alert-error shadow-md rounded-xl max-w-sm mx-auto">
//             <AlertCircle size={18} />
//             <span>{error}</span>
//           </div>
//         ) : offers.length === 0 ? (
//           <div className="flex flex-col items-center justify-center py-20 gap-4 text-base-content/40 text-center">
//             <div className="w-16 h-16 rounded-xl bg-base-200 flex items-center justify-center border-2 border-dashed border-base-300">
//               <Send size={28} className="opacity-40" />
//             </div>
//             <div>
//               <h3 className="text-xl font-bold mb-1">No offers sent yet</h3>
//               <p className="text-sm">
//                 Use{" "}
//                 <a
//                   href="/find-institutes"
//                   className="text-primary font-semibold hover:underline"
//                 >
//                   Find Institutes
//                 </a>{" "}
//                 to get started
//               </p>
//             </div>
//           </div>
//         ) : (
//           <>
//             {/* Stats */}
//             <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
//               <StatCard
//                 label="Total Sent"
//                 count={total}
//                 onClick={() => setFilter("All")}
//                 active={filter === "All"}
//                 icon={Send}
//               />
//               <StatCard
//                 label="Accepted"
//                 count={accepted}
//                 onClick={() => setFilter("Accepted")}
//                 active={filter === "Accepted"}
//                 icon={CheckCircle2}
//               />
//               <StatCard
//                 label="Pending"
//                 count={pending}
//                 onClick={() => setFilter("Pending")}
//                 active={filter === "Pending"}
//                 icon={Clock}
//               />
//               <StatCard
//                 label="Not Interested"
//                 count={rejected}
//                 onClick={() => setFilter("Rejected")}
//                 active={filter === "Rejected"}
//                 icon={Ban}
//               />
//             </div>

//             {/* Groups */}
//             <div className="space-y-4">
//               {groups.length === 0 ? (
//                 <div className="flex flex-col items-center justify-center py-16 gap-3 text-base-content/40 text-center rounded-xl border-2 border-dashed border-base-300 bg-base-50">
//                   <Send size={28} className="opacity-40" />
//                   <div>
//                     <h3 className="text-lg font-bold mb-1">
//                       No matching offers
//                     </h3>
//                     <p className="text-sm">
//                       No {filter !== "All" ? `${filter.toLowerCase()} ` : ""}
//                       offers found
//                     </p>
//                   </div>
//                 </div>
//               ) : (
//                 groups.map((g) => (
//                   <OfferGroupCard
//                     key={g.key}
//                     group={g}
//                     onWithdraw={handleWithdraw}
//                   />
//                 ))
//               )}
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }

import SentOffersListView from "@/views/sent-offer/view/Sentofferslistview";
import React from "react";

const page = () => {
  return (
    <div>
      <SentOffersListView />
    </div>
  );
};

export default page;
