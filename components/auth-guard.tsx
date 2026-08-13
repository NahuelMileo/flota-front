"use client"
import React, { useEffect } from "react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    const tenantId = localStorage.getItem("tenantId");

    if (!isAuthenticated) {
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