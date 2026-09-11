"use client";

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
import { AutoTextarea } from "@/components/ui/auto-textarea";
import { fetchWithAuth } from "@/lib/api";
import type { Truck } from "@/types/truck";
import type { Client } from "@/types/client";
import { z } from "zod";
import { useCallback, useRef, useState } from "react";
import type { Control, UseFormRegister, UseFormSetValue, FieldErrors } from "react-hook-form";
import { Controller } from "react-hook-form";

export type ActiveTrip = { id: string; origin: string; destination: string };

export const currencyItems = [
  { label: "BRL — Real brasileño", value: "BRL" },
  { label: "USD — Dólar", value: "USD" },
  { label: "UYU — Peso uruguayo", value: "UYU" },
];

const money = (message: string) =>
  z.number({ message }).min(0, "No puede ser negativo");

export const receivableSchema = z
  .object({
    clientId: z.string().min(1, "El cliente es requerido"),
    truckId: z.string().min(1, "El camión es requerido"),
    dateUtc: z.string().min(1, "La fecha es requerida"),
    currency: z.enum(["USD", "BRL", "UYU"]),
    freightValue: z
      .number({ message: "El valor del flete es requerido" })
      .positive("El valor del flete debe ser mayor a 0"),
    advanceAmount: money("El adelanto es requerido"),
    balanceAmount: money("El saldo es requerido"),
    tollAmount: money("El peaje es requerido"),
    notes: z.string().max(500, "Máximo 500 caracteres").optional(),
  })
  // El adelanto y el saldo son un reparto del flete: si no suman, la fila miente sobre
  // lo que se pactó. Misma regla que valida el backend.
  .refine(
    (data) => Math.abs(data.advanceAmount + data.balanceAmount - data.freightValue) <= 0.01,
    {
      message: "El adelanto y el saldo deben sumar el valor del flete",
      path: ["balanceAmount"],
    },
  );

export type ReceivableFormValues = z.infer<typeof receivableSchema>;

export const parseMoney = (v: unknown) =>
  v === "" || v === null || v === undefined
    ? undefined
    : parseFloat(String(v).replace(",", "."));

export const round2 = (v: number) => Math.round(v * 100) / 100;

export const DEFAULT_ADVANCE_RATIO = 0.7;

export function todayIso() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
    today.getDate(),
  ).padStart(2, "0")}`;
}

// Mismo patrón que AddIncomeForm: el camión puede cambiar mientras un fetch está en
// vuelo, así que se descarta toda respuesta que no sea la del último pedido.
export function useActiveTrip(enabled: boolean) {
  const [activeTrip, setActiveTrip] = useState<ActiveTrip | null>(null);
  const requestId = useRef(0);

  const fetchActiveTrip = useCallback(
    async (truckId: string | null) => {
      const current = ++requestId.current;
      if (!truckId || !enabled) {
        setActiveTrip(null);
        return;
      }
      try {
        const res = await fetchWithAuth(`/api/trips/active?truckId=${truckId}`);
        if (current !== requestId.current) return;
        setActiveTrip(res.ok ? await res.json() : null);
      } catch {
        if (current === requestId.current) setActiveTrip(null);
      }
    },
    [enabled],
  );

  return { activeTrip, setActiveTrip, fetchActiveTrip };
}

type FieldsProps = {
  control: Control<ReceivableFormValues>;
  register: UseFormRegister<ReceivableFormValues>;
  setValue: UseFormSetValue<ReceivableFormValues>;
  errors: FieldErrors<ReceivableFormValues>;
  clients: Client[];
  trucks: Truck[];
  freightValue: number | undefined;
  tollAmount: number | undefined;
  activeTrip: ActiveTrip | null;
  onTruckChange: (truckId: string | null) => void;
};

export function ReceivableFormFields({
  control,
  register,
  setValue,
  errors,
  clients,
  trucks,
  freightValue,
  tollAmount,
  activeTrip,
  onTruckChange,
}: FieldsProps) {
  const clientItems = clients.map((c) => ({ label: c.name, value: c.id }));
  const truckItems = trucks.map((t) => ({
    label: `${t.licensePlate}${t.model ? ` - ${t.model}` : ""}`,
    value: t.id,
  }));

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
        <Label>Fecha</Label>
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
        {/* El 70/30 es el default, no una regla: se precarga al tipear el flete y
            queda editable. Va en el onChange y no en un efecto para no pisar los
            montos de una cuenta existente al abrirla. */}
        <Input
          {...register("freightValue", {
            setValueAs: parseMoney,
            onChange: (e) => {
              const freight = parseMoney(e.target.value);
              if (freight === undefined || Number.isNaN(freight)) return;
              const advance = round2(freight * DEFAULT_ADVANCE_RATIO);
              setValue("advanceAmount", advance, { shouldValidate: true });
              setValue("balanceAmount", round2(freight - advance), { shouldValidate: true });
            },
          })}
          type="number"
          step="0.01"
          placeholder="11400"
        />
        <FieldError errors={[errors.freightValue]} />
      </Field>

      <Field>
        <Label>Adelanto (70%)</Label>
        <Input
          {...register("advanceAmount", {
            setValueAs: parseMoney,
            onChange: (e) => {
              const advance = parseMoney(e.target.value);
              if (advance === undefined || freightValue === undefined) return;
              setValue("balanceAmount", round2(freightValue - advance), { shouldValidate: true });
            },
          })}
          type="number"
          step="0.01"
        />
        <FieldError errors={[errors.advanceAmount]} />
      </Field>

      <Field>
        <Label>Saldo (30%)</Label>
        <Input
          {...register("balanceAmount", { setValueAs: parseMoney })}
          type="number"
          step="0.01"
        />
        <FieldError errors={[errors.balanceAmount]} />
      </Field>

      <Field>
        <Label>Peaje</Label>
        <Input
          {...register("tollAmount", { setValueAs: parseMoney })}
          type="number"
          step="0.01"
          placeholder="0"
        />
        <FieldError errors={[errors.tollAmount]} />
      </Field>

      <Field>
        {/* En la planilla original esta columna es la ruta ("MdeoxFranca", "spxMdeo"). */}
        <Label>Ruta / Notas</Label>
        <AutoTextarea {...register("notes")} placeholder="MdeoxFranca" />
        <FieldError errors={[errors.notes]} />
      </Field>

      {/* El peaje no entra en el split del flete, pero sí en lo que hay que cobrar. */}
      <p className="text-xs text-muted-foreground">
        Total a recibir:{" "}
        <span className="font-medium text-foreground">
          {round2((freightValue ?? 0) + (tollAmount ?? 0))}
        </span>
      </p>
    </FieldGroup>
  );
}
