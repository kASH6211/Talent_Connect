"use client";
import AdminDashboard from "@/components/dashboards/AdminDashboard";
import SpinnerFallback from "@/components/Spinner";
import { useAuth } from "@/lib/AuthProvider";
// import { useAuth } from "@/hooks/useAuth";

export const dynamic = "force-dynamic";

const page = () => {
  const { user, role, loading } = useAuth();
  const userNmae = user?.username ?? "Admin";
  if (loading) {
    return <SpinnerFallback />;
  }
  return (
    <div>
      <AdminDashboard username={userNmae} />
    </div>
  );
};

export default page;
