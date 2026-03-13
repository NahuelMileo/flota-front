"use client"
import React, { useEffect, useState } from "react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [isChecking, setIsChecking] = useState(true);

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

    setIsChecking(false);
  }, []);
  
  if (isChecking) return null;
  return <>{children}</>;
}