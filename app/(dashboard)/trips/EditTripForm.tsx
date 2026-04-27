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
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Trip } from "./columns";

type Truck = {
  id: string;
  licensePlate: string;
  model?: string;
};

const tripSchema = z.object({
  departureDate: z.string().min(1, "La fecha de salida es requerida"),
  arrivalDate: z.string().min(1, "La fecha de llegada es requerida"),
  origin: z.string().min(1, "El origen es requerido"),
  destination: z.string().min(1, "El destino es requerido"),
  truckId: z.string().min(1, "Seleccioná un camión").refine(
    (v) => v !== "none",
    { message: "Seleccioná un camión" }
  ),
  driverName: z.string().optional(),
  kilometers: z.number().positive("Debe ser mayor a 0").nullable().optional(),
  status: z.enum(["1", "2", "3", "4"]),
  notes: z.string().optional(),
});

type TripFormValues = z.infer<typeof tripSchema>;

const tripStatusItems = [
  { label: "Programado", value: "1" },
  { label: "En progreso", value: "2" },
  { label: "Completado", value: "3" },
  { label: "Cancelado", value: "4" },
];

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
    formState: { errors, isSubmitting },
  } = useForm<TripFormValues>({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      departureDate: trip.departureDate.split("T")[0],
      arrivalDate: trip.arrivalDate.split("T")[0],
      origin: trip.origin,
      destination: trip.destination,
      truckId: trip.truckId ?? "none",
      driverName: trip.driverName ?? "",
      kilometers: trip.kilometers ?? null,
      status: (String(trip.status) as TripFormValues["status"]) ?? "1",
      notes: trip.notes ?? "",
    },
  });

  async function onSubmit(data: TripFormValues) {
    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/trips/${trip.id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            departureDate: data.departureDate,
            arrivalDate: data.arrivalDate,
            origin: data.origin,
            destination: data.destination,
            truckId: data.truckId,
            driverName: data.driverName || null,
            kilometers: data.kilometers ?? null,
            status: parseInt(data.status),
            notes: data.notes || null,
          }),
        },
      );

      if (!res.ok) throw new Error();

      const updated = await res.json();
      toast.success("Viaje actualizado");
      onSuccess(updated);
    } catch {
      toast.error("Error al actualizar");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <Field>
          <Label>Fecha de salida</Label>
          <Input {...register("departureDate")} type="date" />
          <FieldError errors={[errors.departureDate]} />
        </Field>

        <Field>
          <Label>Fecha de llegada</Label>
          <Input {...register("arrivalDate")} type="date" />
          <FieldError errors={[errors.arrivalDate]} />
        </Field>

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

        <Field>
          <Label>Kilómetros (opcional)</Label>
          <Input
            {...register("kilometers", {
              setValueAs: (v) => (v === "" ? null : parseFloat(v)),
            })}
            type="number"
            step="0.01"
            placeholder="480"
          />
          <FieldError errors={[errors.kilometers]} />
        </Field>

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
