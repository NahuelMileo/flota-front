"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { ArrowRightIcon } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { DueDateStatusBadge } from "@/components/due-dates/due-date-status-badge"
import { TruckPlate } from "@/components/due-dates/truck-plate"
import { useRealtimeEvent } from "@/context/realtime-context"
import { fetchWithAuth } from "@/lib/api"
import { dueDateName, formatDaysRemaining, parseIsoDate } from "@/lib/due-date-format"
import type { DueDate } from "@/types/due-date"

const DAYS_AHEAD = 30
const MAX_ROWS = 5

// Sección del Dashboard, sin cards como el resto: título con divisoria, una línea con las
// cifras y la lista. Es lo único del Dashboard que no depende del mes elegido: mira desde hoy.
export function UpcomingDueDates() {
  const [dueDates, setDueDates] = useState<DueDate[] | null>(null)
  const [hasError, setHasError] = useState(false)

  const fetchUpcoming = useCallback(async () => {
    try {
      const res = await fetchWithAuth(`/api/due-dates/upcoming?days=${DAYS_AHEAD}`)
      if (!res.ok) throw new Error()
      setDueDates(await res.json())
      setHasError(false)
    } catch {
      setHasError(true)
    }
  }, [])

  useEffect(() => {
    fetchUpcoming()
  }, [fetchUpcoming])

  useRealtimeEvent("DueDatesChanged", fetchUpcoming)

  const items = dueDates ?? []
  const overdue = items.filter((d) => d.status === "Overdue").length
  const dueToday = items.filter((d) => d.status === "DueToday").length
  const thisWeek = items.filter((d) => d.daysRemaining > 0 && d.daysRemaining <= 7).length

  return (
    <section aria-labelledby="upcoming-due-dates" className="space-y-3">
      <div className="flex items-baseline justify-between gap-4 border-b pb-2">
        <h2 id="upcoming-due-dates" className="font-semibold">
          Próximos vencimientos
        </h2>
        <Link
          href="/vencimientos"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors duration-(--dur-fast) hover:text-foreground"
        >
          Ver calendario
          <ArrowRightIcon className="size-3.5" aria-hidden />
        </Link>
      </div>

      {!dueDates && !hasError ? (
        <div className="space-y-2">
          <Skeleton className="h-5 w-72" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : hasError ? (
        <p className="text-sm text-muted-foreground">No se pudieron cargar los vencimientos.</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nada vence en los próximos {DAYS_AHEAD} días.</p>
      ) : (
        <div className="fv-rise space-y-2">
          <dl className="flex flex-wrap gap-x-8 gap-y-1 text-sm">
            <div className="flex gap-1.5">
              <dt className="text-muted-foreground">Vencidos</dt>
              <dd className={`font-medium tabular-nums ${overdue > 0 ? "text-danger" : ""}`}>{overdue}</dd>
            </div>
            <div className="flex gap-1.5">
              <dt className="text-muted-foreground">Vencen hoy</dt>
              <dd className="font-medium tabular-nums">{dueToday}</dd>
            </div>
            <div className="flex gap-1.5">
              <dt className="text-muted-foreground">Esta semana</dt>
              <dd className="font-medium tabular-nums">{thisWeek}</dd>
            </div>
            <div className="flex gap-1.5">
              <dt className="text-muted-foreground">Próximos {DAYS_AHEAD} días</dt>
              <dd className="font-medium tabular-nums">{items.length}</dd>
            </div>
          </dl>

          <ul className="divide-y">
            {items.slice(0, MAX_ROWS).map((dueDate) => {
              const date = parseIsoDate(dueDate.dueOn)
              return (
                <li key={dueDate.id}>
                  <Link
                    href={`/vencimientos?fecha=${dueDate.dueOn}`}
                    className="-mx-2 flex items-center gap-3 rounded-md px-2 py-2.5 transition-colors duration-(--dur-fast) hover:bg-muted/50"
                  >
                    <span className="w-16 shrink-0 text-sm font-medium capitalize tabular-nums">
                      {format(date, "d MMM", { locale: es })}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm">{dueDateName(dueDate)}</span>
                    <TruckPlate dueDate={dueDate} className="hidden text-sm sm:inline-block" />
                    <span className="hidden w-28 text-right text-xs text-muted-foreground tabular-nums md:inline">
                      {dueDate.status !== "DueToday" && formatDaysRemaining(dueDate.daysRemaining)}
                    </span>
                    <DueDateStatusBadge status={dueDate.status} />
                  </Link>
                </li>
              )
            })}
          </ul>
          {items.length > MAX_ROWS && (
            <Link href="/vencimientos?vista=lista" className="block text-xs text-muted-foreground hover:text-foreground">
              y {items.length - MAX_ROWS} más
            </Link>
          )}
        </div>
      )}
    </section>
  )
}
