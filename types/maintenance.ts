export type MaintenanceConcept = {
  id: string
  name: string
  kilometerInterval?: number | null
  dateInterval?: number | null
  lastKilometers?: number | null
  lastMaintenanceDate?: string | null
  expenseCategoryId?: string | null
}

export type CreateMaintenanceConceptDto = {
  name: string
  kilometerInterval?: number | null
  dateInterval?: number | null
  expenseCategoryId: string
}

export type Maintenance = {
  id: string
  conceptId: string
  conceptName: string
  type: "Preventive" | "Corrective"
  truckId: string
  truckLicensePlate: string
  date: string
  kilometers: number
  value?: number | null
  valueUSD?: number | null
  valueBRL?: number | null
  valueUYU?: number | null
  currency?: string | null
  notes?: string | null
  expenseId?: string | null
}

export type CreateMaintenanceDto = {
  type: 0 | 1  // 0 = Preventive, 1 = Corrective
  notes?: string | null
  value?: number | null
  currency?: "BRL" | "USD" | "UYU"
  date: string  // ISO datetime
  kilometers: number
  truckId: string
  tripId?: string | null
  maintenanceConceptId: string
}
