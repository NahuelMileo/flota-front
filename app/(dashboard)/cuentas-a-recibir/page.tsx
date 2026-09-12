"use client";

import { Button } from "@/components/ui/button";
import { CircleDot, TruckIcon, Users } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DataTable, DataTableSkeleton } from "@/components/data-table";
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
import { useClients } from "@/hooks/use-clients";
import { CollectingReceivableContext, getColumns } from "./columns";
import { ReceivablesSummary } from "@/components/receivables-summary";
import { useDateFilter } from "@/context/date-filter-context";
import { useCurrency } from "@/context/currency-context";
import AddReceivableForm from "./AddReceivableForm";
import EditReceivableForm from "./EditReceivableForm";
import { Skeleton } from "@/components/ui/skeleton";
import { Refreshing } from "@/components/refreshing";
import { FilterSelect } from "@/components/filter-select";
import {
  RECEIVABLE_ITEM_LABELS,
  splitDisplayTotal,
  type Receivable,
  type ReceivableItemKind,
} from "@/types/receivable";

const statusOptions = [
  { label: "Pendiente", value: "Pending" },
  { label: "Parcial", value: "Partial" },
  { label: "Cobrado", value: "Collected" },
];

export default function ReceivablesPage() {
  const [receivables, setReceivables] = useState<Receivable[]>([]);
  const trucks = useTrucks();
  const clients = useClients();
  const [isLoading, setIsLoading] = useState(false);
  // Al cambiar de mes ya hay cuentas en pantalla: se apagan un momento en vez de
  // desarmar la grilla entera, que es lo que se leía como parpadeo.
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingReceivable, setEditingReceivable] = useState<Receivable | null>(null);

  const [selectedTruckId, setSelectedTruckId] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const { selectedDate } = useDateFilter();
  const { displayCurrency, getDisplayValue } = useCurrency();

  const fetchReceivables = useCallback(async () => {
    setIsLoading(true);
    try {
      const query = selectedDate
        ? `?month=${selectedDate.getMonth() + 1}&year=${selectedDate.getFullYear()}`
        : "";
      const res = await fetchWithAuth(`/api/receivables${query}`, { method: "GET" });
      if (!res.ok) throw new Error();
      setReceivables(await res.json());
    } catch {
      toast.error("Error al cargar cuentas a recibir");
    } finally {
      setIsLoading(false);
      setHasLoadedOnce(true);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchReceivables();
  }, [fetchReceivables]);

  // ================= DERIVADOS =================
  const filteredReceivables = useMemo(() => {
    return receivables.filter((r) => {
      if (selectedTruckId && r.truckId !== selectedTruckId) return false;
      if (selectedClientId && r.clientId !== selectedClientId) return false;
      if (selectedStatus && r.status !== selectedStatus) return false;
      return true;
    });
  }, [receivables, selectedTruckId, selectedClientId, selectedStatus]);

  // Los montos por ítem están en la moneda del registro; el total de cada fila ya viene
  // convertido, así que lo cobrado sale de aplicarle la proporción cobrada.
  const summary = useMemo(() => {
    return filteredReceivables.reduce(
      (acc, r) => {
        const displayTotal = getDisplayValue({
          value: r.totalAmount,
          valueUSD: r.valueUSD,
          valueBRL: r.valueBRL,
          valueUYU: r.valueUYU,
        });
        const { collected, pending } = splitDisplayTotal(r, displayTotal);
        return {
          total: acc.total + displayTotal,
          collected: acc.collected + collected,
          pending: acc.pending + pending,
        };
      },
      { total: 0, collected: 0, pending: 0 },
    );
  }, [filteredReceivables, getDisplayValue]);

  // ================= CRUD =================
  const replaceReceivable = (updated: Receivable) =>
    setReceivables((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));

  const handleAdd = (created: Receivable) => {
    setReceivables((prev) => [created, ...prev]);
    setIsAddDialogOpen(false);
  };

  const handleUpdate = (updated: Receivable) => {
    replaceReceivable(updated);
    setEditingReceivable(null);
  };

  const handleDelete = useCallback(async (receivable: Receivable) => {
    try {
      const res = await fetchWithAuth(`/api/receivables/${receivable.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      const { deletedIncomes } = await res.json();
      setReceivables((prev) => prev.filter((r) => r.id !== receivable.id));
      toast.success(
        deletedIncomes > 0
          ? `Cuenta eliminada junto con ${deletedIncomes} ${
              deletedIncomes === 1 ? "ingreso" : "ingresos"
            }`
          : "Cuenta a recibir eliminada",
      );
    } catch {
      toast.error("Error al eliminar la cuenta a recibir");
    }
  }, []);

  const handleCollect = useCallback(
    async (receivable: Receivable, kind: ReceivableItemKind, dateUtc: string) => {
      setBusyId(receivable.id);
      try {
        const res = await fetchWithAuth(`/api/receivables/${receivable.id}/collect`, {
          method: "POST",
          body: JSON.stringify({ kind, dateUtc }),
        });
        if (!res.ok) {
          const e = await res.json().catch(() => ({}));
          throw new Error(e.message || e.title || "No se pudo registrar el cobro");
        }
        replaceReceivable(await res.json());
        toast.success(`${RECEIVABLE_ITEM_LABELS[kind]} cobrado`);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "No se pudo registrar el cobro");
      } finally {
        setBusyId(null);
      }
    },
    [],
  );

  const handleUndoCollect = useCallback(
    async (receivable: Receivable, kind: ReceivableItemKind) => {
      setBusyId(receivable.id);
      try {
        const res = await fetchWithAuth(`/api/receivables/${receivable.id}/collect/${kind}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          const e = await res.json().catch(() => ({}));
          throw new Error(e.message || e.title || "No se pudo deshacer el cobro");
        }
        replaceReceivable(await res.json());
        toast.success(`${RECEIVABLE_ITEM_LABELS[kind]} marcado como no cobrado`);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "No se pudo deshacer el cobro");
      } finally {
        setBusyId(null);
      }
    },
    [],
  );

  const columns = useMemo(
    () =>
      getColumns(
        (receivable) => setEditingReceivable(receivable),
        handleDelete,
        handleCollect,
        handleUndoCollect,
        displayCurrency,
      ),
    // busyId queda afuera a propósito: recrear las columnas remonta todas las celdas y se
    // pierde la animación del cobro. Viaja por CollectingReceivableContext.
    [handleDelete, handleCollect, handleUndoCollect, displayCurrency],
  );

  // ================= UI =================
  const isFirstLoad = isLoading && !hasLoadedOnce;

  return (
    <div className="p-6 flex flex-col gap-4">
      {/* FILTERS */}
      <div className="flex flex-wrap items-center gap-1">
        <FilterSelect
          label="Cliente"
          icon={Users}
          value={selectedClientId}
          onChange={setSelectedClientId}
          options={clients.map((c) => ({ label: c.name, value: c.id }))}
          allLabel="Todos"
        />
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
          options={statusOptions}
          allLabel="Todos"
        />
        <Sheet open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <SheetTrigger render={<Button className="ml-auto">Añadir cuenta</Button>} />
          <SheetContent className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Agregar cuenta a recibir</SheetTitle>
              <SheetDescription>Registrá un flete a cobrar.</SheetDescription>
            </SheetHeader>
            <div className="px-4 pb-6">
              <AddReceivableForm clients={clients} trucks={trucks} onSuccess={handleAdd} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* RESUMEN */}
      {isFirstLoad ? (
        <div className="flex flex-col gap-2.5">
          <Skeleton className="h-8 w-72" />
          <Skeleton className="h-1.5 w-full rounded-full" />
        </div>
      ) : (
        <Refreshing busy={isLoading}>
          <ReceivablesSummary
            total={summary.total}
            collected={summary.collected}
            pending={summary.pending}
            count={filteredReceivables.length}
            pendingCount={filteredReceivables.filter((r) => r.pendingAmount > 0).length}
          />
        </Refreshing>
      )}

      {/* EDIT SHEET */}
      <Sheet
        open={!!editingReceivable}
        onOpenChange={(open) => {
          if (!open) setEditingReceivable(null);
        }}
      >
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Editar cuenta a recibir</SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-6">
            {editingReceivable && (
              <EditReceivableForm
                receivable={editingReceivable}
                clients={clients}
                trucks={trucks}
                onSuccess={handleUpdate}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>

      {isFirstLoad ? (
        <DataTableSkeleton columns={8} showToolbarAction />
      ) : (
        <Refreshing busy={isLoading}>
          <CollectingReceivableContext value={busyId}>
            <DataTable
              columns={columns}
              data={filteredReceivables}
              initialSorting={[{ id: "dateUtc", desc: true }]}
              emptyMessage="No hay cuentas a recibir para el período seleccionado."
              searchPlaceholder="Buscar por cliente o camión..."
              csvFilename="cuentas-a-recibir"
              csvHeaders={[
                { key: "dateUtc", label: "Fecha" },
                { key: "truckLicensePlate", label: "Camión" },
                { key: "clientName", label: "Cliente" },
                { key: "advanceAmount", label: "Adelanto" },
                { key: "balanceAmount", label: "Saldo" },
                { key: "tollAmount", label: "Peaje" },
                { key: "totalAmount", label: "Total" },
                { key: "notes", label: "Ruta" },
                { key: "collectedAmount", label: "Cobrado" },
                { key: "pendingAmount", label: "Pendiente" },
                { key: "status", label: "Estado" },
              ]}
            />
          </CollectingReceivableContext>
        </Refreshing>
      )}
    </div>
  );
}
