"use client";

import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "./data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { fetchWithAuth } from "@/lib/api";
import { getColumns, Trip } from "./columns";
import { useDateFilter } from "@/context/date-filter-context";
import AddTripForm from "./AddTripForm";
import EditTripForm from "./EditTripForm";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Truck = {
  id: string;
  licensePlate: string;
  model?: string;
};

const tripStatusItems = [
  { label: "Todos los estados", value: "all" },
  { label: "Programado", value: "1" },
  { label: "En progreso", value: "2" },
  { label: "Completado", value: "3" },
  { label: "Cancelado", value: "4" },
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
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);

  const [selectedTruckId, setSelectedTruckId] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const { selectedDate } = useDateFilter();

  // ================= FETCH =================
  useEffect(() => {
    fetchTrips();
    fetchTrucks();
  }, []);

  const fetchTrucks = async () => {
    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/trucks`,
        { method: "GET" }
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      setTrucks(data);
    } catch {
      toast.error("Error al cargar camiones", { position: "bottom-right", richColors: true });
    }
  };

  const fetchTrips = async () => {
    setIsLoading(true);
    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/trips`,
        { method: "GET" }
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      setTrips(data);
    } catch {
      toast.error("Error al cargar viajes", { position: "bottom-right", richColors: true });
    } finally {
      setIsLoading(false);
    }
  };

  // ================= DERIVADOS =================
  const filteredTrips = useMemo(() => {
    return trips.filter((trip) => {
      if (selectedDate) {
        const date = new Date(trip.departureDate);
        if (
          date.getMonth() !== selectedDate.getMonth() ||
          date.getFullYear() !== selectedDate.getFullYear()
        )
          return false;
      }
      if (selectedTruckId && trip.truckId !== selectedTruckId) return false;
      if (selectedStatus !== null && String(trip.status) !== selectedStatus)
        return false;
      return true;
    });
  }, [trips, selectedDate, selectedTruckId, selectedStatus]);

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
        `${process.env.NEXT_PUBLIC_API_URL}/api/trips/${trip.id}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error();

      setTrips((prev) => prev.filter((t) => t.id !== trip.id));
      toast.success("Viaje eliminado", { position: "bottom-right", richColors: true });
    } catch {
      toast.error("Error al eliminar viaje", { position: "bottom-right", richColors: true });
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
  const truckItems = useMemo(
    () => [
      { label: "Todos los camiones", value: "all" },
      ...trucks.map((t) => ({
        label: t.licensePlate,
        value: t.id,
      })),
    ],
    [trucks]
  );

  // ================= UI =================
  return (
    <div className="p-6 flex flex-col gap-4">
      <div className="flex justify-between">
        <h1 className="text-xl font-bold">Viajes</h1>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger render={<Button variant="outline">Añadir viaje</Button>}>
          </DialogTrigger>

          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Agregar viaje</DialogTitle>
              <DialogDescription>
                Registrá un nuevo viaje.
              </DialogDescription>
            </DialogHeader>

            <AddTripForm
              trucks={trucks}
              onSuccess={handleAddTrip}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* FILTERS */}
      <div className="flex gap-2">
        <Select
          items={truckItems}
          value={selectedTruckId ?? "all"}
          onValueChange={(value) =>
            setSelectedTruckId(value === "all" ? null : value)
          }
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Todos los camiones" />
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

        <Select
          items={tripStatusItems}
          value={selectedStatus ?? "all"}
          onValueChange={(value) =>
            setSelectedStatus(value === "all" ? null : value)
          }
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Todos los estados" />
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
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Total de viajes</p>
          <p className="text-2xl font-bold">{totalTrips}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Kilómetros totales</p>
          <p className="text-2xl font-bold">{totalKm.toLocaleString("es-UY")} km</p>
        </div>
      </div>

      {/* EDIT DIALOG */}
      <Dialog
        open={!!editingTrip}
        onOpenChange={(open) => {
          if (!open) setEditingTrip(null);
        }}
      >
        <DialogContent className="sm:max-w-sm">
          {editingTrip && (
            <EditTripForm
              trip={editingTrip}
              trucks={trucks}
              onSuccess={handleUpdateTrip}
            />
          )}
        </DialogContent>
      </Dialog>

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
