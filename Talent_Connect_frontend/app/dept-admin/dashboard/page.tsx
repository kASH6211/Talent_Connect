"use client";

import { redirect } from "next/navigation";

export default function DeptAdminDashboardPage() {
    redirect("/all-requests");
    return null;
}
