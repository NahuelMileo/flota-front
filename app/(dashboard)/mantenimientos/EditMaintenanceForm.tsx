"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldError } from "@/components/ui/field";
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
import { Textarea } from "@/components/ui/textarea";
import { fetchWithAuth } from "@/lib/api";
import type { Truck } from "@/types/truck";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import type { Maintenance, MaintenanceConcept, CreateMaintenanceDto } from "@/types/maintenance";
import { useState } from "react";

const typeMap: Record<string, 0 | 1> = { "Preventive": 0, "Corrective": 1 };
const currencyMap: Record<string, 0 | 1 | 2> = { "BRL": 0, "USD": 1, "UYU": 2 };

const maintenanceSchema = z.object({
  maintenanceConceptId: z.string().min(1, "El concepto es requerido"),
  type: z.enum(["Preventive", "Corrective"]),
  truckId: z.string().min(1, "El camión es requerido"),
  date: z.string().min(1, "La fecha es requerida"),
  kilometers: z.number().positive("Los km deben ser mayor a 0"),
  value: z.number().nonnegative("El valor no puede ser negativo").optional(),
  currency: z.enum(["BRL", "USD", "UYU"]).optional(),
  notes: z.string().min(1, "Las notas son requeridas"),
});

type MaintenanceFormValues = z.infer<typeof maintenanceSchema>;

const typeItems = [
  { label: "Preventivo", value: "Preventive" },
  { label: "Correctivo", value: "Corrective" },
];

const currencyItems = [
  { label: "BRL — Real brasileño", value: "BRL" },
  { label: "USD — Dólar", value: "USD" },
  { label: "UYU — Peso uruguayo", value: "UYU" },
];

export default function EditMaintenanceForm({
  maintenance,
  trucks,
  concepts,
  onSuccess,
}: {
  maintenance: Maintenance;
  trucks: Truck[];
  concepts: MaintenanceConcept[];
  onSuccess: (maintenance: Maintenance) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    watch,
    handleSubmit,
    register: formRegister,
    formState: { errors },
    setError,
  } = useForm<MaintenanceFormValues>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      maintenanceConceptId: maintenance.conceptId,
      type: maintenance.type,
      truckId: maintenance.truckId,
      date: maintenance.date,
      kilometers: maintenance.kilometers,
      value: maintenance.value || 0,
      currency: (maintenance.currency as any) || "BRL",
      notes: maintenance.notes || "",
    },
  });

  const value = watch("value");

  const onSubmit = async (data: MaintenanceFormValues) => {
    setIsLoading(true);
    try {
      const payload: CreateMaintenanceDto = {
        type: typeMap[data.type],
        notes: data.notes,
        value: data.value && data.value > 0 ? data.value : undefined,
        currency: data.currency ? currencyMap[data.currency] : undefined,
        date: data.date + "T00:00:00Z",
        kilometers: data.kilometers,
        truckId: data.truckId,
        maintenanceConceptId: data.maintenanceConceptId,
      };

      const res = await fetchWithAuth(`/api/maintenances/${maintenance.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || error.title || JSON.stringify(error) || "Error al actualizar mantenimiento");
      }

      const updated = await res.json();
      toast.success("Mantenimiento actualizado");
      onSuccess(updated);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al actualizar mantenimiento";
      toast.error(message);
      setError("root", { message });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* CONCEPTO */}
      <Field>
        <Label>Concepto *</Label>
        <Controller
          name="maintenanceConceptId"
          control={control}
          render={({ field }) => {
            const selectedConcept = concepts.find((c) => c.id === field.value);
            return (
              <Select value={field.value || ""} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar concepto">
                    {selectedConcept ? selectedConcept.name : "Seleccionar concepto"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {concepts.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            );
          }}
        />
        {errors.maintenanceConceptId && (
          <FieldError>{errors.maintenanceConceptId.message}</FieldError>
        )}
      </Field>

      {/* TIPO */}
      <Field>
        <Label>Tipo *</Label>
        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <Select value={field.value || ""} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo">
                  {field.value
                    ? typeItems.find((item) => item.value === field.value)
                        ?.label
                    : "Seleccionar tipo"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {typeItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        />
        {errors.type && <FieldError>{errors.type.message}</FieldError>}
      </Field>

      {/* CAMIÓN */}
      <Field>
        <Label>Camión *</Label>
        <Controller
          name="truckId"
          control={control}
          render={({ field }) => {
            const selectedTruck = trucks.find((t) => t.id === field.value);
            return (
              <Select value={field.value || ""} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar camión">
                    {selectedTruck
                      ? `${selectedTruck.licensePlate}${
                          selectedTruck.model ? ` - ${selectedTruck.model}` : ""
                        }`
                      : "Seleccionar camión"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {trucks.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.licensePlate}
                        {t.model ? ` - ${t.model}` : ""}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            );
          }}
        />
        {errors.truckId && <FieldError>{errors.truckId.message}</FieldError>}
      </Field>

      {/* FECHA */}
      <Field>
        <Label>Fecha *</Label>
        <Controller
          name="date"
          control={control}
          render={({ field }) => (
            <Input type="date" {...field} />
          )}
        />
        {errors.date && <FieldError>{errors.date.message}</FieldError>}
      </Field>

      {/* KM */}
      <Field>
        <Label>Kilómetros *</Label>
        <Input
          type="number"
          placeholder="0"
          {...formRegister("kilometers", {
            setValueAs: (v: any) => (v === "" ? 0 : Number(v)),
          })}
        />
        {errors.kilometers && (
          <FieldError>{errors.kilometers.message}</FieldError>
        )}
      </Field>

      {/* VALOR */}
      <Field>
        <Label>Valor (opcional)</Label>
        <Input
          type="number"
          placeholder="0"
          {...formRegister("value", {
            setValueAs: (v: any) => (v === "" ? 0 : Number(v)),
          })}
        />
        {errors.value && <FieldError>{errors.value.message}</FieldError>}
      </Field>

      {/* MONEDA */}
      {value && value > 0 && (
        <Field>
          <Label>Moneda</Label>
          <Controller
            name="currency"
            control={control}
            render={({ field }) => (
              <Select value={field.value || "BRL"} onValueChange={field.onChange}>
                <SelectTrigger>
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
          {errors.currency && (
            <FieldError>{errors.currency.message}</FieldError>
          )}
        </Field>
      )}

      {/* NOTAS */}
      <Field>
        <Label>Notas *</Label>
        <Controller
          name="notes"
          control={control}
          render={({ field }) => (
            <Textarea
              placeholder="Detalles del mantenimiento"
              {...field}
            />
          )}
        />
        {errors.notes && <FieldError>{errors.notes.message}</FieldError>}
      </Field>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Guardando..." : "Actualizar mantenimiento"}
      </Button>
    </form>
  );
}
