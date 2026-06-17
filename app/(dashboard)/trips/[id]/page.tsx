"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCurrency } from "@/context/currency-context";
import { formatCurrency, formatCurrency2, formatDate } from "@/lib/format";
import { fetchWithAuth } from "@/lib/api";
import type { Truck } from "@/types/truck";
import type { ExpenseCategory } from "@/types/expense-category";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit2, Trash2, Pencil } from "lucide-react";
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Trip } from "../columns";
import EditTripForm from "../EditTripForm";
import { FuelEfficiencyCard } from "@/components/fuel-efficiency-card";
import AddIncomeForm from "@/app/(dashboard)/ingresos/AddIncomeForm";
import EditIncomeForm from "@/app/(dashboard)/ingresos/EditIncomeForm";
import { Income as IncomeFormType, normalizeIncomeType } from "@/app/(dashboard)/ingresos/columns";
import AddExpenseForm from "@/app/(dashboard)/egresos/AddExpenseForm";
import EditExpenseForm from "@/app/(dashboard)/egresos/EditExpenseForm";
import { Expense as ExpenseFormType } from "@/app/(dashboard)/egresos/columns";


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
  createdAt: string | null;
  expenseCategoryId: string | null;
  categoryName: string | null;
  value: number;
  valueUSD: number | null;
  valueBRL: number | null;
  valueUYU: number | null;
  currency: string;
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
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddIncomeDialogOpen, setIsAddIncomeDialogOpen] = useState(false);
  const [isAddExpenseDialogOpen, setIsAddExpenseDialogOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingIncomeId, setDeletingIncomeId] = useState<string | null>(null);
  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [tripRes, trucksRes, catsRes] = await Promise.all([
          fetchWithAuth(
            `/api/trips/${tripId}`,
            { method: "GET" }
          ),
          fetchWithAuth(
            `/api/trucks`,
            { method: "GET" }
          ),
          fetchWithAuth(
            `/api/expense-categories`,
            { method: "GET" }
          ),
        ]);

        if (!tripRes.ok) { const e = await tripRes.json().catch(() => ({})); throw new Error(e.message || e.title || "Error al cargar viaje"); }
        if (!trucksRes.ok) { const e = await trucksRes.json().catch(() => ({})); throw new Error(e.message || e.title || "Error al cargar camiones"); }

        const tripData = await tripRes.json();
        const trucksData = await trucksRes.json();
        setTrip(tripData);
        setTrucks(trucksData);
        if (catsRes.ok) setCategories(await catsRes.json());
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Error al cargar viaje");
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
        `/api/trips/${tripId}`,
        { method: "DELETE" }
      );
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || e.title || "Error al eliminar viaje"); }
      toast.success("Viaje eliminado");
      router.push("/trips");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al eliminar viaje");
    }
  };

  const handleUpdateSuccess = (updated: Trip) => {
    setTrip(prev => prev ? { ...prev, ...updated } : null);
    setIsEditDialogOpen(false);
    toast.success("Viaje actualizado");
  };

  const handleAddIncomeSuccess = (newIncome: Income, driverExpense?: Expense) => {
    setTrip(prev => {
      if (!prev) return null;
      const totalIncome = prev.totalIncome + newIncome.value;
      const expenses = driverExpense ? [...prev.expenses, driverExpense] : prev.expenses;
      const totalExpense = driverExpense ? prev.totalExpense + driverExpense.value : prev.totalExpense;
      const tripKm = prev.initialKm != null && prev.finalKm != null
        ? prev.finalKm - prev.initialKm
        : prev.kilometers;
      return {
        ...prev,
        incomes: [...prev.incomes, newIncome],
        expenses,
        totalIncome,
        totalExpense,
        profit: totalIncome - totalExpense,
        costPerKm: tripKm && tripKm > 0 ? totalExpense / tripKm : null,
      };
    });
    setIsAddIncomeDialogOpen(false);
    toast.success("Ingreso agregado");
  };

  const handleAddExpenseSuccess = (newExpenses: Expense[]) => {
    setTrip(prev => {
      if (!prev) return null;
      const added = newExpenses.reduce((sum, e) => sum + e.value, 0);
      const newTotal = prev.totalExpense + added;
      const tripKm = prev.initialKm != null && prev.finalKm != null
        ? prev.finalKm - prev.initialKm
        : prev.kilometers;
      return {
        ...prev,
        expenses: [...prev.expenses, ...newExpenses],
        totalExpense: newTotal,
        profit: prev.totalIncome - newTotal,
        costPerKm: tripKm && tripKm > 0 ? newTotal / tripKm : null,
      };
    });
    setIsAddExpenseDialogOpen(false);
    toast.success(newExpenses.length > 1 ? `${newExpenses.length} egresos agregados` : "Egreso agregado");
  };

  const handleEditIncomeSuccess = (updated: IncomeFormType) => {
    setTrip(prev => {
      if (!prev) return null;
      const incomes = prev.incomes.map(i => i.id === updated.id ? { ...i, ...updated } : i);
      const totalIncome = incomes.reduce((sum, i) => sum + i.value, 0);
      return { ...prev, incomes, totalIncome, profit: totalIncome - prev.totalExpense };
    });
    setEditingIncome(null);
    toast.success("Ingreso actualizado");
  };

  const handleDeleteIncome = async (id: string) => {
    try {
      const res = await fetchWithAuth(
        `/api/incomes/${id}`,
        { method: "DELETE" }
      );
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || e.title || "Error al eliminar ingreso"); }
      setTrip(prev => {
        if (!prev) return null;
        const incomes = prev.incomes.filter(i => i.id !== id);
        const totalIncome = incomes.reduce((sum, i) => sum + i.value, 0);
        return { ...prev, incomes, totalIncome, profit: totalIncome - prev.totalExpense };
      });
      setDeletingIncomeId(null);
      toast.success("Ingreso eliminado");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al eliminar ingreso");
    }
  };

  const handleEditExpenseSuccess = (updated: ExpenseFormType) => {
    setTrip(prev => {
      if (!prev) return null;
      const expenses = prev.expenses.map(e => e.id === updated.id ? { ...e, ...updated } : e);
      const totalExpense = expenses.reduce((sum, e) => sum + e.value, 0);
      const tripKm = prev.initialKm != null && prev.finalKm != null
        ? prev.finalKm - prev.initialKm
        : prev.kilometers;
      return {
        ...prev,
        expenses,
        totalExpense,
        profit: prev.totalIncome - totalExpense,
        costPerKm: tripKm && tripKm > 0 ? totalExpense / tripKm : null,
      };
    });
    setEditingExpense(null);
    toast.success("Egreso actualizado");
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      const res = await fetchWithAuth(
        `/api/expenses/${id}`,
        { method: "DELETE" }
      );
      if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.message || err.title || "Error al eliminar egreso"); }
      setTrip(prev => {
        if (!prev) return null;
        const expenses = prev.expenses.filter(e => e.id !== id);
        const totalExpense = expenses.reduce((sum, e) => sum + e.value, 0);
        const tripKm = prev.initialKm != null && prev.finalKm != null
          ? prev.finalKm - prev.initialKm
          : prev.kilometers;
        return {
          ...prev,
          expenses,
          totalExpense,
          profit: prev.totalIncome - totalExpense,
          costPerKm: tripKm && tripKm > 0 ? totalExpense / tripKm : null,
        };
      });
      setDeletingExpenseId(null);
      toast.success("Egreso eliminado");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al eliminar egreso");
    }
  };

  const fmtMoney = (v: number) => formatCurrency(v, displayCurrency);
  const fmtMoney2 = (v: number) => formatCurrency2(v, displayCurrency);

  const displayTotalIncome = trip ? trip.incomes.reduce((sum, i) => sum + getDisplayValue(i), 0) : 0;
  const displayTotalExpense = trip ? trip.expenses.reduce((sum, e) => sum + getDisplayValue(e), 0) : 0;
  const displayProfit = displayTotalIncome - displayTotalExpense;

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
                {fmtMoney(displayTotalIncome)}
              </span>
            </div>
            <div className="flex justify-between pb-2 border-b">
              <span className="text-muted-foreground">Total egresos:</span>
              <span className="font-medium text-red-600">
                {fmtMoney(displayTotalExpense)}
              </span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="font-semibold">Utilidad:</span>
              <span className={`font-bold text-lg ${displayProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                {fmtMoney(displayProfit)}
              </span>
            </div>
            {displayTotalIncome > 0 && (
              <div className="flex justify-between border-t pt-2">
                <span className="text-muted-foreground">Margen:</span>
                <span className={`font-medium ${(displayProfit / displayTotalIncome) >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {Math.round((displayProfit / displayTotalIncome) * 100)}%
                </span>
              </div>
            )}
            {(() => {
              const tripKm = trip.initialKm != null && trip.finalKm != null
                ? trip.finalKm - trip.initialKm
                : trip.kilometers;
              return tripKm && tripKm > 0 && displayTotalExpense > 0 ? (
                <div className="flex justify-between border-t pt-2">
                  <span className="text-muted-foreground">Costo/km:</span>
                  <span className="font-medium">
                    {fmtMoney2(displayTotalExpense / tripKm)}
                  </span>
                </div>
              ) : null;
            })()}
            {(() => {
              const tripKm = trip.initialKm != null && trip.finalKm != null
                ? trip.finalKm - trip.initialKm
                : trip.kilometers;
              return tripKm && tripKm > 0 && displayTotalIncome > 0 ? (
                <div className="flex justify-between border-t pt-2">
                  <span className="text-muted-foreground">Ingreso/km:</span>
                  <span className="font-medium text-green-600">
                    {fmtMoney2(displayTotalIncome / tripKm)}
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
              <div key={income.id} className="flex justify-between items-center pb-2 border-b last:border-0">
                <div>
                  <p className="font-medium">{income.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(income.dateUtc)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {normalizeIncomeType(String(income.type)) === "1"
                    ? <Badge variant="outline" className="text-green-400 border-green-400 bg-green-100">Flete</Badge>
                    : <Badge variant="outline">Otro</Badge>
                  }
                  <p className="font-medium text-green-600">
                    {fmtMoney(getDisplayValue(income))}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setEditingIncome(income)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setDeletingIncomeId(income.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
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
            {[...trip.expenses].sort((a, b) => {
              const dateA = new Date(a.date).getTime();
              const dateB = new Date(b.date).getTime();
              if (dateA !== dateB) return dateB - dateA;
              return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
            }).map((expense) => (
              <div key={expense.id} className="flex justify-between items-center pb-2 border-b last:border-0">
                <div>
                  <p className="font-medium">{expense.name ?? expense.categoryName ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(expense.date)}
                    {expense.liters != null && expense.liters > 0 && (
                      <span className="ml-2">{expense.liters.toLocaleString("es-UY")} L</span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{expense.categoryName ?? expense.name ?? "Sin categoría"}</Badge>
                  <p className="font-medium text-red-600">
                    {fmtMoney(getDisplayValue(expense))}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setEditingExpense(expense)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setDeletingExpenseId(expense.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
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
          const key = e.categoryName ?? "Sin categoría"
          acc[key] = (acc[key] ?? 0) + getDisplayValue(e);
          return acc;
        }, {});
        const sorted = Object.entries(breakdown).sort(([, a], [, b]) => b - a);
        return (
          <div className="rounded-lg border p-4 space-y-3">
            <h3 className="font-semibold">Egresos por categoría</h3>
            <div className="space-y-2 text-sm">
              {sorted.map(([categoryName, total]) => (
                <div key={categoryName} className="flex justify-between items-center">
                  <span className="text-muted-foreground">{categoryName}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {displayTotalExpense > 0 ? Math.round((total / displayTotalExpense) * 100) : 0}%
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
        <FuelEfficiencyCard
          expenses={trip.expenses as any}
          truckId={trip.truckId}
          tripKm={trip.initialKm != null && trip.finalKm != null ? trip.finalKm - trip.initialKm : trip.kilometers ?? undefined}
        />
      )}

      {/* Edit Trip Sheet */}
      <Sheet open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Editar viaje</SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-4">
            <EditTripForm
              trip={trip}
              trucks={trucks}
              onSuccess={handleUpdateSuccess}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Add Income Sheet */}
      <Sheet open={isAddIncomeDialogOpen} onOpenChange={setIsAddIncomeDialogOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Agregar ingreso</SheetTitle>
            <SheetDescription>
              Registrá un nuevo ingreso para este viaje.
            </SheetDescription>
          </SheetHeader>
          {trip && (
            <div className="px-4 pb-4">
              <AddIncomeForm
                trucks={trucks}
                categories={categories}
                tripId={trip.id}
                defaultTruckId={trip.truckId}
                onSuccess={handleAddIncomeSuccess}
              />
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Add Expense Sheet */}
      <Sheet open={isAddExpenseDialogOpen} onOpenChange={setIsAddExpenseDialogOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Agregar egreso</SheetTitle>
            <SheetDescription>
              Registrá un nuevo egreso para este viaje.
            </SheetDescription>
          </SheetHeader>
          {trip && (
            <div className="px-4 pb-4">
              <AddExpenseForm
                trucks={trucks}
                categories={categories}
                tripId={trip.id}
                defaultTruckId={trip.truckId}
                onSuccess={handleAddExpenseSuccess}
              />
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Edit Income Sheet */}
      <Sheet open={!!editingIncome} onOpenChange={(open) => { if (!open) setEditingIncome(null); }}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Editar ingreso</SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-4">
            {editingIncome && (
              <EditIncomeForm
                income={editingIncome as IncomeFormType}
                trucks={trucks}
                onSuccess={handleEditIncomeSuccess}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Edit Expense Sheet */}
      <Sheet open={!!editingExpense} onOpenChange={(open) => { if (!open) setEditingExpense(null); }}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Editar egreso</SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-4">
            {editingExpense && (
              <EditExpenseForm
                expense={editingExpense as ExpenseFormType}
                trucks={trucks}
                categories={categories}
                onSuccess={handleEditExpenseSuccess}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Income AlertDialog */}
      <AlertDialog open={!!deletingIncomeId} onOpenChange={(open) => { if (!open) setDeletingIncomeId(null); }}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar ingreso?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => deletingIncomeId && handleDeleteIncome(deletingIncomeId)}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Expense AlertDialog */}
      <AlertDialog open={!!deletingExpenseId} onOpenChange={(open) => { if (!open) setDeletingExpenseId(null); }}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar egreso?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => deletingExpenseId && handleDeleteExpense(deletingExpenseId)}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
