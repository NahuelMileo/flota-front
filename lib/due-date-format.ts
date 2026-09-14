import { format } from "date-fns"
import type { DueDate, DueDateStatus, DueDateType } from "@/types/due-date"

export { formatDaysRemaining } from "@/lib/maintenance-alert-format"

export const DUE_DATE_TYPE_LABELS: Record<DueDateType, string> = {
  Insurance: "Seguro",
  Sucta: "SUCTA",
  PropertyTitle: "Libreta de propiedad",
  MtopPermit: "Habilitación MTOP",
  Other: "Otro",
}

export const DUE_DATE_TYPE_OPTIONS = (Object.keys(DUE_DATE_TYPE_LABELS) as DueDateType[]).map((value) => ({
  value,
  label: DUE_DATE_TYPE_LABELS[value],
}))

export const DUE_DATE_STATUS_LABELS: Record<DueDateStatus, string> = {
  Scheduled: "Programado",
  Upcoming: "Próximo",
  DueToday: "Vence hoy",
  Overdue: "Vencido",
  Completed: "Hecho",
}

export const DEFAULT_REMINDER_DAYS = [7, 1]

/** "Seguro · SBX1234" o el título libre si lo tiene. */
export function dueDateName(dueDate: Pick<DueDate, "type" | "title">): string {
  const typeLabel = DUE_DATE_TYPE_LABELS[dueDate.type]
  if (!dueDate.title) return typeLabel
  return dueDate.type === "Other" ? dueDate.title : `${typeLabel} · ${dueDate.title}`
}

export function dueDateOwner(dueDate: Pick<DueDate, "truckLicensePlate" | "truckId">): string {
  return dueDate.truckLicensePlate ?? "Empresa"
}

// Las fechas de negocio viajan como yyyy-MM-dd. new Date("2026-09-20") las lee como UTC
// y en Uruguay caen el día anterior: siempre armar la fecha local a mano.
export function parseIsoDate(value: string): Date {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number)
  return new Date(year, month - 1, day)
}

export function toIsoDate(date: Date): string {
  return format(date, "yyyy-MM-dd")
}

export function formatReminders(days: number[]): string {
  if (days.length === 0) return "Solo el día del vencimiento"
  const parts = [...days].sort((a, b) => b - a).map((d) => (d === 0 ? "el mismo día" : d === 1 ? "1 día" : `${d} días`))
  return `Avisa ${parts.join(", ")} antes`
}

/** Clases de color por estado, compartidas por calendario, lista, campanita y dashboard. */
export const DUE_DATE_STATUS_TONE: Record<DueDateStatus, string> = {
  Overdue: "bg-danger-surface text-danger border-danger-border",
  DueToday: "bg-warning-surface text-warning border-warning-border",
  Upcoming: "bg-warning-surface text-warning border-warning-border",
  Scheduled: "bg-muted text-foreground border-border",
  Completed: "bg-success-surface text-success border-success-border",
}
