"use client";
import PublicLandingPage from "@/components/PublicLandingPage";
import SpinnerFallback from "@/components/Spinner";
import { Suspense } from "react";

export default function SearchInstitutesPage() {
  return (
    <Suspense fallback={<SpinnerFallback />}>
      <PublicLandingPage />
    </Suspense>
  );
}
