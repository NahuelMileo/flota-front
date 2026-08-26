"use client";
import { useEffect, useState } from "react";

export default function GuestGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    const tenantId = localStorage.getItem("tenantId");

    if (isAuthenticated) {
      if (tenantId) {
        window.location.href = "/dashboard";
      } else {
        window.location.href = "/onboarding";
      }
      return;
    }

    setAuthorized(true);
  }, []);

  if (!authorized) return null;

  return <>{children}</>;
}
