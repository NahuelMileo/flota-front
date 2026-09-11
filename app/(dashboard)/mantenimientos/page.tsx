"use client";

import { Button } from "@/components/ui/button";
import { TruckIcon, Wrench } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import { useMaintenanceConcepts } from "@/hooks/use-maintenance-concepts";
import { getColumns, MaintenanceRow } from "./columns";
import AddMaintenanceForm from "./AddMaintenanceForm";
import EditMaintenanceForm from "./EditMaintenanceForm";
import { useDateFilter } from "@/context/date-filter-context";
import { useCurrency } from "@/context/currency-context";
import type { Maintenance, MaintenanceConcept } from "@/types/maintenance";
import { Skeleton } from "@/components/ui/skeleton";
import { FilterSelect } from "@/components/filter-select";
import { Settings } from "lucide-react";
import Link from "next/link";

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

export default function MaintenancePage() {
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const trucks = useTrucks();
  const { concepts } = useMaintenanceConcepts();
  const [isLoading, setIsLoading] = useState(false);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingMaintenance, setEditingMaintenance] =
    useState<Maintenance | null>(null);

  const [selectedTruckId, setSelectedTruckId] = useState<string | null>(null);
  const [selectedConceptId, setSelectedConceptId] = useState<string | null>(
    null
  );

  const { selectedDate } = useDateFilter();
  const { displayCurrency } = useCurrency();

  // ================= FETCH =================
  useEffect(() => {
    fetchMaintenances();
  }, []);

  const fetchMaintenances = async () => {
    setIsLoading(true);
    try {
      const res = await fetchWithAuth(`/api/maintenances`, {
        method: "GET",
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setMaintenances(data);
    } catch {
      toast.error("Error al cargar mantenimientos");
    } finally {
      setIsLoading(false);
    }
  };

  // ================= DERIVADOS =================
  const filteredMaintenances = useMemo(() => {
    return maintenances.filter((maintenance) => {
      if (selectedDate) {
        const date = new Date(maintenance.date);
        if (
          date.getUTCMonth() !== selectedDate.getMonth() ||
          date.getUTCFullYear() !== selectedDate.getFullYear()
        )
          return false;
      }
      if (selectedTruckId && maintenance.truckId !== selectedTruckId)
        return false;
      if (selectedConceptId && maintenance.maintenanceConceptId !== selectedConceptId)
        return false;
      return true;
    });
  }, [maintenances, selectedDate, selectedTruckId, selectedConceptId]);

  const maintenanceRows: MaintenanceRow[] = useMemo(() => {
    return filteredMaintenances.map((m) => ({
      ...m,
      concept:
        concepts.find((c) => c.id === m.maintenanceConceptId) ||
        ({} as MaintenanceConcept),
    }));
  }, [filteredMaintenances, concepts]);

  // ================= CRUD =================
  const handleAddMaintenance = (newMaintenance: Maintenance) => {
    setMaintenances((prev) => [...prev, newMaintenance]);
    setIsAddDialogOpen(false);
  };

  const handleUpdateMaintenance = (updated: Maintenance) => {
    setMaintenances((prev) =>
      prev.map((m) => (m.id === updated.id ? updated : m))
    );
    setEditingMaintenance(null);
  };

  const handleDeleteMaintenance = useCallback(async (maintenance: Maintenance) => {
    try {
      const res = await fetchWithAuth(
        `/api/maintenances/${maintenance.id}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error();

      setMaintenances((prev) => prev.filter((m) => m.id !== maintenance.id));
      toast.success("Mantenimiento eliminado");
    } catch {
      toast.error("Error al eliminar mantenimiento");
    }
  }, []);

  const columns = useMemo(
    () =>
      getColumns(
        (maintenance) => setEditingMaintenance(maintenance),
        handleDeleteMaintenance,
        displayCurrency
      ),
    [handleDeleteMaintenance, displayCurrency]
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
          label="Concepto"
          icon={Wrench}
          value={selectedConceptId}
          onChange={setSelectedConceptId}
          options={concepts.map((c) => ({ label: c.name, value: c.id }))}
          allLabel="Todos"
        />
        <div className="ml-auto flex items-center gap-2">
          <Link href="/mantenimientos/conceptos">
            <Button variant="outline" className="gap-2">
              <Settings className="h-4 w-4" />
              Conceptos
            </Button>
          </Link>

          <Sheet open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <SheetTrigger render={<Button>Agregar mantenimiento</Button>} />

            <SheetContent className="overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Agregar mantenimiento</SheetTitle>
                <SheetDescription>
                  Registrá un nuevo mantenimiento para tu flota.
                </SheetDescription>
              </SheetHeader>

              <div className="px-4 pb-6">
                <AddMaintenanceForm
                  trucks={trucks}
                  concepts={concepts}
                  onSuccess={handleAddMaintenance}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* EDIT SHEET */}
      <Sheet
        open={!!editingMaintenance}
        onOpenChange={(open) => {
          if (!open) setEditingMaintenance(null);
        }}
      >
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Editar mantenimiento</SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-6">
            {editingMaintenance && (
              <EditMaintenanceForm
                maintenance={editingMaintenance}
                trucks={trucks}
                concepts={concepts}
                onSuccess={handleUpdateMaintenance}
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
          data={maintenanceRows}
          emptyMessage="No hay mantenimientos para el período seleccionado."
          searchPlaceholder="Buscar mantenimiento..."
        />
      )}
    </div>
  );
}
