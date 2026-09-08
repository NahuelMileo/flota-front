import { AlertTriangleIcon, CheckCircle2Icon, CheckIcon, ClockIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatAlertRemaining } from "@/lib/maintenance-alert-format"
import type { MaintenanceAlert } from "@/types/maintenance-alert"

export function MaintenanceAlertItem({
  alert,
  onMarkAsRead,
}: {
  alert: MaintenanceAlert
  onMarkAsRead: (alert: MaintenanceAlert) => void
}) {
  const isOverdue = alert.status === "Overdue"
  const isResolved = alert.status === "Resolved"
  const remaining = formatAlertRemaining(alert.kmRemaining, alert.daysRemaining)

  return (
    <div
      className={cn(
        "flex w-full items-start gap-3 rounded-md p-3",
        !alert.isRead && "bg-muted/60"
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full",
          isResolved
            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-500"
            : isOverdue
              ? "bg-destructive/10 text-destructive"
              : "bg-amber-500/10 text-amber-600 dark:text-amber-500"
        )}
      >
        {isResolved ? (
          <CheckCircle2Icon className="size-4" />
        ) : isOverdue ? (
          <AlertTriangleIcon className="size-4" />
        ) : (
          <ClockIcon className="size-4" />
        )}
      </span>
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <p className={cn("truncate text-sm", !alert.isRead && "font-medium")}>
            {alert.maintenanceConceptName}
          </p>
          {!alert.isRead && (
            <span
              aria-label="No leída"
              className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary"
            />
          )}
        </div>
        <p className="truncate text-xs text-muted-foreground">
          {alert.truckLicensePlate}
        </p>
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <Badge
            variant={isOverdue ? "destructive" : "secondary"}
            className={cn(isResolved && "bg-emerald-600 text-white dark:bg-emerald-600")}
          >
            {isResolved ? "Resuelto" : isOverdue ? "Vencido" : "Próximo"}
          </Badge>
          {remaining && (
            <span className="text-xs text-muted-foreground">{remaining}</span>
          )}
        </div>
        {!alert.isRead && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-1"
            onClick={() => onMarkAsRead(alert)}
          >
            <CheckIcon className="size-3.5" />
            Marcar como leída
          </Button>
        )}
      </div>
    </div>
  )
}
