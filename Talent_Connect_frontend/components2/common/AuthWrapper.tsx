"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface Props {
  children: React.ReactNode;
}

export default function AuthWrapper({ children }: Props) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
    }
  }, [router]);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  if (!token) {
    return null; 
  }

  return <>{children}</>;
}
