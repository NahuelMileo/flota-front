export type MaintenanceAlertStatus = "Upcoming" | "Overdue" | "Resolved"

export type MaintenanceAlert = {
  id: string
  truckId: string
  truckLicensePlate: string
  maintenanceConceptId: string
  maintenanceConceptName: string
  status: MaintenanceAlertStatus
  kmRemaining?: number | null
  daysRemaining?: number | null
  evaluatedAt: string
  isRead: boolean
}

// GET /api/maintenance-alerts/status: estado de cada camión+concepto calculado en el momento.
export type MaintenanceStatusItem = {
  truckId: string
  truckLicensePlate: string
  maintenanceConceptId: string
  maintenanceConceptName: string
  lastMaintenanceDate: string
  lastKilometers: number
  nextDueKilometers?: number | null
  nextDueDate?: string | null
  kmRemaining?: number | null
  daysRemaining?: number | null
  currentKm?: number | null
}

export type MaintenanceFleetStatus = {
  overdue: MaintenanceStatusItem[]
  upcoming: MaintenanceStatusItem[]
  upToDate: MaintenanceStatusItem[]
}
