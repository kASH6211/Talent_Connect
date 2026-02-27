"use client";
import IndustryDashboard from "@/components/dashboards/IndustryDashboard";
import { useAuth } from "@/hooks/useAuth";
import React from "react";

const page = () => {
  const { user, role, loading } = useAuth();
  const userName = user?.username ?? "Industry";
  return (
    <div>
      <IndustryDashboard username={userName} />
    </div>
  );
};

export default page;
