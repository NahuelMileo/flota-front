"use client"
import React, { useEffect } from "react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const tenantId = localStorage.getItem("tenantId");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    if (!tenantId) {
      window.location.href = "/onboarding";
      return;
    }
  }, []);

  return <>{children}</>;
}