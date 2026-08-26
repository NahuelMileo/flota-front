"use client";

import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DataTable } from "@/components/data-table";
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
import { useTrucks } from "@/hooks/use-trucks";
import { getColumns, Income, normalizeIncomeType } from "./columns";
import { TotalIncomeCard } from "@/components/total-income-card";
import { IncomeByTruckChart } from "@/components/income-by-truck-chart";
import { useDateFilter } from "@/context/date-filter-context";
import { useCurrency } from "@/context/currency-context";
import AddIncomeForm from "./AddIncomeForm";
import EditIncomeForm from "./EditIncomeForm";
import type { ExpenseCategory } from "@/types/expense-category";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


const incomeTypeItems = [
  { label: "Todos los tipos", value: "all" },
  { label: "Flete", value: "1" },
  { label: "Otro", value: "2" },
];

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

export default function IncomePage() {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [prevMonthIncomes, setPrevMonthIncomes] = useState<Income[]>([]);
  const trucks = useTrucks();
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);

  const [selectedTruckId, setSelectedTruckId] = useState<string | null>(null);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string | null>(null);

  const { selectedDate } = useDateFilter();
  const { displayCurrency, getDisplayValue } = useCurrency();

  const buildMonthQuery = (date: Date | null) => {
    if (!date) return "";
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `?month=${month}&year=${year}`;
  };

  const fetchIncomes = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchWithAuth(
        `/api/incomes${buildMonthQuery(selectedDate)}`,
        { method: "GET" }
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      setIncomes(data);
    } catch {
      toast.error("Error al cargar ingresos");
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

  const fetchPrevMonthIncomes = useCallback(async () => {
    if (!selectedDate) {
      setPrevMonthIncomes([]);
      return;
    }
    const prevMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1);
    try {
      const res = await fetchWithAuth(
        `/api/incomes${buildMonthQuery(prevMonth)}`,
        { method: "GET" }
      );
      if (!res.ok) throw new Error();
      setPrevMonthIncomes(await res.json());
    } catch {
      setPrevMonthIncomes([]);
    }
  }, [selectedDate]);

  const fetchCategories = async () => {
    try {
      const res = await fetchWithAuth(`/api/expense-categories`);
      if (res.ok) setCategories(await res.json());
    } catch { /* non-critical */ }
  };

  // ================= FETCH =================
  useEffect(() => {
    fetchIncomes();
    fetchPrevMonthIncomes();
  }, [fetchIncomes, fetchPrevMonthIncomes]);

  useEffect(() => {
    fetchCategories();
  }, []);

  // ================= DERIVADOS =================
  const filteredIncomes = useMemo(() => {
    return incomes.filter((income) => {
      if (selectedTruckId && income.truckId !== selectedTruckId) return false;
      if (selectedTypeFilter !== null && normalizeIncomeType(String(income.type)) !== selectedTypeFilter)
        return false;
      return true;
    });
  }, [incomes, selectedTruckId, selectedTypeFilter]);

  const total = useMemo(
    () => filteredIncomes.reduce((acc, i) => acc + getDisplayValue(i), 0),
    [filteredIncomes, getDisplayValue]
  );

  const previousMonthTotal = useMemo(() => {
    return prevMonthIncomes
      .filter((income) => {
        if (selectedTruckId && income.truckId !== selectedTruckId) return false;
        if (selectedTypeFilter !== null && normalizeIncomeType(String(income.type)) !== selectedTypeFilter)
          return false;
        return true;
      })
      .reduce((acc, i) => acc + getDisplayValue(i), 0);
  }, [prevMonthIncomes, selectedTruckId, selectedTypeFilter, getDisplayValue]);

  const variation = useMemo(() => {
    if (previousMonthTotal === 0) return undefined;
    return Math.round(((total - previousMonthTotal) / previousMonthTotal) * 100);
  }, [total, previousMonthTotal]);

  // ================= CRUD =================
  const handleAddIncome = (newIncome: Income) => {
    setIncomes((prev) => [...prev, newIncome]);
    setIsAddDialogOpen(false);
  };

  const handleUpdateIncome = (updated: Income) => {
    setIncomes((prev) =>
      prev.map((i) => (i.id === updated.id ? updated : i))
    );
    setEditingIncome(null);
  };

  const handleDeleteIncome = useCallback(async (income: Income) => {
    try {
      const res = await fetchWithAuth(
        `/api/incomes/${income.id}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error();

      setIncomes((prev) => prev.filter((i) => i.id !== income.id));
      toast.success("Ingreso eliminado");
    } catch {
      toast.error("Error al eliminar ingreso");
    }
  }, []);

  const columns = useMemo(
    () =>
      getColumns(
        (income) => setEditingIncome(income),
        handleDeleteIncome,
        displayCurrency
      ),
    [handleDeleteIncome, displayCurrency]
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

  // ================= UI =================
  return (
    <div className="p-6 flex flex-col gap-4">
      <div className="flex justify-between">
        <h1 className="text-xl font-bold">Ingresos</h1>

        <Sheet open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <SheetTrigger render={<Button variant="outline">Añadir ingreso</Button>} />

          <SheetContent className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Agregar ingreso</SheetTitle>
              <SheetDescription>
                Registrá un nuevo ingreso.
              </SheetDescription>
            </SheetHeader>

            <div className="px-4 pb-6">
              <AddIncomeForm
                trucks={trucks}
                categories={categories}
                onSuccess={handleAddIncome}
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
          items={incomeTypeItems}
          value={selectedTypeFilter ?? "all"}
          onValueChange={(value) =>
            setSelectedTypeFilter(value === "all" ? null : value)
          }
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Todos los tipos" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {incomeTypeItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* CARD */}
      <TotalIncomeCard total={total} variation={variation} />

      {/* CHART */}
      <IncomeByTruckChart incomes={filteredIncomes} displayCurrency={displayCurrency} />

      {/* EDIT SHEET */}
      <Sheet
        open={!!editingIncome}
        onOpenChange={(open) => {
          if (!open) setEditingIncome(null);
        }}
      >
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Editar ingreso</SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-6">
            {editingIncome && (
              <EditIncomeForm
                income={editingIncome}
                trucks={trucks}
                onSuccess={handleUpdateIncome}
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
          data={filteredIncomes}
          emptyMessage="No hay ingresos para el período seleccionado."
          searchPlaceholder="Buscar ingreso..."
          csvFilename="ingresos"
          csvHeaders={[
            { key: "description", label: "Descripción" },
            { key: "value", label: "Valor" },
            { key: "truckLicensePlate", label: "Camión" },
            { key: "dateUtc", label: "Fecha" },
            { key: "type", label: "Tipo" },
          ]}
        />
      )}
    </div>
  );
}
