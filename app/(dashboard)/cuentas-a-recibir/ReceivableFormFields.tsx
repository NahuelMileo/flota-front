"use client";

import { Field, FieldDescription, FieldGroup, FieldError } from "@/components/ui/field";
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
import { AutoTextarea } from "@/components/ui/auto-textarea";
import { TripSelect, type TruckTripOption } from "@/components/trip-field";
import { fetchWithAuth } from "@/lib/api";
import type { Truck } from "@/types/truck";
import type { Client } from "@/types/client";
import type { ExpenseCategory } from "@/types/expense-category";
import { z } from "zod";
import { useEffect, useState } from "react";
import type { Control, UseFormRegister, UseFormSetValue, FieldErrors } from "react-hook-form";
import { Controller, useWatch } from "react-hook-form";

// Valor del selector de viaje que pide crear uno nuevo con la ruta del formulario.
export const NEW_TRIP = "new";

export const DEFAULT_DRIVER_SALARY_PERCENTAGE = 15;

export const currencyItems = [
  { label: "BRL — Real brasileño", value: "BRL" },
  { label: "USD — Dólar", value: "USD" },
  { label: "UYU — Peso uruguayo", value: "UYU" },
];

const money = (message: string) =>
  z.number({ message }).min(0, "No puede ser negativo");

const place = z.string().max(500, "Máximo 500 caracteres").optional();

export const receivableSchema = z
  .object({
    clientId: z.string().min(1, "El cliente es requerido"),
    truckId: z.string().min(1, "El camión es requerido"),
    tripChoice: z.string(),
    origin: place,
    destination: place,
    dateUtc: z.string().min(1, "La fecha es requerida"),
    currency: z.enum(["USD", "BRL", "UYU"]),
    freightValue: z
      .number({ message: "El valor del flete es requerido" })
      .positive("El valor del flete debe ser mayor a 0"),
    advanceAmount: money("El adelanto es requerido"),
    balanceAmount: money("El saldo es requerido"),
    tollAmount: money("El peaje es requerido"),
    driverSalaryPercentage: z
      .number()
      .gt(0, "Debe ser mayor a 0")
      .max(100, "Máximo 100")
      .nullable(),
    notes: z.string().max(500, "Máximo 500 caracteres").optional(),
  })
  // Adelanto, saldo y peaje son las partes del flete: si no suman, la fila miente sobre
  // lo que se pactó. Misma regla que valida el backend.
  .refine(
    (data) =>
      Math.abs(data.advanceAmount + data.balanceAmount + data.tollAmount - data.freightValue) <= 0.01,
    {
      message: "El adelanto, el saldo y el peaje deben sumar el valor del flete",
      path: ["freightValue"],
    },
  )
  // FTL: cada fila es un viaje. Para crearlo hace falta la ruta; con un viaje existente
  // la ruta es opcional (si viene, lo actualiza).
  .superRefine((data, ctx) => {
    if (data.tripChoice !== NEW_TRIP) return;
    if ((data.origin?.trim().length ?? 0) < 2) {
      ctx.addIssue({ code: "custom", path: ["origin"], message: "El origen es requerido para crear el viaje" });
    }
    if ((data.destination?.trim().length ?? 0) < 2) {
      ctx.addIssue({ code: "custom", path: ["destination"], message: "El destino es requerido para crear el viaje" });
    }
  });

export type ReceivableFormValues = z.infer<typeof receivableSchema>;

export const parseMoney = (v: unknown) =>
  v === "" || v === null || v === undefined
    ? undefined
    : parseFloat(String(v).replace(",", "."));

const parseOptionalNumber = (v: unknown) =>
  v === "" || v === null || v === undefined ? null : parseFloat(String(v).replace(",", "."));

export const round2 = (v: number) => Math.round(v * 100) / 100;

export const DEFAULT_ADVANCE_RATIO = 0.7;

export function todayIso() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
    today.getDate(),
  ).padStart(2, "0")}`;
}

// Cuerpo del POST/PUT: "Viaje nuevo" viaja como tripId null y la ruta crea el viaje.
export function toReceivablePayload(data: ReceivableFormValues, salaryCategoryId?: string | null) {
  const { tripChoice, ...rest } = data;
  return {
    ...rest,
    tripId: tripChoice === NEW_TRIP ? null : tripChoice,
    origin: data.origin?.trim() ? data.origin.trim() : null,
    destination: data.destination?.trim() ? data.destination.trim() : null,
    notes: data.notes?.trim() ? data.notes.trim() : null,
    ...(salaryCategoryId ? { driverSalaryCategoryId: salaryCategoryId } : {}),
  };
}

// Categoría por defecto del egreso de salario: la misma heurística que AddIncomeForm.
export function useSalaryCategoryId() {
  const [categoryId, setCategoryId] = useState<string | null>(null);
  useEffect(() => {
    fetchWithAuth(`/api/expense-categories`)
      .then(async (res) => {
        if (!res.ok) return;
        const categories: ExpenseCategory[] = await res.json();
        setCategoryId(categories.find((c) => c.name.toLowerCase().includes("salari"))?.id ?? null);
      })
      .catch(() => {});
  }, []);
  return categoryId;
}

type FieldsProps = {
  control: Control<ReceivableFormValues>;
  register: UseFormRegister<ReceivableFormValues>;
  setValue: UseFormSetValue<ReceivableFormValues>;
  errors: FieldErrors<ReceivableFormValues>;
  clients: Client[];
  trucks: Truck[];
  tollAmount: number | undefined;
  // Viajes recientes del camión elegido (GET /api/trips/by-truck).
  trips: TruckTripOption[];
  // Id de la cuenta en edición: su propio viaje se sigue ofreciendo aunque ya tenga cuenta.
  receivableId?: string;
  onTruckChange: (truckId: string | null) => void;
  onTripChoice: (value: string) => void;
  salaryHint?: string;
};

export function ReceivableFormFields({
  control,
  register,
  setValue,
  errors,
  clients,
  trucks,
  tollAmount,
  trips,
  receivableId,
  onTruckChange,
  onTripChoice,
  salaryHint,
}: FieldsProps) {
  const clientItems = clients.map((c) => ({ label: c.name, value: c.id }));
  const truckItems = trucks.map((t) => ({
    label: `${t.licensePlate}${t.model ? ` - ${t.model}` : ""}`,
    value: t.id,
  }));
  // FTL: un viaje tiene una sola cuenta. Se ofrecen los viajes libres (y el propio).
  const freeTrips = trips.filter((t) => !t.receivableId || t.receivableId === receivableId);

  // Los dos sentidos van en los onChange y no en efectos, para no pisar los montos de
  // una cuenta existente al abrirla:
  // - Tipear el flete reparte 70/30 lo que queda sin el peaje.
  // - Tipear adelanto, saldo o peaje recalcula el flete como la suma de los tres.
  const [truckId, tripChoice, advanceAmount, balanceAmount, driverSalaryPercentage] = useWatch({
    control,
    name: ["truckId", "tripChoice", "advanceAmount", "balanceAmount", "driverSalaryPercentage"],
  });
  const setFreightFromParts = (parts: { advance?: number; balance?: number; toll?: number }) => {
    const value = (v: number | undefined) => (v === undefined || Number.isNaN(v) ? 0 : v);
    const freight = round2(
      value(parts.advance ?? advanceAmount) + value(parts.balance ?? balanceAmount) + value(parts.toll ?? tollAmount),
    );
    setValue("freightValue", freight, { shouldValidate: true });
  };

  // El salario es sobre adelanto + saldo: el peaje es un reintegro, no trabajo del chofer.
  const salaryBase = (Number(advanceAmount) || 0) + (Number(balanceAmount) || 0);
  const salaryAmount =
    driverSalaryPercentage && driverSalaryPercentage > 0
      ? round2((salaryBase * driverSalaryPercentage) / 100)
      : null;

  return (
    <FieldGroup>
      <Field>
        <Label>Cliente</Label>
        <Controller
          name="clientId"
          control={control}
          render={({ field }) => (
            <Select
              items={clientItems}
              value={field.value || ""}
              onValueChange={field.onChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar cliente" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {clientItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        />
        <FieldError errors={[errors.clientId]} />
      </Field>

      <Field>
        <Label>Camión</Label>
        <Controller
          name="truckId"
          control={control}
          render={({ field }) => (
            <Select
              items={truckItems}
              value={field.value || ""}
              onValueChange={(value) => {
                field.onChange(value);
                onTruckChange(value);
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

      {truckId && (
        <TripSelect
          trips={freeTrips}
          value={tripChoice}
          onChange={onTripChoice}
          leadingItems={[{ label: "Viaje nuevo", value: NEW_TRIP }]}
          description={
            tripChoice === NEW_TRIP
              ? "Se crea el viaje con esta ruta, sin km. Los km los cargás en el viaje cuando lleguen."
              : "La fecha, el camión y la ruta del viaje se actualizan con los de esta cuenta."
          }
        />
      )}

      <div className="grid grid-cols-2 gap-3">
        <Field>
          <Label>Origen</Label>
          <Input {...register("origin")} placeholder="SP" />
          <FieldError errors={[errors.origin]} />
        </Field>
        <Field>
          <Label>Destino</Label>
          <Input {...register("destination")} placeholder="Mdeo" />
          <FieldError errors={[errors.destination]} />
        </Field>
      </div>

      <Field>
        <Label>Fecha del viaje</Label>
        <Input {...register("dateUtc")} type="date" />
        <FieldError errors={[errors.dateUtc]} />
      </Field>

      <Field>
        <Label>Moneda</Label>
        <Controller
          name="currency"
          control={control}
          render={({ field }) => (
            <Select items={currencyItems} value={field.value} onValueChange={field.onChange}>
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
        <FieldError errors={[errors.currency]} />
      </Field>

      <Field>
        <Label>Valor del flete</Label>
        {/* Incluye el peaje. El 70/30 es el default, no una regla: se precarga al
            tipear el flete y queda editable. */}
        <Input
          {...register("freightValue", {
            setValueAs: parseMoney,
            onChange: (e) => {
              const freight = parseMoney(e.target.value);
              if (freight === undefined || Number.isNaN(freight)) return;
              const base = Math.max(0, freight - (tollAmount ?? 0));
              const advance = round2(base * DEFAULT_ADVANCE_RATIO);
              setValue("advanceAmount", advance, { shouldValidate: true });
              setValue("balanceAmount", round2(base - advance), { shouldValidate: true });
            },
          })}
          type="number"
          step="0.01"
          placeholder="12200"
        />
        <FieldDescription>Adelanto + saldo + peaje. Si lo dejás vacío, se completa solo.</FieldDescription>
        <FieldError errors={[errors.freightValue]} />
      </Field>

      <Field>
        <Label>Adelanto (70%)</Label>
        <Input
          {...register("advanceAmount", {
            setValueAs: parseMoney,
            onChange: (e) => setFreightFromParts({ advance: parseMoney(e.target.value) ?? 0 }),
          })}
          type="number"
          step="0.01"
        />
        <FieldError errors={[errors.advanceAmount]} />
      </Field>

      <Field>
        <Label>Saldo (30%)</Label>
        <Input
          {...register("balanceAmount", {
            setValueAs: parseMoney,
            onChange: (e) => setFreightFromParts({ balance: parseMoney(e.target.value) ?? 0 }),
          })}
          type="number"
          step="0.01"
        />
        <FieldError errors={[errors.balanceAmount]} />
      </Field>

      <Field>
        <Label>Peaje</Label>
        <Input
          {...register("tollAmount", {
            setValueAs: parseMoney,
            onChange: (e) => setFreightFromParts({ toll: parseMoney(e.target.value) ?? 0 }),
          })}
          type="number"
          step="0.01"
          placeholder="0"
        />
        <FieldError errors={[errors.tollAmount]} />
      </Field>

      <Field>
        <Label>Salario del chofer (%)</Label>
        <Input
          {...register("driverSalaryPercentage", { setValueAs: parseOptionalNumber })}
          type="number"
          step="0.1"
          min={0}
          max={100}
          placeholder="Sin salario"
        />
        <FieldDescription>
          {salaryAmount !== null
            ? `Egreso de ${salaryAmount.toLocaleString("es-UY")} sobre adelanto + saldo, sin el peaje.`
            : "Sobre adelanto + saldo, sin el peaje."}
          {salaryHint ? ` ${salaryHint}` : ""}
        </FieldDescription>
        <FieldError errors={[errors.driverSalaryPercentage]} />
      </Field>

      <Field>
        <Label>Notas</Label>
        <AutoTextarea {...register("notes")} placeholder="Opcional" />
        <FieldError errors={[errors.notes]} />
      </Field>
    </FieldGroup>
  );
}
