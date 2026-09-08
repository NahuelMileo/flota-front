import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { MaintenanceAlertItem } from "@/components/notifications/maintenance-alert-item"
import { MaintenanceAlertEmptyState } from "@/components/notifications/maintenance-alert-empty-state"
import type { MaintenanceAlert } from "@/types/maintenance-alert"

export function MaintenanceAlertList({
  alerts,
  isLoading,
  hasError,
  onRetry,
  onMarkAsRead,
}: {
  alerts: MaintenanceAlert[]
  isLoading: boolean
  hasError: boolean
  onRetry: () => void
  onMarkAsRead: (alert: MaintenanceAlert) => void
}) {
  if (isLoading) {
    return (
      <div className="space-y-2 p-1">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-start gap-3 p-3">
            <Skeleton className="size-8 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (hasError) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-center">
        <p className="text-sm text-muted-foreground">
          No se pudieron cargar las notificaciones.
        </p>
        <Button variant="outline" size="sm" onClick={onRetry}>
          Reintentar
        </Button>
      </div>
    )
  }

  if (alerts.length === 0) {
    return <MaintenanceAlertEmptyState />
  }

  return (
    <div className="max-h-[70vh] space-y-1 overflow-y-auto p-1 sm:max-h-96">
      {alerts.map((alert) => (
        <MaintenanceAlertItem key={alert.id} alert={alert} onMarkAsRead={onMarkAsRead} />
      ))}
    </div>
  )
}
