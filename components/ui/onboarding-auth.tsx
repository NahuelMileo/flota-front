"use client";
import { useEffect, useState } from "react";

export default function OnboardingAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  const [authorized, setAuthorized] = useState(false);

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

    setAuthorized(true);
  }, []);

  if (!authorized) return null;

  return <>{children}</>;
}
