export type DueDateType = "Insurance" | "Sucta" | "PropertyTitle" | "MtopPermit" | "Other"

// Lo calcula el backend en cada lectura con la fecha de hoy en Montevideo; el front
// solo lo muestra, nunca lo recalcula.
export type DueDateStatus = "Scheduled" | "Upcoming" | "DueToday" | "Overdue" | "Completed"

export type DueDate = {
  id: string
  type: DueDateType
  title?: string | null
  /** yyyy-MM-dd */
  dueOn: string
  truckId?: string | null
  truckLicensePlate?: string | null
  /** Hex #RRGGBB del camión (ABM de camiones); el calendario pinta el vencimiento con él. */
  truckColor?: string | null
  notes?: string | null
  reminderDaysBefore: number[]
  completedAt?: string | null
  daysRemaining: number
  status: DueDateStatus
  /** Solo relevante con un aviso activo (Upcoming, DueToday, Overdue). */
  isRead: boolean
}

export type SaveDueDateDto = {
  type: DueDateType
  title: string | null
  dueOn: string
  truckId: string | null
  notes: string | null
  reminderDaysBefore: number[]
}
