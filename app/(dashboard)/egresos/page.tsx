"use client";

import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DataTable } from "./data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { fetchWithAuth } from "@/lib/api";
import { getColumns, Expense, expenseTypeLabels } from "./columns";
import { TotalExpenseCard } from "@/components/total-expense-card";
import { ExpenseBreakdownChart } from "@/components/expense-breakdown-chart";
import { CostPerKmCard } from "@/components/cost-per-km-card";
import { FuelEfficiencyCard } from "@/components/fuel-efficiency-card";
import { useDateFilter } from "@/context/date-filter-context";
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

type Truck = {
  id: string;
  licensePlate: string;
  model?: string;
};

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

export default function ExpensePage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const [selectedTruckId, setSelectedTruckId] = useState<string | null>(null);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<number | null>(null);

  const { selectedDate } = useDateFilter();

  // ================= FETCH =================
  useEffect(() => {
    fetchExpenses();
    fetchTrucks();
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
  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      if (selectedDate) {
        const date = new Date(expense.date + "T00:00:00");
        if (
          date.getMonth() !== selectedDate.getMonth() ||
          date.getFullYear() !== selectedDate.getFullYear()
        )
          return false;
      }
      if (selectedTruckId && expense.truckId !== selectedTruckId) return false;
      if (selectedTypeFilter !== null && expense.type !== selectedTypeFilter)
        return false;
      return true;
    });
  }, [expenses, selectedDate, selectedTruckId, selectedTypeFilter]);

  const total = useMemo(
    () => filteredExpenses.reduce((acc, e) => acc + e.value, 0),
    [filteredExpenses]
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
        if (selectedTruckId && expense.truckId !== selectedTruckId) return false;
        if (selectedTypeFilter !== null && expense.type !== selectedTypeFilter)
          return false;
        return true;
      })
      .reduce((acc, e) => acc + e.value, 0);
  }, [expenses, selectedDate, selectedTruckId, selectedTypeFilter]);

  const variation = useMemo(() => {
    if (previousMonthTotal === 0) return undefined;
    return Math.round(((total - previousMonthTotal) / previousMonthTotal) * 100);
  }, [total, previousMonthTotal]);

  // ================= CRUD =================
  const handleAddExpense = (newExpense: Expense) => {
    setExpenses((prev) => [...prev, newExpense]);
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
        handleDeleteExpense
      ),
    [handleDeleteExpense]
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

  const typeItems = useMemo(
    () => [
      { label: "Todos los tipos", value: "all" },
      ...Object.entries(expenseTypeLabels).map(([key, label]) => ({
        label,
        value: key,
      })),
    ],
    []
  );

  // ================= UI =================
  return (
    <div className="p-6 flex flex-col gap-4">
      <div className="flex justify-between">
        <h1 className="text-xl font-bold">Egresos</h1>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger render={<Button variant="outline">Añadir egreso</Button>}>
          </DialogTrigger>

          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Agregar egreso</DialogTitle>
              <DialogDescription>
                Registrá un nuevo egreso.
              </DialogDescription>
            </DialogHeader>

            <AddExpenseForm
              trucks={trucks}
              onSuccess={handleAddExpense}
            />
          </DialogContent>
        </Dialog>
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
          items={typeItems}
          value={selectedTypeFilter !== null ? String(selectedTypeFilter) : "all"}
          onValueChange={(value) =>
            setSelectedTypeFilter(value === "all" ? null : parseInt(value))
          }
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Todos los tipos" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {typeItems.map((item) => (
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
        <CostPerKmCard expenses={filteredExpenses} />
      </div>

      {/* CHART */}
      <ExpenseBreakdownChart expenses={filteredExpenses} />

      {/* FUEL EFFICIENCY */}
      <FuelEfficiencyCard expenses={filteredExpenses} truckId={selectedTruckId ?? undefined} />

      {/* EDIT DIALOG */}
      <Dialog
        open={!!editingExpense}
        onOpenChange={(open) => {
          if (!open) setEditingExpense(null);
        }}
      >
        <DialogContent className="sm:max-w-sm">
          {editingExpense && (
            <EditExpenseForm
              expense={editingExpense}
              trucks={trucks}
              onSuccess={handleUpdateExpense}
            />
          )}
        </DialogContent>
      </Dialog>

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
            { key: "type", label: "Tipo" },
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
