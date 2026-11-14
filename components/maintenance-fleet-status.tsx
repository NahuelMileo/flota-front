"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { XIcon } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Refreshing } from "@/components/refreshing"
import { TruckPlate } from "@/components/truck-plate"
import { useRealtimeEvent } from "@/context/realtime-context"
import { fetchWithAuth } from "@/lib/api"
import { parseIsoDate } from "@/lib/due-date-format"
import { formatAlertRemaining } from "@/lib/maintenance-alert-format"
import { cn } from "@/lib/utils"
import type { MaintenanceFleetStatus, MaintenanceStatusItem } from "@/types/maintenance-alert"
import type { Truck } from "@/types/truck"

// Cada grupo muestra hasta 10 y "Ver N más". No hay paginación real: para revisar los
// vencidos se quieren ver todos, y el back devuelve pocas filas (camiones × conceptos).
const VISIBLE_PER_GROUP = 10
const kmFormatter = new Intl.NumberFormat("es-UY", { maximumFractionDigits: 0 })

type Tone = "danger" | "warning" | "success"

// Estado de cada camión+concepto, abajo de la tabla de mantenimientos. Sale de
// GET /api/maintenance-alerts/status, que lo calcula en el momento: los avisos de la
// campanita solo se recalculan cuando se carga algo del camión y pueden estar viejos.
// Cada camión+concepto aparece en un solo grupo. Respeta los filtros de camión y
// concepto de la pantalla, pero no el mes: mira desde hoy.
export function MaintenanceFleetStatusSection({
  trucks,
  truckId,
  conceptId,
  conceptName,
  onClearTruck,
  onClearConcept,
  refreshKey,
}: {
  trucks: Truck[]
  truckId: string | null
  conceptId: string | null
  conceptName: string | null
  onClearTruck: () => void
  onClearConcept: () => void
  refreshKey: number
}) {
  const [status, setStatus] = useState<MaintenanceFleetStatus | null>(null)
  const [isFetching, setIsFetching] = useState(false)
  const [hasError, setHasError] = useState(false)

  const fetchStatus = useCallback(async () => {
    setIsFetching(true)
    try {
      const res = await fetchWithAuth("/api/maintenance-alerts/status")
      if (!res.ok) throw new Error()
      setStatus(await res.json())
      setHasError(false)
    } catch {
      setHasError(true)
    } finally {
      setIsFetching(false)
    }
  }, [])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus, refreshKey])

  // Lo dispara el back al evaluar avisos (alta/edición/baja de egresos, viajes y mantenimientos).
  useRealtimeEvent("MaintenanceAlertsChanged", fetchStatus)

  const colorByTruck = useMemo(
    () => new Map(trucks.filter((t) => t.color).map((t) => [t.id, t.color as string])),
    [trucks]
  )

  const filtered = useMemo(() => {
    if (!status) return null
    const keep = (item: MaintenanceStatusItem) =>
      (!truckId || item.truckId === truckId) && (!conceptId || item.maintenanceConceptId === conceptId)
    return {
      overdue: status.overdue.filter(keep),
      upcoming: status.upcoming.filter(keep),
      upToDate: status.upToDate.filter(keep),
    }
  }, [status, truckId, conceptId])

  return (
    <section aria-labelledby="maintenance-fleet-status" className="space-y-3">
      <h2 id="maintenance-fleet-status" className="border-b pb-2 font-semibold">
        Estado de mantenimientos
      </h2>

      {/* Los filtros están arriba de la tabla y quedan lejos: se repiten acá para que se
          note que también recortan esta sección, y se pueden sacar sin subir. */}
      {(truckId || conceptId) && (
        <div className="flex flex-wrap items-center gap-1.5 text-sm">
          <span className="text-muted-foreground">Filtrado:</span>
          {truckId && (
            <FilterChip
              label={trucks.find((t) => t.id === truckId)?.licensePlate ?? "Camión"}
              onClear={onClearTruck}
            />
          )}
          {conceptId && <FilterChip label={conceptName ?? "Concepto"} onClear={onClearConcept} />}
        </div>
      )}

      {!filtered && !hasError ? (
        <div className="space-y-2">
          <Skeleton className="h-5 w-72" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : hasError && !filtered ? (
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">No se pudo cargar el estado de los mantenimientos.</p>
          <Button variant="outline" size="sm" onClick={fetchStatus}>
            Reintentar
          </Button>
        </div>
      ) : filtered ? (
        <Refreshing busy={isFetching} className="fv-rise space-y-6">
          <dl className="flex flex-wrap gap-x-8 gap-y-1 text-sm">
            <div className="flex gap-1.5">
              <dt className="text-muted-foreground">Vencidos</dt>
              <dd className={cn("font-medium tabular-nums", filtered.overdue.length > 0 && "text-danger")}>
                {filtered.overdue.length}
              </dd>
            </div>
            <div className="flex gap-1.5">
              <dt className="text-muted-foreground">Próximos</dt>
              <dd className={cn("font-medium tabular-nums", filtered.upcoming.length > 0 && "text-warning")}>
                {filtered.upcoming.length}
              </dd>
            </div>
            <div className="flex gap-1.5">
              <dt className="text-muted-foreground">Al día</dt>
              <dd className="font-medium tabular-nums">{filtered.upToDate.length}</dd>
            </div>
          </dl>

          <StatusGroup
            title="Vencidos"
            tone="danger"
            items={filtered.overdue}
            emptyMessage="No hay mantenimientos vencidos."
            colorByTruck={colorByTruck}
            collapseAfter={VISIBLE_PER_GROUP}
          />
          <StatusGroup
            title="Próximos"
            tone="warning"
            items={filtered.upcoming}
            emptyMessage="No hay mantenimientos por vencer."
            colorByTruck={colorByTruck}
            collapseAfter={VISIBLE_PER_GROUP}
          />
          <StatusGroup
            title="Al día"
            tone="success"
            items={filtered.upToDate}
            emptyMessage="Ningún mantenimiento está al día todavía."
            colorByTruck={colorByTruck}
            collapseAfter={VISIBLE_PER_GROUP}
          />
        </Refreshing>
      ) : null}
    </section>
  )
}

function FilterChip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-muted py-0.5 pr-0.5 pl-2 text-xs font-medium">
      {label}
      <button
        type="button"
        onClick={onClear}
        aria-label={`Quitar filtro ${label}`}
        className="flex size-5 cursor-pointer items-center justify-center rounded text-muted-foreground transition-colors duration-(--dur-fast) hover:bg-background hover:text-foreground"
      >
        <XIcon className="size-3" />
      </button>
    </span>
  )
}

function StatusGroup({
  title,
  tone,
  items,
  emptyMessage,
  colorByTruck,
  collapseAfter,
}: {
  title: string
  tone: Tone
  items: MaintenanceStatusItem[]
  emptyMessage: string
  colorByTruck: Map<string, string>
  collapseAfter?: number
}) {
  const [expanded, setExpanded] = useState(false)
  const visible = collapseAfter && !expanded ? items.slice(0, collapseAfter) : items
  const hidden = items.length - visible.length

  return (
    <div className="space-y-1">
      <h3 className="flex items-center gap-2 text-sm font-medium">
        <span
          aria-hidden
          className={cn(
            "size-2 rounded-full",
            tone === "danger" ? "bg-danger" : tone === "warning" ? "bg-warning" : "bg-success"
          )}
        />
        {title}
        <span className="text-muted-foreground tabular-nums">{items.length}</span>
      </h3>

      {items.length === 0 ? (
        <p className="py-2 text-sm text-muted-foreground">{emptyMessage}</p>
      ) : (
        <>
          <div className="hidden gap-3 border-b pb-1.5 text-xs font-medium text-muted-foreground sm:flex">
            <span className="w-24 shrink-0">Camión</span>
            <span className="min-w-0 flex-1">Concepto</span>
            <span className="w-52 shrink-0">Estado</span>
            <span className="hidden w-40 shrink-0 text-right md:block">Último</span>
          </div>
          <ul className="divide-y">
            {visible.map((item) => (
              <StatusRow
                key={`${item.truckId}-${item.maintenanceConceptId}`}
                item={item}
                tone={tone}
                color={colorByTruck.get(item.truckId)}
              />
            ))}
          </ul>
          {hidden > 0 && (
            <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => setExpanded(true)}>
              Ver {hidden} más
            </Button>
          )}
          {collapseAfter && expanded && items.length > collapseAfter && (
            <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => setExpanded(false)}>
              Ver menos
            </Button>
          )}
        </>
      )}
    </div>
  )
}

function StatusRow({ item, tone, color }: { item: MaintenanceStatusItem; tone: Tone; color?: string }) {
  const remaining = formatAlertRemaining(item.kmRemaining, item.daysRemaining)
  const lastDate = format(parseIsoDate(item.lastMaintenanceDate), "d MMM yyyy", { locale: es })

  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-0.5 py-2.5 sm:flex-nowrap">
      <span className="w-24 shrink-0">
        <TruckPlate plate={item.truckLicensePlate} color={color} className="text-sm" />
      </span>
      <span className="min-w-0 flex-1 truncate text-sm">{item.maintenanceConceptName}</span>
      <span
        className={cn(
          "w-full text-xs tabular-nums sm:w-52 sm:shrink-0",
          tone === "danger" ? "text-danger" : tone === "warning" ? "text-warning" : "text-muted-foreground"
        )}
      >
        {remaining ?? "Sin intervalo"}
      </span>
      <span className="hidden w-40 shrink-0 text-right text-xs text-muted-foreground tabular-nums md:block">
        <span className="capitalize">{lastDate}</span> · {kmFormatter.format(item.lastKilometers)} km
      </span>
    </li>
  )
}
