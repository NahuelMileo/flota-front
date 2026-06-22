"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchWithAuth } from "@/lib/api";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import type { MaintenanceConcept, CreateMaintenanceConceptDto } from "@/types/maintenance";
import { useState } from "react";

const conceptSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  kilometerInterval: z.number().positive().optional().nullable(),
  dateInterval: z.number().positive().optional().nullable(),
}).refine(
  (data) => !!data.kilometerInterval || !!data.dateInterval,
  {
    message: "Debe especificar al menos un intervalo (km o días)",
  }
);

type ConceptFormValues = z.infer<typeof conceptSchema>;

export default function EditConceptForm({
  concept,
  onSuccess,
}: {
  concept: MaintenanceConcept;
  onSuccess: (concept: MaintenanceConcept) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    register: formRegister,
    formState: { errors },
    setError,
  } = useForm<ConceptFormValues>({
    resolver: zodResolver(conceptSchema),
    defaultValues: {
      name: concept.name,
      kilometerInterval: concept.kilometerInterval || undefined,
      dateInterval: concept.dateInterval || undefined,
    },
  });

  const onSubmit = async (data: ConceptFormValues) => {
    setIsLoading(true);
    try {
      const payload: CreateMaintenanceConceptDto = {
        name: data.name,
        kilometerInterval: data.kilometerInterval ?? null,
        dateInterval: data.dateInterval ?? null,
      };

      const res = await fetchWithAuth(
        `/api/maintenances/concepts/${concept.id}`,
        {
          method: "PUT",
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || error.title || JSON.stringify(error) || "Error al actualizar concepto");
      }

      const updated = await res.json();
      toast.success("Concepto actualizado");
      onSuccess(updated);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al actualizar concepto";
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
        {isLoading ? "Guardando..." : "Actualizar concepto"}
      </Button>
    </form>
  );
}
