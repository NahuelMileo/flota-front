"use client";

import { Button } from "@/components/ui/button";
import React, { useEffect, useMemo, useState } from "react";
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
import { getColumns, Income } from "./columns";
import { TotalIncomeCard } from "@/components/total-income-card";
import { useDateFilter } from "@/context/date-filter-context";
import AddIncomeForm from "./AddIncomeForm";
import EditIncomeForm from "./EditIncomeForm";

type Truck = {
  id: string;
  licensePlate: string;
  model?: string;
};

export default function IncomePage() {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);

  const { selectedDate } = useDateFilter();

  // ================= FETCH =================
  useEffect(() => {
    fetchIncomes();
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
      toast.error("Error al cargar camiones");
    }
  };

  const fetchIncomes = async () => {
    setIsLoading(true);
    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/incomes`,
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
  };

  // ================= DERIVADOS =================
  const filteredIncomes = useMemo(() => {
    if (!selectedDate) return incomes;

    return incomes.filter((income) => {
      const date = new Date(income.dateUtc);
      return (
        date.getMonth() === selectedDate.getMonth() &&
        date.getFullYear() === selectedDate.getFullYear()
      );
    });
  }, [incomes, selectedDate]);

  const total = useMemo(
    () => filteredIncomes.reduce((acc, i) => acc + i.value, 0),
    [filteredIncomes]
  );

  const previousMonthTotal = useMemo(() => {
    if (!selectedDate) return 0;

    const prevMonth = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth() - 1
    );

    return incomes
      .filter((income) => {
        const date = new Date(income.dateUtc);
        return (
          date.getMonth() === prevMonth.getMonth() &&
          date.getFullYear() === prevMonth.getFullYear()
        );
      })
      .reduce((acc, i) => acc + i.value, 0);
  }, [incomes, selectedDate]);

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

  const handleDeleteIncome = async (income: Income) => {
    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/incomes/${income.id}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error();

      setIncomes((prev) => prev.filter((i) => i.id !== income.id));
      toast.success("Ingreso eliminado");
    } catch {
      toast.error("Error al eliminar ingreso");
    }
  };

  const columns = useMemo(
    () =>
      getColumns(
        (income) => setEditingIncome(income),
        handleDeleteIncome
      ),
    []
  );

  // ================= UI =================
  return (
    <div className="p-6 flex flex-col gap-4">
      <div className="flex justify-between">
        <h1 className="text-xl font-bold">Ingresos</h1>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger render={<Button variant="outline">Añadir ingreso</Button>}>
            
          </DialogTrigger>

          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Agregar ingreso</DialogTitle>
              <DialogDescription>
                Registrá un nuevo ingreso.
              </DialogDescription>
            </DialogHeader>

            <AddIncomeForm
              trucks={trucks}
              onSuccess={handleAddIncome}
            />
          </DialogContent>
        </Dialog>
      </div>

      <TotalIncomeCard total={total} variation={variation} />

      {/* EDIT */}
      <Dialog
        open={!!editingIncome}
        onOpenChange={(open) => {
          if (!open) setEditingIncome(null);
        }}
      >
        <DialogContent className="sm:max-w-sm">
          {editingIncome && (
            <EditIncomeForm
              income={editingIncome}
              trucks={trucks}
              onSuccess={handleUpdateIncome}
            />
          )}
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <p>Cargando...</p>
      ) : (
        <DataTable columns={columns} data={filteredIncomes} />
      )}
    </div>
  );
}