export type OdometerSource =
  | "Manual"
  | "FuelExpense"
  | "MaintenanceExpense"
  | "TripStart"
  | "TripEnd"

export type OdometerReading = {
  id: string
  truckId: string
  km: number
  readingDateUtc: string
  source: OdometerSource
  expenseId?: string | null
  notes?: string | null
}

const SOURCE_LABELS: Record<OdometerSource, string> = {
  Manual: "Manual",
  FuelExpense: "Gasoil / combustible",
  MaintenanceExpense: "Mantenimiento",
  TripStart: "Inicio viaje",
  TripEnd: "Fin viaje",
}

export function getOdometerSourceLabel(source: OdometerSource): string {
  return SOURCE_LABELS[source] ?? source
}
