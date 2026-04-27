"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { fetchWithAuth } from "@/lib/api"
import { toast } from "sonner"
import { ArrowLeft } from "lucide-react"
import { TotalIncomeCard } from "@/components/total-income-card"
import { TotalExpenseCard } from "@/components/total-expense-card"
import { NetBalanceCard } from "@/components/net-balance-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "../data-table"
import { ColumnDef } from "@tanstack/react-table"

type Truck = {
  id: string
  licensePlate: string
  model: string
  year: number
}

type Income = {
  id: string
  description: string
  value: number
  truckId: string
  truckLicensePlate: string | null
  dateUtc: string
  type: string
}

type Expense = {
  id: string
  date: string
  type: number
  value: number
  truckId: string | null
  truckLicensePlate: string | null
  name: string | null
  kilometers: number | null
  liters: number | null
}

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
  status: number
  notes: string | null
}

const tripStatusLabels: Record<number, string> = {
  1: "Programado", 2: "En progreso", 3: "Completado", 4: "Cancelado",
}

const tripStatusColorMap: Record<number, string> = {
  1: "bg-yellow-100 text-yellow-800 border-yellow-300",
  2: "bg-blue-100 text-blue-800 border-blue-300",
  3: "bg-green-100 text-green-800 border-green-300",
  4: "bg-red-100 text-red-800 border-red-300",
}

const expenseTypeLabels: Record<number, string> = {
  1: "Gasoil", 2: "Arla 32", 3: "Mantenimiento", 4: "Gomería",
  5: "Aceite", 6: "Estacionamiento", 7: "Peaje", 8: "Salario",
  9: "Contador", 10: "Financiamiento", 11: "Otro",
}

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(value)
}

function formatBRL2(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
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

const tripColumns: ColumnDef<Trip>[] = [
  {
    accessorKey: "departureDate",
    header: "Salida",
    cell: ({ row }) => new Date(row.getValue("departureDate")).toLocaleDateString("es-UY"),
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
      const status = row.getValue("status") as number
      return (
        <Badge variant="outline" className={tripStatusColorMap[status] || "bg-gray-100 text-gray-800 border-gray-300"}>
          {tripStatusLabels[status] || "Desconocido"}
        </Badge>
      )
    },
  },
]

const incomeColumns: ColumnDef<Income>[] = [
  { accessorKey: "description", header: "Descripción" },
  {
    accessorKey: "value",
    header: "Valor",
    cell: ({ row }) => formatBRL(row.getValue("value")),
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
    cell: ({ row }) => new Date(row.getValue("dateUtc")).toLocaleDateString("es-UY"),
  },
]

const expenseColumns: ColumnDef<Expense>[] = [
  {
    accessorKey: "name",
    header: "Nombre",
    cell: ({ row }) => row.getValue("name") ?? <span className="text-muted-foreground">—</span>,
  },
  {
    accessorKey: "type",
    header: "Tipo",
    cell: ({ row }) => (
      <Badge variant="outline">{expenseTypeLabels[row.getValue("type") as number] ?? "Desconocido"}</Badge>
    ),
  },
  {
    accessorKey: "value",
    header: "Valor",
    cell: ({ row }) => formatBRL(row.getValue("value")),
  },
  {
    accessorKey: "date",
    header: "Fecha",
    cell: ({ row }) => new Date((row.getValue("date") as string) + "T00:00:00").toLocaleDateString("es-UY"),
  },
  {
    accessorKey: "kilometers",
    header: "Km",
    cell: ({ row }) => {
      const km = row.getValue("kilometers") as number | null
      return km != null ? km.toLocaleString("es-UY") : <span className="text-muted-foreground">—</span>
    },
  },
]

function CardSkeleton() {
  return <Skeleton className="h-24 w-full rounded-xl" />
}

export default function TruckDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [truck, setTruck] = useState<Truck | null>(null)
  const [trips, setTrips] = useState<Trip[]>([])
  const [incomes, setIncomes] = useState<Income[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/trucks/${id}`, { method: "GET" }),
      fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/trips`, { method: "GET" }),
      fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/incomes`, { method: "GET" }),
      fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/expenses`, { method: "GET" }),
    ])
      .then(async ([truckRes, tripsRes, incRes, expRes]) => {
        if (!truckRes.ok) { router.push("/camiones"); return; }
        if (!tripsRes.ok || !incRes.ok || !expRes.ok) throw new Error()
        const [truckData, allTrips, allIncomes, allExpenses] = await Promise.all([
          truckRes.json(), tripsRes.json(), incRes.json(), expRes.json(),
        ])
        setTruck(truckData)
        setTrips(allTrips.filter((t: Trip) => t.truckId === id))
        setIncomes(allIncomes.filter((i: Income) => i.truckId === id))
        setExpenses(allExpenses.filter((e: Expense) => e.truckId === id))
      })
      .catch(() => toast.error("Error al cargar datos del camión"))
      .finally(() => setIsLoading(false))
  }, [id, router])

  const totalIncome = useMemo(() => incomes.reduce((acc, i) => acc + i.value, 0), [incomes])
  const totalExpense = useMemo(() => expenses.reduce((acc, e) => acc + e.value, 0), [expenses])
  const totalKm = useMemo(() => trips.reduce((acc, t) => acc + (t.kilometers ?? 0), 0), [trips])
  const costPerKm = useMemo(() => totalKm > 0 ? totalExpense / totalKm : null, [totalExpense, totalKm])
  const revenuePerKm = useMemo(() => totalKm > 0 ? totalIncome / totalKm : null, [totalIncome, totalKm])

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
              title="Costo por km"
              value={costPerKm !== null ? `${formatBRL2(costPerKm)}/km` : "—"}
              subtitle={totalKm === 0 ? "Sin km registrados" : "Egresos totales / km"}
            />
            <MetricCard
              title="Ingreso por km"
              value={revenuePerKm !== null ? `${formatBRL2(revenuePerKm)}/km` : "—"}
              subtitle={totalKm === 0 ? "Sin km registrados" : "Ingresos totales / km"}
            />
          </div>
        </>
      )}

      <div className="flex flex-col gap-2">
        <h2 className="text-base font-semibold">Viajes</h2>
        {isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : (
          <DataTable
            columns={tripColumns}
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
            columns={incomeColumns}
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
            columns={expenseColumns}
            data={expenses}
            emptyMessage="No hay egresos registrados para este camión."
            searchPlaceholder="Buscar egreso..."
          />
        )}
      </div>
    </div>
  )
}
