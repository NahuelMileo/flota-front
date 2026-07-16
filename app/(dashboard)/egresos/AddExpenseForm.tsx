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
import { useEffect, useState, useCallback } from "react";
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
  expenseCategoryId: z
    .string()
    .nullable()
    .refine((v) => v !== null && v !== "none", { message: "La categoría es requerida" }),
  liters: z.number().positive("Debe ser mayor a 0").nullable(),
});

const expenseSchema = z.object({
  date: z.string().min(1, "La fecha es requerida"),
  truckId: z.string().nullable(),
  kilometers: z.number().positive("Debe ser mayor a 0").nullable(),
  installments: z
    .number({ message: "Ingresá la cantidad de cuotas" })
    .int("Debe ser un número entero")
    .min(1, "Mínimo 1 cuota")
    .max(60, "Máximo 60 cuotas"),
  items: z.array(expenseItemSchema).min(1),
}).superRefine((data, ctx) => {
  if (data.installments <= 1) return;
  if (!data.truckId || data.truckId === "none") {
    ctx.addIssue({
      code: "custom",
      path: ["truckId"],
      message: "Seleccioná un camión — los planes de cuotas son por camión",
    });
  }
  if (data.items.length > 1) {
    ctx.addIssue({
      code: "custom",
      path: ["installments"],
      message: "El pago en cuotas admite un solo gasto por envío",
    });
  }
  const name = data.items[0]?.name?.trim() ?? "";
  if (name.length < 2) {
    ctx.addIssue({
      code: "custom",
      path: ["items", 0, "name"],
      message: "El nombre es requerido para pagar en cuotas",
    });
  }
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
  onInstallmentsCreated,
}: {
  trucks: Truck[];
  categories: ExpenseCategory[];
  tripId?: string;
  defaultTruckId?: string;
  onSuccess: (expenses: Expense[]) => void;
  // Habilita el pago en cuotas; se llama tras crear el plan (la respuesta no es un
  // expense, así que el padre debe refetchear el listado)
  onInstallmentsCreated?: () => void;
}) {
  const today = new Date();
  const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const [activeTrip, setActiveTrip] = useState<ActiveTrip | null>(null);

  const fetchActiveTrip = useCallback(async (truckId: string | null) => {
    if (!truckId || truckId === "none" || tripId) { setActiveTrip(null); return; }
    try {
      const res = await fetchWithAuth(`/api/trips/active?truckId=${truckId}`);
      if (res.ok) setActiveTrip(await res.json());
      else setActiveTrip(null);
    } catch { setActiveTrip(null); }
  }, [tripId]);

  useEffect(() => {
    if (defaultTruckId && !tripId) fetchActiveTrip(defaultTruckId);
  }, [defaultTruckId, tripId, fetchActiveTrip]);

  const truckItems = [
    { label: "Empresa", value: "none" },
    ...trucks.map((t) => ({
      label: `${t.licensePlate}${t.model ? ` - ${t.model}` : ""}`,
      value: t.id,
    })),
  ];

  const categoryItems = categories.map((c) => ({ label: c.name, value: c.id }));

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
      installments: 1,
      items: [emptyItem()],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const watchedItems = watch("items");
  const watchedInstallments = watch("installments");
  const isInstallmentPlan = !!onInstallmentsCreated && watchedInstallments > 1;
  const hasAnyFuel = watchedItems.some((item) => {
    const cat = categories.find((c) => c.id === item.expenseCategoryId);
    return cat ? FUEL_CATEGORY_NAMES.has(cat.name) : false;
  });

  const firstItemValue = watchedItems[0]?.value;
  const installmentAmount =
    isInstallmentPlan && typeof firstItemValue === "number" && firstItemValue > 0
      ? (firstItemValue / watchedInstallments).toFixed(2)
      : null;

  async function onSubmit(data: ExpenseFormValues) {
    try {
      const effectiveTripId = tripId ?? activeTrip?.id ?? undefined;

      if (onInstallmentsCreated && data.installments > 1) {
        const item = data.items[0];
        const res = await fetchWithAuth(`/api/costs/installments`, {
          method: "POST",
          body: JSON.stringify({
            name: item.name!.trim(),
            totalAmount: item.value,
            installmentCount: data.installments,
            truckId: data.truckId,
            startMonth: parseInt(data.date.slice(5, 7), 10),
            startYear: parseInt(data.date.slice(0, 4), 10),
            expenseCategoryId: item.expenseCategoryId,
            currency: item.currency,
            tripId: effectiveTripId ?? null,
            firstInstallmentDate: data.date,
          }),
        });
        if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || e.title || "Error al crear el plan de cuotas"); }
        const plan = await res.json();
        toast.success(`Plan de ${plan.installmentCount} cuotas creado`);
        onInstallmentsCreated();
        return;
      }

      const shared = {
        date: data.date,
        truckId: data.truckId === "none" ? null : data.truckId,
        kilometers: data.kilometers ?? null,
        ...(effectiveTripId && { tripId: effectiveTripId }),
      };

      const responses = await Promise.all(
        data.items.map((item) =>
          fetchWithAuth(`/api/expenses`, {
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
          <Field>
            <Label>Camión{isInstallmentPlan ? "" : " (opcional)"}</Label>
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
            <FieldError errors={[errors.truckId]} />
          </Field>
        )}

        {onInstallmentsCreated && (
          <Field>
            <Label>Cuotas</Label>
            <Input
              {...register("installments", {
                setValueAs: (v) =>
                  v === "" || v === null || v === undefined
                    ? undefined
                    : parseInt(String(v), 10),
              })}
              type="number"
              min={1}
              max={60}
            />
            {installmentAmount && (
              <p className="text-xs text-muted-foreground">
                Se creará un plan de {watchedInstallments} cuotas mensuales de ${installmentAmount}
              </p>
            )}
            <FieldError errors={[errors.installments]} />
          </Field>
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

        {hasAnyFuel && !isInstallmentPlan && (
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
                  <FieldError errors={[errors.items?.[index]?.name]} />
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
                        value={field.value ?? null}
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
                  <FieldError errors={[errors.items?.[index]?.expenseCategoryId]} />
                </Field>

                {isItemFuel && !isInstallmentPlan && (
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

      {!isInstallmentPlan && (
        <Button
          type="button"
          variant="outline"
          className="mt-3 w-full"
          onClick={() => append(emptyItem())}
        >
          + Agregar gasto
        </Button>
      )}

      <Button className="mt-3 w-full" type="submit" disabled={isSubmitting}>
        {isInstallmentPlan
          ? "Crear plan de cuotas"
          : fields.length > 1
            ? `Guardar ${fields.length} egresos`
            : "Agregar egreso"}
      </Button>
    </form>
  );
}
