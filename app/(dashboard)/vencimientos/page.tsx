"use client"

import { Suspense, useCallback, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { addMonths, format, isSameMonth, startOfMonth } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarDaysIcon, ChevronLeftIcon, ChevronRightIcon, ListIcon, PlusIcon, TruckIcon } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { DataTable } from "@/components/data-table"
import { FilterSelect } from "@/components/filter-select"
import { Refreshing } from "@/components/refreshing"
import { DueDateForm } from "@/components/due-dates/due-date-form"
import { DueDateStatusBadge } from "@/components/due-dates/due-date-status-badge"
import { MonthCalendar, calendarRange } from "@/components/due-dates/month-calendar"
import { useRealtimeEvent } from "@/context/realtime-context"
import { useIsMobile } from "@/hooks/use-mobile"
import { useTrucks } from "@/hooks/use-trucks"
import { errorMessage, fetchWithAuth } from "@/lib/api"
import { cn } from "@/lib/utils"
import { dueDateName, dueDateOwner, parseIsoDate, toIsoDate } from "@/lib/due-date-format"
import type { DueDate, SaveDueDateDto } from "@/types/due-date"
import { getColumns } from "./columns"

type View = "calendar" | "list"

export default function DueDatesPage() {
  return (
    <Suspense>
      <DueDatesView />
    </Suspense>
  )
}

function DueDatesView() {
  const searchParams = useSearchParams()
  const highlightedDate = searchParams.get("fecha")
  const isMobile = useIsMobile()
  const trucks = useTrucks()

  const [month, setMonth] = useState(() =>
    startOfMonth(highlightedDate ? parseIsoDate(highlightedDate) : new Date())
  )
  const [view, setView] = useState<View>(searchParams.get("vista") === "lista" ? "list" : "calendar")
  const [truckId, setTruckId] = useState<string | null>(null)
  const [dueDates, setDueDates] = useState<DueDate[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [creatingOn, setCreatingOn] = useState<string | null>(null)
  const [editing, setEditing] = useState<DueDate | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isMutating, setIsMutating] = useState(false)

  // En el celular una grilla de 7 columnas no entra: arranca en lista.
  useEffect(() => {
    if (isMobile) setView("list")
  }, [isMobile])

  // La campanita navega con ?fecha=: mover el calendario a ese mes.
  useEffect(() => {
    if (highlightedDate) setMonth(startOfMonth(parseIsoDate(highlightedDate)))
  }, [highlightedDate])

  const fetchDueDates = useCallback(async () => {
    const { start, end } = calendarRange(month)
    const params = new URLSearchParams({ from: toIsoDate(start), to: toIsoDate(end) })
    if (truckId) params.set("truckId", truckId)
    setIsLoading(true)
    try {
      const res = await fetchWithAuth(`/api/due-dates?${params.toString()}`)
      if (!res.ok) throw new Error()
      setDueDates(await res.json())
    } catch {
      toast.error("Error al cargar vencimientos")
    } finally {
      setIsLoading(false)
    }
  }, [month, truckId])

  useEffect(() => {
    fetchDueDates()
  }, [fetchDueDates])

  useRealtimeEvent("DueDatesChanged", fetchDueDates)

  // La edición abierta tiene que reflejar lo que devolvió el servidor (estado recalculado).
  const replace = (updated: DueDate) => {
    setDueDates((prev) => prev?.map((d) => (d.id === updated.id ? updated : d)) ?? null)
    setEditing((prev) => (prev?.id === updated.id ? updated : prev))
  }

  async function handleCreate(dto: SaveDueDateDto) {
    setIsSaving(true)
    try {
      const res = await fetchWithAuth("/api/due-dates", { method: "POST", body: JSON.stringify(dto) })
      if (!res.ok) throw new Error(await errorMessage(res, "Error al crear el vencimiento"))
      const created: DueDate = await res.json()
      toast.success("Vencimiento agendado")
      setCreatingOn(null)
      if (!isSameMonth(parseIsoDate(created.dueOn), month)) setMonth(startOfMonth(parseIsoDate(created.dueOn)))
      else await fetchDueDates()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al crear el vencimiento")
    } finally {
      setIsSaving(false)
    }
  }

  async function handleUpdate(dto: SaveDueDateDto) {
    if (!editing) return
    setIsSaving(true)
    try {
      const res = await fetchWithAuth(`/api/due-dates/${editing.id}`, { method: "PUT", body: JSON.stringify(dto) })
      if (!res.ok) throw new Error(await errorMessage(res, "Error al guardar el vencimiento"))
      replace(await res.json())
      setEditing(null)
      toast.success("Vencimiento actualizado")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al guardar el vencimiento")
    } finally {
      setIsSaving(false)
    }
  }

  async function handleToggleCompleted(dueDate: DueDate) {
    const completed = dueDate.status !== "Completed"
    setIsMutating(true)
    try {
      const res = await fetchWithAuth(`/api/due-dates/${dueDate.id}/complete`, {
        method: "PATCH",
        body: JSON.stringify({ completed }),
      })
      if (!res.ok) throw new Error()
      replace(await res.json())
      toast.success(completed ? "Marcado como hecho" : "Vencimiento reabierto")
    } catch {
      toast.error("No se pudo actualizar el vencimiento")
    } finally {
      setIsMutating(false)
    }
  }

  async function handleDelete(dueDate: DueDate) {
    setIsMutating(true)
    try {
      const res = await fetchWithAuth(`/api/due-dates/${dueDate.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      setDueDates((prev) => prev?.filter((d) => d.id !== dueDate.id) ?? null)
      setEditing(null)
      toast.success("Vencimiento eliminado")
    } catch {
      toast.error("Error al eliminar el vencimiento")
    } finally {
      setIsMutating(false)
    }
  }

  const columns = useMemo(() => getColumns(setEditing), [])
  const monthDueDates = useMemo(
    () => (dueDates ?? []).filter((d) => isSameMonth(parseIsoDate(d.dueOn), month)),
    [dueDates, month]
  )
  const pendingInMonth = monthDueDates.filter((d) => d.status !== "Completed").length
  const isFirstLoad = isLoading && !dueDates

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" aria-label="Mes anterior" onClick={() => setMonth((m) => addMonths(m, -1))}>
            <ChevronLeftIcon className="size-4" />
          </Button>
          <h2 className="min-w-36 text-center font-semibold capitalize">{format(month, "MMMM yyyy", { locale: es })}</h2>
          <Button variant="ghost" size="icon-sm" aria-label="Mes siguiente" onClick={() => setMonth((m) => addMonths(m, 1))}>
            <ChevronRightIcon className="size-4" />
          </Button>
          {!isSameMonth(month, new Date()) && (
            <Button variant="outline" size="sm" onClick={() => setMonth(startOfMonth(new Date()))}>
              Hoy
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground tabular-nums">
          {pendingInMonth === 0 ? "Nada pendiente este mes" : pendingInMonth === 1 ? "1 pendiente" : `${pendingInMonth} pendientes`}
        </p>
        <div className="flex w-full flex-wrap items-center gap-2 sm:ml-auto sm:w-auto">
          <FilterSelect
            label="Camión"
            icon={TruckIcon}
            value={truckId}
            onChange={setTruckId}
            options={trucks.map((t) => ({ label: t.licensePlate, value: t.id }))}
            allLabel="Todos"
          />
          <div role="group" aria-label="Vista" className="flex h-8 items-center gap-0.5 rounded-lg bg-muted p-0.5">
            {(
              [
                { value: "calendar", label: "Calendario", icon: CalendarDaysIcon },
                { value: "list", label: "Lista", icon: ListIcon },
              ] as const
            ).map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={view === option.value}
                onClick={() => setView(option.value)}
                className={cn(
                  "flex h-full cursor-pointer items-center gap-1.5 rounded-md px-2 text-xs font-medium transition-colors duration-(--dur-fast)",
                  view === option.value ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <option.icon className="size-3.5" aria-hidden />
                {option.label}
              </button>
            ))}
          </div>
          <Button onClick={() => setCreatingOn(highlightedDate ?? toIsoDate(new Date()))}>
            <PlusIcon className="size-4" />
            Nuevo vencimiento
          </Button>
        </div>
      </div>

      {isFirstLoad ? (
        <Skeleton className="h-[36rem] w-full rounded-xl" />
      ) : (
        <Refreshing busy={isLoading} className="fv-rise">
          {view === "calendar" ? (
            <div className="overflow-x-auto">
              <div className="min-w-[48rem]">
                <MonthCalendar
                  month={month}
                  dueDates={dueDates ?? []}
                  highlightedDate={highlightedDate}
                  onAdd={setCreatingOn}
                  onSelect={setEditing}
                />
              </div>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={monthDueDates}
              emptyMessage="No hay vencimientos este mes."
              searchPlaceholder="Buscar vencimiento..."
            />
          )}
        </Refreshing>
      )}

      {/* Alta */}
      <Sheet open={creatingOn !== null} onOpenChange={(open) => !open && setCreatingOn(null)}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Nuevo vencimiento</SheetTitle>
            <SheetDescription>Kilometría te avisa en la campanita antes de que venza.</SheetDescription>
          </SheetHeader>
          <div className="px-4">
            {creatingOn !== null && (
              <DueDateForm
                key={creatingOn}
                defaultDueOn={creatingOn}
                trucks={trucks}
                onSubmit={handleCreate}
                isSubmitting={isSaving}
                submitLabel="Agendar vencimiento"
              />
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Edición */}
      <Sheet open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editing ? dueDateName(editing) : "Vencimiento"}</SheetTitle>
            <SheetDescription render={<div />} className="flex flex-wrap items-center gap-2">
              {editing && (
                <>
                  <span>{dueDateOwner(editing)}</span>
                  <DueDateStatusBadge status={editing.status} />
                </>
              )}
            </SheetDescription>
          </SheetHeader>
          {editing && (
            <div className="px-4">
              <div className="flex flex-wrap gap-2 border-b pb-4">
                <Button
                  variant={editing.status === "Completed" ? "outline" : "default"}
                  size="sm"
                  disabled={isMutating}
                  onClick={() => handleToggleCompleted(editing)}
                >
                  {editing.status === "Completed" ? "Reabrir" : "Marcar como hecho"}
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger
                    render={
                      <Button variant="ghost" size="sm" className="text-destructive" disabled={isMutating}>
                        Eliminar
                      </Button>
                    }
                  />
                  <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Eliminar vencimiento?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Se elimina{" "}
                        <span className="font-medium text-foreground">{dueDateName(editing)}</span> y deja de avisar.
                        Si ya lo renovaste, mejor marcalo como hecho.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction variant="destructive" disabled={isMutating} onClick={() => handleDelete(editing)}>
                        Eliminar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              <DueDateForm
                key={editing.id}
                dueDate={editing}
                trucks={trucks}
                onSubmit={handleUpdate}
                isSubmitting={isSaving}
                submitLabel="Guardar cambios"
              />
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
