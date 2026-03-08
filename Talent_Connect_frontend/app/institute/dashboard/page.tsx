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
  const [instituteName, setInstituteName] = useState<string | undefined>(undefined);
  const [nameLoading, setNameLoading] = useState(false);

  useEffect(() => {
    if (user?.institute_id) {
      setNameLoading(true);
      api
        .get(`/institute/${user.institute_id}`)
        .then((res) => {
          if (res.data?.institute_name) {
            setInstituteName(res.data.institute_name);
          }
        })
        .catch(console.error)
        .finally(() => setNameLoading(false));
    }
  }, [user?.institute_id]);

  if (loading || nameLoading) {
    return <SpinnerFallback title="Loading Dashboard..." />;
  }

  return (
    <div>
      <InstituteDashboard username={userName} instituteName={instituteName} />
    </div>
  );
};

export default page;
