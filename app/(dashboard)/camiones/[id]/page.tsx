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
import { DataTable } from "../data-table"
import { ColumnDef } from "@tanstack/react-table"
import { getExpenseTypeLabel } from "@/lib/expense-types"
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
import type { SummaryMonth } from "@/types/costs"

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


function MetricCard({ title, value, subtitle }: { title: string; value: string; subtitle?: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
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
      header: "Tipo",
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
      accessorKey: "type",
      header: "Tipo",
      cell: ({ row }) => (
        <Badge variant="outline">{getExpenseTypeLabel(row.getValue("type") as number | string)}</Badge>
      ),
    },
    {
      accessorKey: "value",
      header: "Valor",
      cell: ({ row }) => formatCurrency(getDisplayValue(row.original), displayCurrency),
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
                      {expense.name ?? getExpenseTypeLabel(expense.type)}
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
  const [truck, setTruck] = useState<Truck | null>(null)
  const [trucks, setTrucks] = useState<Truck[]>([])
  const [allTrips, setAllTrips] = useState<Trip[]>([])
  const [allIncomes, setAllIncomes] = useState<Income[]>([])
  const [allExpenses, setAllExpenses] = useState<Expense[]>([])
  const [costSummary, setCostSummary] = useState<SummaryMonth[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingIncome, setEditingIncome] = useState<Income | null>(null)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)

  useEffect(() => {
    const year = (selectedDate ?? new Date()).getFullYear()
    Promise.all([
      fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/trucks/${id}`),
      fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/trucks`),
      fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/trips`),
      fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/incomes`),
      fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/expenses`),
      fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/costs/summary?truckId=${id}&year=${year}`),
    ])
      .then(async ([truckRes, trucksRes, tripsRes, incRes, expRes, summaryRes]) => {
        if (!truckRes.ok) { router.push("/camiones"); return }
        if (!trucksRes.ok || !tripsRes.ok || !incRes.ok || !expRes.ok) throw new Error()
        const [truckData, trucksData, tripsData, incomesData, expensesData] = await Promise.all([
          truckRes.json(), trucksRes.json(), tripsRes.json(), incRes.json(), expRes.json(),
        ])
        const summaryData = summaryRes.ok ? await summaryRes.json() : []
        setTruck(truckData)
        setTrucks(Array.isArray(trucksData) ? trucksData : [])
        setAllTrips(tripsData.filter((t: Trip) => t.truckId === id))
        setAllIncomes(incomesData.filter((i: Income) => i.truckId === id))
        setAllExpenses(expensesData.filter((e: Expense) => e.truckId === id))
        setCostSummary(Array.isArray(summaryData) ? summaryData : [])
      })
      .catch(() => toast.error("Error al cargar datos del camión"))
      .finally(() => setIsLoading(false))
  }, [id, router, selectedDate])

  const handleDeleteIncome = useCallback(async (income: Income) => {
    const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/incomes/${income.id}`, { method: "DELETE" })
    if (!res.ok) { toast.error("Error al eliminar ingreso"); return }
    toast.success("Ingreso eliminado")
    setAllIncomes((prev) => prev.filter((i) => i.id !== income.id))
  }, [])

  const handleDeleteExpense = useCallback(async (expense: Expense) => {
    const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/expenses/${expense.id}`, { method: "DELETE" })
    if (!res.ok) { toast.error("Error al eliminar egreso"); return }
    toast.success("Egreso eliminado")
    setAllExpenses((prev) => prev.filter((e) => e.id !== expense.id))
  }, [])

  const trips = useMemo(() => {
    if (!selectedDate) return allTrips
    return allTrips.filter((t) => {
      const d = new Date(t.departureDate)
      return d.getMonth() === selectedDate.getMonth() && d.getFullYear() === selectedDate.getFullYear()
    })
  }, [allTrips, selectedDate])

  const incomes = useMemo(() => {
    if (!selectedDate) return allIncomes
    return allIncomes.filter((i) => {
      const d = new Date(i.dateUtc)
      return d.getMonth() === selectedDate.getMonth() && d.getFullYear() === selectedDate.getFullYear()
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
  const costPerKm = useMemo(() => totalKm > 0 ? totalExpense / totalKm : null, [totalExpense, totalKm])
  const revenuePerKm = useMemo(() => totalKm > 0 ? totalIncome / totalKm : null, [totalIncome, totalKm])

  const costPerKmFromSummary = useMemo(() => {
    if (!truck?.estimatedMonthlyKm) return null
    const month = (selectedDate ?? new Date()).getMonth() + 1
    const monthlyCost = costSummary.find((s) => s.month === month)?.total ?? 0
    return monthlyCost / truck.estimatedMonthlyKm
  }, [truck, costSummary, selectedDate])

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
            <TotalExpenseCard total={totalExpense} />
            <NetBalanceCard income={totalIncome} expense={totalExpense} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MetricCard
              title="Kilómetros totales"
              value={totalKm > 0 ? `${totalKm.toLocaleString("es-UY")} km` : "—"}
              subtitle={`${trips.length} viaje${trips.length !== 1 ? "s" : ""} registrado${trips.length !== 1 ? "s" : ""}`}
            />
            <MetricCard
              title="Costo por km (viajes)"
              value={costPerKm !== null ? `${formatCurrency2(costPerKm, displayCurrency)}/km` : "—"}
              subtitle={totalKm === 0 ? "Sin km registrados" : "Egresos totales / km viajes"}
            />
            <MetricCard
              title="Ingreso por km"
              value={revenuePerKm !== null ? `${formatCurrency2(revenuePerKm, displayCurrency)}/km` : "—"}
              subtitle={totalKm === 0 ? "Sin km registrados" : "Ingresos totales / km"}
            />
          </div>
          {/* Km info + costs-based metric */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MetricCard
              title="Costo/km (costos fijos)"
              value={costPerKmFromSummary !== null ? `${formatCurrency2(costPerKmFromSummary, displayCurrency)}/km` : "Sin datos"}
              subtitle={
                !truck?.estimatedMonthlyKm
                  ? "Configurar km estimados en el camión"
                  : `Costos del mes / ${truck.estimatedMonthlyKm.toLocaleString("es-UY")} km est.`
              }
            />
            {truck?.currentKm != null && (
              <MetricCard
                title="Km actual"
                value={`${truck.currentKm.toLocaleString("es-UY")} km`}
                subtitle={
                  truck.lastKmUpdatedAt
                    ? `Hace ${Math.floor(
                        (Date.now() - new Date(truck.lastKmUpdatedAt).getTime()) /
                          (1000 * 60 * 60 * 24)
                      )} días`
                    : undefined
                }
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
