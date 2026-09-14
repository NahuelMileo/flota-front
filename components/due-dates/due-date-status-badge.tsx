import { cn } from "@/lib/utils"
import { DUE_DATE_STATUS_LABELS, DUE_DATE_STATUS_TONE } from "@/lib/due-date-format"
import type { DueDateStatus } from "@/types/due-date"

export function DueDateStatusBadge({ status, className }: { status: DueDateStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded-full border px-2 text-xs font-medium whitespace-nowrap",
        DUE_DATE_STATUS_TONE[status],
        className
      )}
    >
      {DUE_DATE_STATUS_LABELS[status]}
    </span>
  )
}
