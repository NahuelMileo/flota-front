import { cn } from "@/lib/utils"
import { readableTextColor } from "@/lib/color-contrast"
import type { DueDate } from "@/types/due-date"

/** Matrícula pintada con el color del camión, igual que en cuentas a recibir. "Empresa" si no tiene camión. */
export function TruckPlate({ dueDate, className }: { dueDate: Pick<DueDate, "truckLicensePlate" | "truckColor">; className?: string }) {
  if (!dueDate.truckLicensePlate) return <span className={cn("text-muted-foreground", className)}>Empresa</span>
  if (!dueDate.truckColor) return <span className={cn("font-medium", className)}>{dueDate.truckLicensePlate}</span>
  return (
    <span
      className={cn("inline-block rounded-md px-2 py-0.5 font-mono text-[0.8125rem] font-medium tracking-tight", className)}
      style={{ backgroundColor: dueDate.truckColor, color: readableTextColor(dueDate.truckColor) }}
    >
      {dueDate.truckLicensePlate}
    </span>
  )
}
