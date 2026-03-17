"use client";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import { DataTable } from "./data-table";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { fetchWithAuth } from "@/lib/api";
import { getColumns, Income } from "./columns";
import { TotalIncomeCard } from "@/components/total-income-card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectLabel,
} from "@/components/ui/select";
import { useDateFilter } from "@/context/date-filter-context";

export default function IncomePage() {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [selectedTruckId, setSelectedTruckId] = useState<string | null>(null);
  const [editingTruckId, setEditingTruckId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  

  const { selectedDate } = useDateFilter();

  

  const filteredIncomes = selectedDate
    ? incomes.filter((income) => {
        const date = new Date(income.dateUtc);
        return (
          date.getMonth() === selectedDate.getMonth() &&
          date.getFullYear() === selectedDate.getFullYear()
        );
      })
    : incomes;

  useEffect(() => {
    fetchIncomes();
    fetchTrucks();
  }, []);

  const fetchTrucks = async () => {
    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/trucks`,
        { method: "GET" },
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      setTrucks(data);
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar camiones", {
        position: "bottom-right",
        richColors: true,
      });
    }
  };

  const fetchIncomes = async () => {
    setIsLoading(true);
    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/incomes`,
        { method: "GET" },
      );
      const data = await res.json();
      if (!res.ok) throw new Error();
      setIncomes(data);
    } catch {
      toast.error("Error al cargar ingresos", {
        position: "bottom-right",
        richColors: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const truckItems = [
    { label: "Sin asignar", value: "none" },
    ...trucks.map((truck) => ({
      label: `${truck.licensePlate}${truck.model ? ` - ${truck.model}` : ""}`,
      value: truck.id,
    })),
  ];

  async function handleAddIncome(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);

    const body = {
      description: formData.get("description"),
      value: parseFloat(formData.get("value") as string),
      dateUtc: formData.get("dateUtc"),
      truckId: selectedTruckId,
    };

    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/incomes`,
        {
          method: "POST",
          body: JSON.stringify(body),
        },
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      setIsAddDialogOpen(false);
      setSelectedTruckId(null);
      setIncomes((prev) => [...prev, data]);
      toast.success("Ingreso agregado exitosamente", {
        position: "bottom-right",
        richColors: true,
      });
    } catch {
      toast.error("Error al agregar ingreso", {
        position: "bottom-right",
        richColors: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleEditIncome(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingIncome) return;
    setIsUpdating(true);
    const formData = new FormData(event.currentTarget);

    const body = {
      description: formData.get("description"),
      value: parseFloat(formData.get("value") as string),
      dateUtc: formData.get("dateUtc"),
      truckId: editingTruckId, // ← usa el estado en lugar de formData
    };

    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/incomes/${editingIncome.id}`,
        {
          method: "PUT",
          body: JSON.stringify(body),
        },
      );
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setIncomes((prev) =>
        prev.map((i) => (i.id === updated.id ? updated : i)),
      );
      setEditingIncome(null);
      setEditingTruckId(null);
      toast.success("Ingreso actualizado", {
        position: "bottom-right",
        richColors: true,
      });
    } catch {
      toast.error("Error al actualizar ingreso", {
        position: "bottom-right",
        richColors: true,
      });
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleDeleteIncome(income: Income) {
    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/incomes/${income.id}`,
        { method: "DELETE" },
      );
      if (!res.ok) throw new Error();
      setIncomes((prev) => prev.filter((i) => i.id !== income.id));
      toast.success("Ingreso eliminado", {
        position: "bottom-right",
        richColors: true,
      });
    } catch {
      toast.error("Error al eliminar ingreso", {
        position: "bottom-right",
        richColors: true,
      });
    }
  }

  const columns = getColumns(
    (income) => {
      setEditingIncome(income);
      setEditingTruckId(income.truckId ?? null); // ← inicializar con el valor actual
    },
    handleDeleteIncome,
  );

  const todayIso = new Date().toISOString().split("T")[0];

  const previousMonthIncomes = selectedDate
  ? incomes.filter((income) => {
      const date = new Date(income.dateUtc + "T00:00:00");
      const prevMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1);
      return (
        date.getMonth() === prevMonth.getMonth() &&
        date.getFullYear() === prevMonth.getFullYear()
      );
    })
  : [];

const previousMonthTotal = previousMonthIncomes.reduce((acc, i) => acc + i.value, 0);

const variation =
  previousMonthTotal === 0
    ? undefined
    : Math.round(((filteredIncomes.reduce((acc, i) => acc + i.value, 0) - previousMonthTotal) / previousMonthTotal) * 100);

  return (
    <div className="p-6 flex flex-col gap-4">
      <div>
        <div className="flex justify-between">
          <h1 className="text-xl font-bold">Ingresos</h1>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger
              render={<Button variant="outline">Añadir ingreso</Button>}
            />
            <DialogContent className="sm:max-w-sm">
              <form onSubmit={handleAddIncome}>
                <DialogHeader>
                  <DialogTitle>Agregar ingreso</DialogTitle>
                  <DialogDescription>
                    Registrá un nuevo ingreso.
                  </DialogDescription>
                </DialogHeader>
                <FieldGroup>
                  <Field>
                    <Label htmlFor="description">Descripción</Label>
                    <Input
                      id="description"
                      name="description"
                      placeholder="Flete Montevideo - Colonia"
                      required
                    />
                  </Field>
                  <Field>
                    <Label htmlFor="value">Valor</Label>
                    <Input
                      id="value"
                      name="value"
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="10000.00"
                      required
                    />
                  </Field>
                  <Field>
                    <Label htmlFor="dateUtc">Fecha</Label>
                    <Input
                      id="dateUtc"
                      name="dateUtc"
                      type="date"
                      defaultValue={todayIso}
                      required
                    />
                  </Field>
                  <Field>
                    <Label htmlFor="truckId">Camión (opcional)</Label>
                    <Select
                      items={truckItems}
                      value={selectedTruckId ?? "none"}
                      onValueChange={(value) =>
                        setSelectedTruckId(value === "none" ? null : value)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccionar camión" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Camiones</SelectLabel>
                          {truckItems.map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                </FieldGroup>
                <DialogFooter>
                  <DialogClose
                    render={<Button variant="outline">Cerrar</Button>}
                  />
                  <Button disabled={isSubmitting} type="submit">
                    Agregar ingreso
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <p className="text-muted-foreground">
          Gestioná los ingresos de tu operación
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <TotalIncomeCard
          total={filteredIncomes.reduce((acc, income) => acc + income.value, 0)} variation={variation}
        />
      </div>

      {/* Dialog de editar */}
      <Dialog
        open={!!editingIncome}
        onOpenChange={(open) => {
          if (!open) {
            setEditingIncome(null);
            setEditingTruckId(null); // ← limpiar al cerrar
          }
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <form key={editingIncome?.id} onSubmit={handleEditIncome}>
            <DialogHeader>
              <DialogTitle>Editar ingreso</DialogTitle>
              <DialogDescription>
                Modificá los datos del ingreso.
              </DialogDescription>
            </DialogHeader>
            <FieldGroup>
              <Field>
                <Label htmlFor="edit-description">Descripción</Label>
                <Input
                  id="edit-description"
                  name="description"
                  defaultValue={editingIncome?.description}
                  required
                />
              </Field>
              <Field>
                <Label htmlFor="edit-value">Valor</Label>
                <Input
                  id="edit-value"
                  name="value"
                  type="number"
                  step="0.01"
                  min="0.01"
                  defaultValue={editingIncome?.value}
                  required
                />
              </Field>
              <Field>
                <Label htmlFor="edit-dateUtc">Fecha</Label>
                <Input
                  id="edit-dateUtc"
                  name="dateUtc"
                  type="date"
                  defaultValue={
                    editingIncome?.dateUtc
                      ? new Date(editingIncome.dateUtc)
                          .toISOString()
                          .split("T")[0]
                      : ""
                  }
                  required
                />
              </Field>
              <Field>
                <Label htmlFor="edit-truckId">Camión (opcional)</Label>
                <Select
                  items={truckItems}
                  value={editingTruckId ?? "none"}
                  onValueChange={(value) =>
                    setEditingTruckId(value === "none" ? null : value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar camión" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Camiones</SelectLabel>
                      {truckItems.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>
            <DialogFooter>
              <DialogClose
                render={
                  <Button variant="outline" type="button">
                    Cerrar
                  </Button>
                }
              />
              <Button disabled={isUpdating} type="submit">
                Guardar cambios
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando ingresos...</p>
      ) : (
        <DataTable columns={columns} data={filteredIncomes} />
      )}
    </div>
  );
}