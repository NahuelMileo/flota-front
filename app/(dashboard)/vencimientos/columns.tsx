"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DueDateStatusBadge } from "@/components/due-dates/due-date-status-badge"
import { TruckPlate } from "@/components/due-dates/truck-plate"
import { dueDateName, dueDateOwner, formatDaysRemaining, formatReminders, parseIsoDate } from "@/lib/due-date-format"
import type { DueDate } from "@/types/due-date"

const dateFormatter = new Intl.DateTimeFormat("es-UY", { weekday: "short", day: "numeric", month: "short" })

export function getColumns(onEdit: (dueDate: DueDate) => void): ColumnDef<DueDate>[] {
  return [
    {
      accessorKey: "dueOn",
      header: "Vence",
      cell: ({ row }) => {
        const dueDate = row.original
        return (
          <div className="flex flex-col">
            <span className="font-medium capitalize tabular-nums">{dateFormatter.format(parseIsoDate(dueDate.dueOn))}</span>
            {dueDate.status !== "Completed" && (
              <span className="text-xs text-muted-foreground tabular-nums">{formatDaysRemaining(dueDate.daysRemaining)}</span>
            )}
          </div>
        )
      },
    },
    {
      id: "name",
      accessorFn: (d) => dueDateName(d),
      header: "Vencimiento",
      cell: ({ row }) => (
        <div className="flex max-w-72 flex-col">
          <span className="truncate">{dueDateName(row.original)}</span>
          {row.original.notes && <span className="truncate text-xs text-muted-foreground">{row.original.notes}</span>}
        </div>
      ),
    },
    {
      id: "owner",
      accessorFn: (d) => dueDateOwner(d),
      header: "Camión",
      cell: ({ row }) => <TruckPlate dueDate={row.original} />,
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => <DueDateStatusBadge status={row.original.status} />,
    },
    {
      id: "reminders",
      header: "Avisos",
      enableSorting: false,
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">{formatReminders(row.original.reminderDaysBefore)}</span>
      ),
    },
    {
      id: "actions",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button variant="ghost" size="icon" aria-label="Editar vencimiento" onClick={() => onEdit(row.original)}>
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]
}
