"use client";

import { SheetFormActions } from "@/components/sheet-form-actions";
import { fetchWithAuth } from "@/lib/api";
import type { Truck } from "@/types/truck";
import type { Client } from "@/types/client";
import type { Receivable } from "@/types/receivable";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  ReceivableFormFields,
  receivableSchema,
  useActiveTrip,
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
  // En edición la cuenta ya tiene (o no) su viaje: no se vuelve a sugerir el activo,
  // que podría ser otro distinto del que se vinculó al crearla.
  const { activeTrip, setActiveTrip, fetchActiveTrip } = useActiveTrip(false);

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
      dateUtc: receivable.dateUtc.split("T")[0],
      currency: receivable.currency as ReceivableFormValues["currency"],
      freightValue: receivable.freightValue,
      advanceAmount: receivable.advanceAmount,
      balanceAmount: receivable.balanceAmount,
      tollAmount: receivable.tollAmount,
      notes: receivable.notes ?? "",
    },
  });

  async function onSubmit(data: ReceivableFormValues) {
    try {
      const res = await fetchWithAuth(`/api/receivables/${receivable.id}`, {
        method: "PUT",
        body: JSON.stringify({
          ...data,
          notes: data.notes?.trim() ? data.notes.trim() : null,
          tripId: receivable.tripId,
        }),
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

      <ReceivableFormFields
        control={control}
        register={register}
        setValue={setValue}
        errors={errors}
        clients={clients}
        trucks={trucks}
        freightValue={watch("freightValue")}
        tollAmount={watch("tollAmount")}
        activeTrip={activeTrip}
        onTruckChange={(truckId) => {
          setActiveTrip(null);
          fetchActiveTrip(truckId);
        }}
      />

      <SheetFormActions submitLabel="Guardar cambios" isSubmitting={isSubmitting} />
    </form>
  );
}
