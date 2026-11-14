import { AlertTriangleIcon, CheckCircle2Icon, CheckIcon, ClockIcon, XIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatAlertRemaining } from "@/lib/maintenance-alert-format"
import type { MaintenanceAlert } from "@/types/maintenance-alert"

export function MaintenanceAlertItem({
  alert,
  onMarkAsRead,
  onDismiss,
}: {
  alert: MaintenanceAlert
  onMarkAsRead: (alert: MaintenanceAlert) => void
  onDismiss: (alert: MaintenanceAlert) => void
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
            ? "bg-success-surface text-success"
            : isOverdue
              ? "bg-danger-surface text-danger"
              : "bg-warning-surface text-warning"
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
          <div className="flex shrink-0 items-center gap-1">
            {!alert.isRead && (
              <span
                aria-label="No leída"
                className="size-1.5 rounded-full bg-primary"
              />
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="-my-1 -mr-1 size-6 text-muted-foreground hover:text-foreground"
              aria-label={`Borrar aviso de ${alert.maintenanceConceptName} (${alert.truckLicensePlate})`}
              onClick={() => onDismiss(alert)}
            >
              <XIcon className="size-3.5" />
            </Button>
          </div>
        </div>
        <p className="truncate text-xs text-muted-foreground">
          {alert.truckLicensePlate}
        </p>
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <Badge
            variant={isOverdue ? "destructive" : "secondary"}
            className={cn(isResolved && "bg-success text-background")}
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
