"use client";

import { Button } from "@/components/ui/button";
import { CircleDot, TruckIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/data-table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import { fetchWithAuth } from "@/lib/api";
import { useTrucks } from "@/hooks/use-trucks";
import { getColumns, Trip } from "./columns";
import { useDateFilter } from "@/context/date-filter-context";
import AddTripForm from "./AddTripForm";
import EditTripForm from "./EditTripForm";
import { Skeleton } from "@/components/ui/skeleton";
import { FilterSelect } from "@/components/filter-select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";


const tripStatusOptions = [
  { label: "Programado", value: "Scheduled" },
  { label: "En progreso", value: "InProgress" },
  { label: "Completado", value: "Completed" },
  { label: "Cancelado", value: "Cancelled" },
];

function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-md border">
      <div className="p-4 space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    </div>
  );
}

export default function TripsPage() {
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const trucks = useTrucks();
  const [isLoading, setIsLoading] = useState(false);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);

  const [selectedTruckId, setSelectedTruckId] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [showOpenOnly, setShowOpenOnly] = useState(false);

  const { selectedDate } = useDateFilter();

  const fetchTrips = useCallback(async () => {
    setIsLoading(true);
    try {
      const query = selectedDate
        ? `?month=${selectedDate.getMonth() + 1}&year=${selectedDate.getFullYear()}`
        : "";
      const res = await fetchWithAuth(
        `/api/trips${query}`,
        { method: "GET" }
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      setTrips(data);
    } catch {
      toast.error("Error al cargar viajes");
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

  // ================= FETCH =================
  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  // ================= DERIVADOS =================
  // El backend ya filtra por mes/año (mantiene siempre visibles los viajes
  // InProgress/Scheduled sin importar el mes pedido); acá solo quedan los
  // filtros que no disparan un nuevo fetch.
  const filteredTrips = useMemo(() => {
    return trips.filter((trip) => {
      if (showOpenOnly && trip.status !== "InProgress") return false;
      if (selectedTruckId && trip.truckId !== selectedTruckId) return false;
      if (selectedStatus !== null && String(trip.status) !== selectedStatus)
        return false;
      return true;
    });
  }, [trips, selectedTruckId, selectedStatus, showOpenOnly]);

  const totalTrips = useMemo(() => filteredTrips.length, [filteredTrips]);
  const totalKm = useMemo(
    () => filteredTrips.reduce((acc, t) => acc + (t.kilometers ?? 0), 0),
    [filteredTrips]
  );

  // ================= CRUD =================
  const handleAddTrip = (newTrip: Trip) => {
    setTrips((prev) => [...prev, newTrip]);
    setIsAddDialogOpen(false);
  };

  const handleUpdateTrip = (updated: Trip) => {
    setTrips((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setEditingTrip(null);
  };

  const handleDeleteTrip = useCallback(async (trip: Trip) => {
    try {
      const res = await fetchWithAuth(
        `/api/trips/${trip.id}`,
        { method: "DELETE" }
      );
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || e.title || "Error al eliminar viaje"); }

      setTrips((prev) => prev.filter((t) => t.id !== trip.id));
      toast.success("Viaje eliminado");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al eliminar viaje");
    }
  }, []);

  const columns = useMemo(
    () => getColumns(
      (trip) => router.push(`/trips/${trip.id}`),
      (trip) => setEditingTrip(trip),
      handleDeleteTrip
    ),
    [handleDeleteTrip, router]
  );

  // ================= FILTER OPTIONS =================

  // ================= UI =================
  return (
    <div className="p-6 flex flex-col gap-4">
      {/* FILTERS */}
      <div className="flex flex-wrap items-center gap-1">
        <FilterSelect
          label="Camión"
          icon={TruckIcon}
          value={selectedTruckId}
          onChange={setSelectedTruckId}
          options={trucks.map((t) => ({ label: t.licensePlate, value: t.id }))}
          allLabel="Todos"
        />
        <FilterSelect
          label="Estado"
          icon={CircleDot}
          value={selectedStatus}
          onChange={setSelectedStatus}
          options={tripStatusOptions}
          allLabel="Todos"
        />
        <div className="ml-1 flex items-center gap-2">
          <Checkbox
            id="open-trips"
            checked={showOpenOnly}
            onCheckedChange={(checked) => setShowOpenOnly(!!checked)}
          />
          <Label htmlFor="open-trips" className="cursor-pointer text-sm text-muted-foreground">
            Solo viajes abiertos
          </Label>
        </div>
        <Sheet open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <SheetTrigger render={<Button className="ml-auto">Añadir viaje</Button>} />

          <SheetContent className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Agregar viaje</SheetTitle>
              <SheetDescription>
                Registrá un nuevo viaje.
              </SheetDescription>
            </SheetHeader>

            <div className="px-4 pb-6">
              <AddTripForm
                trucks={trucks}
                onSuccess={handleAddTrip}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Cantidad y kilómetros son metadatos de la tabla de abajo, no métricas que
          merezcan una caja cada una: van como una línea de contexto sobre la grilla. */}
      <p className="text-sm text-muted-foreground tabular-nums">
        {totalTrips} {totalTrips === 1 ? "viaje" : "viajes"}
        {totalKm > 0 && <> · {totalKm.toLocaleString("es-UY")} km recorridos</>}
      </p>

      {/* EDIT SHEET */}
      <Sheet
        open={!!editingTrip}
        onOpenChange={(open) => {
          if (!open) setEditingTrip(null);
        }}
      >
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Editar viaje</SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-6">
            {editingTrip && (
              <EditTripForm
                trip={editingTrip}
                trucks={trucks}
                onSuccess={handleUpdateTrip}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>

      {isLoading ? (
        <TableSkeleton />
      ) : (
        <DataTable
          columns={columns}
          data={filteredTrips}
          emptyMessage="No hay viajes para el período seleccionado."
          searchPlaceholder="Buscar viaje..."
        />
      )}
    </div>
  );
}
