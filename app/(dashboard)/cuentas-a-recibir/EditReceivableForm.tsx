"use client";

import { SheetFormActions } from "@/components/sheet-form-actions";
import { useTruckTrips } from "@/components/trip-field";
import { fetchWithAuth } from "@/lib/api";
import type { Truck } from "@/types/truck";
import type { Client } from "@/types/client";
import { parseRouteFromNotes, type Receivable } from "@/types/receivable";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  NEW_TRIP,
  ReceivableFormFields,
  receivableSchema,
  toReceivablePayload,
  useSalaryCategoryId,
  type ReceivableFormValues,
} from "./ReceivableFormFields";

export default function EditReceivableForm({
  receivable,
  clients,
  trucks,
  onSuccess,
}: {
  receivable: Receivable;
  clients: Client[];
  trucks: Truck[];
  onSuccess: (receivable: Receivable) => void;
}) {
  const salaryCategoryId = useSalaryCategoryId();
  // Las cuentas cargadas antes de la regla 1 a 1 no tienen viaje: la ruta solía ir en las
  // notas ("SPxMdeo"), así que se propone separada para crearles el viaje al guardar.
  const legacyRoute = receivable.tripId ? null : parseRouteFromNotes(receivable.notes);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ReceivableFormValues>({
    resolver: zodResolver(receivableSchema),
    defaultValues: {
      clientId: receivable.clientId,
      truckId: receivable.truckId,
      tripChoice: receivable.tripId ?? NEW_TRIP,
      origin: receivable.origin ?? legacyRoute?.origin ?? "",
      destination: receivable.destination ?? legacyRoute?.destination ?? "",
      dateUtc: receivable.dateUtc.split("T")[0],
      currency: receivable.currency as ReceivableFormValues["currency"],
      freightValue: receivable.freightValue,
      advanceAmount: receivable.advanceAmount,
      balanceAmount: receivable.balanceAmount,
      tollAmount: receivable.tollAmount,
      driverSalaryPercentage: receivable.driverSalaryPercentage,
      // Si la ruta salió de las notas, ya no hace falta repetirla ahí.
      notes: legacyRoute ? "" : (receivable.notes ?? ""),
    },
  });

  const trips = useTruckTrips(watch("truckId"));

  async function onSubmit(data: ReceivableFormValues) {
    try {
      const res = await fetchWithAuth(`/api/receivables/${receivable.id}`, {
        method: "PUT",
        // El salario existente conserva su categoría; la default solo aplica si se crea.
        body: JSON.stringify(
          toReceivablePayload(data, receivable.driverSalaryExpenseId ? null : salaryCategoryId),
        ),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.message || e.title || "Error al actualizar la cuenta a recibir");
      }
      toast.success("Cuenta a recibir actualizada");
      onSuccess(await res.json());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al actualizar la cuenta a recibir");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {receivable.collectedAmount > 0 && (
        <p className="mb-4 rounded-md border border-warning-border bg-warning-surface p-3 text-xs text-warning">
          Esta cuenta ya tiene cobros registrados. Si cambiás los montos, los ingresos
          generados se actualizan para coincidir.
        </p>
      )}
      {!receivable.tripId && (
        <p className="mb-4 rounded-md border p-3 text-xs text-muted-foreground">
          Esta cuenta se cargó sin viaje. Al guardar con origen y destino se crea su viaje, y
          los cobros ya registrados pasan a sumar a ese viaje.
        </p>
      )}

      <ReceivableFormFields
        control={control}
        register={register}
        setValue={setValue}
        errors={errors}
        clients={clients}
        trucks={trucks}
        tollAmount={watch("tollAmount")}
        trips={trips}
        receivableId={receivable.id}
        onTruckChange={() => {
          // El viaje propio se mueve con la cuenta (si no tiene km propios); otro viaje
          // elegido de un camión distinto deja de servir.
          if (watch("tripChoice") !== receivable.tripId) {
            setValue("tripChoice", receivable.tripId ?? NEW_TRIP);
          }
        }}
        onTripChoice={(value) => {
          setValue("tripChoice", value);
          const trip = trips.find((t) => t.id === value);
          if (!trip || trip.id === receivable.tripId) return;
          setValue("origin", trip.origin, { shouldValidate: true });
          setValue("destination", trip.destination, { shouldValidate: true });
          setValue("dateUtc", trip.departureDate.split("T")[0]);
        }}
        salaryHint={
          receivable.driverSalaryExpenseId
            ? "Se recalcula al guardar. Para quitarlo, borrá el egreso en Egresos."
            : undefined
        }
      />

      <SheetFormActions submitLabel="Guardar cambios" isSubmitting={isSubmitting} />
    </form>
  );
}
