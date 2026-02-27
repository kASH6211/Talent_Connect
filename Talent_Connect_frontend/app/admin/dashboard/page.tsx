"use client";
import AdminDashboard from "@/components/dashboards/AdminDashboard";
import { useAuth } from "@/hooks/useAuth";

export const dynamic = "force-dynamic";

const page = () => {
  const { user, role, loading } = useAuth();
  const userNmae = user?.username ?? "Admin";
  return (
    <div>
      <AdminDashboard username={userNmae} />
    </div>
  );
};

export default page;
