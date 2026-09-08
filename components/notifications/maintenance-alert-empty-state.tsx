import { CheckCircle2Icon } from "lucide-react"

export function MaintenanceAlertEmptyState() {
  return (
    <div className="flex flex-col items-center gap-2 py-10 text-center">
      <CheckCircle2Icon className="size-8 text-muted-foreground" />
      <div>
        <p className="text-sm font-medium">Todo al día</p>
        <p className="text-xs text-muted-foreground">
          No hay mantenimientos próximos ni vencidos.
        </p>
      </div>
    </div>
  )
}
