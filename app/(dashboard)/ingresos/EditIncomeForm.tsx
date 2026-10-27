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
import { useState } from "react";
import { TripSelect, useTripSelection } from "@/components/trip-field";


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

  // El cobro de una cuenta a recibir es un espejo de la cuenta: monto, moneda, camión y
  // viaje se corrigen desde la cuenta, que es la que los sincroniza.
  const isCollection = !!income.receivableId;

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
    watch,
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

  // El viaje guardado se respeta mientras no cambie el camión; con otro camión se
  // sugiere el de la fecha.
  const watchedTruckId = watch("truckId");
  const tripSelection = useTripSelection(watchedTruckId, watch("dateUtc"), {
    truckId: income.truckId ?? null,
    tripId: income.tripId,
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
            tripId: isCollection
              ? (income.tripId ?? null)
              : data.truckId && data.truckId !== "none"
                ? tripSelection.tripId
                : null,
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
        {isCollection && (
          <p className="text-sm text-muted-foreground">
            Este ingreso es un cobro de una cuenta a recibir. El monto, la moneda, el camión y el
            viaje se cambian desde la cuenta.
          </p>
        )}

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
            readOnly={isCollection}
            className={isCollection ? "bg-muted cursor-not-allowed" : undefined}
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
                disabled={isCollection}
                value={field.value ?? "none"}
                onValueChange={(value) => {
                  field.onChange(value === "none" ? null : value);
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

        {!isCollection && watchedTruckId && watchedTruckId !== "none" && (
          <TripSelect
            trips={tripSelection.trips}
            value={tripSelection.value}
            onChange={tripSelection.setValue}
          />
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
                disabled={isCollection}
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
