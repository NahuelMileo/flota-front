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
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Expense } from "./columns";

type ActiveTrip = { id: string; origin: string; destination: string };

const FUEL_CATEGORY_NAMES = new Set(["Gasoil", "Arla32", "Arla 32", "Aceite"]);

const currencyItems = [
  { label: "BRL — Real brasileño", value: "BRL" },
  { label: "USD — Dólar", value: "USD" },
  { label: "UYU — Peso uruguayo", value: "UYU" },
];

const expenseItemSchema = z.object({
  name: z.string().optional(),
  value: z.number().positive("El valor debe ser mayor a 0"),
  currency: z.enum(["USD", "BRL", "UYU"]),
  expenseCategoryId: z.string().nullable(),
  liters: z.number().positive("Debe ser mayor a 0").nullable(),
});

const expenseSchema = z.object({
  date: z.string().min(1, "La fecha es requerida"),
  truckId: z.string().nullable(),
  kilometers: z.number().positive("Debe ser mayor a 0").nullable(),
  items: z.array(expenseItemSchema).min(1),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

const emptyItem = () => ({
  name: "",
  value: "" as unknown as number,
  currency: "BRL" as const,
  expenseCategoryId: null,
  liters: null,
});

export default function AddExpenseForm({
  trucks,
  categories,
  tripId,
  defaultTruckId,
  onSuccess,
}: {
  trucks: Truck[];
  categories: ExpenseCategory[];
  tripId?: string;
  defaultTruckId?: string;
  onSuccess: (expenses: Expense[]) => void;
}) {
  const todayIso = new Date().toISOString().split("T")[0];
  const [activeTrip, setActiveTrip] = useState<ActiveTrip | null>(null);

  async function fetchActiveTrip(truckId: string | null) {
    if (!truckId || truckId === "none" || tripId) { setActiveTrip(null); return; }
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/trips/active?truckId=${truckId}`);
      if (res.ok) setActiveTrip(await res.json());
      else setActiveTrip(null);
    } catch { setActiveTrip(null); }
  }

  useEffect(() => {
    if (defaultTruckId && !tripId) fetchActiveTrip(defaultTruckId);
  }, [defaultTruckId]);

  const truckItems = [
    { label: "Sin asignar", value: "none" },
    ...trucks.map((t) => ({
      label: `${t.licensePlate}${t.model ? ` - ${t.model}` : ""}`,
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
      date: todayIso,
      truckId: defaultTruckId ?? null,
      kilometers: null,
      items: [emptyItem()],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const watchedItems = watch("items");
  const hasAnyFuel = watchedItems.some((item) => {
    const cat = categories.find((c) => c.id === item.expenseCategoryId);
    return cat ? FUEL_CATEGORY_NAMES.has(cat.name) : false;
  });

  async function onSubmit(data: ExpenseFormValues) {
    try {
      const effectiveTripId = tripId ?? activeTrip?.id ?? undefined;
      const shared = {
        date: data.date,
        truckId: data.truckId === "none" ? null : data.truckId,
        kilometers: data.kilometers ?? null,
        ...(effectiveTripId && { tripId: effectiveTripId }),
      };

      const responses = await Promise.all(
        data.items.map((item) =>
          fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/expenses`, {
            method: "POST",
            body: JSON.stringify({
              ...shared,
              name: item.name || null,
              value: item.value,
              currency: item.currency,
              expenseCategoryId:
                item.expenseCategoryId === "none" ? null : item.expenseCategoryId,
              liters: item.liters ?? null,
            }),
          }),
        ),
      );

      const failed = responses.find((r) => !r.ok);
      if (failed) { const e = await failed.json().catch(() => ({})); throw new Error(e.message || e.title || "Error al agregar egreso"); }

      const results: Expense[] = await Promise.all(responses.map((r) => r.json()));
      toast.success(results.length > 1 ? `${results.length} egresos agregados` : "Egreso agregado");
      onSuccess(results);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al agregar egreso");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <Field>
          <Label>Fecha</Label>
          <Input {...register("date")} type="date" />
          <FieldError errors={[errors.date]} />
        </Field>

        {defaultTruckId ? (
          <Field>
            <Label>Camión</Label>
            <Input
              disabled
              value={trucks.find((t) => t.id === defaultTruckId)?.licensePlate || ""}
              className="bg-muted cursor-not-allowed"
            />
          </Field>
        ) : (
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
        )}

        {!tripId && activeTrip && (
          <Field>
            <Label>Viaje</Label>
            <Input
              disabled
              value={`${activeTrip.origin} → ${activeTrip.destination}`}
              className="bg-muted cursor-not-allowed"
            />
          </Field>
        )}

        {hasAnyFuel && (
          <Field>
            <Label>Kilómetros</Label>
            <Input
              {...register("kilometers", {
                setValueAs: (v) =>
                  v === "" || v === null || v === undefined
                    ? null
                    : parseFloat(String(v).replace(",", ".")),
              })}
              type="text"
              inputMode="decimal"
              placeholder="Opcional"
            />
            <FieldError errors={[errors.kilometers]} />
          </Field>
        )}
      </FieldGroup>

      <div className="mt-4 space-y-3">
        {fields.map((field, index) => {
          const itemCatId = watchedItems[index]?.expenseCategoryId;
          const itemCat = categories.find((c) => c.id === itemCatId);
          const isItemFuel = itemCat ? FUEL_CATEGORY_NAMES.has(itemCat.name) : false;

          return (
            <div key={field.id} className="rounded-md border p-4 space-y-3">
              {fields.length > 1 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Gasto {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-muted-foreground hover:text-destructive text-sm leading-none"
                  >
                    ✕
                  </button>
                </div>
              )}

              <FieldGroup>
                <Field>
                  <Label>Nombre</Label>
                  <Input
                    {...register(`items.${index}.name`)}
                    placeholder="Ej: Nafta viaje Montevideo"
                  />
                </Field>

                <Field>
                  <Label>Valor</Label>
                  <Input
                    {...register(`items.${index}.value`, {
                      setValueAs: (v) =>
                        v === "" || v === null || v === undefined
                          ? undefined
                          : parseFloat(String(v).replace(",", ".")),
                    })}
                    type="number"
                    step="0.01"
                    placeholder="12000"
                  />
                  <FieldError errors={[errors.items?.[index]?.value]} />
                </Field>

                <Controller
                  name={`items.${index}.currency`}
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
                  <Label>Categoría</Label>
                  <Controller
                    name={`items.${index}.expenseCategoryId`}
                    control={control}
                    render={({ field }) => (
                      <Select
                        items={categoryItems}
                        value={field.value ?? "none"}
                        onValueChange={(value) =>
                          field.onChange(value === "none" ? null : value)
                        }
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

                {isItemFuel && (
                  <Field>
                    <Label>Litros</Label>
                    <Input
                      {...register(`items.${index}.liters`, {
                        setValueAs: (v) =>
                          v === "" || v === null || v === undefined
                            ? null
                            : parseFloat(String(v).replace(",", ".")),
                      })}
                      type="text"
                      inputMode="decimal"
                      placeholder="Opcional"
                    />
                    <FieldError errors={[errors.items?.[index]?.liters]} />
                  </Field>
                )}
              </FieldGroup>
            </div>
          );
        })}
      </div>

      <Button
        type="button"
        variant="outline"
        className="mt-3 w-full"
        onClick={() => append(emptyItem())}
      >
        + Agregar gasto
      </Button>

      <Button className="mt-3 w-full" type="submit" disabled={isSubmitting}>
        {fields.length > 1 ? `Guardar ${fields.length} egresos` : "Agregar egreso"}
      </Button>
    </form>
  );
}
