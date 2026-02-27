// "use client";

import IndustryLandingPage from "@/components/IndustryLanding";

// import { useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { useAuth } from "@/hooks/useAuth";
// import AdminDashboard from "@/components/dashboards/AdminDashboard";
// import InstituteDashboard from "@/components/dashboards/InstituteDashboard";
// import IndustryDashboard from "@/components/dashboards/IndustryDashboard";

// export default function DashboardPage() {
//   const { user, role, loading } = useAuth();
//   const router = useRouter();

//   useEffect(() => {
//     if (!loading && !user) {
//       router.replace("/login");
//     }
//   }, [loading, user, router]);

//   if (loading || !user) {
//     return (
//       <div className="flex items-center justify-center min-h-[60vh]">
//         <div className="flex flex-col items-center gap-3">
//           <span className="loading loading-spinner loading-md text-primary" />
//           <span className="text-base-content/40 text-sm">Loading…</span>
//         </div>
//       </div>
//     );
//   }

//   if (role === "institute") {
//     return <InstituteDashboard username={user.username} />;
//   }

//   if (role === "industry") {
//     return <IndustryDashboard username={user.username} />;
//   }

//   // Default: admin
//   return <AdminDashboard username={user.username} />;
// }

export default function Home() {
  return <IndustryLandingPage />;
}
