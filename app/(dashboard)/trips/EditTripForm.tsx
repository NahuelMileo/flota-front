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
import { Trip } from "./columns";


const tripSchema = z.object({
  departureDate: z.string().min(1, "La fecha de salida es requerida"),
  arrivalDate: z.string().optional(),
  origin: z.string().min(1, "El origen es requerido"),
  destination: z.string().min(1, "El destino es requerido"),
  truckId: z.string().min(1, "Seleccioná un camión").refine(
    (v) => v !== "none",
    { message: "Seleccioná un camión" }
  ),
  driverName: z.string().optional(),
  initialKm: z.number().positive("Debe ser mayor a 0").nullable().optional(),
  finalKm: z.number().positive("Debe ser mayor a 0").nullable().optional(),
  status: z.enum(["1", "2", "3", "4"]),
  notes: z.string().optional(),
}).refine(
  (data) => data.initialKm == null || data.finalKm == null || data.finalKm >= data.initialKm,
  { message: "El km final no puede ser menor al km inicial", path: ["finalKm"] }
);

type TripFormValues = z.infer<typeof tripSchema>;

const tripStatusItems = [
  { label: "Programado", value: "1" },
  { label: "En progreso", value: "2" },
  { label: "Completado", value: "3" },
  { label: "Cancelado", value: "4" },
];

const statusApiToFormValue: Record<string, string> = {
  Scheduled: "1",
  InProgress: "2",
  Completed: "3",
  Cancelled: "4",
};

export default function EditTripForm({
  trip,
  trucks,
  onSuccess,
}: {
  trip: Trip;
  trucks: Truck[];
  onSuccess: (trip: Trip) => void;
}) {
  const truckItems = [
    { label: "Seleccionar camión", value: "none" },
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
  } = useForm<TripFormValues>({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      departureDate: trip.departureDate.split("T")[0],
      arrivalDate: (trip.arrivalDate && !trip.arrivalDate.startsWith("0001-01-01")) ? trip.arrivalDate.split("T")[0] : "",
      origin: trip.origin,
      destination: trip.destination,
      truckId: trip.truckId ?? "none",
      driverName: trip.driverName ?? "",
      initialKm: trip.initialKm ?? null,
      finalKm: trip.finalKm ?? null,
      status: (statusApiToFormValue[trip.status] ?? String(trip.status)) as TripFormValues["status"],
      notes: trip.notes ?? "",
    },
  });

  const watchedInitialKm = watch("initialKm");
  const watchedFinalKm = watch("finalKm");
  const computedKm =
    watchedInitialKm != null && watchedFinalKm != null && watchedFinalKm > watchedInitialKm
      ? watchedFinalKm - watchedInitialKm
      : null;

  async function onSubmit(data: TripFormValues) {
    try {
      const res = await fetchWithAuth(
        `/api/trips/${trip.id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            departureDate: data.departureDate,
            arrivalDate: data.arrivalDate || null,
            origin: data.origin,
            destination: data.destination,
            truckId: data.truckId,
            driverName: data.driverName || null,
            initialKm: data.initialKm ?? null,
            finalKm: data.finalKm ?? null,
            status: parseInt(data.status),
            notes: data.notes || null,
          }),
        },
      );

      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || e.title || "Error al actualizar"); }

      const updated = await res.json();
      toast.success("Viaje actualizado");
      onSuccess(updated);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al actualizar");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <div className="grid grid-cols-2 gap-3">
          <Field>
            <Label>Fecha salida</Label>
            <Input {...register("departureDate")} type="date" />
            <FieldError errors={[errors.departureDate]} />
          </Field>
          <Field>
            <Label>Fecha llegada</Label>
            <Input {...register("arrivalDate")} type="date" />
            <FieldError errors={[errors.arrivalDate]} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field>
            <Label>Origen</Label>
            <Input {...register("origin")} />
            <FieldError errors={[errors.origin]} />
          </Field>
          <Field>
            <Label>Destino</Label>
            <Input {...register("destination")} />
            <FieldError errors={[errors.destination]} />
          </Field>
        </div>

        <Field>
          <Label>Camión</Label>
          <Controller
            name="truckId"
            control={control}
            render={({ field }) => (
              <>
                <Select
                  items={truckItems}
                  value={field.value ?? "none"}
                  onValueChange={(value) => field.onChange(value)}
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
                <FieldError errors={[errors.truckId]} />
              </>
            )}
          />
        </Field>

        <Field>
          <Label>Chofer (opcional)</Label>
          <Input {...register("driverName")} placeholder="Juan Pérez" />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field>
            <Label>Km inicial</Label>
            <Input
              {...register("initialKm", {
                setValueAs: (v) => { if (v === "" || v == null) return null; const n = parseFloat(v); return isNaN(n) ? null : n; },
              })}
              type="number"
              step="0.01"
              placeholder="120000"
            />
            <FieldError errors={[errors.initialKm]} />
          </Field>
          <Field>
            <Label>Km final</Label>
            <Input
              {...register("finalKm", {
                setValueAs: (v) => { if (v === "" || v == null) return null; const n = parseFloat(v); return isNaN(n) ? null : n; },
              })}
              type="number"
              step="0.01"
              placeholder="120480"
            />
            <FieldError errors={[errors.finalKm]} />
          </Field>
        </div>
        {computedKm !== null && (
          <p className="text-sm text-muted-foreground">
            Total: <span className="font-medium text-foreground">{computedKm.toLocaleString("es-UY")} km</span>
          </p>
        )}

        <Field>
          <Label>Estado</Label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select
                items={tripStatusItems}
                value={field.value}
                onValueChange={(value) => field.onChange(value ?? "1")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {tripStatusItems.map((item) => (
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
          <Label>Notas (opcional)</Label>
          <Input {...register("notes")} placeholder="Sin incidentes" />
        </Field>
      </FieldGroup>

      <Button className="mt-4 w-full" type="submit" disabled={isSubmitting}>
        Guardar cambios
      </Button>
    </form>
  );
}
