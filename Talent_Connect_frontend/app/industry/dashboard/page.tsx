"use client";
import IndustryDashboard from "@/components/dashboards/IndustryDashboard";
import { useAuth } from "@/hooks/useAuth";
import React, { useEffect, useState } from "react";
import api from "@/lib/api";

const page = () => {
  const { user, role, loading } = useAuth();
  const userName = user?.username ?? "Industry";
  const [industryName, setIndustryName] = useState("Leading Tech Corp");

  useEffect(() => {
    if (user?.industry_id) {
      api.get(`/industry/${user.industry_id}`)
        .then(res => {
          if (res.data?.industry_name) {
            setIndustryName(res.data.industry_name);
          }
        })
        .catch(console.error);
    }
  }, [user?.industry_id]);

  return (
    <div>
      <IndustryDashboard username={userName} industryName={industryName} />
    </div>
  );
};

export default page;
