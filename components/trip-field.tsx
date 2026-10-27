"use client";

import { Field, FieldDescription } from "@/components/ui/field";
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
import { formatDate } from "@/lib/format";
import { useEffect, useMemo, useRef, useState } from "react";

// GET /api/trips/by-truck: los viajes recientes del camión, del más nuevo al más viejo.
// receivableId dice si el viaje ya tiene su cuenta a recibir (FTL: una por viaje).
export type TruckTripOption = {
  id: string;
  departureDate: string;
  origin: string;
  destination: string;
  status: string;
  receivableId: string | null;
};

export const NO_TRIP = "none";

export function tripLabel(trip: Pick<TruckTripOption, "departureDate" | "origin" | "destination">) {
  return `${formatDate(trip.departureDate)} · ${trip.origin} → ${trip.destination}`;
}

// Con FTL los viajes de un camión son consecutivos: cualquier fecha cae en el último
// viaje que salió ese día o antes. Así un gasto cargado tarde, o un viaje ya
// finalizado, se asocia igual al viaje correcto (el "viaje activo" no lo encontraba).
export function tripForDate(trips: TruckTripOption[], date: string | undefined) {
  if (!date) return null;
  return trips.find((t) => t.departureDate.split("T")[0] <= date) ?? null;
}

// La lista se guarda junto con el camión que la pidió: si el camión cambió mientras un
// fetch estaba en vuelo, esa respuesta no se muestra para el camión nuevo.
export function useTruckTrips(truckId: string | null | undefined) {
  const [loaded, setLoaded] = useState<{ truckId: string; trips: TruckTripOption[] } | null>(null);
  const requestId = useRef(0);

  useEffect(() => {
    const current = ++requestId.current;
    if (!truckId || truckId === NO_TRIP) return;
    fetchWithAuth(`/api/trips/by-truck?truckId=${truckId}`)
      .then(async (res) => {
        const trips: TruckTripOption[] = res.ok ? await res.json() : [];
        if (current === requestId.current) setLoaded({ truckId, trips });
      })
      .catch(() => {
        if (current === requestId.current) setLoaded({ truckId, trips: [] });
      });
  }, [truckId]);

  return useMemo(
    () => (loaded && loaded.truckId === truckId ? loaded.trips : EMPTY_TRIPS),
    [loaded, truckId],
  );
}

const EMPTY_TRIPS: TruckTripOption[] = [];

// Viaje de un ingreso o egreso: sigue a la fecha y al camión hasta que el usuario elige
// uno a mano. initialTripId (edición) se respeta mientras no cambie el camión.
export function useTripSelection(
  truckId: string | null | undefined,
  date: string | undefined,
  initial?: { truckId: string | null | undefined; tripId: string | null | undefined },
) {
  const trips = useTruckTrips(truckId);
  const [manual, setManual] = useState<{ truckId: string | null | undefined; tripId: string } | null>(
    initial ? { truckId: initial.truckId, tripId: initial.tripId ?? NO_TRIP } : null,
  );
  const suggested = tripForDate(trips, date);
  const value =
    manual && manual.truckId === truckId ? manual.tripId : (suggested?.id ?? NO_TRIP);

  return {
    trips,
    value,
    tripId: value === NO_TRIP ? null : value,
    setValue: (tripId: string) => setManual({ truckId, tripId }),
  };
}

type TripSelectProps = {
  trips: TruckTripOption[];
  value: string;
  onChange: (value: string) => void;
  // Opciones fijas al principio de la lista ("Sin viaje", "Viaje nuevo").
  leadingItems?: { label: string; value: string }[];
  // Etiqueta del viaje elegido si no está entre los recientes (edición de algo viejo).
  fallbackLabel?: string;
  description?: string;
};

export function TripSelect({
  trips,
  value,
  onChange,
  leadingItems = [{ label: "Sin viaje", value: NO_TRIP }],
  fallbackLabel = "Viaje vinculado",
  description,
}: TripSelectProps) {
  const tripItems = trips.map((t) => ({ label: tripLabel(t), value: t.id }));
  const known = leadingItems.some((i) => i.value === value) || tripItems.some((i) => i.value === value);
  const items = [
    ...leadingItems,
    ...(known ? [] : [{ label: fallbackLabel, value }]),
    ...tripItems,
  ];

  return (
    <Field>
      <Label>Viaje</Label>
      <Select items={items} value={value} onValueChange={(v) => onChange(v ?? NO_TRIP)}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Seleccionar viaje" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {items.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      {description && <FieldDescription>{description}</FieldDescription>}
    </Field>
  );
}
