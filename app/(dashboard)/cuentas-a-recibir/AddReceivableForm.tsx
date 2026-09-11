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
  todayIso,
  useActiveTrip,
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
  const { activeTrip, setActiveTrip, fetchActiveTrip } = useActiveTrip(true);

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
      clientId: "",
      truckId: "",
      dateUtc: todayIso(),
      currency: "BRL",
      tollAmount: 0,
      notes: "",
    },
  });

  async function onSubmit(data: ReceivableFormValues) {
    try {
      const res = await fetchWithAuth(`/api/receivables`, {
        method: "POST",
        body: JSON.stringify({
          ...data,
          notes: data.notes?.trim() ? data.notes.trim() : null,
          tripId: activeTrip?.id ?? null,
        }),
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
        freightValue={watch("freightValue")}
        tollAmount={watch("tollAmount")}
        activeTrip={activeTrip}
        onTruckChange={(truckId) => {
          // Limpiar antes de refetchear: si se envía el form mientras el fetch está en
          // curso, no debe quedar pegado el viaje del camión anterior.
          setActiveTrip(null);
          fetchActiveTrip(truckId);
        }}
      />

      <SheetFormActions submitLabel="Crear cuenta a recibir" isSubmitting={isSubmitting} />
    </form>
  );
}
