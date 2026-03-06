"use client";
import PublicLandingPage from "@/components/PublicLandingPage";
import { Suspense } from "react";

export default function SearchInstitutesPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-base-200 flex items-center justify-center">Loading...</div>}>
            <PublicLandingPage />
        </Suspense>
    );
}
