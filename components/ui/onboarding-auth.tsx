"use client";
import { useEffect } from "react";

export default function OnboardingAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    const tenantId = localStorage.getItem("tenantId");

    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }

    if (tenantId) {
      window.location.href = "/dashboard";
      return;
    }
  }, []);

  return <>{children}</>;
}
