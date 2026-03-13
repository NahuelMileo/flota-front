"use client";
import { useEffect, useState } from "react";

export default function OnboardingAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isChecking, setIsChecking] = useState(true);

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
    setIsChecking(false);
  }, []);

  if (isChecking) return null;
  return <>{children}</>;
}
