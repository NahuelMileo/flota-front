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
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Expense } from "./columns";
import { expenseTypeLabels } from "@/lib/expense-types";

const expenseTypeItems = Object.entries(expenseTypeLabels).map(([value, label]) => ({ value, label }));
const expenseTypeValues = Object.keys(expenseTypeLabels) as [string, ...string[]];

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
  type: z.enum(expenseTypeValues),
  currency: z.enum(["USD", "BRL", "UYU"]),
  kilometers: z.number().positive("Debe ser mayor a 0").nullable(),
  liters: z.number().positive("Debe ser mayor a 0").nullable(),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

const FUEL_TYPES = new Set(["1", "2", "5"]);

export default function AddExpenseForm({
  trucks,
  tripId,
  defaultTruckId,
  onSuccess,
}: {
  trucks: Truck[];
  tripId?: string;
  defaultTruckId?: string;
  onSuccess: (expense: Expense) => void;
}) {
  const todayIso = new Date().toISOString().split("T")[0];

  const truckItems = [
    { label: "Sin asignar", value: "none" },
    ...trucks.map((t) => ({
      label: `${t.licensePlate}${t.model ? ` - ${t.model}` : ""}`,
      value: t.id,
    })),
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
      type: "1",
      currency: "BRL",
    },
  });

  const currentType = watch("type");
  const isFuelType = FUEL_TYPES.has(currentType);

  async function onSubmit(data: ExpenseFormValues) {
    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/expenses`,
        {
          method: "POST",
          body: JSON.stringify({
            name: data.name || null,
            value: data.value,
            date: data.date,
            truckId: data.truckId === "none" ? null : data.truckId,
            type: parseInt(data.type),
            currency: data.currency,
            kilometers: data.kilometers ?? null,
            liters: data.liters ?? null,
            ...(tripId && { tripId }),
          }),
        },
      );

      if (!res.ok) throw new Error();

      const result = await res.json();
      toast.success("Egreso agregado");
      onSuccess(result);
    } catch {
      toast.error("Error al agregar egreso");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <Field>
          <Label>Nombre</Label>
          <Input {...register("name")} placeholder="Ej: Nafta viaje Montevideo" />
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
            placeholder="12000"
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
                onValueChange={(value) =>
                  field.onChange(value === "none" ? null : value)
                }
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

        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <Select
              items={expenseTypeItems}
              value={field.value}
              onValueChange={(value) => field.onChange(value ?? "1")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {expenseTypeItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        />

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
                type="text"
                inputMode="decimal"
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
                type="text"
                inputMode="decimal"
                placeholder="Opcional"
              />
              <FieldError errors={[errors.liters]} />
            </Field>
          </>
        )}
      </FieldGroup>

      <Button className="mt-4 w-full" type="submit" disabled={isSubmitting}>
        Agregar egreso
      </Button>
    </form>
  );
}
