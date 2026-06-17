"use client"

import { Suspense, useCallback, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { fetchWithAuth } from "@/lib/api"
import { formatCurrency, formatCurrency2 } from "@/lib/format"
import { useCurrency } from "@/context/currency-context"
import { toast } from "sonner"
import { ArrowLeft, ChevronLeft, ChevronRight, TruckIcon } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { CostEntry } from "@/types/costs"
import type { Truck } from "@/types/truck"
import type { DisplayCurrency } from "@/lib/format"

function getEntryDisplayAmount(entry: CostEntry, currency: DisplayCurrency): number {
  if (currency === "USD") return entry.valueUSD ?? entry.amount
  if (currency === "UYU") return entry.valueUYU ?? entry.amount
  return entry.valueBRL ?? entry.amount
}

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
]


function parseMonthParam(param: string | null): { month: number; year: number } {
  const now = new Date()
  if (!param) return { month: now.getMonth() + 1, year: now.getFullYear() }
  const [yearStr, monthStr] = param.split("-")
  const year = parseInt(yearStr)
  const month = parseInt(monthStr)
  if (isNaN(year) || isNaN(month) || month < 1 || month > 12)
    return { month: now.getMonth() + 1, year: now.getFullYear() }
  return { month, year }
}

function toMonthParam(month: number, year: number) {
  return `${year}-${String(month).padStart(2, "0")}`
}

function AmountCell({
  entry,
  onUpdateAmount,
}: {
  entry: CostEntry
  onUpdateAmount: (id: string, amount: number) => Promise<void>
}) {
  const { displayCurrency } = useCurrency()
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(String(entry.amount))

  function handleSave() {
    const parsed = parseFloat(value)
    if (!isNaN(parsed) && parsed > 0) {
      onUpdateAmount(entry.id, parsed)
      setOpen(false)
    }
  }

  if (entry.isPaid) {
    return (
      <span className="text-xs tabular-nums text-muted-foreground line-through">
        {formatCurrency(getEntryDisplayAmount(entry, displayCurrency), displayCurrency)}
      </span>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button className="text-xs tabular-nums hover:bg-muted px-1.5 py-0.5 rounded transition-colors">
            {formatCurrency(getEntryDisplayAmount(entry, displayCurrency), displayCurrency)}
          </button>
        }
      />
      <PopoverContent className="w-44 p-2" align="end">
        <div className="flex gap-1">
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            type="number"
            step="0.01"
            className="h-7 text-xs"
            autoFocus
          />
          <Button size="sm" className="h-7 px-2 text-xs" onClick={handleSave}>
            OK
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function MonthlyCostsContent() {
  const { displayCurrency } = useCurrency()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { month, year } = parseMonthParam(searchParams.get("month"))

  const [entries, setEntries] = useState<CostEntry[]>([])
  const [trucks, setTrucks] = useState<Truck[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchEntries = useCallback(async () => {
    setIsLoading(true)
    try {
      const [entriesRes, trucksRes] = await Promise.all([
        fetchWithAuth(`/api/costs/monthly?month=${month}&year=${year}`),
        fetchWithAuth(`/api/trucks`),
      ])
      if (!entriesRes.ok) throw new Error()
      const [data, trucksData] = await Promise.all([entriesRes.json(), trucksRes.ok ? trucksRes.json() : []])
      setEntries(Array.isArray(data) ? data : [])
      setTrucks(Array.isArray(trucksData) ? trucksData : [])
    } catch {
      toast.error("Error al cargar costos del mes")
    } finally {
      setIsLoading(false)
    }
  }, [month, year])

  useEffect(() => { fetchEntries() }, [fetchEntries])

  const truckMap = useMemo(
    () => new Map(trucks.map((t) => [t.id, t])),
    [trucks]
  )

  function navigateMonth(delta: number) {
    let m = month + delta
    let y = year
    if (m > 12) { m = 1; y++ }
    if (m < 1) { m = 12; y-- }
    router.push(`/costos/mensual?month=${toMonthParam(m, y)}`)
  }

  async function handleMarkPaid(id: string, isPaid: boolean) {
    setEntries((prev) => prev.map((e) => e.id === id ? { ...e, isPaid } : e))
    try {
      const res = await fetchWithAuth(
        `/api/costs/entries/${id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isPaid }),
        }
      )
      if (!res.ok) throw new Error()
    } catch {
      setEntries((prev) => prev.map((e) => e.id === id ? { ...e, isPaid: !isPaid } : e))
      toast.error("Error al actualizar el pago")
    }
  }

  async function handleUpdateAmount(id: string, amount: number) {
    const previous = entries.find((e) => e.id === id)?.amount
    setEntries((prev) => prev.map((e) => e.id === id ? { ...e, amount } : e))
    try {
      const res = await fetchWithAuth(
        `/api/costs/entries/${id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount }),
        }
      )
      if (!res.ok) throw new Error()
      toast.success("Monto actualizado")
    } catch {
      setEntries((prev) =>
        prev.map((e) => e.id === id ? { ...e, amount: previous ?? amount } : e)
      )
      toast.error("Error al actualizar el monto")
    }
  }

  const grouped = useMemo(() => {
    const map = new Map<string, { licensePlate: string | null; entries: CostEntry[] }>()
    for (const e of entries) {
      const key = e.truckId ?? "null"
      if (!map.has(key)) {
        map.set(key, { licensePlate: e.truckLicensePlate ?? null, entries: [] })
      }
      map.get(key)!.entries.push(e)
    }
    return Array.from(map.entries()).sort(([aKey, aVal], [bKey, bVal]) => {
      if (aKey === "null") return 1
      if (bKey === "null") return -1
      return (aVal.licensePlate ?? "").localeCompare(bVal.licensePlate ?? "")
    })
  }, [entries])

  const total = entries.reduce((s, e) => s + getEntryDisplayAmount(e, displayCurrency), 0)
  const paid = entries.filter((e) => e.isPaid).reduce((s, e) => s + getEntryDisplayAmount(e, displayCurrency), 0)
  const pending = total - paid

  return (
    <div className="p-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/costos"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold leading-none">
              {MONTH_NAMES[month - 1]} {year}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">Vista mensual de costos</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => navigateMonth(-1)}
            aria-label="Mes anterior"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => navigateMonth(1)}
            aria-label="Mes siguiente"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      {/* KPIs */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border p-4">
            <p className="text-xs text-muted-foreground">Total del mes</p>
            <p className="text-2xl font-bold mt-1 tabular-nums">{formatCurrency(total, displayCurrency)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{entries.length} entradas</p>
          </div>
          <div className="rounded-xl border p-4">
            <p className="text-xs text-muted-foreground">Pagado</p>
            <p className="text-2xl font-bold mt-1 tabular-nums text-green-600">
              {formatCurrency(paid, displayCurrency)}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {entries.filter((e) => e.isPaid).length} de {entries.length} entradas
            </p>
          </div>
          <div className="rounded-xl border p-4">
            <p className="text-xs text-muted-foreground">Pendiente</p>
            <p className="text-2xl font-bold mt-1 tabular-nums text-orange-600">
              {formatCurrency(pending, displayCurrency)}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {entries.filter((e) => !e.isPaid).length} entradas sin pagar
            </p>
          </div>
        </div>
      )}

      {/* Grouped tables */}
      {isLoading ? (
        <div className="flex flex-col gap-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="h-5 w-36" />
              {[0, 1, 2].map((j) => <Skeleton key={j} className="h-10 w-full" />)}
            </div>
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="rounded-lg border p-10 text-center text-sm text-muted-foreground">
          No hay costos registrados para este mes.
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {grouped.map(([key, { licensePlate, entries: groupEntries }]) => {
            const groupTotal = groupEntries.reduce((s, e) => s + getEntryDisplayAmount(e, displayCurrency), 0)
            const groupPaid = groupEntries
              .filter((e) => e.isPaid)
              .reduce((s, e) => s + getEntryDisplayAmount(e, displayCurrency), 0)
            const truckId = key === "null" ? null : key
            const truckData = truckId ? truckMap.get(truckId) : undefined
            const costPerKm =
              truckData?.estimatedMonthlyKm
                ? groupTotal / truckData.estimatedMonthlyKm
                : null

            return (
              <div key={key} className="flex flex-col gap-2">
                {/* Group header */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <TruckIcon className="size-4 text-muted-foreground" />
                    {truckId && licensePlate ? (
                      <Link
                        href={`/camiones/${truckId}/costos`}
                        className="font-semibold text-sm hover:underline"
                      >
                        {licensePlate}
                      </Link>
                    ) : (
                      <span className="font-semibold text-sm text-muted-foreground">
                        Sin camión
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {groupEntries.length} entrada{groupEntries.length !== 1 ? "s" : ""}
                    </span>
                    {truckData && !truckData.estimatedMonthlyKm && (
                      <Badge
                        variant="outline"
                        className="text-xs text-orange-700 border-orange-300 bg-orange-50 dark:bg-orange-950/30 py-0 h-4"
                      >
                        Falta configurar
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm tabular-nums flex items-center gap-3">
                    {costPerKm !== null && (
                      <span className="text-xs text-muted-foreground">
                        {formatCurrency2(costPerKm, displayCurrency)}/km
                      </span>
                    )}
                    <div className="flex items-center gap-1">
                      <span className="text-green-600 font-medium">{formatCurrency(groupPaid, displayCurrency)}</span>
                      <span className="text-muted-foreground">/</span>
                      <span className="font-medium">{formatCurrency(groupTotal, displayCurrency)}</span>
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div className="rounded-lg border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50 border-b">
                        <th className="px-3 py-2 w-8">
                          <span className="sr-only">Pagado</span>
                        </th>
                        <th className="text-left px-3 py-2 font-medium text-muted-foreground text-xs">
                          Concepto
                        </th>
                        <th className="text-left px-3 py-2 font-medium text-muted-foreground text-xs">
                          Tipo
                        </th>
                        <th className="text-right px-3 py-2 font-medium text-muted-foreground text-xs">
                          Monto
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupEntries.map((e) => (
                        <tr
                          key={e.id}
                          className={cn(
                            "border-b last:border-b-0 transition-colors",
                            e.type === "Fixed"
                              ? "bg-green-50/50 dark:bg-green-950/20"
                              : "hover:bg-muted/30",
                            e.isPaid && "opacity-60"
                          )}
                        >
                          <td className="px-3 py-2.5 text-center">
                            <Checkbox
                              checked={e.isPaid}
                              onCheckedChange={(checked) =>
                                handleMarkPaid(e.id, !!checked)
                              }
                            />
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={cn(
                                  "font-medium",
                                  e.isPaid && "line-through text-muted-foreground"
                                )}
                              >
                                {e.name}
                              </span>
                              {e.scope === "CompanyWide" && (
                                <Badge
                                  variant="outline"
                                  className="text-xs text-blue-700 border-blue-300 bg-blue-50 dark:bg-blue-950/30 py-0 h-4"
                                >
                                  Empresa
                                </Badge>
                              )}
                            </div>
                            {e.installmentPlanName && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {e.installmentPlanName}
                              </p>
                            )}
                          </td>
                          <td className="px-3 py-2.5">
                            <Badge variant="outline" className="text-xs">
                              {e.type === "Fixed" ? "Fijo" : "Variable"}
                            </Badge>
                          </td>
                          <td className="px-3 py-2.5 text-right">
                            <AmountCell
                              entry={e}
                              onUpdateAmount={handleUpdateAmount}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function CostosMensualPage() {
  return (
    <Suspense>
      <MonthlyCostsContent />
    </Suspense>
  )
}
