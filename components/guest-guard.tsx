"use client";
import { useEffect, useState } from "react";

export default function GuestGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const tenantId = localStorage.getItem("tenantId");

    if (token) {
      if (tenantId) {
        window.location.href = "/dashboard";
        return;
      } else {
        window.location.href = "/onboarding";
        return;
      }
    }
    setIsChecking(false);
  }, []);

  if (isChecking) return null;
  return <>{children}</>;
}
