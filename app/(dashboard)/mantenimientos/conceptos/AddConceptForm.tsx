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
import { fetchWithAuth } from "@/lib/api";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import type { MaintenanceConcept, CreateMaintenanceConceptDto } from "@/types/maintenance";
import type { ExpenseCategory } from "@/types/expense-category";
import { useState } from "react";

const conceptSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  kilometerInterval: z.number().positive().optional().nullable(),
  dateInterval: z.number().positive().optional().nullable(),
  expenseCategoryId: z
    .string()
    .nullable()
    .refine((v) => v !== null, { message: "La categoría es requerida" }),
});

type ConceptFormValues = z.infer<typeof conceptSchema>;

export default function AddConceptForm({
  categories,
  onSuccess,
}: {
  categories: ExpenseCategory[];
  onSuccess: (concept: MaintenanceConcept) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const categoryItems = categories.map((c) => ({ label: c.name, value: c.id }));

  const {
    control,
    handleSubmit,
    reset,
    register: formRegister,
    formState: { errors },
    setError,
  } = useForm({
    resolver: zodResolver(conceptSchema),
    defaultValues: {
      name: "",
      kilometerInterval: undefined,
      dateInterval: undefined,
      expenseCategoryId: null as string | null,
    },
  });

  const onSubmit = async (data: ConceptFormValues) => {
    setIsLoading(true);
    try {
      const payload: CreateMaintenanceConceptDto = {
        name: data.name,
        kilometerInterval: data.kilometerInterval ?? null,
        dateInterval: data.dateInterval ?? null,
        expenseCategoryId: data.expenseCategoryId!,
      };

      const res = await fetchWithAuth("/api/maintenances/concepts", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || error.title || JSON.stringify(error) || "Error al crear concepto");
      }

      const newConcept = await res.json();
      toast.success("Concepto creado");
      reset();
      onSuccess(newConcept);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al crear concepto";
      toast.error(message);
      setError("root", { message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* NOMBRE */}
      <Field>
        <Label>Nombre del concepto *</Label>
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <Input
              placeholder="Ej: Cambio de aceite"
              {...field}
            />
          )}
        />
        {errors.name && <FieldError>{errors.name.message}</FieldError>}
      </Field>

      {/* CATEGORÍA */}
      <Field>
        <Label>Categoría del gasto *</Label>
        <Controller
          name="expenseCategoryId"
          control={control}
          render={({ field }) => (
            <Select
              items={categoryItems}
              value={field.value ?? null}
              onValueChange={(v) => field.onChange(v || null)}
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
        {errors.expenseCategoryId && (
          <FieldError>{errors.expenseCategoryId.message}</FieldError>
        )}
      </Field>

      {/* INTERVALO KM */}
      <Field>
        <Label>Intervalo km (opcional)</Label>
        <Input
          type="number"
          placeholder="Ej: 10000"
          {...formRegister("kilometerInterval", {
            setValueAs: (v: any) => (v === "" ? undefined : Number(v)),
          })}
        />
        {errors.kilometerInterval && (
          <FieldError>{errors.kilometerInterval.message}</FieldError>
        )}
      </Field>

      {/* INTERVALO DÍAS */}
      <Field>
        <Label>Intervalo días (opcional)</Label>
        <Input
          type="number"
          placeholder="Ej: 30"
          {...formRegister("dateInterval", {
            setValueAs: (v: any) => (v === "" ? undefined : Number(v)),
          })}
        />
        {errors.dateInterval && (
          <FieldError>{errors.dateInterval.message}</FieldError>
        )}
      </Field>

      {errors.root && (
        <FieldError>{(errors.root as any).message}</FieldError>
      )}

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Guardando..." : "Crear concepto"}
      </Button>
    </form>
  );
}
