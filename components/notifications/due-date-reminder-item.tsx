import Link from "next/link"
import { AlertTriangleIcon, CalendarClockIcon, CheckIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  DUE_DATE_STATUS_LABELS,
  dueDateName,
  dueDateOwner,
  formatDaysRemaining,
  parseIsoDate,
} from "@/lib/due-date-format"
import type { DueDate } from "@/types/due-date"

const dateFormatter = new Intl.DateTimeFormat("es-UY", { day: "numeric", month: "short" })

export function DueDateReminderItem({
  reminder,
  onMarkAsRead,
  onNavigate,
}: {
  reminder: DueDate
  onMarkAsRead: (reminder: DueDate) => void
  onNavigate: () => void
}) {
  const isOverdue = reminder.status === "Overdue"

  return (
    <div className={cn("flex w-full items-start gap-3 rounded-md p-3", !reminder.isRead && "bg-muted/60")}>
      <span
        className={cn(
          "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full",
          isOverdue ? "bg-danger-surface text-danger" : "bg-warning-surface text-warning"
        )}
      >
        {isOverdue ? <AlertTriangleIcon className="size-4" /> : <CalendarClockIcon className="size-4" />}
      </span>
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/vencimientos?fecha=${reminder.dueOn}`}
            onClick={onNavigate}
            className={cn("truncate text-sm hover:underline", !reminder.isRead && "font-medium")}
          >
            {dueDateName(reminder)}
          </Link>
          {!reminder.isRead && (
            <span aria-label="No leída" className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
          )}
        </div>
        <p className="truncate text-xs text-muted-foreground">
          {dueDateOwner(reminder)} · {dateFormatter.format(parseIsoDate(reminder.dueOn))}
        </p>
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <Badge variant={isOverdue ? "destructive" : "secondary"}>{DUE_DATE_STATUS_LABELS[reminder.status]}</Badge>
          {reminder.status !== "DueToday" && (
            <span className="text-xs text-muted-foreground tabular-nums">{formatDaysRemaining(reminder.daysRemaining)}</span>
          )}
        </div>
        {!reminder.isRead && (
          <Button type="button" variant="outline" size="sm" className="mt-1" onClick={() => onMarkAsRead(reminder)}>
            <CheckIcon className="size-3.5" />
            Marcar como leída
          </Button>
        )}
      </div>
    </div>
  )
}
