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
import { Income, normalizeIncomeType } from "./columns";
import { useState, useEffect } from "react";

type ActiveTrip = { id: string; origin: string; destination: string };


const incomeSchema = z.object({
  description: z.string().min(1, "La descripción es requerida"),
  value: z.number().positive("El valor debe ser mayor a 0"),
  dateUtc: z.string().min(1, "La fecha es requerida"),
  truckId: z.string().nullable(),
  type: z.enum(["1", "2"]),
  currency: z.enum(["USD", "BRL", "UYU"]),
});

type IncomeFormValues = z.infer<typeof incomeSchema>;

const incomeTypeItems = [
  { label: "Flete", value: "1" },
  { label: "Otro", value: "2" },
];

const currencyItems = [
  { label: "BRL — Real brasileño", value: "BRL" },
  { label: "USD — Dólar", value: "USD" },
  { label: "UYU — Peso uruguayo", value: "UYU" },
];

export default function EditIncomeForm({
  income,
  trucks,
  onSuccess,
}: {
  income: Income;
  trucks: Truck[];
  onSuccess: (income: Income) => void;
}) {
  const [activeTrip, setActiveTrip] = useState<ActiveTrip | null>(null);

  async function fetchActiveTrip(truckId: string | null) {
    if (!truckId || truckId === "none") { setActiveTrip(null); return; }
    try {
      const res = await fetchWithAuth(`/api/trips/active?truckId=${truckId}`);
      if (res.ok) setActiveTrip(await res.json());
      else setActiveTrip(null);
    } catch { setActiveTrip(null); }
  }

  useEffect(() => {
    if (income.truckId) fetchActiveTrip(income.truckId);
  }, []);

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
    formState: { errors, isSubmitting },
  } = useForm<IncomeFormValues>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      description: income.description,
      value: income.value,
      dateUtc: income.dateUtc.split("T")[0],
      truckId: income.truckId ?? null,
      type: normalizeIncomeType(String(income.type)),
      currency: (income.currency as "USD" | "BRL" | "UYU") ?? "BRL",
    },
  });

  async function onSubmit(data: IncomeFormValues) {
    try {
      const res = await fetchWithAuth(
        `/api/incomes/${income.id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            description: data.description,
            value: data.value,
            dateUtc: data.dateUtc,
            truckId: data.truckId === "none" ? null : data.truckId,
            type: parseInt(data.type),
            currency: data.currency,
            tripId: activeTrip?.id ?? income.tripId ?? null,
          }),
        },
      );

      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || e.title || "Error al actualizar"); }

      const updated = await res.json();
      toast.success("Ingreso actualizado");
      onSuccess(updated);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al actualizar");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <Field>
          <Label>Descripción</Label>
          <Input {...register("description")} />
          <FieldError errors={[errors.description]} />
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

        <Field>
          <Label>Fecha</Label>
          <Input {...register("dateUtc")} type="date" />
          <FieldError errors={[errors.dateUtc]} />
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
          <Label>Tipo</Label>
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <Select
                items={incomeTypeItems}
                value={field.value}
                onValueChange={(value) => field.onChange(value ?? "1")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar tipo" />
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
            )}
          />
        </Field>

        <Field>
          <Label>Moneda</Label>
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
        </Field>
      </FieldGroup>

      <Button className="mt-4 w-full" type="submit" disabled={isSubmitting}>
        Guardar cambios
      </Button>
    </form>
  );
}
