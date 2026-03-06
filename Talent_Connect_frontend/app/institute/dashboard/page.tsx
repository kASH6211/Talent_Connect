"use client";
import InstituteDashboard from "@/components/dashboards/InstituteDashboard";
// import { useAuth } from "@/hooks/useAuth";
import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/lib/AuthProvider";
import SpinnerFallback from "@/components/Spinner";

const page = () => {
  const { user, role, loading } = useAuth();
  const userName = user?.username ?? "Institute";
  const [instituteName, setInstituteName] = useState("Top University");

  if (loading) {
    return <SpinnerFallback />;
  }

  useEffect(() => {
    if (user?.institute_id) {
      api
        .get(`/institute/${user.institute_id}`)
        .then((res) => {
          if (res.data?.institute_name) {
            setInstituteName(res.data.institute_name);
          }
        })
        .catch(console.error);
    }
  }, [user?.institute_id]);

  return (
    <div>
      <InstituteDashboard username={userName} instituteName={instituteName} />
    </div>
  );
};

export default page;
