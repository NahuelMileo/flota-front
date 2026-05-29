"use client";

import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DataTable } from "./data-table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import { fetchWithAuth } from "@/lib/api";
import type { Truck } from "@/types/truck";
import type { ExpenseCategory } from "@/types/expense-category";
import { getColumns, Expense } from "./columns";
import { TotalExpenseCard } from "@/components/total-expense-card";
import { ExpenseBreakdownChart } from "@/components/expense-breakdown-chart";
import { CostPerKmCard } from "@/components/cost-per-km-card";
import { useDateFilter } from "@/context/date-filter-context";
import { useCurrency } from "@/context/currency-context";
import AddExpenseForm from "./AddExpenseForm";
import EditExpenseForm from "./EditExpenseForm";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-md border">
      <div className="p-4 space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    </div>
  );
}

type Trip = { id: string; departureDate: string; truckId: string | null; kilometers: number | null; initialKm: number | null; finalKm: number | null };

export default function ExpensePage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const [selectedTruckId, setSelectedTruckId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const { selectedDate } = useDateFilter();
  const { displayCurrency, getDisplayValue } = useCurrency();

  // ================= FETCH =================
  useEffect(() => {
    fetchExpenses();
    fetchTrucks();
    fetchCategories();
    fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/trips`, { method: "GET" })
      .then((r) => r.ok ? r.json() : [])
      .then(setTrips)
      .catch(() => {});
  }, []);

  const fetchTrucks = async () => {
    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/trucks`,
        { method: "GET" }
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      setTrucks(data);
    } catch {
      toast.error("Error al cargar camiones", { position: "bottom-right", richColors: true });
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/expense-categories`,
        { method: "GET" }
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCategories(data);
    } catch {
      toast.error("Error al cargar categorías", { position: "bottom-right", richColors: true });
    }
  };

  const fetchExpenses = async () => {
    setIsLoading(true);
    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/expenses`,
        { method: "GET" }
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      setExpenses(data);
    } catch {
      toast.error("Error al cargar egresos", { position: "bottom-right", richColors: true });
    } finally {
      setIsLoading(false);
    }
  };

  // ================= DERIVADOS =================
  const selectedTruck = useMemo(
    () => trucks.find((t) => t.id === selectedTruckId) ?? null,
    [trucks, selectedTruckId]
  );

  const matchesTruckFilter = useCallback(
    (expense: Expense) => {
      if (!selectedTruckId) return true;
      if (expense.truckId === selectedTruckId) return true;
      if (!expense.truckId && selectedTruck && expense.truckLicensePlate === selectedTruck.licensePlate) return true;
      return false;
    },
    [selectedTruckId, selectedTruck]
  );

  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((expense) => {
        if (selectedDate) {
          const date = new Date(expense.date + "T00:00:00");
          if (
            date.getMonth() !== selectedDate.getMonth() ||
            date.getFullYear() !== selectedDate.getFullYear()
          )
            return false;
        }
        if (!matchesTruckFilter(expense)) return false;
        if (selectedCategoryId !== null && expense.expenseCategoryId !== selectedCategoryId) return false;
        return true;
      })
      .sort((a, b) => {
        if (a.date !== b.date) return b.date > a.date ? 1 : -1;
        return (b.createdAt ?? "") > (a.createdAt ?? "") ? 1 : -1;
      });
  }, [expenses, selectedDate, matchesTruckFilter, selectedCategoryId]);

  const total = useMemo(
    () => filteredExpenses.reduce((acc, e) => acc + getDisplayValue(e), 0),
    [filteredExpenses, getDisplayValue]
  );

  const previousMonthTotal = useMemo(() => {
    if (!selectedDate) return 0;

    const prevMonth = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth() - 1
    );

    return expenses
      .filter((expense) => {
        const date = new Date(expense.date + "T00:00:00");
        if (
          date.getMonth() !== prevMonth.getMonth() ||
          date.getFullYear() !== prevMonth.getFullYear()
        )
          return false;
        if (!matchesTruckFilter(expense)) return false;
        if (selectedCategoryId !== null && expense.expenseCategoryId !== selectedCategoryId) return false;
        return true;
      })
      .reduce((acc, e) => acc + getDisplayValue(e), 0);
  }, [expenses, selectedDate, matchesTruckFilter, selectedCategoryId, getDisplayValue]);

  const variation = useMemo(() => {
    if (previousMonthTotal === 0) return undefined;
    return Math.round(((total - previousMonthTotal) / previousMonthTotal) * 100);
  }, [total, previousMonthTotal]);

  const totalTripKm = useMemo(() => {
    return trips
      .filter((t) => {
        if (selectedDate) {
          const d = new Date(t.departureDate);
          if (d.getMonth() !== selectedDate.getMonth() || d.getFullYear() !== selectedDate.getFullYear()) return false;
        }
        if (selectedTruckId && t.truckId !== selectedTruckId) return false;
        return true;
      })
      .reduce((acc, t) => {
        const km = t.initialKm != null && t.finalKm != null ? t.finalKm - t.initialKm : (t.kilometers ?? 0);
        return acc + km;
      }, 0);
  }, [trips, selectedDate, selectedTruckId]);

  // ================= CRUD =================
  const handleAddExpense = (newExpenses: Expense[]) => {
    setExpenses((prev) => [...prev, ...newExpenses]);
    setIsAddDialogOpen(false);
  };

  const handleUpdateExpense = (updated: Expense) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === updated.id ? updated : e))
    );
    setEditingExpense(null);
  };

  const handleDeleteExpense = useCallback(async (expense: Expense) => {
    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/expenses/${expense.id}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error();

      setExpenses((prev) => prev.filter((e) => e.id !== expense.id));
      toast.success("Egreso eliminado", { position: "bottom-right", richColors: true });
    } catch {
      toast.error("Error al eliminar egreso", { position: "bottom-right", richColors: true });
    }
  }, []);

  const columns = useMemo(
    () =>
      getColumns(
        (expense) => setEditingExpense(expense),
        handleDeleteExpense,
        displayCurrency
      ),
    [handleDeleteExpense, displayCurrency]
  );

  // ================= FILTER OPTIONS =================
  const truckItems = useMemo(
    () => [
      { label: "Todos los camiones", value: "all" },
      ...trucks.map((t) => ({
        label: t.licensePlate,
        value: t.id,
      })),
    ],
    [trucks]
  );

  const categoryItems = useMemo(
    () => [
      { label: "Todas las categorías", value: "all" },
      ...categories.map((c) => ({ label: c.name, value: c.id })),
    ],
    [categories]
  );

  // ================= UI =================
  return (
    <div className="p-6 flex flex-col gap-4">
      <div className="flex justify-between">
        <h1 className="text-xl font-bold">Egresos</h1>

        <Sheet open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <SheetTrigger render={<Button variant="outline">Añadir egreso</Button>} />

          <SheetContent className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Agregar egreso</SheetTitle>
              <SheetDescription>Registrá un nuevo egreso.</SheetDescription>
            </SheetHeader>

            <div className="px-4 pb-6">
              <AddExpenseForm
                trucks={trucks}
                categories={categories}
                onSuccess={handleAddExpense}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* FILTERS */}
      <div className="flex gap-2">
        <Select
          items={truckItems}
          value={selectedTruckId ?? "all"}
          onValueChange={(value) =>
            setSelectedTruckId(value === "all" ? null : value)
          }
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Todos los camiones" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {truckItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select
          items={categoryItems}
          value={selectedCategoryId ?? "all"}
          onValueChange={(value) =>
            setSelectedCategoryId(value === "all" || !value ? null : value)
          }
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Todas las categorías" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {categoryItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TotalExpenseCard total={total} variation={variation} />
        <CostPerKmCard expenses={filteredExpenses} totalKm={totalTripKm} />
      </div>

      {/* CHART */}
      <ExpenseBreakdownChart expenses={filteredExpenses} displayCurrency={displayCurrency} />

      {/* EDIT SHEET */}
      <Sheet
        open={!!editingExpense}
        onOpenChange={(open) => {
          if (!open) setEditingExpense(null);
        }}
      >
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Editar egreso</SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-6">
            {editingExpense && (
              <EditExpenseForm
                expense={editingExpense}
                trucks={trucks}
                categories={categories}
                onSuccess={handleUpdateExpense}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>

      {isLoading ? (
        <TableSkeleton />
      ) : (
        <DataTable
          columns={columns}
          data={filteredExpenses}
          emptyMessage="No hay egresos para el período seleccionado."
          searchPlaceholder="Buscar egreso..."
          csvFilename="egresos"
          csvHeaders={[
            { key: "name", label: "Nombre" },
            { key: "categoryName", label: "Tipo" },
            { key: "value", label: "Valor" },
            { key: "truckLicensePlate", label: "Camión" },
            { key: "date", label: "Fecha" },
            { key: "kilometers", label: "Km" },
            { key: "liters", label: "Litros" },
          ]}
        />
      )}
    </div>
  );
}
