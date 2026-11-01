"use client"

import { createContext, useContext, useMemo, type ReactNode } from "react"
import { cn } from "@/lib/utils"
import { readableTextColor } from "@/lib/color-contrast"
import type { Truck } from "@/types/truck"

/** Matrícula pintada con el color del camión, igual que en cuentas a recibir. Sin color, va en texto plano. */
export function TruckPlate({ plate, color, className }: { plate: string; color?: string | null; className?: string }) {
  if (!color) return <span className={cn("font-medium", className)}>{plate}</span>
  return (
    <span
      className={cn("inline-block rounded-md px-2 py-0.5 font-mono text-[0.8125rem] font-medium tracking-tight", className)}
      style={{ backgroundColor: color, color: readableTextColor(color) }}
    >
      {plate}
    </span>
  )
}

/*
  Ingresos y egresos no traen el color del camión en la respuesta: sale de useTrucks().
  Va por contexto y no como argumento de getColumns porque los camiones llegan después
  que las filas, y meterlos en las deps del memo rearmaría todas las celdas (ver DataTable).
*/
type TruckColors = { byId: Map<string, string>; byPlate: Map<string, string> }

const TruckColorsContext = createContext<TruckColors>({ byId: new Map(), byPlate: new Map() })

export function TruckColorsProvider({ trucks, children }: { trucks: Truck[]; children: ReactNode }) {
  const value = useMemo(() => {
    const byId = new Map<string, string>()
    const byPlate = new Map<string, string>()
    for (const truck of trucks) {
      if (!truck.color) continue
      byId.set(truck.id, truck.color)
      byPlate.set(truck.licensePlate, truck.color)
    }
    return { byId, byPlate }
  }, [trucks])
  return <TruckColorsContext.Provider value={value}>{children}</TruckColorsContext.Provider>
}

/** Celda "Camión" de una tabla: busca el color por id y, si el registro no tiene truckId, por matrícula. */
export function TruckPlateCell({ truckId, plate }: { truckId?: string | null; plate: string | null }) {
  const { byId, byPlate } = useContext(TruckColorsContext)
  // Sin camión es un movimiento de la empresa, igual que en vencimientos. El hueco del punto
  // mantiene "Empresa" alineado con las matrículas.
  if (!plate)
    return (
      <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
        <span aria-hidden className="size-2 shrink-0" />
        Empresa
      </span>
    )
  const color = (truckId && byId.get(truckId)) || byPlate.get(plate)
  // En una tabla con muchas filas el bloque pintado pesa demasiado: alcanza con un punto del color.
  return (
    <span className="inline-flex items-center gap-1.5 text-sm">
      <span
        aria-hidden
        className={cn("size-2 shrink-0 rounded-full", !color && "border border-muted-foreground/40")}
        style={color ? { backgroundColor: color } : undefined}
      />
      {plate}
    </span>
  )
}
