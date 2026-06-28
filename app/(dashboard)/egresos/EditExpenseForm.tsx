"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchWithAuth } from "@/lib/api";
import type { Truck } from "@/types/truck";
import type { ExpenseCategory } from "@/types/expense-category";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Expense } from "./columns";
import { useState, useEffect, useCallback } from "react";

type ActiveTrip = { id: string; origin: string; destination: string };

const FUEL_CATEGORY_NAMES = new Set(["Gasoil", "Arla 32", "Arla32", "Aceite"])

const currencyItems = [
  { label: "BRL — Real brasileño", value: "BRL" },
  { label: "USD — Dólar", value: "USD" },
  { label: "UYU — Peso uruguayo", value: "UYU" },
];

const expenseSchema = z.object({
  name: z.string().optional(),
  value: z.number().positive("El valor debe ser mayor a 0"),
  date: z.string().min(1, "La fecha es requerida"),
  truckId: z.string().nullable(),
  expenseCategoryId: z.string().nullable(),
  currency: z.enum(["USD", "BRL", "UYU"]),
  kilometers: z.number().positive("Debe ser mayor a 0").nullable(),
  liters: z.number().positive("Debe ser mayor a 0").nullable(),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

export default function EditExpenseForm({
  expense,
  trucks,
  categories,
  onSuccess,
}: {
  expense: Expense;
  trucks: Truck[];
  categories: ExpenseCategory[];
  onSuccess: (expense: Expense) => void;
}) {
  const [activeTrip, setActiveTrip] = useState<ActiveTrip | null>(null);

  const fetchActiveTrip = useCallback(async (truckId: string | null) => {
    if (!truckId || truckId === "none") { setActiveTrip(null); return; }
    try {
      const res = await fetchWithAuth(`/api/trips/active?truckId=${truckId}`);
      if (res.ok) setActiveTrip(await res.json());
      else setActiveTrip(null);
    } catch { setActiveTrip(null); }
  }, []);

  useEffect(() => {
    if (expense.truckId) fetchActiveTrip(expense.truckId);
  }, [expense.truckId, fetchActiveTrip]);

  const truckItems = [
    { label: "Sin asignar", value: "none" },
    ...trucks.map((t) => ({
      label: `${t.licensePlate}`,
      value: t.id,
    })),
  ];

  const categoryItems = [
    { label: "Sin categoría", value: "none" },
    ...categories.map((c) => ({ label: c.name, value: c.id })),
  ];

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      name: expense.name ?? "",
      value: expense.value,
      date: expense.date,
      truckId: expense.truckId ?? null,
      expenseCategoryId: expense.expenseCategoryId ?? null,
      currency: (expense.currency as "USD" | "BRL" | "UYU") ?? "BRL",
      kilometers: expense.kilometers ?? null,
      liters: expense.liters ?? null,
    },
  });

  const currentCategoryId = watch("expenseCategoryId");
  const currentCategory = categories.find((c) => c.id === currentCategoryId);
  const isFuelType = currentCategory ? FUEL_CATEGORY_NAMES.has(currentCategory.name) : false;

  async function onSubmit(data: ExpenseFormValues) {
    try {
      const res = await fetchWithAuth(
        `/api/expenses/${expense.id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            name: data.name || null,
            value: data.value,
            date: data.date,
            truckId: data.truckId === "none" ? null : data.truckId,
            expenseCategoryId: data.expenseCategoryId === "none" ? null : data.expenseCategoryId,
            currency: data.currency,
            kilometers: data.kilometers ?? null,
            liters: data.liters ?? null,
            tripId: activeTrip?.id ?? expense.tripId ?? null,
          }),
        },
      );

      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || e.title || "Error al actualizar egreso"); }

      const updated = await res.json();
      toast.success("Egreso actualizado");
      onSuccess(updated);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al actualizar egreso");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <Field>
          <Label>Nombre</Label>
          <Input
            {...register("name")}
            placeholder="Ej: Nafta viaje Montevideo"
          />
          <FieldError errors={[errors.name]} />
        </Field>

        <Field>
          <Label>Valor</Label>
          <Input
            {...register("value", {
              setValueAs: (v) =>
                v === "" || v === null || v === undefined
                  ? undefined
                  : parseFloat(String(v).replace(",", ".")),
            })}
            type="number"
            step="0.01"
          />
          <FieldError errors={[errors.value]} />
        </Field>

        <Controller
          name="currency"
          control={control}
          render={({ field }) => (
            <Select
              items={currencyItems}
              value={field.value}
              onValueChange={(value) => field.onChange(value ?? "BRL")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar moneda" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {currencyItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        />

        <Field>
          <Label>Fecha</Label>
          <Input {...register("date")} type="date" />
          <FieldError errors={[errors.date]} />
        </Field>

        <Field>
          <Label>Camión</Label>
          <Controller
            name="truckId"
            control={control}
            render={({ field }) => (
              <Select
                items={truckItems}
                value={field.value ?? "none"}
                onValueChange={(value) => {
                  field.onChange(value === "none" ? null : value);
                  fetchActiveTrip(value === "none" ? null : value);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar camión" />
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
            )}
          />
        </Field>

        {activeTrip && (
          <Field>
            <Label>Viaje</Label>
            <Input
              disabled
              value={`${activeTrip.origin} → ${activeTrip.destination}`}
              className="bg-muted cursor-not-allowed"
            />
          </Field>
        )}

        <Field>
          <Label>Categoría</Label>
          <Controller
            name="expenseCategoryId"
            control={control}
            render={({ field }) => (
              <Select
                items={categoryItems}
                value={field.value ?? "none"}
                onValueChange={(value) => field.onChange(value === "none" ? null : value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar categoría" />
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
            )}
          />
        </Field>

        {isFuelType && (
          <>
            <Field>
              <Label>Kilómetros</Label>
              <Input
                {...register("kilometers", {
                  setValueAs: (v) =>
                    v === "" || v === null || v === undefined
                      ? null
                      : parseFloat(String(v).replace(",", ".")),
                })}
                type="number"
                step="0.01"
                placeholder="Opcional"
              />
              <FieldError errors={[errors.kilometers]} />
            </Field>

            <Field>
              <Label>Litros</Label>
              <Input
                {...register("liters", {
                  setValueAs: (v) =>
                    v === "" || v === null || v === undefined
                      ? null
                      : parseFloat(String(v).replace(",", ".")),
                })}
                type="number"
                step="0.01"
                placeholder="Opcional"
              />
              <FieldError errors={[errors.liters]} />
            </Field>
          </>
        )}
      </FieldGroup>

      <Button className="mt-4 w-full" type="submit" disabled={isSubmitting}>
        Guardar cambios
      </Button>
    </form>
  );
}
