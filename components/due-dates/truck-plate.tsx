import { cn } from "@/lib/utils"
import { TruckPlate as Plate } from "@/components/truck-plate"
import type { DueDate } from "@/types/due-date"

/** Matrícula pintada con el color del camión, igual que en cuentas a recibir. "Empresa" si no tiene camión. */
export function TruckPlate({ dueDate, className }: { dueDate: Pick<DueDate, "truckLicensePlate" | "truckColor">; className?: string }) {
  if (!dueDate.truckLicensePlate) return <span className={cn("text-muted-foreground", className)}>Empresa</span>
  return <Plate plate={dueDate.truckLicensePlate} color={dueDate.truckColor} className={className} />
}
