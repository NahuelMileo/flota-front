"use client"

import { useMaintenanceAlertsContext } from "@/context/maintenance-alerts-context"

export function useMaintenanceAlerts() {
  return useMaintenanceAlertsContext()
}
