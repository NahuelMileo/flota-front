"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { ArrowRightIcon, PlusIcon } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { DueDateForm } from "@/components/due-dates/due-date-form"
import { DueDateStatusBadge } from "@/components/due-dates/due-date-status-badge"
import { useRealtimeEvent } from "@/context/realtime-context"
import { useTrucks } from "@/hooks/use-trucks"
import { errorMessage, fetchWithAuth } from "@/lib/api"
import { dueDateName, formatDaysRemaining, formatReminders, parseIsoDate, toIsoDate } from "@/lib/due-date-format"
import type { DueDate, SaveDueDateDto } from "@/types/due-date"

// Un año alcanza para seguros, SUCTA y habilitaciones, que se renuevan como mucho anualmente.
const DAYS_AHEAD = 365

// Vencimientos pendientes del camión en su detalle. Como el resto de la pantalla, sin cards:
// título con divisoria y lista con divisorias. No depende del mes elegido en el header.
export function TruckDueDates({ truckId }: { truckId: string }) {
  const trucks = useTrucks()
  const [dueDates, setDueDates] = useState<DueDate[] | null>(null)
  const [hasError, setHasError] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const fetchDueDates = useCallback(async () => {
    try {
      const res = await fetchWithAuth(`/api/due-dates/upcoming?days=${DAYS_AHEAD}&truckId=${truckId}`)
      if (!res.ok) throw new Error()
      setDueDates(await res.json())
      setHasError(false)
    } catch {
      setHasError(true)
    }
  }, [truckId])

  useEffect(() => {
    fetchDueDates()
  }, [fetchDueDates])

  useRealtimeEvent("DueDatesChanged", fetchDueDates)

  async function handleCreate(dto: SaveDueDateDto) {
    setIsSaving(true)
    try {
      const res = await fetchWithAuth("/api/due-dates", { method: "POST", body: JSON.stringify(dto) })
      if (!res.ok) throw new Error(await errorMessage(res, "Error al crear el vencimiento"))
      toast.success("Vencimiento agendado")
      setIsCreating(false)
      await fetchDueDates()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al crear el vencimiento")
    } finally {
      setIsSaving(false)
    }
  }

  const items = dueDates ?? []
  const overdue = items.filter((d) => d.status === "Overdue").length

  return (
    <section aria-labelledby="truck-due-dates" className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-4 border-b pb-2">
        <h2 id="truck-due-dates" className="font-semibold">
          Vencimientos
        </h2>
        <div className="flex items-center gap-3">
          <Link
            href="/vencimientos"
            className="hidden items-center gap-1 text-sm text-muted-foreground transition-colors duration-(--dur-fast) hover:text-foreground sm:inline-flex"
          >
            Ver calendario
            <ArrowRightIcon className="size-3.5" aria-hidden />
          </Link>
          <Button variant="outline" size="sm" onClick={() => setIsCreating(true)}>
            <PlusIcon className="size-3.5" />
            Nuevo vencimiento
          </Button>
        </div>
      </div>

      {!dueDates && !hasError ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : hasError ? (
        <p className="text-sm text-muted-foreground">No se pudieron cargar los vencimientos.</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Sin vencimientos pendientes. Agendá el seguro o la SUCTA para que Kilometría te avise antes.
        </p>
      ) : (
        <div className="fv-rise space-y-2">
          <p className="text-sm text-muted-foreground tabular-nums">
            {items.length === 1 ? "1 pendiente" : `${items.length} pendientes`}
            {overdue > 0 && (
              <span className="text-danger"> · {overdue === 1 ? "1 vencido" : `${overdue} vencidos`}</span>
            )}
          </p>
          <ul className="divide-y">
            {items.map((dueDate) => (
              <li key={dueDate.id}>
                <Link
                  href={`/vencimientos?fecha=${dueDate.dueOn}`}
                  className="-mx-2 flex items-center gap-3 rounded-md px-2 py-2.5 transition-colors duration-(--dur-fast) hover:bg-muted/50"
                >
                  <span className="w-24 shrink-0 text-sm font-medium tabular-nums">
                    {format(parseIsoDate(dueDate.dueOn), "d MMM yyyy", { locale: es })}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm">{dueDateName(dueDate)}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {formatReminders(dueDate.reminderDaysBefore)}
                    </span>
                  </span>
                  <span className="hidden w-28 text-right text-xs text-muted-foreground tabular-nums sm:inline">
                    {dueDate.status !== "DueToday" && formatDaysRemaining(dueDate.daysRemaining)}
                  </span>
                  <DueDateStatusBadge status={dueDate.status} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Sheet open={isCreating} onOpenChange={setIsCreating}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Nuevo vencimiento</SheetTitle>
            <SheetDescription>Kilometría te avisa en la campanita antes de que venza.</SheetDescription>
          </SheetHeader>
          <div className="px-4">
            {isCreating && (
              <DueDateForm
                defaultDueOn={toIsoDate(new Date())}
                defaultTruckId={truckId}
                trucks={trucks}
                onSubmit={handleCreate}
                isSubmitting={isSaving}
                submitLabel="Agendar vencimiento"
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </section>
  )
}
