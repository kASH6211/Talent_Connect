"use client";
import InstituteDashboard from "@/components/dashboards/InstituteDashboard";
import { useAuth } from "@/hooks/useAuth";
import React from "react";

const page = () => {
  const { user, role, loading } = useAuth();
  const userName = user?.username ?? "Institute";
  return (
    <div>
      <InstituteDashboard username={userName} />; /
    </div>
  );
};

export default page;
