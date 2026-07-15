"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { fetchWithAuth } from "@/lib/api"
import { formatCurrency, formatCurrency2, formatDate } from "@/lib/format"
import { useCurrency } from "@/context/currency-context"
import { toast } from "sonner"
import { AlertTriangle, ArrowLeft, Eye, Pencil, Trash2 } from "lucide-react"
import { useDateFilter } from "@/context/date-filter-context"
import { TotalIncomeCard } from "@/components/total-income-card"
import { TotalExpenseCard } from "@/components/total-expense-card"
import { NetBalanceCard } from "@/components/net-balance-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/data-table"
import { ColumnDef } from "@tanstack/react-table"
import type { ExpenseCategory } from "@/types/expense-category"
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import EditIncomeForm from "@/app/(dashboard)/ingresos/EditIncomeForm"
import EditExpenseForm from "@/app/(dashboard)/egresos/EditExpenseForm"
import type { Income } from "@/app/(dashboard)/ingresos/columns"
import type { Expense } from "@/app/(dashboard)/egresos/columns"
import type { Truck } from "@/types/truck"
import type { CostEntry } from "@/types/costs"
import { useOdometerReadings } from "@/hooks/use-odometer-readings"

type Trip = {
  id: string
  departureDate: string
  arrivalDate: string
  origin: string
  destination: string
  truckId: string
  truckLicensePlate: string
  driverName: string | null
  kilometers: number | null
  status: string
  notes: string | null
}

const tripStatusLabels: Record<string, string> = {
  Scheduled: "Programado",
  InProgress: "En progreso",
  Completed: "Completado",
  Cancelled: "Cancelado",
}

const tripStatusColorMap: Record<string, string> = {
  Scheduled: "bg-yellow-100 text-yellow-800 border-yellow-300",
  InProgress: "bg-blue-100 text-blue-800 border-blue-300",
  Completed: "bg-green-100 text-green-800 border-green-300",
  Cancelled: "bg-red-100 text-red-800 border-red-300",
}


function MetricCard({ title, value, subtitle, valueColor }: { title: string; value: string; subtitle?: string; valueColor?: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${valueColor || ""}`}>{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  )
}

function buildTripColumns(): ColumnDef<Trip>[] {
  return [
    {
      accessorKey: "departureDate",
      header: "Salida",
      cell: ({ row }) => formatDate(row.getValue("departureDate")),
    },
    {
      id: "route",
      header: "Ruta",
      cell: ({ row }) => `${row.original.origin} → ${row.original.destination}`,
    },
    {
      accessorKey: "driverName",
      header: "Chofer",
      cell: ({ row }) => row.getValue("driverName") ?? <span className="text-muted-foreground">—</span>,
    },
    {
      accessorKey: "kilometers",
      header: "Km",
      cell: ({ row }) => {
        const km = row.getValue("kilometers") as number | null
        return km != null ? `${km.toLocaleString("es-UY")} km` : <span className="text-muted-foreground">—</span>
      },
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        return (
          <Badge variant="outline" className={tripStatusColorMap[status] || "bg-gray-100 text-gray-800 border-gray-300"}>
            {tripStatusLabels[status] || "Desconocido"}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Link href={`/trips/${row.original.id}`}>
            <Button variant="ghost" size="icon">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      ),
    },
  ]
}

function buildIncomeColumns(
  onEdit: (income: Income) => void,
  onDelete: (income: Income) => void,
  displayCurrency: import("@/lib/format").DisplayCurrency,
  getDisplayValue: (item: { value: number; valueUSD?: number | null; valueBRL?: number | null; valueUYU?: number | null }) => number,
): ColumnDef<Income>[] {
  return [
    { accessorKey: "description", header: "Descripción" },
    {
      accessorKey: "value",
      header: "Valor",
      cell: ({ row }) => formatCurrency(getDisplayValue(row.original), displayCurrency),
    },
    {
      accessorKey: "type",
      header: "Categoría",
      cell: ({ row }) => {
        const type = row.getValue("type") as string
        return type === "1"
          ? <Badge variant="outline" className="text-green-400 border-green-400 bg-green-100">Flete</Badge>
          : <Badge variant="outline">Otro</Badge>
      },
    },
    {
      accessorKey: "dateUtc",
      header: "Fecha",
      cell: ({ row }) => formatDate(row.getValue("dateUtc")),
    },
    {
      id: "actions",
      enableSorting: false,
      cell: ({ row }) => {
        const income = row.original
        return (
          <div className="flex gap-1 justify-end">
            <Button variant="ghost" size="icon" onClick={() => onEdit(income)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger render={
                <Button variant="ghost" size="icon">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              } />
              <AlertDialogContent size="sm">
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Eliminar ingreso?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. Se eliminará{" "}
                    <span className="font-medium text-foreground">{income.description}</span>.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction variant="destructive" onClick={() => onDelete(income)}>
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )
      },
    },
  ]
}

function buildExpenseColumns(
  onEdit: (expense: Expense) => void,
  onDelete: (expense: Expense) => void,
  displayCurrency: import("@/lib/format").DisplayCurrency,
  getDisplayValue: (item: { value: number; valueUSD?: number | null; valueBRL?: number | null; valueUYU?: number | null }) => number,
): ColumnDef<Expense>[] {
  return [
    {
      accessorKey: "name",
      header: "Nombre",
      cell: ({ row }) => row.getValue("name") ?? <span className="text-muted-foreground">—</span>,
    },
    {
      accessorKey: "value",
      header: "Valor",
      cell: ({ row }) => formatCurrency(getDisplayValue(row.original), displayCurrency),
    },
    {
      accessorKey: "categoryName",
      header: "Tipo",
      cell: ({ row }) => (
        <Badge variant="outline">{(row.getValue("categoryName") as string | null) ?? "Sin categoría"}</Badge>
      ),
    },
    {
      accessorKey: "date",
      header: "Fecha",
      cell: ({ row }) => formatDate(row.getValue("date")),
    },
    {
      accessorKey: "kilometers",
      header: "Km",
      cell: ({ row }) => {
        const km = row.getValue("kilometers") as number | null
        return km != null ? km.toLocaleString("es-UY") : <span className="text-muted-foreground">—</span>
      },
    },
    {
      id: "actions",
      enableSorting: false,
      cell: ({ row }) => {
        const expense = row.original
        return (
          <div className="flex gap-1 justify-end">
            <Button variant="ghost" size="icon" onClick={() => onEdit(expense)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger render={
                <Button variant="ghost" size="icon">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              } />
              <AlertDialogContent size="sm">
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Eliminar egreso?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. Se eliminará{" "}
                    <span className="font-medium text-foreground">
                      {expense.name ?? expense.categoryName ?? "Sin categoría"}
                    </span>.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction variant="destructive" onClick={() => onDelete(expense)}>
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )
      },
    },
  ]
}

function CardSkeleton() {
  return <Skeleton className="h-24 w-full rounded-xl" />
}

export default function TruckDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { selectedDate } = useDateFilter()
  const { displayCurrency, getDisplayValue } = useCurrency()
  const selectedYear = (selectedDate ?? new Date()).getFullYear()
  const { readings: odometerReadings } = useOdometerReadings(id, selectedYear)
  const [truck, setTruck] = useState<Truck | null>(null)
  const [trucks, setTrucks] = useState<Truck[]>([])
  const [categories, setCategories] = useState<ExpenseCategory[]>([])
  const [allTrips, setAllTrips] = useState<Trip[]>([])
  const [allIncomes, setAllIncomes] = useState<Income[]>([])
  const [allExpenses, setAllExpenses] = useState<Expense[]>([])
  const [monthCostEntries, setMonthCostEntries] = useState<CostEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingIncome, setEditingIncome] = useState<Income | null>(null)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)

  useEffect(() => {
    Promise.all([
      fetchWithAuth(`/api/trucks/${id}`),
      fetchWithAuth(`/api/trucks`),
      fetchWithAuth(`/api/trips`),
      fetchWithAuth(`/api/incomes`),
      fetchWithAuth(`/api/expenses`),
      fetchWithAuth(`/api/expense-categories`),
    ])
      .then(async ([truckRes, trucksRes, tripsRes, incRes, expRes, catsRes]) => {
        if (!truckRes.ok) { router.push("/camiones"); return }
        if (!trucksRes.ok || !tripsRes.ok || !incRes.ok || !expRes.ok) throw new Error()
        const [truckData, trucksData, tripsData, incomesData, expensesData] = await Promise.all([
          truckRes.json(), trucksRes.json(), tripsRes.json(), incRes.json(), expRes.json(),
        ])
        const catsData = catsRes.ok ? await catsRes.json() : []
        setTruck(truckData)
        setTrucks(Array.isArray(trucksData) ? trucksData : [])
        setCategories(Array.isArray(catsData) ? catsData : [])
        setAllTrips(tripsData.filter((t: Trip) => t.truckId === id))
        setAllIncomes(incomesData.filter((i: Income) => i.truckId === id))
        setAllExpenses(expensesData.filter((e: Expense) => e.truckId === id))
      })
      .catch(() => toast.error("Error al cargar datos del camión"))
      .finally(() => setIsLoading(false))
  }, [id, router])

  // Costos fijos del mes: entries con valueUSD/BRL/UYU (el summary no trae montos convertidos)
  useEffect(() => {
    const date = selectedDate ?? new Date()
    const month = date.getMonth() + 1
    const year = date.getFullYear()
    fetchWithAuth(`/api/costs/monthly?truckId=${id}&month=${month}&year=${year}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setMonthCostEntries(Array.isArray(data) ? data : []))
      .catch(() => setMonthCostEntries([]))
  }, [id, selectedDate])

  const handleDeleteIncome = useCallback(async (income: Income) => {
    const res = await fetchWithAuth(`/api/incomes/${income.id}`, { method: "DELETE" })
    if (!res.ok) { const e = await res.json().catch(() => ({})); toast.error(e.message || e.title || "Error al eliminar ingreso"); return }
    toast.success("Ingreso eliminado")
    setAllIncomes((prev) => prev.filter((i) => i.id !== income.id))
  }, [])

  const handleDeleteExpense = useCallback(async (expense: Expense) => {
    const res = await fetchWithAuth(`/api/expenses/${expense.id}`, { method: "DELETE" })
    if (!res.ok) { const e = await res.json().catch(() => ({})); toast.error(e.message || e.title || "Error al eliminar egreso"); return }
    toast.success("Egreso eliminado")
    setAllExpenses((prev) => prev.filter((e) => e.id !== expense.id))
  }, [])

  const trips = useMemo(() => {
    if (!selectedDate) return allTrips
    return allTrips.filter((t) => {
      const [tripYear, tripMonth] = t.departureDate.split("T")[0].split("-").map(Number)
      return tripMonth - 1 === selectedDate.getMonth() && tripYear === selectedDate.getFullYear()
    })
  }, [allTrips, selectedDate])

  const incomes = useMemo(() => {
    if (!selectedDate) return allIncomes
    return allIncomes.filter((i) => {
      const d = new Date(i.dateUtc)
      return d.getUTCMonth() === selectedDate.getMonth() && d.getUTCFullYear() === selectedDate.getFullYear()
    })
  }, [allIncomes, selectedDate])

  const expenses = useMemo(() => {
    if (!selectedDate) return allExpenses
    return allExpenses.filter((e) => {
      const d = new Date(e.date + "T00:00:00")
      return d.getMonth() === selectedDate.getMonth() && d.getFullYear() === selectedDate.getFullYear()
    })
  }, [allExpenses, selectedDate])

  const totalIncome = useMemo(() => incomes.reduce((acc, i) => acc + getDisplayValue(i), 0), [incomes, getDisplayValue])
  const totalExpense = useMemo(() => expenses.reduce((acc, e) => acc + getDisplayValue(e), 0), [expenses, getDisplayValue])
  const totalKm = useMemo(() => trips.reduce((acc, t) => acc + (t.kilometers ?? 0), 0), [trips])

  const odometerResult = useMemo(() => {
    const date = selectedDate ?? new Date()
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstOfMonth = new Date(year, month, 1)
    const lastOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999)

    const inMonth = odometerReadings.filter((r) => {
      const d = new Date(r.readingDateUtc)
      return d >= firstOfMonth && d <= lastOfMonth
    })

    if (inMonth.length < 2) return null

    const baseline = inMonth.reduce((min, r) => (r.km < min.km ? r : min), inMonth[0])
    const final = inMonth.reduce((max, r) => (r.km > max.km ? r : max), inMonth[0])

    const km = final.km - baseline.km
    if (km <= 0) return null

    return { km, baseline, final }
  }, [odometerReadings, selectedDate])

  const kmForMetrics = odometerResult?.km ?? (totalKm > 0 ? totalKm : null)
  const revenuePerKm = useMemo(() => kmForMetrics != null ? totalIncome / kmForMetrics : null, [totalIncome, kmForMetrics])

  const monthlyCost = useMemo(
    () => monthCostEntries.reduce((acc, e) => acc + getDisplayValue(e), 0),
    [monthCostEntries, getDisplayValue]
  )

  const totalCostPerKm = useMemo(() => {
    if (kmForMetrics == null) return null
    return (totalExpense + monthlyCost) / kmForMetrics
  }, [totalExpense, monthlyCost, kmForMetrics])

  const profitPerKm = useMemo(() => {
    if (kmForMetrics == null) return null
    return (totalIncome - totalExpense - monthlyCost) / kmForMetrics
  }, [totalIncome, totalExpense, monthlyCost, kmForMetrics])

  const tripCols = useMemo(() => buildTripColumns(), [])
  const incomeCols = useMemo(
    () => buildIncomeColumns(setEditingIncome, handleDeleteIncome, displayCurrency, getDisplayValue),
    [handleDeleteIncome, displayCurrency, getDisplayValue],
  )
  const expenseCols = useMemo(
    () => buildExpenseColumns(setEditingExpense, handleDeleteExpense, displayCurrency, getDisplayValue),
    [handleDeleteExpense, displayCurrency, getDisplayValue],
  )


  return (
    <div className="p-6 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Link href="/camiones" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        {isLoading ? (
          <Skeleton className="h-7 w-48" />
        ) : truck ? (
          <h1 className="text-xl font-bold">
            {truck.licensePlate}
            {truck.model && (
              <span className="font-normal text-muted-foreground ml-2">
                — {truck.model}{truck.year ? ` (${truck.year})` : ""}
              </span>
            )}
          </h1>
        ) : (
          <h1 className="text-xl font-bold">Camión no encontrado</h1>
        )}
        {truck && !truck.estimatedMonthlyKm && (
          <Badge
            variant="outline"
            className="text-orange-700 border-orange-300 bg-orange-50 dark:bg-orange-950/30 gap-1"
          >
            <AlertTriangle className="size-3" />
            Falta configurar km estimados
          </Badge>
        )}
        {truck && (
          <Link
            href={`/camiones/${id}/costos`}
            className="ml-auto text-sm font-medium text-muted-foreground border rounded-md px-3 py-1.5 hover:bg-muted transition-colors"
          >
            Costos fijos
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <CardSkeleton /><CardSkeleton /><CardSkeleton />
          <CardSkeleton /><CardSkeleton /><CardSkeleton />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <TotalIncomeCard total={totalIncome} />
            <TotalExpenseCard total={totalExpense + monthlyCost} />
            <NetBalanceCard income={totalIncome} expense={totalExpense + monthlyCost} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MetricCard
              title="Ingreso/km"
              value={revenuePerKm !== null ? `${formatCurrency2(revenuePerKm, displayCurrency)}/km` : "—"}
              subtitle={kmForMetrics == null ? "Sin km registrados" : "Ingresos totales / km"}
              valueColor="text-green-600"
            />
            <MetricCard
              title="Costo/km total"
              value={totalCostPerKm !== null ? `${formatCurrency2(totalCostPerKm, displayCurrency)}/km` : "—"}
              subtitle={kmForMetrics == null ? "Sin km registrados" : "Egresos + costos fijos / km"}
              valueColor="text-red-600"
            />
            <MetricCard
              title="Utilidad/km"
              value={profitPerKm !== null ? `${formatCurrency2(profitPerKm, displayCurrency)}/km` : "—"}
              subtitle={kmForMetrics == null ? "Sin km registrados" : "Ingresos − egresos − costos fijos / km"}
              valueColor={profitPerKm !== null ? (profitPerKm >= 0 ? "text-green-600" : "text-red-600") : undefined}
            />
          </div>
          {(truck?.currentKm != null || truck?.estimatedMonthlyKm != null) && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <MetricCard
                title="Km recorridos (odómetro)"
                value={odometerResult !== null ? `${odometerResult.km.toLocaleString("es-UY")} km` : "—"}
                subtitle={
                  odometerResult !== null
                    ? `${odometerResult.baseline.km.toLocaleString("es-UY")} → ${odometerResult.final.km.toLocaleString("es-UY")} km`
                    : `${trips.length} viaje${trips.length !== 1 ? "s" : ""} registrado${trips.length !== 1 ? "s" : ""}`
                }
              />
              {truck?.currentKm != null && (
                <MetricCard
                  title="Km actual"
                  value={`${truck.currentKm.toLocaleString("es-UY")} km`}
                  subtitle={truck?.lastKmUpdatedAt ? formatDate(truck.lastKmUpdatedAt) : undefined}
                />
              )}
              {truck?.estimatedMonthlyKm != null && (
                <MetricCard
                  title="Km mensuales estimados"
                  value={`${truck.estimatedMonthlyKm.toLocaleString("es-UY")} km`}
                  subtitle="Usado para calcular costo/km"
                />
              )}
            </div>
          )}
        </>
      )}

      <div className="flex flex-col gap-2">
        <h2 className="text-base font-semibold">Viajes</h2>
        {isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : (
          <DataTable
            columns={tripCols}
            data={trips}
            emptyMessage="No hay viajes registrados para este camión."
            searchPlaceholder="Buscar viaje..."
          />
        )}
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-base font-semibold">Ingresos</h2>
        {isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : (
          <DataTable
            columns={incomeCols}
            data={incomes}
            emptyMessage="No hay ingresos registrados para este camión."
            searchPlaceholder="Buscar ingreso..."
          />
        )}
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-base font-semibold">Egresos</h2>
        {isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : (
          <DataTable
            columns={expenseCols}
            data={expenses}
            emptyMessage="No hay egresos registrados para este camión."
            searchPlaceholder="Buscar egreso..."
          />
        )}
      </div>

      <Dialog open={!!editingIncome} onOpenChange={(open) => { if (!open) setEditingIncome(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar ingreso</DialogTitle>
          </DialogHeader>
          {editingIncome && (
            <EditIncomeForm
              income={editingIncome}
              trucks={trucks}
              onSuccess={(updated) => {
                setAllIncomes((prev) => prev.map((i) => i.id === updated.id ? updated : i))
                setEditingIncome(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingExpense} onOpenChange={(open) => { if (!open) setEditingExpense(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar egreso</DialogTitle>
          </DialogHeader>
          {editingExpense && (
            <EditExpenseForm
              expense={editingExpense}
              trucks={trucks}
              categories={categories}
              onSuccess={(updated) => {
                setAllExpenses((prev) => prev.map((e) => e.id === updated.id ? updated : e))
                setEditingExpense(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
