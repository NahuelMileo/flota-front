"use client";
import { useEffect } from "react";

export default function OnboardingAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const tenantId = localStorage.getItem("tenantId");

    if (!token) {
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
