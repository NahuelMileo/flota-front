import { CheckCircle2Icon } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { DueDateReminderItem } from "@/components/notifications/due-date-reminder-item"
import type { DueDate } from "@/types/due-date"

export function DueDateReminderList({
  reminders,
  isLoading,
  hasError,
  onRetry,
  onMarkAsRead,
  onNavigate,
}: {
  reminders: DueDate[]
  isLoading: boolean
  hasError: boolean
  onRetry: () => void
  onMarkAsRead: (reminder: DueDate) => void
  onNavigate: () => void
}) {
  if (isLoading && reminders.length === 0) {
    return (
      <div className="space-y-2 p-1">
        {[0, 1].map((i) => (
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
        <p className="text-sm text-muted-foreground">No se pudieron cargar los vencimientos.</p>
        <Button variant="outline" size="sm" onClick={onRetry}>
          Reintentar
        </Button>
      </div>
    )
  }

  if (reminders.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-10 text-center">
        <CheckCircle2Icon className="size-8 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">Todo al día</p>
          <p className="text-xs text-muted-foreground">No hay vencimientos próximos ni vencidos.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-h-[70vh] space-y-1 overflow-y-auto p-1 sm:max-h-96">
      {reminders.map((reminder) => (
        <DueDateReminderItem
          key={reminder.id}
          reminder={reminder}
          onMarkAsRead={onMarkAsRead}
          onNavigate={onNavigate}
        />
      ))}
    </div>
  )
}
