"use client";
import { useEffect } from "react";

export default function GuestGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const tenantId = localStorage.getItem("tenantId");

    if (token) {
      if (tenantId) {
        window.location.href = "/dashboard";
      } else {
        window.location.href = "/onboarding";
      }
    }
  }, []);

  return <>{children}</>;
}
