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
import { MonthBalance } from "@/components/month-balance"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable, DataTableSkeleton } from "@/components/data-table"
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
import { normalizeIncomeType, type Income } from "@/app/(dashboard)/ingresos/columns"
import type { Expense } from "@/app/(dashboard)/egresos/columns"
import type { Truck } from "@/types/truck"
import { useOdometerReadings } from "@/hooks/use-odometer-readings"
import { TruckDueDates } from "@/components/due-dates/truck-due-dates"

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

// Mismos colores que la columna Moneda de /ingresos.
const currencyColorMap: Record<string, string> = {
  USD: "text-blue-600 border-blue-300 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-400",
  BRL: "border-success-border bg-success-surface text-success",
  UYU: "text-purple-600 border-purple-300 bg-purple-50 dark:border-purple-900 dark:bg-purple-950/40 dark:text-purple-400",
}

const tripStatusColorMap: Record<string, string> = {
  Scheduled: "bg-yellow-100 text-yellow-800 border-yellow-300",
  InProgress: "bg-blue-100 text-blue-800 border-blue-300",
  Completed: "border-success-border bg-success-surface text-success",
  Cancelled: "border-danger-border bg-danger-surface text-danger",
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
        return km != null ? <span className="tabular-nums">{km.toLocaleString("es-UY")} km</span> : <span className="text-muted-foreground">—</span>
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
      cell: ({ row }) => (
        <span className="font-medium tabular-nums text-success">
          {formatCurrency(getDisplayValue(row.original), displayCurrency)}
        </span>
      ),
    },
    {
      accessorKey: "currency",
      header: "Moneda",
      cell: ({ row }) => (
        <Badge variant="outline" className={currencyColorMap[row.original.currency] ?? ""}>
          {row.original.currency}
        </Badge>
      ),
    },
    {
      accessorKey: "type",
      header: "Categoría",
      cell: ({ row }) => {
        // La API manda "Freight"/"Other": sin normalizar, todo salía como "Otro".
        return normalizeIncomeType(row.getValue("type") as string) === "1"
          ? <Badge variant="outline" className="border-success-border bg-success-surface text-success">Flete</Badge>
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
            <Button variant="ghost" size="icon" aria-label="Editar ingreso" onClick={() => onEdit(income)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger render={
                <Button variant="ghost" size="icon" aria-label="Eliminar ingreso">
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
      cell: ({ row }) => (
        <span className="font-medium tabular-nums text-danger">
          {formatCurrency(getDisplayValue(row.original), displayCurrency)}
        </span>
      ),
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
        return km != null ? <span className="tabular-nums">{km.toLocaleString("es-UY")}</span> : <span className="text-muted-foreground">—</span>
      },
    },
    {
      accessorKey: "liters",
      header: "Litros",
      cell: ({ row }) => {
        const liters = row.original.liters
        return liters != null ? <span className="tabular-nums">{liters.toLocaleString("es-UY")}</span> : <span className="text-muted-foreground">—</span>
      },
    },
    {
      id: "actions",
      enableSorting: false,
      cell: ({ row }) => {
        const expense = row.original
        return (
          <div className="flex gap-1 justify-end">
            <Button variant="ghost" size="icon" aria-label="Editar egreso" onClick={() => onEdit(expense)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger render={
                <Button variant="ghost" size="icon" aria-label="Eliminar egreso">
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

    const inMonth = odometerReadings.filter((r) => {
      const d = new Date(r.readingDateUtc)
      return d.getUTCFullYear() === year && d.getUTCMonth() === month
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

  const totalCostPerKm = useMemo(() => {
    if (kmForMetrics == null) return null
    return totalExpense / kmForMetrics
  }, [totalExpense, kmForMetrics])

  const profitPerKm = useMemo(() => {
    if (kmForMetrics == null) return null
    return (totalIncome - totalExpense) / kmForMetrics
  }, [totalIncome, totalExpense, kmForMetrics])

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
            className="border-warning-border bg-warning-surface text-warning gap-1"
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
        <div className="flex flex-col gap-3">
          <Skeleton className="h-9 w-80" />
          <Skeleton className="h-1.5 w-full rounded-full" />
          <Skeleton className="h-5 w-full max-w-xl" />
        </div>
      ) : (
        <>
          {/* Los ratios por km son la composición del balance, no métricas aparte:
              van en la misma línea de datos que ingresos y egresos. */}
          <MonthBalance income={totalIncome} expense={totalExpense}>
            {revenuePerKm !== null && (
              <div className="flex items-center gap-1.5">
                <dt className="text-muted-foreground">Ingreso/km</dt>
                <dd className="font-medium tabular-nums">
                  {formatCurrency2(revenuePerKm, displayCurrency)}
                </dd>
              </div>
            )}
            {totalCostPerKm !== null && (
              <div className="flex items-center gap-1.5">
                <dt className="text-muted-foreground">Costo/km</dt>
                <dd className="font-medium tabular-nums">
                  {formatCurrency2(totalCostPerKm, displayCurrency)}
                </dd>
              </div>
            )}
            {profitPerKm !== null && (
              <div className="flex items-center gap-1.5">
                <dt className="text-muted-foreground">Utilidad/km</dt>
                <dd
                  className={`font-medium tabular-nums ${
                    profitPerKm >= 0
                      ? "text-success"
                      : "text-danger"
                  }`}
                >
                  {formatCurrency2(profitPerKm, displayCurrency)}
                </dd>
              </div>
            )}
          </MonthBalance>

          {kmForMetrics == null && (
            <p className="text-sm text-muted-foreground">
              Sin kilómetros registrados: no se pueden calcular los ratios por km.
            </p>
          )}

          {(truck?.currentKm != null || truck?.estimatedMonthlyKm != null || odometerResult !== null) && (
            <section className="space-y-3">
              <h2 className="border-b pb-2 font-semibold">Odómetro</h2>
              <dl className="flex flex-wrap gap-x-8 gap-y-1 text-sm">
                {odometerResult !== null ? (
                  <div className="flex items-center gap-1.5">
                    <dt className="text-muted-foreground">Recorridos</dt>
                    <dd className="font-medium tabular-nums">
                      {odometerResult.km.toLocaleString("es-UY")} km
                    </dd>
                    <span className="text-muted-foreground tabular-nums">
                      ({odometerResult.baseline.km.toLocaleString("es-UY")} →{" "}
                      {odometerResult.final.km.toLocaleString("es-UY")})
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <dt className="text-muted-foreground">Viajes registrados</dt>
                    <dd className="font-medium tabular-nums">{trips.length}</dd>
                  </div>
                )}
                {truck?.currentKm != null && (
                  <div className="flex items-center gap-1.5">
                    <dt className="text-muted-foreground">Km actual</dt>
                    <dd className="font-medium tabular-nums">
                      {truck.currentKm.toLocaleString("es-UY")} km
                    </dd>
                    {truck.lastKmUpdatedAt && (
                      <span className="text-muted-foreground tabular-nums">
                        ({formatDate(truck.lastKmUpdatedAt)})
                      </span>
                    )}
                  </div>
                )}
                {truck?.estimatedMonthlyKm != null && (
                  <div className="flex items-center gap-1.5">
                    <dt className="text-muted-foreground">Estimado por mes</dt>
                    <dd className="font-medium tabular-nums">
                      {truck.estimatedMonthlyKm.toLocaleString("es-UY")} km
                    </dd>
                  </div>
                )}
              </dl>
            </section>
          )}
        </>
      )}

      <TruckDueDates truckId={id} />

      <section className="flex flex-col gap-3">
        <h2 className="border-b pb-2 font-semibold">Viajes</h2>
        {isLoading ? (
          <DataTableSkeleton columns={6} rows={4} />
        ) : (
          <DataTable
            columns={tripCols}
            data={trips}
            emptyMessage="No hay viajes registrados para este camión."
            searchPlaceholder="Buscar viaje..."
          />
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="border-b pb-2 font-semibold">Ingresos</h2>
        {isLoading ? (
          <DataTableSkeleton columns={6} rows={4} />
        ) : (
          <DataTable
            columns={incomeCols}
            data={incomes}
            emptyMessage="No hay ingresos registrados para este camión."
            searchPlaceholder="Buscar ingreso..."
          />
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="border-b pb-2 font-semibold">Egresos</h2>
        {isLoading ? (
          <DataTableSkeleton columns={6} rows={4} />
        ) : (
          <DataTable
            columns={expenseCols}
            data={expenses}
            emptyMessage="No hay egresos registrados para este camión."
            searchPlaceholder="Buscar egreso..."
          />
        )}
      </section>

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
