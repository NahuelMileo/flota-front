"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { fetchWithAuth } from "@/lib/api"
import { toast } from "sonner"
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { CostTable } from "@/components/cost-table"
import { AddCostModal } from "@/components/add-cost-modal"
import { OdometerReadingsPanel } from "@/components/odometer-readings-panel"
import { useTruckCosts } from "@/hooks/use-truck-costs"
import type { Truck } from "@/types/truck"

export default function TruckCostsPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [truck, setTruck] = useState<Truck | null>(null)
  const [truckLoading, setTruckLoading] = useState(true)
  const [year, setYear] = useState(new Date().getFullYear())

  useEffect(() => {
    fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/trucks/${id}`)
      .then(async (res) => {
        if (!res.ok) { router.push("/camiones"); return }
        setTruck(await res.json())
      })
      .catch(() => toast.error("Error al cargar el camión"))
      .finally(() => setTruckLoading(false))
  }, [id, router])

  const {
    costRows,
    summary,
    isLoading,
    refetch,
    markAsPaid,
    updateAmount,
  } = useTruckCosts(id, year)

  return (
    <div className="p-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href={`/camiones/${id}`}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        {truckLoading ? (
          <Skeleton className="h-7 w-52" />
        ) : truck ? (
          <div>
            <h1 className="text-xl font-bold leading-none">
              {truck.licensePlate}
              {truck.model && (
                <span className="font-normal text-muted-foreground ml-2">
                  — {truck.model}{truck.year ? ` (${truck.year})` : ""}
                </span>
              )}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">Costos fijos y variables</p>
          </div>
        ) : (
          <h1 className="text-xl font-bold">Camión no encontrado</h1>
        )}
      </div>

      {/* Year selector + Add button */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setYear((y) => y - 1)}
            aria-label="Año anterior"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="text-sm font-semibold w-14 text-center tabular-nums">
            {year}
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setYear((y) => y + 1)}
            aria-label="Año siguiente"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>

        <AddCostModal truckId={id} year={year} onSuccess={refetch} />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-3 rounded-sm bg-green-200 dark:bg-green-800" />
          Costo fijo
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-3 rounded-sm bg-background border" />
          Costo variable
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-3 rounded-sm bg-cyan-200 dark:bg-cyan-800" />
          Costo x km real
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-3 rounded-sm bg-cyan-100 dark:bg-cyan-900" />
          Costo x km estimado
        </span>
        <span className="text-muted-foreground/60">
          · Costo/km real usa lecturas de odómetro; si no hay suficientes, se usa el estimado mensual.
        </span>
      </div>

      {/* Annual cost table */}
      <CostTable
        costRows={costRows}
        summary={summary}
        estimatedMonthlyKm={truck?.estimatedMonthlyKm}
        isLoading={isLoading}
        onMarkPaid={markAsPaid}
        onUpdateAmount={updateAmount}
        onDeleteTemplate={async (templateId) => {
          const res = await fetchWithAuth(
            `${process.env.NEXT_PUBLIC_API_URL}/api/costs/templates/${templateId}`,
            { method: "DELETE" }
          )
          if (!res.ok) { toast.error("Error al eliminar el costo fijo"); return }
          toast.success("Costo fijo eliminado")
          refetch()
        }}
        onDeleteEntry={async (entryId) => {
          const res = await fetchWithAuth(
            `${process.env.NEXT_PUBLIC_API_URL}/api/costs/entries/${entryId}`,
            { method: "DELETE" }
          )
          if (!res.ok) { toast.error("Error al eliminar el costo"); return }
          toast.success("Costo eliminado")
          refetch()
        }}
        onDeleteInstallmentPlan={async (planId) => {
          const res = await fetchWithAuth(
            `${process.env.NEXT_PUBLIC_API_URL}/api/costs/installments/${planId}`,
            { method: "DELETE" }
          )
          if (!res.ok) { toast.error("Error al eliminar el plan de cuotas"); return }
          toast.success("Plan de cuotas eliminado")
          refetch()
        }}
      />

      {/* Odometer readings */}
      <OdometerReadingsPanel truckId={id} year={year} />
    </div>
  )
}
