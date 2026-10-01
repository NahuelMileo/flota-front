"use client";

import { SheetFormActions } from "@/components/sheet-form-actions";
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
import type { Expense } from "@/app/(dashboard)/egresos/columns";
import { fetchDriverSalary } from "@/lib/driver-salary";
import { useState, useEffect, useCallback, useRef } from "react";

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
  /** `driverSalary` llega cuando el ingreso tiene un salario de chofer: el backend lo recalculó. */
  onSuccess: (income: Income, driverSalary?: Expense) => void;
}) {
  const hasDriverSalary = !!income.driverSalaryExpenseId;
  const [driverPercentage, setDriverPercentage] = useState(income.driverSalaryPercentage ?? 15);
  const [driverPercentageError, setDriverPercentageError] = useState<string | null>(null);

  const [activeTrip, setActiveTrip] = useState<ActiveTrip | null>(null);
  const activeTripRequestId = useRef(0);

  const fetchActiveTrip = useCallback(async (truckId: string | null) => {
    const requestId = ++activeTripRequestId.current;
    if (!truckId || truckId === "none") { setActiveTrip(null); return; }
    try {
      const res = await fetchWithAuth(`/api/trips/active?truckId=${truckId}`);
      if (requestId !== activeTripRequestId.current) return; // el camión ya cambió de nuevo, descartar
      if (res.ok) setActiveTrip(await res.json());
      else setActiveTrip(null);
    } catch {
      if (requestId === activeTripRequestId.current) setActiveTrip(null);
    }
  }, []);

  useEffect(() => {
    if (income.truckId) fetchActiveTrip(income.truckId);
  }, [income.truckId, fetchActiveTrip]);

  const truckItems = [
    { label: "Empresa", value: "none" },
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
    if (hasDriverSalary && (driverPercentage <= 0 || driverPercentage > 100)) {
      setDriverPercentageError("Debe ser mayor a 0 y hasta 100");
      return;
    }
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
            // Solo conservar el tripId original si el camión no cambió — si cambió,
            // ese viaje pertenece al camión anterior y no debe reenviarse.
            tripId: activeTrip?.id ?? (data.truckId === income.truckId ? income.tripId : null) ?? null,
            // El backend recalcula el salario vinculado (valor, fecha, camión, nombre).
            ...(hasDriverSalary ? { driverSalaryPercentage: driverPercentage } : {}),
          }),
        },
      );

      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || e.title || "Error al actualizar"); }

      const updated: Income = await res.json();
      const driverSalary = await fetchDriverSalary(updated.driverSalaryExpenseId);
      toast.success(driverSalary ? "Ingreso y salario del chofer actualizados" : "Ingreso actualizado");
      onSuccess(updated, driverSalary);
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
                  // Limpiar antes de refetchear: si el usuario envía el form mientras
                  // el fetch está en curso, no debe quedar pegado el viaje del camión anterior.
                  setActiveTrip(null);
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

        {hasDriverSalary && (
          <Field>
            <Label>Porcentaje del chofer (%)</Label>
            <Input
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={driverPercentage}
              onChange={(e) => {
                setDriverPercentage(parseFloat(e.target.value) || 0);
                setDriverPercentageError(null);
              }}
            />
            <p className="text-sm text-muted-foreground">
              El egreso de salario del chofer se recalcula al guardar.
            </p>
            {driverPercentageError && (
              <p className="text-sm text-destructive">{driverPercentageError}</p>
            )}
          </Field>
        )}
      </FieldGroup>

      <SheetFormActions submitLabel="Guardar cambios" isSubmitting={isSubmitting} />
    </form>
  );
}
