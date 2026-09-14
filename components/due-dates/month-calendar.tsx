"use client"

import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns"
import { es } from "date-fns/locale"
import { AlertTriangleIcon, CheckIcon, ClockIcon, PlusIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { readableTextColor } from "@/lib/color-contrast"
import { DUE_DATE_STATUS_LABELS, dueDateName, toIsoDate } from "@/lib/due-date-format"
import type { DueDate } from "@/types/due-date"

const WEEK_STARTS_ON = 1 // lunes, como en Uruguay

export function calendarRange(month: Date) {
  return {
    start: startOfWeek(startOfMonth(month), { weekStartsOn: WEEK_STARTS_ON }),
    end: endOfWeek(endOfMonth(month), { weekStartsOn: WEEK_STARTS_ON }),
  }
}

export function MonthCalendar({
  month,
  dueDates,
  highlightedDate,
  onAdd,
  onSelect,
}: {
  month: Date
  dueDates: DueDate[]
  /** yyyy-MM-dd que llega desde la campanita. */
  highlightedDate?: string | null
  onAdd: (isoDate: string) => void
  onSelect: (dueDate: DueDate) => void
}) {
  const { start, end } = calendarRange(month)
  const days = eachDayOfInterval({ start, end })
  const weekdays = days.slice(0, 7).map((d) => format(d, "EEEEEE", { locale: es }))

  const byDay = new Map<string, DueDate[]>()
  for (const dueDate of dueDates) {
    const list = byDay.get(dueDate.dueOn) ?? []
    list.push(dueDate)
    byDay.set(dueDate.dueOn, list)
  }

  return (
    <div className="border-t">
      <div className="grid grid-cols-7 border-b">
        {weekdays.map((day) => (
          <div key={day} className="px-2 py-2 text-xs font-medium capitalize text-muted-foreground">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day, index) => {
          const iso = toIsoDate(day)
          const items = byDay.get(iso) ?? []
          const inMonth = isSameMonth(day, month)
          const today = isToday(day)
          const label = format(day, "d 'de' MMMM", { locale: es })
          return (
            <div
              key={iso}
              onClick={() => onAdd(iso)}
              className={cn(
                "group/day relative flex min-h-28 cursor-pointer flex-col gap-1 border-b p-1.5 transition-colors duration-(--dur-fast) hover:bg-muted/40",
                (index + 1) % 7 !== 0 && "border-r",
                !inMonth && "bg-muted/20",
                highlightedDate === iso && "ring-2 ring-primary ring-inset"
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "flex size-6 items-center justify-center rounded-full text-xs tabular-nums",
                    today ? "bg-primary font-semibold text-primary-foreground" : inMonth ? "text-foreground" : "text-muted-foreground/60"
                  )}
                  aria-current={today ? "date" : undefined}
                >
                  {format(day, "d")}
                </span>
                <button
                  type="button"
                  aria-label={`Agregar vencimiento el ${label}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    onAdd(iso)
                  }}
                  className="flex size-6 cursor-pointer items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity duration-(--dur-fast) group-hover/day:opacity-100 hover:bg-muted hover:text-foreground focus-visible:opacity-100"
                >
                  <PlusIcon className="size-3.5" />
                </button>
              </div>
              {items.map((dueDate) => {
                // El color es el del camión (el mismo de cuentas a recibir), así se reconoce
                // de un vistazo. El estado va como ícono: vencido, en aviso o hecho.
                const color = dueDate.truckColor
                const StatusIcon =
                  dueDate.status === "Overdue"
                    ? AlertTriangleIcon
                    : dueDate.status === "Completed"
                      ? CheckIcon
                      : dueDate.status === "DueToday" || dueDate.status === "Upcoming"
                        ? ClockIcon
                        : null
                return (
                  <button
                    key={dueDate.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelect(dueDate)
                    }}
                    title={`${dueDateName(dueDate)} · ${dueDate.truckLicensePlate ?? "Empresa"} · ${DUE_DATE_STATUS_LABELS[dueDate.status]}`}
                    style={color ? { backgroundColor: color, color: readableTextColor(color) } : undefined}
                    className={cn(
                      "flex w-full cursor-pointer items-center gap-1 rounded-md px-1.5 py-0.5 text-left text-xs leading-4 transition-opacity duration-(--dur-fast) hover:opacity-80",
                      !color && "bg-muted text-foreground",
                      dueDate.status === "Overdue" && "ring-2 ring-danger ring-offset-1 ring-offset-background",
                      dueDate.status === "Completed" && "opacity-55 line-through"
                    )}
                  >
                    {StatusIcon && <StatusIcon aria-hidden className="size-3 shrink-0" />}
                    <span className="truncate">
                      <span className="font-medium">{dueDate.truckLicensePlate ?? "Empresa"}</span>{" "}
                      {dueDateName(dueDate)}
                    </span>
                  </button>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
