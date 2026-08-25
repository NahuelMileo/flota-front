"use client"
import React, { useEffect, useState } from "react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
<<<<<<< HEAD
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    const tenantId = localStorage.getItem("tenantId");

    if (!isAuthenticated) {
=======
    const userId = localStorage.getItem("userId");
    const tenantId = localStorage.getItem("tenantId");

    if (!userId) {
>>>>>>> 7d28b39 (some fixes: cookies, charts)
      window.location.href = "/login";
      return;
    }

    if (!tenantId) {
      window.location.href = "/onboarding";
      return;
    }

    setAuthorized(true);
  }, []);

  if (!authorized) return null;

  return <>{children}</>;
}