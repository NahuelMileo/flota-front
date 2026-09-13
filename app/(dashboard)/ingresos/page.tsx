"use client";

import { Button } from "@/components/ui/button";
import { Tag, TruckIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DataTable, DataTableSkeleton } from "@/components/data-table";
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
import { TotalLine } from "@/components/total-line";
import { IncomeByTruckChart } from "@/components/income-by-truck-chart";
import { useDateFilter } from "@/context/date-filter-context";
import { isInSelectedMonth } from "@/lib/month-filter";
import { useCurrency } from "@/context/currency-context";
import AddIncomeForm from "./AddIncomeForm";
import EditIncomeForm from "./EditIncomeForm";
import type { ExpenseCategory } from "@/types/expense-category";
import { FilterSelect } from "@/components/filter-select";


const incomeTypeOptions = [
  { label: "Flete", value: "1" },
  { label: "Otro", value: "2" },
];

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
    if (isInSelectedMonth(newIncome.dateUtc, selectedDate)) {
      setIncomes((prev) => [...prev, newIncome]);
    }
    setIsAddDialogOpen(false);
  };

  const handleUpdateIncome = (updated: Income) => {
    // Si la edición lo movió a otro mes, deja de pertenecer a esta lista.
    setIncomes((prev) =>
      isInSelectedMonth(updated.dateUtc, selectedDate)
        ? prev.map((i) => (i.id === updated.id ? updated : i))
        : prev.filter((i) => i.id !== updated.id)
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

  // ================= UI =================
  return (
    <div className="p-6 flex flex-col gap-4">
      {/* FILTERS */}
      <div className="flex flex-wrap items-center gap-1">
        <FilterSelect
          label="Camión"
          icon={TruckIcon}
          value={selectedTruckId}
          onChange={setSelectedTruckId}
          options={trucks.map((t) => ({ label: t.licensePlate, value: t.id }))}
          allLabel="Todos"
        />
        <FilterSelect
          label="Tipo"
          icon={Tag}
          value={selectedTypeFilter}
          onChange={setSelectedTypeFilter}
          options={incomeTypeOptions}
          allLabel="Todos"
        />
        <Sheet open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <SheetTrigger render={<Button className="ml-auto">Añadir ingreso</Button>} />

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

      {/* TOTAL */}
      <TotalLine
        total={total}
        count={filteredIncomes.length}
        noun={["ingreso", "ingresos"]}
        variation={variation}
        higherIsBetter
        tone="positive"
      />

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
        <DataTableSkeleton columns={7} showToolbarAction />
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
