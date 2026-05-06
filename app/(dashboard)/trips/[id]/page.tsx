"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCurrency } from "@/context/currency-context";
import { formatCurrency, formatCurrency2, formatDate } from "@/lib/format";
import { fetchWithAuth } from "@/lib/api";
import type { Truck } from "@/types/truck";
import { toast } from "sonner";
import { getExpenseTypeLabel } from "@/lib/expense-types";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit2, Trash2 } from "lucide-react";
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
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Trip } from "../columns";
import EditTripForm from "../EditTripForm";
import { FuelEfficiencyCard } from "@/components/fuel-efficiency-card";
import AddIncomeForm from "@/app/(dashboard)/ingresos/AddIncomeForm";
import AddExpenseForm from "@/app/(dashboard)/egresos/AddExpenseForm";


type Income = {
  id: string;
  description: string;
  value: number;
  valueUSD: number | null;
  valueBRL: number | null;
  valueUYU: number | null;
  truckId: string | null;
  truckLicensePlate: string | null;
  dateUtc: string;
  type: string;
  currency: string;
  tripId?: string | null;
};

type Expense = {
  id: string;
  date: string;
  type: number | string;
  value: number;
  valueUSD: number | null;
  valueBRL: number | null;
  valueUYU: number | null;
  truckId: string | null;
  truckLicensePlate: string | null;
  name: string | null;
  kilometers: number | null;
  liters: number | null;
  tripId?: string | null;
};

type TripDetail = Trip & {
  incomes: Income[];
  expenses: Expense[];
  totalIncome: number;
  totalExpense: number;
  profit: number;
  costPerKm: number | null;
  initialKm: number | null;
  finalKm: number | null;
};

const tripStatusLabels: Record<string, string> = {
  Scheduled: "Programado",
  InProgress: "En progreso",
  Completed: "Completado",
  Cancelled: "Cancelado",
};

const tripStatusColorMap: Record<string, string> = {
  Scheduled: "bg-yellow-100 text-yellow-800 border-yellow-300",
  InProgress: "bg-blue-100 text-blue-800 border-blue-300",
  Completed: "bg-green-100 text-green-800 border-green-300",
  Cancelled: "bg-red-100 text-red-800 border-red-300",
};

export default function TripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.id as string;
  const { displayCurrency, getDisplayValue } = useCurrency();

  const [trip, setTrip] = useState<TripDetail | null>(null);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddIncomeDialogOpen, setIsAddIncomeDialogOpen] = useState(false);
  const [isAddExpenseDialogOpen, setIsAddExpenseDialogOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [tripRes, trucksRes] = await Promise.all([
          fetchWithAuth(
            `${process.env.NEXT_PUBLIC_API_URL}/api/trips/${tripId}`,
            { method: "GET" }
          ),
          fetchWithAuth(
            `${process.env.NEXT_PUBLIC_API_URL}/api/trucks`,
            { method: "GET" }
          ),
        ]);

        if (!tripRes.ok || !trucksRes.ok) throw new Error();

        const tripData = await tripRes.json();
        const trucksData = await trucksRes.json();
        console.log(tripData)
        setTrip(tripData);
        setTrucks(trucksData);
      } catch {
        toast.error("Error al cargar viaje");
        router.push("/trips");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [tripId, router]);

  const handleDelete = async () => {
    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/trips/${tripId}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error();
      toast.success("Viaje eliminado");
      router.push("/trips");
    } catch {
      toast.error("Error al eliminar viaje");
    }
  };

  const handleUpdateSuccess = (updated: Trip) => {
    setTrip(prev => prev ? { ...prev, ...updated } : null);
    setIsEditDialogOpen(false);
    toast.success("Viaje actualizado");
  };

  const handleAddIncomeSuccess = (newIncome: Income) => {
    setTrip(prev => prev ? {
      ...prev,
      incomes: [...prev.incomes, newIncome],
      totalIncome: prev.totalIncome + newIncome.value,
      profit: (prev.totalIncome + newIncome.value) - prev.totalExpense,
    } : null);
    setIsAddIncomeDialogOpen(false);
    toast.success("Ingreso agregado");
  };

  const handleAddExpenseSuccess = (newExpense: Expense) => {
    setTrip(prev => {
      if (!prev) return null;
      const newTotal = prev.totalExpense + newExpense.value;
      const tripKm = prev.initialKm != null && prev.finalKm != null
        ? prev.finalKm - prev.initialKm
        : prev.kilometers;
      return {
        ...prev,
        expenses: [...prev.expenses, newExpense],
        totalExpense: newTotal,
        profit: prev.totalIncome - newTotal,
        costPerKm: tripKm && tripKm > 0 ? newTotal / tripKm : null,
      };
    });
    setIsAddExpenseDialogOpen(false);
    toast.success("Egreso agregado");
  };

  // Helper to format trip totals (from API, already pre-calculated in display currency or fallback to BRL)
  const fmtMoney = (v: number) => formatCurrency(v, displayCurrency);
  const fmtMoney2 = (v: number) => formatCurrency2(v, displayCurrency);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Viaje no encontrado</p>
      </div>
    );
  }

  const statusLabel = tripStatusLabels[trip.status] || "Desconocido";
  const statusColors = tripStatusColorMap[trip.status] || "bg-gray-100 text-gray-800 border-gray-300";

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/trips")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {trip ? `${trip.origin} → ${trip.destination}` : 'Cargando...'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {trip && formatDate(trip.departureDate)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsEditDialogOpen(true)}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button variant="outline" size="icon">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              }
            />
            <AlertDialogContent size="sm">
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar viaje?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Se eliminará todo el registro del viaje.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  onClick={handleDelete}
                >
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Info Básica */}
        <div className="rounded-lg border p-4 space-y-3">
          <h3 className="font-semibold">Información del viaje</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Salida:</span>
              <span className="font-medium">{formatDate(trip.departureDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Llegada:</span>
              <span className="font-medium">{trip.arrivalDate ? formatDate(trip.arrivalDate) : <span className="text-muted-foreground">—</span>}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Camión:</span>
              <span className="font-medium">{trip.truckLicensePlate}</span>
            </div>
            {trip.driverName && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Chofer:</span>
                <span className="font-medium">{trip.driverName}</span>
              </div>
            )}
            {trip.initialKm != null && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Km inicial:</span>
                <span className="font-medium">{trip.initialKm.toLocaleString("es-UY")} km</span>
              </div>
            )}
            {trip.finalKm != null && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Km final:</span>
                <span className="font-medium">{trip.finalKm.toLocaleString("es-UY")} km</span>
              </div>
            )}
            {trip.initialKm != null && trip.finalKm != null && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total km:</span>
                <span className="font-medium">{(trip.finalKm - trip.initialKm).toLocaleString("es-UY")} km</span>
              </div>
            )}
            {trip.kilometers && trip.initialKm == null && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Kilómetros:</span>
                <span className="font-medium">{trip.kilometers} km</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estado:</span>
              <Badge variant="outline" className={statusColors}>
                {statusLabel}
              </Badge>
            </div>
          </div>
        </div>

        {/* Financiero */}
        <div className="rounded-lg border p-4 space-y-3">
          <h3 className="font-semibold">Resumen financiero</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between pb-2 border-b">
              <span className="text-muted-foreground">Total ingresos:</span>
              <span className="font-medium text-green-600">
                {fmtMoney(trip.totalIncome)}
              </span>
            </div>
            <div className="flex justify-between pb-2 border-b">
              <span className="text-muted-foreground">Total egresos:</span>
              <span className="font-medium text-red-600">
                {fmtMoney(trip.totalExpense)}
              </span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="font-semibold">Utilidad:</span>
              <span className={`font-bold text-lg ${trip.profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                {fmtMoney(trip.profit)}
              </span>
            </div>
            {trip.totalIncome > 0 && (
              <div className="flex justify-between border-t pt-2">
                <span className="text-muted-foreground">Margen:</span>
                <span className={`font-medium ${(trip.profit / trip.totalIncome) >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {Math.round((trip.profit / trip.totalIncome) * 100)}%
                </span>
              </div>
            )}
            {trip.costPerKm !== null && (
              <div className="flex justify-between border-t pt-2">
                <span className="text-muted-foreground">Costo/km:</span>
                <span className="font-medium">
                  {fmtMoney2(trip.costPerKm)}
                </span>
              </div>
            )}
            {(() => {
              const tripKm = trip.initialKm != null && trip.finalKm != null
                ? trip.finalKm - trip.initialKm
                : trip.kilometers;
              return tripKm && tripKm > 0 && trip.totalIncome > 0 ? (
                <div className="flex justify-between border-t pt-2">
                  <span className="text-muted-foreground">Ingreso/km:</span>
                  <span className="font-medium text-green-600">
                    {fmtMoney2(trip.totalIncome / tripKm)}
                  </span>
                </div>
              ) : null;
            })()}
          </div>
        </div>
      </div>

      {/* Ingresos */}
      <div className="rounded-lg border p-4 space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold">Ingresos asociados</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddIncomeDialogOpen(true)}
          >
            + Agregar ingreso
          </Button>
        </div>
        {trip.incomes.length > 0 ? (
          <div className="space-y-2 text-sm">
            {trip.incomes.map((income) => (
              <div key={income.id} className="flex justify-between pb-2 border-b last:border-0">
                <div>
                  <p className="font-medium">{income.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(income.dateUtc)}
                  </p>
                </div>
                <p className="font-medium text-green-600">
                  {fmtMoney(getDisplayValue(income))}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Sin ingresos registrados</p>
        )}
      </div>

      {/* Egresos */}
      <div className="rounded-lg border p-4 space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold">Egresos asociados</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddExpenseDialogOpen(true)}
          >
            + Agregar egreso
          </Button>
        </div>
        {trip.expenses.length > 0 ? (
          <div className="space-y-2 text-sm">
            {trip.expenses.map((expense) => (
              <div key={expense.id} className="flex justify-between pb-2 border-b last:border-0">
                <div>
                  <p className="font-medium">{expense.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(expense.date)}
                  </p>
                </div>
                <p className="font-medium text-red-600">
                  {fmtMoney(getDisplayValue(expense))}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Sin egresos registrados</p>
        )}
      </div>

      {trip.incomes.length === 0 && trip.expenses.length === 0 && (
        <div className="rounded-lg border p-4 text-center text-muted-foreground">
          No hay ingresos ni egresos asociados a este viaje
        </div>
      )}

      {/* Breakdown de egresos por categoría */}
      {trip.expenses.length > 0 && (() => {
        const breakdown = trip.expenses.reduce<Record<string, number>>((acc, e) => {
          const key = String(e.type)
          acc[key] = (acc[key] ?? 0) + getDisplayValue(e);
          return acc;
        }, {});
        const sorted = Object.entries(breakdown).sort(([, a], [, b]) => b - a);
        return (
          <div className="rounded-lg border p-4 space-y-3">
            <h3 className="font-semibold">Egresos por categoría</h3>
            <div className="space-y-2 text-sm">
              {sorted.map(([type, total]) => (
                <div key={type} className="flex justify-between items-center">
                  <span className="text-muted-foreground">{getExpenseTypeLabel(type)}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {Math.round((total / trip.totalExpense) * 100)}%
                    </span>
                    <span className="font-medium text-red-600 w-28 text-right">
                      {fmtMoney(total)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* FUEL EFFICIENCY - Solo mostrar si hay egresos con combustible */}
      {trip.expenses.length > 0 && (
        <FuelEfficiencyCard expenses={trip.expenses as any} truckId={trip.truckId} />
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-sm overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Editar viaje</DialogTitle>
          </DialogHeader>
          <EditTripForm
            trip={trip}
            trucks={trucks}
            onSuccess={handleUpdateSuccess}
          />
        </DialogContent>
      </Dialog>

      {/* Add Income Dialog */}
      <Dialog open={isAddIncomeDialogOpen} onOpenChange={setIsAddIncomeDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Agregar ingreso</DialogTitle>
            <DialogDescription>
              Registrá un nuevo ingreso para este viaje.
            </DialogDescription>
          </DialogHeader>
          {trip && (
            <AddIncomeForm
              trucks={trucks}
              tripId={trip.id}
              defaultTruckId={trip.truckId}
              onSuccess={handleAddIncomeSuccess}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Add Expense Dialog */}
      <Dialog open={isAddExpenseDialogOpen} onOpenChange={setIsAddExpenseDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Agregar egreso</DialogTitle>
            <DialogDescription>
              Registrá un nuevo egreso para este viaje.
            </DialogDescription>
          </DialogHeader>
          {trip && (
            <AddExpenseForm
              trucks={trucks}
              tripId={trip.id}
              defaultTruckId={trip.truckId}
              onSuccess={handleAddExpenseSuccess}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
