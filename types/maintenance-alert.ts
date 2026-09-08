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
