"use client";

import { SheetFormActions } from "@/components/sheet-form-actions";
import { useTruckTrips, type TruckTripOption } from "@/components/trip-field";
import { fetchWithAuth } from "@/lib/api";
import type { Truck } from "@/types/truck";
import type { Client } from "@/types/client";
import type { Receivable } from "@/types/receivable";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import {
  DEFAULT_DRIVER_SALARY_PERCENTAGE,
  NEW_TRIP,
  ReceivableFormFields,
  receivableSchema,
  toReceivablePayload,
  todayIso,
  useSalaryCategoryId,
  type ReceivableFormValues,
} from "./ReceivableFormFields";

export default function AddReceivableForm({
  clients,
  trucks,
  onSuccess,
}: {
  clients: Client[];
  trucks: Truck[];
  onSuccess: (receivable: Receivable) => void;
}) {
  const salaryCategoryId = useSalaryCategoryId();
  // Mientras el usuario no elija el viaje a mano, se le sugiere uno al cambiar de camión.
  const [tripTouched, setTripTouched] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ReceivableFormValues>({
    resolver: zodResolver(receivableSchema),
    defaultValues: {
      clientId: "",
      truckId: "",
      tripChoice: NEW_TRIP,
      origin: "",
      destination: "",
      dateUtc: todayIso(),
      currency: "BRL",
      tollAmount: 0,
      driverSalaryPercentage: DEFAULT_DRIVER_SALARY_PERCENTAGE,
      notes: "",
    },
  });

  const trips = useTruckTrips(watch("truckId"));

  // Elegir un viaje existente trae su ruta y su fecha: la fila de la planilla y el viaje
  // son el mismo flete.
  const applyTrip = (trip: TruckTripOption | undefined) => {
    setValue("tripChoice", trip?.id ?? NEW_TRIP);
    if (!trip) return;
    setValue("origin", trip.origin, { shouldValidate: true });
    setValue("destination", trip.destination, { shouldValidate: true });
    setValue("dateUtc", trip.departureDate.split("T")[0]);
  };

  // El caso "mañana sale el camión": el viaje se creó antes para esperar los km. Si el
  // camión tiene un viaje en curso o programado sin cuenta, se propone ese.
  useEffect(() => {
    if (tripTouched) return;
    const pending = trips.find(
      (t) => !t.receivableId && (t.status === "Scheduled" || t.status === "InProgress"),
    );
    if (pending) {
      applyTrip(pending);
    } else if (getValues("tripChoice") !== NEW_TRIP) {
      setValue("tripChoice", NEW_TRIP);
    }
    // applyTrip/getValues/setValue son estables en la práctica; el efecto depende de la lista.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trips, tripTouched]);

  async function onSubmit(data: ReceivableFormValues) {
    try {
      const res = await fetchWithAuth(`/api/receivables`, {
        method: "POST",
        body: JSON.stringify(toReceivablePayload(data, salaryCategoryId)),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.message || e.title || "Error al crear la cuenta a recibir");
      }
      toast.success("Cuenta a recibir creada");
      onSuccess(await res.json());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al crear la cuenta a recibir");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <ReceivableFormFields
        control={control}
        register={register}
        setValue={setValue}
        errors={errors}
        clients={clients}
        trucks={trucks}
        tollAmount={watch("tollAmount")}
        trips={trips}
        onTruckChange={() => {
          // Con otro camión, el viaje elegido deja de servir: vuelve a sugerirse.
          setValue("tripChoice", NEW_TRIP);
          setTripTouched(false);
        }}
        onTripChoice={(value) => {
          setTripTouched(true);
          applyTrip(trips.find((t) => t.id === value));
        }}
      />

      <SheetFormActions submitLabel="Crear cuenta a recibir" isSubmitting={isSubmitting} />
    </form>
  );
}
