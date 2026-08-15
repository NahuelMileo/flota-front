"use client";
import { useEffect } from "react";

export default function GuestGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    const tenantId = localStorage.getItem("tenantId");

    if (isAuthenticated) {
      if (tenantId) {
        window.location.href = "/dashboard";
      } else {
        window.location.href = "/onboarding";
      }
    }
  }, []);

  return <>{children}</>;
}
